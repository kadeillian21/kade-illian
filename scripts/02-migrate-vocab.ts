/**
 * Migrate Existing Vocabulary to Database
 *
 * Migrates the Genesis 1:1-5 vocab set (30 words) from JSON to Postgres
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';
import genesis115 from '../app/hebrew/vocabulary/data/genesis-1-1-5.json';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateVocab() {
  console.log('🚀 Migrating Genesis 1:1-5 vocabulary to database...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // 1. Insert vocab set metadata
    console.log('📦 Creating vocab set:', genesis115.title);
    await sql`
      INSERT INTO vocab_sets (id, title, description, total_words, is_active)
      VALUES (
        ${genesis115.id},
        ${genesis115.title},
        ${genesis115.description},
        ${genesis115.totalWords},
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        total_words = EXCLUDED.total_words,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `;
    console.log('✅ Vocab set created\n');

    // 2. Insert all words
    console.log(`📝 Inserting ${genesis115.totalWords} words...`);
    let insertedCount = 0;

    for (const group of genesis115.groups) {
      console.log(`  → ${group.category}${group.subcategory ? ' - ' + group.subcategory : ''} (${group.words.length} words)`);

      for (const word of group.words) {
        await sql`
          INSERT INTO vocab_words (
            id,
            hebrew,
            transliteration,
            english,
            type,
            notes,
            semantic_group,
            frequency,
            set_id,
            group_category,
            group_subcategory
          ) VALUES (
            ${word.id},
            ${word.hebrew},
            ${word.trans},
            ${word.english},
            ${word.type},
            ${word.notes || ''},
            ${word.semanticGroup},
            ${word.frequency || null},
            ${genesis115.id},
            ${group.category},
            ${group.subcategory || null}
          )
          ON CONFLICT (id) DO UPDATE SET
            hebrew = EXCLUDED.hebrew,
            transliteration = EXCLUDED.transliteration,
            english = EXCLUDED.english,
            type = EXCLUDED.type,
            notes = EXCLUDED.notes,
            semantic_group = EXCLUDED.semantic_group,
            frequency = EXCLUDED.frequency,
            set_id = EXCLUDED.set_id,
            group_category = EXCLUDED.group_category,
            group_subcategory = EXCLUDED.group_subcategory,
            updated_at = NOW()
        `;
        insertedCount++;
      }
    }

    console.log(`\n✅ Successfully migrated ${insertedCount} words!\n`);

    // 3. Verify migration
    const result = await sql`
      SELECT COUNT(*) as count FROM vocab_words WHERE set_id = ${genesis115.id}
    `;
    const count = result[0].count;

    console.log('🔍 Verification:');
    console.log(`   Database has ${count} words for ${genesis115.title}`);

    if (Number(count) === genesis115.totalWords) {
      console.log('   ✅ Word count matches!\n');
    } else {
      console.log(`   ⚠️  Word count mismatch! Expected ${genesis115.totalWords}, got ${count}\n`);
    }

    console.log('🎉 Vocabulary migration complete!\n');
    console.log('Next step: Run npx tsx scripts/03-migrate-progress.ts');

  } catch (error) {
    console.error('❌ Error migrating vocabulary:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

migrateVocab()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
