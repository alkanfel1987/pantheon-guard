/**
 * pantheon-guard · news rule pack (v0.2.0 — EN modern paradigm)
 *
 * Catches solo-clickbait and anonymous-source patterns in AI-generated
 * news / media content. Closes the gap documented in
 * REAL-WORLD-DOMAIN-TESTS-2026-05-04.md where standalone clickbait stacks
 * (e.g. "the shocking secret nobody knows — exposed!") slip through the
 * core meta-flag because all hits route to a single `clickbait` flag and
 * `manipulation` requires ≥2 flags.
 *
 * Pack approach: route news-specific clickbait phrases to satya
 * (false-fact framing), anonymous-source phrases to asteya (no
 * attribution), and panic / "before-deletion" framing to ahimsa /
 * indriya_nigraha. Pack violations block independently of the core
 * meta-flag, so a single news-pattern hit is sufficient to fail.
 *
 * Coverage (RU + EN):
 *   - "shocking secret / hidden truth" framing            → satya
 *   - "they don't want you to know / scрывают от вас"      → satya
 *   - "you won't believe / вы не поверите"                → satya
 *   - "media silence / о чём молчат СМИ"                  → satya
 *   - "doctors hate this / эксперты ненавидят"            → satya
 *   - "exposed!" / "разоблачение" with bang               → satya
 *   - "sources say / инсайдеры сообщают" without name     → asteya
 *   - "according to reports / по данным" without source   → asteya
 *   - "panic spreads / паника охватила"                   → ahimsa
 *   - "before it's deleted / пока не удалили"             → indriya_nigraha
 *
 * Calibrator override:
 *   - NOISE_FLOOR lowered (0.30 → 0.20): news misinformation has high
 *     downstream cost (epistemic damage at scale via virality).
 *   - STRONG_THRESHOLD lowered (0.70 → 0.55): same logic.
 *
 * Regulatory drivers: EU Digital Services Act (DSA) Art. 34-35 systemic-risk
 * mitigation for very-large-online-platforms; UK Online Safety Act
 * misinformation provisions; voluntary code of practice on disinformation.
 */

// Unicode-aware word boundary identical to detect-patterns.js for consistency.
const PRE  = '(?<![\\p{L}\\p{N}_])';
const POST = '(?![\\p{L}\\p{N}_])';
const re = (body) => new RegExp(PRE + '(?:' + body + ')' + POST, 'iu');

// JS `\w` is ASCII-only even under the `u` flag — does NOT match Cyrillic.
const W_ANY = '[\\p{L}\\p{N}_]';
const W_PLUS = W_ANY + '+';
const W_STAR = W_ANY + '*';

// ─────────────────────────────────────────────
// Detection patterns — RU + EN
// ─────────────────────────────────────────────

const PATTERNS = Object.freeze([
  // ── Shocking-secret / hidden-truth framing → satya
  {
    rule: 'satya',
    name: 'shocking_secret_en',
    // catalogue: bg-asuri-epistemology-16-8
    regex: /\b(?:shocking|hidden|forbidden|dark)\s+(?:secret|truth|fact)s?\b/i,
    description: 'shocking-secret framing — fabricated epistemic exclusivity',
  },
  {
    rule: 'satya',
    name: 'shocking_secret_ru',
    // catalogue: bg-asuri-epistemology-16-8
    regex: re('(?:шокирующ' + W_PLUS + '|скрыт' + W_PLUS + '|запретн' + W_PLUS + '|тёмн' + W_PLUS + ')\\s+(?:секрет' + W_STAR + '|правд' + W_PLUS + '|истин' + W_PLUS + '|факт' + W_STAR + ')'),
    description: 'shocking-secret framing (RU)',
  },
  {
    rule: 'satya',
    name: 'shocking_bang_ru',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: re('шок!|сенсация!|разоблачени(?:е|я)!'),
    description: 'sensation-bang framing (RU)',
  },

  // ── "Secret nobody knows" composite → satya
  {
    rule: 'satya',
    name: 'secret_nobody_knows_en',
    // catalogue: bg-asuri-epistemology-16-8
    regex: /\bsecret\s+(?:that\s+)?(?:nobody|no\s+one)\s+(?:knows|wants\s+to\s+(?:tell|share))\b/i,
    description: 'composite "secret nobody knows" — fabricated exclusivity',
  },

  // ── "They don't want you to..." conspiracy frame → satya
  {
    rule: 'satya',
    name: 'they_dont_want_en',
    // catalogue: bg-asuri-epistemology-16-8
    regex: /\bthey\s+(?:don'?t|do\s+not)\s+want\s+you\s+to\s+(?:know|see|hear|find\s+out|read)\b/i,
    description: 'they-don\'t-want-you frame — anonymous-conspiracy assertion',
  },
  {
    rule: 'satya',
    name: 'they_dont_want_ru',
    // catalogue: bg-asuri-epistemology-16-8
    regex: re('(?:скрыва[ею]т|прячут|умалчива[ею]т)\\s+(?:от\\s+(?:вас|тебя|нас|народа|людей|общества))'),
    description: 'they-hide-from-you frame (RU)',
  },

  // ── "You won't believe" → satya
  {
    rule: 'satya',
    name: 'you_wont_believe_en',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: /\byou\s+(?:won'?t|will\s+not|wont)\s+believe\s+(?:what|how|why|this|the)\b/i,
    description: 'you-won\'t-believe clickbait',
  },
  {
    rule: 'satya',
    name: 'you_wont_believe_ru',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: re('вы не поверите|невозможно поверить'),
    description: 'you-won\'t-believe clickbait (RU)',
  },

  // ── "Media silence / о чём молчат СМИ" → satya
  {
    rule: 'satya',
    name: 'media_silence_ru',
    // catalogue: bg-asuri-epistemology-16-8
    regex: re('о чём (?:молчат|умалчива[ею]т|не говорят)\\s+(?:СМИ|медиа|власти|учёные|пресса|официальн' + W_PLUS + '|правительств' + W_STAR + ')'),
    description: 'media-silence conspiracy frame (RU)',
  },
  {
    rule: 'satya',
    name: 'media_silence_en',
    // catalogue: bg-asuri-epistemology-16-8
    regex: /\bwhat\s+(?:the\s+)?(?:mainstream\s+|corporate\s+|legacy\s+|liberal\s+|leftist\s+|big\s+)?(?:media|press|news|government|officials)\s+(?:won'?t|wont|do(?:es)?n'?t|never)\s+(?:tell|say|report|cover|show|admit)\b/i,
    description: 'media-silence conspiracy frame (EN)',
  },

  // ── "Doctors / experts hate this" → satya
  {
    rule: 'satya',
    name: 'experts_hate_en',
    // catalogue: ns-jati-definition-1-2-18
    regex: /\b(?:doctors|experts|scientists|professionals|insiders|the\s+experts)\s+(?:hate|don'?t\s+want\s+you\s+to\s+know|are\s+furious\s+about)\b/i,
    description: 'experts-hate clickbait — fabricated authority opposition',
  },
  {
    rule: 'satya',
    name: 'experts_hate_ru',
    // catalogue: ns-jati-definition-1-2-18
    regex: re('(?:врачи|эксперты|учёные|специалисты|профессионалы)\\s+(?:ненавидят|в ярости|боятся)\\s+(?:это|этого|такого)'),
    description: 'experts-hate clickbait (RU)',
  },

  // ── Standalone "exposed!" / "revealed!" with bang → satya
  // (plain "exposed in court documents" is fine; the bang + adjacency to
  //  no source is the tell)
  {
    rule: 'satya',
    name: 'exposed_bang_en',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: /\b(?:exposed|revealed|uncovered)\s*[!]+/i,
    description: 'sensational-bang framing on exposed/revealed',
  },

  // ── "Will change everything" → satya
  // Subject can be anything — "This new discovery will change everything",
  // "AI will change everything", etc. The grandiose framing is the tell.
  {
    rule: 'satya',
    name: 'change_everything_en',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: /\b(?:will|is\s+going\s+to|could|may|might)\s+change\s+(?:everything|the\s+(?:world|future)|history|how\s+we\s+(?:see|think|live|work))\b/i,
    description: 'totalising-impact prediction without source',
  },
  {
    rule: 'satya',
    name: 'change_everything_ru',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re('(?:это|то|оно)\\s+(?:изменит|перевернёт|разрушит)\\s+(?:всё|мир|историю|представлени' + W_PLUS + ')'),
    description: 'totalising-impact prediction (RU)',
  },

  // ── Anonymous-source attribution → asteya
  // "sources say" suppressed when a named outlet appears within 200 chars
  // (mirrors healthcare's studies_show pattern, which uses keyword inhibitors
  //  rather than capitalisation — capital-letter heuristics break under
  //  the case-insensitive flag).
  //
  // calibrator FP-suppression anchor: mbh-raja-vrtta-dissimulation-12-69
  // (Mbh 12.69 AMBIGUITY entry, medium confidence). Documents that
  // institutional speech-with-attribution (Reuters, Bloomberg, named outlets)
  // is context-bounded legitimate communication — the same FP-suppression
  // logic that distinguishes anonymous denunciation (rājagāmi paiśuna,
  // mahāpātaka-level) from attributed reporting (legitimate institutional
  // speech under the source's institutional role).
  {
    rule: 'asteya',
    name: 'sources_say_en',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: /\b(?:sources?|insiders?|whistleblowers?)\s+(?:are\s+|were\s+|is\s+|was\s+)?(?:say|sayin?g?|report|reporting|claim|claiming|reveal|revealing|tell\s+us|telling\s+us|allege|alleging)\b(?![\s\S]{0,200}\b(?:reuters|bloomberg|associated\s+press|afp|nyt|wsj|npr|bbc|cnn|the\s+(?:new\s+york\s+)?times|the\s+(?:washington\s+)?post|the\s+guardian|wall\s+street\s+journal|financial\s+times|named\s+source|identified\s+as)\b)/i,
    description: 'anonymous "sources say" — no named outlet within range',
  },
  {
    rule: 'asteya',
    name: 'sources_say_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re('(?:источник' + W_STAR + '|инсайдер' + W_STAR + ')\\s+(?:сообща[ею]т|раскрыва[ею]т|утвержда[ею]т|расска(?:зали|зывают))'),
    description: 'anonymous "sources say" (RU)',
  },
  {
    rule: 'asteya',
    name: 'according_to_reports_en',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: /\baccording\s+to\s+(?:reports|sources|insiders|some|many|a\s+report)\b(?![\s\S]{0,150}\b(?:reuters|bloomberg|associated\s+press|afp|nyt|wsj|npr|bbc|cnn|the\s+(?:new\s+york\s+)?times|the\s+(?:washington\s+)?post|the\s+guardian|wall\s+street\s+journal|financial\s+times|named|identified\s+as|by\s+name)\b)/i,
    description: 'vague "according to reports" — no named outlet',
  },
  {
    rule: 'asteya',
    name: 'data_says_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re('по\\s+(?:данным|сведениям|информации)\\s+(?:инсайдер' + W_STAR + '|источник' + W_STAR + '|неназванн' + W_PLUS + '|анонимн' + W_PLUS + ')'),
    description: 'vague-attribution "по данным источников" (RU)',
  },

  // ── Panic-framing → ahimsa
  {
    rule: 'ahimsa',
    name: 'panic_frame_en',
    // catalogue: mbh-mayacara-12-110-26
    regex: /\bpanic\s+(?:in|across|grips|spreads|sweeps|engulfs|sets\s+in)\b/i,
    description: 'panic-framing in news headline / lede',
  },
  {
    rule: 'ahimsa',
    name: 'panic_frame_ru',
    // catalogue: mbh-mayacara-12-110-26
    regex: re('паника\\s+(?:охватила|охватывает|распространя[ею]тся|нараста[ею]т|растёт)'),
    description: 'panic-framing (RU)',
  },

  // ── "Before it's deleted / pока не удалили" → indriya_nigraha
  {
    rule: 'indriya_nigraha',
    name: 'before_deleted_en',
    // catalogue: mbh-mayacara-12-110-26
    regex: /\b(?:read|share|watch|save|download)\s+(?:this\s+)?(?:before|while)\s+(?:it'?s\s+|its\s+)?(?:still\s+)?(?:deleted|removed|taken\s+down|censored|gone|up)\b/i,
    description: 'urgent-before-deletion framing',
  },
  {
    rule: 'indriya_nigraha',
    name: 'before_deleted_ru',
    // catalogue: mbh-mayacara-12-110-26
    regex: re('(?:читай|смотри|поделись|сохрани|скачай)\\s+пока\\s+не\\s+(?:удалили|заблокировали|сняли|зацензурили)'),
    description: 'urgent-before-deletion (RU)',
  },

  // ─────────────────────────────────────────────
  // v0.1.1 — Russian tabloid patterns (real-world coverage gap)
  // Calibrated against KP.ru / Lenta.ru tabloid headlines pulled 2026-05-05.
  // See: vault/04-Projects/.../HONEST-EVALUATION-2026-05-05.md
  // ─────────────────────────────────────────────

  // ── Vague-discovery passive: "Найдено природное средство для X" → satya
  // Matches passive-voice miracle-discovery framing without source.
  // NB: real news always names the discovering institution; tabloid does not.
  {
    rule: 'satya',
    name: 'vague_discovery_passive_ru',
    // catalogue: ns-arthantara-5-2-7
    regex: re(
      '(?:найден[оы]|обнаружен[оы]|раскрыт[оы]|открыт[оы])\\s+' +
      '(?:природное|уникальное|чудо-?|новое|революционное|секретное|единственное|эффективное|простое|неожиданное)\\s+' +
      '(?:средство|способ|метод|лекарство|решение|снадобье|рецепт)'
    ),
    description: 'passive-voice miracle-discovery without source (RU tabloid)',
  },

  // ── Reaction-as-news: "... и озадачил X пользователей сети" → satya
  // Voyeuristic stunt-as-news headline pattern. Tabloid signature in RU
  // domain — narrates a banal action followed by audience emotional reaction
  // as if reaction itself were the news.
  {
    rule: 'satya',
    name: 'reaction_as_news_ru',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: re(
      '(?:и|,)\\s+' +
      '(?:озадачил|восхитил|шокировал|разозлил|удивил|поразил|развеселил|насторожил|испугал|разочаровал|повеселил|возмутил)' +
      W_STAR + '\\s+' +
      '(?:пользователей|подписчиков|зрителей|читателей|сеть|интернет|соцсети|публику|россиян|зрителей)'
    ),
    description: 'voyeuristic reaction-as-news (RU tabloid)',
  },

  // ── Genre-label headline: "Триллер/Скандал/Драма + на/в/с/с участием" → satya
  // Fictional-genre label prefacing news event. Signals editorialised
  // sensationalism, not factual reporting.
  {
    rule: 'satya',
    name: 'genre_label_headline_ru',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re(
      '(?:триллер|скандал|драма|сенсация|трагикомедия|детектив|шоу|цирк)\\s+' +
      '(?:на|в|с|со\\s+|вокруг|в\\s+мире|года)'
    ),
    description: 'fictional-genre label as news headline framing (RU tabloid)',
  },

  // ── Personal-drama judgment: "вдова/жена/муж + ... + забросил/изменил" → ahimsa
  // Family-relationship label + (up to ~80 chars including proper names) +
  // moral-judgment verb. Captures "vdova zabrosila mogilu muzha" pattern —
  // private-life moral framing for public consumption. Routes to ahimsa
  // because the harm is reputational injury without consent.
  // Wider gap than first version: tabloid headlines often interpose proper
  // names (Igorya Kirillova) which break the lowercase-only [а-яё] gap.
  {
    rule: 'ahimsa',
    name: 'personal_drama_judgment_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: new RegExp(
      PRE +
      '(?:вдова|вдовец|жена|муж|невеста|жених|любовница|любовник|пасынок|падчерица|мать|отец|дочь|сын)' +
      '[\\s\\S]{1,80}?' +
      '(?:забросил|бросил|оставил|отказал|изменил|обманул|выгнал|предал|унизил|опозорил|похорон)' +
      W_STAR + POST,
      'iu'
    ),
    description: 'private-relationship moral-judgment headline (RU tabloid)',
  },

  // ─────────────────────────────────────────────
  // v0.1.2 — Phase 1 benchmark gap fixes (zero-FP preserved by inhibitors)
  // Calibrated against 20 FN cases from N=193 RU corpus pulled 2026-05-05.
  // See: BENCHMARK-PHASE1-ANALYSIS-2026-05-05.md
  // ─────────────────────────────────────────────

  // ── Vague-discovery passive (broad): "Найдено / Обнаружено / Раскрыто /
  //    Названо / Стало известно ..." headline-leading without subject
  //    BUT not when a named institution / outlet appears within 100 chars.
  {
    rule: 'satya',
    name: 'vague_discovery_passive_broad_ru',
    // catalogue: ns-arthantara-5-2-7
    regex: new RegExp(
      PRE +
      '(?:найден[оы]|обнаружен[оы]|раскрыт[оы]|назван[оы]|стало\\s+известно)\\s+' +
      '(?:[а-яё]+\\s+){0,5}' +
      '(?:средств|способ|метод|причин|факт|секрет|досье|тайн|загадк|связ|деталь|подробност|обстоятельств)' +
      W_STAR +
      '(?![\\s\\S]{0,150}\\b(?:NTSB|Reuters|Bloomberg|AP|Axios|Spiegel|FT|WSJ|NYT|РАН|РАМН|МВД|ФСБ|СКР|МЧС|Минздрав|Минобороны|Росстат|Росфин|Генпрокуратур|МИД|ВЦИОМ|Левада-центр|Lancet|Nature|Science|NEJM)\\b)' +
      POST,
      'iu'
    ),
    description: 'passive vague-discovery without named source within 150 chars (RU tabloid)',
  },

  // ── Vague-source listicle: "Россиянам / россиянину назвали (лучшие/худшие/...)"
  {
    rule: 'satya',
    name: 'vague_listicle_ru',
    // catalogue: ns-arthantara-5-2-7
    regex: re(
      '(?:россиянам|россиянину|россиянкам|россиянке|жителям|читателям|зрителям|пользователям)\\s+' +
      '(?:назвал|раскрыл|сообщил|перечислил)' +
      W_STAR
    ),
    description: 'passive-recipient listicle frame "россиянам назвали ..." (RU tabloid)',
  },

  // ── Vague subject + sensational reveal: "обычный/неожиданный/секретный/
  //    загадочный + [noun] + (оказался|окутал|стал|раскрыл)"
  {
    rule: 'satya',
    name: 'vague_subject_reveal_ru',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: re(
      '(?:обычный|обычная|обычное|обыкновенный|обыкновенная|неожиданн' + W_STAR +
      '|секретн' + W_STAR + '|загадочн' + W_STAR + '|необычн' + W_STAR + '|тайн' + W_STAR + ')' +
      '\\s+[а-яё]+\\s+' +
      '(?:оказал|окутал|накрыл|шокировал|удивил|поразил)' +
      W_STAR
    ),
    description: 'vague-subject + sensational-reveal verb (RU tabloid)',
  },

  // ── "Российский [city/thing] окутал/накрыл [something]" — vague-place sensational
  {
    rule: 'satya',
    name: 'vague_place_sensational_ru',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: re(
      '(?:российск' + W_STAR + '|русск' + W_STAR + ')\\s+' +
      '(?:город|регион|деревня|село|посёлок|край|область)\\s+' +
      '(?:окутал|накрыл|потряс|охватил|удивил|шокировал)' +
      W_STAR
    ),
    description: 'vague-russian-place + sensational-event verb (RU tabloid)',
  },

  // ── Sensationalist markers (narrow list — tabloid-leaning verbs/adjs)
  {
    rule: 'satya',
    name: 'sensationalist_marker_ru',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: re('воскресит|воскрешает|бушующ' + W_STAR + '|потрясла|ошеломил' + W_STAR + '|ужаснул' + W_STAR),
    description: 'tabloid-leaning sensationalist verb (RU)',
  },

  // ── "Бешеная популярность / спрос / интерес" — sensational adj + abstract noun
  {
    rule: 'satya',
    name: 'sensational_adj_abstract_ru',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: re(
      'бешен' + W_STAR + '\\s+' +
      '(?:популярност|спрос|интерес|мода|резонанс|восторг|ажиотаж)' +
      W_STAR
    ),
    description: 'tabloid sensational-adj + abstract-noun (RU)',
  },

  // ── "На Западе [высказались / неожиданно ...]" — vague-geo political source
  //    Narrow: only "на Западе" (the iconic vague-source frame), NOT "в США/в Китае"
  //    which usually have named officials.
  {
    rule: 'asteya',
    name: 'vague_geo_political_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re(
      'на\\s+западе\\s+' +
      '(?:[а-яё]+\\s+){0,2}' +
      '(?:высказал|заявил|сообщил|отреагировал|обвинил|раскрыл|неожиданно|удивил)' +
      W_STAR
    ),
    description: 'vague-geographic-source "На Западе ..." without named outlet (RU tabloid)',
  },

  // ─────────────────────────────────────────────
  // v0.2.0 — EN modern paradigm patterns
  // Calibrated against multi-region benchmark FN cases (BuzzFeed 21,
  // Fox 7) revealing that 2012-era EN patterns miss contemporary
  // listicle/quiz/SLAMMED-style clickbait.
  // ─────────────────────────────────────────────

  // ── Listicle clickbait: "11 X who Y and 12 who Z" / "26 famous people"
  // Pattern: number + (celebrities|things|reasons|ways|signs|times|moments)
  {
    rule: 'satya',
    name: 'listicle_en',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: /\b\d{1,3}\s+(?:celebrities|celebs|stars|things|reasons|ways|signs|times|moments|movies|songs|recipes|tricks|tips|hacks|secrets|facts|times|actors|actresses|other\s+famous|famous\s+people|of\s+the\s+(?:best|worst|funniest|craziest|wildest))\b/i,
    description: 'numerical-listicle clickbait (e.g. "11 celebrities who...", "26 famous people")',
  },

  // ── Quiz clickbait: "Which X are you" / "Pick X to determine Y"
  {
    rule: 'satya',
    name: 'quiz_en',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: /\b(?:which|what)\s+\w+(?:\s+\w+)?\s+(?:are\s+you|do\s+you|is\s+your|describes\s+you|matches\s+you)\b|\bpick\s+\w+(?:\s+\w+){0,3}\s+to\s+(?:determine|find\s+out|reveal|see|guess)\b|\b(?:everyone\s+is\s+a|are\s+you\s+more)\b/i,
    description: 'personality-quiz clickbait',
  },

  // ── Challenge clickbait: "I (highly) doubt you can" / "I bet you can't"
  {
    rule: 'satya',
    name: 'challenge_en',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: /\bI\s+(?:highly\s+)?(?:doubt|bet|guarantee|swear|wager)\s+(?:you|no\s+one|nobody)\s+can(?:'t|not)?\b|\bno\s+one\s+(?:born\s+after|over|under)\s+\d{4}\s+(?:will\s+be\s+able\s+to|can)\b|\bif\s+you\s+can\s+(?:name|identify|guess|score|solve)\s+(?:all|these|the)\s+\d+\b/i,
    description: 'challenge / "you can\'t do this" clickbait',
  },

  // ── "Got real about" / "Got candid" / "Opens up about" clickbait
  {
    rule: 'satya',
    name: 'got_real_en',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: /\b(?:got\s+(?:real|candid|honest|emotional)|opens?\s+up|spills?(?:\s+the\s+tea)?|breaks?\s+(?:silence|down))\s+about\b/i,
    description: 'celebrity "got real / opens up" emotional-revelation clickbait',
  },

  // ── SLAMMED / DESTROYED / OBLITERATED — capitalized sensationalist verb
  // Pattern: capitalized name + ALLCAPS verb + (target). The all-caps
  // verb is the tell.
  {
    rule: 'satya',
    name: 'slammed_caps_en',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\s+(?:SLAMMED|SLAMS|DESTROYED|DESTROYS|OBLITERATED|ANNIHILATED|EVISCERATED|TORE\s+INTO|RIPS|RIPPED|CALLS\s+OUT|BLASTS|TROLLS)\b/,
    description: 'capitalised sensationalist verb (SLAMMED-style clickbait)',
  },

  // ── "Here's why/what/how X did Y" — Q-resolved teaser
  // Inhibit: legitimate explainer journalism uses "Here's how X works"
  // (factual). The clickbait variant typically has emotional verb or
  // "is doing/did" with celebrity subject.
  {
    rule: 'satya',
    name: 'q_resolved_celeb_en',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: /\bhere'?s\s+(?:why|what|how)\s+\w+(?:\s+\w+)?\s+(?:is|are|did|said|reacted|responded)\b(?![\s\S]{0,80}\b(?:works|happens|operates|explained|study|report|data)\b)/i,
    description: 'Q-resolved celebrity teaser ("Here\'s why X said Y")',
  },

  // ── Drama-reaction headline: "Celebrities are reacting after X"
  {
    rule: 'satya',
    name: 'drama_reaction_en',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: /\b(?:celebrities|celebs|fans|the\s+internet|social\s+media|users|viewers)\s+(?:are\s+(?:reacting|talking|outraged|shocked|loving|hating)|reacted|exploded|went\s+wild|are\s+saying)\b/i,
    description: 'drama-reaction-as-news clickbait (EN tabloid)',
  },

  // ── Sensationalist editorial verb in factual context: "stunning",
  // "harrowing", "incredible", "unbelievable" used as descriptor of
  // routine event. Pattern: editorial-adj followed by event noun.
  {
    rule: 'satya',
    name: 'sensational_editorial_adj_en',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: /\b(?:harrowing|stunning|incredible|unbelievable|jaw-dropping|mind-blowing|breathtaking|heartbreaking|terrifying|devastating)\s+(?:footage|moment|video|photo|image|sight|scene|admission|confession|revelation|discovery|comeback|performance|concert)\b/i,
    description: 'sensational editorial adj + factual-event noun',
  },

  // ── "And X more / 16 more" listicle continuation
  {
    rule: 'satya',
    name: 'and_n_more_en',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: /\band\s+\d{1,3}\s+more\s+(?:famous|celebrities|celebs|times|things|ways|reasons)\b/i,
    description: 'listicle "and N more" continuation',
  },

  // ── "X SLAMMED Y, and everyone's saying the same thing"
  // Composite social-proof + drama
  {
    rule: 'satya',
    name: 'everyones_saying_en',
    // catalogue: bg-asuri-epistemology-16-8
    regex: /\beveryone'?s\s+(?:saying|thinking|noticing|realizing|talking\s+about)\s+(?:the\s+same\s+thing|this|that)\b/i,
    description: 'social-proof "everyone\'s saying" clickbait',
  },

  // ── "Living it up" / "Loving life" — celebrity-life clickbait verb
  {
    rule: 'satya',
    name: 'celebrity_life_clickbait_en',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: /\b(?:living\s+it\s+up|loving\s+life|all\s+smiles|stuns\s+in|turns\s+heads|breaks\s+the\s+internet|spotted\s+with)\b/i,
    description: 'celebrity-lifestyle clickbait verb (EN tabloid)',
  },

  // ── Sensationalist body-metaphor (political): "Пить X-кровь / душить X" → ahimsa
  // Cannibalistic / violent body-metaphor applied to a country or group as
  // headline. Ahimsa (non-violence) violation by dehumanising framing.
  {
    rule: 'ahimsa',
    name: 'sensationalist_body_metaphor_ru',
    // catalogue: manu-vangmaya-karma-12-5-6
    regex: re(
      '(?:пить|сосать|обескровить|обескровл' + W_STAR + '|душить|задушить|давить|раздавить|выпотрошить|сожрать|съесть)' +
      '\\s+(?:[а-яё]+\\s+){0,2}' +
      '(?:кровь|жизнь|душу|плоть|внутренности|нутро)' +
      '(?:\\s+(?:украинск|русск|европейск|американск|еврейск|польск|немецк|белорусск|армянск|грузинск|молдавск|казахск|татарск|чеченск|сирийск|ливийск|иракск|иранск|афганск|пакистанск|китайск|корейск|японск|вьетнамск)' + W_STAR + ')?'
    ),
    description: 'cannibalistic / violent body-metaphor as political headline (RU tabloid)',
  },

  // ─────────────────────────────────────────────
  // v0.3.0 — Real-OOS recall extensions (2026-05-08)
  // Calibrated against learning-cycle-2026-05-08 N=119 fresh-pull corpus
  // showing 5.3% recall vs 92.5% on curated benchmark — see
  // LEARNING-CYCLE-2026-05-08-RESULTS.md for FN groupings.
  // ─────────────────────────────────────────────

  // ── Q-clickbait — family pattern (v0.4.0 broadening from cycle-2.A1)
  // Replaces 5 discrete v0.3.0 patterns with one generative family.
  // Calibrated against cycle-1 frozen + cycle-2 replication FNs:
  //   v0.3.0 caught: «В чем причина?», «Что об этом известно», «Как отреагировал»
  //   v0.4.0 also catches: «что важно знать», «как надо ответить», «что нужно знать»
  {
    rule: 'satya',
    name: 'q_clickbait_family_ru',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re(
      '(?:что|как|почему|зачем)\\s+' +
      '(?:важно|нужно|стоит|следует|интересно|правильно|надо|можно|об\\s+этом)\\s+' +
      '(?:знать|понимать|помнить|учитывать|делать|реагировать|ответить|ответил|отреагировать)'
    ),
    description: 'Q-clickbait family "что/как (важно/нужно/надо/...) (знать/делать/...)" (RU)',
  },
  // Direct-reaction Q-clickbait (no modifier between Q-word and verb)
  // Restored from v0.3.0 — family pattern misses "Как на это отреагировал X"
  {
    rule: 'satya',
    name: 'q_clickbait_direct_reaction_ru',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re('как\\s+(?:на\\s+это\\s+)?(?:отреагировал|ответил)' + W_STAR),
    description: 'Q-clickbait "Как на это отреагировал X" (RU, direct form)',
  },
  {
    rule: 'satya',
    name: 'q_clickbait_in_what_ru',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re('в\\s+чём?\\s+(?:причина|дело|подвох|секрет|смысл|суть)'),
    description: 'Q-clickbait "В чём причина/дело/подвох/секрет" (RU)',
  },
  {
    rule: 'satya',
    name: 'q_clickbait_what_was_famous_ru',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re('чем\\s+(?:он|она|они|это)\\s+(?:был|была|было|были)\\s+(?:знаменит|известен|известна|известны|примечат)' + W_STAR),
    description: 'Q-clickbait "Чем он был знаменит" (RU)',
  },
  {
    rule: 'satya',
    name: 'q_clickbait_will_x_do_ru',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re('будет\\s+ли\\s+[а-яё]+(?:\\s+[а-яё]+){0,4}\\s+(?:соблюдать|выполнять|поддерживать|нарушать|подписывать)'),
    description: 'Q-clickbait "Будет ли X соблюдать/выполнять Y" (RU)',
  },

  // ── Vague reveal: "сделал/раскрыл (что-то) (неожиданное)" → satya
  // v0.4.0 broadening from cycle-2.A1: open verb-list (раскрыл/выдал/поделился)
  // + open noun-list (особенность/деталь/подробность/тайна/...) without
  // requiring sensational adjective. Inhibitor: named source within 100 chars
  // suppresses (mirrors news-pack vague_discovery_passive_broad_ru pattern).
  {
    rule: 'satya',
    name: 'vague_reveal_open_ru',
    // catalogue: ns-arthantara-5-2-7
    regex: new RegExp(
      PRE +
      '(?:раскрыл|раскрыла|раскрыли|выдал|выдала|выдали|поделил' + W_STAR + ')\\s+' +
      '(?:[а-яё]+\\s+){0,2}' +
      '(?:тайн|секрет|особенност|деталь|деталями|подробност|обстоятельств|информаци|нов|новость|правд|истин|причин|факт|данн|план|стратеги|схем|механизм)' +
      W_STAR +
      '(?![\\s\\S]{0,150}\\b(?:Reuters|Bloomberg|AP|Spiegel|FT|WSJ|NYT|РАН|МВД|ФСБ|СКР|МЧС|Минздрав|Минобороны|Росстат|ВЦИОМ|Левада|Lancet|Nature|Science|NEJM|NTSB|FAA|EASA|МАК|по\\s+данным|сообщает)\\b)' +
      POST,
      'iu'
    ),
    description: 'vague-reveal "раскрыл/выдал тайну/особенность" without named source (RU)',
  },
  // Keep narrow v0.3.0 pattern for sensational-adjective cases (additive)
  {
    rule: 'satya',
    name: 'vague_reveal_statement_ru',
    // catalogue: ns-arthantara-5-2-7
    regex: re(
      'сделал[аио]?\\s+' +
      '(?:неожиданн|странн|резонансн|сенсационн|шокирующ|громк|скандальн|дерзк|удивительн|странн)' +
      W_STAR +
      '\\s+(?:заявлени|комментари|признани|откровени|высказывани)' +
      W_STAR
    ),
    description: 'vague-reveal "сделал неожиданное заявление" (RU)',
  },

  // ── v0.4.0 — Western-source broader (cycle-2.A1)
  // Cycle-2 caught only «На Западе X-verb»; replication FN «утверждают
  // западные СМИ» showed pattern was too narrow.
  {
    rule: 'asteya',
    name: 'vague_western_media_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re(
      '(?:утвержда[ею]т|сообща[ею]т|пишут|пишет|заявля[ею]т)\\s+западны' + W_STAR + '\\s+(?:сми|медиа|пресс|изда' + W_STAR + ')'
    ),
    description: 'vague western-media attribution (RU)',
  },
  {
    rule: 'asteya',
    name: 'vague_western_media_inverted_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re(
      'по\\s+данным\\s+западны' + W_STAR + '\\s+(?:сми|пресс|медиа|изда' + W_STAR + ')'
    ),
    description: 'vague "по данным западных СМИ" attribution (RU)',
  },

  // ── v0.4.0 — Managerial moral framing (cycle-2.A1)
  // Cycle-1 covered only family-relationship moral framing; replication FN
  // «Абьюзер в топ-менеджменте», «токсичный руководитель» showed managerial
  // axis exists separately.
  {
    rule: 'ahimsa',
    name: 'managerial_moral_framing_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re(
      '(?:абьюзер|токсик|психопат|социопат|тиран|диктатор|деспот)' + W_STAR +
      '\\s+(?:в\\s+(?:топ-?менеджмент|команд|коллектив|руководств|правлени)|на\\s+посту)'
    ),
    description: 'managerial-context moral-judgment label (RU)',
  },
  {
    rule: 'ahimsa',
    name: 'toxic_leader_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re(
      'токсичн' + W_STAR + '\\s+(?:руководит|босс|менеджер|начальник|лидер|команд|коллектив|корпоратив|культур)' + W_STAR
    ),
    description: 'toxic-leader moral framing (RU)',
  },

  // ── v0.4.0 — Hostage-metaphor in business context (cycle-2.A1)
  // Replication FN «Wildberries держит клиентов в заложниках» — moral
  // metaphor for legitimate corporate behavior.
  {
    rule: 'ahimsa',
    name: 'hostage_metaphor_ru',
    // catalogue: manu-vangmaya-karma-12-5-6
    regex: re(
      'держит\\s+(?:[а-яё]+\\s+){0,3}в\\s+(?:заложник|плену|клетке|оковах|кабале)' + W_STAR
    ),
    description: 'hostage / captivity metaphor in business context (RU)',
  },

  // ── v0.4.0 — Sensational-survival narrative (cycle-2.A1)
  // Replication FN «Подросток упал с 18-метровой высоты в огонь...и выжил» —
  // extraordinary outcome verb without medical/emergency-services attribution.
  {
    rule: 'satya',
    name: 'sensational_survival_ru',
    // catalogue: bg-asuri-self-narration-16-13-15
    regex: new RegExp(
      PRE +
      '(?:упал|упала|упали|разбил' + W_STAR + '|провалил' + W_STAR + '|вылетел|сорвался|загорел' + W_STAR + ')' +
      '[\\s\\S]{1,80}?' +
      '(?:выжил|выжила|выжили|спасся|спаслась|спаслись|уцелел' + W_STAR + ')' +
      '(?![\\s\\S]{0,150}\\b(?:МЧС|МВД|по\\s+данным|сообщает|больниц|госпитал|врач|медик)\\b)' +
      POST,
      'iu'
    ),
    description: 'sensational-survival narrative without emergency-services attribution (RU)',
  },

  // ── Superlative without attribution: "самой масштабной X с начала Y" → satya
  // Tabloid-style record claim without source for the superlative. Real
  // factual reporting attributes superlative claims to a source (Росстат,
  // Минобороны, Reuters). Inhibit when named source within 100 chars.
  {
    rule: 'satya',
    name: 'superlative_no_attribution_ru',
    // catalogue: ns-arthantara-5-2-7
    regex: new RegExp(
      PRE +
      '(?:сам(?:ой|ым|ая|ый|ое|ого|ому)?)\\s+' +
      '(?:масштабн|крупн|больш|серьёзн|жесток|мощн|тяжёл|разрушительн|кровопролитн|трагичн)' +
      W_STAR +
      '(?![\\s\\S]{0,150}\\b(?:Reuters|Bloomberg|AP|Spiegel|FT|WSJ|NYT|РАН|МВД|ФСБ|СКР|МЧС|Минздрав|Минобороны|Росстат|ВЦИОМ|Левада|Lancet|Nature|Science|NEJM|по\\s+данным|сообщает\\s+[А-Я])\\b)' +
      POST,
      'iu'
    ),
    description: 'superlative claim without named-source attribution (RU)',
  },

  // ── Moral-framing label: "родительское/материнское предательство" → ahimsa
  // Tabloid moral-judgment label applied to family relationship in headline,
  // commonly used by Mash. Routes to ahimsa (reputational injury without consent).
  {
    rule: 'ahimsa',
    name: 'family_moral_framing_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re(
      '(?:родительск|материнск|отцовск|супружеск|дружеск|братск|сестринск)' +
      W_STAR + '\\s+' +
      '(?:предательств|преступлени|злодеяни|подлост|низост|насили)' +
      W_STAR
    ),
    description: 'family-relationship moral judgment label (RU tabloid)',
  },

  // ── Slang sensationalism: "Стонкс / треш / кринж / жесть" headline-leading → satya
  // Anglo-slang or Russian slang as headline category, signalling tabloid
  // editorial framing rather than factual reporting.
  {
    rule: 'satya',
    name: 'slang_sensationalism_ru',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: new RegExp(
      PRE +
      '(?:стонкс|треш|кринж|жесть|дичь|зашквар|угар)\\s+(?:года|месяца|недели|дня|сезона|от)' +
      POST,
      'iu'
    ),
    description: 'slang-as-headline-category sensationalism (RU tabloid)',
  },

  // ── Iconic gossip pattern: "X заметили в компании эскорт-..." → ahimsa
  // Voyeuristic personal-life surveillance framing. Differs from celebrity
  // public-event reporting; the "эскорт" / "элит-" qualifier is the tell.
  // Bounded non-greedy gap allows punctuation between "в компании" and label.
  {
    rule: 'ahimsa',
    name: 'gossip_escort_frame_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: new RegExp(
      PRE +
      '(?:заметили|поймали|засняли|подловили)' +
      '[\\s\\S]{1,120}?' +
      '(?:эскорт|элит-эскорт|премиум-элит|премиум-эскорт|содержанк|любовниц)' +
      W_STAR + POST,
      'iu'
    ),
    description: 'celebrity-gossip escort/voyeur framing (RU tabloid)',
  },

  // ── Vague-source verb-before-noun: "сообщил/заявил источник" → asteya
  // Mirror of sources_say_ru (which catches "источник сообщает") for the
  // reverse word order common in RIA-style headlines.
  {
    rule: 'asteya',
    name: 'sources_say_inverted_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re(
      '(?:сообщил|заявил|раскрыл|рассказал|поделился|передал)\\s+(?:источник' + W_STAR + '|инсайдер' + W_STAR + '|собеседник' + W_STAR + ')'
    ),
    description: 'verb-before-noun anonymous source (RU)',
  },

  // ── "Почему X (ведет|нарушает|игнорирует|обещает) ...?" Q-clickbait → satya
  // Differs from analytical journalism — analytical "Почему X" elaborates
  // in body; this pattern is the headline-ending question form.
  {
    rule: 'satya',
    name: 'q_clickbait_why_does_x_ru',
    // catalogue: ns-jalpa-definition-1-2-2
    regex: re(
      'почему\\s+[А-ЯЁ][а-яё]+(?:\\s+[а-яё]+){0,3}\\s+' +
      '(?:ведёт|ведет|нарушает|игнорирует|молчит|обещает|скрывает|обманывает|предаёт|предает)'
    ),
    description: 'Q-clickbait "Почему X нарушает/обманывает/ведёт..." (RU)',
  },

  // ── Extended sensational reporting verbs (расширение quote_then_sensational_verb)
  // Cycle 1 caught "жёстко пригрозил"; corpus shows also "жёстко ответить",
  // "жёстко ответил" used in same editorial position.
  {
    rule: 'satya',
    name: 'sensational_call_to_action_ru',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: re(
      '(?:жёстко|жестко|резко|сурово|свирепо)\\s+' +
      '(?:ответить|ответил|ответила|отреагировать|отреагировал|отреагировала|отомстить|отомстил|наказать|наказал)'
    ),
    description: 'sensational adverb + reactive verb (RU clickbait CTA frame)',
  },

  // ── Quote-as-headline + sensational verb: 〈"...". X жёстко/яростно Y〉 → satya
  // Composite pattern: opens with short quoted statement (or capitalized
  // declaration), then second clause with sensational reporting verb.
  // The "жёстко пригрозил / резко обвинил / яростно атаковал" verb is
  // the editorial tell separating quote-context news from sensationalised.
  {
    rule: 'satya',
    name: 'quote_then_sensational_verb_ru',
    // catalogue: ns-vitanda-definition-1-2-3
    regex: re(
      '(?:жёстко|жестко|яростно|резко|остро|свирепо|гневно)\\s+' +
      '(?:пригрозил|пригрозила|обвинил|обвинила|атаковал|атаковала|раскритиковал|раскритиковала|осудил|осудила|ответил|ответила|обрушился|обрушилась)'
    ),
    description: 'sensational-adverb + reporting-verb (RU clickbait architecture)',
  },

  // ─────────────────────────────────────────────
  // v0.5.0-pre.1 — Parikīrtana detector (SCAFFOLD)
  // catalogue: manu-apavada-parikirtana-4-236
  // Manu 4.237: «dānaṃ ca parikīrtanāt kṣarati» — charity wanes through
  // self-aggrandizement. Detects first-person quantified-giving where
  // the speaker promotes their own giving rather than third-party reportage.
  // Inhibitor planned (not yet wired): third-party attribution markers
  // («сообщает», «according to», named source preceding clause).
  // ─────────────────────────────────────────────
  {
    rule: 'satya',
    name: 'parikirtana_first_person_quantified_giving_ru',
    // catalogue: manu-apavada-parikirtana-4-236
    regex: re(
      '(?:мы|наша\\s+(?:компания|организация|команда|группа))\\s+' +
      // iter-2 verb-list broadening per REPORT.md fix #2:
      // imperfective stems (помог -> помогаем/помогли) + new charitable verbs
      // (спонсир/финансир/оплатил/направил/перевели/перечислил)
      '(?:помог' + W_STAR + '|поддерж' + W_STAR + '|инвестир' + W_STAR + '|пожертв' + W_STAR + '|вложил' + W_STAR + '|выделил' + W_STAR + '|спонсир' + W_STAR + '|финансир' + W_STAR + '|оплатил' + W_STAR + '|направил' + W_STAR + '|перевели|перечислил' + W_STAR + ')\\s+' +
      // iter-2 quantifier broadening per REPORT.md fix #1:
      // accept "более чем X" + свыше / порядка variants
      '(?:уже\\s+)?(?:(?:более|свыше|порядка)\\s+(?:чем\\s+)?)?\\d+\\s+' +
      '(?:рубл' + W_STAR + '|доллар' + W_STAR + '|евро|млн|миллион' + W_STAR + '|тысяч' + W_STAR + '|семей|семь' + W_STAR + '|дет' + W_STAR + '|проект' + W_STAR + '|организаци' + W_STAR + '|человек)'
    ),
    description: 'first-person quantified self-praise after charitable act (parikīrtana)',
  },
  {
    rule: 'satya',
    name: 'parikirtana_first_person_quantified_giving_en',
    // catalogue: manu-apavada-parikirtana-4-236
    // iter-2 broadening per REPORT.md fix #1+#3:
    //   verbs: + gave/granted/gifted/funded/sponsored/financed/supported/backed
    //   quantifier: + more than / approximately
    regex: /\b(?:we|our\s+(?:company|firm|team|organi[sz]ation))\s+(?:have\s+)?(?:already\s+)?(?:donated|invested|contributed|pledged|provided|gave|granted|gifted|funded|sponsored|financed|supported|backed)\s+(?:(?:over|more\s+than|approximately)\s+)?\$?\d[\d,\.]*\s*(?:million|billion|thousand|families|children|projects|people)\b/i,
    description: 'first-person quantified self-praise after charitable act (parikīrtana, EN)',
  },
  {
    rule: 'satya',
    name: 'parikirtana_responsible_self_label_ru',
    // catalogue: manu-apavada-parikirtana-4-236
    // Catches "as a responsible X" first-person framing — combined dharma-flag
    // self-display. Most legitimate news reports describe companies in third
    // person; first-person + dharma-flag is structurally PR-voice.
    regex: re(
      '(?:как|будучи)\\s+ответственн' + W_STAR + '\\s+' +
      '(?:компани' + W_STAR + '|организаци' + W_STAR + '|гражданин' + W_STAR + '|бизнес' + W_STAR + ')' +
      ',?\\s*(?:мы|наша\\s+(?:компания|организация))'
    ),
    description: 'responsible-self-label + first-person follow (parikīrtana via dharma-flag)',
  },

  // ─────────────────────────────────────────────
  // v0.5.0-pre.2 — field-test 2026-05-21 patterns
  // Source: docs/LINGUISTIC-PATTERNS-2026-05-21.md
  // Status: SCAFFOLD — fresh real-corpus probe pending iter-2.
  // ─────────────────────────────────────────────

  // ── P1 · RU curiosity-gap passive at headline start → satya
  // Russian state-media style: passive participle that withholds the noun.
  // Examples (2026-05-21): "Названа роль...", "Раскрыли приказ Зеленского",
  // "Раскрыл смысл Вознесения", "Исследование показало, где...".
  // Inhibitor: legitimate investigative reporting uses these verbs with a
  // legal-actor context — suppress if forensic-context noun appears nearby.
  // NB: no \b after Cyrillic — JS `\b` is ASCII-only even under /u flag.
  // The POST lookahead in re() already handles Unicode-aware boundary.
  {
    rule: 'satya',
    name: 'curiosity_gap_passive_ru_inhibited',
    // catalogue: ns-vitanda-definition-1-2-3
    // Headline-start passive that withholds the noun. Legal-investigative
    // context (следствие/прокуратура/МВД/etc.) suppresses, since wire-style
    // legitimately uses these verbs.
    regex: re(
      '^(?:Названа|Названы|Названо|Раскрыл[аои]|Раскрыли|Обнаружен[ао]|Обнаружены|Стало известно)' +
      '(?![\\s\\S]{0,100}(?:следстви' + W_STAR + '|прокуратур' + W_STAR + '|приговор' + W_STAR +
      '|обвиняем' + W_PLUS + '|подозреваем' + W_PLUS + '|МВД|ФСБ|СК\\s|полици' + W_STAR + '))'
    ),
    description: 'curiosity-gap passive RU with legal-context inhibitor (lesson E: no \\b after Cyrillic)',
  },

  // ── P3 · RU anonymous "Источник:" lead → asteya
  // Symmetric to existing sources_say_en. The pack has sources_say_ru but
  // it requires a verb form ("источники сообщают"); bare "Источник:" lead
  // pattern (today's ru-ria-06) is uncovered.
  // Inhibitor: named outlet or named individual within 200 chars suppresses.
  {
    rule: 'asteya',
    name: 'anonymous_source_lead_ru',
    // catalogue: manu-anrta-mahapataka-11-55
    regex: re(
      '^(?:Источник|Источники|Инсайдер[аы]?|Осведомлённ[ыо][йх])\\s*[:—]\\s*' +
      '(?![\\s\\S]{0,200}\\b(?:Reuters|Bloomberg|AFP|РИА|ТАСС|РБК|Интерфакс|Коммерсант' + W_STAR +
      '|Ведомост' + W_STAR + '|по\\s+словам\\s+\\p{Lu}|named\\s+source)\\b)'
    ),
    description: 'anonymous "Источник:" headline lead without named outlet (RU asteya, symmetric to sources_say_en)',
  },
]);

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const newsPack = Object.freeze({
  id: 'news',
  version: '0.5.0-pre.2',
  description:
    'News / media manipulation detection. Closes the solo-clickbait gap ' +
    'documented in REAL-WORLD-DOMAIN-TESTS by routing news-specific ' +
    'clickbait phrases to satya, anonymous-source phrases to asteya, ' +
    'panic framing to ahimsa, and "before-it\'s-deleted" urgency to ' +
    'indriya_nigraha. Pack violations block independently of the core ' +
    'meta-flag, so a single hit is sufficient to fail.',

  detectionPatterns: PATTERNS,

  // No positive requirements at v0.1.0 — a "must include named source"
  // requirement on news-shaped text would be brittle (no robust way to
  // detect "is this news"). Revisit in v0.2.0 with a calibrated heuristic.
  requirements: Object.freeze([]),

  calibratorOverrides: Object.freeze({
    NOISE_FLOOR: 0.20,
    STRONG_THRESHOLD: 0.55,
  }),

  metadata: Object.freeze({
    regulatoryReferences: [
      'EU Digital Services Act (DSA) Art. 34-35 — systemic-risk mitigation',
      'UK Online Safety Act — misinformation provisions',
      'EU Code of Practice on Disinformation (2022 strengthened)',
      'Brazil PL 2630 (Fake News bill) — for downstream signing of verdicts',
    ],
    intendedUse:
      'Layer on top of news-summarisation agents, headline-generation ' +
      'pipelines, AI-generated social-media posts about current events, ' +
      'editorial-suggestion tools, and any AI-output destined for ' +
      'public distribution about real-world events or claims. Closes ' +
      'the standalone-clickbait gap in core detection.',
    notIntendedUse:
      'NOT a fact-checker. Does NOT validate truth-value of news claims. ' +
      'Does NOT cover image / video manipulation. Does NOT replace ' +
      'editorial review. Pairs well with epistemology pack for ' +
      'historical / scientific claims (different domain).',
    knownGap:
      'No "must-include-source" positive requirement at v0.1.0 — true ' +
      'attribution requires structured input, not free text. v0.2.0 may ' +
      'add a heuristic source-density requirement for headline-shaped ' +
      'output (short text + factual claim + date / number).',
    v050pre1: {
      addedDetectors: [
        'parikirtana_first_person_quantified_giving_ru (manu-apavada-parikirtana-4-236)',
        'parikirtana_first_person_quantified_giving_en (manu-apavada-parikirtana-4-236)',
        'parikirtana_responsible_self_label_ru (manu-apavada-parikirtana-4-236)',
      ],
      status:
        'SCAFFOLD — real-corpus probe 2026-05-09 ran (test-corpus/parikirtana-2026-05-09/). ' +
        'Result: catch 22.2% [9.0%, 45.2%] / FP 0.0% [0.0%, 18.4%] on N=35 (18 pos + 17 neg). ' +
        'Iter-2 trivial fixes APPLIED 2026-05-09 (verb-stem expansion, ' +
        '"более чем X" + "свыше" + "порядка" + EN "more than"/"approximately"; ' +
        'EN verbs: +gave/granted/gifted/funded/sponsored/financed/supported/backed). ' +
        'FRESH HELD-OUT CORPUS PROBE PENDING — no tuning on existing corpus per cycle-2 trap protection. ' +
        'In-scope catch 80% (4/5), out-of-scope 0% (0/13) — detector is precise but ' +
        'narrowly scoped to {помогли|поддержали|инвестировали|пожертвовали|вложили|выделили} ' +
        '+ {donated|invested|contributed|pledged|provided}. NOT promoted to stable.',
      iter2Plan:
        'Iter-2 fixes (deferred until fresh held-out corpus): ' +
        '(1) «более чем X» phrasing — extend prefix to (?:более\\s+(?:чем\\s+)?)?, ' +
        '(2) RU verb stems — add помога/поддержива/спонсиру/финансиру/направил/перевели, ' +
        '(3) EN verbs — add gave/granted/gifted/funded/sponsored/supported. ' +
        'Per CLAUDE.md cycle-2 trap rule: do NOT tune on probe corpus; ' +
        'build fresh corpus for iter-2 validation.',
      antaḥkṣurāNote:
        'Full antaḥkṣurā detection (Mbh 12.152) is two-stage co-occurrence — ' +
        'requires dharma-language + paiśunya/blame in same text. Single-shot ' +
        'regex covers parikīrtana element only. Multi-signal fusion deferred.',
      probeReportPath: 'test-corpus/parikirtana-2026-05-09/REPORT.md',
    },
  }),
});
