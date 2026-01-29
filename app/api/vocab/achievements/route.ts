/**
 * GET /api/vocab/achievements
 *
 * Returns all achievements with progress for the current user
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
    // Get all achievements with user's progress
    const achievements = await sql`
      SELECT
        a.id,
        a.name,
        a.description,
        a.icon,
        a.xp_reward,
        COALESCE(ap.progress, 0) as progress,
        COALESCE(ap.unlocked, false) as unlocked,
        ap.unlocked_at
      FROM achievements a
      LEFT JOIN achievement_progress ap ON a.id = ap.achievement_id AND ap.user_id = ${user.id}
      ORDER BY ap.unlocked DESC NULLS LAST, a.xp_reward ASC
    `;

    return NextResponse.json({
      achievements,
      unlockedCount: achievements.filter((a: { unlocked: boolean }) => a.unlocked).length,
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
