/**
 * POST /api/vocab/session/heartbeat
 *
 * Updates last activity time for a session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const sql = getDb();

  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    // Update last activity
    await sql`
      UPDATE study_sessions
      SET last_activity = NOW()
      WHERE id = ${sessionId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating session heartbeat:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
