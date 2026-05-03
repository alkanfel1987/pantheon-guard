/**
 * pantheon-guard · svadharma
 *
 * Svadharma = jāti × guṇa × karma × svabhāva
 *
 *   jāti     — agent layer; IMMUTABLE
 *   guṇa     — predominant quality
 *   karma    — designated function
 *   svabhāva — own nature, tone
 *
 * Source: Bhagavad-Gītā III.35 — "śreyān svadharmo viguṇaḥ paradharmāt
 * svanuṣṭhitāt" — "Better is one's own dharma, even if imperfect, than
 * another's well-performed."
 */

import { LAYERS, GUNAS } from './constants.js';

export const SVADHARMA_SCHEMA = Object.freeze({
  source: 'Bhagavad-Gītā III.35',

  variables: {
    jati: {
      description: 'Слой агента (онтологический; неизменяем)',
      values: Object.values(LAYERS),
      mutable: false,
    },
    guna: {
      description: 'Преобладающее качество действия',
      values: [
        GUNAS.SATTVA,
        GUNAS.RAJAS,
        GUNAS.TAMAS,
        // Combinations via "+" allowed — e.g. "Саттва+Раджас"
      ],
      mutable: true,
      note: 'Может уточняться со временем через цикл саморазвития',
    },
    karma: {
      description: 'Предназначенная функция в продукте',
      format: 'string — конкретная функциональная формулировка',
      mutable: true,
      note: 'Уточняется внутри рамок, не меняется радикально',
    },
    svabhava: {
      description: 'Тон, стиль, собственная природа',
      format: 'string — описание характера агента',
      mutable: true,
      note: 'Самая живая переменная; утончается через практику',
    },
  },
});

/**
 * Validate the structure of an agent's Svadharma.
 * Checks that all 4 variables are defined and well-formed.
 *
 * @param {Object} svadharma — { jati, guna, karma, svabhava }
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateSvadharma(svadharma = {}) {
  const errors = [];
  const { jati, guna, karma, svabhava } = svadharma;

  // jati
  if (!jati) {
    errors.push('jati is required');
  } else if (!Object.values(LAYERS).includes(jati)) {
    errors.push(`jati "${jati}" is not one of: ${Object.values(LAYERS).join(', ')}`);
  }

  // guna
  if (!guna) {
    errors.push('guna is required');
  } else {
    // Special meta-level values (Indra with spanda — all three gunas)
    const specialMetaGunas = [
      'Все три (spanda)',
      'Все три (динамический баланс)',
    ];
    if (!specialMetaGunas.includes(guna)) {
      const gunaParts = guna.split('+').map((g) => g.trim());
      const validGunas = Object.values(GUNAS);
      const invalid = gunaParts.filter((g) => !validGunas.includes(g));
      if (invalid.length > 0) {
        errors.push(`invalid guna parts: ${invalid.join(', ')}`);
      }
    }
  }

  // karma
  if (!karma || typeof karma !== 'string' || karma.length < 5) {
    errors.push('karma must be a non-trivial string');
  }

  // svabhava
  if (!svabhava || typeof svabhava !== 'string' || svabhava.length < 5) {
    errors.push('svabhava must be a non-trivial string');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check whether the agent stays within its Svadharma —
 * is it trying to act outside its formula?
 *
 * @param {Object} svadharma — current agent's Svadharma
 * @param {Object} action — proposed action:
 *   - targetLayer {string}   — which layer the action belongs to (by function)
 *   - targetKarma {string}   — type of action (must match karma)
 * @returns {{valid: boolean, violation?: string, reason?: string, suggestedAgent?: any}}
 */
export function checkSvadharmaConsistency(svadharma, action = {}) {
  // 1. jati check — strictest
  if (action.targetLayer && action.targetLayer !== svadharma.jati) {
    return {
      valid: false,
      violation: 'jati',
      reason: `Действие принадлежит слою ${action.targetLayer}, не ${svadharma.jati}`,
      suggestedAgent: null,  // populated by pantheon-agents.js
    };
  }

  // 2. karma — explicit mismatch with description
  if (action.targetKarma && svadharma.karma) {
    // Simple heuristic: keywords from targetKarma should appear in karma
    const targetWords = action.targetKarma.toLowerCase().split(/\s+/);
    const karmaText = svadharma.karma.toLowerCase();
    const matches = targetWords.filter((w) => w.length > 3 && karmaText.includes(w));
    if (matches.length === 0) {
      return {
        valid: false,
        violation: 'karma',
        reason: `Действие "${action.targetKarma}" не соответствует карме "${svadharma.karma}"`,
        suggestedAgent: null,
      };
    }
  }

  return { valid: true };
}
