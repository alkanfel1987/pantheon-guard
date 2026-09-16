/**
 * Починка индикатора языка: четыре правила на одних данных · 2026-09-16
 *
 * Предрегистрация: vault …/2026-09-Янтра-движок-конвейеров/Прогоны/2026-09-16-опорный-язык-ПРЕРЕГ.md
 * Вход: C:/ProjectS/pantheon-yantra/data/corpus/semantic/{ru,de,zh,ar,kk}.json — истина = язык файла.
 *
 * Запуск: node examples/lang-id-probe.js
 */
import { readFileSync } from 'node:fs';
import { franc } from 'franc';

const DIR = 'C:/ProjectS/pantheon-yantra/data/corpus/semantic';
const TRUE = { ru: 'rus', de: 'deu', zh: 'cmn', ar: 'arb', kk: 'kaz' };
const CHUNK = 400, MIN_DETECT = 40, CHUNK_OVERRIDE = 200;

const sentenceStarts = (s) => [0, ...[...s.matchAll(/(?<=[.!?。！？])\s+/g)].map((m) => m.index + m[0].length).filter((i) => i < s.length)];
function chunks(text) {
  const starts = sentenceStarts(text), out = [];
  let cs = 0;
  for (let k = 1; k <= starts.length; k++) {
    const end = k < starts.length ? starts[k] : text.length;
    if (end - cs > CHUNK && starts[k - 1] > cs) { out.push(text.slice(cs, starts[k - 1])); cs = starts[k - 1]; }
    for (; end - cs > CHUNK; cs += CHUNK) out.push(text.slice(cs, cs + CHUNK));
  }
  if (cs < text.length) out.push(text.slice(cs));
  return out.filter((c) => c.trim());
}

// D — буквенная примета для кириллицы: различает то, что franc путает на коротком куске
const CYR = /[\u0400-\u04FF]/;
const MARKS = [
  ['kaz', /[әғқңөұүһі]/i],                 // казахские буквы, которых нет в русском
  ['ukr', /[їієґ]/i],
  ['bel', /[ўі]/i],
  ['rus', /[ыэъё]/i],                       // болгарский без ы/э; ъ в болгарском есть, поэтому ы/э решают
];
function byScript(text) {
  if (!CYR.test(text)) return null;
  for (const [code, re] of MARKS) if (re.test(text)) return code;
  return null;
}

// E — письменность решает первой: иероглифы, вязь, кана, хангыль однозначны; кириллица — по буквам из D
const SCRIPTS = [
  ['cmn', /[一-鿿㐀-䶿]/],
  ['jpn', /[぀-ヿ]/],
  ['kor', /[가-힯]/],
  ['arb', /[؀-ۿ]/],
  ['ell', /[Ͱ-Ͽ]/],
  ['heb', /[֐-׿]/],
];
function byWriting(text) {
  for (const [code, re] of SCRIPTS) if (re.test(text)) return code;
  return byScript(text);
}

const RULES = {
  'A по куску': (chunk, whole) => (chunk.trim().length >= MIN_DETECT ? franc(chunk) : whole),
  'B по тексту': (chunk, whole) => whole,
  'C текст + длинный кусок': (chunk, whole) => (chunk.trim().length >= CHUNK_OVERRIDE ? franc(chunk) : whole),
  'D буквы + текст': (chunk, whole) => byScript(chunk) || byScript(chunk + ' ' + chunk) || whole,
  'E письменность + текст': (chunk, whole) => byWriting(chunk) || whole,
};

const stats = {};
for (const [lang, truth] of Object.entries(TRUE)) {
  const items = JSON.parse(readFileSync(`${DIR}/${lang}.json`, 'utf8'));
  for (const name of Object.keys(RULES)) (stats[name] ??= {})[lang] = { ok: 0, n: 0, textsOk: 0, texts: 0, wrong: {} };
  for (const it of items) {
    const whole = franc(it.text);
    const cs = chunks(it.text);
    for (const [name, rule] of Object.entries(RULES)) {
      const s = stats[name][lang];
      let good = 0;
      for (const c of cs) {
        const got = rule(c, whole);
        s.n++;
        if (got === truth) { s.ok++; good++; } else s.wrong[got] = (s.wrong[got] || 0) + 1;
      }
      s.texts++;
      if (good > cs.length / 2) s.textsOk++;
    }
  }
}

for (const [name, byLang] of Object.entries(stats)) {
  const line = Object.entries(byLang).map(([l, s]) => `${l} ${(100 * s.ok / s.n).toFixed(0)}%`).join(' · ');
  const all = Object.values(byLang).reduce((a, s) => ({ ok: a.ok + s.ok, n: a.n + s.n }), { ok: 0, n: 0 });
  console.log(`${name.padEnd(24)} всего ${(100 * all.ok / all.n).toFixed(1)}% · ${line}`);
}
console.log('\nчастые ошибки по правилам (язык: что выдано × сколько):');
for (const [name, byLang] of Object.entries(stats)) {
  for (const [l, s] of Object.entries(byLang)) {
    const top = Object.entries(s.wrong).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (top.length) console.log(`  ${name} · ${l}: ${top.map(([k, v]) => `${k}×${v}`).join(', ')}`);
  }
}
