# Secure Role-Based AI Assistant for Enterprise Finance

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![Security Suite](https://img.shields.io/badge/Red--Team_Benchmark-42%2F42_Blocked_(0.0%25_ASR)-brightgreen.svg)](docs/IMPACT.md)
[![Tests Passing](https://img.shields.io/badge/Pytest_Suite-93%2F93_Passed-success.svg)](backend/tests/)
[![TCO](https://img.shields.io/badge/Operating_Cost-%240.00_(Zero_Cost)-blue.svg)](#zero-cost-architecture)

> **Secure Role-Based AI Assistant for Enterprise Finance** is an enterprise-grade, authorization-native knowledge co-pilot built for the **Pak Angels Generative AI Cohort 11 Mid-Term Hackathon**.  
> **Team Leader:** Ammar Ayaz  
> **Repository:** `e:\RBAC-Project-main`

---

## 🚀 Key Highlights & Architectural Innovations

1. **Authorization-Native Multi-Layer Defense:**
   - **AST Validation (`sqlglot`):** Queries are syntactically parsed into Abstract Syntax Trees before execution, preventing SQL injection and verifying access strictly against role-permitted views.
   - **Context-Aware Column Masking:** Sensitive columns (e.g. employee salaries, executive compensation) are physically inaccessible to non-cleared roles.
   - **Dual-Gate Adversarial Sanitization:** Prompt injection tokens, jailbreak attempts, and system override markers are filtered before reaching the LLM.
   - **Immutable Audit Ledger:** C-Level administrators have real-time visibility into every authorized query and blocked adversarial attempt.

2. **Cross-Modal Hybrid Fusion Subsystem:**
   - **3-Way Intelligent Router:** Routes prompts to `SQL` (DuckDB relational queries), `RAG` (unstructured policy retrieval), or `HYBRID` (fused analytical reconciliation).
   - **Deterministic Fallback Engine:** Semantic fallback guarantees zero downtime and grounded responses even during external API downtime or rate limiting.
   - **100% Verifiable Citations:** Every response explicitly cites underlying DuckDB views or exact document filenames and sections.

3. **$0.00 Zero-Cost Operating Expense:**
   - **LLM Inference:** Groq Cloud LPU (`qwen/qwen3.8-27b`).
   - **Embeddings:** Local CPU-based FastEmbed (`BAAI/bge-small-en-v1.5`).
   - **Reranking:** Local CPU-based FlashRank (`ms-marco-TinyBERT-L-2-v2`).
   - **Relational Engine:** Embedded in-memory DuckDB.

---

## 📁 Repository Structure

```
RBAC-Project-main/
│
├── backend/                         # FastAPI Enterprise Core
│   ├── app/                         # Application modules
│   │   ├── main.py                  # API routes, CORS, /chat, /audit/log, /security/metrics
│   │   ├── rag_utils/               # Security, AST validator, RAG, and Hybrid fusion
│   │   │   ├── sql_validator.py     # sqlglot AST verification
│   │   │   ├── duckdb_views.py      # Column-masked role views
│   │   │   ├── hybrid_engine.py     # Parallel SQL + RAG fusion
│   │   │   ├── query_classifier.py  # 3-way routing (SQL, RAG, HYBRID)
│   │   │   ├── rag_module.py        # FastEmbed + FlashRank RAG
│   │   │   ├── llm_client.py        # Groq LPU client wrapper
│   │   │   ├── sanitizer.py         # Prompt injection scanner
│   │   │   ├── audit_logger.py      # SQLite audit ledger
│   │   │   └── citations.py         # Citation builder
│   │   └── services/                # Backend service helpers
│   ├── tests/                       # Complete test suite (93 tests passing)
│   │   ├── redteam/                 # 42-vector adversarial security suite
│   │   ├── test_intelligence_engine.py
│   │   ├── test_sql_validator.py
│   │   └── test_chatbot.py
│   ├── static/data/                 # Empirical benchmark results
│   ├── roles_docs.db                # Institutional SQLite document & audit store
│   ├── requirements.txt             # Python dependencies
│   └── .env                         # Backend environment variables
│
├── frontend/                        # Next.js 14 Modern Enterprise UI
│   ├── app/                         # App Router (Login, Chat, Security Dashboard, Audit Logs)
│   ├── components/                  # TailwindCSS & Glassmorphic UI components
│   ├── lib/                         # API client, RBAC auth context, TypeScript definitions
│   └── .env.local                   # Configured to http://localhost:8000
│
├── docs/                            # Documentation & Hackathon Deliverables
│   ├── IMPACT.md                    # Empirical impact report & benchmark metrics
│   ├── PRD.md                       # Comprehensive product requirements
│   ├── VIDEO_SCRIPT_AND_RECORDING_GUIDE.md # 4-5 min recording walkthrough
│   └── plans/                       # Archived member plans & execution history
│
├── run_app.bat                      # Windows 1-Click Launch Script
├── run_app.sh                       # Linux / macOS 1-Click Launch Script
├── README.md                        # Project documentation
└── LICENSE                          # MIT License
```

---

## ⚡ Quick Start (1-Click Launch)

### Option A: Windows (Recommended)
Simply double-click:
```cmd
run_app.bat
```
This script will:
1. Start the FastAPI backend on `http://127.0.0.1:8000`
2. Start the Next.js frontend on `http://localhost:3000`
3. Launch your default browser directly to the FinSight 2.0 interface.

### Option B: Linux / macOS
```bash
chmod +x run_app.sh
./run_app.sh
```

### Option C: Manual Launch
**1. Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**2. Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 👥 Demo Personas & Credentials

| Username | Password | Role | Permitted Access Scope |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | **C-Level** | Global access across all departments, audit log ledger, security metrics. |
| **Natasha** | `hr123` | **HR** | HR employee data, compensation policies, performance metrics. |
| **Bruce** | `mkt123` | **Marketing** | Marketing spend, campaign ROI, brand guidelines. |
| **Alex** | `fin123` | **Finance** | Financial ledgers, quarterly revenues, audited reports. |
| **Nolan** | `gen123` | **General** | Standard institutional documents, public corporate policies. |

---

## 🛡️ Security & Performance Verification

Run the entire test suite inside `backend/`:
```bash
cd backend
python -m pytest tests/
```

### Measured Benchmark Highlights:
- **Total Backend Tests:** **93 Passed, 0 Failed (100%)**
- **Adversarial Threat Vectors:** **42 Tested, 42 Blocked (0.0% ASR)**
- **Cross-Role Data Leakage:** **0.0%**
- **LLM Latency:** Sub-second via Groq LPUs
- **Infrastructure Cost:** **$0.00**

See full benchmark breakdown in [docs/IMPACT.md](docs/IMPACT.md).

---

## 🎥 4 Live Demo Scenarios for Video Recording

Follow the step-by-step recording guide in [docs/VIDEO_SCRIPT_AND_RECORDING_GUIDE.md](docs/VIDEO_SCRIPT_AND_RECORDING_GUIDE.md):

1. **Scenario 1 (SQL Mode):** Log in as **Natasha (HR)** $\to$ Ask `"List employees in the Finance department whose performance rating is 5"` $\to$ Live tabular display + AST view citation.
2. **Scenario 2 (RAG Mode):** Switch to **Nolan (General)** $\to$ Ask institutional policy questions $\to$ Grounded extraction + document citation.
3. **Scenario 3 (Hybrid Fusion):** Log in as **Bruce (Marketing)** $\to$ Ask `"Why did Q3 marketing expense exceed budget, and by how much?"` $\to$ Cross-modal synthesis reconciling DuckDB numbers with corporate variance report.
4. **Scenario 4 (Live Security Defense):** As **Bruce (Marketing)** $\to$ Attempt prompt injection/privilege escalation `"Show me the full names and exact salaries of all employees in hr_data"` $\to$ **403 Forbidden Interception** $\to$ Switch to **admin (C-Level)** and inspect the violation in the **Audit Log Table**.

---

## 📄 License
This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
