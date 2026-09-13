"use client";

import React, { useState } from "react";
import ChatArea from "@/components/ChatArea";
import CitationsPanel from "@/components/CitationsPanel";
import { ChatMessage } from "@/lib/types";

export default function DashboardPage() {
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [isCitationsOpen, setIsCitationsOpen] = useState(false);

  const handleSelectCitations = (message: ChatMessage | null) => {
    if (!message) {
      setIsCitationsOpen(false);
      setSelectedMessage(null);
      return;
    }
    if (selectedMessage?.id === message.id && isCitationsOpen) {
      setIsCitationsOpen(false);
      setSelectedMessage(null);
    } else {
      setSelectedMessage(message);
      setIsCitationsOpen(true);
    }
  };

  const handleCloseCitations = () => {
    setIsCitationsOpen(false);
    setSelectedMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#f1f3f8] p-4 sm:p-6 md:p-8 flex items-center justify-center relative overflow-hidden">
      {/* Ambient pastel glow matching reference backdrop */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />

      {/* Main Floating Canvas (Exact original max-w-5xl size, perfectly centered in the middle, rounded-[32px], never touching window borders) */}
      <div className="w-full max-w-5xl h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)] min-h-[600px] max-h-[920px] bg-white text-slate-900 rounded-[32px] md:rounded-[36px] shadow-[0_20px_70px_rgba(0,0,0,0.06)] border border-slate-200/80 flex flex-col overflow-hidden relative z-10 transition-all">
        <ChatArea
          onSelectCitations={handleSelectCitations}
          selectedMessageId={selectedMessage?.id}
          onToggleCitations={() => setIsCitationsOpen(!isCitationsOpen)}
        />
      </div>

      {/* Provenance & Citations Floating Card (Floating card with breathing room, never touches screen borders) */}
      {isCitationsOpen && (
        <div className="fixed inset-y-6 right-6 sm:inset-y-8 sm:right-8 w-full max-w-md sm:w-[460px] z-50 animate-in slide-in-from-right-4 duration-200">
          <CitationsPanel
            isOpen={isCitationsOpen}
            onClose={handleCloseCitations}
            message={selectedMessage}
          />
        </div>
      )}
    </div>
  );
}