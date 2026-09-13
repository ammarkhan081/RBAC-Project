import { AuditLogEntry, ChatMessage, CitationItem, SecurityMetrics } from "./types";
import { DEMO_USERS, getAccountPassword } from "./accounts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

async function fetchWithFallback<T>(endpoint: string, mockEndpoint: string, options: RequestInit = {}): Promise<T> {
  if (USE_MOCK) {
    const mockRes = await fetch(mockEndpoint, options);
    if (!mockRes.ok) throw new Error(`Mock HTTP error! status: ${mockRes.status}`);
    return await mockRes.json();
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Backend endpoint ${endpoint} unreachable. Falling back to mock route ${mockEndpoint}.`, err);
    const mockRes = await fetch(mockEndpoint, options);
    if (!mockRes.ok) throw new Error(`Mock HTTP error! status: ${mockRes.status}`);
    return await mockRes.json();
  }
}

interface RawChatResponse {
  id?: string;
  user?: string;
  role?: string;
  mode?: "SQL" | "RAG" | "HYBRID" | "BLOCKED";
  answer?: string;
  text?: string;
  error?: boolean;
  citations?: CitationItem[];
  reconciliation?: string;
}

export async function sendChatMessage(
  question: string,
  role: string = "Finance",
  username: string = "Ammar Ayaz",
  password?: string
): Promise<ChatMessage> {
  const userObj = DEMO_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
  const pass = password || userObj?.pass || getAccountPassword(username) || "password123";
  const credentials = typeof window !== "undefined"
    ? btoa(`${username}:${pass}`)
    : Buffer.from(`${username}:${pass}`).toString("base64");

  const res = await fetchWithFallback<RawChatResponse>("/chat", "/api/mock/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Role": role,
      "X-User-Name": username,
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({ question, role }),
  });

  return {
    id: res.id || crypto.randomUUID(),
    sender: "assistant",
    text: res.answer || res.text || (res as any).response || "",
    mode: res.mode || "HYBRID",
    citations: res.citations || [],
    reconciliation: res.reconciliation,
    error: res.error || res.mode === "BLOCKED",
  };
}

export async function getSecurityMetrics(): Promise<SecurityMetrics> {
  return fetchWithFallback<SecurityMetrics>("/security/metrics", "/api/mock/security");
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetchWithFallback<any>("/audit/log", "/api/mock/audit");
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.logs)) return res.logs;
  return [];
}