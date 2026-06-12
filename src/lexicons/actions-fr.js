/**
 * pantheon-guard · request-action registry (fr) — SEED
 *
 * Французский скам-слой запрошенных действий. Язык-зависим только реестр форм;
 * классы/проверки/фрейм-профили/композит общие (из actions-ru.js).
 * Нормализация: lowercase + снятие диакритики (NFD), как idioms-fr.
 */
import { ACTION_CLASSES, PRETEXT_CHECKS } from './actions-ru.js';

export const ACTION_REGISTRY_FR = Object.freeze([
  // EXECUTE
  { id: 'install-update', cls: 'execute',
    re: /(installez|installe|telechargez|telecharge)\s+(la\s+|cette\s+|une\s+)?(mise\s+a\s+jour|application|appli|logiciel|programme)/,
    label: 'demande d installer une mise a jour/appli',
    pretext: { claim: 'l application a besoin d une mise a jour', check: 'app_update_status' },
    vrata: 'ahimsa', asura: 'Tāraka' },
  { id: 'open-attachment', cls: 'execute',
    re: /ouvrez\s+(la\s+|le\s+|cette\s+)?(piece\s+jointe|fichier|document|annexe)|activez\s+les\s+macros/,
    label: 'demande d ouvrir une piece jointe / activer les macros',
    pretext: { claim: 'document important en piece jointe', check: 'official_site_direct' },
    vrata: 'ahimsa', asura: 'Tāraka' },

  // REMOTE
  { id: 'remote-access', cls: 'remote',
    re: /anydesk|teamviewer|rustdesk|acces\s+a\s+distance|prise\s+en\s+main\s+a\s+distance|partagez\s+votre\s+ecran/,
    label: 'demande d acces a distance / partage d ecran',
    pretext: { claim: 'un specialiste fera tout pour vous', check: 'official_support_ticket' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },

  // NAVIGATE
  { id: 'follow-link', cls: 'navigate',
    re: /(cliquez|cliquer)\s+sur\s+(le\s+|ce\s+)?lien|suivez\s+(le\s+|ce\s+)?lien/,
    label: 'demande de suivre un lien',
    pretext: { claim: 'document/paiement derriere le lien', check: 'official_site_direct' },
    vrata: 'satya', asura: 'Namuci' },
  { id: 'login-confirm', cls: 'navigate',
    re: /(confirmez|verifiez|mettez\s+a\s+jour)\s+vos\s+(donnees|informations|identifiants|compte)/,
    label: 'demande de confirmer ses donnees',
    pretext: { claim: 'le compte doit etre confirme', check: 'official_site_direct' },
    vrata: 'satya', asura: 'Namuci' },

  // SECRET
  { id: 'sms-code', cls: 'secret',
    re: /(donnez|dites|envoyez|communiquez)\s+(moi\s+|nous\s+)?(le\s+)?(code|code\s+sms|code\s+de\s+verification)/,
    label: 'demande du code SMS/verification',
    pretext: { claim: 'code necessaire pour annuler/securiser', check: 'official_callback' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },
  { id: 'card-data', cls: 'secret',
    re: /(donnez|dites|communiquez)\s+(moi\s+|nous\s+)?(votre\s+)?(cvv|numero\s+de\s+carte|code\s+pin|mot\s+de\s+passe)|phrase\s+de\s+recuperation/,
    label: 'demande de donnees de carte/acces',
    pretext: { claim: 'donnees pour remboursement/verification', check: 'official_callback' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },

  // TRANSFER
  { id: 'safe-account', cls: 'transfer',
    re: /compte\s+(securise|sur|protege|de\s+reserve)/,
    label: '"compte securise" — arnaque telephonique classique',
    pretext: { claim: 'argent en danger, a "sauver"', check: 'account_status_official' },
    vrata: 'asteya', asura: 'Pūtanā', note: 'aucun "compte securise" legitime n existe' },
  { id: 'transfer-money', cls: 'transfer',
    re: /(transferez|virez|envoyez|deplacez)\s+(l\s*|votre\s+|la\s+)?(argent|fonds|somme|totalite)/,
    label: 'demande de transferer de l argent',
    pretext: { claim: 'le transfert sauve/confirme quelque chose', check: 'account_status_official' },
    vrata: 'asteya', asura: null },

  // ISOLATE
  { id: 'tell-no-one', cls: 'isolate',
    re: /(ne\s+(le\s+)?dites|n\s+en\s+parlez)\s+a\s+personne|gardez\s+(ca|cela)\s+secret/,
    label: 'exigence de secret',
    pretext: null, vrata: 'satya', asura: 'Vṛtra' },
  { id: 'dont-contact', cls: 'isolate',
    re: /(n\s+appelez|ne\s+contactez)\s+(pas\s+)?(la\s+|le\s+)?(banque|support|police)/,
    label: 'interdiction de contacter un canal officiel',
    pretext: null, vrata: 'satya', asura: 'Vṛtra' },
  { id: 'channel-exit', cls: 'isolate',
    re: /(continuons|ecrivez-moi|contactez-moi)\s+[^!?]{0,15}(sur\s+)?(whatsapp|telegram|viber|signal)/,
    label: 'passage vers une messagerie privee',
    pretext: { claim: 'plus pratique/rapide sur la messagerie', check: 'platform_order_status' },
    vrata: 'satya', asura: 'Vṛtra' },
]);

function norm(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

export function extractActionsFr(text) {
  if (typeof text !== 'string' || !text) return [];
  const n = norm(text);
  const found = [];
  for (const entry of ACTION_REGISTRY_FR) {
    if (entry.re.test(n)) {
      found.push({
        id: entry.id, cls: entry.cls, label: entry.label,
        risk: ACTION_CLASSES[entry.cls].risk,
        pretext: entry.pretext ? { ...entry.pretext, recipe: PRETEXT_CHECKS[entry.pretext.check] } : null,
        vrata: entry.vrata, asura: entry.asura,
        ...(entry.note ? { note: entry.note } : {}),
      });
    }
  }
  return found;
}

export { assessActionRequest } from './actions-ru.js';

export const ACTION_STATS_FR = Object.freeze({
  total: ACTION_REGISTRY_FR.length,
  byClass: Object.fromEntries(
    Object.keys(ACTION_CLASSES).map((c) => [c, ACTION_REGISTRY_FR.filter((e) => e.cls === c).length])
  ),
});
