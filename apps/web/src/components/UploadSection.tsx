"use client";

import FileSelector from "@/components/FileSelector";
import { IS_HOSTED_PREVIEW } from "@/lib/env";
import type { AnalysisResult } from "@/lib/types";

function scrollToLocalSetup() {
  document.getElementById("local-setup")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function HostedPreviewPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Run Locally to Enable File Selection</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              The Test Library reads from your local SSD. This hosted preview shows the interface only —
              real .cs file selection and analysis runs on your machine.
            </p>
          </div>
        </div>
        <ol className="mt-4 space-y-2">
          {[
            "Clone or open the repo locally",
            <>Drop .cs files into the <code className="font-mono text-xs bg-amber-100 px-1 rounded">Test/</code> folder</>,
            <>Set <code className="font-mono text-xs bg-amber-100 px-1 rounded">TOWER_UPLOADED_INDICATORS_DIR</code> in <code className="font-mono text-xs bg-amber-100 px-1 rounded">apps/web/.env.local</code></>,
            <>Run <code className="font-mono text-xs bg-amber-100 px-1 rounded">npm run dev</code> and open <code className="font-mono text-xs bg-amber-100 px-1 rounded">localhost:3000</code></>,
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-amber-800">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-200 text-amber-800 text-[9px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Test Library — local only</p>
            <p className="text-[10px] text-gray-300 mt-0.5">File selection requires a local dev server</p>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToLocalSetup}
        className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-xl py-2.5 transition-colors"
      >
        View local setup instructions ↓
      </button>
    </div>
  );
}

interface UploadSectionProps {
  onAnalysis?: (result: AnalysisResult | null, filename: string | null) => void;
  onViewFileDetails?: () => void;
}

export default function UploadSection({ onAnalysis, onViewFileDetails }: UploadSectionProps) {
  if (IS_HOSTED_PREVIEW) {
    return <HostedPreviewPanel />;
  }
  return <FileSelector onAnalysis={onAnalysis} onViewFileDetails={onViewFileDetails} />;
}
