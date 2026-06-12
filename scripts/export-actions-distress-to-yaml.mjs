/**
 * export-actions-distress-to-yaml.mjs — 2026-06-12
 *
 * Снимки реестров действий (4 языка) + дистресс-veto (ru) в catalogue YAML.
 * НАПРАВЛЕНИЕ: JS → YAML (one-way). Источник правды = JS; YAML регенерируемый
 * снимок (regex сериализуется как .source-строка). Не редактировать вручную.
 *
 * Запуск: node scripts/export-actions-distress-to-yaml.mjs [outDir]
 */
import { writeFileSync } from 'node:fs';
import { ACTION_REGISTRY } from '../src/lexicons/actions-ru.js';
import { ACTION_REGISTRY_EN } from '../src/lexicons/actions-en.js';
import { ACTION_REGISTRY_DE } from '../src/lexicons/actions-de.js';
import { ACTION_REGISTRY_FR } from '../src/lexicons/actions-fr.js';
import { DISTRESS_MARKERS } from '../src/lexicons/distress-ru.js';

const ACTIONS = { ru: ACTION_REGISTRY, en: ACTION_REGISTRY_EN, de: ACTION_REGISTRY_DE, fr: ACTION_REGISTRY_FR };

function yStr(s) {
  if (s === null || s === undefined) return 'null';
  const str = String(s);
  if (/[:#\-?\[\]{}&*!|>'"%@`]|^\s|\s$|^$/.test(str)) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return str;
}

function emitAction(e) {
  const lines = [`  - id: ${yStr(e.id)}`];
  lines.push(`    cls: ${yStr(e.cls)}`);
  lines.push(`    pattern: ${yStr(e.re.source)}   # regex .source`);
  lines.push(`    flags: ${yStr(e.re.flags || '')}`);
  lines.push(`    label: ${yStr(e.label)}`);
  if (e.pretext) {
    lines.push('    pretext:');
    lines.push(`      claim: ${yStr(e.pretext.claim)}`);
    lines.push(`      check: ${yStr(e.pretext.check)}`);
  } else {
    lines.push('    pretext: null   # изоляция: легитимного предлога нет');
  }
  lines.push(`    vrata: ${yStr(e.vrata)}`);
  lines.push(`    asura: ${yStr(e.asura)}`);
  if (e.note) lines.push(`    note: ${yStr(e.note)}`);
  return lines.join('\n');
}

const outDir = process.argv[2] || 'C:/ProjectS/pantheon-vedic-catalogue/lexicons';

for (const [lang, reg] of Object.entries(ACTIONS)) {
  const header = [
    '---', 'schema_version: 1', 'type: action-lexicon', `language: ${lang}`, 'status: v0.1.0',
    'generated: true   # СНИМОК — не редактировать; regen: node scripts/export-actions-distress-to-yaml.mjs',
    `source_of_truth: pantheon-guard/src/lexicons/actions-${lang}.js`,
    'purpose: |',
    '  Скам-слой запрошенных риск-действий (6 классов: execute/remote/navigate/',
    '  secret/transfer/isolate). Форма не прячется (жертва должна понять запрос) →',
    '  детерминированный реестр. Вердикт — за композитом (давление×фрейм×предлог).',
    'catalogue_anchors:',
    '  - mbh-vangmadhura-antahksura-12-152   # isolate+забота → Antaḥkṣurā stage 2',
    `stats: {total: ${reg.length}}`,
    'entries:',
  ].join('\n');
  const yaml = header + '\n' + reg.map(emitAction).join('\n') + '\n';
  const path = `${outDir}/actions-${lang}.yaml`;
  writeFileSync(path, yaml, 'utf8');
  process.stdout.write(`✓ ${path}  (${reg.length} записей)\n`);
}

// distress-veto (ru)
const dHeader = [
  '---', 'schema_version: 1', 'type: distress-veto-lexicon', 'language: ru', 'status: v0.1.0',
  'generated: true   # СНИМОК — не редактировать; regen из guard JS',
  'source_of_truth: pantheon-guard/src/lexicons/distress-ru.js',
  'purpose: |',
  '  ahimsa-veto: маркеры личного дистресса (1-е лицо). Непустой матч → подавить',
  '  флаг манипуляции (крик о помощи не клеймить). Ошибается в безопасную сторону.',
  'entries:',
].join('\n');
const dBody = DISTRESS_MARKERS.map((m) =>
  `  - label: ${yStr(m.label)}\n    pattern: ${yStr(m.re.source)}\n    flags: ${yStr(m.re.flags || '')}`
).join('\n');
const dPath = `${outDir}/distress-ru.yaml`;
writeFileSync(dPath, dHeader + '\n' + dBody + '\n', 'utf8');
process.stdout.write(`✓ ${dPath}  (${DISTRESS_MARKERS.length} маркеров)\n`);
process.stdout.write('\nГотово. YAML — регенерируемый снимок, источник правды в JS.\n');
