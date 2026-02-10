'use client';

import { BibleWord } from './WordPopover';

interface VerseDisplayProps {
  verseNumber: number;
  words: BibleWord[];
  activeWordId: string | null;
  onWordTap: (word: BibleWord, rect: DOMRect) => void;
}

export default function VerseDisplay({ verseNumber, words, activeWordId, onWordTap }: VerseDisplayProps) {
  return (
    <div className="flex gap-3 mb-4 group" dir="rtl">
      {/* Verse number */}
      <span className="text-sm font-bold text-[#6b7d6a] mt-2 select-none flex-shrink-0 min-w-[1.5rem] text-center" dir="ltr">
        {verseNumber}
      </span>

      {/* Words */}
      <div className="flex flex-wrap gap-x-2 gap-y-1 leading-relaxed">
        {words.map((word) => (
          <span
            key={word.id}
            className={`
              font-[family-name:var(--font-hebrew)] text-2xl md:text-3xl
              select-text cursor-pointer transition-all duration-100
              rounded px-0.5 -mx-0.5
              ${activeWordId === word.id
                ? 'bg-[#e8dcc8] text-[#4a5d49]'
                : 'text-[#4a5d49] hover:bg-[#f5f1e8]'
              }
            `}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onWordTap(word, rect);
            }}
          >
            {word.hebrew}
          </span>
        ))}
      </div>
    </div>
  );
}
