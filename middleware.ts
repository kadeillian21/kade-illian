import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/hebrew/vocabulary', '/hebrew/flashcards', '/hebrew/lessons', '/hebrew/bible', '/hebrew/review'];
const authRoutes = ['/login', '/signup'];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS + early return for API routes (no redirects, no cookie session needed)
  if (pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    // For non-preflight API requests, run updateSession (for cookie-based callers)
    // then attach CORS headers to the response
    const { supabaseResponse } = await updateSession(request);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      supabaseResponse.headers.set(key, value);
    });
    return supabaseResponse;
  }

  const { supabaseResponse, user } = await updateSession(request);

  // If user is logged in and trying to access auth pages, redirect to app
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is NOT logged in and trying to access protected routes
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
