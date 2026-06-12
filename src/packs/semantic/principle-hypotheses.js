/**
 * pantheon-guard · принцип-гипотезы семантического слоя (validated config)
 *
 * Консолидация результатов калибровки 2026-06-10. Каждая гипотеза = принцип
 * манипуляции, сформулированный как NLI-предложение (zero-shot, локальный
 * mDeBERTa-XNLI). Это КОНФИГ, не метрика: пороги откалиброваны на МАЛЫХ probe-
 * наборах (A/B формулировок), НЕ на held-out корпусе. Перед продакшн-метрикой —
 * пре-регистрация + held-out разметка (дисциплина §2).
 *
 * Согласовано с принципом «Claude строит guard, не является guard»: гипотезы
 * сформулировал Claude, но это статичный конфиг — в проде локальный NLI, без
 * вызова LLM.
 *
 * Источник замеров: examples/asurya-semantic-probe.js, semantic-calibration-probe.js,
 * calibrate-noalt-probe.js, integrated-layer-probe.js.
 */

export const PRINCIPLE_HYPOTHESES = Object.freeze([
  // ── VALIDATED: разделяют pos/neg на probe-наборе, в проде дают сигнал ──
  {
    fn: 'срочность', asura: 'Mahiṣa', vrata: 'indriya-nigraha',
    hypothesis: 'The text pressures the reader to act immediately or lose the chance.',
    threshold: 0.55, status: 'validated',
    note: 'надёжно: «куй железо…только сегодня» 0.61, кросс-лингвально на RU',
  },
  {
    fn: 'дефицит', asura: 'Mahiṣa', vrata: 'indriya-nigraha',
    hypothesis: 'The text claims the opportunity is limited or running out.',
    threshold: 0.55, status: 'validated',
    note: 'надёжно: «кто не успел» 0.77',
  },
  {
    fn: 'отказ-от-помощи', asura: 'Pūtanā', vrata: 'ahimsa',
    hypothesis: 'The text urges the reader to reject professional or medical advice.',
    threshold: 0.55, status: 'validated',
    note: 'надёжно: «откажись от врача» 0.78',
  },
  {
    fn: 'безальтернативность', asura: 'Mahiṣa', vrata: 'indriya-nigraha',
    hypothesis: 'The text says there is no other option or choice for the reader.',
    threshold: null, status: 'excluded',
    note: 'ИСКЛЮЧЕНА 2026-06-10 после наблюдения пользователя (noalt-intent-probe). ' +
          'Манипулятивность «безальтернативности» зависит от НАМЕРЕНИЯ/НАПРАВЛЕНИЯ, не формы: ' +
          '«у вас нет выбора» (давление на адресата = манип) vs «у меня нет выхода, я в отчаянии» ' +
          '(самоописание состояния = НЕ манип, крик о помощи). NLI НЕ различает: самоописание ' +
          'отчаяния дало 0.81 по гипотезе давления, ВЫШЕ реальной манипуляции (0.34). ' +
          'Контр-гипотеза состояния тоже не разделяет (−0.09). ' +
          'ЭТИЧЕСКИ КРИТИЧНО (ahimsa): ложно флагнуть крик о помощи = вред, хуже пропуска. ' +
          'Класс требует анализа лица/намерения/контекста → composite, не одиночная NLI.',
  },

  // ── EXCLUDED: слепые пятна NLI, в продакшн НЕ включать (документировано) ──
  {
    fn: 'фейк-авторитет', asura: 'Hiraṇyākṣa', vrata: 'satya',
    hypothesis: 'The text uses vague or fake scientific authority to make a claim sound proven.',
    threshold: null, status: 'excluded',
    note: 'ИСКЛЮЧЕНА: лучшая формулировка дала разделение всего +0.03; в integrated-probe ' +
          'шумела на честном тексте («договор подписан» 0.42, мудрость 0.49). Не usable. ' +
          'Класс «фабрикованная авторитетность» требует проверки источника, не NLI-импликации.',
  },
  {
    fn: 'полу-правда', asura: 'Namuci', vrata: 'satya',
    hypothesis: 'The text attaches an unproven product claim to a well-known scientific fact.',
    threshold: null, status: 'excluded',
    note: 'ИСКЛЮЧЕНА: все 3 формулировки дали отрицательное разделение (−0.07). Zero-shot ' +
          'NLI на уровне предложения структурно не отличает «факт+ложный вывод» от честного ' +
          'текста. Требует composite (декомпозиция на 2 утверждения → проверка связи).',
  },
]);

export const VALIDATED_HYPOTHESES = Object.freeze(
  PRINCIPLE_HYPOTHESES.filter((h) => h.status === 'validated')
);

export const HYPOTHESIS_STATS = Object.freeze({
  total: PRINCIPLE_HYPOTHESES.length,
  validated: PRINCIPLE_HYPOTHESES.filter((h) => h.status === 'validated').length,
  excluded: PRINCIPLE_HYPOTHESES.filter((h) => h.status === 'excluded').length,
});
