/**
 * Condition-3 supplement — presupposition / silent-assent test cases — 2026-05-20.
 *
 * Tests the EXTENDED model adopted in the Condition-3 verdict:
 *   Layer-2 new class:     `inattention / cognitive-default`
 *   Layer-3 new technique: `presupposition / silent-assent`
 *
 * These three Russian-language canonical patterns were named by the user
 * during adjudication as a recognised manipulation family that bridges the
 * structural (inattention) and emotional (shame) regions of the
 * Vulnerability axis — the very gap that dark-05 surfaced. They are
 * canonical phrasings, not pulled artifacts. Kept separate from the frozen
 * N=29 validation corpus so that corpus's SHA-256 remains valid.
 *
 * cert: user-named (Pantheon project session 2026-05-20)
 * via:  session-input
 */

export const PULLED_AT = '2026-05-20';

export const SUPPLEMENT = [
  { id: 'sup-presup-01', type: 'presupposition', unit: 'rhetorical-pattern',
    cert: 'user-named', via: 'session-input',
    source: 'user-named canonical pattern (presupposition / shared-ground family), Pantheon session 2026-05-20',
    url: 'n/a — canonical rhetorical pattern',
    text: `как всем нам давно известно [X]` },

  { id: 'sup-presup-02', type: 'presupposition', unit: 'rhetorical-pattern',
    cert: 'user-named', via: 'session-input',
    source: 'user-named canonical pattern (presupposition / pre-emptive affirmation), Pantheon session 2026-05-20',
    url: 'n/a — canonical rhetorical pattern',
    text: `вы наверняка уже знаете, что [X]` },

  { id: 'sup-presup-03', type: 'presupposition', unit: 'rhetorical-pattern',
    cert: 'user-named', via: 'session-input',
    source: 'user-named canonical pattern (insult-to-silence-challenge), Pantheon session 2026-05-20',
    url: 'n/a — canonical rhetorical pattern',
    text: `только дураку не понятно, что [X]` },
];
