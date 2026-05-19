"""
Synthetic Umar Demo — Six deterministic scenario definitions.

Each scenario models a hand-crafted sequence of NQ market steps
designed to demonstrate one specific Umar signal state.

Prices are in NQ Micro/Full points (tick = 0.25).
Contract sizes are synthetic and are NOT real trading recommendations.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from tower_umar_engine.synthetic.models import (
    OrderBookLevel,
    SyntheticOrderBookSnapshot,
    SyntheticScenarioStep,
    SyntheticTradeFlowSnapshot,
)


# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_book(
    mid_price: float,
    step_index: int,
    bid_wall_price: Optional[float] = None,
    bid_wall_size: int = 0,
    ask_wall_price: Optional[float] = None,
    ask_wall_size: int = 0,
) -> SyntheticOrderBookSnapshot:
    """Build a synthetic order book with thin surrounding levels plus optional walls."""
    tick = 0.25
    best_bid = mid_price - tick
    best_ask = mid_price + tick

    # Thin surrounding levels (realistic-looking but not walls)
    bid_levels = [
        OrderBookLevel(price=best_bid - i * tick, size=60 - i * 8)
        for i in range(6)
    ]
    ask_levels = [
        OrderBookLevel(price=best_ask + i * tick, size=60 - i * 8)
        for i in range(6)
    ]

    # Inject walls if specified
    if bid_wall_price is not None and bid_wall_size > 0:
        bid_levels.append(OrderBookLevel(price=bid_wall_price, size=bid_wall_size))
    if ask_wall_price is not None and ask_wall_size > 0:
        ask_levels.append(OrderBookLevel(price=ask_wall_price, size=ask_wall_size))

    return SyntheticOrderBookSnapshot(
        step_index=step_index,
        mid_price=mid_price,
        best_bid=best_bid,
        best_ask=best_ask,
        bid_levels=bid_levels,
        ask_levels=ask_levels,
    )


def _make_flow(
    step_index: int,
    buy_contracts: int,
    sell_contracts: int,
) -> SyntheticTradeFlowSnapshot:
    """Build a synthetic trade flow snapshot."""
    total = buy_contracts + sell_contracts
    buyer_pct = round(buy_contracts / total * 100, 1) if total > 0 else 50.0
    seller_pct = round(sell_contracts / total * 100, 1) if total > 0 else 50.0
    return SyntheticTradeFlowSnapshot(
        step_index=step_index,
        aggressive_buy_contracts=buy_contracts,
        aggressive_sell_contracts=sell_contracts,
        buyer_pct=buyer_pct,
        seller_pct=seller_pct,
        delta=buy_contracts - sell_contracts,
    )


def _step(
    idx: int,
    label: str,
    price: float,
    buy_c: int,
    sell_c: int,
    notes: str = "",
    bid_wall_price: Optional[float] = None,
    bid_wall_size: int = 0,
    ask_wall_price: Optional[float] = None,
    ask_wall_size: int = 0,
) -> SyntheticScenarioStep:
    """Convenience constructor for a single scenario step."""
    return SyntheticScenarioStep(
        step_index=idx,
        label=label,
        price=price,
        order_book_snapshot=_make_book(
            price, idx,
            bid_wall_price=bid_wall_price, bid_wall_size=bid_wall_size,
            ask_wall_price=ask_wall_price, ask_wall_size=ask_wall_size,
        ),
        trade_flow_snapshot=_make_flow(idx, buy_c, sell_c),
        notes=notes,
    )


# ── Scenario 1: Bullish Bid Defense Reversal ─────────────────────────────────

def bullish_bid_defense_reversal() -> List[SyntheticScenarioStep]:
    """
    Strong bid wall at 19,228 is attacked by sellers.
    Sellers push price toward the wall but the wall holds.
    Buyers reclaim the battle — BUY_REVERSAL fires.

    State progression: WAIT → WATCH_BUY → WATCH_BUY → WATCH_BUY → BUY_REVERSAL
    """
    BID_WALL = 19228.0
    WALL_SIZE = 3200

    return [
        _step(1, "Market Setup",        19250.0,  65, 65,
              "Strong bid wall at 19,228 visible in DOM. Balanced flow. Waiting for direction.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        _step(2, "Sellers Emerge",       19246.0,  45, 75,
              "Sellers (62.5%) begin pushing price toward the bid wall.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        _step(3, "Sellers Accelerate",   19239.0,  35, 100,
              "Seller aggression increases (74%). Price dropping toward wall zone.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        _step(4, "Wall Touch",           19230.0,  25, 120,
              "Price reaches bid wall zone. Sellers (83%) maximally aggressive. Wall absorbing.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE - 300),
        _step(5, "Buyers Reclaim",       19233.0,  110, 35,
              "Bid wall held. Buyers (76%) aggressively take control. BUY REVERSAL.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
    ]


# ── Scenario 2: Bearish Ask Defense Reversal ─────────────────────────────────

def bearish_ask_defense_reversal() -> List[SyntheticScenarioStep]:
    """
    Strong ask wall at 19,264 is attacked by buyers.
    Buyers push price toward the wall but the wall holds.
    Sellers reclaim the battle — SELL_REVERSAL fires.

    State progression: WAIT → WATCH_SELL → WATCH_SELL → WATCH_SELL → SELL_REVERSAL
    """
    ASK_WALL = 19264.0
    WALL_SIZE = 3000

    return [
        _step(1, "Market Setup",        19244.0,  65, 65,
              "Strong ask wall at 19,264 visible. Balanced flow. Watching.",
              ask_wall_price=ASK_WALL, ask_wall_size=WALL_SIZE),
        _step(2, "Buyers Emerge",        19248.0,  75, 45,
              "Buyers (62.5%) begin pushing price toward ask wall.",
              ask_wall_price=ASK_WALL, ask_wall_size=WALL_SIZE),
        _step(3, "Buyers Accelerate",    19255.0,  100, 35,
              "Buyer aggression intensifies (74%). Price approaching ask wall.",
              ask_wall_price=ASK_WALL, ask_wall_size=WALL_SIZE),
        _step(4, "Wall Touch",           19262.0,  120, 25,
              "Price at ask wall zone. Buyers (83%) maximally aggressive. Wall absorbing.",
              ask_wall_price=ASK_WALL, ask_wall_size=WALL_SIZE - 200),
        _step(5, "Sellers Reclaim",      19258.0,  30, 110,
              "Ask wall held. Sellers (79%) aggressively push back. SELL REVERSAL.",
              ask_wall_price=ASK_WALL, ask_wall_size=WALL_SIZE),
    ]


# ── Scenario 3: Bullish Continuation Breakout ────────────────────────────────

def bullish_continuation_breakout() -> List[SyntheticScenarioStep]:
    """
    Buyers aggressively attack an ask wall at 19,256.
    Rather than failing, buyers sustain pressure and break through.
    Price clears the wall with continued buyer aggression — BUY_CONTINUATION.

    State progression: WAIT → WATCH_SELL → WATCH_SELL → WATCH_SELL → BUY_CONTINUATION
    Note: WATCH_SELL = watching the ask wall battle. Buyers won → BUY_CONTINUATION.
    """
    ASK_WALL = 19256.0
    WALL_SIZE = 2800

    return [
        _step(1, "Market Setup",        19240.0,  65, 65,
              "Defended ask wall at 19,256. Buyers beginning to position.",
              ask_wall_price=ASK_WALL, ask_wall_size=WALL_SIZE),
        _step(2, "Buyers Probe",         19244.0,  75, 45,
              "Buyers (62.5%) testing toward the ask wall.",
              ask_wall_price=ASK_WALL, ask_wall_size=WALL_SIZE),
        _step(3, "Buyers Press Hard",    19250.0,  100, 35,
              "Buyer aggression sustains (74%). Price within striking distance of ask wall.",
              ask_wall_price=ASK_WALL, ask_wall_size=WALL_SIZE),
        _step(4, "Wall Contact",         19254.0,  120, 25,
              "Price touching ask wall zone. Buyers (83%) unrelenting.",
              ask_wall_price=ASK_WALL, ask_wall_size=WALL_SIZE - 400),
        _step(5, "Breakout Confirmed",   19259.0,  130, 20,
              "Price breaks ABOVE ask wall with 87% buyer aggression. BUY CONTINUATION.",
              ask_wall_price=ASK_WALL, ask_wall_size=WALL_SIZE - 600),
    ]


# ── Scenario 4: Bearish Continuation Breakdown ───────────────────────────────

def bearish_continuation_breakdown() -> List[SyntheticScenarioStep]:
    """
    Sellers aggressively attack a bid wall at 19,232.
    Rather than holding, the bid wall absorbs but ultimately breaks.
    Price drops below with continued seller aggression — SELL_CONTINUATION.

    State progression: WAIT → WATCH_BUY → WATCH_BUY → WATCH_BUY → SELL_CONTINUATION
    Note: WATCH_BUY = watching bid wall battle. Sellers won → SELL_CONTINUATION.
    """
    BID_WALL = 19232.0
    WALL_SIZE = 2800

    return [
        _step(1, "Market Setup",        19248.0,  65, 65,
              "Bid wall at 19,232. Sellers beginning to build aggression.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        _step(2, "Sellers Probe",        19244.0,  45, 75,
              "Sellers (62.5%) testing toward the bid wall.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        _step(3, "Sellers Press Hard",   19238.0,  35, 100,
              "Seller aggression sustains (74%). Price pressing down toward wall.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        _step(4, "Wall Contact",         19234.0,  25, 120,
              "Price at bid wall zone. Sellers (83%) relentless.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE - 400),
        _step(5, "Breakdown Confirmed",  19229.0,  20, 130,
              "Price breaks BELOW bid wall with 87% seller aggression. SELL CONTINUATION.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE - 600),
    ]


# ── Scenario 5: Neutral — No Trade ───────────────────────────────────────────

def neutral_no_trade() -> List[SyntheticScenarioStep]:
    """
    Some mild liquidity imbalances appear, but no wall meets the minimum size
    threshold and no side commits strong enough aggression.
    Engine correctly holds WAIT throughout.

    State progression: WAIT → WAIT → WAIT → WAIT → WAIT
    """
    # No wall injected — all levels stay below the 800-contract minimum threshold
    return [
        _step(1, "Quiet Market",         19248.0,  60, 60,
              "Thin, balanced book. No dominant wall. Flow 50/50."),
        _step(2, "Mild Buyer Interest",  19246.0,  65, 55,
              "Slight buyer tilt (54%) but no qualifying wall. Not enough conviction."),
        _step(3, "Balanced Again",       19244.0,  58, 58,
              "Flow rebalances. No wall, no aggression. Market digesting."),
        _step(4, "Mild Seller Lean",     19246.0,  55, 65,
              "Small seller skew (54%) but no wall detected. Insufficient confirmation."),
        _step(5, "Drift, No Resolution", 19248.0,  62, 62,
              "Price drifts back. No wall battle formed. Engine correctly holds WAIT."),
    ]


# ── Scenario 6: One Signal Per Battle ────────────────────────────────────────

def one_signal_per_battle() -> List[SyntheticScenarioStep]:
    """
    Identical bullish bid wall setup to Scenario 1.
    A BUY_REVERSAL fires at step 5.
    Steps 6–8 maintain bullish conditions — but the engine fires NO second signal.
    Validates the one_signal_per_battle cooldown.

    State progression: WAIT → WATCH_BUY → WATCH_BUY → WATCH_BUY → BUY_REVERSAL → WAIT → WAIT → WAIT
    """
    BID_WALL = 19228.0
    WALL_SIZE = 3200

    return [
        # Identical setup to Scenario 1
        _step(1, "Market Setup",              19250.0,  65, 65,
              "Same bid wall setup. Battle begins.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        _step(2, "Sellers Emerge",             19246.0,  45, 75,
              "Sellers attacking bid wall.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        _step(3, "Sellers Accelerate",         19239.0,  35, 100,
              "Seller pressure intensifying.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        _step(4, "Wall Touch",                 19230.0,  25, 120,
              "Price touching bid wall zone.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE - 300),
        _step(5, "Signal Fires — BUY REV",     19233.0,  110, 35,
              "BUY REVERSAL fires here. This is the only valid signal for this battle.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        # Continued bullish conditions — one_signal_per_battle prevents re-entry
        _step(6, "Post-Signal: Buyers Lead",   19237.0,  120, 35,
              "Buyers still dominant. Bid wall still present. Cooldown prevents new signal.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        _step(7, "Rally Continues",             19241.0,  115, 40,
              "Price moving away from wall. No new battle triggered — no new signal.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
        _step(8, "Conditions Stable",           19243.0,  100, 50,
              "Market stabilizing. Zero duplicate signals issued. Cooldown confirmed.",
              bid_wall_price=BID_WALL, bid_wall_size=WALL_SIZE),
    ]


# ── Registry ──────────────────────────────────────────────────────────────────

SCENARIO_REGISTRY: Dict[str, dict] = {
    "bullish_bid_defense_reversal": {
        "id":               "bullish_bid_defense_reversal",
        "name":             "Bullish Bid Defense Reversal",
        "expected_outcome": "BUY_REVERSAL",
        "description":      "Sellers attack a stacked bid wall. Wall holds. Buyers reclaim.",
        "build_fn":         bullish_bid_defense_reversal,
    },
    "bearish_ask_defense_reversal": {
        "id":               "bearish_ask_defense_reversal",
        "name":             "Bearish Ask Defense Reversal",
        "expected_outcome": "SELL_REVERSAL",
        "description":      "Buyers attack a stacked ask wall. Wall holds. Sellers reclaim.",
        "build_fn":         bearish_ask_defense_reversal,
    },
    "bullish_continuation_breakout": {
        "id":               "bullish_continuation_breakout",
        "name":             "Bullish Continuation Breakout",
        "expected_outcome": "BUY_CONTINUATION",
        "description":      "Buyers break through a defended ask wall with sustained aggression.",
        "build_fn":         bullish_continuation_breakout,
    },
    "bearish_continuation_breakdown": {
        "id":               "bearish_continuation_breakdown",
        "name":             "Bearish Continuation Breakdown",
        "expected_outcome": "SELL_CONTINUATION",
        "description":      "Sellers break through a defended bid wall with sustained aggression.",
        "build_fn":         bearish_continuation_breakdown,
    },
    "neutral_no_trade": {
        "id":               "neutral_no_trade",
        "name":             "Neutral Wall — No Confirmation",
        "expected_outcome": "WAIT",
        "description":      "Mild walls and balanced flow — engine correctly stays in WAIT.",
        "build_fn":         neutral_no_trade,
    },
    "one_signal_per_battle": {
        "id":               "one_signal_per_battle",
        "name":             "One Signal Per Battle",
        "expected_outcome": "ONE_BUY_REVERSAL",
        "description":      "BUY REVERSAL fires once. Identical conditions repeat — no duplicate signals.",
        "build_fn":         one_signal_per_battle,
    },
}
