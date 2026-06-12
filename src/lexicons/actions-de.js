/**
 * pantheon-guard · request-action registry (de) — SEED
 *
 * Немецкий скам-слой запрошенных действий. Язык-зависим только реестр форм;
 * классы/проверки/фрейм-профили/композит общие (из actions-ru.js).
 * Локализация рецептов/reasons — отдельный шаг (на детекцию не влияет).
 * Нормализация: lowercase + умлауты ä→ae/ö→oe/ü→ue, ß→ss (как idioms-de).
 */
import { ACTION_CLASSES, PRETEXT_CHECKS } from './actions-ru.js';

export const ACTION_REGISTRY_DE = Object.freeze([
  // EXECUTE
  { id: 'install-update', cls: 'execute',
    re: /(installier|lade?\s*herunter|installiere)\w*\s+(das\s+|die\s+|ein\s+)?(dringende\s+)?(update|aktualisierung|app|programm|software)/,
    label: 'Aufforderung Update/App zu installieren',
    pretext: { claim: 'App braucht ein Update', check: 'app_update_status' },
    vrata: 'ahimsa', asura: 'Tāraka' },
  { id: 'open-attachment', cls: 'execute',
    re: /(oeffne|oeffnen\s+sie)\s+(den\s+|die\s+|das\s+)?(anhang|anlage|datei|dokument)|makros\s+aktivieren/,
    label: 'Aufforderung Anhang zu oeffnen / Makros zu aktivieren',
    pretext: { claim: 'wichtiges Dokument im Anhang', check: 'official_site_direct' },
    vrata: 'ahimsa', asura: 'Tāraka' },

  // REMOTE
  { id: 'remote-access', cls: 'remote',
    re: /anydesk|teamviewer|rustdesk|fernzugriff|fernwartung|bildschirm\s*(freigeben|teilen)/,
    label: 'Aufforderung Fernzugriff zu gewaehren',
    pretext: { claim: 'ein Spezialist erledigt alles fuer Sie', check: 'official_support_ticket' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },

  // NAVIGATE
  { id: 'follow-link', cls: 'navigate',
    re: /(klicken\s+sie|klick)\s+(auf\s+)?(den\s+|diesen\s+)?link|folgen\s+sie\s+dem\s+link/,
    label: 'Aufforderung dem Link zu folgen',
    pretext: { claim: 'Dokument/Auszahlung hinter dem Link', check: 'official_site_direct' },
    vrata: 'satya', asura: 'Namuci' },
  { id: 'login-confirm', cls: 'navigate',
    re: /(bestaetigen|verifizieren|aktualisieren)\s+sie\s+(ihre\s+)?(daten|konto|identitaet)/,
    label: 'Aufforderung Daten zu bestaetigen',
    pretext: { claim: 'Konto muss bestaetigt werden', check: 'official_site_direct' },
    vrata: 'satya', asura: 'Namuci' },

  // SECRET
  { id: 'sms-code', cls: 'secret',
    re: /(nennen|sagen|senden|geben)\s+sie\s+(uns\s+|mir\s+)?(den\s+)?(code|sms-code|bestaetigungscode|tan)/,
    label: 'Anfrage nach SMS-/Bestaetigungscode',
    pretext: { claim: 'Code zum Abbrechen/Schuetzen noetig', check: 'official_callback' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },
  { id: 'card-data', cls: 'secret',
    re: /(nennen|sagen|geben)\s+sie\s+(uns\s+|mir\s+)?(ihre\s+)?(cvv|kartennummer|pin|passwort)|seed-?phrase/,
    label: 'Anfrage nach Karten-/Zugangsdaten',
    pretext: { claim: 'Daten fuer Rueckerstattung/Pruefung noetig', check: 'official_callback' },
    vrata: 'asteya', asura: 'Hiraṇyākṣa' },

  // TRANSFER
  { id: 'safe-account', cls: 'transfer',
    re: /(sicheres|geschuetztes)\s+konto/,
    label: '"sicheres Konto" — klassischer Telefonbetrug',
    pretext: { claim: 'Geld in Gefahr, muss "gerettet" werden', check: 'account_status_official' },
    vrata: 'asteya', asura: 'Pūtanā', note: 'kein legitimes "sicheres Konto" existiert' },
  { id: 'transfer-money', cls: 'transfer',
    re: /(ueberweisen|senden|verschieben)\s+sie\s+(das\s+|ihr\s+)?(geld|betrag|guthaben)/,
    label: 'Aufforderung Geld zu ueberweisen',
    pretext: { claim: 'Ueberweisung rettet/bestaetigt etwas', check: 'account_status_official' },
    vrata: 'asteya', asura: null },

  // ISOLATE
  { id: 'tell-no-one', cls: 'isolate',
    re: /(sagen|erzaehlen)\s+sie\s+(es\s+)?niemandem|niemandem\s+(etwas\s+)?(sagen|erzaehlen)|geheim\s+halten/,
    label: 'Forderung nach Geheimhaltung',
    pretext: null, vrata: 'satya', asura: 'Vṛtra' },
  { id: 'dont-contact', cls: 'isolate',
    re: /(nicht|kein)\s+(die\s+)?(bank|support|polizei)\s+(anrufen|kontaktieren)|rufen\s+sie\s+(nicht|nie)\s+(die\s+)?bank/,
    label: 'Verbot offizielle Stelle zu kontaktieren',
    pretext: null, vrata: 'satya', asura: 'Vṛtra' },
  { id: 'channel-exit', cls: 'isolate',
    re: /(weiter|schreiben\s+sie\s+mir)\s+[^!?]{0,15}(auf\s+)?(whatsapp|telegram|viber|signal)/,
    label: 'Wechsel in privaten Messenger',
    pretext: { claim: 'im Messenger bequemer/schneller', check: 'platform_order_status' },
    vrata: 'satya', asura: 'Vṛtra' },
]);

function norm(s) {
  return s.toLowerCase()
    .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

export function extractActionsDe(text) {
  if (typeof text !== 'string' || !text) return [];
  const n = norm(text);
  const found = [];
  for (const entry of ACTION_REGISTRY_DE) {
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

export const ACTION_STATS_DE = Object.freeze({
  total: ACTION_REGISTRY_DE.length,
  byClass: Object.fromEntries(
    Object.keys(ACTION_CLASSES).map((c) => [c, ACTION_REGISTRY_DE.filter((e) => e.cls === c).length])
  ),
});
