"""
nt8_file_analyzer.py — TOWER Umar Engine: NT8 .cs File Analyzer

Phase 2 metadata analyzer for NinjaTrader 8 NinjaScript .cs files.
Returns a structured dict describing the file's identity, parameters,
lifecycle methods, trading capabilities, and high-level usefulness flags.

This is NOT a logic translator. It reads and reports structure only.
Actual strategy translation happens in a later phase.
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Optional


# ── Data structures ──────────────────────────────────────────────────────────

@dataclass
class ParameterInfo:
    name: str
    param_type: str
    display_name: Optional[str] = None
    group_name: Optional[str] = None
    order: Optional[int] = None
    range_min: Optional[str] = None
    range_max: Optional[str] = None
    default_value: Optional[str] = None


@dataclass
class AnalysisResult:
    filename: str
    total_chars: int
    total_lines: int
    class_name: Optional[str]
    namespace: Optional[str]
    file_type: str                          # "indicator" | "strategy" | "unknown"
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
    warnings: list[str] = field(default_factory=list)


# ── NT8 constants ─────────────────────────────────────────────────────────────

NT8_LIFECYCLE_METHODS = [
    "OnStateChange",
    "OnBarUpdate",
    "OnMarketDepth",
    "OnMarketData",
    "OnRender",
    "OnExecutionUpdate",
    "OnOrderUpdate",
]

NT8_LEVEL2_SIGNALS = [
    r"OnMarketDepth",
    r"MarketDepthType",
    r"e\.MarketDataType",
    r"bidVolume",
    r"askVolume",
    r"bigBidSize",
    r"bigAskSize",
    r"domBid",
    r"domAsk",
    r"AddGet\s*\(",
    r"\.Bids\b",
    r"\.Asks\b",
    r"GetAsk\b",
    r"GetBid\b",
]

NT8_MARKET_DATA_SIGNALS = [
    r"OnMarketData",
    r"MarketDataType\.Bid\b",
    r"MarketDataType\.Ask\b",
    r"MarketDataType\.Last\b",
    r"e\.Price",
    r"e\.Volume",
]

NT8_DRAW_SIGNALS = [
    r"Draw\.Line\b",
    r"Draw\.Text\b",
    r"Draw\.TextFixed\b",
    r"Draw\.Rectangle\b",
    r"Draw\.Region\b",
    r"Draw\.Dot\b",
    r"Draw\.ArrowUp\b",
    r"Draw\.ArrowDown\b",
    r"Draw\.TriangleUp\b",
    r"Draw\.TriangleDown\b",
]

NT8_ALERT_SIGNALS = [
    r"Alert\s*\(",
    r"PlaySound\s*\(",
]

NT8_ORDER_SIGNALS = [
    r"EnterLong\s*\(",
    r"EnterShort\s*\(",
    r"ExitLong\s*\(",
    r"ExitShort\s*\(",
    r"SetStopLoss\s*\(",
    r"SetProfitTarget\s*\(",
    r"SetTrailingStop\s*\(",
]

# Properties we skip when extracting defaults from SetDefaults block
_SET_DEFAULTS_SKIP = {
    "Name", "Description", "Calculate", "IsOverlay", "DisplayInDataBox",
    "DrawOnPricePanel", "IsSuspendedWhileInactive", "IsAutoScale",
    "ScaleJustification", "DrawHorizontalGridLines", "DrawVerticalGridLines",
    "PaintPriceMarkers", "BarsRequiredToPlot", "BarsRequiredToTrade",
}


# ── Parsing helpers ────────────────────────────────────────────────────────────

def _strip_line_comments(source: str) -> str:
    """Remove // line comments but preserve line count."""
    return re.sub(r"//[^\n]*", "", source)


def _detect_class(source: str) -> tuple[Optional[str], Optional[str], str]:
    """Return (class_name, namespace, file_type)."""
    ns_match = re.search(r"namespace\s+([\w.]+)", source)
    namespace = ns_match.group(1) if ns_match else None

    # Strategy takes precedence over Indicator in detection
    strat_match = re.search(
        r"class\s+(\w+)\s*:\s*(?:\w+\s*,\s*)*Strategy\b", source
    )
    if strat_match:
        return strat_match.group(1), namespace, "strategy"

    ind_match = re.search(
        r"class\s+(\w+)\s*:\s*(?:\w+\s*,\s*)*Indicator\b", source
    )
    if ind_match:
        return ind_match.group(1), namespace, "indicator"

    # Fallback: any class
    any_class = re.search(r"class\s+(\w+)", source)
    if any_class:
        return any_class.group(1), namespace, "unknown"

    return None, namespace, "unknown"


def _detect_methods(source: str) -> list[str]:
    """Return list of detected NT8 lifecycle method names present in source."""
    found = []
    for method in NT8_LIFECYCLE_METHODS:
        if re.search(rf"\bprotected\s+override\s+void\s+{method}\b|"
                     rf"\bpublic\s+override\s+void\s+{method}\b|"
                     rf"\bvoid\s+{method}\s*\(", source):
            found.append(method)
        elif re.search(rf"\b{method}\b", source) and method in source:
            # Less strict — method name appears in source at all
            found.append(method)
    return list(dict.fromkeys(found))  # preserve order, deduplicate


def _extract_set_defaults(source: str) -> dict[str, str]:
    """Extract parameter default values from the State.SetDefaults block."""
    defaults: dict[str, str] = {}

    # Try switch/case style
    m = re.search(
        r"case\s+State\.SetDefaults\s*:(.*?)(?=case\s+State\.\w+|\bbreak\s*;)",
        source, re.DOTALL,
    )
    if not m:
        # Try if-statement style
        m = re.search(
            r"if\s*\(\s*State\s*==\s*State\.SetDefaults\s*\)\s*\{([^}]+)\}",
            source, re.DOTALL,
        )

    if m:
        block = m.group(1)
        for am in re.finditer(r"^\s*(\w+)\s*=\s*([^;\n]+);", block, re.MULTILINE):
            name = am.group(1).strip()
            value = am.group(2).strip()
            if name not in _SET_DEFAULTS_SKIP and not name.startswith("//"):
                defaults[name] = value

    return defaults


def _extract_parameters(source: str, defaults: dict[str, str]) -> tuple[list[ParameterInfo], list[str]]:
    """
    Extract NinjaScriptProperty-tagged public properties.
    Returns (list of ParameterInfo, list of warning strings).
    """
    parameters: list[ParameterInfo] = []
    warnings: list[str] = []
    seen_names: set[str] = set()

    lines = source.split("\n")
    n = len(lines)
    i = 0

    while i < n:
        stripped = lines[i].strip()

        # Gate: look for the start of an attribute block containing NinjaScriptProperty
        if "[NinjaScriptProperty]" not in stripped and stripped != "[NinjaScriptProperty]":
            i += 1
            continue

        # Collect attribute block lines (from this line forward)
        block_lines: list[str] = []
        j = i

        while j < n:
            line_j = lines[j].strip()
            if line_j.startswith("[") or line_j == "":
                block_lines.append(lines[j])
                j += 1
            else:
                break

        # Skip blank lines between attributes and property
        while j < n and not lines[j].strip():
            j += 1

        # Expect: public <Type> <Name> ...
        if j >= n:
            i += 1
            continue

        prop_match = re.match(
            r"\s*public\s+([\w<>\[\]?]+)\s+(\w+)\s*(?:\{|=>|$)",
            lines[j],
        )
        if not prop_match:
            i += 1
            continue

        prop_type = prop_match.group(1)
        prop_name = prop_match.group(2)

        # Skip system/NT8 built-in properties
        if prop_name in ("Input", "Inputs", "Values", "this", "Panel"):
            i = j + 1
            continue

        if prop_name in seen_names:
            i = j + 1
            continue
        seen_names.add(prop_name)

        block_text = "\n".join(block_lines)

        param = ParameterInfo(
            name=prop_name,
            param_type=prop_type,
            default_value=defaults.get(prop_name),
        )

        # [Range(min, max)]
        range_m = re.search(r"\[Range\(([^,)]+)(?:,\s*([^)]+))?\)", block_text)
        if range_m:
            param.range_min = range_m.group(1).strip()
            if range_m.group(2):
                param.range_max = range_m.group(2).strip()

        # [Display(Name = "...", GroupName = "...", Order = N)]
        display_m = re.search(r"\[Display\s*\(([^)]+)\)", block_text)
        if display_m:
            d = display_m.group(1)
            nm = re.search(r'Name\s*=\s*"([^"]+)"', d)
            gm = re.search(r'GroupName\s*=\s*"([^"]+)"', d)
            om = re.search(r'Order\s*=\s*(\d+)', d)
            if nm:
                param.display_name = nm.group(1)
            if gm:
                param.group_name = gm.group(1)
            if om:
                param.order = int(om.group(1))

        parameters.append(param)
        i = j + 1

    return parameters, warnings


def _any_pattern(source: str, patterns: list[str]) -> bool:
    return any(re.search(p, source) for p in patterns)


# ── Main analyzer ──────────────────────────────────────────────────────────────

def analyze_file(path: str | Path) -> AnalysisResult:
    """
    Analyze a NinjaScript .cs file and return a structured AnalysisResult.
    Raises FileNotFoundError or ValueError on bad input.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    if path.suffix.lower() != ".cs":
        raise ValueError(f"Expected a .cs file, got: {path.suffix}")

    raw = path.read_text(encoding="utf-8", errors="replace")
    source = _strip_line_comments(raw)

    warnings: list[str] = []

    # 1. Basic metadata
    total_chars = len(raw)
    total_lines = raw.count("\n") + 1

    # 2. Class identity
    class_name, namespace, file_type = _detect_class(source)
    is_indicator = file_type == "indicator"
    is_strategy = file_type == "strategy"

    if file_type == "unknown":
        warnings.append(
            "Could not detect class inheritance (Indicator / Strategy). "
            "File may use a custom base class or non-standard structure."
        )
    if class_name is None:
        warnings.append("No class declaration found in file.")

    # 3. Lifecycle methods
    methods_detected = _detect_methods(source)

    # 4. Parameters
    defaults = _extract_set_defaults(source)
    parameters, param_warnings = _extract_parameters(source, defaults)
    warnings.extend(param_warnings)

    if not parameters:
        warnings.append(
            "No [NinjaScriptProperty] parameters detected. "
            "The file may use a non-standard parameter pattern or have no user inputs."
        )
    if parameters and not any(p.default_value for p in parameters):
        warnings.append(
            "Parameter default values could not be determined from State.SetDefaults. "
            "Defaults may be set in a non-standard location."
        )

    # 5. Capabilities
    uses_level2 = _any_pattern(source, NT8_LEVEL2_SIGNALS)
    uses_market_data = _any_pattern(source, NT8_MARKET_DATA_SIGNALS)
    uses_chart_drawings = _any_pattern(source, NT8_DRAW_SIGNALS)
    uses_alerts = _any_pattern(source, NT8_ALERT_SIGNALS)
    contains_direct_trade_orders = _any_pattern(source, NT8_ORDER_SIGNALS)

    # 6. MBO candidate
    likely_mbo_candidate = (
        (is_indicator or is_strategy)
        and (uses_level2 or uses_market_data)
    )

    # 7. Final warning: phase boundary reminder
    warnings.append(
        "Phase 2 analyzer only — this is structural metadata, not executable strategy "
        "translation. Strategy definitions will be built in Phase 3."
    )

    return AnalysisResult(
        filename=path.name,
        total_chars=total_chars,
        total_lines=total_lines,
        class_name=class_name,
        namespace=namespace,
        file_type=file_type,
        is_indicator=is_indicator,
        is_strategy=is_strategy,
        methods_detected=methods_detected,
        parameters=parameters,
        uses_level2=uses_level2,
        uses_market_data=uses_market_data,
        uses_chart_drawings=uses_chart_drawings,
        uses_alerts=uses_alerts,
        contains_direct_trade_orders=contains_direct_trade_orders,
        likely_mbo_candidate=likely_mbo_candidate,
        warnings=warnings,
    )


def to_dict(result: AnalysisResult) -> dict[str, Any]:
    """Convert AnalysisResult to a JSON-serializable dict."""
    d = asdict(result)
    # Rename 'param_type' key to 'type' in parameter dicts for cleaner JSON
    for p in d.get("parameters", []):
        p["type"] = p.pop("param_type", p.get("type"))
    return d
