/**
 * POST /api/vocab/progress/bulk-update
 *
 * Bulk update progress for multiple words
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const sql = getDb();

  try {
    const body = await request.json();
    const { wordIds, action } = body;

    if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
      return NextResponse.json(
        { error: 'wordIds array is required' },
        { status: 400 }
      );
    }

    if (!action || !['learned', 'needs-work'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "learned" or "needs-work"' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const level = action === 'learned' ? 1 : 0;
    const nextReview = action === 'learned'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day from now
      : now;

    // Update or insert progress for each word
    for (const wordId of wordIds) {
      await sql`
        INSERT INTO user_progress (
          word_id,
          level,
          next_review,
          last_reviewed,
          review_count,
          correct_count
        )
        VALUES (
          ${wordId},
          ${level},
          ${nextReview},
          ${now},
          1,
          ${level}
        )
        ON CONFLICT (word_id)
        DO UPDATE SET
          level = ${level},
          next_review = ${nextReview},
          last_reviewed = ${now},
          review_count = user_progress.review_count + 1,
          correct_count = CASE WHEN ${level} > 0 THEN user_progress.correct_count + 1 ELSE user_progress.correct_count END
      `;
    }

    return NextResponse.json({
      success: true,
      updated: wordIds.length,
      action,
    });
  } catch (error) {
    console.error('Error bulk updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
