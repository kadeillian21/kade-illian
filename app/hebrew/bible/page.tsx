'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BibleBook {
  id: string;
  name: string;
  hebrew_name: string;
  abbreviation: string;
  chapter_count: number;
}

export default function BibleReaderPage() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      try {
        const res = await fetch('/api/bible/books');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setBooks(data.books);
          }
        }
      } catch (error) {
        console.error('Error loading Bible books:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBooks();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#4a5d49]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
      <div className="container py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        {/* Back link */}
        <Link
          href="/hebrew"
          className="inline-flex items-center text-sm text-[#6b7d6a] hover:text-[#4a5d49] transition-colors mb-8"
        >
          &larr; Back to Hebrew
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#4a5d49] mb-2">Bible Reader</h1>
          <p className="text-gray-600">Tap any word to see its English translation</p>
        </div>

        {/* Books */}
        {books.map((book) => (
          <div key={book.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
            {/* Book header */}
            <div className="text-center mb-6">
              <div className="text-5xl font-[family-name:var(--font-hebrew)] text-[#4a5d49] mb-2 select-text" dir="rtl">
                {book.hebrew_name}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{book.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{book.chapter_count} chapters</p>
            </div>

            {/* Chapter grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: book.chapter_count }, (_, i) => i + 1).map((ch) => (
                <Link
                  key={ch}
                  href={`/hebrew/bible/${book.id}/${ch}`}
                  className="aspect-square flex items-center justify-center rounded-xl bg-[#f5f1e8] text-[#4a5d49] font-semibold hover:bg-[#e8dcc8] hover:shadow-md transition-all text-sm sm:text-base border border-[#d4c5b0]/50"
                >
                  {ch}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {books.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No books available yet. Run the import script to add Genesis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
