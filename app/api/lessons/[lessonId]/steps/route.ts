import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

// GET /api/lessons/[lessonId]/steps - Fetch all steps and quiz questions for a lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;

  if (!lessonId) {
    return NextResponse.json(
      { error: 'Lesson ID is required' },
      { status: 400 }
    );
  }

  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    return NextResponse.json(
      { error: 'Database connection not configured' },
      { status: 500 }
    );
  }

  const sql = postgres(connectionString);

  try {
    // Fetch lesson metadata
    const [lesson] = await sql`
      SELECT
        id,
        title,
        description,
        estimated_minutes,
        difficulty_level,
        requires_quiz_pass,
        min_quiz_score
      FROM lessons
      WHERE id = ${lessonId}
    `;

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Fetch lesson steps
    const stepsRaw = await sql`
      SELECT
        id,
        lesson_id as "lessonId",
        step_number as "stepNumber",
        step_type as "stepType",
        content,
        order_index as "orderIndex"
      FROM lesson_steps
      WHERE lesson_id = ${lessonId}
      ORDER BY order_index ASC
    `;

    // Parse JSON content if it's a string
    const steps = stepsRaw.map(step => ({
      ...step,
      content: typeof step.content === 'string' ? JSON.parse(step.content) : step.content,
    }));

    // Fetch quiz questions if quiz is required
    let quizQuestions = [];
    if (lesson.requires_quiz_pass) {
      const questionsRaw = await sql`
        SELECT
          id,
          lesson_id as "lessonId",
          question_text as "questionText",
          question_type as "questionType",
          correct_answer as "correctAnswer",
          options,
          explanation,
          order_index as "orderIndex"
        FROM quiz_questions
        WHERE lesson_id = ${lessonId}
        ORDER BY order_index ASC
      `;

      // Parse JSON options if it's a string
      quizQuestions = questionsRaw.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      }));
    }

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        estimatedMinutes: lesson.estimated_minutes,
        difficultyLevel: lesson.difficulty_level,
        requiresQuizPass: lesson.requires_quiz_pass,
        minQuizScore: lesson.min_quiz_score,
      },
      steps,
      quizQuestions,
    });

  } catch (error) {
    console.error('Error fetching lesson steps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson steps' },
      { status: 500 }
    );
  }
}
