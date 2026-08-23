import db from '../db/db.js';
import { sendVerificationEmail } from '../services/emailService.js';

// In-memory store for OTPs
// Structure: { [userId_type]: { code: '123456', expiresAt: 1234567890 } }
const otpStore = new Map();

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
        profiles.email_verified,
        profiles.phone_verified,

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
      name,
      bio,
      phone,
      email,
      location,
      website,
    } = req.body;

    if (Number(id) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You do not have permission to update this profile." });
    }
    
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

    // Fetch existing to check if email/phone changed
    const existingResult = await client.query('SELECT email, phone FROM profiles WHERE user_id = $1', [id]);
    const existing = existingResult.rows[0];

    // If they changed, we should reset their verification status
    const resetEmailVerified = existing && existing.email !== (email?.trim() || null);
    const resetPhoneVerified = existing && existing.phone !== phone.trim();

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
        email_verified = CASE WHEN $8::boolean THEN false ELSE email_verified END,
        phone_verified = CASE WHEN $9::boolean THEN false ELSE phone_verified END,
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
        email_verified,
        phone_verified,
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
        resetEmailVerified,
        resetPhoneVerified
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

    if (Number(id) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You do not have permission to modify this profile." });
    }

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
    const { platform, url } = req.body;

    if (Number(id) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You do not have permission to modify this profile." });
    }

    if (!platform || !url) {
      return res.status(400).json({
        message:
          "Platform and URL are required.",
      });
    }

    const trimmedPlatform = platform.trim();
    const trimmedUrl = url.trim();

    // Check if link for this platform already exists for this user
    const existing = await db.query(
      `
      SELECT id FROM profile_social_links
      WHERE user_id = $1 AND LOWER(platform) = LOWER($2)
      `,
      [Number(id), trimmedPlatform]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `
        UPDATE profile_social_links
        SET
          url = $1,
          platform = $2
        WHERE id = $3 AND user_id = $4
        RETURNING
          id,
          platform,
          url;
        `,
        [trimmedUrl, trimmedPlatform, existing.rows[0].id, Number(id)]
      );
    } else {
      result = await db.query(
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
          Number(id),
          trimmedPlatform,
          trimmedUrl,
        ]
      );
    }

    res.status(200).json({
      message:
        existing.rows.length > 0
          ? "Social link updated successfully."
          : "Social link added successfully.",
      social_link: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to save social link.",
    });
  }
};

export const deleteSocialLink = async (
  req,
  res
) => {
  try {
    const { id, socialId } = req.params;

    if (Number(id) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You do not have permission to modify this profile." });
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

// --- Verification Logic ---

export const requestVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'email'

    if (Number(id) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden." });
    }

    if (type !== 'email') {
      return res.status(400).json({ message: "Invalid verification type. Only email is supported." });
    }

    // Get user's email to send the code to
    const profileResult = await db.query('SELECT email FROM profiles WHERE user_id = $1', [id]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found." });
    }
    
    const targetEmail = profileResult.rows[0].email;
    if (!targetEmail) {
      return res.status(400).json({ message: "No email address on profile to send verification code." });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      return res.status(400).json({ message: "The email address on your profile is invalid. Please update it first." });
    }

    console.log("targetEmail is:", targetEmail, "Type:", typeof targetEmail);

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in memory
    const storeKey = `${id}_${type}`;
    otpStore.set(storeKey, { code, expiresAt });

    // Send email
    const emailSent = await sendVerificationEmail(targetEmail, code, type);
    
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send verification email." });
    }

    res.json({ message: "Verification code sent successfully." });
  } catch (error) {
    console.error("requestVerification error:", error);
    res.status(500).json({ message: "Failed to request verification." });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, code } = req.body;

    if (Number(id) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden." });
    }

    const storeKey = `${id}_${type}`;
    const storedData = otpStore.get(storeKey);

    if (!storedData) {
      return res.status(400).json({ message: "No verification request found or it has expired." });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(storeKey);
      return res.status(400).json({ message: "Verification code has expired." });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Code is valid, update the database
    const columnToUpdate = type === 'email' ? 'email_verified' : 'phone_verified';
    
    await db.query(
      `UPDATE profiles SET ${columnToUpdate} = true WHERE user_id = $1`,
      [id]
    );

    // Clear the OTP
    otpStore.delete(storeKey);

    res.json({ message: `${type} verified successfully.` });
  } catch (error) {
    console.error("verifyCode error:", error);
    res.status(500).json({ message: "Failed to verify code." });
  }
};