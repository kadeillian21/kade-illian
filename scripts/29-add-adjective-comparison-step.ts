/**
 * Add Adjective Comparison Step to Week 6 Lesson
 *
 * This script adds an interactive adjective comparison step that shows
 * masculine and feminine forms side-by-side with quiz mode.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function addAdjectiveComparisonStep() {
  console.log('🚀 Adding Adjective Comparison Step to Week 6...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // First, update the check constraint to allow 'adjective-comparison'
    console.log('📝 Updating step_type constraint to allow adjective-comparison...');

    // Drop the old constraint
    await sql`
      ALTER TABLE lesson_steps
      DROP CONSTRAINT IF EXISTS lesson_steps_step_type_check
    `;

    // Add the new constraint with adjective-comparison included
    await sql`
      ALTER TABLE lesson_steps
      ADD CONSTRAINT lesson_steps_step_type_check
      CHECK (step_type IN ('objective', 'concept', 'adjective-comparison', 'scripture', 'vocabulary', 'quiz', 'completion'))
    `;

    console.log('✅ Constraint updated successfully');

    const lessonId = 'hebrew-week-6-adjectives';

    // The 15 adjective pairs from the vocab set
    const adjectivePairs = [
      {
        masculine: { hebrew: 'טוֹב', transliteration: 'tov', pronunciation: 'TOHV' },
        feminine: { hebrew: 'טוֹבָה', transliteration: 'tovah', pronunciation: 'toh-VAH' },
        english: 'good',
        notes: 'Most common adjective in Hebrew Bible. Notice the qamats-he (ָה) ending for feminine.',
        patternType: 'regular' as const,
      },
      {
        masculine: { hebrew: 'רַע', transliteration: 'ra', pronunciation: 'RAH' },
        feminine: { hebrew: 'רָעָה', transliteration: 'raah', pronunciation: 'rah-AH' },
        english: 'bad, evil',
        notes: 'Opposite of טוֹב. The feminine doubles the final ע in pronunciation.',
        patternType: 'regular' as const,
      },
      {
        masculine: { hebrew: 'גָּדוֹל', transliteration: 'gadol', pronunciation: 'gah-DOHL' },
        feminine: { hebrew: 'גְּדוֹלָה', transliteration: 'gedolah', pronunciation: 'ge-doh-LAH' },
        english: 'great, big',
        notes: 'Notice the vowel change: qamats becomes shewa in the feminine form.',
        patternType: 'irregular' as const,
      },
      {
        masculine: { hebrew: 'קָטֹן', transliteration: 'qaton', pronunciation: 'kah-TOHN' },
        feminine: { hebrew: 'קְטַנָּה', transliteration: 'qetanah', pronunciation: 'ke-tah-NAH' },
        english: 'small',
        notes: 'Opposite of גָּדוֹל. The feminine form has vowel changes and a dagesh in the nun.',
        patternType: 'irregular' as const,
      },
      {
        masculine: { hebrew: 'חָדָשׁ', transliteration: 'chadash', pronunciation: 'khah-DAHSH' },
        feminine: { hebrew: 'חֲדָשָׁה', transliteration: 'chadashah', pronunciation: 'khah-dah-SHAH' },
        english: 'new',
        patternType: 'regular' as const,
      },
      {
        masculine: { hebrew: 'יָשָׁן', transliteration: 'yashan', pronunciation: 'yah-SHAHN' },
        feminine: { hebrew: 'יְשָׁנָה', transliteration: 'yeshanah', pronunciation: 'ye-shah-NAH' },
        english: 'old',
        notes: 'Opposite of חָדָשׁ.',
        patternType: 'irregular' as const,
      },
      {
        masculine: { hebrew: 'קָדוֹשׁ', transliteration: 'qadosh', pronunciation: 'kah-DOHSH' },
        feminine: { hebrew: 'קְדוֹשָׁה', transliteration: 'qedoshah', pronunciation: 'ke-doh-SHAH' },
        english: 'holy',
        notes: 'Very important theological term. Root: ק-ד-שׁ (holiness).',
        patternType: 'irregular' as const,
      },
      {
        masculine: { hebrew: 'צַדִּיק', transliteration: 'tsadiq', pronunciation: 'tsah-DEEK' },
        feminine: { hebrew: 'צְדִיקָה', transliteration: 'tsediqah', pronunciation: 'tse-dee-KAH' },
        english: 'righteous',
        notes: 'Root: צ-ד-ק (righteousness). Key theological vocabulary.',
        patternType: 'irregular' as const,
      },
      {
        masculine: { hebrew: 'רָחוֹק', transliteration: 'rachoq', pronunciation: 'rah-KHOHK' },
        feminine: { hebrew: 'רְחוֹקָה', transliteration: 'rechoqah', pronunciation: 're-khoh-KAH' },
        english: 'far',
        patternType: 'irregular' as const,
      },
      {
        masculine: { hebrew: 'קָרוֹב', transliteration: 'qarov', pronunciation: 'kah-ROHV' },
        feminine: { hebrew: 'קְרוֹבָה', transliteration: 'qerovah', pronunciation: 'ke-roh-VAH' },
        english: 'near',
        notes: 'Opposite of רָחוֹק.',
        patternType: 'irregular' as const,
      },
      {
        masculine: { hebrew: 'חַי', transliteration: 'chai', pronunciation: 'KHAY' },
        feminine: { hebrew: 'חַיָּה', transliteration: 'chayah', pronunciation: 'khah-YAH' },
        english: 'living, alive',
        notes: 'Root: ח-י-ה (to live). The feminine form is also the word for "animal"!',
        patternType: 'regular' as const,
      },
      {
        masculine: { hebrew: 'מֵת', transliteration: 'met', pronunciation: 'MAYT' },
        feminine: { hebrew: 'מֵתָה', transliteration: 'metah', pronunciation: 'may-TAH' },
        english: 'dead',
        notes: 'Opposite of חַי.',
        patternType: 'regular' as const,
      },
      {
        masculine: { hebrew: 'רַב', transliteration: 'rav', pronunciation: 'RAHV' },
        feminine: { hebrew: 'רַבָּה', transliteration: 'rabah', pronunciation: 'rah-BAH' },
        english: 'many, much',
        notes: 'Also means "great" in some contexts. The title "Rabbi" comes from this root.',
        patternType: 'regular' as const,
      },
      {
        masculine: { hebrew: 'עָשִׁיר', transliteration: 'ashir', pronunciation: 'ah-SHEER' },
        feminine: { hebrew: 'עֲשִׁירָה', transliteration: 'ashirah', pronunciation: 'ah-shee-RAH' },
        english: 'rich',
        patternType: 'regular' as const,
      },
      {
        masculine: { hebrew: 'עָנִי', transliteration: 'ani', pronunciation: 'ah-NEE' },
        feminine: { hebrew: 'עֲנִיָּה', transliteration: 'aniyah', pronunciation: 'ah-nee-YAH' },
        english: 'poor',
        notes: 'Opposite of עָשִׁיר. Often used in Psalms to describe the humble who cry out to God.',
        patternType: 'irregular' as const,
      },
    ];

    const stepContent = {
      title: 'Masculine & Feminine Forms',
      description: 'Master Hebrew adjective gender by seeing masculine and feminine forms side by side. Study them, then test yourself!',
      adjectives: adjectivePairs,
      patternExplanation: {
        title: 'The Feminine Ending Pattern',
        rules: [
          'Most feminine adjectives add ָה (qamats + he) to the masculine form',
          'The qamats (ָ) makes an "ah" sound, and the he (ה) is silent',
          'Regular pattern: טוֹב → טוֹבָה (tov → tovah)',
          'Irregular adjectives may have vowel changes in addition to the ָה ending',
          'Look for the ָה ending as your primary feminine marker',
        ],
        exceptions: [
          'Some adjectives have internal vowel changes (גָּדוֹל → גְּדוֹלָה)',
          'Two-letter adjectives often add יָ before the ה (חַי → חַיָּה)',
          'Words ending in י may change the pattern slightly',
        ],
      },
      practiceMode: 'view',
    };

    // First, check current steps
    const existingSteps = await sql`
      SELECT id, step_number, step_type FROM lesson_steps
      WHERE lesson_id = ${lessonId}
      ORDER BY step_number ASC
    `;

    console.log(`📊 Found ${existingSteps.length} existing steps for Week 6`);
    existingSteps.forEach((s: any) => console.log(`  Step ${s.step_number}: ${s.step_type}`));

    // Delete existing adjective-comparison step if it exists
    const deleted = await sql`
      DELETE FROM lesson_steps
      WHERE lesson_id = ${lessonId}
      AND step_type = 'adjective-comparison'
      RETURNING id
    `;
    if (deleted.length > 0) {
      console.log('🗑️  Removed existing adjective-comparison step');
    }

    // Get fresh list after deletion
    const stepsAfterDelete = await sql`
      SELECT id, step_number, step_type FROM lesson_steps
      WHERE lesson_id = ${lessonId}
      ORDER BY step_number ASC
    `;

    // Shift steps from position 3 onwards to make room for the new step
    // We need to do this in reverse order to avoid unique constraint violations
    const stepsToShift = stepsAfterDelete.filter((s: any) => s.step_number >= 3);

    // Sort in descending order and update one by one
    stepsToShift.sort((a: any, b: any) => b.step_number - a.step_number);

    for (const step of stepsToShift) {
      await sql`
        UPDATE lesson_steps
        SET step_number = ${step.step_number + 1},
            order_index = ${step.step_number + 1}
        WHERE id = ${step.id}
      `;
    }

    console.log(`📤 Shifted ${stepsToShift.length} steps to make room`);

    // Insert the new adjective comparison step at position 3
    await sql`
      INSERT INTO lesson_steps (
        lesson_id,
        step_number,
        step_type,
        content,
        order_index
      ) VALUES (
        ${lessonId},
        3,
        'adjective-comparison',
        ${JSON.stringify(stepContent)},
        3
      )
    `;

    console.log('✅ Added adjective-comparison step at position 3');

    // Verify the new step order
    const updatedSteps = await sql`
      SELECT step_number, step_type FROM lesson_steps
      WHERE lesson_id = ${lessonId}
      ORDER BY step_number ASC
    `;

    console.log('\n📋 Updated step order:');
    updatedSteps.forEach((step: any) => {
      console.log(`  Step ${step.step_number}: ${step.step_type}`);
    });

    console.log('\n✅ Successfully added Adjective Comparison step to Week 6!');
    console.log('\n🔗 View at: /hebrew/lessons/hebrew-week-6-adjectives/interactive');

  } catch (error) {
    console.error('❌ Error adding step:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

addAdjectiveComparisonStep()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
