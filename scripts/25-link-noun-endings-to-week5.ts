/**
 * Link Noun Ending Pattern Flashcards to Week 5 Step 2
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function linkNounEndingsToWeek5() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error('POSTGRES_URL or POSTGRES_URL_NON_POOLING must be set');
  }

  const sql = postgres(connectionString);

  try {
    console.log('🔗 Linking noun ending pattern flashcards to Week 5 Step 2...\n');

    // Find Step 2 of Week 5 (the concept step)
    const steps = await sql`
      SELECT id, step_number, content
      FROM lesson_steps
      WHERE lesson_id = 'hebrew-week-5-nouns'
        AND step_number = 2
        AND step_type = 'concept'
    `;

    if (steps.length === 0) {
      console.error('❌ Week 5 Step 2 not found');
      process.exit(1);
    }

    const step = steps[0];
    console.log(`✅ Found Step ${step.step_number}: ${step.content.conceptName}`);

    // Update the content to use noun-ending-patterns instead
    const updatedContent = {
      ...step.content,
      practiceVocabSetId: 'noun-ending-patterns'
    };

    await sql`
      UPDATE lesson_steps
      SET content = ${JSON.stringify(updatedContent)},
          updated_at = NOW()
      WHERE id = ${step.id}
    `;

    console.log('\n✅ Successfully updated Step 2!');
    console.log('   Changed practiceVocabSetId from "gender-number-practice" to "noun-ending-patterns"');
    console.log('\n🎉 Now when you view Week 5 Step 2, you\'ll see:');
    console.log('   1. Quick Reference table (teaching aid)');
    console.log('   2. Noun Ending Pattern flashcards (practice endings only)');
    console.log('\nVisit: http://localhost:3000/hebrew/lessons/hebrew-week-5-nouns/interactive/step/2');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

linkNounEndingsToWeek5()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
