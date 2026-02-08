/**
 * Seed Week 7 Vocabulary Sets
 *
 * Creates 3 vocabulary sets for Week 7: Noun Patterns:
 * 1. Segholate Nouns (20 words - 3 sub-patterns)
 * 2. Other Noun Patterns (15 words - qatol, qatal, etc.)
 * 3. Genesis 1:11-19 Reading Vocabulary (10 words)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedWeek7Vocab() {
  console.log('🚀 Seeding Week 7 Vocabulary Sets...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // ============================================================
    // SET 1: SEGHOLATE NOUNS (20 words)
    // ============================================================
    console.log('📦 Creating Set 1: Segholate Nouns (20 words)');

    const segholateWords = [
      // Pattern 1: ֶ_ֶ_ (segol-segol) — original vowel: a
      { hebrew: 'מֶ֫לֶךְ', trans: 'melekh', english: 'king', pronunciation: 'MEH-lekh', notes: 'Pattern 1 (segol-segol). Plural: מְלָכִים. One of the most common Hebrew nouns.', subcategory: 'Pattern 1: Segol-Segol' },
      { hebrew: 'עֶ֫בֶד', trans: 'eved', english: 'servant, slave', pronunciation: 'EH-ved', notes: 'Pattern 1. Plural: עֲבָדִים. Also means "worshiper" (same root as עָבַד, to serve/worship).', subcategory: 'Pattern 1: Segol-Segol' },
      { hebrew: 'נֶ֫פֶשׁ', trans: 'nefesh', english: 'soul, life, person', pronunciation: 'NEH-fesh', notes: 'Pattern 1. FEMININE despite segholate form! Plural: נְפָשׁוֹת. Appears in Genesis 1:20.', subcategory: 'Pattern 1: Segol-Segol' },
      { hebrew: 'קֶ֫בֶר', trans: 'qever', english: 'grave, tomb', pronunciation: 'KEH-ver', notes: 'Pattern 1. Plural: קְבָרִים.', subcategory: 'Pattern 1: Segol-Segol' },
      { hebrew: 'דֶּ֫רֶךְ', trans: 'derekh', english: 'way, road, path', pronunciation: 'DEH-rekh', notes: 'Pattern 1. Can be masculine OR feminine! Plural: דְּרָכִים.', subcategory: 'Pattern 1: Segol-Segol' },
      { hebrew: 'שֶׁ֫קֶר', trans: 'sheqer', english: 'falsehood, lie', pronunciation: 'SHEH-ker', notes: 'Pattern 1. Used in the Ten Commandments: עֵד שֶׁקֶר (false witness).', subcategory: 'Pattern 1: Segol-Segol' },
      { hebrew: 'צֶ֫דֶק', trans: 'tsedeq', english: 'righteousness, justice', pronunciation: 'TSEH-dek', notes: 'Pattern 1. Root: צ-ד-ק. Related to צַדִּיק (righteous) from Week 6.', subcategory: 'Pattern 1: Segol-Segol' },

      // Pattern 2: ֵ_ֶ_ (tsere-segol) — original vowel: i
      { hebrew: 'סֵ֫פֶר', trans: 'sefer', english: 'book, scroll, document', pronunciation: 'SAY-fer', notes: 'Pattern 2 (tsere-segol). Plural: סְפָרִים. Root: ס-פ-ר (to count/tell).', subcategory: 'Pattern 2: Tsere-Segol' },
      { hebrew: 'כֶּ֫לֶב', trans: 'kelev', english: 'dog', pronunciation: 'KEH-lev', notes: 'Pattern 2. Plural: כְּלָבִים. Used metaphorically for enemies in Psalms.', subcategory: 'Pattern 2: Tsere-Segol' },
      { hebrew: 'עֶ֫צֶם', trans: 'etsem', english: 'bone, self, essence', pronunciation: 'EH-tsem', notes: 'Pattern 2. Plural: עֲצָמוֹת (feminine plural!). "Bone of my bone" in Genesis 2:23.', subcategory: 'Pattern 2: Tsere-Segol' },
      { hebrew: 'חֵ֫לֶק', trans: 'cheleq', english: 'portion, share, lot', pronunciation: 'KHAY-lek', notes: 'Pattern 2. Plural: חֲלָקִים. "The LORD is my portion" (Psalm 73:26).', subcategory: 'Pattern 2: Tsere-Segol' },
      { hebrew: 'שֵׁ֫בֶט', trans: 'shevet', english: 'tribe, rod, staff', pronunciation: 'SHAY-vet', notes: 'Pattern 2. Plural: שְׁבָטִים. The 12 tribes of Israel = שְׁנֵים עָשָׂר שִׁבְטֵי יִשְׂרָאֵל.', subcategory: 'Pattern 2: Tsere-Segol' },

      // Pattern 3: ֹ_ֶ_ (holem-segol) — original vowel: u
      { hebrew: 'קֹ֫דֶשׁ', trans: 'qodesh', english: 'holiness, sacredness', pronunciation: 'KOH-desh', notes: 'Pattern 3 (holem-segol). Related to קָדוֹשׁ (holy) from Week 6.', subcategory: 'Pattern 3: Holem-Segol' },
      { hebrew: 'חֹ֫שֶׁךְ', trans: 'choshekh', english: 'darkness', pronunciation: 'KHOH-shekh', notes: 'Pattern 3. You know this from Genesis 1:2! וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם.', subcategory: 'Pattern 3: Holem-Segol' },
      { hebrew: 'עֹ֫שֶׁר', trans: 'osher', english: 'wealth, riches', pronunciation: 'OH-sher', notes: 'Pattern 3. Root: ע-שׁ-ר. Related to עָשִׁיר (rich) from Week 6.', subcategory: 'Pattern 3: Holem-Segol' },
      { hebrew: 'גֹּ֫רֶן', trans: 'goren', english: 'threshing floor', pronunciation: 'GOH-ren', notes: 'Pattern 3. Important location in biblical narratives (Ruth 3, 2 Samuel 24).', subcategory: 'Pattern 3: Holem-Segol' },

      // Other important segholates
      { hebrew: 'אֶ֫רֶץ', trans: 'erets', english: 'land, earth', pronunciation: 'EH-rets', notes: 'FEMININE despite segholate form! Irregular plural: אֲרָצוֹת. You know this from Genesis 1:1!', subcategory: 'Other Segholates' },
      { hebrew: 'בֹּ֫קֶר', trans: 'boqer', english: 'morning', pronunciation: 'BOH-ker', notes: 'Pattern 3. You know this from Genesis 1:5! וַיְהִי־עֶרֶב וַיְהִי־בֹקֶר.', subcategory: 'Other Segholates' },
      { hebrew: 'עֶ֫רֶב', trans: 'erev', english: 'evening', pronunciation: 'EH-rev', notes: 'Pattern 1. You know this from Genesis 1:5! Often paired with בֹּקֶר.', subcategory: 'Other Segholates' },
      { hebrew: 'יֶ֫לֶד', trans: 'yeled', english: 'boy, child', pronunciation: 'YEH-led', notes: 'Pattern 1. Plural: יְלָדִים. Feminine: יַלְדָּה (girl). Root: י-ל-ד (to give birth).', subcategory: 'Other Segholates' },
    ];

    await sql`
      INSERT INTO vocab_sets (id, title, description, total_words, set_type, language_id)
      VALUES (
        'week-7-segholates',
        'Week 7: Segholate Nouns',
        '20 common segholate nouns organized by their three sub-patterns. Segholates are two-syllable nouns with accent on the first syllable.',
        20,
        'vocabulary',
        'hebrew'
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        total_words = EXCLUDED.total_words,
        updated_at = NOW()
    `;

    for (const word of segholateWords) {
      const wordId = `week-7-segholates-${word.trans}`;
      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english,
          type, notes, semantic_group, group_category, group_subcategory,
          card_type, extra_data
        )
        VALUES (
          ${wordId},
          'week-7-segholates',
          ${word.hebrew},
          ${word.trans},
          ${word.english},
          'Noun',
          ${word.notes},
          'Segholate Nouns',
          'Nouns',
          ${word.subcategory},
          'vocabulary',
          ${JSON.stringify({ pronunciation: word.pronunciation, pattern: word.subcategory })}
        )
        ON CONFLICT (id) DO UPDATE SET
          hebrew = EXCLUDED.hebrew,
          english = EXCLUDED.english,
          notes = EXCLUDED.notes,
          extra_data = EXCLUDED.extra_data,
          updated_at = NOW()
      `;
    }
    console.log('  ✅ Created week-7-segholates (20 words)\n');

    // ============================================================
    // SET 2: OTHER NOUN PATTERNS (15 words)
    // ============================================================
    console.log('📦 Creating Set 2: Other Noun Patterns (15 words)');

    const patternWords = [
      // קָטוֹל pattern (qatol — with holem)
      { hebrew: 'שָׁלוֹם', trans: 'shalom', english: 'peace, wholeness, well-being', pronunciation: 'shah-LOHM', notes: 'קָטוֹל pattern. One of the most famous Hebrew words. Root: שׁ-ל-מ (completeness).', subcategory: 'Qatol Pattern' },
      { hebrew: 'כָּבוֹד', trans: 'kavod', english: 'glory, honor, weight', pronunciation: 'kah-VOHD', notes: 'קָטוֹל pattern. Literally "heaviness/weight." The glory of God = כְּבוֹד יְהוָה.', subcategory: 'Qatol Pattern' },
      { hebrew: 'מָקוֹם', trans: 'maqom', english: 'place, location', pronunciation: 'mah-KOHM', notes: 'קָטוֹל pattern. Plural: מְקוֹמוֹת. Later used as a name for God: הַמָּקוֹם (The Place).', subcategory: 'Qatol Pattern' },
      { hebrew: 'עָוֹן', trans: 'avon', english: 'iniquity, guilt, punishment', pronunciation: 'ah-VOHN', notes: 'קָטוֹל pattern. One of three main words for sin in Hebrew (with חֵטְא and פֶּשַׁע).', subcategory: 'Qatol Pattern' },
      { hebrew: 'אָדוֹן', trans: 'adon', english: 'lord, master', pronunciation: 'ah-DOHN', notes: 'קָטוֹל pattern. With suffix: אֲדֹנִי (my lord). אֲדֹנָי = Lord (divine title).', subcategory: 'Qatol Pattern' },

      // קָטָל pattern (qatal — adjective-nouns)
      { hebrew: 'זָקֵן', trans: 'zaqen', english: 'old, elder', pronunciation: 'zah-KAYN', notes: 'Functions as both adjective and noun ("an elder"). Plural: זְקֵנִים (elders).', subcategory: 'Qatal Pattern' },
      { hebrew: 'קָרוֹב', trans: 'qarov', english: 'near, close', pronunciation: 'kah-ROHV', notes: 'Adjective-noun. "The LORD is near" = קָרוֹב יְהוָה.', subcategory: 'Qatal Pattern' },
      { hebrew: 'רָחוֹק', trans: 'rachoq', english: 'far, distant', pronunciation: 'rah-KHOHK', notes: 'Opposite of קָרוֹב. Often in pair: רָחוֹק וְקָרוֹב (far and near).', subcategory: 'Qatal Pattern' },

      // Other important nouns
      { hebrew: 'כֶּ֫סֶף', trans: 'kesef', english: 'silver, money', pronunciation: 'KEH-sef', notes: 'Segholate-like pattern. Silver was the standard currency. Modern Hebrew: money.', subcategory: 'Other Important Nouns' },
      { hebrew: 'זָהָב', trans: 'zahav', english: 'gold', pronunciation: 'zah-HAHV', notes: 'Often paired with כֶּסֶף. "Gold and silver" = זָהָב וָכֶסֶף.', subcategory: 'Other Important Nouns' },
      { hebrew: 'נָהָר', trans: 'nahar', english: 'river, stream', pronunciation: 'nah-HAHR', notes: 'Plural: נְהָרוֹת. The four rivers of Eden (Genesis 2:10-14).', subcategory: 'Other Important Nouns' },
      { hebrew: 'הַר', trans: 'har', english: 'mountain, hill', pronunciation: 'HAHR', notes: 'Monosyllabic. Plural: הָרִים. Mount Sinai = הַר סִינַי.', subcategory: 'Other Important Nouns' },
      { hebrew: 'גּוֹי', trans: 'goy', english: 'nation, people', pronunciation: 'GOY', notes: 'Plural: גּוֹיִם. Originally neutral; later came to mean non-Israelite nations.', subcategory: 'Other Important Nouns' },
      { hebrew: 'עַם', trans: 'am', english: 'people, kinsmen', pronunciation: 'AHM', notes: 'Used for Israel specifically: עַם יִשְׂרָאֵל (the people of Israel). Distinct from גּוֹי.', subcategory: 'Other Important Nouns' },
      { hebrew: 'מִשְׁפָּט', trans: 'mishpat', english: 'judgment, justice, ordinance', pronunciation: 'meesh-PAHT', notes: 'מִקְטָל pattern (with מ prefix). Root: שׁ-פ-ט (to judge). Related to שֹׁפֵט (judge).', subcategory: 'Other Important Nouns' },
    ];

    await sql`
      INSERT INTO vocab_sets (id, title, description, total_words, set_type, language_id)
      VALUES (
        'week-7-noun-patterns',
        'Week 7: Noun Patterns',
        '15 important nouns organized by pattern type: קָטוֹל (qatol), קָטָל (qatal), and other common patterns.',
        15,
        'vocabulary',
        'hebrew'
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        total_words = EXCLUDED.total_words,
        updated_at = NOW()
    `;

    for (const word of patternWords) {
      const wordId = `week-7-noun-patterns-${word.trans}`;
      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english,
          type, notes, semantic_group, group_category, group_subcategory,
          card_type, extra_data
        )
        VALUES (
          ${wordId},
          'week-7-noun-patterns',
          ${word.hebrew},
          ${word.trans},
          ${word.english},
          'Noun',
          ${word.notes},
          'Noun Patterns',
          'Nouns',
          ${word.subcategory},
          'vocabulary',
          ${JSON.stringify({ pronunciation: word.pronunciation, pattern: word.subcategory })}
        )
        ON CONFLICT (id) DO UPDATE SET
          hebrew = EXCLUDED.hebrew,
          english = EXCLUDED.english,
          notes = EXCLUDED.notes,
          extra_data = EXCLUDED.extra_data,
          updated_at = NOW()
      `;
    }
    console.log('  ✅ Created week-7-noun-patterns (15 words)\n');

    // ============================================================
    // SET 3: GENESIS 1:11-19 READING VOCABULARY (10 words)
    // ============================================================
    console.log('📦 Creating Set 3: Genesis 1:11-19 Reading Vocabulary (10 words)');

    const readingWords = [
      { hebrew: 'דֶּ֫שֶׁא', trans: 'deshe', english: 'grass, vegetation', pronunciation: 'DEH-sheh', type: 'Noun', notes: 'Segholate! Pattern 1. Genesis 1:11: תַּדְשֵׁא הָאָרֶץ דֶּשֶׁא (let the earth sprout vegetation).', subcategory: 'Day 3: Vegetation' },
      { hebrew: 'עֵ֫שֶׂב', trans: 'esev', english: 'herb, plant, herbage', pronunciation: 'AY-sev', type: 'Noun', notes: 'Genesis 1:11: עֵשֶׂב מַזְרִיעַ זֶרַע (plant yielding seed).', subcategory: 'Day 3: Vegetation' },
      { hebrew: 'זֶ֫רַע', trans: 'zera', english: 'seed, offspring, descendant', pronunciation: 'ZEH-rah', type: 'Noun', notes: 'Segholate! Pattern 1. Important theologically — "seed of the woman" in Genesis 3:15.', subcategory: 'Day 3: Vegetation' },
      { hebrew: 'עֵץ', trans: 'ets', english: 'tree, wood', pronunciation: 'AYTS', type: 'Noun', notes: 'Plural: עֵצִים. Tree of knowledge = עֵץ הַדַּעַת. Tree of life = עֵץ הַחַיִּים.', subcategory: 'Day 3: Vegetation' },
      { hebrew: 'פְּרִי', trans: 'peri', english: 'fruit, produce', pronunciation: 'pe-REE', type: 'Noun', notes: 'Genesis 1:11: עֵץ פְּרִי (fruit tree). Also used metaphorically: "fruit of the Spirit."', subcategory: 'Day 3: Vegetation' },
      { hebrew: 'מָאוֹר', trans: 'maor', english: 'light, luminary, light-bearer', pronunciation: 'mah-OHR', type: 'Noun', notes: 'From root א-ו-ר (light). Genesis 1:14: יְהִי מְאֹרֹת (let there be lights). Different from אוֹר (light itself).', subcategory: 'Day 4: Luminaries' },
      { hebrew: 'רָקִיעַ', trans: 'raqia', english: 'expanse, firmament, dome', pronunciation: 'rah-KEE-ah', type: 'Noun', notes: 'Root: ר-ק-ע (to spread out, hammer). The "dome" of sky separating waters above from below.', subcategory: 'Day 4: Luminaries' },
      { hebrew: 'אוֹת', trans: 'ot', english: 'sign, omen, token', pronunciation: 'OHT', type: 'Noun', notes: 'Plural: אוֹתוֹת. Genesis 1:14: the lights serve as "signs" (לְאֹתֹת).', subcategory: 'Day 4: Luminaries' },
      { hebrew: 'מוֹעֵד', trans: 'moed', english: 'appointed time, season, festival', pronunciation: 'moh-AYD', type: 'Noun', notes: 'Plural: מוֹעֲדִים. Genesis 1:14: lights for "seasons." Later = the appointed feasts of Israel.', subcategory: 'Day 4: Luminaries' },
      { hebrew: 'כּוֹכָב', trans: 'kokhav', english: 'star', pronunciation: 'koh-KHAHV', type: 'Noun', notes: 'Plural: כּוֹכָבִים. Genesis 1:16: וְאֵת הַכּוֹכָבִים (and the stars). Genesis 15:5: "count the stars."', subcategory: 'Day 4: Luminaries' },
    ];

    await sql`
      INSERT INTO vocab_sets (id, title, description, total_words, set_type, language_id)
      VALUES (
        'week-7-genesis-reading',
        'Week 7: Genesis 1:11-19 Reading',
        'Key vocabulary for reading Genesis 1:11-19 — Day 3 (vegetation) and Day 4 (luminaries) of creation.',
        10,
        'vocabulary',
        'hebrew'
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        total_words = EXCLUDED.total_words,
        updated_at = NOW()
    `;

    for (const word of readingWords) {
      const wordId = `week-7-genesis-reading-${word.trans}`;
      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english,
          type, notes, semantic_group, group_category, group_subcategory,
          card_type, extra_data
        )
        VALUES (
          ${wordId},
          'week-7-genesis-reading',
          ${word.hebrew},
          ${word.trans},
          ${word.english},
          ${word.type},
          ${word.notes},
          'Genesis Reading',
          'Reading Vocabulary',
          ${word.subcategory},
          'vocabulary',
          ${JSON.stringify({ pronunciation: word.pronunciation })}
        )
        ON CONFLICT (id) DO UPDATE SET
          hebrew = EXCLUDED.hebrew,
          english = EXCLUDED.english,
          notes = EXCLUDED.notes,
          extra_data = EXCLUDED.extra_data,
          updated_at = NOW()
      `;
    }
    console.log('  ✅ Created week-7-genesis-reading (10 words)\n');

    // Summary
    console.log('✅ Successfully created all 3 Week 7 vocabulary sets!');
    console.log('\n📊 Summary:');
    console.log('  - week-7-segholates: 20 words (3 segholate sub-patterns)');
    console.log('  - week-7-noun-patterns: 15 words (qatol, qatal, other patterns)');
    console.log('  - week-7-genesis-reading: 10 words (Genesis 1:11-19 vocabulary)');
    console.log('  - TOTAL: 45 words for Week 7');
    console.log('\n🔗 These sets are already linked to the Week 7 lesson (hebrew-week-7-noun-patterns)');

  } catch (error) {
    console.error('❌ Error seeding Week 7 vocab:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seedWeek7Vocab()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
