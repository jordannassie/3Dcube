# NT8 File Analyzer Specification — Phase 2

## What It Is

`nt8_file_analyzer.py` is a **structural metadata analyzer** for NinjaTrader 8
NinjaScript `.cs` files.

**It is NOT a C# transpiler or full logic translator.**

It reads a `.cs` file and returns a machine-readable `AnalysisResult` describing:
- What type of file this is (Indicator or Strategy)
- What parameters it exposes and their ranges
- Which NT8 lifecycle methods are present
- What trading capabilities it uses (Level 2, market data, drawings, alerts, orders)
- Whether it is a likely candidate for MBO backtesting

Full strategy translation — where indicator signals are mapped to Python backtest
logic — happens in Phase 3 (Strategy Definition Builder). That phase will work
precisely for TOWER-authored files and well-structured NT8 indicators. It does not
promise arbitrary C# translation.

---

## Supported File Types

| NT8 Class     | Detected As  | Notes                                              |
|---------------|--------------|----------------------------------------------------|
| `: Indicator` | indicator    | Most Umar files are indicators                     |
| `: Strategy`  | strategy     | Can be backtested more directly                    |
| Other         | unknown      | Custom base class or non-standard structure        |

---

## Output: `AnalysisResult`

```python
@dataclass
class ParameterInfo:
    name: str
    param_type: str           # "int" | "double" | "bool" | "string"
    display_name: str | None
    group_name: str | None
    order: int | None
    range_min: str | None     # Kept as string — may be "int.MaxValue" etc.
    range_max: str | None
    default_value: str | None

@dataclass
class AnalysisResult:
    filename: str
    total_chars: int
    total_lines: int
    class_name: str | None
    namespace: str | None
    file_type: str            # "indicator" | "strategy" | "unknown"
    is_indicator: bool
    is_strategy: bool
    methods_detected: list[str]
    parameters: list[ParameterInfo]
    uses_level2: bool
    uses_market_data: bool
    uses_chart_drawings: bool
    uses_alerts: bool
    contains_direct_trade_orders: bool
    likely_mbo_candidate: bool
    warnings: list[str]
```

---

## Parameter Extraction

The analyzer detects `[NinjaScriptProperty]`-tagged public properties.

### Supported Patterns

**New NT8 style:**
```csharp
[NinjaScriptProperty]
[Range(1, 500)]
[Display(Name = "EMA Period", GroupName = "Parameters", Order = 1)]
public int EmaPeriod
{ get => emaPeriod; set => emaPeriod = Math.Max(1, value); }
```

**Legacy NT8 style:**
```csharp
[NinjaScriptProperty]
[Range(1, int.MaxValue)]
[Display(Name="Length", Description="", Order=1, GroupName="Parameters")]
public int Length
{ get { return length; } set { length = Math.Max(1, value); } }
```

### Default Value Detection

Default values are extracted from the `State.SetDefaults` block:
```csharp
case State.SetDefaults:
    EmaPeriod = 20;
    StopTicks = 12;
    break;
```

---

## Capability Detection Signals

### Level 2 / DOM
```
OnMarketDepth, MarketDepthType, bidVolume, askVolume,
bigBidSize, bigAskSize, domBid, domAsk, .Bids, .Asks,
GetAsk, GetBid, AddGet(
```

### Market Data
```
OnMarketData, MarketDataType.Bid, MarketDataType.Ask,
MarketDataType.Last, e.Price, e.Volume
```

### Chart Drawings
```
Draw.Line, Draw.Text, Draw.TextFixed, Draw.Rectangle,
Draw.Region, Draw.Dot, Draw.ArrowUp, Draw.ArrowDown,
Draw.TriangleUp, Draw.TriangleDown
```

### Alerts
```
Alert(, PlaySound(
```

### Direct Trade Orders
```
EnterLong(, EnterShort(, ExitLong(, ExitShort(,
SetStopLoss(, SetProfitTarget(, SetTrailingStop(
```

---

## MBO Candidacy Rule

```python
likely_mbo_candidate = (
    (is_indicator or is_strategy)
    and (uses_level2 or uses_market_data)
)
```

A file is an MBO backtest candidate if it is a recognized NT8 file type
AND it accesses real-time market depth or bid/ask data — the same data
that the MBO replay engine will provide.

---

## CLI Usage

```bash
# Formatted human-readable output + JSON at the end
python engine/scripts/analyze_nt8_file.py --file /path/to/UmarIndicator.cs

# JSON only (for machine parsing by the Next.js API)
python engine/scripts/analyze_nt8_file.py --file /path/to/UmarIndicator.cs --json
```

**Example output (no `--json`):**
```
  TOWER Umar Engine — NT8 File Analysis
  ────────────────────────────────────────────────────────

  File
    Name      : TOWERUmar2_BALANCED_SELECTIVE_UPDATE.cs
    Lines     : 842
    Chars     : 28,441

  NT8 Identity
    Type      : INDICATOR
    Class     : TOWERUmar2_BALANCED_SELECTIVE_UPDATE

  Parameters (6 detected)
    Name                         Type       Default        Range
    ─────────────────────────────────────────────────────────────
    BidAskThreshold              int        400            1 – int.MaxValue
    LookbackBars                 int        3              1 – 50
    ...

  Lifecycle Methods (3 detected)
    OnStateChange, OnBarUpdate, OnMarketDepth

  Trading Capabilities
    Uses Level 2 / DOM    : Yes
    Uses Market Data       : Yes
    Uses Chart Drawings    : Yes
    Uses Alerts/Sound      : No
    Direct Trade Orders    : No

  MBO Backtest Candidate : YES — uses order-flow data
```

---

## Next.js API Integration

The upload route (`/api/upload`) calls the analyzer automatically:

```typescript
const result = spawnSync(pythonBin, [scriptPath, '--file', destPath, '--json'], {
  timeout: 20_000,
  encoding: 'utf8',
});
const analysis = JSON.parse(result.stdout);
```

The JSON is returned in the upload response and rendered by `AnalysisReport.tsx`.

---

## Phase 3 Preview: Strategy Definition Builder

Phase 3 will take the `AnalysisResult` and help build a `StrategyDefinition`:
- User selects which indicator signals become entry/exit conditions
- System maps those conditions to Python backtest logic
- Works precisely for TOWER-authored files where the signal logic is well-defined
- Does not attempt arbitrary C# parsing or full transpilation
