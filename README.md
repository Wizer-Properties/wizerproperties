# Wizer Properties

Property comparison platform for developers and buyers in Thailand and Malaysia. Django + Tailwind. Docker-supported.

## Prerequisites

- **Docker** (recommended), or **Poetry + Node.js + PostgreSQL** locally
- For production: nginx, certbot for SSL

---

## Quick start (Docker)

Run all commands from the **project root** (parent of `src/`).

Create a `.env` in `src/` using `demo.env` as reference (DB_NAME, DB_USER, DB_PASSWORD, etc.).

### Development

```sh
docker compose -f src/docker-compose-dev.yml build
docker compose -f src/docker-compose-dev.yml run --rm web python manage.py migrate
docker compose -f src/docker-compose-dev.yml up
```

- **Web:** http://localhost:8000  
- **DB:** PostgreSQL 15 on host `localhost:5492` (container `5432`)

**PostgreSQL collation warning** (`has no actual collation version, but a version was recorded`): common with `postgres:15-alpine` (musl). New inits use `POSTGRES_INITDB_ARGS=--locale=C` to reduce it. For an **existing** volume, either run (from project root):

**Development** (`docker-compose-dev.yml`):
```sh
docker compose -f src/docker-compose-dev.yml exec db psql -U postgres -d wip_db -c "ALTER DATABASE wip_db REFRESH COLLATION VERSION;"
docker compose -f src/docker-compose-dev.yml exec db psql -U postgres -d postgres -c "ALTER DATABASE postgres REFRESH COLLATION VERSION;"
docker compose -f src/docker-compose-dev.yml exec db psql -U postgres -d test_wip_db -c "ALTER DATABASE test_wip_db REFRESH COLLATION VERSION;"  # if it exists
```

**Production** (`docker-compose.yml`): use `-f src/docker-compose.yml` and the same `exec` commands; replace `postgres` with your `DB_USER` if different (e.g. `-U ${DB_USER}`).

or recreate the volume (data loss): `docker compose -f src/docker-compose-dev.yml down -v` then `up` again.

**`case_insensitive` collation version mismatch:** If you see `collation "case_insensitive" has version mismatch ... ALTER COLLATION public.case_insensitive REFRESH VERSION`, run in each affected database (e.g. `wip_db`, `test_wip_db`):

```sh
docker compose -f src/docker-compose-dev.yml exec db psql -U postgres -d wip_db -c "ALTER COLLATION public.case_insensitive REFRESH VERSION;"
docker compose -f src/docker-compose-dev.yml exec db psql -U postgres -d test_wip_db -c "ALTER COLLATION public.case_insensitive REFRESH VERSION;"  # if it exists
```

For production: `docker compose -f src/docker-compose.yml exec db psql -U <user> -d wip_db -c "ALTER COLLATION public.case_insensitive REFRESH VERSION;"`

### Production

```sh
docker compose -f src/docker-compose.yml up -d --build
```

Then run a one-off Tailwind build and collect static files:

```sh
docker compose -f src/docker-compose.yml run --rm assets sh -c "npm ci && npm run tailwind:build"
docker compose -f src/docker-compose.yml exec web python manage.py collectstatic --noinput
```

For nginx and Certbot (SSL), see [docs/operations-and-qa.md](docs/operations-and-qa.md#2-deployment--ssl).

---

## Local setup (no Docker)

### Backend

```sh
cd src
poetry install
# create .env from demo.env
poetry run python manage.py migrate
poetry run python manage.py runserver
```

### Frontend (Tailwind)

From **project root**:

```sh
npm ci
npm run tailwind:build    # one-off
npm run tailwind:watch    # watch (dev)
```

### PostgreSQL: case-insensitive fields

For `db_collation="case_insensitive"` on models, add `CreateCollation` before the first `CreateModel` in the initial migration:

```python
from django.contrib.postgres.operations import CreateCollation

operations = [
    CreateCollation("case_insensitive", provider="icu", locale="und-u-ks-level2", deterministic=False),
    migrations.CreateModel(...),
]
```

Ref: [Django Postgres collation](https://docs.djangoproject.com/en/4.2/ref/contrib/postgres/operations/#managing-collations-using-migrations)

---

## Testing

TDD with **pytest** (backend) and **Vitest** (frontend). Coverage: backend `fail_under=85` in `src/.coveragerc` (target 85%); frontend thresholds 85% in `vitest.config.ts`.

| Command | Description |
|---------|-------------|
| `npm run test:all` | Backend pytest + frontend Vitest |
| `npm run test:backend` | `pytest` in `src/` |
| `npm run test` | Vitest (frontend) |
| `npm run test:backend:coverage` | Backend coverage → `src/htmlcov/`, `src/coverage.xml` |
| `npm run test:coverage` | Frontend coverage (v8), `src/wizerproperties/static/js/` |

**Backend:** `src/{app}/tests/test_*.py`, `factories.py`, `src/conftest.py`  
**Frontend:** `src/wizerproperties/static/js/__tests__/**/*.test.ts`

**PostgreSQL for backend tests:** set `WIZER_USE_POSTGRES_TESTS=1`, `POSTGRES_HOST=localhost`, `POSTGRES_PORT=5492`, and start Postgres (e.g. `docker compose -f src/docker-compose-dev.yml up -d db`). Then: `cd src && poetry run pytest --cov`. Test settings (`wizerproperties.settings.test`) override `SOCIALACCOUNT_PROVIDERS` with a dummy Google APP so the `/accounts/google/login/` integration test and `CustomAccountAdapter` run without real OAuth secrets.

**Known log noise:** When running pytest, an `ERROR` for `duplicate key ... ipdata_ipdata_ip_key` with `(ip)=(192.168.255.254)` can appear and is expected from `ipdata.tests.test_models::TestIPDataModel::test_ipdata_ip_unique`.

---

## Dependencies

### Python (Poetry)

```bash
cd src && poetry add <package>@<version>
```

### Integrations

- **OpenAI:** Set `OPENAI_API_KEY` in `.env` (platform.openai.com).
- **Zoho CRM:** Configure in admin; requires active Zoho subscription.
- **Google OAuth:** Set `GOOGLE_AUTH_CLIENT_ID` and `GOOGLE_AUTH_CLIENT_SECRET` in `.env` for `/accounts/google/login/`. `user.adapters.CustomAccountAdapter` extends `DefaultSocialAccountAdapter` and runs when this path is used.

---

## Admin

Use the custom admin site. Register models with `core.admin.custom_admin_site`:

```python
from core.admin import custom_admin_site
custom_admin_site.register(ModelName)
```

Or with decorator:

```python
from django.contrib import admin
from core.admin import custom_admin_site

@admin.register(ModelName, site=custom_admin_site)
class ModelNameAdmin(admin.ModelAdmin):
    pass  # list_display, search_fields, etc.
```

---

## Tailwind & Docker

- `npm run tailwind:build` — one-off build  
- `npm run tailwind:watch` — watch (dev)

**Dev:** `docker compose -f src/docker-compose-dev.yml up` runs an `assets` service with `npm ci && npm run tailwind:watch`. Output: `src/wizerproperties/static/css/tailwind.css`.

**Prod:** See [Production](#production) for the one-off Tailwind build and `collectstatic`.

---

## Docs

- [docs/README.md](docs/README.md) — Index of documentation (operations, deployment, product notes when added).

---

## GitHub

- **CI:** `.github/workflows/ci.yml` — backend pytest, frontend Vitest, coverage.
- **Docker:** `.github/workflows/docker.yml` — build and push (when configured).

---

## License

ISC.
