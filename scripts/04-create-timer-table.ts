/**
 * Database Migration: Study Sessions Table
 *
 * Creates the study_sessions table for tracking daily study time
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createTimerTable() {
  console.log('Creating study_sessions table...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('POSTGRES_URL_NON_POOLING or POSTGRES_URL not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    console.log('Creating study_sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        total_seconds INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(date)
      )
    `;
    console.log('study_sessions table created\n');

    console.log('Study sessions table migration complete!');

  } catch (error) {
    console.error('Error creating table:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

createTimerTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
