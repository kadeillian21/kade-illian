'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import VerseDisplay from '../../components/VerseDisplay';
import WordPopover, { BibleWord } from '../../components/WordPopover';
import BibleNavigation from '../../components/BibleNavigation';

interface Verse {
  id: string;
  verse: number;
  hebrewText: string;
  wordCount: number;
  words: BibleWord[];
}

interface ChapterData {
  book: {
    id: string;
    name: string;
    hebrewName: string;
    chapterCount: number;
  };
  chapter: number;
  verses: Verse[];
  navigation: {
    prevChapter: number | null;
    nextChapter: number | null;
    totalChapters: number;
  };
}

export default function BibleChapterPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const chapter = parseInt(params.chapter as string, 10);

  const [data, setData] = useState<ChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<BibleWord | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    async function loadChapter() {
      setIsLoading(true);
      setError(null);
      setActiveWord(null);

      try {
        const res = await fetch(`/api/bible/${bookId}/${chapter}`);
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || 'Failed to load chapter');
          return;
        }
        const chapterData = await res.json();
        if (chapterData.success) {
          setData(chapterData);
        } else {
          setError('Failed to load chapter data');
        }
      } catch (err) {
        console.error('Error loading chapter:', err);
        setError('Failed to load chapter');
      } finally {
        setIsLoading(false);
      }
    }

    if (bookId && !isNaN(chapter)) {
      loadChapter();
    }
  }, [bookId, chapter]);

  const handleWordTap = useCallback((word: BibleWord, rect: DOMRect) => {
    if (activeWord?.id === word.id) {
      setActiveWord(null);
      setAnchorRect(null);
    } else {
      setActiveWord(word);
      setAnchorRect(rect);
    }
  }, [activeWord]);

  const handleClosePopover = useCallback(() => {
    setActiveWord(null);
    setAnchorRect(null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#4a5d49]"></div>
          <p className="mt-4 text-gray-600">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
        <div className="container py-12 px-4 mx-auto max-w-4xl">
          <Link href="/hebrew/bible" className="inline-flex items-center text-sm text-[#6b7d6a] hover:text-[#4a5d49] mb-8">
            &larr; Back to Bible
          </Link>
          <div className="bg-white/80 rounded-2xl p-8 text-center">
            <p className="text-red-600 text-lg">{error || 'Something went wrong'}</p>
            <Link href="/hebrew/bible" className="mt-4 inline-block text-[#4a5d49] underline">
              Return to book selection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
      <div className="container py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        {/* Back link */}
        <Link
          href="/hebrew/bible"
          className="inline-flex items-center text-sm text-[#6b7d6a] hover:text-[#4a5d49] transition-colors mb-6"
        >
          &larr; Back to {data.book.name}
        </Link>

        {/* Top navigation */}
        <div className="mb-6">
          <BibleNavigation
            bookId={data.book.id}
            bookName={data.book.name}
            chapter={data.chapter}
            totalChapters={data.book.chapterCount}
          />
        </div>

        {/* Chapter header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-[family-name:var(--font-hebrew)] text-[#4a5d49] mb-1" dir="rtl">
            {data.book.hebrewName} {toHebrewChapterLabel(data.chapter)}
          </h1>
          <p className="text-gray-500 text-sm">{data.book.name} {data.chapter}</p>
        </div>

        {/* Verses */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/50 mb-8">
          {data.verses.map((verse) => (
            <VerseDisplay
              key={verse.id}
              verseNumber={verse.verse}
              words={verse.words}
              activeWordId={activeWord?.id || null}
              onWordTap={handleWordTap}
            />
          ))}
        </div>

        {/* Bottom navigation */}
        <div className="mb-8">
          <BibleNavigation
            bookId={data.book.id}
            bookName={data.book.name}
            chapter={data.chapter}
            totalChapters={data.book.chapterCount}
          />
        </div>
      </div>

      {/* Word popover */}
      {activeWord && anchorRect && (
        <WordPopover
          word={activeWord}
          anchorRect={anchorRect}
          onClose={handleClosePopover}
        />
      )}
    </div>
  );
}

/**
 * Convert a chapter number to a simple label for the Hebrew header.
 * Uses standard numerals for simplicity.
 */
function toHebrewChapterLabel(chapter: number): string {
  // Hebrew letters for numbers 1-50
  const hebrewNumerals: Record<number, string> = {
    1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה',
    6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט', 10: 'י',
    11: 'יא', 12: 'יב', 13: 'יג', 14: 'יד', 15: 'טו',
    16: 'טז', 17: 'יז', 18: 'יח', 19: 'יט', 20: 'כ',
    21: 'כא', 22: 'כב', 23: 'כג', 24: 'כד', 25: 'כה',
    26: 'כו', 27: 'כז', 28: 'כח', 29: 'כט', 30: 'ל',
    31: 'לא', 32: 'לב', 33: 'לג', 34: 'לד', 35: 'לה',
    36: 'לו', 37: 'לז', 38: 'לח', 39: 'לט', 40: 'מ',
    41: 'מא', 42: 'מב', 43: 'מג', 44: 'מד', 45: 'מה',
    46: 'מו', 47: 'מז', 48: 'מח', 49: 'מט', 50: 'נ',
  };
  return hebrewNumerals[chapter] || String(chapter);
}
