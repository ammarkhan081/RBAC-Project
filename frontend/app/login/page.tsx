"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { authenticateAccount } from "@/lib/accounts";

interface SlideData {
  image: string;
  tagline: string;
  quote: string;
  badge1: string;
  badge2: string;
}

const CAROUSEL_SLIDES: SlideData[] = [
  {
    image: "/images/finance_boardroom.jpg",
    tagline: "Enterprise Governance & Auditability",
    quote: '"Zero cross-departmental data leakage enforced through deterministic AST query validation and column masking."',
    badge1: "SOC-2 Type II Compliant",
    badge2: "Immutable Audit Ledger",
  },
  {
    image: "/images/finance_trading_floor.jpg",
    tagline: "Authorized Financial Intelligence",
    quote: '"A smart choice: The premier role-scoped AI co-pilot bridging relational OLAP and institutional documents."',
    badge1: "100% RBAC Isolation",
    badge2: "Sub-Second LPU Inference",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [activeSlide, setActiveSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState("");
  const [authError, setAuthError] = useState("");

  // Auto-cycle carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setAuthError("");
    setIsLoading(true);
    setAuthStatusMessage("Validating enterprise credentials...");

    setTimeout(() => {
      const result = authenticateAccount(email, password);
      setIsLoading(false);
      if (!result.ok || !result.account) {
        setAuthError(result.error || "Login failed.");
        setAuthStatusMessage("");
        return;
      }
      login(result.account.username, result.account.role, undefined, result.account.email);
      router.push("/");
    }, 400);
  };

  const handleGoogleSSO = () => {
    setAuthError("Google Workspace SSO is not enabled. Sign in with a registered email and password, or create an account.");
  };

  const handleSAMLSSO = () => {
    setAuthError("Enterprise SAML SSO is not enabled. Sign in with a registered email and password, or create an account.");
  };

  const currentSlide = CAROUSEL_SLIDES[activeSlide];

  return (
    <div className="min-h-screen w-full bg-[#edf5fe] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Fluid ambient light blue shapes exactly matching reference image */}
      <div className="absolute -top-36 -left-36 w-[520px] h-[520px] rounded-full bg-blue-200/50 blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -left-28 w-[460px] h-[460px] rounded-full bg-sky-100/80 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-36 -right-36 w-[560px] h-[560px] rounded-full bg-blue-200/45 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 -right-16 w-[420px] h-[420px] rounded-full bg-indigo-100/60 blur-2xl pointer-events-none" />

      {/* Soft curved organic background SVG waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        <svg
          className="absolute -top-32 -left-32 w-[650px] h-[650px] text-blue-100/60"
          viewBox="0 0 400 400"
          fill="currentColor"
        >
          <path d="M0,0 C150,50 350,150 400,400 L0,400 Z" opacity="0.3" />
        </svg>
        <svg
          className="absolute -bottom-32 -right-32 w-[700px] h-[700px] text-blue-100/50"
          viewBox="0 0 400 400"
          fill="currentColor"
        >
          <circle cx="280" cy="280" r="160" opacity="0.4" />
        </svg>
      </div>

      {/* Main Dual-Panel Container (Form Card remains pure white) */}
      <div className="w-full max-w-5xl bg-white text-slate-900 rounded-[32px] p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(28,57,110,0.08)] border border-slate-100 flex flex-col md:flex-row items-stretch gap-8 relative z-10 transition-all">
        {/* =========================================================================
            LEFT COLUMN: Authentication Form & Persona Selection
            ========================================================================= */}
        <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
          <div>
            {/* Brand Logo & Tag */}
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-950">
                  SecureFinance <span className="text-indigo-600">AI</span>
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Enterprise Financial Assistant
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                Welcome Back !
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Enter your enterprise credentials to access your financial co-pilot.
              </p>
            </div>

            {/* Standard Enterprise Email & Password Authentication Form */}
            <form onSubmit={handleSignIn} className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@enterprise.finsolve.io"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent transition bg-slate-50/50 hover:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Password reset instructions have been forwarded to your security administrator.")}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent transition bg-slate-50/50 hover:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">Keep me signed in on this device</span>
                </label>
              </div>

              {authError && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {authError}
                </p>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm transition flex items-center justify-center space-x-2 shadow-lg shadow-slate-950/20 active:scale-[0.99] disabled:opacity-80 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{authStatusMessage || "Authenticating Session..."}</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                OR CONTINUE WITH CORPORATE SSO
              </span>
            </div>

            {/* SSO / Identity Provider Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSSO}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 transition text-xs font-medium text-slate-700 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {/* Official Google Color SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Workspace</span>
              </button>

              <button
                type="button"
                onClick={handleSAMLSSO}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 transition text-xs font-medium text-slate-700 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Enterprise SAML</span>
              </button>
            </div>
          </div>

          {/* Footer Sign Up Link - Clean & Professional */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Don't have an enterprise account?</span>
            <Link
              href="/signup"
              className="font-bold text-slate-900 hover:text-indigo-600 transition flex items-center space-x-1"
            >
              <span>Create an account</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Hero Showcase Card (Exact Image 3 Style with Finance Assets)
            ========================================================================= */}
        <div className="w-full md:w-1/2 relative min-h-[500px] rounded-[28px] overflow-hidden flex flex-col justify-between p-6 md:p-8 bg-slate-950 shadow-inner">
          {/* Background Image with smooth transition */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url('${currentSlide.image}')`,
            }}
          />

          {/* High-contrast gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />

          {/* Top Brand Link Pill (like WhiteHatt.io in Image 3) */}
          <div className="relative z-10 flex justify-end">
            <div className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-full bg-white/90 hover:bg-white text-slate-900 font-bold text-xs shadow-lg backdrop-blur-md transition">
              <span>enterprise.finsolve.io</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          {/* Bottom Content Area */}
          <div className="relative z-10 space-y-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300/90 drop-shadow">
                {currentSlide.tagline}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug mt-1 drop-shadow-md">
                {currentSlide.quote}
              </h2>
            </div>

            {/* Feature Trust Pills (like Image 3's 100% Guarantee / Free Delivery) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center space-x-2 py-1.5 px-3 rounded-full bg-slate-900/80 border border-white/20 text-white text-xs font-semibold backdrop-blur-md shadow-sm">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentSlide.badge1}</span>
              </div>
              <div className="inline-flex items-center space-x-2 py-1.5 px-3 rounded-full bg-slate-900/80 border border-white/20 text-white text-xs font-semibold backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentSlide.badge2}</span>
              </div>
            </div>

            {/* Interactive Carousel Pagination Lines (Image 3 Style) */}
            <div className="flex items-center space-x-2 pt-2">
              {CAROUSEL_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeSlide === idx
                      ? "w-10 bg-white"
                      : "w-5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}