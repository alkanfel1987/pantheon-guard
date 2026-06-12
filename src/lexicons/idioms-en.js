/**
 * pantheon-guard · idiom registry (en) — SEED
 *
 * Английский реестр устойчивых выражений — мультиязычное расширение библиотеки
 * идиом (2026-06-12). Назначение то же, что у idioms-ru.js: ОБЪЯСНИМЫЙ слой
 * (форма фиксирована → лексический матч → раскрытие переносного смысла + функции
 * + различение манипуляция/мудрость).
 *
 * ПОЧЕМУ ОТДЕЛЬНЫЙ ФАЙЛ, а не перевод RU: идиомы НЕ переводятся дословно. Замер
 * multilang-probe.js 2026-06-12 показал — семантический NLI-слой кросс-язычен
 * (смысл берётся на 6 языках одной гипотезой), но РЕЕСТР форм язык-зависим:
 * «bite the bullet» ≠ перевод русской идиомы. Разделение труда: смысл → NLI
 * (мультиязычно), форма/объяснение → per-язык реестр.
 *
 * Поля идентичны idioms-ru.js: idiom, match (нормализованные паттерны),
 * literal, figurative, pragmatics, vrata, asura, manipulative, note?.
 * manipulative: 'yes' | 'context' | 'no'.
 *
 * Статус: SEED (~20 записей: классика + hustle-culture современные).
 * Источник правды в перспективе — pantheon-vedic-catalogue/lexicons/idioms-en.yaml.
 */

export const IDIOM_REGISTRY_EN = Object.freeze([
  // ── URGENCY (false-urgency · indriya-nigraha · Mahiṣa) ──
  { idiom: 'strike while the iron is hot', match: ['strike while the iron'],
    literal: 'forge metal only while it is glowing hot',
    figurative: 'act immediately while the moment is favourable',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context',
    note: 'manipulative in a sales push ("today only"); neutral as life advice' },
  { idiom: 'now or never', match: ['now or never'],
    literal: '—', figurative: 'the only moment to act; refusal = permanent loss',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes' },
  { idiom: 'time is running out', match: ['time is running out', 'running out of time', 'clock is ticking'],
    literal: '—', figurative: 'pressure to act before an (often artificial) deadline',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },

  // ── SCARCITY (scarcity · indriya-nigraha · Mahiṣa) ──
  { idiom: 'the train is leaving', match: ['train is leaving', 'miss the boat', 'last chance to'],
    literal: 'the train/boat is about to depart',
    figurative: 'last chance to join, then it is too late',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes' },
  { idiom: 'while supplies last', match: ['while supplies last', 'before (they are|theyre) gone', 'going fast'],
    literal: '—', figurative: 'limited stock, grab it now',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },

  // ── SOCIAL PROOF / FOMO (satya · Namuci) ──
  { idiom: 'fear of missing out', match: ['fear of missing out', 'fomo', 'dont get left behind', 'everyone is doing it'],
    literal: '—', figurative: 'others are ahead, do not be the one left out',
    pragmatics: 'social-proof', vrata: 'satya', asura: 'Namuci', manipulative: 'yes' },
  { idiom: 'jump on the bandwagon', match: ['jump on the bandwagon', 'get on board before'],
    literal: 'climb onto the moving wagon',
    figurative: 'join the crowd that is already moving',
    pragmatics: 'social-proof', vrata: 'satya', asura: 'Namuci', manipulative: 'context' },
  { idiom: 'smart money is already in', match: ['smart money', 'everyone smart (is|has)', 'the wealthy already'],
    literal: '—', figurative: 'clever people are already in; join or be a fool',
    pragmatics: 'social-proof', vrata: 'satya', asura: 'Namuci', manipulative: 'yes' },

  // ── RISK-PUSH (indriya-nigraha · Tāraka) ──
  { idiom: 'fortune favors the bold', match: ['fortune favou?rs the bold', 'fortune favou?rs the brave'],
    literal: '—', figurative: 'reward comes to risk-takers, so take the risk',
    pragmatics: 'risk-push', vrata: 'indriya-nigraha', asura: 'Tāraka', manipulative: 'context' },
  { idiom: 'no risk no reward', match: ['no risk no reward', 'no pain no gain', 'go big or go home'],
    literal: '—', figurative: 'you must risk to win',
    pragmatics: 'risk-push', vrata: 'indriya-nigraha', asura: 'Tāraka', manipulative: 'context' },
  { idiom: 'get rich or die trying', match: ['get rich or die trying'],
    literal: '—', figurative: 'pursue wealth at all costs',
    pragmatics: 'risk-push', vrata: 'indriya-nigraha', asura: 'Tāraka', manipulative: 'context' },

  // ── GROWTH-BAIT (hustle/infobusiness · satya · Hiraṇyakaśipu) ──
  { idiom: 'passive income on autopilot', match: ['passive income', 'money on autopilot', 'earn while you sleep'],
    literal: '—', figurative: 'wealth without effort or risk',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'yes',
    note: 'promise of effortless income — classic info-marketing hook' },
  { idiom: 'invest in yourself', match: ['invest in yourself'],
    literal: '—', figurative: 'spending on the course framed as investment',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'context' },
  { idiom: 'millionaire mindset', match: ['millionaire mindset', 'rich mindset', 'poverty mindset'],
    literal: '—', figurative: 'your poverty is in your head; buy the right mindset',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'context' },
  { idiom: 'crush it / 10x your life', match: ['crush it', '10x your', 'hustle harder', 'grind now'],
    literal: '—', figurative: 'aggressive self-optimization as moral imperative',
    pragmatics: 'growth-bait', vrata: 'indriya-nigraha', asura: 'Hiraṇyakaśipu', manipulative: 'context' },
  { idiom: 'sleep is for the weak', match: ['sleep is for the weak', 'sleep when youre dead', 'sleep when you are dead'],
    literal: '—', figurative: 'self-neglect glorified as success',
    pragmatics: 'growth-bait', vrata: 'indriya-nigraha', asura: 'Hiraṇyakaśipu', manipulative: 'yes' },

  // ── FALSE EXCLUSIVITY (mada/belonging · Namuci) ──
  { idiom: 'not for everyone', match: ['not for everyone', 'inner circle', 'invite only', 'chosen few'],
    literal: '—', figurative: 'you are special, join the select group',
    pragmatics: 'exclusivity', vrata: 'satya', asura: 'Namuci', manipulative: 'context' },

  // ── FALSE CARE (ahimsa · Pūtanā) ──
  { idiom: 'i am telling you this as a friend', match: ['as a friend', 'i only want whats best for you', 'i care about you, so'],
    literal: '—', figurative: 'advice framed as care to lower the guard',
    pragmatics: 'false-care', vrata: 'ahimsa', asura: 'Pūtanā', manipulative: 'context' },

  // ── ANTI-MANIPULATIVE WISDOM (manipulative:no — do NOT flag) ──
  { idiom: 'look before you leap', match: ['look before you leap'],
    literal: 'check before jumping',
    figurative: 'think carefully before acting',
    pragmatics: 'none', vrata: 'shaucha', asura: null, manipulative: 'no',
    note: 'caution — opposite of urgency; discrimination control' },
  { idiom: 'if it sounds too good to be true', match: ['too good to be true'],
    literal: '—', figurative: 'unrealistic offers usually hide a catch',
    pragmatics: 'none', vrata: 'satya', asura: null, manipulative: 'no',
    note: 'warning against scams — anti-manipulation, do not flag' },
  { idiom: 'there is no such thing as a free lunch', match: ['no such thing as a free lunch', 'no free lunch'],
    literal: '—', figurative: 'everything has a hidden cost',
    pragmatics: 'none', vrata: 'satya', asura: null, manipulative: 'no' },
]);

function norm(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Находит английские устойчивые выражения в тексте (объяснитель, не вердикт).
 * Зеркало explainIdioms из idioms-ru.js.
 * @param {string} text
 * @returns {Array<{idiom, figurative, pragmatics, vrata, asura, manipulative, note?}>}
 */
export function explainIdiomsEn(text) {
  if (typeof text !== 'string' || !text) return [];
  const n = norm(text);
  const found = [];
  for (const entry of IDIOM_REGISTRY_EN) {
    const hit = entry.match.some((m) => {
      try { return new RegExp(norm(m).replace(/\\ /g, ' ')).test(n); }
      catch { return n.includes(norm(m)); }
    });
    if (hit) {
      found.push({
        idiom: entry.idiom, figurative: entry.figurative, pragmatics: entry.pragmatics,
        vrata: entry.vrata, asura: entry.asura, manipulative: entry.manipulative,
        ...(entry.note ? { note: entry.note } : {}),
      });
    }
  }
  return found;
}

export const IDIOM_STATS_EN = Object.freeze({
  total: IDIOM_REGISTRY_EN.length,
  manipulative_yes: IDIOM_REGISTRY_EN.filter((e) => e.manipulative === 'yes').length,
  manipulative_context: IDIOM_REGISTRY_EN.filter((e) => e.manipulative === 'context').length,
  manipulative_no: IDIOM_REGISTRY_EN.filter((e) => e.manipulative === 'no').length,
});
