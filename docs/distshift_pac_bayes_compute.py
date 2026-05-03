"""
Distribution-shift PAC-Bayes bound calculator (Germain et al. 2016/2020).

Run:
    python docs/distshift_pac_bayes_compute.py

Output: total bound under increasing Rényi-2 divergence D₂(Q‖P), holding
the McAllester core (n, KL, δ) fixed.
"""

import math
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def mcallester_core(n: int, kl: float, delta: float) -> float:
    """Standard PAC-Bayes term: sqrt((KL + log(2sqrt(n)/delta)) / 2n)."""
    return math.sqrt((kl + math.log(2 * math.sqrt(n) / delta)) / (2 * n))


def shift_correction(d_renyi2: float) -> float:
    """Germain et al. shift term: sqrt(D/2)."""
    return math.sqrt(d_renyi2 / 2)


def germain_total(n: int, kl: float, delta: float, d_renyi2: float, lam: float = 0.0) -> float:
    """Total upper bound under distribution shift. Saturates at 1 (Brier scale)."""
    raw = mcallester_core(n, kl, delta) + shift_correction(d_renyi2) + lam
    return min(raw, 1.0)


def main() -> None:
    n, kl, delta = 1000, 10, 0.05
    base = mcallester_core(n, kl, delta)

    print("=" * 70)
    print("Distribution-Shift PAC-Bayes — corrected bound")
    print("=" * 70)
    print()
    print(f"Fixed: n={n}, KL={kl}, delta={delta}")
    print(f"McAllester core term:  sqrt((KL + log(2sqrt(n)/delta)) / 2n)  =  {base:.4f}")
    print()

    print("─── Total bound vs Rényi-2 divergence between Q (prod) and P (bench) ───")
    print()
    print(f"{'D2(Q||P)':>10} | {'shift term':>12} | {'total (lam=0)':>14}")
    print("-" * 42)
    for d in [0.0, 0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0]:
        sh = shift_correction(d)
        total = germain_total(n, kl, delta, d)
        sat = "  ← saturated" if total >= 1.0 else ""
        print(f"{d:>10.2f} | {sh:>12.4f} | {total:>14.4f}{sat}")
    print()

    print("─── Honest reading ───")
    print()
    print("  D2 ≤ 0.1   : bound stays informative (≤ 0.32 total). Ship as-is.")
    print("  D2 ~ 0.5   : bound loose (~0.59). Customer should label some prod data.")
    print("  D2 ≥ 1.0   : bound near-saturated. Benchmark alone is insufficient;")
    print("               weighted-conformal mitigation OR domain-specific labelling required.")
    print()

    # PITCH-ready statement
    print("─── PITCH-ready (extending section 2.1.1) ───")
    print()
    print('  "When production traffic distribution Q differs from the benchmark P')
    print(f'   by Rényi-2 divergence D2(Q‖P) ≤ d, the v0.3 PAC-Bayes bound widens')
    print(f'   from {base:.3f} to {base:.3f} + sqrt(d/2) + lambda, where lambda is')
    print('   the reducible-by-relabelling component customers drive down with their')
    print('   own labelled production data. The shift-monitor tool ships in v0.4."')
    print()


if __name__ == "__main__":
    main()
