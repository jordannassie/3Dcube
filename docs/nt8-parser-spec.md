# NT8 Parser Specification — Phase 2

## Purpose

`nt8_parser.py` reads a NinjaTrader 8 NinjaScript `.cs` file and extracts
a machine-readable `StrategySpec` without requiring a full C# parser.
NinjaScript follows highly predictable patterns that can be matched with
targeted regex and line-by-line analysis.

---

## Output: `StrategySpec`

```python
@dataclass
class ParameterSpec:
    name: str                  # "EmaPeriod"
    display_name: str          # "EMA Period"
    param_type: str            # "int" | "double" | "bool" | "string"
    default_value: Any         # 20
    min_value: Any | None      # 1
    max_value: Any | None      # 200
    step: Any | None           # 1  (for sweep step)
    group: str                 # "Parameters"

@dataclass
class IndicatorRef:
    name: str                  # "EMA"
    series: str                # "Close"
    params: list[str]          # ["EmaPeriod"]

@dataclass
class SignalSpec:
    signal_type: str           # "EnterLong" | "EnterShort" | "ExitLong" |
                               # "ExitShort" | "SetStopLoss" | "SetProfitTarget" |
                               # "SetTrailingStop"
    signal_name: str | None    # "LE" | "SE"
    quantity_expr: str | None  # "1" | "DefaultQuantity"
    calc_mode: str | None      # "Ticks" | "Percent" | "Currency"
    value_expr: str | None     # "StopTicks" (parameter name or literal)

@dataclass
class ConditionBlock:
    raw_source: str            # The if/else block as raw text
    signals: list[SignalSpec]  # Signals fired inside this block

@dataclass
class StrategySpec:
    strategy_name: str
    namespace: str
    nt8_version: str | None    # Detected from using statements
    parameters: list[ParameterSpec]
    indicators: list[IndicatorRef]
    conditions: list[ConditionBlock]
    raw_source: str            # Full original .cs text (for export round-trip)
    parse_warnings: list[str]  # Patterns that could not be auto-mapped
```

---

## Parsing Rules

### 1. Strategy Name

```python
# Pattern: class <Name> : Strategy
r'class\s+(\w+)\s*:\s*Strategy'
```

### 2. Parameters — New NT8 Style (property attributes)

```csharp
[Range(1, 200)]
[NinjaScriptProperty]
[Display(Name = "EMA Period", GroupName = "Parameters", Order = 1)]
public int EmaPeriod
{ get => emaPeriod; set => emaPeriod = Math.Max(1, value); }
```

Parsing steps:
1. Find `[Range(min, max)]` → extract `min_value`, `max_value`
2. Find `[Display(Name = "...", ...)]` → extract `display_name`, `group`
3. Find `public <type> <Name>` on the next property line → `param_type`, `name`
4. Find field initializer: `private int emaPeriod = 20;` → `default_value`

### 3. Parameters — Legacy NT8 Style (`Parameters.Add`)

```csharp
Parameters.Add(new Parameter("EmaPeriod", 20));
```

Pattern:
```python
r'Parameters\.Add\(new Parameter\("(\w+)",\s*([^)]+)\)\)'
```

### 4. Entry / Exit Signals

Signal detection patterns:

| NinjaScript Call                            | Regex Pattern                                         |
|---------------------------------------------|-------------------------------------------------------|
| `EnterLong(1, "LE")`                        | `r'EnterLong\(([^)]+)\)'`                             |
| `EnterShort(1, "SE")`                       | `r'EnterShort\(([^)]+)\)'`                            |
| `ExitLong("LE")`                            | `r'ExitLong\(([^)]*)\)'`                              |
| `ExitShort("SE")`                           | `r'ExitShort\(([^)]*)\)'`                             |
| `SetStopLoss("LE", CalculationMode.Ticks, StopTicks, false)` | `r'SetStopLoss\(([^)]+)\)'` |
| `SetProfitTarget("LE", CalculationMode.Ticks, TargetTicks)`  | `r'SetProfitTarget\(([^)]+)\)'` |
| `SetTrailingStop("LE", CalculationMode.Ticks, TrailTicks, true)` | `r'SetTrailingStop\(([^)]+)\)'` |

### 5. Indicator References

Pattern scan for known NT8 built-in names:

```python
KNOWN_INDICATORS = [
    "EMA", "SMA", "WMA", "HMA", "DEMA", "TEMA",
    "RSI", "Stochastics", "CCI", "MFI", "Williams",
    "MACD", "ADX", "ATR", "BollingerBands",
    "VOL", "OBV", "VWAP",
]
# Pattern: <Name>(<series>, <params>)
r'(?<!\w)(EMA|SMA|...)\s*\(([^)]+)\)'
```

### 6. OnBarUpdate Condition Blocks

Extract the full `OnBarUpdate()` method body, then split on top-level
`if`/`else if`/`else` blocks (balanced bracket tracking):

```python
def extract_on_bar_update(source: str) -> str:
    """Return the raw body of OnBarUpdate()."""

def split_condition_blocks(body: str) -> list[str]:
    """Split OnBarUpdate body into top-level if/else branches."""
```

Each block is stored as raw source text in `ConditionBlock.raw_source`.
The full condition logic translation happens in Phase 4 (`translator.py`).

---

## Parse Warnings

Any pattern the parser cannot confidently resolve is added to
`StrategySpec.parse_warnings` and flagged in the dashboard UI for manual review.

Examples of patterns that trigger warnings:
- Custom indicator classes (not in `KNOWN_INDICATORS`)
- Dynamic parameter calculations (e.g., `EmaPeriod = ATR(14).Value[0] * 2`)
- Inherited strategies (e.g., `: MyBaseStrategy` instead of `: Strategy`)
- `#region` / `#pragma` directives that hide parameter declarations

---

## CLI Usage (Phase 2)

```bash
python engine/scripts/parse_nt8.py --file path/to/UmarStrategy.cs

# Output (pretty-printed JSON):
{
  "strategy_name": "UmarStrategy",
  "parameters": [
    { "name": "EmaPeriod", "type": "int", "default": 20, "min": 1, "max": 200 },
    { "name": "StopTicks", "type": "int", "default": 12, "min": 2, "max": 50 },
    ...
  ],
  "indicators": ["EMA", "ATR", "VOL"],
  "signals": ["EnterLong", "EnterShort", "SetStopLoss", "SetProfitTarget"],
  "parse_warnings": []
}
```

---

## NT8 Exporter Round-Trip (Phase 7)

The `raw_source` field in `StrategySpec` preserves the full original `.cs` text.
The exporter uses it as the base and applies targeted replacements:

```python
def export_optimized(spec: StrategySpec, optimized_params: dict) -> str:
    source = spec.raw_source
    for param in spec.parameters:
        if param.name in optimized_params:
            new_val = optimized_params[param.name]
            # Replace the private field initializer
            # e.g., "private int emaPeriod = 20;" → "private int emaPeriod = 34;"
            source = re.sub(
                rf'(private\s+{param.param_type}\s+{_field_name(param.name)}\s*=\s*)[^;]+;',
                rf'\g<1>{new_val};',
                source
            )
    return OPTIMIZATION_HEADER + source
```

This preserves 100% of the original strategy logic — only the default values change.
