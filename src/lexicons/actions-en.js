/**
 * pantheon-guard · request-action registry (en) — SEED
 *
 * Английский скам-слой запрошенных действий. Мультиязычное расширение
 * actions-ru.js (2026-06-12). Язык-зависим ТОЛЬКО реестр форм (regex);
 * классы, проверки предлога, фрейм-профили и композит assessActionRequest —
 * общие (импортируются из actions-ru.js, переиспользуются как есть).
 *
 * NB (локализация): тексты рецептов PRETEXT_CHECKS и reasons композита пока
 * русские (внутренний объяснитель). Локализация вывода — отдельный шаг; на
 * детекцию не влияет (логика по ключам cls/check, не по тексту).
 *
 * Нормализация: lowercase, схлопывание пробелов, срез пунктуации (свой norm —
 * без ё→е, не нужен для en).
 */
import { ACTION_CLASSES, PRETEXT_CHECKS, assessActionRequest } from './actions-ru.js';

export const ACTION_REGISTRY_EN = Object.freeze([
  // ── EXECUTE ──
  { id: 'install-update', cls: 'execute',
    re: /(install|download|run)\s+(the\s+|this\s+|an?\s+)?(urgent\s+)?(update|software|app|application|program)/,
    label: 'request to install/download an update or app',
    pretext: { claim: 'app needs an update', check: 'app_update_status' },
    vrata: 'ahimsa', asura: 'Tāraka' },
  { id: 'open-attachment', cls: 'execute',
    re: /open\s+(the\s+|this\s+)?(attachment|attached|file|document)|enable\s+(macros|content|editing)/,
    label: 'request to open an attachment / enable macros',
    pretext: { claim: 'the attachment holds an important document', check: 'official_site_direct' },
    vrata: 'ahimsa', asura: 'Tāraka' },
  { id: 'disable-protection', cls: 'execute',
    re: /(disable|turn\s+off)\s+(your\s+)?(antivirus|firewall|protection|security)/,
    label: 'request to disable protection',
    pretext: { claim: 'security is blocking a legitimate action', check: 'official_support_ticket' },
    vrata: 'ahimsa', asura: 'Tāraka' },

  // ── REMOTE ──
  { id: 'remote-access', cls: 'remote',
    re: /anydesk|teamviewer|rustdesk|remote\s+(access|control|session)|share\s+your\s+screen|screen[- ]?shar/,
    label: 'request for remote access / screen share',
    pretext: { claim: 'a specialist will fix it for you', check: 'official_support_ticket' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },

  // ── NAVIGATE ──
  { id: 'follow-link', cls: 'navigate',
    re: /(click|follow|go\s+to|open)\s+(the\s+|this\s+)?link|tap\s+(the\s+|this\s+)?link/,
    label: 'request to follow a link',
    pretext: { claim: 'the link has a document/payout/confirmation', check: 'official_site_direct' },
    vrata: 'satya', asura: 'Namuci' },
  { id: 'login-confirm', cls: 'navigate',
    re: /(confirm|verify|update)\s+your\s+(details|account|identity|information)|log\s*in\s+(via|through|using)\s+(the\s+|this\s+)?link/,
    label: 'request to confirm details / log in via link',
    pretext: { claim: 'the account needs confirmation', check: 'official_site_direct' },
    vrata: 'satya', asura: 'Namuci' },

  // ── SECRET (only imperatives; "we never ask for your code" warnings stay clean) ──
  { id: 'sms-code', cls: 'secret',
    re: /(give|tell|send|read|share|enter)\s+(me\s+|us\s+)?(the\s+)?(otp|code|verification\s+code|one[- ]time)/,
    label: 'request for SMS / verification code',
    pretext: { claim: 'the code is needed to cancel/secure an operation', check: 'official_callback' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },
  { id: 'card-data', cls: 'secret',
    re: /(give|tell|send|enter|share)\s+(me\s+|us\s+)?(your\s+)?(cvv|cvc|card\s+number|pin)/,
    label: 'request for card data',
    pretext: { claim: 'data is needed for a refund/check', check: 'official_callback' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },
  { id: 'password', cls: 'secret',
    re: /(give|tell|send|enter|share)\s+(me\s+|us\s+)?(your\s+)?(password|login\s+and\s+password)|seed\s+phrase|recovery\s+phrase/,
    label: 'request for password / seed phrase',
    pretext: { claim: 'needed for verification', check: 'official_callback' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },

  // ── TRANSFER ──
  { id: 'safe-account', cls: 'transfer',
    re: /(safe|secure|reserve|protected)\s+account/,
    label: '"safe account" — classic phone-scam',
    pretext: { claim: 'money is at risk and must be "saved"', check: 'account_status_official' },
    vrata: 'asteya', asura: 'Pūtanā',
    note: 'no legitimate "safe account" exists — strong marker on its own' },
  { id: 'transfer-money', cls: 'transfer',
    re: /(transfer|send|move|wire)\s+(the\s+|your\s+)?(money|funds|the\s+amount|everything)/,
    label: 'request to transfer money',
    pretext: { claim: 'the transfer saves/confirms something', check: 'account_status_official' },
    vrata: 'asteya', asura: null },
  { id: 'crypto-send', cls: 'transfer',
    re: /(send|transfer)\s+[^!?]{0,20}(btc|bitcoin|usdt|eth|crypto|to\s+(this\s+)?wallet)/,
    label: 'request to send cryptocurrency',
    pretext: { claim: 'sending is needed for "verification"/doubling', check: 'official_support_ticket' },
    vrata: 'asteya', asura: null },
  { id: 'off-platform-pay', cls: 'transfer',
    re: /pay\s+(via|through)\s+(the\s+)?link|pay\s+(outside|off)\s+(the\s+)?(platform|site|app)/,
    label: 'pay off-platform / via link',
    pretext: { claim: 'paying via link is faster/cheaper', check: 'platform_order_status' },
    vrata: 'asteya', asura: 'Namuci' },

  // ── ISOLATE (Vṛtra — cut off from external verification) ──
  { id: 'tell-no-one', cls: 'isolate',
    re: /(tell|talk\s+to)\s+(no\s+one|nobody)|(do\s*n['o]?t|don'?t)\s+tell\s+anyone|keep\s+(this\s+)?(a\s+)?secret/,
    label: 'demand for secrecy',
    pretext: null,
    vrata: 'satya', asura: 'Vṛtra',
    note: 'almost no legitimate use — strong marker on its own' },
  { id: 'dont-contact', cls: 'isolate',
    re: /(do\s*n['o]?t|don'?t)\s+(call|contact)\s+(the\s+)?(bank|support|police)/,
    label: 'ban on contacting an official channel',
    pretext: null,
    vrata: 'satya', asura: 'Vṛtra',
    note: 'direct blocking of verification — strongest marker of the class' },
  { id: 'channel-exit', cls: 'isolate',
    re: /(continue|move|message\s+me|contact\s+me)\s+[^!?]{0,15}(on\s+)?(whatsapp|telegram|viber|signal)/,
    label: 'moving off-platform into a private messenger',
    pretext: { claim: 'the messenger is more convenient/faster', check: 'platform_order_status' },
    vrata: 'satya', asura: 'Vṛtra' },
]);

function norm(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Извлекает запрошенные риск-действия из английского текста.
 * @param {string} text
 * @returns {Array<{id, cls, label, risk, pretext, vrata, asura, note?}>}
 */
export function extractActionsEn(text) {
  if (typeof text !== 'string' || !text) return [];
  const n = norm(text);
  const found = [];
  for (const entry of ACTION_REGISTRY_EN) {
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

// Композит общий для всех языков — реэкспорт для удобства хоста.
export { assessActionRequest } from './actions-ru.js';

export const ACTION_STATS_EN = Object.freeze({
  total: ACTION_REGISTRY_EN.length,
  byClass: Object.fromEntries(
    Object.keys(ACTION_CLASSES).map((c) => [c, ACTION_REGISTRY_EN.filter((e) => e.cls === c).length])
  ),
});
