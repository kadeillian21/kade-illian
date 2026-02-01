/**
 * Seed Interactive Week 2 Lesson
 *
 * Creates step-by-step interactive lesson for Hebrew Week 2: Vowel Points & Reading
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedWeek2Interactive() {
  console.log('🚀 Seeding Week 2 interactive lesson...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    console.log('📖 Updating Week 2 lesson metadata...');
    await sql`
      UPDATE lessons
      SET
        estimated_minutes = 18,
        difficulty_level = 2,
        scripture_passage_ids = ARRAY['genesis-1-3'],
        requires_quiz_pass = true,
        min_quiz_score = 75,
        updated_at = NOW()
      WHERE id = 'hebrew-week-2-vowels'
    `;
    console.log('✅ Week 2 metadata updated\n');

    // Step 1: Objective
    const objectiveContent = {
      title: 'Vowel Points & Reading',
      objectives: [
        'Learn the main Hebrew vowel points (nikkud)',
        'Understand how vowels attach below and above letters',
        'Practice reading words with vowel points',
        'Read your first Hebrew words with confidence'
      ],
      estimatedMinutes: 18,
      verseReference: 'Genesis 1:3'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-2-vowels', 1, 'objective', ${JSON.stringify(objectiveContent)}, 1)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;

    // Step 2: Concept
    const conceptContent = {
      conceptName: 'Hebrew Vowel Points (נִקּוּד)',
      summary: 'Hebrew consonants need vowels! Vowel points (dots and dashes) are added below and above letters to show how to pronounce them.',
      visualAid: {
        type: 'table',
        data: {
          headers: ['Symbol', 'Name', 'Sound', 'Example'],
          rows: [
            ['בָ', 'Qamets', 'ah (father)', 'דָּבָר (word)'],
            ['בַ', 'Patach', 'ah (cat)', 'מַיִם (water)'],
            ['בֶ', 'Segol', 'eh (bed)', 'אֶרֶץ (earth)'],
            ['בֵ', 'Tsere', 'ay (day)', 'בֵּן (son)'],
            ['בִ', 'Hireq', 'ee (see)', 'מִן (from)'],
            ['בֹ', 'Holem', 'oh (go)', 'טוֹב (good)'],
            ['בֻ', 'Qibbuts', 'oo (book)', 'כֻּלָּם (all)'],
            ['בוּ', 'Shureq', 'oo (food)', 'רוּחַ (spirit)']
          ]
        }
      },
      examples: [
        {
          hebrew: 'שָׁלוֹם',
          translation: 'peace',
          explanation: 'Shin (שׁ) + qamets (ָ) = sha, Lamed (ל) + holem (וֹ) = lo, Mem (ם) = m → sha-LOM'
        },
        {
          hebrew: 'טוֹב',
          translation: 'good',
          explanation: 'Tet (ט) + holem (וֹ) = to, Bet (ב) = v → TOV'
        }
      ],
      expandableTheory: {
        title: 'Deep Dive: Vowel Categories',
        content: `Hebrew vowels fall into groups by sound and length:

**Long A Sounds:**
- Qamets (בָ) - like "father" - most common
- Patach (בַ) - like "cat" - shorter

**E Sounds:**
- Tsere (בֵ) - like "day" (long)
- Segol (בֶ) - like "bed" (short)

**I/EE Sounds:**
- Hireq (בִ) - like "sit" (short)
- Hireq + Yod (בִי) - like "see" (long)

**O/U Sounds:**
- Holem (בֹ or וֹ) - like "go"
- Qibbuts (בֻ) - like "book"
- Shureq (וּ) - like "food" (long)

**Special Vowel:**
- Sheva (בְ) - quick "uh" or silent - VERY common!

**Reading Tips:**
1. Read RIGHT to LEFT
2. Consonant + vowel = syllable
3. Practice sounding out each syllable slowly
4. Most words are 2-3 syllables`
      }
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-2-vowels', 2, 'concept', ${JSON.stringify(conceptContent)}, 2)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;

    // Step 3: Scripture Reading
    const scriptureContent = {
      reference: 'Genesis 1:3',
      hebrewText: 'וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר',
      englishTranslation: 'And God said, "Let there be light," and there was light.',
      highlights: [
        {
          wordIndex: 0,
          color: 'yellow',
          concept: 'Vav consecutive (וַ) with patach'
        },
        {
          wordIndex: 4,
          color: 'blue',
          concept: 'Holem (וֹ) vowel in אוֹר (light)'
        }
      ],
      comprehensionPrompt: 'Can you identify the vowel points in אוֹר (light)? What sound does the holem (וֹ) make?'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-2-vowels', 3, 'scripture', ${JSON.stringify(scriptureContent)}, 3)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;

    // Step 4: Vocabulary
    const vocabularyContent = {
      vocabularySetId: 'genesis-1-1-5',
      wordIds: [],
      contextVerse: 'וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר',
      instructions: 'Practice reading these words from Genesis 1. Pay attention to the vowel points!'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-2-vowels', 4, 'vocabulary', ${JSON.stringify(vocabularyContent)}, 4)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;

    // Quiz Questions
    const quizQuestions = [
      {
        questionText: 'What are Hebrew vowel points called?',
        questionType: 'multiple_choice',
        correctAnswer: 'Nikkud (נִקּוּד)',
        options: ['Nikkud (נִקּוּד)', 'Dagesh', 'Maqqef', 'Sheva'],
        explanation: 'The dots and dashes that represent vowels are called nikkud (pointing).',
        orderIndex: 1
      },
      {
        questionText: 'What sound does the qamets (בָ) vowel make?',
        questionType: 'multiple_choice',
        correctAnswer: '"ah" like "father"',
        options: ['"ah" like "father"', '"eh" like "bed"', '"ee" like "see"', '"oo" like "food"'],
        explanation: 'Qamets (the T-shape) makes an "ah" sound, like in "father" or "spa".',
        orderIndex: 2
      },
      {
        questionText: 'Where do most Hebrew vowels appear relative to consonants?',
        questionType: 'multiple_choice',
        correctAnswer: 'Below the consonant',
        options: ['Above the consonant', 'Below the consonant', 'To the right', 'To the left'],
        explanation: 'Most vowels are written BELOW the consonant letter, though holem (וֹ) appears above.',
        orderIndex: 3
      },
      {
        questionText: 'In the word אוֹר (light), what vowel is used?',
        questionType: 'multiple_choice',
        correctAnswer: 'Holem (וֹ)',
        options: ['Qamets', 'Holem (וֹ)', 'Hireq', 'Tsere'],
        explanation: 'The holem (dot above vav) in אוֹר makes the "or" sound (like "more").',
        orderIndex: 4
      }
    ];

    for (const q of quizQuestions) {
      await sql`
        INSERT INTO quiz_questions (lesson_id, question_text, question_type, correct_answer, options, explanation, order_index)
        VALUES (
          'hebrew-week-2-vowels',
          ${q.questionText},
          ${q.questionType},
          ${q.correctAnswer},
          ${JSON.stringify(q.options)},
          ${q.explanation},
          ${q.orderIndex}
        )
        ON CONFLICT DO NOTHING
      `;
    }

    // Step 5: Completion
    const completionContent = {
      celebrationMessage: 'You can now read Hebrew with vowels! 📖',
      xpAwarded: 125,
      achievements: ['Week 2 Complete', 'Vowel Master'],
      nextLessonId: 'hebrew-week-3-grammar',
      reviewPrompt: 'Practice reading Genesis 1:3 slowly, sounding out each vowel',
      referenceLinks: [
        {
          title: 'Complete Vowel Chart',
          url: '/hebrew/reference/vowels'
        }
      ]
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-2-vowels', 6, 'completion', ${JSON.stringify(completionContent)}, 6)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;

    console.log('🎉 Week 2 interactive lesson seeded successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding Week 2:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seedWeek2Interactive()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
