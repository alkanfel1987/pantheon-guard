/**
 * Infocyganstvo probe — 2026-06-12 (pack #5)
 * Композит ≥2 сигналов инфоцыганской схемы; одиночный сигнал — не флаг;
 * ирония-разоблачение подавляется.
 *
 * Запуск: node examples/infocyganstvo-probe.js
 */
import { detectInfocyganstvo } from '../src/detectors/infocyganstvo.js';

const TESTS = [
  // ── схема (≥2 сигнала) — detected ──
  { name: 'доход+срок + growth-bait', expect: true,
    text: 'Получай пассивный доход на автопилоте — заработай 300 000 рублей за месяц по моей системе.' },
  { name: 'guru + дефицит набора', expect: true,
    text: 'Стань миллионером с нашим наставником по деньгам. Осталось 3 места, поток стартует в понедельник.' },
  { name: 'мышление миллионера + доход за срок', expect: true,
    text: 'У тебя должно быть мышление миллионера. Ученики выходят на доход 500к за 60 дней.' },
  { name: 'закрытый клуб + финансовая свобода', expect: true,
    text: 'Закрытый клуб не для всех: путь к финансовой свободе и пассивному доходу.' },

  // ── одиночный сигнал — НЕ флаг ──
  { name: 'только growth-bait идиома (1 сигнал)', expect: false,
    text: 'Инвестируй в себя — это всегда окупается.' },
  { name: 'только вакансия с доходом (1 сигнал, честно)', expect: false,
    text: 'Ищем курьера, доход от 80 000 рублей в месяц, официальное трудоустройство.' },

  // ── ирония-разоблачение — подавление ──
  { name: 'насмешка над инфоцыганом (подавить)', expect: false,
    text: 'Очередной инфоцыган обещает пассивный доход на автопилоте и иксы за месяц — успешный успех.' },

  // ── чистый текст ──
  { name: 'нейтраль', expect: false,
    text: 'Завтра созвон по проекту в 11, пришлю ссылку на встречу.' },
];

const log = (s) => process.stdout.write(s + '\n');
log('\n' + '═'.repeat(80));
log('  Infocyganstvo probe · pack #5 · композит ≥2 сигналов · 2026-06-12');
log('═'.repeat(80));

let pass = 0;
for (const t of TESTS) {
  const r = detectInfocyganstvo(t.text);
  const ok = r.detected === t.expect;
  if (ok) pass++;
  log(`\n${ok ? '✅' : '⚠️ '} ${t.name} → detected=${r.detected} (ожид ${t.expect})${r.ironic ? ' [ирония]' : ''}`);
  log(`     «${t.text.slice(0, 64)}${t.text.length > 64 ? '…' : ''}»`);
  if (r.signals.length) log(`     сигналы(${r.signals.length}): ${r.signals.join(' | ')}`);
}

log('\n' + '─'.repeat(80));
log(`  ИТОГ: ${pass}/${TESTS.length}`);
log('─'.repeat(80) + '\n');
process.exitCode = pass === TESTS.length ? 0 : 1;
