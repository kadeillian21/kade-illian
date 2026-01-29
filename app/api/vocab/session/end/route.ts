/**
 * POST /api/vocab/session/end
 *
 * Ends a study session and records the duration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const sql = getDb();

  try {
    const body = await request.json();
    const { sessionId, cardsStudied } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    // Get session start time
    const sessionResult = await sql`
      SELECT start_time FROM study_sessions WHERE id = ${sessionId}
    `;

    if (sessionResult.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update session with end time and duration
    await sql`
      UPDATE study_sessions
      SET
        end_time = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - start_time)),
        cards_studied = ${cardsStudied || 0}
      WHERE id = ${sessionId}
    `;

    // Get updated session
    const updated = await sql`
      SELECT
        id,
        duration_seconds,
        cards_studied
      FROM study_sessions
      WHERE id = ${sessionId}
    `;

    return NextResponse.json({
      success: true,
      session: updated[0],
    });
  } catch (error) {
    console.error('Error ending study session:', error);
    return NextResponse.json(
      { error: 'Failed to end study session' },
      { status: 500 }
    );
  }
}
