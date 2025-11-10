#!/usr/bin/env python3
"""
Ad-hoc helper to push the Postman collection JSON into the local Postgres DB.

By default this script reads `docs/postman/collection.json` and stores it inside
the `demo_postman_collections` table as a JSONB payload. The table is created on
the fly if it does not already exist.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict

import psycopg2
from psycopg2 import sql
from decouple import Config, RepositoryEnv
from psycopg2.extras import Json


def parse_args() -> argparse.Namespace:
    repo_root = Path(__file__).resolve().parent.parent
    default_env = repo_root / "src" / ".env"
    default_json = repo_root / "docs" / "postman" / "collection.json"

    parser = argparse.ArgumentParser(
        description="Push a JSON document into Postgres for demo purposes.",
    )
    parser.add_argument(
        "--env-file",
        type=Path,
        default=default_env,
        help="Path to the .env file with Postgres credentials "
        f"(default: {default_env})",
    )
    parser.add_argument(
        "--json",
        type=Path,
        default=default_json,
        help="Path to the JSON file to import "
        f"(default: {default_json})",
    )
    parser.add_argument(
        "--table",
        default="demo_postman_collections",
        help="Destination table name (default: demo_postman_collections)",
    )
    parser.add_argument(
        "--label",
        default=None,
        help="Optional label to store alongside the JSON payload.",
    )
    parser.add_argument(
        "--db-host",
        default=None,
        help="Override database host (default comes from env file).",
    )
    parser.add_argument(
        "--db-port",
        type=int,
        default=None,
        help="Override database port (default comes from env file).",
    )
    parser.add_argument(
        "--db-name",
        default=None,
        help="Override database name (default comes from env file).",
    )
    parser.add_argument(
        "--db-user",
        default=None,
        help="Override database user (default comes from env file).",
    )
    parser.add_argument(
        "--db-password",
        default=None,
        help="Override database password (default comes from env file).",
    )
    return parser.parse_args()


def load_db_config(env_path: Path) -> Dict[str, Any]:
    if not env_path.exists():
        raise FileNotFoundError(f"Could not find env file at {env_path}")

    config = Config(RepositoryEnv(str(env_path)))
    return {
        "dbname": config("DB_NAME"),
        "user": config("DB_USER"),
        "password": config("DB_PASSWORD"),
        "host": config("POSTGRES_HOST", default="localhost"),
        "port": config("POSTGRES_PORT", cast=int, default=5432),
    }


def ensure_table(cursor, table_name: str) -> None:
    query = sql.SQL(
        """
        CREATE TABLE IF NOT EXISTS {table} (
            id SERIAL PRIMARY KEY,
            label TEXT,
            source_path TEXT NOT NULL,
            raw_json JSONB NOT NULL,
            inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    ).format(table=sql.Identifier(table_name))
    cursor.execute(query)


def main() -> int:
    args = parse_args()

    if not args.json.exists():
        print(f"[error] JSON file not found at {args.json}", file=sys.stderr)
        return 1

    try:
        conn_params = load_db_config(args.env_file)
        if args.db_name:
            conn_params["dbname"] = args.db_name
        if args.db_user:
            conn_params["user"] = args.db_user
        if args.db_password:
            conn_params["password"] = args.db_password
        if args.db_host:
            conn_params["host"] = args.db_host
        if args.db_port:
            conn_params["port"] = args.db_port
    except Exception as exc:  # pylint: disable=broad-except
        print(f"[error] Failed to read database credentials: {exc}", file=sys.stderr)
        return 1

    with args.json.open("r", encoding="utf-8") as handle:
        json_payload = json.load(handle)

    try:
        with psycopg2.connect(**conn_params) as connection:
            with connection.cursor() as cursor:
                ensure_table(cursor, args.table)
                insert_query = sql.SQL(
                    """
                    INSERT INTO {table} (label, source_path, raw_json)
                    VALUES (%s, %s, %s)
                    RETURNING id;
                    """
                ).format(table=sql.Identifier(args.table))
                cursor.execute(
                    insert_query,
                    (
                        args.label,
                        str(args.json),
                        Json(json_payload),
                    ),
                )
                inserted_id = cursor.fetchone()[0]
    except Exception as exc:  # pylint: disable=broad-except
        print(f"[error] Failed to insert JSON payload: {exc}", file=sys.stderr)
        return 1

    print(
        f"[ok] Inserted JSON from {args.json} into {args.table} (id={inserted_id})."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())

