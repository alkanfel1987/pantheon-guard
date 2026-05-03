/**
 * pantheon-guard · detect-patterns
 *
 * Deterministic pattern detection for manipulative text.
 *
 * v0.1 uses regex heuristics tuned against Russian and English marketing
 * vocabulary. v0.2 will replace this with a trained classifier — see
 * BENCHMARK.md in the project source-of-truth folder. The function returns
 * an object with the same boolean keys consumed by `checkMahavrata`'s
 * `action.contains` block, so patterns flow into Mahā-vrata cleanly.
 *
 * Why regex first: deterministic, zero dependencies, no model card to
 * publish, no inference latency, easy to audit. Trade-off: lower recall on
 * paraphrased manipulation. Acceptable for v0.1, replaced in v0.2.
 *
 * Note on Cyrillic: JavaScript's `\b` only treats [A-Za-z0-9_] as word
 * characters. We use Unicode-aware lookbehind/lookahead with `\p{L}\p{N}`
 * under the `u` flag so word boundaries work for Russian text too.
 */

// Unicode-aware "word boundary": non-letter/digit on either side, or string edge.
const PRE  = '(?<![\\p{L}\\p{N}_])';
const POST = '(?![\\p{L}\\p{N}_])';

const re = (body) => new RegExp(PRE + '(?:' + body + ')' + POST, 'iu');

// ─────────────────────────────────────────────
// Russian patterns
// ─────────────────────────────────────────────
const URGENCY_RU = re('сроч(?:но|ный|ная|ное)|сейчас|немедленно|только сегодня|последний шанс|до полуночи|до конца дня|осталось мало|не упусти(?:ть)?');
const FEAR_RU = re('потеряете|пожалеете|упустите|не успеете|останетесь без|пропадёт|катастроф\\w*|обвал|кризис');
const CLICKBAIT_RU = re('секрет|шок|никто не знает|скрывают|то,? о чём молчат|разоблач\\w*|раскрыт\\w*');
const SCARCITY_RU = re('только \\d+|осталось \\d+ ?(?:мест|штук)|последн(?:ие|их) \\d+');

// ─────────────────────────────────────────────
// English patterns (\b works fine for ASCII)
// ─────────────────────────────────────────────
const URGENCY_EN = /\b(?:hurry|urgent|right now|today only|last chance|expires|deadline|don'?t miss|act now|limited time)\b/i;
const FEAR_EN = /\b(?:regret|miss out|fall behind|left behind|too late|lose everything|disaster|collapse)\b/i;
const CLICKBAIT_EN = /\b(?:secret|nobody knows|the one thing|they don'?t want you|shocking|exposed|revealed)\b/i;
const SCARCITY_EN = /\b(?:only \d+ left|\d+ spots left|last \d+|while supplies last)\b/i;

/**
 * Inspect text for known manipulation patterns.
 *
 * The returned shape matches the `action.contains` keys consumed by
 * {@link checkMahavrata}, so the typical pipeline is:
 *
 *   const contains = detectPatterns(text);
 *   const result = checkMahavrata({ text, urgency, paused, contains });
 *
 * @param {string} text — text to inspect
 * @returns {{
 *   falseUrgency: boolean,
 *   fearBased: boolean,
 *   clickbait: boolean,
 *   manipulation: boolean
 * }}
 */
export function detectPatterns(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return {
      falseUrgency: false,
      fearBased: false,
      clickbait: false,
      manipulation: false,
    };
  }

  const falseUrgency =
    URGENCY_RU.test(text) ||
    URGENCY_EN.test(text) ||
    SCARCITY_RU.test(text) ||
    SCARCITY_EN.test(text);

  const fearBased =
    FEAR_RU.test(text) ||
    FEAR_EN.test(text);

  const clickbait =
    CLICKBAIT_RU.test(text) ||
    CLICKBAIT_EN.test(text);

  // "manipulation" is a meta-flag — true when at least two manipulation
  // signals fire together. A single urgency word in a benign sentence
  // ("act now to confirm your booking") shouldn't trip the meta-flag.
  const signalCount = [falseUrgency, fearBased, clickbait].filter(Boolean).length;
  const manipulation = signalCount >= 2;

  return { falseUrgency, fearBased, clickbait, manipulation };
}
