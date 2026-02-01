import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

/**
 * POST /api/lessons/create
 *
 * Creates a new lesson in the database
 *
 * Body:
 * {
 *   id: string,
 *   language_id: 'hebrew' | 'greek',
 *   week_number: number,
 *   month_number: number,
 *   title: string,
 *   description: string,
 *   lesson_content?: string,
 *   topics?: string[],
 *   vocabulary_set_ids?: string[],
 *   order_index: number
 * }
 */
export async function POST(request: Request) {
  // Check authentication
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    const body = await request.json();

    const {
      id,
      language_id = 'hebrew',
      week_number,
      month_number,
      title,
      description,
      lesson_content = '',
      topics = [],
      vocabulary_set_ids = [],
      order_index
    } = body;

    // Validate required fields
    if (!id || !week_number || !month_number || !title || !description || order_index === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert lesson
    await sql`
      INSERT INTO lessons (
        id,
        language_id,
        week_number,
        month_number,
        title,
        description,
        lesson_content,
        topics,
        vocabulary_set_ids,
        order_index
      )
      VALUES (
        ${id},
        ${language_id},
        ${week_number},
        ${month_number},
        ${title},
        ${description},
        ${lesson_content},
        ${topics},
        ${vocabulary_set_ids},
        ${order_index}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        lesson_content = EXCLUDED.lesson_content,
        topics = EXCLUDED.topics,
        vocabulary_set_ids = EXCLUDED.vocabulary_set_ids,
        updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      message: `Lesson "${title}" created successfully`,
      lesson_id: id
    });

  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
