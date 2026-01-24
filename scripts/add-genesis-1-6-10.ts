/**
 * Add Genesis 1:6-10 Vocabulary (Week 5) to Database
 *
 * Adds 30 new words focusing on noun gender & number
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import postgres from 'postgres';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const vocabData = {
  setId: 'genesis-1-6-10',
  title: 'Genesis 1:6-10',
  description: 'Week 5: Noun Gender & Number • Creation Days 2-3 (Firmament, Waters, Land)',
  words: [
    {
      hebrew: 'תּוֹךְ',
      trans: 'tokh',
      english: 'midst, middle',
      type: 'Noun',
      notes: 'Often used with בְּ (in the midst of)',
      category: 'Nouns',
      subcategory: 'Abstract Concepts',
      semanticGroup: 'Abstract Concepts'
    },
    {
      hebrew: 'בָּדַל',
      trans: 'badal',
      english: 'he separated, divided',
      type: 'Verb',
      notes: 'Hiphil: cause to divide',
      category: 'Verbs',
      subcategory: 'Action & Doing',
      semanticGroup: 'Action & Doing'
    },
    {
      hebrew: 'מִן',
      trans: 'min',
      english: 'from, out of',
      type: 'Preposition',
      notes: 'Very common preposition, often מֵ before definite article',
      category: 'Prepositions',
      subcategory: 'Spatial Relations',
      semanticGroup: 'Spatial Relations'
    },
    {
      hebrew: 'עֵשֶׂב',
      trans: 'esev',
      english: 'grass, herb, vegetation',
      type: 'Noun',
      notes: 'Collective noun for plant life. Masculine.',
      category: 'Nouns',
      subcategory: 'Nature & Elements',
      semanticGroup: 'Nature & Elements'
    },
    {
      hebrew: 'זֶרַע',
      trans: 'zera',
      english: 'seed, offspring',
      type: 'Noun',
      notes: 'Can mean literal seed or descendants. Masculine.',
      category: 'Nouns',
      subcategory: 'Nature & Elements',
      semanticGroup: 'Nature & Elements'
    },
    {
      hebrew: 'מִין',
      trans: 'min',
      english: 'kind, species',
      type: 'Noun',
      notes: 'After its kind (לְמִינוֹ). Masculine.',
      category: 'Nouns',
      subcategory: 'Abstract Concepts',
      semanticGroup: 'Abstract Concepts'
    },
    {
      hebrew: 'עֵץ',
      trans: 'ets',
      english: 'tree, wood',
      type: 'Noun',
      notes: 'Segholate noun. Masculine.',
      category: 'Nouns',
      subcategory: 'Nature & Elements',
      semanticGroup: 'Nature & Elements'
    },
    {
      hebrew: 'פְּרִי',
      trans: 'peri',
      english: 'fruit',
      type: 'Noun',
      notes: 'Common in agricultural contexts. Masculine.',
      category: 'Nouns',
      subcategory: 'Nature & Elements',
      semanticGroup: 'Nature & Elements'
    },
    {
      hebrew: 'דֶּשֶׁא',
      trans: 'deshe',
      english: 'green plants, vegetation',
      type: 'Noun',
      notes: 'Collective term similar to עֵשֶׂב. Masculine.',
      category: 'Nouns',
      subcategory: 'Nature & Elements',
      semanticGroup: 'Nature & Elements'
    },
    {
      hebrew: 'יָבָשָׁה',
      trans: 'yabashah',
      english: 'dry land, dry ground',
      type: 'Noun',
      notes: 'Feminine noun with ה- ending',
      category: 'Nouns',
      subcategory: 'Nature & Elements',
      semanticGroup: 'Nature & Elements'
    },
    {
      hebrew: 'יָם',
      trans: 'yam',
      english: 'sea',
      type: 'Noun',
      notes: 'Singular form. Masculine.',
      category: 'Nouns',
      subcategory: 'Nature & Elements',
      semanticGroup: 'Nature & Elements'
    },
    {
      hebrew: 'מִקְוֶה',
      trans: 'miqveh',
      english: 'gathering, collection (of water)',
      type: 'Noun',
      notes: 'From קָוָה (to gather, collect). Masculine.',
      category: 'Nouns',
      subcategory: 'Abstract Concepts',
      semanticGroup: 'Abstract Concepts'
    },
    {
      hebrew: 'הוֹצִיא',
      trans: 'hotsi',
      english: 'he brought forth',
      type: 'Verb',
      notes: 'Hiphil of יָצָא - causative: cause to go out',
      category: 'Verbs',
      subcategory: 'Movement & Motion',
      semanticGroup: 'Movement & Motion'
    },
    {
      hebrew: 'תַּדְשֵׁא',
      trans: 'tadshe',
      english: 'let it sprout',
      type: 'Verb',
      notes: 'Hiphil jussive: cause grass to sprout',
      category: 'Verbs',
      subcategory: 'Creation & Making',
      semanticGroup: 'Creation & Making'
    },
    {
      hebrew: 'מַזְרִיעַ',
      trans: 'mazria',
      english: 'yielding, bearing (seed)',
      type: 'Participle',
      notes: 'Hiphil participle - active yielding. Masculine.',
      category: 'Participles',
      subcategory: 'Creation & Making',
      semanticGroup: 'Creation & Making'
    },
    {
      hebrew: 'קָוָה',
      trans: 'qavah',
      english: 'he gathered, collected',
      type: 'Verb',
      notes: 'Root of מִקְוֶה',
      category: 'Verbs',
      subcategory: 'Action & Doing',
      semanticGroup: 'Action & Doing'
    },
    {
      hebrew: 'מָקוֹם',
      trans: 'maqom',
      english: 'place',
      type: 'Noun',
      notes: 'Very common word, from קוּם (arise). Masculine.',
      category: 'Nouns',
      subcategory: 'Places & Locations',
      semanticGroup: 'Places & Locations'
    },
    {
      hebrew: 'אַחַת',
      trans: 'achat',
      english: 'one (feminine)',
      type: 'Number',
      notes: 'Feminine form of אֶחָד',
      category: 'Numbers',
      subcategory: 'Quantity & Number',
      semanticGroup: 'Quantity & Number'
    },
    {
      hebrew: 'שְׁלִישִׁי',
      trans: 'shelishi',
      english: 'third',
      type: 'Number',
      notes: 'Ordinal number (masculine)',
      category: 'Numbers',
      subcategory: 'Quantity & Number',
      semanticGroup: 'Quantity & Number'
    },
    {
      hebrew: 'רְבִיעִי',
      trans: 'revii',
      english: 'fourth',
      type: 'Number',
      notes: 'Ordinal number (masculine)',
      category: 'Numbers',
      subcategory: 'Quantity & Number',
      semanticGroup: 'Quantity & Number'
    },
    {
      hebrew: 'חֲמִישִׁי',
      trans: 'chamishi',
      english: 'fifth',
      type: 'Number',
      notes: 'Ordinal number (masculine)',
      category: 'Numbers',
      subcategory: 'Quantity & Number',
      semanticGroup: 'Quantity & Number'
    },
    {
      hebrew: 'שִׁשִּׁי',
      trans: 'shishi',
      english: 'sixth',
      type: 'Number',
      notes: 'Ordinal number (masculine)',
      category: 'Numbers',
      subcategory: 'Quantity & Number',
      semanticGroup: 'Quantity & Number'
    },
    {
      hebrew: 'מְאֹרֹת',
      trans: 'meorot',
      english: 'lights, luminaries',
      type: 'Noun',
      notes: 'Plural of מָאוֹר - notice feminine plural ending וֹת-',
      category: 'Nouns',
      subcategory: 'Nature & Elements',
      semanticGroup: 'Nature & Elements'
    },
    {
      hebrew: 'מָאוֹר',
      trans: 'maor',
      english: 'light, luminary',
      type: 'Noun',
      notes: 'Singular form. Masculine.',
      category: 'Nouns',
      subcategory: 'Nature & Elements',
      semanticGroup: 'Nature & Elements'
    },
    {
      hebrew: 'אוֹת',
      trans: 'ot',
      english: 'sign',
      type: 'Noun',
      notes: 'Used for signs/markers. Feminine.',
      category: 'Nouns',
      subcategory: 'Abstract Concepts',
      semanticGroup: 'Abstract Concepts'
    },
    {
      hebrew: 'מוֹעֵד',
      trans: 'moed',
      english: 'appointed time, season, festival',
      type: 'Noun',
      notes: 'From יָעַד (to appoint). Masculine.',
      category: 'Nouns',
      subcategory: 'Time & Periods',
      semanticGroup: 'Time & Periods'
    },
    {
      hebrew: 'שָׁנָה',
      trans: 'shanah',
      english: 'year',
      type: 'Noun',
      notes: 'Feminine noun',
      category: 'Nouns',
      subcategory: 'Time & Periods',
      semanticGroup: 'Time & Periods'
    },
    {
      hebrew: 'מֶמְשֶׁלֶת',
      trans: 'memsheleth',
      english: 'dominion, rule',
      type: 'Noun',
      notes: 'Feminine noun with ת- ending',
      category: 'Nouns',
      subcategory: 'Abstract Concepts',
      semanticGroup: 'Abstract Concepts'
    },
    {
      hebrew: 'כּוֹכָב',
      trans: 'kokhav',
      english: 'star',
      type: 'Noun',
      notes: 'Singular form. Masculine.',
      category: 'Nouns',
      subcategory: 'Nature & Elements',
      semanticGroup: 'Nature & Elements'
    },
    {
      hebrew: 'כּוֹכָבִים',
      trans: 'kokhavim',
      english: 'stars',
      type: 'Noun',
      notes: 'Plural - notice masculine plural ending ים-',
      category: 'Nouns',
      subcategory: 'Nature & Elements',
      semanticGroup: 'Nature & Elements'
    }
  ]
};

async function addVocab() {
  console.log('🚀 Adding Genesis 1:6-10 vocabulary to database...\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('❌ Database connection string not found');
    process.exit(1);
  }

  const sql = postgres(connectionString);

  try {
    // 1. Insert vocab set metadata
    console.log('📦 Creating vocab set:', vocabData.title);
    await sql`
      INSERT INTO vocab_sets (id, title, description, total_words, is_active)
      VALUES (
        ${vocabData.setId},
        ${vocabData.title},
        ${vocabData.description},
        ${vocabData.words.length},
        false
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        total_words = EXCLUDED.total_words,
        updated_at = NOW()
    `;
    console.log('✅ Vocab set created\n');

    // 2. Group words by category for display
    const wordsByCategory = vocabData.words.reduce((acc, word) => {
      const key = word.subcategory || word.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(word);
      return acc;
    }, {} as Record<string, typeof vocabData.words>);

    // 3. Insert all words
    console.log(`📝 Inserting ${vocabData.words.length} words...\n`);
    let insertedCount = 0;

    for (const [groupName, words] of Object.entries(wordsByCategory)) {
      console.log(`  → ${groupName} (${words.length} words)`);

      for (const word of words) {
        // Generate word ID: setId-transliteration
        const wordId = `${vocabData.setId}-${word.trans.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

        await sql`
          INSERT INTO vocab_words (
            id,
            hebrew,
            transliteration,
            english,
            type,
            notes,
            semantic_group,
            frequency,
            set_id,
            group_category,
            group_subcategory
          ) VALUES (
            ${wordId},
            ${word.hebrew},
            ${word.trans},
            ${word.english},
            ${word.type},
            ${word.notes || ''},
            ${word.semanticGroup},
            ${null},
            ${vocabData.setId},
            ${word.category},
            ${word.subcategory || null}
          )
          ON CONFLICT (id) DO UPDATE SET
            hebrew = EXCLUDED.hebrew,
            transliteration = EXCLUDED.transliteration,
            english = EXCLUDED.english,
            type = EXCLUDED.type,
            notes = EXCLUDED.notes,
            semantic_group = EXCLUDED.semantic_group,
            set_id = EXCLUDED.set_id,
            group_category = EXCLUDED.group_category,
            group_subcategory = EXCLUDED.group_subcategory,
            updated_at = NOW()
        `;
        insertedCount++;
      }
    }

    console.log(`\n✅ Successfully added ${insertedCount} words!\n`);

    // 4. Verify addition
    const result = await sql`
      SELECT COUNT(*) as count FROM vocab_words WHERE set_id = ${vocabData.setId}
    `;
    const count = result[0].count;

    console.log('🔍 Verification:');
    console.log(`   Database has ${count} words for ${vocabData.title}`);

    if (Number(count) === vocabData.words.length) {
      console.log('   ✅ Word count matches!\n');
    } else {
      console.log(`   ⚠️  Word count mismatch! Expected ${vocabData.words.length}, got ${count}\n`);
    }

    // 5. Show summary by category
    console.log('📊 Vocabulary breakdown:');
    for (const [groupName, words] of Object.entries(wordsByCategory)) {
      console.log(`   • ${groupName}: ${words.length} words`);
    }

    console.log('\n🎉 Vocabulary addition complete!\n');
    console.log('Next: Visit /hebrew/vocabulary to see your new vocab set!');

  } catch (error) {
    console.error('❌ Error adding vocabulary:', error);
    await sql.end();
    throw error;
  } finally {
    await sql.end();
  }
}

addVocab()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
