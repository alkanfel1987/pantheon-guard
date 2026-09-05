# OPS — pantheon-guard

> Команды управления инструментами проекта. Правило (ops cookbook): новые команды кладутся сюда сразу, не в чат.

## teacher-labeler — разметка корпусов через Claude headless (создан 2026-06-13)

Реализация «Claude строит guard, не является guard»: разметка корпусов моделями Claude в рамках квоты Max (без API-ключа). Политика расхода: `~/.claude/refs/model-optimization-policy.md`.

### Разовая настройка (нужен пользователь, ~1 минута)

```bash
# 1. В обычном терминале (НЕ внутри сессии Claude Code):
claude setup-token
# 2. Полученный токен (sk-ant-oat01-…) положить одной строкой в:
#    tools/teacher-labeler/.token   (git-ignored)
```

Причина: standalone `claude -p` на обычном OAuth ломается через ~2 дня (401, авто-обновления нет); setup-token живёт ~1 год. Тот же тупик и фикс — в `memory/reference_ops_cookbook.md` § headless. Чужой токен (pantheon-prognosis) не переиспользуем — у каждого проекта свой.

### Экспорт adversarial-корпуса в JSONL

```bash
node tools/teacher-labeler/export-adversarial.mjs
# → tools/teacher-labeler/data/adversarial-corpus.jsonl (49 записей, 14 категорий)
```

### Разметка: сначала ПРОБА, потом массово (политика §6)

```bash
# проба 20 примеров на haiku (по умолчанию)
node tools/teacher-labeler/label.mjs \
  --in tools/teacher-labeler/data/adversarial-corpus.jsonl \
  --out tools/teacher-labeler/data/labels-haiku.jsonl

# просмотреть качество глазами, затем добить весь корпус
node tools/teacher-labeler/label.mjs --in ... --out ... --limit all

# сложные случаи вторым проходом на sonnet (другой --out!)
node tools/teacher-labeler/label.mjs --in ... --out labels-sonnet.jsonl --model sonnet --limit all
```

Свойства: возобновляемый (повторный запуск пропускает уже размеченные id по `--out`); не-JSON ответы и ошибки падают в `<out>.errors.jsonl`; пауза между вызовами `--sleep` (мс, по умолчанию 1000); `--dry` — прогон без вызовов.

### Протокол двух учителей (валидирован 2026-06-13)

1. Массовый проход haiku → `labels-haiku.jsonl`.
2. Спорные (пограничная категория / расхождение с ожиданием / уверенность ≤0.9) → подкорпус → проход sonnet в ОТДЕЛЬНЫЙ файл.
3. Расхождение учителей → корзина «ось-2» (не усреднять — вердикт требует контекста).

Первый прогон: haiku↔корпус 48/49 (вкл. все 9 Асурья-категорий), haiku↔sonnet 13/15;
два расхождения учителей = опорные кейсы оси 2. Отчёт: `tools/teacher-labeler/data/REPORT-2026-06-13.md`.

### Известные тупики

- **401 внутри сессии Claude Code** — host-managed `ANTHROPIC_API_KEY` в окружении перебивает OAuth; скрипт сам вычищает её из окружения потомка.
- **401 standalone** — протух обычный OAuth; лечится только setup-token (выше).
- ⚠ Метки учителя НЕ идут в замороженный бенчмарк без пре-регистрации (§2): это материал для семантического слоя / дистилляции, не для метрики accuracy.
