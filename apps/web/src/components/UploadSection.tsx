"use client";

import { useEffect, useState } from "react";
import UploadZone from "@/components/UploadZone";
import AnalysisReport from "@/components/AnalysisReport";
import type { AnalysisResult, UploadResponse } from "@/lib/types";

interface UploadSectionProps {}

export default function UploadSection({}: UploadSectionProps) {
  const [fileCount, setFileCount] = useState<number | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string>("");
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);

  // Fetch initial file count on mount
  useEffect(() => {
    fetch("/api/indicators")
      .then((r) => r.json())
      .then((data) => {
        setConfigured(data.configured);
        setFileCount(data.file_count);
      })
      .catch(() => {
        setConfigured(false);
        setFileCount(0);
      });
  }, []);

  const handleUploadComplete = (response: UploadResponse & { file_count?: number; analyzer_error?: string }) => {
    if (response.success) {
      if (response.file_count !== undefined) setFileCount(response.file_count);
      setUploadedFilename(response.original_filename ?? "");
      setAnalysis(response.analysis ?? null);
      setAnalyzerError(response.analyzer_error ?? null);
    }
  };

  const countLabel =
    fileCount === null
      ? "Loading…"
      : fileCount === 0
      ? "No files yet"
      : `${fileCount} file${fileCount === 1 ? "" : "s"} stored`;

  return (
    <section className="space-y-8">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <h2 className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase">
          NT8 File Upload &amp; Analyzer
        </h2>
        <div className="h-px flex-1 bg-slate-800" />
        {/* Live file count badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`dot-pulse w-1.5 h-1.5 ${fileCount ? "bg-cyan-400" : "bg-slate-600"}`}
          />
          <span className="text-[10px] font-mono tracking-widest text-slate-600">
            {countLabel}
          </span>
        </div>
      </div>

      {/* Env-not-configured warning */}
      {configured === false && (
        <div className="glass rounded-xl px-5 py-4 border border-yellow-500/20 bg-yellow-500/5">
          <p className="text-sm font-semibold text-yellow-400 mb-1">
            ⚠ Upload directory not configured
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Add{" "}
            <code className="text-cyan-400 font-mono bg-slate-800/60 px-1 py-0.5 rounded text-[11px]">
              TOWER_UPLOADED_INDICATORS_DIR=/your/local/path
            </code>{" "}
            to <code className="text-slate-300 font-mono text-[11px]">apps/web/.env.local</code>{" "}
            and restart the dev server. The directory will be created automatically if it
            does not exist.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: upload zone + info */}
        <div className="lg:col-span-2 space-y-4">
          <UploadZone onUploadComplete={handleUploadComplete} />

          <div className="glass rounded-xl px-4 py-4 space-y-3">
            <p className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase">
              What gets analyzed
            </p>
            <ul className="space-y-2">
              {[
                ["📦", "Class identity (Indicator / Strategy)"],
                ["🔧", "All [NinjaScriptProperty] parameters with ranges"],
                ["🔁", "Lifecycle methods present (OnBarUpdate, OnMarketDepth…)"],
                ["📊", "Level 2 / DOM, market data, drawing logic"],
                ["⚡", "Direct trade order calls"],
                ["🎯", "MBO backtest candidacy flag"],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="text-sm leading-none mt-0.5">{icon}</span>
                  <span className="text-xs text-slate-500 leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: analysis result */}
        <div className="lg:col-span-3">
          {analysis ? (
            <AnalysisReport result={analysis} originalFilename={uploadedFilename} />
          ) : (
            <div className="glass rounded-2xl flex flex-col items-center justify-center gap-4 py-16 text-center h-full min-h-64">
              <div
                className="text-5xl opacity-20"
                style={{ filter: "grayscale(1)" }}
              >
                🔬
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  NT8 File Analysis
                </p>
                <p className="text-xs text-slate-700 mt-1 max-w-xs">
                  Upload a <span className="text-slate-500">.cs</span> file to see
                  the full structural analysis report here.
                </p>
              </div>
              {analyzerError && (
                <div className="glass rounded-lg px-4 py-3 border border-red-500/20 max-w-sm">
                  <p className="text-xs text-red-400 font-semibold mb-1">Analyzer error</p>
                  <p className="text-[11px] text-slate-500 font-mono break-all">
                    {analyzerError}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
