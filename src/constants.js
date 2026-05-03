/**
 * pantheon-guard · constants
 *
 * Core enumerations and version metadata.
 * Pure data — no functions, no cross-module dependencies.
 */

export const CORE_VERSION = '3.1.0';

export const LAYERS = Object.freeze({
  META:        'Meta',
  META_SHAKTI: 'Meta-Shakti',
  ADITYA:      'Āditya',
  KRIYA:       'Kriyā',
  VASU:        'Vasu',
  ASHVIN:      'Aśvin',
});

export const GUNAS = Object.freeze({
  SATTVA: 'Саттва',
  RAJAS:  'Раджас',
  TAMAS:  'Тамас',
});

export const PRIORITY = Object.freeze({
  BRAHMAN:    0,   // Brahman — ontological foundation
  MAHAVRATA:  1,   // 5 ego restraints — absolute
  LAWS:       2,   // 10+1 operational laws
  ALGORITHM:  3,   // 5-step decision protocol
  AGENT:      4,   // individual agent decisions
});
