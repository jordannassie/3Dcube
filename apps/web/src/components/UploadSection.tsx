"use client";

import { useEffect, useState } from "react";
import UploadZone from "@/components/UploadZone";
import AnalysisReport from "@/components/AnalysisReport";
import FileSelector from "@/components/FileSelector";
import type { AnalysisResult, UploadResponse } from "@/lib/types";
import { IS_HOSTED_PREVIEW } from "@/lib/env";

function scrollToLocalSetup() {
  document.getElementById("local-setup")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function HostedInfoPanel() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
          <svg className="w-4.5 h-4.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Local Upload Required</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            This hosted preview shows the interface only. To upload NinjaTrader .cs files and store
            them on your SSD, run TOWER Strategy Lab locally.
          </p>
        </div>
      </div>

      <ol className="space-y-2">
        {[
          "Open the repo locally",
          <>Add <code className="font-mono text-xs bg-gray-100 px-1 rounded">TOWER_UPLOADED_INDICATORS_DIR</code> to <code className="font-mono text-xs bg-gray-100 px-1 rounded">apps/web/.env.local</code></>,
          "Run the local dev server",
          <>Open <code className="font-mono text-xs bg-gray-100 px-1 rounded">localhost:3000</code> and upload your .cs file</>,
        ].map((step, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      <button
        onClick={scrollToLocalSetup}
        className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-lg py-2.5 transition-colors"
      >
        Local setup instructions ↓
      </button>
    </div>
  );
}

export default function UploadSection() {
  const [fileCount, setFileCount] = useState<number | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);

  useEffect(() => {
    if (IS_HOSTED_PREVIEW) return;
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
    <div className="space-y-5">
      {/* ── Hosted preview ── */}
      {IS_HOSTED_PREVIEW ? (
        <>
          <HostedInfoPanel />
          <UploadZone onUploadComplete={handleUploadComplete} disabled />
        </>
      ) : (
        <>
          {/* Local env warning */}
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
              {fileCount} file{fileCount === 1 ? "" : "s"} in Test folder
            </div>
          )}

          {/* ── Test Library selector ── */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">Test Library</span>
              <span className="ml-auto text-[10px] text-gray-400 font-mono">Test/</span>
            </div>
            <FileSelector />
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">or upload new file</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* ── Upload zone ── */}
          <UploadZone onUploadComplete={handleUploadComplete} />

          {/* Analysis result from upload */}
          {analysis && (
            <div className="mt-1">
              <AnalysisReport result={analysis} originalFilename={uploadedFilename} />
            </div>
          )}

          {/* Analyzer error from upload */}
          {analyzerError && !analysis && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold text-red-700 mb-1">Analyzer error</p>
              <p className="text-xs text-gray-500 font-mono break-all">{analyzerError}</p>
            </div>
          )}
        </>
      )}

      {/* Product flow helper */}
      <div className="surface-alt p-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">After selecting a file, TOWER will:</p>
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
    </div>
  );
}
