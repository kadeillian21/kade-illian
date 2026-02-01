/**
 * Verify Lessons System
 *
 * Checks that all lesson tables and data are correctly set up
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyLessons() {
  console.log('🔍 Verifying lesson system...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // 1. Check languages table
    console.log('🌍 Checking languages table...');
    const languages = await sql`SELECT * FROM languages ORDER BY id`;
    console.log(`   Found ${languages.length} languages:`);
    languages.forEach(lang => {
      console.log(`   - ${lang.name} (${lang.id}) - ${lang.direction} - ${lang.font_family}`);
    });
    console.log();

    // 2. Check lessons table
    console.log('📖 Checking lessons table...');
    const lessons = await sql`
      SELECT id, week_number, month_number, title, language_id
      FROM lessons
      ORDER BY order_index
    `;
    console.log(`   Found ${lessons.length} lessons:`);
    lessons.forEach(lesson => {
      console.log(`   - Week ${lesson.week_number} (${lesson.language_id}): ${lesson.title}`);
    });
    console.log();

    // 3. Check lesson with vocab sets
    console.log('📚 Checking lessons with vocabulary sets...');
    const lessonsWithVocab = await sql`
      SELECT id, title, vocabulary_set_ids
      FROM lessons
      WHERE array_length(vocabulary_set_ids, 1) > 0
    `;
    console.log(`   Found ${lessonsWithVocab.length} lessons with linked vocab sets:`);
    lessonsWithVocab.forEach(lesson => {
      console.log(`   - ${lesson.title}: ${lesson.vocabulary_set_ids.join(', ')}`);
    });
    console.log();

    // 4. Check user lesson progress
    console.log('📈 Checking user lesson progress...');
    const progress = await sql`SELECT COUNT(*) as count FROM user_lesson_progress`;
    console.log(`   Found ${progress[0].count} progress entries`);
    console.log();

    // 5. Check vocab_sets language column
    console.log('🔗 Checking vocab_sets language column...');
    const vocabSets = await sql`
      SELECT id, title, language_id
      FROM vocab_sets
      LIMIT 5
    `;
    console.log(`   Sample vocab sets:`);
    vocabSets.forEach(set => {
      console.log(`   - ${set.title} (${set.id}) - ${set.language_id || 'no language set'}`);
    });
    console.log();

    // 6. Summary
    console.log('✅ Verification Complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Languages: ${languages.length}`);
    console.log(`   - Lessons: ${lessons.length}`);
    console.log(`   - Lessons with vocab: ${lessonsWithVocab.length}`);
    console.log(`   - User progress entries: ${progress[0].count}`);
    console.log();
    console.log('🎉 Lesson system is ready!');
    console.log('   Visit http://localhost:3000/hebrew/lessons to get started');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

verifyLessons()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
