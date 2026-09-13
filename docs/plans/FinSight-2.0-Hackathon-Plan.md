# FinSight 2.0 — Pak Angels Cohort 11 Mid-Term Hackathon Plan

**Team Lead:** Ammar Khan
**Event:** Pak Angels / Aspire Pakistan — Cohort 11 Mid-Term Hackathon (48-Hour AI Productivity & Innovation Challenge)
**Window:** Fri 11 Sep 9:00 PM PKT → Sun 13 Sep 11:59 PM PKT
**Team registration deadline:** Sat 12 Sep 12:00 noon PKT
**Base project:** RBAC-Project-main (FinSight 1.0, local folder)
**Build model:** Ammar + one strong agent (Devin / Claude Pro), sequential single-codebase execution
**Plan version:** 1.0 — written 9 Sep 2026

---

## 0. How to read this plan

This document is the single source of truth for the 48 hours. It contains:

- What already exists in FinSight 1.0 (verified against your own status report)
- What the research plan (FinSight 2.0 doc) proposes, and how much of it is actually done (spoiler: ~5–10%)
- The **exact scope** we will build, and the exact scope we will deliberately NOT build
- An hour-by-hour schedule mapped to the real 48-hour window
- The judging criteria (fetched from the official hackathon site) and how every task maps to a scoring criterion
- Deliverables, deployment, submission checklist, and a risk register

**Confirmed facts** are marked plainly. **Assumptions** are marked `[ASSUMPTION]`. **Open questions for Ammar** are marked `[ASK]`. Nothing in this plan is invented — where I could not verify something, I said so.

---

## 1. Official judging criteria (verified)

Fetched from `https://hackathon.aspirepk.org/PakAngels-Cohort11-Midterm/` on 9 Sep 2026:

**Judging Criteria (4 stated):**
1. **Generative AI Innovation** — Is the project aligned with the theme of Generative AI?
2. **Real-World Impact** — Does the solution solve a significant problem?
3. **Technical Implementation** — How well is the AI integrated and does it function as intended?
4. **Documentation** — Is the project thoroughly documented and easy to reproduce?

**Stated evaluation lens (rules section):** originality, technical execution, practical applicability, potential for positive societal impact.

**Hard rules:**
- Team size **4–6 members** (mandatory — non-compliant teams are disqualified)
- Project **must use Generative AI** directly or indirectly (non-AI projects disqualified)
- Submission deadline: **Sep 13, 2026 @ 11:59 pm PKT**
- Submission platform: **Google Drive link with open access**
- Project description: **up to 1000 words** covering objectives, technical details, innovation, impact
- Category options include **Finance & AI Solutions** and **Automation** — FinSight fits *Finance & AI Solutions* best

**Course-portal deliverables (from your screenshot):**
- Working **deployed** solution
- **5-minute demo video** + presentation
- **Quantified impact assessment**
- Graded 15% of the certificate; marked OPTIONAL but required for certificate per the WhatsApp announcement

**Timing discrepancy to resolve:** the portal says the hackathon module "Opens Sat 12 Sep, 12:00 AM PKT" and refers to the weekend Sep 12–13; the WhatsApp message says it starts Friday 9:00 PM PKT. `[ASK]` Confirm in the Wednesday 8 PM guidance session. This plan assumes the **Friday 9 PM start** and treats anything earlier as bonus prep time.

### 1.1 What these criteria change about our strategy

This is the single most important section of the plan.

The criteria are **not** "most technically exotic wins". Two of the four criteria — **Real-World Impact** and **Documentation** — are non-code criteria. That means:

- **Documentation is worth as much as technical implementation.** A beautifully engineered project with a thin README will lose to a good project with an excellent README, architecture diagram, reproducible setup, and clear impact numbers. We will treat documentation as a first-class deliverable, not an afterthought.
- **"Generative AI Innovation" rewards the agentic/GenAI angle explicitly.** The training program is "Generative & Agentic AI" — so our framing must foreground the *agentic* parts (query router agent, SQL agent, retrieval agent, verification agent, red-team agent), not just "we have RBAC".
- **"Real-World Impact" rewards a believable problem.** Enterprise data confidentiality + instant department-scoped answers is a genuinely real problem with a societal-impact framing (data privacy, compliance, safe AI adoption in regulated industries). We will state it in those terms.
- **"Easy to reproduce" is stated explicitly.** One-command setup (docker compose or a single `make dev`) is worth real points.

---

## 2. Where FinSight actually stands today

### 2.1 FinSight 1.0 — built and working (~95% of v1 scope)

Source: your own completion report (9 Sep 2026).

| Component | Status |
|---|---|
| Streamlit UI | Built |
| FastAPI backend (`app/main.py`, ~292 lines) | Built |
| Query classifier (binary: SQL vs RAG) | Built |
| SQL agent — NL→SQL→DuckDB (`app/rag_utils/csv_query.py`) | Built |
| RAG agent — Chroma + LLM (`app/rag_utils/rag_module.py`) | Built |
| Cohere reranking | Built |
| SQL→RAG fallback (one-directional) | Built |
| Role tagging on documents; 6 roles; bcrypt auth; SQLite user store | Built |
| Offline eval — faithfulness / relevance / conciseness / context recall (`app/rag_evaluator/`) | Built |
| Pytest backend tests + Playwright UI tests | Built |
| Sample data per department (MD + CSV) | Built |

Remaining v1 gaps: API keys not configured (`app/rag_utils/secret_key.py` is a template), runtime DB/vector store generated on first run.

### 2.2 FinSight 2.0 research plan — coverage check

Your research document lists **37 numbered opportunities** across 9 clusters, tiered A–D, with a recommended 5-phase roadmap.

**Honest coverage: ~5–10%.** None of the 37 opportunities is implemented. What exists is the *foundation the plan builds on* (dual engine, role tags, offline eval, test harness), not the plan itself.

| Phase | Contents | Coverage today |
|---|---|---|
| Phase 1 | Retrieval-layer RBAC, DuckDB role-scoped views, semantic glossary, contextual embeddings | 0% |
| Phase 2 | SQL+RAG fusion, cross-modal reconciliation, evidence sufficiency gate, 3-way router | 0% |
| Phase 3 | Red-team suite, content sanitization, SQL validation + repair, audit logging | 0% |
| Phase 4 | Answer citations, extended eval matrix, role-scoped caching | 0% |
| Phase 5 | Admin dashboard, standing per-role reports, trace view | 0% |

**Critical unverified item:** the research doc flags it and I agree — nobody has yet confirmed *where* role filtering happens in the current code. If it is post-hoc discard (fetch top-k, then drop unauthorized results) rather than a metadata filter inside the Chroma query, then FinSight 1.0's core claim is architecturally weaker than the README implies. And there is **no evidence of any role scoping on the SQL side at all** — a Marketing-role NL question could plausibly generate SQL against an HR table. **Verifying this is task #1 on Friday night**, because the entire hero capability is built on the answer.

---

## 3. Strategy — what we build and why

### 3.1 The decision

Build **Scope 2** from our discussion, framed for the four judging criteria:

> **Hero capability: Adversarially-Verified, Authorization-Native Retrieval**
> Supported by: **Verified Fusion Reasoning (SQL + RAG)**, **answer-level citations**, a **business semantic glossary**, and a **new Next.js frontend**.

### 3.2 Why this, honestly

Reasoning, laid out so you can challenge it:

1. **It is the research doc's own #1** (scored 8.4/10, highest of 16 evaluated ideas). I independently agree with that ranking, and the reasoning holds: it is simultaneously the most differentiated, most evaluable, and most feasible of the top candidates.
2. **It makes the project's existing claim provable rather than asserted.** The project is literally named a "Role-Based Access Control System". Its signature capability should be the thing that proves the boundary holds. That is a coherent, memorable story — judges remember stories, not feature lists.
3. **It is uniquely demoable.** Security is normally invisible; a *failed live attack* is not. Watching a Marketing user try three escalating attacks and fail all three, followed by a dashboard showing 0% attack success across 40+ variants, is the kind of 60 seconds that decides a hackathon.
4. **It produces numbers.** The "quantified impact assessment" deliverable needs metrics. Attack-success-rate, cross-role-leakage-rate, SQL accuracy before/after the semantic glossary, retrieval precision — all measurable, all before/after comparable. Most teams will hand in a vague impact paragraph; we hand in a table.
5. **Fusion is the "wow", security is the "moat".** Fusion alone reads as "a smarter chatbot" — impressive but not differentiated. Security alone can read as invisible to a non-security judge. Together they cover both "Generative AI Innovation" and "Technical Implementation".
6. **It is finishable in 48 hours.** No new infrastructure: Chroma already supports metadata filters, DuckDB already supports views, Pytest already exists as a home for the red-team suite, `rag_evaluator/` already exists as a home for the new metrics.

### 3.3 What we deliberately do NOT build

Cutting is a decision, not an omission — and we will **document these as a researched, deliberately-deferred roadmap in the README**, which itself scores under the Documentation criterion and signals engineering judgement.

| Cut | Reason |
|---|---|
| GraphRAG / knowledge graph | Data has no relationship depth to justify it; research is clear graphs pay off only for multi-hop traversal questions |
| Conversational memory | Would sit on top of an unverified security boundary; sequencing risk |
| Temporal / "as of" retrieval | No versioned documents exist in the sample data yet |
| Semantic caching | Leakage risk unless role-scoped; no measured performance problem to solve |
| Evidence sufficiency gate + 3-way adaptive router | Genuinely valuable (Tier A/B) but each is a half-day of careful work; half-finished = demo risk |
| Admin analytics dashboard | Pure UI work with low differentiation; the security dashboard already covers the "dashboard" impression |
| Multi-modal ingestion (PDF/scans) | Out of scope; current file types don't demand it |
| Open-ended autonomous agent loops | Adds cost, latency, and attack surface without a query pattern that needs it |

**Stretch list** (only if we are genuinely ahead at Sunday noon, in priority order): SQL query-repair loop → per-query trace view → evidence sufficiency gate.

### 3.4 Frontend decision

You want Next.js + React and want Streamlit deleted. Agreed on the frontend; **disagreed on the deletion timing**, and this is the one place I will push back:

- **Build the Next.js frontend.** It is the right call — attractive UI directly supports the presentation/demo, and it gives us a proper security dashboard which Streamlit would render poorly.
- **Do not delete `app/ui.py` until the Next.js frontend demonstrably works end-to-end.** Until then it is our zero-cost insurance policy. If the new frontend is broken at Sunday 6 PM, a working Streamlit demo still gets us a submission; a broken React app gets us nothing.
- **Delete it in the final cleanup commit on Sunday**, once the React app is deployed and recorded. At that point removing it is correct — a single frontend is cleaner and the README shouldn't document two.

---

## 4. Target architecture (FinSight 2.0)

```
Next.js / React frontend  (Vercel)
   │  chat · role-aware views · citations panel · security dashboard · trace view
   ▼
FastAPI backend  (Render / Railway, persistent disk)
   │
   ├── Identity + Role Context  ──►  Authorization Audit Log (every allow/deny + reason)
   │
   ├── Query Router  (SQL │ RAG │ HYBRID)
   │
   ├── SQL path
   │     Business Semantic Glossary (business term → table/column definition)
   │       └─► NL→SQL → **role-scoped DuckDB view** (never the raw table)
   │
   ├── RAG path
   │     **Chroma query with hard role metadata filter** (never fetch what the role can't see)
   │       └─► Cohere rerank
   │       └─► Retrieved-content sanitization (screen chunks for embedded instructions)
   │
   ├── HYBRID path → Cross-Modal Reconciliation
   │     SQL number + document explanation, agreement/disagreement made explicit
   │
   └── Answer + Citations  (which CSV row · which document · which passage)

Red-Team Suite (off the user path, runs in CI/pytest)
   → attack-success-rate, cross-role-leakage-rate, per role, per attack class
   → feeds the security dashboard and the impact assessment
```

**The three structural changes vs FinSight 1.0:**
1. Authorization gates retrieval itself, instead of filtering results afterwards.
2. The SQL/RAG fork is no longer strictly binary — a HYBRID path exists and feeds a reconciliation step.
3. Security is a continuously measured, displayed metric rather than a design assumption.

---

## 5. Work breakdown

Every task lists: what, where, why it scores, and rough agent-time. "Agent-time" = wall-clock with you reviewing promptly.

### Block A — Verification & foundation (2.5h)

| # | Task | Files | Why |
|---|---|---|---|
| A1 | **Audit where role filtering actually happens today.** Read `rag_module.py`, `csv_query.py`, `main.py`. Write findings into `docs/security-audit-before.md` | read-only + new doc | This "before" snapshot is the baseline for every impact number we later claim. Do not skip it — the before/after contrast IS the impact assessment |
| A2 | Get the app running locally: install deps, configure keys, first-run DB + Chroma build, confirm both a RAG and a SQL query answer correctly | `secret_key.py` → env vars | Nothing can be tested until this works |
| A3 | Move API keys from `secret_key.py` to `.env` + `python-dotenv`; add `.env.example`; ensure `.env` is gitignored | `app/rag_utils/`, `.gitignore` | Plain-text keys in a public GitHub repo would be a live security incident, and it contradicts a project whose theme is security |
| A4 | Freeze the API contract (OpenAPI): `/auth/login`, `/chat` (returns answer + citations + route taken + trace), `/upload`, `/security/metrics`, `/audit/log` | `app/main.py` | Lets frontend and backend proceed without churn |

### Block B — Hero part 1: Authorization-native retrieval (5h)

| # | Task | Why it scores |
|---|---|---|
| B1 | Tag every chunk with `role` / `department` metadata at ingestion time; re-index existing documents | Prerequisite for B2 |
| B2 | Pass role as a **hard metadata filter inside the Chroma query** — never fetch-then-discard | Technical Implementation; the core architectural claim |
| B3 | Create **role-scoped DuckDB views** per role; the SQL agent may only reference views its role owns; validate generated SQL against an allowlist of permitted view names before execution | Closes the SQL-side hole entirely absent today |
| B4 | **Authorization audit log** — every request: who, role, what was requested, allowed/denied, reason, timestamp. Exposed at `/audit/log` | Compliance story = Real-World Impact; also makes the demo legible |
| B5 | **Retrieved-content sanitization** — screen retrieved chunks (especially uploaded files) for instruction-like text; flag and log, do not silently mutate | Directly addresses prompt-injection, the #1 OWASP GenAI risk |

### Block C — Hero part 2: Red-team suite + security metrics (4h)

| # | Task | Why it scores |
|---|---|---|
| C1 | Red-team corpus: **40+ attack cases across 4 classes** — (a) direct role escalation, (b) cross-department SQL phrasing, (c) indirect prompt injection via uploaded document, (d) multi-step inference chaining permitted facts into an impermissible conclusion. YAML/JSON, versioned | This is the differentiator; very few projects measure their own security |
| C2 | Pytest runner that executes the corpus per role and scores **attack-success-rate** and **cross-role-leakage-rate**, writing `security_results.json` | Makes the claim reproducible — Documentation criterion |
| C3 | Wire results into `app/rag_evaluator/` alongside existing metrics; expose via `/security/metrics` | Unifies quality + security reporting |
| C4 | Run against the **pre-change** code path to produce the "before" numbers | Without a before number, "0% attack success" means nothing |

### Block D — Verified Fusion Reasoning + citations (5h)

| # | Task | Why it scores |
|---|---|---|
| D1 | Extend the classifier with a third route: `HYBRID`, for questions needing a number *and* an explanation | Generative AI Innovation |
| D2 | Hybrid executor: run SQL and RAG in parallel, pass both to a reconciliation step | The "wow" |
| D3 | **Cross-modal reconciliation** — when a SQL result and a document claim address the same fact, state agreement explicitly, and flag disagreement rather than silently picking one | This is what makes fusion *trustworthy* rather than just *more* |
| D4 | **Answer-level citations** — every answer carries provenance: source document + passage, and/or table + row/query | Trust must be visible; also strong on camera |
| D5 | **Business semantic glossary** (`app/rag_utils/semantic_layer.yaml`): net income, ROI, marketing expense, headcount, attrition, etc. → exact table/column definitions, injected into the NL→SQL prompt | Cheapest, most benchmark-proven SQL reliability fix; also gives fusion a shared vocabulary |
| D6 | SQL result-shape validation (row count / type sanity, "did this answer the question asked") | Prevents confident-wrong numbers |

### Block E — Next.js frontend (7h)

| # | Task |
|---|---|
| E1 | Scaffold Next.js (App Router) + TypeScript + Tailwind + shadcn/ui; auth against FastAPI; role-aware shell |
| E2 | Chat interface: streaming answer, route badge (SQL / RAG / HYBRID), clean typography |
| E3 | **Citations panel** — expandable source cards; for SQL, the actual rows; for RAG, the document + highlighted passage |
| E4 | **Security dashboard** — attack-success-rate, cross-role-leakage-rate, per-role and per-attack-class breakdown, before/after comparison |
| E5 | Audit log view — live stream of allow/deny decisions with reasons |
| E6 | Upload flow with sanitization feedback ("this file contained suspicious instruction-like content — flagged") |
| E7 | Polish: dark theme, loading states, empty states, mobile-reasonable, a decent landing/hero section |

### Block F — Documentation, deployment, deliverables (6h)

| # | Task | Why it scores |
|---|---|---|
| F1 | **README rewrite** — problem, architecture (Mermaid), before/after, quick start, one-command setup, testing instructions, roles matrix, sample queries, sample attacks, deliberately-deferred roadmap with reasoning | Documentation is a full judging criterion |
| F2 | **`docs/IMPACT.md` — quantified impact assessment** (see §7) | Explicit portal deliverable |
| F3 | **`docs/ARCHITECTURE.md`** — the diagram plus the three structural changes and why | Documentation |
| F4 | **Reproducibility**: `docker-compose.yml` or a `make dev` that brings up backend + frontend + seeds data in one command; `.env.example` | "Easy to reproduce" is stated verbatim in the criteria |
| F5 | Deploy: frontend → **Vercel**; backend → **Render or Railway** with a persistent disk for Chroma + DuckDB. CORS, env vars, seed-on-boot | "Working deployed solution" is an explicit deliverable |
| F6 | GitHub push, clean commit history, LICENSE, repo description, topics |
| F7 | **5-minute demo video** (script in §8) + presentation deck |
| F8 | **≤1000-word project description** for the submission form |
| F9 | Google Drive folder with open access: video, deck, description, README PDF, repo link, live URL |

**Total agent-time: ~29.5h of a 48h window** — the remaining ~18h is your review time, sleep, integration friction, and buffer. This is deliberately not packed to 48h; a plan with no slack fails on contact with the first bug.

---

## 6. Hour-by-hour schedule

Assuming a **Friday 9:00 PM PKT** start. If it really starts Saturday midnight, everything shifts and the buffer shrinks — in that case cut Block D3 and E5 first.

### Friday 9:00 PM → 2:00 AM (5h) — Foundation

| Time | Work |
|---|---|
| 21:00–21:30 | Kickoff: agent reads the whole codebase, reports actual structure vs the status report |
| 21:30–22:30 | **A1 security audit** — find out exactly where filtering happens. Snapshot "before" behaviour |
| 22:30–23:30 | A2 app running locally with real keys; A3 keys → `.env` |
| 23:30–00:30 | A4 API contract frozen; **C4 "before" red-team baseline run** (even a rough 10-case version) |
| 00:30–02:00 | B1 + B2: chunk role metadata + hard Chroma metadata filter |

**Friday night gate:** RAG retrieval is authorization-native and the "before" numbers exist. If this isn't done, drop Block D (fusion) from the plan on Saturday morning.

### Saturday 9:00 AM → 2:00 PM (5h) — Hero completion

| Time | Work |
|---|---|
| 09:00–10:30 | B3 role-scoped DuckDB views + generated-SQL allowlist validation |
| 10:30–11:15 | B4 authorization audit log |
| 11:15–12:00 | **Register the team before the 12:00 noon deadline** (hard external constraint — set an alarm) + B5 content sanitization |
| 12:00–14:00 | C1 + C2: 40+ attack corpus and the pytest scorer; produce "after" numbers |

**Saturday-noon gate:** hero capability complete and measured. Attack-success-rate should be 0% or near it; anything that still succeeds is a bug to fix, not a number to hide.

### Saturday 2:00 PM → 8:00 PM (6h) — Fusion + glossary

| Time | Work |
|---|---|
| 14:00–15:00 | D5 semantic glossary + D6 SQL result validation (measure SQL accuracy before/after on a fixed question set) |
| 15:00–17:00 | D1 + D2 HYBRID route and parallel executor |
| 17:00–18:30 | D3 cross-modal reconciliation |
| 18:30–20:00 | D4 answer-level citations end-to-end through the API |

**Saturday-evening gate:** backend feature-complete. From here on, only frontend, docs, and polish.

### Saturday 8:00 PM → Sunday 2:00 AM (6h) — Frontend core

E1 → E4: scaffold, auth, chat with route badge, citations panel, security dashboard.

**Sunday-2AM gate:** the frontend can log in, ask a question, and show citations. If not, this is the moment to abandon Next.js and keep Streamlit — deciding this at 2 AM Sunday is survivable; deciding it at 8 PM Sunday is not.

### Sunday 9:00 AM → 2:00 PM (5h) — Frontend finish + deploy

| Time | Work |
|---|---|
| 09:00–11:00 | E5 audit view, E6 upload+sanitization feedback, E7 polish |
| 11:00–13:00 | F5 deploy backend (Render/Railway) + frontend (Vercel); fix CORS/env/seeding |
| 13:00–14:00 | F4 one-command local setup; F6 GitHub push |

**Sunday-2PM gate:** live public URL that works from a phone. If deployment fights back, timebox it to 2h and fall back to a local demo + recorded video — a great video with a "deployment in progress" note beats a broken live link.

### Sunday 2:00 PM → 8:00 PM (6h) — Deliverables

| Time | Work |
|---|---|
| 14:00–15:30 | F1 README + F3 architecture doc |
| 15:30–16:30 | F2 quantified impact assessment |
| 16:30–18:00 | F7 record the 5-minute demo video (rehearse twice, record third) |
| 18:00–19:00 | Presentation deck |
| 19:00–20:00 | F8 1000-word description + F9 Google Drive folder with open access |

### Sunday 8:00 PM → 11:00 PM (3h) — Buffer & submit

Delete Streamlit (`app/ui.py` + its Playwright tests) now that React is proven; final test run; final push; **submit by 22:00, not 23:59.** Portals get slow and crash in the last hour. Treat 22:00 as the deadline.

---

## 7. Quantified impact assessment (explicit deliverable)

`docs/IMPACT.md` will contain a before/after table. The numbers get filled in from real runs — never invented. This is why the Friday-night "before" baseline is non-negotiable.

| Metric | FinSight 1.0 (before) | FinSight 2.0 (after) | How measured |
|---|---|---|---|
| Attack success rate (40+ cases, 4 classes) | measured Friday | target 0% | Red-team pytest suite |
| Cross-role leakage rate | measured Friday | target 0% | Red-team suite, per-role |
| Unauthorized chunks fetched into the LLM prompt | measured | 0 (never retrieved) | Instrumented retrieval layer |
| SQL accuracy on business-term questions | measured on fixed 20-question set | after glossary | Execution + semantic correctness |
| Compound "why did X change" questions answerable | 0 (architecturally impossible) | measured | Fixed question set |
| Answers carrying verifiable provenance | 0% | 100% | Citation coverage check |
| Authorization decisions auditable | 0% | 100% | Audit log |

Plus the **productivity framing** the hackathon title asks for: estimated analyst time saved per query versus manually requesting data from another department (state the assumption explicitly rather than dressing a guess as data — judges notice, and an honest assumption reads better than a fake statistic).

---

## 8. 5-minute demo video script

Screen recording of the real app — **not** an AI-generated video. Rehearse twice, record the third take. Voiceover by Ammar.

| Time | Content |
|---|---|
| 0:00–0:30 | **Problem.** Enterprise departments need each other's insights but can't be trusted with each other's data. Today: email threads and days of delay. AI assistants solve the speed problem and *create* a confidentiality problem |
| 0:30–1:00 | **Normal use.** Bruce (Marketing) logs in, asks a Q3 campaign question, gets an answer **with citations** — source document and passage shown |
| 1:00–1:45 | **The wow: fusion.** "Why did marketing expenses increase in Q3?" → one answer combining a DuckDB number and the document that explains it, reconciled, both cited. Point out the HYBRID route badge |
| 1:45–3:15 | **The moat: live attack.** Same Marketing user attempts HR salary data three ways — (1) direct ask → denied with reason; (2) SQL-flavoured "average compensation by department" → the role-scoped view means the HR table is not even reachable; (3) upload a .md file containing a hidden injected instruction → sanitization flags it, answer stays safe. Show the audit log recording all three denials |
| 3:15–4:15 | **The proof it wasn't luck.** Security dashboard: 40+ attack variants across 4 classes, attack-success-rate 0%, cross-role leakage 0%, per-role breakdown, before/after comparison |
| 4:15–4:45 | **Architecture in 30 seconds.** The three structural changes: authorization gates retrieval; the fork is no longer binary; security is a measured metric |
| 4:45–5:00 | **Impact + close.** The two headline numbers, the live URL, the repo |

Narrative spine: *"Most RAG assistants tell you they're secure. FinSight proves it — on every build."*

---

## 9. Who does what

You said you want to do everything yourself with the agent. That works. But the hackathon **requires 4–6 registered members**, so the team must exist and should visibly contribute. Give them work that cannot conflict with the codebase:

| Person | Work |
|---|---|
| **Ammar + agent** | All code: backend, security layer, fusion, frontend, tests, docs, deployment |
| Member 2 | **Red-team attack corpus** — write 40+ attack prompts per the 4 classes as plain text. Genuinely high value, zero merge conflicts, and it directly produces our headline metric |
| Member 3 | Presentation deck + the ≤1000-word project description draft |
| Member 4 | Manual QA — log in as each role, hunt edge cases, file a bug list |
| Member 5 | Sample data enrichment — richer department CSV/MD files so demo answers look substantial |
| Member 6 | Video editing, Google Drive packaging, submission logistics, deadline watching |

Contribution is real, parallel, and never blocks the build.

---

## 10. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Next.js frontend unfinished | Medium | High | Keep Streamlit until React is proven; hard go/no-go gate at Sunday 2 AM |
| Deployment fights back (Chroma persistence, CORS, cold starts) | Medium | High | Timebox to 2h; Render/Railway with persistent disk (**not** Vercel for the backend — serverless cannot host a long-running FastAPI + Chroma stack); fall back to recorded demo |
| API rate limits / cost during red-team runs (40+ LLM calls per run) | Medium | Medium | Cache results; run the full suite only twice (before/after); use a cheaper model for attack execution |
| An attack actually succeeds | Medium | Medium — **this is good news on Friday, bad news on Sunday** | Run the suite Friday, so failures surface while there's time to fix them |
| Scope creep into the deferred list | High | High | The cut list in §3.3 is binding; stretch items only after Sunday noon |
| Fusion reconciliation proves harder than expected | Medium | Medium | Ship a simpler version: present both sources side by side with an explicit agreement/disagreement flag, without deep reasoning |
| Timeline confusion (Friday vs Saturday start) | Confirmed ambiguity | Medium | Clarify at the Wednesday guidance session; plan assumes Friday |
| Submitting at 23:50 | Medium | Fatal | Internal deadline 22:00 Sunday |

---

## 11. Pre-hackathon prep (do before Friday 9 PM — this is free time, use it)

- [ ] Attend the Wednesday 8 PM guidance session; confirm the start time and any extra rules
- [ ] **Register the team** as Team Lead — project name **FinSight**, category **Finance & AI Solutions**; description can be refined later
- [ ] Recruit to 4–6 members and add them via the edit link
- [ ] Obtain **OpenAI** and **Cohere** API keys with sufficient credit (red-team runs consume tokens)
- [ ] Push the current FinSight 1.0 to a private GitHub repo — a clean starting commit makes the before/after diff legible
- [ ] Create the Google Drive submission folder now, with open access already set
- [ ] Have Member 2 start the attack corpus early — it needs no code
- [ ] Decide the deployment host (Render vs Railway) and create the account in advance

---

## 12. Definition of done

Submission is complete when all of these are true:

- [ ] Live deployed URL works from a phone, logged in as at least two different roles
- [ ] Public GitHub repo with README, architecture doc, impact doc, one-command setup, no secrets committed
- [ ] Red-team suite runs with `pytest` and prints attack-success-rate and cross-role-leakage-rate
- [ ] `docs/IMPACT.md` has real measured before/after numbers, no invented figures
- [ ] 5-minute demo video recorded from the real app
- [ ] Presentation deck complete
- [ ] ≤1000-word description written
- [ ] Google Drive folder with open access contains everything above
- [ ] Submitted by **22:00 PKT Sunday 13 Sep**

---

## 13. Open questions for Ammar

1. **Start time** — Friday 9 PM or Saturday 00:00? (Resolve at the Wednesday session.)
2. **Repo** — I need the folder or GitHub URL. Until I read the actual code, §2.2's security audit is a prediction, not a finding. This is the single biggest source of uncertainty in this plan.
3. **API keys** — do you have OpenAI + Cohere keys with credit? Which model tier? (Model choice affects both cost and SQL accuracy.)
4. **Deployment host** — Render or Railway for the backend? Do you already have an account?
5. **Team** — are all 4–6 members confirmed, and will they do the non-code tasks in §9?
6. **Category** — Finance & AI Solutions (my recommendation) or Automation?

---

*Prepared by Devin for Ammar Khan, 9 Sep 2026. Judging criteria and rules in §1 were fetched from the official hackathon site and the course portal screenshot; everything about the current codebase in §2.1 comes from Ammar's own completion report and has not yet been verified against the source.*
