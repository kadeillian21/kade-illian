"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { HebrewVocabWord, VocabSet, UserProgress } from '../data/types';
import { getDueWords, getNewWords } from '../utils/srs-algorithm';

interface SetStats {
  total: number;
  new: number;
  due: number;
}

export function useVocabData() {
  const [vocabSets, setVocabSets] = useState<VocabSet[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load vocab sets and progress from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const [setsResponse, progressResponse] = await Promise.all([
          fetch('/api/vocab/sets'),
          fetch('/api/vocab/progress'),
        ]);

        if (!setsResponse.ok) throw new Error('Failed to fetch vocab sets');
        if (!progressResponse.ok) throw new Error('Failed to fetch progress');

        const sets = await setsResponse.json();
        const progressData = await progressResponse.json();

        if (!Array.isArray(sets)) {
          console.error('Invalid vocab sets response:', sets);
          setVocabSets([]);
        } else {
          setVocabSets(sets);
        }

        setProgress(progressData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load data';
        console.error('Error loading data:', err);
        setError(message);
        setVocabSets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getSetStats = useCallback((set: VocabSet): SetStats => {
    if (!set.groups || set.groups.length === 0) {
      return { total: 0, new: 0, due: 0 };
    }
    const allWords = set.groups.flatMap(g => g.words || []);
    return {
      total: allWords.length,
      new: getNewWords(allWords).length,
      due: getDueWords(allWords).length,
    };
  }, []);

  const activeSets = useMemo(
    () => vocabSets.filter(set => set.isActive),
    [vocabSets]
  );

  const allWords = useMemo(
    () => vocabSets.flatMap(set => (set.groups || []).flatMap(group => group.words || [])),
    [vocabSets]
  );

  const dueWordsFromActiveSets = useMemo(() => {
    const source = activeSets.length > 0 ? activeSets : vocabSets;
    const words = source.flatMap(set =>
      (set.groups || []).flatMap(group => group.words || [])
    );
    return getDueWords(words);
  }, [activeSets, vocabSets]);

  const toggleSetActive = useCallback(async (setId: string) => {
    try {
      const response = await fetch('/api/vocab/sets/toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId }),
      });

      if (response.ok) {
        const data = await response.json();
        setVocabSets(prev => prev.map(s => ({
          ...s,
          isActive: s.id === setId ? data.isActive : s.isActive,
        })));
      }
    } catch (err) {
      console.error('Error toggling set:', err);
    }
  }, []);

  const fetchFullSet = useCallback(async (setId: string): Promise<VocabSet | null> => {
    try {
      const response = await fetch(`/api/vocab/sets/${setId}`);
      if (!response.ok) throw new Error('Failed to fetch set');
      return await response.json();
    } catch (err) {
      console.error('Error loading set:', err);
      return null;
    }
  }, []);

  return {
    vocabSets,
    progress,
    setProgress,
    isLoading,
    error,
    getSetStats,
    activeSets,
    allWords,
    dueWordsFromActiveSets,
    toggleSetActive,
    fetchFullSet,
  };
}
