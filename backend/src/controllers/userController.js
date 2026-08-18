import db from '../db/db.js';

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
        users.id AS user_id,
        users.role,

        profiles.name,
        profiles.email,
        profiles.phone,
        profiles.bio,
        profiles.location,

        profiles.profile_picture IS NOT NULL
          AS has_profile_picture,

        profiles.created_at AS profile_created_at

      FROM users

      JOIN profiles
        ON profiles.user_id = users.id

      WHERE users.id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User profile not found",
      });
    }

    const socialResult = await db.query(
      `
      SELECT
        platform,
        url

      FROM profile_social_links

      WHERE user_id = $1

      ORDER BY platform ASC;
      `,
      [id]
    );

    const user = result.rows[0];

    res.json({
      ...user,
      social_links: socialResult.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch user profile",
    });
  }
};

export const getUserServices = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
        services.id,
        services.user_id AS user_id,
        services.category_id,

        services.title,
        services.description,
        services.price,
        services.location,
        services.created_at,
        services.updated_at,

        profiles.name AS provider_name,

        CASE
          WHEN profiles.profile_picture IS NOT NULL
          THEN true
          ELSE false
        END AS provider_has_profile_picture,

        categories.name AS category_name

      FROM services

      JOIN profiles
        ON services.user_id = profiles.user_id

      JOIN categories
        ON services.category_id = categories.id

      WHERE services.user_id = $1

      ORDER BY services.created_at DESC;
      `,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch user's services",
    });
  }
};