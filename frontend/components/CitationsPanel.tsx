"use client";

import React, { useState } from "react";
import {
  X,
  Database,
  FileText,
  CheckCircle2,
  Table as TableIcon,
  Code,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { ChatMessage, CitationItem } from "@/lib/types";

interface CitationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  message: ChatMessage | null;
}

export default function CitationsPanel({ isOpen, onClose, message }: CitationsPanelProps) {
  const [activeTab, setActiveTab] = useState<"all" | "sql" | "doc">("all");

  if (!isOpen || !message) return null;

  const citations: CitationItem[] = message.citations || [];
  const sqlCitations = citations.filter((c) => c.type === "sql");
  const docCitations = citations.filter((c) => c.type === "document");

  const displayedCitations =
    activeTab === "sql" ? sqlCitations : activeTab === "doc" ? docCitations : citations;

  return (
    <aside
      aria-label="Provenance & Citations Panel"
      className="w-full bg-white border border-slate-200/90 rounded-[32px] flex flex-col h-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 relative z-30"
    >
      {/* =========================================================================
          HEADER (Clean White / Frosted Light, Simple & Attractive)
          ========================================================================= */}
      <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Provenance & Citations
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Verified ground-truth sources for this response
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200/70 transition cursor-pointer"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* =========================================================================
          FILTER TABS (Simple, Clear & Intuitive)
          ========================================================================= */}
      <div className="px-5 py-3 border-b border-slate-200/70 bg-white flex items-center gap-2 text-xs shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-xl transition font-semibold cursor-pointer ${
            activeTab === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
          }`}
        >
          All Sources ({citations.length})
        </button>

        {sqlCitations.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("sql")}
            className={`px-3.5 py-1.5 rounded-xl transition font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "sql"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>DuckDB SQL ({sqlCitations.length})</span>
          </button>
        )}

        {docCitations.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("doc")}
            className={`px-3.5 py-1.5 rounded-xl transition font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === "doc"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>Documents ({docCitations.length})</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          CITATIONS CONTENT STREAM (Attractive Light Cards, Clear & Easy to Understand)
          ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {/* Cross-Modal Reconciliation Card (For Hybrid Answers) */}
        {message.reconciliation && (
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] border border-[#dce1e9] shadow-2xs space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                Cross-Modal Reconciliation
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
              {message.reconciliation}
            </p>
          </div>
        )}

        {displayedCitations.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Layers className="w-8 h-8 mx-auto text-slate-300 opacity-60" />
            <p className="font-semibold text-slate-600">No citations attached to this query.</p>
            <p className="text-[11px]">Direct general responses do not require ground-truth references.</p>
          </div>
        ) : (
          displayedCitations.map((cite, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] border border-[#dce1e9] rounded-2xl p-4.5 space-y-3 shadow-2xs"
            >
              {cite.type === "sql" ? (
                <>
                  {/* SQL Citation Header */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-slate-900 border border-slate-300 text-xs font-bold shadow-2xs">
                      <Database className="w-3.5 h-3.5 text-emerald-600" />
                      <span>DuckDB View</span>
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                      {cite.view || "v_authorized_records"}
                    </span>
                  </div>

                  {/* SQL Query Code Block */}
                  {cite.query && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        <Code className="w-3 h-3 text-slate-400" />
                        <span>Enforced SQL Query</span>
                      </div>
                      <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto shadow-xs border border-slate-800">
                        <code>{cite.query}</code>
                      </pre>
                    </div>
                  )}

                  {/* Retrieved Table Rows */}
                  {cite.result && cite.result.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <TableIcon className="w-3 h-3 text-slate-400" />
                          <span>Retrieved Records ({cite.result.length})</span>
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          Role Filtered
                        </span>
                      </div>
                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                            <tr>
                              {Object.keys(cite.result[0]).map((col) => (
                                <th key={col} className="px-3 py-2 whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-800 font-mono text-[11px]">
                            {cite.result.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/80">
                                {Object.values(row).map((val, cIdx) => (
                                  <td key={cIdx} className="px-3 py-2 whitespace-nowrap">
                                    {String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Document Citation Header */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-slate-900 border border-slate-300 text-xs font-bold shadow-2xs">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Document Source</span>
                    </span>
                    {cite.department && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                        {cite.department} Scope
                      </span>
                    )}
                  </div>

                  {/* Document Title & Section */}
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{cite.source || "knowledge_document.md"}</p>
                    {cite.section && <p className="text-[11px] text-slate-500 font-medium">{cite.section}</p>}
                  </div>

                  {/* Quoted Excerpt */}
                  {cite.passage && (
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 border-l-4 border-l-indigo-600 text-xs text-slate-700 leading-relaxed font-sans shadow-2xs">
                      &ldquo;{cite.passage}&rdquo;
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* =========================================================================
          FOOTER (Simple & Trust-Building)
          ========================================================================= */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Audit-Verifiable Source</span>
        </span>
        <span className="font-semibold text-slate-400">Deterministic Isolation</span>
      </div>
    </aside>
  );
}
