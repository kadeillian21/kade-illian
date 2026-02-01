'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LessonStepRenderer from '../../../../../components/LessonStepRenderer';
import QuizStep from '../../../../../components/QuizStep';
import { LessonStep, QuizQuestion, QuizAttempt } from '../../../../../vocabulary/data/types';
import confetti from 'canvas-confetti';

interface LessonData {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  difficultyLevel: number;
  requiresQuizPass: boolean;
  minQuizScore: number;
}

export default function InteractiveLessonStepPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;
  const stepNumber = parseInt(params.stepNumber as string, 10);

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [steps, setSteps] = useState<LessonStep[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hard-coded user ID for MVP (will be replaced with auth later)
  const userId = 'demo-user';

  useEffect(() => {
    loadLessonSteps();
  }, [lessonId]);

  const loadLessonSteps = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/steps`);
      if (!response.ok) {
        throw new Error('Failed to fetch lesson steps');
      }

      const data = await response.json();
      setLesson(data.lesson);
      setSteps(data.steps);
      setQuizQuestions(data.quizQuestions);

      // Mark lesson as in progress
      await updateLessonProgress('in_progress');
    } catch (error) {
      console.error('Error loading lesson steps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLessonProgress = async (status: 'in_progress' | 'completed', quizScore?: number) => {
    try {
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          quiz_score: quizScore,
        }),
      });
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  const handleStepComplete = () => {
    const nextStepNumber = stepNumber + 1;

    // Check if we've completed all regular steps (before quiz)
    const quizStepIndex = steps.findIndex(s => s.stepType === 'quiz');
    const lastRegularStepIndex = quizStepIndex !== -1 ? quizStepIndex : steps.length - 1;

    if (nextStepNumber > lastRegularStepIndex + 1 && lesson?.requiresQuizPass && !quizPassed) {
      // Show quiz after completing all steps before quiz
      setShowQuiz(true);
    } else if (nextStepNumber <= steps.length) {
      // Move to next step via URL
      router.push(`/hebrew/lessons/${lessonId}/interactive/step/${nextStepNumber}`);
    } else {
      // All steps complete, return to lessons page
      router.push('/hebrew/lessons');
    }
  };

  const handleQuizPass = async (score: number, attempts: QuizAttempt[]) => {
    console.log('Quiz passed!', { score, attempts });

    // Submit quiz to backend
    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          userId,
          attempts,
          score,
        }),
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }

    setQuizPassed(true);
    setShowQuiz(false);

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Update lesson progress to completed
    await updateLessonProgress('completed', score);

    // Move to completion step
    const completionStepIndex = steps.findIndex(s => s.stepType === 'completion');
    if (completionStepIndex !== -1) {
      router.push(`/hebrew/lessons/${lessonId}/interactive/step/${completionStepIndex + 1}`);
    } else {
      // No completion step, go back to lessons
      setTimeout(() => {
        router.push('/hebrew/lessons');
      }, 2000);
    }
  };

  const handleQuizFail = async (score: number, attempts: QuizAttempt[]) => {
    console.log('Quiz failed, can retry', { score, attempts });

    // Submit quiz attempt
    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          userId,
          attempts,
          score,
        }),
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }

    // Reset quiz to allow retry
    setTimeout(() => {
      setShowQuiz(false);
      // Return to concept step to review
      const conceptStepIndex = steps.findIndex(s => s.stepType === 'concept');
      if (conceptStepIndex !== -1) {
        router.push(`/hebrew/lessons/${lessonId}/interactive/step/${conceptStepIndex + 1}`);
      }
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea]/10 via-[#764ba2]/10 to-white flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading lesson...</div>
      </div>
    );
  }

  if (!lesson || steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea]/10 via-[#764ba2]/10 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Lesson Not Ready</h2>
          <p className="text-gray-600 mb-6">
            This lesson hasn&apos;t been converted to interactive format yet.
          </p>
          <button
            onClick={() => router.push('/hebrew/lessons')}
            className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  // Validate step number
  if (stepNumber < 1 || stepNumber > steps.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea]/10 via-[#764ba2]/10 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Step Not Found</h2>
          <p className="text-gray-600 mb-6">
            This lesson step doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push(`/hebrew/lessons/${lessonId}/interactive/step/1`)}
            className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Start from Beginning
          </button>
        </div>
      </div>
    );
  }

  // Show quiz if flag is set
  if (showQuiz && quizQuestions.length > 0) {
    return (
      <QuizStep
        questions={quizQuestions}
        lessonId={lessonId}
        minScore={lesson.minQuizScore}
        onPass={handleQuizPass}
        onFail={handleQuizFail}
      />
    );
  }

  // Render current step (convert from 1-indexed to 0-indexed)
  const currentStep = steps[stepNumber - 1];

  return (
    <LessonStepRenderer
      step={currentStep}
      onComplete={handleStepComplete}
      totalSteps={steps.length}
    />
  );
}
