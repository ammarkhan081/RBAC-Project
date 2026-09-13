"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Download,
  Filter,
  Shield,
  ChevronDown,
  Activity,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { getAuditLogs } from "@/lib/api";
import { AuditLogEntry } from "@/lib/types";

export default function AuditLogTable() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ALLOWED" | "BLOCKED">("ALL");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    let isMounted = true;
    setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

    async function loadLogs() {
      try {
        const data = await getAuditLogs();
        if (isMounted) setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  // RBAC Gate: Only C-Level users can view audit logs
  if (user?.role !== "C-Level") {
    return (
      <div className="min-h-screen bg-[#f3f5fa] p-6 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white border border-rose-200 rounded-[24px] text-center space-y-3 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
          <p className="text-slate-500 text-xs leading-relaxed">
            System audit logs contain immutable security telemetry.
            Your current session role (<strong className="text-slate-800">{user?.role || "Unauthenticated"}</strong>)
            does not have clearance to inspect these records.
          </p>
          <div className="pt-2 text-[11px] text-slate-400">
            Switch persona to <span className="text-slate-700 font-bold">admin (C-Level)</span> in the navigation bar.
          </div>
        </div>
      </div>
    );
  }

  const allowedCount = logs.filter((l) => l.authorized).length;
  const blockedCount = logs.filter((l) => !l.authorized).length;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.denial_reason && log.denial_reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ALLOWED" && log.authorized) ||
      (statusFilter === "BLOCKED" && !log.authorized);

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["ID", "Timestamp", "Username", "Role", "Query", "Route", "Authorized", "Denial Reason"];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.username}"`,
      `"${l.role}"`,
      `"${l.query.replace(/"/g, '""')}"`,
      `"${l.route_taken}"`,
      l.authorized ? "ALLOWED" : "BLOCKED",
      `"${(l.denial_reason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finsight_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen w-full bg-[#f1f3f8] p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center relative overflow-x-hidden">
      {/* Ambient pastel glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl my-auto space-y-6 relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
              GOVERNANCE & SECURITY AUDIT
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Real-Time Audit Log & Governance Stream
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Immutable trace of all queries, route decisions, RBAC boundary checks, and authorization denials.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 border border-slate-200 shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export CSV</span>
            </button>

            <div className="text-right hidden sm:block">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white text-slate-800 border border-slate-200 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Live Audit Stream</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
              {currentTime && (
                <span className="block text-[11px] text-slate-400 mt-1 font-mono">
                  Last verified: {currentTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3 Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Queries */}
          <div
            onClick={() => setStatusFilter("ALL")}
            className="bg-white border border-blue-100/80 hover:border-blue-300 p-6 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200/90 shadow-2xs">
                  All Records
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-4">
                TOTAL TELEMETRY EVENTS
              </span>
              <p className="text-4xl font-black text-slate-900 tracking-tight mt-1">
                {logs.length}
              </p>
              <div className="w-full h-1 bg-blue-500 rounded-full mt-3 mb-2" />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>All recorded queries & evaluations</span>
            </div>
          </div>

          {/* Card 2: Authorized Queries */}
          <div
            onClick={() => setStatusFilter("ALLOWED")}
            className="bg-white border border-emerald-100/80 hover:border-emerald-300 p-6 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
                  Authorized
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-4">
                AUTHORIZED CLEARANCE
              </span>
              <p className="text-4xl font-black text-slate-900 tracking-tight mt-1">
                {allowedCount}
              </p>
              <div className="w-full h-1 bg-emerald-500 rounded-full mt-3 mb-2" />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>RBAC policy cleared requests</span>
            </div>
          </div>

          {/* Card 3: Intercepted Denials */}
          <div
            onClick={() => setStatusFilter("BLOCKED")}
            className="bg-white border border-rose-100/80 hover:border-rose-300 p-6 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-rose-700 bg-rose-50/80 px-3 py-1 rounded-full border border-rose-200/80 shadow-2xs">
                  Enforced Interceptions
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-4">
                SECURITY INTERCEPTIONS
              </span>
              <p className="text-4xl font-black text-slate-900 tracking-tight mt-1">
                {blockedCount}
              </p>
              <div className="w-full h-1 bg-rose-500 rounded-full mt-3 mb-2" />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Zero-leakage perimeter blocks</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white border border-slate-200/90 p-3.5 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by user, role, query, or denial keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400 mr-1 flex items-center gap-1 font-bold text-[11px]">
              <Filter className="w-3.5 h-3.5" />
              STATUS:
            </span>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                statusFilter === "ALL"
                  ? "bg-[#16213e] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter("ALLOWED")}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                statusFilter === "ALLOWED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100/70"
              }`}
            >
              Allowed ({allowedCount})
            </button>
            <button
              onClick={() => setStatusFilter("BLOCKED")}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                statusFilter === "BLOCKED"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100/70"
              }`}
            >
              Blocked ({blockedCount})
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        {loading ? (
          <div className="bg-white border border-slate-200/90 rounded-[24px] p-16 text-center space-y-3 shadow-sm flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-bold text-slate-500">Loading audit log traces...</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-[24px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-md transition">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-3.5 whitespace-nowrap">Timestamp</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">User</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Role</th>
                    <th className="px-5 py-3.5">Query Executed</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Engine / Route</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                    <th className="px-5 py-3.5">Denial Reason / Audit Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">
                        No audit entries matched your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                          {log.username}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px]">
                            {log.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 max-w-xs font-mono text-slate-800 text-xs">
                          {log.query}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              log.route_taken === "SQL"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : log.route_taken === "RAG"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : log.route_taken === "HYBRID"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {log.route_taken}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {log.authorized ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ALLOWED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                              <XCircle className="w-3 h-3 text-rose-600" /> BLOCKED
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs max-w-sm">
                          {log.denial_reason ? (
                            <span className="text-rose-600 font-medium italic">{log.denial_reason}</span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">Authorized RBAC clearance</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
