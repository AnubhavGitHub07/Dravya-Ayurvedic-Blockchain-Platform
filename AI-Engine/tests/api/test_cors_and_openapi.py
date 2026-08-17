"""
Automated tests for CORS headers, OpenAPI schema completeness, and HTTP status codes.
"""
import os
import pytest
from fastapi.testclient import TestClient

from src.api.app import create_app

app = create_app()
client = TestClient(app)


def test_cors_preflight_allowed_origin():
    """Verify CORS preflight OPTIONS request returns correct Access-Control-Allow-Origin header."""
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
    }
    response = client.options("/batches/create", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_cors_custom_origin_env_var(monkeypatch):
    """Verify DRAVYA_CORS_ORIGINS environment variable overrides default origins."""
    monkeypatch.setenv("DRAVYA_CORS_ORIGINS", "http://custom-frontend.org")
    custom_app = create_app()
    custom_client = TestClient(custom_app)

    headers = {
        "Origin": "http://custom-frontend.org",
        "Access-Control-Request-Method": "GET",
    }
    response = custom_client.options("/inventory/summary", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://custom-frontend.org"


def test_openapi_json_completeness():
    """Verify OpenAPI schema contains all expected paths and metadata."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()

    assert "paths" in schema
    paths = schema["paths"]

    expected_paths = [
        "/health",
        "/batches/create",
        "/batches/create-from-image",
        "/batches/{batch_id}",
        "/batches/{batch_id}/traceability",
        "/batches/herb/{herb_name}",
        "/batches/farmer/{farmer_id}",
        "/batches/summary/herb/{herb_name}",
        "/batches/summary/farmer/{farmer_id}",
        "/inventory/summary",
        "/chat",
    ]

    for ep in expected_paths:
        assert ep in paths, f"Expected endpoint '{ep}' missing from OpenAPI paths."


def test_endpoint_error_status_codes():
    """Verify standard status codes and error formats for invalid inputs."""
    # 1. 404 Batch Not Found
    resp_404 = client.get("/batches/NONEXISTENT-BATCH-12345")
    assert resp_404.status_code == 404
    err_404 = resp_404.json()
    assert "error" in err_404 or "detail" in err_404

    # 2. 400 Invalid Quantity
    resp_400 = client.post(
        "/batches/create",
        json={
          "herb_species": "Ashwagandha",
          "farmer_id": "F001",
          "quantity": -10.0,
          "harvest_date": "2026-08-10",
        },
    )
    assert resp_400.status_code == 400 or resp_400.status_code == 422

    # 3. 422 Missing Required Field
    resp_422 = client.post(
        "/batches/create",
        json={"farmer_id": "F001"},
    )
    assert resp_422.status_code == 422
