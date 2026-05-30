/**
 * pantheon-guard · German news rule pack (v0.1.0)
 *
 * DE-specific manipulation detection for news / media content. Designed
 * after multi-region benchmark surfaced 13 DE FN cases falling into 6
 * structural classes that current RU/EN patterns don't cover.
 *
 * FN catalogue (from N=100 DE corpus):
 *   - Sensationalist verb            ("wackelt", "wütet")            → satya
 *   - Vague-discovery passive        ("Hausmittel hilft")             → satya
 *   - Q-curiosity headline           ("Lebt Wal Timmy noch?")         → satya
 *   - Personal-life sensational      ("So abgeschottet lebt Putin")   → satya
 *   - Body-metaphor political        ("Kaputtes Land")                → ahimsa
 *   - Vague-discovery (Darum-frame)  ("Darum brauchte Nina Chuba")    → satya
 *
 * Calibrator override: lowered NOISE_FLOOR (0.20) and STRONG_THRESHOLD
 * (0.55) — same DE/EU regulatory rationale as news-pack (DSA Art. 34-35
 * systemic-risk for very-large-online-platforms; misinformation provisions
 * in German Network Enforcement Act / NetzDG).
 *
 * Status: scaffold. Patterns derived from real KP-style equivalents in DE
 * tabloid (Bild, Stern via Google News aggregator) + t-online lifestyle.
 * Acceptance metric: ≥ 8/13 catch on the 13 DE FN cases without
 * introducing FP on quality DE sources (Heise, Tagesspiegel, n=50).
 */

// Unicode-aware word boundary identical to other packs.
const PRE  = '(?<![\\p{L}\\p{N}_])';
const POST = '(?![\\p{L}\\p{N}_])';
const re = (body) => new RegExp(PRE + '(?:' + body + ')' + POST, 'iu');

const W_ANY = '[\\p{L}\\p{N}_]';
const W_PLUS = W_ANY + '+';
const W_STAR = W_ANY + '*';
// Hyphen-permitting word — handles German compound nouns like
// "Wetter-Modelle", "Russland-Sanktionen", "Iran-Krieg".
const HW_PLUS = '[\\p{L}\\p{N}_-]+';

// ─────────────────────────────────────────────
// DE detection patterns
// ─────────────────────────────────────────────

const PATTERNS = Object.freeze([
  // ── Sensationalist tabloid verbs → satya
  // RU equivalent: воскресит / бушующ. DE-specific tabloid verbs
  // signaling sensational framing of a non-tabloid subject.
  {
    rule: 'satya',
    name: 'sensationalist_verb_de',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: re('wackelt|wütet|poltert|tobt|schwört|donnert|kracht'),
    description: 'tabloid-leaning sensationalist verb (DE)',
  },

  // ── "Bushende" / "tobende" — sensational adjectival modifier on news event
  {
    rule: 'satya',
    name: 'sensationalist_adj_de',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: re('(?:bushend|tobend|wütend|donnernd|krachend)' + W_STAR + '\\s+(?:Krise|Sturm|Welle|Skandal|Affäre|Streit)' + W_STAR),
    description: 'sensational adj + crisis-noun framing (DE)',
  },

  // ── Vague-discovery passive: "Hausmittel hilft / Mittel schützt" advice
  // pattern with vague subject + active verb. Captures the t-online style
  // "Blattläuse bekämpfen: Dieses Mittel schützt schnell" / "Moos auf
  // Pflastersteinen bekämpfen – ein Hausmittel hilft".
  {
    rule: 'satya',
    name: 'vague_discovery_passive_de',
    // catalogue: ns-arthantara-5-2-7
    regex: re(
      '(?:ein\\s+)?(?:Hausmittel|Mittel|Trick|Tipp|Methode|Geheimrezept)\\s+' +
      '(?:hilft|schützt|wirkt|löst|verhindert|bekämpft)'
    ),
    description: 'vague-remedy advice-clickbait (DE tabloid lifestyle)',
  },

  // ── "Dieses + [noun]" + active verb — clickbait product placement
  {
    rule: 'satya',
    name: 'dieses_clickbait_de',
    // catalogue: ns-arthantara-5-2-7
    regex: re(
      'dieses?\\s+(?:Mittel|Hausmittel|Geheimnis|Geheimrezept|Hausmittel|Wundermittel|Ritual)\\s+' +
      '(?:schützt|hilft|wirkt|verändert|löst|verhindert)'
    ),
    description: 'tabloid product/method clickbait "Dieses ... schützt" (DE)',
  },

  // ── Q-curiosity headline: "Lebt X noch?" / "Lässt sich X rückgängig machen?"
  // The Q-form WITHOUT immediate factual answer in headline = curiosity hook.
  {
    rule: 'satya',
    name: 'q_curiosity_de',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re(
      '(?:Lebt|Lässt\\s+sich|Wird|Ist|Kann)\\s+' +
      W_PLUS + '(?:\\s+' + W_PLUS + '){0,3}\\s+' +
      '(?:noch|wirklich|tatsächlich|rückgängig|jemals)\\??'
    ),
    description: 'Q-curiosity headline without immediate factual answer (DE)',
  },

  // ── Personal-life sensational: "Das kostet X den Schlaf" / "So
  // abgeschottet lebt X" — sensationalist personal-life framing of
  // a public figure.
  {
    rule: 'satya',
    name: 'personal_life_sensational_de',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re(
      '(?:Das\\s+kostet\\s+' + W_PLUS + '\\s+den\\s+Schlaf|' +
      'So\\s+(?:abgeschottet|allein|einsam|verzweifelt|entrückt)\\s+lebt|' +
      'Darum\\s+(?:brauchte|wurde|musste|verließ|trennte))'
    ),
    description: 'personal-life sensational framing of public figure (DE tabloid)',
  },

  // ── Body-metaphor political: "kaputtes/zerbrochenes/sterbendes Land"
  // and similar. Routes to ahimsa (non-violence / non-dehumanisation)
  // because dehumanising a country/group is a harm pattern.
  {
    rule: 'ahimsa',
    name: 'body_metaphor_political_de',
    // catalogue: manu-vangmaya-karma-12-5-6
    regex: re(
      '(?:kaputtes|zerbrochenes|sterbendes|krankes|fauliges|vergiftetes|verseuchtes)\\s+' +
      '(?:Land|Volk|Staat|Nation|Reich|Europa|Deutschland|Russland|Amerika|Ukraine|Polen)'
    ),
    description: 'dehumanising body-metaphor on country/group (DE)',
  },

  // ── "Heimliche Hoffnungsträger / heimlicher Kaiser" — sensational political
  // framing pattern in DE political tabloid coverage (t-online AfD case).
  {
    rule: 'satya',
    name: 'sensational_political_de',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re(
      '(?:heimliche[a-z]?|geheime[a-z]?|verborgene[a-z]?)\\s+' +
      '(?:Hoffnungsträger|Star|Held|Kaiser|König|Königin|Macht|Plan|Strategie|Anführer)'
    ),
    description: 'sensational political "secret hero/leader" framing (DE)',
  },

  // ─────────────────────────────────────────────
  // v0.2.0-pre.1 — field-test 2026-05-21 patterns
  // Source: docs/LINGUISTIC-PATTERNS-2026-05-21.md (P4 cluster)
  // Status: SCAFFOLD — fresh real-corpus probe pending iter-2.
  // ─────────────────────────────────────────────

  // ── P4a · DE sensational collapse "gekippt" with collective subject → satya
  // Examples (2026-05-21): "Alle Wetter-Modelle gekippt – jetzt..."
  // Trigger: collective quantifier + arbitrary noun + gekippt. Avoids
  // physical / boating usage ("Boot gekippt"), which lacks the collective
  // quantifier.
  // NB: HW_PLUS used for German compound nouns ("Wetter-Modelle",
  // "Russland-Sanktionen") — W_PLUS would split at the hyphen.
  {
    rule: 'satya',
    name: 'gekippt_collective_de',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: re(
      '(?:alle|sämtliche|jede[srn]?)\\s+' + HW_PLUS + '(?:\\s+' + HW_PLUS + ')?\\s+gekippt'
    ),
    description: 'collective-subject + collapse-verb gekippt (DE sensational)',
  },

  // ── P4b · DE political capitulation "knickt ein" → satya
  // Examples (2026-05-21): "London knickt bei Russland-Sanktionen ein"
  // State-actor surrender framing. Strong tell — minimal-FP risk because
  // legitimate political reporting uses "lenkt ein" / "gibt nach" instead.
  {
    rule: 'satya',
    name: 'knickt_ein_de',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: re(
      'knickt\\s+(?:bei|in|nach|vor|gegenüber)\\s+' + HW_PLUS + '\\s+ein'
    ),
    description: 'state-actor capitulation framing knickt-ein (DE sensational)',
  },

  // ── P4c · DE "lässt ... Traum/Hoffnung/Plan platzen" → satya
  // Examples (2026-05-21): "Aston Villas lässt den großen Traum des SC Freiburg platzen"
  // Sport/political sensational dream-break framing.
  // {1,5} word range covers genitive prepositional phrases between Traum and platzen.
  {
    rule: 'satya',
    name: 'laesst_traum_platzen_de',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re(
      'lässt\\s+(?:den|die|das)\\s+' +
      '(?:großen?\\s+|alten?\\s+|letzten?\\s+|kleinen?\\s+)?' +
      '(?:Traum|Hoffnung|Plan|Geschäft|Deal|Vorhaben|Bock)' +
      '(?:\\s+' + HW_PLUS + '){1,5}\\s+platzen'
    ),
    description: 'sensational "dream-break" framing lässt-X-platzen (DE)',
  },

  // ── P4d · DE "enthüllen Irrtum/Skandal/Wahrheit" → satya
  // Examples (2026-05-21): "Forscher enthüllen Irrtum – es ist ein Weibchen"
  // Sensational-revelation framing on routine findings.
  {
    rule: 'satya',
    name: 'enthuellen_revelation_de',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: re(
      '\\benthüll(?:t|en|te|ten)\\s+(?:einen?\\s+|den?\\s+|die\\s+|das\\s+)?' +
      '(?:Irrtum|Skandal|Wahrheit|Geheimnis|Schock|Lüge|Affäre)'
    ),
    description: 'sensational-revelation framing enthüllen + reveal-noun (DE)',
  },

  // ── P4e · DE crisis-genre marker "Krieg/Krise im Liveticker" → ahimsa
  // Examples (2026-05-21): "Iran-Krieg im Liveticker: +++ Iran: Tauschen..."
  // Genre-label commodifies ongoing conflict / catastrophe as entertainment
  // segment — distinct from neutral "Liveticker zur Pressekonferenz".
  {
    rule: 'ahimsa',
    name: 'krieg_im_liveticker_de',
    // catalogue: mbh-mayacara-12-110-26
    regex: re(
      '(?:Krieg|Krise|Skandal|Eskalation|Katastrophe)' + W_STAR + '\\s+im\\s+Liveticker'
    ),
    description: 'crisis-genre commodification marker (DE ahimsa)',
  },
]);

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const newsDePack = Object.freeze({
  id: 'news-de',
  version: '0.2.0-pre.1',
  description:
    'German news / media manipulation detection. Closes the DE coverage ' +
    'gap surfaced in multi-region benchmark (N=100 DE corpus, 13 FN). ' +
    'Catches DE-specific tabloid patterns: sensationalist verbs ("wackelt", ' +
    '"wütet"), vague-discovery advice ("Hausmittel hilft"), Q-curiosity ' +
    'headlines ("Lebt X noch?"), personal-life sensational framing ' +
    '("So abgeschottet lebt X"), and body-metaphor political dehumanisation ' +
    '("kaputtes Land"). Routes via core mahā-vrata rules satya / ahimsa.',

  detectionPatterns: PATTERNS,

  requirements: Object.freeze([]),

  calibratorOverrides: Object.freeze({
    NOISE_FLOOR: 0.20,
    STRONG_THRESHOLD: 0.55,
  }),

  metadata: Object.freeze({
    regulatoryReferences: [
      'EU Digital Services Act (DSA) Art. 34-35 — systemic-risk mitigation',
      'Network Enforcement Act / NetzDG — DE-specific enforcement framework',
      'EU Code of Practice on Disinformation (2022 strengthened)',
    ],
    intendedUse:
      'Layer on top of German-language news-summarisation agents, headline-' +
      'generation pipelines, AI-generated social-media posts about current ' +
      'events in DACH region. Pairs with news-pack (RU/EN) for cross-' +
      'language deployment.',
    notIntendedUse:
      'NOT a fact-checker. Does NOT validate truth-value of news claims. ' +
      'Pattern coverage tuned to tabloid (Bild, Stern, t-online) and Berlin/' +
      'Hamburg quality outlets — regional/fachpresse may need extension.',
    knownGap:
      'Pattern set derived from N=100 corpus pulled 2026-05-05. Real-time ' +
      'tabloid evolution may require quarterly refresh. Austrian (Krone) ' +
      'and Swiss (Blick) tabloid dialects not yet specifically covered.',
  }),
});
