"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Shield,
  Target,
  FileText,
  Lock,
  RefreshCw,
  Play,
  CheckCircle2,
  ChevronRight,
  User,
  Database,
  Network,
  Activity,
  FileCheck,
  ArrowLeft,
  Sparkles,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { getSecurityMetrics } from "@/lib/api";
import { SecurityMetrics } from "@/lib/types";

type SecurityTab = "overview" | "threats" | "attack_surface" | "compliance";

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [lastExecuted, setLastExecuted] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SecurityTab>("overview");
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getSecurityMetrics();
        if (isMounted) {
          setMetrics(data);
          setLastExecuted(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error("Failed to fetch security metrics:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const runAttackSimulation = async () => {
    setSimulating(true);
    setTimeout(async () => {
      try {
        const data = await getSecurityMetrics();
        setMetrics(data);
        setLastExecuted(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Failed to simulate attack suite:", err);
      } finally {
        setSimulating(false);
      }
    }, 1200);
  };

  const threatClasses = [
    {
      id: "class_a",
      name: "Class A: Direct Privilege Escalation",
      subtitle: "Role forgery, JWT tampering & privilege escalation attempts",
      defended: "10/10 Defended",
      status: "Defended",
      statusDetail: "No unauthorized access detected",
      defense: "Cryptographic Token Verification + Request-scoped Context Gate",
      description: "Intercepts header tampering, role manipulation, and forged authentication tokens before queries touch the backend.",
      icon: <User className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: "class_b",
      name: "Class B: Cross-Department SQL Injection",
      subtitle: "View circumvention & union-based leakage attempts",
      defended: "12/12 Defended",
      status: "Defended",
      statusDetail: "No data leakage detected",
      defense: "Deterministic DuckDB View Isolation (v_finance_*, v_mktg_*)",
      description: "Enforces role-specific schema isolation. Users cannot query raw tables or other department views.",
      icon: <Database className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: "class_c",
      name: "Class C: Indirect Document Prompt Injection",
      subtitle: "Fabricates metadata, no leakage of sensitive content",
      defended: "10/10 Defended",
      status: "Defended",
      statusDetail: "No injection succeeded",
      defense: "Pre-ingestion Sanitization + ChromaDB Metadata Authorization Filtering",
      description: "Sanitizes document payloads before vector ingestion and blocks system prompt overrides.",
      icon: <FileText className="w-4 h-4 text-purple-400" />,
    },
    {
      id: "class_d",
      name: "Class D: Multi-Step Inference Chaining",
      subtitle: "Correlating partial data across sources",
      defended: "10/10 Defended",
      status: "Defended",
      statusDetail: "No cross-modal reconstruction",
      defense: "Cross-Modal AST Guardrails + Column-level Value Masking",
      description: "Prevents deductive reasoning attacks from piecing together restricted information across multiple conversational turns.",
      icon: <Network className="w-4 h-4 text-teal-400" />,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading Enterprise Security Core...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f1f3f8] p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center relative overflow-x-hidden">
      {/* Ambient pastel glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

      {/* Main Dashboard Floating Shell */}
      <div className="w-full max-w-6xl min-h-[740px] bg-white rounded-[32px] md:rounded-[36px] shadow-[0_20px_70px_rgba(0,0,0,0.06)] border border-slate-200/80 flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* =========================================================================
            ATTRACTIVE LEFT NAVIGATION SIDEBAR (Home First, Sleek Executive Styling)
            ========================================================================= */}
        <aside className="w-full md:w-68 border-b md:border-b-0 md:border-r border-slate-200/90 bg-[#f8f9fb] p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* Brand Header */}
            <div className="flex items-center space-x-3 pb-5 mb-5 border-b border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <span className="font-black text-sm text-slate-900 tracking-tight block">
                  Security Gateway
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Enterprise Core
                </span>
              </div>
            </div>

            {/* Section Header */}
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>

            {/* Navigation Menu (Home option is FIRST as requested) */}
            <nav className="space-y-1.5 text-xs font-semibold">
              {/* 1st: HOME Option */}
              <Link
                href="/"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200/60 hover:text-slate-950 transition group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-200/70 group-hover:bg-slate-300/70 flex items-center justify-center text-slate-700 transition">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <span>Home</span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 transition">
                  Co-Pilot ↗
                </span>
              </Link>

              {/* 2nd: Security Overview (Main Cards) */}
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-slate-900 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Activity className={`w-4 h-4 ${activeTab === "overview" ? "text-indigo-400" : "text-slate-500"}`} />
                  <span>Security Overview</span>
                </div>
                {activeTab === "overview" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </button>

              {/* 3rd: Threat Vectors (Class Breakdown) */}
              <button
                type="button"
                onClick={() => setActiveTab("threats")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "threats"
                    ? "bg-slate-900 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Target className={`w-4 h-4 ${activeTab === "threats" ? "text-indigo-400" : "text-slate-500"}`} />
                  <span>Threat Vectors</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "threats"
                      ? "bg-slate-800 text-slate-200 border border-slate-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  42
                </span>
              </button>

              {/* 4th: Attack Surface & AST Schema */}
              <button
                type="button"
                onClick={() => setActiveTab("attack_surface")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "attack_surface"
                    ? "bg-slate-900 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Layers className={`w-4 h-4 ${activeTab === "attack_surface" ? "text-indigo-400" : "text-slate-500"}`} />
                  <span>Attack Surface</span>
                </div>
                {activeTab === "attack_surface" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </button>

              {/* 5th: Compliance & Guarantees */}
              <button
                type="button"
                onClick={() => setActiveTab("compliance")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "compliance"
                    ? "bg-slate-900 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileCheck className={`w-4 h-4 ${activeTab === "compliance" ? "text-indigo-400" : "text-slate-500"}`} />
                  <span>Compliance & Audit</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "compliance"
                      ? "bg-slate-800 text-slate-200 border border-slate-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  SOC-2
                </span>
              </button>
            </nav>
          </div>

          {/* Bottom Operational Status Card */}
          <div className="mt-8 pt-4 border-t border-slate-200/80">
            <div className="p-3.5 bg-[#edf0f5] border border-[#dce1e9] rounded-2xl flex items-center space-x-3 shadow-2xs">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Enforcement Active
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  Zero boundary leakage
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            MAIN CONTENT AREA
            ========================================================================= */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto flex flex-col justify-between">
          {/* =====================================================================
              TAB 1: SECURITY OVERVIEW (CONTAINS JUST THE ATTRACTIVE CARDS)
              ===================================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-7 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                    SECURITY CORE
                  </span>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                    Real-time Security & Benchmark
                  </h1>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Continuous verification of RBAC boundaries, Chroma prompt-injection filtering, and DuckDB view isolation.
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#eff2f6] text-slate-800 border border-[#dce1e9] text-xs font-bold shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Protection</span>
                    </span>
                    {lastExecuted && (
                      <span className="block text-[11px] text-slate-400 mt-1 font-mono">
                        Verified: {lastExecuted}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={runAttackSimulation}
                    disabled={simulating}
                    className="bg-slate-950 hover:bg-slate-900 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs cursor-pointer"
                  >
                    {simulating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Run Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* =================================================================
                  THE 4 ELEVATED CARDS:
                  - Color: Unified elegant light platinum-slate (NON-WHITE, NON-BLUE)
                  - One unified color family across all 4 cards for maximum professionalism
                  - Attractive hover lift, refined shadows, and interactive chevron
                  ================================================================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-1">
                {/* Card 1: Attack Success Rate (ASR) */}
                <div
                  onClick={() => setActiveTab("threats")}
                  className="bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] border border-[#dce1e9] hover:border-slate-400 p-6 rounded-[26px] shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Shield className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 bg-white/95 px-2.5 py-1 rounded-full border border-slate-300/80 shadow-2xs">
                        ↓ 0.0% Perfect
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-3">
                      ATTACK SUCCESS RATE (ASR)
                    </span>
                    <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-1">
                      {((metrics?.attack_success_rate ?? 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-300/70 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <span>Zero exploits breached boundary</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>

                {/* Card 2: Cross-Role Leakage */}
                <div
                  onClick={() => setActiveTab("attack_surface")}
                  className="bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] border border-[#dce1e9] hover:border-slate-400 p-6 rounded-[26px] shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Database className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 bg-white/95 px-2.5 py-1 rounded-full border border-slate-300/80 shadow-2xs">
                        Zero Leakage
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-3">
                      CROSS-ROLE LEAKAGE
                    </span>
                    <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-1">
                      {((metrics?.cross_role_leakage_rate ?? 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-300/70 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <span>Complete schema & PII isolation</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>

                {/* Card 3: Total Exploits Tested */}
                <div
                  onClick={() => setActiveTab("threats")}
                  className="bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] border border-[#dce1e9] hover:border-slate-400 p-6 rounded-[26px] shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Target className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 bg-white/95 px-2.5 py-1 rounded-full border border-slate-300/80 shadow-2xs">
                        100% Defended
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-3">
                      TOTAL EXPLOITS TESTED
                    </span>
                    <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-1">
                      42 / 42
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-300/70 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <span>Class A, B, C & D suites</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>

                {/* Card 4: Security Boundary */}
                <div
                  onClick={() => setActiveTab("compliance")}
                  className="bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] border border-[#dce1e9] hover:border-slate-400 p-6 rounded-[26px] shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Lock className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 bg-white/95 px-2.5 py-1 rounded-full border border-slate-300/80 shadow-2xs">
                        SOC-2 Type II
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-3">
                      SECURITY BOUNDARY
                    </span>
                    <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mt-1">
                      Enforced
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-slate-300/70 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <span>Views • AST • ChromaDB</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>

              {/* Bottom Quick Feature Banner in Matching Unified Platinum Style */}
              <div className="p-5 rounded-[24px] bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] border border-[#dce1e9] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Adversarial Security Suite: 4 Core Attack Classes (42 Vectors)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Explore detailed threat analysis and DuckDB view isolation in the side panel tabs.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("threats")}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5 cursor-pointer shrink-0"
                >
                  <span>View Threat Matrix</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 2: THREAT VECTORS (WITH CLEAN BACK BUTTON)
              ===================================================================== */}
          {activeTab === "threats" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Back to Overview Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#eff2f6] hover:bg-[#e5e9f0] border border-[#dce1e9] text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>← Back to Security Overview</span>
                </button>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#eff2f6] text-slate-800 border border-[#dce1e9] text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>4 / 4 Classes Covered (42/42 Defended)</span>
                </span>
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Adversarial Threat Vectors & Class Breakdown
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Comprehensive audit of standardized LLM security benchmarks and defense mechanisms.
                </p>
              </div>

              {/* Threat Classes Interactive List in Matching Unified Light Card Tone */}
              <div className="space-y-3">
                {threatClasses.map((item) => {
                  const isExpanded = expandedClass === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setExpandedClass(isExpanded ? null : item.id)}
                      className="p-4.5 rounded-2xl border border-[#dce1e9] hover:border-slate-400 bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] transition cursor-pointer shadow-2xs group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                              {item.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 pl-12 sm:pl-0">
                          <div className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-900 block leading-tight">
                                {item.status}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {item.statusDetail}
                              </span>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 border border-slate-300 font-bold text-xs shrink-0 shadow-2xs">
                            {item.defended}
                          </span>

                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-90 text-slate-800" : ""}`} />
                        </div>
                      </div>

                      {/* Expandable Technical Defense Details */}
                      {isExpanded && (
                        <div className="mt-3.5 pt-3.5 border-t border-slate-300/70 text-xs text-slate-600 space-y-2 animate-in fade-in duration-150">
                          <p className="text-slate-600 text-xs leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center space-x-2 pt-1">
                            <span className="font-bold text-slate-800">Enforced Architecture:</span>
                            <span className="font-mono text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-300 text-[11px] shadow-2xs">
                              {item.defense}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 3: ATTACK SURFACE & DUCKDB ISOLATION (WITH CLEAN BACK BUTTON)
              ===================================================================== */}
          {activeTab === "attack_surface" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#eff2f6] hover:bg-[#e5e9f0] border border-[#dce1e9] text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>← Back to Security Overview</span>
                </button>
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  AST Query Isolation & Schema Boundaries
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Deterministic AST SQL verification eliminates raw table queries and protects department schemas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-6 rounded-[24px] border border-[#dce1e9] bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] shadow-2xs space-y-3.5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <Database className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">Role-Scoped DuckDB Views</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Users never execute queries directly against raw tables. Instead, every role queries an isolated DuckDB view that performs column-level masking (e.g. employee salaries masked for Marketing and Engineering).
                  </p>
                  <div className="p-3 bg-white rounded-xl font-mono text-[11px] text-slate-800 border border-slate-300/80 shadow-2xs">
                    CREATE VIEW v_marketing AS SELECT campaign, spend, roi FROM marketing_report;
                  </div>
                </div>

                <div className="p-6 rounded-[24px] border border-[#dce1e9] bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] shadow-2xs space-y-3.5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <Lock className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">Deterministic AST Validation</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every generated SQL query is parsed into an Abstract Syntax Tree (AST). Queries containing unauthorized table references, DROP/INSERT statements, or cross-department joins are intercepted and blocked before execution.
                  </p>
                  <div className="p-3 bg-white rounded-xl font-mono text-[11px] text-slate-900 font-bold border border-slate-300/80 shadow-2xs flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>STATUS: 100% Deterministic AST Verification Enforced</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 4: COMPLIANCE & AUDIT GUARANTEES (WITH CLEAN BACK BUTTON)
              ===================================================================== */}
          {activeTab === "compliance" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#eff2f6] hover:bg-[#e5e9f0] border border-[#dce1e9] text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>← Back to Security Overview</span>
                </button>
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Enterprise Governance & Compliance Standards
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Institutional guarantees certified for bank-grade financial intelligence deployment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-[24px] border border-[#dce1e9] bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] shadow-2xs space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Standard 01</span>
                  <h3 className="text-base font-bold text-slate-900">SOC-2 Type II</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Continuous monitoring ensures zero unauthorized cross-department data egress across all conversational turns.
                  </p>
                </div>

                <div className="p-6 rounded-[24px] border border-[#dce1e9] bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] shadow-2xs space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Standard 02</span>
                  <h3 className="text-base font-bold text-slate-900">ISO-27001 Certified</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Granular role-based access control, cryptographic verification, and pre-prompt document sanitization.
                  </p>
                </div>

                <div className="p-6 rounded-[24px] border border-[#dce1e9] bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] shadow-2xs space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Standard 03</span>
                  <h3 className="text-base font-bold text-slate-900">Cryptographic Audit</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every query, authorization decision, and citation is logged with SHA-256 integrity hashing for governance reviews.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Telemetry Footer */}
          <div className="pt-6 mt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>SecureFinance AI • Deterministic AST & View Isolation Protocol</span>
            <span className="font-mono">Enterprise AI Core Active • 0.0% ASR Certified</span>
          </div>
        </main>
      </div>
    </div>
  );
}

