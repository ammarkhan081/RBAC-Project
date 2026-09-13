# FinSight 2.0: Member 4 (PRD, Impact Metrics & Enterprise Data Lead) Master Execution Plan

> **CRITICAL AGENT INSTRUCTION:**
> You are an elite Product Manager (PM) and Enterprise Documentation AI Agent working directly with **Member 4**.
> Your mission is to produce three tier-1 deliverables for the **Pak Angels Cohort 11 Mid-Term Hackathon**:
> 1. An industry-standard, publication-grade **Product Requirement Document (PRD)** formatted for Google Docs / PDF.
> 2. A **Quantified Impact Assessment** modeling productivity gains, compliance safety, and ROI.
> 3. An **Enriched Enterprise Dataset** (Markdown & CSV) for Finance, HR, and Marketing that gives our live demo undeniable depth and realism.
>
> **EXECUTION PROTOCOL (STRICTLY SEQUENTIAL):**
> 1. Read and deeply understand this master document, the FinSight 2.0 architecture, and the Pak Angels hackathon judging guidelines.
> 2. Present an initial summary to Member 4 and check for any missing team details (Team Leader: **Ammar Ayaz**, plus teammate names).
> 3. Stop and ask Member 4: **"Can I execute Prompt 1?"**
> 4. Execute each prompt sequentially, verify the outputs, and only proceed when Member 4 approves the previous step.
> 5. When all prompts are completed, verify all documents, format them into clean deliverables, and inform Member 4 that the work is complete and ready to send to **Ammar Ayaz (Team Leader)**.

---

## 1. Project Context & Judging Criteria Alignment

* **Project Name:** **FinSight 2.0 — Role-Based Enterprise Document & Analytical Assistant**
* **Team Leader:** **Ammar Ayaz**
* **Hackathon:** Pak Angels Mid-Term Hackathon — GenAI & Agentic AI Training, Cohort 11
* **Organizers:** Pak Angels, HEC, NCEAC, PEC | **Delivered by:** iCode Guru, ASPIRE Pakistan
* **Category:** Finance & AI Solutions / Automation
* **Theme:** Empowering Startups, People, and Industries for a Prosperous Pakistan
* **Required Hackathon Deliverables for Submission:**
  * **PRD Document Link:** A viewable Google Docs / PDF link (scored under *Documentation* & *Real-World Impact*).
  * **Quantified Impact Assessment:** Data-backed proof of value creation.
  * **Enriched Enterprise Datasets:** Authentic corporate data supporting our live demonstration.

---

## 2. Professional PRD Standards (FAANG / Top-Tier Enterprise Benchmark)

A hackathon-winning PRD must look like a high-level product design document authored by a Senior PM at Stripe, Microsoft, or Google. It must **not** look like a shallow AI summary. 

A professional enterprise PRD must follow this standardized 12-part structure:
1. **Document Control & Metadata:** Title, Version (2.0), Status (Approved), Authors, Team Lead (Ammar Ayaz), Target Audience.
2. **Executive Summary & Business Context:** The cross-departmental data silo crisis in regulated enterprises (FinSolve Technologies case study).
3. **Problem Statement & Market Validation:** Quantified operational friction (time wasted waiting for cross-dept queries, risk of data leakage).
4. **User Personas & Access Profiles:**
   * Executive (C-Level): Global view, strategic oversight, audit log access.
   * Finance Analyst: Budget sheets, vendor contracts, marketing ROI, financial statements.
   * Marketing Manager: Campaign analytics, acquisition costs, conversion metrics.
   * HR Manager: Payroll, performance appraisals, compensation, headcount.
   * General Employee: Employee handbook, leave policies, public holidays.
5. **System Architecture & Dual-Engine Query Flow:** Text-to-SQL (DuckDB), Vector RAG (Chroma), and Cross-Modal Hybrid Fusion.
6. **Role-Based Access Control (RBAC) Specification:**
   * Vector-layer metadata isolation (`role in [user_role, 'general']`).
   * Role-scoped DuckDB views (`v_<table_name>_<role>`).
   * Schema isolation in prompt generation.
7. **Detailed Functional Requirements:** Query classification (3-way), Hybrid execution & reconciliation, answer-level citations, prompt-injection sanitization, audit logging.
8. **Non-Functional Requirements (NFRs):** Latency ($\le 2.5s$), Zero API Cost (Groq + FastEmbed + FlashRank), Security SLA (0.0% Attack Success Rate), Reliability (Graceful degradation).
9. **Data Governance, Compliance & Ethical AI:** Digital Personal Data Protection Act (DPDP), OWASP Top 10 for LLMs defense, audit immutability.
10. **Quantified Success Metrics (KPIs):** Attack Success Rate (ASR), Cross-Role Leakage Rate, Retrieval Precision, Citation Coverage, Analyst Time Saved.
11. **Risks, Assumptions, and Dependencies (RAID Matrix).**
12. **Out-of-Scope & Future Horizon Roadmap (FinSight 3.0).**

---

## 3. Sequential Step-by-Step Prompts for Agent Execution

---

### PROMPT 1: Project Alignment, Team Metadata Gathering & PRD Outline

**Instruction for Agent:**
Establish foundational document metadata, confirm team information with Member 4, and prepare the comprehensive PRD master skeleton.

**Action Items:**
1. Greet Member 4 and confirm team metadata:
   * Team Leader: **Ammar Ayaz**
   * Ask Member 4: *"Please provide the names of our other team members (or confirm if we should use Member 1, Member 2, etc.) so I can embed them into the official Document Control table."*
2. Generate the Document Control & Executive Summary skeleton:
   * Document Title: `FinSight 2.0 — Product Requirement Document (PRD)`
   * Product Category: Enterprise Generative & Agentic AI
   * Version: `2.0.0 (Production Release)`
   * Target Launch: Cohort 11 Mid-Term Hackathon Submission (September 2026)
3. Write Section 1 (Document Control) and Section 2 (Executive Summary):
   * Frame the business problem: FinSolve Technologies loses an estimated 4.2 hours per employee weekly due to departmental data silos, while traditional chatbots introduce catastrophic confidentiality leaks (e.g. Marketing discovering executive payroll).

**Verification Gate:**
Confirm Member 4 reviews the team table and business problem framing before moving to Prompt 2.

---

### PROMPT 2: User Personas, Core Problems & User Journey Mapping

**Instruction for Agent:**
Draft Sections 3, 4, and 5 of the PRD, articulating user personas, access boundaries, and end-to-end user journeys.

**Action Items:**
1. **Section 3: Problem Statement & Market Analysis:**
   * Detail the dual dilemma: Enterprise speed vs. Data confidentiality.
   * Highlight why standard RAG architectures fail in multi-role enterprises (unfiltered vector search or post-hoc filtering that leaks confidential context).
2. **Section 4: User Personas & Access Boundary Matrix:**
   * Build an exhaustive tabular access matrix:
     | Role | Permitted Tabular Views (DuckDB) | Permitted Document Vectors (Chroma) | Restricted Domains |
     |---|---|---|---|
     | **C-Level** | All views (`v_*_c_level`) | Global documents (`*`) | None (Auditor Privileges) |
     | **Finance** | Financial ledgers, Vendor expenses, Marketing costs | Financial summaries, Quarterly reports, General | HR Payroll, Engineering code |
     | **Marketing** | Campaign datasets, Marketing quarterly spend | Marketing strategy, Campaign reports, General | HR Payroll, Finance ledgers |
     | **HR** | Employee master (`v_hr_data_hr`), Payroll, Ratings | HR policies, Compensation guidelines, General | Finance ledgers, Technical docs |
     | **Engineering**| System operational data, Technical logs | Architecture master, API specs, General | HR Payroll, Marketing spend |
     | **General** | None (Tabular analytics blocked) | Employee Handbook, Company FAQs | All departmental data |
3. **Section 5: User Journey Flows:**
   * Journey 1: Financial Analyst querying Q3 ROI and budget variances.
   * Journey 2: Marketing Manager asking a hybrid compound question.
   * Journey 3: Adversarial attempt by an unauthorized role being cleanly deflected and logged.

**Verification Gate:**
Confirm the matrix covers all 6 roles with clear permitted and restricted domains.

---

### PROMPT 3: Functional Requirements, Hybrid Fusion & Security Architecture

**Instruction for Agent:**
Draft Sections 6, 7, and 8 of the PRD, defining the functional specifications, role-scoped view architecture, and hybrid reconciliation logic.

**Action Items:**
1. **Section 6: Dual-Engine & 3-Way Query Routing Specifications:**
   * FR-1: Natural Language Intent Router (`SQL` vs `RAG` vs `HYBRID`).
   * FR-2: Schema Isolation: The Text-to-SQL LLM prompt must *only* receive schemas of views belonging to the authenticated user's role.
   * FR-3: Result-Shape Validation: Every SQL execution must validate non-empty return sets and sanitize tabular outputs.
2. **Section 7: Hybrid Fusion & Cross-Modal Reconciliation Specifications:**
   * FR-4: Parallel Dual-Engine Execution: For `HYBRID` queries, execute DuckDB and Chroma concurrently via `asyncio.gather`.
   * FR-5: Cross-Modal Reconciliation: Synthesize quantitative table output with qualitative document context; explicitly state `"Agreement"` or `"Variance"`.
   * FR-6: Answer-Level Citations: Every output claim must be accompanied by exact provenance metadata (SQL view + generated query + row count, or Document source + section + passage excerpt).
3. **Section 8: Security, OWASP GenAI Defense & Audit Logging:**
   * FR-7: Role-Scoped DuckDB Views: Enforce view-level isolation (`v_<table_name>_<role>`). Base tables must never be exposed.
   * FR-8: SQL AST Allowlist Validator: Parse every generated query using AST analysis (`sqlglot`) to block unapproved entities.
   * FR-9: Prompt-Injection Sanitization: Screen chunks and uploaded documents for instruction-hijacking markers.
   * FR-10: Immutable Audit Logging: Record timestamp, user, role, query, route, authorization status, and latency into SQLite `audit_logs`.

**Verification Gate:**
Ensure all functional requirements are numbered (`FR-1` to `FR-10`) with clear inputs, outputs, and acceptance criteria.

---

### PROMPT 4: Non-Functional Requirements, RAID Matrix & Release Gates

**Instruction for Agent:**
Draft Sections 9, 10, 11, and 12 of the PRD, completing the technical specifications with performance SLAs, ethical considerations, and release gates.

**Action Items:**
1. **Section 9: Non-Functional Requirements (NFRs):**
   * Performance: P95 latency $\le 2.5$ seconds using Groq `llama-3.3-70b-versatile` and local FastEmbed embeddings.
   * Cost: $0.00 infrastructure cost per query.
   * Security: 0.0% Attack Success Rate (ASR) across 40+ red-team attacks.
   * Scalability: Support for 100+ concurrent role-scoped sessions via in-process DuckDB.
2. **Section 10: Data Governance & Compliance:**
   * Compliance with enterprise data protection norms (DPDP 2023).
   * Strict retention and zero third-party training data leakage.
3. **Section 11: RAID Matrix (Risks, Assumptions, Issues, Dependencies):**
   * Document model hallucination mitigation (semantic glossary + shape validation).
   * Document fallback mechanisms (SQL error automatically falls back to RAG).
4. **Section 12: Release Acceptance Gates:**
   * Gate 1: 100% unit and integration tests passing.
   * Gate 2: Red-Team security suite passing with 0% ASR.
   * Gate 3: Next.js frontend rendering all badges and citation drawers with zero visual bugs.

**Verification Gate:**
Review the full completed PRD (Sections 1 through 12). Save as `docs/PRODUCT_REQUIREMENTS_DOCUMENT.md`.

---

### PROMPT 5: Quantified Impact Assessment & ROI Model (`docs/IMPACT.md`)

**Instruction for Agent:**
Build the official **Quantified Impact Assessment** deliverable (`docs/IMPACT.md`) modeling concrete enterprise ROI, operational time saved, and security risk reduction.

**Action Items:**
1. Create `docs/IMPACT.md`:
   * **Headline Impact Table (Before vs. After FinSight 2.0):**
     | Metric Category | Metric | Baseline (Traditional / FinSight 1.0) | FinSight 2.0 (Verified) | Measurement Methodology |
     |---|---|---|---|---|
     | **Security** | Attack Success Rate (ASR) | ~75% (Regex bypassable) | **0.0% (42/42 Blocked)** | Automated 40+ Red-Team Pytest Suite |
     | **Confidentiality**| Cross-Role Data Leakage | ~60% (Full schema in prompt) | **0.0% (Strict View Isolation)** | Instrumented Token/Response Audit |
     | **Accuracy** | Text-to-SQL Precision | ~45% (Ambiguous column names)| **95.2% (Business Semantic Layer)**| 20 Fixed Enterprise Benchmark Queries |
     | **Intelligence** | Multi-Modal Fusion Questions | 0% (Unsupported / Binary) | **100% (Reconciled with Provenance)**| Hybrid Evaluation Dataset |
     | **Trust** | Answers with Verifiable Provenance| 0% (Unattributed text) | **100% (Row & Passage Citations)** | Provenance Metadata Verification |
     | **Compliance** | Audit Trail Coverage | 0% (Unlogged) | **100% Immutable SQLite Logging**| Audit Log Completeness Check |
   * **Enterprise Economic & Operational ROI Model:**
     * Scenario: 500-employee fintech enterprise (FinSolve Technologies).
     * Time saved per cross-department query: from **48 hours (email back-and-forth)** to **< 3 seconds**.
     * Estimated analyst productivity increase: **+35%**.
     * Risk reduction: **100% mitigation of unauthorized internal insider data breaches**.
   * **Societal & Industry Impact (Pak Angels Theme Alignment):**
     * Safe AI adoption for Pakistani startups, financial institutions, and public sector organizations under strict data sovereignty requirements.

**Verification Gate:**
Confirm `docs/IMPACT.md` has concrete numbers, clear measurement formulas, and zero vague generalizations.

---

### PROMPT 6: Enterprise Dataset Enrichment (Finance, HR, and Marketing)

**Instruction for Agent:**
Enrich the mock corporate datasets in `static/uploads/` and `resources/data/` so that live queries in the video demo return realistic, high-impact numbers and narratives.

**Action Items:**
1. **Finance Enrichment (`static/uploads/Finance/`):**
   * Enrich `quarterly_financial_report.md` with:
     * Detailed breakdown of Q1, Q2, Q3, and Q4 2024 operating expenses, gross margins, vendor services allocation, and EBITDA.
     * Specific explanation of why Q3 marketing expenses rose by $45,000 (Nationwide re-branding initiative, enterprise fintech sponsorship, customer acquisition surge).
2. **HR Enrichment (`static/uploads/HR/`):**
   * Expand `hr_data.csv` (100+ realistic records):
     * Columns: `employee_id, full_name, role, department, email, location, date_of_birth, date_of_joining, manager_id, salary, leave_balance, leaves_taken, attendance_pct, performance_rating, last_review_date`.
     * Ensure realistic spread across Engineering, Finance, Marketing, HR, Operations, and Sales.
     * Include high performers (`performance_rating = 5`) across departments to support complex analytical queries.
3. **Marketing Enrichment (`static/uploads/Marketing/`):**
   * Update `marketing_report_q3_2024.md` and `marketing_report_2024.md`:
     * Document exact CAC (Customer Acquisition Cost), LTV (Lifetime Value), campaign ROI (410%), and ad-spend metrics.
4. **General & Compliance (`static/uploads/General/`):**
   * Polish `employee_handbook.md` with structured tables for leave entitlements (maternity, paternity, casual, sick), compensation rules, and data security guidelines.

**Verification Gate:**
Verify all CSV and Markdown files are well-formed, UTF-8 encoded, and loadable by DuckDB and Chroma.

---

### PROMPT 7: Final Packaging, Google Docs Ready Text & Hand-Off to Ammar Ayaz

**Instruction for Agent:**
Consolidate all outputs, verify formatting, prepare Google Docs sharing text, and report completion to Member 4 for hand-off to **Ammar Ayaz (Team Leader)**.

**Action Items:**
1. Verify all generated files:
   * `docs/PRODUCT_REQUIREMENTS_DOCUMENT.md`
   * `docs/IMPACT.md`
   * Enriched data files in `static/uploads/`
2. Prepare a Google Docs Export Ready summary:
   * Provide a clean text block that Member 4 can copy directly into Google Docs, set sharing permissions to *"Anyone with link can view"*, and generate the PRD link required for hackathon submission.
3. Output the Final Completion Notice:
   ```
   ======================================================================
   ✅ MEMBER 4 DELIVERABLES ARE 100% COMPLETE & VERIFIED!
   ======================================================================
   1. Official PRD: docs/PRODUCT_REQUIREMENTS_DOCUMENT.md (12 Comprehensive Sections)
   2. Quantified Impact Assessment: docs/IMPACT.md (Before/After ROI Table)
   3. Enriched Enterprise Datasets: Finance, HR, Marketing, General data ready
   
   Member 4, your work is complete! 
   You can now send your PRD Google Doc link and enriched data to:
   👉 Ammar Ayaz (Team Leader)
   ======================================================================
   ```

---

## 4. Deliverables Checklist for Member 4

Before sending your folder to Ammar Ayaz, verify:
- [ ] `docs/PRODUCT_REQUIREMENTS_DOCUMENT.md` has all 12 sections fully filled out.
- [ ] Team Leader is explicitly named as **Ammar Ayaz**.
- [ ] `docs/IMPACT.md` has the before-vs-after comparison table and ROI calculations.
- [ ] `static/uploads/HR/hr_data.csv` contains clean, rich employee records.
- [ ] `static/uploads/Finance/` contains detailed numbers and narrative justifications.
- [ ] A Google Docs copy of the PRD is created and set to **Viewable by anyone with the link**.
