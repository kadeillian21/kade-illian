/**
 * GET /api/timer
 *
 * Returns today's study time from database
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();

  try {
    // Ensure table exists (auto-migration)
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
      // Table likely exists, continue
    }

    // Get today's study session (using local date)
    const today = new Date().toISOString().split('T')[0];

    const result = await sql`
      SELECT total_seconds, date
      FROM study_sessions
      WHERE date = ${today}::date
    `;

    if (result.length === 0) {
      // No session for today yet
      return NextResponse.json({
        date: today,
        totalSeconds: 0,
      });
    }

    return NextResponse.json({
      date: result[0].date,
      totalSeconds: result[0].total_seconds,
    });
  } catch (error) {
    console.error('Error fetching timer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timer data', details: String(error) },
      { status: 500 }
    );
  }
}
