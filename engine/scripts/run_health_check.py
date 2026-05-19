#!/usr/bin/env python3
"""
run_health_check.py
-------------------
Entry-point script.  Run from the repo root:

    python engine/scripts/run_health_check.py

Or after installing the package in development mode:

    cd engine && pip install -e . && python scripts/run_health_check.py
"""

import sys
from pathlib import Path

# Ensure the engine package is importable when running without pip install
sys.path.insert(0, str(Path(__file__).parents[1] / "src"))

from tower_umar_engine.health import run_health_check

if __name__ == "__main__":
    success = run_health_check()
    sys.exit(0 if success else 1)
