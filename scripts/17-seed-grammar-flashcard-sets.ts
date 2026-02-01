/**
 * Seed Grammar & Pattern Practice Flashcard Sets
 *
 * Creates small, focused flashcard sets for lessons teaching specific grammar patterns.
 * These are set_type: 'lesson' to keep them separate from main vocabulary.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedGrammarFlashcards() {
  console.log('🚀 Seeding grammar & pattern practice flashcards...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // ===== WEEK 3: DEFINITE ARTICLE PRACTICE =====
    console.log('📚 Creating Week 3: Definite Article Practice...\n');

    const definitePracticeId = 'definite-article-practice';
    await sql`
      INSERT INTO vocab_sets (id, title, description, language_id, set_type, is_active)
      VALUES (
        ${definitePracticeId},
        'The Definite Article (הַ)',
        'Practice identifying how הַ changes with different consonants',
        'hebrew',
        'lesson',
        false
      )
      ON CONFLICT (id) DO UPDATE
      SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = NOW()
    `;

    const definiteWords = [
      {
        hebrew: 'הַ',
        trans: 'ha',
        english: 'the (basic form)',
        type: 'Article',
        notes: 'Basic form before regular consonants',
        subcategory: 'Basic Form',
        extraData: {
          category: 'Definite Article',
          pronunciation: 'hah',
          grammarType: 'Article - Basic',
          explanation: 'The basic form הַ (patach + he) is used before most consonants.',
          examples: ['הַמֶּלֶךְ - the king', 'הַסֵּפֶר - the book']
        }
      },
      {
        hebrew: 'הָ',
        trans: 'ha',
        english: 'the (with ח, ע, unaccented ה)',
        type: 'Article',
        notes: 'Changes to qamatz before guttural consonants',
        subcategory: 'Before Gutturals',
        extraData: {
          category: 'Definite Article',
          pronunciation: 'hah',
          grammarType: 'Article - Guttural',
          explanation: 'Before ח, ע, or unaccented ה, the article becomes הָ (qamatz + he).',
          examples: ['הָאָדָם - the man', 'הֶעָפָר - the dust']
        }
      },
      {
        hebrew: 'הֶ',
        trans: 'he',
        english: 'the (with accented ח, ע)',
        type: 'Article',
        notes: 'Uses seghol before accented gutturals',
        subcategory: 'Before Accented Gutturals',
        extraData: {
          category: 'Definite Article',
          pronunciation: 'heh',
          grammarType: 'Article - Accented Guttural',
          explanation: 'Before accented ח or ע, the article becomes הֶ (seghol + he).',
          examples: ['הֶחָכָם - the wise one', 'הֶעָנָן - the cloud']
        }
      },
      {
        hebrew: 'שָׁמַיִם → הַשָּׁמַיִם',
        trans: 'shamayim → ha-shamayim',
        english: 'heavens → the heavens',
        type: 'Article',
        notes: 'Dagesh forte added to first consonant',
        subcategory: 'With Dagesh',
        extraData: {
          category: 'Definite Article',
          pronunciation: 'shah-MAH-yeem',
          grammarType: 'Article - With Doubling',
          explanation: 'The article often causes dagesh forte (doubling) in the first consonant of the noun.',
          examples: ['הַמֶּלֶךְ - the king (מ doubles)', 'הַסֵּפֶר - the book (ס doubles)']
        }
      }
    ];

    for (const word of definiteWords) {
      const wordId = `${definitePracticeId}-${word.trans}`;
      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english, type,
          notes, semantic_group, group_category, group_subcategory, card_type, extra_data
        )
        VALUES (
          ${wordId}, ${definitePracticeId}, ${word.hebrew}, ${word.trans}, ${word.english}, ${word.type},
          ${word.notes}, 'Grammar Patterns', 'Definite Article', ${word.subcategory}, 'grammar', ${JSON.stringify(word.extraData)}
        )
        ON CONFLICT (id) DO UPDATE
        SET hebrew = EXCLUDED.hebrew, transliteration = EXCLUDED.transliteration,
            english = EXCLUDED.english, updated_at = NOW()
      `;
      console.log(`  ✅ ${word.hebrew} - ${word.subcategory}`);
    }

    console.log(`\n✅ Created ${definiteWords.length} definite article cards\n`);

    // ===== WEEK 4: PREPOSITION FORMS =====
    console.log('📚 Creating Week 4: Preposition Practice...\n');

    const prepPracticeId = 'preposition-forms-practice';
    await sql`
      INSERT INTO vocab_sets (id, title, description, language_id, set_type, is_active)
      VALUES (
        ${prepPracticeId},
        'Preposition Forms (בְּ, לְ, כְּ)',
        'Practice how prepositions attach and change with different words',
        'hebrew',
        'lesson',
        false
      )
      ON CONFLICT (id) DO UPDATE
      SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = NOW()
    `;

    const prepWords = [
      {
        hebrew: 'בְּ',
        trans: 'be',
        english: 'in, with',
        type: 'Preposition',
        notes: 'Basic inseparable preposition',
        subcategory: 'Basic Forms',
        extraData: {
          category: 'Prepositions',
          pronunciation: 'beh',
          grammarType: 'Prep - Inseparable',
          explanation: 'The preposition בְּ (sheva + bet) attaches directly to the word.',
          examples: ['בְּרֵאשִׁית - in beginning', 'בַּיּוֹם - in the day']
        }
      },
      {
        hebrew: 'לְ',
        trans: 'le',
        english: 'to, for',
        type: 'Preposition',
        notes: 'Basic inseparable preposition',
        subcategory: 'Basic Forms',
        extraData: {
          category: 'Prepositions',
          pronunciation: 'leh',
          grammarType: 'Prep - Inseparable',
          explanation: 'The preposition לְ (sheva + lamed) attaches directly to the word.',
          examples: ['לְאֱלֹהִים - to God', 'לַיהוָה - to the LORD']
        }
      },
      {
        hebrew: 'כְּ',
        trans: 'ke',
        english: 'like, as',
        type: 'Preposition',
        notes: 'Basic inseparable preposition',
        subcategory: 'Basic Forms',
        extraData: {
          category: 'Prepositions',
          pronunciation: 'keh',
          grammarType: 'Prep - Inseparable',
          explanation: 'The preposition כְּ (sheva + kaph) attaches directly to the word.',
          examples: ['כְּצֶלֶם - like image', 'כִּדְמוּת - as likeness']
        }
      },
      {
        hebrew: 'בַּ',
        trans: 'ba',
        english: 'in the (בְּ + הַ)',
        type: 'Preposition',
        notes: 'Preposition + definite article combined',
        subcategory: 'With Article',
        extraData: {
          category: 'Prepositions',
          pronunciation: 'bah',
          grammarType: 'Prep + Article',
          explanation: 'When בְּ combines with the article הַ, it becomes בַּ (patach).',
          examples: ['בַּיּוֹם - in the day', 'בָּאָרֶץ - in the land']
        }
      },
      {
        hebrew: 'לַ',
        trans: 'la',
        english: 'to the (לְ + הַ)',
        type: 'Preposition',
        notes: 'Preposition + definite article combined',
        subcategory: 'With Article',
        extraData: {
          category: 'Prepositions',
          pronunciation: 'lah',
          grammarType: 'Prep + Article',
          explanation: 'When לְ combines with the article הַ, it becomes לַ (patach).',
          examples: ['לַיהוָה - to the LORD', 'לָאָרֶץ - to the land']
        }
      },
      {
        hebrew: 'כַּ',
        trans: 'ka',
        english: 'like the (כְּ + הַ)',
        type: 'Preposition',
        notes: 'Preposition + definite article combined',
        subcategory: 'With Article',
        extraData: {
          category: 'Prepositions',
          pronunciation: 'kah',
          grammarType: 'Prep + Article',
          explanation: 'When כְּ combines with the article הַ, it becomes כַּ (patach).',
          examples: ['כַּכּוֹכָבִים - like the stars', 'כָּאָדָם - like the man']
        }
      }
    ];

    for (const word of prepWords) {
      const wordId = `${prepPracticeId}-${word.trans}`;
      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english, type,
          notes, semantic_group, group_category, group_subcategory, card_type, extra_data
        )
        VALUES (
          ${wordId}, ${prepPracticeId}, ${word.hebrew}, ${word.trans}, ${word.english}, ${word.type},
          ${word.notes}, 'Grammar Patterns', 'Prepositions', ${word.subcategory}, 'grammar', ${JSON.stringify(word.extraData)}
        )
        ON CONFLICT (id) DO UPDATE
        SET hebrew = EXCLUDED.hebrew, transliteration = EXCLUDED.transliteration,
            english = EXCLUDED.english, updated_at = NOW()
      `;
      console.log(`  ✅ ${word.hebrew} - ${word.subcategory}`);
    }

    console.log(`\n✅ Created ${prepWords.length} preposition cards\n`);

    // ===== WEEK 6: ADJECTIVE AGREEMENT =====
    console.log('📚 Creating Week 6: Adjective Agreement Practice...\n');

    const adjPracticeId = 'adjective-agreement-practice';
    await sql`
      INSERT INTO vocab_sets (id, title, description, language_id, set_type, is_active)
      VALUES (
        ${adjPracticeId},
        'Adjective Agreement',
        'Practice how adjectives match nouns in gender and number',
        'hebrew',
        'lesson',
        false
      )
      ON CONFLICT (id) DO UPDATE
      SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = NOW()
    `;

    const adjWords = [
      {
        hebrew: 'טוֹב',
        trans: 'tov',
        english: 'good (masc. sing.)',
        type: 'Adjective',
        notes: 'Base masculine form',
        subcategory: 'Masculine Singular',
        extraData: {
          category: 'Adjective Agreement',
          pronunciation: 'TOHV',
          grammarType: 'Adj - Masc. Sing.',
          explanation: 'Masculine singular adjective - base form.',
          examples: ['מֶלֶךְ טוֹב - good king', 'יוֹם טוֹב - good day']
        }
      },
      {
        hebrew: 'טוֹבָה',
        trans: 'tovah',
        english: 'good (fem. sing.)',
        type: 'Adjective',
        notes: 'Adds ָה- ending for feminine',
        subcategory: 'Feminine Singular',
        extraData: {
          category: 'Adjective Agreement',
          pronunciation: 'toh-VAH',
          grammarType: 'Adj - Fem. Sing.',
          explanation: 'Feminine singular adjective - adds ָה- ending.',
          examples: ['מַלְכָּה טוֹבָה - good queen', 'אֶרֶץ טוֹבָה - good land']
        }
      },
      {
        hebrew: 'טוֹבִים',
        trans: 'tovim',
        english: 'good (masc. pl.)',
        type: 'Adjective',
        notes: 'Adds ִים- ending for masculine plural',
        subcategory: 'Masculine Plural',
        extraData: {
          category: 'Adjective Agreement',
          pronunciation: 'toh-VEEM',
          grammarType: 'Adj - Masc. Plur.',
          explanation: 'Masculine plural adjective - adds ִים- ending.',
          examples: ['מְלָכִים טוֹבִים - good kings', 'יָמִים טוֹבִים - good days']
        }
      },
      {
        hebrew: 'טוֹבוֹת',
        trans: 'tovot',
        english: 'good (fem. pl.)',
        type: 'Adjective',
        notes: 'Adds וֹת- ending for feminine plural',
        subcategory: 'Feminine Plural',
        extraData: {
          category: 'Adjective Agreement',
          pronunciation: 'toh-VOHT',
          grammarType: 'Adj - Fem. Plur.',
          explanation: 'Feminine plural adjective - adds וֹת- ending.',
          examples: ['מְלָכוֹת טוֹבוֹת - good queens', 'אֲרָצוֹת טוֹבוֹת - good lands']
        }
      },
      {
        hebrew: 'הַמֶּלֶךְ הַטּוֹב',
        trans: 'ha-melekh ha-tov',
        english: 'the good king',
        type: 'Phrase',
        notes: 'Both noun and adjective take the article',
        subcategory: 'With Article',
        extraData: {
          category: 'Adjective Agreement',
          pronunciation: 'hah-MEH-lekh hah-TOHV',
          grammarType: 'Adj - Definite',
          explanation: 'When the noun has the article, the adjective must also have it.',
          examples: ['הַמֶּלֶךְ הַטּוֹב - the good king', 'הָאֶרֶץ הַטּוֹבָה - the good land']
        }
      }
    ];

    for (const word of adjWords) {
      const wordId = `${adjPracticeId}-${word.trans}`;
      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english, type,
          notes, semantic_group, group_category, group_subcategory, card_type, extra_data
        )
        VALUES (
          ${wordId}, ${adjPracticeId}, ${word.hebrew}, ${word.trans}, ${word.english}, ${word.type},
          ${word.notes}, 'Grammar Patterns', 'Adjective Agreement', ${word.subcategory}, 'grammar', ${JSON.stringify(word.extraData)}
        )
        ON CONFLICT (id) DO UPDATE
        SET hebrew = EXCLUDED.hebrew, transliteration = EXCLUDED.transliteration,
            english = EXCLUDED.english, updated_at = NOW()
      `;
      console.log(`  ✅ ${word.hebrew} - ${word.subcategory}`);
    }

    console.log(`\n✅ Created ${adjWords.length} adjective agreement cards\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Grammar flashcard sets created successfully!\n');
    console.log('Summary:');
    console.log(`  📖 Definite Article Practice: ${definiteWords.length} cards`);
    console.log(`  🔗 Preposition Forms: ${prepWords.length} cards`);
    console.log(`  🎨 Adjective Agreement: ${adjWords.length} cards`);
    console.log(`  📊 Total: ${definiteWords.length + prepWords.length + adjWords.length} cards\n`);
    console.log('These sets have set_type="lesson" and won\'t clutter the main vocab library.');
    console.log('They can be used in lesson VocabularyStep components for focused practice.\n');

  } catch (error) {
    console.error('❌ Error seeding grammar flashcards:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

seedGrammarFlashcards()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
