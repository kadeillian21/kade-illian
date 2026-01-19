/**
 * Migrate User Progress to Database
 *
 * Migrates existing user progress from JSON file to Postgres
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import postgres from 'postgres';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateProgress() {
  console.log('🚀 Migrating user progress to database...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Read existing progress file
    const progressPath = path.join(process.cwd(), 'app/hebrew/vocabulary/data/user-progress.json');

    if (!fs.existsSync(progressPath)) {
      console.log('⚠️  No progress file found. Skipping progress migration.');
      console.log('   This is normal for a fresh installation.\n');
      await sql.end();
      return;
    }

    const progressData = fs.readFileSync(progressPath, 'utf-8');
    const progress = JSON.parse(progressData);

    // 1. Update user_stats
    console.log('📊 Updating user stats...');
    await sql`
      UPDATE user_stats SET
        last_studied = ${progress.lastStudied || null},
        total_reviews = ${progress.totalReviews || 0},
        words_learned = ${progress.wordsLearned || 0},
        words_mastered = ${progress.wordsMastered || 0},
        streak = ${progress.streak || 0},
        updated_at = NOW()
      WHERE id = 1
    `;
    console.log('✅ User stats updated\n');

    // 2. Insert word progress
    const wordProgressEntries = Object.entries(progress.wordProgress || {});

    if (wordProgressEntries.length === 0) {
      console.log('ℹ️  No word progress to migrate.\n');
      console.log('🎉 Progress migration complete!\n');
      await sql.end();
      return;
    }

    console.log(`📝 Migrating progress for ${wordProgressEntries.length} words...`);

    let migratedCount = 0;
    for (const [wordId, wordProgress] of wordProgressEntries) {
      const wp = wordProgress as any;

      await sql`
        INSERT INTO user_progress (
          word_id,
          level,
          next_review,
          last_reviewed,
          review_count,
          correct_count
        ) VALUES (
          ${wordId},
          ${wp.level || 0},
          ${wp.nextReview || null},
          ${wp.lastReviewed || null},
          ${wp.reviewCount || 0},
          ${wp.correctCount || 0}
        )
        ON CONFLICT (word_id) DO UPDATE SET
          level = EXCLUDED.level,
          next_review = EXCLUDED.next_review,
          last_reviewed = EXCLUDED.last_reviewed,
          review_count = EXCLUDED.review_count,
          correct_count = EXCLUDED.correct_count,
          updated_at = NOW()
      `;
      migratedCount++;
    }

    console.log(`✅ Successfully migrated progress for ${migratedCount} words!\n`);

    // 3. Verify migration
    const result = await sql`
      SELECT COUNT(*) as count FROM user_progress
    `;
    const count = result[0].count;

    console.log('🔍 Verification:');
    console.log(`   Database has progress for ${count} words`);

    if (Number(count) === wordProgressEntries.length) {
      console.log('   ✅ Progress count matches!\n');
    } else {
      console.log(`   ⚠️  Count mismatch! Expected ${wordProgressEntries.length}, got ${count}\n`);
    }

    // Show stats
    const stats = await sql`SELECT * FROM user_stats WHERE id = 1`;
    const userStats = stats[0];

    console.log('📈 Your Progress:');
    console.log(`   Total Reviews: ${userStats.total_reviews}`);
    console.log(`   Words Learned: ${userStats.words_learned}`);
    console.log(`   Words Mastered: ${userStats.words_mastered}`);
    console.log(`   Current Streak: ${userStats.streak} days`);

    console.log('\n🎉 Progress migration complete!');
    console.log('\nYou can now build the API routes and admin interface!');

  } catch (error) {
    console.error('❌ Error migrating progress:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

migrateProgress()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
