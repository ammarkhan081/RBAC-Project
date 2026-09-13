"""Role-Scoped DuckDB Views Engine and Schema Isolator for FinSight 2.0.

Eliminates raw table queries and schema reconnaissance.
Enforces that every database role can only see and query views created for their department.
"""

import os
import sqlite3
import logging
from typing import Dict, List, Optional, Set

logger = logging.getLogger("finsight.duckdb_views")

# Canonical Role Permissions Mapping
ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "c-level": ["*"],  # All views
    "finance": ["financial_summary", "quarterly_financial_report", "marketing_report_2024", "general"],
    "marketing": ["market_report_q4_2024", "marketing_report_2024", "general"],
    "hr": ["hr_data", "general"],
    "engineering": ["engineering_master_doc", "general"],
    "general": ["employee_handbook"],
}

# Known system tables
ALL_KNOWN_TABLES: List[str] = [
    "financial_summary",
    "quarterly_financial_report",
    "marketing_report_2024",
    "market_report_q4_2024",
    "hr_data",
    "engineering_master_doc",
    "general",
    "employee_handbook",
]

# Baseline schemas for known tables (used for isolated prompt generation)
TABLE_SCHEMA_DEFINITIONS: Dict[str, str] = {
    "financial_summary": "CREATE TABLE financial_summary (quarter TEXT, revenue DOUBLE, net_income DOUBLE, operating_expenses DOUBLE); -- Note: quarter values are '2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4'. Use quarter = '2024-Q3' or quarter LIKE '%Q3%'.",
    "quarterly_financial_report": "CREATE TABLE quarterly_financial_report (quarter TEXT, ebitda DOUBLE, debt_ratio DOUBLE, cash_flow DOUBLE);",
    "marketing_report_2024": "CREATE TABLE marketing_report_2024 (campaign_id TEXT, spend DOUBLE, impressions BIGINT, conversions BIGINT, roi DOUBLE);",
    "market_report_q4_2024": "CREATE TABLE market_report_q4_2024 (segment TEXT, market_share DOUBLE, customer_acquisition_cost DOUBLE, growth_rate DOUBLE);",
    "hr_data": "CREATE TABLE hr_data (employee_id TEXT, employee_name TEXT, department TEXT, salary DOUBLE, performance_rating INT, performance_score DOUBLE, status TEXT);",
    "engineering_master_doc": "CREATE TABLE engineering_master_doc (service_name TEXT, uptime_sla DOUBLE, latency_p99_ms INT, incident_count INT);",
    "general": "CREATE TABLE general (doc_id TEXT, title TEXT, category TEXT, public_info TEXT);",
    "employee_handbook": "CREATE TABLE employee_handbook (policy_id TEXT, topic TEXT, summary TEXT);",
}


def normalize_role(role: str) -> str:
    """Normalize role string to lowercase and map hyphenated roles."""
    cleaned = (role or "general").strip().lower()
    return cleaned


def get_role_slug(role: str) -> str:
    """Get safe SQL identifier suffix for a role (e.g. 'c-level' -> 'c_level')."""
    return normalize_role(role).replace("-", "_")


def get_permitted_tables_for_role(role: str) -> List[str]:
    """Return the list of base table names a role is permitted to access."""
    norm_role = normalize_role(role)

    # Resolve permissions (supporting 'c-level' or 'c_level')
    perms = ROLE_PERMISSIONS.get(norm_role)
    if perms is None:
        # Check underscore variant
        for k, v in ROLE_PERMISSIONS.items():
            if k.replace("-", "_") == norm_role.replace("-", "_"):
                perms = v
                break

    if perms is None:
        perms = ROLE_PERMISSIONS.get("general", ["employee_handbook"])

    if "*" in perms:
        return list(ALL_KNOWN_TABLES)

    # Return only known tables that are in permissions
    return [tbl for tbl in ALL_KNOWN_TABLES if tbl in perms]


def get_allowed_views_for_role(role: str, tables: Optional[List[str]] = None) -> List[str]:
    """Returns list of allowed view names for the given role.
    
    Example:
        For 'hr': returns ['v_hr_data_hr', 'v_general_hr']
        For 'marketing': returns ['v_market_report_q4_2024_marketing', ...]
    """
    role_slug = get_role_slug(role)
    permitted_tables = get_permitted_tables_for_role(role)

    if tables is not None:
        target_tables = [t for t in tables if t in permitted_tables or "*" in ROLE_PERMISSIONS.get(normalize_role(role), [])]
    else:
        target_tables = permitted_tables

    return [f"v_{table}_{role_slug}" for table in target_tables]


def ensure_role_views(duck_conn) -> List[str]:
    """Inspects DuckDB tables and creates role-scoped views for authorized roles only.
    
    CRITICAL: For a table like 'hr_data', only creates:
        v_hr_data_hr
        v_hr_data_c_level
    and NEVER creates v_hr_data_marketing or any unauthorized views.
    """
    created_views: List[str] = []

    # Discover tables currently in DuckDB
    try:
        res = duck_conn.execute("SHOW TABLES").fetchall()
        existing_tables = [r[0] for r in res]
    except Exception as e:
        logger.error("Error inspecting DuckDB tables: %s", e)
        existing_tables = []

    # If no tables exist yet, create mock base tables from known schemas for test readiness
    if not existing_tables:
        for tbl, schema in TABLE_SCHEMA_DEFINITIONS.items():
            create_sql = schema if "IF NOT EXISTS" in schema else schema.replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ")
            duck_conn.execute(create_sql)
        existing_tables = list(TABLE_SCHEMA_DEFINITIONS.keys())

    # Filter out existing views from base tables
    base_tables = [t for t in existing_tables if not t.startswith("v_")]

    # Create role views
    for role, allowed_tables in ROLE_PERMISSIONS.items():
        role_slug = get_role_slug(role)
        for tbl in base_tables:
            is_allowed = ("*" in allowed_tables) or (tbl in allowed_tables)
            if is_allowed:
                view_name = f"v_{tbl}_{role_slug}"
                create_view_sql = f"CREATE OR REPLACE VIEW {view_name} AS SELECT * FROM {tbl};"
                duck_conn.execute(create_view_sql)
                created_views.append(view_name)

    logger.info("Successfully generated %d role-scoped DuckDB views.", len(created_views))
    return created_views


def build_isolated_schema_prompt(role: str, sqlite_db_path: Optional[str] = None) -> str:
    """Builds a strictly role-isolated schema prompt for the LLM.
    
    Queries SQLite documents or predefined schemas ONLY for tables the role is authorized to see.
    Replaces raw table names with the role's authorized view names (v_<table_name>_<role>).
    
    CRITICAL: An HR user NEVER sees Marketing schemas; Marketing NEVER sees HR schemas!
    """
    norm_role = normalize_role(role)
    role_slug = get_role_slug(role)
    permitted_tables = get_permitted_tables_for_role(norm_role)
    allowed_views = get_allowed_views_for_role(norm_role)

    # Attempt to load schemas from SQLite documents table if available
    db_schemas: Dict[str, str] = {}
    db_path = sqlite_db_path or os.getenv("SQLITE_DB_PATH", "data/finsight.db")
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            # Check if documents table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='documents';")
            if cursor.fetchone():
                placeholders = ",".join(["?"] * len(permitted_tables))
                query = f"SELECT table_name, schema_sql FROM documents WHERE table_name IN ({placeholders});"
                cursor.execute(query, permitted_tables)
                for tbl_name, s_sql in cursor.fetchall():
                    if s_sql:
                        db_schemas[tbl_name] = s_sql
            conn.close()
        except Exception as e:
            logger.warning("Could not read schemas from SQLite documents table: %s", e)

    # Fallback / merge with known schemas
    final_schemas: List[str] = []
    for tbl in permitted_tables:
        raw_schema = db_schemas.get(tbl) or TABLE_SCHEMA_DEFINITIONS.get(tbl)
        if raw_schema:
            # Replace base table name with authorized view name
            view_name = f"v_{tbl}_{role_slug}"
            transformed_schema = raw_schema.replace(f"TABLE {tbl} ", f"VIEW {view_name} ")
            transformed_schema = transformed_schema.replace(f"TABLE {tbl}(", f"VIEW {view_name} (")
            final_schemas.append(transformed_schema)

    schema_body = "\n".join(final_schemas)
    prompt = (
        f"### AUTHORIZED DATABASE VIEWS FOR ROLE '{norm_role.upper()}'\n"
        f"You are operating with strict role-based data isolation. You are ONLY permitted to query the following views:\n"
        f"Allowed Views: {', '.join(allowed_views)}\n\n"
        f"Schemas:\n{schema_body}\n\n"
        f"SECURITY NOTICE: You MUST ONLY generate SELECT queries targeting the views listed above. "
        f"Querying raw base tables, system catalogs, or views for other roles is strictly blocked."
    )
    return prompt


_GLOBAL_DUCKDB_CONN = None


def seed_initial_data(duck_conn) -> None:
    """Seeds realistic enterprise mock data into DuckDB base tables if empty."""
    try:
        count = duck_conn.execute("SELECT COUNT(*) FROM hr_data").fetchone()[0]
        if count == 0:
            duck_conn.execute("""
                INSERT INTO hr_data VALUES 
                ('E101', 'Natasha Romanoff', 'HR', 95000.0, 5, 5.0, 'Active'),
                ('E102', 'Tony Stark', 'Engineering', 160000.0, 5, 5.0, 'Active'),
                ('E103', 'Bruce Banner', 'Finance', 98000.0, 4, 4.0, 'Active'),
                ('E104', 'Steve Rogers', 'Operations', 92000.0, 5, 5.0, 'Active'),
                ('E105', 'Wanda Maximoff', 'Marketing', 88000.0, 4, 4.2, 'Active'),
                ('E106', 'Peter Parker', 'Engineering', 75000.0, 5, 4.9, 'Active'),
                ('E107', 'Clint Barton', 'Security', 82000.0, 3, 3.8, 'Active')
            """)
    except Exception as e:
        logger.debug("hr_data seed note: %s", e)

    try:
        count = duck_conn.execute("SELECT COUNT(*) FROM financial_summary").fetchone()[0]
        if count == 0:
            duck_conn.execute("""
                INSERT INTO financial_summary VALUES 
                ('2024-Q1', 1200000.0, 350000.0, 850000.0),
                ('2024-Q2', 1450000.0, 420000.0, 1030000.0),
                ('2024-Q3', 1600000.0, 310000.0, 1290000.0),
                ('2024-Q4', 1800000.0, 510000.0, 1290000.0)
            """)
    except Exception as e:
        logger.debug("financial_summary seed note: %s", e)

    try:
        count = duck_conn.execute("SELECT COUNT(*) FROM marketing_report_2024").fetchone()[0]
        if count == 0:
            duck_conn.execute("""
                INSERT INTO marketing_report_2024 VALUES 
                ('CMP-001', 50000.0, 1200000, 4500, 240.0),
                ('CMP-002', 75000.0, 1800000, 6200, 190.0),
                ('CMP-003', 120000.0, 3100000, 9800, 310.0)
            """)
    except Exception as e:
        logger.debug("marketing_report_2024 seed note: %s", e)


def get_duckdb_connection(db_path: Optional[str] = None):
    """Returns a singleton DuckDB connection with role-scoped views and seed data initialized."""
    global _GLOBAL_DUCKDB_CONN
    if _GLOBAL_DUCKDB_CONN is None:
        import duckdb

        path = db_path or os.getenv("DUCKDB_DATABASE_PATH", ":memory:")
        _GLOBAL_DUCKDB_CONN = duckdb.connect(database=path)
        ensure_role_views(_GLOBAL_DUCKDB_CONN)
        seed_initial_data(_GLOBAL_DUCKDB_CONN)
        # Re-ensure views after seeding to make sure view bindings are fresh
        ensure_role_views(_GLOBAL_DUCKDB_CONN)
    return _GLOBAL_DUCKDB_CONN
