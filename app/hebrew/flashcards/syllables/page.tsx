"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SyllableCard {
  word: string;
  syllables: string;
  pronunciation: string;
  type: string;
  notes: string;
}

const allCards: SyllableCard[] = [
  // Simple 2-letter words
  { word: 'בֵּן', syllables: 'בֵּן', pronunciation: 'ben', type: '1 closed syllable', notes: 'Meaning: "son"' },
  { word: 'יָד', syllables: 'יָד', pronunciation: 'yad', type: '1 closed syllable', notes: 'Meaning: "hand"' },
  { word: 'לֹא', syllables: 'לֹא', pronunciation: 'lo', type: '1 open syllable', notes: 'Meaning: "no/not"' },
  { word: 'עַם', syllables: 'עַם', pronunciation: 'am', type: '1 closed syllable', notes: 'Meaning: "people"' },
  { word: 'גּוֹי', syllables: 'גּוֹי', pronunciation: 'goy', type: '1 closed syllable', notes: 'Meaning: "nation"' },

  // 3-letter words - multiple syllables
  { word: 'שָׁלוֹם', syllables: 'שָׁ־לוֹם', pronunciation: 'sha-LOM', type: 'Open + closed syllables', notes: 'Meaning: "peace"' },
  { word: 'מֶלֶךְ', syllables: 'מֶ־לֶךְ', pronunciation: 'MEH-lekh', type: 'Open + closed syllables', notes: 'Meaning: "king"' },
  { word: 'דָּבָר', syllables: 'דָּ־בָר', pronunciation: 'da-VAR', type: 'Open + closed syllables', notes: 'Meaning: "word"' },
  { word: 'אֱלֹהִים', syllables: 'אֱ־לֹ־הִים', pronunciation: 'e-lo-HEEM', type: '3 syllables', notes: 'Meaning: "God"' },
  { word: 'בָּרָא', syllables: 'בָּ־רָא', pronunciation: 'ba-RA', type: 'Open + open syllables', notes: 'Meaning: "he created"' },

  // Simple one-syllable words
  { word: 'טוֹב', syllables: 'טוֹב', pronunciation: 'tov', type: '1 closed syllable', notes: 'Meaning: "good"' },
  { word: 'אוֹר', syllables: 'אוֹר', pronunciation: 'or', type: '1 closed syllable', notes: 'Meaning: "light"' },
  { word: 'יוֹם', syllables: 'יוֹם', pronunciation: 'yom', type: '1 closed syllable', notes: 'Meaning: "day"' },
  { word: 'לַיְלָה', syllables: 'לַיְ־לָה', pronunciation: 'LAY-lah', type: 'Closed + open syllables', notes: 'Meaning: "night"' },

  // Words with maqqef (shown separately)
  { word: 'בֶּן־אָדָם', syllables: 'בֶּן־אָ־דָם', pronunciation: 'ben-a-DAM', type: 'Joined by maqqef', notes: 'Meaning: "son of man"' },

  // More practice words
  { word: 'אֶרֶץ', syllables: 'אֶ־רֶץ', pronunciation: 'EH-rets', type: 'Open + closed syllables', notes: 'Meaning: "earth/land"' },
  { word: 'שָׁמַיִם', syllables: 'שָׁ־מַ־יִם', pronunciation: 'sha-MA-yim', type: '3 syllables', notes: 'Meaning: "heavens/sky"' },
  { word: 'מַיִם', syllables: 'מַ־יִם', pronunciation: 'MA-yim', type: 'Open + closed syllables', notes: 'Meaning: "water"' },
  { word: 'רוּחַ', syllables: 'רוּ־חַ', pronunciation: 'RU-akh', type: 'Open + closed syllables', notes: 'Meaning: "spirit/wind"' },
  { word: 'תֹּהוּ', syllables: 'תֹּ־הוּ', pronunciation: 'TO-hu', type: 'Open + open syllables', notes: 'Meaning: "formless/chaos"' }
];

export default function SyllablesFlashcards() {
  const [cards, setCards] = useState<SyllableCard[]>(allCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    setCurrentIndex((currentIndex + 1) % cards.length);
    setIsFlipped(false);
  };

  const previousCard = () => {
    setCurrentIndex((currentIndex - 1 + cards.length) % cards.length);
    setIsFlipped(false);
  };

  const shuffle = () => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === 'ArrowLeft') previousCard();
      if (e.key === ' ') {
        e.preventDefault();
        flipCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
      <div className="container py-12 px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/hebrew/flashcards"
              className="inline-flex items-center text-[#4a5d49] hover:text-[#6b7d6a] transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Flashcards
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Hebrew Syllables
              </span>
            </h1>
            <p className="text-lg text-gray-600">Practice dividing words into syllables</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                {currentIndex + 1} / {cards.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6b7d6a] to-[#8a9a8a] rounded-full transition-all duration-300 shadow-md"
                style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <div
            className={`bg-white rounded-3xl shadow-2xl border-2 transition-all duration-500 cursor-pointer hover:shadow-3xl mb-6 min-h-[400px] flex items-center justify-center ${
              isFlipped ? 'border-[#d4c5b0] bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]' : 'border-[#d4c5b0]'
            }`}
            onClick={flipCard}
          >
            {!isFlipped ? (
              // Front of card
              <div className="p-12 text-center">
                <div className="text-7xl md:text-8xl font-bold font-[family-name:var(--font-hebrew)] bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent mb-6">
                  {currentCard.word}
                </div>
                <div className="text-xl text-gray-600 mb-4">
                  How do you divide this word into syllables?
                </div>
                <div className="text-gray-400 italic text-lg">
                  Click to reveal answer
                </div>
              </div>
            ) : (
              // Back of card
              <div className="p-12 text-center">
                <div className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-hebrew)] text-gray-900 mb-4">
                  {currentCard.syllables}
                </div>
                <div className="text-3xl text-gray-600 italic mb-6">
                  ({currentCard.pronunciation})
                </div>
                <div className="text-xl text-gray-700 font-medium mb-4">
                  {currentCard.type}
                </div>
                <div className="text-lg text-gray-600 leading-relaxed">
                  {currentCard.notes}
                </div>
              </div>
            )}
          </div>

          {/* Hint */}
          <div className="text-center text-sm text-gray-600 mb-6">
            💡 Click card to flip • Arrow keys to navigate • Space to flip
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={previousCard}
              className="px-6 py-3 bg-white/80 hover:bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
            >
              ← Previous
            </button>
            <button
              onClick={shuffle}
              className="px-6 py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] hover:from-pink-700 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              🔀 Shuffle
            </button>
            <button
              onClick={nextCard}
              className="px-6 py-3 bg-white/80 hover:bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
            >
              Next →
            </button>
          </div>

          {/* Syllable Rules Info */}
          <div className="mt-12 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Syllable Division Rules
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start">
                <div className="text-2xl mr-3">📌</div>
                <div>
                  <strong>Open Syllable:</strong> Ends with a vowel (CV pattern)
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-2xl mr-3">📌</div>
                <div>
                  <strong>Closed Syllable:</strong> Ends with a consonant (CVC pattern)
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-2xl mr-3">📌</div>
                <div>
                  <strong>Maqqef (־):</strong> Connects words together
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-2xl mr-3">💡</div>
                <div>
                  <strong>Tip:</strong> Hebrew syllables typically begin with a consonant
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
