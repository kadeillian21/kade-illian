/**
 * Fix Week 6 Lesson Links
 *
 * Updates the Week 6 lesson to link to all 4 vocab sets:
 * 1. week-6-adjectives (30 cards)
 * 2. week-6-demonstratives (7 cards)
 * 3. week-6-numbers (20 cards)
 * 4. adjective-agreement-practice (grammar practice - keep existing)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixWeek6Lesson() {
  console.log('🔧 Fixing Week 6 lesson vocab links...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Check current state
    console.log('📖 Current Week 6 lesson state:');
    const before = await sql`
      SELECT id, title, vocabulary_set_ids
      FROM lessons
      WHERE id = 'hebrew-week-6-adjectives'
    `;
    console.log(`  Vocab Sets: ${before[0]?.vocabulary_set_ids?.join(', ') || '(none)'}\n`);

    // Update Week 6 to include all 4 vocab sets
    console.log('🔄 Updating Week 6 with all vocab sets...');

    await sql`
      UPDATE lessons
      SET vocabulary_set_ids = ARRAY[
        'week-6-adjectives',
        'week-6-demonstratives',
        'week-6-numbers',
        'adjective-agreement-practice'
      ],
      updated_at = NOW()
      WHERE id = 'hebrew-week-6-adjectives'
    `;

    // Verify the update
    console.log('✅ Update complete!\n');
    console.log('📖 New Week 6 lesson state:');
    const after = await sql`
      SELECT id, title, vocabulary_set_ids
      FROM lessons
      WHERE id = 'hebrew-week-6-adjectives'
    `;
    console.log(`  Vocab Sets: ${after[0]?.vocabulary_set_ids?.join(', ')}\n`);

    console.log('🎉 Week 6 is now properly configured!');
    console.log('\n📚 Week 6 now includes:');
    console.log('  1. week-6-adjectives (30 cards) - Main vocabulary');
    console.log('  2. week-6-demonstratives (7 cards) - Main vocabulary');
    console.log('  3. week-6-numbers (20 cards) - Main vocabulary');
    console.log('  4. adjective-agreement-practice - Grammar drills');
    console.log('\nTotal: 57 vocabulary cards + grammar practice');

  } catch (error) {
    console.error('❌ Error fixing Week 6 lesson:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

fixWeek6Lesson()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
