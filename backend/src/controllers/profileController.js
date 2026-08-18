import db from '../db/db.js';

export const getProfile = async (req, res) => {
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
        profiles.website,

        CASE
          WHEN profiles.profile_picture IS NOT NULL
          THEN true
          ELSE false
        END AS has_profile_picture,

        profiles.created_at AS profile_created_at

      FROM users

      JOIN profiles
        ON users.id = profiles.user_id

      WHERE users.id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Profile not found.",
      });
    }

    // Get the profile from the query result
    const profile = result.rows[0];

    // Get social links
    const socialResult = await db.query(
      `
      SELECT
        id,
        platform,
        url
      FROM profile_social_links
      WHERE user_id = $1
      ORDER BY id ASC;
      `,
      [id]
    );

    profile.social_links =
      socialResult.rows;

    res.json(profile);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get profile.",
    });
  }
};

export const getProfilePicture = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id || !Number.isInteger(Number(id))) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const result = await db.query(
      `
      SELECT
        profile_picture,
        profile_picture_mime_type
      FROM profiles
      WHERE user_id = $1;
      `,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Profile not found.",
      });
    }

    const profile = result.rows[0];

    if (!profile.profile_picture) {
      return res.status(404).json({
        message: "Profile picture not found.",
      });
    }

    res.setHeader(
      "Content-Type",
      profile.profile_picture_mime_type
    );

    res.send(profile.profile_picture);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch profile picture.",
    });
  }
};

export const updateProfile = async (req, res) => {
  const client = await db.connect();

  try {
    const { id } = req.params;

    const {
      user_id,
      name,
      bio,
      phone,
      email,
      location,
      website,
    } = req.body;



    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required.",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        message: "Phone number is required.",
      });
    }

    await client.query("BEGIN");

    const profileResult = await client.query(
      `
      UPDATE profiles
      SET
        name = $1,
        bio = $2,
        phone = $3,
        email = $4,
        location = $5,
        website = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $7
      RETURNING
        user_id,
        name,
        bio,
        phone,
        email,
        location,
        website,
        created_at,
        updated_at;
      `,
      [
        name.trim(),
        bio?.trim() || null,
        phone.trim(),
        email?.trim() || null,
        location?.trim() || null,
        website?.trim() || null,
        id,
      ]
    );

    if (profileResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Profile not found.",
      });
    }

    // Replace profile picture if a new one was uploaded.
    if (req.file) {
      await client.query(
        `
        UPDATE profiles
        SET
          profile_picture = $1,
          profile_picture_mime_type = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $3;
        `,
        [
          req.file.buffer,
          req.file.mimetype,
          id,
        ]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Profile updated successfully.",
      profile: profileResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Failed to update profile.",
    });
  } finally {
    client.release();
  }
};

export const deleteProfilePicture = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      UPDATE profiles
      SET
        profile_picture = NULL,
        profile_picture_mime_type = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING user_id;
      `,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Profile not found.",
      });
    }

    res.json({
      message:
        "Profile picture deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to delete profile picture.",
    });
  }
};

export const addSocialLink = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      user_id,
      platform,
      url,
    } = req.body;

    if (
      !user_id ||
      Number(user_id) !== Number(id)
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to modify this profile.",
      });
    }

    if (!platform || !url) {
      return res.status(400).json({
        message:
          "Platform and URL are required.",
      });
    }

    const result = await db.query(
      `
      INSERT INTO profile_social_links (
        user_id,
        platform,
        url
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        platform,
        url;
      `,
      [
        id,
        platform.trim(),
        url.trim(),
      ]
    );

    res.status(201).json({
      message:
        "Social link added successfully.",
      social_link: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to add social link.",
    });
  }
};

export const deleteSocialLink = async (
  req,
  res
) => {
  try {
    const {
      id,
      socialId,
    } = req.params;

    const { user_id } = req.body;

    if (
      !user_id ||
      Number(user_id) !== Number(id)
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to modify this profile.",
      });
    }

    const result = await db.query(
      `
      DELETE FROM profile_social_links
      WHERE id = $1
        AND user_id = $2
      RETURNING id;
      `,
      [socialId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Social link not found.",
      });
    }

    res.json({
      message:
        "Social link deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to delete social link.",
    });
  }
};