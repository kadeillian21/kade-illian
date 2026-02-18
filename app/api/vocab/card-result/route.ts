/**
 * POST /api/vocab/card-result
 *
 * Consolidated endpoint: handles progress update, XP award, and daily goal
 * in a single request. Replaces 3 separate API calls per card interaction.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

// XP required for each level (exponential growth)
const XP_PER_LEVEL = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000, 26000, 33000, 41000,
];

const XP_PER_CORRECT = 10;

function calculateLevel(xp: number): number {
  for (let level = XP_PER_LEVEL.length - 1; level >= 0; level--) {
    if (xp >= XP_PER_LEVEL[level]) {
      return level + 1;
    }
  }
  return 1;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    const body = await request.json();
    const { wordId, correct, level, nextReview, lastReviewed, reviewCount, correctCount } = body;

    if (!wordId || level === undefined || correct === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: wordId, correct, level' },
        { status: 400 }
      );
    }

    // 1. Upsert word progress
    await sql`
      INSERT INTO user_progress (
        user_id, word_id, level, next_review, last_reviewed,
        review_count, correct_count, updated_at
      ) VALUES (
        ${user.id}, ${wordId}, ${level}, ${nextReview || null},
        ${lastReviewed || null}, ${reviewCount || 0}, ${correctCount || 0}, NOW()
      )
      ON CONFLICT (user_id, word_id) DO UPDATE SET
        level = EXCLUDED.level,
        next_review = EXCLUDED.next_review,
        last_reviewed = EXCLUDED.last_reviewed,
        review_count = EXCLUDED.review_count,
        correct_count = EXCLUDED.correct_count,
        updated_at = NOW()
    `;

    // 2. Get or create user_stats
    let statsResult = await sql`
      SELECT * FROM user_stats WHERE user_id = ${user.id}
    `;

    if (statsResult.length === 0) {
      await sql`INSERT INTO user_stats (user_id) VALUES (${user.id})`;
      statsResult = await sql`SELECT * FROM user_stats WHERE user_id = ${user.id}`;
    }

    const currentStats = statsResult[0];

    // 3. Calculate streak (once per day, not per card)
    let newStreak = currentStats.streak || 0;
    if (currentStats.last_studied) {
      const lastStudied = new Date(currentStats.last_studied);
      const today = new Date();
      lastStudied.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - lastStudied.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Same day - keep streak unchanged
        newStreak = currentStats.streak;
      } else if (daysDiff === 1) {
        // Next day - increment streak
        newStreak = currentStats.streak + 1;
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // 4. Get word counts
    const countsResult = await sql`
      SELECT
        COUNT(CASE WHEN level >= 1 THEN 1 END) as words_learned,
        COUNT(CASE WHEN level >= 5 THEN 1 END) as words_mastered
      FROM user_progress
      WHERE user_id = ${user.id}
    `;
    const counts = countsResult[0];

    // 5. Calculate XP (only award on correct)
    const oldXP = currentStats.xp || 0;
    const oldLevel = currentStats.level || 1;
    const newXP = correct ? oldXP + XP_PER_CORRECT : oldXP;
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > oldLevel;

    // 6. Calculate daily goal
    const today = new Date().toISOString().split('T')[0];
    const lastReset = currentStats.last_goal_reset
      ? new Date(currentStats.last_goal_reset).toISOString().split('T')[0]
      : null;

    let cardsToday: number;
    if (lastReset !== today) {
      cardsToday = 1;
    } else {
      cardsToday = (currentStats.cards_today || 0) + 1;
    }

    const dailyGoal = currentStats.daily_goal || 20;
    const goalProgress = Math.min((cardsToday / dailyGoal) * 100, 100);
    const goalComplete = cardsToday >= dailyGoal;

    // 7. Single update for all stats
    await sql`
      UPDATE user_stats SET
        last_studied = NOW(),
        total_reviews = total_reviews + 1,
        words_learned = ${counts.words_learned || 0},
        words_mastered = ${counts.words_mastered || 0},
        streak = ${newStreak},
        xp = ${newXP},
        level = ${newLevel},
        cards_today = ${cardsToday},
        last_goal_reset = CURRENT_DATE,
        updated_at = NOW()
      WHERE user_id = ${user.id}
    `;

    // 8. Check achievements (only on correct to avoid unnecessary queries)
    let unlockedAchievements: Achievement[] = [];
    if (correct) {
      unlockedAchievements = await checkAchievements(sql, {
        total_reviews: (currentStats.total_reviews || 0) + 1,
        streak: newStreak,
        words_mastered: counts.words_mastered || 0,
      }, user.id);
    }

    return NextResponse.json({
      success: true,
      stats: {
        lastStudied: new Date().toISOString(),
        totalReviews: (currentStats.total_reviews || 0) + 1,
        wordsLearned: counts.words_learned || 0,
        wordsMastered: counts.words_mastered || 0,
        streak: newStreak,
        xp: newXP,
        level: newLevel,
        cardsToday,
      },
      xp: correct ? {
        xpGained: XP_PER_CORRECT,
        totalXP: newXP,
        level: newLevel,
        leveledUp,
        oldLevel,
        newLevel,
        xpToNextLevel: XP_PER_LEVEL[newLevel] ? XP_PER_LEVEL[newLevel] - newXP : 0,
      } : null,
      dailyGoal: {
        cardsToday,
        dailyGoal,
        progress: goalProgress,
        goalComplete,
      },
      unlockedAchievements,
    });
  } catch (error) {
    console.error('Error processing card result:', error);
    return NextResponse.json(
      { error: 'Failed to process card result' },
      { status: 500 }
    );
  }
}

interface StatsForAchievements {
  total_reviews: number;
  streak: number;
  words_mastered: number;
}

async function checkAchievements(
  sql: ReturnType<typeof getDb>,
  stats: StatsForAchievements,
  userId: string
): Promise<Achievement[]> {
  const unlocked: Achievement[] = [];

  const achievementChecks = [
    { id: 'first-card', condition: stats.total_reviews >= 1 },
    { id: 'ten-cards', condition: stats.total_reviews >= 10 },
    { id: 'fifty-cards', condition: stats.total_reviews >= 50 },
    { id: 'hundred-cards', condition: stats.total_reviews >= 100 },
    { id: 'streak-3', condition: stats.streak >= 3 },
    { id: 'streak-7', condition: stats.streak >= 7 },
    { id: 'streak-30', condition: stats.streak >= 30 },
    { id: 'master-10', condition: stats.words_mastered >= 10 },
    { id: 'master-50', condition: stats.words_mastered >= 50 },
  ];

  const eligible = achievementChecks.filter(a => a.condition).map(a => a.id);
  if (eligible.length === 0) return unlocked;

  // Batch check which are already unlocked
  const existing = await sql`
    SELECT achievement_id FROM achievement_progress
    WHERE user_id = ${userId} AND achievement_id = ANY(${eligible}) AND unlocked = true
  `;
  const alreadyUnlocked = new Set(existing.map(r => r.achievement_id));

  const toUnlock = eligible.filter(id => !alreadyUnlocked.has(id));
  if (toUnlock.length === 0) return unlocked;

  for (const achievementId of toUnlock) {
    // Upsert achievement progress
    await sql`
      INSERT INTO achievement_progress (user_id, achievement_id, unlocked, unlocked_at)
      VALUES (${userId}, ${achievementId}, true, NOW())
      ON CONFLICT (achievement_id, user_id) DO UPDATE SET
        unlocked = true,
        unlocked_at = NOW()
    `;

    const achDetails = await sql`
      SELECT * FROM achievements WHERE id = ${achievementId}
    `;

    if (achDetails[0]) {
      unlocked.push(achDetails[0] as Achievement);

      if (achDetails[0].xp_reward > 0) {
        await sql`
          UPDATE user_stats
          SET xp = xp + ${achDetails[0].xp_reward}
          WHERE user_id = ${userId}
        `;
      }
    }
  }

  return unlocked;
}
