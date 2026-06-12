/**
 * Antaḥkṣurā probe — 2026-06-12
 * Двухступенчатый детектор «бритва внутри» (Mbh 12.152): маска заботы (ступень 1,
 * idioms false-care) + скрытый вред/риск-действие (ступень 2, actions).
 *
 * Проверяет: срабатывает ТОЛЬКО при со-встречаемости обеих ступеней.
 * Одна забота без вреда — не флаг. Одно действие без маски — не Antaḥkṣurā
 * (это обычный скам, ловит action-слой). Мультиязычно для ступени 1.
 *
 * Запуск: node examples/antahksura-probe.js
 */
import { detectAntahksura } from '../src/detectors/antahksura.js';

const TESTS = [
  // ── Antaḥkṣurā: обе ступени (ждём detected) ──
  { name: 'забота + перевод денег (RU)', lang: 'ru', expect: true,
    text: 'Я тебе по-человечески говорю, как родному: переведи деньги на безопасный счёт, пока не поздно.' },
  { name: 'забота + код из СМС (RU)', lang: 'ru', expect: true,
    text: 'Я ж тебе не враг, только добра желаю — просто продиктуй код из СМС, я всё улажу.' },
  { name: 'забота + изоляция (RU)', lang: 'ru', expect: true,
    text: 'Я о тебе забочусь, поэтому никому не говори об этом и сделай как я скажу.' },

  // ── НЕ Antaḥkṣurā: только одна ступень ──
  { name: 'забота БЕЗ вреда (RU) — не флаг', lang: 'ru', expect: false,
    text: 'Я по-человечески тебе говорю: отдохни, ты устал.' },
  { name: 'риск-действие БЕЗ маски (RU) — обычный скам, не Antaḥkṣurā', lang: 'ru', expect: false,
    text: 'Переведите деньги на безопасный счёт немедленно.' },
  { name: 'чистый текст (RU)', lang: 'ru', expect: false,
    text: 'Договор подписан, отгрузка в среду.' },

  // ── Мультиязычность ступени 1 (razor через actionSignals от хоста) ──
  { name: 'EN: маска заботы + harm-сигнал хоста', lang: 'en', expect: true,
    harmSignal: true,
    text: "I'm telling you this as a friend, I only want what's best for you." },
  { name: 'EN: маска заботы БЕЗ вреда — не флаг', lang: 'en', expect: false,
    text: "I'm telling you this as a friend, take care of yourself." },
  { name: 'DE: маска заботы + actionSignal хоста', lang: 'de', expect: true,
    actionSignals: ['Aufforderung Fernzugriff zu gewähren'],
    text: 'Ich meine es nur gut mit dir, glaub mir.' },
  { name: 'FR: маска заботы + harm-сигнал', lang: 'fr', expect: true,
    harmSignal: true,
    text: "C'est pour ton bien, fais-moi confiance." },
];

const log = (s) => process.stdout.write(s + '\n');
log('\n' + '═'.repeat(80));
log('  Antaḥkṣurā probe · двухступенчатая со-встречаемость · 2026-06-12');
log('═'.repeat(80));

let pass = 0;
for (const t of TESTS) {
  const r = detectAntahksura({ text: t.text, lang: t.lang, actionSignals: t.actionSignals, harmSignal: t.harmSignal });
  const ok = r.detected === t.expect;
  if (ok) pass++;
  log(`\n${ok ? '✅' : '⚠️ '} [${t.lang}] ${t.name}`);
  log(`     «${t.text.slice(0, 64)}${t.text.length > 64 ? '…' : ''}»`);
  log(`     detected=${r.detected} (ожид ${t.expect})  маска=${r.mask.length} бритва=${r.razor.length}`);
  for (const reason of r.reasons) log(`     · ${reason}`);
}

log('\n' + '─'.repeat(80));
log(`  ИТОГ: ${pass}/${TESTS.length}  · catalogue: mbh-vangmadhura-antahksura-12-152`);
log('─'.repeat(80) + '\n');
process.exitCode = pass === TESTS.length ? 0 : 1;
