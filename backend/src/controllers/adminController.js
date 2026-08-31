import db from '../db/db.js';

export const getAdminStats = async (req, res) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const servicesCount = await db.query('SELECT COUNT(*) FROM services');
    const requestsCount = await db.query('SELECT COUNT(*) FROM service_requests');
    const pendingReqCount = await db.query("SELECT COUNT(*) FROM service_requests WHERE status = 'pending'");
    const completedReqCount = await db.query("SELECT COUNT(*) FROM service_requests WHERE status = 'completed'");

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count, 10),
      totalServices: parseInt(servicesCount.rows[0].count, 10),
      totalRequests: parseInt(requestsCount.rows[0].count, 10),
      pendingRequests: parseInt(pendingReqCount.rows[0].count, 10),
      completedRequests: parseInt(completedReqCount.rows[0].count, 10)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};

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

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userRes = await db.query(`SELECT id, email, role, created_at FROM users WHERE id = $1`, [id]);
    if (userRes.rowCount === 0) return res.status(404).json({ message: "User not found" });

    const profileRes = await db.query(`SELECT * FROM profiles WHERE user_id = $1`, [id]);
    const servicesRes = await db.query(`SELECT id, title, price, status, created_at FROM services WHERE user_id = $1`, [id]);
    res.json({
      user: userRes.rows[0],
      profile: profileRes.rows[0] || null,
      services: servicesRes.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user details." });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    const result = await db.query(`UPDATE users SET role = $1 WHERE id = $2 RETURNING *`, [role, id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update role." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM users WHERE id = $1`, [id]);
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user." });
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

export const getAllRequestsAdmin = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        sr.id, sr.service_id, sr.requester_id, sr.status, sr.created_at,
        s.title AS service_title, s.user_id AS provider_id,
        req_p.name AS requester_name,
        prov_p.name AS provider_name
       FROM service_requests sr
       JOIN services s ON sr.service_id = s.id
       LEFT JOIN profiles req_p ON sr.requester_id = req_p.user_id
       LEFT JOIN profiles prov_p ON s.user_id = prov_p.user_id
       ORDER BY sr.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch requests." });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await db.query(
      `INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *`,
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create category." });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [name, description, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update category." });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM categories WHERE id = $1`, [id]);
    res.json({ message: "Category deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete category (it may be in use)." });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, p.name as reporter_name 
       FROM reports r
       LEFT JOIN profiles p ON r.reporter_id = p.user_id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch reports." });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await db.query(
      `UPDATE reports SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update report status." });
  }
};
