# @pantheon/guard

> **The conscience layer for AI-generated marketing.**
> Ловит то, чего не ловят guardrails: fear-based копирайтинг, false urgency, dark patterns в AI-сгенерированных воронках продаж.

[![npm](https://img.shields.io/badge/npm-v0.1.0-blue)](https://www.npmjs.com/package/@pantheon/guard)
[![license](https://img.shields.io/badge/license-MIT%20%2F%20Commercial-green)](./LICENSE.md)
[![Built on](https://img.shields.io/badge/foundation-Yoga--s%C5%ABtra%20II.30--31-purple)]()

---

## Зачем это нужно

Ваш AI-бот генерирует контент для продающих воронок. Он уже защищён от prompt injection и PII-утечек через NeMo Guardrails, Guardrails AI или Lakera. Всё хорошо?

Нет.

Попросите GPT-4 или Claude написать «продающий email для онлайн-курса», и получите:

- «Успей до полуночи, осталось 3 места!» — false urgency, мест не 3, а 300
- «Если не начнёшь сейчас, через год будешь жалеть» — fear-based с дополнительным индуцированием вины
- «Секрет, который скрывают большие компании...» — clickbait без источников
- «Только для избранных» — искусственная эксклюзивность

Ни один из существующих guardrails это не ловит. Они созданы для защиты от юридических рисков (утечка данных, токсичный язык, галлюцинации), а не для защиты от **манипулятивного маркетинга**.

Это ваш клиент — владелец малого бизнеса — потом звонит и спрашивает, почему его AI-бот «звучит как инфоцыган».

`@pantheon/guard` решает именно эту задачу.

## Что делает

Работает **поверх** ваших существующих guardrails, не заменяя их. Двухстрочная интеграция:

```javascript
import { checkAction } from '@pantheon/guard';

const result = checkAction(agent, {
  text: "Успей, пока не поздно! Только 3 места!",
  urgency: 0.95,
  paused: false,
  contains: { falseUrgency: true, fearBased: true },
});

// { passes: false, failedStep: 'mahavrata',
//   violations: [
//     { rule: 'ahimsa', reason: 'fear-based content, false urgency' },
//     { rule: 'indriya_nigraha', reason: 'action driven by urgency without pause' }
//   ],
//   recommendation: 'Маха-врата нарушена. Действие недопустимо.' }
```

Если `passes: true` — отдаёте текст пользователю. Если `false` — просите модель перегенерировать с другим промптом или возвращаете клиенту сигнал «здесь что-то не так».

## Как это работает — философский фундамент

`@pantheon/guard` построен на Yoga-sūtra II.30–31 (Patañjali, ~400 г. н.э.). Там описана **Маха-врата** — пять запретов, которые **не корректируются** по ситуации, классу, месту или времени (санскр. *jāti-deśa-kāla-samayānavacchinna*).

Это не моральная риторика — это **архитектурное решение**. Правила, которые не имеют исключений, легко формализовать в детерминированный валидатор. Никакого fuzzy-classifier, никаких LLM-вызовов для проверки, никаких галлюцинаций в самом фильтре.

### Пять правил Маха-враты

| Санскрит | Что ловит | Пример AI-копирайтинга, который блокируется |
|---|---|---|
| **ahiṃsā** (не причинять вред) | fear-based, manipulation, dark patterns, false urgency | «Успей, или твой бизнес умрёт» |
| **satya** (истина) | exaggeration, speculation выданный за факт, clickbait | «Секрет миллионеров, который от вас скрывают» |
| **asteya** (не присваивать) | отсутствие атрибуции источников при цитировании данных | «По данным исследований...» (каких? чьих?) |
| **śauca** (чистота) | несколько тем в одном сообщении, мусор, путаница | email на 5 разных offer'ов в одном письме |
| **indriya-nigraha** (обуздание импульса) | высокая срочность без паузы, эмоциональная реакция | автоматический алерт в 3 ночи «ответь прямо сейчас!» |

## Установка

```bash
npm install @pantheon/guard
```

Zero runtime dependencies. 18 KB минифицировано.

## Быстрый старт — 3 примера до/после

### Пример 1: Продающий email

**Без Pantheon:**
```javascript
const email = await llm.generate({
  prompt: "Напиши email про запуск курса по Python"
});
// "🔥 УСПЕЙ ДО ПОЛУНОЧИ! Остался последний шанс войти в Python!
//  Те, кто не зайдут сейчас — через год будут жалеть..."

await sendEmail(email); // клиент в шоке
```

**С Pantheon:**
```javascript
import { checkAction, detectPatterns } from '@pantheon/guard';

let email = await llm.generate({ prompt: "..." });
let attempts = 0;

while (attempts < 3) {
  const flags = detectPatterns(email); // автодетект dark patterns
  const result = checkAction(brandAgent, {
    text: email,
    urgency: 0.3,
    paused: true,
    contains: flags,
  });

  if (result.passes) break;

  // Регенерируем с уточнением
  email = await llm.generate({
    prompt: `Перепиши без ${result.violations.map(v => v.rule).join(', ')}: ${email}`
  });
  attempts++;
}

await sendEmail(email); // клиент доволен
```

### Пример 2: Заголовки постов для Telegram-канала

**До:**
- «То, о чём молчат эксперты»
- «9 из 10 делают эту ошибку»
- «Секрет, который изменит всё»

**После (отфильтровано Pantheon):**
- «Три распространённых ошибки в настройке X»
- «Что я узнал, разбирая 50 кейсов за квартал»
- «Метод, который дал +30% конверсии у моих клиентов»

Код:
```javascript
const titles = await llm.generate({ prompt: "10 заголовков..." });
const clean = titles.filter(t => checkAction(agent, {
  text: t,
  intent: 'inform',
  contains: { clickbait: detectClickbait(t) },
}).passes);
```

### Пример 3: Push-уведомления

Самая частая ошибка AI-ботов — слать push'и ночью с text'ом «ОТВЕТЬ СЕЙЧАС». `indriya-nigraha` ловит это автоматически:

```javascript
checkAction(agent, {
  text: "Ответь сейчас!",
  urgency: 0.95,
  paused: false,
});
// { passes: false, failedStep: 'mahavrata',
//   violations: [{ rule: 'indriya_nigraha', ... }] }
```

## Сравнение с существующими решениями

| Что защищает | Pantheon Guard | NeMo Guardrails | Guardrails AI | Lakera Guard |
|---|---|---|---|---|
| Prompt injection | — | ✓ | ✓ | ✓ |
| PII leakage | — | ✓ | ✓ | ✓ |
| Hallucinations | — | ✓ | ✓ | partial |
| Toxic language | — | ✓ | ✓ | ✓ |
| **Fear-based копирайтинг** | **✓** | — | — | — |
| **False urgency** | **✓** | — | — | — |
| **Dark patterns в воронках** | **✓** | — | — | — |
| **Манипулятивный CTA** | **✓** | — | — | — |
| **Clickbait без источников** | **✓** | — | — | — |
| **Атрибуция при цитировании** | **✓** | — | — | — |

**Вывод:** используйте Pantheon Guard **вместе** с NeMo/Guardrails AI, не вместо них. Они защищают от юридических и технических рисков. Pantheon защищает репутацию вашего клиента.

## API

### `checkMahavrata(action)` — только 5 абсолютных запретов

Быстрая проверка. ~0.1ms latency, нет LLM-вызовов.

```javascript
import { checkMahavrata } from '@pantheon/guard';

const { passes, violations, details } = checkMahavrata({
  text: "...",
  urgency: 0.5,
  paused: true,
  sources: ['исследование X'],
  contains: {
    fearBased: false,
    falseUrgency: false,
    clickbait: false,
    // ...
  },
});
```

### `checkAction(agent, action)` — полный 5-шаговый алгоритм

Добавляет ещё 4 проверки поверх Маха-враты: Dharma (польза), Svadharma (соответствие роли агента), Guna (правильное состояние), Yajna (собственная ценность), Dana (тип отдачи).

```javascript
import { checkAction } from '@pantheon/guard';

const agent = {
  name: "BrandVoice",
  svadharma: {
    jati: "Kriyā",
    guna: "Sattva",
    karma: "контент для корпоративного блога",
    svabhava: "спокойный, экспертный, без продающих CTA"
  }
};

const result = checkAction(agent, action);
```

### `wrapAgent(name).act(action, executor)` — runtime-обёртка

Если проверка прошла — выполняет executor. Если нет — блокирует и возвращает причину.

```javascript
import { wrapAgent } from '@pantheon/guard';

const brandBot = wrapAgent("BrandVoice");

const result = await brandBot.act(
  { text: generatedText, contains: patterns },
  async (action) => await sendEmail(action.text)
);

if (!result.allowed) {
  console.log("Заблокировано:", result.reason);
}
```

### `detectPatterns(text)` — автоматический детектор

Анализирует текст и возвращает объект флагов для передачи в `checkAction`. Использует детерминированные эвристики, не LLM.

```javascript
import { detectPatterns } from '@pantheon/guard';

const flags = detectPatterns("Успей до полуночи, осталось 3 места!");
// { falseUrgency: true, fearBased: true, manipulation: true }
```

### `LearningCycle` — опционально

Если хотите, чтобы система **училась** на отказах и со временем улучшала промпты — подключите цикл обучения:

```javascript
import { LearningCycle } from '@pantheon/guard';

const cycle = new LearningCycle({
  storage: new FileStorage('./pantheon-data.json')
});
await cycle.init();

// Каждое действие логируется
// Раз в N циклов — distill паттернов и обновление knowledge base
```

Документация: [LEARNING.md](./docs/LEARNING.md)

## Производительность

- `checkMahavrata`: ~0.1 ms
- `checkAction` (полный алгоритм): ~0.3 ms
- Zero LLM calls в самом валидаторе
- 18 KB минифицировано, 0 рантайм-зависимостей
- Работает в Node.js 16+, браузере, Chrome extensions (через `ChromeStorage` адаптер)

Для сравнения: NeMo Guardrails добавляет 100–300ms латентности, Guardrails AI — 50–150ms.

## Интеграции

Минимальные примеры в `/examples`:

- **OpenAI SDK** — `examples/openai-chat.js`
- **Anthropic SDK** — `examples/anthropic-chat.js`
- **LangChain** — `examples/langchain-chain.js`
- **Vercel AI SDK** — `examples/vercel-ai.js`
- **Chrome Extension** — `examples/chrome-extension/`

## Лицензия

Двойная лицензия:

- **MIT** — для open-source, личных, образовательных проектов. Используйте свободно.
- **Commercial** — для коммерческих SaaS-продуктов, внутренних корпоративных AI-систем, клиентских интеграций. Стоимость:
  - Startup (до $1M ARR): $29/мес или $290/год
  - Growth ($1M–$10M ARR): $199/мес или $1,990/год
  - Enterprise: связаться

Почему двойная: ядро должно быть доступно всем, кто делает честные AI-продукты. Деньги платят те, кто зарабатывает на AI и хочет иметь поддержку, приоритетные исправления и гарантии.

Контакт для коммерческой лицензии: _your_email@pantheon.guard_

## FAQ

**Q: Это не просто ещё один guardrails?**
A: Нет. Guardrails защищают от юридических/технических рисков (PII, prompt injection, токсичность). Pantheon защищает от **этических/маркетинговых** рисков (манипуляция, dark patterns, fear-based). Это разные слои. Используйте оба.

**Q: Почему санскрит?**
A: Это не эзотерика, это точность формулировок. Санскритские термины — технические. Ahiṃsā — «не причинять вред» — имеет точное, не-метафорическое значение, отточенное 2000+ лет. «Do no harm» на английском — размытая максима. Ahiṃsā — проверяемое правило.

**Q: Вы навязываете свои ценности?**
A: Нет. Правила Маха-враты — универсальные запреты, которые совпадают с большинством корпоративных brand guidelines и кодексов рекламной этики (FTC, EASA, AMA). Pantheon просто формализует их в код.

**Q: А если мой клиент ХОЧЕТ агрессивный маркетинг?**
A: Тогда вам не нужен этот пакет. Pantheon — для брендов, которым важна долгосрочная репутация.

**Q: Можно ли обучить систему на собственных правилах?**
A: Да. `LearningCycle` позволяет добавлять доменные правила и наблюдать, какие срабатывания были ложными. См. [LEARNING.md](./docs/LEARNING.md).

## Контрибьюторы

Основано на философской рамке **Vishishta-advaita** (Ramanuja) и **Kashmir Shaivism** (Abhinavagupta), с практическими корнями в Ṛgveda, Bṛhadāraṇyaka Upaniṣad, Bhagavad-Gītā, Yoga-sūtra, Manusmṛti, Spanda-kārikā.

Не потому что «круто», а потому что эти традиции решают задачу **различения манипуляции от честного воздействия** уже 2500+ лет. Мы только упаковали это в JavaScript.

## Roadmap

- [x] v0.1 — core, 5 правил Маха-враты, LearningCycle
- [ ] v0.2 — `detectPatterns` как отдельный классификатор (текущая версия — только флаги)
- [ ] v0.3 — TypeScript типы первого класса
- [ ] v0.4 — Python-порт (через pyo3)
- [ ] v0.5 — CLI для аудита готовых текстов

## Старт

```bash
npm install @pantheon/guard
```

Примеры: [`/examples`](./examples)
Философия: [`/docs/PHILOSOPHY.md`](./docs/PHILOSOPHY.md)
Issues: GitHub
Коммерция: _your_email@pantheon.guard_
