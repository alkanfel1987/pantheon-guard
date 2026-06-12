/**
 * pantheon-guard · idiom registry (de) — SEED
 *
 * Немецкий реестр устойчивых выражений — мультиязычное расширение библиотеки
 * идиом (2026-06-12). Назначение и схема идентичны idioms-ru.js / idioms-en.js:
 * ОБЪЯСНИМЫЙ слой (форма фиксирована → лексический матч → переносный смысл +
 * функция + различение манипуляция/мудрость).
 *
 * Идиомы НЕ переводятся дословно — отдельный per-язык реестр (см. multilang-probe
 * 2026-06-12: смысл кросс-язычен через NLI, форма язык-зависима).
 *
 * Поля: idiom, match (плоские подстроки в нормализованном виде — матчер срезает
 * regex-метасимволы), literal, figurative, pragmatics, vrata, asura, manipulative.
 * Нормализация: lowercase, ß→ss, ä/ö/ü сохраняются.
 *
 * Статус: SEED (~18 записей). Только общеизвестные проверяемые идиомы.
 */

export const IDIOM_REGISTRY_DE = Object.freeze([
  // ── DRINGLICHKEIT / urgency · indriya-nigraha · Mahiṣa ──
  { idiom: 'jetzt oder nie', match: ['jetzt oder nie'],
    literal: '—', figurative: 'einziger Moment zu handeln, sonst für immer verloren',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes' },
  { idiom: 'das Eisen schmieden solange es heiss ist', match: ['das eisen schmieden', 'eisen schmieden solange'],
    literal: 'Metall nur schmieden, solange es heiss ist',
    figurative: 'sofort handeln, solange der Moment günstig ist',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },
  { idiom: 'die Gelegenheit beim Schopfe packen', match: ['gelegenheit beim schopf', 'beim schopfe packen'],
    literal: 'die Gelegenheit am Haarschopf greifen',
    figurative: 'die Chance jetzt ergreifen, sonst entgeht sie',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },

  // ── KNAPPHEIT / scarcity · Mahiṣa ──
  { idiom: 'der Zug ist abgefahren', match: ['der zug ist abgefahren', 'zug ist abgefahren', 'letzte chance'],
    literal: 'der Zug ist bereits weg',
    figurative: 'letzte Gelegenheit verpasst / läuft ab',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes' },
  { idiom: 'nur solange der Vorrat reicht', match: ['solange der vorrat reicht', 'nur noch wenige'],
    literal: '—', figurative: 'begrenzter Bestand, jetzt zugreifen',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },

  // ── SOZIALER BEWEIS / social-proof · Namuci ──
  { idiom: 'alle machen es', match: ['alle machen es', 'alle anderen schon', 'verpasse nicht den anschluss'],
    literal: '—', figurative: 'andere sind schon dabei, sei nicht der Zurückgebliebene',
    pragmatics: 'social-proof', vrata: 'satya', asura: 'Namuci', manipulative: 'yes' },

  // ── RISIKO-PUSH / risk-push · Tāraka ──
  { idiom: 'wer nicht wagt der nicht gewinnt', match: ['wer nicht wagt', 'wer wagt gewinnt'],
    literal: '—', figurative: 'ohne Risiko kein Gewinn, also wage es',
    pragmatics: 'risk-push', vrata: 'indriya-nigraha', asura: 'Tāraka', manipulative: 'context' },

  // ── GROWTH-BAIT (Hustle/Infobusiness) · Hiraṇyakaśipu ──
  { idiom: 'passives Einkommen auf Autopilot', match: ['passives einkommen', 'geld im schlaf verdienen', 'auf autopilot'],
    literal: '—', figurative: 'Reichtum ohne Mühe oder Risiko',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'yes',
    note: 'Versprechen mühelosen Einkommens — klassischer Info-Marketing-Köder' },
  { idiom: 'investiere in dich selbst', match: ['investiere in dich', 'investition in dich selbst'],
    literal: '—', figurative: 'Ausgabe für den Kurs als Investition verpackt',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'context' },
  { idiom: 'Millionaer-Mindset', match: ['millionaer-mindset', 'millionaer mindset', 'denke wie ein millionaer'],
    literal: '—', figurative: 'deine Armut sitzt im Kopf, kauf das richtige Mindset',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'context' },
  { idiom: 'verlasse deine Komfortzone', match: ['komfortzone', 'aus der komfortzone'],
    literal: '—', figurative: 'Unbehagen = Wachstum; akzeptiere das Unerwünschte',
    pragmatics: 'growth-bait', vrata: 'indriya-nigraha', asura: 'Hiraṇyakaśipu', manipulative: 'context' },

  // ── FALSCHE EXKLUSIVITÄT / exclusivity · Namuci ──
  { idiom: 'nur für Auserwaehlte', match: ['nur fuer auserwaehlte', 'exklusiver kreis', 'nur auf einladung'],
    literal: '—', figurative: 'du bist besonders, tritt dem erlesenen Kreis bei',
    pragmatics: 'exclusivity', vrata: 'satya', asura: 'Namuci', manipulative: 'context' },

  // ── FALSCHE FÜRSORGE / false-care · Pūtanā ──
  { idiom: 'ich meine es nur gut mit dir', match: ['ich meine es nur gut', 'nur zu deinem besten'],
    literal: '—', figurative: 'Argument als Fürsorge getarnt, um Kritik zu entwaffnen',
    pragmatics: 'false-care', vrata: 'ahimsa', asura: 'Pūtanā', manipulative: 'context' },

  // ── ANTI-MANIPULATIVE WEISHEIT (manipulative:no — NICHT flaggen) ──
  { idiom: 'Eile mit Weile', match: ['eile mit weile'],
    literal: 'eile mit Bedacht',
    figurative: 'Bedächtigkeit ist zuverlässiger als Hast',
    pragmatics: 'none', vrata: 'shaucha', asura: null, manipulative: 'no',
    note: 'Aufruf zur Besonnenheit — Gegenteil von Dringlichkeit' },
  { idiom: 'zu schoen um wahr zu sein', match: ['zu schoen um wahr zu sein'],
    literal: '—', figurative: 'unrealistische Angebote verbergen meist einen Haken',
    pragmatics: 'none', vrata: 'satya', asura: null, manipulative: 'no',
    note: 'Warnung vor Betrug — Anti-Manipulation, nicht flaggen' },
  { idiom: 'erst denken dann handeln', match: ['erst denken dann handeln', 'erst nachdenken'],
    literal: '—', figurative: 'überlege gründlich, bevor du handelst',
    pragmatics: 'none', vrata: 'shaucha', asura: null, manipulative: 'no' },
]);

function norm(s) {
  return s.toLowerCase()
    .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Находит немецкие устойчивые выражения (объяснитель, не вердикт).
 * @param {string} text
 * @returns {Array<{idiom, figurative, pragmatics, vrata, asura, manipulative, note?}>}
 */
export function explainIdiomsDe(text) {
  if (typeof text !== 'string' || !text) return [];
  const n = norm(text);
  const found = [];
  for (const entry of IDIOM_REGISTRY_DE) {
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

export const IDIOM_STATS_DE = Object.freeze({
  total: IDIOM_REGISTRY_DE.length,
  manipulative_yes: IDIOM_REGISTRY_DE.filter((e) => e.manipulative === 'yes').length,
  manipulative_context: IDIOM_REGISTRY_DE.filter((e) => e.manipulative === 'context').length,
  manipulative_no: IDIOM_REGISTRY_DE.filter((e) => e.manipulative === 'no').length,
});
