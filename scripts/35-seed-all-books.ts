/**
 * Hebrew Bible Data Import Script
 *
 * Imports any/all Hebrew Bible books from the morphhb (Open Scriptures Hebrew Bible)
 * package into the database. Strong's dictionary should already be seeded by script 34.
 *
 * Usage:
 *   npx tsx scripts/35-seed-all-books.ts ruth          # Seed one book
 *   npx tsx scripts/35-seed-all-books.ts exodus ruth    # Seed multiple books
 *   npx tsx scripts/35-seed-all-books.ts --all          # Seed all 39 books
 *   npx tsx scripts/35-seed-all-books.ts --remaining    # Seed only books not yet in DB
 *
 * Run: npx tsx scripts/35-seed-all-books.ts [bookId|--all|--remaining]
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import postgres from 'postgres';
import { XMLParser } from 'fast-xml-parser';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// --- Book Metadata ---

interface BookConfig {
  id: string;
  name: string;
  hebrewName: string;
  abbreviation: string;
  chapterCount: number;
  xmlFile: string;
  orderIndex: number;
  idPrefix: string;
}

const ALL_BOOKS: BookConfig[] = [
  // Torah
  { id: 'genesis', name: 'Genesis', hebrewName: 'בְּרֵאשִׁית', abbreviation: 'Gen', chapterCount: 50, xmlFile: 'Gen.xml', orderIndex: 1, idPrefix: 'gen' },
  { id: 'exodus', name: 'Exodus', hebrewName: 'שְׁמוֹת', abbreviation: 'Exod', chapterCount: 40, xmlFile: 'Exod.xml', orderIndex: 2, idPrefix: 'exod' },
  { id: 'leviticus', name: 'Leviticus', hebrewName: 'וַיִּקְרָא', abbreviation: 'Lev', chapterCount: 27, xmlFile: 'Lev.xml', orderIndex: 3, idPrefix: 'lev' },
  { id: 'numbers', name: 'Numbers', hebrewName: 'בְּמִדְבַּר', abbreviation: 'Num', chapterCount: 36, xmlFile: 'Num.xml', orderIndex: 4, idPrefix: 'num' },
  { id: 'deuteronomy', name: 'Deuteronomy', hebrewName: 'דְּבָרִים', abbreviation: 'Deut', chapterCount: 34, xmlFile: 'Deut.xml', orderIndex: 5, idPrefix: 'deut' },

  // Historical Books
  { id: 'joshua', name: 'Joshua', hebrewName: 'יְהוֹשֻׁעַ', abbreviation: 'Josh', chapterCount: 24, xmlFile: 'Josh.xml', orderIndex: 6, idPrefix: 'josh' },
  { id: 'judges', name: 'Judges', hebrewName: 'שׁוֹפְטִים', abbreviation: 'Judg', chapterCount: 21, xmlFile: 'Judg.xml', orderIndex: 7, idPrefix: 'judg' },
  { id: 'ruth', name: 'Ruth', hebrewName: 'רוּת', abbreviation: 'Ruth', chapterCount: 4, xmlFile: 'Ruth.xml', orderIndex: 8, idPrefix: 'ruth' },
  { id: '1-samuel', name: '1 Samuel', hebrewName: 'שְׁמוּאֵל א', abbreviation: '1Sam', chapterCount: 31, xmlFile: '1Sam.xml', orderIndex: 9, idPrefix: '1sam' },
  { id: '2-samuel', name: '2 Samuel', hebrewName: 'שְׁמוּאֵל ב', abbreviation: '2Sam', chapterCount: 24, xmlFile: '2Sam.xml', orderIndex: 10, idPrefix: '2sam' },
  { id: '1-kings', name: '1 Kings', hebrewName: 'מְלָכִים א', abbreviation: '1Kgs', chapterCount: 22, xmlFile: '1Kgs.xml', orderIndex: 11, idPrefix: '1kgs' },
  { id: '2-kings', name: '2 Kings', hebrewName: 'מְלָכִים ב', abbreviation: '2Kgs', chapterCount: 25, xmlFile: '2Kgs.xml', orderIndex: 12, idPrefix: '2kgs' },
  { id: '1-chronicles', name: '1 Chronicles', hebrewName: 'דִּבְרֵי הַיָּמִים א', abbreviation: '1Chr', chapterCount: 29, xmlFile: '1Chr.xml', orderIndex: 13, idPrefix: '1chr' },
  { id: '2-chronicles', name: '2 Chronicles', hebrewName: 'דִּבְרֵי הַיָּמִים ב', abbreviation: '2Chr', chapterCount: 36, xmlFile: '2Chr.xml', orderIndex: 14, idPrefix: '2chr' },
  { id: 'ezra', name: 'Ezra', hebrewName: 'עֶזְרָא', abbreviation: 'Ezra', chapterCount: 10, xmlFile: 'Ezra.xml', orderIndex: 15, idPrefix: 'ezra' },
  { id: 'nehemiah', name: 'Nehemiah', hebrewName: 'נְחֶמְיָה', abbreviation: 'Neh', chapterCount: 13, xmlFile: 'Neh.xml', orderIndex: 16, idPrefix: 'neh' },
  { id: 'esther', name: 'Esther', hebrewName: 'אֶסְתֵּר', abbreviation: 'Esth', chapterCount: 10, xmlFile: 'Esth.xml', orderIndex: 17, idPrefix: 'esth' },

  // Poetic / Wisdom Books
  { id: 'job', name: 'Job', hebrewName: 'אִיּוֹב', abbreviation: 'Job', chapterCount: 42, xmlFile: 'Job.xml', orderIndex: 18, idPrefix: 'job' },
  { id: 'psalms', name: 'Psalms', hebrewName: 'תְּהִלִּים', abbreviation: 'Ps', chapterCount: 150, xmlFile: 'Ps.xml', orderIndex: 19, idPrefix: 'ps' },
  { id: 'proverbs', name: 'Proverbs', hebrewName: 'מִשְׁלֵי', abbreviation: 'Prov', chapterCount: 31, xmlFile: 'Prov.xml', orderIndex: 20, idPrefix: 'prov' },
  { id: 'ecclesiastes', name: 'Ecclesiastes', hebrewName: 'קֹהֶלֶת', abbreviation: 'Eccl', chapterCount: 12, xmlFile: 'Eccl.xml', orderIndex: 21, idPrefix: 'eccl' },
  { id: 'song-of-solomon', name: 'Song of Solomon', hebrewName: 'שִׁיר הַשִּׁירִים', abbreviation: 'Song', chapterCount: 8, xmlFile: 'Song.xml', orderIndex: 22, idPrefix: 'song' },

  // Major Prophets
  { id: 'isaiah', name: 'Isaiah', hebrewName: 'יְשַׁעְיָהוּ', abbreviation: 'Isa', chapterCount: 66, xmlFile: 'Isa.xml', orderIndex: 23, idPrefix: 'isa' },
  { id: 'jeremiah', name: 'Jeremiah', hebrewName: 'יִרְמְיָהוּ', abbreviation: 'Jer', chapterCount: 52, xmlFile: 'Jer.xml', orderIndex: 24, idPrefix: 'jer' },
  { id: 'lamentations', name: 'Lamentations', hebrewName: 'אֵיכָה', abbreviation: 'Lam', chapterCount: 5, xmlFile: 'Lam.xml', orderIndex: 25, idPrefix: 'lam' },
  { id: 'ezekiel', name: 'Ezekiel', hebrewName: 'יְחֶזְקֵאל', abbreviation: 'Ezek', chapterCount: 48, xmlFile: 'Ezek.xml', orderIndex: 26, idPrefix: 'ezek' },
  { id: 'daniel', name: 'Daniel', hebrewName: 'דָּנִיֵּאל', abbreviation: 'Dan', chapterCount: 12, xmlFile: 'Dan.xml', orderIndex: 27, idPrefix: 'dan' },

  // Minor Prophets
  { id: 'hosea', name: 'Hosea', hebrewName: 'הוֹשֵׁעַ', abbreviation: 'Hos', chapterCount: 14, xmlFile: 'Hos.xml', orderIndex: 28, idPrefix: 'hos' },
  { id: 'joel', name: 'Joel', hebrewName: 'יוֹאֵל', abbreviation: 'Joel', chapterCount: 4, xmlFile: 'Joel.xml', orderIndex: 29, idPrefix: 'joel' },
  { id: 'amos', name: 'Amos', hebrewName: 'עָמוֹס', abbreviation: 'Amos', chapterCount: 9, xmlFile: 'Amos.xml', orderIndex: 30, idPrefix: 'amos' },
  { id: 'obadiah', name: 'Obadiah', hebrewName: 'עֹבַדְיָה', abbreviation: 'Obad', chapterCount: 1, xmlFile: 'Obad.xml', orderIndex: 31, idPrefix: 'obad' },
  { id: 'jonah', name: 'Jonah', hebrewName: 'יוֹנָה', abbreviation: 'Jonah', chapterCount: 4, xmlFile: 'Jonah.xml', orderIndex: 32, idPrefix: 'jonah' },
  { id: 'micah', name: 'Micah', hebrewName: 'מִיכָה', abbreviation: 'Mic', chapterCount: 7, xmlFile: 'Mic.xml', orderIndex: 33, idPrefix: 'mic' },
  { id: 'nahum', name: 'Nahum', hebrewName: 'נַחוּם', abbreviation: 'Nah', chapterCount: 3, xmlFile: 'Nah.xml', orderIndex: 34, idPrefix: 'nah' },
  { id: 'habakkuk', name: 'Habakkuk', hebrewName: 'חֲבַקּוּק', abbreviation: 'Hab', chapterCount: 3, xmlFile: 'Hab.xml', orderIndex: 35, idPrefix: 'hab' },
  { id: 'zephaniah', name: 'Zephaniah', hebrewName: 'צְפַנְיָה', abbreviation: 'Zeph', chapterCount: 3, xmlFile: 'Zeph.xml', orderIndex: 36, idPrefix: 'zeph' },
  { id: 'haggai', name: 'Haggai', hebrewName: 'חַגַּי', abbreviation: 'Hag', chapterCount: 2, xmlFile: 'Hag.xml', orderIndex: 37, idPrefix: 'hag' },
  { id: 'zechariah', name: 'Zechariah', hebrewName: 'זְכַרְיָה', abbreviation: 'Zech', chapterCount: 14, xmlFile: 'Zech.xml', orderIndex: 38, idPrefix: 'zech' },
  { id: 'malachi', name: 'Malachi', hebrewName: 'מַלְאָכִי', abbreviation: 'Mal', chapterCount: 4, xmlFile: 'Mal.xml', orderIndex: 39, idPrefix: 'mal' },
];

// --- Utility Functions (from script 34) ---

/**
 * Strip cantillation marks (taamim) from Hebrew text while preserving nikkud (vowels).
 * Cantillation: U+0591-U+05AF
 */
function stripCantillation(text: string): string {
  return text.replace(/[\u0591-\u05AF]/g, '');
}

/**
 * Remove slash separators from Hebrew text (prefix markers like בְּ/רֵאשִׁית -> בְּרֵאשִׁית)
 */
function removeSlashes(text: string): string {
  return text.replace(/\//g, '');
}

/**
 * Parse a lemma string from OSHB into Strong's number(s).
 * Examples:
 *   "1254 a" -> { primary: "H1254", prefix: null }
 *   "b/7225" -> { primary: "H7225", prefix: "b" }
 *   "c/d/776" -> { primary: "H776", prefix: "c/d" }
 */
function parseLemma(lemma: string): { primary: string | null; prefix: string | null } {
  if (!lemma) return { primary: null, prefix: null };

  const parts = lemma.split('/');

  if (parts.length === 1) {
    const num = parts[0].trim().split(' ')[0];
    return { primary: num ? `H${num}` : null, prefix: null };
  }

  const strongsNum = parts[parts.length - 1].trim().split(' ')[0];
  const prefixParts = parts.slice(0, -1).join('/');

  return {
    primary: strongsNum ? `H${strongsNum}` : null,
    prefix: prefixParts || null,
  };
}

// --- Interfaces ---

interface WordRow {
  id: string;
  verse_id: string;
  position: number;
  hebrew: string;
  lemma: string | null;
  lemma_prefix: string | null;
  morph: string | null;
  is_prefix_compound: boolean;
}

interface VerseRow {
  id: string;
  book_id: string;
  chapter: number;
  verse: number;
  hebrew_text: string;
  word_count: number;
}

// --- Main Seed Function ---

async function seedBook(book: BookConfig, sql: postgres.Sql) {
  console.log(`\n📖 Seeding ${book.name} (${book.hebrewName})...`);

  // Step 1: Insert book metadata
  await sql`
    INSERT INTO bible_books (id, name, hebrew_name, abbreviation, chapter_count, testament, order_index)
    VALUES (${book.id}, ${book.name}, ${book.hebrewName}, ${book.abbreviation}, ${book.chapterCount}, 'OT', ${book.orderIndex})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      hebrew_name = EXCLUDED.hebrew_name,
      abbreviation = EXCLUDED.abbreviation,
      chapter_count = EXCLUDED.chapter_count,
      order_index = EXCLUDED.order_index
  `;

  // Step 2: Parse XML
  const xmlPath = path.resolve(process.cwd(), 'node_modules/morphhb/wlc', book.xmlFile);
  if (!fs.existsSync(xmlPath)) {
    console.error(`   ❌ ${book.xmlFile} not found. Make sure morphhb is installed.`);
    return { verses: 0, words: 0 };
  }

  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    isArray: (name) => name === 'chapter' || name === 'verse' || name === 'w' || name === 'seg',
    preserveOrder: false,
  });

  const parsed = parser.parse(xmlContent);
  const osisText = parsed.osis.osisText;
  const bookDiv = osisText.div;
  const chapters = bookDiv.chapter;

  if (!chapters) {
    console.error(`   ❌ No chapters found in ${book.xmlFile}`);
    return { verses: 0, words: 0 };
  }

  console.log(`   Found ${chapters.length} chapters`);

  // Step 3: Process chapters
  let totalVerses = 0;
  let totalWords = 0;

  for (const chapter of chapters) {
    const chapterOsisId = chapter['@_osisID'];
    const chapterNum = parseInt(chapterOsisId.split('.')[1]);

    const verses = chapter.verse;
    if (!verses) continue;

    const verseRows: VerseRow[] = [];
    const wordRows: WordRow[] = [];

    for (const verse of verses) {
      const verseOsisId = verse['@_osisID'];
      const verseParts = verseOsisId.split('.');
      const verseNum = parseInt(verseParts[2]);
      const verseId = `${book.idPrefix}-${chapterNum}-${verseNum}`;

      const words: Array<{ hebrew: string; lemma: string; morph: string; id: string }> = [];

      const wElements = verse.w;
      if (wElements) {
        for (const w of wElements) {
          const hebrewRaw = typeof w === 'string' ? w : (w['#text'] || '');
          const lemma = typeof w === 'string' ? '' : (w['@_lemma'] || '');
          const morph = typeof w === 'string' ? '' : (w['@_morph'] || '');
          const wordId = typeof w === 'string' ? '' : (w['@_id'] || '');

          if (hebrewRaw) {
            words.push({ hebrew: hebrewRaw, lemma, morph, id: wordId });
          }
        }
      }

      const cleanedWords: string[] = [];

      for (let pos = 0; pos < words.length; pos++) {
        const w = words[pos];
        const hasSlash = w.hebrew.includes('/');
        const cleanHebrew = removeSlashes(stripCantillation(w.hebrew));
        const parsedLemma = parseLemma(w.lemma);

        cleanedWords.push(cleanHebrew);

        wordRows.push({
          id: w.id || `${book.idPrefix}-${chapterNum}-${verseNum}-${pos}`,
          verse_id: verseId,
          position: pos,
          hebrew: cleanHebrew,
          lemma: parsedLemma.primary,
          lemma_prefix: parsedLemma.prefix,
          morph: w.morph || null,
          is_prefix_compound: hasSlash,
        });
      }

      const verseText = cleanedWords.join(' ');
      verseRows.push({
        id: verseId,
        book_id: book.id,
        chapter: chapterNum,
        verse: verseNum,
        hebrew_text: verseText,
        word_count: words.length,
      });
    }

    // Batch insert verses
    if (verseRows.length > 0) {
      await sql`
        INSERT INTO bible_verses ${sql(verseRows, 'id', 'book_id', 'chapter', 'verse', 'hebrew_text', 'word_count')}
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Batch insert words (500 at a time)
    if (wordRows.length > 0) {
      for (let i = 0; i < wordRows.length; i += 500) {
        const batch = wordRows.slice(i, i + 500);
        await sql`
          INSERT INTO bible_words ${sql(batch, 'id', 'verse_id', 'position', 'hebrew', 'lemma', 'lemma_prefix', 'morph', 'is_prefix_compound')}
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    totalVerses += verseRows.length;
    totalWords += wordRows.length;

    // Log progress every 10 chapters, or for chapter 1, or for the last chapter
    if (chapterNum === 1 || chapterNum % 10 === 0 || chapterNum === chapters.length) {
      console.log(`   Chapter ${chapterNum}/${chapters.length}: ${verseRows.length} verses, ${wordRows.length} words (running total: ${totalVerses} verses, ${totalWords} words)`);
    }
  }

  console.log(`   ✅ ${book.name}: ${totalVerses} verses, ${totalWords} words`);
  return { verses: totalVerses, words: totalWords };
}

// --- CLI Entry Point ---

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Hebrew Bible Seed Script');
    console.log('========================');
    console.log('Usage:');
    console.log('  npx tsx scripts/35-seed-all-books.ts ruth          # Seed one book');
    console.log('  npx tsx scripts/35-seed-all-books.ts exodus ruth    # Seed multiple books');
    console.log('  npx tsx scripts/35-seed-all-books.ts --all          # Seed all 39 books');
    console.log('  npx tsx scripts/35-seed-all-books.ts --remaining    # Seed only books not in DB');
    console.log('');
    console.log('Available books:');
    for (const book of ALL_BOOKS) {
      console.log(`  ${book.id.padEnd(18)} ${book.name} (${book.chapterCount} chapters)`);
    }
    process.exit(0);
  }

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ POSTGRES_URL not found in .env.local');
    process.exit(1);
  }

  function createSql() {
    return postgres(connectionString!, {
      idle_timeout: 30,
      connect_timeout: 30,
    });
  }

  let sql = createSql();

  try {
    let booksToSeed: BookConfig[];

    if (args.includes('--all')) {
      booksToSeed = ALL_BOOKS;
      console.log(`🚀 Seeding ALL ${ALL_BOOKS.length} Hebrew Bible books...\n`);
    } else if (args.includes('--remaining')) {
      // Check which books already have verse data (not just book metadata)
      const existingBooks = await sql`
        SELECT DISTINCT book_id as id FROM bible_verses
      `;
      const existingIds = new Set(existingBooks.map((b: { id: string }) => b.id));
      booksToSeed = ALL_BOOKS.filter(b => !existingIds.has(b.id));
      console.log(`🚀 Seeding ${booksToSeed.length} remaining books (${existingIds.size} already have verse data)...\n`);
      if (booksToSeed.length === 0) {
        console.log('✅ All books already seeded!');
        return;
      }
    } else {
      // Seed specific books by ID
      booksToSeed = [];
      for (const arg of args) {
        const book = ALL_BOOKS.find(b => b.id === arg.toLowerCase());
        if (!book) {
          console.error(`❌ Unknown book: "${arg}". Run without arguments to see available books.`);
          process.exit(1);
        }
        booksToSeed.push(book);
      }
      console.log(`🚀 Seeding ${booksToSeed.length} book(s)...\n`);
    }

    let grandTotalVerses = 0;
    let grandTotalWords = 0;

    for (let i = 0; i < booksToSeed.length; i++) {
      const book = booksToSeed[i];

      // Create a fresh connection for each book to avoid timeouts
      if (i > 0) {
        await sql.end();
        sql = createSql();
      }

      const { verses, words } = await seedBook(book, sql);
      grandTotalVerses += verses;
      grandTotalWords += words;
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Grand Total:');
    console.log(`   Books seeded: ${booksToSeed.length}`);
    console.log(`   Verses: ${grandTotalVerses.toLocaleString()}`);
    console.log(`   Words: ${grandTotalWords.toLocaleString()}`);
    console.log('='.repeat(50));
    console.log('\n🎉 Done! The Hebrew Bible is ready.');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
