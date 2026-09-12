import jwt from 'jsonwebtoken';
import db from '../db/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_dev';

function parseCookies(cookieHeader = '') {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(c => {
    let [name, ...rest] = c.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });
  return list;
}

export function initializeSocket(io) {
  // Authenticate socket connections via cookie
  io.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie || '');
      const token = cookies.token || socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded; // { id, role, iat, exp }
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;

    // Join the user's personal room for cross-conversation notifications
    socket.join(`user:${userId}`);

    // Join a specific conversation room
    socket.on('join_conversation', async (conversationId) => {
      try {
        // Verify user is a participant
        const result = await db.query(
          `SELECT id FROM conversations WHERE id = $1 AND (user_one_id = $2 OR user_two_id = $2)`,
          [conversationId, userId]
        );
        if (result.rows.length === 0) {
          socket.emit('error', { message: 'Not authorized for this conversation' });
          return;
        }
        socket.join(`conv:${conversationId}`);
      } catch (err) {
        console.error('Error joining conversation:', err);
      }
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Send a message via socket
    socket.on('send_message', async ({ conversationId, content, clientMsgId }, callback) => {
      try {
        if (!content || !content.trim()) return;

        // Verify membership
        const convResult = await db.query(
          `SELECT id, user_one_id, user_two_id FROM conversations WHERE id = $1 AND (user_one_id = $2 OR user_two_id = $2)`,
          [conversationId, userId]
        );
        if (convResult.rows.length === 0) {
          if (callback) callback({ error: 'Not authorized' });
          return;
        }

        const conv = convResult.rows[0];
        const otherUserId = conv.user_one_id === userId ? conv.user_two_id : conv.user_one_id;

        // Insert message
        const msgResult = await db.query(
          `INSERT INTO messages (conversation_id, sender_id, content)
           VALUES ($1, $2, $3)
           RETURNING id, conversation_id, sender_id, content, created_at, read_at`,
          [conversationId, userId, content.trim()]
        );

        const message = msgResult.rows[0];
        const payload = {
          id: message.id,
          conversationId: message.conversation_id,
          senderId: message.sender_id,
          content: message.content,
          createdAt: message.created_at,
          readAt: message.read_at,
          clientMsgId: clientMsgId || null,
        };

        // Broadcast to everyone in the conversation room
        io.to(`conv:${conversationId}`).emit('new_message', payload);

        // Notify both users' personal rooms (for sidebar updates)
        io.to(`user:${userId}`).to(`user:${otherUserId}`).emit('conversation_updated', {
          conversationId,
          lastMessage: payload.content,
          lastMessageTime: payload.createdAt,
          lastMessageSenderId: payload.senderId,
        });

        // Acknowledge to the sender with the persisted message
        if (callback) callback({ success: true, message: payload });
      } catch (err) {
        console.error('Error sending message via socket:', err);
        if (callback) callback({ error: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        await db.query(
          `UPDATE messages SET read_at = NOW()
           WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL`,
          [conversationId, userId]
        );
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });

    socket.on('disconnect', () => {
      // Cleanup handled automatically by socket.io
    });
  });
}
