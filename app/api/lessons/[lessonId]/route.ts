import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

/**
 * GET /api/lessons/[lessonId]
 *
 * Returns a specific lesson with all details and user progress
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

    // Fetch lesson with user progress
    const rows = await sql`
      SELECT
        l.*,
        COALESCE(ulp.status, 'not_started') as user_status,
        ulp.started_at,
        ulp.completed_at,
        ulp.last_accessed_at
      FROM lessons l
      LEFT JOIN user_lesson_progress ulp
        ON l.id = ulp.lesson_id AND ulp.user_id = ${user.id}
      WHERE l.id = ${lessonId}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    const lesson = rows[0];

    // If lesson has vocabulary sets, fetch them
    let vocabSets = [];
    if (lesson.vocabulary_set_ids && lesson.vocabulary_set_ids.length > 0) {
      const vocabResult = await sql`
        SELECT * FROM vocab_sets
        WHERE id = ANY(${lesson.vocabulary_set_ids})
      `;
      vocabSets = vocabResult.rows;
    }

    // Update last_accessed_at if user has progress
    if (lesson.user_status !== 'not_started') {
      await sql`
        UPDATE user_lesson_progress
        SET last_accessed_at = NOW()
        WHERE lesson_id = ${lessonId} AND user_id = ${user.id}
      `;
    }

    return NextResponse.json({
      success: true,
      lesson: {
        ...lesson,
        vocabulary_sets: vocabSets
      }
    });

  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}
