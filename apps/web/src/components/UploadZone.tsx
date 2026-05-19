"use client";

import { useCallback, useRef, useState } from "react";
import type { UploadResponse } from "@/lib/types";

interface UploadZoneProps {
  onUploadComplete: (response: UploadResponse & { file_count?: number }) => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [message, setMessage] = useState("");
  const [filename, setFilename] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".cs")) {
        setUploadState("error");
        setMessage("Only .cs NinjaScript files are accepted.");
        return;
      }

      setUploadState("uploading");
      setFilename(file.name);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (data.success) {
          setUploadState("success");
          setMessage(`Saved as ${data.stored_filename}`);
          onUploadComplete(data);
        } else {
          setUploadState("error");
          setMessage(data.error || "Upload failed.");
        }
      } catch {
        setUploadState("error");
        setMessage("Network error — is the dev server running?");
      }
    },
    [onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setUploadState("idle");
      const file = e.dataTransfer.files[0];
      if (file) doUpload(file);
    },
    [doUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) doUpload(file);
      e.target.value = "";
    },
    [doUpload]
  );

  const reset = () => {
    setUploadState("idle");
    setMessage("");
    setFilename("");
  };

  const borderColor =
    uploadState === "dragging"
      ? "border-cyan-400"
      : uploadState === "success"
      ? "border-emerald-500/50"
      : uploadState === "error"
      ? "border-red-500/50"
      : "border-slate-700/60";

  const bgColor =
    uploadState === "dragging"
      ? "bg-cyan-500/5"
      : uploadState === "success"
      ? "bg-emerald-500/5"
      : uploadState === "error"
      ? "bg-red-500/5"
      : "bg-transparent";

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed ${borderColor} ${bgColor} transition-all duration-200 cursor-pointer group`}
      onDragOver={(e) => { e.preventDefault(); setUploadState("dragging"); }}
      onDragLeave={() => setUploadState(uploadState === "dragging" ? "idle" : uploadState)}
      onDrop={handleDrop}
      onClick={() => uploadState === "idle" || uploadState === "error" ? fileInputRef.current?.click() : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".cs"
        className="hidden"
        onChange={handleChange}
      />

      <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
        {uploadState === "idle" && (
          <>
            <div className="text-3xl opacity-60 group-hover:opacity-100 transition-opacity">📄</div>
            <div>
              <p className="text-sm font-semibold text-slate-300">
                Drop your NT8 <span className="text-cyan-400">.cs</span> file here
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Indicators and Strategies — click to browse
              </p>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-slate-700 border border-slate-800 rounded px-2 py-0.5">
              .CS FILES ONLY
            </span>
          </>
        )}

        {uploadState === "dragging" && (
          <>
            <div className="text-3xl">📂</div>
            <p className="text-sm font-semibold text-cyan-400">Drop to upload</p>
          </>
        )}

        {uploadState === "uploading" && (
          <>
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-300">Uploading and analyzing…</p>
            <p className="text-xs text-slate-600 font-mono">{filename}</p>
          </>
        )}

        {uploadState === "success" && (
          <>
            <div className="text-2xl">✅</div>
            <p className="text-sm font-semibold text-emerald-400">Uploaded successfully</p>
            <p className="text-xs text-slate-500 font-mono">{message}</p>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="text-[10px] font-semibold tracking-widest text-slate-500 hover:text-slate-300 border border-slate-800 rounded px-3 py-1 mt-1 transition-colors"
            >
              UPLOAD ANOTHER
            </button>
          </>
        )}

        {uploadState === "error" && (
          <>
            <div className="text-2xl">⚠️</div>
            <p className="text-sm font-semibold text-red-400">Upload failed</p>
            <p className="text-xs text-slate-400 max-w-sm">{message}</p>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="text-[10px] font-semibold tracking-widest text-slate-500 hover:text-slate-300 border border-slate-800 rounded px-3 py-1 mt-1 transition-colors"
            >
              TRY AGAIN
            </button>
          </>
        )}
      </div>
    </div>
  );
}
