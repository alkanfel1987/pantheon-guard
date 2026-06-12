/**
 * pantheon-guard · idiom registry (fr) — SEED
 *
 * Французский реестр устойчивых выражений — мультиязычное расширение библиотеки
 * идиом (2026-06-12). Назначение и схема как у idioms-{ru,en,de}.js: ОБЪЯСНИМЫЙ
 * слой (форма фиксирована → лексический матч → переносный смысл + функция +
 * различение манипуляция/мудрость).
 *
 * Идиомы НЕ переводятся дословно — отдельный per-язык реестр.
 *
 * Поля: idiom, match (плоские подстроки, нормализованные — матчер срезает
 * regex-метасимволы), literal, figurative, pragmatics, vrata, asura, manipulative.
 * Нормализация: lowercase, диакритика снимается (é→e, à→a, …) для устойчивого матча.
 *
 * Статус: SEED (~18 записей). Только общеизвестные проверяемые идиомы.
 */

export const IDIOM_REGISTRY_FR = Object.freeze([
  // ── URGENCE / urgency · indriya-nigraha · Mahiṣa ──
  { idiom: 'maintenant ou jamais', match: ['maintenant ou jamais'],
    literal: '—', figurative: 'seul moment pour agir, sinon perdu à jamais',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes' },
  { idiom: 'battre le fer pendant qu il est chaud', match: ['battre le fer', 'le fer pendant qu il est chaud'],
    literal: 'forger le fer tant qu il est chaud',
    figurative: 'agir tout de suite tant que le moment est favorable',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },
  { idiom: 'saisir l occasion', match: ['saisir l occasion', 'profiter de l occasion'],
    literal: 'attraper l occasion',
    figurative: 'profiter de la chance maintenant',
    pragmatics: 'urgency', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },

  // ── RARETÉ / scarcity · Mahiṣa ──
  { idiom: 'derniere chance', match: ['derniere chance', 'le train ne repassera pas', 'plus que quelques'],
    literal: '—', figurative: 'dernière occasion, après il sera trop tard',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'yes' },
  { idiom: 'jusqu a epuisement des stocks', match: ['epuisement des stocks', 'stock limite'],
    literal: '—', figurative: 'stock limité, profitez-en maintenant',
    pragmatics: 'scarcity', vrata: 'indriya-nigraha', asura: 'Mahiṣa', manipulative: 'context' },

  // ── PREUVE SOCIALE / social-proof · Namuci ──
  { idiom: 'tout le monde le fait', match: ['tout le monde le fait', 'ne ratez pas le coche', 'les autres ont deja'],
    literal: '—', figurative: 'les autres y sont déjà, ne reste pas à la traîne',
    pragmatics: 'social-proof', vrata: 'satya', asura: 'Namuci', manipulative: 'yes' },

  // ── RISQUE / risk-push · Tāraka ──
  { idiom: 'qui ne tente rien n a rien', match: ['qui ne tente rien', 'la fortune sourit aux audacieux'],
    literal: '—', figurative: 'sans risque pas de gain, alors ose',
    pragmatics: 'risk-push', vrata: 'indriya-nigraha', asura: 'Tāraka', manipulative: 'context' },

  // ── GROWTH-BAIT (hustle/infobusiness) · Hiraṇyakaśipu ──
  { idiom: 'revenu passif en pilote automatique', match: ['revenu passif', 'gagner de l argent en dormant', 'pilote automatique'],
    literal: '—', figurative: 'richesse sans effort ni risque',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'yes',
    note: 'promesse de revenu sans effort — hameçon classique du marketing' },
  { idiom: 'investis en toi-meme', match: ['investis en toi', 'investir en soi'],
    literal: '—', figurative: 'la dépense pour le cours présentée comme investissement',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'context' },
  { idiom: 'etat d esprit de millionnaire', match: ['etat d esprit de millionnaire', 'mentalite de riche', 'mentalite de pauvre'],
    literal: '—', figurative: 'ta pauvreté est dans ta tête, achète le bon état d esprit',
    pragmatics: 'growth-bait', vrata: 'satya', asura: 'Hiraṇyakaśipu', manipulative: 'context' },
  { idiom: 'sors de ta zone de confort', match: ['zone de confort'],
    literal: '—', figurative: 'inconfort = croissance ; accepte ce que tu ne veux pas',
    pragmatics: 'growth-bait', vrata: 'indriya-nigraha', asura: 'Hiraṇyakaśipu', manipulative: 'context' },

  // ── FAUSSE EXCLUSIVITÉ / exclusivity · Namuci ──
  { idiom: 'reserve a quelques elus', match: ['reserve a quelques elus', 'cercle ferme', 'sur invitation seulement'],
    literal: '—', figurative: 'tu es spécial, rejoins le cercle des élus',
    pragmatics: 'exclusivity', vrata: 'satya', asura: 'Namuci', manipulative: 'context' },

  // ── FAUX SOIN / false-care · Pūtanā ──
  { idiom: 'c est pour ton bien', match: ['c est pour ton bien', 'je te dis ca en ami'],
    literal: '—', figurative: 'argument déguisé en bienveillance pour désarmer la critique',
    pragmatics: 'false-care', vrata: 'ahimsa', asura: 'Pūtanā', manipulative: 'context' },

  // ── SAGESSE ANTI-MANIPULATION (manipulative:no — NE PAS flaguer) ──
  { idiom: 'rien ne sert de courir', match: ['rien ne sert de courir'],
    literal: 'courir ne sert à rien (il faut partir à point — La Fontaine)',
    figurative: 'la précipitation ne mène à rien, mieux vaut la mesure',
    pragmatics: 'none', vrata: 'shaucha', asura: null, manipulative: 'no',
    note: 'appel à la mesure — contraire de l urgence' },
  { idiom: 'trop beau pour etre vrai', match: ['trop beau pour etre vrai'],
    literal: '—', figurative: 'les offres irréalistes cachent souvent un piège',
    pragmatics: 'none', vrata: 'satya', asura: null, manipulative: 'no',
    note: 'mise en garde contre l arnaque — anti-manipulation' },
  { idiom: 'tourner sept fois sa langue', match: ['tourner sept fois sa langue'],
    literal: 'tourner sept fois sa langue avant de parler',
    figurative: 'réfléchir longuement avant d agir/parler',
    pragmatics: 'none', vrata: 'shaucha', asura: null, manipulative: 'no' },
]);

// Снятие диакритики для устойчивого матча (é→e, à→a, ç→c, î→i, …).
function norm(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Находит французские устойчивые выражения (объяснитель, не вердикт).
 * @param {string} text
 * @returns {Array<{idiom, figurative, pragmatics, vrata, asura, manipulative, note?}>}
 */
export function explainIdiomsFr(text) {
  if (typeof text !== 'string' || !text) return [];
  const n = norm(text);
  const found = [];
  for (const entry of IDIOM_REGISTRY_FR) {
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

export const IDIOM_STATS_FR = Object.freeze({
  total: IDIOM_REGISTRY_FR.length,
  manipulative_yes: IDIOM_REGISTRY_FR.filter((e) => e.manipulative === 'yes').length,
  manipulative_context: IDIOM_REGISTRY_FR.filter((e) => e.manipulative === 'context').length,
  manipulative_no: IDIOM_REGISTRY_FR.filter((e) => e.manipulative === 'no').length,
});
