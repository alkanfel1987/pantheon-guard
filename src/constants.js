/**
 * pantheon-guard · constants
 *
 * Core enumerations and version metadata.
 * Pure data — no functions, no cross-module dependencies.
 */

'use strict';

const CORE_VERSION = '3.1.0';

const LAYERS = Object.freeze({
  META:        'Meta',
  META_SHAKTI: 'Meta-Shakti',
  ADITYA:      'Āditya',
  KRIYA:       'Kriyā',
  VASU:        'Vasu',
  ASHVIN:      'Aśvin',
});

const GUNAS = Object.freeze({
  SATTVA: 'Саттва',
  RAJAS:  'Раджас',
  TAMAS:  'Тамас',
});

const PRIORITY = Object.freeze({
  BRAHMAN:    0,   // Brahman — ontological foundation
  MAHAVRATA:  1,   // 5 ego restraints — absolute
  LAWS:       2,   // 10+1 operational laws
  ALGORITHM:  3,   // 5-step decision protocol
  AGENT:      4,   // individual agent decisions
});

module.exports = {
  CORE_VERSION,
  LAYERS,
  GUNAS,
  PRIORITY,
};
