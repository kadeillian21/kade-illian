'use client';

import { useEffect, useRef } from 'react';
import { decodeMorphology } from './MorphologyDecoder';

export interface BibleWord {
  id: string;
  position: number;
  hebrew: string;
  lemma: string | null;
  lemmaPre: string | null;
  morph: string | null;
  isPrefixCompound: boolean;
  gloss: string | null;
  transliteration: string | null;
  pronunciation: string | null;
  fullDef: string | null;
  strongsLemma: string | null;
}

interface WordPopoverProps {
  word: BibleWord;
  anchorRect: DOMRect;
  onClose: () => void;
}

export default function WordPopover({ word, anchorRect, onClose }: WordPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    // Delay to avoid closing immediately from the same click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Calculate position
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 600;

  const popoverWidth = 320;
  const popoverHeight = 240;

  // Center horizontally relative to word, but clamp to viewport
  let left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;
  left = Math.max(8, Math.min(left, viewportWidth - popoverWidth - 8));

  // Show above the word if there's room, otherwise below
  let top: number;
  if (anchorRect.top > popoverHeight + 16) {
    top = anchorRect.top - popoverHeight - 8 + window.scrollY;
  } else {
    top = anchorRect.bottom + 8 + window.scrollY;
  }

  const morphDescription = decodeMorphology(word.morph);

  // Clean up the full definition for display
  const cleanFullDef = word.fullDef
    ? word.fullDef
        .replace(/\{|\}/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\[.*?\]/g, '')
        .trim()
    : null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 animate-[fadeIn_0.15s_ease-out]"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${popoverWidth}px`,
        maxHeight: '340px',
        position: 'absolute',
      }}
    >
      {/* Hebrew word - large */}
      <div className="text-center mb-3">
        <div
          className="text-4xl font-[family-name:var(--font-hebrew)] text-[#4a5d49] select-text leading-relaxed"
          dir="rtl"
        >
          {word.hebrew}
        </div>
      </div>

      {/* Transliteration and pronunciation */}
      {(word.transliteration || word.pronunciation) && (
        <div className="text-center text-sm text-gray-500 mb-2">
          {word.transliteration && <span className="italic">{word.transliteration}</span>}
          {word.transliteration && word.pronunciation && <span className="mx-1">|</span>}
          {word.pronunciation && <span>{word.pronunciation}</span>}
        </div>
      )}

      {/* English gloss - the main attraction */}
      {word.gloss && (
        <div className="text-center mb-3">
          <span className="text-lg font-semibold text-gray-800">
            &ldquo;{word.gloss}&rdquo;
          </span>
        </div>
      )}

      {/* Morphology */}
      {morphDescription && (
        <div className="text-center text-xs text-gray-500 mb-2 bg-[#f5f1e8] rounded-lg px-3 py-1.5">
          {morphDescription}
        </div>
      )}

      {/* Strong's number */}
      {word.lemma && (
        <div className="text-center text-xs text-gray-400">
          {word.lemma}
          {word.lemmaPre && <span className="ml-1">(with prefix: {word.lemmaPre})</span>}
        </div>
      )}

      {/* Full definition (expandable) */}
      {cleanFullDef && cleanFullDef !== word.gloss && (
        <details className="mt-2">
          <summary className="text-xs text-[#6b7d6a] cursor-pointer hover:text-[#4a5d49] transition-colors">
            Full definition
          </summary>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed max-h-24 overflow-y-auto">
            {cleanFullDef}
          </p>
        </details>
      )}
    </div>
  );
}
