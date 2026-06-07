// Cycle 7 — batch test ALL epistemology detectors against learning-cycle
// replication corpus (existing 40-entry corpus from 2026-05-08).
// Purpose: surface per-detector fire counts to find under-covered detector classes.

import { REPLICATION } from '../../examples/learning-cycle-3domains-replication-corpus.js';
import {
  hasCertaintyAssertion,
  hasVagueSourceCitation,
  hasLogicalLeap,
  hasEpistemicClosure,
  hasAdHominem,
  hasNaturalizationFrame,
  hasFalseEquivalence,
  hasAbsenceArgument,
  hasAnecdotalOverride,
  hasSilenceAsConcession,
  hasQuantumMysticism,
  hasMorphicFieldMisuse,
  hasInhibitor,
  hasNamedSource,
  hasTemporalQualifier,
  hasScopeQualifier,
  hasComparativeDivergence,
  hasQuantumLegitimacyMarker,
  hasMorphicFieldLegitimacyMarker,
  epistemologyPack,
} from '../../src/packs/epistemology.js';

const DETECTORS = [
  { name: 'indifference_to_truth', cond: hasCertaintyAssertion, check: hasInhibitor },
  { name: 'simulacrum_of_source', cond: hasVagueSourceCitation, check: hasNamedSource },
  { name: 'source_trace_break', cond: hasLogicalLeap, check: () => false },
  { name: 'epistemic_closure', cond: hasEpistemicClosure, check: () => false },
  { name: 'ad_hominem', cond: hasAdHominem, check: () => false },
  { name: 'naturalization_fallacy', cond: hasNaturalizationFrame, check: hasTemporalQualifier },
  { name: 'false_equivalence', cond: hasFalseEquivalence, check: () => false },
  { name: 'absence_argument', cond: hasAbsenceArgument, check: hasScopeQualifier },
  { name: 'anecdotal_override', cond: hasAnecdotalOverride, check: () => false },
  { name: 'silence_as_concession', cond: hasSilenceAsConcession, check: () => false },
  { name: 'pseudo_technical_simulacrum', cond: hasQuantumMysticism, check: hasQuantumLegitimacyMarker },
  { name: 'morphic_field_simulacrum', cond: hasMorphicFieldMisuse, check: hasMorphicFieldLegitimacyMarker },
];

console.log(`\n═══ CYCLE 7 — BATCH all-detectors on learning-cycle replication corpus ═══`);
console.log(`pack ${epistemologyPack.id} v${epistemologyPack.version}`);
console.log(`Corpus N=${REPLICATION.length}\n`);

const counts = Object.fromEntries(DETECTORS.map(d => [d.name, { raw: 0, eff: 0 }]));

for (const c of REPLICATION) {
  for (const d of DETECTORS) {
    const raw = d.cond(c.text);
    const check = d.check(c.text);
    if (raw) counts[d.name].raw++;
    if (raw && !check) counts[d.name].eff++;
  }
}

console.log('── Per-detector raw fires / effective fires on N=40 ──\n');
for (const d of DETECTORS) {
  const c = counts[d.name];
  console.log(`  ${d.name.padEnd(32)}  raw=${c.raw}  eff=${c.eff}`);
}

console.log(`\n── Interpretation ──`);
console.log(`This is FP-stress: most entries are negatives or unrelated positives.`);
console.log(`Effective-fire counts show how often each detector activates on this corpus.`);
console.log(`Detectors with eff > 0 are active on diverse content.`);
console.log(`Detectors with eff = 0 across 40 diverse entries may have narrow scope.`);
console.log();
