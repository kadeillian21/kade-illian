/**
 * Migration script to move alphabet and syllables content into unified vocab system
 * Run this with: npx tsx scripts/migrate-alphabet-syllables.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { getDb } from '../lib/db';

const sql = getDb();

async function migrateAlphabetToVocab() {
  console.log('📚 Migrating Hebrew Alphabet to vocab system...');

  // Alphabet data from /hebrew/alphabet/page.tsx
  const alphabetCards = [
    // CONSONANTS
    { char: 'א', name: 'Aleph', pronunciation: 'AH-lef', sound: '(silent)', notes: 'Looks like X' },
    { char: 'ב', name: 'Bet', pronunciation: 'bayt', sound: 'b / v', notes: 'Backwards C with floor' },
    { char: 'ג', name: 'Gimel', pronunciation: 'GEE-mel', sound: 'g', notes: 'Always hard g' },
    { char: 'ד', name: 'Dalet', pronunciation: 'DAH-let', sound: 'd', notes: 'Has corner (vs ר)' },
    { char: 'ה', name: 'He', pronunciation: 'hay', sound: 'h', notes: 'Gap at top left' },
    { char: 'ו', name: 'Vav', pronunciation: 'vahv', sound: 'v / o / u', notes: 'Straight line; means "and"' },
    { char: 'ז', name: 'Zayin', pronunciation: 'ZAH-yin', sound: 'z', notes: 'Like a sword' },
    { char: 'ח', name: 'Chet', pronunciation: 'khet', sound: 'ch', notes: 'Throaty (like "Bach")' },
    { char: 'ט', name: 'Tet', pronunciation: 'tet', sound: 't', notes: 'Curly shape' },
    { char: 'י', name: 'Yod', pronunciation: 'yohd', sound: 'y / i', notes: 'Tiny apostrophe' },
    { char: 'כ', name: 'Kaph', pronunciation: 'kahf', sound: 'k / kh', notes: 'Like ב but rounder' },
    { char: 'ל', name: 'Lamed', pronunciation: 'LAH-med', sound: 'l', notes: 'Shepherd\'s staff, tallest letter' },
    { char: 'מ', name: 'Mem', pronunciation: 'mem', sound: 'm', notes: 'Square with opening bottom left' },
    { char: 'נ', name: 'Nun', pronunciation: 'noon', sound: 'n', notes: 'Like ו with base/foot' },
    { char: 'ס', name: 'Samekh', pronunciation: 'SAH-mekh', sound: 's', notes: 'Closed circle' },
    { char: 'ע', name: 'Ayin', pronunciation: 'AH-yin', sound: '(guttural)', notes: 'Silent/throaty, looks like Y' },
    { char: 'פ', name: 'Pe', pronunciation: 'pay', sound: 'p / f', notes: 'Like ב with inner line' },
    { char: 'צ', name: 'Tsade', pronunciation: 'TSAH-day', sound: 'ts', notes: 'Unique bent shape' },
    { char: 'ק', name: 'Qoph', pronunciation: 'kohf', sound: 'q', notes: 'Deep k sound' },
    { char: 'ר', name: 'Resh', pronunciation: 'raysh', sound: 'r', notes: 'Rounded top, SHORT, on baseline' },
    { char: 'שׂ', name: 'Sin', pronunciation: 'seen', sound: 's', notes: 'Dot on left' },
    { char: 'שׁ', name: 'Shin', pronunciation: 'sheen', sound: 'sh', notes: 'Dot on right' },
    { char: 'ת', name: 'Tav', pronunciation: 'tahv', sound: 't', notes: 'Like ח with extra line' },
    { char: 'ך', name: 'Kaph (final)', pronunciation: 'kahf', sound: 'kh', notes: 'LONG tail drops below baseline' },
    { char: 'ם', name: 'Mem (final)', pronunciation: 'mem', sound: 'm', notes: 'Closed square, stays ON baseline' },
    { char: 'ן', name: 'Nun (final)', pronunciation: 'noon', sound: 'n', notes: 'LONG tail drops below baseline' },
    { char: 'ף', name: 'Pe (final)', pronunciation: 'fay', sound: 'f', notes: 'LONG tail drops below baseline' },
    { char: 'ץ', name: 'Tsade (final)', pronunciation: 'TSAH-day', sound: 'ts', notes: 'LONG tail drops below baseline' },
  ];

  const vowelCards = [
    { char: 'בָ', name: 'Qamets', pronunciation: 'KAH-mets', sound: '"ah" (father)', notes: 'Small T shape under letter' },
    { char: 'בֵ', name: 'Tsere', pronunciation: 'tsay-RAY', sound: '"ay" (day)', notes: 'Two dots under letter' },
    { char: 'בֹ', name: 'Holem', pronunciation: 'HOH-lem', sound: '"oh" (go)', notes: 'Dot above letter (or on vav)' },
    { char: 'בִ', name: 'Hireq', pronunciation: 'hee-REK', sound: '"ee" (see)', notes: 'Single dot under letter' },
    { char: 'בֻ', name: 'Qibbuts', pronunciation: 'kee-BOOTS', sound: '"oo" (boot)', notes: 'Three dots in diagonal' },
    { char: 'בַ', name: 'Patach', pronunciation: 'pah-TAHKH', sound: '"ah" (father)', notes: 'Short horizontal line under' },
    { char: 'בֶ', name: 'Segol', pronunciation: 'seh-GOHL', sound: '"eh" (pet)', notes: 'Three dots in triangle' },
    { char: 'בְ', name: 'Sheva', pronunciation: 'sheh-VAH', sound: 'silent or "uh"', notes: 'Two vertical dots' },
    { char: 'בָּ', name: 'Dagesh', pronunciation: 'dah-GAYSH', sound: 'doubles consonant', notes: 'Dot inside letter' },
    { char: 'שׁ', name: 'Shin dot', pronunciation: '', sound: 'sh sound', notes: 'Dot on right side of ש' },
    { char: 'שׂ', name: 'Sin dot', pronunciation: '', sound: 's sound', notes: 'Dot on left side of ש' },
  ];

  // Create vocab set for consonants
  const consonantSet = await sql`
    INSERT INTO vocab_sets (id, title, description, set_type, is_active)
    VALUES (
      'alphabet-consonants',
      'Hebrew Consonants',
      'Learn all 28 Hebrew consonant letters (including final forms)',
      'alphabet',
      false
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      set_type = EXCLUDED.set_type
    RETURNING id
  `;

  console.log(`✅ Created vocab set: alphabet-consonants`);

  // Insert consonant cards as vocab words
  for (const card of alphabetCards) {
    const wordId = `alphabet-${card.name.toLowerCase().replace(/\s+/g, '-')}`;

    await sql`
      INSERT INTO vocab_words (
        id,
        set_id,
        hebrew,
        transliteration,
        english,
        type,
        notes,
        card_type,
        extra_data,
        group_category,
        group_subcategory
      ) VALUES (
        ${wordId},
        'alphabet-consonants',
        ${card.char},
        ${card.pronunciation},
        ${card.name},
        'Noun',
        ${card.notes},
        'alphabet',
        ${JSON.stringify({ pronunciation: card.pronunciation, sound: card.sound })}::jsonb,
        'Consonants',
        ${card.name.includes('final') ? 'Final Forms' : 'Regular Letters'}
      )
      ON CONFLICT (id) DO UPDATE SET
        hebrew = EXCLUDED.hebrew,
        transliteration = EXCLUDED.transliteration,
        english = EXCLUDED.english,
        notes = EXCLUDED.notes,
        extra_data = EXCLUDED.extra_data
    `;
  }

  console.log(`✅ Inserted ${alphabetCards.length} consonant cards`);

  // Create vocab set for vowels
  await sql`
    INSERT INTO vocab_sets (id, title, description, set_type, is_active)
    VALUES (
      'alphabet-vowels',
      'Hebrew Vowel Points',
      'Learn the Hebrew vowel points (nikkud) and diacritical marks',
      'alphabet',
      false
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      set_type = EXCLUDED.set_type
  `;

  console.log(`✅ Created vocab set: alphabet-vowels`);

  // Insert vowel cards
  for (const card of vowelCards) {
    const wordId = `alphabet-vowel-${card.name.toLowerCase().replace(/\s+/g, '-')}`;

    await sql`
      INSERT INTO vocab_words (
        id,
        set_id,
        hebrew,
        transliteration,
        english,
        type,
        notes,
        card_type,
        extra_data,
        group_category,
        group_subcategory
      ) VALUES (
        ${wordId},
        'alphabet-vowels',
        ${card.char},
        ${card.pronunciation},
        ${card.name},
        'Noun',
        ${card.notes},
        'alphabet',
        ${JSON.stringify({ pronunciation: card.pronunciation, sound: card.sound })}::jsonb,
        'Vowels',
        'Vowel Points'
      )
      ON CONFLICT (id) DO UPDATE SET
        hebrew = EXCLUDED.hebrew,
        transliteration = EXCLUDED.transliteration,
        english = EXCLUDED.english,
        notes = EXCLUDED.notes,
        extra_data = EXCLUDED.extra_data
    `;
  }

  console.log(`✅ Inserted ${vowelCards.length} vowel cards`);
}

async function migrateSyllablesToVocab() {
  console.log('🎯 Migrating Hebrew Syllables to vocab system...');

  // Syllables data from /hebrew/syllables/page.tsx
  const syllableCards = [
    // Simple 2-letter words
    { word: 'בֵּן', syllables: 'בֵּן', pronunciation: 'ben', type: '1 closed syllable', notes: 'Meaning: "son"' },
    { word: 'יָד', syllables: 'יָד', pronunciation: 'yad', type: '1 closed syllable', notes: 'Meaning: "hand"' },
    { word: 'לֹא', syllables: 'לֹא', pronunciation: 'lo', type: '1 open syllable', notes: 'Meaning: "no/not"' },
    { word: 'עַם', syllables: 'עַם', pronunciation: 'am', type: '1 closed syllable', notes: 'Meaning: "people"' },
    { word: 'גּוֹי', syllables: 'גּוֹי', pronunciation: 'goy', type: '1 closed syllable', notes: 'Meaning: "nation"' },
    // 3-letter words
    { word: 'שָׁלוֹם', syllables: 'שָׁ־לוֹם', pronunciation: 'sha-LOM', type: 'Open + closed syllables', notes: 'Meaning: "peace"' },
    { word: 'מֶלֶךְ', syllables: 'מֶ־לֶךְ', pronunciation: 'MEH-lekh', type: 'Open + closed syllables', notes: 'Meaning: "king"' },
    { word: 'דָּבָר', syllables: 'דָּ־בָר', pronunciation: 'da-VAR', type: 'Open + closed syllables', notes: 'Meaning: "word"' },
    { word: 'אֱלֹהִים', syllables: 'אֱ־לֹ־הִים', pronunciation: 'e-lo-HEEM', type: '3 syllables', notes: 'Meaning: "God"' },
    { word: 'בָּרָא', syllables: 'בָּ־רָא', pronunciation: 'ba-RA', type: 'Open + open syllables', notes: 'Meaning: "he created"' },
    { word: 'טוֹב', syllables: 'טוֹב', pronunciation: 'tov', type: '1 closed syllable', notes: 'Meaning: "good"' },
    { word: 'אוֹר', syllables: 'אוֹר', pronunciation: 'or', type: '1 closed syllable', notes: 'Meaning: "light"' },
    { word: 'יוֹם', syllables: 'יוֹם', pronunciation: 'yom', type: '1 closed syllable', notes: 'Meaning: "day"' },
    { word: 'לַיְלָה', syllables: 'לַיְ־לָה', pronunciation: 'LAY-lah', type: 'Closed + open syllables', notes: 'Meaning: "night"' },
    { word: 'בֶּן־אָדָם', syllables: 'בֶּן־אָ־דָם', pronunciation: 'ben-a-DAM', type: 'Joined by maqqef', notes: 'Meaning: "son of man"' },
    { word: 'אֶרֶץ', syllables: 'אֶ־רֶץ', pronunciation: 'EH-rets', type: 'Open + closed syllables', notes: 'Meaning: "earth/land"' },
    { word: 'שָׁמַיִם', syllables: 'שָׁ־מַ־יִם', pronunciation: 'sha-MA-yim', type: '3 syllables', notes: 'Meaning: "heavens/sky"' },
    { word: 'מַיִם', syllables: 'מַ־יִם', pronunciation: 'MA-yim', type: 'Open + closed syllables', notes: 'Meaning: "water"' },
    { word: 'רוּחַ', syllables: 'רוּ־חַ', pronunciation: 'RU-akh', type: 'Open + closed syllables', notes: 'Meaning: "spirit/wind"' },
    { word: 'תֹּהוּ', syllables: 'תֹּ־הוּ', pronunciation: 'TO-hu', type: 'Open + open syllables', notes: 'Meaning: "formless/chaos"' },
  ];

  // Create vocab set for syllables
  await sql`
    INSERT INTO vocab_sets (id, title, description, set_type, is_active)
    VALUES (
      'syllables-practice',
      'Hebrew Syllables Practice',
      'Learn to break down Hebrew words into syllables and understand syllable patterns',
      'syllables',
      false
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      set_type = EXCLUDED.set_type
  `;

  console.log(`✅ Created vocab set: syllables-practice`);

  // Insert syllable cards
  for (const card of syllableCards) {
    const wordId = `syllable-${card.word.replace(/[־\s]/g, '-')}`;
    const englishMeaning = card.notes.replace('Meaning: ', '').replace(/"/g, '');

    await sql`
      INSERT INTO vocab_words (
        id,
        set_id,
        hebrew,
        transliteration,
        english,
        type,
        notes,
        card_type,
        extra_data,
        group_category,
        group_subcategory
      ) VALUES (
        ${wordId},
        'syllables-practice',
        ${card.word},
        ${card.pronunciation},
        ${englishMeaning},
        'Noun',
        ${card.type},
        'syllable',
        ${JSON.stringify({
          syllables: card.syllables,
          pronunciation: card.pronunciation,
          syllableType: card.type
        })}::jsonb,
        'Syllables',
        ${card.type.includes('1 ') ? 'Single Syllable' : 'Multi-Syllable'}
      )
      ON CONFLICT (id) DO UPDATE SET
        hebrew = EXCLUDED.hebrew,
        transliteration = EXCLUDED.transliteration,
        english = EXCLUDED.english,
        notes = EXCLUDED.notes,
        extra_data = EXCLUDED.extra_data
    `;
  }

  console.log(`✅ Inserted ${syllableCards.length} syllable cards`);
}

async function main() {
  console.log('🚀 Starting migration of alphabet and syllables to unified vocab system...\n');

  try {
    await migrateAlphabetToVocab();
    await migrateSyllablesToVocab();

    console.log('\n✅ Migration complete!');
    console.log('📚 Created 3 new vocab sets:');
    console.log('   - alphabet-consonants (28 cards)');
    console.log('   - alphabet-vowels (11 cards)');
    console.log('   - syllables-practice (20 cards)');
    console.log('\n💡 Next steps:');
    console.log('   1. Visit /hebrew/vocabulary to see the new sets');
    console.log('   2. Mark them as active if you want to study them');
    console.log('   3. Old pages at /hebrew/alphabet and /hebrew/syllables can be deprecated');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

main();
