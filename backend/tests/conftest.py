import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app

ALLOWED_ORIGIN = "http://localhost:3000"


def make_settings(**overrides) -> Settings:
    # _env_file=None keeps a developer's local .env out of the tests.
    values = {"environment": "test", "cors_origins": [ALLOWED_ORIGIN], **overrides}
    return Settings(_env_file=None, **values)


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app(make_settings()))
