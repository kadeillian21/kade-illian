/**
 * Seed Week 6 Vocabulary Sets
 *
 * Creates 3 vocabulary sets from the Week 6 flashcard HTML:
 * 1. Adjectives (30 cards - 15 pairs with m/f forms)
 * 2. Demonstratives (7 cards)
 * 3. Numbers 1-10 (20 cards - with both gender forms)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedWeek6Vocab() {
  console.log('🚀 Seeding Week 6 Vocabulary Sets...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // SET 1: ADJECTIVES (30 cards - 15 pairs)
    console.log('📦 Creating Set 1: Adjectives (30 cards)');

    const adjectiveWords = [
      { hebrew: 'טוֹב', trans: 'tov', english: 'good', pronunciation: 'TOHV', notes: 'Most common adjective in Hebrew Bible', gender: 'm' },
      { hebrew: 'טוֹבָה', trans: 'tovah', english: 'good', pronunciation: 'toh-VAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'רַע', trans: 'ra', english: 'bad, evil', pronunciation: 'RAH', notes: 'Opposite of טוֹב', gender: 'm' },
      { hebrew: 'רָעָה', trans: 'raah', english: 'bad, evil', pronunciation: 'rah-AH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'גָּדוֹל', trans: 'gadol', english: 'great, big', pronunciation: 'gah-DOHL', notes: 'Very common', gender: 'm' },
      { hebrew: 'גְּדוֹלָה', trans: 'gedolah', english: 'great, big', pronunciation: 'ge-doh-LAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'קָטֹן', trans: 'qaton', english: 'small', pronunciation: 'kah-TOHN', notes: 'Opposite of גָּדוֹל', gender: 'm' },
      { hebrew: 'קְטַנָּה', trans: 'qetanah', english: 'small', pronunciation: 'ke-tah-NAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'חָדָשׁ', trans: 'chadash', english: 'new', pronunciation: 'khah-DAHSH', notes: '', gender: 'm' },
      { hebrew: 'חֲדָשָׁה', trans: 'chadashah', english: 'new', pronunciation: 'khah-dah-SHAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'יָשָׁן', trans: 'yashan', english: 'old', pronunciation: 'yah-SHAHN', notes: 'Opposite of חָדָשׁ', gender: 'm' },
      { hebrew: 'יְשָׁנָה', trans: 'yeshanah', english: 'old', pronunciation: 'ye-shah-NAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'קָדוֹשׁ', trans: 'qadosh', english: 'holy', pronunciation: 'kah-DOHSH', notes: 'Very important theological term', gender: 'm' },
      { hebrew: 'קְדוֹשָׁה', trans: 'qedoshah', english: 'holy', pronunciation: 'ke-doh-SHAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'צַדִּיק', trans: 'tsadiq', english: 'righteous', pronunciation: 'tsah-DEEK', notes: 'Root: צ-ד-ק (righteousness)', gender: 'm' },
      { hebrew: 'צְדִיקָה', trans: 'tsediqah', english: 'righteous', pronunciation: 'tse-dee-KAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'רָחוֹק', trans: 'rachoq', english: 'far', pronunciation: 'rah-KHOHK', notes: '', gender: 'm' },
      { hebrew: 'רְחוֹקָה', trans: 'rechoqah', english: 'far', pronunciation: 're-khoh-KAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'קָרוֹב', trans: 'qarov', english: 'near', pronunciation: 'kah-ROHV', notes: 'Opposite of רָחוֹק', gender: 'm' },
      { hebrew: 'קְרוֹבָה', trans: 'qerovah', english: 'near', pronunciation: 'ke-roh-VAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'חַי', trans: 'chai', english: 'living, alive', pronunciation: 'KHAY', notes: 'Root: ח-י-ה (to live)', gender: 'm' },
      { hebrew: 'חַיָּה', trans: 'chayah', english: 'living, alive', pronunciation: 'khah-YAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'מֵת', trans: 'met', english: 'dead', pronunciation: 'MAYT', notes: 'Opposite of חַי', gender: 'm' },
      { hebrew: 'מֵתָה', trans: 'metah', english: 'dead', pronunciation: 'may-TAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'רַב', trans: 'rav', english: 'many, much', pronunciation: 'RAHV', notes: 'Also means "great" in some contexts', gender: 'm' },
      { hebrew: 'רַבָּה', trans: 'rabah', english: 'many, much', pronunciation: 'rah-BAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'עָשִׁיר', trans: 'ashir', english: 'rich', pronunciation: 'ah-SHEER', notes: '', gender: 'm' },
      { hebrew: 'עֲשִׁירָה', trans: 'ashirah', english: 'rich', pronunciation: 'ah-shee-RAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'עָנִי', trans: 'ani', english: 'poor', pronunciation: 'ah-NEE', notes: 'Opposite of עָשִׁיר', gender: 'm' },
      { hebrew: 'עֲנִיָּה', trans: 'aniyah', english: 'poor', pronunciation: 'ah-nee-YAH', notes: 'Feminine form', gender: 'f' },
    ];

    const adjSet = await sql`
      INSERT INTO vocab_sets (id, title, description, total_words, set_type, language_id)
      VALUES (
        'week-6-adjectives',
        'Week 6: Adjectives',
        'Common adjectives with masculine and feminine forms. Learn agreement patterns for describing nouns.',
        30,
        'vocabulary',
        'hebrew'
      )
      ON CONFLICT (id) DO UPDATE SET
        updated_at = NOW()
      RETURNING id
    `;

    for (const word of adjectiveWords) {
      const wordId = `week-6-adjectives-${word.trans}`;
      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english,
          type, notes, semantic_group, group_category, group_subcategory,
          card_type, extra_data
        )
        VALUES (
          ${wordId},
          'week-6-adjectives',
          ${word.hebrew},
          ${word.trans},
          ${word.english},
          'Adjective',
          ${word.notes},
          'Descriptive Words',
          'Adjectives',
          ${word.gender === 'm' ? 'Masculine' : 'Feminine'},
          'vocabulary',
          ${JSON.stringify({ pronunciation: word.pronunciation, gender: word.gender })}
        )
      `;
    }
    console.log('  ✅ Created week-6-adjectives (30 cards)\n');

    // SET 2: DEMONSTRATIVES (7 cards)
    console.log('📦 Creating Set 2: Demonstratives (7 cards)');

    const demonstrativeWords = [
      { hebrew: 'זֶה', trans: 'zeh', english: 'this', pronunciation: 'ZEH', notes: 'Masculine singular', gender: 'm' },
      { hebrew: 'זֹאת', trans: 'zot', english: 'this', pronunciation: 'ZOHT', notes: 'Feminine singular', gender: 'f' },
      { hebrew: 'אֵלֶּה', trans: 'eleh', english: 'these', pronunciation: 'AY-leh', notes: 'Plural (both genders)', gender: 'pl' },
      { hebrew: 'הוּא', trans: 'hu', english: 'that, he', pronunciation: 'HOO', notes: 'Masculine singular (also pronoun "he")', gender: 'm' },
      { hebrew: 'הִיא', trans: 'hi', english: 'that, she', pronunciation: 'HEE', notes: 'Feminine singular (also pronoun "she")', gender: 'f' },
      { hebrew: 'הֵם', trans: 'hem', english: 'those, they', pronunciation: 'HAYM', notes: 'Masculine plural (also pronoun "they")', gender: 'm-pl' },
      { hebrew: 'הֵן', trans: 'hen', english: 'those, they', pronunciation: 'HAYN', notes: 'Feminine plural (also pronoun "they")', gender: 'f-pl' },
    ];

    await sql`
      INSERT INTO vocab_sets (id, title, description, total_words, set_type, language_id)
      VALUES (
        'week-6-demonstratives',
        'Week 6: Demonstratives',
        'Demonstrative pronouns (this, that, these, those). Essential for pointing out specific things in Hebrew.',
        7,
        'vocabulary',
        'hebrew'
      )
      ON CONFLICT (id) DO UPDATE SET
        updated_at = NOW()
    `;

    for (const word of demonstrativeWords) {
      const wordId = `week-6-demonstratives-${word.trans}`;
      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english,
          type, notes, semantic_group, group_category, group_subcategory,
          card_type, extra_data
        )
        VALUES (
          ${wordId},
          'week-6-demonstratives',
          ${word.hebrew},
          ${word.trans},
          ${word.english},
          'Demonstrative',
          ${word.notes},
          'Pointers',
          'Demonstratives',
          ${word.gender === 'pl' ? 'Plural' : word.gender === 'm' || word.gender === 'm-pl' ? 'Masculine' : 'Feminine'},
          'vocabulary',
          ${JSON.stringify({ pronunciation: word.pronunciation, gender: word.gender })}
        )
      `;
    }
    console.log('  ✅ Created week-6-demonstratives (7 cards)\n');

    // SET 3: NUMBERS 1-10 (20 cards)
    console.log('📦 Creating Set 3: Numbers 1-10 (20 cards)');

    const numberWords = [
      { hebrew: 'אֶחָד', trans: 'echad', english: '1 (one)', pronunciation: 'eh-KHAHD', notes: 'Masculine form (used with feminine nouns!)', gender: 'm' },
      { hebrew: 'אַחַת', trans: 'achat', english: '1 (one)', pronunciation: 'ah-KHAT', notes: 'Feminine form (used with masculine nouns!)', gender: 'f' },

      { hebrew: 'שְׁנַיִם', trans: 'shenayim', english: '2 (two)', pronunciation: 'she-NAH-yeem', notes: 'Masculine form (dual ending)', gender: 'm' },
      { hebrew: 'שְׁתַּיִם', trans: 'shtayim', english: '2 (two)', pronunciation: 'shta-YEEM', notes: 'Feminine form (dual ending)', gender: 'f' },

      { hebrew: 'שְׁלֹשָׁה', trans: 'sheloshah', english: '3 (three)', pronunciation: 'she-loh-SHAH', notes: 'Masculine form (ends in ה-)', gender: 'm' },
      { hebrew: 'שָׁלוֹשׁ', trans: 'shalosh', english: '3 (three)', pronunciation: 'shah-LOHSH', notes: 'Feminine form (no ה-)', gender: 'f' },

      { hebrew: 'אַרְבָּעָה', trans: 'arbaah', english: '4 (four)', pronunciation: 'ar-bah-AH', notes: 'Masculine form', gender: 'm' },
      { hebrew: 'אַרְבַּע', trans: 'arba', english: '4 (four)', pronunciation: 'ar-BAH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'חֲמִשָּׁה', trans: 'chamisshah', english: '5 (five)', pronunciation: 'khah-mee-SHAH', notes: 'Masculine form', gender: 'm' },
      { hebrew: 'חָמֵשׁ', trans: 'chamesh', english: '5 (five)', pronunciation: 'khah-MAYSH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'שִׁשָּׁה', trans: 'shishah', english: '6 (six)', pronunciation: 'shee-SHAH', notes: 'Masculine form', gender: 'm' },
      { hebrew: 'שֵׁשׁ', trans: 'shesh', english: '6 (six)', pronunciation: 'SHAYSH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'שִׁבְעָה', trans: 'shivah', english: '7 (seven)', pronunciation: 'sheev-AH', notes: 'Masculine form', gender: 'm' },
      { hebrew: 'שֶׁבַע', trans: 'sheva', english: '7 (seven)', pronunciation: 'SHEH-vah', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'שְׁמֹנָה', trans: 'shemonah', english: '8 (eight)', pronunciation: 'she-moh-NAH', notes: 'Masculine form', gender: 'm' },
      { hebrew: 'שְׁמֹנֶה', trans: 'shemoneh', english: '8 (eight)', pronunciation: 'she-moh-NEH', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'תִּשְׁעָה', trans: 'tishah', english: '9 (nine)', pronunciation: 'teesh-AH', notes: 'Masculine form', gender: 'm' },
      { hebrew: 'תֵּשַׁע', trans: 'tesha', english: '9 (nine)', pronunciation: 'TAY-shah', notes: 'Feminine form', gender: 'f' },

      { hebrew: 'עֲשָׂרָה', trans: 'asarah', english: '10 (ten)', pronunciation: 'ah-sah-RAH', notes: 'Masculine form', gender: 'm' },
      { hebrew: 'עֶשֶׂר', trans: 'eser', english: '10 (ten)', pronunciation: 'EH-ser', notes: 'Feminine form', gender: 'f' },
    ];

    await sql`
      INSERT INTO vocab_sets (id, title, description, total_words, set_type, language_id)
      VALUES (
        'week-6-numbers',
        'Week 6: Numbers 1-10',
        'Hebrew numbers with both masculine and feminine forms. Learn the unique "opposite gender" agreement pattern.',
        20,
        'vocabulary',
        'hebrew'
      )
      ON CONFLICT (id) DO UPDATE SET
        updated_at = NOW()
    `;

    for (const word of numberWords) {
      const wordId = `week-6-numbers-${word.trans}`;
      await sql`
        INSERT INTO vocab_words (
          id, set_id, hebrew, transliteration, english,
          type, notes, semantic_group, group_category, group_subcategory,
          card_type, extra_data
        )
        VALUES (
          ${wordId},
          'week-6-numbers',
          ${word.hebrew},
          ${word.trans},
          ${word.english},
          'Number',
          ${word.notes},
          'Quantity',
          'Numbers',
          ${word.gender === 'm' ? 'Masculine' : 'Feminine'},
          'vocabulary',
          ${JSON.stringify({ pronunciation: word.pronunciation, gender: word.gender })}
        )
      `;
    }
    console.log('  ✅ Created week-6-numbers (20 cards)\n');

    console.log('✅ Successfully created all 3 Week 6 vocabulary sets!');
    console.log('\n📊 Summary:');
    console.log('  - week-6-adjectives: 30 cards (15 adjective pairs)');
    console.log('  - week-6-demonstratives: 7 cards');
    console.log('  - week-6-numbers: 20 cards (numbers 1-10 with both genders)');
    console.log('  - TOTAL: 57 cards for Week 6');
    console.log('\n🔗 Next step: Link these sets to the Week 6 lesson');

  } catch (error) {
    console.error('❌ Error seeding Week 6 vocab:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seedWeek6Vocab()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
