'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Only import and create client on the client side
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient();

      // If Supabase not configured, just show sign in link
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Get initial user
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        setLoading(false);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsOpen(false);
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium rounded-full text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8] transition-all"
      >
        Sign In
      </Link>
    );
  }

  const initials = user.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4a5d49] to-[#6b7d6a] text-white font-medium text-sm flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:scale-105"
        aria-label="User menu"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.email}
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#f5f1e8] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
