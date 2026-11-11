import pytest
from fastapi import APIRouter
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.config import Settings
from app.main import create_app
from tests.conftest import ALLOWED_ORIGIN, make_settings


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_meta(client):
    res = client.get("/api/v1/meta")
    assert res.status_code == 200
    body = res.json()
    assert body["name"] == "Stonebridge API"
    assert body["environment"] == "test"
    assert body["version"]


def test_request_id_is_generated_and_echoed(client):
    generated = client.get("/health").headers["X-Request-ID"]
    assert len(generated) == 32

    echoed = client.get("/health", headers={"X-Request-ID": "trace-123"})
    assert echoed.headers["X-Request-ID"] == "trace-123"


def test_unsafe_request_id_is_replaced(client):
    res = client.get("/health", headers={"X-Request-ID": "bad id\twith spaces"})
    assert res.headers["X-Request-ID"] != "bad id\twith spaces"
    assert len(res.headers["X-Request-ID"]) == 32


def test_unknown_route_uses_error_envelope(client):
    res = client.get("/api/v1/nope")
    assert res.status_code == 404
    error = res.json()["error"]
    assert error["code"] == "not_found"
    assert error["request_id"] == res.headers["X-Request-ID"]


def test_wrong_method_uses_error_envelope(client):
    res = client.post("/health")
    assert res.status_code == 405
    assert res.json()["error"]["code"] == "method_not_allowed"
    assert "allow" in {k.lower() for k in res.headers}


def test_unhandled_error_is_a_clean_500_with_cors_headers():
    app = create_app(make_settings())
    boom = APIRouter()

    @boom.get("/boom")
    def explode():
        raise RuntimeError("secret internal detail")

    app.include_router(boom)
    res = TestClient(app).get("/boom", headers={"Origin": ALLOWED_ORIGIN})

    assert res.status_code == 500
    assert res.json()["error"]["code"] == "internal_error"
    assert "secret internal detail" not in res.text
    assert res.headers["access-control-allow-origin"] == ALLOWED_ORIGIN


def test_cors_preflight_allows_configured_origin(client):
    res = client.options(
        "/api/v1/ask/guard",
        headers={
            "Origin": ALLOWED_ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert res.status_code == 200
    assert res.headers["access-control-allow-origin"] == ALLOWED_ORIGIN


def test_cors_rejects_other_origins(client):
    res = client.options(
        "/api/v1/ask/guard",
        headers={
            "Origin": "https://evil.example",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert "access-control-allow-origin" not in res.headers


def test_docs_are_disabled_in_production():
    app = create_app(make_settings(environment="production"))
    assert TestClient(app).get("/docs").status_code == 404
    assert TestClient(app).get("/openapi.json").status_code == 404


def test_wildcard_cors_is_rejected_in_production():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, environment="production", cors_origins=["*"])


def test_cors_origins_parse_from_comma_separated_env(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "http://a.test/, http://b.test")
    assert Settings(_env_file=None).cors_origins == ["http://a.test", "http://b.test"]
