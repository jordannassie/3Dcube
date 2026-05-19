"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "@/lib/types";

interface FileEntry {
  name: string;
  size: number;
  modified: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function CsFileIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg className={`w-3.5 h-3.5 ${spinning ? "animate-spin" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

// ── Compact file summary ───────────────────────────────────────────────────────

function CompactFileSummary({
  analysis,
  filename,
  onViewFileDetails,
}: {
  analysis: AnalysisResult;
  filename: string;
  onViewFileDetails?: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-start gap-3 p-3.5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
          <CsFileIcon className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{filename}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className={`badge ${analysis.is_indicator ? "badge-indicator" : analysis.is_strategy ? "badge-strategy" : "badge-offline"}`}>
              {analysis.file_type.charAt(0).toUpperCase() + analysis.file_type.slice(1)}
            </span>
            {analysis.likely_mbo_candidate && (
              <span className="badge badge-ready">MBO Candidate</span>
            )}
            {analysis.uses_level2 && (
              <span className="badge badge-soon">Level 2</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 bg-gray-50">
        <div className="px-3 py-2 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Params</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5">{analysis.parameters.length}</p>
        </div>
        <div className="px-3 py-2 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Methods</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5">{analysis.methods_detected.length}</p>
        </div>
        <div className="px-3 py-2 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Lines</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5">{analysis.total_lines.toLocaleString()}</p>
        </div>
      </div>

      {/* Footer row */}
      <div className="px-3.5 py-2 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-green-700">Analyzed</span>
        </div>
        {onViewFileDetails && (
          <button
            onClick={onViewFileDetails}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View File Details →
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface FileSelectorProps {
  /** Called whenever analysis completes or file is cleared. */
  onAnalysis?: (result: AnalysisResult | null, filename: string | null) => void;
  /** Called when user clicks "View File Details" — switch to File Details tab. */
  onViewFileDetails?: () => void;
}

export default function FileSelector({ onAnalysis, onViewFileDetails }: FileSelectorProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<FileEntry | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchFiles = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/indicators");
      const data = await res.json();
      setFiles(data.files ?? []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = async (file: FileEntry) => {
    setOpen(false);
    setSelected(file);
    setAnalysis(null);
    setAnalyzerError(null);
    onAnalysis?.(null, file.name);
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/analyze?file=${encodeURIComponent(file.name)}`);
      const data = await res.json();
      if (data.success && data.analysis) {
        const result = data.analysis as AnalysisResult;
        setAnalysis(result);
        onAnalysis?.(result, file.name);
      } else {
        setAnalyzerError(data.error || "Analysis failed.");
        onAnalysis?.(null, file.name);
      }
    } catch {
      setAnalyzerError("Network error — is the dev server running?");
      onAnalysis?.(null, file.name);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelected(null);
    setAnalysis(null);
    setAnalyzerError(null);
    onAnalysis?.(null, null);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2.5 py-4 text-sm text-gray-400">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        Scanning Test folder…
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
          <p className="text-xs font-semibold text-gray-600">Local Test Library</p>
          {files.length > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
              {files.length}
            </span>
          )}
        </div>
        <button
          onClick={() => fetchFiles(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshIcon spinning={refreshing} />
          Refresh
        </button>
      </div>

      {/* Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => files.length > 0 && setOpen(o => !o)}
          disabled={files.length === 0}
          className={[
            "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all duration-150",
            files.length === 0
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : open
              ? "border-blue-500 bg-white shadow-sm ring-2 ring-blue-100"
              : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm",
          ].join(" ")}
        >
          <CsFileIcon className={`w-4 h-4 flex-shrink-0 ${files.length === 0 ? "text-gray-300" : "text-blue-500"}`} />
          <span className={`flex-1 text-sm truncate ${
            files.length === 0 ? "text-gray-400" : selected ? "text-gray-900 font-medium" : "text-gray-500"
          }`}>
            {files.length === 0
              ? "No .cs files in Test folder"
              : selected
              ? selected.name
              : `Choose a file… (${files.length} available)`}
          </span>
          {selected ? (
            <button
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : files.length > 0 ? (
            <svg className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          ) : null}
        </button>

        {open && files.length > 0 && (
          <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
            <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Test Library — {files.length} file{files.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {files.map((f) => (
                <button key={f.name} onClick={() => handleSelect(f)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-blue-50 transition-colors ${selected?.name === f.name ? "bg-blue-50" : ""}`}>
                  <CsFileIcon className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{f.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatSize(f.size)} · {formatDate(f.modified)}</p>
                  </div>
                  {selected?.name === f.name && (
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {files.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
          <CsFileIcon className="w-5 h-5 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-gray-400">No .cs files found</p>
          <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
            Drop NT8 files into <code className="font-mono text-gray-400 bg-gray-100 px-1 rounded">Test/</code>, then click Refresh.
          </p>
        </div>
      )}

      {/* Analyzing */}
      {analyzing && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3.5 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-800">Analyzing…</p>
            <p className="text-[11px] text-blue-600 font-mono mt-0.5">{selected?.name}</p>
          </div>
        </div>
      )}

      {/* Compact summary after analysis */}
      {analysis && !analyzing && selected && (
        <CompactFileSummary
          analysis={analysis}
          filename={selected.name}
          onViewFileDetails={onViewFileDetails}
        />
      )}

      {/* Analyzer error */}
      {analyzerError && !analyzing && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5">
          <p className="text-xs font-semibold text-red-700 mb-1">Analysis error</p>
          <p className="text-[11px] text-gray-500 font-mono break-all">{analyzerError}</p>
        </div>
      )}

      {/* Hint */}
      {!selected && files.length > 0 && (
        <p className="text-[11px] text-gray-400">
          Select a file to begin NT8 structural analysis.
        </p>
      )}
      {!selected && files.length === 0 && (
        <p className="text-[11px] text-gray-400">
          Drop .cs files into <code className="font-mono text-gray-500 bg-gray-100 px-1 rounded">Test/</code> in Finder, then click Refresh.
        </p>
      )}
    </div>
  );
}
