/**
 * GET /api/vocab/progress
 *
 * Returns user's progress and stats from database
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  // Check authentication
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    // 1. Get user stats (or create if doesn't exist)
    let statsResult = await sql`
      SELECT * FROM user_stats WHERE user_id = ${user.id}
    `;

    if (statsResult.length === 0) {
      // Create initial stats for this user
      await sql`
        INSERT INTO user_stats (user_id)
        VALUES (${user.id})
        ON CONFLICT (user_id) DO NOTHING
      `;
      statsResult = await sql`
        SELECT * FROM user_stats WHERE user_id = ${user.id}
      `;
    }

    const stats = statsResult[0] || {
      last_studied: null,
      total_reviews: 0,
      words_learned: 0,
      words_mastered: 0,
      streak: 0,
    };

    // 2. Get all word progress for this user
    const progressResult = await sql`
      SELECT
        word_id,
        level,
        next_review,
        last_reviewed,
        review_count,
        correct_count
      FROM user_progress
      WHERE user_id = ${user.id}
    `;

    // 3. Format word progress as object
    const wordProgress: Record<string, {
      level: number;
      nextReview: string | null;
      lastReviewed: string | null;
      reviewCount: number;
      correctCount: number;
    }> = {};

    progressResult.forEach(row => {
      wordProgress[row.word_id] = {
        level: row.level,
        nextReview: row.next_review,
        lastReviewed: row.last_reviewed,
        reviewCount: row.review_count,
        correctCount: row.correct_count,
      };
    });

    // 4. Return formatted response
    return NextResponse.json({
      stats: {
        lastStudied: stats.last_studied,
        totalReviews: stats.total_reviews,
        wordsLearned: stats.words_learned,
        wordsMastered: stats.words_mastered,
        streak: stats.streak,
        xp: stats.xp || 0,
        level: stats.level || 1,
        cardsToday: stats.cards_today || 0,
      },
      wordProgress,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
