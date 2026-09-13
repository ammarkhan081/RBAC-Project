"""Pytest fixtures for FinSight 2.0 Red-Team Attack Suite."""

import os
import pytest
import yaml
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="session")
def attack_corpus():
    """Loads the 40+ attack cases from attack_corpus.yaml."""
    corpus_path = os.path.join(os.path.dirname(__file__), "attack_corpus.yaml")
    with open(corpus_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

@pytest.fixture(scope="session")
def client():
    """FastAPI TestClient instance."""
    return TestClient(app)
