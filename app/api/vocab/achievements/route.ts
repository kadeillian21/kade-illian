/**
 * GET /api/vocab/achievements
 *
 * Returns all achievements with progress
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();

  try {
    // Get all achievements with progress
    const achievements = await sql`
      SELECT
        a.id,
        a.name,
        a.description,
        a.icon,
        a.xp_reward,
        ap.progress,
        ap.unlocked,
        ap.unlocked_at
      FROM achievements a
      LEFT JOIN achievement_progress ap ON a.id = ap.achievement_id
      ORDER BY ap.unlocked DESC, a.xp_reward ASC
    `;

    return NextResponse.json({
      achievements,
      unlockedCount: achievements.filter((a: any) => a.unlocked).length,
      totalCount: achievements.length,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
