import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function getAuthenticatedUser() {
  const supabase = await createClient();

  // Check for Bearer token (React Native / mobile clients)
  const headersList = await headers();
  const authorization = headersList.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { user: null, error: 'Unauthorized' };
    }
    return { user, error: null };
  }

  // Fall back to cookie-based auth (web clients)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: 'Unauthorized' };
  }

  return { user, error: null };
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized - Please log in' },
    { status: 401 }
  );
}
