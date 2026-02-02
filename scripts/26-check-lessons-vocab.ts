/**
 * Check current state of lessons and vocab sets
 * Shows what vocab sets each lesson is linked to
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkLessonsVocab() {
  console.log('🔍 Checking lessons and vocab sets...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Get all vocab sets
    console.log('📚 VOCAB SETS:');
    console.log('─'.repeat(60));
    const vocabSets = await sql`
      SELECT id, title, total_words, set_type
      FROM vocab_sets
      ORDER BY created_at
    `;

    for (const set of vocabSets) {
      console.log(`  ${set.id}`);
      console.log(`    Title: ${set.title}`);
      console.log(`    Words: ${set.total_words}`);
      console.log(`    Type: ${set.set_type || 'vocabulary'}`);
      console.log();
    }

    // Get all lessons with their vocab links
    console.log('\n📖 LESSONS & THEIR VOCAB SETS:');
    console.log('─'.repeat(60));
    const lessons = await sql`
      SELECT id, week_number, title, vocabulary_set_ids
      FROM lessons
      WHERE language_id = 'hebrew'
      ORDER BY order_index
    `;

    for (const lesson of lessons) {
      console.log(`  Week ${lesson.week_number}: ${lesson.title}`);
      console.log(`    ID: ${lesson.id}`);
      if (lesson.vocabulary_set_ids && lesson.vocabulary_set_ids.length > 0) {
        console.log(`    Vocab Sets: ${lesson.vocabulary_set_ids.join(', ')}`);
      } else {
        console.log(`    Vocab Sets: (none)`);
      }
      console.log();
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

checkLessonsVocab()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
