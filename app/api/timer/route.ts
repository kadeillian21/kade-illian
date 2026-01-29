/**
 * GET /api/timer
 *
 * Returns today's study time from database for the current user
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
    // Get today's study time for this user
    const today = new Date().toISOString().split('T')[0];

    const result = await sql`
      SELECT
        COALESCE(SUM(duration_seconds), 0) as total_seconds
      FROM study_sessions
      WHERE user_id = ${user.id}
        AND DATE(start_time) = ${today}::date
        AND end_time IS NOT NULL
    `;

    return NextResponse.json({
      date: today,
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
