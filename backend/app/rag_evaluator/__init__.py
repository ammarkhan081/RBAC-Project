"""FinSight 2.0 Offline RAG & Hybrid Evaluator Package."""
from app.rag_evaluator.evaluator import (
    compute_faithfulness,
    compute_citation_precision,
    evaluate_hybrid_response,
    run_hybrid_benchmark,
)

__all__ = [
    "compute_faithfulness",
    "compute_citation_precision",
    "evaluate_hybrid_response",
    "run_hybrid_benchmark",
]
