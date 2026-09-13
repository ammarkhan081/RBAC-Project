"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Search,
  Plus,
  PanelLeft,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Clock,
  Shield,
  Building2,
  TrendingUp,
  Target,
  Layers,
  RefreshCw,
  AlertOctagon,
  Database,
  FileText,
  Trash2,
  MessageSquare,
  X,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { sendChatMessage } from "@/lib/api";
import { ChatMessage, UserRole } from "@/lib/types";

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

interface ChatAreaProps {
  onSelectCitations: (message: ChatMessage | null) => void;
  selectedMessageId?: string;
  onToggleCitations?: () => void;
}

const STORAGE_KEY = "secure_finance_chat_sessions_v2";

export default function ChatArea({
  onSelectCitations,
  selectedMessageId,
  onToggleCitations,
}: ChatAreaProps) {
  const router = useRouter();
  const { user, login } = useAuth();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // UI state for Drawer & Search Modal
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isUserScrolledUpRef = useRef(false);

  // Monitor scroll position inside chat container
  const handleChatScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // If user scrolled up by more than 80px, they are reading past messages
    isUserScrolledUpRef.current = distanceFromBottom > 80;
    setShowScrollBottom(distanceFromBottom > 120);
    setShowScrollTop(scrollTop > 220);
  };

  // Scroll to bottom of chat container only (never scrolling whole page)
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior,
      });
      isUserScrolledUpRef.current = false;
      setShowScrollBottom(false);
    }
  };

  // Scroll to top of chat container (to see the very first message)
  const scrollToTop = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        setSessions(parsed);
      }
    } catch {}
  }, []);

  // Save sessions to localStorage when updated
  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Keyboard shortcut: Ctrl+K or Cmd+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      } else if (e.key === "Escape" && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen]);

  // Focus search input on modal open
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchModalOpen]);

  // Auto-scroll when messages or loading state changes, unless the user is actively reading earlier messages
  useEffect(() => {
    if (!isUserScrolledUpRef.current) {
      const timer = setTimeout(() => {
        scrollToBottom("smooth");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, loading]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Start new clean chat
  const handleResetChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setInput("");
    onSelectCitations(null);
    isUserScrolledUpRef.current = false;
  };

  // Select a stored conversation from history
  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    onSelectCitations(null);
    setIsSidebarOpen(false);
    isUserScrolledUpRef.current = false;
    setTimeout(() => scrollToBottom("auto"), 50);
  };

  // Delete a stored conversation
  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    saveSessions(updated);
    if (currentSessionId === id) {
      handleResetChat();
    }
  };

  // Send message and update / persist session
  const handleSend = async (customQuery?: string) => {
    const queryToSend = (customQuery || input).trim();
    if (!queryToSend || loading) return;

    const userMessageId = crypto.randomUUID();
    const newMsg: ChatMessage = {
      id: userMessageId,
      sender: "user",
      text: queryToSend,
    };

    const newMessagesList = [...messages, newMsg];
    setMessages(newMessagesList);
    if (!customQuery) setInput("");
    setLoading(true);
    isUserScrolledUpRef.current = false;
    setTimeout(() => scrollToBottom("smooth"), 50);

    let activeId = currentSessionId;
    if (!activeId) {
      activeId = crypto.randomUUID();
      setCurrentSessionId(activeId);
    }

    try {
      const response = await sendChatMessage(
        queryToSend,
        user?.role || "Finance",
        user?.username || "Ammar Ayaz"
      );

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text: response.text || (response as any).answer || (response as any).response || "Analysis complete.",
        mode: response.mode,
        citations: response.citations,
        reconciliation: response.reconciliation,
        error: response.error,
      };

      const finalMessages = [...newMessagesList, assistantMsg];
      setMessages(finalMessages);

      // Persist to session list
      const cleanTitle = queryToSend.length > 38 ? `${queryToSend.slice(0, 38)}...` : queryToSend;
      const existingIdx = sessions.findIndex((s) => s.id === activeId);

      let updatedSessions: ChatSession[];
      if (existingIdx >= 0) {
        updatedSessions = [...sessions];
        updatedSessions[existingIdx] = {
          ...updatedSessions[existingIdx],
          messages: finalMessages,
        };
      } else {
        const newSession: ChatSession = {
          id: activeId,
          title: cleanTitle,
          createdAt: Date.now(),
          messages: finalMessages,
        };
        updatedSessions = [newSession, ...sessions];
      }
      saveSessions(updatedSessions);
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text: "Security Boundary Warning: Unable to resolve query under current authorization policies.",
        error: true,
        mode: "BLOCKED",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const renderRouteBadge = (mode?: string, error?: boolean) => {
    if (mode === "BLOCKED" || error) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
          <span>[🛡️ Security Boundary Enforced]</span>
        </span>
      );
    }

    switch (mode) {
      case "SQL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>[⚡ SQL DuckDB Relational View]</span>
          </span>
        );
      case "RAG":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>[📄 Document Knowledge Retrieval]</span>
          </span>
        );
      case "HYBRID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>[✨ Hybrid AST & Document Fusion]</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Response</span>
          </span>
        );
    }
  };

  // High-End Portal Cards dynamically calibrated by selected role
  const getPortalCards = (role?: string) => {
    switch (role) {
      case "Marketing":
        return [
          {
            icon: <Building2 className="w-4 h-4 text-slate-700" />,
            title: "How's my campaign?",
            description: "Get a quick overview of your campaign's performance, including reach, engagement, and ROI.",
            buttonText: "View Report",
            query: "What was our total digital campaign spend and ROI in 2024?",
          },
          {
            icon: <TrendingUp className="w-4 h-4 text-slate-700" />,
            title: "Any spend issues?",
            description: "Identify sudden spikes or dips in ad spend and get suggestions to optimize your budget.",
            buttonText: "Analyze Budget",
            query: "Why did Q3 marketing expense exceed budget, and by how much?",
          },
          {
            icon: <Target className="w-4 h-4 text-slate-700" />,
            title: "Which ads work best?",
            description: "See the top-performing ads based on clicks, conversions, and engagement to refine your strategy.",
            buttonText: "View Insights",
            query: "Summarize company values from Corporate Governance 2024",
          },
        ];
      case "HR":
        return [
          {
            icon: <Building2 className="w-4 h-4 text-slate-700" />,
            title: "Headcount & Staffing",
            description: "Get an overview of active headcount, department distribution, and hiring trends.",
            buttonText: "View Report",
            query: "Show headcount breakdown across Engineering and Sales",
          },
          {
            icon: <TrendingUp className="w-4 h-4 text-slate-700" />,
            title: "Leave & Policy Standards",
            description: "Review employee leave policies, paternity, casual, and health coverage standards.",
            buttonText: "Check Policies",
            query: "What is the policy for paternity and casual leave?",
          },
          {
            icon: <Target className="w-4 h-4 text-slate-700" />,
            title: "Performance Ratings",
            description: "Inspect employee performance review scores and department evaluation metrics.",
            buttonText: "View Insights",
            query: "List employees in the Finance department whose performance rating is 5",
          },
        ];
      case "Engineering":
        return [
          {
            icon: <Building2 className="w-4 h-4 text-slate-700" />,
            title: "Service Health & SLA",
            description: "Monitor 99.9% uptime SLA compliance, service latencies, and production reliability.",
            buttonText: "View Report",
            query: "Show uptime SLA compliance and latency metrics for all services",
          },
          {
            icon: <TrendingUp className="w-4 h-4 text-slate-700" />,
            title: "Incident Telemetry",
            description: "Analyze technical incident response times, post-mortem root causes, and MTTR.",
            buttonText: "Analyze Incidents",
            query: "Summarize recent system incidents and resolution post-mortems",
          },
          {
            icon: <Target className="w-4 h-4 text-slate-700" />,
            title: "Architecture Handbooks",
            description: "Access system design documents, API security policies, and technical handbooks.",
            buttonText: "View Insights",
            query: "Summarize engineering master documentation and service standards",
          },
        ];
      default: // Finance & C-Level
        return [
          {
            icon: <Building2 className="w-4 h-4 text-slate-700" />,
            title: "How's my financial health?",
            description: "Get a quick overview of quarterly revenue, net income, EBITDA margins, and operating cash flow.",
            buttonText: "View Report",
            query: "What was our total operating expense and gross margin in Q3 2024?",
          },
          {
            icon: <TrendingUp className="w-4 h-4 text-slate-700" />,
            title: "Any spend issues?",
            description: "Identify sudden spikes or dips in departmental expenses and get suggestions to optimize your budget.",
            buttonText: "Analyze Budget",
            query: "Why did Q3 marketing expense exceed budget, and by how much?",
          },
          {
            icon: <Target className="w-4 h-4 text-slate-700" />,
            title: "Which policies apply?",
            description: "Review institutional governance handbooks, column masking rules, and zero-leakage security boundaries.",
            buttonText: "View Insights",
            query: "Summarize corporate governance values and radical transparency",
          },
        ];
    }
  };

  // Search Results Filtering Logic (Conversations, Datasets, Handbooks, Actions)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: {
      type: "session" | "dataset" | "document" | "navigation";
      title: string;
      subtitle: string;
      action: () => void;
    }[] = [];

    // Search in past chat sessions
    sessions.forEach((s) => {
      if (
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.text.toLowerCase().includes(q))
      ) {
        results.push({
          type: "session",
          title: s.title,
          subtitle: `Chat Session (${s.messages.length} messages)`,
          action: () => {
            handleSelectSession(s);
            setIsSearchModalOpen(false);
          },
        });
      }
    });

    // Search enterprise datasets
    const datasets = [
      { name: "financial_summary", desc: "Q1-Q4 Revenue, Operating Expenses & Net Income Ledgers" },
      { name: "quarterly_financial_report", desc: "EBITDA, Debt Ratio & Operating Cash Flow Ledgers" },
      { name: "marketing_report_2024", desc: "Digital Campaign Spend, Impressions, Conversions & ROI" },
      { name: "hr_data", desc: "Personnel Records, Performance Scores & Department Hierarchy" },
      { name: "engineering_master_doc", desc: "Service 99.9% Uptime SLA, Latency P99 & Incident Telemetry" },
    ];
    datasets.forEach((d) => {
      if (d.name.includes(q) || d.desc.toLowerCase().includes(q)) {
        results.push({
          type: "dataset",
          title: `Table: ${d.name}`,
          subtitle: d.desc,
          action: () => {
            handleSend(`Inspect and summarize schema and data in ${d.name}`);
            setIsSearchModalOpen(false);
          },
        });
      }
    });

    // Search corporate documents
    const documents = [
      { name: "Corporate Governance 2024", desc: "Institutional policies, radical transparency & executive standards" },
      { name: "Employee Leave & PTO Policy", desc: "Paternity, sick, casual, and health allowance guidelines" },
      { name: "Deterministic AST Security Protocol", desc: "Zero-leakage SQL query isolation & column masking specification" },
    ];
    documents.forEach((doc) => {
      if (doc.name.toLowerCase().includes(q) || doc.desc.toLowerCase().includes(q)) {
        results.push({
          type: "document",
          title: doc.name,
          subtitle: doc.desc,
          action: () => {
            handleSend(`What are the key policy guidelines in ${doc.name}?`);
            setIsSearchModalOpen(false);
          },
        });
      }
    });

    // Search quick navigation
    const navs = [
      { name: "Data Explorer", route: "/data", desc: "View schema and query DuckDB tables" },
      { name: "Security Core", route: "/security", desc: "Zero-leakage AST validator and masking rules" },
      { name: "Audit Trail", route: "/audit", desc: "Cryptographic immutable ledger logs" },
      { name: "Admin Panel", route: "/admin", desc: "Role privilege administration" },
    ];
    navs.forEach((n) => {
      if (n.name.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q)) {
        results.push({
          type: "navigation",
          title: `Go to: ${n.name}`,
          subtitle: n.desc,
          action: () => {
            router.push(n.route);
            setIsSearchModalOpen(false);
          },
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, sessions]);

  const portalCards = getPortalCards(user?.role);
  const firstName = user?.username?.split(" ")[0] || "Ammar";

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 justify-between overflow-hidden relative">
      {/* =========================================================================
          TOP NAV BAR INSIDE CANVAS
          Left: History Drawer Toggle, Search, New Chat
          Right: Role Selector Dropdown (Clean & Minimalist, No Share)
          ========================================================================= */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 bg-white shrink-0 z-20">
        {/* Left Controls */}
        <div className="flex items-center space-x-2">
          {/* Sidebar Toggle for Stored Conversations (ChatGPT style) */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`w-8 h-8 rounded-full border transition flex items-center justify-center cursor-pointer ${
              isSidebarOpen
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "border-slate-200/90 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-2xs"
            }`}
            title="Toggle chat conversation history"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>

          {/* Functional Search Icon Button */}
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="w-8 h-8 rounded-full border border-slate-200/90 bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center transition shadow-2xs hover:bg-slate-50 cursor-pointer"
            title="Search conversations, tables, and documents (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* + New Chat Button */}
          <button
            type="button"
            onClick={handleResetChat}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition shadow-2xs hover:bg-slate-50 cursor-pointer"
            title="Start a new analytical session"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Right Controls: Only Role Selector Dropdown (Share & other icon removed) */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50/90 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={user?.role || "C-Level"}
              onChange={(e) => login(user?.username || "Ammar Ayaz", e.target.value as UserRole)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
              aria-label="Select enterprise role"
            >
              <option value="C-Level">Role: C-Level Executive</option>
              <option value="Finance">Role: Finance</option>
              <option value="Marketing">Role: Marketing</option>
              <option value="HR">Role: HR</option>
              <option value="Engineering">Role: Engineering</option>
              <option value="General">Role: General Staff</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN CHAT & WORKSPACE AREA (With Slide-out History Drawer)
          ========================================================================= */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* =======================================================================
            SLIDE-OUT CHAT HISTORY SIDEBAR (ChatGPT Style)
            ======================================================================= */}
        {isSidebarOpen && (
          <aside className="w-72 border-r border-slate-100 bg-[#f9fafc] flex flex-col justify-between shrink-0 animate-in slide-in-from-left duration-200 z-10">
            <div className="p-3.5 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Conversations
                </span>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 px-2 text-xs text-slate-400">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-300 opacity-60" />
                    <p>No saved conversations yet.</p>
                    <p className="text-[11px] mt-1 text-slate-400">Ask any question to create your first session.</p>
                  </div>
                ) : (
                  sessions.map((s) => {
                    const isActive = currentSessionId === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSession(s)}
                        className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
                          isActive
                            ? "bg-white text-slate-950 font-semibold shadow-2xs border border-slate-200/80"
                            : "text-slate-600 hover:bg-white/80 hover:text-slate-900 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                          <span className="truncate text-left">{s.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, s.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition shrink-0 cursor-pointer ml-1"
                          title="Delete session"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* New Chat Button at Sidebar Bottom */}
              <div className="pt-2 border-t border-slate-200/60 mt-2">
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1.5 transition shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New Chat</span>
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* =======================================================================
            MESSAGES CONTAINER / 3 PORTAL CARDS HERO
            ======================================================================= */}
        <div
          ref={chatScrollRef}
          onScroll={handleChatScroll}
          className="flex-1 flex flex-col min-h-0 h-full overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar select-text relative"
        >
          {messages.length === 0 ? (
            /* Pristine Welcome Hero with 3 High-End Portal Cards */
            <div className="m-auto flex flex-col items-center text-center max-w-3xl w-full py-4">
              {/* Sparkles Icon Badge */}
              <div className="w-11 h-11 rounded-full bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 mb-3">
                <Sparkles className="w-5 h-5 text-slate-800" />
              </div>

              {/* Dynamic Greeting */}
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-md">
                Hey there! What can I do for your {user?.role ? user.role.toLowerCase() : "enterprise"} campaigns & finance today?
              </p>

              {/* 3 High-End Portal Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full my-6">
                {portalCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-[#fcfdfe] hover:bg-slate-50/80 border border-slate-200/70 hover:border-slate-300/80 rounded-[24px] p-5 flex flex-col justify-between text-left transition-all shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md group"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-slate-100/80 flex items-center justify-center text-slate-700 mb-3 border border-slate-200/50">
                        {card.icon}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1.5">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {card.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSend(card.query)}
                      className="w-full mt-4 py-2 px-3 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-2xs transition text-center cursor-pointer active:scale-[0.98]"
                    >
                      {card.buttonText}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Conversational Message Stream with Auto-Scroll */
            <div className="space-y-5 max-w-3xl w-full mx-auto pb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs md:text-sm shadow-2xs ${
                      msg.sender === "user"
                        ? "bg-slate-900 text-white rounded-br-xs"
                        : msg.error || msg.mode === "BLOCKED"
                        ? "bg-rose-50 border border-rose-200 text-rose-900 rounded-bl-xs"
                        : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-xs"
                    }`}
                  >
                    {/* Route Indicator Header */}
                    {msg.sender === "assistant" && (
                      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200/60 gap-3">
                        {renderRouteBadge(msg.mode, msg.error)}
                        {msg.error || msg.mode === "BLOCKED" ? (
                          <span className="flex items-center gap-1 text-xs text-rose-600 font-semibold">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            Access Blocked
                          </span>
                        ) : null}
                      </div>
                    )}

                    {/* Markdown Answer */}
                    <div
                      className={`text-xs md:text-sm leading-relaxed ${
                        msg.sender === "user" ? "text-white [&_*]:text-white" : "text-slate-800"
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ ...props }) => (
                            <div className="overflow-x-auto my-3 rounded-xl border border-slate-200/90 shadow-2xs bg-white">
                              <table className="min-w-full divide-y divide-slate-200 text-left text-xs" {...props} />
                            </div>
                          ),
                          thead: ({ ...props }) => (
                            <thead className="bg-slate-100/90 text-slate-800 font-bold uppercase text-[10px] tracking-wider" {...props} />
                          ),
                          th: ({ ...props }) => (
                            <th className="px-3.5 py-2 whitespace-nowrap border-b border-slate-200/80 font-bold text-slate-800" {...props} />
                          ),
                          tbody: ({ ...props }) => (
                            <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700" {...props} />
                          ),
                          tr: ({ ...props }) => (
                            <tr className="hover:bg-slate-50/80 transition-colors" {...props} />
                          ),
                          td: ({ ...props }) => (
                            <td className="px-3.5 py-2 whitespace-nowrap" {...props} />
                          ),
                          p: ({ ...props }) => (
                            <p className="leading-relaxed mb-2 last:mb-0" {...props} />
                          ),
                          ul: ({ ...props }) => (
                            <ul className="list-disc pl-5 my-2 space-y-1 text-slate-700" {...props} />
                          ),
                          ol: ({ ...props }) => (
                            <ol className="list-decimal pl-5 my-2 space-y-1 text-slate-700" {...props} />
                          ),
                          li: ({ ...props }) => (
                            <li className="leading-relaxed" {...props} />
                          ),
                          strong: ({ ...props }) => (
                            <strong className="font-bold text-slate-900" {...props} />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>

                    {/* Citations Preview Trigger */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          {msg.citations.length} verified source{msg.citations.length > 1 ? "s" : ""}
                        </span>
                        <button
                          onClick={() => onSelectCitations(msg)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                            selectedMessageId === msg.id
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>View Citations</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-2.5 text-slate-500 text-xs p-3 bg-slate-50 rounded-2xl border border-slate-200/70 w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Evaluating deterministic AST boundaries & synthesizing answer...</span>
                </div>
              )}
            </div>
          )}

          {/* Floating Navigation Pill: Jump to First Message or Latest Message */}
          {messages.length > 2 && (
            <div className="sticky bottom-2 flex items-center justify-center space-x-2 pointer-events-none z-20">
              {showScrollTop && (
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="pointer-events-auto px-3 py-1 rounded-full bg-white/95 hover:bg-slate-100 text-slate-700 hover:text-slate-950 text-xs font-semibold shadow-md backdrop-blur-xs flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-200 animate-in fade-in"
                  title="Scroll to first message"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
                  <span>First Message</span>
                </button>
              )}
              {showScrollBottom && (
                <button
                  type="button"
                  onClick={() => scrollToBottom("smooth")}
                  className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white text-xs font-semibold shadow-md backdrop-blur-xs flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-700/60 animate-in fade-in"
                  title="Scroll to latest message"
                >
                  <span>Latest Message</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          BOTTOM INPUT PILL BAR (Pinned at bottom, messages scroll cleanly above)
          ========================================================================= */}
      <div className="w-full max-w-2xl mx-auto px-6 pb-5 pt-2 shrink-0 bg-white/95 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="w-full rounded-full bg-[#f6f7fb] border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.02)] px-3.5 py-2 flex items-center gap-2.5 focus-within:border-slate-400 focus-within:bg-white transition-all"
        >
          {/* Add Context Button (+) */}
          <button
            type="button"
            onClick={() => alert("Enterprise dataset attachment ready for CSV/PDF upload.")}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Attach data or context"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Recent Inquiries Clock Button (🕒) */}
          <button
            type="button"
            onClick={() => handleSend("What was our total operating expense and gross margin in Q3 2024?")}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Quick inquiry"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          {/* Input Box */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message here..."
            className="flex-1 bg-transparent text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none caret-slate-900"
            style={{ color: "#0f172a", WebkitTextFillColor: "#0f172a" }}
          />

          {/* Submit Arrow Button (↑) */}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white flex items-center justify-center transition shrink-0 cursor-pointer shadow-2xs"
            title="Send inquiry"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* =========================================================================
          COMMAND PALETTE / SEARCH MODAL (Triggered by Search Icon or Ctrl+K)
          ========================================================================= */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 z-50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            {/* Search Input Bar */}
            <div className="p-3.5 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/70">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations, DuckDB tables, governance handbooks..."
                className="flex-1 bg-transparent text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                ESC
              </span>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {!searchQuery.trim() ? (
                <div className="p-4 text-xs text-slate-400 text-center space-y-2">
                  <p className="font-semibold text-slate-500">Quick Searches</p>
                  <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                    <button
                      onClick={() => setSearchQuery("Q3 marketing")}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs transition cursor-pointer"
                    >
                      Q3 marketing expenses
                    </button>
                    <button
                      onClick={() => setSearchQuery("financial_summary")}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs transition cursor-pointer"
                    >
                      financial_summary
                    </button>
                    <button
                      onClick={() => setSearchQuery("paternity leave")}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs transition cursor-pointer"
                    >
                      paternity leave
                    </button>
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matching sessions, datasets, or documents found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={res.action}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                        {res.type === "session" ? (
                          <MessageSquare className="w-3.5 h-3.5" />
                        ) : res.type === "dataset" ? (
                          <Database className="w-3.5 h-3.5" />
                        ) : res.type === "document" ? (
                          <FileText className="w-3.5 h-3.5" />
                        ) : (
                          <ExternalLink className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {res.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {res.subtitle}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
