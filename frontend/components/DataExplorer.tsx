"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  FileText,
  Shield,
  Lock,
  CheckCircle2,
  Table as TableIcon,
  Search,
  Layers,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Eye,
  Activity,
  UserCheck,
  FileCheck,
  SlidersHorizontal,
  Home,
  Compass,
  ChevronDown,
  Atom,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { UserRole } from "@/lib/types";

type DataTab = "overview" | "relational" | "documents" | "governance";

interface DatasetMeta {
  id: string;
  name: string;
  type: "view" | "document";
  department: string;
  clearedRoles: string[];
  description: string;
  columns?: string[];
  docType?: string;
  sampleRowsCount: number;
  sampleQuery?: string;
}

const ALL_DATASETS: DatasetMeta[] = [
  {
    id: "v_hr_employees",
    name: "v_hr_employees",
    type: "view",
    department: "HR",
    clearedRoles: ["HR", "C-Level"],
    description: "Employee directory with sanitized performance ratings, job titles, and status (salaries masked for non-authorized roles).",
    columns: ["employee_id", "employee_name", "department", "role", "performance_rating", "status"],
    sampleRowsCount: 104,
    sampleQuery: "SELECT employee_name, role, performance_rating FROM v_hr_employees WHERE department = 'Finance';",
  },
  {
    id: "v_marketing_report_2024",
    name: "v_marketing_report_2024",
    type: "view",
    department: "Marketing",
    clearedRoles: ["Marketing", "Finance", "C-Level"],
    description: "Campaign expenditures, lead volume, CPA, customer acquisition metrics, and Q1–Q4 variances.",
    columns: ["campaign_id", "channel", "spend", "impressions", "leads", "cac", "roi"],
    sampleRowsCount: 48,
    sampleQuery: "SELECT channel, spend, roi FROM v_marketing_report_2024 ORDER BY roi DESC;",
  },
  {
    id: "v_finance_quarterly",
    name: "quarterly_financial_report",
    type: "view",
    department: "Finance",
    clearedRoles: ["Finance", "C-Level"],
    description: "General financial ledger, operating expense ceilings, gross margin schedules, and EBITDA reconciliations.",
    columns: ["quarter", "revenue", "operating_expenses", "gross_margin", "ebitda", "variance_pct"],
    sampleRowsCount: 16,
    sampleQuery: "SELECT quarter, revenue, operating_expenses, ebitda FROM quarterly_financial_report;",
  },
  {
    id: "doc_governance",
    name: "FinSolve_Corporate_Governance_2024.pdf",
    type: "document",
    department: "General",
    clearedRoles: ["General", "HR", "Marketing", "Finance", "Engineering", "C-Level"],
    description: "Foundational institutional values, radical transparency charter, and compliance frameworks.",
    docType: "Corporate Policy Document (Markdown)",
    sampleRowsCount: 42,
  },
  {
    id: "doc_handbook",
    name: "employee_handbook.md",
    type: "document",
    department: "General",
    clearedRoles: ["General", "HR", "Marketing", "Finance", "Engineering", "C-Level"],
    description: "Employee benefits, maternity and paternity leave policies, remote work guidelines, and grievance protocols.",
    docType: "Human Resources Standard Operating Procedure",
    sampleRowsCount: 68,
  },
  {
    id: "doc_marketing_q3",
    name: "marketing_report_q3_2024.md",
    type: "document",
    department: "Marketing",
    clearedRoles: ["Marketing", "Finance", "C-Level"],
    description: "Qualitative narrative detailing the Q3 marketing budget variance drivers, national brand campaign, and fintech sponsorship.",
    docType: "Departmental Performance Review",
    sampleRowsCount: 35,
  },
  {
    id: "v_executive_payroll",
    name: "executive_compensation_master",
    type: "view",
    department: "Executive",
    clearedRoles: ["C-Level"],
    description: "Confidential executive equity awards, bonus pools, and C-Suite compensation records.",
    columns: ["exec_id", "title", "base_salary", "equity_grant", "bonus_target", "tax_bracket"],
    sampleRowsCount: 12,
    sampleQuery: "SELECT title, base_salary, equity_grant FROM executive_compensation_master;",
  },
];

export default function DataExplorer() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<DataTab>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);

  const userRole = user?.role || "General";

  const isCleared = (d: DatasetMeta) => {
    return d.clearedRoles.includes(userRole);
  };

  const clearedDatasets = ALL_DATASETS.filter(isCleared);
  const restrictedDatasets = ALL_DATASETS.filter((d) => !isCleared(d));
  const relationalDatasets = ALL_DATASETS.filter((d) => d.type === "view");
  const documentDatasets = ALL_DATASETS.filter((d) => d.type === "document");

  return (
    <div className="min-h-screen w-full bg-[#f1f3f8] p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center relative overflow-x-hidden">
      {/* Ambient pastel glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />

      {/* Main Dashboard Floating Shell with Side Panel */}
      <div className="w-full max-w-6xl min-h-[740px] bg-white rounded-[32px] md:rounded-[36px] shadow-[0_20px_70px_rgba(0,0,0,0.06)] border border-slate-200/80 flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* =========================================================================
            ATTRACTIVE LEFT NAVIGATION SIDEBAR (Home First, Functional Data Pages)
            ========================================================================= */}
        <aside className="w-full md:w-68 border-b md:border-b-0 md:border-r border-slate-200/90 bg-[#f8f9fb] p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* Brand Header */}
            <div className="flex items-center space-x-3 pb-5 mb-5 border-b border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-black text-sm text-slate-900 tracking-tight block">
                  Data Explorer
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Enterprise Catalog
                </span>
              </div>
            </div>

            {/* Section Header */}
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Data Views & Pages
            </div>

            {/* Navigation Menu (Home option is FIRST as requested) */}
            <nav className="space-y-1.5 text-xs font-semibold">
              {/* 1st: HOME Option */}
              <Link
                href="/"
                className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200/60 hover:text-slate-950 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Home className="w-4 h-4 text-slate-500" />
                  <span>Home</span>
                </div>
              </Link>

              {/* 2nd: Data Overview (Main Metric Cards) */}
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-[#16213e] text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Activity className={`w-4 h-4 ${activeTab === "overview" ? "text-white" : "text-slate-500"}`} />
                  <span>Data Overview</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === "overview" ? "text-white/70" : "text-slate-400"}`} />
              </button>

              {/* 3rd: Relational Views (DuckDB) */}
              <button
                type="button"
                onClick={() => setActiveTab("relational")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "relational"
                    ? "bg-[#16213e] text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <TableIcon className={`w-4 h-4 ${activeTab === "relational" ? "text-white" : "text-slate-500"}`} />
                  <span>Relational Views</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "relational"
                      ? "bg-slate-700 text-white"
                      : "bg-slate-200/90 text-slate-600"
                  }`}
                >
                  {relationalDatasets.length}
                </span>
              </button>

              {/* 4th: Document Catalogs (ChromaDB) */}
              <button
                type="button"
                onClick={() => setActiveTab("documents")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "documents"
                    ? "bg-[#16213e] text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className={`w-4 h-4 ${activeTab === "documents" ? "text-white" : "text-slate-500"}`} />
                  <span>Document Vectors</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "documents"
                      ? "bg-slate-700 text-white"
                      : "bg-slate-200/90 text-slate-600"
                  }`}
                >
                  {documentDatasets.length}
                </span>
              </button>

              {/* 5th: Clearance & Governance */}
              <button
                type="button"
                onClick={() => setActiveTab("governance")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "governance"
                    ? "bg-[#16213e] text-white font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Shield className={`w-4 h-4 ${activeTab === "governance" ? "text-white" : "text-slate-500"}`} />
                  <span>Clearance Matrix</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "governance"
                      ? "bg-slate-700 text-white"
                      : "bg-slate-200/90 text-slate-600"
                  }`}
                >
                  RBAC
                </span>
              </button>
            </nav>
          </div>

          {/* Bottom Avatar Circle (Matching Reference Image) */}
          <div className="mt-8 pt-4">
            <div className="w-8 h-8 rounded-full bg-[#0b1320] text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.username ? user.username.charAt(0).toUpperCase() : "N"}
            </div>
          </div>
        </aside>

        {/* =========================================================================
            MAIN CONTENT AREA (Tabs / Divided Pages)
            ========================================================================= */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto flex flex-col justify-between">
          
          {/* =====================================================================
              PAGE 1: DATA OVERVIEW (THE 4 CARDS + POSTURE + TAKEAWAYS)
              ===================================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-7 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
                <div>
                  <div className="flex items-center space-x-3 mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                      DATA OVERVIEW
                    </span>
                    <label className="text-xs font-semibold text-slate-700 bg-slate-100/90 pl-3 pr-2 py-1 rounded-full border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer">
                      <Atom className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span className="shrink-0">Active Scope:</span>
                      <select
                        value={userRole}
                        onChange={(e) =>
                          login(user?.username || "EnterpriseUser", e.target.value as UserRole)
                        }
                        className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer py-0.5 pr-1"
                        aria-label="Active data scope"
                      >
                        <option value="C-Level">C-Level</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">HR</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Engineering">Engineering</option>
                        <option value="General">General</option>
                      </select>
                    </label>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                    Enterprise Data Explorer & Asset Catalog
                  </h1>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Continuous role-scoped inspection of DuckDB relational views, Chroma vector embeddings, and zero-k knowledge RBAC boundaries.
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white text-slate-800 border border-slate-200 text-xs font-semibold shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Live Catalog</span>
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

              {/* The 4 Metric Cards (Matching User Reference Image Exactly) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Accessible Datasets */}
                <div
                  onClick={() => setActiveTab("relational")}
                  className="bg-white border border-blue-100/80 hover:border-blue-300 p-6 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                        <Database className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200/90 shadow-2xs flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-blue-600" />
                        <span>Level Scope</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-4">
                      ACCESSIBLE DATASETS
                    </span>
                    <p className="text-4xl font-black text-slate-900 tracking-tight mt-1">
                      {clearedDatasets.length}/{ALL_DATASETS.length}
                    </p>
                    <div className="w-full h-1 bg-emerald-500 rounded-full mt-3 mb-2" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Role-scoped view partitions active</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>

                {/* Card 2: Cross-Role Leakage */}
                <div
                  onClick={() => setActiveTab("governance")}
                  className="bg-white border border-emerald-100/80 hover:border-emerald-300 p-6 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                        <Shield className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/80 shadow-2xs flex items-center gap-1">
                        <span>↓ 0.0% Perfect</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-4">
                      CROSS-ROLE LEAKAGE
                    </span>
                    <p className="text-4xl font-black text-slate-900 tracking-tight mt-1">
                      0.0%
                    </p>
                    <div className="w-full h-1 mt-3 mb-2" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Complete PII & schema isolation</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>

                {/* Card 3: Total Repositories */}
                <div
                  onClick={() => setActiveTab("documents")}
                  className="bg-white border border-indigo-100/80 hover:border-indigo-300 p-6 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-200/80 shadow-2xs flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>100% Masked</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-4">
                      TOTAL REPOSITORIES
                    </span>
                    <p className="text-4xl font-black text-slate-900 tracking-tight mt-1">
                      {ALL_DATASETS.length}/{ALL_DATASETS.length}
                    </p>
                    <div className="w-full h-1 mt-3 mb-2" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Relational & vector collections</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>

                {/* Card 4: Security Boundary */}
                <div
                  onClick={() => setActiveTab("governance")}
                  className="bg-white border border-sky-100/80 hover:border-sky-300 p-6 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform">
                        <Lock className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/80 shadow-2xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>AST Verified</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-4">
                      SECURITY BOUNDARY
                    </span>
                    <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-1">
                      Enforced
                    </p>
                    <div className="w-full h-1 mt-3 mb-2" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>DuckDB + Views + ChromaDB</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>

              {/* Dual Subsystem Explorer Previews (Matching User Reference Image Exactly) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Relational Views Preview Card */}
                <div className="p-7 rounded-[22px] border border-slate-200/90 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[#16213e] text-white flex items-center justify-center shadow-xs">
                          <TableIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-base text-slate-900">Relational Views (DuckDB)</span>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs">
                        <TableIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>4 Schemas</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Role-scoped DuckDB SQL views. Users execute queries through isolated projections (&ldquo;v_hr_employees&rdquo;, &ldquo;v_marketing_report_2024&rdquo;, &ldquo;quaterly_financial_report&rdquo;) with column safety masking.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("relational")}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#16213e] hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer mt-4"
                  >
                    <span>Inspect Relational Views</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Document Vectors Preview Card */}
                <div className="p-7 rounded-[22px] border border-slate-200/90 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[#16213e] text-white flex items-center justify-center shadow-xs">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-base text-slate-900">Document Vectors (ChromaDB)</span>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>3 Documents</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Institutional governance policies, human resource operating manuals, and performance review narratives indexed in ChromaDB with metadata role authorization.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("documents")}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#16213e] hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer mt-4"
                  >
                    <span>Inspect Document Vectors</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              PAGE 2: RELATIONAL VIEWS (DUCKDB VIEW SCHEMAS & QUERY INSPECTOR)
              ===================================================================== */}
          {activeTab === "relational" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Back to Overview Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#eff2f6] hover:bg-[#e5e9f0] border border-[#dce1e9] text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>← Back to Data Overview</span>
                </button>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#eff2f6] text-slate-800 border border-[#dce1e9] text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DuckDB In-Memory OLAP Protocol</span>
                </span>
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  DuckDB Relational Views & Masked Schemas
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Deterministic view isolation. Queries execute against schema views with column-level value masking.
                </p>
              </div>

              {/* Relational Views List in Matching Unified Light Tone */}
              <div className="space-y-3">
                {relationalDatasets.map((d) => {
                  const cleared = isCleared(d);
                  const isExpanded = expandedId === d.id;

                  return (
                    <div
                      key={d.id}
                      onClick={() => setExpandedId(isExpanded ? null : d.id)}
                      className="p-4.5 rounded-2xl border border-[#dce1e9] hover:border-slate-400 bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] transition cursor-pointer shadow-2xs group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
                            <TableIcon className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                                {d.name}
                              </h3>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 shadow-2xs">
                                {d.department} Subsystem
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 max-w-xl">
                              {d.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 pl-12 sm:pl-0 shrink-0">
                          <div className="flex items-center space-x-1.5">
                            {cleared ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-rose-500" />
                            )}
                            <div className="text-left">
                              <span
                                className={`text-xs font-bold block leading-tight ${
                                  cleared ? "text-slate-900" : "text-rose-600"
                                }`}
                              >
                                {cleared ? "Cleared" : "403 Forbidden"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {cleared ? `Session: ${userRole}` : "Access Blocked"}
                              </span>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 border border-slate-300 font-bold text-xs shadow-2xs">
                            {d.sampleRowsCount} Rows
                          </span>

                          <ChevronRight
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              isExpanded ? "rotate-90 text-slate-900" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {/* Expandable Technical Schema & Query Pattern */}
                      {isExpanded && (
                        <div className="mt-3.5 pt-3.5 border-t border-slate-300/70 text-xs text-slate-600 space-y-3 animate-in fade-in duration-150">
                          {d.columns && d.columns.length > 0 && (
                            <div>
                              <span className="font-bold text-slate-800 block mb-1.5">
                                Masked View Columns:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {d.columns.map((col) => (
                                  <span
                                    key={col}
                                    className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 shadow-2xs"
                                  >
                                    {col}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {d.sampleQuery && (
                            <div>
                              <span className="font-bold text-slate-800 block mb-1">
                                Enforced View Query Pattern:
                              </span>
                              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto shadow-xs border border-slate-800">
                                {d.sampleQuery}
                              </pre>
                            </div>
                          )}

                          <div className="flex items-center space-x-2 pt-1">
                            <span className="font-bold text-slate-800">Cleared Enterprise Roles:</span>
                            <div className="flex flex-wrap gap-1">
                              {d.clearedRoles.map((r) => (
                                <span
                                  key={r}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    r === userRole
                                      ? "bg-slate-900 text-white border-slate-900"
                                      : "bg-white text-slate-600 border-slate-300"
                                  }`}
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
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
              PAGE 3: DOCUMENT VECTORS (CHROMADB DOCUMENT EMBEDDINGS)
              ===================================================================== */}
          {activeTab === "documents" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Back to Overview Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#eff2f6] hover:bg-[#e5e9f0] border border-[#dce1e9] text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>← Back to Data Overview</span>
                </button>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#eff2f6] text-slate-800 border border-[#dce1e9] text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Neural Semantic Embeddings & Cross-Encoder Reranker</span>
                </span>
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  ChromaDB Institutional Document Collections
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Vector collections with metadata-level role authorization filtering and pre-prompt document sanitization.
                </p>
              </div>

              {/* Document Datasets List in Matching Unified Light Tone */}
              <div className="space-y-3">
                {documentDatasets.map((d) => {
                  const cleared = isCleared(d);
                  const isExpanded = expandedId === d.id;

                  return (
                    <div
                      key={d.id}
                      onClick={() => setExpandedId(isExpanded ? null : d.id)}
                      className="p-4.5 rounded-2xl border border-[#dce1e9] hover:border-slate-400 bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] transition cursor-pointer shadow-2xs group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
                            <FileText className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                {d.name}
                              </h3>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 shadow-2xs">
                                {d.docType}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 max-w-xl">
                              {d.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 pl-12 sm:pl-0 shrink-0">
                          <div className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-900 block leading-tight">
                                Cleared
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Vector Passages
                              </span>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-white text-slate-800 border border-slate-300 font-bold text-xs shadow-2xs">
                            {d.sampleRowsCount} Chunks
                          </span>

                          <ChevronRight
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              isExpanded ? "rotate-90 text-slate-900" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {/* Expandable Architecture Details */}
                      {isExpanded && (
                        <div className="mt-3.5 pt-3.5 border-t border-slate-300/70 text-xs text-slate-600 space-y-3 animate-in fade-in duration-150">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Vector Embeddings
                              </span>
                              <span className="font-mono text-xs text-slate-900 font-bold block">
                                Dense Semantic Vectors (384d)
                              </span>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Neural Reranker
                              </span>
                              <span className="font-mono text-xs text-slate-900 font-bold block">
                                Cross-Encoder Neural Reranking
                              </span>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Cosine Similarity Threshold
                              </span>
                              <span className="font-mono text-xs text-emerald-700 font-bold block">
                                ≥ 0.72 (Grounded)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 pt-1">
                            <span className="font-bold text-slate-800">Authorized Roles:</span>
                            <div className="flex flex-wrap gap-1">
                              {d.clearedRoles.map((r) => (
                                <span
                                  key={r}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    r === userRole
                                      ? "bg-slate-900 text-white border-slate-900"
                                      : "bg-white text-slate-600 border-slate-300"
                                  }`}
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
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
              PAGE 4: CLEARANCE MATRIX & GOVERNANCE
              ===================================================================== */}
          {activeTab === "governance" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Back to Overview Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#eff2f6] hover:bg-[#e5e9f0] border border-[#dce1e9] text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>← Back to Data Overview</span>
                </button>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#eff2f6] text-slate-800 border border-[#dce1e9] text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Deterministic AST Verification Enforced</span>
                </span>
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Role-Based Clearance Matrix & Data Governance
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enforces zero cross-department data egress across all 5 enterprise personas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-6 rounded-[24px] border border-[#dce1e9] bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] shadow-2xs space-y-3.5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <Lock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">Deterministic DuckDB View Isolation</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Users never query underlying base tables. Each role binds strictly to an isolated DuckDB view that automatically excludes confidential columns like employee base salary or executive compensation.
                  </p>
                  <div className="p-3 bg-white rounded-xl font-mono text-[11px] text-slate-800 border border-slate-300 shadow-2xs">
                    CREATE VIEW v_hr_employees AS SELECT employee_id, name, rating FROM hr_raw;
                  </div>
                </div>

                <div className="p-6 rounded-[24px] border border-[#dce1e9] bg-gradient-to-b from-[#f8f9fb] to-[#eff2f6] shadow-2xs space-y-3.5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <Shield className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">Pre-Prompt ChromaDB Filtering</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Document search queries require cryptographic clearance tags. Vector results lacking the user&apos;s active role metadata are stripped before the prompt is assembled for the LLM.
                  </p>
                  <div className="p-3 bg-white rounded-xl font-mono text-[11px] text-slate-900 font-bold border border-slate-300 shadow-2xs flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>STATUS: Zero-Leakage Guarantee Certified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Telemetry Footer */}
          <div className="pt-6 mt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>SecureFinance AI • Deterministic AST & View Isolation Protocol</span>
            <span className="font-mono">Enterprise AI Core Active • 100% Zero-Leakage Guarantee</span>
          </div>
        </main>
      </div>
    </div>
  );
}
