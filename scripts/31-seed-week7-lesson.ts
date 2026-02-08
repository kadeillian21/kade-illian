/**
 * Seed Week 7 Lesson: Noun Patterns (Sessions 40-44)
 *
 * Creates the lesson record and interactive steps for Hebrew Week 7:
 * - Segholate nouns (3 sub-patterns)
 * - Other common noun patterns (קָטוֹל, קָטָל, etc.)
 * - Reading Genesis 1:11-19
 *
 * Also updates Week 6 completion step to point to this lesson.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedWeek7Lesson() {
  console.log('🚀 Seeding Week 7 lesson: Noun Patterns...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Step 0: Insert the lesson record
    console.log('📖 Creating Week 7 lesson record...');
    await sql`
      INSERT INTO lessons (
        id, language_id, week_number, month_number,
        title, description, lesson_content,
        topics, vocabulary_set_ids, order_index,
        estimated_minutes, difficulty_level,
        scripture_passage_ids, requires_quiz_pass, min_quiz_score
      )
      VALUES (
        'hebrew-week-7-noun-patterns',
        'hebrew',
        7,
        2,
        'Noun Patterns (Segholates & More)',
        'Master segholate and other common noun patterns. Read Genesis 1:11-19 (Days 3-4 of creation).',
        '',
        ARRAY['Segholate Nouns', 'Noun Patterns', 'Mishkalim', 'Genesis 1:11-19'],
        ARRAY['week-7-segholates', 'week-7-noun-patterns', 'week-7-genesis-reading'],
        7,
        25,
        5,
        ARRAY['genesis-1-11-13', 'genesis-1-14-15', 'genesis-1-16-19'],
        true,
        80
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        topics = EXCLUDED.topics,
        vocabulary_set_ids = EXCLUDED.vocabulary_set_ids,
        estimated_minutes = EXCLUDED.estimated_minutes,
        difficulty_level = EXCLUDED.difficulty_level,
        scripture_passage_ids = EXCLUDED.scripture_passage_ids,
        requires_quiz_pass = EXCLUDED.requires_quiz_pass,
        min_quiz_score = EXCLUDED.min_quiz_score,
        updated_at = NOW()
    `;
    console.log('✅ Week 7 lesson record created\n');

    // Update Week 6 completion step to point to Week 7
    console.log('🔗 Updating Week 6 completion step to link to Week 7...');
    const week6Steps = await sql`
      SELECT id, content FROM lesson_steps
      WHERE lesson_id = 'hebrew-week-6-adjectives' AND step_type = 'completion'
    `;
    if (week6Steps.length > 0) {
      const content = typeof week6Steps[0].content === 'string'
        ? JSON.parse(week6Steps[0].content)
        : week6Steps[0].content;
      content.nextLessonId = 'hebrew-week-7-noun-patterns';
      await sql`
        UPDATE lesson_steps SET content = ${JSON.stringify(content)}, updated_at = NOW()
        WHERE id = ${week6Steps[0].id}
      `;
      console.log('✅ Week 6 completion now points to Week 7\n');
    } else {
      console.log('⚠️  Week 6 completion step not found, skipping link update\n');
    }

    // Step 1: Objective
    console.log('📝 Creating Step 1: Objective...');
    const objectiveContent = {
      title: 'Noun Patterns (Segholates & More)',
      objectives: [
        'Understand segholate noun patterns (three sub-types)',
        'Recognize 20 common segholate nouns at sight',
        'Learn קָטוֹל and קָטָל noun patterns',
        'Predict plural and construct forms from patterns',
        'Read Genesis 1:11-19 (Days 3-4 of creation)'
      ],
      estimatedMinutes: 25,
      verseReference: 'Genesis 1:11-19'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-7-noun-patterns', 1, 'objective', ${JSON.stringify(objectiveContent)}, 1)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 1 created\n');

    // Step 2: Concept - Segholate Nouns (Sessions 40-42)
    console.log('📝 Creating Step 2: Concept (Segholate Nouns)...');
    const segholateContent = {
      conceptName: 'Segholate Nouns',
      summary: 'A segholate noun is a two-syllable masculine noun with the accent on the FIRST syllable and a characteristic vowel + e-sound pattern. The name comes from the vowel segol (ֶ) which often appears in these words. Segholates are EVERYWHERE in Hebrew — hundreds of common nouns follow this pattern!',
      visualAid: {
        type: 'table',
        data: {
          headers: ['Pattern', 'Vowels', 'Example', 'Original', 'Plural', 'Const. Plural'],
          rows: [
            ['Pattern 1', 'ֶ_ֶ_ (segol-segol)', 'מֶ֫לֶךְ (king)', '← malk', 'מְלָכִים', 'מַלְכֵי'],
            ['Pattern 2', 'ֵ_ֶ_ (tsere-segol)', 'סֵ֫פֶר (book)', '← sipr', 'סְפָרִים', 'סִפְרֵי'],
            ['Pattern 3', 'ֹ_ֶ_ (holem-segol)', 'קֹ֫דֶשׁ (holiness)', '← quds', 'קֳדָשִׁים', '(rare)']
          ]
        }
      },
      examples: [
        {
          hebrew: 'מֶ֫לֶךְ → מְלָכִים',
          translation: 'king → kings',
          explanation: 'Pattern 1 (segol-segol): Original vowel was "a" (malk). In plural, the original vowel reappears: מְלָכִים. The construct plural reveals it even more: מַלְכֵי (kings of).'
        },
        {
          hebrew: 'סֵ֫פֶר → סְפָרִים',
          translation: 'book → books',
          explanation: 'Pattern 2 (tsere-segol): Original vowel was "i" (sipr). The construct plural shows it: סִפְרֵי (books of).'
        },
        {
          hebrew: 'מֶלֶךְ יִשְׂרָאֵל / מַלְכֵי יִשְׂרָאֵל',
          translation: 'king of Israel / kings of Israel',
          explanation: 'Construct singular often looks the same as absolute, but construct PLURAL shows the original vowel pattern clearly!'
        },
        {
          hebrew: 'נֶ֫פֶשׁ / אֶ֫רֶץ',
          translation: 'soul / land',
          explanation: 'Watch out! These LOOK masculine (segholate pattern) but are actually FEMININE nouns. נֶפֶשׁ (soul) and אֶרֶץ (land) are important exceptions to memorize.'
        }
      ],
      expandableTheory: {
        title: 'Deep Dive: Why Segholates Exist',
        content: `**The History Behind Segholates**

Originally, these were all monosyllabic words (one syllable):
- מֶלֶךְ was just *malk*
- סֵפֶר was just *sipr*
- קֹדֶשׁ was just *quds*

But Hebrew doesn't like consonant clusters at the end of words, so a **helping vowel** (usually segol) was inserted between the last two consonants. The original middle vowel determines which of the three patterns a word follows.

**Why This Matters:**

When suffixes or plural endings are added, the helping vowel **drops out** and the original vowel pattern resurfaces:
- מֶלֶךְ → מַלְכִּי (my king) — the "a" returns!
- סֵפֶר → סִפְרִי (my book) — the "i" returns!

**How to Recognize Segholates:**
1. Two syllables
2. Accent on the FIRST syllable (unusual for Hebrew!)
3. Second vowel is usually segol (ֶ)
4. Masculine (usually — exceptions like נֶפֶשׁ and אֶרֶץ)

**Memory Device:**
Think of segholates as "compressed" words. The original one-syllable word was expanded with a helping vowel. When you add endings, the word "compresses" back to reveal its true form!

**The 20 Key Segholates:**

*Pattern 1 (ֶ_ֶ_):* מֶלֶךְ (king), עֶבֶד (servant), נֶפֶשׁ (soul), קֶבֶר (grave), דֶּרֶךְ (way), שֶׁקֶר (falsehood), צֶדֶק (righteousness)

*Pattern 2 (ֵ_ֶ_):* סֵפֶר (book), כֶּלֶב (dog), עֵצֶם (bone), חֵלֶק (portion), שֵׁבֶט (tribe)

*Pattern 3 (ֹ_ֶ_):* קֹדֶשׁ (holiness), חֹשֶׁךְ (darkness), עֹשֶׁר (wealth), גֹּרֶן (threshing floor)

*Other Important:* אֶרֶץ (land), בֹּקֶר (morning), עֶרֶב (evening), יֶלֶד (child)`
      }
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-7-noun-patterns', 2, 'concept', ${JSON.stringify(segholateContent)}, 2)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 2 created\n');

    // Step 3: Concept - Other Noun Patterns (Sessions 43-44)
    console.log('📝 Creating Step 3: Concept (Other Noun Patterns)...');
    const otherPatternsContent = {
      conceptName: 'More Noun Patterns: קָטוֹל and קָטָל',
      summary: 'Beyond segholates, Hebrew has other common noun patterns (mishkalim). Recognizing these patterns helps you predict behavior and build vocabulary faster. The two most important are קָטוֹל (qatol — with holem) and קָטָל (qatal — two qamets).',
      visualAid: {
        type: 'table',
        data: {
          headers: ['Pattern', 'Indicates', 'Examples', 'Plural Form'],
          rows: [
            ['קָטוֹל (qatol)', 'Nouns of state/quality, some professions', 'שָׁלוֹם, כָּבוֹד, מָקוֹם', 'Usually קְטֹלִים'],
            ['קָטָל (qatal)', 'Abstract/collective nouns, adjective-nouns', 'זָקֵן, קָרוֹב, רָחוֹק', 'Varies'],
            ['קֶ֫טֶל (qetel)', 'Like segholates with variations', 'כֶּ֫סֶף, נֶ֫שֶׁר', 'Like segholates'],
            ['קֹ֫טֵל (qotel)', 'Nouns from participles', 'כֹּהֵן, שֹׁפֵט', 'כֹּהֲנִים, שֹׁפְטִים']
          ]
        }
      },
      examples: [
        {
          hebrew: 'שָׁלוֹם / כָּבוֹד / מָקוֹם',
          translation: 'peace / glory / place',
          explanation: 'קָטוֹל pattern (qatol — with holem): Often indicates nouns of state, quality, or characteristic. These are extremely common in Biblical Hebrew.'
        },
        {
          hebrew: 'כֹּהֵן / שֹׁפֵט',
          translation: 'priest / judge',
          explanation: 'קֹ֫טֵל pattern (active participle): Nouns derived from participles — "one who serves" (priest), "one who judges" (judge). The pattern tells you the word describes someone who DOES something.'
        },
        {
          hebrew: 'כֶּ֫סֶף / זָהָב',
          translation: 'silver / gold',
          explanation: 'Two important material nouns. כֶּסֶף follows the qetel pattern (like a segholate). זָהָב follows a different pattern but is equally common.'
        },
        {
          hebrew: 'הַר / עַם / גּוֹי',
          translation: 'mountain / people / nation',
          explanation: 'Some very common nouns are monosyllabic and don\'t fit neatly into patterns. These just need to be memorized, but they\'re so frequent you\'ll learn them quickly.'
        }
      ],
      expandableTheory: {
        title: 'Deep Dive: Why Noun Patterns Matter',
        content: `**Understanding Mishkalim (Noun Patterns)**

Hebrew uses a system of **root consonants + vowel patterns** to create words. The same three root consonants can produce different words depending on which vowel pattern (mishkal) is applied:

Root: מ-ל-כ (m-l-k, related to ruling)
- מֶלֶךְ (melekh) = king (segholate pattern)
- מַלְכָּה (malkah) = queen
- מַמְלָכָה (mamlakhah) = kingdom
- מָלַךְ (malakh) = he ruled (verb)

**The קָטוֹל Pattern in Detail:**

Words: שָׁלוֹם (peace), כָּבוֹד (glory), מָקוֹם (place), עָוֹן (iniquity), אָדוֹן (lord)

Characteristics:
- First vowel: qamets (ָ)
- Second vowel: holem (וֹ)
- Usually masculine
- Often abstract or quality nouns
- Plural typically: קְטוֹלִים or קְטֹלִים

**The קָטָל Pattern:**

Words: זָקֵן (elder), נָהָר (river), דָּבָר (word/thing)

Characteristics:
- Two qamets vowels
- Can indicate abstract nouns, collectives
- Often used for adjective-nouns

**Other Patterns You'll Encounter:**

- קֹ֫טֵל (participle-nouns): כֹּהֵן (priest), שֹׁפֵט (judge)
- קְטֹל (infinitive construct): Often used as verbal nouns
- מִקְטָל (with מ prefix): מִשְׁפָּט (judgment), מִזְבֵּחַ (altar)

**Practical Benefit:**
When you see a new Hebrew word, recognizing its pattern tells you:
1. What part of speech it likely is
2. How it will form plurals
3. How it will behave in construct state
4. What semantic field it might belong to

This is one of the superpowers of learning Biblical Hebrew systematically!`
      }
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-7-noun-patterns', 3, 'concept', ${JSON.stringify(otherPatternsContent)}, 3)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 3 created\n');

    // Step 4: Scripture Reading - Genesis 1:11-19
    console.log('📝 Creating Step 4: Scripture Reading...');
    const scriptureContent = {
      reference: 'Genesis 1:11-13, 16-19',
      hebrewText: 'וַיֹּאמֶר אֱלֹהִים תַּדְשֵׁא הָאָרֶץ דֶּשֶׁא עֵשֶׂב מַזְרִיעַ זֶרַע עֵץ פְּרִי עֹשֶׂה פְּרִי לְמִינוֹ אֲשֶׁר זַרְעוֹ־בוֹ עַל־הָאָרֶץ וַיְהִי־כֵן... וַיַּעַשׂ אֱלֹהִים אֶת־שְׁנֵי הַמְּאֹרֹת הַגְּדֹלִים אֶת־הַמָּאוֹר הַגָּדֹל לְמֶמְשֶׁלֶת הַיּוֹם וְאֶת־הַמָּאוֹר הַקָּטֹן לְמֶמְשֶׁלֶת הַלַּיְלָה וְאֵת הַכּוֹכָבִים',
      englishTranslation: 'And God said, "Let the earth sprout vegetation: seed-bearing plants and fruit trees bearing fruit according to their kinds, with seed in them, on the earth." And it was so... And God made the two great lights — the greater light to rule the day and the lesser light to rule the night — and the stars.',
      highlights: [
        {
          wordIndex: 5,
          color: 'green',
          concept: 'דֶּשֶׁא — "vegetation" — a segholate noun! (Pattern 1: segol-segol)'
        },
        {
          wordIndex: 8,
          color: 'green',
          concept: 'זֶרַע — "seed" — another segholate! (Pattern 1, with final resh-ayin)'
        },
        {
          wordIndex: 17,
          color: 'blue',
          concept: 'הַגָּדֹל / הַקָּטֹן — adjective agreement with definite article (from Week 6!)'
        },
        {
          wordIndex: 22,
          color: 'purple',
          concept: 'הַכּוֹכָבִים — "the stars" — notice the sun and moon are NOT named directly (theological significance!)'
        }
      ],
      comprehensionPrompt: 'Notice the segholate nouns in these verses: דֶּשֶׁא (vegetation) and זֶרַע (seed) both follow Pattern 1. Also note how Day 4 avoids naming the sun (שֶׁמֶשׁ) and moon (יָרֵחַ) — calling them "the greater light" and "the lesser light" instead. This is likely polemical against ancient Near Eastern sun/moon worship.'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-7-noun-patterns', 4, 'scripture', ${JSON.stringify(scriptureContent)}, 4)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 4 created\n');

    // Step 5: Vocabulary Practice
    console.log('📝 Creating Step 5: Vocabulary Practice...');
    const vocabularyContent = {
      vocabularySetId: 'week-7-segholates',
      wordIds: [],
      contextVerse: 'וַיֹּאמֶר אֱלֹהִים תַּדְשֵׁא הָאָרֶץ דֶּשֶׁא עֵשֶׂב מַזְרִיעַ זֶרַע',
      instructions: 'Practice the 20 segholate nouns. For each word, identify which pattern it follows (Pattern 1: segol-segol, Pattern 2: tsere-segol, or Pattern 3: holem-segol). Pay attention to the accent on the FIRST syllable.'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-7-noun-patterns', 5, 'vocabulary', ${JSON.stringify(vocabularyContent)}, 5)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 5 created\n');

    // Step 6: Quiz
    console.log('❓ Creating quiz questions...');
    const quizQuestions = [
      {
        questionText: 'What defines a segholate noun?',
        questionType: 'multiple_choice',
        correctAnswer: 'Two syllables with accent on the FIRST syllable and an e-type vowel pattern',
        options: [
          'Any noun with a segol vowel',
          'Two syllables with accent on the FIRST syllable and an e-type vowel pattern',
          'A noun that is always masculine',
          'Any noun that ends in a consonant cluster'
        ],
        explanation: 'Segholate nouns have two syllables, stress on the FIRST syllable (unusual for Hebrew!), and typically have segol (ֶ) as the second vowel. They originally were monosyllabic — a helping vowel was added to break up the final consonant cluster.',
        orderIndex: 1
      },
      {
        questionText: 'Which pattern does מֶ֫לֶךְ (king) follow?',
        questionType: 'multiple_choice',
        correctAnswer: 'Pattern 1: segol-segol (ֶ_ֶ_)',
        options: [
          'Pattern 1: segol-segol (ֶ_ֶ_)',
          'Pattern 2: tsere-segol (ֵ_ֶ_)',
          'Pattern 3: holem-segol (ֹ_ֶ_)',
          'קָטוֹל pattern'
        ],
        explanation: 'מֶלֶךְ has two segol vowels (ֶ + ֶ), making it Pattern 1. The original form was *malk* with an "a" vowel. The plural מְלָכִים shows this original "a" vowel returning.',
        orderIndex: 2
      },
      {
        questionText: 'Which of these segholate nouns is FEMININE (an exception to the usual masculine pattern)?',
        questionType: 'multiple_choice',
        correctAnswer: 'נֶ֫פֶשׁ (soul)',
        options: [
          'מֶ֫לֶךְ (king)',
          'סֵ֫פֶר (book)',
          'נֶ֫פֶשׁ (soul)',
          'יֶ֫לֶד (child)'
        ],
        explanation: 'נֶפֶשׁ (soul, life, person) is a segholate that LOOKS masculine but is actually feminine. אֶרֶץ (land) is another important feminine exception. These must be memorized!',
        orderIndex: 3
      },
      {
        questionText: 'What pattern does שָׁלוֹם (peace) follow?',
        questionType: 'multiple_choice',
        correctAnswer: 'קָטוֹל (qatol) — qamets + holem',
        options: [
          'Segholate Pattern 1',
          'Segholate Pattern 3',
          'קָטוֹל (qatol) — qamets + holem',
          'קָטָל (qatal) — two qamets'
        ],
        explanation: 'שָׁלוֹם follows the קָטוֹל (qatol) pattern: first vowel is qamets (ָ) and second vowel is holem (וֹ). This pattern often indicates nouns of state or quality. Other examples: כָּבוֹד (glory), מָקוֹם (place).',
        orderIndex: 4
      },
      {
        questionText: 'Why does Genesis 1:16 call the sun "the greater light" (הַמָּאוֹר הַגָּדֹל) instead of using the word שֶׁמֶשׁ?',
        questionType: 'multiple_choice',
        correctAnswer: 'To avoid naming sun/moon, which were worshiped as deities in the ancient Near East',
        options: [
          'Because the word שֶׁמֶשׁ hadn\'t been invented yet',
          'To avoid naming sun/moon, which were worshiped as deities in the ancient Near East',
          'Because Hebrew has no word for sun',
          'Because the text is describing a different object, not the sun'
        ],
        explanation: 'The text deliberately avoids שֶׁמֶשׁ (sun) and יָרֵחַ (moon), calling them "the greater light" and "the lesser light" instead. This is likely polemical — against ancient Near Eastern worship of sun and moon as deities. In Genesis, they\'re just lights that serve God\'s purposes.',
        orderIndex: 5
      }
    ];

    for (const q of quizQuestions) {
      await sql`
        INSERT INTO quiz_questions (lesson_id, question_text, question_type, correct_answer, options, explanation, order_index)
        VALUES (
          'hebrew-week-7-noun-patterns',
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
      celebrationMessage: 'You can now recognize noun patterns at a glance! Segholates, qatol, qatal — you\'ve just unlocked the ability to predict how hundreds of Hebrew nouns behave.',
      xpAwarded: 175,
      achievements: ['Week 7 Complete', 'Pattern Master', 'Segholate Expert'],
      nextLessonId: 'hebrew-week-8',
      reviewPrompt: 'Practice identifying noun patterns in Genesis 1:11-19. For each noun, ask: Is it a segholate? Which pattern? Can I predict its plural form?',
      referenceLinks: [
        {
          title: 'Segholate Noun Reference',
          url: '/hebrew/reference/segholates'
        },
        {
          title: 'Complete Noun Pattern Guide',
          url: '/hebrew/reference/noun-patterns'
        }
      ]
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-7-noun-patterns', 6, 'completion', ${JSON.stringify(completionContent)}, 6)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 7 created\n');

    // Verify all steps
    const steps = await sql`
      SELECT step_number, step_type FROM lesson_steps
      WHERE lesson_id = 'hebrew-week-7-noun-patterns'
      ORDER BY step_number
    `;
    console.log('🎉 Week 7 interactive lesson seeded successfully!\n');
    console.log('Lesson structure:');
    for (const step of steps) {
      console.log(`  ${step.step_number}. ${step.step_type}`);
    }
    console.log(`\nTotal steps: ${steps.length}`);
    console.log('\nQuiz: 5 questions on noun patterns and Genesis reading');

  } catch (error) {
    console.error('❌ Error seeding Week 7 lesson:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

seedWeek7Lesson()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
