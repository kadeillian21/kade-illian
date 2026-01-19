/**
 * GET /api/vocab/progress
 *
 * Returns user's progress and stats from database
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();

  try {
    // 1. Get user stats
    const statsResult = await sql`
      SELECT * FROM user_stats WHERE id = 1
    `;

    const stats = statsResult[0] || {
      last_studied: null,
      total_reviews: 0,
      words_learned: 0,
      words_mastered: 0,
      streak: 0,
    };

    // 2. Get all word progress
    const progressResult = await sql`
      SELECT
        word_id,
        level,
        next_review,
        last_reviewed,
        review_count,
        correct_count
      FROM user_progress
    `;

    // 3. Format word progress as object
    const wordProgress: Record<string, any> = {};

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
