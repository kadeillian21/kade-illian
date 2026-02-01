'use client';

import { useState, useEffect } from 'react';
import { QuizQuestion, QuizAttempt } from '../vocabulary/data/types';

interface QuizStepProps {
  questions: QuizQuestion[];
  lessonId: string;
  minScore: number;
  onPass: (score: number, attempts: QuizAttempt[]) => void;
  onFail: (score: number, attempts: QuizAttempt[]) => void;
}

export default function QuizStep({ questions, lessonId, minScore, onPass, onFail }: QuizStepProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return; // Prevent changing answer after submission
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const attempt: QuizAttempt = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
    };

    setAttempts([...attempts, attempt]);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Calculate final score
      const correctAnswers = [...attempts, {
        questionId: currentQuestion.id,
        selectedAnswer: selectedAnswer!,
        isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      }].filter(a => a.isCorrect).length;

      const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
      setScore(finalScore);
      setQuizComplete(true);

      // Determine pass/fail
      const allAttempts = [...attempts, {
        questionId: currentQuestion.id,
        selectedAnswer: selectedAnswer!,
        isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      }];

      if (finalScore >= minScore) {
        onPass(finalScore, allAttempts);
      } else {
        onFail(finalScore, allAttempts);
      }
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  if (quizComplete) {
    return <QuizResults score={score} minScore={minScore} totalQuestions={totalQuestions} />;
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea]/10 via-[#764ba2]/10 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">Quick Quiz</h1>
          <p className="text-gray-600">Test your understanding of today&apos;s lesson</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {currentQuestion.questionType === 'multiple_choice' && 'Multiple Choice'}
              {currentQuestion.questionType === 'fill_blank' && 'Fill in the Blank'}
              {currentQuestion.questionType === 'translation' && 'Translation'}
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 leading-relaxed">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Answer Options */}
          {currentQuestion.questionType === 'multiple_choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const showCorrect = showFeedback && option === currentQuestion.correctAnswer;
                const showIncorrect = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showFeedback}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      showCorrect
                        ? 'border-green-500 bg-green-50'
                        : showIncorrect
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Option Letter */}
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        showCorrect
                          ? 'bg-green-500 text-white'
                          : showIncorrect
                          ? 'bg-red-500 text-white'
                          : isSelected
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>

                      {/* Option Text */}
                      <span className={`flex-1 ${
                        showCorrect || showIncorrect ? 'font-medium' : ''
                      }`}>
                        {option}
                      </span>

                      {/* Checkmark/X */}
                      {showCorrect && (
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {showIncorrect && (
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-4 rounded-lg border-l-4 ${
              isCorrect
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <>
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-green-800">Correct!</p>
                      {currentQuestion.explanation && (
                        <p className="text-sm text-green-700 mt-1">{currentQuestion.explanation}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">❌</span>
                    <div>
                      <p className="font-semibold text-red-800">Not quite right</p>
                      {currentQuestion.explanation && (
                        <p className="text-sm text-red-700 mt-1">{currentQuestion.explanation}</p>
                      )}
                      <p className="text-sm text-red-700 mt-2">
                        The correct answer is: <strong>{currentQuestion.correctAnswer}</strong>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* XP Reward for Correct Answer */}
              {isCorrect && (
                <div className="mt-3 p-3 bg-white rounded-lg flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span className="text-sm font-medium text-purple-600">+10 XP</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {!showFeedback ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedAnswer
                    ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                {isLastQuestion ? 'See Results' : 'Next Question'} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Quiz Results Component
function QuizResults({ score, minScore, totalQuestions }: { score: number; minScore: number; totalQuestions: number }) {
  const passed = score >= minScore;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="max-w-2xl space-y-8">
        {/* Result Animation */}
        <div className={`text-8xl ${passed ? 'animate-bounce' : ''}`}>
          {passed ? '🎉' : '📚'}
        </div>

        {/* Score Display */}
        <div className="space-y-4">
          <h1 className={`text-6xl font-bold ${
            passed
              ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent'
              : 'text-gray-700'
          }`}>
            {score}%
          </h1>
          <p className="text-2xl text-gray-700">
            {passed
              ? 'Great work! You passed! 🎊'
              : 'Keep studying! You can retake the quiz.'
            }
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white rounded-2xl p-8 shadow-lg space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Your Score</p>
              <p className="text-3xl font-bold text-purple-600">{score}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Passing Score</p>
              <p className="text-3xl font-bold text-gray-600">{minScore}%</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              You got {Math.round((score / 100) * totalQuestions)} out of {totalQuestions} questions correct
            </p>
          </div>
        </div>

        {/* Status Message */}
        {passed ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6">
            <p className="text-green-800 font-medium">
              🎓 Quiz completed! Continuing to completion screen...
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-2xl p-6">
            <p className="text-yellow-800 font-medium">
              💪 Review the lesson and try again. You&apos;ve got this!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
