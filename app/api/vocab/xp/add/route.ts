/**
 * POST /api/vocab/xp/add
 *
 * Awards XP and checks for level ups & achievements
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';
import type postgres from 'postgres';

// XP required for each level (exponential growth)
const XP_PER_LEVEL = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  2000,   // Level 6
  3500,   // Level 7
  5500,   // Level 8
  8000,   // Level 9
  11000,  // Level 10
  15000,  // Level 11
  20000,  // Level 12
  26000,  // Level 13
  33000,  // Level 14
  41000,  // Level 15
];

function calculateLevel(xp: number): number {
  for (let level = XP_PER_LEVEL.length - 1; level >= 0; level--) {
    if (xp >= XP_PER_LEVEL[level]) {
      return level + 1;
    }
  }
  return 1;
}

export async function POST(request: NextRequest) {
  // Check authentication
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    const body = await request.json();
    const { xpAmount } = body;

    if (!xpAmount || xpAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid XP amount' },
        { status: 400 }
      );
    }

    // Get or create user stats
    let statsResult = await sql`
      SELECT * FROM user_stats WHERE user_id = ${user.id}
    `;

    if (statsResult.length === 0) {
      await sql`
        INSERT INTO user_stats (user_id)
        VALUES (${user.id})
      `;
      statsResult = await sql`
        SELECT * FROM user_stats WHERE user_id = ${user.id}
      `;
    }

    const currentStats = statsResult[0];

    const oldXP = currentStats.xp || 0;
    const oldLevel = currentStats.level || 1;
    const newXP = oldXP + xpAmount;
    const newLevel = calculateLevel(newXP);

    const leveledUp = newLevel > oldLevel;

    // Update user stats
    await sql`
      UPDATE user_stats
      SET
        xp = ${newXP},
        level = ${newLevel},
        updated_at = NOW()
      WHERE user_id = ${user.id}
    `;

    // Check for newly unlocked achievements
    const unlockedAchievements = await checkAchievements(sql, currentStats, user.id);

    return NextResponse.json({
      success: true,
      xpGained: xpAmount,
      totalXP: newXP,
      level: newLevel,
      leveledUp,
      oldLevel,
      newLevel,
      xpToNextLevel: XP_PER_LEVEL[newLevel] - newXP,
      unlockedAchievements,
    });
  } catch (error) {
    console.error('Error adding XP:', error);
    return NextResponse.json(
      { error: 'Failed to add XP' },
      { status: 500 }
    );
  }
}

interface UserStats {
  total_reviews?: number;
  streak?: number;
  words_mastered?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

async function checkAchievements(
  sql: ReturnType<typeof postgres>,
  stats: UserStats,
  userId: string
): Promise<Achievement[]> {
  const unlocked: Achievement[] = [];

  // Check for achievements based on current stats
  const achievements = [
    {
      id: 'first-card',
      condition: (stats.total_reviews || 0) >= 1,
    },
    {
      id: 'ten-cards',
      condition: (stats.total_reviews || 0) >= 10,
    },
    {
      id: 'fifty-cards',
      condition: (stats.total_reviews || 0) >= 50,
    },
    {
      id: 'hundred-cards',
      condition: (stats.total_reviews || 0) >= 100,
    },
    {
      id: 'streak-3',
      condition: (stats.streak || 0) >= 3,
    },
    {
      id: 'streak-7',
      condition: (stats.streak || 0) >= 7,
    },
    {
      id: 'streak-30',
      condition: (stats.streak || 0) >= 30,
    },
    {
      id: 'master-10',
      condition: (stats.words_mastered || 0) >= 10,
    },
    {
      id: 'master-50',
      condition: (stats.words_mastered || 0) >= 50,
    },
  ];

  for (const achievement of achievements) {
    if (achievement.condition) {
      // Check if already unlocked for this user
      const progress = await sql`
        SELECT * FROM achievement_progress
        WHERE achievement_id = ${achievement.id} AND user_id = ${userId}
      `;

      if (progress.length === 0) {
        // Create achievement progress and unlock it
        await sql`
          INSERT INTO achievement_progress (user_id, achievement_id, unlocked, unlocked_at)
          VALUES (${userId}, ${achievement.id}, true, NOW())
        `;

        // Get achievement details
        const achDetails = await sql`
          SELECT * FROM achievements WHERE id = ${achievement.id}
        `;

        if (achDetails[0]) {
          unlocked.push(achDetails[0] as Achievement);

          // Award XP bonus
          if (achDetails[0].xp_reward > 0) {
            await sql`
              UPDATE user_stats
              SET xp = xp + ${achDetails[0].xp_reward}
              WHERE user_id = ${userId}
            `;
          }
        }
      } else if (!progress[0].unlocked) {
        // Unlock it!
        await sql`
          UPDATE achievement_progress
          SET
            unlocked = true,
            unlocked_at = NOW()
          WHERE achievement_id = ${achievement.id} AND user_id = ${userId}
        `;

        // Get achievement details
        const achDetails = await sql`
          SELECT * FROM achievements WHERE id = ${achievement.id}
        `;

        if (achDetails[0]) {
          unlocked.push(achDetails[0] as Achievement);

          // Award XP bonus
          if (achDetails[0].xp_reward > 0) {
            await sql`
              UPDATE user_stats
              SET xp = xp + ${achDetails[0].xp_reward}
              WHERE user_id = ${userId}
            `;
          }
        }
      }
    }
  }

  return unlocked;
}
