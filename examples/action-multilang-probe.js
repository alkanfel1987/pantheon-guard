/**
 * Action multilang probe — 2026-06-12
 * Мультиязычный скам-слой действий: extractActions{,En,De,Fr} + общий
 * assessActionRequest. Проверяет: реестр форм ловит скам per-язык, композит
 * выносит вердикт (verify-first / flag / confirmed), легитимные/нейтраль чисты.
 *
 * Запуск: node examples/action-multilang-probe.js
 */
import { extractActions, assessActionRequest } from '../src/lexicons/actions-ru.js';
import { extractActionsEn } from '../src/lexicons/actions-en.js';
import { extractActionsDe } from '../src/lexicons/actions-de.js';
import { extractActionsFr } from '../src/lexicons/actions-fr.js';

const CASES = [
  // RU
  { lang: 'ru', ex: extractActions, frame: 'bank', pressure: ['срочность'], expect: 'confirmed',
    text: 'Срочно установите обновление по ссылке и продиктуйте код из смс.' },
  { lang: 'ru', ex: extractActions, frame: 'support', pressure: [], expect: 'flag',
    text: 'Чтобы оформить возврат, установите AnyDesk.' },
  { lang: 'ru', ex: extractActions, frame: 'social', pressure: [], expect: 'none',
    text: 'Спасибо за встречу, до завтра.' },
  // EN
  { lang: 'en', ex: extractActionsEn, frame: 'bank', pressure: ['urgency'], expect: 'confirmed',
    text: 'Transfer your funds to a safe account now and tell no one.' },
  // одиночный secret в банке без давления = 1 условие = flag (не confirmed: тот требует ≥2)
  { lang: 'en', ex: extractActionsEn, frame: 'bank', pressure: [], expect: 'flag',
    text: 'Please read me the verification code to cancel the operation.' },
  { lang: 'en', ex: extractActionsEn, frame: 'support', pressure: [], expect: 'flag',
    text: 'To process the refund, install AnyDesk so I can fix it.' },
  { lang: 'en', ex: extractActionsEn, frame: 'social', pressure: [], expect: 'none',
    text: 'Thanks for the meeting, talk tomorrow.' },
  // DE
  { lang: 'de', ex: extractActionsDe, frame: 'bank', pressure: [], expect: 'confirmed',
    text: 'Überweisen Sie das Geld auf ein sicheres Konto und sagen Sie es niemandem.' },
  { lang: 'de', ex: extractActionsDe, frame: 'support', pressure: [], expect: 'flag',
    text: 'Für die Rückerstattung gewähren Sie bitte Fernzugriff über AnyDesk.' },
  { lang: 'de', ex: extractActionsDe, frame: 'social', pressure: [], expect: 'none',
    text: 'Danke für das Treffen, bis morgen.' },
  // FR
  { lang: 'fr', ex: extractActionsFr, frame: 'bank', pressure: [], expect: 'confirmed',
    text: 'Transférez vos fonds sur un compte sécurisé et n’en parlez à personne.' },
  { lang: 'fr', ex: extractActionsFr, frame: 'support', pressure: [], expect: 'flag',
    text: 'Pour le remboursement, donnez-moi un accès à distance via AnyDesk.' },
  { lang: 'fr', ex: extractActionsFr, frame: 'social', pressure: [], expect: 'none',
    text: 'Merci pour la réunion, à demain.' },
];

const log = (s) => process.stdout.write(s + '\n');
log('\n' + '═'.repeat(80));
log('  Action multilang probe · скам-слой действий 4 языка · 2026-06-12');
log('═'.repeat(80));

let pass = 0;
const byLang = {};
for (const c of CASES) {
  const actions = c.ex(c.text);
  const res = assessActionRequest({ actions, pressure: c.pressure, frame: c.frame });
  const ok = res.verdict === c.expect;
  if (ok) pass++;
  byLang[c.lang] = byLang[c.lang] || { ok: 0, n: 0 };
  byLang[c.lang].n++; if (ok) byLang[c.lang].ok++;
  log(`\n${ok ? '✅' : '⚠️ '} [${c.lang}] вердикт=${res.verdict} (ожид ${c.expect})  действия: ${actions.map((a) => a.cls).join(',') || '—'}`);
  log(`     «${c.text.slice(0, 62)}${c.text.length > 62 ? '…' : ''}»`);
}

log('\n' + '─'.repeat(80));
log('  ИТОГ: ' + Object.entries(byLang).map(([l, s]) => `${l} ${s.ok}/${s.n}`).join(' · ') + `  =  ${pass}/${CASES.length}`);
log('─'.repeat(80) + '\n');
process.exitCode = pass === CASES.length ? 0 : 1;
