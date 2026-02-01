/**
 * Lesson Plans Schema Migration
 *
 * Creates tables for structured lesson plans (Biblical Hebrew & Koine Greek):
 * - languages: Language metadata (Hebrew, Greek, etc.)
 * - lessons: Structured curriculum with weekly lessons
 * - user_lesson_progress: Tracks user completion of lessons
 * - Adds language_id to existing vocab_sets table
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createLessonsSchema() {
  console.log('🚀 Creating lesson plans schema...\n');

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
    // 1. Create languages table
    console.log('🌍 Creating languages table...');
    await sql`
      CREATE TABLE IF NOT EXISTS languages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        direction TEXT DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
        font_family TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Insert default languages
    await sql`
      INSERT INTO languages (id, name, direction, font_family)
      VALUES
        ('hebrew', 'Biblical Hebrew', 'rtl', 'Frank Ruhl Libre'),
        ('greek', 'Koine Greek', 'ltr', 'GFS Didot')
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ languages table created\n');

    // 2. Add language_id to vocab_sets (if not exists)
    console.log('📚 Adding language_id to vocab_sets...');
    try {
      await sql`
        ALTER TABLE vocab_sets
        ADD COLUMN IF NOT EXISTS language_id TEXT
        REFERENCES languages(id)
        DEFAULT 'hebrew'
      `;
      console.log('✅ language_id column added to vocab_sets\n');
    } catch (error) {
      // Column might already exist
      console.log('⚠️  language_id column may already exist (skipping)\n');
    }

    // 3. Create lessons table
    console.log('📖 Creating lessons table...');
    await sql`
      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        language_id TEXT NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
        week_number INTEGER NOT NULL,
        month_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        lesson_content TEXT,
        topics TEXT[] DEFAULT '{}',
        vocabulary_set_ids TEXT[] DEFAULT '{}',
        order_index INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(language_id, week_number)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_lessons_language ON lessons(language_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lessons_week ON lessons(week_number)`;
    console.log('✅ lessons table created\n');

    // 4. Create user_lesson_progress table
    console.log('📈 Creating user_lesson_progress table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, lesson_id)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_status ON user_lesson_progress(status)`;
    console.log('✅ user_lesson_progress table created\n');

    console.log('🎉 Lesson plans schema creation complete!\n');
    console.log('Next steps:');
    console.log('1. Run: npx tsx scripts/08-seed-hebrew-lessons.ts (to add initial lessons)');
    console.log('2. Visit /hebrew/lessons to see the lesson library');

  } catch (error) {
    console.error('❌ Error creating lessons schema:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

createLessonsSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
