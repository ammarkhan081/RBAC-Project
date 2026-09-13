"""Business Semantic Layer Engine for FinSight 2.0.

Translates ambiguous business terminology and executive phrasing into standard
DuckDB SQL calculations, filters, and column definitions.
"""

import os
import re
import yaml
from typing import Any, Dict, List, Optional

_SEMANTIC_CONFIG: Optional[Dict[str, Any]] = None


def load_semantic_layer(config_path: Optional[str] = None) -> Dict[str, Any]:
    """Loads semantic layer YAML configuration."""
    global _SEMANTIC_CONFIG
    if _SEMANTIC_CONFIG is not None and config_path is None:
        return _SEMANTIC_CONFIG

    if not config_path:
        config_path = os.path.join(os.path.dirname(__file__), "semantic_layer.yaml")

    if not os.path.exists(config_path):
        return {"business_metrics": {}, "column_synonyms": {}}

    with open(config_path, "r", encoding="utf-8") as f:
        _SEMANTIC_CONFIG = yaml.safe_load(f) or {}

    return _SEMANTIC_CONFIG


def get_semantic_context_for_query(query: str, config_path: Optional[str] = None) -> str:
    """Matches user query terms against standard business metrics and column synonyms.
    
    Generates a structured 'Semantic Layer Guidance:' prompt block to inject into Text-to-SQL prompts.
    """
    config = load_semantic_layer(config_path)
    metrics: Dict[str, Dict[str, str]] = config.get("business_metrics", {})
    synonyms: Dict[str, List[str]] = config.get("column_synonyms", {})

    q_lower = query.lower()
    matched_metrics = []
    matched_synonyms = []

    # 1. Match business metrics
    for metric_name, metric_info in metrics.items():
        # Check both raw key (e.g. 'roi') and spaced key (e.g. 'top performers')
        spaced_name = metric_name.replace("_", " ")
        pattern = r"\b" + re.escape(spaced_name) + r"\b|\b" + re.escape(metric_name) + r"\b"
        
        # Also check description keywords
        if re.search(pattern, q_lower):
            desc = metric_info.get("description", "")
            calc = metric_info.get("calculation")
            filt = metric_info.get("filter")
            
            rule = f"- Metric '{metric_name}' ({desc}):"
            if calc:
                rule += f" Formula = {calc}"
            if filt:
                rule += f" Filter = {filt}"
            matched_metrics.append(rule)

    # 2. Match column synonyms
    for canonical_col, syn_list in synonyms.items():
        for syn in syn_list:
            spaced_syn = syn.replace("_", " ")
            pattern = r"\b" + re.escape(spaced_syn) + r"\b|\b" + re.escape(syn) + r"\b"
            if re.search(pattern, q_lower):
                matched_synonyms.append(f"- Column synonym '{syn}' maps to canonical column '{canonical_col}'")
                break

    if not matched_metrics and not matched_synonyms:
        return ""

    guidance_lines = ["Semantic Layer Guidance:"]
    if matched_metrics:
        guidance_lines.append("Standard Business Metrics:")
        guidance_lines.extend(matched_metrics)
    if matched_synonyms:
        guidance_lines.append("Column Mappings:")
        guidance_lines.extend(matched_synonyms)

    return "\n".join(guidance_lines)
