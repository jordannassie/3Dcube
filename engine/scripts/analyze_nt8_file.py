#!/usr/bin/env python3
"""
analyze_nt8_file.py — TOWER Umar Engine: NT8 File Analyzer CLI

Usage:
    python engine/scripts/analyze_nt8_file.py --file /path/to/Strategy.cs
    python engine/scripts/analyze_nt8_file.py --file /path/to/Strategy.cs --json

    --json    Output only a JSON object to stdout (for machine parsing).
              Without --json, prints a formatted human-readable summary
              followed by the JSON block.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Ensure the engine package is importable without pip install
sys.path.insert(0, str(Path(__file__).parents[1] / "src"))

from tower_umar_engine.nt8_file_analyzer import analyze_file, to_dict

GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
MAGENTA= "\033[95m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

YES = f"{GREEN}Yes{RESET}"
NO  = f"{DIM}No{RESET}"


def _yn(val: bool) -> str:
    return YES if val else NO


def _badge(file_type: str) -> str:
    colors = {
        "indicator": CYAN,
        "strategy": MAGENTA,
        "unknown": YELLOW,
    }
    c = colors.get(file_type, YELLOW)
    return f"{c}{BOLD}{file_type.upper()}{RESET}"


def print_report(result_dict: dict) -> None:
    sep = f"  {'─' * 52}"

    print()
    print(f"{BOLD}{CYAN}  TOWER Umar Engine — NT8 File Analysis{RESET}")
    print(sep)
    print()

    # Identity
    print(f"  {BOLD}File{RESET}")
    print(f"    Name      : {result_dict['filename']}")
    print(f"    Lines     : {result_dict['total_lines']:,}")
    print(f"    Chars     : {result_dict['total_chars']:,}")
    print()

    print(f"  {BOLD}NT8 Identity{RESET}")
    print(f"    Type      : {_badge(result_dict['file_type'])}")
    print(f"    Class     : {result_dict.get('class_name') or f'{YELLOW}(not detected){RESET}'}")
    if result_dict.get('namespace'):
        print(f"    Namespace : {result_dict['namespace']}")
    print()

    # Parameters
    params = result_dict.get("parameters", [])
    print(f"  {BOLD}Parameters ({len(params)} detected){RESET}")
    if params:
        header = f"    {'Name':<28} {'Type':<10} {'Default':<14} {'Range'}"
        print(f"{DIM}{header}{RESET}")
        print(f"    {'─'*28} {'─'*10} {'─'*14} {'─'*20}")
        for p in params:
            rng = ""
            if p.get("range_min") is not None and p.get("range_max") is not None:
                rng = f"{p['range_min']} – {p['range_max']}"
            elif p.get("range_min") is not None:
                rng = f"≥ {p['range_min']}"
            default = p.get("default_value") or "—"
            print(f"    {p['name']:<28} {p.get('type',''):<10} {default:<14} {rng}")
    else:
        print(f"    {YELLOW}No [NinjaScriptProperty] parameters found{RESET}")
    print()

    # Methods
    methods = result_dict.get("methods_detected", [])
    print(f"  {BOLD}Lifecycle Methods ({len(methods)} detected){RESET}")
    if methods:
        print(f"    {', '.join(methods)}")
    else:
        print(f"    {YELLOW}None detected{RESET}")
    print()

    # Capabilities
    print(f"  {BOLD}Trading Capabilities{RESET}")
    print(f"    Uses Level 2 / DOM    : {_yn(result_dict['uses_level2'])}")
    print(f"    Uses Market Data       : {_yn(result_dict['uses_market_data'])}")
    print(f"    Uses Chart Drawings    : {_yn(result_dict['uses_chart_drawings'])}")
    print(f"    Uses Alerts/Sound      : {_yn(result_dict['uses_alerts'])}")
    print(f"    Direct Trade Orders    : {_yn(result_dict['contains_direct_trade_orders'])}")
    print()

    # MBO flag
    candidate = result_dict["likely_mbo_candidate"]
    candidate_str = (
        f"{GREEN}{BOLD}YES — uses order-flow data{RESET}" if candidate
        else f"{DIM}No — no depth/market-data logic detected{RESET}"
    )
    print(f"  {BOLD}MBO Backtest Candidate : {candidate_str}{RESET}")
    print()

    # Warnings
    warnings = result_dict.get("warnings", [])
    print(f"  {BOLD}Warnings ({len(warnings)}){RESET}")
    for w in warnings:
        print(f"    {YELLOW}⚠{RESET}  {w}")
    print()
    print(sep)
    print()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Analyze a NinjaTrader 8 .cs indicator or strategy file."
    )
    parser.add_argument("--file", required=True, help="Absolute or relative path to the .cs file")
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output JSON only (for machine parsing). Without this flag, "
             "a formatted summary is printed followed by JSON.",
    )
    args = parser.parse_args()

    try:
        result = analyze_file(args.file)
    except FileNotFoundError as e:
        if args.json:
            print(json.dumps({"error": str(e)}))
        else:
            print(f"\n  {RED}✗  {e}{RESET}\n", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        if args.json:
            print(json.dumps({"error": str(e)}))
        else:
            print(f"\n  {RED}✗  {e}{RESET}\n", file=sys.stderr)
        sys.exit(1)

    result_dict = to_dict(result)

    if args.json:
        # Machine-readable only
        print(json.dumps(result_dict))
    else:
        # Human-readable + JSON at the end
        print_report(result_dict)
        print(f"{DIM}  JSON output:{RESET}")
        print(json.dumps(result_dict, indent=2))
        print()


if __name__ == "__main__":
    main()
