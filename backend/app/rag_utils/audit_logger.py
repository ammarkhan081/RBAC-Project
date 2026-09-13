"""Authorization Audit Logger for FinSight 2.0.

Provides immutable SQLite audit trail capturing:
- Timestamp
- Username and Role
- Raw Query
- Routing / Access Decision (BLOCKED / ALLOWED)
- Authorization boolean
- Denial Reason (if blocked)
- Execution Latency (ms)
"""

import os
import sqlite3
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger("finsight.audit_logger")

DEFAULT_DB_PATH = os.getenv("ROLES_DOCS_DB_PATH", "roles_docs.db")


def get_db_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """Creates a connection to SQLite database and ensures audit table exists."""
    target_path = db_path or os.getenv("ROLES_DOCS_DB_PATH", DEFAULT_DB_PATH)
    
    dirname = os.path.dirname(target_path)
    if dirname and not os.path.exists(dirname):
        os.makedirs(dirname, exist_ok=True)

    conn = sqlite3.connect(target_path)
    conn.row_factory = sqlite3.Row
    _ensure_table(conn)
    return conn


def _ensure_table(conn: sqlite3.Connection):
    """Initializes the audit_logs schema."""
    create_sql = """
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        query TEXT NOT NULL,
        route_taken TEXT NOT NULL,
        authorized BOOLEAN NOT NULL,
        denial_reason TEXT,
        execution_time_ms REAL
    );
    """
    with conn:
        conn.execute(create_sql)


def log_audit_event(
    username: str,
    role: str,
    query: str,
    route: str,
    authorized: bool,
    denial_reason: Optional[str] = None,
    latency_ms: float = 0.0,
    db_path: Optional[str] = None,
) -> int:
    """Logs an audit event to the immutable SQLite audit table."""
    conn = get_db_connection(db_path)
    insert_sql = """
    INSERT INTO audit_logs (
        timestamp, username, role, query, route_taken, authorized, denial_reason, execution_time_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    with conn:
        cursor = conn.execute(
            insert_sql,
            (
                now_str,
                username,
                role,
                query,
                route,
                1 if authorized else 0,
                denial_reason,
                latency_ms,
            ),
        )
        record_id = cursor.lastrowid
    conn.close()
    return record_id


def get_audit_logs(
    limit: int = 100,
    role_filter: Optional[str] = None,
    status_filter: Optional[str] = None,
    db_path: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Retrieves paginated and filtered audit records from the audit trail."""
    conn = get_db_connection(db_path)
    
    query = "SELECT id, timestamp, username, role, query, route_taken, authorized, denial_reason, execution_time_ms FROM audit_logs"
    conditions = []
    params: List[Any] = []

    if role_filter:
        conditions.append("role = ?")
        params.append(role_filter.lower())

    if status_filter:
        if status_filter.lower() in ("allowed", "true", "1"):
            conditions.append("authorized = 1")
        elif status_filter.lower() in ("blocked", "false", "0", "denied"):
            conditions.append("authorized = 0")

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    cursor = conn.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "username": r["username"],
            "role": r["role"],
            "query": r["query"],
            "route_taken": r["route_taken"],
            "authorized": bool(r["authorized"]),
            "denial_reason": r["denial_reason"],
            "execution_time_ms": r["execution_time_ms"],
        })
    return results
