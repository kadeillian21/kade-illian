import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

/**
 * GET /api/lessons
 *
 * Query parameters:
 * - language: Filter by language (default: 'hebrew')
 *
 * Returns all lessons for a language with progress info
 */
export async function GET(request: Request) {
  // Check authentication
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'hebrew';

    // Fetch all lessons for the language with user progress
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
      WHERE l.language_id = ${language}
      ORDER BY l.order_index ASC
    `;

    // Fetch vocab set details for all lessons
    const lessonsWithVocab = await Promise.all(
      rows.map(async (lesson) => {
        if (lesson.vocabulary_set_ids && lesson.vocabulary_set_ids.length > 0) {
          const vocabSets = await sql`
            SELECT id, title, description, total_words, set_type
            FROM vocab_sets
            WHERE id = ANY(${lesson.vocabulary_set_ids})
          `;
          return { ...lesson, vocabulary_sets: vocabSets };
        }
        return { ...lesson, vocabulary_sets: [] };
      })
    );

    return NextResponse.json({
      success: true,
      lessons: lessonsWithVocab,
      language
    });

  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}
