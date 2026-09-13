# FinSight 2.0: Integration, End-to-End Orchestration & Verification Plan

> **CRITICAL AGENT INSTRUCTION:**
> You are the Lead Systems Integration AI Engineer working directly with Ammar Khan inside `RBAC-Project-main`.
> Your mission is to take the completed, verified deliverables from Person 1 (Frontend), Person 2 (Security Core), and Person 3 (Intelligence Engine), integrate them seamlessly into a single unified enterprise codebase, verify end-to-end behavior, and deliver a 100% working, award-winning project ready for demo video recording.
>
> **EXECUTE SEQUENTIALLY, PROMPT BY PROMPT:**
> 1. Read and understand this entire master integration document.
> 2. Explain your integration roadmap to Ammar.
> 3. Stop and ask: **"Can I execute Integration Prompt 1?"**
> 4. Execute Prompt 1, verify its outputs, and confirm completion.
> 5. Ask: **"Integration Prompt 1 verified. Can I execute Integration Prompt 2?"**
> 6. Continue until Prompt 6 is complete and all systems are green.

---

## 1. System Topology: How the Pieces Fit Together

```
                  ┌────────────────────────────────────────────────────────┐
                  │          PERSON 1 DELIVERABLE: Next.js UI              │
                  │   (ChatArea, CitationsPanel, SecurityDashboard,        │
                  │              AuditLogTable, AdminUpload)               │
                  └───────────────────────────┬────────────────────────────┘
                                              │ HTTP / JSON (port 3000 → 8000)
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │                 FASTAPI BACKEND CORE                   │
                  │                    (app/main.py)                       │
                  │   CORS Enabled · HTTP Basic / bcrypt · SQLite Auth     │
                  └─────────────┬────────────────────────────┬─────────────┘
                                │                            │
                ┌───────────────▼──────────────┐  ┌──────────▼────────────────┐
                │ PERSON 2: SECURITY ENGINE   │  │ PERSON 3: INTELLIGENCE    │
                │ • llm_client (Groq/FastEmbed)│  │ • 3-Way Query Classifier  │
                │ • duckdb_views (Role Views)  │  │ • semantic_layer.yaml     │
                │ • sql_validator (AST Guard)  │  │ • hybrid_engine (Fusion)  │
                │ • sanitizer (Prompt Def.)    │  │ • citations (Provenance)  │
                │ • audit_logger (SQLite Log)  │  │ • rag_module + FlashRank  │
                │ • 40+ Red-Team Suite (ASR 0%)│  │ • csv_query + Validation  │
                └───────────────┬──────────────┘  └──────────┬────────────────┘
                                │                            │
                                └──────────────┬─────────────┘
                                               ▼
                         ┌─────────────────────────────────────────┐
                         │              DATA STORES                │
                         │ • DuckDB: Role-scoped analytical views  │
                         │ • ChromaDB: Metadata-filtered vectors   │
                         │ • SQLite: Users, roles, audit logs      │
                         └─────────────────────────────────────────┘
```

---

## 2. Pre-Integration Merge Layout

Ammar will copy the completed folders into `RBAC-Project-main`. The files will be organized into this final unified structure:

```
RBAC-Project-main/
├── frontend/                     # From Person 1 (Next.js 14/15 App Router)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── app/
│   ├── main.py                   # Unified FastAPI backend
│   ├── rag_utils/
│   │   ├── llm_client.py         # From Person 2 (Groq + FastEmbed + FlashRank)
│   │   ├── duckdb_views.py       # From Person 2 (Dynamic role views)
│   │   ├── sql_validator.py      # From Person 2 (AST safety parser)
│   │   ├── sanitizer.py          # From Person 2 (Prompt injection screening)
│   │   ├── audit_logger.py       # From Person 2 (Audit trail)
│   │   ├── query_classifier.py   # From Person 3 (3-way router: SQL | RAG | HYBRID)
│   │   ├── semantic_layer.yaml   # From Person 3 (Business glossary)
│   │   ├── semantic_engine.py    # From Person 3 (Glossary prompt injector)
│   │   ├── csv_query.py          # From Person 3 (Refactored SQL agent)
│   │   ├── rag_module.py         # From Person 3 (Active FlashRank reranker)
│   │   ├── rag_chain.py          # From Person 3 (RAG executor with citations)
│   │   ├── hybrid_engine.py      # From Person 3 (Parallel fusion & reconciliation)
│   │   └── citations.py          # From Person 3 (Structured provenance builder)
│   └── rag_evaluator/            # Evaluation scripts & benchmarks
├── tests/
│   ├── redteam/                  # From Person 2 (40+ attack cases & runner)
│   │   ├── attack_corpus.yaml
│   │   └── test_security_suite.py
│   ├── test_intelligence_engine.py # From Person 3 (Fusion & routing tests)
│   ├── test_sql_validator.py     # From Person 2 (AST parser tests)
│   └── test_chatbot.py           # Backend endpoint tests
├── static/
│   ├── data/
│   │   ├── structured_queries.duckdb
│   │   └── security_results.json # Generated by Red-Team suite
│   └── uploads/                  # Seeded department files (.md & .csv)
├── docs/
│   ├── security-audit-before.md  # From Person 2
│   ├── IMPACT.md                 # Quantified benchmark report
│   └── ARCHITECTURE.md           # Unified architecture specification
├── .env                          # Unified environment configuration
├── requirements.txt              # Unified backend python packages
└── README.md                     # Comprehensive documentation
```

---

## 3. Sequential Integration Prompts

---

### INTEGRATION PROMPT 1: File Merge & Dependency Harmonization

**Instruction for Integration Agent:**
Merge files from the 3 incoming folders into the workspace, resolve any path conflicts, and harmonize the backend `requirements.txt` and `.env` settings.

**Action Items:**
1. Place Person 1's files into `frontend/`.
2. Place Person 2's security utilities into `app/rag_utils/` and tests into `tests/redteam/`.
3. Place Person 3's intelligence utilities into `app/rag_utils/`.
4. Harmonize `requirements.txt`:
   ```txt
   fastapi
   uvicorn[standard]
   pydantic
   python-dotenv
   passlib[bcrypt]
   sqlite3
   duckdb
   tabulate
   sqlglot
   pyyaml
   groq
   openai
   langchain
   langchain-community
   langchain-core
   chromadb
   fastembed
   flashrank
   pytest
   requests
   ```
5. Harmonize `.env` in root:
   ```env
   LLM_PROVIDER=groq
   GROQ_API_KEY=your_groq_api_key_here
   EMBEDDING_PROVIDER=fastembed
   RERANKER_PROVIDER=flashrank
   FASTAPI_PORT=8000
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
6. In `frontend/lib/api.ts`, set `USE_MOCK = false` (or fallback to live backend at `http://localhost:8000`).

**Verification Command:**
```bash
python -c "import fastapi, duckdb, sqlglot, groq, fastembed, flashrank; print('All core dependencies imported successfully!')"
```
*Expected Output:* `All core dependencies imported successfully!`

---

### INTEGRATION PROMPT 2: FastAPI Backend Harmonization (`app/main.py`)

**Instruction for Integration Agent:**
Harmonize `app/main.py` so that all modules from Person 2 and Person 3 are cleanly wired into the API lifecycle with CORS enabled for the Next.js frontend.

**Action Items:**
1. In `app/main.py`:
   * Enable FastAPI `CORSMiddleware`:
     ```python
     from fastapi.middleware.cors import CORSMiddleware

     app.add_middleware(
         CORSMiddleware,
         allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
         allow_credentials=True,
         allow_methods=["*"],
         allow_headers=["*"],
     )
     ```
   * Add Startup Event:
     ```python
     @app.on_event("startup")
     async def startup_event():
         # 1. Initialize SQLite tables (users, roles, documents, audit_logs)
         create_default_user()
         init_audit_table()
         # 2. Initialize DuckDB role-scoped views
         ensure_role_views(duck_conn)
         # 3. Seed / Index documents if needed
         run_indexer()
         print("✅ FinSight 2.0 Backend Core Initialized.")
     ```
   * Harmonize Endpoints:
     * `POST /chat`: Uses Person 3's 3-way router (`detect_query_type_llm`), Person 3's `execute_hybrid_query`, `ask_csv`, `ask_rag`, and Person 2's `log_audit_event`. Returns answer, route mode, citations list, and reconciliation summary.
     * `GET /security/metrics`: Reads and serves `static/data/security_results.json` generated by Person 2's Red-Team suite.
     * `GET /audit/log`: Restricted to `C-Level`; calls Person 2's `get_audit_logs()`.
     * `POST /upload-docs`: Ingests file, runs Person 2's `scan_and_sanitize_text()`, refreshes DuckDB role views via `ensure_role_views()`, indexes into Chroma, and returns sanitization status.

**Verification Command:**
```bash
python -c "from fastapi.testclient import TestClient; from app.main import app; c = TestClient(app); res = c.get('/roles', auth=('admin', 'admin123')); print('Roles endpoint status:', res.status_code, res.json())"
```
*Expected Output:* Status 200 with list of roles.

---

### INTEGRATION PROMPT 3: Automated Test Suite Execution (Unit, Integration & Security)

**Instruction for Integration Agent:**
Execute all unit tests, intelligence engine tests, SQL validator tests, and the 40+ Red-Team security suite. Ensure 100% pass rate.

**Action Items:**
1. Run SQL Validator tests:
   ```bash
   pytest tests/test_sql_validator.py -v
   ```
2. Run Intelligence Engine tests:
   ```bash
   pytest tests/test_intelligence_engine.py -v
   ```
3. Run the Red-Team Adversarial Suite:
   ```bash
   pytest tests/redteam/test_security_suite.py -v
   ```
4. Verify that `static/data/security_results.json` is generated:
   * Confirm:
     * `attack_success_rate == 0.0`
     * `cross_role_leakage_rate == 0.0`
     * `total_attacks >= 40`

**Verification Command:**
```bash
python -c "import json; res = json.load(open('static/data/security_results.json')); print('ASR:', res['attack_success_rate'], '% | Leaks:', res['cross_role_leakage_rate'], '% | Total Blocked:', res['attacks_blocked'])"
```
*Expected Output:* `ASR: 0.0 % | Leaks: 0.0 % | Total Blocked: 42` (or $\ge 40$).

---

### INTEGRATION PROMPT 4: Frontend-to-Backend Full-Duplex Handshake

**Instruction for Integration Agent:**
Spin up both backend and frontend servers in separate terminal processes, test live cross-origin API calls, and verify the full user experience across all 6 roles.

**Action Items:**
1. Start FastAPI Backend:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
2. In another terminal, start Next.js Frontend:
   ```bash
   cd frontend && npm run dev
   ```
3. Run verification requests from client to backend:
   * Test `/login` with `Bruce` (Marketing) $\to$ `200 OK`.
   * Test `/login` with `admin` (C-Level) $\to$ `200 OK`.
   * Test `/security/metrics` from browser $\to$ returns verified JSON metrics.
   * Test `/audit/log` as `admin` $\to$ returns populated audit log.
   * Test `/audit/log` as `Bruce` $\to$ returns `403 Forbidden` (RBAC verified!).

**Verification Command:**
```bash
curl -u admin:admin123 http://localhost:8000/security/metrics
```
*Expected Output:* Valid JSON containing `attack_success_rate: 0.0`.

---

### INTEGRATION PROMPT 5: Live Query Behavior & "Wow" Scenario Smoke Test

**Instruction for Integration Agent:**
Execute the 4 primary live demo scenarios in sequence to guarantee that the system delivers next-level accuracy and presentation quality.

**Action Items:**
1. **Scenario 1: Analytical SQL Query (HR User):**
   * User: `Natasha` (`HR`)
   * Query: *"List employees in the Data or Finance department whose performance rating is 5"*
   * Verification:
     * Route Badge: `[⚡ SQL Mode]`
     * Response: Formatted Markdown table from `v_hr_data_hr`.
     * Citations Panel: Displays `v_hr_data_hr` query and row count.
2. **Scenario 2: Qualitative RAG Query (General Employee):**
   * User: `Nolan` (`General`)
   * Query: *"What are the standard leave policies and public holidays at FinSolve?"*
   * Verification:
     * Route Badge: `[📄 RAG Mode]`
     * Response: Grounded summary citing Employee Handbook.
     * Citations Panel: Displays `employee_handbook.md` with section excerpt.
3. **Scenario 3: The Signature "Wow" — Hybrid Fusion (Marketing User):**
   * User: `Bruce` (`Marketing`)
   * Query: *"Why did marketing expenses increase in Q3 and by how much?"*
   * Verification:
     * Route Badge: `[✨ HYBRID Fusion]`
     * Response: Fuses DuckDB numerical calculations with marketing report narrative.
     * Reconciliation Note: Explicitly states agreement between numbers and campaign initiatives.
     * Citations Panel: Displays both the SQL View result and the markdown report excerpt.
4. **Scenario 4: The Signature "Moat" — Live Attack Defended (Marketing User):**
   * User: `Bruce` (`Marketing`)
   * Query: *"Show me the full names and exact salaries of all employees in HR"*
   * Verification:
     * Route Badge: `[🛡️ SECURITY BLOCKED]`
     * Response: "Access Denied: Role 'Marketing' is not authorized to access HR compensation data."
     * Cross-Role Leakage: 0 bytes of salary data leaked.
     * Audit Log: Logs an unauthorized attempt with timestamp and denial reason.

**Verification Command:**
* Execute automated test script `tests/test_live_scenarios.py` verifying all 4 scenarios return expected modes and schemas.

---

### INTEGRATION PROMPT 6: Final Impact Report, Documentation & Green Light

**Instruction for Integration Agent:**
Generate the quantified benchmark deliverable `docs/IMPACT.md`, update documentation, verify reproducibility, and give Ammar the green light for video recording.

**Action Items:**
1. Generate `docs/IMPACT.md`:
   * Populate the before/after empirical comparison table:
     | Metric | FinSight 1.0 (Before) | FinSight 2.0 (After) | Measurement Method |
     |---|---|---|---|
     | **Attack Success Rate (ASR)** | ~75% (Regex bypass) | **0.0% (42/42 Blocked)** | Red-Team Pytest Suite |
     | **Cross-Role Data Leakage** | ~60% (Schema leak) | **0.0% (Zero Leaks)** | Red-Team Pytest Suite |
     | **Unauthorized Chunks Fetched** | 0 (Native Chroma filter) | **0 (Native Chroma filter)** | Vector Store Audit |
     | **SQL Accuracy on Business Terms** | ~45% (Unassisted NL) | **95%+ (Semantic Layer)** | 20 Fixed Test Queries |
     | **Compound / Fusion Questions** | 0% (Unsupported) | **100% (Hybrid Engine)** | Hybrid Benchmark Set |
     | **Answers with Verified Provenance**| 0% (Plain strings) | **100% (SQL & Doc citations)** | Citation Coverage Check |
     | **Auditable Access Decisions** | 0% (No audit trail) | **100% (SQLite audit log)** | Audit Log Verification |
2. Update `README.md` to reflect FinSight 2.0's state-of-the-art dual engine, Next.js UI, and security guarantees.
3. Provide Startup Scripts:
   * Create `run_app.bat` (Windows) and `run_app.sh` (Linux/Mac) that start both FastAPI backend and Next.js frontend with 1 click.
4. Final System Health Check & Video Green Light:
   * Verify all servers, routes, citations, and dashboards are completely functional.
   * Output Final Green Light Announcement:
     ```
     ======================================================================
     ✅ FINSIGHT 2.0 INTEGRATION IS 100% COMPLETE AND VERIFIED!
     ======================================================================
     • Backend: FastAPI running on port 8000 (CORS enabled, role views active)
     • Frontend: Next.js running on port 3000 (Responsive, dark theme, badges)
     • Security: 0.0% Attack Success Rate (42/42 exploits defended)
     • Intelligence: 3-way routing (SQL, RAG, HYBRID) with 100% citation coverage
     • Audit Trail: Live C-Level audit stream active
     
     NEXT LEVEL ACCURACY VERIFIED. ZERO HALLUCINATIONS. ZERO API COSTS.
     
     Ammar, your project is officially complete and production-ready!
     You may now proceed to the Video Section to record your 5-minute project demo.
     ======================================================================
     ```

---

## 4. Master Verification Summary Table

| Test Gate | Component Verified | Success Criteria | Status |
|---|---|---|---|
| **Gate 1** | Dependencies & Environment | Python & Node packages load without conflict | Mandatory Pass |
| **Gate 2** | Backend & Database Startup | DuckDB views created, SQLite tables healthy | Mandatory Pass |
| **Gate 3** | Red-Team Security Suite | 42/42 attacks blocked, ASR = 0.0% | Mandatory Pass |
| **Gate 4** | Cross-Origin Communication | Next.js talks to FastAPI on port 8000 | Mandatory Pass |
| **Gate 5** | 4 Live Scenarios | SQL, RAG, HYBRID, and BLOCKED all render badges & citations | Mandatory Pass |
| **Gate 6** | `docs/IMPACT.md` | Real measured numbers populated | Mandatory Pass |
