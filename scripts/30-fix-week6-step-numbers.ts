/**
 * Fix Week 6 lesson step numbers
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixStepNumbers() {
  console.log('🔧 Fixing Week 6 step numbers...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);
  const lessonId = 'hebrew-week-6-adjectives';

  try {
    const steps = await sql`
      SELECT id, step_number, step_type FROM lesson_steps
      WHERE lesson_id = ${lessonId}
      ORDER BY step_number ASC
    `;

    console.log('Current steps:');
    steps.forEach((s: any) => console.log(`  ${s.step_number}: ${s.step_type}`));

    // Temporarily set all to high numbers to avoid unique constraint issues
    for (let i = 0; i < steps.length; i++) {
      await sql`
        UPDATE lesson_steps
        SET step_number = ${100 + i}, order_index = ${100 + i}
        WHERE id = ${steps[i].id}
      `;
    }

    // Now set proper sequential numbers
    for (let i = 0; i < steps.length; i++) {
      const newNum = i + 1;
      await sql`
        UPDATE lesson_steps
        SET step_number = ${newNum}, order_index = ${newNum}
        WHERE id = ${steps[i].id}
      `;
    }

    const fixed = await sql`
      SELECT step_number, step_type FROM lesson_steps
      WHERE lesson_id = ${lessonId}
      ORDER BY step_number ASC
    `;

    console.log('\n✅ Fixed steps:');
    fixed.forEach((s: any) => console.log(`  Step ${s.step_number}: ${s.step_type}`));

  } finally {
    await sql.end();
  }
}

fixStepNumbers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
