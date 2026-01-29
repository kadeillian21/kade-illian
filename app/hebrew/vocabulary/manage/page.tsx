'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Word {
  id: string;
  hebrew: string;
  transliteration: string;
  english: string;
  type: string;
  setId: string;
  setTitle: string;
  level: number;
  reviewCount: number;
}

interface VocabSet {
  id: string;
  title: string;
  words: Word[];
}

export default function BulkManagePage() {
  const [sets, setSets] = useState<VocabSet[]>([]);
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filterSet, setFilterSet] = useState<string>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAllWords();
  }, []);

  const fetchAllWords = async () => {
    try {
      const response = await fetch('/api/vocab/sets');
      const data = await response.json();

      // API returns array directly, not wrapped in { sets: [...] }
      const setsWithWords: VocabSet[] = data.map((set: any) => ({
        id: set.id,
        title: set.title,
        words: (set.groups || []).flatMap((group: any) =>
          (group.words || []).map((word: any) => ({
            ...word,
            setId: set.id,
            setTitle: set.title,
          }))
        ),
      }));

      setSets(setsWithWords);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching words:', error);
      setLoading(false);
    }
  };

  const allWords = sets.flatMap((set) => set.words);
  const filteredWords = filterSet === 'all'
    ? allWords
    : allWords.filter((w) => w.setId === filterSet);

  const toggleWord = (wordId: string) => {
    const newSelected = new Set(selectedWordIds);
    if (newSelected.has(wordId)) {
      newSelected.delete(wordId);
    } else {
      newSelected.add(wordId);
    }
    setSelectedWordIds(newSelected);
  };

  const selectAll = () => {
    setSelectedWordIds(new Set(filteredWords.map((w) => w.id)));
  };

  const deselectAll = () => {
    setSelectedWordIds(new Set());
  };

  const handleBulkUpdate = async (action: 'learned' | 'needs-work') => {
    if (selectedWordIds.size === 0) {
      setMessage({ type: 'error', text: 'Please select at least one word' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch('/api/vocab/progress/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordIds: Array.from(selectedWordIds),
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({
          type: 'success',
          text: `Successfully updated ${data.updated} words as "${action === 'learned' ? 'Learned' : 'Needs Work'}"`,
        });

        // Refresh data
        await fetchAllWords();

        // Clear selection
        setSelectedWordIds(new Set());

        // Clear message after 3s
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating:', error);
      setMessage({ type: 'error', text: 'Failed to update progress' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (level: number) => {
    if (level === 0) {
      return <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">Unlearned</span>;
    } else if (level >= 5) {
      return <span className="px-2 py-1 text-xs rounded bg-green-200 text-green-800">Mastered</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded bg-blue-200 text-blue-800">Learning (L{level})</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9f5] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading vocabulary...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9f5] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/hebrew/vocabulary"
            className="text-[#8b9a8b] hover:text-[#4a5d49] mb-4 inline-block"
          >
            ← Back to Vocabulary
          </Link>
          <h1 className="text-3xl font-bold text-[#2d3a2d] mb-2">Bulk Word Management</h1>
          <p className="text-[#6b7b6b]">
            Select multiple words and mark them as learned or needs work
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Filter by set */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-[#6b7b6b]">Filter by set:</label>
              <select
                value={filterSet}
                onChange={(e) => setFilterSet(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Sets ({allWords.length} words)</option>
                {sets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.title} ({set.words.length} words)
                  </option>
                ))}
              </select>
            </div>

            {/* Selection controls */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6b7b6b]">
                {selectedWordIds.size} selected
              </span>
              <button
                onClick={selectAll}
                className="px-4 py-2 text-sm text-[#4a5d49] border border-[#4a5d49] rounded-lg hover:bg-[#4a5d49] hover:text-white transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Action buttons */}
          {selectedWordIds.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => handleBulkUpdate('learned')}
                disabled={updating}
                className="px-6 py-3 bg-[#4a5d49] text-white rounded-lg hover:bg-[#3d4d3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {updating ? 'Updating...' : `Mark ${selectedWordIds.size} as Learned`}
              </button>
              <button
                onClick={() => handleBulkUpdate('needs-work')}
                disabled={updating}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {updating ? 'Updating...' : `Mark ${selectedWordIds.size} as Needs Work`}
              </button>
            </div>
          )}
        </div>

        {/* Word list */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedWordIds.size === filteredWords.length && filteredWords.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAll();
                        } else {
                          deselectAll();
                        }
                      }}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2d3a2d]">
                    Hebrew
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2d3a2d]">
                    English
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2d3a2d]">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2d3a2d]">
                    Set
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2d3a2d]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2d3a2d]">
                    Reviews
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWords.map((word) => (
                  <tr
                    key={word.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedWordIds.has(word.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleWord(word.id)}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedWordIds.has(word.id)}
                        onChange={() => toggleWord(word.id)}
                        className="w-4 h-4"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-2xl font-[family-name:var(--font-hebrew)] text-[#4a5d49] select-text">
                        {word.hebrew}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{word.transliteration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-base text-[#2d3a2d]">{word.english}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{word.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{word.setTitle}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(word.level)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{word.reviewCount || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 text-center text-sm text-[#6b7b6b]">
          Showing {filteredWords.length} words
          {filterSet !== 'all' && ` from ${sets.find((s) => s.id === filterSet)?.title}`}
        </div>
      </div>
    </div>
  );
}
