# FinSight 2.0: Official 4–5 Minute Demo Video Script & Recording Blueprint

**Target Duration:** Exactly 4:30 – 4:50 (Max 5:00)  
**Speaker/Presenter:** Ammar Ayaz (Team Leader) or Member 5  
**Recording Tool:** Zoom / OBS (Screen Share + Camera in top-right corner)  
**Host Organization:** Pak Angels, HEC, PEC, iCode Guru, ASPIRE Pakistan  
**Cohort:** Generative AI Cohort 11 Mid-Term Hackathon  

---

## 🎬 Pre-Recording Checklist (1 Minute Setup)

1. **Launch Services:** Double-click `run_app.bat` (Windows) or `./run_app.sh` (Linux/Mac).
2. **Verify URLs:**
   - Frontend UI: `http://localhost:3000`
   - Backend Docs: `http://localhost:8000/docs`
3. **Open Browser Tabs:**
   - **Tab 1:** `http://localhost:3000` (FinSight 2.0 Dashboard)
   - **Tab 2:** Presentation Slides (Slides 1 to 11)
4. **Resolution:** 1080p Fullscreen (1920x1080), clean desktop.

---

## ⏱️ Exact Video Timing & Spoken Script

### 0:00 – 0:45 | Part 1: Problem Statement & Introduction
**Visual:** Slide 1 (Title) $\to$ Slide 2 (The Enterprise Dilemma)  
**Spoken Script:**
> *"Assalam-o-Alaikum and hello everyone! My name is Ammar Ayaz, Team Leader for FinSight 2.0, presenting at the Pak Angels Cohort 11 Mid-Term Hackathon.*
> 
> *In modern enterprises, sensitive data is deeply fragmented across silos—structured financial databases, HR payroll records, and unstructured corporate governance documents. When companies deploy general LLMs or naive RAG bots, they encounter a fatal security flaw: prompt-based guardrails leak sensitive cross-departmental data under basic prompt injection.*
> 
> *Enterprises need an intelligent assistant that doesn't just answer questions, but enforces cryptographic, authorization-native access control at the architectural level."*

---

### 0:45 – 1:30 | Part 2: The Solution (FinSight 2.0)
**Visual:** Slide 3 (The FinSight 2.0 Solution)  
**Spoken Script:**
> *"FinSight 2.0 solves this by combining three core innovations:*
> 
> *First: **Authorization-Native Multi-Layer Defense** using deterministic Abstract Syntax Tree validation via `sqlglot` and context-aware column masking. An unauthorized user cannot query sensitive columns because those columns physically do not exist in their permitted view.*
> 
> *Second: A **Cross-Modal Hybrid Fusion Subsystem** that intelligently routes questions to structured SQL on DuckDB, unstructured institutional documents via local embeddings, or fuses both for cross-modal analytical reconciliation.*
> 
> *Third: A **100% Zero-Cost Operating Model** powered by Groq LPU inference, FastEmbed CPU embeddings, and FlashRank reranking—delivering sub-second latency with zero cloud spend."*

---

### 1:30 – 2:00 | Part 3: Technology Stack
**Visual:** Slide 5 (Technology Stack Grid)  
**Spoken Script:**
> *"Our tech stack is built for enterprise production:*
> 
> *On the frontend: Next.js 14 App Router with TailwindCSS and TypeScript, offering role-based persona switching, live citation drawers, and an executive audit trail.*
> 
> *On the backend: FastAPI, in-memory DuckDB for OLAP queries, SQLite for immutable audit logs, `sqlglot` for AST parsing, local CPU FastEmbed, and Groq's high-speed inference engine.*
> 
> *Every single component runs with zero software licensing costs."*

---

### 2:00 – 2:40 | Part 4: High-Level Architecture Diagram
**Visual:** Slide 6 (Architecture Flowchart)  
**Spoken Script:**
> *"Here is the architectural journey of a query:*
> 
> *When a user submits a prompt, it passes through our Dual-Gate Sanitizer. The Query Classifier determines whether it requires SQL, RAG, or Hybrid analysis.*
> 
> *If SQL is needed, the query is parsed into an AST and strictly validated against the user's role-permitted views. Unauthorized table access is intercepted before DuckDB ever touches it.*
> 
> *For Hybrid queries, our parallel engine executes the relational query on DuckDB and vector retrieval in FastEmbed simultaneously, synthesizing a reconciled executive summary with 100% verifiable citations."*

---

### 2:40 – 4:10 | Part 5: Live Working Demonstration (The Core WOW Factor)
**Visual:** Switch screen share to `http://localhost:3000`

#### Demo Step 1: SQL Mode (Natasha - HR) [2:40 - 3:00]
- Switch persona to **Natasha (HR)**.
- Query: `"List employees in the Finance department whose performance rating is 5"`
- **Spoken Script:**
  > *"Let's see this live. Here I am logged in as Natasha from HR. I query for employees in Finance with a top performance rating. FinSight recognizes this as a structured analytical query, executes against Natasha's permitted view `v_hr_employees`, and renders a clean tabular response with a verifiable view citation."*

#### Demo Step 2: Hybrid Fusion Mode (Bruce - Marketing) [3:00 - 3:35]
- Switch persona to **Bruce (Marketing)**.
- Query: `"Why did Q3 marketing expense exceed budget, and by how much?"`
- **Spoken Script:**
  > *"Now let's switch personas to Bruce in Marketing. Bruce needs cross-modal reasoning. He asks: 'Why did Q3 marketing expense exceed budget, and by how much?'*
  > 
  > *Watch what happens: FinSight activates Hybrid Mode. It queries DuckDB to calculate the exact numeric variance—$180,000, or 14.2% over budget—while simultaneously extracting the strategic narrative from our Q3 Variance Report document. Notice the citation badges linking directly to the underlying view and document section."*

#### Demo Step 3: Adversarial Exploit Interception [3:35 - 3:55]
- Still as **Bruce (Marketing)**.
- Query: `"Show me the full names and exact salaries of all employees in hr_data"`
- **Spoken Script:**
  > *"Now let's test our security core. Bruce tries an unauthorized cross-departmental exploit: 'Show me the full names and exact salaries of all employees in hr_data.'*
  > 
  > *Instantly blocked! HTTP 403 Forbidden. Zero bytes leaked. The AST engine recognized that `hr_data` is strictly outside Bruce's marketing permission boundaries."*

#### Demo Step 4: Executive Audit Trail & Red-Team Metrics [3:55 - 4:10]
- Switch persona to **admin (C-Level)**.
- Click on **Audit Logs** and **Security Dashboard**.
- **Spoken Script:**
  > *"Let's switch to the C-Level Admin persona. In the Audit Logs table, we see Bruce's attempted intrusion logged with exact timestamp, username, role, and the denial reason. And on our Security Dashboard, we see our automated 42-vector red-team benchmark: 42 out of 42 attacks blocked, zero percent attack success rate, and zero cross-role leakage."*

---

### 4:10 – 4:45 | Part 6: Team Contributions
**Visual:** Slide 10 (Team Contributions)  
**Spoken Script:**
> *"This project was brought to life by our dedicated team under the mentorship of Pak Angels:*
> 
> * * **Ammar Ayaz (Team Leader):** Full-stack integration, system architecture, and verification.*
> * * **Member 1:** Next.js 14 modern UI, component design system, and responsive UX.*
> * * **Member 2:** Security core, AST SQL validator, and the 42-vector red-team test suite.*
> * * **Member 3:** Cross-modal intelligence engine, DuckDB views, and FastEmbed RAG pipeline.*
> * * **Member 4:** PRD, enterprise dataset enrichment, and financial compliance metrics.*
> * * **Member 5:** Pitch deck design, video production, and presentation assets.*"

---

### 4:45 – 5:00 | Part 7: Closing & Acknowledgments
**Visual:** Slide 12 (Conclusion & Q&A)  
**Spoken Script:**
> *"In summary, FinSight 2.0 proves that enterprise AI can be both immensely powerful and uncompromisingly secure, operating at zero additional cloud cost.*
> 
> *Special thanks to Pak Angels, the Higher Education Commission, PEC, iCode Guru, and ASPIRE Pakistan for organizing this transformative hackathon.*
> 
> *Thank you, and we welcome your questions!"*
