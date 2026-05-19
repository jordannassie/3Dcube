import { NextResponse } from "next/server";

/** Hardcoded scenario metadata — mirrors SCENARIO_REGISTRY in Python. */
const SCENARIOS = [
  {
    id: "bullish_bid_defense_reversal",
    name: "Bullish Bid Defense Reversal",
    expected_outcome: "BUY_REVERSAL",
    description: "Sellers attack a stacked bid wall. Wall holds. Buyers reclaim.",
    direction: "BUY",
    signal_type: "REVERSAL",
  },
  {
    id: "bearish_ask_defense_reversal",
    name: "Bearish Ask Defense Reversal",
    expected_outcome: "SELL_REVERSAL",
    description: "Buyers attack a stacked ask wall. Wall holds. Sellers reclaim.",
    direction: "SELL",
    signal_type: "REVERSAL",
  },
  {
    id: "bullish_continuation_breakout",
    name: "Bullish Continuation Breakout",
    expected_outcome: "BUY_CONTINUATION",
    description: "Buyers break through a defended ask wall with sustained aggression.",
    direction: "BUY",
    signal_type: "CONTINUATION",
  },
  {
    id: "bearish_continuation_breakdown",
    name: "Bearish Continuation Breakdown",
    expected_outcome: "SELL_CONTINUATION",
    description: "Sellers break through a defended bid wall with sustained aggression.",
    direction: "SELL",
    signal_type: "CONTINUATION",
  },
  {
    id: "neutral_no_trade",
    name: "Neutral Wall — No Confirmation",
    expected_outcome: "WAIT",
    description: "Mild walls and balanced flow — engine correctly stays in WAIT.",
    direction: "NONE",
    signal_type: "NONE",
  },
  {
    id: "one_signal_per_battle",
    name: "One Signal Per Battle",
    expected_outcome: "ONE_BUY_REVERSAL",
    description: "BUY REVERSAL fires once. Identical conditions repeat — zero duplicate signals.",
    direction: "BUY",
    signal_type: "REVERSAL",
  },
];

export async function GET() {
  return NextResponse.json({ scenarios: SCENARIOS });
}
