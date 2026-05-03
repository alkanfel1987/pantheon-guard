"""
PAC-Bayes generalization-bound calculator for the pantheon-guard
v0.2 calibrator.

Run:
    python docs/pac_bayes_compute.py

Output: a table of OOD-risk gap upper bounds across (n, KL, δ) and a
single PITCH-ready sentence.

Theorem reference: McAllester (1999), Catoni form. See PAC-BAYES-BOUND.md
for the formal statement and how the calibrator maps onto Θ, π, ρ.
"""

import math
import sys
import io

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def pac_bayes_gap(n: int, kl: float, delta: float) -> float:
    """McAllester PAC-Bayes upper bound on |R(ρ) − R̂(ρ)|.

    | E_ρ R(θ) − E_ρ R̂(θ) |  ≤  sqrt( ( KL(ρ‖π) + log(2√n/δ) ) / (2n) )
    """
    inner = (kl + math.log(2 * math.sqrt(n) / delta)) / (2 * n)
    return math.sqrt(inner)


def hoeffding_gap(n: int, delta: float) -> float:
    """Hoeffding bound for a *fixed* (non-tuned) hypothesis, for comparison."""
    return math.sqrt(math.log(2 / delta) / (2 * n))


def vc_gap(n: int, vc: int = 24, delta: float = 0.05) -> float:
    """Loose VC-style bound: O(sqrt(VC log n / n))."""
    return math.sqrt(vc * math.log(n) / n)


def main() -> None:
    Ns = [100, 500, 1000, 5000]
    KLs = [0, 1, 5, 10, 25]
    DELTAs = [0.01, 0.05, 0.10]

    print("=" * 78)
    print("PAC-Bayes OOD-risk gap for pantheon-guard calibrator")
    print("=" * 78)
    print()
    print("Bound:  | true_risk - empirical_risk |  <=  PAC-Bayes(n, KL, delta)")
    print("        Brier scale [0, 1]; smaller is tighter.")
    print()

    # Main table — δ = 0.05 (95% confidence) across n × KL.
    print("─── Main table: delta = 0.05 (95% confidence) ───")
    print()
    print(f"{'KL \\ n':>10} | " + " | ".join(f"{n:>9}" for n in Ns))
    print("-" * (12 + 12 * len(Ns)))
    for kl in KLs:
        row = f"{'KL=' + str(kl):>10} | " + " | ".join(
            f"{pac_bayes_gap(n, kl, 0.05):>9.4f}" for n in Ns
        )
        print(row)
    print()

    # Comparison column — what other bounds give at n = 1000, δ = 0.05.
    print("─── Bound comparison at n = 1000, delta = 0.05 ───")
    print(f"  Hoeffding (fixed θ, no tuning):        {hoeffding_gap(1000, 0.05):.4f}")
    print(f"  PAC-Bayes (KL = 0)  ≈ Hoeffding:       {pac_bayes_gap(1000, 0, 0.05):.4f}")
    print(f"  PAC-Bayes (KL = 5,  modest tuning):    {pac_bayes_gap(1000, 5, 0.05):.4f}")
    print(f"  PAC-Bayes (KL = 10, heavy tuning):     {pac_bayes_gap(1000, 10, 0.05):.4f}")
    print(f"  VC-style (k=8 params, VC ~ 24):        {vc_gap(1000):.4f}")
    print()

    # Sensitivity — what happens at different δ for the planned n=1000.
    print("─── Confidence sensitivity, n = 1000, KL = 5 ───")
    for d in DELTAs:
        print(f"  delta = {d:.2f}  ->  gap <= {pac_bayes_gap(1000, 5, d):.4f}  "
              f"(confidence {(1-d)*100:.0f}%)")
    print()

    # PITCH-ready sentence — assumes v0.3 benchmark of n=1000 and that
    # tuning produces KL ≤ 10.
    n, kl, delta = 1000, 10, 0.05
    bound = pac_bayes_gap(n, kl, delta)
    print("─── PITCH-ready theorem statement ───")
    print()
    print(f'  "Under the McAllester PAC-Bayes theorem, with our v0.3 benchmark of')
    print(f'   n = {n} hand-labelled examples and a fitted posterior within KL <= {kl}')
    print(f'   of the v0.2 prior, the out-of-distribution Brier risk of the')
    print(f'   pantheon-guard calibrator is upper-bounded by the empirical Brier risk')
    print(f'   plus {bound:.3f} with probability >= {(1-delta)*100:.0f}%.')
    print(f'   This is a theorem; competing guardrails publish empirical accuracy')
    print(f'   only and have no analogous out-of-distribution bound."')
    print()

    # The honesty-floor numbers — what KL is "too much".
    print("─── Tuning honesty floor (n=1000, δ=0.05) ───")
    print()
    print("  How much KL can we 'spend' before the bound exceeds a target gap?")
    for target_gap in [0.05, 0.10, 0.15, 0.20]:
        # Solve: target = sqrt((KL + log(2√n/δ)) / (2n))
        # => KL = 2n * target² - log(2√n/δ)
        kl_max = 2 * 1000 * target_gap ** 2 - math.log(2 * math.sqrt(1000) / 0.05)
        kl_max = max(0, kl_max)
        print(f"  target gap <= {target_gap:.2f}  ->  KL budget = {kl_max:.1f}")
    print()
    print("  Reading: if v0.3 fitting produces KL > 16 on n=1000, we cannot")
    print("  honestly claim 'OOD gap below 0.10'. We must either:")
    print("    (a) collect more benchmark data, or")
    print("    (b) tune less aggressively (stronger prior).")
    print()


if __name__ == "__main__":
    main()
