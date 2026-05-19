import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { spawnSync } from "child_process";

function resolveDemoScript(): string {
  return path.resolve(process.cwd(), "../../engine/scripts/run_synthetic_umar_demo.py");
}

/**
 * POST /api/synthetic-umar/run
 * Body: { "scenarioId": "bullish_bid_defense_reversal" }
 *
 * Runs the Python synthetic Umar demo engine for the specified scenario
 * and returns the full structured result.
 *
 * Local-only: Python engine is not available on Netlify preview.
 */
export async function POST(request: Request) {
  let body: { scenarioId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { scenarioId } = body;
  if (!scenarioId || typeof scenarioId !== "string") {
    return NextResponse.json(
      { success: false, error: "Missing required field: scenarioId" },
      { status: 400 }
    );
  }

  const scriptPath = resolveDemoScript();
  if (!fs.existsSync(scriptPath)) {
    return NextResponse.json(
      {
        success: false,
        engine_available: false,
        error: `Synthetic demo script not found at: ${scriptPath}. Run locally to use this feature.`,
      },
      { status: 503 }
    );
  }

  const pythonBin = process.env.TOWER_PYTHON_BIN?.trim() || "python3";
  const result = spawnSync(
    pythonBin,
    [scriptPath, "--scenario", scenarioId, "--json"],
    { timeout: 30_000, encoding: "utf8" }
  );

  if (result.error) {
    return NextResponse.json(
      { success: false, engine_available: false, error: result.error.message },
      { status: 503 }
    );
  }

  if (result.status !== 0) {
    const errMsg = result.stderr?.trim().slice(0, 600) || "Unknown error from Python engine.";
    return NextResponse.json(
      { success: false, engine_available: true, error: errMsg },
      { status: 500 }
    );
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(result.stdout.trim());
  } catch {
    return NextResponse.json(
      { success: false, engine_available: true, error: "Engine returned invalid JSON." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, engine_available: true, result: data });
}
