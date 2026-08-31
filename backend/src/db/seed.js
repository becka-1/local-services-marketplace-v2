import 'dotenv/config';
import db from './db.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log("🌱 Starting database seeding...");
  
  try {
    // 0. Ensure schema is updated for default_filename (in case it wasn't added yet)
    await db.query(`ALTER TABLE service_images ADD COLUMN IF NOT EXISTS default_filename character varying(255);`);
    console.log("✅ Schema verified");

    // 1. Clean existing test data (except admin users)
    console.log("🧹 Cleaning old test data...");
    await db.query("DELETE FROM service_requests");
    await db.query("DELETE FROM service_images");
    await db.query("DELETE FROM services");
    await db.query("DELETE FROM categories");
    // Only delete seed dummy users (we'll identify them by email)
    await db.query("DELETE FROM users WHERE email LIKE '%@demo.com'");

    // 2. Insert Categories
    console.log("📁 Inserting categories...");
    const catRes = await db.query(`
      INSERT INTO categories (name, description) VALUES 
      ('Plumbing', 'Residential and commercial plumbing services'),
      ('Electrical', 'Electrical repairs, wiring, and inspections'),
      ('Cleaning', 'House, apartment, and office cleaning'),
      ('Tutoring', 'Private lessons and academic tutoring'),
      ('HVAC', 'Heating, ventilation, and air conditioning')
      RETURNING id, name;
    `);
    const categories = catRes.rows.reduce((acc, row) => ({ ...acc, [row.name]: row.id }), {});

    // 3. Create Demo Providers
    console.log("👤 Creating demo providers...");
    const hash = await bcrypt.hash("demo123", 10);
    const usersRes = await db.query(`
      INSERT INTO users (email, password_hash, role) VALUES 
      ('provider1@demo.com', $1, 'user'),
      ('provider2@demo.com', $1, 'user')
      RETURNING id, email;
    `, [hash]);
    
    const p1 = usersRes.rows[0].id;
    const p2 = usersRes.rows[1].id;

    await db.query(`
      INSERT INTO profiles (user_id, name, bio, phone, email, email_verified, location) VALUES 
      ($1, 'Alex Handy', 'Professional handyman with 10 years experience.', '555-0101', 'provider1@demo.com', true, 'Downtown'),
      ($2, 'Sarah Clean', 'Detailed and reliable house cleaner.', '555-0202', 'provider2@demo.com', true, 'Uptown');
    `, [p1, p2]);

    // 4. Insert Services
    console.log("🛠️ Inserting realistic services...");
    const servicesRes = await db.query(`
      INSERT INTO services (user_id, category_id, title, description, price, location) VALUES 
      ($1, $2, 'Emergency Plumbing & Drain Cleaning', 'Fast and reliable 24/7 plumbing services. I can fix leaks, unclog drains, and repair water heaters.', 75.00, 'City-wide'),
      ($1, $3, 'Home Electrical Safety Inspection & Wiring', 'Certified electrician offering full home safety inspections, outlet installation, and rewiring.', 90.00, 'Metro Area'),
      ($2, $4, 'Deep House & Move-Out Cleaning', 'Top-to-bottom cleaning service perfect for move-ins or move-outs. Includes appliances and windows.', 120.00, 'Uptown & Suburbs'),
      ($2, $5, 'High School Math & Physics Tutoring', 'Experienced tutor offering 1-on-1 sessions for algebra, calculus, and physics. Online or in-person.', 40.00, 'University District')
      RETURNING id, title;
    `, [p1, categories['Plumbing'], categories['Electrical'], categories['Cleaning'], categories['Tutoring']]);

    // 5. Attach Default Images
    console.log("🖼️ Attaching default images...");
    const images = ['1292797.jpg', '679478.jpg', '712437.jpg'];
    for (let i = 0; i < servicesRes.rows.length; i++) {
      const serviceId = servicesRes.rows[i].id;
      // Cycle through available images
      const imageName = images[i % images.length];
      const imagePath = path.join(process.cwd(), '../frontend/public/default-service-images', imageName);
      
      try {
        const buffer = fs.readFileSync(imagePath);
        await db.query(`
          INSERT INTO service_images (service_id, image_data, mime_type, default_filename)
          VALUES ($1, $2, $3, $4)
        `, [serviceId, buffer, 'image/jpeg', imageName]);
      } catch (err) {
        console.error(`Failed to read image ${imageName}:`, err.message);
      }
    }

    console.log("✨ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
