/**
 * POST /api/timer/update
 *
 * Updates today's study time
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  const sql = getDb();

  try {
    // Ensure table and columns exist (auto-migration)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS study_sessions (
          id SERIAL PRIMARY KEY,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          total_seconds INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(date)
        )
      `;
    } catch {
      // Table likely exists
    }

    // Ensure all columns exist (in case table was created with old schema)
    try {
      await sql`ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE`;
      await sql`ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS total_seconds INTEGER DEFAULT 0`;
      await sql`ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`;
      await sql`ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`;
    } catch {
      // Columns likely exist
    }

    const body = await request.json();
    const { additionalSeconds } = body;

    if (typeof additionalSeconds !== 'number' || additionalSeconds < 0) {
      return NextResponse.json(
        { error: 'Invalid additionalSeconds value' },
        { status: 400 }
      );
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Upsert: insert new row or update existing
    const result = await sql`
      INSERT INTO study_sessions (date, total_seconds, updated_at)
      VALUES (${today}::date, ${additionalSeconds}, NOW())
      ON CONFLICT (date) DO UPDATE
      SET total_seconds = study_sessions.total_seconds + ${additionalSeconds},
          updated_at = NOW()
      RETURNING total_seconds
    `;

    return NextResponse.json({
      success: true,
      totalSeconds: result[0].total_seconds,
    });
  } catch (error) {
    console.error('Error updating timer:', error);
    return NextResponse.json(
      { error: 'Failed to update timer' },
      { status: 500 }
    );
  }
}
