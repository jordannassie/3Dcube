#!/usr/bin/env python3
"""
Synthetic Umar Demo CLI.

Usage:
  # Run one scenario (human-readable)
  python engine/scripts/run_synthetic_umar_demo.py --scenario bullish_bid_defense_reversal

  # Run all scenarios
  python engine/scripts/run_synthetic_umar_demo.py --all

  # JSON output (for Next.js API bridge)
  python engine/scripts/run_synthetic_umar_demo.py --scenario bullish_bid_defense_reversal --json
  python engine/scripts/run_synthetic_umar_demo.py --all --json
"""
from __future__ import annotations

import argparse
import dataclasses
import json
import sys
from pathlib import Path

# Allow running from repo root without installing the package
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from tower_umar_engine.synthetic.runner import (
    run_all_scenarios,
    run_scenario,
    scenarios_metadata,
)
from tower_umar_engine.synthetic.models import SyntheticScenarioResult

# ANSI colours (disabled if not a terminal)
_IS_TTY = sys.stdout.isatty()
GREEN  = "\033[92m" if _IS_TTY else ""
RED    = "\033[91m" if _IS_TTY else ""
YELLOW = "\033[93m" if _IS_TTY else ""
BLUE   = "\033[94m" if _IS_TTY else ""
BOLD   = "\033[1m"  if _IS_TTY else ""
RESET  = "\033[0m"  if _IS_TTY else ""

# State display colours
STATE_COLOR = {
    "WAIT":               "",
    "WATCH_BUY":          YELLOW,
    "WATCH_SELL":         YELLOW,
    "BUY_REVERSAL":       GREEN,
    "SELL_REVERSAL":      RED,
    "BUY_CONTINUATION":   GREEN,
    "SELL_CONTINUATION":  RED,
}


def _color_state(state: str) -> str:
    c = STATE_COLOR.get(state, "")
    return f"{c}{state}{RESET}" if c else state


def print_result(result: SyntheticScenarioResult) -> None:
    passed_str = f"{GREEN}PASS{RESET}" if result.passed_expected_outcome else f"{RED}REVIEW{RESET}"

    print(f"\n{'─' * 60}")
    print(f"{BOLD}Scenario:{RESET} {result.scenario_name}")
    print(f"{BOLD}Expected:{RESET} {result.expected_outcome}")
    print(f"{BOLD}Actual:  {RESET} {result.actual_outcome}")
    print(f"{BOLD}Status:  {RESET} {passed_str}")

    # State progression
    print(f"\n{BOLD}State progression:{RESET}")
    for step in result.steps:
        idx = step["step_index"]
        lbl = step["label"]
        state = step["state"]
        tf = step.get("trade_flow", {})
        buyer_pct = tf.get("buyer_pct", 0)
        seller_pct = tf.get("seller_pct", 0)
        delta = tf.get("delta", 0)
        delta_str = f"+{delta}" if delta >= 0 else str(delta)
        print(
            f"  {idx}. {_color_state(state):<20}"
            f"  price={step['price']:>10.2f}"
            f"  B={buyer_pct:>4.0f}%  S={seller_pct:>4.0f}%  Δ={delta_str:>6}"
            f"  [{lbl}]"
        )

    # Trade plan
    if result.signals:
        sig = result.signals[-1]
        direction_color = GREEN if sig["direction"] == "BUY" else RED
        print(f"\n{BOLD}Signal:{RESET}")
        print(f"  Type:      {direction_color}{sig['signal_type']} {sig['direction']}{RESET}")
        print(f"  Reason:    {sig['reason']}")
        print(f"\n{BOLD}Demo Trade Plan:{RESET}")
        print(f"  Entry:  {sig['entry']:>10.2f}")
        print(f"  Stop:   {sig['stop']:>10.2f}  (below/above wall with buffer)")
        print(f"  TP1:    {sig['tp1']:>10.2f}  (1R)")
        print(f"  TP2:    {sig['tp2']:>10.2f}  (2R)")
        if sig["entry"] and sig["stop"]:
            risk = abs(sig["entry"] - sig["stop"])
            print(f"  Risk:   {risk:>10.2f}  points")
    else:
        print(f"\n{BOLD}Signal:{RESET}  None (expected for WAIT / cooldown scenarios)")

    print(f"\n{BOLD}Summary:{RESET} {result.final_summary}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="TOWER Synthetic Umar Demo Simulator"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--scenario",
        metavar="ID",
        help="Run a single scenario by ID",
    )
    group.add_argument(
        "--all",
        action="store_true",
        help="Run all six scenarios",
    )
    group.add_argument(
        "--list",
        action="store_true",
        help="List available scenario IDs",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output JSON (for Next.js API bridge)",
    )
    args = parser.parse_args()

    if args.list:
        meta = scenarios_metadata()
        if args.json:
            print(json.dumps(meta, indent=2))
        else:
            print(f"\n{BOLD}Available scenarios:{RESET}")
            for m in meta:
                print(f"  {m['id']:<40}  {m['name']}")
        return

    try:
        if args.all:
            results = run_all_scenarios()
        else:
            results = [run_scenario(args.scenario)]
    except ValueError as exc:
        if args.json:
            print(json.dumps({"error": str(exc)}))
        else:
            print(f"{RED}Error:{RESET} {exc}", file=sys.stderr)
        sys.exit(1)

    if args.json:
        # Single scenario → object; all → array
        output = (
            dataclasses.asdict(results[0])
            if len(results) == 1
            else [dataclasses.asdict(r) for r in results]
        )
        print(json.dumps(output, indent=2))
        return

    # Human-readable
    total = len(results)
    passed = sum(1 for r in results if r.passed_expected_outcome)
    for result in results:
        print_result(result)

    if total > 1:
        status_color = GREEN if passed == total else RED
        print(f"\n{'═' * 60}")
        print(f"{BOLD}Results: {status_color}{passed}/{total} scenarios passed{RESET}")
        print(f"{'═' * 60}")


if __name__ == "__main__":
    main()
