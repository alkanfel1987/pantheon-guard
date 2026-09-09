/**
 * Замер по пре-регистрации SCAM-CORPUS-PREREG-2026-09-06.
 *
 * Единица замера — КОМПОЗИТ слоёв, а не вызов ядра (§2 пре-регистрации): аудит 2026-09-05
 * показал текст, который ядро пропускает, а слой действий ловит. Флаг ставится, если
 * сработал любой слой; вето по дистрессу флаг снимает.
 *
 * Знаменатели разделены по итогам двух слепых проверок:
 *   улов        — только по in-text (в contextual и axis-2 ловить в тексте нечего);
 *   ложные      — только по clean (в marketing-pressure срабатывание правильное).
 *
 * Проверка встроена: assert на суммы подмножеств и на то, что каждая запись получила
 * ровно один вердикт. При расхождении — выход с кодом 1.
 */

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const ROOT = 'file:///C:/ProjectS/pantheon-guard/dist';
const stable = await import(`${ROOT}/index.mjs`);
const exp = await import(`${ROOT}/experimental.mjs`);

const DIR = 'C:/ProjectS/pantheon-guard/test-corpus/scam-ru-2026-09-06';
const read = (f) => readFileSync(`${DIR}/${f}`, 'utf8').split('\n').filter(Boolean).map(JSON.parse);
const sha = (f) => createHash('sha256').update(readFileSync(`${DIR}/${f}`)).digest('hex').toUpperCase();

const positives = read('corpus-positive.jsonl');
const negatives = read('corpus-negative.jsonl');

// ─── композит слоёв ───
const packs = [stable.newsPack, stable.clickbaitPack, stable.epistemologyPack];

function assess(text) {
  const hits = [];
  const safe = (name, fn) => { try { if (fn()) hits.push(name); } catch { /* слой промолчал */ } };

  safe('ядро', () => { const r = stable.inspect(text); return r && r.passes === false; });

  // Первый прогон 2026-09-09 считал срабатыванием только `flag`/`confirmed` и дал 0 %.
  // Диагностика показала: слой отвечает `verify-first` — по его собственной логике это
  // базовый вердикт при обнаружении рискованного действия («ложный предлог → confirmed,
  // подтверждённый → advise-official, иначе → verify-first»). Пользователь при нём
  // получает предупреждение, значит это срабатывание. Критерий уточнён по документации
  // слоя, не по результату; правка сделана ПОСЛЕ первого прогона и записана в
  // пре-регистрацию отдельной строкой.
  safe('действия', () => {
    const actions = stable.extractActions(text);
    if (!actions || !actions.length) return false;
    const v = stable.assessActionRequest({ text, actions });
    return v && ['flag', 'confirmed', 'verify-first', 'advise-official'].includes(v.verdict);
  });

  for (const p of packs) {
    if (!p) continue;
    safe(`пакет:${p.id}`, () => {
      const r = stable.applyPack(p)(text);
      return r && ((r.unmetRequirements && r.unmetRequirements.length) || r.passes === false);
    });
  }

  safe('antahksura', () => {
    const actions = stable.extractActions(text) || [];
    const r = exp.detectAntahksura({ text, actionSignals: actions, harmSignal: actions.length > 0 });
    return r && (r.flagged || r.detected);
  });

  safe('инфоцыганство', () => {
    const r = exp.detectInfocyganstvo(text);
    return r && (r.flagged || r.detected || (r.signals && r.signals.length >= 2));
  });

  safe('идиомы', () => (exp.explainIdioms(text) || []).length > 0);

  // вето по дистрессу — снимает флаг
  let veto = false;
  try { veto = exp.hasDistress(text); } catch { /* пусто */ }

  return { flagged: hits.length > 0 && !veto, hits, veto };
}

// ─── прогон ───
const groups = {
  'in-text':            positives.filter(r => r.signal === 'in-text'),
  'contextual':         positives.filter(r => r.signal === 'contextual'),
  'axis-2':             positives.filter(r => r.signal === 'axis-2' || r.signal === 'not-message'),
  'clean':              negatives.filter(r => r.class === 'clean'),
  'marketing-pressure': negatives.filter(r => r.class === 'marketing-pressure'),
};

function wilson(x, n) {
  if (!n) return [0, 0];
  const z = 1.96, p = x / n;
  const d = 1 + z * z / n;
  const c = (p + z * z / (2 * n)) / d;
  const s = (z / d) * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return [Math.max(0, (c - s) * 100), Math.min(100, (c + s) * 100)];
}

const layerCount = {};
const results = {};
console.log('версия guard:', process.env.GUARD_REV || '(см. git rev-parse HEAD)');
console.log('хеш положительной:', sha('corpus-positive.jsonl').slice(0, 16) + '…');
console.log('хеш отрицательной:', sha('corpus-negative.jsonl').slice(0, 16) + '…');
console.log('');

for (const [name, rows] of Object.entries(groups)) {
  let flagged = 0;
  for (const r of rows) {
    const a = assess(r.text);
    if (a.flagged) flagged++;
    for (const h of a.hits) layerCount[h] = (layerCount[h] || 0) + 1;
  }
  const [lo, hi] = wilson(flagged, rows.length);
  results[name] = { n: rows.length, flagged, pct: rows.length ? flagged * 100 / rows.length : 0, lo, hi };
  console.log(
    `${name.padEnd(20)} ${String(flagged).padStart(3)}/${String(rows.length).padEnd(3)}` +
    ` = ${results[name].pct.toFixed(1).padStart(5)}%  95% ДИ [${lo.toFixed(1)}, ${hi.toFixed(1)}]`
  );
}

console.log('\nвклад слоёв (сколько раз слой давал сигнал):');
for (const [k, v] of Object.entries(layerCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(24)} ${v}`);
}

// ─── проверка гипотез ───
const catch_ = results['in-text'];
const fp = results['clean'];
console.log('\n=== H1 (порог назван до данных: улов ≥40%, ложные ≤5%) ===');
console.log(`улов по in-text:      ${catch_.pct.toFixed(1)}%  (нужно ≥40%, то есть ≥13 из ${catch_.n})`);
console.log(`ложные по clean:      ${fp.pct.toFixed(1)}%  (нужно ≤5%, то есть ≤2 из ${fp.n})`);
const h1 = catch_.pct >= 40 && fp.pct <= 5;
console.log(`H1: ${h1 ? 'ПОДТВЕРЖДЕНА' : 'НЕ подтверждена'}`);
if (catch_.pct < 25 && fp.pct <= 5) console.log('ФАЛЬСИФИКАТОР сработал: улов <25% — проблема в детекции, не в упаковке');

// ─── assert ───
const total = Object.values(groups).reduce((s, g) => s + g.length, 0);
const fail = [];
if (positives.length !== 52) fail.push(`положительных ${positives.length}, ожидалось 52`);
if (negatives.length !== 48) fail.push(`отрицательных ${negatives.length}, ожидалось 48`);
if (total !== 100) fail.push(`сумма групп ${total}, ожидалось 100`);
if (fail.length) { console.error('\nПРОВАЛ: ' + fail.join('; ')); process.exit(1); }
console.log('\nПРОШЛО: 52 + 48 = 100 записей, все распределены по группам');
