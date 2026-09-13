# FinSight 2.0: Person 3 (AI Intelligence & Hybrid Fusion Engineer) Master Execution Plan

> **CRITICAL AGENT INSTRUCTION:**
> You are an expert Generative & Agentic AI Software Engineer. You are executing this document inside the backend repository folder named `finsight-intelligence-engine/` (or directly within the backend directory structure of `RBAC-Project-main`).
> **DO NOT IMPLEMENT EVERYTHING AT ONCE.**
> 1. Read and deeply understand this entire document first.
> 2. Explain your understanding in a brief overview to the user.
> 3. Then, stop and ask the user explicitly: **"Can I execute Prompt 1?"**
> 4. Execute Prompt 1 step-by-step, run its verification, and confirm it passes.
> 5. Only after verification passes, ask: **"Prompt 1 complete and verified. Can I execute Prompt 2?"**
> 6. Continue sequentially through all prompts until the entire intelligence & fusion engine is complete, accurate, verified, and ready to be delivered to Ammar.

---

## 1. Role, Scope & Deliverable Overview

* **Owner:** Person 3 (AI Intelligence & Hybrid Fusion Engineer).
* **Target Focus:** The **Reasoning, 3-Way Query Routing, Business Semantic Layer, Cross-Modal Fusion, and Verifiable Provenance Citations**.
* **Tech Stack:** Python 3.10+, Groq SDK / OpenAI-compatible client (`llama-3.3-70b-versatile`), LangChain Core / Runnables, DuckDB, FastEmbed, FlashRank, PyYAML, Tabulate, Pytest.
* **Key Principles:**
  * **Zero Cost:** Powered by **Groq** (`llama-3.3-70b-versatile`) for classification, NL$\to$SQL, and synthesis; **FastEmbed** for embeddings; and **FlashRank** for cross-encoder reranking. Zero paid API tokens required.
  * **Trust Through Provenance:** No answer is returned as a plain ungrounded string. Every claim carries verifiable citations: exact DuckDB SQL view queries & row counts for numbers, and exact document names, sections, and passage excerpts for text.
  * **The "Wow" Capability (Hybrid Fusion):** Moving beyond simple binary routing. Answering complex compound enterprise questions (e.g. *"Why did Q3 marketing expense exceed budget, and by how much?"*) by combining tabular SQL arithmetic with document context and explicit cross-modal reconciliation.
* **Core Modules to Build:**
  1. **3-Way Intent Router (`app/rag_utils/query_classifier.py`):** Routes incoming queries into `SQL`, `RAG`, or `HYBRID`.
  2. **Business Semantic Layer (`app/rag_utils/semantic_layer.yaml` & `semantic_engine.py`):** Standardizes financial, HR, and marketing formulas to eliminate SQL guessing.
  3. **Enhanced Text-to-SQL Agent (`app/rag_utils/csv_query.py`):** Ingests semantic formulas, queries role views, and performs result-shape validation.
  4. **Active Reranker & Contextual RAG Retriever (`app/rag_utils/rag_module.py` & `rag_chain.py`):** Activates FlashRank/Cohere reranker and preserves chunk source metadata.
  5. **Cross-Modal Reconciliation Engine (`app/rag_utils/hybrid_engine.py`):** Executes SQL and RAG in parallel and synthesizes a reconciled narrative.
  6. **Answer-Level Citation & Provenance Formatter (`app/rag_utils/citations.py`):** Structures exact provenance metadata for frontend rendering.
  7. **Comprehensive Integration with `/chat`:** Updates FastAPI chat handler to return the full 2.0 contract.
  8. **Offline Quality & Citation Evaluator (`app/rag_evaluator/evaluator.py`):** Extends evaluation suite to measure hybrid quality and citation accuracy.

---

## 2. Directory Architecture for Person 3's Scope

```
app/
├── rag_utils/
│   ├── query_classifier.py    # 3-way LLM router (SQL | RAG | HYBRID) with few-shot prompts
│   ├── semantic_layer.yaml    # Standardized business definitions, metric formulas, and table mappings
│   ├── semantic_engine.py     # Injects semantic definitions into SQL generation prompts
│   ├── csv_query.py          # Refactored SQL agent with result validation & citation formatting
│   ├── rag_module.py          # RAG pipeline with active FlashRank/Cohere reranker & metadata retention
│   ├── rag_chain.py           # Async RAG executor returning answers + source passage citations
│   ├── hybrid_engine.py       # Parallel SQL+RAG executor & cross-modal reconciliation synthesizer
│   └── citations.py           # Structured citation builder (SQL rows, Doc excerpts, reconciliation)
├── rag_evaluator/
│   ├── evaluator.py           # Evaluates Faithfulness, Relevancy, and Citation Coverage
│   └── hybrid_test_cases.json # Fixed benchmark queries testing SQL, RAG, and HYBRID correctness
tests/
└── test_intelligence_engine.py # Comprehensive unit & integration tests for Router, SQL, RAG, and Fusion
```

---

## 3. Sequential Step-by-Step Prompts for Agent Execution

---

### PROMPT 1: 3-Way Intelligent Query Router (`query_classifier.py`)

**Instruction for Agent:**
Upgrade the binary query classifier (`query_classifier.py`) into a 3-way router that classifies queries into `SQL`, `RAG`, or `HYBRID` using Groq (`llama-3.3-70b-versatile`).

**Action Items:**
1. Refactor `app/rag_utils/query_classifier.py`:
   * Use `get_llm(model="llama-3.3-70b-versatile", temperature=0.0)` from `llm_client.py`.
   * Formulate few-shot prompt with explicit classification criteria:
     * **`SQL`**: Pure analytical, statistical, aggregation, or tabular filtering queries.
       * *Examples:* "List all employees in Finance with rating 5", "Average salary by department", "Total marketing expenditure in 2024".
     * **`RAG`**: Qualitative, procedural, policy, architectural, or informational document queries.
       * *Examples:* "What is the policy for paternity leave?", "Summarize system architecture guidelines", "What are the core values of FinSolve?".
     * **`HYBRID`**: Compound questions requiring a numerical fact/variance from a table **and** a conceptual reason, justification, or explanation from a document.
       * *Examples:* "Why did marketing expenses increase in Q3?", "How much did travel expenses increase in 2024 and what caused it?", "Explain the relationship between headcount growth and office supply expenditure".
   * Function `detect_query_type_llm(question: str) -> str`: Returns strictly `"SQL"`, `"RAG"`, or `"HYBRID"`.
2. Add unit tests in `tests/test_intelligence_engine.py`:
   * Test 5 SQL queries $\to$ all return `SQL`.
   * Test 5 RAG queries $\to$ all return `RAG`.
   * Test 5 Hybrid queries $\to$ all return `HYBRID`.

**Verification Command:**
```bash
python -c "from app.rag_utils.query_classifier import detect_query_type_llm; print('Q1:', detect_query_type_llm('Average salary of QA engineers')); print('Q2:', detect_query_type_llm('Explain paternity leave policy')); print('Q3:', detect_query_type_llm('Why did Q3 marketing expense exceed budget?'))"
```
*Expected Output:* `Q1: SQL | Q2: RAG | Q3: HYBRID`.

---

### PROMPT 2: Business Semantic Layer (`semantic_layer.yaml` & `semantic_engine.py`)

**Instruction for Agent:**
Build the enterprise business semantic layer to map ambiguous business terminology into explicit DuckDB SQL calculations and column definitions, preventing LLM hallucination in SQL generation.

**Action Items:**
1. Create `app/rag_utils/semantic_layer.yaml`:
   ```yaml
   business_metrics:
     net_income_growth:
       description: "Percentage increase in net income between fiscal periods"
       calculation: "((net_income_current - net_income_prior) / net_income_prior) * 100"
     roi:
       description: "Return on Investment"
       calculation: "(net_profit / total_investment) * 100"
     marketing_spend:
       description: "Total expenditures on marketing and advertising campaigns"
       calculation: "SUM(vendor_services + campaign_cost)"
     employee_attrition:
       description: "Rate of employees taking extended leaves or departures"
       calculation: "leaves_taken / headcount"
     top_performers:
       description: "Employees with the highest performance appraisal"
       filter: "performance_rating = 5"
     headcount:
       description: "Total count of active employees"
       calculation: "COUNT(employee_id)"

   column_synonyms:
     name: ["full_name", "employee_name"]
     salary: ["compensation", "annual_pay", "ctc"]
     rating: ["performance_rating", "appraisal_score"]
     department: ["dept", "division", "team"]
     quarter: ["fiscal_quarter", "period"]
   ```
2. Create `app/rag_utils/semantic_engine.py`:
   * Function `get_semantic_context_for_query(query: str) -> str`:
     * Matches keywords in user query against metric names and column synonyms.
     * Generates a concise `Semantic Layer Guidance:` block to inject directly into the Text-to-SQL prompt.

**Verification Command:**
```bash
python -c "from app.rag_utils.semantic_engine import get_semantic_context_for_query; print(get_semantic_context_for_query('What is the ROI and who are the top performers?'))"
```
*Expected Output:* Returns definitions for `roi` and `top_performers` formulas.

---

### PROMPT 3: Refactored Text-to-SQL Agent with Result-Shape Validation (`csv_query.py`)

**Instruction for Agent:**
Refactor `csv_query.py` to ingest semantic definitions, query role-scoped views, validate result shapes, and format SQL citation metadata.

**Action Items:**
1. In `app/rag_utils/csv_query.py`:
   * Use Groq `llama-3.3-70b-versatile` via `llm_client.py`.
   * Integrate with `semantic_engine.py` and `duckdb_views.py`:
     * Fetch allowed views for role via `get_allowed_views_for_role(role)`.
     * Fetch isolated schema prompt via `build_isolated_schema_prompt(role)`.
     * Fetch semantic layer formulas matching the question.
   * Format prompt:
     ```
     You are an expert SQL generator for DuckDB.
     Available Views for this User's Role:
     {schema_block}

     Semantic Layer Definitions:
     {semantic_context}

     Constraints:
     - ONLY query the views listed above. Do NOT query base tables.
     - Return strictly executable DuckDB SELECT query, no markdown fences.
     Question: "{question}"
     ```
   * Result-Shape Validation:
     * Executes SQL on DuckDB.
     * Validates:
       * If row count == 0: Graceful message ("Query executed successfully on view, but returned 0 records matching criteria").
       * If error: Intercepts error and triggers fallback cleanly.
   * Return standardized dictionary:
     ```python
     return {
         "answer": markdown_table,
         "sql": sql,
         "view_used": view_name,
         "row_count": len(output),
         "raw_rows": output[:10]  # sample for citations panel
     }
     ```

**Verification Command:**
```bash
python -c "import asyncio; from app.rag_utils.csv_query import ask_csv; res = asyncio.run(ask_csv('List employees with performance rating 5', 'hr', 'natasha', return_sql=True)); print('SQL:', res.get('sql'), '| Rows:', res.get('row_count'))"
```
*Expected Output:* Executes query on `v_hr_data_hr`, returns row count $> 0$ and markdown table.

---

### PROMPT 4: Active Reranker & Contextual RAG Retriever (`rag_module.py` & `rag_chain.py`)

**Instruction for Agent:**
Fix the reranker bypass bug from v1. Wire the **FlashRank** local reranker (or Cohere trial) actively into `get_rag_chain`, and preserve chunk metadata for citations.

**Action Items:**
1. In `app/rag_utils/rag_module.py`:
   * Update `get_rag_chain(user_role: str)`:
     * Creates base retriever with hard metadata filter `{"role": {"$in": [user_role, "general"]}}`.
     * Wraps with `ContextualCompressionRetriever` using `FlashRank` (or `CohereRerank` if `COHERE_API_KEY` is present in `.env`).
     * Fixes v1 bug: Reranking is now **always active** on retrieved chunks!
   * System Prompt update:
     * Instructs model to cite source documents explicitly:
       `Always include the document title and specific section when answering.`
2. In `app/rag_utils/rag_chain.py`:
   * Refactor `ask_rag(question: str, role: str) -> dict`:
     * Invokes retrieval chain.
     * Extracts source documents:
       ```python
       citations = []
       for doc in result.get("context", []):
           citations.append({
               "type": "document",
               "source": doc.metadata.get("source", "Unknown"),
               "role": doc.metadata.get("role", "general"),
               "passage": doc.page_content[:300] + "..."
           })
       return {
           "answer": result["answer"],
           "citations": citations
       }
       ```

**Verification Command:**
```bash
python -c "import asyncio; from app.rag_utils.rag_chain import ask_rag; res = asyncio.run(ask_rag('What are the statutory employee benefits at FinSolve?', 'hr')); print('Answer:', res['answer'][:100], '... | Citations:', len(res['citations']))"
```
*Expected Output:* Returns grounded answer with at least 1-4 document passage citations.

---

### PROMPT 5: Parallel Hybrid Executor & Cross-Modal Reconciliation (`hybrid_engine.py`)

**Instruction for Agent:**
Implement the signature "Hero" capability of FinSight 2.0: The **Hybrid Fusion Engine**. Run SQL analytics and RAG document retrieval in parallel, and synthesize a reconciled answer with provenance.

**Action Items:**
1. Create `app/rag_utils/hybrid_engine.py`:
   * Function `execute_hybrid_query(question: str, role: str, username: str) -> dict`:
     * Uses `asyncio.gather` to execute both engines concurrently:
       ```python
       sql_task = ask_csv(question, role, username, return_sql=True)
       rag_task = ask_rag(question, role)
       sql_res, rag_res = await asyncio.gather(sql_task, rag_task, return_exceptions=True)
       ```
     * Handles graceful partial failure (if SQL fails, falls back to RAG with note; if RAG fails, uses SQL).
     * If both succeed, runs **Cross-Modal Reconciliation Synthesis**:
       * Prompt Groq `llama-3.3-70b-versatile`:
         ```
         You are the FinSight Enterprise Fusion Synthesizer.
         Synthesize a comprehensive, authoritative answer to the user's question using BOTH the quantitative data from DuckDB and qualitative context from internal documents.

         User Question: "{question}"

         Structured Data Findings (from DuckDB SQL):
         {sql_answer}

         Document Evidence (from Internal Policies & Reports):
         {rag_answer}

         Instructions:
         1. State the exact numerical findings clearly.
         2. Explain the business reasons, context, or policy factors behind the numbers based on the documents.
         3. Add a dedicated "Reconciliation" statement:
            - If numbers and documents agree: State "Agreement: [Explain how document explains the number]"
            - If there is a discrepancy: State "Variance: [Explain conflict]"
         ```
     * Compiles unified response:
       ```python
       return {
           "answer": fused_answer,
           "mode": "HYBRID",
           "sql_result": sql_res,
           "rag_result": rag_res,
           "citations": sql_citations + rag_citations,
           "reconciliation": reconciliation_summary
       }
       ```

**Verification Command:**
```bash
python -c "import asyncio; from app.rag_utils.hybrid_engine import execute_hybrid_query; res = asyncio.run(execute_hybrid_query('Why did marketing expenses increase in Q3 and by how much?', 'marketing', 'bruce')); print('Mode:', res['mode'], '| Answer:', res['answer'][:150], '| Citations:', len(res['citations']))"
```
*Expected Output:* Fused answer containing tabular numbers, document narrative, and citations.

---

### PROMPT 6: Structured Citation & Provenance Builder (`citations.py`)

**Instruction for Agent:**
Create a dedicated provenance formatting module `citations.py` that standardizes citation objects across SQL, RAG, and HYBRID queries so the Next.js frontend can render them seamlessly.

**Action Items:**
1. Create `app/rag_utils/citations.py`:
   * Class `CitationBuilder`:
     * `add_sql_citation(view_name: str, query: str, rows: list, total_count: int)`
     * `add_doc_citation(source_file: str, role: str, snippet: str, section: str = None)`
     * `add_reconciliation(status: str, explanation: str)`
     * `build() -> list[dict]`
   * Generates clean, JSON-serializable citation blocks matching the exact schema expected by `CitationsPanel.tsx` in the frontend.

**Verification Command:**
```bash
python -c "from app.rag_utils.citations import CitationBuilder; cb = CitationBuilder(); cb.add_sql_citation('v_hr_data_hr', 'SELECT *', [{'id': 1}], 1); print(cb.build())"
```
*Expected Output:* Returns valid structured list with `type: 'sql'`.

---

### PROMPT 7: FastAPI `/chat` Router Upgrade & Full Contract Wiring

**Instruction for Agent:**
Update `app/main.py`'s `/chat` endpoint to orchestrate 3-way routing, security logging, hybrid fusion, and structured citation delivery.

**Action Items:**
1. In `app/main.py`:
   * Update `/chat`:
     ```python
     @app.post("/chat")
     async def chat(req: ChatRequest, user=Depends(authenticate)):
         role = user["role"]
         username = user["username"]
         question = req.question
         start_time = time.time()

         # 1. Detect 3-way route: SQL, RAG, or HYBRID
         mode = detect_query_type_llm(question)

         # 2. Execute according to route
         if mode == "HYBRID":
             result = await execute_hybrid_query(question, role, username)
         elif mode == "SQL":
             result = await ask_csv(question, role, username, return_sql=True)
         else:
             result = await ask_rag(question, role)

         # 3. Check for security blocks
         if result.get("error"):
             mode = "BLOCKED"
             log_audit_event(username, role, question, mode, False, result.get("answer"))
             return {"user": username, "role": role, "mode": "BLOCKED", "answer": result["answer"], "citations": []}

         # 4. Log successful audit event
         latency = (time.time() - start_time) * 1000
         log_audit_event(username, role, question, mode, True, latency_ms=latency)

         return {
             "user": username,
             "role": role,
             "mode": mode,
             "answer": result["answer"],
             "citations": result.get("citations", []),
             "reconciliation": result.get("reconciliation", None),
             **({"sql": result["sql"]} if "sql" in result else {})
         }
     ```

**Verification Command:**
```bash
python -c "from fastapi.testclient import TestClient; from app.main import app; c = TestClient(app); res = c.post('/chat', auth=('admin', 'admin123'), json={'question': 'Summarize leave policies'}); print(res.json()['mode'], '| Citations:', len(res.json()['citations']))"
```
*Expected Output:* Returns `mode: RAG` with valid citations list.

---

### PROMPT 8: Offline Evaluator Extension & Delivery Verification

**Instruction for Agent:**
Extend the offline evaluation pipeline (`app/rag_evaluator/`) to benchmark Hybrid fusion queries, run end-to-end tests, and verify delivery.

**Action Items:**
1. In `app/rag_evaluator/evaluator.py`:
   * Add benchmark evaluation for Hybrid questions:
     * **Faithfulness**: Is the fused response grounded in both the SQL output and retrieved chunks?
     * **Citation Precision**: Does every citation directly support a sentence in the response?
2. Run full intelligence test suite:
   ```bash
   pytest tests/test_intelligence_engine.py -v
   ```
3. Announce Final Completion:
   * Output: *"Person 3 Scope Complete. 3-way router, business semantic layer, parallel hybrid fusion, and verifiable citations are 100% verified. Ready to deliver to Ammar."*

---

## 4. Person 3 Deliverable Checklist

When Person 3 finishes, their folder will contain:
- [ ] `app/rag_utils/query_classifier.py` upgraded to 3-way router (`SQL | RAG | HYBRID`).
- [ ] `app/rag_utils/semantic_layer.yaml` and `semantic_engine.py` standardizing enterprise formulas.
- [ ] `app/rag_utils/csv_query.py` refactored with role views and result validation.
- [ ] `app/rag_utils/rag_module.py` & `rag_chain.py` with active FlashRank reranker and chunk metadata preservation.
- [ ] `app/rag_utils/hybrid_engine.py` with parallel execution and cross-modal reconciliation.
- [ ] `app/rag_utils/citations.py` generating verifiable provenance objects.
- [ ] `app/main.py` updated to return 2.0 `/chat` contract with citations and route badges.
- [ ] All unit and integration tests in `tests/test_intelligence_engine.py` passing 100%.
