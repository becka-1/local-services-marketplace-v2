import db from './src/db/db.js';

const createReportsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reported_item_type VARCHAR(50) NOT NULL, -- e.g., 'user', 'service', 'request'
        reported_item_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Reports table created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating reports table:", error);
    process.exit(1);
  }
};

createReportsTable();
