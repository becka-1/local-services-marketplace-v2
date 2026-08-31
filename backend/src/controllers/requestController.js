import db from "../db/db.js";

export const createRequest = async (req, res) => {
  try {
    const { service_id, message } = req.body;
    const requester_id = req.user.id;

    if (!service_id || !message) {
      return res.status(400).json({
        message: "Service ID and message are required.",
      });
    }

    const result = await db.query(
      `
      INSERT INTO service_requests (service_id, requester_id, message)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [service_id, requester_id, message]
    );

    res.status(201).json({
      message: "Request created successfully.",
      request: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create request.",
    });
  }
};

export const getRequestsByRequester = async (req, res) => {
  try {
    const { userId } = req.params;

    if (Number(userId) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You can only view your own requests." });
    }

    const result = await db.query(
      `
      SELECT
        sr.id,
        sr.service_id,
        sr.requester_id,
        sr.message,
        sr.status,
        sr.created_at,
        sr.updated_at,
        s.title AS service_title,
        p.name AS provider_name,
        p.user_id AS provider_id
      FROM service_requests sr
      JOIN services s ON sr.service_id = s.id
      JOIN profiles p ON s.user_id = p.user_id
      WHERE sr.requester_id = $1
      ORDER BY sr.created_at DESC;
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch user requests.",
    });
  }
};

export const getRequestsByProvider = async (req, res) => {
  try {
    const { userId } = req.params;

    if (Number(userId) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You can only view your own requests." });
    }

    const result = await db.query(
      `
      SELECT
        sr.id,
        sr.service_id,
        sr.requester_id,
        sr.message,
        sr.status,
        sr.created_at,
        sr.updated_at,
        s.title AS service_title,
        p.name AS requester_name,
        p.phone AS requester_phone,
        p.email AS requester_email
      FROM service_requests sr
      JOIN services s ON sr.service_id = s.id
      JOIN profiles p ON sr.requester_id = p.user_id
      WHERE s.user_id = $1
      ORDER BY sr.created_at DESC;
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch provider requests.",
    });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
        sr.id,
        sr.service_id,
        sr.requester_id,
        sr.message,
        sr.status,
        sr.created_at,
        sr.updated_at,
        s.title AS service_title,
        s.user_id AS provider_id,
        prov.name AS provider_name,
        prov.phone AS provider_phone,
        prov.email AS provider_email,
        req.name AS requester_name,
        req.phone AS requester_phone,
        req.email AS requester_email
      FROM service_requests sr
      JOIN services s ON sr.service_id = s.id
      JOIN profiles prov ON s.user_id = prov.user_id
      JOIN profiles req ON sr.requester_id = req.user_id
      WHERE sr.id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Request not found." });
    }

    const requestData = result.rows[0];

    if (
      requestData.requester_id !== req.user.id &&
      requestData.provider_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: "Forbidden. You cannot view this request." });
    }

    res.json(requestData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch request.",
    });
  }
};

export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;

    const requestResult = await db.query(
      `SELECT sr.id, sr.requester_id, s.user_id AS provider_id 
       FROM service_requests sr
       JOIN services s ON sr.service_id = s.id
       WHERE sr.id = $1`,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: "Request not found." });
    }

    const existingReq = requestResult.rows[0];
    const isRequester = existingReq.requester_id === req.user.id;
    const isProvider = existingReq.provider_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    let query = `UPDATE service_requests SET updated_at = CURRENT_TIMESTAMP`;
    const values = [];
    let idx = 1;

    if (message !== undefined) {
      if (!isRequester && !isAdmin) {
        return res.status(403).json({ message: "Forbidden. Only the requester can update the message." });
      }
      query += `, message = $${idx}`;
      values.push(message);
      idx++;
    }

    if (status !== undefined) {
      if (!isProvider && !isAdmin) {
        return res.status(403).json({ message: "Forbidden. Only the provider can update the status." });
      }
      query += `, status = $${idx}`;
      values.push(status);
      idx++;
    }

    query += ` WHERE id = $${idx} RETURNING *;`;
    values.push(id);

    const result = await db.query(query, values);

    res.json({
      message: "Request updated successfully.",
      request: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update request.",
    });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const requestResult = await db.query(
      `SELECT id, requester_id FROM service_requests WHERE id = $1`,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (requestResult.rows[0].requester_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You can only delete your own requests." });
    }

    await db.query(`DELETE FROM service_requests WHERE id = $1`, [id]);

    res.json({ message: "Request deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete request.",
    });
  }
};
