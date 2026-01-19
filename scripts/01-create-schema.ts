/**
 * Database Schema Migration
 *
 * Creates all tables for the Hebrew vocabulary app:
 * - vocab_words: All vocabulary words
 * - vocab_sets: Metadata about vocab sets
 * - user_progress: SRS tracking per word
 * - user_stats: Global user statistics
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createSchema() {
  console.log('🚀 Creating database schema...\n');

  // Use non-pooling URL for migrations (DDL operations)
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ POSTGRES_URL_NON_POOLING or POSTGRES_URL not found');
    console.error('   Make sure .env.local exists with database connection string');
    process.exit(1);
  }

  console.log('✅ Database connection configured\n');

  // Create SQL client
  const sql = postgres(connectionString);

  try {
    // 1. Create vocab_sets table
    console.log('📊 Creating vocab_sets table...');
    await sql`
      CREATE TABLE IF NOT EXISTS vocab_sets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        total_words INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ vocab_sets table created\n');

    // 2. Create vocab_words table
    console.log('📝 Creating vocab_words table...');
    await sql`
      CREATE TABLE IF NOT EXISTS vocab_words (
        id TEXT PRIMARY KEY,
        hebrew TEXT NOT NULL,
        transliteration TEXT NOT NULL,
        english TEXT NOT NULL,
        type TEXT NOT NULL,
        notes TEXT,
        semantic_group TEXT,
        frequency INTEGER,
        set_id TEXT NOT NULL REFERENCES vocab_sets(id) ON DELETE CASCADE,
        group_category TEXT NOT NULL,
        group_subcategory TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_set_id ON vocab_words(set_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_type ON vocab_words(type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_semantic_group ON vocab_words(semantic_group)`;
    console.log('✅ vocab_words table created\n');

    // 3. Create user_progress table
    console.log('📈 Creating user_progress table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        word_id TEXT NOT NULL REFERENCES vocab_words(id) ON DELETE CASCADE,
        level INTEGER DEFAULT 0,
        next_review TIMESTAMP,
        last_reviewed TIMESTAMP,
        review_count INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(word_id)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_next_review ON user_progress(next_review)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_level ON user_progress(level)`;
    console.log('✅ user_progress table created\n');

    // 4. Create user_stats table (singleton)
    console.log('📊 Creating user_stats table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY DEFAULT 1,
        last_studied TIMESTAMP,
        total_reviews INTEGER DEFAULT 0,
        words_learned INTEGER DEFAULT 0,
        words_mastered INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT single_row CHECK (id = 1)
      )
    `;

    // Insert initial row
    await sql`
      INSERT INTO user_stats (id)
      VALUES (1)
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ user_stats table created\n');

    console.log('🎉 Schema creation complete!\n');
    console.log('Next steps:');
    console.log('1. Run: npx tsx scripts/02-migrate-vocab.ts');
    console.log('2. Run: npx tsx scripts/03-migrate-progress.ts');

  } catch (error) {
    console.error('❌ Error creating schema:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

createSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
