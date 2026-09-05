#!/usr/bin/env node
/**
 * Экспорт CORPUS из examples/adversarial-corpus.js в JSONL для teacher-labeler.
 *
 * Прямой import нельзя — файл при импорте запускает прогон бенчмарка.
 * Поэтому вырезаем литерал `const CORPUS = [...]` из исходника и вычисляем его
 * изолированно (это чистые объектные литералы, без зависимостей).
 *
 * Запуск: node tools/teacher-labeler/export-adversarial.mjs [--out corpus.jsonl]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', '..', 'examples', 'adversarial-corpus.js');
const outArg = process.argv.indexOf('--out');
const OUT = outArg !== -1 ? process.argv[outArg + 1] : join(HERE, 'data', 'adversarial-corpus.jsonl');

const src = readFileSync(SRC, 'utf-8');
const startMarker = 'const CORPUS = [';
const start = src.indexOf(startMarker);
if (start === -1) { console.error('Маркер `const CORPUS = [` не найден — формат корпуса изменился'); process.exit(1); }
const end = src.indexOf('\n];', start);
if (end === -1) { console.error('Закрывающая `];` не найдена'); process.exit(1); }

const literal = src.slice(start + startMarker.length - 1, end + 2); // "[ ... ]"
const corpus = new Function('return ' + literal)();

import { mkdirSync } from 'node:fs';
mkdirSync(dirname(OUT), { recursive: true });

const lines = corpus.map((c, i) =>
  JSON.stringify({ id: `adv-${String(i).padStart(3, '0')}::${c.cat}::${c.label}`, cat: c.cat, label_src: c.label, expected: c.expected, text: c.text })
);
writeFileSync(OUT, lines.join('\n') + '\n');
console.log(`экспортировано ${corpus.length} записей → ${OUT}`);
const byCat = {};
for (const c of corpus) byCat[c.cat] = (byCat[c.cat] || 0) + 1;
for (const [k, v] of Object.entries(byCat)) console.log(`  ${k}: ${v}`);
