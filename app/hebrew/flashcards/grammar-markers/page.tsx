"use client";

// NOTE: Hebrew text should be selectable/copyable so users can look them up
// Avoid using bg-clip-text on Hebrew text as it clips diacritical marks (nikkud)

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GrammarCard {
  hebrew: string;
  pronunciation: string;
  meaning: string;
  type: string;
  category: string;
  explanation: string;
  examples: string[];
}

const grammarMarkers: GrammarCard[] = [
  // DEFINITE ARTICLE
  {
    hebrew: 'הַ',
    pronunciation: 'ha-',
    meaning: 'The',
    type: 'Definite Article (with patach)',
    category: 'Articles',
    explanation: 'Attaches to beginning of words to mean "the" - most common form',
    examples: ['מֶלֶךְ = king', 'הַמֶּלֶךְ = THE king']
  },
  {
    hebrew: 'הָ',
    pronunciation: 'ha-',
    meaning: 'The',
    type: 'Definite Article (with qamets)',
    category: 'Articles',
    explanation: 'Used before certain letters (gutturals: א ה ח ע)',
    examples: ['אָרֶץ = earth', 'הָאָרֶץ = THE earth']
  },
  {
    hebrew: 'הֶ',
    pronunciation: 'he-',
    meaning: 'The',
    type: 'Definite Article (with segol)',
    category: 'Articles',
    explanation: 'Used before certain guttural letters with specific vowels',
    examples: ['הֶהָרִים = THE mountains']
  },

  // VAV CONJUNCTION
  {
    hebrew: 'וְ',
    pronunciation: 've-',
    meaning: 'And',
    type: 'Vav Conjunction (with sheva)',
    category: 'Conjunctions',
    explanation: 'Attaches to beginning of words - most common form of "and"',
    examples: ['שָׁמַיִם = heavens', 'וְשָׁמַיִם = AND heavens']
  },
  {
    hebrew: 'וּ',
    pronunciation: 'u-',
    meaning: 'And',
    type: 'Vav Conjunction (with shureq)',
    category: 'Conjunctions',
    explanation: 'Used before letters ב מ פ (BeMP)',
    examples: ['בֹהוּ = void', 'וּבֹהוּ = AND void']
  },
  {
    hebrew: 'וָ',
    pronunciation: 'va-',
    meaning: 'And',
    type: 'Vav Conjunction (with qamets)',
    category: 'Conjunctions',
    explanation: 'Used before single-syllable words or certain consonants',
    examples: ['בֹהוּ = void', 'וָבֹהוּ = AND void']
  },
  {
    hebrew: 'וַ',
    pronunciation: 'va-',
    meaning: 'And (then)',
    type: 'Vav Consecutive',
    category: 'Conjunctions',
    explanation: 'Creates narrative past tense - THE most common verb form in stories',
    examples: ['יֹּאמֶר = he will say', 'וַיֹּאמֶר = and he SAID (then he said)']
  },

  // INSEPARABLE PREPOSITIONS
  {
    hebrew: 'בְּ',
    pronunciation: 'be-',
    meaning: 'In / By / With',
    type: 'Inseparable Preposition',
    category: 'Prepositions',
    explanation: 'Attaches to beginning of words',
    examples: ['רֵאשִׁית = beginning', 'בְּרֵאשִׁית = IN the beginning']
  },
  {
    hebrew: 'לְ',
    pronunciation: 'le-',
    meaning: 'To / For',
    type: 'Inseparable Preposition',
    category: 'Prepositions',
    explanation: 'Attaches to beginning of words',
    examples: ['אוֹר = light', 'לָאוֹר = TO the light']
  },
  {
    hebrew: 'כְּ',
    pronunciation: 'ke-',
    meaning: 'Like / As / According to',
    type: 'Inseparable Preposition',
    category: 'Prepositions',
    explanation: 'Attaches to beginning of words',
    examples: ['אִישׁ = man', 'כְּאִישׁ = LIKE a man']
  },

  // COMBINED FORMS
  {
    hebrew: 'וּבְ',
    pronunciation: 'uv-',
    meaning: 'And in',
    type: 'Vav + Preposition',
    category: 'Combined Forms',
    explanation: 'Conjunction + preposition combined',
    examples: ['יוֹם = day', 'וּבְיוֹם = AND IN the day']
  },
  {
    hebrew: 'וְלַ',
    pronunciation: 'vela-',
    meaning: 'And to/for the',
    type: 'Vav + Preposition + Article',
    category: 'Combined Forms',
    explanation: 'Conjunction + preposition + article all together',
    examples: ['חֹשֶׁךְ = darkness', 'וְלַחֹשֶׁךְ = AND TO THE darkness']
  },
  {
    hebrew: 'בַּ',
    pronunciation: 'ba-',
    meaning: 'In the',
    type: 'Preposition + Article',
    category: 'Combined Forms',
    explanation: 'Preposition ב + article הַ combined',
    examples: ['יוֹם = day', 'בַּיוֹם = IN THE day']
  },
  {
    hebrew: 'לָ',
    pronunciation: 'la-',
    meaning: 'To the / For the',
    type: 'Preposition + Article',
    category: 'Combined Forms',
    explanation: 'Preposition ל + article הַ combined',
    examples: ['אוֹר = light', 'לָאוֹר = TO THE light']
  },
  {
    hebrew: 'כָּ',
    pronunciation: 'ka-',
    meaning: 'Like the / As the',
    type: 'Preposition + Article',
    category: 'Combined Forms',
    explanation: 'Preposition כ + article הַ combined',
    examples: ['מַיִם = water', 'כַּמַּיִם = LIKE THE water']
  },

  // DIRECT OBJECT MARKER
  {
    hebrew: 'אֵת',
    pronunciation: 'et',
    meaning: '[Direct object marker]',
    type: 'Particle (untranslatable)',
    category: 'Particles',
    explanation: 'Shows what receives the action of a verb - only with definite objects',
    examples: ['בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם', 'God created [אֵת] THE heavens']
  },
  {
    hebrew: 'אֶת־',
    pronunciation: 'et-',
    meaning: '[Direct object marker]',
    type: 'Particle with Maqqef',
    category: 'Particles',
    explanation: 'Same as אֵת but connected with maqqef (hyphen)',
    examples: ['וַיַּרְא אֶת־הָאוֹר', 'And he saw [אֶת] the light']
  },
  {
    hebrew: 'וְאֵת',
    pronunciation: "ve'et",
    meaning: 'And [object marker]',
    type: 'Vav + Particle',
    category: 'Particles',
    explanation: 'Conjunction + direct object marker',
    examples: ['אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ', 'the heavens AND [וְאֵת] the earth']
  },

  // STANDALONE PREPOSITIONS
  {
    hebrew: 'עַל',
    pronunciation: 'al',
    meaning: 'On / Upon / Over',
    type: 'Preposition (standalone)',
    category: 'Prepositions',
    explanation: 'Very common preposition - often with maqqef',
    examples: ['עַל־פְּנֵי = upon the face of', 'עַל־הָאָרֶץ = upon the earth']
  },
  {
    hebrew: 'אֶל',
    pronunciation: 'el',
    meaning: 'To / Toward / Unto',
    type: 'Preposition (standalone)',
    category: 'Prepositions',
    explanation: 'Shows direction or movement toward',
    examples: ['אֶל־הָעִיר = to the city', 'אֶל־אֱלֹהִים = to God']
  },
  {
    hebrew: 'מִן',
    pronunciation: 'min',
    meaning: 'From',
    type: 'Preposition (standalone)',
    category: 'Prepositions',
    explanation: 'Often shortened to מִ and attached to words',
    examples: ['מִן־הָעִיר = from the city', 'מִמִּצְרַיִם = from Egypt']
  },
  {
    hebrew: 'עִם',
    pronunciation: 'im',
    meaning: 'With',
    type: 'Preposition (standalone)',
    category: 'Prepositions',
    explanation: 'Indicates accompaniment',
    examples: ['עִם־אָבִיו = with his father', 'עִם־הָעָם = with the people']
  },
  {
    hebrew: 'בֵּין',
    pronunciation: 'bein',
    meaning: 'Between',
    type: 'Preposition (standalone)',
    category: 'Prepositions',
    explanation: 'Often used twice: "between X and between Y"',
    examples: ['בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ', 'between the light and between the darkness']
  },

  // COMMON CONJUNCTIONS/PARTICLES
  {
    hebrew: 'כִּי',
    pronunciation: 'ki',
    meaning: 'That / Because / When / For',
    type: 'Conjunction (multi-use)',
    category: 'Conjunctions',
    explanation: 'Context determines meaning - VERY common word',
    examples: ['כִּי־טוֹב = that [it was] good', 'כִּי יָדַעְתִּי = because I knew']
  },
  {
    hebrew: 'אֲשֶׁר',
    pronunciation: 'asher',
    meaning: 'Who / Which / That',
    type: 'Relative Pronoun',
    category: 'Particles',
    explanation: 'Introduces relative clauses',
    examples: ['הָאִישׁ אֲשֶׁר = the man who/that', 'הַמָּקוֹם אֲשֶׁר = the place which/where']
  },
  {
    hebrew: 'אִם',
    pronunciation: 'im',
    meaning: 'If',
    type: 'Conditional Particle',
    category: 'Particles',
    explanation: 'Introduces conditional statements',
    examples: ['אִם־תִּשְׁמַע = if you listen', 'אִם־לֹא = if not']
  },
  {
    hebrew: 'לֹא',
    pronunciation: 'lo',
    meaning: 'Not / No',
    type: 'Negative Particle',
    category: 'Particles',
    explanation: 'Standard negation',
    examples: ['לֹא טוֹב = not good', 'לֹא־יָדַעְתִּי = I did not know']
  },
  {
    hebrew: 'אַל',
    pronunciation: 'al',
    meaning: 'Do not',
    type: 'Negative Command',
    category: 'Particles',
    explanation: 'Used for prohibitions (don\'t do this)',
    examples: ['אַל־תִּירָא = do not fear', 'אַל־תֹּאכַל = do not eat']
  },

  // PUNCTUATION MARKS
  {
    hebrew: '־',
    pronunciation: 'maqqef',
    meaning: 'Maqqef (connector)',
    type: 'Punctuation',
    category: 'Punctuation',
    explanation: 'Connects words into one pronunciation unit - like a hyphen',
    examples: ['עַל־פְּנֵי = al-penei (one unit)', 'כָּל־הָאָרֶץ = kol-haarets']
  },
  {
    hebrew: '׃',
    pronunciation: 'sof pasuq',
    meaning: 'Sof Pasuq (verse end)',
    type: 'Punctuation',
    category: 'Punctuation',
    explanation: 'Marks the end of a verse - like a period',
    examples: ['Appears at end of every verse', 'Similar to a colon (:)']
  },
  {
    hebrew: 'פ',
    pronunciation: 'pe (petucha)',
    meaning: 'Petucha (paragraph)',
    type: 'Section Marker',
    category: 'Punctuation',
    explanation: 'Open paragraph break - marks major section division',
    examples: ['Appears at end of Genesis 1:5', 'Editorial marker from scribes']
  },
  {
    hebrew: 'ס',
    pronunciation: 'samekh (setumah)',
    meaning: 'Setumah (paragraph)',
    type: 'Section Marker',
    category: 'Punctuation',
    explanation: 'Closed paragraph break - marks minor section division',
    examples: ['Smaller break than פ', 'Both are scribal markers']
  }
];

const categories = ['All', 'Articles', 'Conjunctions', 'Prepositions', 'Combined Forms', 'Particles', 'Punctuation'];

export default function GrammarMarkersFlashcards() {
  const [allCards] = useState<GrammarCard[]>(grammarMarkers);
  const [cards, setCards] = useState<GrammarCard[]>(grammarMarkers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setCards(allCards);
    } else {
      setCards(allCards.filter(card => card.category === category));
    }
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

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">No cards in this category</p>
          <button
            onClick={() => filterByCategory('All')}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-semibold rounded-xl"
          >
            Show All Cards
          </button>
        </div>
      </div>
    );
  }

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
                Grammar Markers
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">Articles, Prepositions, Particles & Punctuation</p>

            {/* Category Filter */}
            <div className="flex gap-2 justify-center flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => filterByCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-[#6b7d6a]'
                  }`}
                >
                  {category}
                </button>
              ))}
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
            className={`bg-white rounded-3xl shadow-2xl border-2 transition-all duration-500 cursor-pointer hover:shadow-3xl mb-6 min-h-[450px] flex items-center justify-center ${
              isFlipped ? 'border-[#d4c5b0] bg-gradient-to-br from-[#fafaf8] to-[#f5f1e8]' : 'border-[#d4c5b0]'
            }`}
            onClick={flipCard}
          >
            {!isFlipped ? (
              // Front of card
              <div className="p-12 text-center">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-[#f5f1e8] rounded-full text-sm font-medium text-[#4a5d49]">
                    {currentCard.category}
                  </span>
                </div>
                <div
                  className="text-8xl md:text-9xl font-bold font-[family-name:var(--font-hebrew)] text-[#4a5d49] mb-6 select-text cursor-text"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentCard.hebrew}
                </div>
                <div className="text-gray-400 italic text-lg mt-6">
                  Click to reveal what this means
                </div>
              </div>
            ) : (
              // Back of card
              <div className="p-8 text-center w-full">
                <div
                  className="text-5xl md:text-6xl font-bold text-[#4a5d49] mb-2 select-text cursor-text"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentCard.meaning}
                </div>
                <div className="text-2xl text-gray-500 italic mb-4">
                  ({currentCard.pronunciation})
                </div>
                <div className="text-lg text-[#6b7d6a] font-semibold mb-3">
                  {currentCard.type}
                </div>
                <div className="text-base text-gray-600 leading-relaxed mb-6">
                  {currentCard.explanation}
                </div>

                {/* Examples Section */}
                <div className="bg-[#f5f1e8] rounded-2xl p-4 w-full">
                  <h4 className="text-sm font-semibold text-[#4a5d49] mb-3 uppercase tracking-wide">Examples</h4>
                  <div className="space-y-2">
                    {currentCard.examples.map((example, idx) => (
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
              </div>
            )}
          </div>

          {/* Hint */}
          <div className="text-center text-sm text-gray-600 mb-6">
            Click card to flip | Arrow keys to navigate | Space to flip
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={previousCard}
              className="px-6 py-3 bg-white/80 hover:bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
            >
              Previous
            </button>
            <button
              onClick={shuffle}
              className="px-6 py-3 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] hover:from-[#3d4d3c] hover:to-[#5a6a5a] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Shuffle
            </button>
            <button
              onClick={nextCard}
              className="px-6 py-3 bg-white/80 hover:bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
            >
              Next
            </button>
          </div>

          {/* Quick Reference */}
          <div className="mt-12 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Quick Reference</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="bg-[#f5f1e8] rounded-xl p-3">
                <div className="font-[family-name:var(--font-hebrew)] text-2xl text-[#4a5d49] mb-1">הַ</div>
                <div className="text-xs text-gray-600">The (article)</div>
              </div>
              <div className="bg-[#f5f1e8] rounded-xl p-3">
                <div className="font-[family-name:var(--font-hebrew)] text-2xl text-[#4a5d49] mb-1">וְ</div>
                <div className="text-xs text-gray-600">And (conjunction)</div>
              </div>
              <div className="bg-[#f5f1e8] rounded-xl p-3">
                <div className="font-[family-name:var(--font-hebrew)] text-2xl text-[#4a5d49] mb-1">בְּ לְ כְּ</div>
                <div className="text-xs text-gray-600">In, To, Like</div>
              </div>
              <div className="bg-[#f5f1e8] rounded-xl p-3">
                <div className="font-[family-name:var(--font-hebrew)] text-2xl text-[#4a5d49] mb-1">אֵת</div>
                <div className="text-xs text-gray-600">Object marker</div>
              </div>
              <div className="bg-[#f5f1e8] rounded-xl p-3">
                <div className="font-[family-name:var(--font-hebrew)] text-2xl text-[#4a5d49] mb-1">לֹא</div>
                <div className="text-xs text-gray-600">Not</div>
              </div>
              <div className="bg-[#f5f1e8] rounded-xl p-3">
                <div className="font-[family-name:var(--font-hebrew)] text-2xl text-[#4a5d49] mb-1">כִּי</div>
                <div className="text-xs text-gray-600">That/Because</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
