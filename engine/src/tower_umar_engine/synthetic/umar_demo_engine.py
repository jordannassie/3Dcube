"""
Synthetic Umar Logic Engine — Phase 3 demonstration engine.

This is a simplified, transparent implementation of Umar-style order-flow logic
operating on synthetic scenario data. It is NOT a mathematical exact port of
the full NT8 NinjaScript indicator.

Purpose:
- Prove that Umar decision logic can be recreated outside NT8.
- Demonstrate state machine behavior on controlled scenarios.
- Validate the TOWER architecture before real MBO data arrives.

Do NOT use these results for live trading decisions.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from tower_umar_engine.synthetic.models import (
    SyntheticScenarioStep,
    SyntheticSignalResult,
    SyntheticTradeFlowSnapshot,
    SyntheticOrderBookSnapshot,
    OrderBookLevel,
)


# ── Configuration ─────────────────────────────────────────────────────────────

@dataclass
class UmarDemoConfig:
    """
    Engine configuration parameters.
    Values are directionally aligned with TOWERUmar2 defaults
    but adapted for synthetic demo step-by-step logic.
    """
    tick_size: float = 0.25             # NQ Micro/Full tick size in points

    # Wall detection
    wall_min_size: int = 800            # Minimum contracts at a level to qualify as a wall

    # Touch / breakout thresholds (in ticks)
    wall_touch_ticks: int = 8           # 2.0 points — price within this range = touching wall
    breakout_ticks: int = 8             # 2.0 points — price past wall by this much = breakout

    # Aggression thresholds
    aggression_threshold_pct: float = 55.0          # Minimum % to be "aggressive"
    strong_aggression_threshold_pct: float = 65.0   # Minimum % to be "strongly aggressive"
    min_aggression_contracts: int = 30              # Minimum contracts for a valid aggression read

    # Signal behavior
    require_wall_battle_for_signals: bool = True    # Must have an active wall battle
    require_aggression_confirmation: bool = True    # Must have aggression on reclaim side
    one_signal_per_battle: bool = True              # Prevent duplicate signals in same battle

    # Trade plan construction (ticks)
    stop_buffer_ticks: int = 4          # 1.0 point buffer past wall for stop placement
    minimum_risk_ticks: int = 8         # 2.0 points minimum risk (entry → stop)
    tp1_r_multiple: float = 1.0         # TP1 = entry ± risk * 1.0
    tp2_r_multiple: float = 2.0         # TP2 = entry ± risk * 2.0


# ── Utility ───────────────────────────────────────────────────────────────────

def _round_tick(value: float, tick_size: float) -> float:
    """Round a price to the nearest tick boundary."""
    return round(round(value / tick_size) * tick_size, 4)


# ── Engine ────────────────────────────────────────────────────────────────────

class UmarDemoEngine:
    """
    Step-by-step synthetic Umar logic engine.

    State machine summary:
    ┌──────────────────────────────────────────────────────────────────┐
    │  WAIT                                                            │
    │   ├─ bid wall + sellers active  →  WATCH_BUY                    │
    │   └─ ask wall + buyers active   →  WATCH_SELL                   │
    │                                                                  │
    │  WATCH_BUY  (bid wall battle — sellers vs bid)                   │
    │   ├─ wall touched + buyers reclaim  →  BUY_REVERSAL             │
    │   └─ wall broken + sellers persist  →  SELL_CONTINUATION        │
    │                                                                  │
    │  WATCH_SELL  (ask wall battle — buyers vs ask)                   │
    │   ├─ wall touched + sellers reclaim →  SELL_REVERSAL            │
    │   └─ wall broken + buyers persist  →  BUY_CONTINUATION          │
    └──────────────────────────────────────────────────────────────────┘
    """

    def __init__(self, config: Optional[UmarDemoConfig] = None) -> None:
        self.cfg = config or UmarDemoConfig()

    # ── Internal detectors ────────────────────────────────────────────

    def _detect_wall(
        self, ob: SyntheticOrderBookSnapshot, side: str
    ) -> Optional[Tuple[float, int]]:
        """Return (wall_price, size) for the strongest level on the given side, or None."""
        levels: List[OrderBookLevel] = ob.bid_levels if side == "BID" else ob.ask_levels
        if not levels:
            return None
        strongest = max(levels, key=lambda lv: lv.size)
        if strongest.size >= self.cfg.wall_min_size:
            return (strongest.price, strongest.size)
        return None

    def _is_touching(self, price: float, wall: float, side: str) -> bool:
        """True when price is within wall_touch_ticks of the wall level."""
        touch_range = self.cfg.wall_touch_ticks * self.cfg.tick_size
        if side == "BID":
            return (price - wall) <= touch_range
        else:
            return (wall - price) <= touch_range

    def _is_broken(self, price: float, wall: float, side: str) -> bool:
        """True when price has moved past the wall by at least breakout_ticks."""
        brk_range = self.cfg.breakout_ticks * self.cfg.tick_size
        if side == "BID":
            return price < (wall - brk_range)
        else:
            return price > (wall + brk_range)

    def _buyers_active(self, tf: SyntheticTradeFlowSnapshot, strong: bool = False) -> bool:
        threshold = (
            self.cfg.strong_aggression_threshold_pct if strong
            else self.cfg.aggression_threshold_pct
        )
        return (
            tf.buyer_pct >= threshold
            and tf.aggressive_buy_contracts >= self.cfg.min_aggression_contracts
        )

    def _sellers_active(self, tf: SyntheticTradeFlowSnapshot, strong: bool = False) -> bool:
        threshold = (
            self.cfg.strong_aggression_threshold_pct if strong
            else self.cfg.aggression_threshold_pct
        )
        return (
            tf.seller_pct >= threshold
            and tf.aggressive_sell_contracts >= self.cfg.min_aggression_contracts
        )

    # ── Trade plan constructor ────────────────────────────────────────

    def _build_plan(
        self, direction: str, entry: float, wall: float
    ) -> Tuple[float, float, float]:
        """Compute (stop, tp1, tp2) from the entry and active wall level."""
        tick = self.cfg.tick_size
        buf = self.cfg.stop_buffer_ticks * tick
        min_risk = self.cfg.minimum_risk_ticks * tick

        if direction == "BUY":
            # Stop below wall with buffer; enforce minimum risk
            raw_risk = entry - (wall - buf)
            risk = max(raw_risk, min_risk)
            stop = _round_tick(entry - risk, tick)
            tp1 = _round_tick(entry + risk * self.cfg.tp1_r_multiple, tick)
            tp2 = _round_tick(entry + risk * self.cfg.tp2_r_multiple, tick)
        else:  # SELL
            raw_risk = (wall + buf) - entry
            risk = max(raw_risk, min_risk)
            stop = _round_tick(entry + risk, tick)
            tp1 = _round_tick(entry - risk * self.cfg.tp1_r_multiple, tick)
            tp2 = _round_tick(entry - risk * self.cfg.tp2_r_multiple, tick)

        return stop, tp1, tp2

    # ── Main run loop ─────────────────────────────────────────────────

    def run(
        self, steps: List[SyntheticScenarioStep]
    ) -> Tuple[List[Dict[str, Any]], List[SyntheticSignalResult]]:
        """
        Process all scenario steps sequentially.

        Returns:
            step_states: per-step dict list for display (state, reason, flow data)
            signals: list of actual SyntheticSignalResult objects (BUY/SELL signals only)
        """
        step_states: List[Dict[str, Any]] = []
        signals: List[SyntheticSignalResult] = []

        # Battle state
        in_battle: bool = False
        watch_dir: Optional[str] = None      # "BUY" or "SELL"
        wall_level: Optional[float] = None   # price of the active wall
        wall_side: Optional[str] = None      # "BID" or "ASK"
        wall_touched: bool = False
        signal_fired: bool = False

        for step in steps:
            ob = step.order_book_snapshot
            tf = step.trade_flow_snapshot
            price = step.price

            state = "WAIT"
            reason = ""
            signal_dict: Optional[Dict[str, Any]] = None

            if not in_battle:
                # ── Look for a new wall battle ────────────────────────
                bid_wall = self._detect_wall(ob, "BID")
                ask_wall = self._detect_wall(ob, "ASK")

                if bid_wall and self._sellers_active(tf):
                    # Sellers attacking a bid wall → enter WATCH_BUY battle
                    in_battle = True
                    watch_dir = "BUY"
                    wall_level = bid_wall[0]
                    wall_side = "BID"
                    wall_touched = self._is_touching(price, wall_level, wall_side)
                    signal_fired = False
                    state = "WATCH_BUY"
                    reason = (
                        f"Sellers ({tf.seller_pct:.0f}%, {tf.aggressive_sell_contracts} lots) "
                        f"attacking stacked bid wall at {wall_level:.2f} "
                        f"({bid_wall[1]:,} lots). Watching for reversal or breakdown."
                    )

                elif ask_wall and self._buyers_active(tf):
                    # Buyers attacking an ask wall → enter WATCH_SELL battle
                    in_battle = True
                    watch_dir = "SELL"
                    wall_level = ask_wall[0]
                    wall_side = "ASK"
                    wall_touched = self._is_touching(price, wall_level, wall_side)
                    signal_fired = False
                    state = "WATCH_SELL"
                    reason = (
                        f"Buyers ({tf.buyer_pct:.0f}%, {tf.aggressive_buy_contracts} lots) "
                        f"attacking stacked ask wall at {wall_level:.2f} "
                        f"({ask_wall[1]:,} lots). Watching for reversal or breakout."
                    )

                else:
                    state = "WAIT"
                    bid_info = f"Bid wall: {bid_wall[1]:,} lots" if bid_wall else "No qualifying bid wall"
                    ask_info = f"Ask wall: {ask_wall[1]:,} lots" if ask_wall else "No qualifying ask wall"
                    reason = f"No confirmed wall battle. {bid_info}. {ask_info}. Holding WAIT."

            else:
                # ── Active battle — update touch and resolve ──────────
                assert wall_level is not None and wall_side is not None

                if not wall_touched and self._is_touching(price, wall_level, wall_side):
                    wall_touched = True

                if signal_fired and self.cfg.one_signal_per_battle:
                    # Cooldown — signal already fired for this battle
                    state = "WAIT"
                    reason = (
                        "Signal already fired for this battle. "
                        "one_signal_per_battle is active — no duplicate signals."
                    )

                elif watch_dir == "BUY":
                    # ── Bid wall battle ───────────────────────────────
                    if self._is_broken(price, wall_level, "BID") and self._sellers_active(tf):
                        # Wall broke → SELL_CONTINUATION
                        state = "SELL_CONTINUATION"
                        entry = price
                        stop, tp1, tp2 = self._build_plan("SELL", entry, wall_level)
                        reason = (
                            f"Sellers broke the defended bid wall at {wall_level:.2f} "
                            f"with {tf.seller_pct:.0f}% aggression. Continuation short."
                        )
                        sig = SyntheticSignalResult(
                            step_index=step.step_index,
                            state="SELL_CONTINUATION",
                            signal_type="CONTINUATION",
                            direction="SELL",
                            reason=reason,
                            entry=entry,
                            stop=stop,
                            tp1=tp1,
                            tp2=tp2,
                            confidence_label="Demo Signal",
                        )
                        signals.append(sig)
                        signal_dict = _signal_to_dict(sig)
                        signal_fired = True
                        in_battle = False  # reset battle

                    elif wall_touched and self._buyers_active(tf):
                        # Wall held → BUY_REVERSAL
                        state = "BUY_REVERSAL"
                        entry = price
                        stop, tp1, tp2 = self._build_plan("BUY", entry, wall_level)
                        reason = (
                            f"Sellers attacked the stacked bid wall at {wall_level:.2f} "
                            f"and failed. Buyers ({tf.buyer_pct:.0f}%, "
                            f"{tf.aggressive_buy_contracts} lots) reclaimed the battle."
                        )
                        sig = SyntheticSignalResult(
                            step_index=step.step_index,
                            state="BUY_REVERSAL",
                            signal_type="REVERSAL",
                            direction="BUY",
                            reason=reason,
                            entry=entry,
                            stop=stop,
                            tp1=tp1,
                            tp2=tp2,
                            confidence_label="Demo Signal",
                        )
                        signals.append(sig)
                        signal_dict = _signal_to_dict(sig)
                        signal_fired = True
                        # Keep in_battle=True if one_signal_per_battle (for cooldown display)
                        # Reset only after the cooldown is shown
                        if not self.cfg.one_signal_per_battle:
                            in_battle = False

                    else:
                        state = "WATCH_BUY"
                        touch_note = " Price in wall zone." if wall_touched else ""
                        reason = (
                            f"Sellers ({tf.seller_pct:.0f}%) attacking bid wall at "
                            f"{wall_level:.2f}.{touch_note} Waiting for resolution."
                        )

                elif watch_dir == "SELL":
                    # ── Ask wall battle ───────────────────────────────
                    if self._is_broken(price, wall_level, "ASK") and self._buyers_active(tf):
                        # Wall broke → BUY_CONTINUATION
                        state = "BUY_CONTINUATION"
                        entry = price
                        stop, tp1, tp2 = self._build_plan("BUY", entry, wall_level)
                        reason = (
                            f"Buyers broke the defended ask wall at {wall_level:.2f} "
                            f"with {tf.buyer_pct:.0f}% aggression. Continuation long."
                        )
                        sig = SyntheticSignalResult(
                            step_index=step.step_index,
                            state="BUY_CONTINUATION",
                            signal_type="CONTINUATION",
                            direction="BUY",
                            reason=reason,
                            entry=entry,
                            stop=stop,
                            tp1=tp1,
                            tp2=tp2,
                            confidence_label="Demo Signal",
                        )
                        signals.append(sig)
                        signal_dict = _signal_to_dict(sig)
                        signal_fired = True
                        in_battle = False

                    elif wall_touched and self._sellers_active(tf):
                        # Wall held → SELL_REVERSAL
                        state = "SELL_REVERSAL"
                        entry = price
                        stop, tp1, tp2 = self._build_plan("SELL", entry, wall_level)
                        reason = (
                            f"Buyers attacked the stacked ask wall at {wall_level:.2f} "
                            f"and failed. Sellers ({tf.seller_pct:.0f}%, "
                            f"{tf.aggressive_sell_contracts} lots) reclaimed the battle."
                        )
                        sig = SyntheticSignalResult(
                            step_index=step.step_index,
                            state="SELL_REVERSAL",
                            signal_type="REVERSAL",
                            direction="SELL",
                            reason=reason,
                            entry=entry,
                            stop=stop,
                            tp1=tp1,
                            tp2=tp2,
                            confidence_label="Demo Signal",
                        )
                        signals.append(sig)
                        signal_dict = _signal_to_dict(sig)
                        signal_fired = True
                        if not self.cfg.one_signal_per_battle:
                            in_battle = False

                    else:
                        state = "WATCH_SELL"
                        touch_note = " Price in wall zone." if wall_touched else ""
                        reason = (
                            f"Buyers ({tf.buyer_pct:.0f}%) attacking ask wall at "
                            f"{wall_level:.2f}.{touch_note} Waiting for resolution."
                        )

            # ── Record step state ─────────────────────────────────────
            step_states.append({
                "step_index": step.step_index,
                "label": step.label,
                "price": step.price,
                "state": state,
                "reason": reason,
                "notes": step.notes,
                "trade_flow": {
                    "buyer_pct": tf.buyer_pct,
                    "seller_pct": tf.seller_pct,
                    "delta": tf.delta,
                    "aggressive_buy_contracts": tf.aggressive_buy_contracts,
                    "aggressive_sell_contracts": tf.aggressive_sell_contracts,
                },
                "signal": signal_dict,
            })

        return step_states, signals


def _signal_to_dict(sig: SyntheticSignalResult) -> Dict[str, Any]:
    return {
        "step_index": sig.step_index,
        "state": sig.state,
        "signal_type": sig.signal_type,
        "direction": sig.direction,
        "reason": sig.reason,
        "entry": sig.entry,
        "stop": sig.stop,
        "tp1": sig.tp1,
        "tp2": sig.tp2,
        "confidence_label": sig.confidence_label,
    }
