"use client";

import { useEffect, useState } from "react";
import UploadZone from "@/components/UploadZone";
import AnalysisReport from "@/components/AnalysisReport";
import type { AnalysisResult, UploadResponse } from "@/lib/types";

export default function UploadSection() {
  const [fileCount, setFileCount] = useState<number | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/indicators")
      .then(r => r.json())
      .then(data => { setConfigured(data.configured); setFileCount(data.file_count); })
      .catch(() => { setConfigured(false); setFileCount(0); });
  }, []);

  const handleUploadComplete = (
    response: UploadResponse & { file_count?: number; analyzer_error?: string }
  ) => {
    if (response.success) {
      if (response.file_count !== undefined) setFileCount(response.file_count);
      setUploadedFilename(response.original_filename ?? "");
      setAnalysis(response.analysis ?? null);
      setAnalyzerError(response.analyzer_error ?? null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Env warning */}
      {configured === false && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">Upload directory not configured</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Add{" "}
            <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-800">
              TOWER_UPLOADED_INDICATORS_DIR=/your/local/path
            </code>{" "}
            to <code className="font-mono text-amber-700">apps/web/.env.local</code> and restart the dev server.
          </p>
        </div>
      )}

      {/* File count row */}
      {fileCount !== null && fileCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="status-dot bg-blue-400 dot-pulse" />
          {fileCount} file{fileCount === 1 ? "" : "s"} stored
        </div>
      )}

      {/* Upload zone */}
      <UploadZone onUploadComplete={handleUploadComplete} />

      {/* Product flow helper */}
      <div className="surface-alt p-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">After upload, TOWER will:</p>
        <ol className="space-y-1">
          {[
            "Analyze file type and all input parameters",
            "Detect indicator or strategy signals and capabilities",
            "Prepare it for strategy definition and backtesting",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Analysis result */}
      {analysis && (
        <div className="mt-2">
          <AnalysisReport result={analysis} originalFilename={uploadedFilename} />
        </div>
      )}

      {/* Analyzer error (Python not available etc.) */}
      {analyzerError && !analysis && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold text-red-700 mb-1">Analyzer error</p>
          <p className="text-xs text-gray-500 font-mono break-all">{analyzerError}</p>
        </div>
      )}
    </div>
  );
}
