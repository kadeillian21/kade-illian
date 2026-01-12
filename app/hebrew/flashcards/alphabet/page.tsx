"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Card {
  char: string;
  name: string;
  pronunciation: string;
  sound: string;
  notes: string;
}

const allCards: Card[] = [
  // CONSONANTS (28)
  { char: 'א', name: 'Aleph', pronunciation: 'AH-lef', sound: '(silent)', notes: 'Looks like X' },
  { char: 'ב', name: 'Bet', pronunciation: 'bayt', sound: 'b / v', notes: 'Backwards C with floor' },
  { char: 'ג', name: 'Gimel', pronunciation: 'GEE-mel', sound: 'g', notes: 'Always hard g' },
  { char: 'ד', name: 'Dalet', pronunciation: 'DAH-let', sound: 'd', notes: 'Has corner (vs ר)' },
  { char: 'ה', name: 'He', pronunciation: 'hay', sound: 'h', notes: 'Gap at top left' },
  { char: 'ו', name: 'Vav', pronunciation: 'vahv', sound: 'v / o / u', notes: 'Straight line; means "and"' },
  { char: 'ז', name: 'Zayin', pronunciation: 'ZAH-yin', sound: 'z', notes: 'Like a sword' },
  { char: 'ח', name: 'Chet', pronunciation: 'khet', sound: 'ch', notes: 'Throaty (like "Bach")' },
  { char: 'ט', name: 'Tet', pronunciation: 'tet', sound: 't', notes: 'Curly shape' },
  { char: 'י', name: 'Yod', pronunciation: 'yohd', sound: 'y / i', notes: 'Tiny apostrophe' },
  { char: 'כ', name: 'Kaph', pronunciation: 'kahf', sound: 'k / kh', notes: 'Like ב but rounder' },
  { char: 'ל', name: 'Lamed', pronunciation: 'LAH-med', sound: 'l', notes: 'Shepherd\'s staff, tallest letter' },
  { char: 'מ', name: 'Mem', pronunciation: 'mem', sound: 'm', notes: 'Square with opening bottom left' },
  { char: 'נ', name: 'Nun', pronunciation: 'noon', sound: 'n', notes: 'Like ו with base/foot' },
  { char: 'ס', name: 'Samekh', pronunciation: 'SAH-mekh', sound: 's', notes: 'Closed circle' },
  { char: 'ע', name: 'Ayin', pronunciation: 'AH-yin', sound: '(guttural)', notes: 'Silent/throaty, looks like Y' },
  { char: 'פ', name: 'Pe', pronunciation: 'pay', sound: 'p / f', notes: 'Like ב with inner line' },
  { char: 'צ', name: 'Tsade', pronunciation: 'TSAH-day', sound: 'ts', notes: 'Unique bent shape' },
  { char: 'ק', name: 'Qoph', pronunciation: 'kohf', sound: 'q', notes: 'Deep k sound' },
  { char: 'ר', name: 'Resh', pronunciation: 'raysh', sound: 'r', notes: 'Rounded top, SHORT, on baseline' },
  { char: 'שׂ', name: 'Sin', pronunciation: 'seen', sound: 's', notes: 'Dot on left' },
  { char: 'שׁ', name: 'Shin', pronunciation: 'sheen', sound: 'sh', notes: 'Dot on right' },
  { char: 'ת', name: 'Tav', pronunciation: 'tahv', sound: 't', notes: 'Like ח with extra line' },
  { char: 'ך', name: 'Kaph (final)', pronunciation: 'kahf', sound: 'kh', notes: 'LONG tail drops below baseline' },
  { char: 'ם', name: 'Mem (final)', pronunciation: 'mem', sound: 'm', notes: 'Closed square, stays ON baseline' },
  { char: 'ן', name: 'Nun (final)', pronunciation: 'noon', sound: 'n', notes: 'LONG tail drops below baseline' },
  { char: 'ף', name: 'Pe (final)', pronunciation: 'fay', sound: 'f', notes: 'LONG tail drops below baseline' },
  { char: 'ץ', name: 'Tsade (final)', pronunciation: 'TSAH-day', sound: 'ts', notes: 'LONG tail drops below baseline' },
  // VOWEL POINTS (13)
  { char: 'בָ', name: 'Qamets', pronunciation: 'KAH-mets', sound: '"ah" (father)', notes: 'Small T shape under letter' },
  { char: 'בֵ', name: 'Tsere', pronunciation: 'tsay-RAY', sound: '"ay" (day)', notes: 'Two dots under letter' },
  { char: 'בֹ', name: 'Holem', pronunciation: 'HOH-lem', sound: '"oh" (go)', notes: 'Dot above letter (or on vav)' },
  { char: 'בוּ', name: 'Shureq', pronunciation: 'shoo-ROOK', sound: '"oo" (food)', notes: 'Vav with dot inside' },
  { char: 'בִי', name: 'Hireq + Yod', pronunciation: 'hee-REEK', sound: '"ee" (see)', notes: 'Dot under + yod after' },
  { char: 'בַ', name: 'Patach', pronunciation: 'pah-TAKH', sound: '"ah" (cat)', notes: 'Line under letter' },
  { char: 'בֶ', name: 'Segol', pronunciation: 'seh-GOHL', sound: '"eh" (bed)', notes: 'Three dots under letter' },
  { char: 'בִ', name: 'Hireq', pronunciation: 'hee-REEK', sound: '"ih" (sit)', notes: 'One dot under letter' },
  { char: 'בֻ', name: 'Qibbuts', pronunciation: 'kee-BOOTS', sound: '"oo" (book)', notes: 'Three diagonal dots under' },
  { char: 'בְ', name: 'Sheva', pronunciation: 'sheh-VAH', sound: '"uh" or silent', notes: 'Two vertical dots - vocal at word start' },
  { char: 'בֲ', name: 'Hateph Patach', pronunciation: 'hah-TEF pah-TAKH', sound: '"ah" (short)', notes: 'Sheva + patach - with gutturals' },
  { char: 'בֱ', name: 'Hateph Segol', pronunciation: 'hah-TEF seh-GOHL', sound: '"eh" (short)', notes: 'Sheva + segol - with gutturals' },
  { char: 'בֳ', name: 'Hateph Qamets', pronunciation: 'hah-TEF KAH-mets', sound: '"oh" (short)', notes: 'Sheva + qamets - with gutturals' }
];

export default function AlphabetFlashcards() {
  const [cards, setCards] = useState<Card[]>(allCards);
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
                Hebrew Alphabet
              </span>
            </h1>
            <p className="text-lg text-gray-600">Master all 41 Hebrew characters</p>
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
                <div className="text-8xl md:text-9xl font-bold font-[family-name:var(--font-hebrew)] bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent mb-6 leading-[1.4] pb-4">
                  {currentCard.char}
                </div>
                <div className="text-gray-400 italic text-lg">
                  Click to reveal answer
                </div>
              </div>
            ) : (
              // Back of card
              <div className="p-12 text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {currentCard.name}
                </div>
                <div className="text-2xl text-gray-600 italic mb-6">
                  ({currentCard.pronunciation})
                </div>
                <div className="text-xl text-gray-700 font-medium mb-6">
                  Sound: {currentCard.sound}
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
              className="px-6 py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
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
        </div>
      </div>
    </div>
  );
}
