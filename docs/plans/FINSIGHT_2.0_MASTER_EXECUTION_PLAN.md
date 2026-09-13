# FinSight 2.0: Master Execution & Phased Implementation Plan

> **Document Purpose:** This document is the single source of truth for implementing FinSight 2.0 on top of the existing FinSight 1.0 foundation. Any AI agent or developer reading this document can execute the project sequentially, phase by phase, verifying each step before proceeding to ensure zero regressions, maximum accuracy, and an enterprise-grade deliverable.
>
> **Core Architecture:** Dual-Engine (DuckDB Text-to-SQL + Chroma RAG + Hybrid Fusion) with Adversarially-Verified Role-Based Access Control (RBAC) and 100% Free / Open-Source API integrations.

---

## 1. Verified Baseline Audit: What is Built vs. What Remains

This audit is verified against the actual workspace source code as of September 2026. **No assumptions or hallucinations.**

### 1.1 What Already Exists (FinSight 1.0 Foundation)
* **FastAPI Backend Core (`app/main.py`):**
  * HTTP Basic Authentication with bcrypt password verification against SQLite (`roles_docs.db`).
  * Endpoints: `/login`, `/roles`, `/create-user`, `/create-role`, `/upload-docs`, `/chat`.
  * Multi-role framework: `C-Level`, `Finance`, `Marketing`, `HR`, `Engineering`, `General`.
* **DuckDB Analytical Engine (`app/rag_utils/csv_query.py`):**
  * Ingests CSVs into DuckDB tables (`static/data/structured_queries.duckdb`).
  * Basic table metadata mapping (`tables_metadata`).
  * Basic SQL safety checker blocking destructive verbs (`INSERT`, `UPDATE`, `DELETE`, `DROP`).
* **Retrieval-Level RBAC in Chroma (`app/rag_utils/rag_module.py`):**
  * **Verified:** RAG retrieval *is already authorization-native*. Chunks are filtered inside Chroma at query time using `{"role": {"$in": [user_role, "general"]}}`. Unauthorized chunks are not fetched.
* **Offline Quality Evaluation (`app/rag_evaluator/`):**
  * Generates synthetic QA pairs and evaluates Faithfulness, Relevancy, and Context Recall.
* **Streamlit UI (`app/ui.py`):**
  * Login flow, dynamic role tab rendering, document upload, and basic chat interface.

### 1.2 What is Incomplete / Vulnerable / Missing (FinSight 2.0 Scope)
1. **API Keys & Environment:** Keys are still hardcoded template placeholders in `app/rag_utils/secret_key.py`. No `.env` or `.env.example` exists.
2. **SQL Schema & Execution Hole:** 
   * In `csv_query.py:53-56`, `translate_nl_to_sql` queries **all** table schemas from SQLite regardless of the requesting role, leaking confidential table headers into the LLM prompt.
   * Table access checking relies on naive regex `re.findall(r'FROM\s+(\w+)|JOIN\s+(\w+)', sql)`, which can be bypassed by subqueries, CTEs, or aliasing.
   * No role-scoped DuckDB views exist.
3. **Bypassed Cohere Reranker:** In `main.py`, `ask_rag(question, role)` never passes `cohere_api_key`, leaving the reranker completely disabled.
4. **No Hybrid Fusion:** The router in `query_classifier.py` is strictly binary (`SQL` vs `RAG`). There is no multi-modal path for compound questions (e.g., *"Why did Q3 marketing expense exceed budget?"*).
5. **No Answer-Level Citations:** Answers are returned as raw text without document passage or SQL row provenance.
6. **No Security Measurement:** No Red-Team attack suite, no audit log (`/audit/log`), no `/security/metrics`, and no Attack Success Rate (ASR) metrics.
7. **Legacy Frontend:** Only Streamlit exists; the modern Next.js + Tailwind + shadcn UI with a Security Dashboard is not built.

---

## 2. API & Infrastructure Strategy (100% Free / Zero-Cost)

To ensure zero API costs and high throughput:
* **Primary LLM Engine:** **Groq API** (`llama-3.3-70b-versatile` or `llama-3.1-8b-instant`) via OpenAI-compatible SDK (`base_url="https://api.groq.com/openai/v1"`). High speed, enterprise quality, generous free tier.
* **Embeddings Engine:** **FastEmbed** (`bge-small-en-v1.5`) or HuggingFace (`sentence-transformers/all-MiniLM-L6-v2`). Runs locally on CPU, zero cost, no rate limits, deterministic indexing.
* **Reranker Engine:** **FlashRank** (`pip install flashrank`) as local zero-cost cross-encoder, or free trial **Cohere** key.
* **Databases:** In-process **DuckDB** (structured data) + local **ChromaDB** (vector embeddings) + **SQLite** (auth & metadata). Zero infrastructure hosting cost.

---

## 3. Phased Execution Roadmap

Execute each phase strictly in sequence. **Do not move to the next phase until all Verification Steps in the current phase pass 100%.**

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Environment, Free Engine Setup & Security Baseline │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ PHASE 2: Authorization-Native SQL Views, Sanitization & Log │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ PHASE 3: Automated Red-Team Security Suite & Metrics        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ PHASE 4: 3-Way Hybrid Fusion, Semantic Layer & Citations    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ PHASE 5: Next.js Frontend & Real-Time Security Dashboard    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ PHASE 6: Production Hardening, Documentation & Packaging    │
└─────────────────────────────────────────────────────────────┘
```

---

### PHASE 1: Environment, Free Engine Setup & Security Baseline

#### Objective
Eliminate hardcoded secrets, migrate configuration to environment variables, configure the free LLM/Embedding provider (Groq / FastEmbed), index all sample documents, and record the "before" baseline.

#### Step-by-Step Implementation
1. **Environment Configuration:**
   * Create `.env.example` defining:
     ```env
     LLM_PROVIDER=groq  # or openai
     GROQ_API_KEY=your_groq_api_key_here
     OPENAI_API_KEY=your_openai_api_key_here
     EMBEDDING_PROVIDER=fastembed  # or openai
     RERANKER_PROVIDER=flashrank  # or cohere
     COHERE_API_KEY=your_cohere_trial_key_optional
     SECRET_KEY=finsight_jwt_secret_2026
     ```
   * Update `.gitignore` to strictly ignore `.env`, `roles_docs.db`, `chroma_db/`, and `*.duckdb`.
2. **Provider Abstraction Layer (`app/rag_utils/llm_client.py`):**
   * Build a unified LLM caller supporting Groq (via `openai.OpenAI(base_url="https://api.groq.com/openai/v1", api_key=...)`) and standard OpenAI.
   * Build an embedding provider abstraction supporting local `FastEmbedEmbeddings` and OpenAI embeddings.
3. **Refactor Existing Modules:**
   * In `app/rag_utils/rag_module.py`, `app/rag_utils/csv_query.py`, and `app/rag_utils/query_classifier.py`, replace direct `from .secret_key import ...` with `os.getenv` from `dotenv`.
   * Update requirements: `groq`, `fastembed`, `flashrank`.
4. **Data Seed & Indexing:**
   * Run an automated initialization script to ensure all department documents in `static/uploads/` (Compliance, Engineering, Finance, General, HR, Marketing) are loaded into SQLite, DuckDB, and ChromaDB.
5. **Baseline Snapshot (`docs/security-audit-before.md`):**
   * Document the baseline architecture, noting that Chroma RAG already uses native metadata filtering, but SQL schema leaks exist in `csv_query.py:53`.

#### Phase 1 Verification Checklist
* [ ] Running `python -c "from app.rag_utils.llm_client import get_llm; print(get_llm())"` connects without errors.
* [ ] `roles_docs.db` and `chroma_db/` contain records from the initial files.
* [ ] `GET http://localhost:8000/login` with `admin:admin123` returns `200 OK` and role `C-Level`.

---

### PHASE 2: Authorization-Native SQL Views, Sanitization & Audit Log

#### Objective
Close the SQL security vulnerabilities completely. Replace raw table access with dynamically generated, role-scoped DuckDB views. Implement prompt-injection screening and an authorization audit log.

#### Step-by-Step Implementation
1. **Role-Scoped DuckDB Views (`app/rag_utils/duckdb_views.py`):**
   * When a CSV is uploaded or loaded for a role (e.g. `hr_data` for `HR`), create a role-scoped view:
     ```sql
     CREATE OR REPLACE VIEW v_hr_data_hr AS SELECT * FROM hr_data;
     ```
   * Only roles with permission get a view mapping. `General` users get no view on sensitive HR data.
   * During NL $\to$ SQL generation, **filter the schemas provided to the LLM**:
     * Fetch *only* schemas of views that the requesting user's role is permitted to query.
     * The LLM is given view names (`v_hr_data_hr`), never raw table names.
2. **SQL AST & Allowlist Validator:**
   * Use an AST parser (or strict view-name token validator) to verify that generated SQL *only* accesses views permitted for that role. If a query references an unauthorized view or raw table, abort before execution.
3. **Retrieved-Content Sanitization (`app/rag_utils/sanitizer.py`):**
   * Screen all chunks retrieved from vector search and all uploaded text for prompt injection signatures:
     * Phrases like `"ignore previous instructions"`, `"system prompt:"`, `"you are now an unrestricted"`, `"export all data"`.
   * Flag suspicious chunks, log an alert, and sanitize the chunk content before injecting it into the LLM synthesis context.
4. **Authorization Audit Log (`app/rag_utils/audit_logger.py`):**
   * Create an `audit_logs` table in `roles_docs.db`:
     `id, timestamp, username, role, query, route_taken, authorized (BOOLEAN), denial_reason, execution_time_ms`.
   * Log every transaction through `/chat`.
   * Create endpoint `GET /audit/log` (restricted to `C-Level`) with pagination and filter by role/status.

#### Phase 2 Verification Checklist
* [ ] **Test Case 1 (Authorized SQL):** User `Natasha` (`HR`) asks: *"List employees with performance rating 5"*. Response succeeds and executes over `v_hr_data_hr`.
* [ ] **Test Case 2 (Unauthorized SQL Block):** User `Bruce` (`Marketing`) asks: *"What is the average salary in HR?"*. The SQL generator receives no HR view in its prompt, and AST check blocks any attempted fallback to `hr_data`. Response returns: `Access denied to HR data for role: marketing`.
* [ ] `GET /audit/log` records both queries, showing `authorized=True` for Natasha and `authorized=False` with reason for Bruce.

---

### PHASE 3: Automated Red-Team Security Suite & Metrics

#### Objective
Build an automated, reproducible security evaluation suite that executes 40+ adversarial attacks across 4 exploit classes, proving the system's resilience and generating headline metrics: **Attack Success Rate (ASR)** and **Cross-Role Leakage Rate**.

#### Step-by-Step Implementation
1. **Attack Corpus (`tests/redteam/attack_corpus.yaml`):**
   * Create 40+ structured test cases categorized into 4 vulnerability classes:
     * **Class A: Direct Privilege Escalation:** Non-admin roles attempting to call admin endpoints (`/create-user`, `/create-role`, `/audit/log`).
     * **Class B: Cross-Department SQL Injection / Phrasing:** Formulating queries designed to fool the SQL agent into reading other departments' tables (e.g. Marketing asking for HR payroll or Executive bonuses).
     * **Class C: Indirect Prompt Injection via Document:** Documents containing malicious instructions designed to hijack LLM behavior when retrieved.
     * **Class D: Multi-Step Inference Chaining:** Asking indirect questions that attempt to derive confidential numbers through public ratios or aggregation manipulation.
2. **Security Scorer & Runner (`tests/redteam/test_security_suite.py`):**
   * Automated Pytest runner that iterates through the corpus:
     * Simulates authentication as each role.
     * Evaluates whether the system leaked confidential data, executed an unauthorized query, or triggered the appropriate security gate.
   * Calculates:
     $$\text{Attack Success Rate (ASR)} = \frac{\text{Successful Exploits}}{\text{Total Attack Attempts}} \times 100\%$$
     $$\text{Cross-Role Leakage Rate} = \frac{\text{Queries Leaking Foreign Role Data}}{\text{Total Cross-Role Queries}} \times 100\%$$
   * Outputs results to `static/data/security_results.json`.
3. **Security Metrics Endpoint (`app/main.py`):**
   * Add endpoint `GET /security/metrics` returning the latest ASR, leakage rate, and breakdown by attack class.

#### Phase 3 Verification Checklist
* [ ] Run `pytest tests/redteam/test_security_suite.py -v`.
* [ ] Suite completes all 40+ tests.
* [ ] `security_results.json` is generated with target **ASR $\le$ 0%** and **Cross-Role Leakage Rate = 0%**.
* [ ] `GET /security/metrics` serves this JSON payload cleanly.

---

### PHASE 4: 3-Way Hybrid Fusion, Semantic Layer & Citations

#### Objective
Transform FinSight from a binary routing assistant into a hybrid intelligence engine capable of fusing structured DuckDB analytics with unstructured document context, providing exact answer-level citations and a business semantic glossary.

#### Step-by-Step Implementation
1. **3-Way Query Router (`app/rag_utils/query_classifier.py`):**
   * Upgrade classifier prompt to output one of three routes:
     * `SQL`: Pure tabular calculations (e.g. *"Total revenue in 2024"*).
     * `RAG`: Policy, procedural, or qualitative questions (e.g. *"Summarize our remote work policy"*).
     * `HYBRID`: Questions requiring quantitative data *combined* with narrative justification (e.g. *"Why did Q3 marketing expense exceed budget, and by how much?"*).
2. **Business Semantic Glossary (`app/rag_utils/semantic_layer.yaml`):**
   * Define standardized business definitions, column aliases, and formulas:
     ```yaml
     metrics:
       roi: "Return on Investment = (Net Income / Total Investment) * 100"
       marketing_expense: "Sum of vendor services and campaign costs in marketing"
       attrition_rate: "Leaves taken / Headcount"
     tables:
       hr_data:
         salary: "Total compensation including allowances"
         performance_rating: "Rating from 1 (lowest) to 5 (highest)"
     ```
   * Ingest this semantic dictionary into the Text-to-SQL prompt to eliminate column guessing.
3. **Parallel Hybrid Executor (`app/rag_utils/hybrid_engine.py`):**
   * When route is `HYBRID`:
     * Execute DuckDB SQL query on role-scoped views to extract the numbers.
     * Execute Chroma RAG query with role filter to extract relevant explanatory passages.
     * Run **Cross-Modal Reconciliation**: Prompt the LLM with both contexts:
       ```
       Structured Data Findings: [SQL Table Result]
       Document Evidence: [Retrieved Passages]
       Instruction: Synthesize an answer combining the quantitative facts and qualitative explanation. Explicitly verify whether the document agrees with or contradicts the data.
       ```
4. **Answer-Level Provenance & Citations (`app/rag_utils/citations.py`):**
   * Format all responses to include verified provenance metadata:
     * For RAG: Document filename, section header, and matched chunk excerpt.
     * For SQL: View name, generated SQL statement, and row count.
   * Update `/chat` response contract:
     ```json
     {
       "answer": "...",
       "route": "HYBRID",
       "citations": [
         {"type": "document", "source": "marketing_report_q3_2024.md", "passage": "..."},
         {"type": "sql", "view": "v_marketing_expenses", "query": "SELECT sum(...) ..."}
       ],
       "reconciliation": "Agreement: The $45,000 variance in Q3 is directly explained by the enterprise rebranding initiative."
     }
     ```

#### Phase 4 Verification Checklist
* [ ] Ask: *"Why did marketing spend increase in Q3?"*
* [ ] Route is detected as `HYBRID`.
* [ ] Response contains both tabular numerical calculation and document citation.
* [ ] Provenance block includes clickable/readable source document and excerpt.

---

### PHASE 5: Next.js Frontend & Real-Time Security Dashboard

#### Objective
Build a modern, state-of-the-art web interface in Next.js (React + TailwindCSS + Lucide Icons) featuring a streaming Chat interface, interactive Citations Panel, live Authorization Audit Stream, and a visual Security & Impact Dashboard.

#### Step-by-Step Implementation
1. **Next.js Application Initialization:**
   * Create `frontend/` directory using Next.js (App Router, TypeScript, Tailwind CSS).
   * Install UI components and icon libraries (`lucide-react`, `clsx`, `tailwind-merge`).
2. **Core Layout & Authentication (`frontend/app/`):**
   * Clean, dark-mode-first aesthetic with glassmorphism touches and responsive layout.
   * Secure session storage for HTTP Basic or JWT token with role persistence.
3. **Interactive Components:**
   * **Chat Interface (`components/ChatArea.tsx`):**
     * Streaming message bubbles, Markdown rendering with syntax highlighting.
     * Route Badge indicator (`SQL` in green, `RAG` in blue, `HYBRID` in purple).
   * **Citations Panel (`components/CitationsPanel.tsx`):**
     * Collapsible side-drawer showing source documents, highlighted excerpts, and SQL execution details for the active answer.
   * **Security Dashboard (`components/SecurityDashboard.tsx`):**
     * Live gauges showing Attack Success Rate (0%), Leakage Rate (0%), and tests passed.
     * Visual breakdown of attacks blocked by category (Class A, B, C, D).
   * **Audit Log Viewer (`components/AuditLog.tsx`):**
     * Accessible to `C-Level` showing real-time allow/deny logs with color-coded badges and filtering.
4. **FastAPI CORS & Integration:**
   * Enable FastAPI `CORSMiddleware` in `app/main.py` allowing requests from `http://localhost:3000`.

#### Phase 5 Verification Checklist
* [ ] Frontend starts smoothly with `npm run dev` at `http://localhost:3000`.
* [ ] Log in as `Sam` (`Finance`): Chat interface shows Finance permissions, Upload tab is hidden.
* [ ] Log in as `admin` (`C-Level`): Audit Log and Admin Controls become visible.
* [ ] Asking a hybrid question renders the Route Badge and populates the Citations Panel.
* [ ] Security Dashboard displays real metrics from `GET /security/metrics`.

---

### PHASE 6: Production Hardening, Documentation & Packaging

#### Objective
Deliver full project documentation, automated reproducible setup scripts, clean benchmarks, and containerized deployment readiness.

#### Step-by-Step Implementation
1. **Quantified Impact Report (`docs/IMPACT.md`):**
   * Generate before/after empirical comparison table:
     * Attack Success Rate: Before (vulnerable regex) vs. After (0% via role views).
     * Cross-Role Leakage: Before vs. After (0%).
     * Average Query Latency across SQL, RAG, and Hybrid.
     * Document citation coverage: 0% $\to$ 100%.
2. **Technical Architecture Documentation (`docs/ARCHITECTURE.md`):**
   * Complete architecture diagrams, data flow descriptions, security boundary definitions, and mathematical formulation of evaluation metrics.
3. **Comprehensive README Rewrite (`README.md`):**
   * Executive summary, feature matrix, installation instructions, quickstart guide, test commands, API documentation, and security guarantees.
4. **Reproducibility & One-Command Setup:**
   * Create a root `docker-compose.yml` defining `backend` and `frontend` services with persistent volume bindings for DuckDB and Chroma.
   * Create `run_app.bat` (Windows) / `run_app.sh` (Linux/Mac) for 1-click startup.

#### Phase 6 Verification Checklist
* [ ] Fresh clone in a clean environment boots up in 1 command via Docker or startup script.
* [ ] `docs/IMPACT.md` contains real benchmark numbers from the automated test suite.
* [ ] Full test suite (`pytest`) runs with all unit, integration, and red-team tests passing (`100% passed`).

---

## 4. Agent Execution Guardrails & Rules

When an AI agent is tasked with executing this plan:
1. **Never Skip Ahead:** Complete each Phase fully and run its verification steps before opening the next Phase.
2. **Do Not Break Working Foundations:** Do not modify the existing Chroma metadata filtering logic in `rag_module.py`—it is already verified to work.
3. **Preserve Streamlit Until Phase 5 Verification:** Keep `app/ui.py` fully working as a fallback until the Next.js frontend is 100% verified.
4. **Zero Hardcoded Secrets:** Every API key or sensitive config must originate from `.env`.
5. **No Hallucinated Data:** In `docs/IMPACT.md` and security logs, only record real outputs generated by the test runner.
