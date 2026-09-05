/**
 * test/public-api-reachability.test.js — каждый заявленный слой достижим снаружи
 *
 * Зачем этот файл существует (аудит 2026-09-04):
 *   Прогон 468/468 тестов был зелёным, а 13 из 24 возможностей не импортировались
 *   из публичного входа: три пакета, два детектора, девять лексиконов и модуль
 *   соответствия существовали в src/, были покрыты тестами — и не экспортировались
 *   из src/index.js. Причина: каждый тест импортирует свой модуль НАПРЯМУЮ по пути,
 *   поэтому набор тестов не наблюдает границу пакета вообще.
 *
 * Что проверяется:
 *   1. STABLE — слои с юнит-тестами достижимы из основного входа.
 *   2. EXPERIMENTAL — слои, подтверждённые только probe-скриптами на синтетике,
 *      достижимы из отдельного входа и НЕ протекают в основной. Экспорт
 *      непроверенного под основным именем = обещание наружу, которого нет за чем.
 *   3. dist/ (если собран) совпадает по составу экспортов с src/. Ловит отставшую
 *      сборку — прецедент: dist от 21.06 против исходников от 01.09.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as stable from '../src/index.js';
import * as experimental from '../src/experimental.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST_MJS = join(HERE, '..', 'dist', 'index.mjs');
const DIST_EXPERIMENTAL_MJS = join(HERE, '..', 'dist', 'experimental.mjs');

/** Слои с настоящими юнит-тестами — контракт для потребителя пакета. */
const STABLE = [
  // ядро
  'inspect', 'detectPatterns', 'detectPatternsCalibrated', 'checkAction', 'wrapAgent',
  // пакеты
  'healthcarePack', 'epistemologyPack', 'newsPack', 'newsDePack', 'newsHiPack',
  'clickbaitPack', 'aiSecurityPack', 'opacityPack', 'spiritualInflationPack',
  // непрозрачность: детектор и определитель языка
  'detectOpacity', 'autoDetectLang',
  // лексикон жаргона (питает opacity)
  'JARGON_TOKENS_RU', 'JARGON_TOKENS_EN', 'JARGON_TOKENS_DE', 'JARGON_TOKENS_FR',
  // скам-слой запрошенных действий
  'extractActions', 'assessActionRequest', 'extractActionsEn', 'extractActionsDe',
  'extractActionsFr', 'ACTION_CLASSES', 'ACTION_REGISTRY',
];

/** Слои, подтверждённые только probe-скриптами на синтетике. */
const EXPERIMENTAL = [
  'detectAntahksura',
  'detectInfocyganstvo', 'detectTestimonialPriceMatch',
  'explainIdioms', 'explainIdiomsEn', 'explainIdiomsDe', 'explainIdiomsFr',
  'IDIOM_REGISTRY', 'IDIOM_STATS',
  'distressMarkers', 'hasDistress', 'DISTRESS_MARKERS',
  'checkCompliance', 'assessComplianceRisk', 'detectLabel',
  'classifyPublicInterest', 'checkAttribution',
];

test('стабильный вход: каждый слой с юнит-тестами достижим', () => {
  const missing = STABLE.filter((name) => typeof stable[name] === 'undefined');
  assert.deepEqual(
    missing, [],
    `не экспортировано из src/index.js: ${missing.join(', ')}`,
  );
});

test('экспериментальный вход: каждый probe-слой достижим', () => {
  const missing = EXPERIMENTAL.filter((name) => typeof experimental[name] === 'undefined');
  assert.deepEqual(
    missing, [],
    `не экспортировано из src/experimental.js: ${missing.join(', ')}`,
  );
});

test('граница честности: непроверенное не протекает в основной вход', () => {
  const leaked = EXPERIMENTAL.filter((name) => typeof stable[name] !== 'undefined');
  assert.deepEqual(
    leaked, [],
    `слои без юнит-тестов видны как стабильные: ${leaked.join(', ')}`,
  );
});

test('сборка не отстала: dist по составу совпадает с src', async (t) => {
  if (!existsSync(DIST_MJS)) {
    t.skip('dist не собран — нечего сверять');
    return;
  }
  const dist = await import(`file://${DIST_MJS.replace(/\\/g, '/')}`);
  const inSrcOnly = Object.keys(stable).filter((k) => !(k in dist));
  assert.deepEqual(
    inSrcOnly, [],
    `есть в src, нет в собранном dist (нужен npm run build): ${inSrcOnly.join(', ')}`,
  );
});

test('сборка не отстала: dist/experimental по составу совпадает с src', async (t) => {
  if (!existsSync(DIST_EXPERIMENTAL_MJS)) {
    t.skip('dist/experimental не собран — нечего сверять');
    return;
  }
  const dist = await import(`file://${DIST_EXPERIMENTAL_MJS.replace(/\\/g, '/')}`);
  const inSrcOnly = Object.keys(experimental).filter((k) => !(k in dist));
  assert.deepEqual(
    inSrcOnly, [],
    `есть в src/experimental, нет в сборке (нужен npm run build): ${inSrcOnly.join(', ')}`,
  );
});
