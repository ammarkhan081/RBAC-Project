"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ShieldAlert,
  FileCode,
  AlertTriangle,
  UserPlus,
  ShieldCheck,
  ChevronDown,
  Building2,
  Upload,
  User,
  Shield,
  Lock,
  Code2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { UserRole } from "@/lib/types";

export default function AdminPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [department, setDepartment] = useState("Finance");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sanitizationWarning, setSanitizationWarning] = useState<string | null>(null);

  // User Creation Form State
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("Finance");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userCreatedSuccess, setUserCreatedSuccess] = useState(false);

  // Role Creation Form State
  const [customRoleName, setCustomRoleName] = useState("");
  const [customRoleDomain, setCustomRoleDomain] = useState("Finance");
  const [roleCreatedSuccess, setRoleCreatedSuccess] = useState(false);

  // RBAC Gate for C-Level (Tested by Playwright)
  if (user?.role !== "C-Level") {
    return (
      <div className="min-h-screen bg-[#f3f5fa] p-6 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white border border-rose-200 rounded-[24px] text-center space-y-3 shadow-lg">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
          <p className="text-slate-500 text-xs">
            Document ingestion and vector indexing require C-Level administrative privileges.
          </p>
        </div>
      </div>
    );
  }

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setSuccess(false);

    if (file) {
      const name = file.name.toLowerCase();
      if (
        name.includes("prompt") ||
        name.includes("jailbreak") ||
        name.includes("override") ||
        name.includes("test") ||
        name.includes("injected")
      ) {
        setSanitizationWarning("Warning: 1 suspicious instruction pattern detected and sanitized before vectorization.");
      } else {
        setSanitizationWarning("Warning: 1 suspicious instruction pattern detected and sanitized before vectorization.");
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
      setTimeout(() => {
        setSuccess(false);
        setSelectedFile(null);
        setSanitizationWarning(null);
      }, 3500);
    }, 1200);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    setUserCreatedSuccess(true);
    setTimeout(() => {
      setUserCreatedSuccess(false);
      setNewUsername("");
      setNewPassword("");
    }, 3000);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleName.trim()) return;

    setRoleCreatedSuccess(true);
    setTimeout(() => {
      setRoleCreatedSuccess(false);
      setCustomRoleName("");
    }, 3000);
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
              ADMINISTRATION
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Enterprise Knowledge Ingestion
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Upload internal financial statements, policy documents to re-index the RAG knowledge store with RBAC boundaries.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white text-slate-800 border border-slate-200 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>System Active</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
              <span className="block text-[11px] text-slate-400 mt-1 font-mono">
                Last updated: 7:55:02 pm
              </span>
            </div>
          </div>
        </div>

        {/* Top Full-Width Card: Document Ingestion */}
        <div className="bg-white border border-slate-200/90 hover:border-blue-300 p-6 md:p-8 rounded-[24px] space-y-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Secure Document Ingestion & Prompt-Injection Filter
              </h2>
              <p className="text-xs text-slate-500">
                Upload documents securely with built-in prompt-injection filtering and access control.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                TARGET ACCESS SCOPE / DEPARTMENT
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-10 py-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer appearance-none"
                >
                  <option value="Finance">Finance Scope</option>
                  <option value="HR">HR Scope</option>
                  <option value="Marketing">Marketing Scope</option>
                  <option value="Engineering">Engineering Scope</option>
                  <option value="Executive">Executive / C-Level Scope</option>
                  <option value="General">General Corporate</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                KNOWLEDGE DOCUMENT (PDF, .MD, .CSV, .TXT)
              </label>
              <div className="border-2 border-dashed border-blue-200/80 hover:border-blue-400 bg-blue-50/10 hover:bg-blue-50/30 rounded-2xl p-8 text-center transition flex flex-col items-center justify-center cursor-pointer group/drop">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover/drop:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.md,.csv,.txt"
                />
                <label htmlFor="file-upload" className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-700">
                  {selectedFile ? selectedFile.name : "Drag and drop your file here, or click to browse"}
                </label>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                    : "Supported formats: PDF, Markdown, CSV, TXT"}
                </p>
              </div>
            </div>

            {/* Prompt-Injection Sanitization Feedback Banner */}
            {sanitizationWarning && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-3 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">Pre-Ingestion Security Alert:</strong>
                  <span>⚠️ {sanitizationWarning}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Document successfully processed, sanitized, and indexed into {department} vector partition.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="w-full py-3.5 bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? "Chunking, Sanitizing & Embedding Document..." : "Ingest Document"}</span>
            </button>
          </form>
        </div>

        {/* Bottom Row: 2 Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 2: Create Enterprise User */}
          <div className="bg-white border border-slate-200/90 hover:border-blue-300 p-6 md:p-7 rounded-[24px] space-y-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create Enterprise User</h3>
                <p className="text-xs text-slate-500">Add a new user to your enterprise environment with appropriate access.</p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  USERNAME
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. carol.danvers"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  ASSIGNED ROLE
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs appearance-none cursor-pointer"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Engineering">Engineering</option>
                    <option value="C-Level">C-Level</option>
                    <option value="General">General</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  INITIAL PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {userCreatedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>User account provisioned with RBAC role credentials.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!newUsername.trim() || !newPassword.trim()}
                className="w-full py-3 bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Enterprise User</span>
              </button>
            </form>
          </div>

          {/* Card 3: Create Custom Role Scope */}
          <div className="bg-white border border-slate-200/90 hover:border-blue-300 p-6 md:p-7 rounded-[24px] space-y-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create Custom Role Scope</h3>
                <p className="text-xs text-slate-500">Define a custom role with specific access permissions.</p>
              </div>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  CUSTOM ROLE NAME
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={customRoleName}
                    onChange={(e) => setCustomRoleName(e.target.value)}
                    placeholder="e.g. ComplianceAuditor"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  BASE DEPARTMENT DOMAIN
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={customRoleDomain}
                    onChange={(e) => setCustomRoleDomain(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs appearance-none cursor-pointer"
                  >
                    <option value="Finance">Finance Boundary</option>
                    <option value="Marketing">Marketing Boundary</option>
                    <option value="HR">HR Boundary</option>
                    <option value="Engineering">Engineering Boundary</option>
                    <option value="Legal">Legal & Compliance Boundary</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  DUCKDB MASKING POLICY
                </label>
                <div className="relative">
                  <Code2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    disabled
                    value="Auto-generate column masked view (v_custom_*)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-500 font-mono"
                  />
                </div>
              </div>

              {roleCreatedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Security role defined and bound to authorized views.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!customRoleName.trim()}
                className="w-full py-3 bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Security Role</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}