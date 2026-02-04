'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { QuizQuestion, QuizAttempt } from '../vocabulary/data/types';

interface Lesson {
  id: string;
  title: string;
  weekNumber: number;
  monthNumber: number;
  user_status: 'not_started' | 'in_progress' | 'completed';
}

interface ReviewQuestion extends QuizQuestion {
  lessonTitle: string;
  weekNumber: number;
}

type ViewMode = 'select' | 'quiz' | 'results';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ComprehensiveReviewPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState<(QuizAttempt & { weekNumber: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shuffledOptionsMap, setShuffledOptionsMap] = useState<Record<number, string[]>>({});

  // Load lessons
  useEffect(() => {
    async function loadLessons() {
      try {
        const response = await fetch('/api/lessons?language=hebrew');
        if (!response.ok) throw new Error('Failed to fetch lessons');
        const data = await response.json();

        // Only show completed lessons that have quizzes
        const completedLessons = data.lessons.filter(
          (l: Lesson) => l.user_status === 'completed'
        );
        setLessons(completedLessons);
      } catch (error) {
        console.error('Error loading lessons:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLessons();
  }, []);

  // Group lessons by month
  const lessonsByMonth = useMemo(() => {
    return lessons.reduce((acc, lesson) => {
      const month = lesson.monthNumber;
      if (!acc[month]) acc[month] = [];
      acc[month].push(lesson);
      return acc;
    }, {} as Record<number, Lesson[]>);
  }, [lessons]);

  const getMonthTitle = (month: number) => {
    const titles: Record<number, string> = {
      1: 'Month 1: Foundation',
      2: 'Month 2: Nouns & Reading',
      3: 'Month 3: Verbs & Sentences',
    };
    return titles[month] || `Month ${month}`;
  };

  const toggleLesson = (lessonId: string) => {
    setSelectedLessonIds(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  const selectAllInMonth = (month: number) => {
    const monthLessons = lessonsByMonth[month] || [];
    setSelectedLessonIds(prev => {
      const next = new Set(prev);
      monthLessons.forEach(l => next.add(l.id));
      return next;
    });
  };

  const deselectAllInMonth = (month: number) => {
    const monthLessons = lessonsByMonth[month] || [];
    setSelectedLessonIds(prev => {
      const next = new Set(prev);
      monthLessons.forEach(l => next.delete(l.id));
      return next;
    });
  };

  const startReview = async () => {
    if (selectedLessonIds.size === 0) return;

    setIsLoading(true);
    try {
      const lessonIds = Array.from(selectedLessonIds).join(',');
      const response = await fetch(`/api/review/questions?lessonIds=${lessonIds}`);
      if (!response.ok) throw new Error('Failed to fetch questions');

      const data = await response.json();

      // Shuffle all questions for variety
      const shuffledQuestions = shuffleArray(data.questions);
      setQuestions(shuffledQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setAttempts([]);
      setShuffledOptionsMap({});
      setViewMode('quiz');
    } catch (error) {
      console.error('Error starting review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Get shuffled options for current question
  const shuffledOptions = useMemo(() => {
    if (shuffledOptionsMap[currentQuestionIndex]) {
      return shuffledOptionsMap[currentQuestionIndex];
    }
    if (currentQuestion?.options) {
      const shuffled = shuffleArray(currentQuestion.options);
      setShuffledOptionsMap(prev => ({ ...prev, [currentQuestionIndex]: shuffled }));
      return shuffled;
    }
    return [];
  }, [currentQuestionIndex, currentQuestion?.options, shuffledOptionsMap]);

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const attempt = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      weekNumber: currentQuestion.weekNumber,
    };

    setAttempts([...attempts, attempt]);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setViewMode('results');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  // Calculate results by week
  const resultsByWeek = useMemo(() => {
    const byWeek: Record<number, { correct: number; total: number; lessonTitle: string }> = {};

    attempts.forEach(attempt => {
      if (!byWeek[attempt.weekNumber]) {
        const question = questions.find(q => q.weekNumber === attempt.weekNumber);
        byWeek[attempt.weekNumber] = {
          correct: 0,
          total: 0,
          lessonTitle: question?.lessonTitle || `Week ${attempt.weekNumber}`,
        };
      }
      byWeek[attempt.weekNumber].total++;
      if (attempt.isCorrect) byWeek[attempt.weekNumber].correct++;
    });

    return byWeek;
  }, [attempts, questions]);

  const totalCorrect = attempts.filter(a => a.isCorrect).length;
  const totalScore = Math.round((totalCorrect / attempts.length) * 100);

  // VIEW: Select lessons
  if (viewMode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea]/10 via-[#764ba2]/10 to-white py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <Link
              href="/hebrew/lessons"
              className="inline-flex items-center text-[#667eea] hover:text-[#764ba2] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Lessons
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">Comprehensive Review</h1>
            <p className="text-gray-600">Select weeks to create a combined review quiz</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#667eea]"></div>
              <p className="mt-4 text-gray-600">Loading lessons...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">No Completed Lessons Yet</h2>
              <p className="text-gray-600 mb-6">
                Complete some lessons first to unlock comprehensive review!
              </p>
              <Link
                href="/hebrew/lessons"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Go to Lessons
              </Link>
            </div>
          ) : (
            <>
              {/* Selection summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedLessonIds.size} week{selectedLessonIds.size !== 1 ? 's' : ''} selected
                    </h2>
                    <p className="text-gray-600">Select 2-6 weeks for best review experience</p>
                  </div>
                  <button
                    onClick={startReview}
                    disabled={selectedLessonIds.size === 0}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      selectedLessonIds.size > 0
                        ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Start Review
                  </button>
                </div>
              </div>

              {/* Lessons by month */}
              {Object.keys(lessonsByMonth).sort().map(monthKey => {
                const month = parseInt(monthKey);
                const monthLessons = lessonsByMonth[month];
                const allSelected = monthLessons.every(l => selectedLessonIds.has(l.id));
                const someSelected = monthLessons.some(l => selectedLessonIds.has(l.id));

                return (
                  <div key={month} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-800">{getMonthTitle(month)}</h3>
                      <button
                        onClick={() => allSelected ? deselectAllInMonth(month) : selectAllInMonth(month)}
                        className="text-sm text-[#667eea] hover:text-[#764ba2] font-medium"
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {monthLessons.map(lesson => {
                        const isSelected = selectedLessonIds.has(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => toggleLesson(lesson.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-[#667eea] bg-[#667eea]/10'
                                : 'border-gray-200 hover:border-[#667eea]/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-[#667eea] bg-[#667eea]'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">Week {lesson.weekNumber}</div>
                                <div className="text-sm text-gray-600">{lesson.title}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  }

  // VIEW: Quiz
  if (viewMode === 'quiz' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea]/10 via-[#764ba2]/10 to-white py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Comprehensive Review</h1>
            <p className="text-gray-600">
              From: Week {currentQuestion.weekNumber} - {currentQuestion.lessonTitle}
            </p>
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
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Week {currentQuestion.weekNumber}
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Answer Options */}
            {currentQuestion.questionType === 'multiple_choice' && shuffledOptions.length > 0 && (
              <div className="space-y-3">
                {shuffledOptions.map((option, index) => {
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
                        <span className={`flex-1 ${showCorrect || showIncorrect ? 'font-medium' : ''}`}>
                          {option}
                        </span>
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
                isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
              }`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <>
                      <span className="text-2xl">&#9989;</span>
                      <div>
                        <p className="font-semibold text-green-800">Correct!</p>
                        {currentQuestion.explanation && (
                          <p className="text-sm text-green-700 mt-1">{currentQuestion.explanation}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">&#10060;</span>
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
                  {isLastQuestion ? 'See Results' : 'Next Question'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW: Results
  if (viewMode === 'results') {
    const passed = totalScore >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea]/10 via-[#764ba2]/10 to-white py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className={`text-8xl ${passed ? 'animate-bounce' : ''}`}>
              {passed ? '&#127881;' : '&#128218;'}
            </div>
            <h1 className={`text-6xl font-bold ${
              passed
                ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent'
                : 'text-gray-700'
            }`}>
              {totalScore}%
            </h1>
            <p className="text-2xl text-gray-700">
              {passed ? 'Great job on your comprehensive review!' : 'Keep studying! You\'re making progress.'}
            </p>
          </div>

          {/* Overall Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-3xl font-bold text-purple-600">{attempts.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Correct</p>
                <p className="text-3xl font-bold text-green-600">{totalCorrect}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Incorrect</p>
                <p className="text-3xl font-bold text-orange-600">{attempts.length - totalCorrect}</p>
              </div>
            </div>
          </div>

          {/* Results by Week */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Results by Week</h2>
            <div className="space-y-3">
              {Object.keys(resultsByWeek).sort((a, b) => Number(a) - Number(b)).map(weekKey => {
                const week = Number(weekKey);
                const result = resultsByWeek[week];
                const weekScore = Math.round((result.correct / result.total) * 100);
                const weekPassed = weekScore >= 70;

                return (
                  <div key={week} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-800">Week {week}</div>
                      <div className="text-sm text-gray-600">{result.lessonTitle}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        {result.correct}/{result.total}
                      </div>
                      <div className={`px-3 py-1 rounded-full font-semibold ${
                        weekPassed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {weekScore}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setViewMode('select');
                setSelectedLessonIds(new Set());
                setQuestions([]);
                setAttempts([]);
              }}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200"
            >
              New Review
            </button>
            <Link
              href="/hebrew/lessons"
              className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Back to Lessons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea]/10 via-[#764ba2]/10 to-white flex items-center justify-center">
      <div className="text-2xl text-gray-600">Loading...</div>
    </div>
  );
}
