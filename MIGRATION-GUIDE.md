# Hebrew Learning System Consolidation Guide

## What Changed

### ✅ Part 1: COMPLETED - Per-Set Review Options
Added three quick study options to each vocab set detail page:

1. **🔵 Learn New Words** - Study words you haven't learned yet (level 0)
2. **🔴 Practice Weak Words** - Review words you're struggling with (level 0-2)
3. **🟠 Review Due** - Study words due for review from this specific set

This gives you focused practice on just the cards you need from each set.

### 🔄 Part 2: System Consolidation (Ready to Execute)

**Goal:** Consolidate alphabet, syllables, and grammar content into the unified learning system

**Current State:**
- Separate pages: `/hebrew/alphabet`, `/hebrew/syllables`, `/hebrew/grammar`
- Vocabulary system at `/hebrew/vocabulary`
- No unified progress tracking

**New State:**
- All content in unified learning system at `/hebrew/vocabulary`
- Single progress dashboard tracking everything
- Set type badges distinguish content types (📚 Vocabulary, א Alphabet, 🎯 Syllables, 📖 Grammar)
- Spaced repetition works across all content types

## How to Execute Migration

### Step 1: Run Migration Script

```bash
npx tsx scripts/migrate-alphabet-syllables.ts
```

This will:
- Create `alphabet-consonants` set (28 cards)
- Create `alphabet-vowels` set (11 cards)
- Create `syllables-practice` set (20 cards)
- All stored in the database with proper card types

### Step 2: Verify in UI

1. Visit `/hebrew/vocabulary`
2. You should see three new sets with type badges:
   - **א Hebrew Consonants**
   - **א Hebrew Vowel Points**
   - **🎯 Hebrew Syllables Practice**
3. Click "Study" on any set
4. Flashcards should render with appropriate layouts:
   - Alphabet cards show: Character → Name + Pronunciation + Sound
   - Syllable cards show: Word → Syllable breakdown + Pronunciation

### Step 3: Update Navigation (Optional)

Update `/hebrew/page.tsx` to:
- Remove links to old `/alphabet`, `/syllables` pages
- Update "Vocabulary" link text to "Study" or "Learn"
- Add note that all content is now unified

### Step 4: Deprecate Old Pages (Optional)

Once verified working:
- Add deprecation notice to old pages pointing to new system
- Or delete them entirely:
  - `app/hebrew/alphabet/page.tsx`
  - `app/hebrew/syllables/page.tsx`

## What the System Already Supports

✅ **Multiple Content Types**
- Vocabulary cards (Hebrew word → English meaning)
- Alphabet cards (Character → Name/Sound)
- Syllable cards (Word → Syllable breakdown)
- Grammar cards (Marker → Explanation + Examples)

✅ **Type-Specific Rendering**
- `FlashcardRenderer` component handles all card types
- Different layouts optimized for each content type

✅ **Progress Tracking**
- SRS levels work across all card types
- Stats dashboard tracks everything together
- XP and achievements work for all content

✅ **Set Type Badges**
- Library view shows set type icons/labels
- Helps distinguish vocabulary from alphabet from grammar

## Benefits of Unified System

1. **Single Source of Truth** - All progress in one database
2. **Unified Dashboard** - See overall progress across all Hebrew learning
3. **Better Spaced Repetition** - Review alphabet, vocabulary, and grammar together based on due dates
4. **Consistent Experience** - Same study flow for all content types
5. **Easier to Expand** - Add new grammar, syntax content without creating new pages

## Optional: Rename "Vocabulary" to "Study" or "Learn"

If you want to rename the system to reflect its broader scope:

1. Update route: Rename `app/hebrew/vocabulary/` → `app/hebrew/study/`
2. Update API routes: `app/api/vocab/` → `app/api/study/`
3. Update references in code from "vocabulary" to "study"
4. Update navigation labels in UI

This is optional - the system works fine as "vocabulary" with different set types.

## Testing Checklist

After migration, verify:

- [ ] Alphabet sets appear in library with "א" badge
- [ ] Syllable set appears with "🎯" badge
- [ ] Clicking "Study" loads appropriate flashcard renderer
- [ ] Alphabet cards show character with name/pronunciation/sound
- [ ] Syllable cards show syllable breakdown
- [ ] Progress tracking works (marking cards correct/incorrect)
- [ ] SRS scheduling works (cards get review dates)
- [ ] Dashboard stats include new cards
- [ ] "Practice Weak Words" option appears for sets with level 0-2 cards
- [ ] XP awards work across all card types

## Next Steps

1. Run migration script
2. Test in UI
3. If working well, deprecate old pages
4. Consider adding more content:
   - More grammar sets (verb forms, noun patterns, etc.)
   - Prefix/suffix combinations
   - Common phrases
   - Biblical text passages

## Questions?

- Set types are defined in `app/hebrew/vocabulary/data/types.ts`
- Flashcard rendering in `app/hebrew/vocabulary/components/FlashcardRenderer.tsx`
- Migration script at `scripts/migrate-alphabet-syllables.ts`
- All content stored in `vocab_sets` and `vocab_words` tables
