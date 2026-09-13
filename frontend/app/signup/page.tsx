"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  User,
  Check,
  Building2,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { registerAccount } from "@/lib/accounts";
import { UserRole } from "@/lib/types";

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Finance");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;

    setAuthError("");
    setIsLoading(true);
    const result = registerAccount({
      firstName,
      lastName,
      email,
      password,
      role: selectedRole,
    });
    setIsLoading(false);
    if (!result.ok || !result.account) {
      setAuthError(result.error || "Could not create account.");
      return;
    }
    login(result.account.username, result.account.role, undefined, result.account.email);
    router.push("/");
  };

  return (
    <div className="min-h-screen w-full bg-[#1e1c24] flex items-center justify-center p-4 md:p-8 relative overflow-hidden text-slate-100">
      {/* Background Ambient Glows (Obsidian & Indigo from Image 1) */}
      <div className="ambient-glow bg-purple-900/20 -top-20 -left-20" />
      <div className="ambient-glow bg-indigo-900/20 -bottom-20 -right-20" />

      {/* Main Dual-Panel Floating Container (Image 1 Style) */}
      <div className="w-full max-w-5xl bg-[#282533] rounded-[32px] p-6 md:p-8 shadow-2xl border border-white/5 flex flex-col md:flex-row items-stretch gap-8 relative z-10">
        {/* =========================================================================
            LEFT COLUMN: Atmospheric Brand & Hero Visual (Image 1 Style)
            ========================================================================= */}
        <div className="w-full md:w-1/2 relative min-h-[480px] rounded-[24px] overflow-hidden flex flex-col justify-between p-6 md:p-8 bg-slate-950 shadow-inner">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/finance_boardroom.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1c24] via-[#1e1c24]/60 to-black/30" />

          {/* Top Brand & Back to Login Button */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span className="font-extrabold text-sm tracking-tight text-white">
                SecureFinance <span className="text-purple-400">AI</span>
              </span>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/90 backdrop-blur-md transition"
            >
              <span>Back to login</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Bottom Hero Caption */}
          <div className="relative z-10 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
              Capturing Insights, <br />
              Protecting Governance
            </h2>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              Join the institutional analytical platform enforcing real-time AST verification, context-aware column masking, and zero cross-departmental data leakage.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <div className="w-8 h-1 bg-purple-500 rounded-full" />
              <div className="w-4 h-1 bg-white/30 rounded-full" />
              <div className="w-4 h-1 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Account Registration & Role Request Form
            ========================================================================= */}
        <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Create an account
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold underline">
                  Log in
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    required
                    className="w-full bg-[#1e1c24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Morgan"
                    className="w-full bg-[#1e1c24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enterprise.finsolve.io"
                  required
                  className="w-full bg-[#1e1c24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Department Clearance Requested
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-[#1e1c24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                >
                  <option value="Finance">Finance (Financial Ledgers, EBITDA, Budgets)</option>
                  <option value="Marketing">Marketing (Campaign Analytics, Ad Spend)</option>
                  <option value="HR">HR (Employee Directory, Benefit Handbooks)</option>
                  <option value="Engineering">Engineering (Architecture, Logs, Specs)</option>
                  <option value="General">General (Company FAQs & Policies)</option>
                  <option value="C-Level">C-Level (Full Cross-Dept & Audit Clearance)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Master Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#1e1c24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#1e1c24] border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-400 select-none">
                  I agree to the{" "}
                  <span className="text-purple-400 underline cursor-pointer">
                    Enterprise Data Protection & Security Policies
                  </span>
                </label>
              </div>

              {authError && (
                <p className="text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                  {authError}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !agreeTerms}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs tracking-wide transition shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50"
              >
                <span>{isLoading ? "Provisioning Workspace..." : "Create Account & Request Clearance"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#282533] px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute">
                Or Register With
              </span>
            </div>

            {/* Social Registration */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setAuthError("Google sign-up is not enabled. Create an account with email and password.")
                }
                className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-white/10 rounded-xl hover:bg-white/5 transition text-xs font-medium text-slate-300"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setAuthError("Enterprise SSO is not enabled. Create an account with email and password.")
                }
                className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-white/10 rounded-xl hover:bg-white/5 transition text-xs font-medium text-slate-300"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Enterprise SSO</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
