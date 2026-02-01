/**
 * Seed Interactive Week 6 Lesson
 *
 * Creates step-by-step interactive lesson for Hebrew Week 6: Adjectives & Agreement
 * Includes: Objective, Concept, Scripture, Vocabulary, Quiz, and Completion steps
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedWeek6Interactive() {
  console.log('🚀 Seeding Week 6 interactive lesson...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Update lesson metadata for Week 6
    console.log('📖 Updating Week 6 lesson metadata...');
    await sql`
      UPDATE lessons
      SET
        estimated_minutes = 20,
        difficulty_level = 4,
        scripture_passage_ids = ARRAY['genesis-1-4', 'genesis-1-10', 'genesis-1-12'],
        requires_quiz_pass = true,
        min_quiz_score = 80,
        updated_at = NOW()
      WHERE id = 'hebrew-week-6-adjectives'
    `;
    console.log('✅ Week 6 metadata updated\n');

    // Step 1: Objective
    console.log('📝 Creating Step 1: Objective...');
    const objectiveContent = {
      title: 'Adjectives & Agreement',
      objectives: [
        'Understand how adjectives must agree with nouns',
        'Recognize masculine and feminine adjective forms',
        'Identify singular and plural adjective patterns',
        'Practice reading adjective-noun phrases in Genesis'
      ],
      estimatedMinutes: 20,
      verseReference: 'Genesis 1:4, 1:10, 1:12'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-6-adjectives', 1, 'objective', ${JSON.stringify(objectiveContent)}, 1)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 1 created\n');

    // Step 2: Concept - Adjective Agreement
    console.log('📝 Creating Step 2: Concept (Adjective Agreement)...');
    const conceptContent = {
      conceptName: 'Hebrew Adjective Agreement',
      summary: 'Hebrew adjectives must match their nouns in THREE ways: gender (masculine/feminine), number (singular/plural), and definiteness (with/without article). This agreement rule is ABSOLUTE in Biblical Hebrew.',
      visualAid: {
        type: 'table',
        data: {
          headers: ['Noun Form', 'Adjective Form', 'Example', 'Translation'],
          rows: [
            ['Masc. Sing.', 'טוֹב', 'דָּבָר טוֹב', 'a good word'],
            ['Masc. Sing. + Art.', 'הַטּוֹב', 'הַדָּבָר הַטּוֹב', 'the good word'],
            ['Fem. Sing.', 'טוֹבָה', 'אֶרֶץ טוֹבָה', 'a good land'],
            ['Fem. Sing. + Art.', 'הַטּוֹבָה', 'הָאָרֶץ הַטּוֹבָה', 'the good land'],
            ['Masc. Plur.', 'טוֹבִים', 'דְּבָרִים טוֹבִים', 'good words'],
            ['Fem. Plur.', 'טוֹבוֹת', 'אֲרָצוֹת טוֹבוֹת', 'good lands']
          ]
        }
      },
      examples: [
        {
          hebrew: 'אוֹר טוֹב',
          translation: 'good light',
          highlight: 'טוֹב',
          explanation: 'אוֹר (light) is masculine singular, so טוֹב must also be masculine singular. Perfect agreement!'
        },
        {
          hebrew: 'הָאוֹר הַטּוֹב',
          translation: 'the good light',
          highlight: 'הַטּוֹב',
          explanation: 'When the noun has the article הַ, the adjective MUST also take the article. Both have הַ = definite agreement.'
        },
        {
          hebrew: 'כִּי־טוֹב',
          translation: 'that (it was) good',
          explanation: 'In Genesis 1:4, God sees כִּי־טוֹב. Here טוֹב stands alone as a predicate adjective (no noun), describing what God sees.'
        }
      ],
      expandableTheory: {
        title: 'Deep Dive: The Three Rules of Adjective Agreement',
        content: `Hebrew adjectives follow THREE ironclad agreement rules:

**RULE 1: GENDER AGREEMENT**
The adjective MUST match the noun's gender.

**Masculine adjective forms:**
- Singular: טוֹב (tov) - good
- Plural: טוֹבִים (tovim) - good

**Feminine adjective forms:**
- Singular: טוֹבָה (tovah) - good
- Plural: טוֹבוֹת (tovot) - good

Notice: Feminine adds ָה- in singular, וֹת- in plural (just like nouns!)

**Examples:**
- יוֹם טוֹב (good day) - masculine
- שָׁנָה טוֹבָה (good year) - feminine
- ❌ יוֹם טוֹבָה - WRONG! Gender mismatch

**RULE 2: NUMBER AGREEMENT**
The adjective MUST match the noun's number.

**Singular:**
- דָּבָר גָּדוֹל (a great word)
- אִשָּׁה גְּדוֹלָה (a great woman)

**Plural:**
- דְּבָרִים גְּדוֹלִים (great words)
- נָשִׁים גְּדוֹלוֹת (great women)

**Examples:**
- ❌ דָּבָר גְּדוֹלִים - WRONG! Number mismatch
- ✅ דְּבָרִים גְּדוֹלִים - CORRECT! Both plural

**RULE 3: DEFINITENESS AGREEMENT**
If the noun has the article הַ, the adjective MUST also have it!

**Indefinite (no article):**
- מֶלֶךְ גָּדוֹל (a great king)
- אֶרֶץ טוֹבָה (a good land)

**Definite (with article):**
- הַמֶּלֶךְ הַגָּדוֹל (the great king)
- הָאָרֶץ הַטּוֹבָה (the good land)

**Examples:**
- ❌ הַמֶּלֶךְ גָּדוֹל - WRONG! Definiteness mismatch
- ✅ הַמֶּלֶךְ הַגָּדוֹל - CORRECT! Both definite

**WORD ORDER:**
Hebrew adjectives FOLLOW the noun they modify:
- English: "the good land"
- Hebrew: הָאָרֶץ הַטּוֹבָה (literally: "the land the good")

**PREDICATIVE vs. ATTRIBUTIVE:**

**Attributive (modifies noun):**
- אוֹר טוֹב (a good light) - describes the light
- הָאוֹר הַטּוֹב (the good light) - describes the light
- BOTH noun and adjective agree in ALL THREE categories

**Predicative (states something about noun):**
- הָאוֹר טוֹב (the light [is] good) - notice NO article on טוֹב!
- This is a complete sentence: "The light is good"
- Hebrew often omits the verb "to be" in present tense

**Genesis 1 Pattern:**
"וַיַּרְא אֱלֹהִים אֶת־הָאוֹר כִּי־טוֹב"
"And God saw the light that (it was) good"

Here כִּי־טוֹב is predicative - it's a statement about the light, not an attributive description.

**Why Agreement Matters:**
Later you'll parse complex phrases. Knowing that adjectives MUST agree helps you:
1. Identify which adjective goes with which noun
2. Determine the gender/number of irregular nouns
3. Distinguish attributive from predicative constructions
4. Parse compound descriptions

**Memory Device:**
Adjectives are like loyal servants - they must dress EXACTLY like their master noun (same gender, same number, same definiteness)!`
      }
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-6-adjectives', 2, 'concept', ${JSON.stringify(conceptContent)}, 2)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 2 created\n');

    // Step 3: Scripture Reading - Genesis "Good" Pattern
    console.log('📝 Creating Step 3: Scripture Reading...');
    const scriptureContent = {
      reference: 'Genesis 1:4, 1:10, 1:12',
      hebrewText: 'וַיַּרְא אֱלֹהִים אֶת־הָאוֹר כִּי־טוֹב... וַיִּקְרָא אֱלֹהִים לַיַּבָּשָׁה אֶרֶץ וּלְמִקְוֵה הַמַּיִם קָרָא יַמִּים וַיַּרְא אֱלֹהִים כִּי־טוֹב... וַתּוֹצֵא הָאָרֶץ דֶּשֶׁא עֵשֶׂב מַזְרִיעַ זֶרַע עֵץ פְּרִי וַיַּרְא אֱלֹהִים כִּי־טוֹב',
      englishTranslation: 'God saw that the light was good... God called the dry ground "land," and the gathered waters he called "seas." And God saw that it was good... The land produced vegetation: plants bearing seed and trees bearing fruit. And God saw that it was good.',
      highlights: [
        {
          wordIndex: 4,
          color: 'green',
          concept: 'כִּי־טוֹב - "that (it was) good" - predicative adjective pattern'
        },
        {
          wordIndex: 16,
          color: 'green',
          concept: 'כִּי־טוֹב - God\'s repeated declaration of goodness'
        },
        {
          wordIndex: 27,
          color: 'green',
          concept: 'כִּי־טוֹב - same pattern throughout Genesis 1'
        },
        {
          wordIndex: 10,
          color: 'blue',
          concept: 'אֶרֶץ - feminine singular noun'
        }
      ],
      comprehensionPrompt: 'Notice the repeated pattern: וַיַּרְא אֱלֹהִים כִּי־טוֹב. The adjective טוֹב appears WITHOUT the article because it\'s predicative (making a statement), not attributive (modifying a noun).'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-6-adjectives', 3, 'scripture', ${JSON.stringify(scriptureContent)}, 3)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 3 created\n');

    // Step 4: Vocabulary Practice
    console.log('📝 Creating Step 4: Vocabulary Practice...');
    const vocabularyContent = {
      vocabularySetId: 'genesis-1-1-5',
      wordIds: [],
      contextVerse: 'וַיַּרְא אֱלֹהִים אֶת־הָאוֹר כִּי־טוֹב',
      instructions: 'Practice adjectives from Genesis. Pay attention to how they agree with their nouns in gender, number, and definiteness.'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-6-adjectives', 4, 'vocabulary', ${JSON.stringify(vocabularyContent)}, 4)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 4 created\n');

    // Step 5: Quiz Questions
    console.log('❓ Creating quiz questions...');

    const quizQuestions = [
      {
        questionText: 'Hebrew adjectives must agree with their nouns in how many ways?',
        questionType: 'multiple_choice',
        correctAnswer: 'Three: gender, number, and definiteness',
        options: [
          'One: gender only',
          'Two: gender and number',
          'Three: gender, number, and definiteness',
          'Four: gender, number, definiteness, and case'
        ],
        explanation: 'Hebrew adjectives must match their nouns in ALL THREE categories: gender (masc/fem), number (sing/plur), and definiteness (with/without article).',
        orderIndex: 1
      },
      {
        questionText: 'How would you say "the good land" (land is feminine) in Hebrew?',
        questionType: 'multiple_choice',
        correctAnswer: 'הָאָרֶץ הַטּוֹבָה',
        options: [
          'הָאָרֶץ טוֹב',
          'הָאָרֶץ טוֹבָה',
          'הָאָרֶץ הַטּוֹבָה',
          'אֶרֶץ הַטּוֹבָה'
        ],
        explanation: 'Both the noun and adjective need the article: הָאָרֶץ (the land) + הַטּוֹבָה (the good, fem. sing.). Definiteness agreement requires BOTH to have the article.',
        orderIndex: 2
      },
      {
        questionText: 'In the phrase "אוֹר טוֹב" (good light), where does the adjective appear?',
        questionType: 'multiple_choice',
        correctAnswer: 'After the noun',
        options: [
          'Before the noun',
          'After the noun',
          'Either before or after',
          'Separated by a verb'
        ],
        explanation: 'Hebrew adjectives ALWAYS follow the noun they modify. English says "good light", Hebrew says "light good" (אוֹר טוֹב).',
        orderIndex: 3
      },
      {
        questionText: 'What is the difference between "הָאוֹר הַטּוֹב" and "הָאוֹר טוֹב"?',
        questionType: 'multiple_choice',
        correctAnswer: 'First is "the good light" (attributive), second is "the light is good" (predicative)',
        options: [
          'They mean exactly the same thing',
          'First is "the good light" (attributive), second is "the light is good" (predicative)',
          'First is definite, second is indefinite',
          'First is plural, second is singular'
        ],
        explanation: 'When BOTH noun and adjective have the article (הָאוֹר הַטּוֹב), it\'s attributive: "the good light". When only the noun has the article (הָאוֹר טוֹב), it\'s predicative: "the light [is] good".',
        orderIndex: 4
      }
    ];

    for (const q of quizQuestions) {
      await sql`
        INSERT INTO quiz_questions (lesson_id, question_text, question_type, correct_answer, options, explanation, order_index)
        VALUES (
          'hebrew-week-6-adjectives',
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
      celebrationMessage: 'You can now parse Hebrew adjective-noun agreement!',
      xpAwarded: 150,
      achievements: ['Week 6 Complete', 'Adjective Master', 'Agreement Expert'],
      nextLessonId: 'hebrew-week-7-reading',
      reviewPrompt: 'Practice spotting adjectives in Genesis 1 and verify their agreement with nouns. Look for the כִּי־טוֹב pattern!',
      referenceLinks: [
        {
          title: 'Complete Adjective Grammar Guide',
          url: '/hebrew/reference/adjectives'
        },
        {
          title: 'Agreement Rules Reference',
          url: '/hebrew/reference/agreement'
        }
      ]
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-6-adjectives', 6, 'completion', ${JSON.stringify(completionContent)}, 6)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, updated_at = NOW()
    `;
    console.log('✅ Step 6 created\n');

    console.log('🎉 Week 6 interactive lesson seeded successfully!\n');
    console.log('Lesson structure:');
    console.log('  1. Objective: Learning goals for adjective agreement');
    console.log('  2. Concept: Three agreement rules with comprehensive examples');
    console.log('  3. Scripture: Genesis "good" pattern with agreement analysis');
    console.log('  4. Vocabulary: Practice adjectives with agreement focus');
    console.log('  5. Quiz: 4 questions testing adjective agreement mastery');
    console.log('  6. Completion: Celebration and next steps');

  } catch (error) {
    console.error('❌ Error seeding Week 6 interactive lesson:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

seedWeek6Interactive()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
