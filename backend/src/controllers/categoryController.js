import db from '../db/db.js';

export const getAllCategories = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        name,
        description
      FROM categories
      ORDER BY name ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};