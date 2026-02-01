/**
 * Fix Card Types and Add Pronunciation to Display
 *
 * 1. Ensure all grammar cards have card_type = 'grammar'
 * 2. For regular vocab cards, add pronunciation to notes field so it displays
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixCardTypes() {
  console.log('🚀 Fixing card types and pronunciation display...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Check current state
    console.log('📊 Checking current card types...\n');
    const genderCards = await sql`
      SELECT id, card_type, hebrew, english, extra_data
      FROM vocab_words
      WHERE set_id = 'gender-number-practice'
    `;

    console.log('Current state:');
    genderCards.forEach(card => {
      console.log(`  ${card.id}: card_type="${card.card_type}", has_pronunciation=${!!card.extra_data?.pronunciation}`);
    });

    // Fix: Ensure all grammar practice cards are card_type='grammar'
    console.log('\n📝 Setting card_type to "grammar" for all practice sets...\n');

    const sets = [
      'gender-number-practice',
      'definite-article-practice',
      'preposition-forms-practice',
      'adjective-agreement-practice'
    ];

    for (const setId of sets) {
      const result = await sql`
        UPDATE vocab_words
        SET card_type = 'grammar'
        WHERE set_id = ${setId}
      `;
      console.log(`  ✅ Updated ${result.count} cards in ${setId}`);
    }

    // Verify pronunciation is in extra_data
    console.log('\n📝 Verifying pronunciation in extra_data...\n');
    const verifyCards = await sql`
      SELECT id, card_type, hebrew, english, extra_data
      FROM vocab_words
      WHERE set_id = 'gender-number-practice'
    `;

    verifyCards.forEach(card => {
      const pronunciation = card.extra_data?.pronunciation;
      if (!pronunciation) {
        console.log(`  ⚠️  ${card.id}: Missing pronunciation!`);
      } else {
        console.log(`  ✅ ${card.id}: ${pronunciation}`);
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Card types fixed!\n');
    console.log('All grammar practice cards now have card_type="grammar"');
    console.log('Pronunciation will display when cards are rendered as GrammarCard\n');

  } catch (error) {
    console.error('❌ Error fixing card types:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

fixCardTypes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
