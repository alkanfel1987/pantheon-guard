/**
 * pantheon-guard · text normalization
 *
 * Hardens detectPatterns against bypass attacks documented during the
 * v0.3 security audit:
 *
 *   - Cyrillic / Greek / Latin homoglyph swaps  ("Hurrу" with Cyrillic у)
 *   - Zero-width insertions                     ("Hu​rry")
 *   - Bidirectional override prefixes           ("‮Hurry")
 *   - Fullwidth ASCII                           ("Ｈｕｒｒｙ")
 *   - Spaced-out tokens                         ("h u r r y")
 *   - Common leetspeak                          ("Hurry, y0u r3gr3t...")
 *
 * Each was empirically confirmed to bypass the v0.2.2 detector; see
 * docs/SECURITY.md §3 for the audit transcript and per-vector
 * before/after numbers.
 *
 * The normalization is lossy *for the regex layer only* — the original
 * string is preserved on the action object for downstream display and
 * audit. Normalization runs in O(n) on string length.
 */

// ─────────────────────────────────────────────
// Cyrillic / Greek → Latin lookalike map.
// Includes only characters that visually overlap with Latin a-z;
// non-overlapping Cyrillic letters are intentionally left intact so
// genuinely Russian text still hits Russian regex patterns.
// ─────────────────────────────────────────────
const HOMOGLYPH_MAP = Object.freeze({
  // Cyrillic (lowercase) → Latin lowercase
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y',
  'х': 'x', 'і': 'i', 'ј': 'j', 'ѕ': 's', 'ԁ': 'd', 'ԛ': 'q',
  'ѵ': 'v', 'ʏ': 'y',
  // Cyrillic uppercase → Latin uppercase
  'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H',
  'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X',
  // Greek lookalikes
  'α': 'a', 'ο': 'o', 'ρ': 'p', 'τ': 't', 'ν': 'v', 'ι': 'i',
  'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I',
  'Κ': 'K', 'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T',
  'Υ': 'Y', 'Χ': 'X',
  // Mathematical alphanumeric symbols (rare but seen)
  '𝐚': 'a', '𝐛': 'b', '𝐜': 'c',
});

// Zero-width / invisible / formatting characters we strip outright.
// Sources: Unicode 15.1 General Categories Cf (Format) and selected Cc.
const ZERO_WIDTH_REGEX = /[​-‏‪-‮⁠-⁤﻿­͏؜ᅟᅠ឴឵᠎ㅤﾠ]/g;

// Leetspeak digit-to-letter map. Conservative — only the digits that
// most reliably substitute for a letter, applied character-by-character
// so we don't over-correct numeric content like "3 spots".
const LEET_MAP = Object.freeze({
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's',
});

// ─────────────────────────────────────────────
// Public normalizer
// ─────────────────────────────────────────────

/**
 * Normalize text for regex-based pattern matching.
 *
 * Produces a *normalized view* of the input that should be fed to the
 * regex layer. The original text is unchanged.
 *
 * @param {string} text
 * @param {Object} [options]
 * @param {boolean} [options.deLeet=true] — fold leetspeak digits into letters
 * @param {boolean} [options.collapseSpacedLetters=true] — "h u r r y" → "hurry"
 * @returns {string} normalized form
 */
export function normalizeText(text, options = {}) {
  if (typeof text !== 'string' || text.length === 0) return '';
  const deLeet = options.deLeet ?? true;
  const collapseSpacedLetters = options.collapseSpacedLetters ?? true;

  // 1. NFKC unicode normalization — collapses fullwidth, ligatures,
  //    compatibility decompositions. Cheap, well-defined.
  let s = text.normalize('NFKC');

  // 2. Strip zero-width and bidi-override formatting characters.
  s = s.replace(ZERO_WIDTH_REGEX, '');

  // 3. Mixed-script homoglyph fold.
  //    Only fold a Cyrillic/Greek homoglyph to its Latin twin when the
  //    enclosing word is *mixed-script* (contains both Cyrillic AND
  //    Latin characters). Mixed script is the attack signature itself —
  //    legitimate Russian or English words do not mix alphabets.
  //    Pure-Cyrillic Russian text passes through untouched, so the
  //    Russian regex layer keeps working on it.
  s = s.replace(/[\p{L}\p{N}'’\-]+/gu, (word) => {
    let hasCyrillic = false;
    let hasLatin = false;
    for (const ch of word) {
      if (/[Ѐ-ӿ]/.test(ch)) hasCyrillic = true;
      else if (/[A-Za-z]/.test(ch))    hasLatin = true;
    }
    if (hasCyrillic && hasLatin) {
      let folded = '';
      for (const ch of word) folded += HOMOGLYPH_MAP[ch] ?? ch;
      return folded;
    }
    // Greek-mixed-with-Latin same idea (rarer but still an attack vector).
    let hasGreek = false;
    for (const ch of word) {
      if (/[Ͱ-Ͽ]/.test(ch)) { hasGreek = true; break; }
    }
    if (hasGreek && hasLatin) {
      let folded = '';
      for (const ch of word) folded += HOMOGLYPH_MAP[ch] ?? ch;
      return folded;
    }
    return word;
  });

  // 4. Leetspeak normalization — apply BETWEEN letters only, so we
  //    don't break legitimate digits like "3 spots left" or "v0.2".
  //    Heuristic: a digit becomes a letter only if both neighbors are
  //    Unicode letters.
  if (deLeet) {
    const chars = Array.from(s);
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (LEET_MAP[c]) {
        const prev = chars[i - 1];
        const next = chars[i + 1];
        const prevIsLetter = prev && /[\p{L}]/u.test(prev);
        const nextIsLetter = next && /[\p{L}]/u.test(next);
        if (prevIsLetter && nextIsLetter) {
          chars[i] = LEET_MAP[c];
        }
      }
    }
    s = chars.join('');
  }

  // 5. Collapse single-letter spaced tokens. "h u r r y" → "hurry".
  //    Only triggers on runs of single letters separated by single
  //    spaces; doesn't touch normal phrases.
  if (collapseSpacedLetters) {
    s = s.replace(/(?<![\p{L}])((?:[\p{L}] ){2,}[\p{L}])(?![\p{L}])/gu,
                  (match) => match.replace(/ /g, ''));
  }

  return s;
}

// ─────────────────────────────────────────────
// Inspect normalization deltas for tests / debugging
// ─────────────────────────────────────────────

/**
 * Diagnostic helper: returns the original and normalized form together
 * with a list of named transforms that were applied.
 *
 * @param {string} text
 * @param {Object} [options]
 * @returns {{ original: string, normalized: string, applied: string[] }}
 */
export function normalizeDiagnostic(text, options = {}) {
  if (typeof text !== 'string' || text.length === 0) {
    return { original: text, normalized: '', applied: [] };
  }
  const original = text;
  const applied = [];

  let s = text.normalize('NFKC');
  if (s !== original) applied.push('nfkc');

  const stripped = s.replace(ZERO_WIDTH_REGEX, '');
  if (stripped !== s) applied.push('zero-width-strip');

  const after = normalizeText(original, options);
  if (after.length !== text.length || after !== text.normalize('NFKC').replace(ZERO_WIDTH_REGEX, '')) {
    applied.push('homoglyph-or-leet-or-spacing');
  }

  return { original, normalized: after, applied };
}
