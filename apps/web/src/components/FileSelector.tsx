"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AnalysisReport from "@/components/AnalysisReport";
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
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FileSelector() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/indicators");
      const data = await res.json();
      setFiles(data.files ?? []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = async (name: string) => {
    setOpen(false);
    setSelected(name);
    setAnalysis(null);
    setAnalyzerError(null);
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/analyze?file=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis as AnalysisResult);
      } else {
        setAnalyzerError(data.error || "Analysis failed.");
      }
    } catch {
      setAnalyzerError("Network error — is the dev server running?");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
        <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
        Scanning Test folder…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Dropdown trigger ── */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => files.length > 0 && setOpen(o => !o)}
          disabled={files.length === 0}
          className={[
            "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors",
            files.length === 0
              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              : open
              ? "border-blue-400 bg-white text-gray-900 shadow-sm"
              : "border-gray-300 bg-white text-gray-700 hover:border-blue-400",
          ].join(" ")}
        >
          <span className="flex items-center gap-2 truncate">
            {/* file icon */}
            <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="truncate">
              {files.length === 0
                ? "No .cs files in Test folder"
                : selected || `Select file… (${files.length} available)`}
            </span>
          </span>
          {files.length > 0 && (
            <svg className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          )}
        </button>

        {/* Dropdown list */}
        {open && files.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
            {files.map((f) => (
              <button
                key={f.name}
                onClick={() => handleSelect(f.name)}
                className={[
                  "w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-blue-50 transition-colors",
                  selected === f.name ? "bg-blue-50" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {selected === f.name && (
                    <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className="text-xs font-medium text-gray-800 truncate">{f.name}</span>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0 font-mono">{formatSize(f.size)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Refresh + hint */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          {files.length === 0
            ? <>Drop .cs files into <code className="font-mono">Test/</code> at the repo root, then refresh</>
            : <>{files.length} file{files.length !== 1 ? "s" : ""} in <code className="font-mono">Test/</code> · last modified {formatDate(files[0].modified)}</>
          }
        </p>
        <button
          onClick={fetchFiles}
          className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Analyzing spinner ── */}
      {analyzing && (
        <div className="flex items-center gap-2 py-2 text-xs text-gray-500">
          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Analyzing <span className="font-mono text-gray-700">{selected}</span>…
        </div>
      )}

      {/* ── Analysis result ── */}
      {analysis && !analyzing && (
        <div className="mt-1">
          <AnalysisReport result={analysis} originalFilename={selected} />
        </div>
      )}

      {/* ── Analyzer error ── */}
      {analyzerError && !analyzing && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-700 mb-0.5">Analysis error</p>
          <p className="text-xs text-gray-500 font-mono break-all">{analyzerError}</p>
        </div>
      )}
    </div>
  );
}
