import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

/** Find the Python analyzer script relative to the Next.js project root. */
function resolveAnalyzerScript(): string {
  return path.resolve(process.cwd(), "../../engine/scripts/analyze_nt8_file.py");
}

/**
 * GET /api/analyze?file=SomeIndicator.cs
 *
 * Runs the NT8 Python analyzer on an existing file inside
 * TOWER_UPLOADED_INDICATORS_DIR and returns the structured AnalysisResult.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("file");

  if (!filename) {
    return NextResponse.json(
      { success: false, error: "Missing required query param: file" },
      { status: 400 }
    );
  }

  // Guard against path traversal
  const safe = path.basename(filename);
  if (!safe.toLowerCase().endsWith(".cs")) {
    return NextResponse.json(
      { success: false, error: "Only .cs files are accepted." },
      { status: 400 }
    );
  }

  const uploadDir = process.env.TOWER_UPLOADED_INDICATORS_DIR?.trim();
  if (!uploadDir) {
    return NextResponse.json(
      { success: false, error: "TOWER_UPLOADED_INDICATORS_DIR is not configured." },
      { status: 400 }
    );
  }

  const filePath = path.join(uploadDir, safe);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { success: false, error: `File not found in Test folder: ${safe}` },
      { status: 404 }
    );
  }

  const pythonBin = process.env.TOWER_PYTHON_BIN?.trim() || "python3";
  const scriptPath = resolveAnalyzerScript();

  if (!fs.existsSync(scriptPath)) {
    return NextResponse.json(
      { success: false, error: `Analyzer script not found at: ${scriptPath}` },
      { status: 500 }
    );
  }

  const result = spawnSync(pythonBin, [scriptPath, "--file", filePath, "--json"], {
    timeout: 20_000,
    encoding: "utf8",
  });

  if (result.status === 0 && result.stdout?.trim()) {
    try {
      const analysis = JSON.parse(result.stdout.trim());
      return NextResponse.json({ success: true, filename: safe, analysis });
    } catch {
      return NextResponse.json(
        { success: false, error: "Analyzer returned invalid JSON." },
        { status: 500 }
      );
    }
  }

  const errorMsg = result.stderr?.trim().slice(0, 500) || result.error?.message || "Unknown analyzer error.";
  return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
}
