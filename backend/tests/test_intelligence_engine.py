"""Unit and integration tests for FinSight 2.0 Intelligence & Fusion Engine.

Tests:
- 3-Way Query Classifier (SQL, RAG, HYBRID)
- Business Semantic Layer (Metric calculations and synonym mapping)
- Cross-Modal Fusion and Citations
"""

import pytest
from app.rag_utils.query_classifier import detect_query_type_llm


class TestQueryClassifier:
    """Test suite for 3-way query routing."""

    # 5 SQL Queries
    @pytest.mark.parametrize(
        "query",
        [
            "Average salary of QA engineers",
            "List all employees in Finance with rating 5",
            "Total marketing expenditure in 2024",
            "Show top 5 highest paid software engineers",
            "What is the average bonus across all departments?",
        ],
    )
    def test_sql_classification(self, query: str):
        result = detect_query_type_llm(query)
        assert result == "SQL", f"Expected 'SQL' for '{query}', but got '{result}'"

    # 5 RAG Queries
    @pytest.mark.parametrize(
        "query",
        [
            "Explain paternity leave policy",
            "What is the policy for paternity leave?",
            "Summarize system architecture guidelines",
            "What are the core values of FinSolve?",
            "How do I submit an expense reimbursement request?",
        ],
    )
    def test_rag_classification(self, query: str):
        result = detect_query_type_llm(query)
        assert result == "RAG", f"Expected 'RAG' for '{query}', but got '{result}'"

    # 5 Hybrid Queries
    @pytest.mark.parametrize(
        "query",
        [
            "Why did Q3 marketing expense exceed budget?",
            "How much did travel expenses increase in 2024 and what caused it?",
            "Explain the relationship between headcount growth and office supply expenditure",
            "Why did Q3 marketing expense exceed budget, and by how much?",
            "What caused the drop in Q2 sales revenue and what was the exact variance?",
        ],
    )
    def test_hybrid_classification(self, query: str):
        result = detect_query_type_llm(query)
        assert result == "HYBRID", f"Expected 'HYBRID' for '{query}', but got '{result}'"


class TestSemanticLayer:
    """Test suite for Business Semantic Layer."""

    def test_metric_extraction(self):
        from app.rag_utils.semantic_engine import get_semantic_context_for_query

        context = get_semantic_context_for_query("What is the ROI and who are the top performers?")
        assert "roi" in context
        assert "(net_profit / total_investment) * 100" in context
        assert "top_performers" in context
        assert "performance_rating = 5" in context

    def test_column_synonyms(self):
        from app.rag_utils.semantic_engine import get_semantic_context_for_query

        context = get_semantic_context_for_query("Show me employee compensation and appraisal score")
        assert "compensation" in context
        assert "salary" in context
        assert "appraisal_score" in context
        assert "rating" in context

    def test_empty_query(self):
        from app.rag_utils.semantic_engine import get_semantic_context_for_query

        assert get_semantic_context_for_query("What is the weather today?") == ""


class TestTextToSqlAgent:
    """Test suite for Text-to-SQL Agent with Result-Shape Validation."""

    @pytest.mark.anyio
    async def test_ask_csv_hr_role(self):
        from app.rag_utils.csv_query import ask_csv

        res = await ask_csv("List employees with performance rating 5", role="hr", username="natasha", return_sql=True)
        assert res["row_count"] > 0
        assert "v_hr_data_hr" in res["view_used"]
        assert "v_hr_data_hr" in res["sql"]
        assert "Natasha Romanoff" in res["answer"] or "Tony Stark" in res["answer"]
        assert isinstance(res["raw_rows"], list)

    @pytest.mark.anyio
    async def test_ask_csv_finance_role(self):
        from app.rag_utils.csv_query import ask_csv

        res = await ask_csv("What was the revenue across quarters?", role="finance", username="bruce", return_sql=True)
        assert res["row_count"] > 0
        assert "v_financial_summary_finance" in res["view_used"]
        assert "v_financial_summary_finance" in res["sql"]

    @pytest.mark.anyio
    async def test_ask_csv_zero_results(self):
        from app.rag_utils.csv_query import ask_csv

        res = await ask_csv("List employees with salary greater than 10000000", role="hr", username="natasha")
        assert res["row_count"] == 0 or "0 records" in res["answer"]


class TestRagRetrieverAndReranker:
    """Test suite for Active Reranker and Contextual RAG Retriever."""

    @pytest.mark.anyio
    async def test_ask_rag_hr_benefits(self):
        from app.rag_utils.rag_chain import ask_rag

        res = await ask_rag("What are the statutory employee benefits at FinSolve?", role="hr")
        assert "answer" in res
        assert len(res["answer"]) > 20
        assert "citations" in res
        assert len(res["citations"]) >= 1
        # Validate citation fields
        top_citation = res["citations"][0]
        assert top_citation["type"] == "document"
        assert "source" in top_citation
        assert "passage" in top_citation
        assert "FinSolve_Employee_Handbook_2024.pdf" in top_citation["source"]

    @pytest.mark.anyio
    async def test_ask_rag_role_isolation(self):
        """HR role should not retrieve engineering architecture internal docs."""
        from app.rag_utils.rag_chain import ask_rag

        res = await ask_rag("Explain the microservices architecture SLAs", role="hr")
        sources = [c["source"] for c in res.get("citations", [])]
        assert "Engineering_Architecture_Guidelines_v2.pdf" not in sources

    @pytest.mark.anyio
    async def test_active_reranker_scoring(self):
        """Verifies FlashRank reranker assigns valid scores."""
        from app.rag_utils.rag_module import get_rag_chain

        chain = get_rag_chain(user_role="hr")
        docs = chain.retriever.get_relevant_documents("statutory employee benefits")
        assert len(docs) > 0
        assert "rerank_score" in docs[0].metadata
        assert docs[0].metadata["rerank_score"] > 0.5


class TestHybridFusionEngine:
    """Test suite for Parallel Hybrid Executor & Cross-Modal Reconciliation."""

    @pytest.mark.anyio
    async def test_execute_hybrid_query_marketing(self):
        from app.rag_utils.hybrid_engine import execute_hybrid_query

        res = await execute_hybrid_query(
            "Why did marketing expenses increase in Q3 and by how much?",
            role="marketing",
            username="bruce",
        )
        assert res["mode"] == "HYBRID"
        assert "answer" in res
        assert len(res["answer"]) > 50
        assert "citations" in res
        assert len(res["citations"]) >= 2
        # Verify presence of both SQL and Document citations
        citation_types = {c["type"] for c in res["citations"]}
        assert "sql" in citation_types
        assert "document" in citation_types
        # Verify reconciliation statement
        assert "reconciliation" in res
        assert len(res["reconciliation"]) > 10

    @pytest.mark.anyio
    async def test_execute_hybrid_partial_resilience(self):
        """Validates that hybrid query handles partial failures gracefully."""
        from app.rag_utils.hybrid_engine import execute_hybrid_query

        # Query with no matching numerical data for general role
        res = await execute_hybrid_query(
            "What are the core corporate values of FinSolve?",
            role="general",
            username="anon",
        )
        assert res["mode"] == "HYBRID"
        assert "answer" in res
        assert "citations" in res


class TestCitationBuilder:
    """Test suite for Structured Citation & Provenance Builder."""

    def test_sql_citation_generation(self):
        from app.rag_utils.citations import CitationBuilder

        cb = CitationBuilder()
        cb.add_sql_citation(
            view_name="v_hr_data_hr",
            query="SELECT * FROM v_hr_data_hr",
            rows=[{"employee_id": "E101", "salary": 95000}],
            total_count=1,
        )
        citations = cb.build()
        assert len(citations) == 1
        c = citations[0]
        assert c["type"] == "sql"
        assert c["view"] == "v_hr_data_hr"
        assert "SELECT *" in c["query"]
        assert c["total_count"] == 1
        assert len(c["rows"]) == 1

    def test_doc_citation_generation(self):
        from app.rag_utils.citations import CitationBuilder

        cb = CitationBuilder()
        cb.add_doc_citation(
            source_file="handbook.pdf",
            role="hr",
            snippet="Statutory benefits include healthcare...",
            section="Section 4.1",
            title="Employee Handbook",
            rerank_score=0.98,
        )
        citations = cb.build()
        assert len(citations) == 1
        c = citations[0]
        assert c["type"] == "document"
        assert c["source"] == "handbook.pdf"
        assert c["role"] == "hr"
        assert "Section 4.1" in c["section"]
        assert c["rerank_score"] == 0.98

    def test_reconciliation_citation(self):
        from app.rag_utils.citations import CitationBuilder

        cb = CitationBuilder()
        cb.add_reconciliation(
            status="Agreement",
            explanation="Quantitative spend corresponds with reported European CAC expansion.",
        )
        citations = cb.build()
        assert len(citations) == 1
        c = citations[0]
        assert c["type"] == "reconciliation"
        assert c["status"] == "Agreement"
        assert "Quantitative spend" in c["explanation"]


class TestHybridEvaluator:
    """Test suite for Offline Evaluator (Faithfulness & Citation Precision)."""

    def test_compute_faithfulness_metric(self):
        from app.rag_evaluator.evaluator import compute_faithfulness

        # Grounded answer
        answer = "In Q3, marketing spend reached 145000 according to financial data, driven by European CAC expansion."
        sql_context = {"answer": "Q3 marketing spend was 145000", "sql": "SELECT spend FROM v_marketing"}
        doc_context = [{"passage": "European CAC expansion campaigns occurred in Q3."}]

        res = compute_faithfulness(answer, sql_context, doc_context)
        assert res["faithfulness"] >= 0.70
        assert res["sql_grounding"] > 0.0
        assert res["doc_grounding"] > 0.0

    def test_compute_citation_precision_metric(self):
        from app.rag_evaluator.evaluator import compute_citation_precision

        answer = "According to FinSolve Employee Handbook 2024, statutory healthcare coverage is provided to full-time staff."
        citations = [
            {
                "type": "document",
                "source": "FinSolve_Employee_Handbook_2024.pdf",
                "section": "Section 4.1",
                "passage": "Healthcare coverage is provided to full-time staff."
            }
        ]

        res = compute_citation_precision(answer, citations)
        assert res["citation_precision"] == 1.0
        assert res["valid_citations"] == 1

    @pytest.mark.anyio
    async def test_run_hybrid_benchmark_suite(self):
        from app.rag_evaluator.evaluator import run_hybrid_benchmark

        summary = await run_hybrid_benchmark()
        assert summary["total_test_cases"] >= 3
        assert summary["pass_rate"] >= 0.60
        assert summary["mean_faithfulness"] >= 0.60
        assert summary["mean_citation_precision"] >= 0.70

