"""
Synthetic Umar Demo — Data models.

All structures are JSON-serializable via dataclasses.asdict().
Prices use NQ Micro futures conventions: tick_size = 0.25 points.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class OrderBookLevel:
    """A single price level in the synthetic order book."""
    price: float
    size: int   # number of contracts resting at this level


@dataclass
class SyntheticOrderBookSnapshot:
    """
    Simplified synthetic Level 2 / DOM snapshot.
    Represents one moment in time within a scenario step.
    """
    step_index: int
    mid_price: float
    best_bid: float
    best_ask: float
    bid_levels: List[OrderBookLevel] = field(default_factory=list)
    ask_levels: List[OrderBookLevel] = field(default_factory=list)


@dataclass
class SyntheticTradeFlowSnapshot:
    """
    Synthetic market trade aggression snapshot.
    Represents order flow aggression at a given step.
    """
    step_index: int
    aggressive_buy_contracts: int   # contracts hitting the ask (buyers lifting offers)
    aggressive_sell_contracts: int  # contracts hitting the bid (sellers hitting bids)
    buyer_pct: float                # aggressive_buy / total * 100
    seller_pct: float               # aggressive_sell / total * 100
    delta: int                      # aggressive_buy - aggressive_sell


@dataclass
class SyntheticScenarioStep:
    """One discrete time step in a synthetic scenario."""
    step_index: int
    label: str
    price: float
    order_book_snapshot: SyntheticOrderBookSnapshot
    trade_flow_snapshot: SyntheticTradeFlowSnapshot
    notes: str = ""


@dataclass
class SyntheticSignalResult:
    """
    A signal emitted by the Umar Demo Engine for one scenario step.
    Only populated when a real BUY or SELL signal fires.
    """
    step_index: int
    state: str          # BUY_REVERSAL, SELL_REVERSAL, BUY_CONTINUATION, SELL_CONTINUATION
    signal_type: str    # "REVERSAL" or "CONTINUATION"
    direction: str      # "BUY" or "SELL"
    reason: str
    entry: Optional[float] = None
    stop: Optional[float] = None
    tp1: Optional[float] = None
    tp2: Optional[float] = None
    confidence_label: Optional[str] = None


@dataclass
class SyntheticScenarioResult:
    """Complete result from running one synthetic scenario."""
    scenario_id: str
    scenario_name: str
    expected_outcome: str
    actual_outcome: str
    passed_expected_outcome: bool
    final_summary: str
    # Per-step state progression (dicts for JSON-friendliness)
    steps: List[Dict[str, Any]] = field(default_factory=list)
    # Actual signals emitted (only non-NONE signals)
    signals: List[SyntheticSignalResult] = field(default_factory=list)
    # Price path for mini-chart rendering
    price_path: List[float] = field(default_factory=list)
    # Step labels for chart x-axis
    step_labels: List[str] = field(default_factory=list)
