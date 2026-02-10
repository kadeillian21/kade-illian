/**
 * Morphology Decoder for OSHB morphology codes
 *
 * Decodes codes like "HVqp3ms" into human-readable descriptions
 * like "Verb, Qal Perfect, 3rd masc. sing."
 *
 * Reference: https://hb.openscriptures.org/parsing/HebrewMorphologyCodes.html
 */

const LANGUAGE: Record<string, string> = {
  H: 'Hebrew',
  A: 'Aramaic',
};

const PART_OF_SPEECH: Record<string, string> = {
  A: 'Adjective',
  C: 'Conjunction',
  D: 'Adverb',
  N: 'Noun',
  P: 'Pronoun',
  R: 'Preposition',
  S: 'Suffix',
  T: 'Particle',
  V: 'Verb',
};

const VERB_STEM_HEBREW: Record<string, string> = {
  q: 'Qal',
  N: 'Niphal',
  p: 'Piel',
  P: 'Pual',
  h: 'Hiphil',
  H: 'Hophal',
  t: 'Hithpael',
  o: 'Polel',
  O: 'Polal',
  r: 'Hithpolel',
  m: 'Poel',
  M: 'Poal',
  k: 'Palel',
  K: 'Pulal',
  Q: 'Qal Passive',
  l: 'Pilpel',
  L: 'Polpal',
  f: 'Hithpalpel',
  D: 'Nithpael',
  j: 'Pealal',
  i: 'Pilel',
  u: 'Hothpaal',
  c: 'Tiphil',
  v: 'Hishtaphel',
  w: 'Nithpalel',
  y: 'Nithpoel',
  z: 'Hithpoel',
};

const VERB_STEM_ARAMAIC: Record<string, string> = {
  q: 'Peal',
  Q: 'Peil',
  u: 'Hithpeel',
  p: 'Pael',
  P: 'Ithpaal',
  M: 'Hithpaal',
  a: 'Aphel',
  h: 'Haphel',
  s: 'Saphel',
  e: 'Shaphel',
  H: 'Hophal',
  i: 'Ithpeel',
  t: 'Hishtaphel',
  v: 'Ishtaphel',
  w: 'Hithaphel',
};

const VERB_TYPE: Record<string, string> = {
  p: 'Perfect',
  q: 'Sequential Perfect',
  i: 'Imperfect',
  w: 'Sequential Imperfect',
  h: 'Cohortative',
  j: 'Jussive',
  v: 'Imperative',
  r: 'Participle Active',
  s: 'Participle Passive',
  a: 'Infinitive Absolute',
  c: 'Infinitive Construct',
};

const PERSON: Record<string, string> = {
  '1': '1st',
  '2': '2nd',
  '3': '3rd',
};

const GENDER: Record<string, string> = {
  m: 'masc.',
  f: 'fem.',
  b: 'both',
  c: 'common',
};

const NUMBER: Record<string, string> = {
  s: 'sing.',
  p: 'plur.',
  d: 'dual',
};

const STATE: Record<string, string> = {
  a: 'absolute',
  c: 'construct',
  d: 'determined',
};

const NOUN_TYPE: Record<string, string> = {
  c: 'common',
  g: 'gentilic',
  p: 'proper',
};

const PRONOUN_TYPE: Record<string, string> = {
  d: 'demonstrative',
  f: 'indefinite',
  i: 'interrogative',
  p: 'personal',
  r: 'relative',
};

const PARTICLE_TYPE: Record<string, string> = {
  d: 'definite article',
  a: 'accusative',
  e: 'exhortation',
  i: 'interrogative',
  j: 'interjection',
  m: 'demonstrative',
  n: 'negative',
  o: 'direct object',
  r: 'relative',
};

function decodeSingleMorph(code: string): string {
  if (!code || code.length < 2) return code;

  const parts: string[] = [];
  let idx = 0;

  // Language prefix (H or A)
  const lang = code[idx];
  if (!LANGUAGE[lang]) return code;
  idx++;

  // Part of speech
  const pos = code[idx];
  const posName = PART_OF_SPEECH[pos];
  if (!posName) return code;
  idx++;

  if (pos === 'V') {
    // Verb: stem + type + person + gender + number
    parts.push('Verb');

    const stemTable = lang === 'A' ? VERB_STEM_ARAMAIC : VERB_STEM_HEBREW;
    if (idx < code.length && stemTable[code[idx]]) {
      parts.push(stemTable[code[idx]]);
      idx++;
    }
    if (idx < code.length && VERB_TYPE[code[idx]]) {
      parts.push(VERB_TYPE[code[idx]]);
      idx++;
    }
    if (idx < code.length && PERSON[code[idx]]) {
      parts.push(PERSON[code[idx]]);
      idx++;
    }
    if (idx < code.length && GENDER[code[idx]]) {
      parts.push(GENDER[code[idx]]);
      idx++;
    }
    if (idx < code.length && NUMBER[code[idx]]) {
      parts.push(NUMBER[code[idx]]);
      idx++;
    }
  } else if (pos === 'N') {
    // Noun: type + gender + number + state
    parts.push('Noun');
    if (idx < code.length && NOUN_TYPE[code[idx]]) {
      parts.push(NOUN_TYPE[code[idx]]);
      idx++;
    }
    if (idx < code.length && GENDER[code[idx]]) {
      parts.push(GENDER[code[idx]]);
      idx++;
    }
    if (idx < code.length && NUMBER[code[idx]]) {
      parts.push(NUMBER[code[idx]]);
      idx++;
    }
    if (idx < code.length && STATE[code[idx]]) {
      parts.push(STATE[code[idx]]);
      idx++;
    }
  } else if (pos === 'A') {
    // Adjective: type + gender + number + state
    parts.push('Adjective');
    if (idx < code.length && GENDER[code[idx]]) {
      // Adjective may skip type and go straight to gender
      parts.push(GENDER[code[idx]]);
      idx++;
    }
    if (idx < code.length && NUMBER[code[idx]]) {
      parts.push(NUMBER[code[idx]]);
      idx++;
    }
    if (idx < code.length && STATE[code[idx]]) {
      parts.push(STATE[code[idx]]);
      idx++;
    }
  } else if (pos === 'P') {
    // Pronoun: type + person + gender + number
    parts.push('Pronoun');
    if (idx < code.length && PRONOUN_TYPE[code[idx]]) {
      parts.push(PRONOUN_TYPE[code[idx]]);
      idx++;
    }
    if (idx < code.length && PERSON[code[idx]]) {
      parts.push(PERSON[code[idx]]);
      idx++;
    }
    if (idx < code.length && GENDER[code[idx]]) {
      parts.push(GENDER[code[idx]]);
      idx++;
    }
    if (idx < code.length && NUMBER[code[idx]]) {
      parts.push(NUMBER[code[idx]]);
      idx++;
    }
  } else if (pos === 'T') {
    // Particle
    parts.push('Particle');
    if (idx < code.length && PARTICLE_TYPE[code[idx]]) {
      parts.push(PARTICLE_TYPE[code[idx]]);
      idx++;
    }
  } else if (pos === 'S') {
    // Suffix: person + gender + number
    parts.push('Suffix');
    if (idx < code.length && PERSON[code[idx]]) {
      parts.push(PERSON[code[idx]]);
      idx++;
    }
    if (idx < code.length && GENDER[code[idx]]) {
      parts.push(GENDER[code[idx]]);
      idx++;
    }
    if (idx < code.length && NUMBER[code[idx]]) {
      parts.push(NUMBER[code[idx]]);
      idx++;
    }
  } else {
    // Conjunction, Adverb, Preposition - just the name
    parts.push(posName);
  }

  return parts.join(', ');
}

/**
 * Decode an OSHB morphology code into human-readable text.
 *
 * @param morph - The morphology code (e.g., "HVqp3ms", "HR/Ncfsa")
 * @returns Human-readable description (e.g., "Verb, Qal, Perfect, 3rd, masc., sing.")
 */
export function decodeMorphology(morph: string | null): string {
  if (!morph) return '';

  // Handle compound morphologies separated by /
  const parts = morph.split('/');
  const decoded = parts.map(decodeSingleMorph);
  return decoded.join(' + ');
}
