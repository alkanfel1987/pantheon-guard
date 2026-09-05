#!/usr/bin/env node
/**
 * teacher-labeler — разметка корпусов через Claude Code headless (`claude -p`).
 *
 * Реализует принцип «Claude строит guard, не является guard»: Claude = учитель-
 * разметчик, результат = автономный артефакт (JSONL с метками).
 *
 * Доступ: квота Max-тарифа (без API-ключа). Дисциплина расхода — политика
 * ~/.claude/refs/model-optimization-policy.md §6: проба перед массовым прогоном
 * (--limit 20 по умолчанию), дешёвая модель по умолчанию (haiku).
 *
 * Запуск:
 *   node tools/teacher-labeler/label.mjs --in corpus.jsonl --out labels.jsonl
 *        [--model haiku] [--limit 20] [--sleep 1000] [--prompt prompts/manipulation-label.md]
 *        [--dry]
 *
 * Вход:  JSONL, каждая строка {id, text, ...} (лишние поля сохраняются в выходе).
 * Выход: JSONL {id, model, label: {verdict, classes, confidence, rationale}, raw, ts}.
 * Возобновляемость: уже размеченные id (по --out) пропускаются.
 *
 * Известный тупик (ops cookbook 2026-05-16): внутри сессии Claude Code env
 * содержит host-managed ANTHROPIC_API_KEY, который перебивает OAuth и валит
 * standalone `claude -p` с 401 → скрипт вычищает его из окружения потомка.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------- аргументы ----------
const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) {
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) { args[key] = true; }
    else { args[key] = next; i++; }
  }
}

const IN = args.in;
const OUT = args.out;
const MODEL = args.model || 'haiku';
const LIMIT = args.limit === 'all' ? Infinity : parseInt(args.limit ?? '20', 10);
const SLEEP_MS = parseInt(args.sleep ?? '1000', 10);
const PROMPT_PATH = args.prompt || join(HERE, 'prompts', 'manipulation-label.md');
const DRY = !!args.dry;

if (!IN || !OUT) {
  console.error('Usage: node label.mjs --in corpus.jsonl --out labels.jsonl [--model haiku] [--limit 20|all] [--sleep 1000] [--prompt file.md] [--dry]');
  process.exit(1);
}

// ---------- вход / возобновление ----------
const records = readFileSync(IN, 'utf-8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const done = new Set();
if (existsSync(OUT)) {
  for (const l of readFileSync(OUT, 'utf-8').split('\n').filter(Boolean)) {
    try { done.add(JSON.parse(l).id); } catch { /* битая строка — переразметится */ }
  }
}
const todo = records.filter((r) => !done.has(r.id)).slice(0, LIMIT);

console.log(`corpus: ${records.length} | уже размечено: ${done.size} | в этот прогон: ${todo.length} | модель: ${MODEL}`);
if (DRY) { console.log('[dry] вызовов claude не будет'); }

const promptTemplate = readFileSync(PROMPT_PATH, 'utf-8');

// ---------- окружение для claude -p (см. шапку: тупик с ANTHROPIC_API_KEY) ----------
const env = { ...process.env };
delete env.ANTHROPIC_API_KEY;
delete env.ANTHROPIC_AUTH_TOKEN;
// CLAUDE_CODE_OAUTH_TOKEN (setup-token) пропускаем как есть — он валиден для headless.
// Если env-переменной нет — читаем git-игнорируемый файл .token рядом со скриптом
// (создаётся разово: `claude setup-token` → вставить токен в tools/teacher-labeler/.token).
const TOKEN_FILE = join(HERE, '.token');
if (!env.CLAUDE_CODE_OAUTH_TOKEN && existsSync(TOKEN_FILE)) {
  env.CLAUDE_CODE_OAUTH_TOKEN = readFileSync(TOKEN_FILE, 'utf-8').trim();
}

function callClaude(fullPrompt) {
  const argv = ['-p', '--model', MODEL];
  // 1-я попытка: без shell (claude.exe в PATH); 2-я: shell (claude.cmd от npm)
  let res = spawnSync('claude', argv, { input: fullPrompt, env, encoding: 'utf-8', timeout: 180_000 });
  if (res.error && res.error.code === 'ENOENT') {
    res = spawnSync('claude ' + argv.join(' '), { input: fullPrompt, env, encoding: 'utf-8', timeout: 180_000, shell: true });
  }
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`claude exit ${res.status}: ${(res.stderr || '').slice(0, 400)}`);
  return (res.stdout || '').trim();
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- основной цикл ----------
let ok = 0, fail = 0;
for (const [i, rec] of todo.entries()) {
  const fullPrompt = promptTemplate.replace('{{TEXT}}', rec.text);
  process.stdout.write(`[${i + 1}/${todo.length}] ${rec.id} ... `);
  if (DRY) { console.log('dry'); continue; }
  try {
    const raw = callClaude(fullPrompt);
    const label = extractJson(raw);
    if (!label || !label.verdict) {
      fail++;
      console.log('✗ не-JSON ответ (записан в .errors.jsonl)');
      appendFileSync(OUT + '.errors.jsonl', JSON.stringify({ id: rec.id, raw, ts: new Date().toISOString() }) + '\n');
    } else {
      ok++;
      appendFileSync(OUT, JSON.stringify({ ...rec, model: MODEL, label, ts: new Date().toISOString() }) + '\n');
      console.log(`✓ ${label.verdict}${label.classes?.length ? ' [' + label.classes.join(',') + ']' : ''}`);
    }
  } catch (e) {
    fail++;
    console.log(`✗ ${String(e.message || e).slice(0, 200)}`);
    appendFileSync(OUT + '.errors.jsonl', JSON.stringify({ id: rec.id, error: String(e), ts: new Date().toISOString() }) + '\n');
    if (/401|credentials/i.test(String(e))) {
      console.error('\n⚠ 401: OAuth протух. Лечение (ops cookbook): `claude setup-token` → CLAUDE_CODE_OAUTH_TOKEN.');
      break;
    }
  }
  if (i < todo.length - 1) await sleep(SLEEP_MS);
}

console.log(`\nготово: ✓${ok} ✗${fail} | осталось в корпусе: ${records.length - done.size - ok}`);
if (todo.length >= 20 && ok > 0) {
  console.log('Напоминание (политика §6): проверь качество пробы ГЛАЗАМИ до --limit all.');
}
