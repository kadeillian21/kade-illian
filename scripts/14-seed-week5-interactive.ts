/**
 * Seed Interactive Week 5 Lesson
 *
 * Creates step-by-step interactive lesson for Hebrew Week 5: Noun Gender & Number
 * Includes: Objective, Concept, Scripture, Vocabulary, Quiz, and Completion steps
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedWeek5Interactive() {
  console.log('🚀 Seeding Week 5 interactive lesson...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Update lesson metadata for Week 5
    console.log('📖 Updating Week 5 lesson metadata...');
    await sql`
      UPDATE lessons
      SET
        estimated_minutes = 20,
        difficulty_level = 3,
        scripture_passage_ids = ARRAY['genesis-1-1', 'genesis-1-2', 'genesis-1-26'],
        requires_quiz_pass = true,
        min_quiz_score = 80,
        updated_at = NOW()
      WHERE id = 'hebrew-week-5-nouns'
    `;
    console.log('✅ Week 5 metadata updated\n');

    // Step 1: Objective
    console.log('📝 Creating Step 1: Objective...');
    const objectiveContent = {
      title: 'Noun Gender & Number',
      objectives: [
        'Understand masculine and feminine noun forms',
        'Recognize singular and plural patterns',
        'Identify dual number for paired objects',
        'Practice noun forms in Genesis passages'
      ],
      estimatedMinutes: 20,
      verseReference: 'Genesis 1:1-2, 1:26'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-5-nouns', 1, 'objective', ${JSON.stringify(objectiveContent)}, 1)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 1 created\n');

    // Step 2: Concept - Gender & Number
    console.log('📝 Creating Step 2: Concept (Gender & Number)...');
    const conceptContent = {
      conceptName: 'Hebrew Noun Gender & Number',
      summary: 'All Hebrew nouns have gender (masculine or feminine) and number (singular, plural, or dual). These forms follow predictable patterns that help you recognize word families.',
      practiceVocabSetId: 'gender-number-practice', // Add inline flashcard practice!
      visualAid: {
        type: 'table',
        data: {
          headers: ['Form', 'Ending', 'Example', 'Translation'],
          rows: [
            ['Masc. Singular', '(none)', 'מֶלֶךְ', 'king'],
            ['Masc. Plural', 'ִים-', 'מְלָכִים', 'kings'],
            ['Fem. Singular', 'ָה-', 'מַלְכָּה', 'queen'],
            ['Fem. Plural', 'וֹת-', 'מְלָכוֹת', 'queens'],
            ['Dual', 'ַיִם-', 'יָדַיִם', 'two hands']
          ]
        }
      },
      examples: [
        {
          hebrew: 'שָׁמַיִם',
          translation: 'heavens',
          highlight: 'ַיִם',
          explanation: 'The ַיִם- ending marks this as either masculine plural OR dual. Context determines: here it\'s plural "heavens".'
        },
        {
          hebrew: 'אֶרֶץ',
          translation: 'earth, land',
          highlight: 'אֶרֶץ',
          explanation: 'Feminine singular noun with no ָה- ending. Some common feminine nouns don\'t use the typical ending (like אֶרֶץ, עִיר, אֵשׁ).'
        },
        {
          hebrew: 'תּוֹלָדוֹת',
          translation: 'generations',
          highlight: 'וֹת',
          explanation: 'The וֹת- ending clearly marks feminine plural. From תּוֹלְדָה (generation).'
        }
      ],
      expandableTheory: {
        title: 'Deep Dive: Gender, Number, and Hebrew Grammar',
        content: `Hebrew nouns have TWO grammatical features that work together:

**1. GENDER (Masculine or Feminine)**

Every Hebrew noun has inherent gender. This is NOT about biological sex - it's a grammatical category.

**Masculine nouns:**
- Default form (no special ending)
- Examples: מֶלֶךְ (king), סֵפֶר (book), יוֹם (day)
- Some exceptions end in ה- but are masculine: פֶּה (mouth)

**Feminine nouns:**
- Usually end in ָה- (ה with qamatz)
- Examples: מַלְכָּה (queen), תּוֹרָה (law), שָׁנָה (year)
- EXCEPTIONS: Common words that are feminine without the ending:
  - אֶרֶץ (earth/land)
  - עִיר (city)
  - אֵשׁ (fire)
  - נֶפֶשׁ (soul)
  - רוּחַ (spirit/wind)

**2. NUMBER (Singular, Plural, or Dual)**

**Singular:** The base form
- מֶלֶךְ (a king)
- מַלְכָּה (a queen)

**Plural:** Multiple items
- Masculine plural: ִים- ending
  - מֶלֶךְ → מְלָכִים (kings)
  - סוּס → סוּסִים (horses)
- Feminine plural: וֹת- ending
  - מַלְכָּה → מְלָכוֹת (queens)
  - תּוֹרָה → תּוֹרוֹת (laws)

**Dual:** Specifically TWO items (especially paired body parts)
- ַיִם- ending (looks like masc. plural!)
- יָד (hand) → יָדַיִם (two hands)
- עַיִן (eye) → עֵינַיִם (two eyes)
- אֹזֶן (ear) → אָזְנַיִם (two ears)

**Important note:** שָׁמַיִם (heavens) LOOKS dual but is actually plural! Context matters.

**Why This Matters:**
Later you'll learn that adjectives, verbs, and pronouns must AGREE with their nouns in gender AND number. Understanding noun forms now builds the foundation for all Hebrew grammar.

**Common Patterns to Watch For:**
1. If you see ִים-, it's either masculine plural OR dual
2. If you see וֹת-, it's ALWAYS feminine plural
3. If you see ָה- at the end, it's USUALLY feminine singular
4. Some feminine nouns break the rules - memorize the common ones

**Genesis 1 Examples:**
- שָׁמַיִם (heavens) - masculine plural
- אֶרֶץ (earth) - feminine singular (irregular!)
- יוֹם (day) - masculine singular
- מֵאוֹרֹת (lights) - feminine plural from מָאוֹר`
      }
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-5-nouns', 2, 'concept', ${JSON.stringify(conceptContent)}, 2)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 2 created\n');

    // Step 3: Scripture Reading - Genesis Examples
    console.log('📝 Creating Step 3: Scripture Reading...');
    const scriptureContent = {
      reference: 'Genesis 1:1-2, 1:26',
      hebrewText: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים... וַיֹּאמֶר אֱלֹהִים נַעֲשֶׂה אָדָם בְּצַלְמֵנוּ כִּדְמוּתֵנוּ',
      englishTranslation: 'In the beginning God created the heavens and the earth. The earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God... And God said, "Let us make mankind in our image, in our likeness"',
      highlights: [
        {
          wordIndex: 4,
          color: 'blue',
          concept: 'הַשָּׁמַיִם - masculine plural (the heavens)'
        },
        {
          wordIndex: 6,
          color: 'pink',
          concept: 'הָאָרֶץ - feminine singular (the earth) - irregular form!'
        },
        {
          wordIndex: 14,
          color: 'pink',
          concept: 'רוּחַ - feminine singular (spirit) - another irregular!'
        },
        {
          wordIndex: 18,
          color: 'blue',
          concept: 'אָדָם - masculine singular (mankind/Adam)'
        }
      ],
      comprehensionPrompt: 'Notice how הָאָרֶץ (earth) is feminine even without the typical ָה- ending. Can you spot other nouns and identify their gender/number?'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-5-nouns', 3, 'scripture', ${JSON.stringify(scriptureContent)}, 3)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 3 created\n');

    // Step 4: Vocabulary Practice
    console.log('📝 Creating Step 4: Vocabulary Practice...');
    const vocabularyContent = {
      vocabularySetId: 'gender-number-practice',
      wordIds: [],
      contextVerse: 'מֶלֶךְ → מְלָכִים (king → kings) | מַלְכָּה → מְלָכוֹת (queen → queens)',
      instructions: 'Practice masculine/feminine and singular/plural/dual forms. Notice how endings change to show gender and number. Try to identify the pattern before flipping each card!'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-5-nouns', 4, 'vocabulary', ${JSON.stringify(vocabularyContent)}, 4)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 4 created\n');

    // Step 5: Quiz Questions
    console.log('❓ Creating quiz questions...');

    const quizQuestions = [
      {
        questionText: 'What is the typical ending for masculine plural nouns?',
        questionType: 'multiple_choice',
        correctAnswer: 'ִים-',
        options: ['ִים-', 'וֹת-', 'ָה-', 'ֶת-'],
        explanation: 'Masculine plural nouns typically end in ִים- (yod-mem with hiriq). Example: מֶלֶךְ (king) → מְלָכִים (kings).',
        orderIndex: 1
      },
      {
        questionText: 'The word הָאָרֶץ (the earth) is:',
        questionType: 'multiple_choice',
        correctAnswer: 'Feminine singular (irregular)',
        options: [
          'Masculine singular',
          'Masculine plural',
          'Feminine singular (irregular)',
          'Feminine plural'
        ],
        explanation: 'אֶרֶץ is feminine singular but doesn\'t have the typical ָה- ending. It\'s one of several common irregular feminine nouns (like עִיר, אֵשׁ, רוּחַ).',
        orderIndex: 2
      },
      {
        questionText: 'If a noun ends in וֹת-, what can you conclude?',
        questionType: 'multiple_choice',
        correctAnswer: 'It is feminine plural',
        options: [
          'It is masculine plural',
          'It is feminine plural',
          'It is dual number',
          'It could be either gender'
        ],
        explanation: 'The וֹת- ending ALWAYS indicates feminine plural. Example: תּוֹרָה (law) → תּוֹרוֹת (laws). This is the most reliable noun pattern.',
        orderIndex: 3
      },
      {
        questionText: 'What is special about the dual number form (ַיִם-) in Hebrew?',
        questionType: 'multiple_choice',
        correctAnswer: 'It indicates exactly two of something, especially paired items',
        options: [
          'It means the noun is masculine',
          'It indicates exactly two of something, especially paired items',
          'It is used for any plural noun',
          'It only applies to body parts'
        ],
        explanation: 'Dual (ַיִם-) indicates exactly TWO items, commonly used for paired body parts: יָדַיִם (two hands), עֵינַיִם (two eyes). It looks like masculine plural but has specific meaning.',
        orderIndex: 4
      }
    ];

    for (const q of quizQuestions) {
      await sql`
        INSERT INTO quiz_questions (lesson_id, question_text, question_type, correct_answer, options, explanation, order_index)
        VALUES (
          'hebrew-week-5-nouns',
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
      celebrationMessage: 'You can now identify Hebrew noun gender and number!',
      xpAwarded: 130,
      achievements: ['Week 5 Complete', 'Noun Master', 'Grammar Foundation'],
      nextLessonId: 'hebrew-week-6-adjectives',
      reviewPrompt: 'Practice identifying masculine/feminine and singular/plural forms in Genesis 1. Look for the patterns!',
      referenceLinks: [
        {
          title: 'Complete Noun Grammar Guide',
          url: '/hebrew/reference/nouns'
        },
        {
          title: 'Gender & Number Reference Chart',
          url: '/hebrew/reference/gender-number'
        }
      ]
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-5-nouns', 6, 'completion', ${JSON.stringify(completionContent)}, 6)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 6 created\n');

    console.log('🎉 Week 5 interactive lesson seeded successfully!\n');
    console.log('Lesson structure:');
    console.log('  1. Objective: Learning goals for noun grammar');
    console.log('  2. Concept: Gender & number with comprehensive patterns');
    console.log('  3. Scripture: Genesis examples with gender/number highlighted');
    console.log('  4. Vocabulary: Practice nouns with attention to forms');
    console.log('  5. Quiz: 4 questions testing noun form recognition');
    console.log('  6. Completion: Celebration and next steps');

  } catch (error) {
    console.error('❌ Error seeding Week 5 interactive lesson:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

seedWeek5Interactive()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
