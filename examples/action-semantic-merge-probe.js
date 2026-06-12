/**
 * Action semantic-merge probe — 2026-06-12
 * Проверка NLI-recall слоя actions: extractActionsMerged (regex + семантика) →
 * assessActionRequest. Цель показать:
 *   1) семантика ДОБАВЛЯЕТ действие там, где regex-реестр пропустил парафраз;
 *   2) композит ГАСИТ шум семантики: парафраз без давления/фрейм-нарушения →
 *      verify-first (не флаг), предупреждение → не эскалирует;
 *   3) парафраз + давление/фрейм → flag/confirmed.
 *
 * Запуск: node examples/action-semantic-merge-probe.js
 */
import { createEmbedder } from '@pantheon-guard/model-mdeberta-xnli';
import { extractActions, extractActionsMerged, assessActionRequest } from '../src/lexicons/actions-ru.js';

const TESTS = [
  { name: 'парафраз execute, без давления (recall + гашение шума)',
    text: 'Там вышла свежая версия, я скинул ссылочку — просто тыкни и обновись.',
    frame: 'unknown', pressure: [], expectMin: 'verify-first' },
  { name: 'парафраз execute в банк-фрейме + давление',
    text: 'Срочно обновись по ссылке, которую я скинул, иначе доступ потеряешь.',
    frame: 'bank', pressure: ['срочность'], expectMin: 'flag' },
  { name: 'предупреждение (НЕ требование) — композит не должен флагать',
    text: 'Помни: банк никогда не просит сообщить код из смс.',
    frame: 'bank', pressure: [], expectMin: 'none-or-verify' },
  { name: 'парафраз перевода + увод (банк) → confirmed',
    text: 'Перекинь деньги на другой счёт и никому пока не говори.',
    frame: 'bank', pressure: [], expectMin: 'confirmed' },
];

const log = (s) => process.stdout.write(s + '\n');
const embedder = await createEmbedder({ dtype: 'q8' });

log('\n' + '═'.repeat(80));
log('  Action semantic-merge probe · NLI-recall + композит · 2026-06-12');
log('═'.repeat(80));
log(`  Модель: ${embedder.name()} ${embedder.version()}\n`);

for (const t of TESTS) {
  const reg = extractActions(t.text);
  const merged = await extractActionsMerged(t.text, embedder);
  const res = assessActionRequest({ actions: merged, pressure: t.pressure, frame: t.frame });

  log(`\n── ${t.name}`);
  log(`   «${t.text}»`);
  log(`   реестр нашёл: ${reg.length ? reg.map((a) => a.cls).join(',') : '—'}`);
  log(`   merged:       ${merged.map((a) => `${a.cls}${a.source === 'semantic' ? `(sem ${a.confidence})` : ''}`).join(', ') || '—'}`);
  log(`   вердикт: ${res.verdict}  (ожид ~${t.expectMin})`);
  for (const r of res.reasons) log(`     · ${r}`);
}

log('\n' + '─'.repeat(80));
log('  Вывод: семантика = recall-расширение (ловит парафраз); композит решает');
log('  манипулятивность (давление×фрейм×предлог), гася шум одиночного NLI.');
log('  Дисциплина §2: порог 0.6 — эвристика, не калибровано на held-out.');
log('─'.repeat(80) + '\n');
