"""
Test settings - uses PostgreSQL when available (required for User.db_collation),
otherwise SQLite (may fail on models with db_collation).
Set WIZER_USE_POSTGRES_TESTS=1 and start Postgres (e.g. docker compose up -d db)
to run backend tests. Use POSTGRES_HOST=localhost POSTGRES_PORT=5492 when
connecting from host to Docker-exposed Postgres.
"""
import os
from .base import *

_use_pg = os.environ.get("WIZER_USE_POSTGRES_TESTS", "1") == "1"

if _use_pg:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("DB_NAME", "wip_db"),
            "USER": os.environ.get("DB_USER", "postgres"),
            "PASSWORD": os.environ.get("DB_PASSWORD", "12345678"),
            "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
            "PORT": os.environ.get("POSTGRES_PORT", "5492"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }

# Speed up password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable migrations only when using SQLite (faster); for Postgres we need
# migrations to run so CreateCollation("case_insensitive") is applied.
if not _use_pg:
    class DisableMigrations:
        def __contains__(self, item: str) -> bool:
            return True

        def __getitem__(self, item: str) -> None:
            return None

    MIGRATION_MODULES = DisableMigrations()

# Dummy Google OAuth APP so /accounts/google/login/ "configured" path and adapter run in tests
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": ["profile", "email"],
        "APP": {
            "client_id": "test-google-client-id",
            "secret": "test-google-client-secret",
        },
        "AUTH_PARAMS": {"access_type": "online"},
    }
}
