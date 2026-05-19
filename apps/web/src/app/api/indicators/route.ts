import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { IndicatorsResponse } from "@/lib/types";

export async function GET(): Promise<NextResponse<IndicatorsResponse>> {
  const uploadDir = process.env.TOWER_UPLOADED_INDICATORS_DIR?.trim();

  if (!uploadDir || !fs.existsSync(uploadDir)) {
    return NextResponse.json({ configured: !!uploadDir, file_count: 0, files: [] });
  }

  try {
    const files = fs
      .readdirSync(uploadDir)
      .filter((f) => f.toLowerCase().endsWith(".cs"))
      .map((f) => {
        const stat = fs.statSync(path.join(uploadDir, f));
        return {
          name: f,
          size: stat.size,
          modified: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.modified.localeCompare(a.modified));

    return NextResponse.json({ configured: true, file_count: files.length, files });
  } catch {
    return NextResponse.json({ configured: true, file_count: 0, files: [] });
  }
}
