"use client";

import { HebrewVocabWord, CardType, AlphabetExtraData, SyllableExtraData, GrammarExtraData } from "../data/types";

interface FlashcardRendererProps {
  word: HebrewVocabWord;
  isFlipped: boolean;
  onFlip: () => void;
}

/**
 * Renders the appropriate flashcard UI based on card type
 */
export default function FlashcardRenderer({ word, isFlipped, onFlip }: FlashcardRendererProps) {
  const cardType = word.cardType || 'vocabulary';

  switch (cardType) {
    case 'alphabet':
      return <AlphabetCard word={word} isFlipped={isFlipped} onFlip={onFlip} />;
    case 'syllable':
      return <SyllableCard word={word} isFlipped={isFlipped} onFlip={onFlip} />;
    case 'grammar':
      return <GrammarCard word={word} isFlipped={isFlipped} onFlip={onFlip} />;
    default:
      return <VocabularyCard word={word} isFlipped={isFlipped} onFlip={onFlip} />;
  }
}

// Standard vocabulary flashcard
function VocabularyCard({ word, isFlipped, onFlip }: FlashcardRendererProps) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-2xl border-2 transition-all duration-500 cursor-pointer hover:shadow-3xl min-h-[400px] flex items-center justify-center ${
        isFlipped ? 'border-[#d4c5b0] bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]' : 'border-[#d4c5b0]'
      }`}
      onClick={onFlip}
    >
      {!isFlipped ? (
        <div className="p-12 text-center">
          <div
            className="text-7xl md:text-8xl font-bold font-[family-name:var(--font-hebrew)] text-[#4a5d49] mb-6 leading-[1.4] pb-4 select-text cursor-text"
            onClick={(e) => e.stopPropagation()}
          >
            {word.hebrew}
          </div>
          <div className="text-gray-400 italic text-lg">
            Click to reveal answer
          </div>
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {word.english}
          </div>
          <div className="text-2xl text-gray-600 italic mb-6">
            ({word.trans})
          </div>
          <div className="text-lg text-[#6b7d6a] font-medium mb-4">
            {word.type}
          </div>
          {word.notes && (
            <div className="text-base text-gray-600 leading-relaxed">
              {word.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Alphabet flashcard
function AlphabetCard({ word, isFlipped, onFlip }: FlashcardRendererProps) {
  const extraData = word.extraData as AlphabetExtraData | undefined;

  return (
    <div
      className={`bg-white rounded-3xl shadow-2xl border-2 transition-all duration-500 cursor-pointer hover:shadow-3xl min-h-[400px] flex items-center justify-center ${
        isFlipped ? 'border-[#d4c5b0] bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]' : 'border-[#d4c5b0]'
      }`}
      onClick={onFlip}
    >
      {!isFlipped ? (
        <div className="p-12 text-center">
          <div
            className="text-8xl md:text-9xl font-bold font-[family-name:var(--font-hebrew)] text-[#4a5d49] mb-6 leading-[1.4] pb-4 select-text cursor-text"
            onClick={(e) => e.stopPropagation()}
          >
            {word.hebrew}
          </div>
          <div className="text-gray-400 italic text-lg">
            Click to reveal answer
          </div>
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {word.english}
          </div>
          {extraData?.pronunciation && (
            <div className="text-2xl text-gray-600 italic mb-6">
              ({extraData.pronunciation})
            </div>
          )}
          {extraData?.sound && (
            <div className="text-xl text-gray-700 font-medium mb-6">
              Sound: {extraData.sound}
            </div>
          )}
          {word.notes && (
            <div className="text-lg text-gray-600 leading-relaxed">
              {word.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Syllable flashcard
function SyllableCard({ word, isFlipped, onFlip }: FlashcardRendererProps) {
  const extraData = word.extraData as SyllableExtraData | undefined;

  return (
    <div
      className={`bg-white rounded-3xl shadow-2xl border-2 transition-all duration-500 cursor-pointer hover:shadow-3xl min-h-[400px] flex items-center justify-center ${
        isFlipped ? 'border-[#d4c5b0] bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]' : 'border-[#d4c5b0]'
      }`}
      onClick={onFlip}
    >
      {!isFlipped ? (
        <div className="p-12 text-center">
          <div
            className="text-7xl md:text-8xl font-bold font-[family-name:var(--font-hebrew)] text-[#4a5d49] mb-6 select-text cursor-text"
            onClick={(e) => e.stopPropagation()}
          >
            {word.hebrew}
          </div>
          <div className="text-xl text-gray-600 mb-4">
            How do you divide this word into syllables?
          </div>
          <div className="text-gray-400 italic text-lg">
            Click to reveal answer
          </div>
        </div>
      ) : (
        <div className="p-12 text-center">
          {extraData?.syllables && (
            <div
              className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-hebrew)] text-gray-900 mb-4 select-text cursor-text"
              onClick={(e) => e.stopPropagation()}
            >
              {extraData.syllables}
            </div>
          )}
          {extraData?.pronunciation && (
            <div className="text-3xl text-gray-600 italic mb-6">
              ({extraData.pronunciation})
            </div>
          )}
          {extraData?.syllableType && (
            <div className="text-xl text-gray-700 font-medium mb-4">
              {extraData.syllableType}
            </div>
          )}
          {word.notes && (
            <div className="text-lg text-gray-600 leading-relaxed">
              {word.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Grammar marker flashcard
function GrammarCard({ word, isFlipped, onFlip }: FlashcardRendererProps) {
  const extraData = word.extraData as GrammarExtraData | undefined;

  return (
    <div
      className={`bg-white rounded-3xl shadow-2xl border-2 transition-all duration-500 cursor-pointer hover:shadow-3xl min-h-[450px] flex items-center justify-center ${
        isFlipped ? 'border-[#d4c5b0] bg-gradient-to-br from-[#fafaf8] to-[#f5f1e8]' : 'border-[#d4c5b0]'
      }`}
      onClick={onFlip}
    >
      {!isFlipped ? (
        <div className="p-12 text-center">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-[#f5f1e8] rounded-full text-sm font-medium text-[#4a5d49]">
              {extraData?.category || word.semanticGroup}
            </span>
          </div>
          <div
            className="text-8xl md:text-9xl font-bold font-[family-name:var(--font-hebrew)] text-[#4a5d49] mb-6 select-text cursor-text"
            onClick={(e) => e.stopPropagation()}
          >
            {word.hebrew}
          </div>
          <div className="text-gray-400 italic text-lg mt-6">
            Click to reveal what this means
          </div>
        </div>
      ) : (
        <div className="p-8 text-center w-full">
          <div
            className="text-5xl md:text-6xl font-bold text-[#4a5d49] mb-2 select-text cursor-text"
            onClick={(e) => e.stopPropagation()}
          >
            {word.english}
          </div>
          {extraData?.pronunciation && (
            <div className="text-2xl text-gray-500 italic mb-4">
              ({extraData.pronunciation})
            </div>
          )}
          {extraData?.grammarType && (
            <div className="text-lg text-[#6b7d6a] font-semibold mb-3">
              {extraData.grammarType}
            </div>
          )}
          {extraData?.explanation && (
            <div className="text-base text-gray-600 leading-relaxed mb-6">
              {extraData.explanation}
            </div>
          )}

          {/* Examples Section */}
          {extraData?.examples && extraData.examples.length > 0 && (
            <div className="bg-[#f5f1e8] rounded-2xl p-4 w-full">
              <h4 className="text-sm font-semibold text-[#4a5d49] mb-3 uppercase tracking-wide">Examples</h4>
              <div className="space-y-2">
                {extraData.examples.map((example, idx) => (
                  <div
                    key={idx}
                    className="font-[family-name:var(--font-hebrew)] text-lg text-gray-800 py-2 border-b border-[#e8dcc8] last:border-b-0 select-text cursor-text"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
