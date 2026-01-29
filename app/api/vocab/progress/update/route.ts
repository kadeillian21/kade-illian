/**
 * POST /api/vocab/progress/update
 *
 * Updates progress for a single word after review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Check authentication
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    const body = await request.json();
    const { wordId, level, nextReview, lastReviewed, reviewCount, correctCount } = body;

    // Validate required fields
    if (!wordId || level === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: wordId, level' },
        { status: 400 }
      );
    }

    // 1. Upsert word progress with user_id
    await sql`
      INSERT INTO user_progress (
        user_id,
        word_id,
        level,
        next_review,
        last_reviewed,
        review_count,
        correct_count,
        updated_at
      ) VALUES (
        ${user.id},
        ${wordId},
        ${level},
        ${nextReview || null},
        ${lastReviewed || null},
        ${reviewCount || 0},
        ${correctCount || 0},
        NOW()
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
      await sql`
        INSERT INTO user_stats (user_id)
        VALUES (${user.id})
      `;
      statsResult = await sql`
        SELECT * FROM user_stats WHERE user_id = ${user.id}
      `;
    }

    const currentStats = statsResult[0];

    // Calculate new streak
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
        // Same day, keep streak
        newStreak = currentStats.streak;
      } else if (daysDiff === 1) {
        // Next day, increment streak
        newStreak = currentStats.streak + 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
    } else {
      // First study
      newStreak = 1;
    }

    // Get word counts for this user
    const countsResult = await sql`
      SELECT
        COUNT(CASE WHEN level >= 1 THEN 1 END) as words_learned,
        COUNT(CASE WHEN level >= 5 THEN 1 END) as words_mastered
      FROM user_progress
      WHERE user_id = ${user.id}
    `;
    const counts = countsResult[0];

    // Update stats
    await sql`
      UPDATE user_stats SET
        last_studied = NOW(),
        total_reviews = total_reviews + 1,
        words_learned = ${counts.words_learned || 0},
        words_mastered = ${counts.words_mastered || 0},
        streak = ${newStreak},
        updated_at = NOW()
      WHERE user_id = ${user.id}
    `;

    // 3. Return updated stats
    const updatedStatsResult = await sql`
      SELECT * FROM user_stats WHERE user_id = ${user.id}
    `;
    const updatedStats = updatedStatsResult[0];

    return NextResponse.json({
      success: true,
      stats: {
        lastStudied: updatedStats.last_studied,
        totalReviews: updatedStats.total_reviews,
        wordsLearned: updatedStats.words_learned,
        wordsMastered: updatedStats.words_mastered,
        streak: updatedStats.streak,
      },
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
