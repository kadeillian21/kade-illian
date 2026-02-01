/**
 * Add Pronunciation to ALL Grammar Cards
 *
 * Updates existing grammar flashcard sets to include pronunciation guides
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function addPronunciation() {
  console.log('🚀 Adding pronunciation to grammar cards...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Define pronunciation updates for each card
    const updates = [
      // Gender & Number Practice
      { id: 'gender-number-practice-melekh', pronunciation: 'MEH-lekh' },
      { id: 'gender-number-practice-melakhim', pronunciation: 'meh-lah-KHEEM' },
      { id: 'gender-number-practice-malkah', pronunciation: 'mal-KAH' },
      { id: 'gender-number-practice-melakhot', pronunciation: 'meh-lah-KHOT' },
      { id: 'gender-number-practice-yad', pronunciation: 'YAHD' },
      { id: 'gender-number-practice-yadayim', pronunciation: 'yah-DAH-yeem' },
      { id: 'gender-number-practice-eretz', pronunciation: 'EH-retz' },
      { id: 'gender-number-practice-ir', pronunciation: 'EER' },

      // Definite Article Practice
      { id: 'definite-article-practice-ha', pronunciation: 'hah' },
      { id: 'definite-article-practice-ha', pronunciation: 'hah' },
      { id: 'definite-article-practice-he', pronunciation: 'heh' },
      { id: 'definite-article-practice-shamayim → ha-shamayim', pronunciation: 'shah-MAH-yeem → hah-shah-MAH-yeem' },

      // Preposition Forms
      { id: 'preposition-forms-practice-be', pronunciation: 'beh' },
      { id: 'preposition-forms-practice-le', pronunciation: 'leh' },
      { id: 'preposition-forms-practice-ke', pronunciation: 'keh' },
      { id: 'preposition-forms-practice-ba', pronunciation: 'bah' },
      { id: 'preposition-forms-practice-la', pronunciation: 'lah' },
      { id: 'preposition-forms-practice-ka', pronunciation: 'kah' },

      // Adjective Agreement
      { id: 'adjective-agreement-practice-tov', pronunciation: 'TOHV' },
      { id: 'adjective-agreement-practice-tovah', pronunciation: 'toh-VAH' },
      { id: 'adjective-agreement-practice-tovim', pronunciation: 'toh-VEEM' },
      { id: 'adjective-agreement-practice-tovot', pronunciation: 'toh-VOHT' },
      { id: 'adjective-agreement-practice-ha-melekh ha-tov', pronunciation: 'hah-MEH-lekh hah-TOHV' },
    ];

    console.log('📝 Updating grammar cards with pronunciation...\n');

    for (const update of updates) {
      // Get current word data
      const rows = await sql`
        SELECT id, extra_data FROM vocab_words WHERE id = ${update.id}
      `;

      if (rows.length > 0) {
        const currentData = rows[0].extra_data || {};
        const updatedData = {
          ...currentData,
          pronunciation: update.pronunciation
        };

        await sql`
          UPDATE vocab_words
          SET extra_data = ${JSON.stringify(updatedData)}
          WHERE id = ${update.id}
        `;

        console.log(`  ✅ ${update.id}: ${update.pronunciation}`);
      } else {
        console.log(`  ⚠️  ${update.id}: Not found`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Pronunciation added to all grammar cards!\n');

  } catch (error) {
    console.error('❌ Error adding pronunciation:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

addPronunciation()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
