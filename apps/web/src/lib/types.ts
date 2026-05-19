// Shared TypeScript types for the TOWER dashboard.
// These mirror the Python AnalysisResult dataclass output (snake_case JSON).

export interface ParameterInfo {
  name: string;
  type: string;
  display_name: string | null;
  group_name: string | null;
  order: number | null;
  range_min: string | null;
  range_max: string | null;
  default_value: string | null;
}

export type FileType = "indicator" | "strategy" | "unknown";

export interface AnalysisResult {
  filename: string;
  total_chars: number;
  total_lines: number;
  class_name: string | null;
  namespace: string | null;
  file_type: FileType;
  is_indicator: boolean;
  is_strategy: boolean;
  methods_detected: string[];
  parameters: ParameterInfo[];
  uses_level2: boolean;
  uses_market_data: boolean;
  uses_chart_drawings: boolean;
  uses_alerts: boolean;
  contains_direct_trade_orders: boolean;
  likely_mbo_candidate: boolean;
  warnings: string[];
}

export interface UploadResponse {
  success: boolean;
  stored_filename?: string;
  original_filename?: string;
  file_size?: number;
  stored_path?: string;
  analysis?: AnalysisResult | null;
  error?: string;
}

export interface IndicatorsResponse {
  configured: boolean;
  file_count: number;
  files: Array<{ name: string; size: number; modified: string }>;
}

// ── Backtest chart data interfaces ────────────────────────────────────────────
// Built to work now with synthetic demo data and later with full 3-month MBO
// trade logs (hundreds/thousands of markers from real Databento replay).

export interface BacktestChartPoint {
  /** Step index for synthetic demo; later a Unix timestamp (ms) for MBO replay. */
  step: number;
  price: number;
  label?: string;
}

export type TradeResult = "WIN" | "LOSS" | "OPEN" | "NONE";
export type TradeDirection = "BUY" | "SELL";
export type TradeFilter = "ALL" | "BUY" | "SELL" | "WINNERS" | "LOSERS";

export interface BacktestTradeMarker {
  id: string;
  /** Step index in synthetic demo; later the entry timestamp in MBO mode. */
  step: number;
  entryPrice: number;
  exitPrice?: number;
  direction: TradeDirection;
  signalType: string;
  result: TradeResult;
  stopPrice?: number;
  tp1Price?: number;
  tp2Price?: number;
  reason?: string;
}
