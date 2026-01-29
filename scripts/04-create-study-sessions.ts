/**
 * Create study_sessions table for tracking study time
 */

import { config } from 'dotenv';
import postgres from 'postgres';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function createStudySessionsTable() {
  const sql = postgres(process.env.POSTGRES_URL!, {
    max: 1,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Creating study_sessions table...');

    await sql`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id SERIAL PRIMARY KEY,
        set_id TEXT,
        mode TEXT DEFAULT 'study',
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        last_activity TIMESTAMP NOT NULL,
        duration_seconds INTEGER DEFAULT 0,
        cards_studied INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('✅ study_sessions table created!');

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time
      ON study_sessions(start_time)
    `;

    console.log('✅ Index created!');

    console.log('\n🎉 All done! Study session tracking is ready.');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

createStudySessionsTable();
