/**
 * Разбор: что именно поймано и на чём сработало ложно.
 * Проверка: числа должны сойтись с прогоном замера (6 пойманных, 3 ложных);
 * при расхождении печатается ПРОВАЛ.
 */
import { readFileSync } from 'node:fs';
const ROOT = 'file:///C:/ProjectS/pantheon-guard/dist';
const s = await import(`${ROOT}/index.mjs`);

const DIR = 'C:/ProjectS/pantheon-guard/test-corpus/scam-ru-2026-09-06';
const read = (f) => readFileSync(`${DIR}/${f}`, 'utf8').split('\n').filter(Boolean).map(JSON.parse);
const OK = ['flag', 'confirmed', 'verify-first', 'advise-official'];

function hit(text) {
  try {
    const a = s.extractActions(text);
    if (!a || !a.length) return null;
    const v = s.assessActionRequest({ text, actions: a });
    return OK.includes(v.verdict) ? { verdict: v.verdict, cls: a.map(x => x.cls).join(',') } : null;
  } catch { return null; }
}

const pos = read('corpus-positive.jsonl').filter(r => r.signal === 'in-text');
const neg = read('corpus-negative.jsonl').filter(r => r.class === 'clean');

console.log('=== ПОЙМАНО в положительной части ===');
let c = 0;
for (const r of pos) { const h = hit(r.text); if (h) { c++; console.log(`  ${r.id} [${h.verdict}/${h.cls}] ${r.text.slice(0, 70)}`); } }

console.log('\n=== ПРОПУЩЕНО (первые 12) ===');
let m = 0;
for (const r of pos) { if (!hit(r.text)) { m++; if (m <= 12) console.log(`  ${r.id} ${r.text.slice(0, 72)}`); } }
console.log(`  …всего пропущено: ${m}`);

console.log('\n=== ЛОЖНЫЕ срабатывания на чистых ===');
let f = 0;
for (const r of neg) { const h = hit(r.text); if (h) { f++; console.log(`  ${r.id} [${h.verdict}/${h.cls}] ${r.text.slice(0, 70)}`); } }

console.log(`\nитог: поймано ${c}, пропущено ${m}, ложных ${f}`);
// Ожидание обновлено 2026-09-09 после переноса белого класса из Viveka:
// было 6 пойманных и 3 ложных, стало 6 и 1 — фильтр снял два ложных срабатывания
// и не тронул ни одного верного.
if (c === 6 && f === 1) console.log('ПРОШЛО: числа сходятся с прогоном замера после переноса белого класса');
else console.log(`ПРОВАЛ: ожидалось 6 пойманных и 1 ложное, здесь ${c} и ${f}`);
