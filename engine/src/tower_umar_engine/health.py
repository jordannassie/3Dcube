"""
health.py — TOWER Umar Engine system health check.

Verifies that the engine can be imported and that key environment
variables are configured correctly.  Prints a human-readable report.
"""

from __future__ import annotations

from pathlib import Path

from tower_umar_engine import __version__
from tower_umar_engine.config import MBO_DATA_DIR, DATABENTO_API_KEY


GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"


def _ok(msg: str) -> None:
    print(f"  {GREEN}✓{RESET}  {msg}")

def _warn(msg: str) -> None:
    print(f"  {YELLOW}⚠{RESET}  {msg}")

def _fail(msg: str) -> None:
    print(f"  {RED}✗{RESET}  {msg}")


def run_health_check() -> bool:
    """
    Run all health checks.  Returns True if critical checks pass,
    False if any critical check fails.
    """
    print()
    print(f"{BOLD}{CYAN}  TOWER Umar Engine — Health Check{RESET}")
    print(f"  {'─' * 40}")
    print()

    all_ok = True

    # 1. Engine importable
    print(f"  {BOLD}Engine{RESET}")
    _ok(f"TOWER Umar Engine: OK  (v{__version__})")
    print()

    # 2. MBO data directory
    print(f"  {BOLD}MBO Data Directory (TOWER_MBO_DATA_DIR){RESET}")
    if MBO_DATA_DIR is None:
        _warn("Not configured — set TOWER_MBO_DATA_DIR in .env")
        all_ok = False
    else:
        _ok(f"Configured → {MBO_DATA_DIR}")
        if MBO_DATA_DIR.exists() and MBO_DATA_DIR.is_dir():
            dbn_files = list(MBO_DATA_DIR.glob("*.dbn*"))
            _ok(
                f"Directory exists  ({len(dbn_files)} .dbn file(s) found)"
                if dbn_files
                else "Directory exists  (no .dbn files yet)"
            )
        else:
            _warn("Directory does not exist — create it or update the path")
    print()

    # 3. Databento API key (optional for local-only mode)
    print(f"  {BOLD}Databento API Key (optional){RESET}")
    if DATABENTO_API_KEY:
        _ok("DATABENTO_API_KEY is set")
    else:
        _warn("Not set — only needed for live catalog queries (Phase 2+)")
    print()

    # 4. Summary
    print(f"  {'─' * 40}")
    if all_ok:
        print(f"  {GREEN}{BOLD}All critical checks passed.{RESET}")
    else:
        print(f"  {YELLOW}{BOLD}Some checks need attention (see warnings above).{RESET}")
    print()

    return all_ok
