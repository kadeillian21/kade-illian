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
  // Genesis 1:1 (10 words)
  { hebrew: 'אֱלֹהִים', trans: 'elohim', english: 'God', type: 'noun (masculine plural)', notes: 'First word about God in the Bible (Gen 1:1)' },
  { hebrew: 'בָּרָא', trans: 'bara', english: 'he created', type: 'verb (Qal perfect 3ms)', notes: 'Only God "creates" with this verb - ex nihilo' },
  { hebrew: 'בְּרֵאשִׁית', trans: 'bereshit', english: 'in the beginning', type: 'prepositional phrase', notes: 'First word of the entire Bible!' },
  { hebrew: 'אֵת', trans: 'et', english: '(direct object marker)', type: 'particle', notes: 'Shows what receives the action - untranslatable' },
  { hebrew: 'הַשָּׁמַיִם', trans: 'hashamayim', english: 'the heavens', type: 'noun (masculine plural + article)', notes: 'Always plural in Hebrew' },
  { hebrew: 'וְאֵת', trans: "ve'et", english: 'and (obj marker)', type: 'conjunction + particle', notes: 'Vav + direct object marker' },
  { hebrew: 'הָאָרֶץ', trans: "ha'arets", english: 'the earth/land', type: 'noun (feminine singular + article)', notes: 'Can mean earth or land depending on context' },
  { hebrew: 'שָׁמַיִם', trans: 'shamayim', english: 'heavens/sky', type: 'noun (masculine plural)', notes: 'Without the article (see הַשָּׁמַיִם)' },
  { hebrew: 'אֶרֶץ', trans: 'erets', english: 'earth/land', type: 'noun (feminine singular)', notes: 'Without the article (see הָאָרֶץ)' },
  { hebrew: 'רֵאשִׁית', trans: 'reshit', english: 'beginning', type: 'noun (feminine)', notes: 'Root: ראש (head/first)' },

  // Genesis 1:2 (10 words)
  { hebrew: 'הָיְתָה', trans: 'hayetah', english: 'she was', type: 'verb (Qal perfect 3fs)', notes: 'From הָיָה (to be) - feminine because אֶרֶץ is feminine' },
  { hebrew: 'תֹהוּ', trans: 'tohu', english: 'formless/chaos', type: 'noun (masculine)', notes: 'Often paired with בֹהוּ - "formless and void"' },
  { hebrew: 'וָבֹהוּ', trans: 'vavohu', english: 'and void', type: 'conjunction + noun', notes: 'Creates the famous phrase: תֹהוּ וָבֹהוּ' },
  { hebrew: 'חֹשֶׁךְ', trans: 'khoshekh', english: 'darkness', type: 'noun (masculine)', notes: 'Opposite of אוֹר (light)' },
  { hebrew: 'עַל', trans: 'al', english: 'on/upon/over', type: 'preposition', notes: 'Very common preposition' },
  { hebrew: 'פְּנֵי', trans: 'penei', english: 'face of/surface of', type: 'noun (construct plural)', notes: 'From פָּנִים (face) - always plural' },
  { hebrew: 'תְהוֹם', trans: 'tehom', english: 'the deep', type: 'noun (feminine)', notes: 'Primordial waters/abyss' },
  { hebrew: 'וְרוּחַ', trans: 'veruakh', english: 'and the spirit/wind', type: 'conjunction + noun (feminine)', notes: 'Can mean spirit, wind, or breath' },
  { hebrew: 'רוּחַ', trans: 'ruakh', english: 'spirit/wind/breath', type: 'noun (feminine)', notes: 'Key theological word - Spirit of God' },
  { hebrew: 'מְרַחֶפֶת', trans: 'merakhefet', english: 'hovering/moving', type: 'verb (Piel participle fs)', notes: 'Like a bird over her young' },

  // Genesis 1:3 (10 words)
  { hebrew: 'וַיֹּאמֶר', trans: 'vayomer', english: 'and he said', type: 'verb (Qal wayyiqtol 3ms)', notes: 'First vav-consecutive! Most common verb form in narrative' },
  { hebrew: 'אָמַר', trans: 'amar', english: 'he said', type: 'verb (Qal perfect 3ms)', notes: 'Root: אמר - extremely common verb "to say"' },
  { hebrew: 'יְהִי', trans: 'yehi', english: 'let there be', type: 'verb (Qal jussive 3ms)', notes: 'From הָיָה - "let it be"' },
  { hebrew: 'אוֹר', trans: 'or', english: 'light', type: 'noun (masculine)', notes: 'First thing God creates by speaking' },
  { hebrew: 'וַיְהִי', trans: 'vayehi', english: 'and there was', type: 'verb (Qal wayyiqtol 3ms)', notes: 'Another vav-consecutive from הָיָה' },
  { hebrew: 'הָיָה', trans: 'hayah', english: 'he was/to be', type: 'verb (Qal perfect 3ms)', notes: 'THE most important verb - "to be/become/happen"' },
  { hebrew: 'טוֹב', trans: 'tov', english: 'good', type: 'adjective (masculine)', notes: 'Repeated 7 times in Gen 1 - "God saw that it was good"' },
  { hebrew: 'כִּי', trans: 'ki', english: 'that/because/when', type: 'conjunction', notes: 'Multi-purpose word - context determines meaning' },
  { hebrew: 'וַיַּרְא', trans: 'vayar', english: 'and he saw', type: 'verb (Qal wayyiqtol 3ms)', notes: 'From רָאָה (to see) - God saw it was good' },
  { hebrew: 'בֵּין', trans: 'bein', english: 'between', type: 'preposition', notes: 'Often used twice: "between X and between Y"' }
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
              href="/hebrew/flashcards"
              className="inline-flex items-center text-[#4a5d49] hover:text-[#6b7d6a] transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Flashcards
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Hebrew Vocabulary
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">Genesis 1 - First 30 Words</p>

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
