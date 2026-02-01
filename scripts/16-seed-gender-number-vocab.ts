/**
 * Seed Gender & Number Practice Vocabulary
 *
 * Creates a small, focused vocabulary set for Week 5 lesson
 * Focuses on practicing masculine/feminine and singular/plural/dual forms
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedGenderNumberVocab() {
  console.log('🚀 Seeding Gender & Number practice vocabulary...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // Create the vocabulary set
    console.log('📦 Creating vocab set: gender-number-practice...');

    const vocabSetId = 'gender-number-practice';
    const title = 'Gender & Number Practice';
    const description = 'Practice identifying masculine/feminine and singular/plural/dual forms';
    const languageId = 'hebrew';

    await sql`
      INSERT INTO vocab_sets (id, title, description, language_id, set_type, is_active)
      VALUES (${vocabSetId}, ${title}, ${description}, ${languageId}, 'lesson', false)
      ON CONFLICT (id) DO UPDATE
      SET title = EXCLUDED.title,
          description = EXCLUDED.description,
          updated_at = NOW()
    `;
    console.log('✅ Vocab set created\n');

    // Define the vocabulary words
    const words = [
      // Masculine Singular → Plural
      {
        hebrew: 'מֶלֶךְ',
        trans: 'melekh',
        english: 'king',
        type: 'Noun',
        notes: 'Masculine singular - no special ending',
        semanticGroup: 'People & Beings',
        category: 'Nouns',
        subcategory: 'Masculine Singular',
        cardType: 'grammar',
        extraData: {
          category: 'Masculine Singular',
          pronunciation: 'MEH-lekh',
          grammarType: 'Noun - Masc. Sing.',
          explanation: 'Base form with no ending. This is the dictionary form for masculine nouns.',
          examples: ['הַמֶּלֶךְ - the king', 'מֶלֶךְ יִשְׂרָאֵל - king of Israel']
        }
      },
      {
        hebrew: 'מְלָכִים',
        trans: 'melakhim',
        english: 'kings',
        type: 'Noun',
        notes: 'Masculine plural - ends in ִים-',
        semanticGroup: 'People & Beings',
        category: 'Nouns',
        subcategory: 'Masculine Plural',
        cardType: 'grammar',
        extraData: {
          category: 'Masculine Plural',
          pronunciation: 'meh-lah-KHEEM',
          grammarType: 'Noun - Masc. Plur.',
          explanation: 'Masculine plural ending ִים- (hiriq-yod-mem). The most common plural pattern.',
          examples: ['הַמְּלָכִים - the kings', 'מַלְכֵי יִשְׂרָאֵל - kings of Israel']
        }
      },
      // Feminine Singular → Plural
      {
        hebrew: 'מַלְכָּה',
        trans: 'malkah',
        english: 'queen',
        type: 'Noun',
        notes: 'Feminine singular - ends in ָה-',
        semanticGroup: 'People & Beings',
        category: 'Nouns',
        subcategory: 'Feminine Singular',
        cardType: 'grammar',
        extraData: {
          category: 'Feminine Singular',
          pronunciation: 'mal-KAH',
          grammarType: 'Noun - Fem. Sing.',
          explanation: 'Feminine singular ending ָה- (qamatz-he). The typical feminine marker.',
          examples: ['הַמַּלְכָּה - the queen', 'מַלְכַּת שְׁבָא - queen of Sheba']
        }
      },
      {
        hebrew: 'מְלָכוֹת',
        trans: 'melakhot',
        english: 'queens',
        type: 'Noun',
        notes: 'Feminine plural - ends in וֹת-',
        semanticGroup: 'People & Beings',
        category: 'Nouns',
        subcategory: 'Feminine Plural',
        cardType: 'grammar',
        extraData: {
          category: 'Feminine Plural',
          pronunciation: 'meh-lah-KHOT',
          grammarType: 'Noun - Fem. Plur.',
          explanation: 'Feminine plural ending וֹת- (holem-vav-tav). ALWAYS indicates feminine plural.',
          examples: ['הַמְּלָכוֹת - the queens', 'מַלְכוֹת הָאָרֶץ - queens of the land']
        }
      },
      // Dual Number
      {
        hebrew: 'יָד',
        trans: 'yad',
        english: 'hand',
        type: 'Noun',
        notes: 'Singular form for dual example',
        semanticGroup: 'Body Parts',
        category: 'Nouns',
        subcategory: 'Singular (Dual Base)',
        cardType: 'grammar',
        extraData: {
          category: 'Singular',
          pronunciation: 'YAHD',
          grammarType: 'Noun - Fem. Sing.',
          explanation: 'Feminine noun for hand. Becomes dual when referring to both hands.',
          examples: ['יַד יְהוָה - hand of the LORD', 'בְּיָדוֹ - in his hand']
        }
      },
      {
        hebrew: 'יָדַיִם',
        trans: 'yadayim',
        english: 'two hands, both hands',
        type: 'Noun',
        notes: 'Dual form - ends in ַיִם-',
        semanticGroup: 'Body Parts',
        category: 'Nouns',
        subcategory: 'Dual Number',
        cardType: 'grammar',
        extraData: {
          category: 'Dual Number',
          pronunciation: 'yah-DAH-yeem',
          grammarType: 'Noun - Dual',
          explanation: 'Dual ending ַיִם- (patach-yod-mem). Used for exactly TWO, especially paired body parts.',
          examples: ['שְׁתֵּי יָדַיִם - two hands', 'בְּיָדַיִם - with both hands']
        }
      },
      // Irregular Feminine Examples
      {
        hebrew: 'אֶרֶץ',
        trans: 'eretz',
        english: 'earth, land',
        type: 'Noun',
        notes: 'Feminine singular but NO ָה- ending (irregular!)',
        semanticGroup: 'Nature & Elements',
        category: 'Nouns',
        subcategory: 'Irregular Feminine',
        cardType: 'grammar',
        extraData: {
          category: 'Irregular Feminine',
          pronunciation: 'EH-retz',
          grammarType: 'Noun - Fem. Sing. (Irregular)',
          explanation: 'Feminine but lacks the typical ָה- ending. One of several common irregular feminine nouns.',
          examples: ['הָאָרֶץ - the earth', 'אֶרֶץ כְּנַעַן - land of Canaan']
        }
      },
      {
        hebrew: 'עִיר',
        trans: 'ir',
        english: 'city',
        type: 'Noun',
        notes: 'Feminine singular but NO ָה- ending (irregular!)',
        semanticGroup: 'Places & Locations',
        category: 'Nouns',
        subcategory: 'Irregular Feminine',
        cardType: 'grammar',
        extraData: {
          category: 'Irregular Feminine',
          pronunciation: 'EER',
          grammarType: 'Noun - Fem. Sing. (Irregular)',
          explanation: 'Feminine without the ָה- ending. Must be memorized as irregular.',
          examples: ['הָעִיר - the city', 'עִיר גְּדוֹלָה - great city']
        }
      }
    ];

    console.log(`📝 Inserting ${words.length} vocabulary words...\n`);

    for (const word of words) {
      const wordId = `${vocabSetId}-${word.trans}`;

      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english, type,
          notes, semantic_group, group_category, group_subcategory, card_type, extra_data
        )
        VALUES (
          ${wordId},
          ${vocabSetId},
          ${word.hebrew},
          ${word.trans},
          ${word.english},
          ${word.type},
          ${word.notes},
          ${word.semanticGroup},
          ${word.category},
          ${word.subcategory},
          ${word.cardType},
          ${JSON.stringify(word.extraData)}
        )
        ON CONFLICT (id) DO UPDATE
        SET hebrew = EXCLUDED.hebrew,
            transliteration = EXCLUDED.transliteration,
            english = EXCLUDED.english,
            type = EXCLUDED.type,
            notes = EXCLUDED.notes,
            semantic_group = EXCLUDED.semantic_group,
            group_category = EXCLUDED.group_category,
            group_subcategory = EXCLUDED.group_subcategory,
            card_type = EXCLUDED.card_type,
            extra_data = EXCLUDED.extra_data,
            updated_at = NOW()
      `;

      console.log(`  ✅ ${word.hebrew} (${word.english}) - ${word.subcategory}`);
    }

    console.log('\n✨ Gender & Number vocabulary set created successfully!\n');
    console.log('Summary:');
    console.log(`  - Set ID: ${vocabSetId}`);
    console.log(`  - Total words: ${words.length}`);
    console.log('  - Categories:');
    console.log('    • Masculine Singular (1 word)');
    console.log('    • Masculine Plural (1 word)');
    console.log('    • Feminine Singular (1 word)');
    console.log('    • Feminine Plural (1 word)');
    console.log('    • Dual Number (2 words)');
    console.log('    • Irregular Feminine (2 words)');
    console.log('\nThis set is now ready to use in Week 5 lesson!\n');

  } catch (error) {
    console.error('❌ Error seeding gender & number vocabulary:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

seedGenderNumberVocab()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
