/**
 * POST /api/vocab/xp/add
 *
 * Awards XP and checks for level ups & achievements
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

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
  const sql = getDb();

  try {
    const body = await request.json();
    const { xpAmount, reason } = body;

    if (!xpAmount || xpAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid XP amount' },
        { status: 400 }
      );
    }

    // Get current stats
    const statsResult = await sql`
      SELECT * FROM user_stats WHERE id = 1
    `;
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
      WHERE id = 1
    `;

    // Check for newly unlocked achievements
    const unlockedAchievements = await checkAchievements(sql, currentStats);

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

async function checkAchievements(sql: any, stats: any) {
  const unlocked: any[] = [];

  // Check for achievements based on current stats
  const achievements = [
    {
      id: 'first-card',
      condition: stats.total_reviews >= 1,
    },
    {
      id: 'ten-cards',
      condition: stats.total_reviews >= 10,
    },
    {
      id: 'fifty-cards',
      condition: stats.total_reviews >= 50,
    },
    {
      id: 'hundred-cards',
      condition: stats.total_reviews >= 100,
    },
    {
      id: 'streak-3',
      condition: stats.streak >= 3,
    },
    {
      id: 'streak-7',
      condition: stats.streak >= 7,
    },
    {
      id: 'streak-30',
      condition: stats.streak >= 30,
    },
    {
      id: 'master-10',
      condition: stats.words_mastered >= 10,
    },
    {
      id: 'master-50',
      condition: stats.words_mastered >= 50,
    },
  ];

  for (const achievement of achievements) {
    if (achievement.condition) {
      // Check if already unlocked
      const progress = await sql`
        SELECT * FROM achievement_progress WHERE achievement_id = ${achievement.id}
      `;

      if (progress[0] && !progress[0].unlocked) {
        // Unlock it!
        await sql`
          UPDATE achievement_progress
          SET
            unlocked = true,
            unlocked_at = NOW()
          WHERE achievement_id = ${achievement.id}
        `;

        // Get achievement details
        const achDetails = await sql`
          SELECT * FROM achievements WHERE id = ${achievement.id}
        `;

        unlocked.push(achDetails[0]);

        // Award XP bonus
        if (achDetails[0].xp_reward > 0) {
          await sql`
            UPDATE user_stats
            SET xp = xp + ${achDetails[0].xp_reward}
            WHERE id = 1
          `;
        }
      }
    }
  }

  return unlocked;
}
