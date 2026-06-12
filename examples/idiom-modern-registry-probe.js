/**
 * Idiom registry probe — современные + мультиязычные · 2026-06-12
 * Проверка ДЕТЕРМИНИРОВАННОГО реестра (не семантики) на:
 *   1) современных русских выражениях (которые семантика не разделяет);
 *   2) английском реестре (мультиязычность библиотеки);
 *   3) различении манип / контекст / ирония-мудрость.
 * Это объяснитель: находит выражение → метка → расшифровка.
 *
 * Запуск: node examples/idiom-modern-registry-probe.js
 */
import { explainIdioms, IDIOM_STATS } from '../src/lexicons/idioms-ru.js';
import { explainIdiomsEn, IDIOM_STATS_EN } from '../src/lexicons/idioms-en.js';
import { explainIdiomsDe, IDIOM_STATS_DE } from '../src/lexicons/idioms-de.js';
import { explainIdiomsFr, IDIOM_STATS_FR } from '../src/lexicons/idioms-fr.js';

const RU = [
  { t: 'Потом будет только дороже — решайте сейчас.', expect: 'manip' },
  { t: 'Получай пассивный доход на полном автопилоте.', expect: 'manip' },
  { t: 'Пока ты думаешь, другие уже зарабатывают.', expect: 'manip' },
  { t: 'У тебя должно быть мышление миллионера.', expect: 'context' },
  { t: 'Это только для своих, не для всех.', expect: 'context' },
  { t: 'Выйди из зоны комфорта.', expect: 'context' },
  // ирония/мудрость — НЕ флагать
  { t: 'Успешный успех от очередного гуру по успеху.', expect: 'wisdom' },
  { t: 'Это какой-то инфоцыган, не верь.', expect: 'wisdom' },
  { t: 'Бесплатный сыр только в мышеловке.', expect: 'wisdom' },
  { t: 'Договор подписан вчера, отгрузка в среду.', expect: 'none' },
];

const EN = [
  { t: 'Act now — this is your last chance, the train is leaving.', expect: 'manip' },
  { t: 'Earn passive income on autopilot while you sleep.', expect: 'manip' },
  { t: 'Smart money is already in — do not get left behind.', expect: 'manip' },
  { t: 'You need a millionaire mindset to succeed.', expect: 'context' },
  { t: 'This is invite only, for the chosen few.', expect: 'context' },
  { t: 'If it sounds too good to be true, it probably is.', expect: 'wisdom' },
  { t: 'Look before you leap.', expect: 'wisdom' },
  { t: 'The meeting is scheduled for Wednesday at noon.', expect: 'none' },
];

const DE = [
  { t: 'Jetzt oder nie — diese Chance kommt nicht wieder.', expect: 'manip' },
  { t: 'Verdiene passives Einkommen auf Autopilot, im Schlaf.', expect: 'manip' },
  { t: 'Alle anderen sind schon dabei, verpasse nicht den Anschluss.', expect: 'manip' },
  { t: 'Du brauchst ein Millionär-Mindset, um erfolgreich zu sein.', expect: 'context' },
  { t: 'Verlasse deine Komfortzone.', expect: 'context' },
  { t: 'Das klingt zu schön um wahr zu sein.', expect: 'wisdom' },
  { t: 'Eile mit Weile, überstürze nichts.', expect: 'wisdom' },
  { t: 'Das Meeting ist am Mittwoch um zwölf Uhr.', expect: 'none' },
];

const FR = [
  { t: 'Maintenant ou jamais, c est ta dernière chance.', expect: 'manip' },
  { t: 'Gagne un revenu passif en pilote automatique, en dormant.', expect: 'manip' },
  { t: 'Tout le monde le fait déjà, ne rate pas le coche.', expect: 'manip' },
  { t: 'Il te faut une mentalité de riche pour réussir.', expect: 'context' },
  { t: 'Sors de ta zone de confort.', expect: 'context' },
  { t: 'C est trop beau pour être vrai.', expect: 'wisdom' },
  { t: 'Rien ne sert de courir, il faut partir à point.', expect: 'wisdom' },
  { t: 'La réunion est prévue mercredi à midi.', expect: 'none' },
];

const log = (s) => process.stdout.write(s + '\n');

function classify(found) {
  if (found.length === 0) return 'none';
  const manip = found.some((f) => f.manipulative === 'yes' || f.manipulative === 'context');
  const wisdom = found.some((f) => f.manipulative === 'no');
  // ирония-маркер (manipulative:no) перебивает — текст ВЫСМЕИВАЕТ манипуляцию
  if (wisdom && !found.some((f) => f.manipulative === 'yes')) return 'wisdom';
  if (manip && !wisdom) {
    return found.some((f) => f.manipulative === 'yes') ? 'manip' : 'context';
  }
  return manip ? 'manip' : 'wisdom';
}

function run(name, tests, fn) {
  log('\n' + '═'.repeat(78));
  log(`  ${name}`);
  log('═'.repeat(78));
  let ok = 0;
  for (const test of tests) {
    const found = fn(test.t);
    const verdict = classify(found);
    const hit = verdict === test.expect;
    if (hit) ok++;
    log(`${hit ? '✅' : '⚠️ '} [${test.expect}→${verdict}] «${test.t.slice(0, 52)}${test.t.length > 52 ? '…' : ''}»`);
    for (const f of found) {
      const flag = f.manipulative === 'no' ? 'МУДРОСТЬ/ирония' : f.manipulative === 'yes' ? 'МАНИП' : 'контекст';
      log(`     → «${f.idiom}» [${flag}/${f.pragmatics}]`);
    }
  }
  log(`  ── ${ok}/${tests.length} ──`);
  return ok;
}

log(`\nРеестры: RU ${IDIOM_STATS.total} · EN ${IDIOM_STATS_EN.total} · DE ${IDIOM_STATS_DE.total} · FR ${IDIOM_STATS_FR.total}`);

const okRu = run('Современные RU + ирония', RU, explainIdioms);
const okEn = run('Мультиязычность: EN', EN, explainIdiomsEn);
const okDe = run('Мультиязычность: DE', DE, explainIdiomsDe);
const okFr = run('Мультиязычность: FR', FR, explainIdiomsFr);

const total = RU.length + EN.length + DE.length + FR.length;
const okAll = okRu + okEn + okDe + okFr;
log('\n' + '─'.repeat(78));
log(`  ИТОГ: RU ${okRu}/${RU.length} · EN ${okEn}/${EN.length} · DE ${okDe}/${DE.length} · FR ${okFr}/${FR.length}  =  ${okAll}/${total}`);
log('─'.repeat(78) + '\n');
process.exitCode = okAll === total ? 0 : 1;
