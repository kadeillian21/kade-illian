/**
 * Database Migration: Add card_type and extra_data columns
 *
 * Extends vocab_words and vocab_sets tables to support different card types
 * (vocabulary, alphabet, syllables, grammar)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function addCardTypes() {
  console.log('Adding card type columns...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('POSTGRES_URL_NON_POOLING or POSTGRES_URL not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Add card_type column to vocab_words
    console.log('Adding card_type column to vocab_words...');
    await sql`
      ALTER TABLE vocab_words
      ADD COLUMN IF NOT EXISTS card_type TEXT DEFAULT 'vocabulary'
    `;
    console.log('card_type column added\n');

    // Add extra_data column to vocab_words
    console.log('Adding extra_data column to vocab_words...');
    await sql`
      ALTER TABLE vocab_words
      ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb
    `;
    console.log('extra_data column added\n');

    // Add set_type column to vocab_sets
    console.log('Adding set_type column to vocab_sets...');
    await sql`
      ALTER TABLE vocab_sets
      ADD COLUMN IF NOT EXISTS set_type TEXT DEFAULT 'vocabulary'
    `;
    console.log('set_type column added\n');

    // Create index for card_type
    console.log('Creating index for card_type...');
    await sql`CREATE INDEX IF NOT EXISTS idx_card_type ON vocab_words(card_type)`;
    console.log('Index created\n');

    console.log('Card type migration complete!');

  } catch (error) {
    console.error('Error adding card type columns:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

addCardTypes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
