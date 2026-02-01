import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyLessons() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    console.log('📚 Checking lessons in database...\n');

    const lessons = await sql`
      SELECT id, title, week_number, language_id
      FROM lessons
      ORDER BY week_number
    `;

    if (lessons.length === 0) {
      console.log('⚠️  No lessons found in database');
      console.log('Run: npx tsx scripts/08-seed-hebrew-lessons.ts');
    } else {
      console.log(`Found ${lessons.length} lessons:\n`);
      lessons.forEach(lesson => {
        console.log(`  • ${lesson.id}`);
        console.log(`    Week ${lesson.week_number}: ${lesson.title}`);
        console.log(`    Language: ${lesson.language_id}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

verifyLessons();
