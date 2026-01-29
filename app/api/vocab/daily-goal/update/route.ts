/**
 * POST /api/vocab/daily-goal/update
 *
 * Updates daily goal progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const sql = getDb();

  try {
    const body = await request.json();
    const { cardsStudied } = body;

    // Get current stats
    const statsResult = await sql`
      SELECT * FROM user_stats WHERE id = 1
    `;
    const stats = statsResult[0];

    // Check if we need to reset daily count
    const today = new Date().toISOString().split('T')[0];
    const lastReset = stats.last_goal_reset
      ? new Date(stats.last_goal_reset).toISOString().split('T')[0]
      : null;

    let cardsToday = stats.cards_today || 0;

    if (lastReset !== today) {
      // New day, reset count
      cardsToday = cardsStudied || 1;
      await sql`
        UPDATE user_stats
        SET
          cards_today = ${cardsToday},
          last_goal_reset = CURRENT_DATE
        WHERE id = 1
      `;
    } else {
      // Same day, increment
      cardsToday += cardsStudied || 1;
      await sql`
        UPDATE user_stats
        SET cards_today = ${cardsToday}
        WHERE id = 1
      `;
    }

    const dailyGoal = stats.daily_goal || 20;
    const progress = Math.min((cardsToday / dailyGoal) * 100, 100);
    const goalComplete = cardsToday >= dailyGoal;

    return NextResponse.json({
      success: true,
      cardsToday,
      dailyGoal,
      progress,
      goalComplete,
    });
  } catch (error) {
    console.error('Error updating daily goal:', error);
    return NextResponse.json(
      { error: 'Failed to update daily goal' },
      { status: 500 }
    );
  }
}
