/**
 * GET /api/vocab/stats/time
 *
 * Returns study time stats (day, week, month, year) for the current user
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
    // Get study time for different periods (filtered by user_id)
    const stats = await sql`
      SELECT
        COALESCE(SUM(CASE
          WHEN start_time >= NOW() - INTERVAL '1 day'
          THEN duration_seconds
          ELSE 0
        END), 0) as day_seconds,
        COALESCE(SUM(CASE
          WHEN start_time >= NOW() - INTERVAL '7 days'
          THEN duration_seconds
          ELSE 0
        END), 0) as week_seconds,
        COALESCE(SUM(CASE
          WHEN start_time >= NOW() - INTERVAL '30 days'
          THEN duration_seconds
          ELSE 0
        END), 0) as month_seconds,
        COALESCE(SUM(CASE
          WHEN start_time >= NOW() - INTERVAL '365 days'
          THEN duration_seconds
          ELSE 0
        END), 0) as year_seconds,
        COALESCE(SUM(duration_seconds), 0) as total_seconds
      FROM study_sessions
      WHERE end_time IS NOT NULL AND user_id = ${user.id}
    `;

    const row = stats[0];

    return NextResponse.json({
      day: {
        seconds: Number(row.day_seconds) || 0,
        minutes: Math.floor((Number(row.day_seconds) || 0) / 60),
      },
      week: {
        seconds: Number(row.week_seconds) || 0,
        minutes: Math.floor((Number(row.week_seconds) || 0) / 60),
      },
      month: {
        seconds: Number(row.month_seconds) || 0,
        minutes: Math.floor((Number(row.month_seconds) || 0) / 60),
        hours: Math.floor((Number(row.month_seconds) || 0) / 3600),
      },
      year: {
        seconds: Number(row.year_seconds) || 0,
        minutes: Math.floor((Number(row.year_seconds) || 0) / 60),
        hours: Math.floor((Number(row.year_seconds) || 0) / 3600),
      },
      total: {
        seconds: Number(row.total_seconds) || 0,
        minutes: Math.floor((Number(row.total_seconds) || 0) / 60),
        hours: Math.floor((Number(row.total_seconds) || 0) / 3600),
      },
    });
  } catch (error) {
    console.error('Error fetching study time stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
