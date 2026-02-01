import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

interface QuizSubmission {
  lessonId: string;
  userId: string;
  attempts: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
  score: number;
}

// POST /api/quiz/submit - Submit quiz answers and update progress
export async function POST(request: NextRequest) {
  try {
    const body: QuizSubmission = await request.json();
    const { lessonId, userId, attempts, score } = body;

    if (!lessonId || !userId || !attempts || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: lessonId, userId, attempts, score' },
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

    // Fetch lesson to get min score requirement
    const [lesson] = await sql`
      SELECT min_quiz_score, requires_quiz_pass
      FROM lessons
      WHERE id = ${lessonId}
    `;

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    const passed = score >= lesson.min_quiz_score;

    // Insert quiz attempts
    for (const attempt of attempts) {
      await sql`
        INSERT INTO user_quiz_attempts (user_id, quiz_question_id, lesson_id, selected_answer, is_correct)
        VALUES (
          ${userId},
          ${attempt.questionId},
          ${lessonId},
          ${attempt.selectedAnswer},
          ${attempt.isCorrect}
        )
      `;
    }

    // Update or insert user lesson progress
    const existingProgress = await sql`
      SELECT id, status, attempts
      FROM user_lesson_progress
      WHERE user_id = ${userId} AND lesson_id = ${lessonId}
    `;

    const attemptCount = (existingProgress[0]?.attempts || 0) + 1;

    if (existingProgress.length > 0) {
      // Update existing progress
      await sql`
        UPDATE user_lesson_progress
        SET
          quiz_score = ${score},
          status = ${passed ? 'completed' : 'in_progress'},
          attempts = ${attemptCount},
          completed_at = ${passed ? sql`NOW()` : null},
          last_accessed_at = NOW(),
          updated_at = NOW()
        WHERE user_id = ${userId} AND lesson_id = ${lessonId}
      `;
    } else {
      // Create new progress record
      await sql`
        INSERT INTO user_lesson_progress (user_id, lesson_id, quiz_score, status, attempts, started_at, completed_at, last_accessed_at)
        VALUES (
          ${userId},
          ${lessonId},
          ${score},
          ${passed ? 'completed' : 'in_progress'},
          ${attemptCount},
          NOW(),
          ${passed ? sql`NOW()` : null},
          NOW()
        )
      `;
    }

    // Calculate XP reward
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const xpPerQuestion = 10;
    const xpAwarded = correctAnswers * xpPerQuestion;
    const bonusXP = passed ? 50 : 0; // Bonus XP for passing
    const totalXP = xpAwarded + bonusXP;

    // Update user stats (if table exists)
    try {
      const existingStats = await sql`
        SELECT total_reviews, current_streak
        FROM user_stats
        WHERE user_id = ${userId}
      `;

      if (existingStats.length > 0) {
        await sql`
          UPDATE user_stats
          SET
            total_reviews = total_reviews + 1,
            last_studied_at = NOW(),
            updated_at = NOW()
          WHERE user_id = ${userId}
        `;
      } else {
        await sql`
          INSERT INTO user_stats (user_id, total_reviews, last_studied_at)
          VALUES (${userId}, 1, NOW())
        `;
      }
    } catch (error) {
      // user_stats table might not exist yet - that's okay
      console.log('Note: user_stats table not found, skipping stats update');
    }

    return NextResponse.json({
      success: true,
      passed,
      score,
      attempts: attemptCount,
      minScore: lesson.min_quiz_score,
      xpAwarded: totalXP,
      breakdown: {
        correctAnswers,
        totalQuestions: attempts.length,
        xpPerQuestion,
        bonusXP,
      },
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
