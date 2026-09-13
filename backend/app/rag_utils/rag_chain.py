"""Async RAG Executor for FinSight 2.0.

Provides `ask_rag(question: str, role: str)` which executes the role-isolated,
active FlashRank reranked retrieval chain and formats exact document citations.
"""

import asyncio
import logging
from typing import Any, Dict, List

from app.rag_utils.rag_module import get_rag_chain

logger = logging.getLogger("finsight.rag_chain")


async def ask_rag(question: str, role: str = "general") -> Dict[str, Any]:
    """Executes RAG retrieval with active reranking and returns answer + passage citations.
    
    Args:
        question: Natural language question.
        role: User role for role-scoped metadata filtering.
        
    Returns:
        Dict containing:
        - "answer": Grounded synthesis string citing document and section.
        - "citations": List of structured document citation dicts.
    """
    # 1. Instantiate role-isolated RAG chain with active reranker
    chain = get_rag_chain(user_role=role)

    # 2. Execute retrieval and synthesis
    try:
        result = await asyncio.to_thread(chain.invoke, {"question": question})
    except Exception:
        result = chain.invoke({"question": question})

    # 3. Extract source documents with preserved chunk metadata
    citations: List[Dict[str, Any]] = []
    for doc in result.get("context", []):
        passage_snippet = doc.page_content[:300] + ("..." if len(doc.page_content) > 300 else "")
        citations.append({
            "type": "document",
            "source": doc.metadata.get("source", "Unknown"),
            "section": doc.metadata.get("section", "General"),
            "title": doc.metadata.get("title", doc.metadata.get("source", "Unknown")),
            "role": doc.metadata.get("role", "general"),
            "rerank_score": doc.metadata.get("rerank_score", 0.0),
            "passage": passage_snippet,
        })

    return {
        "answer": result["answer"],
        "citations": citations,
    }
