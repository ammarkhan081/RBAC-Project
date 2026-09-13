"""Refactored Text-to-SQL Agent for FinSight 2.0.

Features:
- Groq llama-3.3-70b-versatile SQL generation.
- Dynamic integration with Business Semantic Layer (metric formulas & synonyms).
- Strict role isolation via role-scoped DuckDB views (v_<table_name>_<role>).
- AST SQL validation and base table bypass prevention.
- Result-shape validation (handling 0 records, schema mismatch, and fallback execution).
- Standardized citation and provenance return structure.
"""

import re
import logging
import asyncio
from typing import Any, Dict, List, Optional, Tuple

from app.rag_utils.llm_client import get_llm
from app.rag_utils.duckdb_views import (
    get_duckdb_connection,
    get_allowed_views_for_role,
    build_isolated_schema_prompt,
    get_role_slug,
)
from app.rag_utils.semantic_engine import get_semantic_context_for_query
from app.rag_utils.sql_validator import validate_sql_for_role

logger = logging.getLogger("finsight.csv_query")


def _clean_sql(raw_sql: str) -> str:
    """Strips markdown fences, explanations, and trailing semicolons."""
    sql = raw_sql.strip()
    # Remove code fences
    sql = re.sub(r"^```(?:sql)?", "", sql, flags=re.IGNORECASE)
    sql = re.sub(r"```$", "", sql)
    sql = sql.strip()

    # Extract first SELECT statement if commentary surrounds it
    select_match = re.search(r"(SELECT\s+.+?)(?:;|$)", sql, flags=re.IGNORECASE | re.DOTALL)
    if select_match:
        sql = select_match.group(1).strip()

    # Normalize quarter expressions (e.g. 'Q3 2024' -> '2024-Q3', '2024 Q3' -> '2024-Q3')
    sql = re.sub(r"quarter\s*=\s*['\"]Q(\d)\s*(\d{4})['\"]", r"quarter = '\2-Q\1'", sql, flags=re.IGNORECASE)
    sql = re.sub(r"quarter\s*=\s*['\"](\d{4})\s*Q(\d)['\"]", r"quarter = '\1-Q\2'", sql, flags=re.IGNORECASE)

    return sql


def _generate_fallback_sql(question: str, role: str, allowed_views: List[str]) -> str:
    """Generates a safe, intelligent DuckDB SQL query targeting authorized views if LLM is unavailable."""
    q = question.lower()
    role_slug = get_role_slug(role)

    # 1. HR Domain queries
    hr_view = f"v_hr_data_{role_slug}"
    if hr_view in allowed_views:
        if "rating 5" in q or "performance rating 5" in q or "top performer" in q:
            return f"SELECT employee_id, employee_name, department, salary, performance_rating, status FROM {hr_view} WHERE performance_rating = 5"
        
        gt_match = re.search(r"(?:greater than|>|more than|exceeds?)\s*(\d+)", q)
        lt_match = re.search(r"(?:less than|<|under)\s*(\d+)", q)
        
        if "salary" in q or "compensation" in q or "pay" in q:
            if gt_match:
                return f"SELECT employee_id, employee_name, department, salary FROM {hr_view} WHERE salary > {gt_match.group(1)}"
            if lt_match:
                return f"SELECT employee_id, employee_name, department, salary FROM {hr_view} WHERE salary < {lt_match.group(1)}"
            if "average" in q or "avg" in q:
                return f"SELECT department, ROUND(AVG(salary), 2) AS avg_salary FROM {hr_view} GROUP BY department"
            return f"SELECT employee_id, employee_name, department, salary FROM {hr_view} ORDER BY salary DESC"
        if "employee" in q or "headcount" in q:
            if gt_match:
                return f"SELECT * FROM {hr_view} WHERE salary > {gt_match.group(1)}"
            return f"SELECT * FROM {hr_view}"

    # 2. Finance Domain queries
    fin_view = f"v_financial_summary_{role_slug}"
    if fin_view in allowed_views:
        if "revenue" in q:
            return f"SELECT quarter, revenue, net_income FROM {fin_view} ORDER BY quarter"
        if "expense" in q or "operating" in q:
            return f"SELECT quarter, operating_expenses FROM {fin_view} ORDER BY quarter"
        if "net income" in q:
            return f"SELECT quarter, net_income FROM {fin_view} ORDER BY quarter"

    # 3. Marketing Domain queries
    mkt_view = f"v_marketing_report_2024_{role_slug}"
    if mkt_view in allowed_views:
        if "spend" in q or "cost" in q or "expense" in q or "marketing" in q:
            return f"SELECT campaign_id, spend, impressions, roi FROM {mkt_view} ORDER BY spend DESC"
        if "roi" in q:
            return f"SELECT campaign_id, spend, roi FROM {mkt_view} ORDER BY roi DESC"

    # Default to first allowed view
    if allowed_views:
        return f"SELECT * FROM {allowed_views[0]} LIMIT 10"

    return "SELECT 1 AS access_denied"


def _format_markdown_table(columns: List[str], rows: List[Tuple[Any, ...]]) -> str:
    """Formats SQL rows into a clean GitHub-flavored markdown table."""
    if not columns or not rows:
        return "Query executed successfully on view, but returned 0 records matching criteria."

    try:
        from tabulate import tabulate
        return tabulate(rows, headers=columns, tablefmt="github")
    except ImportError:
        # Fallback manual markdown table generator
        header_line = "| " + " | ".join(str(c) for c in columns) + " |"
        separator_line = "| " + " | ".join(["---"] * len(columns)) + " |"
        data_lines = ["| " + " | ".join(str(val) for val in row) + " |" for row in rows]
        return "\n".join([header_line, separator_line] + data_lines)


def _format_natural_sql_summary(
    question: str,
    columns: List[str],
    rows: List[Tuple[Any, ...]],
    view_used: str,
) -> str:
    """Generates an executive natural language conversational summary from SQL results."""
    if not columns or not rows:
        return "Query executed successfully on view, but returned 0 records matching criteria."

    md_table = _format_markdown_table(columns, rows)

    if len(rows) == 1:
        row_dict = dict(zip(columns, rows[0]))
        bullet_points = []
        for col, val in row_dict.items():
            clean_name = col.replace("_", " ").title()
            if isinstance(val, (int, float)):
                if "ratio" in col or "rate" in col or "score" in col or "roi" in col:
                    formatted_val = f"{val:.2f}%" if "roi" in col or "rate" in col else f"{val:.2f}"
                elif "count" in col or "impression" in col or "conversion" in col or "id" in col:
                    formatted_val = f"{val:,}" if isinstance(val, int) else str(val)
                else:
                    formatted_val = f"${val:,.2f}"
            else:
                formatted_val = str(val) if val is not None else "N/A"
            bullet_points.append(f"- **{clean_name}:** {formatted_val}")

        points_str = "\n".join(bullet_points)
        return (
            f"Based on our authorized financial records from **`{view_used}`**:\n\n"
            f"{points_str}\n\n"
            f"{md_table}"
        )

    return (
        f"Retrieved **{len(rows)} record(s)** from authorized view **`{view_used}`**:\n\n"
        f"{md_table}"
    )


def _extract_view_used(sql: str, allowed_views: List[str]) -> str:
    """Identifies the view queried from the SQL statement."""
    for view in allowed_views:
        if re.search(r"\b" + re.escape(view) + r"\b", sql, flags=re.IGNORECASE):
            return view

    # Fallback search for any v_ view
    match = re.search(r"\b(v_\w+)\b", sql, flags=re.IGNORECASE)
    if match:
        return match.group(1)

    return allowed_views[0] if allowed_views else "v_unknown"


async def ask_csv(
    question: str,
    role: str = "general",
    username: str = "anonymous",
    return_sql: bool = True,
) -> Dict[str, Any]:
    """Generates, validates, and executes a role-scoped DuckDB SQL query.
    
    Args:
        question: Natural language user question.
        role: User role for role-scoped view isolation.
        username: User identifier for audit logging.
        return_sql: Whether to include SQL string in result dictionary.
        
    Returns:
        Standardized dict with answer, sql, view_used, row_count, raw_rows.
    """
    allowed_views = get_allowed_views_for_role(role)
    schema_block = build_isolated_schema_prompt(role)
    semantic_context = get_semantic_context_for_query(question)

    # 1. Construct prompt
    prompt = (
        f"You are an expert SQL generator for DuckDB.\n"
        f"Available Views for this User's Role:\n"
        f"{schema_block}\n\n"
        f"Semantic Layer Definitions:\n"
        f"{semantic_context if semantic_context else 'None specified.'}\n\n"
        f"Constraints:\n"
        f"- ONLY query the views listed above. Do NOT query base tables.\n"
        f"- Return strictly executable DuckDB SELECT query, no markdown fences, no explanatory text.\n"
        f"Question: \"{question}\"\n"
    )

    sql = ""
    # 2. Call LLM or use fallback
    try:
        llm = get_llm(temperature=0.0)
        if not llm.api_key or "placeholder" in llm.api_key.lower():
            sql = _generate_fallback_sql(question, role, allowed_views)
        else:
            raw_response = llm.generate(prompt=prompt)
            sql = _clean_sql(raw_response)
    except Exception as e:
        logger.warning("LLM SQL generation error (%s); utilizing semantic fallback generator.", e)
        sql = _generate_fallback_sql(question, role, allowed_views)

    if not sql:
        sql = _generate_fallback_sql(question, role, allowed_views)

    # 3. Security AST Validation and View Enforcement
    role_slug = get_role_slug(role)
    # Check if raw table name was used and rewrite to authorized view
    for tbl in ["hr_data", "financial_summary", "marketing_report_2024", "market_report_q4_2024", "quarterly_financial_report", "engineering_master_doc", "general", "employee_handbook"]:
        if re.search(r"\bFROM\s+" + tbl + r"\b", sql, flags=re.IGNORECASE) and f"v_{tbl}_{role_slug}" in allowed_views:
            sql = re.sub(r"\bFROM\s+" + tbl + r"\b", f"FROM v_{tbl}_{role_slug}", sql, flags=re.IGNORECASE)
        if re.search(r"\bJOIN\s+" + tbl + r"\b", sql, flags=re.IGNORECASE) and f"v_{tbl}_{role_slug}" in allowed_views:
            sql = re.sub(r"\bJOIN\s+" + tbl + r"\b", f"JOIN v_{tbl}_{role_slug}", sql, flags=re.IGNORECASE)

    is_valid, validation_msg = validate_sql_for_role(sql, allowed_views)
    if not is_valid:
        logger.warning("SQL failed AST validation: %s. Using safe fallback.", validation_msg)
        sql = _generate_fallback_sql(question, role, allowed_views)

    view_used = _extract_view_used(sql, allowed_views)

    # 4. Result-Shape Execution on DuckDB
    duck_conn = get_duckdb_connection()
    try:
        cursor = duck_conn.cursor()
        cursor.execute(sql)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchall()

        # Check if rows is empty or all values are NULL
        all_null = True
        if rows:
            for r in rows:
                if any(v is not None and str(v).strip() != "" for v in r):
                    all_null = False
                    break
        else:
            all_null = True

        # If all null and a quarter filter was used, retry with broader LIKE '%QX%'
        if all_null and re.search(r"quarter\s*=\s*['\"]([^'\"]+)['\"]", sql, flags=re.IGNORECASE):
            q_match = re.search(r"quarter\s*=\s*['\"]([^'\"]+)['\"]", sql, flags=re.IGNORECASE)
            raw_q = q_match.group(1) if q_match else ""
            quarter_num = re.search(r"Q([1-4])", raw_q, flags=re.IGNORECASE)
            if quarter_num:
                alt_sql = re.sub(r"quarter\s*=\s*['\"][^'\"]+['\"]", f"quarter LIKE '%Q{quarter_num.group(1)}%'", sql, flags=re.IGNORECASE)
                try:
                    cursor.execute(alt_sql)
                    alt_cols = [desc[0] for desc in cursor.description] if cursor.description else []
                    alt_rows = cursor.fetchall()
                    alt_has_data = any(any(v is not None and str(v).strip() != "" for v in r) for r in alt_rows) if alt_rows else False
                    if alt_has_data:
                        sql = alt_sql
                        columns = alt_cols
                        rows = alt_rows
                        all_null = False
                except Exception as retry_err:
                    logger.debug("Quarter retry query failed: %s", retry_err)
    except Exception as exec_err:
        logger.error("DuckDB execution error (%s) on SQL: %s. Triggering safe fallback.", exec_err, sql)
        # Execute fallback query
        fallback_sql = f"SELECT * FROM {view_used} LIMIT 5"
        try:
            cursor = duck_conn.cursor()
            cursor.execute(fallback_sql)
            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            rows = cursor.fetchall()
            sql = fallback_sql
        except Exception as fb_err:
            logger.error("Fallback execution also failed: %s", fb_err)
            columns = []
            rows = []

    # 5. Format Output with Conversational Synthesis
    row_count = len(rows)
    has_data = False
    if row_count > 0:
        for r in rows:
            if any(v is not None and str(v).strip() != "" for v in r):
                has_data = True
                break

    if not has_data or row_count == 0:
        answer = f"According to our authorized records in `{view_used}`, no matching data was found for '{question}'. Please verify the fiscal period or authorized scope."
    else:
        conversational_answer = ""
        try:
            llm = get_llm(temperature=0.0)
            if llm.api_key and "placeholder" not in llm.api_key.lower():
                md_table = _format_markdown_table(columns, rows)
                synth_prompt = (
                    f"User Question: \"{question}\"\n"
                    f"Queried View: {view_used}\n"
                    f"Data Rows:\n{md_table}\n\n"
                    f"You are the executive financial AI co-pilot. Provide a direct, professional, conversational answer answering the user's question with formatted numbers/currency (e.g. $1,290,000).\n"
                    f"Guidelines:\n"
                    f"1. Directly answer with the figures requested in clear conversational English.\n"
                    f"2. Provide bullet points if multiple figures or metrics were computed.\n"
                    f"3. Include the markdown table below your summary.\n"
                    f"4. Do not include internal code explanations."
                )
                llm_response = llm.generate(prompt=synth_prompt).strip()
                if llm_response and len(llm_response) > 15:
                    conversational_answer = llm_response
        except Exception as e:
            logger.warning("LLM SQL conversational synthesis error (%s); falling back to natural summary.", e)

        if not conversational_answer:
            conversational_answer = _format_natural_sql_summary(question, columns, rows, view_used)

        answer = conversational_answer

    # Prepare raw row samples for citations panel
    raw_rows: List[Any] = []
    for r in rows[:10]:
        if columns:
            raw_rows.append(dict(zip(columns, r)))
        else:
            raw_rows.append(r)

    result = {
        "answer": answer,
        "sql": sql if return_sql else None,
        "view_used": view_used,
        "row_count": row_count,
        "raw_rows": raw_rows,
    }
    return result
