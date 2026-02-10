/**
 * GET /api/bible/books
 *
 * Returns all available Bible books
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) {
    return unauthorizedResponse();
  }

  const sql = getDb();

  try {
    const books = await sql`
      SELECT id, name, hebrew_name, abbreviation, chapter_count, testament, order_index
      FROM bible_books
      ORDER BY order_index ASC
    `;

    return NextResponse.json({ success: true, books });
  } catch (err) {
    console.error('Error fetching Bible books:', err);
    return NextResponse.json(
      { error: 'Failed to fetch Bible books' },
      { status: 500 }
    );
  }
}
