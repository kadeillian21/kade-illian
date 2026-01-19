/**
 * POST /api/vocab/create
 *
 * Creates a new vocab set with words
 * Used by admin interface to paste JSON and create sets
 */

import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

interface WordInput {
  hebrew: string;
  trans: string;
  english: string;
  type: string;
  notes?: string;
  semanticGroup?: string;
  frequency?: number;
  category: string;
  subcategory?: string;
}

export async function POST(request: NextRequest) {
  const sql = postgres(process.env.POSTGRES_URL!);

  try {
    const body = await request.json();
    const { setId, title, description, words } = body;

    // Validate required fields
    if (!setId || !title || !words || !Array.isArray(words)) {
      return NextResponse.json(
        { error: 'Missing required fields: setId, title, words' },
        { status: 400 }
      );
    }

    // Validate word structure
    for (const word of words) {
      if (!word.hebrew || !word.trans || !word.english || !word.type || !word.category) {
        return NextResponse.json(
          { error: 'Each word must have: hebrew, trans, english, type, category' },
          { status: 400 }
        );
      }
    }

    // Check if set already exists
    const existingSet = await sql`
      SELECT id FROM vocab_sets WHERE id = ${setId}
    `;

    if (existingSet.length > 0) {
      return NextResponse.json(
        { error: `Vocab set with ID "${setId}" already exists` },
        { status: 409 }
      );
    }

    // 1. Insert vocab set
    await sql`
      INSERT INTO vocab_sets (id, title, description, total_words, is_active)
      VALUES (${setId}, ${title}, ${description || ''}, ${words.length}, false)
    `;

    // 2. Insert all words
    const insertedWords = [];

    for (const word of words as WordInput[]) {
      // Generate word ID: setId-transliteration
      const wordId = `${setId}-${word.trans.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      // Check for duplicate word IDs
      const existingWord = await sql`
        SELECT id FROM vocab_words WHERE id = ${wordId}
      `;

      if (existingWord.length > 0) {
        // Skip duplicates or generate unique ID
        continue;
      }

      await sql`
        INSERT INTO vocab_words (
          id,
          hebrew,
          transliteration,
          english,
          type,
          notes,
          semantic_group,
          frequency,
          set_id,
          group_category,
          group_subcategory
        ) VALUES (
          ${wordId},
          ${word.hebrew},
          ${word.trans},
          ${word.english},
          ${word.type},
          ${word.notes || ''},
          ${word.semanticGroup || ''},
          ${word.frequency || null},
          ${setId},
          ${word.category},
          ${word.subcategory || null}
        )
      `;

      insertedWords.push({
        id: wordId,
        hebrew: word.hebrew,
        trans: word.trans,
        english: word.english,
      });
    }

    // 3. Update total_words count
    await sql`
      UPDATE vocab_sets
      SET total_words = ${insertedWords.length}
      WHERE id = ${setId}
    `;

    return NextResponse.json({
      success: true,
      set: {
        id: setId,
        title,
        totalWords: insertedWords.length,
      },
      words: insertedWords,
    });
  } catch (error) {
    console.error('Error creating vocab set:', error);
    return NextResponse.json(
      { error: 'Failed to create vocab set' },
      { status: 500 }
    );
  } finally {
    await sql.end();
  }
}
