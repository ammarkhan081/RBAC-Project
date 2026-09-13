"""Retrieved-Content & Upload Sanitizer for FinSight 2.0.

Defends against OWASP Top 10 for LLMs #1 (Prompt Injection & Instruction Hijacking).
Screens retrieved document chunks and file uploads for prompt injection signatures
before context synthesis by the LLM.
"""

import re
import logging
from typing import Any, List, Tuple

logger = logging.getLogger("finsight.sanitizer")

# Canonical prompt injection signatures
INJECTION_SIGNATURES: List[str] = [
    "ignore all previous instructions",
    "ignore previous instructions",
    "ignore all previous rules",
    "ignore previous rules",
    "ignore all rules",
    "ignore all previous",
    "ignore previous",
    "disregard all previous instructions",
    "disregard previous instructions",
    "disregard all previous rules",
    "disregard previous rules",
    "disregard all previous",
    "disregard previous",
    "disregard all rules",
    "disregard all restrictions",
    "you are now",
    "system prompt",
    "system override",
    "jailbreak",
    "jailbreak mode",
    "reveal passwords",
    "reveal password",
    "override security",
    "print all confidential",
    "bypass authorization",
    "print system prompt",
    "developer mode",
    "act as root",
    "admin password",
]

# Compile regular expression matching any signature (sorted longest first to avoid partial overlap)
_SORTED_PATTERNS = sorted(INJECTION_SIGNATURES, key=len, reverse=True)
_COMBINED_PATTERN = "|".join(re.escape(p) for p in _SORTED_PATTERNS)
INJECTION_REGEX = re.compile(rf"({_COMBINED_PATTERN})", re.IGNORECASE)


def scan_and_sanitize_text(text: str) -> Tuple[str, bool, List[str]]:
    """Scans input text for injection signatures using case-insensitive regex.
    
    If detected:
        - Flags is_suspicious = True
        - Neutralizes the phrase: [FLAGGED INSTRUCTION REMOVED: <phrase>]
        - Logs a security warning event
        
    Args:
        text: Raw input string from document chunks or user uploads.
        
    Returns:
        (cleaned_text: str, is_suspicious: bool, flagged_matches: List[str])
    """
    if not text:
        return text, False, []

    matches = [m.group(0) for m in INJECTION_REGEX.finditer(text)]
    if not matches:
        return text, False, []

    logger.warning("Prompt injection signature detected: %s", matches)

    cleaned_text = INJECTION_REGEX.sub(
        lambda m: f"[FLAGGED INSTRUCTION REMOVED: {m.group(0)}]",
        text,
    )

    return cleaned_text, True, matches


def sanitize_retrieved_documents(docs: List[Any]) -> List[Any]:
    """Iterates through retrieved document chunks before they are sent to the prompt.
    
    Neutralizes any chunk containing injected instructions so malicious files cannot
    hijack the assistant.
    """
    sanitized_docs = []

    for doc in docs:
        if isinstance(doc, str):
            cleaned, is_suspicious, matches = scan_and_sanitize_text(doc)
            sanitized_docs.append(cleaned)

        elif isinstance(doc, dict):
            doc_copy = dict(doc)
            target_key = None
            for candidate in ["text", "content", "page_content", "body"]:
                if candidate in doc_copy and isinstance(doc_copy[candidate], str):
                    target_key = candidate
                    break

            if target_key:
                cleaned, is_suspicious, matches = scan_and_sanitize_text(doc_copy[target_key])
                doc_copy[target_key] = cleaned
                doc_copy["is_sanitized"] = is_suspicious
                if is_suspicious:
                    meta = dict(doc_copy.get("metadata") or {})
                    meta["flagged_injections"] = matches
                    doc_copy["metadata"] = meta
            sanitized_docs.append(doc_copy)

        elif hasattr(doc, "page_content"):
            cleaned, is_suspicious, matches = scan_and_sanitize_text(doc.page_content)
            doc.page_content = cleaned
            if hasattr(doc, "metadata") and isinstance(doc.metadata, dict):
                doc.metadata["is_sanitized"] = is_suspicious
                if is_suspicious:
                    doc.metadata["flagged_injections"] = matches
            sanitized_docs.append(doc)

        else:
            sanitized_docs.append(doc)

    return sanitized_docs
