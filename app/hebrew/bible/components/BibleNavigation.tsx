'use client';

import Link from 'next/link';
import { useState } from 'react';

interface BibleNavigationProps {
  bookId: string;
  bookName: string;
  chapter: number;
  totalChapters: number;
}

export default function BibleNavigation({ bookId, bookName, chapter, totalChapters }: BibleNavigationProps) {
  const [showChapterGrid, setShowChapterGrid] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2">
        {/* Previous chapter */}
        {chapter > 1 ? (
          <Link
            href={`/hebrew/bible/${bookId}/${chapter - 1}`}
            className="px-4 py-2 bg-white/80 rounded-xl text-sm font-medium text-[#4a5d49] hover:bg-white transition-colors border border-[#d4c5b0]"
          >
            &larr; Ch. {chapter - 1}
          </Link>
        ) : (
          <div className="px-4 py-2 opacity-0">placeholder</div>
        )}

        {/* Chapter indicator / selector toggle */}
        <button
          onClick={() => setShowChapterGrid(!showChapterGrid)}
          className="px-4 py-2 bg-white/80 rounded-xl text-sm font-semibold text-[#4a5d49] hover:bg-white transition-colors border border-[#d4c5b0]"
        >
          {bookName} {chapter} <span className="text-gray-400 text-xs">of {totalChapters}</span>
          <span className="ml-1 text-xs">{showChapterGrid ? '\u25B2' : '\u25BC'}</span>
        </button>

        {/* Next chapter */}
        {chapter < totalChapters ? (
          <Link
            href={`/hebrew/bible/${bookId}/${chapter + 1}`}
            className="px-4 py-2 bg-white/80 rounded-xl text-sm font-medium text-[#4a5d49] hover:bg-white transition-colors border border-[#d4c5b0]"
          >
            Ch. {chapter + 1} &rarr;
          </Link>
        ) : (
          <div className="px-4 py-2 opacity-0">placeholder</div>
        )}
      </div>

      {/* Chapter grid dropdown */}
      {showChapterGrid && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-40 w-[320px]">
          <div className="text-sm font-semibold text-gray-600 mb-2">Jump to chapter</div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
              <Link
                key={ch}
                href={`/hebrew/bible/${bookId}/${ch}`}
                onClick={() => setShowChapterGrid(false)}
                className={`
                  w-8 h-8 flex items-center justify-center text-xs rounded-lg transition-colors
                  ${ch === chapter
                    ? 'bg-[#4a5d49] text-white font-bold'
                    : 'bg-[#f5f1e8] text-[#4a5d49] hover:bg-[#e8dcc8]'
                  }
                `}
              >
                {ch}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
