/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  pantheon-learning.js · Цикл саморазвития Пантеона v3.1                  ║
 * ║                                                                           ║
 * ║  Интеграция автономной учебной петли в архитектуру агентов.              ║
 * ║  Куратор цикла: Лакшми (Meta-Shakti).                                    ║
 * ║                                                                           ║
 * ║  Пять фаз:                                                                ║
 * ║    OBSERVE    → сбор наблюдений (Дхатри, Махан, Агни, Варуна)           ║
 * ║    HYPOTHESIZE → формулировка гипотез (Брахма, Дхатри)                   ║
 * ║    EXPERIMENT → проверка (Шива, Бхава под надзором Ганеши)              ║
 * ║    CONCLUDE   → вывод (Ганеша, Дхатри)                                  ║
 * ║    UPDATE     → интеграция (Вишну, Шива, Бхава)                         ║
 * ║                                                                           ║
 * ║  Лакшми работает НАД циклом:                                             ║
 * ║    • куратор knowledgeBase (что входит в долговременную память)          ║
 * ║    • дистилляция опыта (ежеквартально)                                   ║
 * ║    • архивация устаревшего                                               ║
 * ║    • стоимость инсайта в Рагнарёк-петле                                  ║
 * ║    • реестр горизонтов исследования                                      ║
 * ║                                                                           ║
 * ║  Защитные механизмы:                                                      ║
 * ║    • Maха-врата — приоритет выше цикла                                   ║
 * ║    • Рагнарёк — остановка при деградации 3 цикла подряд                  ║
 * ║    • Ограничение активных экспериментов (≤3)                             ║
 * ║                                                                           ║
 * ║  Зависит от: pantheon-core.js, pantheon-agents.js                        ║
 * ║  Основа: autonomous-learning.skill (пользовательский скил)               ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const { checkMahavrata, LAYERS, GUNAS } = require('./pantheon-core');
const { AGENTS, getAgent } = require('./pantheon-agents');


// ═══════════════════════════════════════════════════════════════════════════
// КОНФИГУРАЦИЯ ЦИКЛА
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = Object.freeze({
  // Пороги перехода между фазами
  minObservationsForHypothesis: 5,   // минимум наблюдений для слабого вывода
  minObservationsForUpdate:     15,  // минимум для изменения поведения системы
  anomalyThresholdSigma:        2.0, // отклонение для немедленного перехода

  // Эксперимент
  experimentTimeoutHours:       168, // 7 дней максимум
  maxActiveExperiments:         3,   // защита от перегрузки сигналами

  // Автоприменение
  autoApplyConfidence:          0.8, // выше этого — применяем автоматически

  // Рагнарёк
  ragnarokDegradationCycles:    3,   // сколько подряд циклов деградации
  ragnarokMetricDropPercent:    10,  // падение метрик, считающееся деградацией

  // Дистилляция (Лакшми)
  distillationPeriodCycles:     5,   // раз в N циклов сжимаем опыт
  distillationMinPatternCount:  3,   // минимум повторений для паттерна

  // Архивация
  insightStaleDays:             180, // инсайт без подтверждения >6 мес — кандидат на архив
});

// ═══════════════════════════════════════════════════════════════════════════
// ИСТОЧНИКИ СИГНАЛОВ (5 уровней достоверности)
// ═══════════════════════════════════════════════════════════════════════════

const SIGNAL_SOURCES = Object.freeze({
  explicit_feedback: { weight: 1.0, description: 'Явная обратная связь пользователя' },
  measurable_result: { weight: 0.9, description: 'Измеримый результат действия' },
  behavior_pattern:  { weight: 0.6, description: 'Паттерн поведения (что игнорируется)' },
  anomaly:           { weight: 0.4, description: 'Аномалия в данных (>2σ)' },
  external_context:  { weight: 0.3, description: 'Внешний контекст (Варуна, аудит)' },
});

// Какие агенты питают цикл на каждой фазе
const PHASE_AGENTS = Object.freeze({
  OBSERVE:     ['dhatri', 'mahan', 'agni', 'varuna', 'dhruva'],
  HYPOTHESIZE: ['brahma', 'dhatri'],
  EXPERIMENT:  ['shiva', 'bhava', 'ganesha'],
  CONCLUDE:    ['ganesha', 'dhatri'],
  UPDATE:      ['vishnu', 'shiva', 'bhava'],
  CUSTODIAN:   ['lakshmi'], // над всем циклом
});


// ═══════════════════════════════════════════════════════════════════════════
// КЛАСС LEARNING CYCLE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Главный класс цикла обучения.
 * Хранит состояние (in-memory или через storage-backend).
 *
 * Использование:
 *   const cycle = new LearningCycle({ storage: customStorage });
 *   await cycle.observe({ source: 'explicit_feedback', domain: 'prompt', signal: {...} });
 *   const conclusions = await cycle.analyze();   // запустить полный проход
 *   await cycle.applyUpdates(conclusions);
 */
class LearningCycle {
  constructor(opts = {}) {
    this.config = { ...DEFAULT_CONFIG, ...(opts.config || {}) };
    this.storage = opts.storage || new InMemoryStorage();

    // Текущий цикл (заполняется при init)
    this.currentCycle = null;
    this.knowledgeBase = null;
    this.autoUpdateFrozen = false;
  }

  // ─── Инициализация ─────────────────────────────────────────────────────

  async init() {
    const state = await this.storage.get('learningState');
    if (state) {
      this.currentCycle = state.currentCycle;
      this.knowledgeBase = state.knowledgeBase;
      this.autoUpdateFrozen = state.autoUpdateFrozen || false;
    } else {
      // Новый vault / первый запуск
      this.currentCycle = this._emptyCycle(1);
      this.knowledgeBase = this._emptyKnowledgeBase();
      this.autoUpdateFrozen = false;
      await this._save();
    }
    return this;
  }

  _emptyCycle(cycleId) {
    return {
      cycleId,
      startedAt: new Date().toISOString(),
      phase: 'OBSERVE',
      observations: [],
      hypotheses: [],
      experiments: [],
      conclusions: [],
      appliedUpdates: [],
      metricsBefore: null,
      metricsAfter: null,
    };
  }

  _emptyKnowledgeBase() {
    return {
      createdAt: new Date().toISOString(),
      insights: [],           // [{id, text, domain, confidence, sourceCycleId, appliedCount, createdAt, archivedAt?, reason?}]
      patterns: [],           // [{id, text, sourceObservationIds, createdAt, confidence}]
      horizons: [],           // [{id, area, hypothesis, status, priority}]
      lastDistillation: null,
      history: {
        degradationCycles: 0, // подряд циклов ухудшения
        lastMetrics: null,
      },
    };
  }

  async _save() {
    await this.storage.set('learningState', {
      currentCycle: this.currentCycle,
      knowledgeBase: this.knowledgeBase,
      autoUpdateFrozen: this.autoUpdateFrozen,
    });
  }

  // ─── ФАЗА 1: OBSERVE ───────────────────────────────────────────────────

  /**
   * Добавить наблюдение в текущий цикл.
   *
   * @param {Object} obs — наблюдение:
   *   - source {string}  — 'explicit_feedback' | 'measurable_result' | ...
   *   - domain {string}  — 'prompt' | 'filter' | 'selector' | 'platform' | 'strategy'
   *   - signal {Object}  — произвольные данные сигнала
   *   - agent  {string}  — key агента, зафиксировавшего сигнал (опционально)
   *   - context {Object} — дополнительный контекст
   */
  async observe(obs) {
    if (this.autoUpdateFrozen) {
      console.warn('[Learning] autoUpdate заморожен (Рагнарёк). Наблюдения собираются, но не применяются.');
    }

    const sourceInfo = SIGNAL_SOURCES[obs.source];
    if (!sourceInfo) {
      throw new Error(`Неизвестный источник сигнала: ${obs.source}`);
    }

    const observation = {
      id: Date.now() + Math.random().toString(36).slice(2, 7),
      source: obs.source,
      domain: obs.domain,
      signal: obs.signal,
      weight: sourceInfo.weight,
      agent: obs.agent || null,
      context: obs.context || {},
      timestamp: new Date().toISOString(),
    };

    this.currentCycle.observations.push(observation);
    await this._save();

    return observation;
  }

  /**
   * Проверка, достаточно ли наблюдений для перехода в HYPOTHESIZE.
   */
  _isReadyForHypothesize() {
    const obs = this.currentCycle.observations;
    if (obs.length === 0) return false;

    // 1. Любая аномалия с сильным весом — немедленный переход
    const anomalyHit = obs.some((o) =>
      o.source === 'anomaly' && o.signal?.sigma >= this.config.anomalyThresholdSigma
    );
    if (anomalyHit) return true;

    // 2. Минимум наблюдений одного типа
    const byDomain = {};
    obs.forEach((o) => {
      byDomain[o.domain] = (byDomain[o.domain] || 0) + 1;
    });
    return Object.values(byDomain).some(
      (n) => n >= this.config.minObservationsForHypothesis
    );
  }

  // ─── ФАЗА 2: HYPOTHESIZE ───────────────────────────────────────────────

  /**
   * Построить гипотезы из наблюдений.
   * Гипотезы должны быть фальсифицируемыми: "ЕСЛИ X, ТО Y, ПРОВЕРЯЕТСЯ Z".
   *
   * @param {Function} llmCall — функция для обращения к LLM (опционально).
   *                             signature: (prompt) => Promise<string>
   */
  async hypothesize(llmCall = null) {
    if (!this._isReadyForHypothesize()) {
      return { ready: false, reason: 'недостаточно наблюдений' };
    }

    if (llmCall) {
      // Путь через LLM: отправляем наблюдения, получаем структурированные гипотезы
      const prompt = this._buildHypothesisPrompt();
      const response = await llmCall(prompt);
      const hypotheses = this._parseHypotheses(response);
      this.currentCycle.hypotheses.push(...hypotheses);
    } else {
      // Путь без LLM: группируем наблюдения по домену, делаем базовые "подсчётные" гипотезы
      const grouped = this._groupObservationsByDomain();
      for (const [domain, observations] of Object.entries(grouped)) {
        if (observations.length >= this.config.minObservationsForHypothesis) {
          this.currentCycle.hypotheses.push(this._buildBasicHypothesis(domain, observations));
        }
      }
    }

    this.currentCycle.phase = 'HYPOTHESIZE';
    await this._save();
    return { ready: true, count: this.currentCycle.hypotheses.length };
  }

  _groupObservationsByDomain() {
    const grouped = {};
    for (const o of this.currentCycle.observations) {
      if (!grouped[o.domain]) grouped[o.domain] = [];
      grouped[o.domain].push(o);
    }
    return grouped;
  }

  _buildBasicHypothesis(domain, observations) {
    const totalWeight = observations.reduce((sum, o) => sum + o.weight, 0);
    return {
      id: 'H' + Date.now() + Math.random().toString(36).slice(2, 5),
      domain,
      text: `Паттерн в домене "${domain}" на основе ${observations.length} наблюдений`,
      confidence: Math.min(1, totalWeight / this.config.minObservationsForUpdate),
      evidence: observations.map((o) => o.id),
      falsifiable: false, // базовые гипотезы не фальсифицируемы — нужен LLM для точности
      createdAt: new Date().toISOString(),
    };
  }

  _buildHypothesisPrompt() {
    return [
      'Ты — аналитическое ядро Пантеона. Сформулируй гипотезы на основе наблюдений.',
      '',
      'ПРИНЦИПЫ:',
      '- Каждая гипотеза ФАЛЬСИФИЦИРУЕМАЯ (можно проверить и опровергнуть)',
      '- Формат: ЕСЛИ [паттерн] ТО [результат] ПОТОМУ ЧТО [механизм] ПРОВЕРЯЕТСЯ [метрикой]',
      '- Различай корреляцию и причинно-следственную связь',
      '- При малом объёме данных (<15) — скептицизм',
      '',
      `НАБЛЮДЕНИЯ (N=${this.currentCycle.observations.length}):`,
      JSON.stringify(this.currentCycle.observations.slice(0, 50), null, 2),
      '',
      'ТЕКУЩАЯ БАЗА ЗНАНИЙ:',
      JSON.stringify(this.knowledgeBase.insights.slice(0, 20), null, 2),
      '',
      'ОТВЕТЬ JSON:',
      '{',
      '  "hypotheses": [',
      '    { "domain": "", "text": "", "confidence": 0.0, "evidence": [...] }',
      '  ]',
      '}',
    ].join('\n');
  }

  _parseHypotheses(llmResponse) {
    try {
      const parsed = typeof llmResponse === 'string' ? JSON.parse(llmResponse) : llmResponse;
      return (parsed.hypotheses || []).map((h) => ({
        id: 'H' + Date.now() + Math.random().toString(36).slice(2, 5),
        ...h,
        falsifiable: true,
        createdAt: new Date().toISOString(),
      }));
    } catch (err) {
      console.error('[Learning] Не смог разобрать ответ LLM:', err.message);
      return [];
    }
  }

  // ─── ФАЗА 3: EXPERIMENT ────────────────────────────────────────────────

  /**
   * Запустить эксперимент для гипотезы.
   *
   * @param {string} hypothesisId
   * @param {Object} params — параметры эксперимента:
   *   - variable: что меняем
   *   - control: исходное значение
   *   - treatment: новое значение
   *   - scope: 'prompt' | 'filter' | 'selector' | 'schedule'
   *   - sampleSize: минимум наблюдений
   *   - metricName: что измеряем
   */
  async startExperiment(hypothesisId, params) {
    const activeCount = this.currentCycle.experiments.filter((e) => e.status === 'running').length;
    if (activeCount >= this.config.maxActiveExperiments) {
      throw new Error(`Превышен лимит активных экспериментов: ${activeCount}/${this.config.maxActiveExperiments}`);
    }

    const hypothesis = this.currentCycle.hypotheses.find((h) => h.id === hypothesisId);
    if (!hypothesis) {
      throw new Error(`Гипотеза не найдена: ${hypothesisId}`);
    }

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + this.config.experimentTimeoutHours);

    const experiment = {
      id: 'E' + Date.now() + Math.random().toString(36).slice(2, 5),
      hypothesisId,
      status: 'running',
      variable: params.variable,
      control: params.control,
      treatment: params.treatment,
      scope: params.scope,
      sampleSize: params.sampleSize || this.config.minObservationsForUpdate,
      metricName: params.metricName,
      startedAt: new Date().toISOString(),
      deadline: deadline.toISOString(),
      observations: [],
      rollbackData: params.rollbackData || null,
    };

    this.currentCycle.experiments.push(experiment);
    this.currentCycle.phase = 'EXPERIMENT';
    await this._save();
    return experiment;
  }

  /**
   * Добавить наблюдение в текущий эксперимент.
   */
  async recordExperimentResult(experimentId, resultObs) {
    const exp = this.currentCycle.experiments.find((e) => e.id === experimentId);
    if (!exp) throw new Error(`Эксперимент не найден: ${experimentId}`);

    exp.observations.push({
      ...resultObs,
      timestamp: new Date().toISOString(),
    });

    // Автозавершение по объёму или дедлайну
    if (
      exp.observations.length >= exp.sampleSize ||
      new Date() >= new Date(exp.deadline)
    ) {
      exp.status = 'completed';
      exp.completedAt = new Date().toISOString();
    }

    await this._save();
    return exp;
  }

  // ─── ФАЗА 4: CONCLUDE ──────────────────────────────────────────────────

  /**
   * Сделать вывод из завершённого эксперимента.
   */
  async concludeExperiment(experimentId) {
    const exp = this.currentCycle.experiments.find((e) => e.id === experimentId);
    if (!exp) throw new Error(`Эксперимент не найден: ${experimentId}`);
    if (exp.status !== 'completed') {
      throw new Error(`Эксперимент ещё не завершён: ${exp.status}`);
    }

    // Агрегируем результаты
    const supported = exp.observations.filter((o) => o.supportsHypothesis === true).length;
    const total = exp.observations.length;
    const ratio = total > 0 ? supported / total : 0;

    let verdict, confidence;
    if (ratio >= 0.8) {
      verdict = 'confirmed';
      confidence = ratio;
    } else if (ratio >= 0.6) {
      verdict = 'partial';
      confidence = ratio;
    } else if (ratio >= 0.4) {
      verdict = 'inconclusive';
      confidence = 0.5;
    } else {
      verdict = 'rejected';
      confidence = 1 - ratio;
    }

    const hypothesis = this.currentCycle.hypotheses.find((h) => h.id === exp.hypothesisId);
    const conclusion = {
      id: 'C' + Date.now() + Math.random().toString(36).slice(2, 5),
      experimentId,
      hypothesisId: exp.hypothesisId,
      verdict,
      confidence,
      evidence: exp.observations.map((o) => o.id || o.timestamp),
      insight: hypothesis?.text || '',
      action: this._deriveAction(verdict, confidence),
      createdAt: new Date().toISOString(),
    };

    this.currentCycle.conclusions.push(conclusion);
    this.currentCycle.phase = 'CONCLUDE';
    await this._save();
    return conclusion;
  }

  _deriveAction(verdict, confidence) {
    if (verdict === 'confirmed' && confidence >= this.config.autoApplyConfidence) {
      return 'update_immediately';
    }
    if (verdict === 'confirmed' || verdict === 'partial') {
      return 'update_with_monitoring';
    }
    if (verdict === 'inconclusive') {
      return 'continue_observation';
    }
    return 'reject';
  }

  // ─── ФАЗА 5: UPDATE ────────────────────────────────────────────────────

  /**
   * Применить обновления на основе выводов.
   * Пропускает через ЛАКШМИ — она решает, какие инсайты входят в knowledgeBase.
   */
  async applyUpdates(conclusions = null, applier = null) {
    if (this.autoUpdateFrozen) {
      return { applied: 0, skipped: 'auto-update-frozen' };
    }

    const toApply = conclusions || this.currentCycle.conclusions.filter(
      (c) => c.action === 'update_immediately' || c.action === 'update_with_monitoring'
    );

    let applied = 0;
    for (const conclusion of toApply) {
      // Маха-врата над обновлением — не нарушает ли оно что-то абсолютное?
      const mvResult = checkMahavrata({
        text: conclusion.insight,
        intent: 'automate',
        urgency: 0,
        paused: true,
        contains: {},
      });
      if (!mvResult.passes) {
        console.warn(`[Learning] Обновление ${conclusion.id} нарушает Маха-врату:`,
          mvResult.violations.map((v) => v.rule).join(', '));
        continue;
      }

      // Лакшми решает — в knowledgeBase или нет
      const lakshmiDecision = this._lakshmiCurate(conclusion);

      if (lakshmiDecision.accepted) {
        this.knowledgeBase.insights.push({
          id: conclusion.id,
          text: conclusion.insight,
          domain: conclusion.domain || 'unknown',
          confidence: conclusion.confidence,
          sourceCycleId: this.currentCycle.cycleId,
          appliedCount: 0,
          createdAt: new Date().toISOString(),
          reason: lakshmiDecision.reason,
        });
      }

      // Если есть применитель — вызываем его
      if (applier && typeof applier === 'function') {
        try {
          await applier(conclusion);
          applied++;
          this.currentCycle.appliedUpdates.push({
            conclusionId: conclusion.id,
            appliedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error(`[Learning] Ошибка применения ${conclusion.id}:`, err.message);
        }
      }
    }

    this.currentCycle.phase = 'UPDATE';
    await this._save();
    return { applied, total: toApply.length };
  }

  // ─── ЛАКШМИ: КУРАТОР KNOWLEDGEBASE ─────────────────────────────────────

  /**
   * Решение Лакшми: входит ли вывод в долговременную память.
   * Критерии сохранения:
   *   1. Воспроизводимость (confidence ≥ 0.8 или подтверждение в 2+ контекстах)
   *   2. Применимость (может влиять на решения в будущем)
   *   3. Ясность (формулировка фальсифицируема)
   */
  _lakshmiCurate(conclusion) {
    // Критерий 1: достаточная уверенность
    if (conclusion.confidence < 0.6) {
      return {
        accepted: false,
        reason: `низкая confidence (${conclusion.confidence.toFixed(2)}) — остаётся в текущем цикле`,
      };
    }

    // Критерий 2: не дубликат
    const duplicate = this.knowledgeBase.insights.find((i) =>
      i.text && conclusion.insight &&
      this._similarity(i.text, conclusion.insight) > 0.85
    );
    if (duplicate) {
      // Не дублируем — увеличиваем appliedCount у существующего
      duplicate.appliedCount += 1;
      return {
        accepted: false,
        reason: `дубликат инсайта ${duplicate.id} — увеличен appliedCount`,
      };
    }

    return {
      accepted: true,
      reason: `confidence ${conclusion.confidence.toFixed(2)} ≥ 0.6, уникальный инсайт`,
    };
  }

  /**
   * Простая оценка сходства двух текстов (Jaccard по словам).
   * Для продакшена заменить на эмбеддинги, но для MVP достаточно.
   */
  _similarity(a, b) {
    const wordsA = new Set(String(a).toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    const wordsB = new Set(String(b).toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
    const union = new Set([...wordsA, ...wordsB]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  // ─── ЛАКШМИ: ДИСТИЛЛЯЦИЯ ───────────────────────────────────────────────

  /**
   * Дистилляция: сжать множество инсайтов/паттернов в обобщённую мудрость.
   * Вызывается раз в N циклов (distillationPeriodCycles из конфига).
   */
  async distill(llmCall = null) {
    const lastDist = this.knowledgeBase.lastDistillation;
    const cycleId = this.currentCycle.cycleId;
    const cyclesSinceLast = lastDist ? cycleId - lastDist.cycleId : this.config.distillationPeriodCycles;

    if (cyclesSinceLast < this.config.distillationPeriodCycles) {
      return {
        distilled: false,
        reason: `слишком рано: ${cyclesSinceLast}/${this.config.distillationPeriodCycles} циклов с последней дистилляции`,
      };
    }

    // Группируем инсайты по домену
    const byDomain = {};
    for (const insight of this.knowledgeBase.insights) {
      if (insight.archivedAt) continue; // пропускаем архивированные
      if (!byDomain[insight.domain]) byDomain[insight.domain] = [];
      byDomain[insight.domain].push(insight);
    }

    const newPatterns = [];
    for (const [domain, insights] of Object.entries(byDomain)) {
      if (insights.length < this.config.distillationMinPatternCount) continue;

      // Без LLM — создаём простой паттерн
      if (!llmCall) {
        newPatterns.push({
          id: 'P' + Date.now() + Math.random().toString(36).slice(2, 5),
          domain,
          text: `Паттерн в домене "${domain}" на основе ${insights.length} инсайтов`,
          sourceInsightIds: insights.map((i) => i.id),
          confidence: insights.reduce((s, i) => s + i.confidence, 0) / insights.length,
          createdAt: new Date().toISOString(),
        });
      } else {
        // С LLM — просим обобщить
        const prompt = `Обобщи ${insights.length} инсайтов домена "${domain}" в один паттерн.\n\n` +
          insights.map((i) => `- ${i.text}`).join('\n') +
          `\n\nОтветь JSON: { "pattern": "...", "confidence": 0.0 }`;
        try {
          const resp = await llmCall(prompt);
          const parsed = typeof resp === 'string' ? JSON.parse(resp) : resp;
          newPatterns.push({
            id: 'P' + Date.now() + Math.random().toString(36).slice(2, 5),
            domain,
            text: parsed.pattern,
            sourceInsightIds: insights.map((i) => i.id),
            confidence: parsed.confidence || 0.7,
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error('[Learning] Ошибка дистилляции:', err.message);
        }
      }
    }

    this.knowledgeBase.patterns.push(...newPatterns);
    this.knowledgeBase.lastDistillation = {
      cycleId,
      at: new Date().toISOString(),
      patternsCreated: newPatterns.length,
    };
    await this._save();
    return { distilled: true, patternsCreated: newPatterns.length };
  }

  // ─── ЛАКШМИ: АРХИВАЦИЯ ─────────────────────────────────────────────────

  /**
   * Архивировать устаревшие инсайты (не использовавшиеся >insightStaleDays).
   * НЕ удаляет — помечает как archived с причиной.
   */
  async archiveStale() {
    const now = Date.now();
    const staleMs = this.config.insightStaleDays * 24 * 60 * 60 * 1000;
    let archived = 0;

    for (const insight of this.knowledgeBase.insights) {
      if (insight.archivedAt) continue;
      const age = now - new Date(insight.createdAt).getTime();
      if (age > staleMs && insight.appliedCount === 0) {
        insight.archivedAt = new Date().toISOString();
        insight.reason = `не использован ${this.config.insightStaleDays} дней`;
        archived++;
      }
    }

    await this._save();
    return { archived };
  }

  // ─── ЛАКШМИ: РАГНАРЁК ──────────────────────────────────────────────────

  /**
   * Проверка на Рагнарёк (деградация 3 цикла подряд) и активация отката.
   *
   * @param {Object} currentMetrics — { metricName: value, ... }
   */
  async checkRagnarok(currentMetrics) {
    const lastMetrics = this.knowledgeBase.history.lastMetrics;

    if (!lastMetrics) {
      this.knowledgeBase.history.lastMetrics = currentMetrics;
      await this._save();
      return { triggered: false, reason: 'нет базовой линии метрик' };
    }

    // Подсчёт: сколько метрик упало на >ragnarokMetricDropPercent
    const degraded = [];
    for (const [name, current] of Object.entries(currentMetrics)) {
      const prev = lastMetrics[name];
      if (typeof prev !== 'number' || typeof current !== 'number') continue;
      const dropPct = prev > 0 ? ((prev - current) / prev) * 100 : 0;
      if (dropPct >= this.config.ragnarokMetricDropPercent) {
        degraded.push({ name, from: prev, to: current, dropPct });
      }
    }

    const degradedThisCycle = degraded.length > 0;
    if (degradedThisCycle) {
      this.knowledgeBase.history.degradationCycles += 1;
    } else {
      this.knowledgeBase.history.degradationCycles = 0; // сброс
    }

    // Обновляем базу метрик
    this.knowledgeBase.history.lastMetrics = currentMetrics;

    if (this.knowledgeBase.history.degradationCycles >= this.config.ragnarokDegradationCycles) {
      // РАГНАРЁК!
      return await this._triggerRagnarok(degraded);
    }

    await this._save();
    return {
      triggered: false,
      degradedMetrics: degraded,
      degradationCycles: this.knowledgeBase.history.degradationCycles,
    };
  }

  /**
   * Запустить Рагнарёк: откатить последние N циклов по стоимости инсайтов.
   */
  async _triggerRagnarok(degradedMetrics) {
    this.autoUpdateFrozen = true;

    // 1. Откатываем инсайты последних N циклов, сортируя по стоимости
    //    (инсайты с высоким appliedCount откатываются последними — они ценнее)
    const cutoffCycle = this.currentCycle.cycleId - this.config.ragnarokDegradationCycles;
    const recentInsights = this.knowledgeBase.insights
      .filter((i) => !i.archivedAt && i.sourceCycleId > cutoffCycle)
      .sort((a, b) => a.appliedCount - b.appliedCount); // дешёвые первыми

    const rolledBack = [];
    for (const insight of recentInsights) {
      insight.archivedAt = new Date().toISOString();
      insight.reason = 'rolled back by Ragnarok petля (cost-ordered)';
      rolledBack.push(insight.id);
    }

    await this._save();

    console.error('[Learning] 🔥 РАГНАРЁК АКТИВИРОВАН');
    console.error(`  Деградация ${this.config.ragnarokDegradationCycles} циклов подряд.`);
    console.error(`  Откачено инсайтов: ${rolledBack.length}`);
    console.error('  autoUpdate заморожен до ручного подтверждения.');

    return {
      triggered: true,
      rolledBackInsights: rolledBack,
      degradedMetrics,
      frozenUntilManualUnfreeze: true,
    };
  }

  /**
   * Ручная разморозка autoUpdate (после рассмотрения Рагнарёка пользователем).
   */
  async unfreezeAfterRagnarok() {
    this.autoUpdateFrozen = false;
    this.knowledgeBase.history.degradationCycles = 0;
    await this._save();
    return { unfrozen: true };
  }

  // ─── ЛАКШМИ: РЕЕСТР ГОРИЗОНТОВ ─────────────────────────────────────────

  /**
   * Добавить новый горизонт исследования.
   */
  async addHorizon(area, hypothesis, priority = 'medium') {
    const horizon = {
      id: 'N' + Date.now() + Math.random().toString(36).slice(2, 5),
      area,
      hypothesis,
      priority,  // 'high' | 'medium' | 'low' | 'closed'
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.knowledgeBase.horizons.push(horizon);
    await this._save();
    return horizon;
  }

  /**
   * Обновить статус горизонта (ranked by maturity).
   */
  async updateHorizon(horizonId, updates) {
    const h = this.knowledgeBase.horizons.find((x) => x.id === horizonId);
    if (!h) throw new Error(`Горизонт не найден: ${horizonId}`);
    Object.assign(h, updates, { updatedAt: new Date().toISOString() });
    await this._save();
    return h;
  }

  // ─── ПЕРЕХОД К НОВОМУ ЦИКЛУ ───────────────────────────────────────────

  /**
   * Завершить текущий цикл и начать новый.
   */
  async advanceCycle() {
    const finishedCycle = { ...this.currentCycle, finishedAt: new Date().toISOString() };

    // Архивация цикла — для Притхиви (база знаний)
    await this.storage.set(`cycle:${finishedCycle.cycleId}`, finishedCycle);

    // Новый цикл
    this.currentCycle = this._emptyCycle(finishedCycle.cycleId + 1);
    await this._save();
    return this.currentCycle;
  }

  // ─── ПОЛНЫЙ ПРОХОД ─────────────────────────────────────────────────────

  /**
   * Запустить полный проход: от OBSERVE до UPDATE.
   * Используется как daily/weekly запуск (аналог runSurya из скила).
   */
  async runFullCycle({ llmCall = null, applier = null, metrics = null } = {}) {
    const result = {
      cycleId: this.currentCycle.cycleId,
      startedAt: new Date().toISOString(),
      phases: {},
    };

    // 1. Проверка Рагнарёка (если есть метрики)
    if (metrics) {
      result.phases.ragnarokCheck = await this.checkRagnarok(metrics);
      if (result.phases.ragnarokCheck.triggered) {
        return { ...result, stoppedByRagnarok: true };
      }
    }

    if (this.autoUpdateFrozen) {
      return { ...result, skipped: 'auto-update-frozen' };
    }

    // 2. HYPOTHESIZE (если достаточно наблюдений)
    result.phases.hypothesize = await this.hypothesize(llmCall);

    // 3. EXPERIMENT — в рамках полного прохода не запускаем новые эксперименты,
    //    но завершаем просроченные
    const completedExps = [];
    for (const exp of this.currentCycle.experiments) {
      if (exp.status === 'running' && new Date() >= new Date(exp.deadline)) {
        exp.status = 'completed';
        exp.completedAt = new Date().toISOString();
        completedExps.push(exp.id);
      }
    }
    result.phases.experimentsCompleted = completedExps;

    // 4. CONCLUDE — по всем completed экспериментам
    const newConclusions = [];
    for (const exp of this.currentCycle.experiments) {
      if (exp.status === 'completed' &&
          !this.currentCycle.conclusions.some((c) => c.experimentId === exp.id)) {
        try {
          const c = await this.concludeExperiment(exp.id);
          newConclusions.push(c);
        } catch (err) {
          console.error(`[Learning] Ошибка concludeExperiment:`, err.message);
        }
      }
    }
    result.phases.conclusions = newConclusions.map((c) => c.id);

    // 5. UPDATE
    result.phases.updates = await this.applyUpdates(newConclusions, applier);

    // 6. Проверка необходимости дистилляции
    result.phases.distillation = await this.distill(llmCall);

    // 7. Архивация устаревшего
    result.phases.archived = await this.archiveStale();

    result.finishedAt = new Date().toISOString();
    return result;
  }

  // ─── ИНСПЕКЦИЯ ─────────────────────────────────────────────────────────

  /**
   * Получить здоровье цикла — метрики из скила.
   */
  getHealth() {
    const obs = this.currentCycle.observations.length;
    const hyp = this.currentCycle.hypotheses.length;
    const exp = this.currentCycle.experiments.length;
    const completed = this.currentCycle.experiments.filter((e) => e.status === 'completed').length;

    const kb = this.knowledgeBase;
    const activeInsights = kb.insights.filter((i) => !i.archivedAt).length;
    const archived = kb.insights.filter((i) => i.archivedAt).length;

    return {
      cycleId: this.currentCycle.cycleId,
      phase: this.currentCycle.phase,
      observationRate: obs,
      hypothesesCount: hyp,
      experimentsRunning: exp - completed,
      experimentsCompleted: completed,
      knowledgeBase: {
        activeInsights,
        archivedInsights: archived,
        patterns: kb.patterns.length,
        openHorizons: kb.horizons.filter((h) => h.status === 'open').length,
      },
      degradationCycles: kb.history.degradationCycles,
      autoUpdateFrozen: this.autoUpdateFrozen,
    };
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// IN-MEMORY STORAGE (для MVP и тестов)
// ═══════════════════════════════════════════════════════════════════════════
//
// Для продакшена нужно заменить на chrome.storage.local (из твоего скила)
// или на файловое хранилище / БД. Интерфейс: { get(key), set(key, value) }.

class InMemoryStorage {
  constructor() {
    this.data = new Map();
  }
  async get(key) {
    return this.data.get(key) || null;
  }
  async set(key, value) {
    this.data.set(key, value);
  }
  async delete(key) {
    this.data.delete(key);
  }
  async keys() {
    return Array.from(this.data.keys());
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// ЭКСПОРТ
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  LearningCycle,
  InMemoryStorage,
  DEFAULT_CONFIG,
  SIGNAL_SOURCES,
  PHASE_AGENTS,
};


// ═══════════════════════════════════════════════════════════════════════════
// CLI + ТЕСТ
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  (async () => {
    console.log('\n' + '═'.repeat(72));
    console.log('  ПАНТЕОН · LEARNING v3.1');
    console.log('═'.repeat(72) + '\n');

    const cycle = new LearningCycle();
    await cycle.init();

    console.log('── Цикл инициализирован ──');
    console.log('  cycleId:', cycle.currentCycle.cycleId);
    console.log('  phase:  ', cycle.currentCycle.phase);

    console.log('\n── Агенты цикла по фазам ──');
    for (const [phase, agents] of Object.entries(PHASE_AGENTS)) {
      console.log(`  ${phase.padEnd(12)} ${agents.join(', ')}`);
    }

    // Добавим 7 наблюдений
    console.log('\n── Симуляция 7 наблюдений ──');
    for (let i = 0; i < 7; i++) {
      await cycle.observe({
        source: 'measurable_result',
        domain: 'prompt',
        signal: { metric: 'accuracy', value: 0.75 + i * 0.01 },
        agent: 'brahma',
      });
    }
    console.log(`  добавлено: ${cycle.currentCycle.observations.length}`);

    // Гипотезы
    console.log('\n── HYPOTHESIZE (без LLM) ──');
    const hypResult = await cycle.hypothesize();
    console.log(`  готов: ${hypResult.ready}, гипотез: ${hypResult.count || 0}`);
    if (cycle.currentCycle.hypotheses.length > 0) {
      const h = cycle.currentCycle.hypotheses[0];
      console.log(`  пример: [${h.id}] ${h.text}`);
    }

    // Эксперимент
    console.log('\n── EXPERIMENT ──');
    const firstHyp = cycle.currentCycle.hypotheses[0];
    const exp = await cycle.startExperiment(firstHyp.id, {
      variable: 'prompt_variant',
      control: 'v1',
      treatment: 'v2',
      scope: 'prompt',
      sampleSize: 3,
      metricName: 'accuracy',
    });
    console.log(`  эксперимент ${exp.id} запущен, дедлайн: ${exp.deadline.slice(0, 16)}`);

    // Результаты эксперимента (3 наблюдения — сработает автозавершение по sampleSize)
    for (let i = 0; i < 3; i++) {
      await cycle.recordExperimentResult(exp.id, {
        id: `r${i}`,
        supportsHypothesis: i < 2, // 2 из 3 подтверждают
      });
    }
    console.log(`  статус после 3 результатов: ${cycle.currentCycle.experiments[0].status}`);

    // Вывод
    console.log('\n── CONCLUDE ──');
    const conclusion = await cycle.concludeExperiment(exp.id);
    console.log(`  verdict: ${conclusion.verdict}, confidence: ${conclusion.confidence.toFixed(2)}`);
    console.log(`  action:  ${conclusion.action}`);

    // UPDATE — Лакшми курирует
    console.log('\n── UPDATE (курирует Лакшми) ──');
    const updateResult = await cycle.applyUpdates([conclusion]);
    console.log(`  применено: ${updateResult.applied}/${updateResult.total}`);
    console.log(`  инсайтов в knowledgeBase: ${cycle.knowledgeBase.insights.length}`);
    if (cycle.knowledgeBase.insights.length > 0) {
      const ins = cycle.knowledgeBase.insights[0];
      console.log(`  последний: [${ins.id.slice(0, 10)}] confidence=${ins.confidence.toFixed(2)}`);
    }

    // Горизонт
    console.log('\n── Лакшми: добавить горизонт ──');
    const horizon = await cycle.addHorizon(
      'temporal',
      'Утренние публикации дают выше engagement, чем вечерние',
      'high'
    );
    console.log(`  горизонт ${horizon.id}: ${horizon.area} (${horizon.priority})`);

    // Рагнарёк — с хорошими метриками не должен сработать
    console.log('\n── Проверка Рагнарёка (здоровые метрики) ──');
    const rag1 = await cycle.checkRagnarok({ engagement: 100, conversion: 0.15 });
    console.log(`  triggered: ${rag1.triggered}, degradationCycles: ${rag1.degradationCycles || 0}`);

    // Ухудшим метрики 3 раза подряд
    console.log('\n── Симуляция 3 циклов деградации ──');
    let rag;
    for (let i = 0; i < 3; i++) {
      const factor = 1 - (i + 1) * 0.15; // -15%, -30%, -45%
      rag = await cycle.checkRagnarok({
        engagement: 100 * factor,
        conversion: 0.15 * factor,
      });
      console.log(`  цикл ${i+1}: triggered=${rag.triggered}, degCycles=${rag.degradationCycles || 0}`);
      if (rag.triggered) break;
    }
    if (rag.triggered) {
      console.log(`  🔥 РАГНАРЁК: откачено ${rag.rolledBackInsights.length} инсайтов`);
      console.log(`  autoUpdate заморожен: ${cycle.autoUpdateFrozen}`);

      // Разморозка
      await cycle.unfreezeAfterRagnarok();
      console.log(`  после unfreeze: ${cycle.autoUpdateFrozen}`);
    }

    // Здоровье
    console.log('\n── Здоровье цикла ──');
    const h = cycle.getHealth();
    Object.entries(h).forEach(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        console.log(`  ${k}:`);
        Object.entries(v).forEach(([kk, vv]) => console.log(`    ${kk}: ${vv}`));
      } else {
        console.log(`  ${k.padEnd(20)} ${v}`);
      }
    });

    console.log('\n✓ pantheon-learning v3.1 готов к работе\n');
  })().catch((err) => {
    console.error('ОШИБКА:', err);
    process.exit(1);
  });
}
