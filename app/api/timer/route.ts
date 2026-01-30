/**
 * GET /api/timer
 *
 * Returns today's study time from database for the current user
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  // Check authentication
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    // Get timezone offset from query params (in minutes, e.g., -480 for PST)
    const { searchParams } = new URL(request.url);
    const tzOffset = parseInt(searchParams.get('tzOffset') || '0');

    // Calculate start and end of "today" in user's timezone
    const now = new Date();
    const localDate = new Date(now.getTime() - tzOffset * 60 * 1000);
    const startOfDay = new Date(localDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const startOfDayUTC = new Date(startOfDay.getTime() + tzOffset * 60 * 1000);

    const endOfDay = new Date(localDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const endOfDayUTC = new Date(endOfDay.getTime() + tzOffset * 60 * 1000);

    // Query for sessions within today (user's timezone)
    const result = await sql`
      SELECT
        COALESCE(SUM(duration_seconds), 0) as total_seconds
      FROM study_sessions
      WHERE user_id = ${user.id}
        AND start_time >= ${startOfDayUTC.toISOString()}
        AND start_time < ${endOfDayUTC.toISOString()}
        AND end_time IS NOT NULL
    `;

    return NextResponse.json({
      date: localDate.toISOString().split('T')[0],
      totalSeconds: Number(result[0]?.total_seconds) || 0,
    });
  } catch (error) {
    console.error('Error fetching timer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timer data' },
      { status: 500 }
    );
  }
}
