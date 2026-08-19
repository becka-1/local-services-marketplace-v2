import db from '../db/db.js';

export const getAllUsersAdmin = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.role, u.created_at, p.name, p.phone
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

export const getAllServicesAdmin = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.id, s.title, s.price, s.created_at, p.name AS provider_name
       FROM services s
       LEFT JOIN profiles p ON s.user_id = p.user_id
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch services." });
  }
};
