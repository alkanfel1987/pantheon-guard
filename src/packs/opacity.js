/**
 * pantheon-guard · opacity rule pack (v0.3.1-experimental)
 *
 * Lexicon-based opacity detection. Catches deliberate-jargon-stacking and
 * meaningless-filler patterns that pass through both fact-check and
 * urgency/clickbait detection. Anchored to:
 *   - ns-avijnatartha-5-2-9 (deliberate opacity / jargon-bombing)
 *   - ns-nirarthaka-5-2-8 (meaningless expression)
 *
 * MECHANISM: tokenize text, count matches against curated jargon lexicon
 * (4-language: en/ru/de/fr), score by density + unique-count + sliding-
 * window max-density. Verdict thresholds calibrated on iter-5 manual-
 * curated independent corpus (NOT cycle-2 trap):
 *
 *   high:   density ≥ 0.04 AND unique ≥ 4   OR   max-window ≥ 0.06
 *   medium: density ≥ 0.02 AND unique ≥ 3   OR   max-window ≥ 0.03
 *   else:   clean
 *
 * Lexicons compiled from pantheon-vedic-catalogue/lexicons/*.yaml. Re-run
 * scripts/build_lexicons_for_guard.py after catalogue updates.
 *
 * VALIDATED iter-5 (2026-05-09):
 *   - EN catch 75% / FP 0% on 12 marketing + 17 clean docs
 *   - DE catch 50% / FP 0% on 10 corp-direct + 11 Wikipedia scientific
 *   - Aggregate 63.6% catch / 0% FP, Wilson 95% CI [43%–80%] / [0%–12%]
 *   - Pre-registered acceptance metric (catch ≥60%, FP ≤5%) HIT
 *
 * EXPERIMENTAL FLAG: this pack is NOT included in default index.js
 * exports. To activate, import explicitly:
 *
 *   import { opacityPack } from 'pantheon-guard/src/packs/opacity.js';
 *   import { applyPack } from 'pantheon-guard/src/packs/index.js';
 *   const inspectWithOpacity = applyPack(opacityPack);
 *
 * Production usage requires monitoring FP-rate on first 1000 samples;
 * revert to v0.3.0 disable if FP > 8%.
 *
 * KNOWN BOUNDARY CASES (training corpus):
 *   - Physics papers using "scaling laws" (collision with marketing
 *     "scale" entry). Inhibitor candidate: skip when adjacent to
 *     "scaling-law" / "finite-size-scaling" / "renormalization-group".
 *   - Tech tool tutorials using "click" + "leads" (UI verb + sales).
 *     Inhibitor candidate: skip when "click" adjacent to
 *     "button" / "console" / "browser" / "extension".
 */

import { JARGON_TOKENS as JARGON_EN } from '../lexicons/jargon-en.js';
import { JARGON_TOKENS as JARGON_RU } from '../lexicons/jargon-ru.js';
import { JARGON_TOKENS as JARGON_DE } from '../lexicons/jargon-de.js';
import { JARGON_TOKENS as JARGON_FR } from '../lexicons/jargon-fr.js';

const LEXICONS = Object.freeze({
  en: JARGON_EN,
  ru: JARGON_RU,
  de: JARGON_DE,
  fr: JARGON_FR,
});

// Calibrated thresholds (v0.3.1 — iter-5 independent corpus sweep)
const DEFAULT_OPTS = Object.freeze({
  densityHigh: 0.04,
  densityMed: 0.02,
  uniqueHigh: 4,
  uniqueMed: 3,
  windowSize: 120,
  windowMult: 1.5,
});

// Unicode-aware token regex (matches catalogue lexicon_detector.py)
const TOKEN_RE = /[\p{L}\p{N}_-]+/gu;

function tokenize(text) {
  if (typeof text !== 'string' || text.length === 0) return [];
  const out = [];
  for (const m of text.matchAll(TOKEN_RE)) {
    out.push(m[0].toLowerCase());
  }
  return out;
}

function maxWindowDensity(positions, totalTokens, windowSize) {
  if (totalTokens <= windowSize || positions.length === 0) {
    return positions.length / Math.max(1, totalTokens);
  }
  let maxW = 0;
  const step = Math.max(1, Math.floor(windowSize / 4));
  for (let start = 0; start <= totalTokens - windowSize; start += step) {
    const end = start + windowSize;
    let inWin = 0;
    for (const p of positions) {
      if (p >= start && p < end) inWin++;
    }
    const wd = inWin / windowSize;
    if (wd > maxW) maxW = wd;
  }
  return maxW;
}

/**
 * Run lexicon-based opacity detection on `text` for given `lang`.
 *
 * @param {string} text  — input text to analyze
 * @param {'en'|'ru'|'de'|'fr'} lang  — lexicon to use (auto-detect if absent)
 * @param {object} [opts]
 * @returns {{
 *   verdict: 'opacity_violation_high' | 'opacity_violation_medium' | 'clean' | 'too_short',
 *   density: number,
 *   uniqueCount: number,
 *   matchedWords: string[],
 *   maxWindowDensity: number,
 *   tokens: number,
 *   lang: string,
 * }}
 */
export function detectOpacity(text, lang = 'en', opts = {}) {
  const o = { ...DEFAULT_OPTS, ...opts };
  if (!LEXICONS[lang]) {
    throw new Error(`opacity: unknown lang '${lang}'. Supported: en/ru/de/fr`);
  }
  const tokens = tokenize(text);
  if (tokens.length < 5) {
    return {
      verdict: 'too_short',
      density: 0, uniqueCount: 0, matchedWords: [],
      maxWindowDensity: 0, tokens: tokens.length, lang,
    };
  }
  const lex = LEXICONS[lang];
  const matched = [];
  const positions = [];
  for (let i = 0; i < tokens.length; i++) {
    if (lex.has(tokens[i])) {
      matched.push(tokens[i]);
      positions.push(i);
    }
  }
  const density = matched.length / tokens.length;
  const uniqueCount = new Set(matched).size;
  const maxW = maxWindowDensity(positions, tokens.length, o.windowSize);

  let verdict;
  if ((density >= o.densityHigh && uniqueCount >= o.uniqueHigh) ||
      maxW >= o.windowMult * o.densityHigh) {
    verdict = 'opacity_violation_high';
  } else if ((density >= o.densityMed && uniqueCount >= o.uniqueMed) ||
             maxW >= o.windowMult * o.densityMed) {
    verdict = 'opacity_violation_medium';
  } else {
    verdict = 'clean';
  }

  return {
    verdict,
    density: Math.round(density * 10000) / 10000,
    uniqueCount,
    matchedWords: matched,
    maxWindowDensity: Math.round(maxW * 10000) / 10000,
    tokens: tokens.length,
    lang,
  };
}

/**
 * Auto-detect language by lexicon-hit rate. Picks language with most
 * unique matches (heuristic: jargon-density signal in target language
 * outperforms incidental cross-language matches).
 */
export function autoDetectLang(text) {
  let bestLang = 'en';
  let bestUnique = -1;
  for (const [lang, lex] of Object.entries(LEXICONS)) {
    const tokens = tokenize(text);
    const matchedSet = new Set();
    for (const t of tokens) if (lex.has(t)) matchedSet.add(t);
    if (matchedSet.size > bestUnique) {
      bestUnique = matchedSet.size;
      bestLang = lang;
    }
  }
  return bestLang;
}

// ─── Pack export ─────────────────────────────────────────────

// Requirement condition: returns true if ANY language detects violation.
// Tries each lexicon; flags if any hits high/medium verdict.
function anyOpacityViolation(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  for (const lang of Object.keys(LEXICONS)) {
    const r = detectOpacity(text, lang);
    if (r.verdict === 'opacity_violation_high' || r.verdict === 'opacity_violation_medium') {
      return true;
    }
  }
  return false;
}

// `check` is the gating function — returns true if requirement IS MET.
// Convention from healthcare/epistemology: violation = condition true AND check false.
// For opacity, no positive inhibitor implemented yet → check always returns false
// when condition fires (which is when opacity is detected).
function noInhibitor() { return false; }

export const opacityPack = Object.freeze({
  id: 'opacity',
  version: '0.3.1-experimental',
  description:
    'Lexicon-based opacity detection. Catches deliberate jargon-stacking ' +
    '(avijñātārtha NS 5.2.9) and meaningless-filler (nirarthaka NS 5.2.8) ' +
    'via 4-language curated jargon lexicon (862 tokens en/ru/de/fr). ' +
    'Validated on iter-5 manual-curated independent corpus: 63.6% catch / ' +
    '0% FP, Wilson 95% CI [43%–80%]/[0%–12%]. Routes to satya. ' +
    'EXPERIMENTAL — opt-in via explicit import.',

  detectionPatterns: [],

  requirements: Object.freeze([
    {
      id: 'jargon_density_opacity',
      // catalogue: ns-avijnatartha-5-2-9
      condition: anyOpacityViolation,
      check: noInhibitor,
      severity: 'medium',
      message:
        'Lexicon-based opacity detection: jargon-density (≥4 unique tokens ' +
        'OR ≥0.04 density) suggests deliberate-opacity / buzzword-stacking. ' +
        'Anchored to avijñātārtha (NS 5.2.9) + nirarthaka (NS 5.2.8). ' +
        'Routes to satya (truthfulness). NOTE: experimental v0.3.1 — ' +
        'monitor FP-rate on first 1000 production samples.',
    },
  ]),

  calibratorOverrides: Object.freeze({
    NOISE_FLOOR: 0.20,
    STRONG_THRESHOLD: 0.55,
  }),

  metadata: Object.freeze({
    catalogueAnchors: [
      'ns-avijnatartha-5-2-9',
      'ns-nirarthaka-5-2-8',
    ],
    lexiconStats: {
      en: 381,
      ru: 185,
      de: 175,
      fr: 121,
      total: 862,
    },
    thresholds: {
      densityHigh: 0.04,
      densityMed: 0.02,
      uniqueHigh: 4,
      uniqueMed: 3,
      windowSize: 120,
      windowMult: 1.5,
    },
    validation: {
      iter5_independent_corpus: {
        en_catch: '9/12 = 75%',
        de_catch: '5/10 = 50%',
        en_fp: '0/17 = 0%',
        de_fp: '0/11 = 0%',
        aggregate_catch: '14/22 = 63.6% [43%–80%]',
        aggregate_fp: '0/28 = 0% [0%–12%]',
      },
      training_corpus: {
        en_catch: '24/30 = 80%',
        en_fp: '2/27 = 7.4% (2 boundary cases)',
        aggregate_catch: '32/68 = 47.1%',
        aggregate_fp: '2/66 = 3.0%',
      },
      knownBoundaryFPs: [
        'arxiv physics: scaling-laws + leads → physics-domain inhibitor needed',
        'tech-tool README: click + leads (UI/sales) → UI-context inhibitor needed',
      ],
    },
    intendedUse:
      'AI agents producing or summarizing marketing-prose / corporate / wellness ' +
      'content. Especially edu-tools, content moderation pipelines for ad copy, ' +
      'AI-generated marketing material review. Catches opacity-class manipulation ' +
      'that passes through urgency / fear / clickbait detectors.',
    notIntendedUse:
      'NOT a fact-checker. Does NOT validate truth of claims. Does NOT cover ' +
      'pure technical writing (acceptable behavior — tech docs are legitimately ' +
      'jargon-light and should not trigger). Currently RU+FR have small lexicons ' +
      '(185/121 tokens vs EN 381) — cross-lang catch may be lower until iter-6 ' +
      'expansion.',
  }),
});

// Re-export detection helpers for direct use
export { tokenize, maxWindowDensity, LEXICONS };
