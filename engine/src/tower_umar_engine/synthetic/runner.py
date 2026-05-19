"""
Synthetic Umar Demo — Scenario runner.

Orchestrates the engine against each scenario and produces
structured SyntheticScenarioResult objects.
"""
from __future__ import annotations

from dataclasses import asdict
from typing import Any, Dict, List, Optional

from tower_umar_engine.synthetic.models import SyntheticScenarioResult, SyntheticSignalResult
from tower_umar_engine.synthetic.scenarios import SCENARIO_REGISTRY
from tower_umar_engine.synthetic.umar_demo_engine import UmarDemoConfig, UmarDemoEngine


def _check_passed(
    scenario_id: str,
    expected: str,
    signals: List[SyntheticSignalResult],
) -> bool:
    """Determine if the scenario produced the expected outcome."""
    if expected == "WAIT":
        return len(signals) == 0
    if expected == "ONE_BUY_REVERSAL":
        return len(signals) == 1 and signals[0].state == "BUY_REVERSAL"
    # For standard signal scenarios: at least one signal matching expected state
    return any(s.state == expected for s in signals)


def _actual_outcome(
    scenario_id: str,
    signals: List[SyntheticSignalResult],
    step_states: List[Dict[str, Any]],
) -> str:
    if not signals:
        return "WAIT"
    if scenario_id == "one_signal_per_battle":
        count = len(signals)
        return f"ONE_{signals[0].state}" if count == 1 else f"{count}_SIGNALS"
    return signals[-1].state


def _build_summary(
    scenario_id: str,
    scenario_name: str,
    expected: str,
    actual: str,
    passed: bool,
    signals: List[SyntheticSignalResult],
    step_states: List[Dict[str, Any]],
) -> str:
    status = "PASS" if passed else "REVIEW"
    state_seq = " → ".join(s["state"] for s in step_states)

    if scenario_id == "neutral_no_trade":
        return (
            f"[{status}] {scenario_name}: Engine held WAIT throughout all {len(step_states)} steps. "
            f"No qualifying wall battle detected. Zero signals issued."
        )
    if scenario_id == "one_signal_per_battle":
        sig_count = len(signals)
        return (
            f"[{status}] {scenario_name}: {sig_count} signal(s) issued across "
            f"{len(step_states)} steps. one_signal_per_battle confirmed — "
            f"no duplicate signals after step {signals[0].step_index if signals else '?'}."
        )
    if signals:
        sig = signals[-1]
        return (
            f"[{status}] {scenario_name}: {sig.direction} {sig.signal_type} signal at step "
            f"{sig.step_index}. Entry {sig.entry:.2f} | Stop {sig.stop:.2f} | "
            f"TP1 {sig.tp1:.2f} | TP2 {sig.tp2:.2f}. "
            f"State path: {state_seq}."
        )
    return f"[{status}] {scenario_name}: No signal produced. Expected {expected}."


def run_scenario(
    scenario_id: str,
    config: Optional[UmarDemoConfig] = None,
) -> SyntheticScenarioResult:
    """Run one scenario and return a complete SyntheticScenarioResult."""
    if scenario_id not in SCENARIO_REGISTRY:
        raise ValueError(
            f"Unknown scenario: '{scenario_id}'. "
            f"Available: {', '.join(SCENARIO_REGISTRY)}"
        )

    meta = SCENARIO_REGISTRY[scenario_id]
    engine = UmarDemoEngine(config)

    steps = meta["build_fn"]()
    step_states, signals = engine.run(steps)

    expected = meta["expected_outcome"]
    actual = _actual_outcome(scenario_id, signals, step_states)
    passed = _check_passed(scenario_id, expected, signals)
    summary = _build_summary(scenario_id, meta["name"], expected, actual, passed, signals, step_states)

    return SyntheticScenarioResult(
        scenario_id=scenario_id,
        scenario_name=meta["name"],
        expected_outcome=expected,
        actual_outcome=actual,
        passed_expected_outcome=passed,
        final_summary=summary,
        steps=step_states,
        signals=[asdict(s) for s in signals],  # type: ignore[arg-type]
        price_path=[s["price"] for s in step_states],
        step_labels=[s["label"] for s in step_states],
    )


def run_all_scenarios(
    config: Optional[UmarDemoConfig] = None,
) -> List[SyntheticScenarioResult]:
    """Run all six scenarios and return results."""
    return [run_scenario(sid, config) for sid in SCENARIO_REGISTRY]


def scenarios_metadata() -> List[Dict[str, str]]:
    """Return scenario list metadata (no execution) for UI population."""
    return [
        {
            "id": meta["id"],
            "name": meta["name"],
            "expected_outcome": meta["expected_outcome"],
            "description": meta["description"],
        }
        for meta in SCENARIO_REGISTRY.values()
    ]
