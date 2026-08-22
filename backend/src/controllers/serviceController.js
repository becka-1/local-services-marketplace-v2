import db from "../db/db.js";
import fs from "fs";
import path from "path";

export const getAllServices = async (req, res) => {
  try {
    const { search, category, location } = req.query;

    const conditions = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          services.title ILIKE $${values.length}
          OR services.description ILIKE $${values.length}
          OR services.location ILIKE $${values.length}
        )
      `);
    }

    if (category) {
      values.push(category);

      conditions.push(`
        services.category_id = $${values.length}
      `);
    }

    if (location) {
      values.push(`%${location}%`);

      conditions.push(`
        services.location ILIKE $${values.length}
      `);
    }

    let query = `
      SELECT
        services.id,
        services.title,
        services.description,
        services.price,
        services.location,
        services.created_at,
        services.updated_at,

        profiles.user_id AS user_id,
        profiles.name AS provider_name,

        CASE
          WHEN profiles.profile_picture IS NOT NULL
          THEN true
          ELSE false
        END AS provider_has_profile_picture,

        categories.id AS category_id,
        categories.name AS category_name

      FROM services

      JOIN profiles
        ON services.user_id = profiles.user_id

      JOIN categories
        ON services.category_id = categories.id
    `;

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY services.created_at DESC;`;

    const result = await db.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch services",
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
        services.id,
        services.title,
        services.description,
        services.price,
        services.location,
        services.created_at,
        services.updated_at,

        profiles.user_id AS provider_id,
        profiles.name AS provider_name,
        profiles.bio AS provider_bio,
        profiles.phone AS provider_phone,
        profiles.email AS provider_email,
        profiles.location AS provider_location,

        categories.id AS category_id,
        categories.name AS category_name

      FROM services

      JOIN profiles
        ON services.user_id = profiles.user_id

      JOIN categories
        ON services.category_id = categories.id

      WHERE services.id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch service",
    });
  }
};

export const createService = async (req, res) => {
  const client = await db.connect();

  try {
    const {
      category_id,
      title,
      description,
      price,
      location,
      defaultImages,
    } = req.body;

    const user_id = req.user.id;

    // Basic validation
    if (!category_id || !title || !description) {
      return res.status(400).json({
        message:
          "Category, title, and description are required.",
      });
    }

    await client.query("BEGIN");

    const serviceResult = await client.query(
      `
      INSERT INTO services (
        user_id,
        category_id,
        title,
        description,
        price,
        location
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        user_id,
        category_id,
        title,
        description,
        price,
        location,
        created_at;
      `,
      [
        user_id,
        category_id,
        title,
        description,
        price || null,
        location || null,
      ]
    );

    const service = serviceResult.rows[0];

    // Save uploaded images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await client.query(
          `
          INSERT INTO service_images (
            service_id,
            image_data,
            mime_type
          )
          VALUES ($1, $2, $3);
          `,
          [
            service.id,
            file.buffer,
            file.mimetype,
          ]
        );
      }
    }

    // Save default images
    if (defaultImages) {
      const defaultImagesArray = Array.isArray(defaultImages) ? defaultImages : [defaultImages];
      for (const filename of defaultImagesArray) {
        try {
          // Construct path to the frontend public folder
          const imagePath = path.join(process.cwd(), '../frontend/public/default-service-images', filename);
          const buffer = fs.readFileSync(imagePath);
          const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          
          await client.query(
            `
            INSERT INTO service_images (
              service_id,
              image_data,
              mime_type
            )
            VALUES ($1, $2, $3);
            `,
            [
              service.id,
              buffer,
              mimeType,
            ]
          );
        } catch (err) {
          console.error("Failed to save default image:", filename, err);
          // We continue so the service is still created even if one image fails
        }
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Service created successfully.",
      service,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Failed to create service.",
    });
  } finally {
    client.release();
  }
};

export const getServiceImages = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
        id,
        mime_type,
        created_at
      FROM service_images
      WHERE service_id = $1
      ORDER BY created_at ASC;
      `,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch service images.",
    });
  }
};

export const getServiceImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const result = await db.query(
      `
      SELECT
        image_data,
        mime_type
      FROM service_images
      WHERE id = $1
        AND service_id = $2;
      `,
      [imageId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Image not found.",
      });
    }

    const image = result.rows[0];

    res.setHeader(
      "Content-Type",
      image.mime_type
    );

    res.send(image.image_data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch image.",
    });
  }
};

export const updateService = async (req, res) => {
  const client = await db.connect();

  try {
    const { id } = req.params;

    const {
      category_id,
      title,
      description,
      price,
      location,
      defaultImages,
    } = req.body;

    if (!category_id || !title || !description) {
      return res.status(400).json({
        message:
          "Category, title, and description are required.",
      });
    }

    await client.query("BEGIN");

    // Check that the service exists
    const serviceResult = await client.query(
      `
      SELECT id, user_id
      FROM services
      WHERE id = $1;
      `,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Service not found.",
      });
    }

    const service = serviceResult.rows[0];

    if (service.user_id !== req.user.id && req.user.role !== 'admin') {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "Forbidden. You do not have permission to update this service.",
      });
    }
    const updatedResult = await client.query(
      `
      UPDATE services
      SET
        category_id = $1,
        title = $2,
        description = $3,
        price = $4,
        location = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING
        id,
        user_id,
        category_id,
        title,
        description,
        price,
        location,
        created_at,
        updated_at;
      `,
      [
        category_id,
        title,
        description,
        price || null,
        location || null,
        id,
      ]
    );

    // Add newly uploaded images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await client.query(
          `
          INSERT INTO service_images (
            service_id,
            image_data,
            mime_type
          )
          VALUES ($1, $2, $3);
          `,
          [
            id,
            file.buffer,
            file.mimetype,
          ]
        );
      }
    }

    // Add newly selected default images
    if (defaultImages) {
      const defaultImagesArray = Array.isArray(defaultImages) ? defaultImages : [defaultImages];
      for (const filename of defaultImagesArray) {
        try {
          const imagePath = path.join(process.cwd(), '../frontend/public/default-service-images', filename);
          const buffer = fs.readFileSync(imagePath);
          const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          
          await client.query(
            `
            INSERT INTO service_images (
              service_id,
              image_data,
              mime_type
            )
            VALUES ($1, $2, $3);
            `,
            [
              id,
              buffer,
              mimeType,
            ]
          );
        } catch (err) {
          console.error("Failed to save default image:", filename, err);
        }
      }
    }

    await client.query("COMMIT");

    res.json({
      message: "Service updated successfully.",
      service: updatedResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Failed to update service.",
    });
  } finally {
    client.release();
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const serviceResult = await db.query(
      `
      SELECT id, user_id
      FROM services
      WHERE id = $1;
      `,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({
        message: "Service not found.",
      });
    }

    const service = serviceResult.rows[0];

    if (service.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: "Forbidden. You do not have permission to delete this service.",
      });
    }
    await db.query(
      `
      DELETE FROM services
      WHERE id = $1;
      `,
      [id]
    );

    res.json({
      message: "Service deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete service.",
    });
  }
};

export const deleteServiceImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const serviceResult = await db.query(
      `
      SELECT user_id
      FROM services
      WHERE id = $1;
      `,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({
        message: "Service not found.",
      });
    }

    const service = serviceResult.rows[0];

    if (service.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: "Forbidden. You do not have permission to delete this image.",
      });
    }
    const imageResult = await db.query(
      `
      DELETE FROM service_images
      WHERE id = $1
        AND service_id = $2
      RETURNING id;
      `,
      [imageId, id]
    );

    if (imageResult.rows.length === 0) {
      return res.status(404).json({
        message: "Image not found.",
      });
    }

    res.json({
      message: "Image deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete image.",
    });
  }
};

export const getFeaturedServices = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        services.id,
        services.title,
        services.description,
        services.price,
        services.location,
        services.created_at,
        profiles.user_id AS user_id,
        profiles.name AS provider_name,
        categories.name AS category_name,
        (SELECT id FROM service_images WHERE service_id = services.id ORDER BY created_at ASC LIMIT 1) as first_image_id
      FROM services
      JOIN profiles ON services.user_id = profiles.user_id
      JOIN categories ON services.category_id = categories.id
      ORDER BY RANDOM()
      LIMIT 3;
    `);
    
    const formattedRows = result.rows.map(row => {
      const { first_image_id, ...rest } = row;
      return {
        ...rest,
        image_url: first_image_id ? `/api/services/${row.id}/images/${first_image_id}` : null
      };
    });
    
    res.json(formattedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch featured services." });
  }
};