/**
 * Interactive Lesson Steps Schema Migration
 *
 * Adds tables and columns for interactive, step-by-step lesson experience:
 * - lesson_steps: Individual steps within lessons (objective, concept, scripture, vocabulary, quiz, completion)
 * - quiz_questions: Assessment questions for each lesson
 * - user_quiz_attempts: Track quiz performance
 * - user_step_progress: Track completion of individual steps
 * - Updates lessons table with new fields for quiz requirements and timing
 * - Updates user_lesson_progress with quiz scores and time tracking
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function addLessonStepsSchema() {
  console.log('🚀 Adding interactive lesson steps schema...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ POSTGRES_URL_NON_POOLING or POSTGRES_URL not found');
    console.error('   Make sure .env.local exists with database connection string');
    process.exit(1);
  }

  console.log('✅ Database connection configured\n');

  const sql = postgres(connectionString);

  try {
    // 1. Update lessons table with new fields
    console.log('📖 Updating lessons table with new fields...');
    await sql`
      ALTER TABLE lessons
      ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 15,
      ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
      ADD COLUMN IF NOT EXISTS scripture_passage_ids TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS requires_quiz_pass BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS min_quiz_score INTEGER DEFAULT 80 CHECK (min_quiz_score BETWEEN 0 AND 100)
    `;
    console.log('✅ lessons table updated\n');

    // 2. Update user_lesson_progress table with quiz and time tracking
    console.log('📈 Updating user_lesson_progress table...');
    await sql`
      ALTER TABLE user_lesson_progress
      ADD COLUMN IF NOT EXISTS quiz_score INTEGER CHECK (quiz_score BETWEEN 0 AND 100),
      ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0
    `;
    console.log('✅ user_lesson_progress table updated\n');

    // 3. Create lesson_steps table
    console.log('📝 Creating lesson_steps table...');
    await sql`
      CREATE TABLE IF NOT EXISTS lesson_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        step_number INTEGER NOT NULL,
        step_type TEXT NOT NULL CHECK (step_type IN ('objective', 'concept', 'scripture', 'vocabulary', 'quiz', 'completion')),
        content JSONB NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(lesson_id, step_number)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_lesson_steps_lesson ON lesson_steps(lesson_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lesson_steps_order ON lesson_steps(lesson_id, order_index)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lesson_steps_type ON lesson_steps(step_type)`;
    console.log('✅ lesson_steps table created\n');

    // 4. Create quiz_questions table
    console.log('❓ Creating quiz_questions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_blank', 'translation')),
        correct_answer TEXT NOT NULL,
        options JSONB,
        explanation TEXT,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson ON quiz_questions(lesson_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON quiz_questions(lesson_id, order_index)`;
    console.log('✅ quiz_questions table created\n');

    // 5. Create user_quiz_attempts table
    console.log('📊 Creating user_quiz_attempts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_quiz_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        quiz_question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
        lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        selected_answer TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_user ON user_quiz_attempts(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_question ON user_quiz_attempts(quiz_question_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_lesson ON user_quiz_attempts(lesson_id, user_id)`;
    console.log('✅ user_quiz_attempts table created\n');

    // 6. Create user_step_progress table
    console.log('👣 Creating user_step_progress table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_step_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        step_id UUID NOT NULL REFERENCES lesson_steps(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, step_id)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_user_step_progress_user ON user_step_progress(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_step_progress_lesson ON user_step_progress(lesson_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_step_progress_step ON user_step_progress(step_id)`;
    console.log('✅ user_step_progress table created\n');

    console.log('🎉 Interactive lesson steps schema complete!\n');
    console.log('Database structure:');
    console.log('  • lessons: Updated with quiz requirements and timing');
    console.log('  • user_lesson_progress: Now tracks quiz scores and time spent');
    console.log('  • lesson_steps: Individual steps within each lesson');
    console.log('  • quiz_questions: Assessment questions per lesson');
    console.log('  • user_quiz_attempts: Track user quiz performance');
    console.log('  • user_step_progress: Track completion of individual steps');
    console.log('\nNext steps:');
    console.log('1. Create seed script for Week 3 interactive lesson');
    console.log('2. Build LessonStepRenderer component');
    console.log('3. Build QuizStep component');
    console.log('4. Create lesson steps API endpoints');

  } catch (error) {
    console.error('❌ Error adding lesson steps schema:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

addLessonStepsSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
