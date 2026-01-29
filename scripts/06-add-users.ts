/**
 * Add multi-user support with Supabase Auth
 *
 * This migration:
 * 1. Creates profiles table (linked to Supabase auth.users)
 * 2. Recreates user_stats with user_id
 * 3. Recreates user_progress with user_id
 * 4. Adds user_id to study_sessions
 * 5. Recreates achievement_progress with user_id
 *
 * NOTE: After running this migration, you must also run the SQL in
 * the Supabase Dashboard SQL Editor to create the profile trigger.
 * See the console output for the SQL.
 */

import { config } from 'dotenv';
import postgres from 'postgres';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function addUsers() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ POSTGRES_URL not found in .env.local');
    process.exit(1);
  }

  const sql = postgres(connectionString, {
    max: 1,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🚀 Adding multi-user support...\n');

    // 1. Create profiles table
    console.log('1️⃣  Creating profiles table...');
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        email TEXT,
        display_name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ profiles table created!\n');

    // 2. Drop and recreate user_stats with user_id
    console.log('2️⃣  Recreating user_stats with user_id...');
    await sql`DROP TABLE IF EXISTS user_stats CASCADE`;
    await sql`
      CREATE TABLE user_stats (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        last_studied TIMESTAMP,
        total_reviews INTEGER DEFAULT 0,
        words_learned INTEGER DEFAULT 0,
        words_mastered INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        daily_goal INTEGER DEFAULT 20,
        cards_today INTEGER DEFAULT 0,
        last_goal_reset DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;
    await sql`CREATE INDEX idx_user_stats_user_id ON user_stats(user_id)`;
    console.log('✅ user_stats recreated!\n');

    // 3. Drop and recreate user_progress with user_id
    console.log('3️⃣  Recreating user_progress with user_id...');
    await sql`DROP TABLE IF EXISTS user_progress CASCADE`;
    await sql`
      CREATE TABLE user_progress (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        word_id TEXT NOT NULL REFERENCES vocab_words(id) ON DELETE CASCADE,
        level INTEGER DEFAULT 0,
        next_review TIMESTAMP,
        last_reviewed TIMESTAMP,
        review_count INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, word_id)
      )
    `;
    await sql`CREATE INDEX idx_user_progress_user_id ON user_progress(user_id)`;
    await sql`CREATE INDEX idx_user_progress_next_review ON user_progress(next_review)`;
    await sql`CREATE INDEX idx_user_progress_level ON user_progress(level)`;
    console.log('✅ user_progress recreated!\n');

    // 4. Add user_id to study_sessions
    console.log('4️⃣  Adding user_id to study_sessions...');
    // First check if column exists
    const hasUserIdColumn = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'study_sessions' AND column_name = 'user_id'
    `;

    if (hasUserIdColumn.length === 0) {
      await sql`
        ALTER TABLE study_sessions
        ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id)`;
    }
    // Clear existing sessions since they don't have user_id
    await sql`DELETE FROM study_sessions`;
    console.log('✅ study_sessions updated!\n');

    // 5. Drop and recreate achievement_progress with user_id
    console.log('5️⃣  Recreating achievement_progress with user_id...');
    await sql`DROP TABLE IF EXISTS achievement_progress CASCADE`;
    await sql`
      CREATE TABLE achievement_progress (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
        progress INTEGER DEFAULT 0,
        unlocked BOOLEAN DEFAULT FALSE,
        unlocked_at TIMESTAMP,
        UNIQUE(user_id, achievement_id)
      )
    `;
    await sql`CREATE INDEX idx_achievement_progress_user_id ON achievement_progress(user_id)`;
    console.log('✅ achievement_progress recreated!\n');

    console.log('🎉 Multi-user migration complete!\n');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('IMPORTANT: Run the following SQL in Supabase Dashboard SQL Editor');
    console.log('(Project > SQL Editor > New Query)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('Also configure in Supabase Dashboard:');
    console.log('1. Authentication > Providers > Enable Email');
    console.log('2. Authentication > Providers > Enable Google (add OAuth credentials)');
    console.log('3. Authentication > URL Configuration > Set Site URL');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

addUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
