/**
 * POST /api/timer/update
 *
 * Updates today's study time for the current user
 * Note: This now uses the study_sessions table with user_id
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request) {
  // Check authentication
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    const body = await request.json();
    const { additionalSeconds } = body;

    if (typeof additionalSeconds !== 'number' || additionalSeconds < 0) {
      return NextResponse.json(
        { error: 'Invalid additionalSeconds value' },
        { status: 400 }
      );
    }

    // Create a new completed study session for this timer update
    await sql`
      INSERT INTO study_sessions (
        user_id,
        mode,
        start_time,
        end_time,
        last_activity,
        duration_seconds
      ) VALUES (
        ${user.id},
        'timer',
        NOW() - INTERVAL '1 second' * ${additionalSeconds},
        NOW(),
        NOW(),
        ${additionalSeconds}
      )
    `;

    // Get today's total study time
    // Use CURRENT_DATE in Postgres to get server's local date consistently
    const result = await sql`
      SELECT
        COALESCE(SUM(duration_seconds), 0) as total_seconds
      FROM study_sessions
      WHERE user_id = ${user.id}
        AND DATE(start_time) = CURRENT_DATE
        AND end_time IS NOT NULL
    `;

    return NextResponse.json({
      success: true,
      totalSeconds: Number(result[0]?.total_seconds) || 0,
    });
  } catch (error) {
    console.error('Error updating timer:', error);
    return NextResponse.json(
      { error: 'Failed to update timer' },
      { status: 500 }
    );
  }
}
