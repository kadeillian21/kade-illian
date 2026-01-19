'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

interface PreviewWord {
  id: string;
  hebrew: string;
  trans: string;
  english: string;
  type: string;
  category: string;
  subcategory?: string;
}

export default function AdminPage() {
  const [setId, setSetId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [preview, setPreview] = useState<PreviewWord[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handlePreview = () => {
    setError('');
    setPreview([]);

    try {
      // Parse JSON
      const words = JSON.parse(jsonInput);

      if (!Array.isArray(words)) {
        setError('JSON must be an array of word objects');
        return;
      }

      // Validate each word
      const previewWords: PreviewWord[] = [];
      for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // Check required fields
        if (!word.hebrew || !word.trans || !word.english || !word.type || !word.category) {
          setError(`Word ${i + 1} missing required fields: hebrew, trans, english, type, category`);
          return;
        }

        // Generate ID
        const wordId = `${setId || 'set'}-${word.trans.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

        previewWords.push({
          id: wordId,
          hebrew: word.hebrew,
          trans: word.trans,
          english: word.english,
          type: word.type,
          category: word.category,
          subcategory: word.subcategory,
        });
      }

      setPreview(previewWords);
    } catch (err) {
      setError('Invalid JSON syntax');
    }
  };

  const handleCreate = async () => {
    setError('');
    setSuccess('');

    // Validate set info
    if (!setId || !title) {
      setError('Set ID and Title are required');
      return;
    }

    if (preview.length === 0) {
      setError('Please preview the JSON first');
      return;
    }

    setIsCreating(true);

    try {
      // Parse words again
      const words = JSON.parse(jsonInput);

      // Call API
      const response = await fetch('/api/vocab/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setId,
          title,
          description,
          words,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create vocab set');
        setIsCreating(false);
        return;
      }

      setSuccess(`Success! Created "${title}" with ${data.words.length} words`);

      // Clear form
      setTimeout(() => {
        setSetId('');
        setTitle('');
        setDescription('');
        setJsonInput('');
        setPreview([]);
        setSuccess('');
      }, 3000);

    } catch (err) {
      setError('Failed to create vocab set');
    } finally {
      setIsCreating(false);
    }
  };

  // Auto-generate setId from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!setId) {
      // Generate set ID from title
      const generated = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSetId(generated);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/hebrew/vocabulary"
            className="inline-flex items-center text-[#4a5d49] hover:text-[#6b7d6a] transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Vocabulary
          </Link>

          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent mb-2">
            Admin: Add Vocabulary Set
          </h1>
          <p className="text-center text-gray-600">Paste JSON from Claude teacher to create a new vocab set</p>
        </div>

        {/* Set Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Set Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Genesis 1:6-10"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4a5d49] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Set ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={setId}
                onChange={(e) => setSetId(e.target.value)}
                placeholder="genesis-1-6-10"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4a5d49] focus:outline-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated from title, or enter manually</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Creation account days 2-3..."
                rows={2}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#4a5d49] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* JSON Input */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Paste JSON Array</h2>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`[\n  {\n    "hebrew": "רָקִיעַ",\n    "trans": "raqia",\n    "english": "expanse",\n    "type": "Noun",\n    "notes": "The firmament",\n    "semanticGroup": "Nature",\n    "frequency": 17,\n    "category": "Nouns",\n    "subcategory": "Nature & Elements"\n  }\n]`}
            rows={12}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#4a5d49] focus:outline-none font-mono text-sm"
          />

          <p className="text-xs text-gray-500 mt-2">
            Required fields: hebrew, trans, english, type, category
          </p>

          <button
            onClick={handlePreview}
            className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Preview & Validate
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border-2 border-green-400 text-green-700 px-6 py-4 rounded-xl mb-6">
            <p className="font-semibold">✅ {success}</p>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Preview ({preview.length} words)
            </h2>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {preview.map((word, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 font-mono text-sm w-8">{index + 1}</span>
                  <span className="text-2xl font-serif">{word.hebrew}</span>
                  <span className="text-gray-600 font-mono text-sm">({word.trans})</span>
                  <span className="flex-1">{word.english}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{word.type}</span>
                  <span className="text-xs text-gray-500 font-mono">{word.id}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] hover:from-[#5a6d59] hover:to-[#7b8d7a] text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : `Create Vocab Set (${preview.length} words)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
