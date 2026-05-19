import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const ALLOWED_EXT = ".cs";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/** Remove path traversal components and replace unsafe chars. */
function sanitizeFilename(original: string): string {
  const base = path.basename(original);
  return base.replace(/[^a-zA-Z0-9._\-]/g, "_");
}

/** Find the Python analyzer script relative to the Next.js project root. */
function resolveAnalyzerScript(): string {
  // process.cwd() is apps/web/ when running `npm run dev`
  return path.resolve(process.cwd(), "../../engine/scripts/analyze_nt8_file.py");
}

export async function POST(request: Request) {
  // 1. Check env config
  const uploadDir = process.env.TOWER_UPLOADED_INDICATORS_DIR?.trim();
  if (!uploadDir) {
    return NextResponse.json(
      {
        success: false,
        error:
          "TOWER_UPLOADED_INDICATORS_DIR is not configured. " +
          "Add it to apps/web/.env.local and restart the dev server.",
      },
      { status: 400 }
    );
  }

  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Upload directory does not exist and could not be created: ${uploadDir}`,
        },
        { status: 400 }
      );
    }
  }

  // 2. Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid multipart form data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "No file field found in request." },
      { status: 400 }
    );
  }

  // 3. Validate
  if (!file.name.toLowerCase().endsWith(ALLOWED_EXT)) {
    return NextResponse.json(
      {
        success: false,
        error: `Only .cs NinjaScript files are accepted. Received: ${file.name}`,
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      {
        success: false,
        error: `File is too large (${(file.size / 1024).toFixed(0)} KB). Maximum is 10 MB.`,
      },
      { status: 400 }
    );
  }

  // 4. Save file
  const safeFilename = sanitizeFilename(file.name);
  const destPath = path.join(uploadDir, safeFilename);

  try {
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(bytes));
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to save file: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 }
    );
  }

  // 5. Run Python analyzer
  let analysis: Record<string, unknown> | null = null;
  let analyzerError: string | null = null;

  const pythonBin = process.env.TOWER_PYTHON_BIN?.trim() || "python3";
  const scriptPath = resolveAnalyzerScript();

  if (fs.existsSync(scriptPath)) {
    const result = spawnSync(pythonBin, [scriptPath, "--file", destPath, "--json"], {
      timeout: 20_000,
      encoding: "utf8",
    });

    if (result.status === 0 && result.stdout?.trim()) {
      try {
        analysis = JSON.parse(result.stdout.trim());
      } catch {
        analyzerError = "Analyzer returned invalid JSON.";
      }
    } else if (result.stderr) {
      analyzerError = result.stderr.trim().slice(0, 500);
    } else if (result.error) {
      analyzerError = result.error.message;
    }
  } else {
    analyzerError = `Analyzer script not found at: ${scriptPath}`;
  }

  // 6. Count files in directory
  let fileCount = 0;
  try {
    fileCount = fs
      .readdirSync(uploadDir)
      .filter((f) => f.toLowerCase().endsWith(".cs")).length;
  } catch {
    // non-critical
  }

  return NextResponse.json({
    success: true,
    stored_filename: safeFilename,
    original_filename: file.name,
    file_size: file.size,
    stored_path: uploadDir,
    file_count: fileCount,
    analysis,
    analyzer_error: analyzerError,
  });
}
