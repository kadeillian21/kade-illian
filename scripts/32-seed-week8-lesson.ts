/**
 * Seed Week 8 Lesson: Qal Perfect (Sessions 61-74)
 *
 * Creates the lesson record and interactive steps for Hebrew Week 8:
 * - Hebrew verb system overview (roots, stems, forms)
 * - Qal Perfect conjugation (all persons)
 * - 30 most common Qal Perfect verbs
 * - Reading Genesis 2:1-7 (Sabbath + Creation of Man)
 *
 * Also creates a vocabulary set with 30 common Qal Perfect verbs
 * and updates Week 7 completion step to point to this lesson.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedWeek8Lesson() {
  console.log('🚀 Seeding Week 8 lesson: Qal Perfect (Sessions 61-74)...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // ========================================
    // PART 1: Create the Vocabulary Set
    // ========================================
    console.log('📚 Creating Week 8 vocabulary set (30 Qal Perfect verbs)...');

    const vocabSetId = 'week-8-qal-perfect-verbs';
    const vocabWords = [
      // Group 1: Creation & Making Verbs (5 words)
      {
        id: `${vocabSetId}-bara`,
        hebrew: 'בָּרָא',
        trans: 'bara',
        english: 'he created',
        type: 'Verb',
        notes: 'Root: ב-ר-א. Used exclusively with God as subject. Qal Perfect 3ms.',
        semanticGroup: 'Creation & Making',
        frequency: 48,
        category: 'Verbs',
        subcategory: 'Creation & Making',
        pronunciation: 'bah-RAH'
      },
      {
        id: `${vocabSetId}-asah`,
        hebrew: 'עָשָׂה',
        trans: 'asah',
        english: 'he made, he did',
        type: 'Verb',
        notes: 'Root: ע-שׂ-ה. III-ה verb (weak ending). Most common action verb. Qal Perfect 3ms.',
        semanticGroup: 'Creation & Making',
        frequency: 2632,
        category: 'Verbs',
        subcategory: 'Creation & Making',
        pronunciation: 'ah-SAH'
      },
      {
        id: `${vocabSetId}-natan`,
        hebrew: 'נָתַן',
        trans: 'natan',
        english: 'he gave, he set, he placed',
        type: 'Verb',
        notes: 'Root: נ-ת-ן. I-נ verb (weak first letter). Very common. Qal Perfect 3ms.',
        semanticGroup: 'Creation & Making',
        frequency: 2014,
        category: 'Verbs',
        subcategory: 'Creation & Making',
        pronunciation: 'nah-TAHN'
      },
      {
        id: `${vocabSetId}-banah`,
        hebrew: 'בָּנָה',
        trans: 'banah',
        english: 'he built',
        type: 'Verb',
        notes: 'Root: ב-נ-ה. III-ה verb. Used for building structures, cities, altars. Qal Perfect 3ms.',
        semanticGroup: 'Creation & Making',
        frequency: 376,
        category: 'Verbs',
        subcategory: 'Creation & Making',
        pronunciation: 'bah-NAH'
      },
      {
        id: `${vocabSetId}-yatsar`,
        hebrew: 'יָצַר',
        trans: 'yatsar',
        english: 'he formed, he fashioned',
        type: 'Verb',
        notes: 'Root: י-צ-ר. Used for God forming man from dust (Gen 2:7). Qal Perfect 3ms.',
        semanticGroup: 'Creation & Making',
        frequency: 63,
        category: 'Verbs',
        subcategory: 'Creation & Making',
        pronunciation: 'yah-TSAHR'
      },

      // Group 2: Speech & Communication Verbs (5 words)
      {
        id: `${vocabSetId}-amar`,
        hebrew: 'אָמַר',
        trans: 'amar',
        english: 'he said',
        type: 'Verb',
        notes: 'Root: א-מ-ר. Most frequent verb in the Hebrew Bible (5,316x!). Qal Perfect 3ms.',
        semanticGroup: 'Speech & Communication',
        frequency: 5316,
        category: 'Verbs',
        subcategory: 'Speech & Communication',
        pronunciation: 'ah-MAHR'
      },
      {
        id: `${vocabSetId}-dibber`,
        hebrew: 'דִּבֶּר',
        trans: 'dibber',
        english: 'he spoke',
        type: 'Verb',
        notes: 'Root: ד-ב-ר. Usually Piel stem (intensive speaking), but learn the root here. Qal Perfect 3ms form: דָּבַר.',
        semanticGroup: 'Speech & Communication',
        frequency: 1136,
        category: 'Verbs',
        subcategory: 'Speech & Communication',
        pronunciation: 'dah-VAHR'
      },
      {
        id: `${vocabSetId}-qara`,
        hebrew: 'קָרָא',
        trans: 'qara',
        english: 'he called, he read, he proclaimed',
        type: 'Verb',
        notes: 'Root: ק-ר-א. III-א verb. Used for naming (Gen 1) and for calling out. Qal Perfect 3ms.',
        semanticGroup: 'Speech & Communication',
        frequency: 739,
        category: 'Verbs',
        subcategory: 'Speech & Communication',
        pronunciation: 'kah-RAH'
      },
      {
        id: `${vocabSetId}-tsivvah`,
        hebrew: 'צִוָּה',
        trans: 'tsivvah',
        english: 'he commanded',
        type: 'Verb',
        notes: 'Root: צ-ו-ה. Usually Piel stem. Key verb for divine commands. Qal Perfect 3ms.',
        semanticGroup: 'Speech & Communication',
        frequency: 496,
        category: 'Verbs',
        subcategory: 'Speech & Communication',
        pronunciation: 'tsee-VAH'
      },
      {
        id: `${vocabSetId}-shama`,
        hebrew: 'שָׁמַע',
        trans: 'shama',
        english: 'he heard, he listened, he obeyed',
        type: 'Verb',
        notes: 'Root: שׁ-מ-ע. Can mean "hear" or "obey" depending on context. The Shema! Qal Perfect 3ms.',
        semanticGroup: 'Speech & Communication',
        frequency: 1165,
        category: 'Verbs',
        subcategory: 'Speech & Communication',
        pronunciation: 'shah-MAH'
      },

      // Group 3: Movement & Motion Verbs (5 words)
      {
        id: `${vocabSetId}-halakh`,
        hebrew: 'הָלַךְ',
        trans: 'halakh',
        english: 'he walked, he went',
        type: 'Verb',
        notes: 'Root: ה-ל-ך. Source of "halakha" (Jewish law = "the way to walk"). Qal Perfect 3ms.',
        semanticGroup: 'Movement & Motion',
        frequency: 1554,
        category: 'Verbs',
        subcategory: 'Movement & Motion',
        pronunciation: 'hah-LAKH'
      },
      {
        id: `${vocabSetId}-bo`,
        hebrew: 'בָּא',
        trans: 'bo',
        english: 'he came, he entered',
        type: 'Verb',
        notes: 'Root: ב-ו-א. II-ו verb (hollow verb). Opposite of יָצָא. Qal Perfect 3ms.',
        semanticGroup: 'Movement & Motion',
        frequency: 2592,
        category: 'Verbs',
        subcategory: 'Movement & Motion',
        pronunciation: 'BAH'
      },
      {
        id: `${vocabSetId}-yatsa`,
        hebrew: 'יָצָא',
        trans: 'yatsa',
        english: 'he went out, he came out',
        type: 'Verb',
        notes: 'Root: י-צ-א. I-י verb. Opposite of בָּא. Qal Perfect 3ms.',
        semanticGroup: 'Movement & Motion',
        frequency: 1076,
        category: 'Verbs',
        subcategory: 'Movement & Motion',
        pronunciation: 'yah-TSAH'
      },
      {
        id: `${vocabSetId}-shuv`,
        hebrew: 'שָׁב',
        trans: 'shuv',
        english: 'he returned, he repented',
        type: 'Verb',
        notes: 'Root: שׁ-ו-ב. II-ו verb. Theological: "repentance" = turning back to God. Qal Perfect 3ms.',
        semanticGroup: 'Movement & Motion',
        frequency: 1075,
        category: 'Verbs',
        subcategory: 'Movement & Motion',
        pronunciation: 'SHAHV'
      },
      {
        id: `${vocabSetId}-alah`,
        hebrew: 'עָלָה',
        trans: 'alah',
        english: 'he went up, he ascended',
        type: 'Verb',
        notes: 'Root: ע-ל-ה. III-ה verb. Used for going up to Jerusalem, offerings ascending. Qal Perfect 3ms.',
        semanticGroup: 'Movement & Motion',
        frequency: 894,
        category: 'Verbs',
        subcategory: 'Movement & Motion',
        pronunciation: 'ah-LAH'
      },

      // Group 4: Perception & Knowledge Verbs (5 words)
      {
        id: `${vocabSetId}-raah`,
        hebrew: 'רָאָה',
        trans: 'raah',
        english: 'he saw',
        type: 'Verb',
        notes: 'Root: ר-א-ה. III-ה verb. "And God saw that it was good" (Gen 1). Qal Perfect 3ms.',
        semanticGroup: 'Perception & Knowledge',
        frequency: 1311,
        category: 'Verbs',
        subcategory: 'Perception & Knowledge',
        pronunciation: 'rah-AH'
      },
      {
        id: `${vocabSetId}-yada`,
        hebrew: 'יָדַע',
        trans: 'yada',
        english: 'he knew',
        type: 'Verb',
        notes: 'Root: י-ד-ע. I-י verb. Means experiential knowledge, not just intellectual. Qal Perfect 3ms.',
        semanticGroup: 'Perception & Knowledge',
        frequency: 956,
        category: 'Verbs',
        subcategory: 'Perception & Knowledge',
        pronunciation: 'yah-DAH'
      },
      {
        id: `${vocabSetId}-matsa`,
        hebrew: 'מָצָא',
        trans: 'matsa',
        english: 'he found',
        type: 'Verb',
        notes: 'Root: מ-צ-א. III-א verb. Often used with "favor in the eyes of." Qal Perfect 3ms.',
        semanticGroup: 'Perception & Knowledge',
        frequency: 457,
        category: 'Verbs',
        subcategory: 'Perception & Knowledge',
        pronunciation: 'mah-TSAH'
      },
      {
        id: `${vocabSetId}-zakhar`,
        hebrew: 'זָכַר',
        trans: 'zakhar',
        english: 'he remembered',
        type: 'Verb',
        notes: 'Root: ז-כ-ר. When God "remembers," He acts! (Gen 8:1, Ex 2:24). Qal Perfect 3ms.',
        semanticGroup: 'Perception & Knowledge',
        frequency: 233,
        category: 'Verbs',
        subcategory: 'Perception & Knowledge',
        pronunciation: 'zah-KHAHR'
      },
      {
        id: `${vocabSetId}-lamad`,
        hebrew: 'לָמַד',
        trans: 'lamad',
        english: 'he learned',
        type: 'Verb',
        notes: 'Root: ל-מ-ד. Source of "Talmud" (learning). Qal Perfect 3ms.',
        semanticGroup: 'Perception & Knowledge',
        frequency: 87,
        category: 'Verbs',
        subcategory: 'Perception & Knowledge',
        pronunciation: 'lah-MAHD'
      },

      // Group 5: State & Being Verbs (5 words)
      {
        id: `${vocabSetId}-hayah`,
        hebrew: 'הָיָה',
        trans: 'hayah',
        english: 'he was, he became, it happened',
        type: 'Verb',
        notes: 'Root: ה-י-ה. III-ה verb. Most fundamental Hebrew verb. Related to God\'s name YHWH. Qal Perfect 3ms.',
        semanticGroup: 'State & Being',
        frequency: 3576,
        category: 'Verbs',
        subcategory: 'State & Being',
        pronunciation: 'hah-YAH'
      },
      {
        id: `${vocabSetId}-met`,
        hebrew: 'מֵת',
        trans: 'met',
        english: 'he died',
        type: 'Verb',
        notes: 'Root: מ-ו-ת. II-ו verb. Contracted form. Opposite of חָיָה (he lived). Qal Perfect 3ms.',
        semanticGroup: 'State & Being',
        frequency: 854,
        category: 'Verbs',
        subcategory: 'State & Being',
        pronunciation: 'MEHT'
      },
      {
        id: `${vocabSetId}-yashav`,
        hebrew: 'יָשַׁב',
        trans: 'yashav',
        english: 'he sat, he dwelt, he inhabited',
        type: 'Verb',
        notes: 'Root: י-שׁ-ב. I-י verb. "Sitting" often means "dwelling" in Hebrew. Qal Perfect 3ms.',
        semanticGroup: 'State & Being',
        frequency: 1088,
        category: 'Verbs',
        subcategory: 'State & Being',
        pronunciation: 'yah-SHAHV'
      },
      {
        id: `${vocabSetId}-gadal`,
        hebrew: 'גָּדַל',
        trans: 'gadal',
        english: 'he was great, he grew up',
        type: 'Verb',
        notes: 'Root: ג-ד-ל. Related to גָּדוֹל (great/big). Qal Perfect 3ms.',
        semanticGroup: 'State & Being',
        frequency: 117,
        category: 'Verbs',
        subcategory: 'State & Being',
        pronunciation: 'gah-DAHL'
      },
      {
        id: `${vocabSetId}-malakh`,
        hebrew: 'מָלַךְ',
        trans: 'malakh',
        english: 'he reigned, he became king',
        type: 'Verb',
        notes: 'Root: מ-ל-ך. Same root as מֶלֶךְ (king) from Week 7! Qal Perfect 3ms.',
        semanticGroup: 'State & Being',
        frequency: 350,
        category: 'Verbs',
        subcategory: 'State & Being',
        pronunciation: 'mah-LAKH'
      },

      // Group 6: Action & Doing Verbs (5 words)
      {
        id: `${vocabSetId}-laqach`,
        hebrew: 'לָקַח',
        trans: 'laqach',
        english: 'he took',
        type: 'Verb',
        notes: 'Root: ל-ק-ח. Very common. Used in Gen 2:7 "God took the man." Qal Perfect 3ms.',
        semanticGroup: 'Action & Doing',
        frequency: 967,
        category: 'Verbs',
        subcategory: 'Action & Doing',
        pronunciation: 'lah-KAHKH'
      },
      {
        id: `${vocabSetId}-katav`,
        hebrew: 'כָּתַב',
        trans: 'katav',
        english: 'he wrote',
        type: 'Verb',
        notes: 'Root: כ-ת-ב. A "regular" strong verb — perfect paradigm example. Qal Perfect 3ms.',
        semanticGroup: 'Action & Doing',
        frequency: 225,
        category: 'Verbs',
        subcategory: 'Action & Doing',
        pronunciation: 'kah-TAHV'
      },
      {
        id: `${vocabSetId}-akhal`,
        hebrew: 'אָכַל',
        trans: 'akhal',
        english: 'he ate',
        type: 'Verb',
        notes: 'Root: א-כ-ל. I-א verb (guttural). Key verb in Eden narrative (Gen 2-3). Qal Perfect 3ms.',
        semanticGroup: 'Action & Doing',
        frequency: 820,
        category: 'Verbs',
        subcategory: 'Action & Doing',
        pronunciation: 'ah-KHAHL'
      },
      {
        id: `${vocabSetId}-shamar`,
        hebrew: 'שָׁמַר',
        trans: 'shamar',
        english: 'he kept, he guarded, he watched',
        type: 'Verb',
        notes: 'Root: שׁ-מ-ר. Used in Gen 2:15 "to tend and keep" the garden. Qal Perfect 3ms.',
        semanticGroup: 'Action & Doing',
        frequency: 469,
        category: 'Verbs',
        subcategory: 'Action & Doing',
        pronunciation: 'shah-MAHR'
      },
      {
        id: `${vocabSetId}-kalah`,
        hebrew: 'כָּלָה',
        trans: 'kalah',
        english: 'he finished, he completed',
        type: 'Verb',
        notes: 'Root: כ-ל-ה. III-ה verb. Used in Gen 2:1 "the heavens and earth were completed." Qal Perfect 3ms.',
        semanticGroup: 'Action & Doing',
        frequency: 207,
        category: 'Verbs',
        subcategory: 'Action & Doing',
        pronunciation: 'kah-LAH'
      }
    ];

    // Insert the vocab set
    await sql`
      INSERT INTO vocab_sets (id, title, description, language_id)
      VALUES (
        ${vocabSetId},
        'Week 8: Qal Perfect Verbs',
        '30 most common verbs in Qal Perfect form — the foundation of Hebrew verb mastery',
        'hebrew'
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        updated_at = NOW()
    `;

    // Insert each word
    for (const word of vocabWords) {
      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english,
          type, notes, semantic_group, frequency,
          group_category, group_subcategory,
          card_type, extra_data
        )
        VALUES (
          ${word.id},
          ${vocabSetId},
          ${word.hebrew},
          ${word.trans},
          ${word.english},
          ${word.type},
          ${word.notes},
          ${word.semanticGroup},
          ${word.frequency},
          ${word.category},
          ${word.subcategory},
          'vocabulary',
          ${JSON.stringify({ pronunciation: word.pronunciation })}
        )
        ON CONFLICT (id) DO UPDATE SET
          hebrew = EXCLUDED.hebrew,
          transliteration = EXCLUDED.transliteration,
          english = EXCLUDED.english,
          notes = EXCLUDED.notes,
          semantic_group = EXCLUDED.semantic_group,
          frequency = EXCLUDED.frequency,
          extra_data = EXCLUDED.extra_data,
          updated_at = NOW()
      `;
    }
    console.log(`✅ Vocabulary set created with ${vocabWords.length} verbs\n`);

    // ========================================
    // PART 2: Create the Lesson Record
    // ========================================
    console.log('📖 Creating Week 8 lesson record...');
    await sql`
      INSERT INTO lessons (
        id, language_id, week_number, month_number,
        title, description, lesson_content,
        topics, vocabulary_set_ids, order_index,
        estimated_minutes, difficulty_level,
        scripture_passage_ids, requires_quiz_pass, min_quiz_score
      )
      VALUES (
        'hebrew-week-8-qal-perfect',
        'hebrew',
        8,
        3,
        'The Qal Perfect: Hebrew Verbs Begin',
        'Enter the world of Hebrew verbs! Master the Qal Perfect conjugation — your first verbal stem. Learn 30 essential verbs and read Genesis 2:1-7.',
        '',
        ARRAY['Qal Perfect', 'Hebrew Verbs', 'Binyanim', 'Verb Conjugation', 'Genesis 2:1-7', '3-Letter Roots'],
        ARRAY['week-8-qal-perfect-verbs'],
        8,
        30,
        5,
        ARRAY['genesis-2-1-3', 'genesis-2-4-7'],
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
    console.log('✅ Week 8 lesson record created\n');

    // ========================================
    // PART 3: Update Week 7 Completion
    // ========================================
    console.log('🔗 Updating Week 7 completion step to link to Week 8...');
    const week7Steps = await sql`
      SELECT id, content FROM lesson_steps
      WHERE lesson_id = 'hebrew-week-7-noun-patterns' AND step_type = 'completion'
    `;
    if (week7Steps.length > 0) {
      const content = typeof week7Steps[0].content === 'string'
        ? JSON.parse(week7Steps[0].content)
        : week7Steps[0].content;
      content.nextLessonId = 'hebrew-week-8-qal-perfect';
      await sql`
        UPDATE lesson_steps SET content = ${JSON.stringify(content)}, updated_at = NOW()
        WHERE id = ${week7Steps[0].id}
      `;
      console.log('✅ Week 7 completion now points to Week 8\n');
    } else {
      console.log('⚠️  Week 7 completion step not found, skipping link update\n');
    }

    // ========================================
    // PART 4: Create Interactive Steps
    // ========================================

    // --- Step 1: Objective ---
    console.log('📝 Creating Step 1: Objective...');
    const objectiveContent = {
      title: 'The Qal Perfect: Hebrew Verbs Begin',
      objectives: [
        'Understand how Hebrew verbs work: 3-letter roots, 7 stems (binyanim), and multiple forms',
        'Master the Qal Perfect conjugation for all persons (3ms, 3fs, 3cp, 2ms, 2fs, 2mp, 2fp, 1cs, 1cp)',
        'Learn 30 of the most common Hebrew verbs in Qal Perfect',
        'Recognize Qal Perfect forms in biblical text',
        'Read Genesis 2:1-7 (The Sabbath and the Creation of Man)'
      ],
      estimatedMinutes: 30,
      verseReference: 'Genesis 2:1-7'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-8-qal-perfect', 1, 'objective', ${JSON.stringify(objectiveContent)}, 1)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 1 created\n');

    // --- Step 2: Concept - The Hebrew Verb System ---
    console.log('📝 Creating Step 2: Concept (Hebrew Verb System Overview)...');
    const verbSystemContent = {
      conceptName: 'The Hebrew Verb System: Roots, Stems & Forms',
      summary: `This is a LANDMARK moment in your Hebrew journey. Until now, you've learned nouns, adjectives, prepositions, and the article. Now you enter the verb system — the engine that drives every Hebrew sentence. Hebrew verbs are built on a brilliant system: every verb has a 3-letter ROOT that carries the core meaning, a STEM (binyan) that modifies that meaning, and a FORM that tells you who did it and when.`,
      visualAid: {
        type: 'table',
        data: {
          headers: ['Component', 'What It Does', 'Example with כ-ת-ב'],
          rows: [
            ['Root (שֹׁרֶשׁ)', 'Core meaning (3 consonants)', 'כ-ת-ב = "writing"'],
            ['Stem (בִּנְיָן)', 'Modifies meaning (7 stems)', 'Qal = simple active: "he wrote"'],
            ['Form (צוּרָה)', 'Person, gender, number, time', 'Perfect = completed action'],
            ['', '', 'כָּתַב = "he wrote" (Qal Perfect 3ms)'],
            ['', '', 'כָּתְבָה = "she wrote" (Qal Perfect 3fs)'],
            ['', '', 'כָּתַבְתָּ = "you (m) wrote" (Qal Perfect 2ms)']
          ]
        }
      },
      examples: [
        {
          hebrew: 'כ-ת-ב → כָּתַב / נִכְתַּב / הִכְתִּיב',
          translation: 'write root → he wrote / it was written / he dictated',
          explanation: 'Same root כ-ת-ב but different STEMS change the meaning: Qal (simple active) = "he wrote," Niphal (passive) = "it was written," Hiphil (causative) = "he caused to write" (dictated). You\'ll learn Qal first — the simplest and most common stem.'
        },
        {
          hebrew: 'שׁ-מ-ר → שָׁמַר / נִשְׁמַר / הִשְׁתַּמֵּר',
          translation: 'guard root → he guarded / he was guarded / he guarded himself',
          explanation: 'Root שׁ-מ-ר in different stems: Qal = "he guarded," Niphal = "he was guarded," Hitpael = "he guarded himself." The root always carries the core idea of "guarding/keeping."'
        },
        {
          hebrew: 'מָלַךְ ← מֶלֶךְ ← מַלְכָּה ← מַמְלָכָה',
          translation: 'he reigned ← king ← queen ← kingdom',
          explanation: 'You learned מֶלֶךְ (king) in Week 7 as a segholate noun. Now meet the VERB from the same root: מָלַךְ (he reigned). Seeing the connection between nouns and verbs from the same root is a Hebrew superpower!'
        }
      ],
      expandableTheory: {
        title: 'Deep Dive: The 7 Stems (Binyanim)',
        content: `**The Seven Stems of Hebrew**

You'll learn these one at a time over the coming weeks. For now, just know they exist:

| # | Stem | Pattern | Meaning | Example (שׁ-מ-ר) |
|---|------|---------|---------|-------------------|
| 1 | **Qal** | Simple Active | Basic meaning | שָׁמַר "he guarded" |
| 2 | **Niphal** | Simple Passive / Reflexive | Was done / did to self | נִשְׁמַר "he was guarded" |
| 3 | **Piel** | Intensive Active | Intensified meaning | שִׁמֵּר "he guarded carefully" |
| 4 | **Pual** | Intensive Passive | Was intensively done | שֻׁמַּר "he was carefully guarded" |
| 5 | **Hiphil** | Causative Active | Caused to do | הִשְׁמִיר "he caused to guard" |
| 6 | **Hophal** | Causative Passive | Was caused to do | הָשְׁמַר "he was made to guard" |
| 7 | **Hitpael** | Reflexive/Reciprocal | Did to self/each other | הִשְׁתַּמֵּר "he guarded himself" |

**Why Start with Qal?**
- Qal is the most common stem (~70% of all verb forms!)
- It has the simplest, most basic meaning
- It's the foundation — once you know Qal, the other stems build on it
- The name "Qal" (קַל) literally means "light" or "simple"

**Why Start with Perfect?**
- Perfect is the most recognizable form
- It uses SUFFIXES (added to the end) — easier to spot than prefixes
- It represents completed action: "he wrote," "she saw," "they heard"
- Later you'll learn Imperfect (incomplete action) which uses prefixes

**The Forms You'll Learn:**
1. **Perfect** (completed action) ← THIS WEEK
2. Imperfect (incomplete/ongoing action)
3. Imperative (commands)
4. Infinitive (verbal nouns)
5. Participle (verbal adjectives)
6. Cohortative/Jussive (wishes/commands)
7. Waw-consecutive (narrative sequence)

Don't worry about memorizing all 7 stems and forms now. Just know that the Qal Perfect you're learning this week is the FIRST BUILDING BLOCK of a magnificent system!`
      }
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-8-qal-perfect', 2, 'concept', ${JSON.stringify(verbSystemContent)}, 2)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 2 created\n');

    // --- Step 3: Concept - Qal Perfect Conjugation ---
    console.log('📝 Creating Step 3: Concept (Qal Perfect Conjugation)...');
    const qalPerfectContent = {
      conceptName: 'Qal Perfect Conjugation: The Complete Paradigm',
      summary: `The Qal Perfect tells you a completed action: "he wrote," "she heard," "they went." It's built by adding SUFFIXES to the verb root. The paradigm verb is קָטַל (he killed) — grammarians use this because its three strong consonants (no gutturals, no weak letters) show the pattern most clearly. Once you memorize these 9 endings, you can conjugate ANY regular verb in Qal Perfect!`,
      visualAid: {
        type: 'table',
        data: {
          headers: ['Person', 'Suffix', 'קָטַל Paradigm', 'כָּתַב Example', 'Translation'],
          rows: [
            ['3ms (he)', '—  (none)', 'קָטַל', 'כָּתַב', 'he wrote'],
            ['3fs (she)', 'ָה', 'קָטְלָה', 'כָּתְבָה', 'she wrote'],
            ['3cp (they)', 'וּ', 'קָטְלוּ', 'כָּתְבוּ', 'they wrote'],
            ['2ms (you m.)', 'תָּ', 'קָטַלְתָּ', 'כָּתַבְתָּ', 'you (m) wrote'],
            ['2fs (you f.)', 'תְּ', 'קָטַלְתְּ', 'כָּתַבְתְּ', 'you (f) wrote'],
            ['2mp (you m. pl.)', 'תֶּם', 'קְטַלְתֶּם', 'כְּתַבְתֶּם', 'you (m. pl.) wrote'],
            ['2fp (you f. pl.)', 'תֶּן', 'קְטַלְתֶּן', 'כְּתַבְתֶּן', 'you (f. pl.) wrote'],
            ['1cs (I)', 'תִּי', 'קָטַלְתִּי', 'כָּתַבְתִּי', 'I wrote'],
            ['1cp (we)', 'נוּ', 'קָטַלְנוּ', 'כָּתַבְנוּ', 'we wrote']
          ]
        }
      },
      examples: [
        {
          hebrew: 'שָׁמַר → שָׁמְרָה → שָׁמְרוּ',
          translation: 'he guarded → she guarded → they guarded',
          explanation: '3rd person forms: The 3ms has NO suffix (base form). The 3fs adds ָה. The 3cp adds וּ. Notice the first vowel shortens when suffixes are added (שָׁמַר → שָׁמְרָה). This vowel reduction is normal — the stress shifts to the suffix.'
        },
        {
          hebrew: 'שָׁמַרְתָּ → שָׁמַרְתְּ → שְׁמַרְתֶּם → שְׁמַרְתֶּן',
          translation: 'you (m.s.) guarded → you (f.s.) guarded → you (m.pl.) guarded → you (f.pl.) guarded',
          explanation: '2nd person forms: All start with תּ but have different endings. The 2ms תָּ and 2fs תְּ are almost identical — only the final vowel differs! In the plural forms (תֶּם/תֶּן), the first syllable vowel reduces (שָׁמַר → שְׁמַר).'
        },
        {
          hebrew: 'שָׁמַרְתִּי → שָׁמַרְנוּ',
          translation: 'I guarded → we guarded',
          explanation: '1st person forms: 1cs adds תִּי (I), 1cp adds נוּ (we). The 1cs ending תִּי is distinctive and easy to spot in text. When you see a verb ending in תִּי, you know someone is saying "I did X."'
        },
        {
          hebrew: 'בָּרָא אֱלֹהִים (Gen 1:1)',
          translation: 'God created',
          explanation: 'You already know this! בָּרָא is Qal Perfect 3ms of the root ב-ר-א. It\'s the very first verb in the Bible! Now you understand exactly what that form means grammatically: Qal stem (simple active) + Perfect (completed action) + 3ms (he).'
        }
      ],
      expandableTheory: {
        title: 'Deep Dive: Memorization Strategy & Weak Verbs',
        content: `**How to Memorize the Qal Perfect Paradigm**

**The "Chunking" Strategy (3 days):**

**Day 1 — Third Person (the observers):**
- 3ms: קָטַל (he killed) — NO suffix, this is your base
- 3fs: קָטְלָה (she killed) — add ָה
- 3cp: קָטְלוּ (they killed) — add וּ
- Memory: He (base), She (+ah), They (+u)

**Day 2 — Second Person (talking to someone):**
- 2ms: קָטַלְתָּ (you killed, m.s.) — add תָּ
- 2fs: קָטַלְתְּ (you killed, f.s.) — add תְּ
- 2mp: קְטַלְתֶּם (you killed, m.pl.) — add תֶּם
- 2fp: קְטַלְתֶּן (you killed, f.pl.) — add תֶּן
- Memory: All start with ת. Singular has short endings, plural has long endings.

**Day 3 — First Person (talking about yourself):**
- 1cs: קָטַלְתִּי (I killed) — add תִּי
- 1cp: קָטַלְנוּ (we killed) — add נוּ
- Memory: I (+ti), We (+nu)

**Key Patterns to Notice:**
1. All 2nd person and 1cs forms start with תּ (except 1cp which uses נ)
2. The vowel under the FIRST root letter reduces in 2mp/2fp: קָטַל → קְטַל
3. The 3ms is your anchor — it's the dictionary form

**What About Weak Verbs?**

Some of your 30 verbs have "weak" letters that cause changes:

- **III-ה verbs** (עָשָׂה, רָאָה, הָיָה, בָּנָה): The final ה drops before suffixes
  - עָשָׂה → עָשְׂתָה (she made), not *עָשָׂהָה
  - הָיָה → הָיְתָה (she was)

- **II-ו/י verbs** (בָּא, שָׁב, מֵת): The middle letter contracts
  - These are "hollow" verbs — the middle drops out in some forms
  - בָּא → בָּאָה (she came), בָּאוּ (they came)

- **I-י verbs** (יָדַע, יָצָא, יָשַׁב): The initial yod can shift
  - These are mostly regular in Qal Perfect
  - יָדַע → יָדְעָה (she knew), יְדַעְתֶּם (you pl. knew)

- **I-נ verbs** (נָתַן): The initial nun can assimilate
  - נָתַן → נָתְנָה (she gave), but forms are mostly regular in Perfect

**Don't Panic!**
You don't need to memorize all weak verb patterns now. Focus on the REGULAR paradigm (קָטַל). As you encounter weak verbs, you'll start to see the patterns naturally. The regular paradigm gives you the framework — weak verbs are just variations on the theme.

**The Big Picture:**
With these 9 suffixes, you can now identify WHO performed ANY completed action in the Hebrew Bible. That's a massive leap forward!`
      }
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-8-qal-perfect', 3, 'concept', ${JSON.stringify(qalPerfectContent)}, 3)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 3 created\n');

    // --- Step 4: Scripture Reading - Genesis 2:1-7 ---
    console.log('📝 Creating Step 4: Scripture Reading (Genesis 2:1-7)...');
    const scriptureContent = {
      reference: 'Genesis 2:1-3, 7',
      hebrewText: `וַיְכֻלּוּ הַשָּׁמַיִם וְהָאָרֶץ וְכָל־צְבָאָם׃ וַיְכַל אֱלֹהִים בַּיּוֹם הַשְּׁבִיעִי מְלַאכְתּוֹ אֲשֶׁר עָשָׂה וַיִּשְׁבֹּת בַּיּוֹם הַשְּׁבִיעִי מִכָּל־מְלַאכְתּוֹ אֲשֶׁר עָשָׂה׃ וַיְבָרֶךְ אֱלֹהִים אֶת־יוֹם הַשְּׁבִיעִי וַיְקַדֵּשׁ אֹתוֹ כִּי בוֹ שָׁבַת מִכָּל־מְלַאכְתּוֹ אֲשֶׁר־בָּרָא אֱלֹהִים לַעֲשׂוֹת׃ ... וַיִּיצֶר יְהוָה אֱלֹהִים אֶת־הָאָדָם עָפָר מִן־הָאֲדָמָה וַיִּפַּח בְּאַפָּיו נִשְׁמַת חַיִּים וַיְהִי הָאָדָם לְנֶפֶשׁ חַיָּה׃`,
      englishTranslation: `And the heavens and the earth were completed, and all their host. And God finished on the seventh day His work which He had made, and He rested on the seventh day from all His work which He had made. And God blessed the seventh day and sanctified it, because on it He rested from all His work which God had created to make. ... And the LORD God formed the man, dust from the ground, and He breathed into his nostrils the breath of life, and the man became a living soul.`,
      highlights: [
        {
          wordIndex: 0,
          color: 'green',
          concept: 'וַיְכֻלּוּ — from כָּלָה (to complete/finish), a Pual form. The root כ-ל-ה is in your vocab list!'
        },
        {
          wordIndex: 10,
          color: 'blue',
          concept: 'עָשָׂה — Qal Perfect 3ms! "He made/did." You know this verb! Notice it appears TWICE in these verses.'
        },
        {
          wordIndex: 14,
          color: 'purple',
          concept: 'שָׁבַת — Qal Perfect 3ms "He rested." This is the root of שַׁבָּת (Sabbath)! The verb means "to cease, to rest."'
        },
        {
          wordIndex: 22,
          color: 'green',
          concept: 'בָּרָא — Qal Perfect 3ms "He created." The very first verb of the Bible appears again here, forming a bookend with Genesis 1:1!'
        },
        {
          wordIndex: 30,
          color: 'orange',
          concept: 'וַיִּיצֶר — from יָצַר (to form/fashion). God "formed" man like a potter forms clay. A different word than בָּרָא!'
        },
        {
          wordIndex: 38,
          color: 'blue',
          concept: 'וַיְהִי — from הָיָה (to be/become). "And the man BECAME a living soul." The verb of being/becoming!'
        }
      ],
      comprehensionPrompt: 'Count the Qal Perfect verbs you can spot: עָשָׂה (he made), שָׁבַת (he rested), בָּרָא (he created). Notice how Genesis 2:1-3 forms a literary bookend with Genesis 1:1 — both use בָּרָא. Also notice the theological richness: God "formed" (יָצַר) man from dust but "breathed" (נָפַח) life into him — the combination of earthly material and divine breath.'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-8-qal-perfect', 4, 'scripture', ${JSON.stringify(scriptureContent)}, 4)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 4 created\n');

    // --- Step 5: Vocabulary Practice ---
    console.log('📝 Creating Step 5: Vocabulary Practice...');
    const vocabularyContent = {
      vocabularySetId: 'week-8-qal-perfect-verbs',
      wordIds: vocabWords.map(w => w.id),
      contextVerse: 'וַיְכַל אֱלֹהִים בַּיּוֹם הַשְּׁבִיעִי מְלַאכְתּוֹ אֲשֶׁר עָשָׂה',
      instructions: 'Practice the 30 Qal Perfect verbs organized in 6 groups of 5. For each verb, learn: (1) the Hebrew form with nikkud, (2) the 3-letter root, (3) the English meaning, and (4) any special notes about weak letters. Start with Group 1 (Creation verbs) and work through one group per day.'
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-8-qal-perfect', 5, 'vocabulary', ${JSON.stringify(vocabularyContent)}, 5)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 5 created\n');

    // --- Step 6: Quiz ---
    console.log('❓ Creating quiz questions...');
    const quizQuestions = [
      {
        questionText: 'What are the THREE components of every Hebrew verb form?',
        questionType: 'multiple_choice',
        correctAnswer: 'Root (3 consonants) + Stem (binyan) + Form (person/gender/number)',
        options: [
          'Root (3 consonants) + Stem (binyan) + Form (person/gender/number)',
          'Prefix + Root + Suffix',
          'Subject + Verb + Object',
          'Consonants + Vowels + Accent'
        ],
        explanation: 'Every Hebrew verb has a 3-letter ROOT (שֹׁרֶשׁ) carrying core meaning, a STEM (בִּנְיָן) modifying that meaning (7 possible stems), and a FORM (צוּרָה) indicating person, gender, number, and aspect (completed vs. ongoing).',
        orderIndex: 1
      },
      {
        questionText: 'What suffix marks the Qal Perfect 3fs (she)?',
        questionType: 'multiple_choice',
        correctAnswer: 'ָה (ah)',
        options: [
          'ָה (ah)',
          'וּ (u)',
          'תָּ (ta)',
          'תִּי (ti)'
        ],
        explanation: 'The 3fs suffix is ָה: קָטְלָה (she killed), כָּתְבָה (she wrote), שָׁמְרָה (she guarded). The 3ms has NO suffix — it\'s the base form.',
        orderIndex: 2
      },
      {
        questionText: 'Which form is כָּתַבְתִּי?',
        questionType: 'multiple_choice',
        correctAnswer: 'Qal Perfect 1cs — "I wrote"',
        options: [
          'Qal Perfect 1cs — "I wrote"',
          'Qal Perfect 2ms — "you wrote"',
          'Qal Perfect 3fs — "she wrote"',
          'Qal Perfect 1cp — "we wrote"'
        ],
        explanation: 'The suffix תִּי marks the 1cs (first person common singular = "I"). When you see a verb ending in תִּי, someone is saying "I did X." כָּתַב + תִּי = כָּתַבְתִּי "I wrote."',
        orderIndex: 3
      },
      {
        questionText: 'What does the verb שָׁבַת mean, and what famous word comes from this root?',
        questionType: 'multiple_choice',
        correctAnswer: '"He rested/ceased" — the root of שַׁבָּת (Sabbath)',
        options: [
          '"He rested/ceased" — the root of שַׁבָּת (Sabbath)',
          '"He returned" — the root of תְּשׁוּבָה (repentance)',
          '"He sat down" — the root of יְשִׁיבָה (sitting)',
          '"He completed" — the root of שְׁלֵמוּת (completeness)'
        ],
        explanation: 'שָׁבַת means "he ceased, he rested" — it\'s the root of שַׁבָּת (Sabbath). In Genesis 2:2-3, God שָׁבַת (rested) on the seventh day, which is why it became the שַׁבָּת.',
        orderIndex: 4
      },
      {
        questionText: 'Why does Genesis 2:7 use יָצַר (formed) instead of בָּרָא (created) for making man?',
        questionType: 'multiple_choice',
        correctAnswer: 'יָצַר implies hands-on shaping (like a potter), emphasizing the intimate, physical act of forming man from dust',
        options: [
          'They mean the same thing — it\'s just stylistic variation',
          'יָצַר implies hands-on shaping (like a potter), emphasizing the intimate, physical act of forming man from dust',
          'בָּרָא can only be used for creating the universe',
          'יָצַר is a more common verb'
        ],
        explanation: 'בָּרָא means "create" (often from nothing, used only with God as subject). יָצַר means "form/fashion" — like a potter shaping clay. Using יָצַר for man\'s creation emphasizes God\'s intimate, hands-on involvement. Man is not just spoken into existence — he is carefully shaped.',
        orderIndex: 5
      },
      {
        questionText: 'What is the Qal Perfect 3cp (they) suffix, and what would שָׁמַר look like in 3cp?',
        questionType: 'multiple_choice',
        correctAnswer: 'Suffix is וּ → שָׁמְרוּ (they guarded)',
        options: [
          'Suffix is וּ → שָׁמְרוּ (they guarded)',
          'Suffix is ָה → שָׁמְרָה (they guarded)',
          'Suffix is תֶּם → שְׁמַרְתֶּם (they guarded)',
          'Suffix is נוּ → שָׁמַרְנוּ (they guarded)'
        ],
        explanation: 'The 3cp suffix is וּ: שָׁמְרוּ (they guarded). Remember: 3ms = no suffix, 3fs = ָה, 3cp = וּ. Note that תֶּם is 2mp ("you all") and נוּ is 1cp ("we").',
        orderIndex: 6
      }
    ];

    for (const q of quizQuestions) {
      await sql`
        INSERT INTO quiz_questions (lesson_id, question_text, question_type, correct_answer, options, explanation, order_index)
        VALUES (
          'hebrew-week-8-qal-perfect',
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

    // --- Step 7: Completion ---
    console.log('📝 Creating Step 7: Completion...');
    const completionContent = {
      celebrationMessage: 'You\'ve entered the world of Hebrew VERBS! The Qal Perfect is your first conjugation — and it unlocks the ability to identify completed actions throughout the entire Hebrew Bible. With 30 verbs and 9 person/number suffixes, you can now recognize hundreds of verb forms. The engine of Hebrew sentences is yours!',
      xpAwarded: 200,
      achievements: ['Week 8 Complete', 'Verb Pioneer', 'Qal Perfect Master', '30 Verbs Learned'],
      nextLessonId: 'hebrew-week-9',
      reviewPrompt: 'Practice conjugating your 30 verbs through all 9 Qal Perfect forms. Start with the 5 most common (אָמַר, הָיָה, עָשָׂה, בָּא, הָלַךְ) and work outward. Read Genesis 2:1-7 daily, identifying every Qal Perfect form you can spot.',
      referenceLinks: [
        {
          title: 'Qal Perfect Paradigm Chart',
          url: '/hebrew/reference/qal-perfect'
        },
        {
          title: 'Week 8 Vocabulary Set',
          url: '/hebrew/vocabulary'
        }
      ]
    };

    await sql`
      INSERT INTO lesson_steps (lesson_id, step_number, step_type, content, order_index)
      VALUES ('hebrew-week-8-qal-perfect', 7, 'completion', ${JSON.stringify(completionContent)}, 7)
      ON CONFLICT (lesson_id, step_number) DO UPDATE
      SET content = EXCLUDED.content, step_type = EXCLUDED.step_type, updated_at = NOW()
    `;
    console.log('✅ Step 7 created\n');

    // ========================================
    // PART 5: Verify Everything
    // ========================================
    const steps = await sql`
      SELECT step_number, step_type FROM lesson_steps
      WHERE lesson_id = 'hebrew-week-8-qal-perfect'
      ORDER BY step_number
    `;

    const wordCount = await sql`
      SELECT COUNT(*) as count FROM vocab_words WHERE set_id = ${vocabSetId}
    `;

    console.log('🎉 Week 8 lesson seeded successfully!\n');
    console.log('Lesson structure:');
    for (const step of steps) {
      console.log(`  ${step.step_number}. ${step.step_type}`);
    }
    console.log(`\nTotal steps: ${steps.length}`);
    console.log(`Vocabulary: ${wordCount[0].count} verbs in "${vocabSetId}"`);
    console.log(`Quiz: ${quizQuestions.length} questions on verb system and Qal Perfect`);
    console.log('\nVerb groups:');
    console.log('  📦 Creation & Making: בָּרָא, עָשָׂה, נָתַן, בָּנָה, יָצַר');
    console.log('  📦 Speech & Communication: אָמַר, דָּבַר, קָרָא, צִוָּה, שָׁמַע');
    console.log('  📦 Movement & Motion: הָלַךְ, בָּא, יָצָא, שָׁב, עָלָה');
    console.log('  📦 Perception & Knowledge: רָאָה, יָדַע, מָצָא, זָכַר, לָמַד');
    console.log('  📦 State & Being: הָיָה, מֵת, יָשַׁב, גָּדַל, מָלַךְ');
    console.log('  📦 Action & Doing: לָקַח, כָּתַב, אָכַל, שָׁמַר, כָּלָה');

  } catch (error) {
    console.error('❌ Error seeding Week 8 lesson:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

seedWeek8Lesson()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
