/**
 * Seed Demonstrative Pronoun Flashcards for Week 6
 * Creates flashcards for Hebrew demonstratives (this, that, these)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedDemonstratives() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error('POSTGRES_URL or POSTGRES_URL_NON_POOLING must be set');
  }

  const sql = postgres(connectionString);

  try {
    console.log('🌱 Seeding demonstrative pronoun flashcards...\n');

    const setId = 'demonstratives-practice';
    const setTitle = 'Demonstratives (This, These)';
    const setDescription = 'Practice Hebrew demonstrative pronouns with gender agreement';

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

    // Define the demonstrative flashcards
    const cards = [
      {
        id: 'demonstratives-zeh',
        hebrew: 'זֶה',
        transliteration: 'zeh',
        english: 'this (masculine)',
        type: 'Demonstrative',
        notes: 'Used with masculine singular nouns',
        groupCategory: 'Demonstratives',
        groupSubcategory: 'Basic Forms',
        extraData: {
          pronunciation: 'ZEH',
          gender: 'masculine',
          number: 'singular'
        }
      },
      {
        id: 'demonstratives-zot',
        hebrew: 'זֹאת',
        transliteration: 'zot',
        english: 'this (feminine)',
        type: 'Demonstrative',
        notes: 'Used with feminine singular nouns',
        groupCategory: 'Demonstratives',
        groupSubcategory: 'Basic Forms',
        extraData: {
          pronunciation: 'ZOHT',
          gender: 'feminine',
          number: 'singular'
        }
      },
      {
        id: 'demonstratives-eleh',
        hebrew: 'אֵלֶּה',
        transliteration: 'eleh',
        english: 'these (plural)',
        type: 'Demonstrative',
        notes: 'Used with both masculine and feminine plural nouns',
        groupCategory: 'Demonstratives',
        groupSubcategory: 'Basic Forms',
        extraData: {
          pronunciation: 'AY-leh',
          gender: 'common',
          number: 'plural'
        }
      },
      {
        id: 'demonstratives-ha-zeh',
        hebrew: 'הַזֶּה',
        transliteration: 'ha-zeh',
        english: 'this (definite, masculine)',
        type: 'Demonstrative',
        notes: 'With definite article, follows a definite noun: הַמֶּלֶךְ הַזֶּה (this king)',
        groupCategory: 'Demonstratives',
        groupSubcategory: 'Definite Forms',
        extraData: {
          pronunciation: 'haz-ZEH',
          gender: 'masculine',
          number: 'singular'
        }
      },
      {
        id: 'demonstratives-ha-zot',
        hebrew: 'הַזֹּאת',
        transliteration: 'ha-zot',
        english: 'this (definite, feminine)',
        type: 'Demonstrative',
        notes: 'With definite article, follows a definite noun: הַמַּלְכָּה הַזֹּאת (this queen)',
        groupCategory: 'Demonstratives',
        groupSubcategory: 'Definite Forms',
        extraData: {
          pronunciation: 'haz-ZOHT',
          gender: 'feminine',
          number: 'singular'
        }
      },
      {
        id: 'demonstratives-ha-eleh',
        hebrew: 'הָאֵלֶּה',
        transliteration: 'ha-eleh',
        english: 'these (definite, plural)',
        type: 'Demonstrative',
        notes: 'With definite article, follows definite plural nouns',
        groupCategory: 'Demonstratives',
        groupSubcategory: 'Definite Forms',
        extraData: {
          pronunciation: 'ha-AY-leh',
          gender: 'common',
          number: 'plural'
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

    console.log(`\n✅ Successfully seeded ${cards.length} demonstrative cards!`);

    // Now link this set to Week 6 lesson
    console.log('\n🔗 Linking demonstratives to Week 6 lesson...');

    // First, check if the lesson step exists
    const weekSixStep = await sql`
      SELECT id FROM lesson_steps
      WHERE lesson_id = 'hebrew-week-6-adjectives'
        AND step_type = 'concept'
      LIMIT 1
    `;

    if (weekSixStep.length > 0) {
      const stepId = weekSixStep[0].id;

      // Update the step to include the demonstratives practice set
      await sql`
        UPDATE lesson_steps
        SET practice_vocab_set_id = ${setId}
        WHERE id = ${stepId}
      `;
      console.log(`  ✅ Linked demonstratives to Week 6 lesson step`);
    } else {
      console.log(`  ⚠️  Week 6 lesson step not found. You can manually link it later.`);
    }

    console.log(`\nYou can study demonstratives at /hebrew/vocabulary or in Week 6 lesson!`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seedDemonstratives()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
