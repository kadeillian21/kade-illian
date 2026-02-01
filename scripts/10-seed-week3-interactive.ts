/**
 * Seed Interactive Week 3 Lesson
 *
 * Creates step-by-step interactive lesson for Hebrew Week 3: The Article & Prepositions
 * Includes: Objective, Concept, Scripture, Vocabulary, Quiz, and Completion steps
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedWeek3Interactive() {
  console.log('🚀 Seeding Week 3 interactive lesson...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Update lesson metadata for Week 3
    console.log('📖 Updating Week 3 lesson metadata...');
    await sql`
      UPDATE lessons
      SET
        estimated_minutes = 14,
        difficulty_level = 2,
        scripture_passage_ids = ARRAY['genesis-1-1', 'genesis-1-3'],
        requires_quiz_pass = true,
        min_quiz_score = 80,
        updated_at = NOW()
      WHERE id = 'hebrew-week-3-grammar'
    `;
    console.log('✅ Week 3 metadata updated\n');

    // Step 1: Objective
    console.log('📝 Creating Step 1: Objective...');
    const objectiveContent = {
      title: 'The Article & Prepositions',
      objectives: [
        'Recognize the definite article הַ (ha-) in Hebrew text',
        'Understand how prepositions attach to words',
        'Read Genesis 1:1-3 identifying articles and prepositions',
        'Practice 8 new vocabulary words from Genesis'
      ],
      estimatedMinutes: 14,
      verseReference: 'Genesis 1:1-3'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-3-grammar', 1, 'objective', ${JSON.stringify(objectiveContent)}, 1)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 1 created\n');

    // Step 2: Concept - The Definite Article
    console.log('📝 Creating Step 2: Concept (Article)...');
    const conceptContent = {
      conceptName: 'The Definite Article הַ',
      summary: 'Hebrew has no word for "a/an", but uses הַ (ha-) as "the". It attaches directly to the beginning of words.',
      visualAid: {
        type: 'table',
        data: {
          headers: ['Without Article', 'With Article', 'Meaning'],
          rows: [
            ['שָׁמַיִם', 'הַשָּׁמַיִם', 'the heavens'],
            ['אֶרֶץ', 'הָאָרֶץ', 'the earth'],
            ['אוֹר', 'הָאוֹר', 'the light']
          ]
        }
      },
      examples: [
        {
          hebrew: 'הָאָרֶץ',
          translation: 'the earth',
          highlight: 'הָ',
          explanation: 'הָ is the definite article "the" attached to אֶרֶץ (earth)'
        },
        {
          hebrew: 'הַשָּׁמַיִם',
          translation: 'the heavens',
          highlight: 'הַ',
          explanation: 'הַ with dagesh in the ש makes "ha-sha-MA-yim"'
        }
      ],
      expandableTheory: {
        title: 'Deep Dive: Article Vowel Changes',
        content: `The article הַ changes its vowel based on the first letter of the word:

**Standard Form: הַ (patach)**
- Used with most letters: הַבַּיִת (the house)

**With gutturals (א ה ח ע): הָ or הֶ**
- הָאָרֶץ (the earth) - qamatz before א
- הֶהָרִים (the mountains) - seghol before ה with qamatz

**Doubles the next letter (dagesh forte)**
- הַשָּׁמַיִם (the heavens) - dagesh in ש

This is a phonetic rule to make pronunciation smoother. You'll recognize patterns naturally through practice!`
      }
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-3-grammar', 2, 'concept', ${JSON.stringify(conceptContent)}, 2)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 2 created\n');

    // Step 3: Scripture Reading - Genesis 1:1
    console.log('📝 Creating Step 3: Scripture Reading...');
    const scriptureContent = {
      reference: 'Genesis 1:1',
      hebrewText: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ',
      englishTranslation: 'In the beginning, God created the heavens and the earth.',
      highlights: [
        {
          wordIndex: 4,
          color: 'yellow',
          concept: 'Definite article הַ attached to שָׁמַיִם (heavens)'
        },
        {
          wordIndex: 6,
          color: 'yellow',
          concept: 'Definite article הָ attached to אָרֶץ (earth)'
        },
        {
          wordIndex: 0,
          color: 'blue',
          concept: 'Preposition בְּ (in) attached to רֵאשִׁית (beginning)'
        }
      ],
      comprehensionPrompt: 'Can you spot the two definite articles in this verse? What words do they attach to?'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-3-grammar', 3, 'scripture', ${JSON.stringify(scriptureContent)}, 3)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 3 created\n');

    // Step 4: Vocabulary Practice
    console.log('📝 Creating Step 4: Vocabulary Practice...');
    const vocabularyContent = {
      vocabularySetId: 'genesis-1-1-5',
      wordIds: [], // Will be populated from vocab set
      contextVerse: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ',
      instructions: 'Practice these words from Genesis 1:1-5. Focus on recognizing them with and without the article.'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-3-grammar', 4, 'vocabulary', ${JSON.stringify(vocabularyContent)}, 4)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 4 created\n');

    // Step 5: Quiz Questions
    console.log('❓ Creating quiz questions...');

    const quizQuestions = [
      {
        questionText: 'What does the Hebrew definite article הַ mean in English?',
        questionType: 'multiple_choice',
        correctAnswer: 'the',
        options: ['the', 'a', 'an', 'this'],
        explanation: 'הַ is the definite article meaning "the". Hebrew has no indefinite article (a/an).',
        orderIndex: 1
      },
      {
        questionText: 'In the word הָאָרֶץ (the earth), what is הָ?',
        questionType: 'multiple_choice',
        correctAnswer: 'The definite article "the"',
        options: [
          'The definite article "the"',
          'A separate word meaning "the"',
          'Part of the word for earth',
          'A preposition meaning "in"'
        ],
        explanation: 'הָ is the definite article attached to אָרֶץ (earth). It always attaches to the beginning of words.',
        orderIndex: 2
      },
      {
        questionText: 'How does Hebrew say "a house" versus "the house"?',
        questionType: 'multiple_choice',
        correctAnswer: 'בַּיִת vs הַבַּיִת',
        options: [
          'בַּיִת vs הַבַּיִת',
          'אַבַּיִת vs הַבַּיִת',
          'בַּיִת vs בַּיִת הַ',
          'בַּיִת (same for both)'
        ],
        explanation: 'Hebrew has no indefinite article, so בַּיִת alone means "a house". Adding הַ makes it definite: הַבַּיִת (the house).',
        orderIndex: 3
      },
      {
        questionText: 'In בְּרֵאשִׁית, the בְּ at the beginning is:',
        questionType: 'multiple_choice',
        correctAnswer: 'A preposition meaning "in"',
        options: [
          'A preposition meaning "in"',
          'The definite article',
          'Part of the root word',
          'A conjunction meaning "and"'
        ],
        explanation: 'בְּ is a preposition meaning "in" attached to רֵאשִׁית (beginning). Together: "in the beginning".',
        orderIndex: 4
      }
    ];

    for (const q of quizQuestions) {
      await sql`
        INSERT INTO quiz_questions (lesson_id, question_text, question_type, correct_answer, options, explanation, order_index)
        VALUES (
          'hebrew-week-3-grammar',
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

    // Step 6: Completion
    console.log('📝 Creating Step 6: Completion...');
    const completionContent = {
      celebrationMessage: 'You can now recognize the article הַ in Scripture!',
      xpAwarded: 100,
      achievements: ['Week 3 Complete', 'Article Master'],
      nextLessonId: 'hebrew-week-4',
      reviewPrompt: 'Review today\'s vocabulary to strengthen your memory',
      referenceLinks: [
        {
          title: 'Complete Guide to the Hebrew Article',
          url: '/hebrew/reference/definite-article'
        },
        {
          title: 'Prepositions Deep Dive',
          url: '/hebrew/reference/prepositions'
        }
      ]
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-3-grammar', 6, 'completion', ${JSON.stringify(completionContent)}, 6)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 6 created\n');

    console.log('🎉 Week 3 interactive lesson seeded successfully!\n');
    console.log('Lesson structure:');
    console.log('  1. Objective: Learning goals and time estimate');
    console.log('  2. Concept: The definite article הַ with examples');
    console.log('  3. Scripture: Genesis 1:1 with highlighted articles');
    console.log('  4. Vocabulary: Practice words from Genesis 1:1-5');
    console.log('  5. Quiz: 4 questions testing article understanding');
    console.log('  6. Completion: Celebration and next steps');
    console.log('\nNext: Create API endpoints and build the lesson page UI');

  } catch (error) {
    console.error('❌ Error seeding Week 3 interactive lesson:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

seedWeek3Interactive()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
