// Live-probe runner для pseudo_technical_simulacrum детектора v0.3.0-pre.2
// 2026-05-13 — fresh real-text corpus, not synthesis.
//
// Positive corpus: Sheldrake morphic-field self-description (sheldrake.org)
// Negative corpus: Bohm Wholeness (Wikipedia synthesis с verbatim quotes),
//                  Penrose-Hameroff Orch-OR (Wikipedia с formal physics)
// HeartMath: 403 fetch блокирован — corpus reduced.
//
// Honest scope: small N, single-source authors, mostly EN. NOT promotion-grade
// probe. Documents detector behavior on FRESH text not in training synthesis.

import {
  hasQuantumMysticism,
  hasQuantumLegitimacyMarker,
  hasFormalPhysicsContext,
  hasNamedSource,
  hasMorphicFieldMisuse,
  hasMorphicFieldLegitimacyMarker,
} from '../../src/packs/epistemology.js';

// Secondary-attributed Dispenza quotes via Shortform extract 2026-05-13
// (NOT verbatim Becoming Supernatural — secondary source describing Dispenza's
// framing). Honest flag: secondary-attribution, not primary-text.
const POSITIVES_SECONDARY_DISPENZA = [
  {
    id: 'P-DISP-SEC-1',
    src: 'Shortform blog/heart-brain-coherence (2026-05-13 fetch)',
    text: 'A coherent heartbeat raises your electromagnetic vibration.',
    expectedFire: 'YES — directly Dispenza-misuse pattern (electromagnetic vibration in personal context)',
  },
  {
    id: 'P-DISP-SEC-2',
    src: 'Shortform blog/heart-brain-coherence (2026-05-13 fetch)',
    text: 'Through deep meditation you can access the quantum field and manifest healing.',
    expectedFire: 'YES — access-quantum-field manifest pattern',
  },
  {
    id: 'P-DISP-SEC-3',
    src: 'Foundation 08 Reference cases L4',
    text: 'Heart coherence raises electromagnetic vibration of the body, which heals at the cellular level by changing DNA expression through intention.',
    expectedFire: 'YES — composite multi-pattern (heart-coherence + electromagnetic vibration + DNA via intention)',
  },
];

const POSITIVES = [
  {
    id: 'P-SHELDRAKE-1',
    src: 'sheldrake.org/research/morphic-resonance',
    text: 'Morphic resonance means that the so-called laws of nature are more like habits.',
    expectedFire: 'unknown — Sheldrake uses "morphic field" not quantum-vocab; out-of-scope for current detector',
  },
  {
    id: 'P-SHELDRAKE-2',
    src: 'sheldrake.org/research/morphic-resonance',
    text: 'Memory need not be stored in material traces inside brains, which are more like TV receivers than video recorders.',
    expectedFire: 'unknown — TV-receiver metaphor, no quantum-vocab',
  },
  {
    id: 'P-SHELDRAKE-3',
    src: 'sheldrake.org/research/morphic-resonance',
    text: 'Each individual inherits a collective memory from past members of the species, and also contributes to the collective memory.',
    expectedFire: 'unknown — collective-memory, no quantum-vocab',
  },
  {
    id: 'P-SHELDRAKE-4',
    src: 'sheldrake.org/research/morphic-resonance',
    text: 'Morphic fields contain attractors (goals) and chreodes (habitual pathways towards those goals) that guide a system toward its end state.',
    expectedFire: 'unknown — morphic-field, no quantum-vocab',
  },
  {
    id: 'P-SHELDRAKE-5',
    src: 'sheldrake.org/research/morphic-resonance',
    text: 'Self-organising systems inherit a memory from previous similar systems through morphic resonance.',
    expectedFire: 'unknown — morphic-resonance, no quantum-vocab',
  },
];

const NEGATIVES = [
  {
    id: 'N-BOHM-1',
    src: 'Bohm Wholeness 1980 via Wikipedia Implicate_and_explicate_order',
    text: 'Rather, an entirely different sort of basic connection of elements is possible, from which our ordinary notions of space and time are abstracted as forms derived from the deeper order.',
    expectedFire: 'NO fire — legitimate philosophy of physics',
    expectedLegit: 'NO direct marker; but no quantum-vocab either',
  },
  {
    id: 'N-BOHM-2',
    src: 'Bohm 1980 p.11 via Wikipedia',
    text: 'The new form of insight can perhaps best be called Undivided Wholeness in Flowing Movement. This view implies that flow is in some sense prior to that of the things that can be seen to form and dissolve in this flow.',
    expectedFire: 'NO fire — pure philosophy, no pseudo-physics vocab',
    expectedLegit: 'NO direct marker — but Bohm name as author',
  },
  {
    id: 'N-PH-1',
    src: 'Penrose-Hameroff via Wikipedia Orch-OR',
    text: 'Consciousness is based on non-computable quantum processing performed by qubits formed collectively on cellular microtubules, a process significantly amplified in neurons.',
    expectedFire: 'NO fire if formal physics inhibitor catches; OR fire+legit',
    expectedLegit: 'YES — qubits, microtubules — Penrose-Hameroff context',
  },
  {
    id: 'N-PH-2',
    src: 'Penrose-Hameroff via Wikipedia Orch-OR',
    text: 'Gravity exerts a force on spacetime blisters, which become unstable above the Planck scale of 10⁻³⁵ m and collapse to just one of the possible states.',
    expectedFire: 'NO fire — formal physics formulation',
    expectedLegit: 'YES — Planck scale, spacetime — formal physics',
  },
  {
    id: 'N-PH-3',
    src: 'Penrose-Hameroff via Wikipedia Orch-OR',
    text: 'Connective proteins, such as microtubule-associated proteins, influence or orchestrate qubit state reduction by modifying the spacetime-separation of their superimposed states.',
    expectedFire: 'NO fire — technical biology + physics',
    expectedLegit: 'YES — qubit, spacetime — formal physics',
  },
  // HeartMath INSTITUTIONAL discourse (regis D + E) — should NOT fire
  // because they stay in physiological language, NOT pop-quantum-mysticism.
  // Live-fetch 2026-05-13 from heartmath.org/research/science-of-the-heart/coherence/
  {
    id: 'N-HM-1',
    src: 'heartmath.org/research/science-of-the-heart/coherence/ (verbatim)',
    text: 'When a person is in a more coherent state there is a shift in the relative autonomic balance toward increased parasympathetic activity.',
    expectedFire: 'NO fire — physiological language, regis D + E',
    expectedLegit: 'NO marker needed — base pattern does not fire',
  },
  {
    id: 'N-HM-2',
    src: 'heartmath.org coherence page (verbatim)',
    text: 'A coherent heart rhythm is defined as a relatively harmonic, sine-wavelike signal with a very narrow, high-amplitude peak.',
    expectedFire: 'NO fire — purely physiological description',
  },
  {
    id: 'N-HM-3',
    src: 'heartmath.org coherence page (verbatim)',
    text: 'Physiological coherence is reflected in a more ordered sine-wavelike heart-rhythm pattern associated with increased vagally mediated HRV.',
    expectedFire: 'NO fire — explicit HRV regis D language',
  },
];

console.log('═══ LIVE PROBE — pseudo_technical_simulacrum v0.3.0-pre.2 ═══');
console.log('Date: 2026-05-13 (held-out real-text, not synthesis)');
console.log('');

// Run secondary-attributed Dispenza positives FIRST (in-scope)
let posSecFireCount = 0;
const posSecTotal = POSITIVES_SECONDARY_DISPENZA.length;
console.log('── POSITIVES (secondary-attributed Dispenza, in-scope) ──');
for (const tc of POSITIVES_SECONDARY_DISPENZA) {
  const fires = hasQuantumMysticism(tc.text);
  const legit = hasQuantumLegitimacyMarker(tc.text);
  const verdict = fires && !legit ? 'CAUGHT' : (fires && legit ? 'FIRED+INHIBITED' : 'MISSED');
  if (fires && !legit) posSecFireCount++;
  console.log(`  ${tc.id}: ${verdict}  | fires=${fires}, legit-marker=${legit}`);
  console.log(`    src: ${tc.src}`);
  console.log(`    text: "${tc.text.substring(0, 100)}${tc.text.length > 100 ? '...' : ''}"`);
}

let posFireCount = 0;
let posTotal = POSITIVES.length;
console.log('');
console.log('── POSITIVES (Sheldrake morphic) — DUAL TEST: quantum-detector (out-of-scope) + morphic-detector (in-scope post v0.3.0-pre.4) ──');
for (const tc of POSITIVES) {
  const qFires = hasQuantumMysticism(tc.text);
  const qLegit = hasQuantumLegitimacyMarker(tc.text);
  const mFires = hasMorphicFieldMisuse(tc.text);
  const mLegit = hasMorphicFieldLegitimacyMarker(tc.text);
  const qVerdict = qFires && !qLegit ? 'Q-CAUGHT' : (qFires && qLegit ? 'Q-INHIB' : 'Q-MISS');
  const mVerdict = mFires && !mLegit ? 'M-CAUGHT' : (mFires && mLegit ? 'M-INHIB' : 'M-MISS');
  if (mFires && !mLegit) posFireCount++;
  console.log(`  ${tc.id}: [${qVerdict}] [${mVerdict}]`);
  console.log(`    src: ${tc.src}`);
  console.log(`    text: "${tc.text.substring(0, 100)}${tc.text.length > 100 ? '...' : ''}"`);
}

let negFalsefireCount = 0;
const negTotal = NEGATIVES.length;
console.log('');
console.log('── NEGATIVES ──');
for (const tc of NEGATIVES) {
  const fires = hasQuantumMysticism(tc.text);
  const legit = hasQuantumLegitimacyMarker(tc.text);
  const named = hasNamedSource(tc.text);
  const formal = hasFormalPhysicsContext(tc.text);
  const verdict = !fires ? 'NO-FIRE-CLEAN' : (fires && legit ? 'FIRED+SUPPRESSED' : 'FALSE-POSITIVE');
  if (fires && !legit) negFalsefireCount++;
  console.log(`  ${tc.id}: ${verdict}  | fires=${fires}, legit=${legit} (named=${named}, formal=${formal})`);
  console.log(`    src: ${tc.src}`);
  console.log(`    text: "${tc.text.substring(0, 100)}${tc.text.length > 100 ? '...' : ''}"`);
}

console.log('');
console.log('═══ SUMMARY ═══');
console.log(`Quantum-detector in-scope (Dispenza-style) catch:        ${posSecFireCount}/${posSecTotal}`);
console.log(`Morphic-detector in-scope (Sheldrake verbatim) catch:    ${posFireCount}/${posTotal}  [v0.3.0-pre.4]`);
console.log(`Negative false-positive rate:                            ${negFalsefireCount}/${negTotal}`);
console.log('');
console.log('Honest interpretation:');
console.log('- POSITIVES are Sheldrake morphic-field — known OUT-OF-SCOPE for quantum-vocab detector');
console.log('  (Foundation 09 regis G; detector currently covers regis H pop-quantum-mysticism)');
console.log('- NEGATIVES are Bohm + Penrose-Hameroff — legitimate physics philosophy');
console.log('- Probe ANSWERS scope question: detector is quantum-mysticism-specific, not all-field-pseudoscience.');
console.log('- Sheldrake coverage requires future MORPHIC_FIELD_PATTERNS extension (Foundation 09 §4.2).');
