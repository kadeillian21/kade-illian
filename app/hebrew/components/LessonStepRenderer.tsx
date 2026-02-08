'use client';

import { useState, useEffect } from 'react';
import {
  LessonStep,
  ObjectiveStepContent,
  ConceptStepContent,
  AdjectiveComparisonStepContent,
  ScriptureStepContent,
  VocabularyStepContent,
  CompletionStepContent,
  HebrewVocabWord,
  AdjectivePair,
} from '../vocabulary/data/types';
import FlashcardStudyUI from '../vocabulary/components/FlashcardStudyUI';

// Extended ConceptStepContent to support inline flashcard practice
interface ExtendedConceptStepContent extends ConceptStepContent {
  practiceVocabSetId?: string; // Optional vocab set for immediate practice
}

interface LessonStepRendererProps {
  step: LessonStep;
  onComplete: () => void;
  totalSteps: number;
}

export default function LessonStepRenderer({ step, onComplete, totalSteps }: LessonStepRendererProps) {
  const { stepType, content, stepNumber } = step;

  const renderStep = () => {
    switch (stepType) {
      case 'objective':
        return <ObjectiveStep content={content as ObjectiveStepContent} onContinue={onComplete} />;
      case 'concept':
        return <ConceptStep content={content as ConceptStepContent} onContinue={onComplete} />;
      case 'adjective-comparison':
        return <AdjectiveComparisonStep content={content as AdjectiveComparisonStepContent} onContinue={onComplete} />;
      case 'scripture':
        return <ScriptureStep content={content as ScriptureStepContent} onContinue={onComplete} />;
      case 'vocabulary':
        return <VocabularyStep content={content as VocabularyStepContent} onContinue={onComplete} />;
      case 'completion':
        return <CompletionStep content={content as CompletionStepContent} onComplete={onComplete} />;
      default:
        return <div>Unknown step type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea]/10 via-[#764ba2]/10 to-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-500"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="pt-8 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {renderStep()}
        </div>
      </div>

      {/* Step Counter */}
      <div className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <span className="text-sm font-medium text-gray-600">
          Step {stepNumber} of {totalSteps}
        </span>
      </div>
    </div>
  );
}

// Objective Step Component
function ObjectiveStep({ content, onContinue }: { content: ObjectiveStepContent; onContinue: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <div className="space-y-8 max-w-2xl">
        <div className="space-y-4">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-full text-sm font-medium">
            This Week&apos;s Lesson
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            {content.title}
          </h1>
        </div>

        <div className="space-y-4 text-left bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800">Learning Objectives:</h2>
          <ul className="space-y-3">
            {content.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">{objective}</span>
              </li>
            ))}
          </ul>

          {content.verseReference && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">You&apos;ll be reading:</p>
              <p className="text-lg font-semibold text-purple-700">{content.verseReference}</p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Estimated time: {content.estimatedMinutes} minutes</span>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="px-8 py-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          Let&apos;s Go! 🚀
        </button>
      </div>
    </div>
  );
}

// Concept Step Component
function ConceptStep({ content, onContinue }: { content: ConceptStepContent; onContinue: () => void }) {
  const [theoryExpanded, setTheoryExpanded] = useState(false);
  const [practiceWords, setPracticeWords] = useState<HebrewVocabWord[]>([]);
  const [showPractice, setShowPractice] = useState(false);
  const [isLoadingPractice, setIsLoadingPractice] = useState(false);

  const extendedContent = content as ExtendedConceptStepContent;

  // Load practice vocab automatically on mount
  useEffect(() => {
    if (extendedContent.practiceVocabSetId) {
      loadPracticeVocab();
    }
  }, [extendedContent.practiceVocabSetId]);

  const loadPracticeVocab = async () => {
    if (!extendedContent.practiceVocabSetId) return;

    setIsLoadingPractice(true);
    try {
      const response = await fetch('/api/vocab/sets');
      if (!response.ok) throw new Error('Failed to fetch vocab sets');

      const sets = await response.json();
      const targetSet = sets.find((s: any) => s.id === extendedContent.practiceVocabSetId);

      if (targetSet) {
        const allWords = targetSet.groups.flatMap((group: any) => group.words);
        setPracticeWords(allWords);
      }
    } catch (error) {
      console.error('Error loading practice vocab:', error);
    } finally {
      setIsLoadingPractice(false);
    }
  };

  return (
    <div className="space-y-8 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-800">{content.conceptName}</h1>
        <p className="text-xl text-gray-600">{content.summary}</p>
      </div>

      {/* Quick Visual Summary - ALWAYS show table if visualAid exists */}
      {content.visualAid && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border-2 border-blue-200 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Reference</h2>
          {content.visualAid.type === 'table' && content.visualAid.data.headers && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-100">
                    {content.visualAid.data.headers.map((header: string, idx: number) => (
                      <th key={idx} className="border border-purple-200 px-4 py-3 text-left font-semibold text-gray-800">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.visualAid.data.rows.map((row: string[], rowIdx: number) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell: string, cellIdx: number) => (
                        <td key={cellIdx} className="border border-gray-200 px-4 py-3">
                          {cellIdx === 0 || cellIdx === 1 ? (
                            <span className="text-2xl font-[family-name:var(--font-hebrew)] text-[#4a5d49] select-text">
                              {cell}
                            </span>
                          ) : (
                            <span className="text-gray-700">{cell}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ALSO show flashcards if practice set is available */}
      {extendedContent.practiceVocabSetId && practiceWords.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg border-2 border-purple-200 mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Practice These Patterns</h2>
          <p className="text-gray-600 mb-6">
            Now that you&apos;ve seen the patterns, practice recognizing them with flashcards!
          </p>
          <FlashcardStudyUI
            cards={practiceWords}
            flashcardMode="hebrew-to-english"
            showBackButton={false}
            autoAdvanceOnCorrect={false}
            isNotLearnedOnlyMode={false}
          />
        </div>
      )}

      {/* Examples */}
      <div className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Examples</h2>
        {content.examples.map((example, index) => (
          <div key={index} className="p-6 bg-purple-50 rounded-lg space-y-2">
            {example.hebrew && (
              <div className="text-4xl font-[family-name:var(--font-hebrew)] text-[#4a5d49] select-text text-right">
                {example.hebrew}
              </div>
            )}
            {example.translation && (
              <div className="text-lg text-gray-700">&quot;{example.translation}&quot;</div>
            )}
            <div className="text-sm text-gray-600 leading-relaxed">{example.explanation}</div>
          </div>
        ))}
      </div>

      {/* Expandable Theory Section */}
      {content.expandableTheory && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => setTheoryExpanded(!theoryExpanded)}
            className="w-full px-8 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <span className="text-lg font-semibold text-gray-800">{content.expandableTheory.title}</span>
            </div>
            <svg
              className={`w-6 h-6 text-gray-500 transition-transform ${theoryExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {theoryExpanded && (
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <div className="prose prose-purple max-w-none">
                {/* Render markdown - simplified for now */}
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {content.expandableTheory.content}
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={onContinue}
          className="px-8 py-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          Now Let&apos;s See It in Scripture →
        </button>
      </div>
    </div>
  );
}

// Adjective Comparison Step Component
function AdjectiveComparisonStep({ content, onContinue }: { content: AdjectiveComparisonStepContent; onContinue: () => void }) {
  const [selectedPair, setSelectedPair] = useState<AdjectivePair | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<'masculine' | 'feminine' | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Shuffle adjectives for quiz
  const quizAdjectives = [...content.adjectives].sort(() => Math.random() - 0.5);

  const handleQuizAnswer = (answer: 'masculine' | 'feminine') => {
    setQuizAnswer(answer);
    setShowQuizResult(true);

    // The quiz shows a Hebrew word and asks if it's masculine or feminine
    // We randomly pick one form to show
    const currentAdj = quizAdjectives[currentQuizIndex];
    const showingMasculine = currentQuizIndex % 2 === 0; // Alternate which form we show
    const correctAnswer = showingMasculine ? 'masculine' : 'feminine';

    if (answer === correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    setQuizAnswer(null);
    setShowQuizResult(false);
    if (currentQuizIndex < quizAdjectives.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Quiz complete
      setQuizMode(false);
      setCurrentQuizIndex(0);
    }
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-800">{content.title}</h1>
        <p className="text-xl text-gray-600">{content.description}</p>
      </div>

      {/* Pattern Explanation Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 shadow-lg border-2 border-amber-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
          <span className="text-3xl">🔑</span>
          {content.patternExplanation.title}
        </h2>
        <ul className="space-y-3">
          {content.patternExplanation.rules.map((rule, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <span className="text-gray-700 leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>
        {content.patternExplanation.exceptions && content.patternExplanation.exceptions.length > 0 && (
          <div className="mt-6 p-4 bg-amber-100 rounded-lg">
            <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Watch out for:</p>
            <ul className="space-y-1">
              {content.patternExplanation.exceptions.map((exception, index) => (
                <li key={index} className="text-sm text-amber-700">{exception}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setQuizMode(false)}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            !quizMode
              ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📖 Study Mode
        </button>
        <button
          onClick={() => { setQuizMode(true); setCurrentQuizIndex(0); setCorrectCount(0); }}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            quizMode
              ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎯 Quiz Mode
        </button>
      </div>

      {/* Study Mode: Side-by-Side Comparison */}
      {!quizMode && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Masculine ↔ Feminine Forms
          </h2>

          {/* Comparison Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100 to-purple-100">
                  <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-blue-800 w-1/4">
                    Masculine
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-pink-800 w-1/4">
                    Feminine
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700 w-1/4">
                    Meaning
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700 w-1/4">
                    Pattern
                  </th>
                </tr>
              </thead>
              <tbody>
                {content.adjectives.map((adj, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50 cursor-pointer transition-colors`}
                    onClick={() => setSelectedPair(selectedPair === adj ? null : adj)}
                  >
                    {/* Masculine */}
                    <td className="border border-gray-200 px-4 py-4 text-center">
                      <div className="text-3xl font-[family-name:var(--font-hebrew)] text-blue-700 select-text">
                        {adj.masculine.hebrew}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{adj.masculine.transliteration}</div>
                      <div className="text-xs text-blue-600 mt-1">{adj.masculine.pronunciation}</div>
                    </td>

                    {/* Feminine */}
                    <td className="border border-gray-200 px-4 py-4 text-center">
                      <div className="text-3xl font-[family-name:var(--font-hebrew)] text-pink-700 select-text">
                        {adj.feminine.hebrew}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{adj.feminine.transliteration}</div>
                      <div className="text-xs text-pink-600 mt-1">{adj.feminine.pronunciation}</div>
                    </td>

                    {/* Meaning */}
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="text-lg font-medium text-gray-800">{adj.english}</span>
                    </td>

                    {/* Pattern */}
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        adj.patternType === 'regular'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {adj.patternType === 'regular' ? '✓ Regular' : '⚡ Irregular'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Pair Detail */}
          {selectedPair && (
            <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Focus: {selectedPair.english}</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm text-blue-600 font-medium mb-1">Masculine Form</p>
                      <p className="text-4xl font-[family-name:var(--font-hebrew)] text-blue-800 select-text">
                        {selectedPair.masculine.hebrew}
                      </p>
                      <p className="text-gray-600">{selectedPair.masculine.pronunciation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-pink-600 font-medium mb-1">Feminine Form</p>
                      <p className="text-4xl font-[family-name:var(--font-hebrew)] text-pink-800 select-text">
                        {selectedPair.feminine.hebrew}
                      </p>
                      <p className="text-gray-600">{selectedPair.feminine.pronunciation}</p>
                    </div>
                  </div>
                  {selectedPair.notes && (
                    <p className="mt-4 text-sm text-gray-600 italic">{selectedPair.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPair(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Visual Pattern Guide */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border-2 border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>👁️</span> Visual Pattern Recognition
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Regular Pattern:</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-[family-name:var(--font-hebrew)] text-blue-700">טוֹב</span>
                  <span className="text-2xl text-gray-400">→</span>
                  <span className="text-3xl font-[family-name:var(--font-hebrew)] text-pink-700">
                    טוֹב<span className="text-pink-500 bg-pink-100 rounded px-1">ָה</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Add <span className="font-[family-name:var(--font-hebrew)] bg-pink-100 px-1 rounded">ָה</span> (qamats + he) to make feminine</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Irregular Pattern:</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-[family-name:var(--font-hebrew)] text-blue-700">גָּדוֹל</span>
                  <span className="text-2xl text-gray-400">→</span>
                  <span className="text-3xl font-[family-name:var(--font-hebrew)] text-pink-700">גְּדוֹלָה</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Vowel changes + <span className="font-[family-name:var(--font-hebrew)] bg-pink-100 px-1 rounded">ָה</span> ending</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Mode */}
      {quizMode && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-500 mb-2">
              Question {currentQuizIndex + 1} of {quizAdjectives.length}
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all"
                style={{ width: `${((currentQuizIndex + 1) / quizAdjectives.length) * 100}%` }}
              />
            </div>
          </div>

          {currentQuizIndex < quizAdjectives.length && (
            <>
              {/* Question */}
              <div className="text-center mb-8">
                <p className="text-lg text-gray-600 mb-4">Is this adjective masculine or feminine?</p>
                <div className="text-6xl font-[family-name:var(--font-hebrew)] text-gray-800 select-text py-8">
                  {currentQuizIndex % 2 === 0
                    ? quizAdjectives[currentQuizIndex].masculine.hebrew
                    : quizAdjectives[currentQuizIndex].feminine.hebrew}
                </div>
                <p className="text-xl text-gray-700">&quot;{quizAdjectives[currentQuizIndex].english}&quot;</p>
              </div>

              {/* Answer Buttons */}
              {!showQuizResult ? (
                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => handleQuizAnswer('masculine')}
                    className="px-8 py-4 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl font-semibold text-lg transition-all border-2 border-blue-300"
                  >
                    ♂ Masculine
                  </button>
                  <button
                    onClick={() => handleQuizAnswer('feminine')}
                    className="px-8 py-4 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-xl font-semibold text-lg transition-all border-2 border-pink-300"
                  >
                    ♀ Feminine
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  {/* Result */}
                  <div className={`mb-6 p-4 rounded-xl ${
                    quizAnswer === (currentQuizIndex % 2 === 0 ? 'masculine' : 'feminine')
                      ? 'bg-green-100 border-2 border-green-300'
                      : 'bg-red-100 border-2 border-red-300'
                  }`}>
                    <p className={`text-xl font-semibold ${
                      quizAnswer === (currentQuizIndex % 2 === 0 ? 'masculine' : 'feminine')
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}>
                      {quizAnswer === (currentQuizIndex % 2 === 0 ? 'masculine' : 'feminine')
                        ? '✓ Correct!'
                        : `✗ It's ${currentQuizIndex % 2 === 0 ? 'masculine' : 'feminine'}`}
                    </p>
                    <div className="mt-4 flex justify-center gap-8">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Masculine</p>
                        <p className="text-2xl font-[family-name:var(--font-hebrew)] text-blue-800">
                          {quizAdjectives[currentQuizIndex].masculine.hebrew}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-pink-600 font-medium">Feminine</p>
                        <p className="text-2xl font-[family-name:var(--font-hebrew)] text-pink-800">
                          {quizAdjectives[currentQuizIndex].feminine.hebrew}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={nextQuizQuestion}
                    className="px-8 py-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    {currentQuizIndex < quizAdjectives.length - 1 ? 'Next Question →' : 'See Results'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Final Score */}
          {currentQuizIndex >= quizAdjectives.length - 1 && !quizMode && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h3>
              <p className="text-xl text-gray-600">
                You got {correctCount} out of {quizAdjectives.length} correct
              </p>
              <div className="mt-4 text-3xl">
                {correctCount === quizAdjectives.length ? '🌟 Perfect!' :
                 correctCount >= quizAdjectives.length * 0.8 ? '👏 Great job!' :
                 correctCount >= quizAdjectives.length * 0.5 ? '👍 Keep practicing!' :
                 '💪 Keep going!'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={onContinue}
          className="px-8 py-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          Continue to Scripture →
        </button>
      </div>
    </div>
  );
}

// Scripture Step Component
function ScriptureStep({ content, onContinue }: { content: ScriptureStepContent; onContinue: () => void }) {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <div className="space-y-8 py-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800">{content.reference}</h2>
        <p className="text-gray-600">Click words to see translations</p>
      </div>

      {/* Hebrew Text */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-right space-y-4">
          <div className="text-4xl font-[family-name:var(--font-hebrew)] text-[#4a5d49] select-text leading-relaxed">
            {content.hebrewText}
          </div>
        </div>

        {/* Toggle Translation */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
          >
            {showTranslation ? 'Hide' : 'Show'} English Translation
            <svg className={`w-4 h-4 transition-transform ${showTranslation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTranslation && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed">{content.englishTranslation}</p>
            </div>
          )}
        </div>

        {/* Comprehension Prompt */}
        {content.comprehensionPrompt && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm font-medium text-purple-700">Think about it:</p>
            <p className="text-gray-700 mt-1">{content.comprehensionPrompt}</p>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={onContinue}
          className="px-8 py-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          Continue to Vocabulary Practice →
        </button>
      </div>
    </div>
  );
}

// Vocabulary Step Component
function VocabularyStep({ content, onContinue }: { content: VocabularyStepContent; onContinue: () => void }) {
  const [words, setWords] = useState<HebrewVocabWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVocabularyWords();
  }, [content.vocabularySetId]);

  const loadVocabularyWords = async () => {
    try {
      const response = await fetch('/api/vocab/sets');
      if (!response.ok) throw new Error('Failed to fetch vocab sets');

      const sets = await response.json();
      const targetSet = sets.find((s: any) => s.id === content.vocabularySetId);

      if (targetSet) {
        // Flatten all words from all groups
        const allWords = targetSet.groups.flatMap((group: any) => group.words);
        setWords(allWords);
      }
    } catch (error) {
      console.error('Error loading vocabulary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <p className="text-gray-600">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <p className="text-gray-600 mb-4">No vocabulary found for this lesson.</p>
          <button
            onClick={onContinue}
            className="px-8 py-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Practice Your Vocabulary</h2>
          <p className="text-gray-600">{content.instructions}</p>
        </div>

        {/* Context */}
        {content.contextVerse && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <p className="text-sm text-gray-600 mb-2">From this verse:</p>
              <p className="text-lg font-[family-name:var(--font-hebrew)] text-[#4a5d49] select-text text-right">
                {content.contextVerse}
              </p>
            </div>
          </div>
        )}

        {/* Flashcard Study UI - EXACT same component as vocabulary page */}
        <FlashcardStudyUI
          cards={words}
          flashcardMode="hebrew-to-english"
          showBackButton={false}
          autoAdvanceOnCorrect={false}
          isNotLearnedOnlyMode={false}
        />

        {/* Continue Button */}
        <div className="text-center mt-8">
          <button
            onClick={onContinue}
            className="px-8 py-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Continue to Quiz →
          </button>
        </div>
      </div>
    </div>
  );
}

// Completion Step Component
function CompletionStep({ content, onComplete }: { content: CompletionStepContent; onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <div className="space-y-8 max-w-2xl">
        {/* Success Animation */}
        <div className="text-8xl animate-bounce">🎉</div>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            Lesson Complete!
          </h1>
          <p className="text-2xl text-gray-700">{content.celebrationMessage}</p>
        </div>

        {/* XP Reward */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-center gap-4">
            <span className="text-4xl">⭐</span>
            <div className="text-left">
              <p className="text-sm text-gray-600">XP Earned</p>
              <p className="text-3xl font-bold text-purple-600">+{content.xpAwarded} XP</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {content.achievements && content.achievements.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Achievements Unlocked!</h3>
            <div className="space-y-2">
              {content.achievements.map((achievement, index) => (
                <div key={index} className="p-3 bg-yellow-50 rounded-lg text-gray-700">
                  {achievement}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference Links */}
        {content.referenceLinks && content.referenceLinks.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg text-left">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Want to Learn More?</h3>
            <div className="space-y-2">
              {content.referenceLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 hover:text-purple-800 transition-colors"
                >
                  {link.title} →
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {content.reviewPrompt && (
            <button
              onClick={() => window.location.href = '/hebrew/vocabulary'}
              className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-all"
            >
              Review Vocabulary
            </button>
          )}
          <button
            onClick={onComplete}
            className="px-8 py-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            {content.nextLessonId ? 'Next Lesson →' : 'Back to Lessons'}
          </button>
        </div>
      </div>
    </div>
  );
}
