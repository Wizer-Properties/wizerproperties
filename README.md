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

### Production

```sh
docker compose -f src/docker-compose.yml up -d --build
```

Then run a one-off Tailwind build and collect static files:

```sh
docker compose -f src/docker-compose.yml run --rm assets sh -c "npm ci && npm run tailwind:build"
docker compose -f src/docker-compose.yml exec web python manage.py collectstatic --noinput
```

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

TDD with **pytest** (backend) and **Vitest** (frontend). Coverage: backend ~75% (target 85%), `fail_under=75` in `pytest.ini`.

| Command | Description |
|---------|-------------|
| `npm run test:all` | Backend pytest + frontend Vitest |
| `npm run test:backend` | `pytest` in `src/` |
| `npm run test` | Vitest (frontend) |
| `npm run test:backend:coverage` | Backend coverage → `src/htmlcov/`, `src/coverage.xml` |
| `npm run test:coverage` | Frontend coverage → `coverage/` |

**Backend:** `src/{app}/tests/test_*.py`, `factories.py`, `src/conftest.py`  
**Frontend:** `src/wizerproperties/static/js/__tests__/**/*.test.ts`

**PostgreSQL for backend tests:** set `WIZER_USE_POSTGRES_TESTS=1`, `POSTGRES_HOST=localhost`, `POSTGRES_PORT=5492`, and start Postgres (e.g. `docker compose -f src/docker-compose-dev.yml up -d db`). Then: `cd src && poetry run pytest --cov`.

---

## Dependencies

### Python (Poetry)

```bash
cd src && poetry add <package>@<version>
```

### Integrations

- **OpenAI:** Set `OPENAI_API_KEY` in `.env` (platform.openai.com).
- **Zoho CRM:** Configure in admin; requires active Zoho subscription.

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
