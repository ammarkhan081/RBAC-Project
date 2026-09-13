"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  FileText,
  Lock,
  UserCheck,
  LogOut,
  ChevronUp,
  ChevronDown,
  Settings,
  Cpu,
  User,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";

export default function FloatingNavMenu() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Don't render on login/signup pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <div ref={menuRef} className="fixed bottom-4 left-4 z-50 select-none">
      {/* Popover Menu Triggered from "N" */}
      {isOpen && (
        <div className="absolute bottom-11 left-0 mb-1 w-76 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] overflow-hidden text-slate-900 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* =========================================================================
              1st ITEM: Project Name with Logo
              ========================================================================= */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 p-3.5 bg-slate-50/90 border-b border-slate-100 hover:bg-slate-100/80 transition group"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-sm text-slate-950 tracking-tight flex items-center space-x-1">
                <span>SecureFinance</span>
                <span className="text-indigo-600">AI</span>
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Enterprise Co-Pilot
              </div>
            </div>
          </Link>

          {/* =========================================================================
              NAVIGATION MODULES: Data Explorer, Security Core, Audit, Admin
              ========================================================================= */}
          <div className="p-2 space-y-0.5 text-xs font-medium">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition ${
                pathname === "/"
                  ? "bg-slate-950 text-white font-semibold shadow-xs"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>Financial AI Co-Pilot</span>
            </Link>

            <Link
              href="/data"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition ${
                pathname === "/data"
                  ? "bg-slate-950 text-white font-semibold shadow-xs"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <FileText className="w-4 h-4 text-sky-500" />
              <span>Data Explorer</span>
            </Link>

            <Link
              href="/security"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition ${
                pathname === "/security"
                  ? "bg-slate-950 text-white font-semibold shadow-xs"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Security Core</span>
            </Link>

            {user?.role === "C-Level" && (
              <>
                <Link
                  href="/audit"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition ${
                    pathname === "/audit"
                      ? "bg-slate-950 text-white font-semibold shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>Audit Trail</span>
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition ${
                    pathname === "/admin"
                      ? "bg-slate-950 text-white font-semibold shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-amber-500" />
                  <span>Admin Panel</span>
                </Link>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-1" />

          {/* =========================================================================
              PREFERENCES (Contains Sign Out, Profile & Engine Details)
              ========================================================================= */}
          <div className="p-2">
            <button
              type="button"
              onClick={() => setShowPreferences(!showPreferences)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Preferences</span>
              </div>
              {showPreferences ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Expandable Preferences Content */}
            {showPreferences && (
              <div className="mt-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2.5 text-xs text-slate-600 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{user?.username || "Ammar Ayaz"}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10px]">
                    {user?.role || "C-Level"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Enterprise AI Engine</span>
                  </div>
                  <span className="text-emerald-600 font-semibold">Active (0.3s)</span>
                </div>

                {/* Sign Out Option (Inside Preferences as requested) */}
                <div className="pt-1.5 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100/80 text-rose-600 font-bold text-xs transition cursor-pointer border border-rose-200/60"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* The Small "N" Button at Left Bottom */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Application Navigation Hub"
        className="w-8 h-8 rounded-full bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-black text-xs flex items-center justify-center shadow-lg hover:shadow-indigo-500/20 border border-slate-700/80 transition cursor-pointer"
        title="SecureFinance Hub (N)"
      >
        <span>N</span>
      </button>
    </div>
  );
}
