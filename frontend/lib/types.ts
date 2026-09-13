export type UserRole = "C-Level" | "Finance" | "Marketing" | "HR" | "Engineering" | "General";

export interface AuthUser {
  username: string;
  role: UserRole;
  email?: string;
  token?: string;
}

export interface CitationItem {
  type: "sql" | "document";
  view?: string;
  query?: string;
  result?: Record<string, unknown>[];
  source?: string;
  passage?: string;
  section?: string;
  department?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  mode?: "SQL" | "RAG" | "HYBRID" | "BLOCKED";
  citations?: CitationItem[];
  reconciliation?: string;
  error?: boolean;
}

export interface SecurityMetrics {
  total_attacks: number;
  attacks_blocked: number;
  attack_success_rate: number;
  cross_role_leakage_rate: number;
  class_breakdown: Record<string, { tested: number; blocked: number; rate: number }>;
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  username: string;
  role: UserRole;
  query: string;
  route_taken: string;
  authorized: boolean;
  denial_reason?: string;
}