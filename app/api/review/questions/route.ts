/**
 * GET /api/review/questions
 *
 * Fetches quiz questions from multiple lessons for comprehensive review
 * Query params: lessonIds (comma-separated list of lesson IDs)
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
  // Check authentication
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    const { searchParams } = new URL(request.url);
    const lessonIdsParam = searchParams.get('lessonIds');

    if (!lessonIdsParam) {
      return NextResponse.json(
        { error: 'lessonIds parameter is required' },
        { status: 400 }
      );
    }

    const lessonIds = lessonIdsParam.split(',').filter(Boolean);

    if (lessonIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one lesson ID is required' },
        { status: 400 }
      );
    }

    // Fetch all quiz questions for the selected lessons
    const questions = await sql`
      SELECT
        qq.id,
        qq.lesson_id as "lessonId",
        qq.question_text as "questionText",
        qq.question_type as "questionType",
        qq.correct_answer as "correctAnswer",
        qq.options,
        qq.explanation,
        qq.order_index as "orderIndex",
        l.title as "lessonTitle",
        l.week_number as "weekNumber"
      FROM quiz_questions qq
      JOIN lessons l ON l.id = qq.lesson_id
      WHERE qq.lesson_id = ANY(${lessonIds})
      ORDER BY l.week_number ASC, qq.order_index ASC
    `;

    // Parse JSON options if stored as string
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }));

    // Get lesson info for the selected lessons
    const lessons = await sql`
      SELECT id, title, week_number as "weekNumber", month_number as "monthNumber"
      FROM lessons
      WHERE id = ANY(${lessonIds})
      ORDER BY week_number ASC
    `;

    return NextResponse.json({
      success: true,
      questions: parsedQuestions,
      lessons,
      totalQuestions: parsedQuestions.length,
    });

  } catch (error) {
    console.error('Error fetching review questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review questions' },
      { status: 500 }
    );
  }
}
