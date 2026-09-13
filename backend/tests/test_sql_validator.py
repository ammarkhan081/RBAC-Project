"""Unit tests for SQL AST & Allowlist Security Validator."""

import pytest
from app.rag_utils.sql_validator import validate_sql_for_role
from app.rag_utils.duckdb_views import get_allowed_views_for_role


class TestSqlValidator:
    """Test suite ensuring strict AST enforcement and zero unauthorized access."""

    def test_direct_access_to_base_table_blocked(self):
        """Direct access to raw base table hr_data must be blocked."""
        allowed_views = get_allowed_views_for_role("hr")
        sql = "SELECT * FROM hr_data;"
        is_valid, msg = validate_sql_for_role(sql, allowed_views)
        assert not is_valid
        assert "Access denied to view or table 'hr_data'" in msg

    def test_authorized_view_access_allowed(self):
        """Access to authorized view v_hr_data_hr by HR role must be allowed."""
        allowed_views = get_allowed_views_for_role("hr")
        sql = "SELECT employee_id, salary FROM v_hr_data_hr WHERE salary > 50000;"
        is_valid, msg = validate_sql_for_role(sql, allowed_views)
        assert is_valid
        assert msg == "Query Authorized"

    def test_subquery_escape_to_base_table_blocked(self):
        """Subquery referencing base table must be detected by AST traversal and blocked."""
        allowed_views = get_allowed_views_for_role("hr")
        sql = "SELECT * FROM (SELECT * FROM hr_data) AS sub;"
        is_valid, msg = validate_sql_for_role(sql, allowed_views)
        assert not is_valid
        assert "Access denied to view or table 'hr_data'" in msg

    def test_cte_escape_to_base_table_blocked(self):
        """CTE attempting to query base table hr_data must be blocked."""
        allowed_views = get_allowed_views_for_role("hr")
        sql = "WITH leaked AS (SELECT * FROM hr_data) SELECT * FROM leaked;"
        is_valid, msg = validate_sql_for_role(sql, allowed_views)
        assert not is_valid
        assert "Access denied to view or table 'hr_data'" in msg

    def test_authorized_cte_allowed(self):
        """CTE referencing authorized view v_hr_data_hr must be allowed."""
        allowed_views = get_allowed_views_for_role("hr")
        sql = "WITH top_earners AS (SELECT employee_id, salary FROM v_hr_data_hr WHERE salary > 100000) SELECT * FROM top_earners;"
        is_valid, msg = validate_sql_for_role(sql, allowed_views)
        assert is_valid
        assert msg == "Query Authorized"

    def test_stacked_statements_blocked(self):
        """Multi-statement SQL injection attempts must be blocked."""
        allowed_views = get_allowed_views_for_role("hr")
        sql = "SELECT * FROM v_hr_data_hr; DROP TABLE hr_data;"
        is_valid, msg = validate_sql_for_role(sql, allowed_views)
        assert not is_valid
        assert "Multiple stacked SQL statements are prohibited" in msg

    def test_ddl_statement_blocked(self):
        """DROP, CREATE, ALTER statements must be blocked."""
        allowed_views = get_allowed_views_for_role("hr")
        sql = "DROP TABLE v_hr_data_hr;"
        is_valid, msg = validate_sql_for_role(sql, allowed_views)
        assert not is_valid
        assert "Only SELECT queries are permitted" in msg

    def test_dml_statement_blocked(self):
        """INSERT, UPDATE, DELETE statements must be blocked."""
        allowed_views = get_allowed_views_for_role("hr")
        sql = "DELETE FROM v_hr_data_hr WHERE salary < 30000;"
        is_valid, msg = validate_sql_for_role(sql, allowed_views)
        assert not is_valid
        assert "Only SELECT queries are permitted" in msg

    def test_cross_role_view_access_blocked(self):
        """Marketing role attempting to query HR view must be blocked."""
        marketing_views = get_allowed_views_for_role("marketing")
        sql = "SELECT * FROM v_hr_data_hr;"
        is_valid, msg = validate_sql_for_role(sql, marketing_views)
        assert not is_valid
        assert "Access denied to view or table 'v_hr_data_hr'" in msg

    def test_forbidden_scan_function_blocked(self):
        """Attempts to invoke read_csv or filesystem functions must be blocked."""
        allowed_views = get_allowed_views_for_role("hr")
        sql = "SELECT * FROM read_csv('confidential_salaries.csv');"
        is_valid, msg = validate_sql_for_role(sql, allowed_views)
        assert not is_valid
        assert "Function 'read_csv' is not permitted" in msg or "Access denied" in msg

    def test_invalid_syntax_handled_gracefully(self):
        """Malformed SQL must be caught and rejected gracefully."""
        allowed_views = get_allowed_views_for_role("hr")
        sql = "SELECT FROM WHERE !!!;"
        is_valid, msg = validate_sql_for_role(sql, allowed_views)
        assert not is_valid
        assert "Invalid SQL Syntax" in msg
