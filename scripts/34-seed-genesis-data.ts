/**
 * Genesis Data Import Script
 *
 * Imports Genesis text from the morphhb (Open Scriptures Hebrew Bible) package
 * and Strong's Hebrew dictionary into the database.
 *
 * Data sources:
 * - morphhb npm package: Gen.xml (OSIS XML with Hebrew text, Strong's numbers, morphology)
 * - OpenScriptures Strong's dictionary: strongs-hebrew-dictionary.js (GitHub)
 *
 * Run: npx tsx scripts/34-seed-genesis-data.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import postgres from 'postgres';
import { XMLParser } from 'fast-xml-parser';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// --- Utility Functions ---

/**
 * Strip cantillation marks (taamim) from Hebrew text while preserving nikkud (vowels).
 * Cantillation: U+0591-U+05AF
 * Also strips the METEG mark U+05BD which is a cantillation-like accent
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
 *   "d/8064" -> { primary: "H8064", prefix: "d" }
 */
function parseLemma(lemma: string): { primary: string | null; prefix: string | null } {
  if (!lemma) return { primary: null, prefix: null };

  const parts = lemma.split('/');

  if (parts.length === 1) {
    // No prefix, just a number (possibly with suffix like "1254 a")
    const num = parts[0].trim().split(' ')[0]; // Strip suffix like " a"
    return { primary: num ? `H${num}` : null, prefix: null };
  }

  // Has prefix parts - last part is the Strong's number
  const strongsNum = parts[parts.length - 1].trim().split(' ')[0];
  const prefixParts = parts.slice(0, -1).join('/');

  return {
    primary: strongsNum ? `H${strongsNum}` : null,
    prefix: prefixParts || null,
  };
}

/**
 * Extract a short definition from the Strong's strongs_def field.
 * Cleans up HTML-like tags and takes the first concise phrase.
 */
function extractShortDef(strongsDef: string, kjvDef: string): string {
  if (!strongsDef && !kjvDef) return '';

  // Try strongs_def first - remove braces and take first phrase
  let def = strongsDef || '';
  def = def.replace(/\{|\}/g, ''); // Remove braces
  def = def.replace(/<[^>]+>/g, ''); // Remove HTML-like tags
  def = def.replace(/\[.*?\]/g, ''); // Remove bracketed refs
  def = def.trim();

  if (def) {
    // Take first meaningful phrase (before semicolon or comma-heavy text)
    const firstPhrase = def.split(';')[0].split(',').slice(0, 3).join(',').trim();
    if (firstPhrase && firstPhrase.length <= 80) return firstPhrase;
    if (firstPhrase) return firstPhrase.substring(0, 80);
  }

  // Fallback to kjv_def
  if (kjvDef) {
    const cleaned = kjvDef
      .replace(/\[.*?\]/g, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    const firstFew = cleaned.split(',').slice(0, 3).join(',').trim();
    if (firstFew && firstFew.length <= 80) return firstFew;
    if (firstFew) return firstFew.substring(0, 80);
  }

  return def.substring(0, 80) || '';
}

// --- Main Import ---

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

async function seedGenesisData() {
  console.log('🚀 Importing Genesis data and Strong\'s dictionary...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ POSTGRES_URL not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // --- Step 1: Load and import Strong's Dictionary ---
    console.log('📚 Downloading Strong\'s Hebrew Dictionary...');
    const strongsUrl = 'https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js';
    const response = await fetch(strongsUrl);
    if (!response.ok) throw new Error(`Failed to fetch Strong's dictionary: ${response.status}`);

    let strongsText = await response.text();
    // Strip JS wrapper: "var strongsHebrewDictionary = {...}" or similar
    const jsonStart = strongsText.indexOf('{');
    const jsonEnd = strongsText.lastIndexOf('}');
    strongsText = strongsText.substring(jsonStart, jsonEnd + 1);

    const strongsDict: Record<string, {
      lemma: string;
      xlit: string;
      pron: string;
      strongs_def: string;
      kjv_def: string;
    }> = JSON.parse(strongsText);

    const strongsEntries = Object.entries(strongsDict);
    console.log(`✅ Loaded ${strongsEntries.length} Strong's entries\n`);

    // Insert Strong's dictionary in batches
    console.log('📥 Inserting Strong\'s dictionary into database...');
    const BATCH_SIZE = 200;
    let strongsInserted = 0;

    for (let i = 0; i < strongsEntries.length; i += BATCH_SIZE) {
      const batch = strongsEntries.slice(i, i + BATCH_SIZE).map(([num, entry]) => ({
        number: num,
        lemma: entry.lemma || '',
        transliteration: entry.xlit || '',
        pronunciation: entry.pron || '',
        short_def: extractShortDef(entry.strongs_def || '', entry.kjv_def || ''),
        strongs_def: entry.strongs_def || '',
        kjv_def: entry.kjv_def || '',
      }));

      await sql`
        INSERT INTO strongs_hebrew ${sql(batch, 'number', 'lemma', 'transliteration', 'pronunciation', 'short_def', 'strongs_def', 'kjv_def')}
        ON CONFLICT (number) DO NOTHING
      `;

      strongsInserted += batch.length;
      if (strongsInserted % 2000 === 0) {
        console.log(`   ${strongsInserted}/${strongsEntries.length} entries...`);
      }
    }
    console.log(`✅ Inserted ${strongsInserted} Strong's dictionary entries\n`);

    // --- Step 2: Parse Genesis XML ---
    console.log('📖 Parsing Genesis XML from morphhb...');
    const genXmlPath = path.resolve(process.cwd(), 'node_modules/morphhb/wlc/Gen.xml');
    if (!fs.existsSync(genXmlPath)) {
      console.error('❌ Gen.xml not found. Make sure morphhb is installed: npm install --save-dev morphhb');
      process.exit(1);
    }

    const xmlContent = fs.readFileSync(genXmlPath, 'utf-8');

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      isArray: (name) => name === 'chapter' || name === 'verse' || name === 'w' || name === 'seg',
      preserveOrder: false,
    });

    const parsed = parser.parse(xmlContent);

    // Navigate to the book div containing chapters
    const osisText = parsed.osis.osisText;
    const bookDiv = osisText.div;

    // Chapters are directly under the book div
    const chapters = bookDiv.chapter;
    if (!chapters) {
      console.error('❌ No chapters found in Genesis XML');
      process.exit(1);
    }

    console.log(`✅ Found ${chapters.length} chapters in Genesis\n`);

    // --- Step 3: Process and insert verses and words ---
    console.log('📥 Processing and inserting verses and words...');
    let totalVerses = 0;
    let totalWords = 0;

    for (const chapter of chapters) {
      const chapterOsisId = chapter['@_osisID']; // "Gen.1", "Gen.2", etc.
      const chapterNum = parseInt(chapterOsisId.split('.')[1]);

      const verses = chapter.verse;
      if (!verses) continue;

      const verseRows: VerseRow[] = [];
      const wordRows: WordRow[] = [];

      for (const verse of verses) {
        const verseOsisId = verse['@_osisID']; // "Gen.1.1"
        const verseParts = verseOsisId.split('.');
        const verseNum = parseInt(verseParts[2]);
        const verseId = `gen-${chapterNum}-${verseNum}`;

        // Collect words from the verse
        // Words can be direct children or mixed with <seg> elements
        const words: Array<{ hebrew: string; lemma: string; morph: string; id: string }> = [];

        // Process the verse content - words are <w> elements
        const wElements = verse.w;
        if (wElements) {
          for (const w of wElements) {
            const hebrewRaw = typeof w === 'string' ? w : (w['#text'] || '');
            const lemma = typeof w === 'string' ? '' : (w['@_lemma'] || '');
            const morph = typeof w === 'string' ? '' : (w['@_morph'] || '');
            const wordId = typeof w === 'string' ? '' : (w['@_id'] || '');

            if (hebrewRaw) {
              words.push({
                hebrew: hebrewRaw,
                lemma,
                morph,
                id: wordId,
              });
            }
          }
        }

        // Build verse text and word rows
        const cleanedWords: string[] = [];

        for (let pos = 0; pos < words.length; pos++) {
          const w = words[pos];
          const hasSlash = w.hebrew.includes('/');
          const cleanHebrew = removeSlashes(stripCantillation(w.hebrew));
          const parsed = parseLemma(w.lemma);

          cleanedWords.push(cleanHebrew);

          wordRows.push({
            id: w.id || `gen-${chapterNum}-${verseNum}-${pos}`,
            verse_id: verseId,
            position: pos,
            hebrew: cleanHebrew,
            lemma: parsed.primary,
            lemma_prefix: parsed.prefix,
            morph: w.morph || null,
            is_prefix_compound: hasSlash,
          });
        }

        const verseText = cleanedWords.join(' ');
        verseRows.push({
          id: verseId,
          book_id: 'genesis',
          chapter: chapterNum,
          verse: verseNum,
          hebrew_text: verseText,
          word_count: words.length,
        });
      }

      // Batch insert verses for this chapter
      if (verseRows.length > 0) {
        await sql`
          INSERT INTO bible_verses ${sql(verseRows, 'id', 'book_id', 'chapter', 'verse', 'hebrew_text', 'word_count')}
          ON CONFLICT (id) DO NOTHING
        `;
      }

      // Batch insert words for this chapter
      if (wordRows.length > 0) {
        // Insert in sub-batches to avoid query size limits
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

      if (chapterNum % 10 === 0 || chapterNum === 1) {
        console.log(`   Chapter ${chapterNum}: ${verseRows.length} verses, ${wordRows.length} words`);
      }
    }

    console.log(`\n✅ Import complete!\n`);
    console.log('📊 Statistics:');
    console.log(`   Strong\'s entries: ${strongsInserted}`);
    console.log(`   Chapters: ${chapters.length}`);
    console.log(`   Verses: ${totalVerses}`);
    console.log(`   Words: ${totalWords}`);
    console.log(`\n🎉 Genesis is ready for the Bible reader!`);

  } catch (error) {
    console.error('❌ Error importing Genesis data:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seedGenesisData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
