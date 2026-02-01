/**
 * Check and Fix Pronunciation Data
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkPronunciation() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error('POSTGRES_URL or POSTGRES_URL_NON_POOLING must be set');
  }

  const sql = postgres(connectionString);

  try {
    console.log('🔍 Checking pronunciation data...\n');

    const cards = await sql`
      SELECT id, hebrew, english, extra_data
      FROM vocab_words
      WHERE set_id = 'gender-number-practice'
      LIMIT 2
    `;

    console.log('Sample cards:');
    cards.forEach(card => {
      console.log(`\nCard: ${card.id}`);
      console.log(`Hebrew: ${card.hebrew}`);
      console.log(`English: ${card.english}`);
      console.log(`extra_data:`, JSON.stringify(card.extra_data, null, 2));
    });

    // Now let's fix it properly - add pronunciation directly to extra_data
    console.log('\n\n📝 Adding pronunciation to all gender-number cards...\n');

    const pronunciations: Record<string, string> = {
      'gender-number-practice-melekh': 'MEH-lekh',
      'gender-number-practice-melakhim': 'meh-lah-KHEEM',
      'gender-number-practice-malkah': 'mal-KAH',
      'gender-number-practice-melakhot': 'meh-lah-KHOT',
      'gender-number-practice-yad': 'YAHD',
      'gender-number-practice-yadayim': 'yah-DAH-yeem',
      'gender-number-practice-eretz': 'EH-retz',
      'gender-number-practice-ir': 'EER',
    };

    for (const [id, pronunciation] of Object.entries(pronunciations)) {
      // Get current extra_data
      const current = await sql`SELECT extra_data FROM vocab_words WHERE id = ${id}`;

      if (current.length > 0) {
        const currentData = current[0].extra_data || {};
        const updatedData = {
          ...currentData,
          pronunciation
        };

        await sql`
          UPDATE vocab_words
          SET extra_data = ${sql.json(updatedData)}
          WHERE id = ${id}
        `;

        console.log(`  ✅ ${id}: Added "${pronunciation}"`);
      }
    }

    // Verify
    console.log('\n\n✅ Verification:');
    const verify = await sql`
      SELECT id, hebrew, extra_data
      FROM vocab_words
      WHERE set_id = 'gender-number-practice'
    `;

    verify.forEach(card => {
      console.log(`  ${card.hebrew}: ${card.extra_data?.pronunciation || 'MISSING'}`);
    });

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

checkPronunciation()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
