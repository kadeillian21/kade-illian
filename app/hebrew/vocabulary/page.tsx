"use client";

// NOTE: Hebrew words should be selectable/copyable so users can look them up
// Avoid using bg-clip-text on Hebrew text as it clips diacritical marks (nikkud)

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VocabCard {
  hebrew: string;
  trans: string;
  english: string;
  type: string;
  notes: string;
}

const vocabulary: VocabCard[] = [
  // Session 27: Words 1-10
  { hebrew: 'אֱלֹהִים', trans: 'elohim', english: 'God', notes: 'Plural form, singular meaning', type: 'Noun' },
  { hebrew: 'שָׁמַיִם', trans: 'shamayim', english: 'heavens, sky', notes: 'Always plural', type: 'Noun' },
  { hebrew: 'אֶרֶץ', trans: 'erets', english: 'earth, land', notes: 'Very common', type: 'Noun' },
  { hebrew: 'מַיִם', trans: 'mayim', english: 'water', notes: 'Always plural', type: 'Noun' },
  { hebrew: 'אוֹר', trans: 'or', english: 'light', notes: 'Noun form', type: 'Noun' },
  { hebrew: 'חֹשֶׁךְ', trans: 'choshekh', english: 'darkness', notes: '', type: 'Noun' },
  { hebrew: 'יוֹם', trans: 'yom', english: 'day', notes: 'Also means "time"', type: 'Noun' },
  { hebrew: 'לַיְלָה', trans: 'laylah', english: 'night', notes: '', type: 'Noun' },
  { hebrew: 'רָקִיעַ', trans: 'raqia', english: 'expanse, firmament', notes: 'From verb "to spread out"', type: 'Noun' },
  { hebrew: 'תְּהוֹם', trans: 'tehom', english: 'deep, abyss', notes: 'Primordial waters', type: 'Noun' },

  // Session 28: Words 11-20
  { hebrew: 'בָּרָא', trans: 'bara', english: 'he created', notes: 'Qal Perfect 3ms - God as subject', type: 'Verb' },
  { hebrew: 'עָשָׂה', trans: 'asah', english: 'he made, did', notes: 'More common than בָּרָא', type: 'Verb' },
  { hebrew: 'אָמַר', trans: 'amar', english: 'he said', notes: 'Most frequent verb in Torah', type: 'Verb' },
  { hebrew: 'רָאָה', trans: 'raah', english: 'he saw', notes: 'III-He weak verb', type: 'Verb' },
  { hebrew: 'הָיָה', trans: 'hayah', english: 'he was, became', notes: 'Most common Hebrew verb', type: 'Verb' },
  { hebrew: 'קָרָא', trans: 'qara', english: 'he called, named', notes: '', type: 'Verb' },
  { hebrew: 'בֵּין', trans: 'beyn', english: 'between', notes: '', type: 'Preposition' },
  { hebrew: 'עַל', trans: 'al', english: 'upon, over', notes: 'Very common preposition', type: 'Preposition' },
  { hebrew: 'תַּחַת', trans: 'tachat', english: 'under, beneath', notes: '', type: 'Preposition' },
  { hebrew: 'כִּי', trans: 'ki', english: 'that, because, when', notes: 'Multi-purpose particle', type: 'Particle' },

  // Session 29: Words 21-30
  { hebrew: 'טוֹב', trans: 'tov', english: 'good', notes: 'Adjective (very good = טוֹב מְאֹד)', type: 'Adjective' },
  { hebrew: 'רוּחַ', trans: 'ruach', english: 'spirit, wind, breath', notes: 'Feminine noun', type: 'Noun' },
  { hebrew: 'פְּנֵי', trans: 'peney', english: 'face, surface', notes: 'Plural construct form', type: 'Noun' },
  { hebrew: 'בְּרֵאשִׁית', trans: 'bereshit', english: 'in beginning', notes: 'First word of Bible! בְּ (in) + רֵאשִׁית (beginning)', type: 'Noun' },
  { hebrew: 'תֹּהוּ', trans: 'tohu', english: 'formless, chaos', notes: 'Only with וָבֹהוּ', type: 'Noun' },
  { hebrew: 'בֹּהוּ', trans: 'vohu', english: 'void, empty', notes: 'Paired expression with תֹּהוּ', type: 'Noun' },
  { hebrew: 'אֶחָד', trans: 'echad', english: 'one', notes: 'Number (masculine)', type: 'Number' },
  { hebrew: 'שֵׁנִי', trans: 'sheni', english: 'second', notes: 'Ordinal number', type: 'Number' },
  { hebrew: 'עֶרֶב', trans: 'erev', english: 'evening', notes: '', type: 'Noun' },
  { hebrew: 'בֹּקֶר', trans: 'boqer', english: 'morning', notes: '', type: 'Noun' }
];

type Mode = 'hebrew-to-english' | 'english-to-hebrew';

export default function VocabularyFlashcards() {
  const [cards, setCards] = useState<VocabCard[]>(vocabulary);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<Mode>('hebrew-to-english');

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

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
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
              href="/hebrew"
              className="inline-flex items-center text-[#4a5d49] hover:text-[#6b7d6a] transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Hebrew
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Hebrew Vocabulary
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">Genesis 1:1-5 Vocab</p>

            {/* Mode Switcher */}
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => changeMode('hebrew-to-english')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  mode === 'hebrew-to-english'
                    ? 'bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
                }`}
              >
                Hebrew → English
              </button>
              <button
                onClick={() => changeMode('english-to-hebrew')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  mode === 'english-to-hebrew'
                    ? 'bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
                }`}
              >
                English → Hebrew
              </button>
            </div>
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
              isFlipped ? 'border-[#d4c5b0] bg-gradient-to-br from-pink-50 to-purple-50' : 'border-[#d4c5b0]'
            }`}
            onClick={flipCard}
          >
            {!isFlipped ? (
              // Front of card
              <div className="p-12 text-center">
                {mode === 'hebrew-to-english' ? (
                  <div
                    className="text-7xl md:text-8xl font-bold font-[family-name:var(--font-hebrew)] text-[#4a5d49] mb-4 select-text cursor-text"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {currentCard.hebrew}
                  </div>
                ) : (
                  <div className="text-5xl md:text-6xl font-bold text-gray-900">
                    {currentCard.english}
                  </div>
                )}
                <div className="text-gray-400 italic text-lg mt-6">
                  Click to reveal answer
                </div>
              </div>
            ) : (
              // Back of card
              <div className="p-12 text-center">
                <div
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 select-text cursor-text"
                  onClick={(e) => e.stopPropagation()}
                >
                  {mode === 'hebrew-to-english' ? currentCard.english : currentCard.hebrew}
                </div>
                <div className="text-2xl text-gray-600 italic mb-4">
                  ({currentCard.trans})
                </div>
                <div className="text-lg text-gray-700 font-medium mb-4">
                  {currentCard.type}
                </div>
                <div className="text-base text-gray-600 leading-relaxed">
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
              className="px-6 py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
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
