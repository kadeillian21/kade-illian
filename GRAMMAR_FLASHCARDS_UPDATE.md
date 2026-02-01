# Grammar Flashcard Sets - Implementation Summary

## ✅ Changes Completed

### 1. Updated CLAUDE.md Instructions

**Added pronunciation requirement:**
- ALL vocabulary must include pronunciation guide
- Format: Capitalize stressed syllables (e.g., "bah-RAH" for בָּרָא)
- Applies to both regular vocab and grammar cards
- Stored in `extraData.pronunciation` for grammar card types

**Added lesson practice sets documentation:**
- Grammar practice sets are now documented as visible in lessons
- Sets with `set_type: 'lesson'` are separate from main vocabulary
- They appear in lesson cards and detail pages

### 2. Grammar Flashcard Sets Created

Created **4 focused grammar practice sets** (23 total cards):

#### Week 3: Definite Article Practice (4 cards)
- `definite-article-practice`
- Basic form: הַ
- Before gutturals: הָ
- Before accented gutturals: הֶ
- With dagesh forte: הַשָּׁמַיִם

#### Week 4: Preposition Forms (6 cards)
- `preposition-forms-practice`
- Basic forms: בְּ, לְ, כְּ
- Combined with article: בַּ, לַ, כַּ

#### Week 5: Gender & Number (8 cards)
- `gender-number-practice`
- Masculine/feminine singular/plural patterns
- Dual number forms
- Irregular feminine nouns

#### Week 6: Adjective Agreement (5 cards)
- `adjective-agreement-practice`
- טוֹב → טוֹבָה → טוֹבִים → טוֹבוֹת
- Agreement with definite article

### 3. Integration with Lessons

**Database Updates:**
- All grammar sets have `set_type: 'lesson'`
- Linked to lessons via `vocabulary_set_ids` array
- Won't clutter main vocabulary library (filtered out)

**Visibility:**
- ✅ **Lesson Cards**: Show "📚 Practice Materials" section
  - Grammar sets marked with ⚡ icon
  - Regular vocab sets marked with 📖 icon
  - Shows card count for each set
- ✅ **Interactive Lessons**: Embedded as VocabularyStep steps
  - Uses the EXACT same FlashcardStudyUI component
  - Full SRS tracking
  - Previous/Shuffle/Next navigation
- ✅ **Lesson Detail Pages**: Listed in "Vocabulary for This Week"

### 4. API Updates

**Updated `/api/lessons` endpoint:**
- Now fetches full vocab set details (not just IDs)
- Includes `set_type` to differentiate grammar vs vocabulary
- Returns `vocabulary_sets` array with each lesson

### 5. UI Updates

**Lesson Library Page (`/hebrew/lessons/page.tsx`):**
- Added "📚 Practice Materials" section to lesson cards
- Shows all linked vocab sets with icons and card counts
- Differentiates grammar (⚡) from vocabulary (📖) sets

**Vocabulary Page (`/hebrew/vocabulary/page.tsx`):**
- Filters out `set_type: 'lesson'` from main library
- Grammar sets only visible through lessons

## 📊 Summary

### Total Grammar Practice Cards
- Week 3: 4 cards (Definite Article)
- Week 4: 6 cards (Prepositions)
- Week 5: 8 cards (Gender & Number)
- Week 6: 5 cards (Adjectives)
- **Total: 23 cards** across 4 grammar concepts

### Where They Appear

1. **Lesson Cards** (Library View)
   ```
   Week 5: Noun Gender & Number
   ┌─────────────────────────────────┐
   │ 📚 Practice Materials            │
   │ ⚡ Gender & Number Practice      │
   │    8 cards                       │
   └─────────────────────────────────┘
   ```

2. **Interactive Lesson Steps**
   - Step 4 in Week 5: Vocabulary practice with gender-number-practice set
   - Uses full FlashcardStudyUI with SRS tracking
   - Progress bar, "Did you get it right?", Previous/Shuffle/Next

3. **Lesson Detail Pages**
   - Shows under "Vocabulary for This Week"
   - Links to vocab page for standalone study

### Files Modified

**Scripts:**
- `scripts/16-seed-gender-number-vocab.ts` - Week 5 gender/number cards
- `scripts/17-seed-grammar-flashcard-sets.ts` - Weeks 3, 4, 6 grammar cards
- `scripts/18-add-vocab-steps-to-lessons.ts` - Add VocabularyStep to lessons
- `scripts/19-link-grammar-sets-to-lessons.ts` - Link sets to vocabulary_set_ids

**Components:**
- `app/hebrew/vocabulary/components/FlashcardStudyUI.tsx` - NEW reusable component
- `app/hebrew/components/LessonStepRenderer.tsx` - Updated to use FlashcardStudyUI

**Pages:**
- `app/hebrew/lessons/page.tsx` - Show practice materials on cards
- `app/hebrew/vocabulary/page.tsx` - Filter out lesson-type sets

**API:**
- `app/api/lessons/route.ts` - Fetch vocab set details

**Documentation:**
- `CLAUDE.md` - Added pronunciation requirement and lesson practice sets info

## 🎯 Benefits

1. **No Duplication**: One FlashcardStudyUI component used everywhere
2. **Clean Organization**: Grammar sets don't clutter main vocab library
3. **High Visibility**: Practice materials shown prominently on lesson cards
4. **Integrated Learning**: Grammar practice embedded in lesson flow
5. **Pronunciation Included**: All cards now require pronunciation guides
6. **Scalable**: Easy to add more grammar sets for future lessons

## 🚀 Future Enhancements

When creating Weeks 3 and 4 as interactive lessons:
1. Run `scripts/18-add-vocab-steps-to-lessons.ts` again
2. Run `scripts/19-link-grammar-sets-to-lessons.ts` again
3. Grammar sets will automatically appear on those lesson cards
