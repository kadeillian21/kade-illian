import { createBrowserClient, type SupabaseClient } from '@supabase/ssr';

let cachedClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function createClient(): SupabaseClient | null {
  // Return cached client if available
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return null if not configured - let calling code handle gracefully
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured. Auth features disabled.');
    return null;
  }

  cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}
