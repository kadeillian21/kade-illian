"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface Lesson {
  id: string;
  language_id: string;
  week_number: number;
  month_number: number;
  title: string;
  description: string;
  lesson_content: string;
  topics: string[];
  vocabulary_set_ids: string[];
  vocabulary_sets?: VocabSet[];
  user_status: 'not_started' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
}

interface VocabSet {
  id: string;
  title: string;
  description: string;
  total_words: number;
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      // First check if lesson has interactive steps
      try {
        const stepsResponse = await fetch(`/api/lessons/${lessonId}/steps`);
        if (stepsResponse.ok) {
          const stepsData = await stepsResponse.json();
          if (stepsData.steps && stepsData.steps.length > 0) {
            // Lesson has interactive steps, redirect to interactive mode
            console.log('Redirecting to interactive lesson');
            router.push(`/hebrew/lessons/${lessonId}/interactive`);
            return;
          }
        } else {
          console.log('Steps API returned non-OK status:', stepsResponse.status);
        }
      } catch (stepsError) {
        // If steps fetch fails, continue to traditional view
        console.log('Failed to fetch steps, falling back to traditional view:', stepsError);
      }

      // Fallback to traditional lesson view
      console.log('Loading traditional lesson view');
      const response = await fetch(`/api/lessons/${lessonId}`);
      if (!response.ok) {
        console.error('Lesson API returned status:', response.status);
        throw new Error(`Failed to fetch lesson: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setLesson(data.lesson);

        // If lesson is not started, mark as in_progress
        if (data.lesson.user_status === 'not_started') {
          await updateLessonStatus('in_progress');
        }
      } else {
        throw new Error('Lesson data not successful');
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      // Set lesson to null to trigger "not found" UI
      setLesson(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLessonStatus = async (status: 'not_started' | 'in_progress' | 'completed') => {
    if (!lesson) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update lesson status');
      }

      // Reload lesson to get updated status
      await loadLesson();

      // Show success message
      if (status === 'completed') {
        alert('🎉 Lesson completed! Great work!');
      }
    } catch (error) {
      console.error('Error updating lesson status:', error);
      alert('Failed to update lesson status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkComplete = async () => {
    if (confirm('Mark this lesson as complete?')) {
      await updateLessonStatus('completed');
    }
  };

  const handleResetProgress = async () => {
    if (confirm('Reset progress for this lesson?')) {
      await updateLessonStatus('not_started');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
        <div className="text-white text-xl">Loading lesson...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Lesson Not Found</h2>
          <p className="text-gray-600 mb-6">
            This lesson doesn't exist or hasn't been created yet.
          </p>
          <Link
            href="/hebrew/lessons"
            className="inline-block bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/hebrew/lessons"
            className="text-white hover:text-white/80 inline-flex items-center gap-2 text-sm"
          >
            ← Back to All Lessons
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-semibold text-[#667eea] bg-[#e3e8ff] px-4 py-1 rounded-full">
              WEEK {lesson.week_number}
            </div>
            <div className={`text-xs px-3 py-1 rounded-full font-semibold ${
              lesson.user_status === 'completed'
                ? 'bg-green-100 text-green-700'
                : lesson.user_status === 'in_progress'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {lesson.user_status === 'completed' ? '✓ Completed' :
               lesson.user_status === 'in_progress' ? 'In Progress' : 'Not Started'}
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {lesson.title}
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            {lesson.description}
          </p>

          {/* Topics */}
          {lesson.topics && lesson.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lesson.topics.map((topic, idx) => (
                <span
                  key={idx}
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Lesson Content */}
        {lesson.lesson_content && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-gray-800 mb-4 mt-8" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-gray-800 mb-3 mt-6" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-gray-700 mb-2 mt-4" {...props} />,
                  p: ({ node, ...props }) => <p className="text-gray-600 mb-4 leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 text-gray-600 space-y-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 text-gray-600 space-y-2" {...props} />,
                  code: ({ node, ...props }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-gray-800" {...props} />,
                }}
              >
                {lesson.lesson_content}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Associated Vocabulary Sets */}
        {lesson.vocabulary_sets && lesson.vocabulary_sets.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📚 Vocabulary for This Week
            </h2>
            <p className="text-gray-600 mb-6">
              Practice these vocabulary sets as part of this lesson:
            </p>

            <div className="space-y-4">
              {lesson.vocabulary_sets.map(vocabSet => (
                <Link
                  key={vocabSet.id}
                  href={`/hebrew/vocabulary?set=${vocabSet.id}`}
                  className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-6 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {vocabSet.title}
                    </h3>
                    <div className="text-sm font-semibold text-[#667eea] bg-[#e3e8ff] px-3 py-1 rounded-full">
                      {vocabSet.total_words} words
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {vocabSet.description || 'Practice this vocabulary set'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {lesson.user_status !== 'completed' && (
              <button
                onClick={handleMarkComplete}
                disabled={isUpdating}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : '✓ Mark as Complete'}
              </button>
            )}

            {lesson.user_status === 'completed' && (
              <button
                onClick={handleResetProgress}
                disabled={isUpdating}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : '↺ Reset Progress'}
              </button>
            )}

            <Link
              href="/hebrew/lessons"
              className="flex-1 bg-gray-100 text-gray-700 text-center py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Back to All Lessons
            </Link>
          </div>

          {/* Progress Info */}
          {lesson.started_at && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Started: {new Date(lesson.started_at).toLocaleDateString()}</span>
                {lesson.completed_at && (
                  <span>Completed: {new Date(lesson.completed_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
