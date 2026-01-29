/**
 * POST /api/vocab/session/start
 *
 * Starts a new study session and returns session ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const sql = getDb();

  try {
    const body = await request.json();
    const { setId, mode } = body;

    // Create new study session
    const result = await sql`
      INSERT INTO study_sessions (
        set_id,
        mode,
        start_time,
        last_activity
      ) VALUES (
        ${setId || null},
        ${mode || 'study'},
        NOW(),
        NOW()
      )
      RETURNING id, start_time
    `;

    const session = result[0];

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      startTime: session.start_time,
    });
  } catch (error) {
    console.error('Error starting study session:', error);
    return NextResponse.json(
      { error: 'Failed to start study session' },
      { status: 500 }
    );
  }
}
