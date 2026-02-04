/**
 * Seed Interactive Week 1 Lesson
 *
 * Creates step-by-step interactive lesson for Hebrew Week 1: The Hebrew Alphabet
 * Includes: Objective, Concept, Practice, Quiz, and Completion steps
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedWeek1Interactive() {
  console.log('🚀 Seeding Week 1 interactive lesson...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Update lesson metadata for Week 1
    console.log('📖 Updating Week 1 lesson metadata...');
    await sql`
      UPDATE lessons
      SET
        estimated_minutes = 15,
        difficulty_level = 1,
        scripture_passage_ids = ARRAY[]::TEXT[],
        requires_quiz_pass = true,
        min_quiz_score = 75,
        updated_at = NOW()
      WHERE id = 'hebrew-week-1-alphabet'
    `;
    console.log('✅ Week 1 metadata updated\n');

    // Step 1: Objective
    console.log('📝 Creating Step 1: Objective...');
    const objectiveContent = {
      title: 'The Hebrew Alphabet',
      objectives: [
        'Learn all 22 Hebrew consonant letters',
        'Recognize the 5 final forms (ךםןףץ)',
        'Understand basic letter shapes and names',
        'Practice writing and identifying letters'
      ],
      estimatedMinutes: 15
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-1-alphabet', 1, 'objective', ${JSON.stringify(objectiveContent)}, 1)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 1 created\n');

    // Step 2: Concept - Alphabet Overview
    console.log('📝 Creating Step 2: Concept (Alphabet)...');
    const conceptContent = {
      conceptName: 'The Hebrew Alphabet (אָלֶף־בֵּית)',
      summary: 'Hebrew has 22 consonant letters, written right to left. 5 letters have special final forms used at the end of words.',
      visualAid: {
        type: 'table',
        data: {
          headers: ['Letter', 'Name', 'Sound', 'Notes'],
          rows: [
            ['א', 'Aleph', '(silent)', 'Looks like X'],
            ['ב', 'Bet', 'b / v', 'Backwards C with floor'],
            ['ג', 'Gimel', 'g', 'Always hard g'],
            ['ד', 'Dalet', 'd', 'Has corner (vs ר)'],
            ['ה', 'He', 'h', 'Gap at top left'],
            ['ו', 'Vav', 'v / o / u', 'Straight line'],
            ['ז', 'Zayin', 'z', 'Like a sword'],
            ['ח', 'Chet', 'ch', 'Throaty (like "Bach")']
          ]
        }
      },
      examples: [
        {
          hebrew: 'אָב',
          translation: 'father',
          explanation: 'Aleph (א) + Bet (ב) = av (father)'
        },
        {
          hebrew: 'בֵּן',
          translation: 'son',
          explanation: 'Bet (ב) + Nun (ן) = ben (son) - note final nun'
        }
      ],
      expandableTheory: {
        title: 'Deep Dive: Letter Families and History',
        content: `The Hebrew alphabet evolved from ancient Phoenician script around 1000 BCE. Letters can be grouped by visual similarity:

**Similar Shapes:**
- ב (Bet), כ (Kaph), פ (Pe) - all have similar rounded forms
- ד (Dalet), ר (Resh) - easily confused, look at the corner!
- ה (He), ח (Chet), ת (Tav) - all have horizontal tops
- ו (Vav), ן (Final Nun), ץ (Final Tsade) - vertical strokes

**Final Forms (סופיות):**
Five letters have special forms when they appear at the END of a word:
- כ → ך (Kaph)
- מ → ם (Mem)
- נ → ן (Nun)
- פ → ף (Pe)
- צ → ץ (Tsade)

Mnemonic: **K-M-N-P-Ts** (like "come in pets")

**Reading Direction:**
Hebrew is read RIGHT to LEFT. Always start from the right side of the page!`
      }
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-1-alphabet', 2, 'concept', ${JSON.stringify(conceptContent)}, 2)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 2 created\n');

    // Step 3: Vocabulary Practice (Alphabet flashcards)
    console.log('📝 Creating Step 3: Alphabet Practice...');
    const vocabularyContent = {
      vocabularySetId: 'alphabet',
      wordIds: [],
      instructions: 'Practice recognizing each Hebrew letter. Click the card to see the letter name, pronunciation, and notes.'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-1-alphabet', 3, 'vocabulary', ${JSON.stringify(vocabularyContent)}, 3)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 3 created\n');

    // Step 4: Quiz Questions
    console.log('❓ Creating quiz questions...');

    const quizQuestions = [
      {
        questionText: 'Which letter is the first letter of the Hebrew alphabet?',
        questionType: 'multiple_choice',
        correctAnswer: 'א (Aleph)',
        options: ['א (Aleph)', 'ב (Bet)', 'א (Ayin)', 'ע (Aleph)'],
        explanation: 'א (Aleph) is the first letter, like "A" in English. It is usually silent.',
        orderIndex: 1
      },
      {
        questionText: 'How many consonant letters does the Hebrew alphabet have?',
        questionType: 'multiple_choice',
        correctAnswer: '22',
        options: ['22', '24', '26', '28'],
        explanation: 'Hebrew has 22 consonant letters, plus 5 additional final forms.',
        orderIndex: 2
      },
      {
        questionText: 'Which direction is Hebrew read?',
        questionType: 'multiple_choice',
        correctAnswer: 'Right to left',
        options: ['Left to right', 'Right to left', 'Top to bottom', 'Bottom to top'],
        explanation: 'Hebrew is read from RIGHT to LEFT, opposite of English.',
        orderIndex: 3
      },
      {
        questionText: 'Which letters have special final forms used at the end of words?',
        questionType: 'multiple_choice',
        correctAnswer: 'כ מ נ פ צ',
        options: ['א ב ג ד ה', 'כ מ נ פ צ', 'ו ז ח ט י', 'ל מ נ ס ע'],
        explanation: 'Five letters (Kaph, Mem, Nun, Pe, Tsade) have special final forms: ךםןףץ',
        orderIndex: 4
      }
    ];

    for (const q of quizQuestions) {
      await sql`
        INSERT INTO quiz_questions (lesson_id, question_text, question_type, correct_answer, options, explanation, order_index)
        VALUES (
          'hebrew-week-1-alphabet',
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
    console.log(`✅ ${quizQuestions.length} quiz questions created\n`);

    // Step 5: Completion
    console.log('📝 Creating Step 5: Completion...');
    const completionContent = {
      celebrationMessage: 'You\'ve learned the Hebrew alphabet! 🎉',
      xpAwarded: 100,
      achievements: ['Week 1 Complete', 'Alphabet Master'],
      nextLessonId: 'hebrew-week-2-vowels',
      reviewPrompt: 'Practice the alphabet flashcards regularly to build recognition',
      referenceLinks: [
        {
          title: 'Complete Alphabet Reference',
          url: '/hebrew/reference/alphabet'
        },
        {
          title: 'Alphabet Flashcards',
          url: '/hebrew/vocabulary?set=hebrew-alphabet'
        }
      ]
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-1-alphabet', 5, 'completion', ${JSON.stringify(completionContent)}, 5)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 5 created\n');

    console.log('🎉 Week 1 interactive lesson seeded successfully!\n');
    console.log('Lesson structure:');
    console.log('  1. Objective: Learning goals');
    console.log('  2. Concept: Alphabet overview with table');
    console.log('  3. Vocabulary: Alphabet flashcard practice');
    console.log('  4. Quiz: 4 questions testing alphabet knowledge');
    console.log('  5. Completion: Celebration and next steps');

  } catch (error) {
    console.error('❌ Error seeding Week 1 interactive lesson:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

seedWeek1Interactive()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
