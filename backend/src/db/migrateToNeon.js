import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local from project root
const envLocalPath = path.resolve(__dirname, '../../../.env.local');
const envLocal = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};

const neonUrl = process.env.DATABASE_URL || envLocal.DATABASE_URL;

if (!neonUrl) {
  console.error("❌ No Neon DATABASE_URL found in .env.local or process.env!");
  process.exit(1);
}

console.log("Connecting to Neon at:", neonUrl.replace(/:[^:@]+@/, ':***@'));

async function migrate() {
  const neonClient = new Client({
    connectionString: neonUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await neonClient.connect();
    console.log("✅ Connected to Neon database successfully!");

    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');

    // Clean schema.sql:
    // 1. Remove \restrict and \unrestrict lines
    sql = sql.replace(/^\\.*$/gm, '');

    // 2. Remove OWNER TO postgres
    sql = sql.replace(/ALTER\s+TABLE\s+.*?\s+OWNER\s+TO\s+postgres;/gi, '');
    sql = sql.replace(/ALTER\s+SEQUENCE\s+.*?\s+OWNER\s+TO\s+postgres;/gi, '');

    const existingTables = await neonClient.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
    `);

    if (existingTables.rows.length === 0) {
      console.log("🚀 Executing base schema in Neon...");
      await neonClient.query(sql);
      console.log("✅ Base schema created successfully!");
    } else {
      console.log(`ℹ️ Base tables already present (${existingTables.rows.length} found). Skipping base schema creation.`);
    }

    // 3. Ensure search path is public and modern auth columns exist
    console.log("🔧 Verifying / adding application columns...");
    await neonClient.query(`
      SET search_path TO public;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email character varying(255) UNIQUE;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_id character varying(255) UNIQUE;
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
      ALTER TABLE public.service_images ADD COLUMN IF NOT EXISTS default_filename character varying(255);
    `);
    console.log("✅ Columns verified!");

    // 4. Seed default categories if empty
    const catCheck = await neonClient.query(`SELECT COUNT(*) FROM categories;`);
    if (parseInt(catCheck.rows[0].count) === 0) {
      console.log("📁 Inserting default categories...");
      await neonClient.query(`
        INSERT INTO categories (name, description) VALUES 
        ('Plumbing', 'Residential and commercial plumbing services'),
        ('Electrical', 'Electrical repairs, wiring, and inspections'),
        ('Cleaning', 'House, apartment, and office cleaning'),
        ('Tutoring', 'Private lessons and academic tutoring'),
        ('HVAC', 'Heating, ventilation, and air conditioning')
        ON CONFLICT (name) DO NOTHING;
      `);
      console.log("✅ Default categories inserted!");
    } else {
      console.log(`ℹ️ Categories already exist (${catCheck.rows[0].count} found).`);
    }

    // 5. Verify tables in Neon
    const tablesRes = await neonClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log("🎉 Migration complete! Current tables in Neon:");
    tablesRes.rows.forEach(r => console.log(`   - ${r.table_name}`));

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await neonClient.end();
  }
}

migrate();
