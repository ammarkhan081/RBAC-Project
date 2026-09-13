"""Structured Citation & Provenance Builder for FinSight 2.0.

Provides standardized provenance metadata objects across:
- SQL query citations (DuckDB view name, exact SQL query, sample rows, total row count).
- Document citations (source filename, section, role metadata, exact passage text).
- Cross-modal reconciliation citations (agreement/variance status, explanation).

Ensures 100% contract compatibility with frontend CitationsPanel components.
"""

from typing import Any, Dict, List, Optional


class CitationBuilder:
    """Builder class for structuring provenance citations."""

    def __init__(self):
        self._citations: List[Dict[str, Any]] = []

    def add_sql_citation(
        self,
        view_name: str,
        query: str,
        rows: Optional[List[Any]] = None,
        total_count: Optional[int] = None,
    ) -> "CitationBuilder":
        """Adds a structured SQL provenance citation."""
        sample_rows = rows[:10] if rows is not None else []
        count = total_count if total_count is not None else (len(rows) if rows else 0)

        citation = {
            "type": "sql",
            "view": view_name,
            "view_name": view_name,
            "query": query,
            "rows": sample_rows,
            "sample_rows": sample_rows,
            "row_count": count,
            "total_count": count,
        }
        self._citations.append(citation)
        return self

    def add_doc_citation(
        self,
        source_file: str,
        role: str,
        snippet: str,
        section: Optional[str] = None,
        title: Optional[str] = None,
        rerank_score: Optional[float] = None,
    ) -> "CitationBuilder":
        """Adds a structured Document provenance citation."""
        citation = {
            "type": "document",
            "source": source_file,
            "source_file": source_file,
            "role": role,
            "passage": snippet,
            "snippet": snippet,
            "section": section or "General",
            "title": title or source_file,
            "rerank_score": rerank_score if rerank_score is not None else 0.0,
        }
        self._citations.append(citation)
        return self

    def add_reconciliation(
        self,
        status: str,
        explanation: str,
    ) -> "CitationBuilder":
        """Adds a cross-modal reconciliation citation."""
        citation = {
            "type": "reconciliation",
            "status": status,
            "explanation": explanation,
        }
        self._citations.append(citation)
        return self

    def build(self) -> List[Dict[str, Any]]:
        """Returns the assembled list of structured citation objects."""
        return list(self._citations)

    def clear(self) -> "CitationBuilder":
        """Clears all staged citations."""
        self._citations.clear()
        return self


def format_sql_citations(sql_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Convenience helper to format citations from ask_csv response."""
    builder = CitationBuilder()
    if sql_result.get("sql"):
        builder.add_sql_citation(
            view_name=sql_result.get("view_used", "v_unknown"),
            query=sql_result.get("sql", ""),
            rows=sql_result.get("raw_rows", []),
            total_count=sql_result.get("row_count", 0),
        )
    return builder.build()


def format_rag_citations(rag_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Convenience helper to format citations from ask_rag response."""
    builder = CitationBuilder()
    for cit in rag_result.get("citations", []):
        builder.add_doc_citation(
            source_file=cit.get("source") or cit.get("source_file", "Unknown"),
            role=cit.get("role", "general"),
            snippet=cit.get("passage") or cit.get("snippet", ""),
            section=cit.get("section"),
            title=cit.get("title"),
            rerank_score=cit.get("rerank_score"),
        )
    return builder.build()
