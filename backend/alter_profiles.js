import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'local_services_db',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  try {
    console.log("Adding verification columns to profiles table...");
    
    await pool.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
    `);

    console.log("Successfully added email_verified and phone_verified columns.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
