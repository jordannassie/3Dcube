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

  const reset = () => { setUploadState("idle"); setMessage(""); setFilename(""); };

  const isDragging = uploadState === "dragging";
  const isUploading = uploadState === "uploading";
  const isSuccess = uploadState === "success";
  const isError = uploadState === "error";

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => (uploadState === "idle" || isError) && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setUploadState("dragging"); }}
        onDragLeave={() => !isUploading && !isSuccess && setUploadState("idle")}
        onDrop={handleDrop}
        className={[
          "relative rounded-xl border-2 border-dashed transition-all duration-150 cursor-pointer select-none",
          isDragging  ? "border-blue-400 bg-blue-50"  : "",
          isSuccess   ? "border-green-400 bg-green-50 cursor-default" : "",
          isError     ? "border-red-300 bg-red-50"    : "",
          isUploading ? "border-gray-300 bg-gray-50 cursor-wait" : "",
          !isDragging && !isSuccess && !isError && !isUploading ? "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50" : "",
        ].filter(Boolean).join(" ")}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".cs"
          className="hidden"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
          {!isUploading && !isSuccess && !isError && (
            <>
              {/* Upload icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDragging ? "bg-blue-100" : "bg-gray-100"}`}>
                <svg className={`w-6 h-6 ${isDragging ? "text-blue-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {isDragging ? "Drop to upload" : "Drop .cs file here"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">or choose a file from your computer</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Choose .cs File
              </button>
              <span className="text-xs text-gray-400">NinjaTrader 8 .cs files only</span>
            </>
          )}

          {isUploading && (
            <>
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-sm font-medium text-gray-700">Uploading and analyzing…</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono truncate max-w-xs">{filename}</p>
              </div>
            </>
          )}

          {isSuccess && (
            <>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700">File uploaded successfully</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{message}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); reset(); }} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                Upload another file
              </button>
            </>
          )}

          {isError && (
            <>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">Upload failed</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">{message}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); reset(); }} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
