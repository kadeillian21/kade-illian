# Claude Instructions for Hebrew Vocabulary System

This document provides instructions for both the user (Kade) and Claude on how to manage the Biblical Hebrew vocabulary learning system.

## System Overview

The Biblical Hebrew learning system consists of two integrated parts:

1. **Lesson Plans** (`/hebrew/lessons`) - Structured weekly curriculum with teaching content
2. **Vocabulary System** (`/hebrew/vocabulary`) - Flashcard-based vocabulary learning with spaced repetition

When your Claude Hebrew Teacher gives you vocabulary words (30, 50, or any number), Claude Code will organize them into logical, learnable groups and optionally link them to specific lessons.

### The New Architecture (Fixed!)

**Problems Solved:**
1. Old design showed ALL words at once → 300+ words after 10 weeks
2. Even with organization, showing all word lists was overwhelming

The new design uses a **Vocab Set Library** with **Progressive Disclosure**.

**How It Works Now:**

1. **Landing Page (Vocab Library)**
   - Shows all your vocab sets as cards (Genesis 1:1-5, Genesis 6:1-8, etc.)
   - Each card shows: Total words, New words, Due for review
   - One set marked as "ACTIVE THIS WEEK" (the set you're currently focusing on)
   - **Review Due** alert at top if any words need review (from ANY set)

2. **Click "Study" on a Set → Set Detail View**
   - See the organized groups for THAT SPECIFIC set only
   - Groups show: Category + word count + suggested days
   - **WORDS ARE HIDDEN** - only visible during flashcards
   - Each group has "Study This Group" button
   - Bottom has "Review All Together" section with full set review buttons

3. **Click "Study This Group" → Flashcard Mode**
   - Study just that specific group (e.g., only the 8 Nature nouns)
   - Perfect for daily focused learning

4. **Click "Review All Together" → Flashcard Mode**
   - Study all words from the set in one session (all 30 words)
   - Great for end-of-week comprehensive review

5. **Click "Start Review" → Review Mode**
   - Shows ONLY words due for review across ALL sets
   - Automatically surfaces words based on spaced repetition schedule

### Key Principles

1. **Logical Organization**: Words are grouped by:
   - Part of speech (Nouns, Verbs, Adjectives, etc.)
   - Semantic fields (Nature, Time, Creation, etc.)
   - Frequency (common words first within each group)

2. **Progressive Disclosure**: Never show all vocab at once:
   - Library shows sets
   - Set shows groups
   - Group shows flashcards
   - Review shows due words only

3. **Self-Paced Learning**: You decide how many days to spend on each group based on:
   - Number of words
   - Difficulty (Verbs vs Nouns vs Prepositions)
   - Your schedule and capacity

4. **Spaced Repetition**: Words track review progress in Postgres database (0-6 levels)
   - Review words automatically surface when due
   - Works across all vocab sets
   - Progress synced across devices via database

5. **Database Storage**: Vocabulary and progress are stored in Supabase Postgres:
   - Easy to add new vocab via admin interface
   - Real-time progress tracking
   - No localStorage syncing required

### Lesson Plans System

**New Addition:** The app now includes a structured lesson plan curriculum!

**How It Works:**

1. **Lesson Library** (`/hebrew/lessons`)
   - Shows all weeks in a beautiful card grid
   - Organized by month (Foundation, Nouns & Reading, etc.)
   - Each lesson card shows: Week number, Title, Description, Topics, Status
   - Progress tracking: Not Started → In Progress → Completed

2. **Individual Lesson Page** (`/hebrew/lessons/[lessonId]`)
   - Full lesson content with teaching material (in Markdown)
   - Linked vocabulary sets for practice
   - **Grammar Practice Sets**: Lessons can include small grammar flashcard sets (e.g., "Definite Article Practice", "Preposition Forms")
     - These sets have `set_type: 'lesson'` to keep them separate from main vocabulary
     - They are VISIBLE in the lesson detail page under "Practice Materials"
     - Users can study them directly from the lesson
     - Perfect for teaching specific grammar patterns (4-8 cards each)
   - Mark lesson as complete button
   - Progress tracking (started date, completed date)

3. **Admin Interface** (`/hebrew/lessons/admin`)
   - Create new lessons via web form
   - Add lesson content in Markdown
   - Link vocabulary sets to lessons
   - Supports both Hebrew and Greek (future)

**Database Structure:**
- `languages` table - Language metadata (Hebrew, Greek)
- `lessons` table - All lesson content and metadata
- `user_lesson_progress` table - User completion tracking
- `vocab_sets` table - Now has `language_id` column

**Key Features:**
- Language-agnostic design (ready for Koine Greek!)
- Rich Markdown content for teaching
- Links to vocabulary sets
- Progress tracking per lesson
- Month/week organization

## File Structure

```
app/hebrew/
├── lessons/
│   ├── page.tsx                        # Lesson library (grid view)
│   ├── [lessonId]/
│   │   └── page.tsx                    # Individual lesson detail
│   └── admin/
│       └── page.tsx                    # Admin interface for lessons
└── vocabulary/
├── page.tsx                            # Main flashcard interface
├── admin/
│   └── page.tsx                        # Admin interface for adding vocab
├── data/
│   ├── types.ts                        # TypeScript interfaces & constants
│   └── deprecated/                     # Old JSON files (archived)
├── components/
│   └── ProgressDashboard.tsx           # Progress statistics UI
└── utils/
    ├── organizer.ts                    # Word organization logic
    ├── srs-algorithm.ts                # Spaced repetition system
    └── stats.ts                        # Statistics calculations

app/api/
├── lessons/
│   ├── route.ts                        # GET all lessons (filter by language)
│   ├── create/route.ts                 # POST create new lesson
│   └── [lessonId]/
│       ├── route.ts                    # GET specific lesson
│       └── progress/route.ts           # GET/POST lesson progress
└── vocab/
    ├── create/route.ts                 # Create new vocab set
    ├── sets/route.ts                   # List all vocab sets
    ├── sets/[setId]/
    │   ├── route.ts                    # Get specific vocab set
    │   └── activate/route.ts           # Set active vocab set
    └── progress/
        ├── route.ts                    # Get user progress
        └── update/route.ts             # Update word progress

scripts/
├── 01-create-schema.ts                 # Database schema setup
├── 02-migrate-vocab.ts                 # Migrate vocab to database
└── 03-migrate-progress.ts              # Migrate progress to database
```

## How to Add New Lessons

### For Kade (The User)

When you want to add a new weekly lesson:

**Option 1: Use Admin Interface (Recommended)**
1. Visit `/hebrew/lessons/admin`
2. Fill in the form:
   - Lesson ID (e.g., `hebrew-week-7-reading`)
   - Week/month numbers and order index
   - Title and description
   - Topics (comma-separated)
   - Vocabulary set IDs to link (comma-separated)
   - Full lesson content in Markdown
3. Click "Create Lesson"
4. The lesson appears in the library immediately

**Option 2: Ask Claude Code**
Provide Claude with:
```
I need a new lesson for Week 7:
- Title: Extended Reading Practice
- Focus on: Reading Genesis 1 fluently
- Should link to: genesis-1-1-5, genesis-1-6-10
- Content: [describe what to teach]
```

Claude Code will create the lesson via API and seed it to the database.

### For Claude Code (The Assistant)

When the user requests a new lesson, follow this workflow:

#### Step 1: Gather Lesson Details

- **id**: Unique identifier (e.g., `hebrew-week-7-reading`)
- **language_id**: `hebrew` or `greek`
- **week_number**: Week in the curriculum (1, 2, 3, etc.)
- **month_number**: Month grouping (1 = Foundation, 2 = Nouns & Reading, etc.)
- **title**: Short, compelling title (e.g., "Extended Reading Practice")
- **description**: 1-2 sentence summary for the card
- **lesson_content**: Full teaching content in Markdown format
- **topics**: Array of topic tags (e.g., ["Genesis 1 Complete", "Reading Fluency"])
- **vocabulary_set_ids**: Array of vocab set IDs to link (e.g., ["genesis-1-1-5"])
- **order_index**: Display order (1, 2, 3, etc.)

#### Step 2: Write Lesson Content in Markdown

Structure the lesson with:
- # Main heading (lesson title)
- ## Overview section
- ## Learning Objectives (bullet points)
- ## Teaching sections (with examples)
- ## Practice Schedule (suggested daily breakdown)
- ## Next Steps (what comes after)

Use proper Markdown formatting:
- `#` for headings
- `**bold**` for emphasis
- `-` for bullet points
- Hebrew text with nikkud preserved

#### Step 3: Call the API

```typescript
await fetch('/api/lessons/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'hebrew-week-7-reading',
    language_id: 'hebrew',
    week_number: 7,
    month_number: 2,
    title: 'Extended Reading Practice',
    description: 'Consolidate all Month 2 learning...',
    lesson_content: '# Week 7: Extended Reading Practice...',
    topics: ['Genesis 1 Complete', 'Reading Fluency'],
    vocabulary_set_ids: ['genesis-1-1-5', 'genesis-1-6-10'],
    order_index: 7
  })
});
```

#### Step 4: Confirm Success

Show the user:
```
✅ Successfully created "Week 7: Extended Reading Practice"!

The lesson is now live at /hebrew/lessons/hebrew-week-7-reading

Linked vocabulary sets:
- Genesis 1:1-5
- Genesis 1:6-10
```

## How to Add New Vocabulary

### For Kade (The User)

When your Claude Hebrew Teacher gives you new vocabulary:

**Option 1: Use Admin Interface (Recommended)**
1. Visit `/hebrew/vocabulary/admin`
2. Fill in Set ID, Title, Description
3. Paste JSON array from Claude Teacher
4. Click "Preview & Validate" to check
5. Click "Create Vocab Set" to add to database
6. Done! The set appears in your library instantly

**Option 2: Ask Claude Code to Add It**
1. Copy the vocabulary from the teacher
2. Paste to Claude Code with:
```
I have new Hebrew vocabulary from [Genesis X / Week Y]:
[paste your vocab here]

Please add this to the database as a new vocab set.
```
3. Claude will organize and insert it via the admin API
4. The new set appears in your Vocab Library

### For Claude Code (The Assistant)

When the user provides new vocabulary words, follow this workflow:

#### Step 1: Parse the Vocabulary

Extract each word's:
- `hebrew`: Hebrew text with nikkud (e.g., "בָּרָא")
- `trans`: Transliteration (e.g., "bara")
- `english`: English translation (e.g., "he created")
- `type`: Part of speech (Noun, Verb, Adjective, etc.)
- `notes`: Any grammatical or usage notes
- `category`: Main group (e.g., "Nouns", "Verbs")
- `subcategory`: Subgroup (e.g., "Nature & Elements")

#### Step 2: Enrich with Metadata

For each word, add:
- `semanticGroup`: Use semantic field detection
- `frequency`: If known (optional - helps with ordering)
- **`pronunciation`**: REQUIRED for all vocabulary - Pronunciation guide with stress marks (e.g., "bah-RAH" for בָּרָא)
  - Use capitalization to indicate stressed syllables
  - Include for regular vocabulary AND grammar cards
  - Store in `extraData.pronunciation` for grammar card types
  - This helps users learn proper Hebrew pronunciation

#### Step 3: Format as JSON Array

Create a JSON array with all words:

```json
[
  {
    "hebrew": "נְפִילִים",
    "trans": "nephilim",
    "english": "giants, fallen ones",
    "type": "Noun",
    "notes": "Plural form, controversial translation",
    "semanticGroup": "People & Beings",
    "frequency": 3,
    "category": "Nouns",
    "subcategory": "People & Beings"
  },
  {
    "hebrew": "בָּרָא",
    "trans": "bara",
    "english": "created",
    "type": "Verb",
    "notes": "Root: ברא (to create)",
    "semanticGroup": "Creation & Making",
    "frequency": 48,
    "category": "Verbs",
    "subcategory": "Creation & Making"
  }
]
```

#### Step 4: Insert via API

Call the `/api/vocab/create` endpoint:

```typescript
await fetch('/api/vocab/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    setId: 'genesis-6-1-8',
    title: 'Genesis 6:1-8',
    description: 'Vocabulary from the Nephilim narrative',
    words: [...] // JSON array from Step 3
  })
});
```

#### Step 5: Confirm Success

Show the user:
```
✅ Successfully created "Genesis 6:1-8" with 25 words!

The vocab set is now available in your library at /hebrew/vocabulary
```

**Note:** All vocabulary is now stored in Postgres database, not JSON files. The admin interface provides the easiest way to add new vocab sets.

## Hebrew Text Formatting Rules

### Critical Requirements

1. **ALWAYS preserve nikkud (vowel points)**
   - Hebrew text MUST include all diacritical marks
   - Example: אֱלֹהִים (correct) vs אלהים (missing nikkud - wrong!)

2. **Use Frank_Ruhl_Libre font**
   - Applied via `font-[family-name:var(--font-hebrew)]` class
   - Already configured in layout

3. **Never use bg-clip-text on Hebrew**
   - It clips diacritical marks (nikkud)
   - Use regular text colors instead

4. **Make Hebrew text selectable**
   - Add `select-text` class
   - Users need to copy words for looking up

### Example Formatting

```tsx
<div className="text-7xl font-[family-name:var(--font-hebrew)] text-[#4a5d49] select-text">
  {word.hebrew}
</div>
```

## Semantic Groups Reference

Use these semantic groups when categorizing words:

### Nouns
- **Deity & Divine**: God, LORD, holy, divine
- **Nature & Elements**: earth, water, fire, wind, light, darkness
- **Time & Periods**: day, night, morning, year, beginning
- **Places & Locations**: city, house, field, mountain, desert
- **People & Beings**: man, woman, king, prophet, angel
- **Abstract Concepts**: chaos, void, righteousness, sin
- **Body Parts**: hand, eye, heart, face
- **Objects & Things**: sword, bread, stone, garment

### Verbs
- **Creation & Making**: create, make, form, build
- **Movement & Motion**: go, come, walk, rise, fall
- **Speech & Communication**: say, speak, call, name
- **Perception**: see, hear, look, listen
- **State of Being**: be, become, exist, remain
- **Action & Doing**: do, work, serve

### Other Parts of Speech
- **Spatial Relations**: in, on, over, under, between (Prepositions)
- **Quantity & Number**: one, two, many, all (Numbers/Quantifiers)
- **Quality & Description**: good, evil, great, small (Adjectives)
- **Logical Relations**: that, because, if, when (Particles/Conjunctions)

## Spaced Repetition System

The SRS uses these intervals:

- Level 0 (New): Learn today
- Level 1: Review in 1 day
- Level 2: Review in 3 days
- Level 3: Review in 7 days (1 week)
- Level 4: Review in 14 days (2 weeks)
- Level 5: Review in 30 days (1 month)
- Level 6: Review in 90 days (3 months) - Mastered!

**Progress is stored in Postgres database** in the `user_progress` table. Each word tracks:
- Current SRS level
- Next review date
- Last reviewed date
- Total review count
- Correct answer count

Global stats are stored in `user_stats` table:
- Last studied date
- Total reviews
- Words learned (level >= 1)
- Words mastered (level >= 5)
- Current streak (days)

### User Workflow

1. Browse vocabulary sets in library
2. Choose a set and view organized groups
3. Study with flashcards (Hebrew→English or English→Hebrew)
4. Mark each card as correct/incorrect
5. Progress automatically updates in database
6. Return later to review words that are due

## Common Tasks

### Task: User has 30 new words from Claude Teacher

**User says:**
> "I have 30 new words from Genesis 12. [pastes HTML/text]"

**Claude Code should:**
1. Parse the 30 words
2. Organize them by part of speech + semantic field
3. Format as JSON array with required fields
4. Call `/api/vocab/create` to insert into database
5. Show success confirmation

**Result:** The new set immediately appears in the vocab library and can be studied right away

### Task: User wants to adjust organization

**User says:**
> "Can you split the Nature & Elements group into two groups?
> One for celestial (heaven, stars) and one for earthly (land, sea)?"

**Claude Code should:**
1. Fetch the current vocab set from database
2. Split the specified group
3. Update word categories/subcategories via database
4. Confirm the change

**Note:** This requires direct database updates. Consider adding an admin edit interface for easier vocab management.

### Task: User wants to know what format to use for new words

**User says:**
> "What format should the Claude Teacher give me vocabulary in?"

**Claude Code should:**
Explain that any format works, but ideal is:
- Hebrew word with nikkud
- Transliteration
- English translation
- Part of speech
- Optional notes

Example:
```
בָּרָא (bara) - "he created" - Verb - Used with God as subject
```

Or even just a list:
```
1. בָּרָא - bara - he created
2. שָׁמַיִם - shamayim - heavens
...
```

Claude Code can parse various formats!

## Tips for Success

### For the User (Kade)

1. **Trust the organization**: Claude organizes words by how your brain learns best
2. **Self-pace based on word count**:
   - 1-5 words = 1 day
   - 6-10 words = 2 days
   - Verbs take longer than nouns
3. **Review regularly**: Check back for review words
4. **Mix modes**: Study both Hebrew→English AND English→Hebrew

### For Claude Code

1. **Always organize before adding**: Never just dump words into a flat list
2. **Explain the groupings**: Help the user understand why words are grouped
3. **Suggest pacing**: Use the `suggestStudyDays()` function
4. **Preserve nikkud**: Always include vowel points in Hebrew text
5. **Be flexible**: User can request different groupings

## Future Enhancements

Potential improvements (not yet implemented):

- [x] ~~Statistics dashboard~~ (implemented)
- [x] ~~Database storage~~ (implemented with Postgres)
- [x] ~~Admin interface for adding vocab~~ (implemented)
- [ ] Edit existing vocab sets via admin UI
- [ ] Delete vocab sets
- [ ] Multi-user support (user authentication)
- [ ] Import vocabulary from CSV
- [ ] Export progress reports
- [ ] Frequency-based sorting from corpus data
- [ ] Audio pronunciation (if available)
- [ ] Verb conjugation tables
- [ ] Word etymology and root analysis

## Examples

### Example 1: Adding Genesis 22 Vocabulary

**User provides:**
```
New vocab from Genesis 22 (Binding of Isaac):

עָקַד (aqad) - to bind - Verb
זֶבַח (zevach) - sacrifice - Noun
אַיִל (ayil) - ram - Noun
מִזְבֵּחַ (mizbeach) - altar - Noun
נָסָה (nasah) - to test - Verb
...
```

**Claude Code:**
1. Parses the vocabulary
2. Organizes into groups
3. Formats as JSON array
4. Calls `/api/vocab/create` with:
```json
{
  "setId": "genesis-22",
  "title": "Genesis 22",
  "description": "Vocabulary from the Binding of Isaac",
  "words": [...]
}
```

**Claude responds:**
```
✅ Successfully created "Genesis 22" with 9 words!

I've organized them as follows:

📦 Nouns - Objects & Things: 3 words (altar, ram, knife)
   Suggested: 1 day

📦 Nouns - Abstract Concepts: 2 words (sacrifice, test)
   Suggested: 1 day

⚡ Verbs - Action & Doing: 4 words (bind, take, return, see)
   Suggested: 2 days

Total: 9 words over ~4 days

The vocabulary is ready at /hebrew/vocabulary!
```

### Example 2: Using Admin Interface

**User:**
1. Visits `/hebrew/vocabulary/admin`
2. Fills in:
   - Set ID: `genesis-22`
   - Title: `Genesis 22`
   - Description: `The Binding of Isaac`
3. Pastes JSON array from Claude Teacher
4. Clicks "Preview & Validate"
5. Reviews the 9 words with generated IDs
6. Clicks "Create Vocab Set"

**Result:**
```
✅ Success! Created "Genesis 22" with 9 words
```

The set immediately appears in the vocab library and can be studied right away.

## End of Documentation

This system is designed to maximize your Hebrew learning efficiency through cognitive science principles:
- Chunking (3-5 items per group)
- Semantic clustering (related words together)
- Spaced repetition (optimal review timing)
- Active recall (flashcards)
- Self-paced learning (you control the schedule)

Happy learning! שָׁלוֹם
