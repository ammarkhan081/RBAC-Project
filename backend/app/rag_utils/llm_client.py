"""Unified Provider Abstraction Layer for FinSight 2.0.

Zero-cost architecture supporting:
- Groq (llama-3.3-70b-versatile)
- FastEmbed (BAAI/bge-small-en-v1.5) CPU local embeddings
- FlashRank local cross-encoder reranking
"""

import os
import logging
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger("finsight.llm_client")

# Singletons for local models to prevent reload overhead
_FASTEMBED_INSTANCE = None
_FLASHRANK_INSTANCE = None


class FastEmbedWrapper:
    """Zero-cost local embedding generator powered by FastEmbed running on CPU."""

    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        from fastembed import TextEmbedding

        self.model_name = model_name
        self.model = TextEmbedding(model_name=model_name)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of document strings."""
        if not texts:
            return []
        embeddings = list(self.model.embed(texts))
        return [e.tolist() for e in embeddings]

    def embed_query(self, text: str) -> List[float]:
        """Embed a single query string."""
        embedding = next(self.model.embed([text]))
        return embedding.tolist()


class FlashRankWrapper:
    """Zero-cost local cross-encoder reranker powered by FlashRank."""

    def __init__(self, model_name: str = "ms-marco-TinyBERT-L-2-v2"):
        from flashrank import Ranker

        self.model_name = model_name
        self.ranker = Ranker(model_name=model_name)

    def rerank(self, query: str, passages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rerank passages for a given query.
        
        Passages format: [{'id': 1, 'text': 'content', 'meta': {...}}]
        """
        from flashrank import RerankRequest

        if not passages:
            return []

        # Ensure passage format has text and id
        formatted_passages = []
        for i, p in enumerate(passages):
            if isinstance(p, str):
                formatted_passages.append({"id": i, "text": p})
            elif isinstance(p, dict):
                p_copy = dict(p)
                if "text" not in p_copy:
                    p_copy["text"] = str(p_copy.get("content", ""))
                if "id" not in p_copy:
                    p_copy["id"] = i
                formatted_passages.append(p_copy)
            else:
                formatted_passages.append({"id": i, "text": str(p)})

        req = RerankRequest(query=query, passages=formatted_passages)
        return self.ranker.rerank(req)


class UnifiedLLMClient:
    """Unified wrapper around Groq / OpenAI compatible API client."""

    def __init__(
        self,
        provider: str = "groq",
        api_key: Optional[str] = None,
        default_model: Optional[str] = None,
        temperature: float = 0.0,
    ):
        self.provider = provider.lower()
        self.default_model = default_model or os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
        self.temperature = temperature
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "")

        if self.provider == "groq":
            import groq

            self.client = groq.Groq(api_key=self.api_key)
        else:
            try:
                import openai

                self.client = openai.OpenAI(api_key=self.api_key)
            except ImportError:
                import groq

                self.client = groq.Groq(api_key=self.api_key)

    @property
    def chat(self):
        """Pass-through to underlying client chat completions."""
        return self.client.chat

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: int = 500,
    ) -> str:
        """Convenience method to generate completion text."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = self.client.chat.completions.create(
            model=model or self.default_model,
            messages=messages,
            temperature=self.temperature if temperature is None else temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content


def get_llm(model: Optional[str] = None, temperature: float = 0.0) -> UnifiedLLMClient:
    """Returns the configured LLM client (Groq qwen/qwen3.8-27b by default)."""
    provider = os.getenv("LLM_PROVIDER", "groq")
    api_key = os.getenv("GROQ_API_KEY") if provider == "groq" else os.getenv("OPENAI_API_KEY")
    default_model = model or os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    return UnifiedLLMClient(
        provider=provider,
        api_key=api_key,
        default_model=default_model,
        temperature=temperature,
    )


def get_embeddings(model_name: str = "BAAI/bge-small-en-v1.5"):
    """Returns embedding engine. Defaults to zero-cost local CPU FastEmbed."""
    global _FASTEMBED_INSTANCE
    provider = os.getenv("EMBEDDING_PROVIDER", "fastembed").lower()

    if provider == "fastembed":
        if _FASTEMBED_INSTANCE is None:
            _FASTEMBED_INSTANCE = FastEmbedWrapper(model_name=model_name)
        return _FASTEMBED_INSTANCE

    # Fallback to OpenAI if explicitly requested and library is available
    if provider == "openai":
        try:
            from langchain_openai import OpenAIEmbeddings

            return OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))
        except ImportError:
            logger.warning("langchain_openai not installed. Falling back to FastEmbed.")
            if _FASTEMBED_INSTANCE is None:
                _FASTEMBED_INSTANCE = FastEmbedWrapper(model_name=model_name)
            return _FASTEMBED_INSTANCE

    # Default to FastEmbed
    if _FASTEMBED_INSTANCE is None:
        _FASTEMBED_INSTANCE = FastEmbedWrapper(model_name=model_name)
    return _FASTEMBED_INSTANCE


def get_reranker(model_name: str = "ms-marco-TinyBERT-L-2-v2"):
    """Returns reranking engine. Defaults to zero-cost local CPU FlashRank."""
    global _FLASHRANK_INSTANCE
    provider = os.getenv("RERANKER_PROVIDER", "flashrank").lower()

    if provider == "cohere" and os.getenv("COHERE_API_KEY"):
        try:
            import cohere

            cohere_client = cohere.Client(api_key=os.getenv("COHERE_API_KEY"))
            return cohere_client
        except Exception as e:
            logger.warning("Cohere client init failed (%s). Falling back to FlashRank.", e)

    if _FLASHRANK_INSTANCE is None:
        _FLASHRANK_INSTANCE = FlashRankWrapper(model_name=model_name)
    return _FLASHRANK_INSTANCE
