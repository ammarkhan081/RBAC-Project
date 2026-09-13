"""SQL AST & Allowlist Security Validator for FinSight 2.0.

Provides strict AST parsing via sqlglot to enforce:
1. Strict SELECT queries only (no DDL/DML: INSERT, UPDATE, DELETE, DROP, ATTACH, ALTER).
2. Elimination of multiple stacked statements (semicolon injection).
3. Whitelisting of referenced tables/views across FROM, JOIN, Subqueries, and CTEs.
4. Prevention of base table reconnaissance and cross-role view access.
5. Blocking of file system and external scan functions (e.g., read_csv, read_parquet, scan_parquet).
"""

import logging
from typing import List, Set, Tuple
import sqlglot
from sqlglot import exp

logger = logging.getLogger("finsight.sql_validator")

# Dangerous engine functions and system tables that can bypass view encapsulation or access files
FORBIDDEN_FUNCTION_NAMES: Set[str] = {
    "read_csv",
    "read_csv_auto",
    "read_parquet",
    "read_json",
    "read_json_auto",
    "scan_csv",
    "scan_parquet",
    "copy",
    "write_csv",
    "pragma",
    "duckdb_tables",
    "duckdb_views",
    "duckdb_columns",
    "sqlite_master",
    "information_schema",
}


def validate_sql_for_role(sql: str, allowed_views: List[str]) -> Tuple[bool, str]:
    """Validates that a SQL query adheres to strict AST safety rules for the given role.
    
    Args:
        sql: The raw SQL string to validate.
        allowed_views: List of authorized view names for the user's role.
        
    Returns:
        (is_valid: bool, message: str)
    """
    if not sql or not sql.strip():
        return False, "Security Violation: Query cannot be empty."

    # 1. Parse into AST (DuckDB dialect)
    try:
        parsed_statements = sqlglot.parse(sql.strip(), read="duckdb")
        if not parsed_statements or parsed_statements[0] is None:
            return False, "Invalid SQL Syntax: No valid statement found."

        if len(parsed_statements) > 1:
            return False, "Security Violation: Multiple stacked SQL statements are prohibited."

        parsed = parsed_statements[0]
    except Exception as e:
        return False, f"Invalid SQL Syntax: {e}"

    # 2. Must be a read-only query (Select or Union of Selects)
    if not isinstance(parsed, (exp.Select, exp.Union)):
        return False, "Security Violation: Only SELECT queries are permitted."

    # 3. Check for forbidden DDL / DML keywords anywhere in AST
    forbidden_types = (
        exp.Insert,
        exp.Update,
        exp.Delete,
        exp.Drop,
        exp.Create,
        exp.Alter,
        exp.Command,
    )
    for node in parsed.walk():
        if isinstance(node, forbidden_types):
            return False, f"Security Violation: Statement type '{type(node).__name__}' is prohibited."

        # Scan for direct ReadCSV / ReadParquet AST nodes
        if isinstance(node, (exp.ReadCSV, exp.Anonymous, exp.Func)):
            func_name = (getattr(node, "name", None) or getattr(node, "key", None) or type(node).__name__).lower()
            if "read_csv" in func_name or "read_parquet" in func_name or func_name in FORBIDDEN_FUNCTION_NAMES:
                return False, f"Security Violation: Function '{func_name}' is not permitted."

    # 4. Extract local CTE aliases defined within the query
    cte_aliases: Set[str] = {
        cte.alias.lower()
        for cte in parsed.find_all(exp.CTE)
        if cte.alias
    }

    # 5. Extract ALL referenced tables/views across FROM, JOIN, Subqueries, and CTEs
    normalized_allowed = {v.lower() for v in allowed_views}
    referenced_tables: List[str] = []

    for table in parsed.find_all(exp.Table):
        # Reject function tables like FROM read_csv(...)
        if isinstance(table.this, (exp.Func, exp.ReadCSV)):
            func_name = (
                table.this.sql_name().lower()
                if hasattr(table.this, "sql_name")
                else (getattr(table.this, "key", "") or type(table.this).__name__).lower()
            )
            return False, f"Security Violation: Function '{func_name}' is not permitted."

        tbl_name = table.name.lower() if table.name else ""
        if tbl_name:
            referenced_tables.append(tbl_name)

    if not referenced_tables:
        # Queries without tables (e.g. SELECT 1) are permitted
        return True, "Query Authorized"

    # 6. Check every referenced entity against the role's allowed_views
    for entity in referenced_tables:
        # If entity is a locally defined CTE in this exact query, allow it
        if entity in cte_aliases:
            continue

        if entity not in normalized_allowed:
            return False, f"Security Violation: Access denied to view or table '{entity}'."

    return True, "Query Authorized"
