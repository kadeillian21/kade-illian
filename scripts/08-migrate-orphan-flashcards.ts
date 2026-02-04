/**
 * Migration script to convert orphaned flashcard pages to vocab sets
 *
 * Converts:
 * - /hebrew/alphabet (41 Hebrew characters) -> vocab set "hebrew-alphabet"
 * - /hebrew/syllables (20 syllable cards) -> vocab set "hebrew-syllables"
 *
 * Run with: npx tsx scripts/08-migrate-orphan-flashcards.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('POSTGRES_URL_NON_POOLING or POSTGRES_URL not found');
  console.error('Make sure .env.local exists with database connection string');
  process.exit(1);
}

const sql = postgres(connectionString);

// Alphabet data (41 Hebrew characters - 28 consonants + 13 vowel points)
const alphabetCards = [
  // CONSONANTS (28)
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
  // VOWEL POINTS (13)
  { char: 'בָ', name: 'Qamets', pronunciation: 'KAH-mets', sound: '"ah" (father)', notes: 'Small T shape under letter' },
  { char: 'בֵ', name: 'Tsere', pronunciation: 'tsay-RAY', sound: '"ay" (day)', notes: 'Two dots under letter' },
  { char: 'בֹ', name: 'Holem', pronunciation: 'HOH-lem', sound: '"oh" (go)', notes: 'Dot above letter (or on vav)' },
  { char: 'בוּ', name: 'Shureq', pronunciation: 'shoo-ROOK', sound: '"oo" (food)', notes: 'Vav with dot inside' },
  { char: 'בִי', name: 'Hireq + Yod', pronunciation: 'hee-REEK', sound: '"ee" (see)', notes: 'Dot under + yod after' },
  { char: 'בַ', name: 'Patach', pronunciation: 'pah-TAKH', sound: '"ah" (cat)', notes: 'Line under letter' },
  { char: 'בֶ', name: 'Segol', pronunciation: 'seh-GOHL', sound: '"eh" (bed)', notes: 'Three dots under letter' },
  { char: 'בִ', name: 'Hireq', pronunciation: 'hee-REEK', sound: '"ih" (sit)', notes: 'One dot under letter' },
  { char: 'בֻ', name: 'Qibbuts', pronunciation: 'kee-BOOTS', sound: '"oo" (book)', notes: 'Three diagonal dots under' },
  { char: 'בְ', name: 'Sheva', pronunciation: 'sheh-VAH', sound: '"uh" or silent', notes: 'Two vertical dots - vocal at word start' },
  { char: 'בֲ', name: 'Hateph Patach', pronunciation: 'hah-TEF pah-TAKH', sound: '"ah" (short)', notes: 'Sheva + patach - with gutturals' },
  { char: 'בֱ', name: 'Hateph Segol', pronunciation: 'hah-TEF seh-GOHL', sound: '"eh" (short)', notes: 'Sheva + segol - with gutturals' },
  { char: 'בֳ', name: 'Hateph Qamets', pronunciation: 'hah-TEF KAH-mets', sound: '"oh" (short)', notes: 'Sheva + qamets - with gutturals' }
];

// Syllables data (20 syllable practice cards)
const syllableCards = [
  // Simple 2-letter words
  { word: 'בֵּן', syllables: 'בֵּן', pronunciation: 'ben', type: '1 closed syllable', notes: 'Meaning: "son"' },
  { word: 'יָד', syllables: 'יָד', pronunciation: 'yad', type: '1 closed syllable', notes: 'Meaning: "hand"' },
  { word: 'לֹא', syllables: 'לֹא', pronunciation: 'lo', type: '1 open syllable', notes: 'Meaning: "no/not"' },
  { word: 'עַם', syllables: 'עַם', pronunciation: 'am', type: '1 closed syllable', notes: 'Meaning: "people"' },
  { word: 'גּוֹי', syllables: 'גּוֹי', pronunciation: 'goy', type: '1 closed syllable', notes: 'Meaning: "nation"' },

  // 3-letter words - multiple syllables
  { word: 'שָׁלוֹם', syllables: 'שָׁ־לוֹם', pronunciation: 'sha-LOM', type: 'Open + closed syllables', notes: 'Meaning: "peace"' },
  { word: 'מֶלֶךְ', syllables: 'מֶ־לֶךְ', pronunciation: 'MEH-lekh', type: 'Open + closed syllables', notes: 'Meaning: "king"' },
  { word: 'דָּבָר', syllables: 'דָּ־בָר', pronunciation: 'da-VAR', type: 'Open + closed syllables', notes: 'Meaning: "word"' },
  { word: 'אֱלֹהִים', syllables: 'אֱ־לֹ־הִים', pronunciation: 'e-lo-HEEM', type: '3 syllables', notes: 'Meaning: "God"' },
  { word: 'בָּרָא', syllables: 'בָּ־רָא', pronunciation: 'ba-RA', type: 'Open + open syllables', notes: 'Meaning: "he created"' },

  // Simple one-syllable words
  { word: 'טוֹב', syllables: 'טוֹב', pronunciation: 'tov', type: '1 closed syllable', notes: 'Meaning: "good"' },
  { word: 'אוֹר', syllables: 'אוֹר', pronunciation: 'or', type: '1 closed syllable', notes: 'Meaning: "light"' },
  { word: 'יוֹם', syllables: 'יוֹם', pronunciation: 'yom', type: '1 closed syllable', notes: 'Meaning: "day"' },
  { word: 'לַיְלָה', syllables: 'לַיְ־לָה', pronunciation: 'LAY-lah', type: 'Closed + open syllables', notes: 'Meaning: "night"' },

  // Words with maqqef
  { word: 'בֶּן־אָדָם', syllables: 'בֶּן־אָ־דָם', pronunciation: 'ben-a-DAM', type: 'Joined by maqqef', notes: 'Meaning: "son of man"' },

  // More practice words
  { word: 'אֶרֶץ', syllables: 'אֶ־רֶץ', pronunciation: 'EH-rets', type: 'Open + closed syllables', notes: 'Meaning: "earth/land"' },
  { word: 'שָׁמַיִם', syllables: 'שָׁ־מַ־יִם', pronunciation: 'sha-MA-yim', type: '3 syllables', notes: 'Meaning: "heavens/sky"' },
  { word: 'מַיִם', syllables: 'מַ־יִם', pronunciation: 'MA-yim', type: 'Open + closed syllables', notes: 'Meaning: "water"' },
  { word: 'רוּחַ', syllables: 'רוּ־חַ', pronunciation: 'RU-akh', type: 'Open + closed syllables', notes: 'Meaning: "spirit/wind"' },
  { word: 'תֹּהוּ', syllables: 'תֹּ־הוּ', pronunciation: 'TO-hu', type: 'Open + open syllables', notes: 'Meaning: "formless/chaos"' }
];

async function migrateOrphanFlashcards() {
  console.log('Starting migration of orphan flashcards to vocab sets...\n');

  try {
    // 1. Create Hebrew Alphabet vocab set
    console.log('Creating Hebrew Alphabet vocab set...');

    // Check if set already exists
    const existingAlphabet = await sql`SELECT id FROM vocab_sets WHERE id = 'hebrew-alphabet'`;

    if (existingAlphabet.length > 0) {
      console.log('  Hebrew Alphabet set already exists, skipping...');
    } else {
      await sql`
        INSERT INTO vocab_sets (id, title, description, total_words, is_active, set_type)
        VALUES (
          'hebrew-alphabet',
          'Hebrew Alphabet',
          'Master all 41 Hebrew characters - 28 consonants and 13 vowel points (nikkud)',
          ${alphabetCards.length},
          false,
          'foundational'
        )
      `;

      // Insert alphabet cards
      for (const card of alphabetCards) {
        const wordId = `hebrew-alphabet-${card.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        await sql`
          INSERT INTO vocab_words (
            id, hebrew, transliteration, english, type, notes,
            semantic_group, set_id, group_category, group_subcategory, card_type, extra_data
          ) VALUES (
            ${wordId},
            ${card.char},
            ${card.name.toLowerCase()},
            ${card.sound},
            'Letter',
            ${card.notes},
            ${card.char.length > 1 ? 'Vowels' : 'Consonants'},
            'hebrew-alphabet',
            ${card.char.length > 1 ? 'Vowel Points' : 'Consonants'},
            ${card.name.includes('final') ? 'Final Forms' : null},
            'alphabet',
            ${JSON.stringify({
              pronunciation: card.pronunciation,
              name: card.name,
              sound: card.sound
            })}::jsonb
          )
          ON CONFLICT (id) DO NOTHING
        `;
      }

      console.log(`  ✅ Created "Hebrew Alphabet" with ${alphabetCards.length} cards`);
    }

    // 2. Create Hebrew Syllables vocab set
    console.log('\nCreating Hebrew Syllables vocab set...');

    const existingSyllables = await sql`SELECT id FROM vocab_sets WHERE id = 'hebrew-syllables'`;

    if (existingSyllables.length > 0) {
      console.log('  Hebrew Syllables set already exists, skipping...');
    } else {
      await sql`
        INSERT INTO vocab_sets (id, title, description, total_words, is_active, set_type)
        VALUES (
          'hebrew-syllables',
          'Hebrew Syllables',
          'Practice dividing Hebrew words into syllables - open vs closed syllables',
          ${syllableCards.length},
          false,
          'foundational'
        )
      `;

      // Insert syllable cards
      for (const card of syllableCards) {
        const wordId = `hebrew-syllables-${card.pronunciation.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        await sql`
          INSERT INTO vocab_words (
            id, hebrew, transliteration, english, type, notes,
            semantic_group, set_id, group_category, card_type, extra_data
          ) VALUES (
            ${wordId},
            ${card.word},
            ${card.pronunciation.toLowerCase().replace(/-/g, '')},
            ${card.notes.replace('Meaning: ', '').replace(/"/g, '')},
            'Word',
            ${card.type},
            'Syllables',
            'hebrew-syllables',
            'Syllable Practice',
            'syllable',
            ${JSON.stringify({
              pronunciation: card.pronunciation,
              syllables: card.syllables,
              syllableType: card.type
            })}::jsonb
          )
          ON CONFLICT (id) DO NOTHING
        `;
      }

      console.log(`  ✅ Created "Hebrew Syllables" with ${syllableCards.length} cards`);
    }

    console.log('\n✅ Migration complete!');
    console.log('\nYou can now delete the standalone pages:');
    console.log('  - app/hebrew/alphabet/page.tsx');
    console.log('  - app/hebrew/syllables/page.tsx');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

migrateOrphanFlashcards();
