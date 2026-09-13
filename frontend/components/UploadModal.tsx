"use client";

import React, { useState } from "react";
import {
  Upload,
  CheckCircle2,
  FileCode,
  AlertTriangle,
  X,
} from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (filename: string, department: string) => void;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [department, setDepartment] = useState("Finance");
  const [uploading, setUploading] = useState(false);
  const [sanitizationWarning, setSanitizationWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setSuccess(false);

    if (file) {
      // Simulate prompt injection sanitization check
      const name = file.name.toLowerCase();
      if (name.includes("prompt") || name.includes("jailbreak") || name.includes("override") || name.includes("test")) {
        setSanitizationWarning("Warning: 1 suspicious instruction pattern detected and sanitized before vectorization.");
      } else {
        setSanitizationWarning(null);
      }
    } else {
      setSanitizationWarning(null);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
      if (onUploadSuccess) onUploadSuccess(selectedFile.name, department);
      setTimeout(() => {
        setSuccess(false);
        setSelectedFile(null);
        setSanitizationWarning(null);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            Ingest Knowledge Document
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Embed internal reports into ChromaDB vector store with role-scoped partitions.
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Target Scope Partition
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Finance">Finance Scope</option>
              <option value="Marketing">Marketing Scope</option>
              <option value="HR">HR Scope</option>
              <option value="Engineering">Engineering Scope</option>
              <option value="Executive">Executive / C-Level Scope</option>
              <option value="General">General Corporate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Document (.csv, .md, .txt, .pdf)
            </label>
            <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center bg-slate-950/40 transition flex flex-col items-center justify-center">
              <FileCode className="w-8 h-8 text-indigo-400/60 mb-2" />
              <input
                type="file"
                id="modal-file-upload"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                accept=".csv,.md,.txt,.pdf"
                className="hidden"
              />
              <label
                htmlFor="modal-file-upload"
                className="cursor-pointer text-xs font-medium text-indigo-400 hover:underline"
              >
                {selectedFile ? selectedFile.name : "Choose document to upload"}
              </label>
              <p className="text-[10px] text-slate-500 mt-1">Supported formats: CSV, Markdown, PDF, TXT</p>
            </div>
          </div>

          {sanitizationWarning && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{sanitizationWarning}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Document vectorized and partitioned into {department} store.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            {uploading ? "Analyzing & Vectorizing..." : "Start Ingestion"}
          </button>
        </form>
      </div>
    </div>
  );
}
