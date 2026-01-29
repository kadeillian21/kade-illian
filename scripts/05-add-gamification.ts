/**
 * Add gamification features: XP, levels, achievements, daily goals
 */

import { config } from 'dotenv';
import postgres from 'postgres';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function addGamification() {
  const sql = postgres(process.env.POSTGRES_URL!, {
    max: 1,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Adding gamification features...\n');

    // Add XP and level columns to user_stats
    console.log('1. Adding XP and level tracking...');
    await sql`
      ALTER TABLE user_stats
      ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 20,
      ADD COLUMN IF NOT EXISTS cards_today INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_goal_reset DATE DEFAULT CURRENT_DATE
    `;
    console.log('✅ XP and level tracking added!');

    // Create achievements table
    console.log('\n2. Creating achievements table...');
    await sql`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        xp_reward INTEGER DEFAULT 0,
        unlocked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Achievements table created!');

    // Add initial achievements
    console.log('\n3. Adding starter achievements...');

    const achievements = [
      {
        id: 'first-card',
        name: 'First Steps',
        description: 'Study your first card',
        icon: '🎯',
        xp_reward: 10,
      },
      {
        id: 'ten-cards',
        name: 'Getting Started',
        description: 'Study 10 cards',
        icon: '📚',
        xp_reward: 50,
      },
      {
        id: 'fifty-cards',
        name: 'Dedicated Student',
        description: 'Study 50 cards',
        icon: '⭐',
        xp_reward: 100,
      },
      {
        id: 'hundred-cards',
        name: 'Century Club',
        description: 'Study 100 cards',
        icon: '💯',
        xp_reward: 250,
      },
      {
        id: 'streak-3',
        name: '3-Day Streak',
        description: 'Study 3 days in a row',
        icon: '🔥',
        xp_reward: 75,
      },
      {
        id: 'streak-7',
        name: 'Week Warrior',
        description: 'Study 7 days in a row',
        icon: '⚡',
        xp_reward: 200,
      },
      {
        id: 'streak-30',
        name: 'Monthly Master',
        description: 'Study 30 days in a row',
        icon: '👑',
        xp_reward: 1000,
      },
      {
        id: 'perfect-session',
        name: 'Perfect Score',
        description: 'Get 10 cards correct in a row',
        icon: '🎖️',
        xp_reward: 150,
      },
      {
        id: 'master-10',
        name: 'Mastery Begins',
        description: 'Master 10 words (level 5+)',
        icon: '🌟',
        xp_reward: 200,
      },
      {
        id: 'master-50',
        name: 'Hebrew Scholar',
        description: 'Master 50 words (level 5+)',
        icon: '🎓',
        xp_reward: 500,
      },
      {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Study before 8am',
        icon: '🌅',
        xp_reward: 50,
      },
      {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Study after 10pm',
        icon: '🦉',
        xp_reward: 50,
      },
      {
        id: 'speed-demon',
        name: 'Speed Demon',
        description: 'Complete 20 cards in under 5 minutes',
        icon: '⚡',
        xp_reward: 100,
      },
      {
        id: 'marathon',
        name: 'Marathon Session',
        description: 'Study for 30 minutes straight',
        icon: '🏃',
        xp_reward: 300,
      },
    ];

    for (const achievement of achievements) {
      await sql`
        INSERT INTO achievements (id, name, description, icon, xp_reward)
        VALUES (
          ${achievement.id},
          ${achievement.name},
          ${achievement.description},
          ${achievement.icon},
          ${achievement.xp_reward}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }

    console.log('✅ Added 14 achievements!');

    // Create achievement progress table
    console.log('\n4. Creating achievement progress table...');
    await sql`
      CREATE TABLE IF NOT EXISTS achievement_progress (
        achievement_id TEXT PRIMARY KEY,
        progress INTEGER DEFAULT 0,
        unlocked BOOLEAN DEFAULT FALSE,
        unlocked_at TIMESTAMP,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id)
      )
    `;
    console.log('✅ Achievement progress table created!');

    // Initialize achievement progress for all achievements
    console.log('\n5. Initializing achievement progress...');
    for (const achievement of achievements) {
      await sql`
        INSERT INTO achievement_progress (achievement_id, progress, unlocked)
        VALUES (${achievement.id}, 0, false)
        ON CONFLICT (achievement_id) DO NOTHING
      `;
    }
    console.log('✅ Achievement progress initialized!');

    console.log('\n🎉 Gamification system is ready!');
    console.log('\nFeatures added:');
    console.log('- XP and level tracking');
    console.log('- Daily goal system');
    console.log('- 14 achievements to unlock');
    console.log('- Achievement progress tracking');

  } catch (error) {
    console.error('Error adding gamification:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

addGamification();
