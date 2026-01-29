/**
 * POST /api/vocab/sets/toggle-active
 *
 * Toggles a vocab set's active status (allows multiple active sets)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const sql = getDb();

  try {
    const body = await request.json();
    const { setId } = body;

    if (!setId) {
      return NextResponse.json(
        { error: 'Missing setId' },
        { status: 400 }
      );
    }

    // Get current active status
    const setResult = await sql`
      SELECT is_active FROM vocab_sets WHERE id = ${setId}
    `;

    if (setResult.length === 0) {
      return NextResponse.json(
        { error: 'Vocab set not found' },
        { status: 404 }
      );
    }

    const currentStatus = setResult[0].is_active;
    const newStatus = !currentStatus;

    // Toggle the active status
    await sql`
      UPDATE vocab_sets
      SET is_active = ${newStatus}
      WHERE id = ${setId}
    `;

    return NextResponse.json({
      success: true,
      setId,
      isActive: newStatus,
    });
  } catch (error) {
    console.error('Error toggling set active status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle set status' },
      { status: 500 }
    );
  }
}
