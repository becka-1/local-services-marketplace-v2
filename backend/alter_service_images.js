import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

pool.query('ALTER TABLE service_images ADD COLUMN default_filename VARCHAR(255);', (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Column added successfully');
  }
  pool.end();
});
