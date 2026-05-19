# TOWER Umar Engine

Local Python backtesting and optimization engine for the Umar / Level 2 order-flow strategy on NQ futures.

## Status

**Phase 1 — Foundation.** No real MBO parsing or strategy logic yet.

## Quick Start

```bash
# From the repo root (no install needed)
python engine/scripts/run_health_check.py

# Or install the package in dev mode
cd engine
pip install -e .
python scripts/run_health_check.py
```

## Structure

```
engine/
  src/tower_umar_engine/
    __init__.py     — package + version
    config.py       — env-var config (MBO path, API keys)
    health.py       — health check module
  scripts/
    run_health_check.py
  requirements.txt
  pyproject.toml
```

## Environment Variables

| Variable              | Required | Description                                      |
|-----------------------|----------|--------------------------------------------------|
| `TOWER_MBO_DATA_DIR`  | Phase 2+ | Absolute path to local SSD folder with .dbn files |
| `DATABENTO_API_KEY`   | Optional | For live catalog/metadata queries in Phase 2+    |

Set these in the repo-root `.env` file (copy from `.env.example`).
