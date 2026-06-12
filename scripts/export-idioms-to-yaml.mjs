/**
 * export-idioms-to-yaml.mjs — 2026-06-12
 *
 * Генерирует СНИМКИ реестров идиом (4 языка) в catalogue YAML для кросс-
 * проектного потребления (конвенция pantheon-vedic-catalogue/lexicons/).
 *
 * НАПРАВЛЕНИЕ: JS → YAML (one-way export). Источник правды = JS-реестры guard
 * (там живёт matcher-логика + per-язык нормализация). YAML — РЕГЕНЕРИРУЕМЫЙ
 * снимок, НЕ редактировать вручную. Так дубль-долг исключён: рассинхрон
 * невозможен, regen в любой момент этой командой.
 *
 * Запуск: node scripts/export-idioms-to-yaml.mjs [outDir]
 *   outDir по умолчанию C:/ProjectS/pantheon-vedic-catalogue/lexicons
 */
import { writeFileSync } from 'node:fs';
import { IDIOM_REGISTRY } from '../src/lexicons/idioms-ru.js';
import { IDIOM_REGISTRY_EN } from '../src/lexicons/idioms-en.js';
import { IDIOM_REGISTRY_DE } from '../src/lexicons/idioms-de.js';
import { IDIOM_REGISTRY_FR } from '../src/lexicons/idioms-fr.js';

const REGISTRIES = {
  ru: IDIOM_REGISTRY, en: IDIOM_REGISTRY_EN, de: IDIOM_REGISTRY_DE, fr: IDIOM_REGISTRY_FR,
};

// Минимальный YAML-эмиттер под нашу схему (строки / массивы строк / null).
function yStr(s) {
  if (s === null || s === undefined) return 'null';
  const str = String(s);
  // квотируем, если есть спецсимволы YAML или ведущие/замыкающие пробелы
  if (/[:#\-?\[\]{}&*!|>'"%@`]|^\s|\s$|^$/.test(str)) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return str;
}
function yArr(arr) {
  return '[' + arr.map(yStr).join(', ') + ']';
}

function emitEntry(e) {
  const lines = [`  - idiom: ${yStr(e.idiom)}`];
  lines.push(`    match: ${yArr(e.match)}`);
  lines.push(`    literal: ${yStr(e.literal)}`);
  lines.push(`    figurative: ${yStr(e.figurative)}`);
  lines.push(`    pragmatics: ${yStr(e.pragmatics)}`);
  lines.push(`    vrata: ${yStr(e.vrata)}`);
  lines.push(`    asura: ${yStr(e.asura)}`);
  lines.push(`    manipulative: ${yStr(e.manipulative)}`);
  if (e.note) lines.push(`    note: ${yStr(e.note)}`);
  return lines.join('\n');
}

const outDir = process.argv[2] || 'C:/ProjectS/pantheon-vedic-catalogue/lexicons';

for (const [lang, reg] of Object.entries(REGISTRIES)) {
  const stats = {
    yes: reg.filter((e) => e.manipulative === 'yes').length,
    context: reg.filter((e) => e.manipulative === 'context').length,
    no: reg.filter((e) => e.manipulative === 'no').length,
  };
  const header = [
    '---',
    'schema_version: 1',
    'type: idiom-lexicon',
    `language: ${lang}`,
    'status: v0.1.0',
    'generated: true   # СНИМОК — не редактировать вручную; regen: node scripts/export-idioms-to-yaml.mjs',
    'source_of_truth: pantheon-guard/src/lexicons/idioms-' + lang + '.js',
    'purpose: |',
    '  Реестр устойчивых выражений (объяснитель манипуляции). Форма фиксирована →',
    '  лексический матч → переносный смысл + функция + различение манип/мудрость.',
    '  Смысл кросс-язычен через NLI; форма язык-зависима (идиомы непереводимы).',
    'catalogue_anchors:',
    '  - mbh-vangmadhura-antahksura-12-152   # false-care idioms feed Antaḥkṣurā stage 1',
    `stats: {total: ${reg.length}, manipulative_yes: ${stats.yes}, context: ${stats.context}, wisdom_no: ${stats.no}}`,
    'entries:',
  ].join('\n');

  const body = reg.map(emitEntry).join('\n');
  const yaml = header + '\n' + body + '\n';
  const path = `${outDir}/idioms-${lang}.yaml`;
  writeFileSync(path, yaml, 'utf8');
  process.stdout.write(`✓ ${path}  (${reg.length} записей: yes=${stats.yes} context=${stats.context} no=${stats.no})\n`);
}
process.stdout.write('\nГотово. YAML — регенерируемый снимок, источник правды в JS.\n');
