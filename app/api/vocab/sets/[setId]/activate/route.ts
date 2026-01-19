/**
 * POST /api/vocab/sets/[setId]/activate
 *
 * Sets a vocab set as the active set
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { setId: string } }
) {
  const sql = getDb();

  try {
    const { setId } = params;

    // Check if set exists
    const setResult = await sql`
      SELECT id FROM vocab_sets WHERE id = ${setId}
    `;

    if (setResult.length === 0) {
      return NextResponse.json(
        { error: 'Vocab set not found' },
        { status: 404 }
      );
    }

    // Deactivate all sets
    await sql`
      UPDATE vocab_sets SET is_active = false
    `;

    // Activate specified set
    await sql`
      UPDATE vocab_sets SET is_active = true WHERE id = ${setId}
    `;

    return NextResponse.json({
      success: true,
      activeSetId: setId,
    });
  } catch (error) {
    console.error('Error activating vocab set:', error);
    return NextResponse.json(
      { error: 'Failed to activate vocab set' },
      { status: 500 }
    );
  }
}
