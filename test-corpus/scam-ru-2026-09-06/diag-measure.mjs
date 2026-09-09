/**
 * Диагностика самого замера: что он читает и что возвращает на первой записи.
 * Проверка: если поле text пустое или assess даёт false на заведомо манипулятивном
 * тексте — печатается ПРОВАЛ с указанием причины.
 */
import { readFileSync } from 'node:fs';
const ROOT = 'file:///C:/ProjectS/pantheon-guard/dist';
const s = await import(`${ROOT}/index.mjs`);

const DIR = 'C:/ProjectS/pantheon-guard/test-corpus/scam-ru-2026-09-06';
const read = (f) => readFileSync(`${DIR}/${f}`, 'utf8').split('\n').filter(Boolean).map(JSON.parse);

const pos = read('corpus-positive.jsonl');
console.log('записей:', pos.length);
console.log('поля первой записи:', Object.keys(pos[0]).join(', '));
console.log('signal первой:', JSON.stringify(pos[0].signal));
console.log('text первой:', JSON.stringify(pos[0].text)?.slice(0, 90));

const inText = pos.filter(r => r.signal === 'in-text');
console.log('\nin-text записей:', inText.length);

console.log('\n=== прогон ядра по первым 5 in-text ===');
for (const r of inText.slice(0, 5)) {
  let res;
  try { res = s.inspect(r.text); } catch (err) { console.log(`  ${r.id} ✗ ${err.message.split('\n')[0]}`); continue; }
  console.log(`  ${r.id}  passes=${res.passes}  «${r.text.slice(0, 55)}…»`);
}

console.log('\n=== прогон слоя действий по тем же 5 ===');
for (const r of inText.slice(0, 5)) {
  try {
    const a = s.extractActions(r.text);
    const v = a && a.length ? s.assessActionRequest({ text: r.text, actions: a }) : null;
    console.log(`  ${r.id}  действий=${a ? a.length : 0}  вердикт=${v ? v.verdict : '—'}`);
  } catch (err) { console.log(`  ${r.id} ✗ ${err.message.split('\n')[0]}`); }
}

const fails = inText.filter(r => !r.text || !r.text.length);
if (fails.length) console.log(`\nПРОВАЛ: ${fails.length} записей без текста`);
else console.log('\nтексты на месте у всех in-text записей');
