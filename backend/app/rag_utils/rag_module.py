"""Active Contextual RAG Retriever and Reranker Module for FinSight 2.0.

Features:
- Role-scoped metadata isolation: {"role": {"$in": [user_role, "general"]}}.
- Active FlashRank / Cohere cross-encoder reranking on retrieved chunks (fixes v1 bypass).
- Preserves full document chunk metadata (source, section, role) for verifiable citations.
- Structured prompt instructing model to cite document title and specific section.
"""

import os
import re
import logging
from typing import Any, Dict, List, Optional

from app.rag_utils.llm_client import get_llm, get_reranker
from app.rag_utils.duckdb_views import normalize_role

logger = logging.getLogger("finsight.rag_module")


class Document:
    """Document chunk container matching standard LangChain Document interface."""

    def __init__(self, page_content: str, metadata: Optional[Dict[str, Any]] = None):
        self.page_content = page_content
        self.metadata = metadata or {}

    def __repr__(self) -> str:
        return f"Document(source='{self.metadata.get('source')}', role='{self.metadata.get('role')}')"


# =========================================================================
# Standard Enterprise Knowledge Corpus for FinSight 2.0
# =========================================================================
DEFAULT_DOCUMENTS: List[Document] = [
    Document(
        page_content=(
            "FinSolve Employee Handbook - Section 4.1: Statutory Employee Benefits.\n"
            "All regular full-time employees at FinSolve are entitled to mandatory statutory employee benefits: "
            "1. Comprehensive Healthcare: 100% employer-covered medical, dental, and vision insurance for employees. "
            "2. Statutory Retirement Plan: 401(k) / Provident Fund matching up to 6% of base salary with immediate vesting. "
            "3. Paid Time Off: 24 working days of statutory paid annual leave plus 12 statutory public holidays. "
            "4. Disability and Life Insurance: Short-term and long-term disability coverage up to 66% of base earnings, "
            "plus group term life insurance equivalent to 3x annual base salary. "
            "5. Workers Compensation: Full statutory coverage for occupational health and workplace injuries."
        ),
        metadata={
            "source": "FinSolve_Employee_Handbook_2024.pdf",
            "section": "Section 4.1 - Statutory Employee Benefits",
            "title": "FinSolve Employee Handbook 2024",
            "role": "hr",
        },
    ),
    Document(
        page_content=(
            "FinSolve Human Resources Policy - Section 5.3: Parental and Family Leave.\n"
            "Under the statutory family leave policy, eligible employees receive 16 weeks of fully paid maternity leave "
            "and 6 weeks of fully paid paternity leave for both birth and adoptive parents. "
            "During paternity leave, full base compensation and statutory employee benefits continue without interruption. "
            "Employees may transition back to work on a 4-day hybrid work schedule for the first 30 days post-leave."
        ),
        metadata={
            "source": "HR_Parental_Leave_Policy_2024.pdf",
            "section": "Section 5.3 - Parental and Family Leave",
            "title": "HR Parental Leave Policy 2024",
            "role": "hr",
        },
    ),
    Document(
        page_content=(
            "FinSolve Marketing Financial Analysis - Section 2: Q3 Marketing Spend & Budget Variance.\n"
            "In Q3 2024, marketing expenditure exceeded the budgeted ceiling by $180,000 (14.2% variance). "
            "Primary drivers of this variance included: "
            "1. FinSolve 2.0 Enterprise Rebranding Campaign and accelerated brand positioning launch. "
            "2. Unanticipated escalation in European customer acquisition costs (CAC) across digital ad channels. "
            "3. Contractual fees for high-tier industry conference sponsorships and keynote executive appearances. "
            "The budget variance was approved by the executive committee under memo FIN-MKT-2024-Q3."
        ),
        metadata={
            "source": "Marketing_Q3_Variance_Report_2024.pdf",
            "section": "Section 2 - Q3 Budget Variance & Operational Drivers",
            "title": "Marketing Q3 Variance Analysis Report",
            "role": "marketing",
        },
    ),
    Document(
        page_content=(
            "FinSolve Engineering Architecture Guide - Section 3.2: System Architecture Guidelines.\n"
            "The FinSolve 2.0 distributed cloud architecture enforces the following mandatory standards: "
            "1. Microservices Resilience: All microservices must be stateless and implement circuit breakers with retry backoff. "
            "2. Performance SLAs: Target 99.99% service availability with P99 API latency strictly below 50 milliseconds. "
            "3. Zero-Trust Security: Role-isolated view abstractions for database queries and AST validation on SQL execution. "
            "4. Cross-Modal Fusion: Asynchronous parallel dispatch for analytical and semantic retrieval pipelines."
        ),
        metadata={
            "source": "Engineering_Architecture_Guidelines_v2.pdf",
            "section": "Section 3.2 - Cloud Architecture Guidelines",
            "title": "Engineering Architecture Guidelines v2",
            "role": "engineering",
        },
    ),
    Document(
        page_content=(
            "FinSolve Corporate Governance - Section 1.1: Core Values and Principles.\n"
            "FinSolve operates on four foundational corporate values: "
            "1. Trust Through Provenance: Every numerical metric and business claim must be grounded in auditable source data. "
            "2. Relentless Innovation: Continuously advancing agentic AI capabilities while maintaining zero paid API dependency. "
            "3. Radical Transparency: Strict access control with immutable audit trails for all operations. "
            "4. Client-Centric Excellence: Delivering precision, data privacy, and verifiable results to enterprise partners."
        ),
        metadata={
            "source": "FinSolve_Corporate_Governance_2024.pdf",
            "section": "Section 1.1 - Corporate Values & Mission",
            "title": "FinSolve Corporate Governance 2024",
            "role": "general",
        },
    ),
]


class BaseRoleRetriever:
    """Base document retriever enforcing role-level metadata isolation."""

    def __init__(self, user_role: str, documents: Optional[List[Document]] = None):
        self.user_role = normalize_role(user_role)
        self.documents = documents or DEFAULT_DOCUMENTS

    def get_role_filtered_documents(self) -> List[Document]:
        """Returns documents permitted for this role: role IN [user_role, 'general']."""
        if self.user_role in ("c_level", "c-level", "executive", "admin"):
            return list(self.documents)

        allowed_roles = {self.user_role, "general"}
        return [
            doc for doc in self.documents
            if normalize_role(doc.metadata.get("role", "general")) in allowed_roles
        ]

    def retrieve_candidates(self, query: str, top_k: int = 6) -> List[Document]:
        """Retrieves candidate documents matching role filter and query keywords."""
        filtered = self.get_role_filtered_documents()
        if not filtered:
            return []

        q_terms = set(re.findall(r"\w+", query.lower()))
        scored_docs = []
        for doc in filtered:
            content_lower = doc.page_content.lower()
            source_lower = doc.metadata.get("source", "").lower()
            
            # Match score based on term overlap
            score = 0
            for term in q_terms:
                if len(term) > 2:
                    if term in content_lower:
                        score += 2
                    if term in source_lower:
                        score += 3
            scored_docs.append((score, doc))

        # Sort by candidate score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored_docs[:top_k]]


class ContextualCompressionRetriever:
    """Contextual Compression Retriever with ALWAYS-ACTIVE FlashRank/Cohere reranker."""

    def __init__(self, base_retriever: BaseRoleRetriever, top_n: int = 3):
        self.base_retriever = base_retriever
        self.top_n = top_n
        self.reranker = get_reranker()

    def get_relevant_documents(self, query: str) -> List[Document]:
        """Retrieves role-isolated candidates and applies active cross-encoder reranking."""
        candidates = self.base_retriever.retrieve_candidates(query, top_k=6)
        if not candidates:
            return []

        # Prepare passages for FlashRank / Cohere reranker
        passages = []
        for i, doc in enumerate(candidates):
            passages.append({
                "id": i,
                "text": doc.page_content,
                "meta": doc.metadata,
            })

        try:
            # Active reranking step (fixes v1 bypass bug!)
            reranked_passages = self.reranker.rerank(query=query, passages=passages)
            
            # Map reranked results back to Document instances with preserved metadata
            compressed_docs: List[Document] = []
            for item in reranked_passages[:self.top_n]:
                idx = item.get("id")
                score = item.get("score")
                if idx is not None and 0 <= idx < len(candidates):
                    doc = candidates[idx]
                    doc.metadata["rerank_score"] = float(score) if score is not None else 0.0
                    compressed_docs.append(doc)
            return compressed_docs
        except Exception as e:
            logger.warning("Reranking failed (%s); falling back to candidate order.", e)
            return candidates[:self.top_n]


class RAGChain:
    """Contextual RAG chain combining active reranking and citation-enforced generation."""

    def __init__(self, retriever: ContextualCompressionRetriever):
        self.retriever = retriever

    def invoke(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Executes retrieval and grounded answer synthesis."""
        question = inputs.get("question") or inputs.get("query", "")
        context_docs = self.retriever.get_relevant_documents(question)

        # Build context passage string
        context_blocks = []
        for i, doc in enumerate(context_docs, 1):
            src = doc.metadata.get("source", "Unknown")
            sec = doc.metadata.get("section", "General")
            context_blocks.append(f"[{i}] Document: '{src}' | Section: '{sec}'\n{doc.page_content}")

        context_str = "\n\n".join(context_blocks)

        system_prompt = (
            "You are FinSolve 2.0 Contextual Intelligence Assistant. "
            "Answer the user's question accurately using ONLY the provided document context passages. "
            "MANDATORY CITATION RULE: Always include the document title and specific section when answering. "
            "State facts clearly without hallucination or extrapolation."
        )

        user_prompt = (
            f"Provided Document Context:\n{context_str}\n\n"
            f"Question: {question}\n\n"
            f"Grounded Answer (citing document title and section):"
        )

        answer = ""
        try:
            llm = get_llm(temperature=0.0)
            if not llm.api_key or "placeholder" in llm.api_key.lower():
                answer = self._generate_grounded_fallback(question, context_docs)
            else:
                answer = llm.generate(prompt=user_prompt, system_prompt=system_prompt).strip()
        except Exception as e:
            logger.warning("LLM RAG synthesis failed (%s); generating grounded extraction.", e)
            answer = self._generate_grounded_fallback(question, context_docs)

        return {
            "answer": answer,
            "context": context_docs,
        }

    def _generate_grounded_fallback(self, question: str, docs: List[Document]) -> str:
        """Grounded synthesis fallback citing title and section if LLM is unavailable."""
        if not docs:
            return "No matching documents found within the authorized role scope."

        primary_doc = docs[0]
        title = primary_doc.metadata.get("title", primary_doc.metadata.get("source", "Document"))
        section = primary_doc.metadata.get("section", "Relevant Section")

        # Construct grounded response citing source
        return (
            f"According to {title} ({section}):\n\n"
            f"{primary_doc.page_content}\n\n"
            f"(Source: {primary_doc.metadata.get('source')} - {section})"
        )


def get_rag_chain(user_role: str) -> RAGChain:
    """Creates a role-isolated RAG chain with active FlashRank/Cohere reranker."""
    base_retriever = BaseRoleRetriever(user_role=user_role)
    compression_retriever = ContextualCompressionRetriever(base_retriever=base_retriever, top_n=3)
    return RAGChain(retriever=compression_retriever)
