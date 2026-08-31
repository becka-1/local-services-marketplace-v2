import db from '../db/db.js';

function orderedPair(a, b) {
  const x = Number(a), y = Number(b);
  return x < y ? [x, y] : [y, x];
}

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(`
      SELECT
        c.id,
        c.user_one_id,
        c.user_two_id,
        c.created_at,
        p.name AS other_user_name,
        p.user_id AS other_user_id,
        (SELECT COUNT(*) > 0 FROM profiles WHERE user_id = other_uid.id AND profile_picture IS NOT NULL) AS other_has_picture,
        lm.content AS last_message,
        lm.created_at AS last_message_time,
        lm.sender_id AS last_message_sender_id,
        (
          SELECT COUNT(*)
          FROM messages m2
          WHERE m2.conversation_id = c.id
            AND m2.sender_id != $1
            AND m2.read_at IS NULL
        ) AS unread_count
      FROM conversations c
      CROSS JOIN LATERAL (
        SELECT CASE WHEN c.user_one_id = $1 THEN c.user_two_id ELSE c.user_one_id END AS id
      ) AS other_uid
      JOIN profiles p ON p.user_id = other_uid.id
      LEFT JOIN LATERAL (
        SELECT content, created_at, sender_id
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) lm ON TRUE
      WHERE c.user_one_id = $1 OR c.user_two_id = $1
      ORDER BY COALESCE(lm.created_at, c.created_at) DESC
    `, [userId]);

    const conversations = result.rows.map(row => ({
      id: row.id,
      otherUserId: row.other_user_id,
      otherUserName: row.other_user_name,
      otherHasPicture: row.other_has_picture,
      lastMessage: row.last_message || null,
      lastMessageTime: row.last_message_time || row.created_at,
      lastMessageSenderId: row.last_message_sender_id,
      unreadCount: parseInt(row.unread_count, 10),
    }));

    res.json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const before = req.query.before; // message ID cursor

    // Verify participation
    const convCheck = await db.query(
      `SELECT id FROM conversations WHERE id = $1 AND (user_one_id = $2 OR user_two_id = $2)`,
      [conversationId, userId]
    );
    if (convCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let query, params;
    if (before) {
      query = `
        SELECT id, conversation_id, sender_id, content, created_at, read_at
        FROM messages
        WHERE conversation_id = $1 AND id < $2
        ORDER BY created_at DESC
        LIMIT $3
      `;
      params = [conversationId, before, limit];
    } else {
      query = `
        SELECT id, conversation_id, sender_id, content, created_at, read_at
        FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;
      params = [conversationId, limit];
    }

    const result = await db.query(query, params);

    const messages = result.rows.reverse().map(row => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      content: row.content,
      createdAt: row.created_at,
      readAt: row.read_at,
    }));

    res.json({
      messages,
      hasMore: result.rows.length === limit,
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.body;

    if (!otherUserId || Number(otherUserId) === userId) {
      return res.status(400).json({ message: 'Invalid user' });
    }

    const [userOneId, userTwoId] = orderedPair(userId, otherUserId);

    const result = await db.query(
      `INSERT INTO conversations (user_one_id, user_two_id)
       VALUES ($1, $2)
       ON CONFLICT (user_one_id, user_two_id) DO NOTHING
       RETURNING id, created_at`,
      [userOneId, userTwoId]
    );

    if (result.rows.length > 0) {
      return res.status(201).json({ id: result.rows[0].id, isNew: true });
    }

    // If it already existed, fetch the ID
    const existing = await db.query(
      `SELECT id FROM conversations WHERE user_one_id = $1 AND user_two_id = $2`,
      [userOneId, userTwoId]
    );

    res.json({ id: existing.rows[0].id, isNew: false });
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendMessageRest = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content required' });
    }

    // Verify participation
    const convCheck = await db.query(
      `SELECT id, user_one_id, user_two_id FROM conversations WHERE id = $1 AND (user_one_id = $2 OR user_two_id = $2)`,
      [conversationId, userId]
    );
    if (convCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const result = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, conversation_id, sender_id, content, created_at, read_at`,
      [conversationId, userId, content.trim()]
    );

    const msg = result.rows[0];
    const payload = {
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      content: msg.content,
      createdAt: msg.created_at,
      readAt: msg.read_at,
    };

    const io = req.app.get('io');
    if (io) {
      const conv = convCheck.rows[0];
      const otherUserId = conv.user_one_id === userId ? conv.user_two_id : conv.user_one_id;
      io.to(`conv:${conversationId}`).emit('new_message', payload);
      io.to(`user:${userId}`).to(`user:${otherUserId}`).emit('conversation_updated', {
        conversationId: Number(conversationId),
        lastMessage: payload.content,
        lastMessageTime: payload.createdAt,
        lastMessageSenderId: payload.senderId,
      });
    }

    res.status(201).json(payload);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
