"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, MessageSquare, Lock, FileText, UserCheck, LogOut } from "lucide-react";
import { useAuth } from "@/lib/authContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "C-Level":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Finance":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "HR":
        return "bg-pink-50 text-pink-700 border-pink-200";
      case "Engineering":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Marketing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <nav className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-6 py-2.5 flex items-center justify-between transition-all">
      <div className="flex items-center space-x-7">
        <Link href="/" className="flex items-center space-x-2 text-slate-950 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <span>
            SecureFinance <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {user && (
          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition ${
                pathname === "/"
                  ? "bg-slate-950 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </Link>

            <Link
              href="/data"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition ${
                pathname === "/data"
                  ? "bg-slate-950 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Data Explorer</span>
            </Link>

            <Link
              href="/security"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition ${
                pathname === "/security"
                  ? "bg-slate-950 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security Core</span>
            </Link>

            {user.role === "C-Level" && (
              <>
                <Link
                  href="/audit"
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition ${
                    pathname === "/audit"
                      ? "bg-slate-950 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Audit Trail</span>
                </Link>
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition ${
                    pathname === "/admin"
                      ? "bg-slate-950 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Enterprise AI Core Active (0.3s)</span>
      </div>

      {user ? (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-full shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-slate-800">{user.username}</span>
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
          </div>

          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Sign out of enterprise session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-semibold rounded-full transition shadow-xs"
        >
          Login
        </Link>
      )}
    </nav>
  );
}