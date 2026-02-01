'use client';

import { useState, useEffect } from 'react';
import {
  LessonStep,
  ObjectiveStepContent,
  ConceptStepContent,
  ScriptureStepContent,
  VocabularyStepContent,
  CompletionStepContent,
  HebrewVocabWord,
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
