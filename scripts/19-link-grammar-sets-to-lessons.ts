/**
 * Link Grammar Practice Sets to Lessons
 *
 * Updates lessons to include grammar practice vocab sets in their vocabulary_set_ids
 * so they show up in the lesson cards and detail pages.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function linkGrammarSets() {
  console.log('🚀 Linking grammar practice sets to lessons...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Week 3: Link definite article practice
    console.log('📖 Linking grammar sets to lessons...');

    const updates = [
      {
        lessonId: 'hebrew-week-3-article',
        setIds: ['definite-article-practice'],
        description: 'Definite Article Practice'
      },
      {
        lessonId: 'hebrew-week-4-prepositions',
        setIds: ['preposition-forms-practice'],
        description: 'Preposition Forms Practice'
      },
      {
        lessonId: 'hebrew-week-5-nouns',
        setIds: ['gender-number-practice'],
        description: 'Gender & Number Practice'
      },
      {
        lessonId: 'hebrew-week-6-adjectives',
        setIds: ['adjective-agreement-practice'],
        description: 'Adjective Agreement Practice'
      }
    ];

    for (const update of updates) {
      // Check if lesson exists
      const lessonCheck = await sql`
        SELECT id, vocabulary_set_ids FROM lessons WHERE id = ${update.lessonId} LIMIT 1
      `;

      if (lessonCheck.length > 0) {
        const currentSetIds = lessonCheck[0].vocabulary_set_ids || [];
        const newSetIds = [...new Set([...currentSetIds, ...update.setIds])]; // Merge and deduplicate

        await sql`
          UPDATE lessons
          SET vocabulary_set_ids = ${newSetIds}
          WHERE id = ${update.lessonId}
        `;

        console.log(`  ✅ ${update.lessonId}: Added ${update.description}`);
      } else {
        console.log(`  ⚠️  ${update.lessonId}: Not found, skipping`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Grammar practice sets linked successfully!\n');
    console.log('These sets will now appear in:');
    console.log('  • Lesson cards in the library');
    console.log('  • Lesson detail pages');
    console.log('  • Interactive lesson steps (via VocabularyStep)\n');

  } catch (error) {
    console.error('❌ Error linking grammar sets:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

linkGrammarSets()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
