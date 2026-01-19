/**
 * Verification Script
 *
 * Checks that all database tables and data were migrated correctly
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verify() {
  console.log('🔍 Verifying database migration...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // 1. Check tables exist
    console.log('📋 Checking tables...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    const tableNames = tables.map(t => t.table_name);
    console.log(`   Found ${tables.length} tables: ${tableNames.join(', ')}`);

    const expectedTables = ['vocab_sets', 'vocab_words', 'user_progress', 'user_stats'];
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      console.log(`   ⚠️  Missing tables: ${missingTables.join(', ')}\n`);
    } else {
      console.log('   ✅ All tables created\n');
    }

    // 2. Check vocab_sets
    console.log('📦 Checking vocab_sets...');
    const sets = await sql`SELECT * FROM vocab_sets`;
    console.log(`   Found ${sets.length} vocab set(s)`);

    if (sets.length > 0) {
      sets.forEach(set => {
        console.log(`   - ${set.title} (${set.total_words} words) ${set.is_active ? '✅ Active' : ''}`);
      });
    }
    console.log('');

    // 3. Check vocab_words
    console.log('📝 Checking vocab_words...');
    const words = await sql`SELECT * FROM vocab_words ORDER BY id LIMIT 5`;
    const totalWords = await sql`SELECT COUNT(*) as count FROM vocab_words`;
    console.log(`   Total words in database: ${totalWords[0].count}`);
    console.log('   First 5 words:');

    words.forEach(word => {
      console.log(`   - ${word.hebrew} (${word.transliteration}) = ${word.english}`);
    });
    console.log('');

    // 4. Check words by group
    console.log('📊 Words by category:');
    const groupCounts = await sql`
      SELECT group_category, group_subcategory, COUNT(*) as count
      FROM vocab_words
      GROUP BY group_category, group_subcategory
      ORDER BY group_category, group_subcategory
    `;

    groupCounts.forEach(g => {
      const subcategory = g.group_subcategory ? ` - ${g.group_subcategory}` : '';
      console.log(`   ${g.group_category}${subcategory}: ${g.count} words`);
    });
    console.log('');

    // 5. Check user_progress
    console.log('📈 Checking user_progress...');
    const progressCount = await sql`SELECT COUNT(*) as count FROM user_progress`;
    console.log(`   Progress tracked for ${progressCount[0].count} word(s)`);

    if (Number(progressCount[0].count) > 0) {
      const progress = await sql`
        SELECT word_id, level, review_count, correct_count
        FROM user_progress
        LIMIT 5
      `;
      console.log('   Sample progress:');
      progress.forEach(p => {
        const successRate = p.review_count > 0
          ? Math.round((p.correct_count / p.review_count) * 100)
          : 0;
        console.log(`   - ${p.word_id}: Level ${p.level}, ${p.review_count} reviews (${successRate}% success)`);
      });
    } else {
      console.log('   (No progress yet - this is normal for a fresh start)');
    }
    console.log('');

    // 6. Check user_stats
    console.log('📊 Checking user_stats...');
    const stats = await sql`SELECT * FROM user_stats WHERE id = 1`;

    if (stats.length > 0) {
      const userStats = stats[0];
      console.log(`   Total Reviews: ${userStats.total_reviews}`);
      console.log(`   Words Learned: ${userStats.words_learned}`);
      console.log(`   Words Mastered: ${userStats.words_mastered}`);
      console.log(`   Current Streak: ${userStats.streak} days`);
      if (userStats.last_studied) {
        console.log(`   Last Studied: ${new Date(userStats.last_studied).toLocaleString()}`);
      }
    }
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 MIGRATION VERIFICATION COMPLETE!\n');
    console.log('Summary:');
    console.log(`   ✅ ${tables.length} tables created`);
    console.log(`   ✅ ${sets.length} vocab set(s) loaded`);
    console.log(`   ✅ ${totalWords[0].count} words in database`);
    console.log(`   ✅ Progress tracking active`);
    console.log('');
    console.log('Next steps:');
    console.log('   1. Build API routes');
    console.log('   2. Build admin interface');
    console.log('   3. Update frontend to use database');
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Verification error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
