/**
 * GET /api/vocab/sets/active
 *
 * Returns all active vocab sets with their words and user-specific progress
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  // Check authentication
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    // Get all active sets
    const activeSets = await sql`
      SELECT * FROM vocab_sets WHERE is_active = true ORDER BY created_at
    `;

    if (activeSets.length === 0) {
      return NextResponse.json({
        activeSets: [],
        totalWords: 0,
      });
    }

    const setIds = activeSets.map(s => s.id);

    // Get all words for active sets WITH user-specific progress
    const wordsResult = await sql`
      SELECT
        vw.id,
        vw.hebrew,
        vw.transliteration,
        vw.english,
        vw.type,
        vw.notes,
        vw.semantic_group,
        vw.frequency,
        vw.set_id,
        vw.group_category,
        vw.group_subcategory,
        up.level,
        up.next_review,
        up.last_reviewed,
        up.review_count,
        up.correct_count
      FROM vocab_words vw
      LEFT JOIN user_progress up ON vw.id = up.word_id AND up.user_id = ${user.id}
      WHERE vw.set_id = ANY(${setIds})
      ORDER BY vw.set_id, vw.group_category, vw.group_subcategory, vw.frequency DESC
    `;

    // Organize by set
    const setsWithWords = activeSets.map(set => {
      const setWords = wordsResult.filter(w => w.set_id === set.id);

      // Organize into groups
      const groupsMap = new Map<string, {
        category: string;
        subcategory: string | null;
        words: Array<{
          id: string;
          hebrew: string;
          trans: string;
          english: string;
          type: string;
          notes: string | null;
          semanticGroup: string | null;
          frequency: number | null;
          level: number;
          nextReview: string | null;
          lastReviewed: string | null;
          reviewCount: number;
          correctCount: number;
        }>;
      }>();

      setWords.forEach(row => {
        const key = `${row.group_category}|${row.group_subcategory || ''}`;

        if (!groupsMap.has(key)) {
          groupsMap.set(key, {
            category: row.group_category,
            subcategory: row.group_subcategory || null,
            words: [],
          });
        }

        groupsMap.get(key)!.words.push({
          id: row.id,
          hebrew: row.hebrew,
          trans: row.transliteration,
          english: row.english,
          type: row.type,
          notes: row.notes,
          semanticGroup: row.semantic_group,
          frequency: row.frequency,
          level: row.level || 0,
          nextReview: row.next_review || null,
          lastReviewed: row.last_reviewed || null,
          reviewCount: row.review_count || 0,
          correctCount: row.correct_count || 0,
        });
      });

      return {
        id: set.id,
        title: set.title,
        description: set.description,
        totalWords: set.total_words,
        groups: Array.from(groupsMap.values()),
      };
    });

    const totalWords = wordsResult.length;

    return NextResponse.json({
      activeSets: setsWithWords,
      totalWords,
    });
  } catch (error) {
    console.error('Error fetching active sets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active sets' },
      { status: 500 }
    );
  }
}
