"""
config.py — TOWER Umar Engine configuration.

Reads environment variables from a .env file (or the shell environment).
All paths refer to the local machine; no cloud storage is used.
"""

from __future__ import annotations

import os
from pathlib import Path

# Load .env file if present (project root or engine root)
def _load_dotenv() -> None:
    """Minimal .env loader — avoids a hard dependency on python-dotenv."""
    for candidate in [
        Path(__file__).parents[4] / ".env",   # repo root
        Path(__file__).parents[2] / ".env",   # engine/
    ]:
        if candidate.exists():
            with open(candidate) as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())
            break

_load_dotenv()


# ── Core paths ──────────────────────────────────────────────────────────────

MBO_DATA_DIR: Path | None = (
    Path(raw) if (raw := os.environ.get("TOWER_MBO_DATA_DIR", "").strip()) else None
)
"""
Absolute path to the local SSD directory containing Databento NQ MBO files
(.dbn / .dbn.zst).  Set via TOWER_MBO_DATA_DIR in .env.
"""

DATABENTO_API_KEY: str | None = os.environ.get("DATABENTO_API_KEY") or None
"""
Databento API key — used in future phases for live catalog queries.
Not required for local-file-only backtesting.
"""
