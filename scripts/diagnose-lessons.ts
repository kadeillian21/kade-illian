/**
 * Diagnostic script to check lessons in production database
 * Run: npx tsx scripts/diagnose-lessons.ts
 */

import postgres from 'postgres';

async function diagnoseLessons() {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ POSTGRES_URL environment variable not set');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    console.log('🔍 Checking database connection...\n');

    // Check if lessons table exists
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('lessons', 'lesson_steps', 'user_lesson_progress')
    `;

    console.log('📋 Found tables:', tablesResult.map(t => t.table_name).join(', '));
    console.log('');

    // Count lessons
    const lessonsCount = await sql`
      SELECT COUNT(*) as count FROM lessons
    `;
    console.log(`📚 Total lessons: ${lessonsCount[0].count}`);

    // List all lessons
    const lessons = await sql`
      SELECT id, title, week_number, language_id
      FROM lessons
      ORDER BY week_number
    `;

    if (lessons.length > 0) {
      console.log('\n📖 Lessons in database:');
      lessons.forEach((lesson: any) => {
        console.log(`  - Week ${lesson.week_number}: ${lesson.title} (${lesson.id})`);
      });
    } else {
      console.log('\n⚠️  No lessons found in database!');
      console.log('   Run: npx tsx scripts/08-seed-hebrew-lessons.ts');
    }

    // Check for interactive steps
    if (tablesResult.some(t => t.table_name === 'lesson_steps')) {
      const stepsCount = await sql`
        SELECT COUNT(*) as count FROM lesson_steps
      `;
      console.log(`\n🎯 Total interactive steps: ${stepsCount[0].count}`);

      if (stepsCount[0].count > 0) {
        const lessonsWithSteps = await sql`
          SELECT l.id, l.title, COUNT(ls.id) as step_count
          FROM lessons l
          INNER JOIN lesson_steps ls ON l.id = ls.lesson_id
          GROUP BY l.id, l.title
          ORDER BY l.week_number
        `;

        console.log('\n✨ Lessons with interactive steps:');
        lessonsWithSteps.forEach((lesson: any) => {
          console.log(`  - ${lesson.title}: ${lesson.step_count} steps`);
        });
      }
    }

    console.log('\n✅ Diagnostic complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

diagnoseLessons();
