"""Pytest configuration for FinSight 2.0 Intelligence & Security test suite."""

import pytest


@pytest.fixture
def anyio_backend():
    """Specifies that asynchronous tests run natively on the asyncio backend."""
    return "asyncio"
