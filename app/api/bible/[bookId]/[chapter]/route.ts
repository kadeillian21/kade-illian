/**
 * GET /api/bible/[bookId]/[chapter]
 *
 * Returns all verses and words for a specific chapter,
 * joined with Strong's Hebrew dictionary for English glosses.
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

interface Params {
  bookId: string;
  chapter: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return unauthorizedResponse();
  }

  const { bookId, chapter } = await params;
  const chapterNum = parseInt(chapter, 10);

  if (isNaN(chapterNum) || chapterNum < 1) {
    return NextResponse.json(
      { error: 'Invalid chapter number' },
      { status: 400 }
    );
  }

  const sql = getDb();

  try {
    // Get book info
    const bookResult = await sql`
      SELECT id, name, hebrew_name, chapter_count
      FROM bible_books
      WHERE id = ${bookId}
    `;

    if (bookResult.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    const book = bookResult[0];

    if (chapterNum > book.chapter_count) {
      return NextResponse.json(
        { error: `Chapter ${chapterNum} not found. ${book.name} has ${book.chapter_count} chapters.` },
        { status: 404 }
      );
    }

    // Get all verses for this chapter
    const verses = await sql`
      SELECT id, chapter, verse, hebrew_text, word_count
      FROM bible_verses
      WHERE book_id = ${bookId} AND chapter = ${chapterNum}
      ORDER BY verse ASC
    `;

    if (verses.length === 0) {
      return NextResponse.json(
        { error: 'No verses found for this chapter' },
        { status: 404 }
      );
    }

    // Get all words for these verses, joined with Strong's dictionary
    const verseIds = verses.map(v => v.id);
    const words = await sql`
      SELECT
        bw.id,
        bw.verse_id,
        bw.position,
        bw.hebrew,
        bw.lemma,
        bw.lemma_prefix,
        bw.morph,
        bw.is_prefix_compound,
        sh.lemma as strongs_lemma,
        sh.transliteration,
        sh.pronunciation,
        sh.short_def,
        sh.strongs_def
      FROM bible_words bw
      LEFT JOIN strongs_hebrew sh ON bw.lemma = sh.number
      WHERE bw.verse_id = ANY(${verseIds})
      ORDER BY bw.verse_id, bw.position ASC
    `;

    // Group words under their verses
    const wordsByVerse = new Map<string, typeof words>();
    for (const word of words) {
      const existing = wordsByVerse.get(word.verse_id) || [];
      existing.push(word);
      wordsByVerse.set(word.verse_id, existing);
    }

    const versesWithWords = verses.map(verse => ({
      id: verse.id,
      verse: verse.verse,
      hebrewText: verse.hebrew_text,
      wordCount: verse.word_count,
      words: (wordsByVerse.get(verse.id) || []).map(w => ({
        id: w.id,
        position: w.position,
        hebrew: w.hebrew,
        lemma: w.lemma,
        lemmaPre: w.lemma_prefix,
        morph: w.morph,
        isPrefixCompound: w.is_prefix_compound,
        gloss: w.short_def || null,
        transliteration: w.transliteration || null,
        pronunciation: w.pronunciation || null,
        fullDef: w.strongs_def || null,
        strongsLemma: w.strongs_lemma || null,
      })),
    }));

    return NextResponse.json({
      success: true,
      book: {
        id: book.id,
        name: book.name,
        hebrewName: book.hebrew_name,
        chapterCount: book.chapter_count,
      },
      chapter: chapterNum,
      verses: versesWithWords,
      navigation: {
        prevChapter: chapterNum > 1 ? chapterNum - 1 : null,
        nextChapter: chapterNum < book.chapter_count ? chapterNum + 1 : null,
        totalChapters: book.chapter_count,
      },
    });
  } catch (err) {
    console.error('Error fetching Bible chapter:', err);
    return NextResponse.json(
      { error: 'Failed to fetch chapter data' },
      { status: 500 }
    );
  }
}
