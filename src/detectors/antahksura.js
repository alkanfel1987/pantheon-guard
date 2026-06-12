/**
 * pantheon-guard · детектор Antaḥkṣurā («бритва внутри») — SEED
 *
 * Источник: catalogue `mbh-vangmadhura-antahksura-12-152` (Mahābhārata 12.152.14-16,
 * corpus-confirmed, Ganguli/Fitzgerald). Паттерн: «antaḥ-kṣurāḥ vāk-madhurāḥ» —
 * речь, сладкая снаружи (vāk-madhura), с бритвой внутри (antaḥ-kṣura); «колодцы,
 * прикрытые травой» (kūpāḥ channāḥ tṛṇaiḥ) — ловушка невидима, потому что
 * прикрыта тем, что выглядит безопасным.
 *
 * ПОЧЕМУ ОТЛОЖЕН ДО 2026-06-12 (память): одиночный regex не берёт — нужна
 * ДВУХСТУПЕНЧАТАЯ co-occurrence (сладость + скрытый вред в одном тексте). Обе
 * ступени появились отдельно и теперь готовы:
 *   ступень 1 (vāk-madhura, маска) → реестр идиом, pragmatics 'false-care' +
 *       любой манипулятивный «добродетельный»/«заботливый» оборот;
 *   ступень 2 (antaḥ-kṣura, бритва) → реестр действий (риск-действие, особенно
 *       скрытый вред: transfer/secret/execute/isolate) ИЛИ внешний harm-сигнал.
 *
 * Детектор = СВЯЗКА двух слоёв, не новый regex. Объяснимый: называет обе ступени.
 * Принцип «Claude строит, не является»: детерминированная композиция, не LLM.
 *
 * Мультиязычность: ступень 1 работает на любом языке через переданную explain-
 * функцию (idioms-{ru,en,de,fr}); ступень 2 (actions) пока RU — для не-RU языков
 * razor подаётся через actionSignals/harmSignals от хоста.
 */

import { explainIdioms } from '../lexicons/idioms-ru.js';
import { explainIdiomsEn } from '../lexicons/idioms-en.js';
import { explainIdiomsDe } from '../lexicons/idioms-de.js';
import { explainIdiomsFr } from '../lexicons/idioms-fr.js';
import { extractActions } from '../lexicons/actions-ru.js';

const EXPLAINERS = { ru: explainIdioms, en: explainIdiomsEn, de: explainIdiomsDe, fr: explainIdiomsFr };

// Риск-классы, читаемые как «бритва» (скрытый вред под заботой). isolate входит:
// «никому не говори, я о тебе забочусь» — отрезание от проверки под маской заботы.
const RAZOR_CLASSES = new Set(['transfer', 'secret', 'execute', 'remote', 'isolate']);

/**
 * Детектирует паттерн Antaḥkṣurā: маска заботы/добродетели (ступень 1) +
 * скрытый вред/риск-действие (ступень 2) в одном тексте.
 *
 * @param {object} p
 * @param {string} p.text
 * @param {string} [p.lang='ru'] — ключ explain-функции (ru/en/de/fr)
 * @param {string[]} [p.actionSignals] — внешние риск-сигналы от хоста (для не-RU
 *        языков, где actions-реестр пока только RU)
 * @param {boolean} [p.harmSignal] — внешний сигнал «скрытый вред» (напр. вред
 *        третьему лицу: nindā/paiśunya — клевета/наговор), если хост его вычислил
 * @returns {{detected, mask: object[], razor: object[], reasons: string[], catalogue_id}}
 */
export function detectAntahksura({ text, lang = 'ru', actionSignals = [], harmSignal = false } = {}) {
  const explain = EXPLAINERS[lang] ?? explainIdioms;
  const idioms = typeof text === 'string' ? explain(text) : [];

  // СТУПЕНЬ 1 — vāk-madhura: сладкая/заботливая/добродетельная маска.
  // false-care напрямую; либо любой манипулятивный оборот, поданный как забота.
  const mask = idioms.filter(
    (f) => f.pragmatics === 'false-care' && f.manipulative !== 'no'
  );

  // СТУПЕНЬ 2 — antaḥ-kṣura: бритва (скрытый вред / риск-действие).
  const actions = lang === 'ru' && typeof text === 'string' ? extractActions(text) : [];
  const razorActions = actions.filter((a) => RAZOR_CLASSES.has(a.cls));
  const razor = [
    ...razorActions.map((a) => ({ kind: 'action', label: a.label, cls: a.cls })),
    ...actionSignals.map((s) => ({ kind: 'signal', label: s })),
    ...(harmSignal ? [{ kind: 'harm', label: 'скрытый вред (вред третьему / наговор)' }] : []),
  ];

  const detected = mask.length > 0 && razor.length > 0;
  const reasons = [];
  if (detected) {
    reasons.push(
      `Antaḥkṣurā (Mbh 12.152): сладкая речь скрывает вред. ` +
      `Маска заботы: ${mask.map((m) => `«${m.idiom}»`).join(', ')}. ` +
      `Бритва: ${razor.map((r) => r.label).join(', ')}.`
    );
    reasons.push('«колодец, прикрытый травой» — рискованное прячется за доброжелательным; проверить намерение, не тон.');
  }

  return {
    detected,
    mask,
    razor,
    reasons,
    catalogue_id: 'mbh-vangmadhura-antahksura-12-152',
  };
}
