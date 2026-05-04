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
    regex: /\b(?:shocking|hidden|forbidden|dark)\s+(?:secret|truth|fact)s?\b/i,
    description: 'shocking-secret framing — fabricated epistemic exclusivity',
  },
  {
    rule: 'satya',
    name: 'shocking_secret_ru',
    regex: re('(?:шокирующ' + W_PLUS + '|скрыт' + W_PLUS + '|запретн' + W_PLUS + '|тёмн' + W_PLUS + ')\\s+(?:секрет' + W_STAR + '|правд' + W_PLUS + '|истин' + W_PLUS + '|факт' + W_STAR + ')'),
    description: 'shocking-secret framing (RU)',
  },
  {
    rule: 'satya',
    name: 'shocking_bang_ru',
    regex: re('шок!|сенсация!|разоблачени(?:е|я)!'),
    description: 'sensation-bang framing (RU)',
  },

  // ── "Secret nobody knows" composite → satya
  {
    rule: 'satya',
    name: 'secret_nobody_knows_en',
    regex: /\bsecret\s+(?:that\s+)?(?:nobody|no\s+one)\s+(?:knows|wants\s+to\s+(?:tell|share))\b/i,
    description: 'composite "secret nobody knows" — fabricated exclusivity',
  },

  // ── "They don't want you to..." conspiracy frame → satya
  {
    rule: 'satya',
    name: 'they_dont_want_en',
    regex: /\bthey\s+(?:don'?t|do\s+not)\s+want\s+you\s+to\s+(?:know|see|hear|find\s+out|read)\b/i,
    description: 'they-don\'t-want-you frame — anonymous-conspiracy assertion',
  },
  {
    rule: 'satya',
    name: 'they_dont_want_ru',
    regex: re('(?:скрыва[ею]т|прячут|умалчива[ею]т)\\s+(?:от\\s+(?:вас|тебя|нас|народа|людей|общества))'),
    description: 'they-hide-from-you frame (RU)',
  },

  // ── "You won't believe" → satya
  {
    rule: 'satya',
    name: 'you_wont_believe_en',
    regex: /\byou\s+(?:won'?t|will\s+not|wont)\s+believe\s+(?:what|how|why|this|the)\b/i,
    description: 'you-won\'t-believe clickbait',
  },
  {
    rule: 'satya',
    name: 'you_wont_believe_ru',
    regex: re('вы не поверите|невозможно поверить'),
    description: 'you-won\'t-believe clickbait (RU)',
  },

  // ── "Media silence / о чём молчат СМИ" → satya
  {
    rule: 'satya',
    name: 'media_silence_ru',
    regex: re('о чём (?:молчат|умалчива[ею]т|не говорят)\\s+(?:СМИ|медиа|власти|учёные|пресса|официальн' + W_PLUS + '|правительств' + W_STAR + ')'),
    description: 'media-silence conspiracy frame (RU)',
  },
  {
    rule: 'satya',
    name: 'media_silence_en',
    regex: /\bwhat\s+(?:the\s+)?(?:mainstream\s+|corporate\s+|legacy\s+|liberal\s+|leftist\s+|big\s+)?(?:media|press|news|government|officials)\s+(?:won'?t|wont|do(?:es)?n'?t|never)\s+(?:tell|say|report|cover|show|admit)\b/i,
    description: 'media-silence conspiracy frame (EN)',
  },

  // ── "Doctors / experts hate this" → satya
  {
    rule: 'satya',
    name: 'experts_hate_en',
    regex: /\b(?:doctors|experts|scientists|professionals|insiders|the\s+experts)\s+(?:hate|don'?t\s+want\s+you\s+to\s+know|are\s+furious\s+about)\b/i,
    description: 'experts-hate clickbait — fabricated authority opposition',
  },
  {
    rule: 'satya',
    name: 'experts_hate_ru',
    regex: re('(?:врачи|эксперты|учёные|специалисты|профессионалы)\\s+(?:ненавидят|в ярости|боятся)\\s+(?:это|этого|такого)'),
    description: 'experts-hate clickbait (RU)',
  },

  // ── Standalone "exposed!" / "revealed!" with bang → satya
  // (plain "exposed in court documents" is fine; the bang + adjacency to
  //  no source is the tell)
  {
    rule: 'satya',
    name: 'exposed_bang_en',
    regex: /\b(?:exposed|revealed|uncovered)\s*[!]+/i,
    description: 'sensational-bang framing on exposed/revealed',
  },

  // ── "Will change everything" → satya
  // Subject can be anything — "This new discovery will change everything",
  // "AI will change everything", etc. The grandiose framing is the tell.
  {
    rule: 'satya',
    name: 'change_everything_en',
    regex: /\b(?:will|is\s+going\s+to|could|may|might)\s+change\s+(?:everything|the\s+(?:world|future)|history|how\s+we\s+(?:see|think|live|work))\b/i,
    description: 'totalising-impact prediction without source',
  },
  {
    rule: 'satya',
    name: 'change_everything_ru',
    regex: re('(?:это|то|оно)\\s+(?:изменит|перевернёт|разрушит)\\s+(?:всё|мир|историю|представлени' + W_PLUS + ')'),
    description: 'totalising-impact prediction (RU)',
  },

  // ── Anonymous-source attribution → asteya
  // "sources say" suppressed when a named outlet appears within 200 chars
  // (mirrors healthcare's studies_show pattern, which uses keyword inhibitors
  //  rather than capitalisation — capital-letter heuristics break under
  //  the case-insensitive flag).
  {
    rule: 'asteya',
    name: 'sources_say_en',
    regex: /\b(?:sources?|insiders?|whistleblowers?)\s+(?:are\s+|were\s+|is\s+|was\s+)?(?:say|sayin?g?|report|reporting|claim|claiming|reveal|revealing|tell\s+us|telling\s+us|allege|alleging)\b(?![\s\S]{0,200}\b(?:reuters|bloomberg|associated\s+press|afp|nyt|wsj|npr|bbc|cnn|the\s+(?:new\s+york\s+)?times|the\s+(?:washington\s+)?post|the\s+guardian|wall\s+street\s+journal|financial\s+times|named\s+source|identified\s+as)\b)/i,
    description: 'anonymous "sources say" — no named outlet within range',
  },
  {
    rule: 'asteya',
    name: 'sources_say_ru',
    regex: re('(?:источник' + W_STAR + '|инсайдер' + W_STAR + ')\\s+(?:сообща[ею]т|раскрыва[ею]т|утвержда[ею]т|расска(?:зали|зывают))'),
    description: 'anonymous "sources say" (RU)',
  },
  {
    rule: 'asteya',
    name: 'according_to_reports_en',
    regex: /\baccording\s+to\s+(?:reports|sources|insiders|some|many|a\s+report)\b(?![\s\S]{0,150}\b(?:reuters|bloomberg|associated\s+press|afp|nyt|wsj|npr|bbc|cnn|the\s+(?:new\s+york\s+)?times|the\s+(?:washington\s+)?post|the\s+guardian|wall\s+street\s+journal|financial\s+times|named|identified\s+as|by\s+name)\b)/i,
    description: 'vague "according to reports" — no named outlet',
  },
  {
    rule: 'asteya',
    name: 'data_says_ru',
    regex: re('по\\s+(?:данным|сведениям|информации)\\s+(?:инсайдер' + W_STAR + '|источник' + W_STAR + '|неназванн' + W_PLUS + '|анонимн' + W_PLUS + ')'),
    description: 'vague-attribution "по данным источников" (RU)',
  },

  // ── Panic-framing → ahimsa
  {
    rule: 'ahimsa',
    name: 'panic_frame_en',
    regex: /\bpanic\s+(?:in|across|grips|spreads|sweeps|engulfs|sets\s+in)\b/i,
    description: 'panic-framing in news headline / lede',
  },
  {
    rule: 'ahimsa',
    name: 'panic_frame_ru',
    regex: re('паника\\s+(?:охватила|охватывает|распространя[ею]тся|нараста[ею]т|растёт)'),
    description: 'panic-framing (RU)',
  },

  // ── "Before it's deleted / pока не удалили" → indriya_nigraha
  {
    rule: 'indriya_nigraha',
    name: 'before_deleted_en',
    regex: /\b(?:read|share|watch|save|download)\s+(?:this\s+)?(?:before|while)\s+(?:it'?s\s+|its\s+)?(?:still\s+)?(?:deleted|removed|taken\s+down|censored|gone|up)\b/i,
    description: 'urgent-before-deletion framing',
  },
  {
    rule: 'indriya_nigraha',
    name: 'before_deleted_ru',
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
    regex: re('воскресит|воскрешает|бушующ' + W_STAR + '|потрясла|ошеломил' + W_STAR + '|ужаснул' + W_STAR),
    description: 'tabloid-leaning sensationalist verb (RU)',
  },

  // ── "Бешеная популярность / спрос / интерес" — sensational adj + abstract noun
  {
    rule: 'satya',
    name: 'sensational_adj_abstract_ru',
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
    regex: /\b\d{1,3}\s+(?:celebrities|celebs|stars|things|reasons|ways|signs|times|moments|movies|songs|recipes|tricks|tips|hacks|secrets|facts|times|actors|actresses|other\s+famous|famous\s+people|of\s+the\s+(?:best|worst|funniest|craziest|wildest))\b/i,
    description: 'numerical-listicle clickbait (e.g. "11 celebrities who...", "26 famous people")',
  },

  // ── Quiz clickbait: "Which X are you" / "Pick X to determine Y"
  {
    rule: 'satya',
    name: 'quiz_en',
    regex: /\b(?:which|what)\s+\w+(?:\s+\w+)?\s+(?:are\s+you|do\s+you|is\s+your|describes\s+you|matches\s+you)\b|\bpick\s+\w+(?:\s+\w+){0,3}\s+to\s+(?:determine|find\s+out|reveal|see|guess)\b|\b(?:everyone\s+is\s+a|are\s+you\s+more)\b/i,
    description: 'personality-quiz clickbait',
  },

  // ── Challenge clickbait: "I (highly) doubt you can" / "I bet you can't"
  {
    rule: 'satya',
    name: 'challenge_en',
    regex: /\bI\s+(?:highly\s+)?(?:doubt|bet|guarantee|swear|wager)\s+(?:you|no\s+one|nobody)\s+can(?:'t|not)?\b|\bno\s+one\s+(?:born\s+after|over|under)\s+\d{4}\s+(?:will\s+be\s+able\s+to|can)\b|\bif\s+you\s+can\s+(?:name|identify|guess|score|solve)\s+(?:all|these|the)\s+\d+\b/i,
    description: 'challenge / "you can\'t do this" clickbait',
  },

  // ── "Got real about" / "Got candid" / "Opens up about" clickbait
  {
    rule: 'satya',
    name: 'got_real_en',
    regex: /\b(?:got\s+(?:real|candid|honest|emotional)|opens?\s+up|spills?(?:\s+the\s+tea)?|breaks?\s+(?:silence|down))\s+about\b/i,
    description: 'celebrity "got real / opens up" emotional-revelation clickbait',
  },

  // ── SLAMMED / DESTROYED / OBLITERATED — capitalized sensationalist verb
  // Pattern: capitalized name + ALLCAPS verb + (target). The all-caps
  // verb is the tell.
  {
    rule: 'satya',
    name: 'slammed_caps_en',
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
    regex: /\bhere'?s\s+(?:why|what|how)\s+\w+(?:\s+\w+)?\s+(?:is|are|did|said|reacted|responded)\b(?![\s\S]{0,80}\b(?:works|happens|operates|explained|study|report|data)\b)/i,
    description: 'Q-resolved celebrity teaser ("Here\'s why X said Y")',
  },

  // ── Drama-reaction headline: "Celebrities are reacting after X"
  {
    rule: 'satya',
    name: 'drama_reaction_en',
    regex: /\b(?:celebrities|celebs|fans|the\s+internet|social\s+media|users|viewers)\s+(?:are\s+(?:reacting|talking|outraged|shocked|loving|hating)|reacted|exploded|went\s+wild|are\s+saying)\b/i,
    description: 'drama-reaction-as-news clickbait (EN tabloid)',
  },

  // ── Sensationalist editorial verb in factual context: "stunning",
  // "harrowing", "incredible", "unbelievable" used as descriptor of
  // routine event. Pattern: editorial-adj followed by event noun.
  {
    rule: 'satya',
    name: 'sensational_editorial_adj_en',
    regex: /\b(?:harrowing|stunning|incredible|unbelievable|jaw-dropping|mind-blowing|breathtaking|heartbreaking|terrifying|devastating)\s+(?:footage|moment|video|photo|image|sight|scene|admission|confession|revelation|discovery|comeback|performance|concert)\b/i,
    description: 'sensational editorial adj + factual-event noun',
  },

  // ── "And X more / 16 more" listicle continuation
  {
    rule: 'satya',
    name: 'and_n_more_en',
    regex: /\band\s+\d{1,3}\s+more\s+(?:famous|celebrities|celebs|times|things|ways|reasons)\b/i,
    description: 'listicle "and N more" continuation',
  },

  // ── "X SLAMMED Y, and everyone's saying the same thing"
  // Composite social-proof + drama
  {
    rule: 'satya',
    name: 'everyones_saying_en',
    regex: /\beveryone'?s\s+(?:saying|thinking|noticing|realizing|talking\s+about)\s+(?:the\s+same\s+thing|this|that)\b/i,
    description: 'social-proof "everyone\'s saying" clickbait',
  },

  // ── "Living it up" / "Loving life" — celebrity-life clickbait verb
  {
    rule: 'satya',
    name: 'celebrity_life_clickbait_en',
    regex: /\b(?:living\s+it\s+up|loving\s+life|all\s+smiles|stuns\s+in|turns\s+heads|breaks\s+the\s+internet|spotted\s+with)\b/i,
    description: 'celebrity-lifestyle clickbait verb (EN tabloid)',
  },

  // ── Sensationalist body-metaphor (political): "Пить X-кровь / душить X" → ahimsa
  // Cannibalistic / violent body-metaphor applied to a country or group as
  // headline. Ahimsa (non-violence) violation by dehumanising framing.
  {
    rule: 'ahimsa',
    name: 'sensationalist_body_metaphor_ru',
    regex: re(
      '(?:пить|сосать|обескровить|обескровл' + W_STAR + '|душить|задушить|давить|раздавить|выпотрошить|сожрать|съесть)' +
      '\\s+(?:[а-яё]+\\s+){0,2}' +
      '(?:кровь|жизнь|душу|плоть|внутренности|нутро)' +
      '(?:\\s+(?:украинск|русск|европейск|американск|еврейск|польск|немецк|белорусск|армянск|грузинск|молдавск|казахск|татарск|чеченск|сирийск|ливийск|иракск|иранск|афганск|пакистанск|китайск|корейск|японск|вьетнамск)' + W_STAR + ')?'
    ),
    description: 'cannibalistic / violent body-metaphor as political headline (RU tabloid)',
  },
]);

// ─────────────────────────────────────────────
// Pack export
// ─────────────────────────────────────────────

export const newsPack = Object.freeze({
  id: 'news',
  version: '0.2.0',
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
  }),
});
