/**
 * Bible Reader Schema Migration
 *
 * Creates tables for the Hebrew Bible reader feature:
 * - bible_books: Book metadata (Genesis, Exodus, etc.)
 * - bible_verses: Verse text organized by book/chapter
 * - bible_words: Individual words with Strong's numbers and morphology
 * - strongs_hebrew: Strong's Hebrew dictionary entries
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createBibleSchema() {
  console.log('🚀 Creating Bible reader schema...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ POSTGRES_URL_NON_POOLING or POSTGRES_URL not found');
    console.error('   Make sure .env.local exists with database connection string');
    process.exit(1);
  }

  console.log('✅ Database connection configured\n');

  const sql = postgres(connectionString);

  try {
    // 1. Create bible_books table
    console.log('📖 Creating bible_books table...');
    await sql`
      CREATE TABLE IF NOT EXISTS bible_books (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        hebrew_name TEXT NOT NULL,
        abbreviation TEXT NOT NULL,
        chapter_count INTEGER NOT NULL,
        testament TEXT NOT NULL DEFAULT 'OT',
        order_index INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✅ bible_books table created\n');

    // 2. Create bible_verses table
    console.log('📜 Creating bible_verses table...');
    await sql`
      CREATE TABLE IF NOT EXISTS bible_verses (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL REFERENCES bible_books(id) ON DELETE CASCADE,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        hebrew_text TEXT NOT NULL,
        word_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(book_id, chapter, verse)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter ON bible_verses(book_id, chapter)`;
    console.log('✅ bible_verses table created\n');

    // 3. Create strongs_hebrew table
    console.log('📚 Creating strongs_hebrew table...');
    await sql`
      CREATE TABLE IF NOT EXISTS strongs_hebrew (
        number TEXT PRIMARY KEY,
        lemma TEXT,
        transliteration TEXT,
        pronunciation TEXT,
        short_def TEXT,
        strongs_def TEXT,
        kjv_def TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✅ strongs_hebrew table created\n');

    // 4. Create bible_words table
    console.log('🔤 Creating bible_words table...');
    await sql`
      CREATE TABLE IF NOT EXISTS bible_words (
        id TEXT PRIMARY KEY,
        verse_id TEXT NOT NULL REFERENCES bible_verses(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        hebrew TEXT NOT NULL,
        lemma TEXT,
        lemma_prefix TEXT,
        morph TEXT,
        is_prefix_compound BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_bible_words_verse ON bible_words(verse_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bible_words_lemma ON bible_words(lemma)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bible_words_position ON bible_words(verse_id, position)`;
    console.log('✅ bible_words table created\n');

    // 5. Seed Genesis into bible_books
    console.log('🌱 Seeding Genesis book entry...');
    await sql`
      INSERT INTO bible_books (id, name, hebrew_name, abbreviation, chapter_count, testament, order_index)
      VALUES ('genesis', 'Genesis', 'בְּרֵאשִׁית', 'Gen', 50, 'OT', 1)
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ Genesis seeded\n');

    console.log('🎉 Bible reader schema creation complete!\n');
    console.log('Next steps:');
    console.log('1. Run: npx tsx scripts/34-seed-genesis-data.ts (to import Genesis text + Strong\'s dictionary)');
    console.log('2. Visit /hebrew/bible to use the Bible reader');

  } catch (error) {
    console.error('❌ Error creating Bible schema:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

createBibleSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
