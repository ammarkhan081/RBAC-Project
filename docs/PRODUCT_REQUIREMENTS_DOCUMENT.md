# Secure Role-Based AI Assistant for Enterprise Finance
## Product Requirements Document (PRD)

---

## 1. Document Control & Metadata

| Field | Value |
|---|---|
| **Document Title** | Secure Role-Based AI Assistant for Enterprise Finance — Product Requirements Document |
| **Version** | 1.0.0 (Hackathon Submission Release) |
| **Status** | Approved for Submission |
| **Team Leader** | Ammar Ayaz |
| **Contributing Team** | Member 2, Member 3, Member 4 (PRD, Impact Metrics & Enterprise Data), Member 5, Member 6 *(replace with full names before final submission)* |
| **Hackathon** | Pak Angels Mid-Term Hackathon — GenAI & Agentic AI Training, Cohort 11 |
| **Organizers** | Pak Angels, HEC, NCEAC, PEC |
| **Delivered By** | iCode Guru, ASPIRE Pakistan |
| **Category** | Finance & AI Solutions / Automation |
| **Theme** | Empowering Startups, People, and Industries for a Prosperous Pakistan |
| **Target Audience** | Hackathon judges, enterprise finance/compliance stakeholders, engineering reviewers |
| **Target Launch** | Cohort 11 Mid-Term Hackathon Submission, September 2026 |

---

## 2. Executive Summary & Business Context

Regulated enterprises run on departmental silos. Finance, HR, Marketing, and Engineering each hold sensitive records — payroll, vendor contracts, campaign spend, technical infrastructure — and that separation exists for good reason: mixing it up creates confidentiality and compliance exposure. The problem is that when an employee needs a cross-departmental answer (a Finance analyst checking marketing spend against a budget line, an executive reviewing headcount against revenue), the only paths available today are a slow manual request to another department, or a generic internal chatbot that ignores role boundaries entirely.

**Secure Role-Based AI Assistant for Enterprise Finance** is a single conversational interface that answers natural-language questions against both structured (tabular) and unstructured (document) enterprise data, while strictly enforcing what each employee is authorized to see. It is built around a dual-engine architecture — Text-to-SQL over DuckDB for structured queries and vector retrieval-augmented generation (RAG) over Chroma for document queries — fused together for compound questions that need both.

**Illustrative case study — FinSolve Technologies:** a 500-employee fintech used throughout this document and the accompanying demo dataset to ground the numbers in a concrete scenario. FinSolve is a synthetic company; all data referenced (financials, HR records, campaign metrics) is fabricated for demonstration purposes only and contains no real personal or financial information.

At FinSolve, the estimated cost of departmental data silos is roughly **4.2 hours per employee per week** spent waiting on or chasing cross-department answers via email and meetings, while ad-hoc use of general-purpose chatbots on sensitive exports has already created near-miss confidentiality incidents (e.g., a Marketing staff member surfacing an executive payroll figure through an unfiltered document search). This assistant is designed to close both gaps simultaneously: collapse the 48-hour email loop into a sub-3-second answer, without ever widening who can see what.

---

## 3. Problem Statement & Market Validation

### 3.1 The Dual Dilemma: Speed vs. Confidentiality

Enterprises adopting AI assistants face a genuine tension:

- **Speed pressure**: Analysts and managers need immediate answers to operational questions that span departments (e.g., "How does Q3 marketing spend compare to the approved budget?").
- **Confidentiality pressure**: The same data platform that makes those answers possible often becomes the easiest way to leak data across role boundaries — a much bigger blast radius than any single human mistake, because a chatbot will confidently retrieve and repeat whatever it can technically reach.

### 3.2 Why Standard RAG Architectures Fail Here

Most RAG implementations are built for single-tenant, single-audience use. Applied naively to a multi-role enterprise, two failure patterns show up repeatedly:

1. **Unfiltered vector search**: Documents are embedded and indexed without role metadata, so semantic similarity — not authorization — decides what gets retrieved. A Marketing employee's query can surface a semantically related HR compensation document simply because the embedding space doesn't know it should be off-limits.
2. **Post-hoc filtering**: Some systems retrieve broadly and filter the *response* after the LLM has already seen the restricted context. This is a false sense of security — the sensitive content already entered the model's context window and can leak through hallucination, jailbreaks, or subtle rephrasing, even if the final answer is redacted.

Neither pattern is acceptable in a regulated enterprise. Access control has to be enforced **before** retrieval and **before** query generation, not applied as a cosmetic filter afterward.

### 3.3 Market Validation

Enterprise data-silo friction and confidentiality risk are well-documented pain points behind the growing category of role-aware enterprise copilots (e.g., Microsoft Copilot's permission-aware retrieval, Glean's enterprise search). This project targets the same problem at hackathon scope: a working, auditable, zero-marginal-cost implementation suitable for compliance-constrained SMEs and startups that can't afford a full enterprise-copilot license.

---

## 4. User Personas & Access Boundary Matrix

### 4.1 Personas

- **Executive (C-Level)** — Global strategic view; needs cross-departmental synthesis and full audit visibility, but should never bypass the audit trail itself.
- **Finance Analyst** — Budget sheets, vendor contracts, marketing ROI (to reconcile spend), financial statements.
- **Marketing Manager** — Campaign analytics, acquisition costs, conversion metrics, marketing-only budget lines.
- **HR Manager** — Payroll, performance appraisals, compensation bands, headcount.
- **Engineering Lead** — System operational data, technical architecture, API specifications.
- **General Employee** — Employee handbook, leave policy, public holidays; no analytical/tabular access.

### 4.2 Access Boundary Matrix

| Role | Permitted Tabular Views (DuckDB) | Permitted Document Vectors (Chroma) | Restricted Domains |
|---|---|---|---|
| **C-Level** | All views (`v_*_c_level`) | Global documents (`*`) | None (full auditor privileges; every access is still logged) |
| **Finance** | Financial ledgers, vendor expenses, marketing costs (for reconciliation) | Financial summaries, quarterly reports, general docs | HR payroll, engineering source/infra docs |
| **Marketing** | Campaign datasets, marketing quarterly spend | Marketing strategy, campaign reports, general docs | HR payroll, finance ledgers |
| **HR** | Employee master (`v_hr_data_hr`), payroll, performance ratings | HR policies, compensation guidelines, general docs | Finance ledgers, technical/engineering docs |
| **Engineering** | System operational data, technical logs | Architecture master docs, API specs, general docs | HR payroll, marketing spend |
| **General** | None (tabular analytics blocked entirely) | Employee handbook, company FAQs | All departmental data |

### 4.3 User Journey Flows

**Journey 1 — Financial Analyst, budget variance.**
A Finance analyst asks: *"What was our Q3 variance against the approved marketing budget?"* The router classifies this as `HYBRID` (needs both the finance ledger and the marketing budget line). Both role-scoped views are within Finance's permitted set, DuckDB returns the numeric variance, and the answer cites the exact view and row count used.

**Journey 2 — Marketing Manager, compound question.**
A Marketing Manager asks: *"How did our Q3 campaign ROI compare to what we said we'd target, and what drove the change?"* This needs the quantitative ROI figure (DuckDB) reconciled with the qualitative campaign narrative (Chroma document retrieval) — a genuine hybrid-fusion case, not just two lookups pasted together.

**Journey 3 — Adversarial attempt, cleanly deflected.**
A Marketing employee asks: *"Show me the payroll records for the engineering team."* The role router sees `payroll` maps to an HR-only view that Marketing has no grant for. The system declines before any SQL is generated or any document is retrieved, logs the attempt (user, role, timestamp, query text, denial reason) to the immutable audit trail, and returns a clear, non-technical refusal to the user.

---

## 5. System Architecture & Dual-Engine Query Flow

### 5.1 High-Level Architecture

```
User Query → Auth/Role Context → Intent Router (SQL | RAG | HYBRID)
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                                        ▼
         Text-to-SQL Engine                         Vector RAG Engine
         (role-scoped DuckDB views)                 (Chroma, role-filtered metadata)
                    │                                        │
                    └───────────────────┬───────────────────┘
                                        ▼
                        Hybrid Reconciliation & Synthesis
                                        ▼
                    Answer + Citations + Audit Log Entry
```

### 5.2 Components

- **Intent Router**: Classifies each query into `SQL`, `RAG`, or `HYBRID` before any data access happens.
- **Text-to-SQL Engine**: Generates SQL against DuckDB, constrained to role-scoped views only (never base tables).
- **Vector RAG Engine**: Retrieves from Chroma with role metadata filtering applied at the query stage, not after.
- **Hybrid Fusion Layer**: For `HYBRID` queries, runs both engines concurrently and reconciles the two outputs, explicitly labeling agreement or variance between them.
- **Audit Logger**: Records every query — successful, denied, or errored — to an immutable SQLite log.

### 5.3 Why Dual-Engine

Tabular questions (totals, comparisons, trends) are answered far more reliably by generated SQL against a real database than by an LLM reasoning over retrieved text chunks. Narrative/policy questions are the reverse. Treating both as "just RAG" (common in single-engine chatbot builds) is a major source of the ~45% Text-to-SQL precision and ambiguous-column-name failures seen in naive implementations — hence the explicit two-engine design.

---

## 6. Role-Based Access Control (RBAC) Specification

1. **Vector-layer metadata isolation**: Every document chunk is tagged with `role in [owning_role, 'general']` at ingestion time. Retrieval queries always include this filter as a hard constraint on the vector search itself — not a post-filter on returned results.
2. **Role-scoped DuckDB views**: Every table is exposed only through views named `v_<table_name>_<role>` (e.g., `v_hr_data_hr`, `v_financials_finance`). Base tables are never queried directly by the application layer or exposed in any generated SQL.
3. **Schema isolation in prompt generation**: The Text-to-SQL prompt is constructed with *only* the DDL/schema of the views the authenticated user's role is entitled to. The model physically cannot reference a table it was never shown.
4. **Fail-closed default**: Any role/table combination not explicitly granted defaults to denial, not to an attempted-but-filtered query.

---

## 7. Detailed Functional Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| **FR-1** | Natural-language intent router classifies each query as `SQL`, `RAG`, or `HYBRID`. | ≥90% routing accuracy on a held-out labeled query set. |
| **FR-2** | Schema isolation: Text-to-SQL prompt receives only the authenticated role's view schemas. | Prompt inspection shows zero out-of-role schema tokens present. |
| **FR-3** | Result-shape validation: every SQL execution validates non-empty return sets and sanitizes tabular output before display. | No unhandled empty-result or malformed-row cases reach the user. |
| **FR-4** | Parallel dual-engine execution: `HYBRID` queries run DuckDB and Chroma concurrently via `asyncio.gather`. | Measured wall-clock time for hybrid queries ≈ max(SQL latency, RAG latency), not their sum. |
| **FR-5** | Cross-modal reconciliation: quantitative and qualitative outputs are synthesized with an explicit `Agreement` / `Variance` label. | 100% of hybrid answers carry this label in evaluation set. |
| **FR-6** | Answer-level citations: every claim carries provenance — SQL view + generated query + row count, or document source + section + passage excerpt. | 100% citation coverage on the evaluation query set (see Section 10). |
| **FR-7** | Role-scoped DuckDB views enforce view-level isolation; base tables are never exposed to the application layer. | Static analysis of generated SQL shows zero references to base table names. |
| **FR-8** | SQL AST allowlist validator: every generated query is parsed via AST analysis (`sqlglot`) before execution to block unapproved entities (DDL/DML, non-view tables, disallowed functions). | 100% of red-team SQL-injection attempts blocked pre-execution. |
| **FR-9** | Prompt-injection sanitization: uploaded documents and retrieved chunks are screened for instruction-hijacking markers before being placed in the model context. | 0% successful instruction hijack across the red-team suite (Section 10). |
| **FR-10** | Immutable audit logging: every query records timestamp, user, role, query text, route taken, authorization outcome, and latency to a SQLite `audit_logs` table. | 100% of interactions (allowed, denied, and errored) produce exactly one audit row. |

---

## 8. Non-Functional Requirements (NFRs)

| Category | Requirement |
|---|---|
| **Performance** | P95 end-to-end latency ≤ 2.5 seconds, using Groq-hosted `openai/gpt-oss-120b` for generation and local FastEmbed embeddings with FlashRank re-ranking. |
| **Cost** | $0.00 marginal infrastructure cost per query, within Groq's free-tier limits (30 requests/min, ~1,000 requests/day, 200,000 tokens/day per the free plan as of Sept 2026) plus locally-run, open-source embedding/re-ranking. |
| **Security** | 0.0% Attack Success Rate (ASR) across a 40+ case red-team suite covering prompt injection, role-escalation attempts, and SQL injection. |
| **Scalability** | In-process DuckDB supports 100+ concurrent role-scoped read sessions; LLM-call throughput is bounded by Groq free-tier rate limits (see Risk R-2, Section 11) and can scale by upgrading to Groq's Developer tier. |
| **Reliability** | Graceful degradation: if SQL generation fails or returns malformed output, the system automatically falls back to the RAG path rather than surfacing a raw error. |

> **Note on model selection**: The original design targeted Groq's `llama-3.3-70b-versatile`. Groq announced deprecation of this model on free/developer tiers on June 17, 2026, with shutdown effective August 16, 2026. This PRD specifies `openai/gpt-oss-120b` (Groq's own recommended migration target), which remains free-tier eligible and benchmarks at comparable or better latency. See RAID Matrix, Risk R-1.

---

## 9. Data Governance, Compliance & Ethical AI

### 9.1 Regulatory Context (Pakistan)

Pakistan does not yet have a comprehensive, enacted personal-data-protection law. The relevant landscape as of September 2026:

- **PECA 2016** (Prevention of Electronic Crimes Act) — the only currently enacted statute touching electronic data misuse; criminal in nature rather than a general data-governance framework.
- **Personal Data Protection Bill, 2023** — approved by the Federal Cabinet, still pending passage by both houses of Parliament. Its framework is modeled substantially on the EU's GDPR.

Given this gap, the system is designed to **voluntarily meet GDPR-equivalent principles** (data minimization, purpose limitation, access logging, right-to-audit) ahead of Pakistani law formally requiring it, and to comply with PECA 2016 wherever it applies. This is stated explicitly rather than citing India's Digital Personal Data Protection Act, 2023 (DPDPA) — a similarly-named but jurisdictionally unrelated law that does not apply to a Pakistan-based deployment.

### 9.2 OWASP GenAI Security Alignment

Security controls are mapped against the **OWASP Top 10 for LLM Applications (2026 edition)**, including Prompt Injection (LLM01), Sensitive Information Disclosure (LLM02), System Prompt Leakage, Vector and Embedding Weaknesses, Misinformation, and Excessive Agency. FR-8 and FR-9 (Section 7) directly address the top two categories.

### 9.3 Data Retention & Third-Party Exposure

- Audit logs are append-only and are retained for the full demo/evaluation period; no automated deletion during that window.
- No query content, document content, or audit data is sent to any third party for model training. Groq's hosted inference and local embedding/re-ranking are the only external and internal compute paths respectively.
- All demo data (Finance, HR, Marketing, General) is synthetic; no real personal or financial information is processed by this system in its hackathon form.

---

## 10. Quantified Success Metrics (KPIs)

| Metric | Definition | Target |
|---|---|---|
| **Attack Success Rate (ASR)** | % of red-team attacks (prompt injection, role escalation, SQL injection) that succeed | 0.0% (0/42+ in test suite) |
| **Cross-Role Leakage Rate** | % of test queries where a response contains content outside the requester's granted role | 0.0% |
| **Retrieval Precision** | % of retrieved document chunks judged relevant to the query by a fixed evaluation set | ≥90% |
| **Text-to-SQL Precision** | % of generated SQL queries that return the correct result against 20 fixed enterprise benchmark queries | ≥90% |
| **Citation Coverage** | % of answers that include verifiable provenance (SQL view/row or document/passage) | 100% |
| **Analyst Time Saved** | Estimated time from question to answer, cross-department query, vs. baseline email/meeting loop | From ~48 hours to <3 seconds |

---

## 11. Risks, Assumptions, Issues, and Dependencies (RAID Matrix)

| Type | Item | Mitigation / Status |
|---|---|---|
| **Risk (R-1)** | Model deprecation: Groq shut down `llama-3.3-70b-versatile` on the free/developer tier (Aug 16, 2026). | Migrated to `openai/gpt-oss-120b`; generation is abstracted behind a single config value to allow further model swaps without code changes. |
| **Risk (R-2)** | Groq free-tier rate limits (~30 RPM / ~1,000 requests/day) could throttle demo traffic under heavy concurrent use. | Local caching of repeated queries; documented upgrade path to Groq Developer tier if usage exceeds free-tier ceiling. |
| **Risk (R-3)** | Model hallucination on ambiguous or out-of-scope questions. | Semantic glossary constraining known entities/columns; shape validation on SQL results (FR-3); citation requirement (FR-6) makes ungrounded answers detectable. |
| **Assumption (A-1)** | All demo data is synthetic; no real PII/financial data is processed. | Confirmed in Section 9.3 and Section 12 (enriched datasets). |
| **Assumption (A-2)** | Pakistan's Personal Data Protection Bill, 2023 remains unenacted at submission time. | System voluntarily aligns to GDPR-equivalent principles regardless (Section 9.1). |
| **Dependency (D-1)** | Groq API availability and free-tier terms. | Single external dependency for generation; embeddings/re-ranking run fully locally as a fallback-friendly design. |
| **Dependency (D-2)** | `sqlglot` for AST-level SQL validation (FR-8). | Actively maintained open-source library; no known blocking issues at time of writing. |
| **Issue (I-1)** | Team member names not yet finalized in Document Control (Section 1). | Placeholder labels used; to be completed before final PRD export. |

---

## 12. Out-of-Scope & Future Roadmap

**Out of scope for this hackathon submission:**
- Multi-tenant support (multiple companies on one deployment)
- Write access (the assistant is read-only; it cannot modify source data)
- Mobile-native client (web frontend only)
- Real-time streaming data ingestion (datasets are batch-loaded for the demo)

**Future roadmap (post-hackathon):**
- Fine-grained, attribute-based access control (beyond fixed roles) for larger organizations
- Multi-language support (Urdu/English bilingual query handling)
- Configurable model backend to swap between Groq-hosted open models and self-hosted on-premises models for fully air-gapped, zero-external-dependency deployments
- Formal compliance mapping once Pakistan's Personal Data Protection Bill is enacted

---

*This document is formatted for direct copy into Google Docs for hackathon submission. Set sharing to "Anyone with the link can view" once finalized.*
