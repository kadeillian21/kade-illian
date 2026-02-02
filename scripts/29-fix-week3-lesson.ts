/**
 * Fix Week 3 Lesson Links
 *
 * Updates Week 3 to link to its grammar practice sets:
 * 1. definite-article-practice (grammar)
 * 2. preposition-forms-practice (grammar)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixWeek3Lesson() {
  console.log('🔧 Fixing Week 3 lesson vocab links...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Check current state
    console.log('📖 Current Week 3 lesson state:');
    const before = await sql`
      SELECT id, title, vocabulary_set_ids
      FROM lessons
      WHERE id = 'hebrew-week-3-grammar'
    `;
    console.log(`  Vocab Sets: ${before[0]?.vocabulary_set_ids?.join(', ') || '(none)'}\n`);

    // Update Week 3 to include grammar practice sets
    console.log('🔄 Updating Week 3 with grammar practice sets...');

    await sql`
      UPDATE lessons
      SET vocabulary_set_ids = ARRAY[
        'definite-article-practice',
        'preposition-forms-practice'
      ],
      updated_at = NOW()
      WHERE id = 'hebrew-week-3-grammar'
    `;

    // Verify the update
    console.log('✅ Update complete!\n');
    console.log('📖 New Week 3 lesson state:');
    const after = await sql`
      SELECT id, title, vocabulary_set_ids
      FROM lessons
      WHERE id = 'hebrew-week-3-grammar'
    `;
    console.log(`  Vocab Sets: ${after[0]?.vocabulary_set_ids?.join(', ')}\n`);

    console.log('🎉 Week 3 is now properly configured!');
    console.log('\n📚 Week 3 now includes:');
    console.log('  1. definite-article-practice - הַ the definite article');
    console.log('  2. preposition-forms-practice - בְּ לְ כְ prepositions');

  } catch (error) {
    console.error('❌ Error fixing Week 3 lesson:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

fixWeek3Lesson()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
