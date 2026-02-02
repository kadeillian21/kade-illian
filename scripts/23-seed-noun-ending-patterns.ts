/**
 * Seed Noun Ending Pattern Flashcards
 * Creates flashcards that show endings on front, form + example on back
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedNounEndingPatterns() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error('POSTGRES_URL or POSTGRES_URL_NON_POOLING must be set');
  }

  const sql = postgres(connectionString);

  try {
    console.log('🌱 Seeding noun ending pattern flashcards...\n');

    const setId = 'noun-ending-patterns';
    const setTitle = 'Noun Ending Patterns';
    const setDescription = 'Practice identifying noun forms by their endings';

    // Check if set already exists
    const existingSet = await sql`
      SELECT id FROM vocab_sets WHERE id = ${setId}
    `;

    if (existingSet.length > 0) {
      console.log(`⚠️  Set "${setId}" already exists. Deleting old cards...`);
      await sql`DELETE FROM vocab_words WHERE set_id = ${setId}`;
    } else {
      // Create the vocab set
      await sql`
        INSERT INTO vocab_sets (id, title, description, set_type, language_id)
        VALUES (${setId}, ${setTitle}, ${setDescription}, 'lesson', 'hebrew')
      `;
      console.log(`✅ Created vocab set: ${setTitle}`);
    }

    // Define the flashcards
    const cards = [
      {
        id: 'noun-ending-patterns-masc-sing',
        hebrew: '(none)',
        transliteration: 'no ending',
        english: 'Masculine Singular',
        type: 'Pattern',
        notes: 'Example: מֶלֶךְ (king)',
        groupCategory: 'Grammar Patterns',
        groupSubcategory: 'Noun Endings',
        extraData: {
          pronunciation: 'MEH-lekh',
          exampleWord: 'מֶלֶךְ',
          exampleTrans: 'king'
        }
      },
      {
        id: 'noun-ending-patterns-masc-plur',
        hebrew: 'ִים-',
        transliteration: '-im',
        english: 'Masculine Plural',
        type: 'Pattern',
        notes: 'Example: מְלָכִים (kings)',
        groupCategory: 'Grammar Patterns',
        groupSubcategory: 'Noun Endings',
        extraData: {
          pronunciation: 'meh-lah-KHEEM',
          exampleWord: 'מְלָכִים',
          exampleTrans: 'kings'
        }
      },
      {
        id: 'noun-ending-patterns-fem-sing',
        hebrew: 'ָה-',
        transliteration: '-ah',
        english: 'Feminine Singular',
        type: 'Pattern',
        notes: 'Example: מַלְכָּה (queen)',
        groupCategory: 'Grammar Patterns',
        groupSubcategory: 'Noun Endings',
        extraData: {
          pronunciation: 'mal-KAH',
          exampleWord: 'מַלְכָּה',
          exampleTrans: 'queen'
        }
      },
      {
        id: 'noun-ending-patterns-fem-plur',
        hebrew: 'וֹת-',
        transliteration: '-ot',
        english: 'Feminine Plural',
        type: 'Pattern',
        notes: 'Example: מְלָכוֹת (queens)',
        groupCategory: 'Grammar Patterns',
        groupSubcategory: 'Noun Endings',
        extraData: {
          pronunciation: 'meh-lah-KHOT',
          exampleWord: 'מְלָכוֹת',
          exampleTrans: 'queens'
        }
      },
      {
        id: 'noun-ending-patterns-dual',
        hebrew: 'ַיִם-',
        transliteration: '-ayim',
        english: 'Dual',
        type: 'Pattern',
        notes: 'Example: יָדַיִם (two hands)',
        groupCategory: 'Grammar Patterns',
        groupSubcategory: 'Noun Endings',
        extraData: {
          pronunciation: 'yah-DAH-yeem',
          exampleWord: 'יָדַיִם',
          exampleTrans: 'two hands'
        }
      }
    ];

    // Insert each card
    for (const card of cards) {
      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english, type, notes,
          group_category, group_subcategory, extra_data
        )
        VALUES (
          ${card.id},
          ${setId},
          ${card.hebrew},
          ${card.transliteration},
          ${card.english},
          ${card.type},
          ${card.notes},
          ${card.groupCategory},
          ${card.groupSubcategory},
          ${sql.json(card.extraData)}
        )
      `;
      console.log(`  ✅ Added: ${card.hebrew} → ${card.english}`);
    }

    console.log(`\n✅ Successfully seeded ${cards.length} noun ending pattern cards!`);
    console.log(`\nThese flashcards will show:`);
    console.log(`  Front: The ending pattern (e.g., "ִים-")`);
    console.log(`  Back: The form + example + pronunciation`);
    console.log(`\nYou can study them at /hebrew/vocabulary or link them to lessons.`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seedNounEndingPatterns()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
