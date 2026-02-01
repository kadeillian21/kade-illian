/**
 * Add Vocabulary Practice Steps to Lessons
 *
 * Updates Week 3, 4, and 6 lessons to include VocabularyStep practice
 * with their corresponding grammar flashcard sets.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function addVocabSteps() {
  console.log('🚀 Adding vocabulary practice steps to lessons...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // ===== WEEK 3: DEFINITE ARTICLE =====
    console.log('📖 Adding vocab step to Week 3 (Definite Article)...');

    // Check if Week 3 lesson exists
    const week3Check = await sql`SELECT id FROM lessons WHERE id = 'hebrew-week-3-article' LIMIT 1`;

    if (week3Check.length > 0) {
      // Find the highest step number for this lesson
      const maxStep = await sql`
        SELECT COALESCE(MAX(step_number), 0) as max_step
        FROM lesson_steps
        WHERE lesson_id = 'hebrew-week-3-article'
      `;
      const nextStepNumber = maxStep[0].max_step + 1;

      const vocabContent = {
        vocabularySetId: 'definite-article-practice',
        wordIds: [],
        contextVerse: 'הַשָּׁמַיִם (the heavens) - notice the dagesh in שׁ',
        instructions: 'Practice identifying how הַ changes with different consonants. Pay attention to the vowel changes before gutturals!'
      };

      await sql`
        INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
        VALUES (
          'hebrew-week-3-article',
          ${nextStepNumber},
          'vocabulary',
          ${JSON.stringify(vocabContent)},
          ${nextStepNumber}
        )
        ON CONFLICT (lesson_id, step_number) DO UPDATE
        SET content = EXCLUDED.content, updated_at = NOW()
      `;
      console.log(`  ✅ Added vocab step (step ${nextStepNumber}) to Week 3\n`);
    } else {
      console.log('  ⚠️  Week 3 lesson not found, skipping\n');
    }

    // ===== WEEK 4: PREPOSITIONS =====
    console.log('📖 Adding vocab step to Week 4 (Prepositions)...');

    const week4Check = await sql`SELECT id FROM lessons WHERE id = 'hebrew-week-4-prepositions' LIMIT 1`;

    if (week4Check.length > 0) {
      const maxStep = await sql`
        SELECT COALESCE(MAX(step_number), 0) as max_step
        FROM lesson_steps
        WHERE lesson_id = 'hebrew-week-4-prepositions'
      `;
      const nextStepNumber = maxStep[0].max_step + 1;

      const vocabContent = {
        vocabularySetId: 'preposition-forms-practice',
        wordIds: [],
        contextVerse: 'בְּרֵאשִׁית (in beginning) - preposition בְּ attached to noun',
        instructions: 'Practice how prepositions attach to words and combine with the definite article. Watch how the vowels change!'
      };

      await sql`
        INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
        VALUES (
          'hebrew-week-4-prepositions',
          ${nextStepNumber},
          'vocabulary',
          ${JSON.stringify(vocabContent)},
          ${nextStepNumber}
        )
        ON CONFLICT (lesson_id, step_number) DO UPDATE
        SET content = EXCLUDED.content, updated_at = NOW()
      `;
      console.log(`  ✅ Added vocab step (step ${nextStepNumber}) to Week 4\n`);
    } else {
      console.log('  ⚠️  Week 4 lesson not found, skipping\n');
    }

    // ===== WEEK 6: ADJECTIVES =====
    console.log('📖 Adding vocab step to Week 6 (Adjectives)...');

    const week6Check = await sql`SELECT id FROM lessons WHERE id = 'hebrew-week-6-adjectives' LIMIT 1`;

    if (week6Check.length > 0) {
      const maxStep = await sql`
        SELECT COALESCE(MAX(step_number), 0) as max_step
        FROM lesson_steps
        WHERE lesson_id = 'hebrew-week-6-adjectives'
      `;
      const nextStepNumber = maxStep[0].max_step + 1;

      const vocabContent = {
        vocabularySetId: 'adjective-agreement-practice',
        wordIds: [],
        contextVerse: 'טוֹב (masc.) → טוֹבָה (fem.) → טוֹבִים (masc. pl.) → טוֹבוֹת (fem. pl.)',
        instructions: 'Practice how adjectives change to match their nouns in gender and number. Notice the pattern matching noun endings!'
      };

      await sql`
        INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
        VALUES (
          'hebrew-week-6-adjectives',
          ${nextStepNumber},
          'vocabulary',
          ${JSON.stringify(vocabContent)},
          ${nextStepNumber}
        )
        ON CONFLICT (lesson_id, step_number) DO UPDATE
        SET content = EXCLUDED.content, updated_at = NOW()
      `;
      console.log(`  ✅ Added vocab step (step ${nextStepNumber}) to Week 6\n`);
    } else {
      console.log('  ⚠️  Week 6 lesson not found, skipping\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Vocabulary practice steps added successfully!\n');
    console.log('These lessons now include focused flashcard practice:');
    console.log('  • Week 3: Definite Article forms (4 cards)');
    console.log('  • Week 4: Preposition forms (6 cards)');
    console.log('  • Week 5: Gender & Number (8 cards) - already added');
    console.log('  • Week 6: Adjective Agreement (5 cards)\n');

  } catch (error) {
    console.error('❌ Error adding vocab steps:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

addVocabSteps()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
