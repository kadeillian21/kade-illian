/**
 * Seed Hebrew Lessons
 *
 * Populates the lessons table with initial Biblical Hebrew curriculum
 * Based on the 6-week foundation from the lesson plan mockup
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedHebrewLessons() {
  console.log('🚀 Seeding Hebrew lessons...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    const lessons = [
      // WEEK 1
      {
        id: 'hebrew-week-1-alphabet',
        language_id: 'hebrew',
        week_number: 1,
        month_number: 1,
        title: 'The Hebrew Alphabet',
        description: 'Master all 22 Hebrew letters, 5 final forms, and begin reading right-to-left. Build the foundation for everything else.',
        lesson_content: `# Week 1: The Hebrew Alphabet

## Overview
This week you'll master the foundation of Biblical Hebrew: the alphabet itself. By the end of this week, you'll be able to recognize and pronounce all 22 Hebrew letters plus the 5 final forms.

## Learning Objectives
- Recognize all 22 Hebrew letters
- Write the 5 final forms (ךםןףץ)
- Understand guttural letters
- Begin reading Hebrew right-to-left
- Practice letter recognition with flashcards

## The 22 Letters
The Hebrew alphabet has 22 consonants (no separate vowel letters). Here they are in order:

א ב ג ד ה ו ז ח ט י כ ל מ נ ס ע פ צ ק ר ש ת

## Final Forms
Five letters have special forms when they appear at the END of a word:
- כ → ך (kaf/khaf)
- מ → ם (mem)
- נ → ן (nun)
- פ → ף (peh/feh)
- צ → ץ (tsadi)

## Guttural Letters
Six letters are "guttural" (pronounced in the throat): א ה ח ע ר

These letters have special rules in Hebrew grammar.

## Practice Schedule
- **Days 1-2**: Learn letters א through י (10 letters)
- **Days 3-4**: Learn letters כ through ת (12 letters)
- **Days 5-6**: Learn final forms + practice all together
- **Day 7**: Review and consolidation

## Next Week
Once you can recognize all letters, you'll learn the vowel points that make Hebrew readable!`,
        topics: ['22 Letters', 'Final Forms', 'Gutturals'],
        vocabulary_set_ids: [], // No vocab yet, just alphabet
        order_index: 1
      },

      // WEEK 2
      {
        id: 'hebrew-week-2-vowels',
        language_id: 'hebrew',
        week_number: 2,
        month_number: 1,
        title: 'Vowel Points & Reading',
        description: 'Learn all Hebrew vowel points, sheva types, and dagesh. By week\'s end, you can decode ANY Hebrew word!',
        lesson_content: `# Week 2: Vowel Points & Reading

## Overview
Hebrew was originally written with consonants only. The vowel points (nikkud) were added later to preserve pronunciation. This week you'll master the vowel system!

## Vowel Classes

### Long Vowels (unchangeable)
- **Qamets** (ָ) - "ah" as in "father"
- **Tsere** (ֵ) - "ay" as in "day"
- **Hireq-Yod** (ִי) - "ee" as in "see"
- **Holem** (ֹ or ֺ) - "oh" as in "go"
- **Shureq** (וּ) - "oo" as in "mood"

### Short Vowels (can change)
- **Patach** (ַ) - short "ah"
- **Segol** (ֶ) - short "eh"
- **Hireq** (ִ) - short "ih"
- **Qamets-Hatuf** (ָ) - short "oh" (looks like qamets!)
- **Qibbuts** (ֻ) - short "uh"

## Sheva (ְ)
The most important vowel point! Two types:
- **Vocal Sheva**: Pronounced like a quick "uh"
- **Silent Sheva**: Not pronounced at all

## Dagesh
A dot inside a letter (בּ):
- **Dagesh Lene**: Makes letters "hard" (ב = b, בּ = v becomes b)
- **Dagesh Forte**: Doubles the consonant

## Practice Schedule
- **Days 1-2**: Long vowels
- **Days 3-4**: Short vowels + sheva
- **Days 5-6**: Dagesh + reading practice
- **Day 7**: Read real Hebrew words!

## Next Week
You'll learn the definite article and prepositions, then READ Genesis 1:1-5!`,
        topics: ['Long Vowels', 'Short Vowels', 'Sheva', 'Dagesh'],
        vocabulary_set_ids: [],
        order_index: 2
      },

      // WEEK 3
      {
        id: 'hebrew-week-3-grammar',
        language_id: 'hebrew',
        week_number: 3,
        month_number: 1,
        title: 'Article & Prepositions',
        description: 'Master the definite article (הַ), inseparable prepositions (בְּ לְ כְ), and conjunction (וְ). Read Genesis 1:1-5!',
        lesson_content: `# Week 3: Article & Prepositions

## Overview
This week you'll learn the grammatical particles that attach to Hebrew words. These small additions change meaning significantly!

## The Definite Article הַ
Hebrew has no word for "a/an" (indefinite article). But it DOES have "the" (definite article): **הַ**

Examples:
- מֶלֶךְ = king / a king
- הַמֶּלֶךְ = THE king

The article attaches to the beginning of the word and sometimes causes changes to the first letter.

## Inseparable Prepositions
Three prepositions attach directly to words:
- **בְּ** = in, at, with
- **לְ** = to, for
- **כְּ** = like, as, according to

Examples:
- בַּיִת = house
- בְּבַיִת = in a house
- בַּבַּיִת = in THE house

## The Conjunction וְ
**וְ** = "and"

Attaches to the beginning of words:
- מֶלֶךְ = king
- וּמֶלֶךְ = and a king

## Genesis 1:1-5
Now you can READ real Scripture! This week's goal: read and understand Genesis 1:1-5 in Hebrew.

בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ

"In the beginning, God created the heavens and the earth."

## Practice Schedule
- **Days 1-2**: Definite article הַ
- **Days 3-4**: Prepositions בְּ לְ כְ
- **Days 5-6**: Conjunction וְ + Genesis reading
- **Day 7**: Review + celebrate reading your first verses!

## Next Week
You'll learn 30 vocabulary words from Genesis 1:1-5!`,
        topics: ['The Article הַ', 'Prepositions', 'Genesis 1:1-5'],
        vocabulary_set_ids: [], // Will link vocab set once created
        order_index: 3
      },

      // WEEK 4
      {
        id: 'hebrew-week-4-vocabulary',
        language_id: 'hebrew',
        week_number: 4,
        month_number: 1,
        title: 'First Vocabulary Set',
        description: 'Learn 30 high-frequency words from Genesis 1:1-5. Build vocabulary systematically from actual Scripture.',
        lesson_content: `# Week 4: First Vocabulary Set

## Overview
This week you'll learn your first 30 Hebrew vocabulary words! These words come directly from Genesis 1:1-5, so you're learning real biblical vocabulary.

## Learning Strategy
Your vocabulary is organized into logical groups:
- **Core Verbs**: created, said, saw, etc.
- **Essential Nouns**: God, heaven, earth, light, darkness
- **Descriptive Words**: good, void, darkness
- **Structural Words**: beginning, day, night

## Flashcard System
Use the vocabulary flashcard system to learn these words:
1. Study each group separately (5-10 words at a time)
2. Practice both Hebrew → English and English → Hebrew
3. Mark cards as correct/incorrect
4. The system will schedule reviews using spaced repetition

## Daily Schedule Suggestion
- **Day 1**: Nouns - Deity & Divine (5 words)
- **Day 2**: Nouns - Nature & Elements (8 words)
- **Day 3**: Verbs - Creation & Making (6 words)
- **Day 4**: Time & Abstract words (6 words)
- **Day 5**: Prepositions & particles (5 words)
- **Day 6**: Review all 30 together
- **Day 7**: Read Genesis 1:1-5 with your new vocabulary!

## Tips for Success
- **Don't rush!** 5-10 words per day is optimal for retention
- **Use the words in sentences** when possible
- **Review yesterday's words** before learning new ones
- **Trust the spaced repetition system** - it will remind you when to review

## Celebration!
By the end of this week, you can READ and UNDERSTAND Genesis 1:1-5 in Hebrew! That's incredible progress in just 4 weeks!

## Next Week
You'll learn about noun gender and number, plus 30 more words from Genesis 1:6-10.`,
        topics: ['30 Words', 'Core Verbs', 'Essential Nouns'],
        vocabulary_set_ids: ['genesis-1-1-5'], // Link to existing vocab set
        order_index: 4
      },

      // WEEK 5
      {
        id: 'hebrew-week-5-nouns',
        language_id: 'hebrew',
        week_number: 5,
        month_number: 2,
        title: 'Noun Gender & Number',
        description: 'Learn masculine/feminine gender markers and singular/plural/dual forms. 30 new words from Genesis 1:6-10.',
        lesson_content: `# Week 5: Noun Gender & Number

## Overview
Hebrew nouns have two genders (masculine/feminine) and three numbers (singular/plural/dual). This week you'll learn the patterns!

## Gender

### Masculine Nouns
Most masculine nouns have NO special ending:
- מֶלֶךְ = king
- יוֹם = day
- אִישׁ = man

### Feminine Nouns
Most feminine nouns end in **ה ָ-** or **ת ֶ-**:
- מַלְכָּה = queen
- שָׁנָה = year
- בַּת = daughter

**Exception**: Some nouns are "natural gender" - אֵם (mother) is feminine even without the ending.

## Number

### Singular
No special marker (base form)

### Plural
- **Masculine plural**: usually ים ִ-
  - מֶלֶךְ → מְלָכִים (kings)
- **Feminine plural**: usually וֹת-
  - מַלְכָּה → מְלָכוֹת (queens)

### Dual (for pairs)
Used for things that come in pairs:
- יָד = hand → יָדַיִם = two hands
- עַיִן = eye → עֵינַיִם = two eyes

## Genesis 1:6-10 Vocabulary
This week's 30 new words come from the second creation day - the separation of waters and the formation of dry land.

## Practice Schedule
- **Days 1-2**: Gender patterns + identification practice
- **Days 3-4**: Plural formation rules
- **Days 5**: Dual number + exceptions
- **Days 6-7**: New vocabulary from Genesis 1:6-10

## Next Week
You'll learn adjective-noun agreement and complete your reading of Genesis 1!`,
        topics: ['Gender', 'Plural Forms', 'Genesis 1:6-10'],
        vocabulary_set_ids: ['genesis-1-6-10'], // Link when vocab set exists
        order_index: 5
      },

      // WEEK 6
      {
        id: 'hebrew-week-6-adjectives',
        language_id: 'hebrew',
        week_number: 6,
        month_number: 2,
        title: 'Adjectives & Agreement',
        description: 'Master adjective-noun agreement (gender, number, definiteness), demonstratives, and numbers 1-10. Complete Genesis 1!',
        lesson_content: `# Week 6: Adjectives & Agreement

## Overview
Hebrew adjectives must AGREE with their nouns in three ways: gender, number, and definiteness. This is one of the most important grammatical concepts!

## Three-Way Agreement

### 1. Gender Agreement
- טוֹב מֶלֶךְ = a good king (masc + masc)
- טוֹבָה מַלְכָּה = a good queen (fem + fem)

### 2. Number Agreement
- טוֹבִים מְלָכִים = good kings (plural)
- טוֹבוֹת מְלָכוֹת = good queens (plural)

### 3. Definiteness Agreement
If the noun has הַ, the adjective MUST have it too:
- הַמֶּלֶךְ הַטּוֹב = THE good king
- ❌ הַמֶּלֶךְ טוֹב = WRONG!

## Attributive vs Predicate

### Attributive (describes noun)
Adjective comes AFTER noun with agreement:
- מֶלֶךְ טוֹב = a good king

### Predicate (state of being)
Adjective comes after noun WITHOUT article:
- הַמֶּלֶךְ טוֹב = the king IS good

## Demonstratives
- זֶה = this (masc)
- זֹאת = this (fem)
- אֵלֶּה = these (plural)

## Numbers 1-10
Hebrew numbers are adjectives! They have gender and sometimes agree:
- אֶחָד = one (masc)
- אַחַת = one (fem)
- שְׁנַיִם = two (masc)
- שְׁתַּיִם = two (fem)
- ... and so on

## Completing Genesis 1
By the end of this week, you can read ALL of Genesis 1 in Hebrew! You have:
- ✅ Alphabet mastery
- ✅ Vowel point fluency
- ✅ Grammatical foundation (articles, prepositions, nouns, adjectives)
- ✅ 60+ vocabulary words

## Practice Schedule
- **Days 1-2**: Gender & number agreement
- **Days 3-4**: Definiteness agreement + attributive vs predicate
- **Days 5**: Demonstratives + numbers
- **Days 6-7**: Read ALL of Genesis 1 in Hebrew!

## Celebration! 🎉
You've completed the foundation! You can now read and understand basic Biblical Hebrew. Everything from here builds on this solid base.

## Next Steps
Continue to Month 2 with sustained reading practice and more complex grammar!`,
        topics: ['Agreement Rules', 'Demonstratives', 'Numbers 1-10'],
        vocabulary_set_ids: [],
        order_index: 6
      }
    ];

    console.log('📚 Inserting lessons...\n');

    for (const lesson of lessons) {
      console.log(`  → Week ${lesson.week_number}: ${lesson.title}`);

      await sql`
        INSERT INTO lessons ${sql(lesson)}
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          lesson_content = EXCLUDED.lesson_content,
          topics = EXCLUDED.topics,
          vocabulary_set_ids = EXCLUDED.vocabulary_set_ids,
          updated_at = NOW()
      `;
    }

    console.log('\n✅ Successfully inserted 6 Hebrew lessons!\n');
    console.log('📊 Summary:');
    console.log('  - Month 1 (Foundation): Weeks 1-4');
    console.log('  - Month 2 (Nouns & Reading): Weeks 5-6');
    console.log('\nNext steps:');
    console.log('1. Visit /hebrew/lessons to see the lesson library');
    console.log('2. Create vocabulary sets for Genesis passages');
    console.log('3. Link vocab sets to lessons using lesson.vocabulary_set_ids');

  } catch (error) {
    console.error('❌ Error seeding lessons:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seedHebrewLessons()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
