import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

/**
 * POST /api/lessons/[lessonId]/progress
 *
 * Updates user progress for a lesson
 *
 * Body:
 * {
 *   status: 'not_started' | 'in_progress' | 'completed'
 * }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  // Check authentication
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    const { lessonId } = await params;
    const { status } = await request.json();

    // Validate status
    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Check if progress entry exists
    const existing = await sql`
      SELECT * FROM user_lesson_progress
      WHERE user_id = ${user.id} AND lesson_id = ${lessonId}
    `;

    if (existing.length === 0) {
      // Create new progress entry
      await sql`
        INSERT INTO user_lesson_progress (
          user_id,
          lesson_id,
          status,
          started_at,
          completed_at,
          last_accessed_at
        )
        VALUES (
          ${user.id},
          ${lessonId},
          ${status},
          ${status !== 'not_started' ? new Date().toISOString() : null},
          ${status === 'completed' ? new Date().toISOString() : null},
          NOW()
        )
      `;
    } else {
      // Update existing progress
      const updates: any = {
        status,
        last_accessed_at: new Date().toISOString()
      };

      // Set started_at if transitioning from not_started
      if (existing[0].status === 'not_started' && status !== 'not_started') {
        updates.started_at = new Date().toISOString();
      }

      // Set completed_at if status is completed
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      await sql`
        UPDATE user_lesson_progress
        SET
          status = ${status},
          started_at = COALESCE(${updates.started_at || null}, started_at),
          completed_at = ${updates.completed_at || null},
          last_accessed_at = NOW(),
          updated_at = NOW()
        WHERE user_id = ${user.id} AND lesson_id = ${lessonId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson progress updated',
      status
    });

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lessons/[lessonId]/progress
 *
 * Gets user progress for a lesson
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  // Check authentication
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    const { lessonId } = await params;

    const rows = await sql`
      SELECT * FROM user_lesson_progress
      WHERE user_id = ${user.id} AND lesson_id = ${lessonId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        progress: {
          status: 'not_started',
          started_at: null,
          completed_at: null,
          last_accessed_at: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      progress: rows[0]
    });

  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
