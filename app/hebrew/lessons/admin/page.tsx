"use client";

import { useState } from 'react';
import Link from 'next/link';

interface LessonForm {
  id: string;
  language_id: string;
  week_number: number;
  month_number: number;
  title: string;
  description: string;
  lesson_content: string;
  topics: string;
  vocabulary_set_ids: string;
  order_index: number;
}

export default function LessonsAdminPage() {
  const [form, setForm] = useState<LessonForm>({
    id: '',
    language_id: 'hebrew',
    week_number: 1,
    month_number: 1,
    title: '',
    description: '',
    lesson_content: '',
    topics: '',
    vocabulary_set_ids: '',
    order_index: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Parse topics and vocab set IDs from comma-separated strings
      const topics = form.topics
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const vocabulary_set_ids = form.vocabulary_set_ids
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      const payload = {
        ...form,
        topics,
        vocabulary_set_ids
      };

      const response = await fetch('/api/lessons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: `✅ Lesson "${form.title}" created successfully!` });
        // Reset form
        setForm({
          id: '',
          language_id: 'hebrew',
          week_number: form.week_number + 1,
          month_number: form.month_number,
          title: '',
          description: '',
          lesson_content: '',
          topics: '',
          vocabulary_set_ids: '',
          order_index: form.order_index + 1
        });
      } else {
        setMessage({ type: 'error', text: `❌ Error: ${data.error}` });
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      setMessage({ type: 'error', text: '❌ Failed to create lesson' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-3">🔧 Lesson Admin</h1>
          <p className="text-lg opacity-90">Create new lessons for the curriculum</p>
          <div className="mt-4">
            <Link
              href="/hebrew/lessons"
              className="text-white/80 hover:text-white underline text-sm"
            >
              ← Back to Lessons
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Language
              </label>
              <select
                value={form.language_id}
                onChange={(e) => setForm({ ...form, language_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                required
              >
                <option value="hebrew">Biblical Hebrew</option>
                <option value="greek">Koine Greek</option>
              </select>
            </div>

            {/* Lesson ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson ID
              </label>
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                placeholder="e.g., hebrew-week-7-reading"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier (lowercase, hyphens, no spaces)
              </p>
            </div>

            {/* Week and Month */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Week Number
                </label>
                <input
                  type="number"
                  value={form.week_number}
                  onChange={(e) => setForm({ ...form, week_number: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Month Number
                </label>
                <input
                  type="number"
                  value={form.month_number}
                  onChange={(e) => setForm({ ...form, month_number: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Index
                </label>
                <input
                  type="number"
                  value={form.order_index}
                  onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Extended Reading Practice"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description shown on lesson card"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                required
              />
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topics (comma-separated)
              </label>
              <input
                type="text"
                value={form.topics}
                onChange={(e) => setForm({ ...form, topics: e.target.value })}
                placeholder="e.g., Genesis 1 Complete, Reading Fluency, Review"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
              />
            </div>

            {/* Vocabulary Set IDs */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vocabulary Set IDs (comma-separated)
              </label>
              <input
                type="text"
                value={form.vocabulary_set_ids}
                onChange={(e) => setForm({ ...form, vocabulary_set_ids: e.target.value })}
                placeholder="e.g., genesis-1-1-5, genesis-1-6-10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
              />
            </div>

            {/* Lesson Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson Content (Markdown)
              </label>
              <textarea
                value={form.lesson_content}
                onChange={(e) => setForm({ ...form, lesson_content: e.target.value })}
                placeholder="Full lesson content in Markdown format..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports Markdown: # Heading, ## Subheading, **bold**, - bullet points, etc.
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Lesson...' : 'Create Lesson'}
            </button>
          </form>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-8 bg-white/90 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-3">💡 Quick Start</h3>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>Set the lesson ID (e.g., <code className="bg-gray-100 px-2 py-1 rounded">hebrew-week-7-reading</code>)</li>
            <li>Enter week, month, and order numbers</li>
            <li>Write a compelling title and description</li>
            <li>Add topics as comma-separated values</li>
            <li>Link existing vocabulary sets by their IDs</li>
            <li>Write lesson content using Markdown</li>
            <li>Click "Create Lesson"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
