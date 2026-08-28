import 'dotenv/config';
import db from './src/db/db.js';

async function migrate() {
  try {
    // Drop the old flat messages table if it exists
    await db.query(`DROP TABLE IF EXISTS messages CASCADE;`);
    console.log('Dropped old messages table (if existed).');

    // Create conversations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_one_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_two_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT conversations_unique_pair UNIQUE (user_one_id, user_two_id),
        CONSTRAINT conversations_order_check CHECK (user_one_id < user_two_id)
      );
    `);
    console.log('Created conversations table.');

    // Create messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP WITHOUT TIME ZONE
      );
    `);
    console.log('Created messages table.');

    // Create indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_conversations_user_one ON conversations (user_one_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_user_two ON conversations (user_two_id);
    `);
    console.log('Created indexes.');

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
