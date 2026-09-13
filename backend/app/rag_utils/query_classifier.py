"""3-Way Intelligent Query Classifier for FinSight 2.0.

Routes user queries into:
- 'SQL': Quantitative, statistical, aggregation, tabular filtering, or arithmetic queries.
- 'RAG': Qualitative, policy, architectural, procedural, or informational document queries.
- 'HYBRID': Compound questions requiring both numerical data from tables and conceptual reasons/context from documents.
"""

import os
import re
import logging
from typing import Optional

from app.rag_utils.llm_client import get_llm

logger = logging.getLogger("finsight.query_classifier")

SYSTEM_PROMPT = """You are an expert enterprise query router for FinSight 2.0.
Your task is to classify an incoming user query into exactly ONE of three routing categories:
1. SQL
2. RAG
3. HYBRID

### Classification Rules:
- **SQL**: Pure analytical, statistical, aggregation, calculation, or tabular filtering queries.
  These queries ask for exact numbers, lists of records, metrics, counts, sums, averages, or min/max values from relational tables.
  Examples:
  - "List all employees in Finance with rating 5" -> SQL
  - "Average salary by department" -> SQL
  - "Total marketing expenditure in 2024" -> SQL
  - "Show top 5 highest paid engineers" -> SQL
  - "What was total revenue in Q3?" -> SQL

- **RAG**: Qualitative, procedural, policy, architectural, or informational document queries.
  These queries ask about rules, company policies, guidelines, definitions, architectures, or textual knowledge.
  Examples:
  - "What is the policy for paternity leave?" -> RAG
  - "Summarize system architecture guidelines" -> RAG
  - "What are the core values of FinSolve?" -> RAG
  - "How do I submit an expense report?" -> RAG
  - "Explain remote work protocol" -> RAG

- **HYBRID**: Compound questions requiring a numerical fact/variance from a table AND a conceptual reason, justification, or explanation from a document.
  These queries ask "Why did [metric] change?", "Explain the variance in [financial/HR number]", or combine numerical figures with explanatory "why/how/cause/reason" context.
  Examples:
  - "Why did marketing expenses increase in Q3?" -> HYBRID
  - "How much did travel expenses increase in 2024 and what caused it?" -> HYBRID
  - "Explain the relationship between headcount growth and office supply expenditure" -> HYBRID
  - "Why did Q3 marketing expense exceed budget, and by how much?" -> HYBRID
  - "Analyze employee turnover rate this year and summarize exit interview feedback" -> HYBRID

Output ONLY the category name: 'SQL', 'RAG', or 'HYBRID' with no extra punctuation or commentary."""

FEW_SHOT_PROMPT = """Classify the following user question into SQL, RAG, or HYBRID:
Question: {question}
Classification:"""


def _classify_heuristic(question: str) -> str:
    """Intelligent fallback rule-based classifier if LLM is unavailable or offline.
    
    Accurately identifies SQL, RAG, and HYBRID patterns.
    """
    q = question.strip().lower()

    # Hybrid cues: Compound queries asking for both quantitative variance/metrics and explanatory reasoning
    has_why_or_cause = bool(re.search(r"\b(why|what caused|reason for|reasons for|explain why|explain the relationship|justify|justification|feedback|narrative|context behind)\b", q))
    has_numerical_or_metric = bool(re.search(
        r"\b(expense|expenses|expenditure|budget|cost|costs|revenue|profit|salary|salaries|headcount|growth|turnover|roi|increase|increased|decrease|decreased|exceed|exceeded|variance|q1|q2|q3|q4|202\d|how much|by how much|rate)\b",
        q
    ))

    if has_why_or_cause and has_numerical_or_metric:
        return "HYBRID"

    # Pure SQL cues: Aggregations, math, tabular queries, lists of records
    sql_patterns = [
        r"\b(average|avg|sum|count|total|highest|lowest|minimum|min|maximum|max|median)\b",
        r"\b(salary|salaries|compensation|pay|expenditure|expenditures|revenue|rating|ratings|headcount|performers|appraisal)\b",
        r"\b(list all|show all|filter|group by|order by|top \d+|bottom \d+)\b",
        r"\b(how many|what is the total|what are the total|net income|roi|attrition rate)\b",
    ]
    is_sql = any(re.search(pat, q) for pat in sql_patterns)

    # Pure RAG cues: Policies, guidelines, protocols, procedures, qualitative text
    rag_patterns = [
        r"\b(policy|policies|handbook|guideline|guidelines|procedure|procedures|protocol|protocols)\b",
        r"\b(core values|mission|vision|leave|paternity|maternity|vacation|sick leave|benefits|code of conduct)\b",
        r"\b(architecture|architecture guidelines|system architecture|onboarding|how to submit|how do i)\b",
        r"\b(summarize|what is the definition|explain the concept)\b",
    ]
    is_rag = any(re.search(pat, q) for pat in rag_patterns)

    if has_why_or_cause and ("exceed" in q or "increase" in q or "decrease" in q or "budget" in q or "expense" in q):
        return "HYBRID"

    if is_sql and not is_rag:
        return "SQL"
    if is_rag and not is_sql:
        return "RAG"
    if is_sql and is_rag:
        return "HYBRID"
    if is_sql:
        return "SQL"

    return "RAG"


def detect_query_type_llm(question: str) -> str:
    """Classifies an incoming query into 'SQL', 'RAG', or 'HYBRID'.
    
    Uses Groq (llama-3.3-70b-versatile) with zero-temperature few-shot prompting,
    with an intelligent fallback heuristic if Groq key is unavailable or offline.
    """
    if not question or not question.strip():
        return "RAG"

    try:
        llm = get_llm(temperature=0.0)
        # Check if API key is valid / not dummy placeholder
        if not llm.api_key or "placeholder" in llm.api_key.lower():
            logger.info("Groq API key is a placeholder or not provided; using intelligent fallback router.")
            return _classify_heuristic(question)

        prompt = FEW_SHOT_PROMPT.format(question=question)
        response = llm.generate(prompt=prompt, system_prompt=SYSTEM_PROMPT).strip().upper()

        if "HYBRID" in response:
            return "HYBRID"
        elif "SQL" in response:
            return "SQL"
        elif "RAG" in response:
            return "RAG"
        else:
            return _classify_heuristic(question)
    except Exception as e:
        logger.warning("LLM query classification failed (%s); defaulting to heuristic classifier.", e)
        return _classify_heuristic(question)
