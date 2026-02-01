/**
 * Seed Interactive Week 4 Lesson
 *
 * Creates step-by-step interactive lesson for Hebrew Week 4: First Vocabulary Set
 * Includes: Objective, Concept, Scripture, Vocabulary, Quiz, and Completion steps
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedWeek4Interactive() {
  console.log('🚀 Seeding Week 4 interactive lesson...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Update lesson metadata for Week 4
    console.log('📖 Updating Week 4 lesson metadata...');
    await sql`
      UPDATE lessons
      SET
        estimated_minutes = 18,
        difficulty_level = 3,
        scripture_passage_ids = ARRAY['genesis-1-1', 'genesis-1-2', 'genesis-1-3', 'genesis-1-4', 'genesis-1-5'],
        requires_quiz_pass = true,
        min_quiz_score = 80,
        updated_at = NOW()
      WHERE id = 'hebrew-week-4-vocabulary'
    `;
    console.log('✅ Week 4 metadata updated\n');

    // Step 1: Objective
    console.log('📝 Creating Step 1: Objective...');
    const objectiveContent = {
      title: 'First Vocabulary Set',
      objectives: [
        'Master 30 core Hebrew words from Genesis 1:1-5',
        'Learn vocabulary study strategies for retention',
        'Practice reading Scripture with known vocabulary',
        'Build confidence recognizing words in context'
      ],
      estimatedMinutes: 18,
      verseReference: 'Genesis 1:1-5'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-4-vocabulary', 1, 'objective', ${JSON.stringify(objectiveContent)}, 1)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 1 created\n');

    // Step 2: Concept - Vocabulary Learning Strategy
    console.log('📝 Creating Step 2: Concept (Vocabulary Strategy)...');
    const conceptContent = {
      conceptName: 'Effective Vocabulary Learning',
      summary: 'Master Hebrew vocabulary through semantic grouping, frequency focus, and spaced repetition. Your brain learns better with organized chunks than random word lists.',
      visualAid: {
        type: 'table',
        data: {
          headers: ['Strategy', 'Why It Works', 'Example'],
          rows: [
            ['Semantic Grouping', 'Related words stick together', 'Learn all Nature words together: שָׁמַיִם, אֶרֶץ, יוֹם, לַיְלָה'],
            ['Frequency First', 'Common words give you more mileage', 'Learn אֱלֹהִים (God) before rare words'],
            ['Contextual Study', 'Words in Scripture = deeper memory', 'See בָּרָא in Genesis 1:1, not isolation'],
            ['Spaced Repetition', 'Review at optimal intervals', 'Review after 1 day, 3 days, 7 days, etc.']
          ]
        }
      },
      examples: [
        {
          hebrew: 'בְּרֵאשִׁית',
          translation: 'in the beginning',
          highlight: 'רֵאשִׁית',
          explanation: 'Learn the root רֵאשִׁית (beginning) + preposition בְּ (in) = powerful compound word'
        },
        {
          hebrew: 'הַשָּׁמַיִם וְהָאָרֶץ',
          translation: 'the heavens and the earth',
          highlight: 'וְ',
          explanation: 'Pair opposites: heaven/earth, light/darkness, day/night - they appear together in Scripture'
        }
      ],
      expandableTheory: {
        title: 'Deep Dive: The Science of Vocabulary Retention',
        content: `Modern cognitive science shows that effective language learning follows these principles:

**1. Chunking (3-7 items per group)**
Your working memory can hold 3-7 items at once. Grouping vocabulary by theme (Nature, Time, Actions) creates manageable chunks that stick better than random lists.

**2. Semantic Networks**
Hebrew words exist in networks of meaning. When you learn בָּרָא (create), also learn related concepts like עָשָׂה (make), יָצַר (form). Your brain builds connections between related words.

**3. Contextual Learning**
Words learned in Scripture passages have:
- **Emotional context** (creation story = awe)
- **Visual imagery** (light piercing darkness)
- **Narrative flow** (sequence of creation)

This creates multiple "hooks" for memory retrieval.

**4. Spaced Repetition System (SRS)**
Your brain needs to retrieve information at increasing intervals:
- Day 1: Learn the word
- Day 2: First review (strengthens memory)
- Day 4: Second review (consolidates)
- Day 8, 15, 30: Long-term retention

**5. Active Recall**
Testing yourself (flashcards) is MORE effective than passive review (reading lists). Each successful retrieval strengthens the neural pathway.

**Your Vocabulary Journey:**
This week's 30 words are organized into logical groups. Study one group per day, review previous groups, and let the SRS system surface words when they need reinforcement. Trust the process!`
      }
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-4-vocabulary', 2, 'concept', ${JSON.stringify(conceptContent)}, 2)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 2 created\n');

    // Step 3: Scripture Reading - Genesis 1:1-5
    console.log('📝 Creating Step 3: Scripture Reading...');
    const scriptureContent = {
      reference: 'Genesis 1:1-5',
      hebrewText: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר וַיַּרְא אֱלֹהִים אֶת־הָאוֹר כִּי־טוֹב וַיַּבְדֵּל אֱלֹהִים בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹם וְלַחֹשֶׁךְ קָרָא לָיְלָה וַיְהִי־עֶרֶב וַיְהִי־בֹקֶר יוֹם אֶחָד',
      englishTranslation: 'In the beginning God created the heavens and the earth. The earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters. And God said, "Let there be light," and there was light. God saw that the light was good, and he separated the light from the darkness. God called the light "day," and the darkness he called "night." And there was evening, and there was morning—the first day.',
      highlights: [
        {
          wordIndex: 2,
          color: 'yellow',
          concept: 'אֱלֹהִים (Elohim) - God, appears 5 times in these verses'
        },
        {
          wordIndex: 4,
          color: 'blue',
          concept: 'הַשָּׁמַיִם (ha-shamayim) - the heavens, with definite article'
        },
        {
          wordIndex: 6,
          color: 'blue',
          concept: 'הָאָרֶץ (ha-aretz) - the earth, paired with heavens'
        },
        {
          wordIndex: 18,
          color: 'green',
          concept: 'אוֹר (or) - light, central theme of day one'
        }
      ],
      comprehensionPrompt: 'Count how many times you see אֱלֹהִים (God) in these verses. Notice the pattern: God speaks, God sees, God names.'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-4-vocabulary', 3, 'scripture', ${JSON.stringify(scriptureContent)}, 3)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 3 created\n');

    // Step 4: Vocabulary Practice
    console.log('📝 Creating Step 4: Vocabulary Practice...');
    const vocabularyContent = {
      vocabularySetId: 'genesis-1-1-5',
      wordIds: [],
      contextVerse: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ',
      instructions: 'Study these 30 words organized by semantic groups. Focus on one group per day. The flashcards will help you build recognition through active recall.'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-4-vocabulary', 4, 'vocabulary', ${JSON.stringify(vocabularyContent)}, 4)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 4 created\n');

    // Step 5: Quiz Questions
    console.log('❓ Creating quiz questions...');

    const quizQuestions = [
      {
        questionText: 'Which vocabulary learning strategy involves studying related words together (like all Nature words)?',
        questionType: 'multiple_choice',
        correctAnswer: 'Semantic Grouping',
        options: ['Semantic Grouping', 'Random Memorization', 'Alphabetical Order', 'Frequency Sorting'],
        explanation: 'Semantic grouping clusters related words by meaning (Nature, Time, Actions). Your brain builds stronger connections when words share context.',
        orderIndex: 1
      },
      {
        questionText: 'What is the Hebrew word for "God" that appears in Genesis 1:1?',
        questionType: 'multiple_choice',
        correctAnswer: 'אֱלֹהִים',
        options: ['אֱלֹהִים', 'יְהוָה', 'אָדוֹן', 'שַׁדַּי'],
        explanation: 'אֱלֹהִים (Elohim) is the word for God used in Genesis 1. It\'s technically plural but takes singular verbs when referring to the one true God.',
        orderIndex: 2
      },
      {
        questionText: 'In Genesis 1:1, what two major things did God create?',
        questionType: 'multiple_choice',
        correctAnswer: 'הַשָּׁמַיִם וְהָאָרֶץ (heavens and earth)',
        options: [
          'הַשָּׁמַיִם וְהָאָרֶץ (heavens and earth)',
          'אוֹר וְחֹשֶׁךְ (light and darkness)',
          'יוֹם וְלַיְלָה (day and night)',
          'מַיִם וְיַבָּשָׁה (water and land)'
        ],
        explanation: 'הַשָּׁמַיִם (the heavens) וְהָאָרֶץ (and the earth) are the first things God creates. This merism (pair of opposites) means "everything".',
        orderIndex: 3
      },
      {
        questionText: 'Why is spaced repetition more effective than cramming all vocabulary at once?',
        questionType: 'multiple_choice',
        correctAnswer: 'It strengthens memory through optimal review intervals',
        options: [
          'It strengthens memory through optimal review intervals',
          'It takes less total time to learn',
          'It requires less mental effort',
          'It works better for short-term memory'
        ],
        explanation: 'Spaced repetition leverages your brain\'s natural forgetting curve. Reviewing at strategic intervals (1 day, 3 days, 7 days) converts short-term memories into long-term retention.',
        orderIndex: 4
      }
    ];

    for (const q of quizQuestions) {
      await sql`
        INSERT INTO quiz_questions (lesson_id, question_text, question_type, correct_answer, options, explanation, order_index)
        VALUES (
          'hebrew-week-4-vocabulary',
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
      celebrationMessage: 'You now have 30 Hebrew words in your vocabulary!',
      xpAwarded: 120,
      achievements: ['Week 4 Complete', 'Vocabulary Builder', 'Genesis Scholar'],
      nextLessonId: 'hebrew-week-5-nouns',
      reviewPrompt: 'Practice your Genesis 1:1-5 flashcards daily. Let the spaced repetition system guide your reviews.',
      referenceLinks: [
        {
          title: 'Complete Genesis 1:1-5 Vocabulary',
          url: '/hebrew/vocabulary'
        },
        {
          title: 'Spaced Repetition Guide',
          url: '/hebrew/reference/spaced-repetition'
        }
      ]
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-4-vocabulary', 6, 'completion', ${JSON.stringify(completionContent)}, 6)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 6 created\n');

    console.log('🎉 Week 4 interactive lesson seeded successfully!\n');
    console.log('Lesson structure:');
    console.log('  1. Objective: Learning goals and vocabulary overview');
    console.log('  2. Concept: Vocabulary learning strategies with science');
    console.log('  3. Scripture: Genesis 1:1-5 with highlighted key words');
    console.log('  4. Vocabulary: 30 words from Genesis with flashcards');
    console.log('  5. Quiz: 4 questions testing vocabulary and strategy');
    console.log('  6. Completion: Celebration and next steps');

  } catch (error) {
    console.error('❌ Error seeding Week 4 interactive lesson:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

seedWeek4Interactive()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
