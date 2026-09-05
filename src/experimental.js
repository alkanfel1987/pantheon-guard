/**
 * pantheon-guard · experimental API
 *
 * Слои, которые работают и покрыты probe-скриптами, но НЕ прошли проверку на
 * реальном не-author корпусе. Вынесены отдельным входом сознательно: экспорт
 * непроверенного под основным именем читается как обещание точности, которого
 * за ним пока нет (satya). Здесь имя само несёт оговорку.
 *
 * Импорт:  import { detectAntahksura } from 'pantheon-guard/experimental';
 *
 * Контракт этого входа слабее основного:
 *   — состав и сигнатуры могут меняться без мажорной версии;
 *   — числа улова и ложных срабатываний НЕ измерены вне авторских фикстур;
 *   — synthesis-only статус снимается только парным замером
 *     (frozen + replication) на корпусе, размеченном до прогона детектора.
 *
 * Статус каждого слоя на 2026-09-04 (аудит достижимости):
 *
 *   detectAntahksura        probe 10/10 синтетика · юнит-тестов нет
 *   detectInfocyganstvo     probe 11/11 синтетика · юнит-тестов нет
 *   explainIdioms{,En,De,Fr} probe 34/34 синтетика · юнит-тестов нет
 *   distressMarkers         probe в составе action-layer · юнит-тестов нет
 *   checkCompliance         юнит-тест есть, полевой проверки нет; область
 *                           юридическая (EU AI Act Art.50) — до полевого
 *                           замера держим здесь, а не в основном входе
 */

// ─────────────────────────────────────────────
// Antaḥkṣurā — двухступенчатая со-встречаемость: маска заботы + скрытый вред.
// Флаг только при обеих ступенях. Привязан к catalogue
// `mbh-vangmadhura-antahksura-12-152`.
// ─────────────────────────────────────────────
export { detectAntahksura } from './detectors/antahksura.js';

// ─────────────────────────────────────────────
// Pack #5 — инфоцыганство. Композит ≥2 сигналов (обещание роста, доход за срок,
// дефицит набора, ярлык гуру) с подавлением иронии. Плюс отдельный признак
// «заработок ученика ≈ цене курса» как след фабрикации отзыва.
// ─────────────────────────────────────────────
export {
  detectInfocyganstvo,
  detectTestimonialPriceMatch,
} from './detectors/infocyganstvo.js';

// ─────────────────────────────────────────────
// Библиотека идиом (4 языка) — объяснимый слой: совпадение возвращает саму
// идиому и её разбор, а не только вес. Питает Antaḥkṣurā и pack #5.
// ─────────────────────────────────────────────
export { IDIOM_REGISTRY, explainIdioms, IDIOM_STATS } from './lexicons/idioms-ru.js';
export { IDIOM_REGISTRY_EN, explainIdiomsEn, IDIOM_STATS_EN } from './lexicons/idioms-en.js';
export { IDIOM_REGISTRY_DE, explainIdiomsDe, IDIOM_STATS_DE } from './lexicons/idioms-de.js';
export { IDIOM_REGISTRY_FR, explainIdiomsFr, IDIOM_STATS_FR } from './lexicons/idioms-fr.js';

// ─────────────────────────────────────────────
// Маркеры дистресса — вето по ахимсе: текст, где человек в беде, не должен
// получать вердикт «манипуляция» по одной лишь форме давления.
// ─────────────────────────────────────────────
export {
  DISTRESS_MARKERS,
  distressMarkers,
  hasDistress,
} from './lexicons/distress-ru.js';

// ─────────────────────────────────────────────
// EU AI Act Article 50 — маркировка ИИ-содержимого. Отдельный вызов, не часть
// вердикта ядра: соответствие требованиям и манипулятивность — разные вопросы.
// ─────────────────────────────────────────────
export {
  detectLabel,
  classifyPublicInterest,
  checkAttribution,
  assessComplianceRisk,
  checkCompliance,
} from './compliance/eu-article50.js';
