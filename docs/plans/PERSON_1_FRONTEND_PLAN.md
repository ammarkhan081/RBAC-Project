# FinSight 2.0: Person 1 (Frontend Engineer) Master Execution Plan

> **CRITICAL AGENT INSTRUCTION:**
> You are an expert Frontend AI Software Engineer. You are executing this document inside a standalone folder named `frontend/` (or `finsight-frontend/`).
> **DO NOT IMPLEMENT EVERYTHING AT ONCE.**
> 1. Read and deeply understand this entire document first.
> 2. Explain your understanding in a brief overview to the user.
> 3. Then, stop and ask the user explicitly: **"Can I execute Prompt 1?"**
> 4. Execute Prompt 1 step-by-step, run its verification, and confirm it passes.
> 5. Only after verification passes, ask: **"Prompt 1 complete and verified. Can I execute Prompt 2?"**
> 6. Continue sequentially through all prompts until the entire frontend is complete, accurate, verified, and ready to be delivered to Ammar.

---

## 1. Role, Scope & Deliverable Overview

* **Owner:** Person 1 (Frontend Engineer).
* **Target Directory:** `frontend/` (Standalone Next.js App Router project).
* **Tech Stack:** Next.js 14/15 (App Router), TypeScript, Tailwind CSS, Lucide React icons, shadcn/ui patterns.
* **Styling Theme:** Sleek dark-mode enterprise fintech aesthetic (`#0a0f1d` deep obsidian, indigo/violet glow accents, glassmorphic cards, crisp typography via Inter font).
* **Core Capabilities to Deliver:**
  1. **Authentication & Role-Scoped Navigation:** Login screen supporting FinSight roles (`C-Level`, `Finance`, `Marketing`, `HR`, `Engineering`, `General`). Dynamic role badge and role-aware menu options.
  2. **Intelligent Chat Interface (`ChatArea.tsx`):** Streaming-style text response, Markdown rendering (tables, code blocks, bullet points), and **Route Badges** displaying query route:
     * `SQL` (Green badge with database icon)
     * `RAG` (Blue badge with document icon)
     * `HYBRID` (Purple badge with sparkle/fusion icon)
     * `BLOCKED` (Red badge with shield-alert icon for unauthorized access attempts)
  3. **Collapsible Citations & Provenance Panel (`CitationsPanel.tsx`):**
     * For RAG: Source document name, section title, and highlighted passage snippet.
     * For SQL: DuckDB view queried, formatted execution SQL, and row count.
     * For HYBRID: Both document passage and SQL row table, plus a reconciliation summary card.
  4. **Security & Red-Team Dashboard (`SecurityDashboard.tsx`):**
     * Visual gauges displaying **Attack Success Rate (0%)** and **Cross-Role Leakage Rate (0%)**.
     * Bar/radial charts breaking down attacks blocked by class (Class A: Escalation, Class B: Cross-Dept SQL, Class C: Injection, Class D: Inference Chaining).
     * Live test runner status and before/after comparison table.
  5. **Real-Time Audit Log Viewer (`AuditLog.tsx`):**
     * Restricted to `C-Level` role.
     * Live stream of every query: timestamp, user, role, query, route taken, status (`ALLOWED` in green, `BLOCKED` in red), and security denial reason.
  6. **Document Upload & Admin Panel (`AdminUpload.tsx`):**
     * Role-restricted file uploader (.csv and .md).
     * Pre-upload prompt-injection sanitization warning banner.
     * C-Level user and role creation forms.
  7. **Mock API Server / Fallback Mode:**
     * Person 1 must be able to build and test the frontend completely independently without waiting for the backend to be online. Built-in Next.js Route Handlers (`app/api/mock/...`) or mock switch so every screen can be demoed and tested immediately.

---

## 2. Directory & Component Architecture

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout (Inter font, Dark theme provider, Toaster)
│   ├── page.tsx                   # Main Dashboard shell (Chat + Citations + Role selector)
│   ├── login/
│   │   └── page.tsx               # Enterprise login page with demo role quick-fill buttons
│   ├── security/
│   │   └── page.tsx               # Live Security & Red-Team Metrics Dashboard
│   ├── audit/
│   │   └── page.tsx               # C-Level Audit Log viewer
│   ├── admin/
│   │   └── page.tsx               # Document Upload & User/Role management
│   └── api/
│       └── mock/
│           ├── chat/route.ts      # Realistic mock responses for SQL, RAG, HYBRID, BLOCKED
│           ├── security/route.ts  # Mock security benchmark data
│           └── audit/route.ts     # Mock audit log stream
├── components/
│   ├── Navbar.tsx                 # Top navigation bar with active user role badge & tabs
│   ├── ChatArea.tsx               # Main conversational window with Markdown & Route Badges
│   ├── CitationsPanel.tsx         # Slide-out/docked panel showing passage & SQL provenance
│   ├── SecurityDashboard.tsx      # ASR gauges, Attack-class cards, and before/after tables
│   ├── AuditLogTable.tsx          # Filterable, searchable allow/deny log table
│   ├── UploadModal.tsx            # Document upload modal with sanitization feedback
│   └── ui/                        # Reusable primitives (Button, Card, Badge, Input, Tabs, Dialog)
├── lib/
│   ├── api.ts                     # Centralized API client connecting to FastAPI backend
│   ├── authContext.tsx            # React Context managing user session, token, and role
│   └── types.ts                   # Full TypeScript definitions matching backend API contracts
├── public/                        # Static assets, SVG icons, logo
├── tailwind.config.ts             # Custom colors, animations, glassmorphism utilities
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
```

---

## 3. Backend API Contract (Integration Specs)

Your frontend must interface with these exact backend endpoints (or your built-in mock when backend is offline):

1. **`GET /login`** (with HTTP Basic Auth header: `Authorization: Basic base64(user:pass)`)
   * Response: `{"message": "Welcome Bruce!", "role": "Marketing"}`
2. **`POST /chat`**
   * Request: `{"question": "Why did Q3 marketing expense exceed budget?"}`
   * Response:
     ```json
     {
       "user": "Bruce",
       "role": "Marketing",
       "mode": "HYBRID",
       "answer": "Q3 marketing expenses totaled $245,000, which was $45,000 over budget. According to the quarterly report, this increase was primarily driven by the enterprise rebranding campaign and Q3 fintech summit sponsorship.",
       "citations": [
         {
           "type": "sql",
           "view": "v_marketing_expenses_marketing",
           "query": "SELECT SUM(amount) FROM v_marketing_expenses_marketing WHERE quarter = 'Q3'",
           "result": [{"total": 245000}]
         },
         {
           "type": "document",
           "source": "marketing_report_q3_2024.md",
           "passage": "Marketing expenditures in Q3 peaked due to the nationwide rebranding initiative launched in August."
         }
       ],
       "reconciliation": "Agreement: The $45,000 variance in Q3 is directly corroborated by documented brand campaign investments."
     }
     ```
   * Blocked Attack Response:
     ```json
     {
       "user": "Bruce",
       "role": "Marketing",
       "mode": "BLOCKED",
       "answer": "Access Denied: Role 'Marketing' is not authorized to access HR compensation data.",
       "error": true,
       "citations": []
     }
     ```
3. **`GET /security/metrics`**
   * Response:
     ```json
     {
       "total_attacks": 42,
       "attacks_blocked": 42,
       "attack_success_rate": 0.0,
       "cross_role_leakage_rate": 0.0,
       "class_breakdown": {
         "Class A - Direct Privilege Escalation": {"tested": 10, "blocked": 10, "rate": 0.0},
         "Class B - Cross-Department SQL Phrasing": {"tested": 12, "blocked": 12, "rate": 0.0},
         "Class C - Indirect Prompt Injection": {"tested": 10, "blocked": 10, "rate": 0.0},
         "Class D - Multi-Step Inference Chaining": {"tested": 10, "blocked": 10, "rate": 0.0}
       }
     }
     ```
4. **`GET /audit/log`**
   * Response: Array of log objects:
     `[{"id": 1, "timestamp": "2026-09-10T22:15:00Z", "username": "bruce", "role": "Marketing", "query": "HR salaries", "route_taken": "BLOCKED", "authorized": false, "denial_reason": "Cross-role access violation"}]`

---

## 4. Sequential Step-by-Step Prompts for Agent Execution

---

### PROMPT 1: Next.js Project Scaffolding, Design System & Core Types

**Instruction for Agent:**
Create the standalone `frontend/` application with Next.js App Router, TypeScript, Tailwind CSS, and essential UI utilities.

**Action Items:**
1. Initialize Next.js project inside `frontend/`:
   * Dependencies: `lucide-react`, `clsx`, `tailwind-merge`, `react-markdown`, `remark-gfm`.
2. Configure `tailwind.config.ts`:
   * Dark background tokens: `bg-primary: #0a0f1d`, `bg-secondary: #111827`, `card-bg: rgba(17, 24, 39, 0.75)`.
   * Accent glow tokens: `accent-cyan: #06b6d4`, `accent-indigo: #6366f1`, `accent-purple: #a855f7`.
   * Status tokens: `status-sql: #10b981`, `status-rag: #3b82f6`, `status-hybrid: #8b5cf6`, `status-blocked: #ef4444`.
3. Create `lib/types.ts`:
   * Interfaces: `UserRole`, `AuthUser`, `CitationItem`, `ChatMessage`, `SecurityMetrics`, `AuditLogEntry`.
4. Create `lib/authContext.tsx`:
   * Provide React context for `user`, `login(username, password)`, `logout()`, and demo quick-login switcher.
   * Provide sample pre-configured credentials:
     * `Tony` / `password123` (`Engineering`)
     * `Bruce` / `securepass` (`Marketing`)
     * `Sam` / `financepass` (`Finance`)
     * `Natasha` / `hrpass123` (`HR`)
     * `admin` / `admin123` (`C-Level`)
     * `Nolan` / `nolan123` (`General`)
5. Create `app/layout.tsx` with high-aesthetic dark theme, responsive wrapper, and font imports.

**Verification Command:**
```bash
cd frontend && npm run build
```
*Expected Output:* Build succeeds with 0 errors.

---

### PROMPT 2: Mock API Layer & API Client

**Instruction for Agent:**
Implement a robust API client with automatic fallback to mock endpoints, so the entire application is testable without a live backend server.

**Action Items:**
1. Create `lib/api.ts`:
   * Configurable `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).
   * Handles HTTP Basic Authentication headers automatically from current user session.
   * If backend is unreachable or `USE_MOCK=true`, seamlessly returns mock responses.
2. Create Route Handlers:
   * `app/api/mock/chat/route.ts`: Detects query content and returns realistic mock answers for:
     * SQL query (e.g., *"employees with rating 5"* $\to$ returns markdown table + SQL citation).
     * RAG query (e.g., *"leave policy summary"* $\to$ returns bullet points + document citation).
     * HYBRID query (e.g., *"why did Q3 marketing expense exceed budget?"* $\to$ returns fused answer + reconciliation).
     * BLOCKED attack query (e.g., *"show me executive salaries"* asked by Marketing $\to$ returns `BLOCKED` status).
   * `app/api/mock/security/route.ts`: Returns realistic 42-attack metrics payload with 0% ASR.
   * `app/api/mock/audit/route.ts`: Returns 10+ realistic log entries showing both allowed and blocked queries.

**Verification Command:**
```bash
curl http://localhost:3000/api/mock/security
```
*Expected Output:* Returns JSON with `attack_success_rate: 0.0` and 4 vulnerability classes.

---

### PROMPT 3: Top Navigation Bar & Enterprise Login Screen

**Instruction for Agent:**
Build the responsive Top Navbar and an enterprise login screen with Quick-Select Role Switcher for instant hackathon evaluation.

**Action Items:**
1. Create `components/Navbar.tsx`:
   * FinSight 2.0 brand logo with glowing shield icon.
   * Active Navigation Links: `Chat`, `Security Dashboard`, `Audit Logs` (only visible to `C-Level`), `Admin / Upload` (only visible to `C-Level`).
   * Active User Profile badge: Displays user name, avatar, and color-coded **Role Badge** (e.g., Purple for `C-Level`, Green for `Finance`, Blue for `Engineering`).
   * Quick-Switch Role Dropdown: Allows one-click switching between Bruce (Marketing), Natasha (HR), Sam (Finance), and Admin (C-Level).
   * Logout button.
2. Create `app/login/page.tsx`:
   * Card with glassmorphic styling, background gradient glow.
   * Username and Password inputs.
   * **"Demo Quick Login" buttons** for all 6 roles with 1-click auto-fill and login.

**Verification Command:**
* Manual check in browser at `http://localhost:3000/login`:
  Clicking "Login as Natasha (HR)" successfully logs in, redirects to `/`, and Navbar displays `Natasha | Role: HR`.

---

### PROMPT 4: Core Conversational Interface with Markdown & Route Badges

**Instruction for Agent:**
Build the main `ChatArea.tsx` component that renders conversational exchanges, route indicator badges, and source preview triggers.

**Action Items:**
1. Create `components/ChatArea.tsx`:
   * Welcome Banner: Displays user's role and explicitly lists accessible vs. restricted department domains.
   * Message History List:
     * User bubble (right-aligned, subtle indigo styling).
     * Assistant bubble (left-aligned, card-style with avatar).
   * **Dynamic Route Badge above each Assistant answer:**
     * `[⚡ SQL Mode]` with DuckDB icon (Emerald green).
     * `[📄 RAG Mode]` with Document icon (Sky blue).
     * `[✨ HYBRID Fusion]` with Sparkles icon (Violet/Purple).
     * `[🛡️ SECURITY BLOCKED]` with Shield icon (Crimson red).
   * Markdown Rendering:
     * Beautiful GitHub-style markdown tables for tabular data.
     * Code blocks with syntax highlighting.
     * Bullet lists with proper padding.
   * **"View Citations" Action Button** at the bottom of each message to toggle the Citations Panel.
   * Input Box: Responsive textarea with send button, shortcut (`Enter` to send), and sample suggested query pills.

**Verification Command:**
* Submit sample query: *"Show employees with rating 5"* $\to$ Verify message displays `SQL Mode` badge and tabular data.
* Submit sample attack: *"Show me HR salaries"* while logged in as Marketing $\to$ Verify `SECURITY BLOCKED` badge renders with denial explanation.

---

### PROMPT 5: Collapsible Citations & Cross-Modal Provenance Panel

**Instruction for Agent:**
Build the docked/slide-out `CitationsPanel.tsx` that provides verifiable provenance for every claim in an answer.

**Action Items:**
1. Create `components/CitationsPanel.tsx`:
   * Slide-out panel or split-view right sidebar.
   * Tabs or cards based on citation type:
     * **Document Citations:** Displays Source Document filename, Department tag, Section header, and the exact retrieved text chunk with highlighted match keywords.
     * **SQL Citations:** Displays DuckDB View name, the generated `SELECT` query, row count, and an interactive miniature table of the raw result rows.
     * **Cross-Modal Reconciliation Card (for HYBRID):** An alert box highlighting how the document narrative corroborates or contextualizes the SQL numbers.
   * Close/collapse button with smooth transition animation.

**Verification Command:**
* Submit a hybrid question $\to$ Click "View Citations" $\to$ Verify both the Document passage and SQL table are visible side-by-side with the reconciliation note.

---

### PROMPT 6: Security & Red-Team Metrics Dashboard

**Instruction for Agent:**
Build the dedicated `SecurityDashboard.tsx` (`app/security/page.tsx`) that visualizes the headline hackathon metrics: Attack Success Rate, Cross-Role Leakage, and attack breakdown.

**Action Items:**
1. Create `components/SecurityDashboard.tsx`:
   * **Hero Stat Cards:**
     * **Attack Success Rate (ASR):** Bold `0.0%` with green pulse indicator (0 of 42 attacks succeeded).
     * **Cross-Role Leakage:** Bold `0.0%` (0 unauthorized data bytes leaked).
     * **Total Exploits Tested:** `42 / 42 Blocked`.
     * **Security Boundary:** `Active (Authorization-Native Views & Chroma Filters)`.
   * **Attack Class Breakdown (4 Cards/Gauges):**
     * Class A: Direct Privilege Escalation (10/10 Defended).
     * Class B: Cross-Department SQL Injection (12/12 Defended).
     * Class C: Indirect Document Prompt Injection (10/10 Defended).
     * Class D: Multi-Step Inference Chaining (10/10 Defended).
   * **Before vs. After Impact Table:**
     * Displays FinSight 1.0 (vulnerable regex allowlist, unverified) vs FinSight 2.0 (role views + 0% ASR).
   * **"Re-run Security Suite" interactive button:** Triggers a simulated or real call to `/security/metrics` with loading spinner.

**Verification Command:**
* Navigate to `http://localhost:3000/security` $\to$ Confirm all stat cards, gauges, and breakdown tables render with zero visual defects.

---

### PROMPT 7: Real-Time Audit Log Viewer (C-Level Restricted)

**Instruction for Agent:**
Build `AuditLogTable.tsx` (`app/audit/page.tsx`) providing an immutable live audit trail of every access attempt.

**Action Items:**
1. Create `components/AuditLogTable.tsx`:
   * RBAC Gate: If current user role is not `C-Level`, display a clean "Access Restricted: C-Level Executives Only" shield screen.
   * If `C-Level`:
     * Search bar: Filter by username, role, or keyword.
     * Status Filter: `All`, `Allowed Only`, `Blocked Only`.
     * Log Table Columns: `Timestamp`, `User`, `Role`, `Query`, `Engine/Route`, `Status` (Color-coded badge: Green `ALLOWED` / Red `BLOCKED`), `Denial Reason / Audit Note`.
     * Export button: Download audit logs as CSV.

**Verification Command:**
* Log in as `Bruce` (Marketing) $\to$ Visit `/audit` $\to$ Confirm access denied screen is shown.
* Log in as `admin` (C-Level) $\to$ Visit `/audit` $\to$ Confirm table renders with full log history and filters work.

---

### PROMPT 8: Document Upload & Admin Management Screen

**Instruction for Agent:**
Build the `AdminUpload.tsx` (`app/admin/page.tsx`) interface for secure document ingestion with sanitization alerts.

**Action Items:**
1. Create `components/UploadModal.tsx` / `app/admin/page.tsx`:
   * Role selection dropdown (assign document to `Finance`, `Marketing`, `HR`, `Engineering`, or `General`).
   * Drag-and-drop file uploader supporting `.csv` and `.md`.
   * **Prompt-Injection Sanitization Feedback Banner:**
     * Simulates or connects to `/upload-docs` sanitization check. If a file contains prompt-injection phrases, displays:
       `⚠️ Warning: 1 suspicious instruction pattern detected and sanitized before vectorization.`
   * C-Level User Creation Form: Add user, assign role, set password.
   * C-Level Role Creation Form: Add new custom role.

**Verification Command:**
* Test file upload interaction $\to$ Verify role selection dropdown and sanitization warning banner trigger properly.

---

### PROMPT 9: End-to-End Polish, Responsiveness & Delivery Verification

**Instruction for Agent:**
Perform end-to-end polish, verify responsive layouts, test real backend connectivity with fallback, and prepare the final deliverable.

**Action Items:**
1. Polish UI:
   * Smooth transitions for modals and citations drawer.
   * Loading states (skeleton loaders) during chat generation.
   * Error toast notifications.
2. Verify Backend Integration toggle:
   * In `lib/api.ts`, test connecting to `http://localhost:8000`. If backend is running, it calls live API; if offline, it seamlessly falls back to mock data.
3. Run comprehensive production build:
   ```bash
   npm run build
   npm run lint
   ```
4. Output Final Report:
   * Announce: *"All 9 Prompts Completed and Verified. Standalone Next.js Frontend is 100% complete, fully responsive, and ready for integration into RBAC-Project-main."*

---

## 5. Person 1 Deliverable Checklist

When Person 1 finishes, their folder (`finsight-frontend/`) will contain:
- [ ] Complete Next.js 14/15 App Router source code with zero compile or lint errors.
- [ ] Working Chat interface with Markdown tables and Route Badges (`SQL`, `RAG`, `HYBRID`, `BLOCKED`).
- [ ] Interactive Citations Panel displaying document excerpts and SQL queries.
- [ ] Standalone Security Dashboard displaying 0% ASR and attack breakdown.
- [ ] C-Level Audit Log stream with allow/deny filters.
- [ ] Demo Quick-Login switcher for all 6 roles.
- [ ] Built-in mock API so judges or team members can test immediately even without backend running.
