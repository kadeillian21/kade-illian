/**
 * POST /api/vocab/seed-categories
 *
 * Seeds the database with Alphabet, Syllables, and Grammar Markers sets
 * This endpoint should only be called once to migrate the data
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Ensure tables have the required columns (runs once per deployment)
let schemaUpdated = false;

async function ensureSchema(sql: ReturnType<typeof getDb>) {
  if (schemaUpdated) return;

  // Add card_type column if not exists
  await sql`
    ALTER TABLE vocab_words
    ADD COLUMN IF NOT EXISTS card_type TEXT DEFAULT 'vocabulary'
  `.catch(() => {});

  // Add extra_data column if not exists
  await sql`
    ALTER TABLE vocab_words
    ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb
  `.catch(() => {});

  // Add set_type column if not exists
  await sql`
    ALTER TABLE vocab_sets
    ADD COLUMN IF NOT EXISTS set_type TEXT DEFAULT 'vocabulary'
  `.catch(() => {});

  schemaUpdated = true;
}

// Alphabet data (41 cards)
const alphabetCards = [
  // CONSONANTS (28)
  { char: 'א', name: 'Aleph', pronunciation: 'AH-lef', sound: '(silent)', notes: 'Looks like X' },
  { char: 'ב', name: 'Bet', pronunciation: 'bayt', sound: 'b / v', notes: 'Backwards C with floor' },
  { char: 'ג', name: 'Gimel', pronunciation: 'GEE-mel', sound: 'g', notes: 'Always hard g' },
  { char: 'ד', name: 'Dalet', pronunciation: 'DAH-let', sound: 'd', notes: 'Has corner (vs ר)' },
  { char: 'ה', name: 'He', pronunciation: 'hay', sound: 'h', notes: 'Gap at top left' },
  { char: 'ו', name: 'Vav', pronunciation: 'vahv', sound: 'v / o / u', notes: 'Straight line; means "and"' },
  { char: 'ז', name: 'Zayin', pronunciation: 'ZAH-yin', sound: 'z', notes: 'Like a sword' },
  { char: 'ח', name: 'Chet', pronunciation: 'khet', sound: 'ch', notes: 'Throaty (like "Bach")' },
  { char: 'ט', name: 'Tet', pronunciation: 'tet', sound: 't', notes: 'Curly shape' },
  { char: 'י', name: 'Yod', pronunciation: 'yohd', sound: 'y / i', notes: 'Tiny apostrophe' },
  { char: 'כ', name: 'Kaph', pronunciation: 'kahf', sound: 'k / kh', notes: 'Like ב but rounder' },
  { char: 'ל', name: 'Lamed', pronunciation: 'LAH-med', sound: 'l', notes: "Shepherd's staff, tallest letter" },
  { char: 'מ', name: 'Mem', pronunciation: 'mem', sound: 'm', notes: 'Square with opening bottom left' },
  { char: 'נ', name: 'Nun', pronunciation: 'noon', sound: 'n', notes: 'Like ו with base/foot' },
  { char: 'ס', name: 'Samekh', pronunciation: 'SAH-mekh', sound: 's', notes: 'Closed circle' },
  { char: 'ע', name: 'Ayin', pronunciation: 'AH-yin', sound: '(guttural)', notes: 'Silent/throaty, looks like Y' },
  { char: 'פ', name: 'Pe', pronunciation: 'pay', sound: 'p / f', notes: 'Like ב with inner line' },
  { char: 'צ', name: 'Tsade', pronunciation: 'TSAH-day', sound: 'ts', notes: 'Unique bent shape' },
  { char: 'ק', name: 'Qoph', pronunciation: 'kohf', sound: 'q', notes: 'Deep k sound' },
  { char: 'ר', name: 'Resh', pronunciation: 'raysh', sound: 'r', notes: 'Rounded top, SHORT, on baseline' },
  { char: 'שׂ', name: 'Sin', pronunciation: 'seen', sound: 's', notes: 'Dot on left' },
  { char: 'שׁ', name: 'Shin', pronunciation: 'sheen', sound: 'sh', notes: 'Dot on right' },
  { char: 'ת', name: 'Tav', pronunciation: 'tahv', sound: 't', notes: 'Like ח with extra line' },
  { char: 'ך', name: 'Kaph (final)', pronunciation: 'kahf', sound: 'kh', notes: 'LONG tail drops below baseline' },
  { char: 'ם', name: 'Mem (final)', pronunciation: 'mem', sound: 'm', notes: 'Closed square, stays ON baseline' },
  { char: 'ן', name: 'Nun (final)', pronunciation: 'noon', sound: 'n', notes: 'LONG tail drops below baseline' },
  { char: 'ף', name: 'Pe (final)', pronunciation: 'fay', sound: 'f', notes: 'LONG tail drops below baseline' },
  { char: 'ץ', name: 'Tsade (final)', pronunciation: 'TSAH-day', sound: 'ts', notes: 'LONG tail drops below baseline' },
  // VOWEL POINTS (13)
  { char: 'בָ', name: 'Qamets', pronunciation: 'KAH-mets', sound: '"ah" (father)', notes: 'Small T shape under letter', type: 'Vowel' },
  { char: 'בֵ', name: 'Tsere', pronunciation: 'tsay-RAY', sound: '"ay" (day)', notes: 'Two dots under letter', type: 'Vowel' },
  { char: 'בֹ', name: 'Holem', pronunciation: 'HOH-lem', sound: '"oh" (go)', notes: 'Dot above letter (or on vav)', type: 'Vowel' },
  { char: 'בוּ', name: 'Shureq', pronunciation: 'shoo-ROOK', sound: '"oo" (food)', notes: 'Vav with dot inside', type: 'Vowel' },
  { char: 'בִי', name: 'Hireq + Yod', pronunciation: 'hee-REEK', sound: '"ee" (see)', notes: 'Dot under + yod after', type: 'Vowel' },
  { char: 'בַ', name: 'Patach', pronunciation: 'pah-TAKH', sound: '"ah" (cat)', notes: 'Line under letter', type: 'Vowel' },
  { char: 'בֶ', name: 'Segol', pronunciation: 'seh-GOHL', sound: '"eh" (bed)', notes: 'Three dots under letter', type: 'Vowel' },
  { char: 'בִ', name: 'Hireq', pronunciation: 'hee-REEK', sound: '"ih" (sit)', notes: 'One dot under letter', type: 'Vowel' },
  { char: 'בֻ', name: 'Qibbuts', pronunciation: 'kee-BOOTS', sound: '"oo" (book)', notes: 'Three diagonal dots under', type: 'Vowel' },
  { char: 'בְ', name: 'Sheva', pronunciation: 'sheh-VAH', sound: '"uh" or silent', notes: 'Two vertical dots - vocal at word start', type: 'Vowel' },
  { char: 'בֲ', name: 'Hateph Patach', pronunciation: 'hah-TEF pah-TAKH', sound: '"ah" (short)', notes: 'Sheva + patach - with gutturals', type: 'Vowel' },
  { char: 'בֱ', name: 'Hateph Segol', pronunciation: 'hah-TEF seh-GOHL', sound: '"eh" (short)', notes: 'Sheva + segol - with gutturals', type: 'Vowel' },
  { char: 'בֳ', name: 'Hateph Qamets', pronunciation: 'hah-TEF KAH-mets', sound: '"oh" (short)', notes: 'Sheva + qamets - with gutturals', type: 'Vowel' }
];

// Syllables data (20 cards)
const syllablesCards = [
  { word: 'בֵּן', syllables: 'בֵּן', pronunciation: 'ben', type: '1 closed syllable', notes: 'Meaning: "son"' },
  { word: 'יָד', syllables: 'יָד', pronunciation: 'yad', type: '1 closed syllable', notes: 'Meaning: "hand"' },
  { word: 'לֹא', syllables: 'לֹא', pronunciation: 'lo', type: '1 open syllable', notes: 'Meaning: "no/not"' },
  { word: 'עַם', syllables: 'עַם', pronunciation: 'am', type: '1 closed syllable', notes: 'Meaning: "people"' },
  { word: 'גּוֹי', syllables: 'גּוֹי', pronunciation: 'goy', type: '1 closed syllable', notes: 'Meaning: "nation"' },
  { word: 'שָׁלוֹם', syllables: 'שָׁ־לוֹם', pronunciation: 'sha-LOM', type: 'Open + closed syllables', notes: 'Meaning: "peace"' },
  { word: 'מֶלֶךְ', syllables: 'מֶ־לֶךְ', pronunciation: 'MEH-lekh', type: 'Open + closed syllables', notes: 'Meaning: "king"' },
  { word: 'דָּבָר', syllables: 'דָּ־בָר', pronunciation: 'da-VAR', type: 'Open + closed syllables', notes: 'Meaning: "word"' },
  { word: 'אֱלֹהִים', syllables: 'אֱ־לֹ־הִים', pronunciation: 'e-lo-HEEM', type: '3 syllables', notes: 'Meaning: "God"' },
  { word: 'בָּרָא', syllables: 'בָּ־רָא', pronunciation: 'ba-RA', type: 'Open + open syllables', notes: 'Meaning: "he created"' },
  { word: 'טוֹב', syllables: 'טוֹב', pronunciation: 'tov', type: '1 closed syllable', notes: 'Meaning: "good"' },
  { word: 'אוֹר', syllables: 'אוֹר', pronunciation: 'or', type: '1 closed syllable', notes: 'Meaning: "light"' },
  { word: 'יוֹם', syllables: 'יוֹם', pronunciation: 'yom', type: '1 closed syllable', notes: 'Meaning: "day"' },
  { word: 'לַיְלָה', syllables: 'לַיְ־לָה', pronunciation: 'LAY-lah', type: 'Closed + open syllables', notes: 'Meaning: "night"' },
  { word: 'בֶּן־אָדָם', syllables: 'בֶּן־אָ־דָם', pronunciation: 'ben-a-DAM', type: 'Joined by maqqef', notes: 'Meaning: "son of man"' },
  { word: 'אֶרֶץ', syllables: 'אֶ־רֶץ', pronunciation: 'EH-rets', type: 'Open + closed syllables', notes: 'Meaning: "earth/land"' },
  { word: 'שָׁמַיִם', syllables: 'שָׁ־מַ־יִם', pronunciation: 'sha-MA-yim', type: '3 syllables', notes: 'Meaning: "heavens/sky"' },
  { word: 'מַיִם', syllables: 'מַ־יִם', pronunciation: 'MA-yim', type: 'Open + closed syllables', notes: 'Meaning: "water"' },
  { word: 'רוּחַ', syllables: 'רוּ־חַ', pronunciation: 'RU-akh', type: 'Open + closed syllables', notes: 'Meaning: "spirit/wind"' },
  { word: 'תֹּהוּ', syllables: 'תֹּ־הוּ', pronunciation: 'TO-hu', type: 'Open + open syllables', notes: 'Meaning: "formless/chaos"' }
];

// Grammar markers data (31 cards)
const grammarCards = [
  { hebrew: 'הַ', pronunciation: 'ha-', meaning: 'The', grammarType: 'Definite Article (with patach)', category: 'Articles', explanation: 'Attaches to beginning of words to mean "the" - most common form', examples: ['מֶלֶךְ = king', 'הַמֶּלֶךְ = THE king'] },
  { hebrew: 'הָ', pronunciation: 'ha-', meaning: 'The', grammarType: 'Definite Article (with qamets)', category: 'Articles', explanation: 'Used before certain letters (gutturals: א ה ח ע)', examples: ['אָרֶץ = earth', 'הָאָרֶץ = THE earth'] },
  { hebrew: 'הֶ', pronunciation: 'he-', meaning: 'The', grammarType: 'Definite Article (with segol)', category: 'Articles', explanation: 'Used before certain guttural letters with specific vowels', examples: ['הֶהָרִים = THE mountains'] },
  { hebrew: 'וְ', pronunciation: 've-', meaning: 'And', grammarType: 'Vav Conjunction (with sheva)', category: 'Conjunctions', explanation: 'Attaches to beginning of words - most common form of "and"', examples: ['שָׁמַיִם = heavens', 'וְשָׁמַיִם = AND heavens'] },
  { hebrew: 'וּ', pronunciation: 'u-', meaning: 'And', grammarType: 'Vav Conjunction (with shureq)', category: 'Conjunctions', explanation: 'Used before letters ב מ פ (BeMP)', examples: ['בֹהוּ = void', 'וּבֹהוּ = AND void'] },
  { hebrew: 'וָ', pronunciation: 'va-', meaning: 'And', grammarType: 'Vav Conjunction (with qamets)', category: 'Conjunctions', explanation: 'Used before single-syllable words or certain consonants', examples: ['בֹהוּ = void', 'וָבֹהוּ = AND void'] },
  { hebrew: 'וַ', pronunciation: 'va-', meaning: 'And (then)', grammarType: 'Vav Consecutive', category: 'Conjunctions', explanation: 'Creates narrative past tense - THE most common verb form in stories', examples: ['יֹּאמֶר = he will say', 'וַיֹּאמֶר = and he SAID (then he said)'] },
  { hebrew: 'בְּ', pronunciation: 'be-', meaning: 'In / By / With', grammarType: 'Inseparable Preposition', category: 'Prepositions', explanation: 'Attaches to beginning of words', examples: ['רֵאשִׁית = beginning', 'בְּרֵאשִׁית = IN the beginning'] },
  { hebrew: 'לְ', pronunciation: 'le-', meaning: 'To / For', grammarType: 'Inseparable Preposition', category: 'Prepositions', explanation: 'Attaches to beginning of words', examples: ['אוֹר = light', 'לָאוֹר = TO the light'] },
  { hebrew: 'כְּ', pronunciation: 'ke-', meaning: 'Like / As / According to', grammarType: 'Inseparable Preposition', category: 'Prepositions', explanation: 'Attaches to beginning of words', examples: ['אִישׁ = man', 'כְּאִישׁ = LIKE a man'] },
  { hebrew: 'וּבְ', pronunciation: 'uv-', meaning: 'And in', grammarType: 'Vav + Preposition', category: 'Combined Forms', explanation: 'Conjunction + preposition combined', examples: ['יוֹם = day', 'וּבְיוֹם = AND IN the day'] },
  { hebrew: 'וְלַ', pronunciation: 'vela-', meaning: 'And to/for the', grammarType: 'Vav + Preposition + Article', category: 'Combined Forms', explanation: 'Conjunction + preposition + article all together', examples: ['חֹשֶׁךְ = darkness', 'וְלַחֹשֶׁךְ = AND TO THE darkness'] },
  { hebrew: 'בַּ', pronunciation: 'ba-', meaning: 'In the', grammarType: 'Preposition + Article', category: 'Combined Forms', explanation: 'Preposition ב + article הַ combined', examples: ['יוֹם = day', 'בַּיוֹם = IN THE day'] },
  { hebrew: 'לָ', pronunciation: 'la-', meaning: 'To the / For the', grammarType: 'Preposition + Article', category: 'Combined Forms', explanation: 'Preposition ל + article הַ combined', examples: ['אוֹר = light', 'לָאוֹר = TO THE light'] },
  { hebrew: 'כָּ', pronunciation: 'ka-', meaning: 'Like the / As the', grammarType: 'Preposition + Article', category: 'Combined Forms', explanation: 'Preposition כ + article הַ combined', examples: ['מַיִם = water', 'כַּמַּיִם = LIKE THE water'] },
  { hebrew: 'אֵת', pronunciation: 'et', meaning: '[Direct object marker]', grammarType: 'Particle (untranslatable)', category: 'Particles', explanation: 'Shows what receives the action of a verb - only with definite objects', examples: ['בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם', 'God created [אֵת] THE heavens'] },
  { hebrew: 'אֶת־', pronunciation: 'et-', meaning: '[Direct object marker]', grammarType: 'Particle with Maqqef', category: 'Particles', explanation: 'Same as אֵת but connected with maqqef (hyphen)', examples: ['וַיַּרְא אֶת־הָאוֹר', 'And he saw [אֶת] the light'] },
  { hebrew: 'וְאֵת', pronunciation: "ve'et", meaning: 'And [object marker]', grammarType: 'Vav + Particle', category: 'Particles', explanation: 'Conjunction + direct object marker', examples: ['אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ', 'the heavens AND [וְאֵת] the earth'] },
  { hebrew: 'עַל', pronunciation: 'al', meaning: 'On / Upon / Over', grammarType: 'Preposition (standalone)', category: 'Prepositions', explanation: 'Very common preposition - often with maqqef', examples: ['עַל־פְּנֵי = upon the face of', 'עַל־הָאָרֶץ = upon the earth'] },
  { hebrew: 'אֶל', pronunciation: 'el', meaning: 'To / Toward / Unto', grammarType: 'Preposition (standalone)', category: 'Prepositions', explanation: 'Shows direction or movement toward', examples: ['אֶל־הָעִיר = to the city', 'אֶל־אֱלֹהִים = to God'] },
  { hebrew: 'מִן', pronunciation: 'min', meaning: 'From', grammarType: 'Preposition (standalone)', category: 'Prepositions', explanation: 'Often shortened to מִ and attached to words', examples: ['מִן־הָעִיר = from the city', 'מִמִּצְרַיִם = from Egypt'] },
  { hebrew: 'עִם', pronunciation: 'im', meaning: 'With', grammarType: 'Preposition (standalone)', category: 'Prepositions', explanation: 'Indicates accompaniment', examples: ['עִם־אָבִיו = with his father', 'עִם־הָעָם = with the people'] },
  { hebrew: 'בֵּין', pronunciation: 'bein', meaning: 'Between', grammarType: 'Preposition (standalone)', category: 'Prepositions', explanation: 'Often used twice: "between X and between Y"', examples: ['בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ', 'between the light and between the darkness'] },
  { hebrew: 'כִּי', pronunciation: 'ki', meaning: 'That / Because / When / For', grammarType: 'Conjunction (multi-use)', category: 'Conjunctions', explanation: 'Context determines meaning - VERY common word', examples: ['כִּי־טוֹב = that [it was] good', 'כִּי יָדַעְתִּי = because I knew'] },
  { hebrew: 'אֲשֶׁר', pronunciation: 'asher', meaning: 'Who / Which / That', grammarType: 'Relative Pronoun', category: 'Particles', explanation: 'Introduces relative clauses', examples: ['הָאִישׁ אֲשֶׁר = the man who/that', 'הַמָּקוֹם אֲשֶׁר = the place which/where'] },
  { hebrew: 'אִם', pronunciation: 'im', meaning: 'If', grammarType: 'Conditional Particle', category: 'Particles', explanation: 'Introduces conditional statements', examples: ['אִם־תִּשְׁמַע = if you listen', 'אִם־לֹא = if not'] },
  { hebrew: 'לֹא', pronunciation: 'lo', meaning: 'Not / No', grammarType: 'Negative Particle', category: 'Particles', explanation: 'Standard negation', examples: ['לֹא טוֹב = not good', 'לֹא־יָדַעְתִּי = I did not know'] },
  { hebrew: 'אַל', pronunciation: 'al', meaning: 'Do not', grammarType: 'Negative Command', category: 'Particles', explanation: "Used for prohibitions (don't do this)", examples: ['אַל־תִּירָא = do not fear', 'אַל־תֹּאכַל = do not eat'] },
  { hebrew: '־', pronunciation: 'maqqef', meaning: 'Maqqef (connector)', grammarType: 'Punctuation', category: 'Punctuation', explanation: 'Connects words into one pronunciation unit - like a hyphen', examples: ['עַל־פְּנֵי = al-penei (one unit)', 'כָּל־הָאָרֶץ = kol-haarets'] },
  { hebrew: '׃', pronunciation: 'sof pasuq', meaning: 'Sof Pasuq (verse end)', grammarType: 'Punctuation', category: 'Punctuation', explanation: 'Marks the end of a verse - like a period', examples: ['Appears at end of every verse', 'Similar to a colon (:)'] },
  { hebrew: 'פ', pronunciation: 'pe (petucha)', meaning: 'Petucha (paragraph)', grammarType: 'Section Marker', category: 'Punctuation', explanation: 'Open paragraph break - marks major section division', examples: ['Appears at end of Genesis 1:5', 'Editorial marker from scribes'] }
];

export async function POST() {
  const sql = getDb();

  try {
    await ensureSchema(sql);

    const results = {
      alphabet: { success: false, words: 0 },
      syllables: { success: false, words: 0 },
      grammar: { success: false, words: 0 },
    };

    // 1. Seed Alphabet Set
    const existingAlphabet = await sql`SELECT id FROM vocab_sets WHERE id = 'alphabet'`;
    if (existingAlphabet.length === 0) {
      await sql`
        INSERT INTO vocab_sets (id, title, description, total_words, is_active, set_type)
        VALUES ('alphabet', 'Hebrew Alphabet', 'Learn all 41 Hebrew characters - consonants and vowels', ${alphabetCards.length}, false, 'alphabet')
      `;

      for (const card of alphabetCards) {
        const wordId = `alphabet-${card.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        const cardType = (card as any).type === 'Vowel' ? 'Vowel' : 'Consonant';

        await sql`
          INSERT INTO vocab_words (
            id, hebrew, transliteration, english, type, notes, semantic_group, set_id,
            group_category, group_subcategory, card_type, extra_data
          ) VALUES (
            ${wordId},
            ${card.char},
            ${card.name.toLowerCase()},
            ${card.name},
            ${cardType},
            ${card.notes},
            'Alphabet',
            'alphabet',
            ${cardType === 'Vowel' ? 'Vowels' : 'Consonants'},
            ${cardType === 'Vowel' ? 'Vowel Points' : 'Letters'},
            'alphabet',
            ${JSON.stringify({ pronunciation: card.pronunciation, sound: card.sound })}::jsonb
          )
        `;
      }
      results.alphabet = { success: true, words: alphabetCards.length };
    }

    // 2. Seed Syllables Set
    const existingSyllables = await sql`SELECT id FROM vocab_sets WHERE id = 'syllables'`;
    if (existingSyllables.length === 0) {
      await sql`
        INSERT INTO vocab_sets (id, title, description, total_words, is_active, set_type)
        VALUES ('syllables', 'Hebrew Syllables', 'Practice dividing Hebrew words into syllables', ${syllablesCards.length}, false, 'syllables')
      `;

      for (const card of syllablesCards) {
        const wordId = `syllables-${card.pronunciation.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

        await sql`
          INSERT INTO vocab_words (
            id, hebrew, transliteration, english, type, notes, semantic_group, set_id,
            group_category, group_subcategory, card_type, extra_data
          ) VALUES (
            ${wordId},
            ${card.word},
            ${card.pronunciation.toLowerCase()},
            ${card.notes.replace('Meaning: ', '').replace(/"/g, '')},
            'Syllable',
            ${card.notes},
            'Syllables',
            'syllables',
            'Syllables',
            ${card.type},
            'syllable',
            ${JSON.stringify({
              syllables: card.syllables,
              pronunciation: card.pronunciation,
              syllableType: card.type
            })}::jsonb
          )
        `;
      }
      results.syllables = { success: true, words: syllablesCards.length };
    }

    // 3. Seed Grammar Markers Set
    const existingGrammar = await sql`SELECT id FROM vocab_sets WHERE id = 'grammar-markers'`;
    if (existingGrammar.length === 0) {
      await sql`
        INSERT INTO vocab_sets (id, title, description, total_words, is_active, set_type)
        VALUES ('grammar-markers', 'Grammar Markers', 'Articles, prepositions, particles & punctuation', ${grammarCards.length}, false, 'grammar')
      `;

      for (const card of grammarCards) {
        const wordId = `grammar-${card.pronunciation.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

        // Check for duplicate
        const existing = await sql`SELECT id FROM vocab_words WHERE id = ${wordId}`;
        if (existing.length > 0) continue;

        await sql`
          INSERT INTO vocab_words (
            id, hebrew, transliteration, english, type, notes, semantic_group, set_id,
            group_category, group_subcategory, card_type, extra_data
          ) VALUES (
            ${wordId},
            ${card.hebrew},
            ${card.pronunciation.toLowerCase()},
            ${card.meaning},
            ${card.grammarType},
            ${card.explanation},
            'Grammar',
            'grammar-markers',
            ${card.category},
            ${card.grammarType},
            'grammar',
            ${JSON.stringify({
              pronunciation: card.pronunciation,
              grammarType: card.grammarType,
              category: card.category,
              explanation: card.explanation,
              examples: card.examples
            })}::jsonb
          )
        `;
      }
      results.grammar = { success: true, words: grammarCards.length };
    }

    return NextResponse.json({
      success: true,
      message: 'Categories seeded successfully',
      results,
    });

  } catch (error) {
    console.error('Error seeding categories:', error);
    return NextResponse.json(
      { error: 'Failed to seed categories', details: String(error) },
      { status: 500 }
    );
  }
}
