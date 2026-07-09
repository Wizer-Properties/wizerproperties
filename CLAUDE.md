# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Wizer Properties is a Django 4.2 + Tailwind CSS property comparison platform. The project follows a modular Django app structure with separate frontend and backend testing suites.

### Project Structure

```
src/                      # Django project root
├── wizerproperties/     # Main Django project (settings, urls, templates, static)
│   ├── settings/        # Environment-based settings (base.py, test.py)
│   ├── static/          # Frontend assets (Tailwind source, compiled CSS, JS)
│   │   ├── src/         # Tailwind source files
│   │   ├── css/         # Compiled Tailwind output
│   │   └── js/          # TypeScript/JavaScript with __tests__/
│   └── templates/       # Base templates
├── user/                # User models, views, authentication
│   └── models/auth/     # User, profiles (Developer, Agent, Prospect)
├── property/            # Property models (Property, Media, Compare, Favorite, etc.)
│   └── models/          # Split models (default.py, media.py, feature.py, etc.)
├── building/            # Building models and management
├── schedule/            # Scheduling/booking functionality
├── blog/                # Blog posts
├── advertise/           # Advertisement management
├── core/                # Shared utilities, Contact, AdminSettings
│   ├── admin.py         # Custom admin site (CustomAdminSite)
│   └── views/           # Common views (dashboard, home, SEO)
├── ipdata/              # IP data tracking
└── utils/               # Shared utilities and custom middleware
```

### Key Architectural Patterns

**Multi-profile user system**: Users have a `user_type` field (prospect, developer, agent) with corresponding profile models (ProspectProfile, DeveloperProfile, AgentProfile). All profiles link to a single User model via OneToOne relationships.

**Custom admin**: Uses `core.admin.custom_admin_site` instead of default Django admin. Always register models with `custom_admin_site`:
```python
from core.admin import custom_admin_site
custom_admin_site.register(ModelName)
```

**Model organization**: Complex apps split models into modules (e.g., `property/models/` contains default.py, media.py, feature.py). Models are re-exported via `__init__.py`.

**Custom middleware**: `utils.custom.middlewares.CustomMiddleware` handles email verification and profile completion checks for authenticated users.

**Database collation**: Uses PostgreSQL's `case_insensitive` collation for certain fields (like User email). Initial migrations must include:
```python
from django.contrib.postgres.operations import CreateCollation
operations = [
    CreateCollation("case_insensitive", provider="icu", locale="und-u-ks-level2", deterministic=False),
    # ... rest of operations
]
```

**Brand colors**: Tailwind config defines brand colors `brand.teal` (#15c1b9) and `brand.purple` (#7f1377). Use semantic aliases `featured` (purple) and `discounted` (teal).

## Development Commands

### Setup

Docker (recommended):
```bash
# From project root
docker compose -f src/docker-compose-dev.yml build
docker compose -f src/docker-compose-dev.yml run --rm web python manage.py migrate
docker compose -f src/docker-compose-dev.yml up
```

Local:
```bash
cd src
poetry install
# Create .env from demo.env
poetry run python manage.py migrate
poetry run python manage.py runserver
```

Frontend (Tailwind) - run from **project root**:
```bash
npm ci
npm run tailwind:watch    # Development
npm run tailwind:build    # Production build
```

### Testing

Backend (pytest):
```bash
# From project root
npm run test:backend              # Run all tests
npm run test:backend:coverage     # With coverage
cd src && poetry run pytest path/to/test_file.py::test_function  # Single test
```

For PostgreSQL tests (required for models with `db_collation`):
```bash
# Start DB first
docker compose -f src/docker-compose-dev.yml up -d db
# Set env vars
export WIZER_USE_POSTGRES_TESTS=1 POSTGRES_HOST=localhost POSTGRES_PORT=5492
cd src && poetry run pytest --cov
```

Frontend (Vitest):
```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
npm run test:ui           # UI mode
```

Both:
```bash
npm run test:all          # Backend + frontend
```

Test markers (pytest):
```bash
cd src
poetry run pytest -m unit           # Unit tests only
poetry run pytest -m integration    # Integration tests only
poetry run pytest -m "not slow"     # Skip slow tests
```

### Type Checking

```bash
npm run type-check       # TypeScript (frontend)
npm run type-check:py    # mypy (backend)
```

### Code Quality

```bash
npm run lint:css         # Prettier check for CSS
npm run format:css       # Prettier format CSS
```

### Dependencies

Python (from `src/`):
```bash
cd src
poetry add <package>@<version>
```

JavaScript (from project root):
```bash
npm install <package>
```

## Testing Patterns

**Backend**: Uses pytest with pytest-django, factory-boy for fixtures. Shared fixtures in `src/conftest.py` (user, developer_user, agent_user, prospect_user, api_client, authenticated_client variants). App-specific factories in `{app}/tests/factories.py`.

**Frontend**: Vitest with jsdom, testing-library/dom. Setup in `src/wizerproperties/static/js/__tests__/setup.ts`. Tests alongside source or in `__tests__/`.

**Coverage targets**: Backend `fail_under=85` in `src/.coveragerc` (goal 85%); frontend Vitest thresholds 85% (lines, functions, branches, statements) in `vitest.config.ts`.

**Test settings**: `wizerproperties.settings.test` - uses PostgreSQL when `WIZER_USE_POSTGRES_TESTS=1`, otherwise SQLite in-memory (may fail on `db_collation` fields). Overrides `SOCIALACCOUNT_PROVIDERS` with a dummy Google APP for `/accounts/google/login/` and adapter tests. New tests: `core/tests/test_templatetags_seo.py`, `core/tests/test_views_seo.py` (robots_txt without DB), and `test_google_oauth2_integration_adapter_instantiation` in `core/tests/test_views_auth.py`.

## Database Notes

- **Development/Test**: PostgreSQL 15 (Docker exposes on `localhost:5492`)
- **Collation**: SQLite doesn't support the `case_insensitive` collation used by User.email. Tests patch this in `conftest.py` for SQLite, but prefer PostgreSQL for comprehensive testing.
- **Migrations**: When using SQLite tests, migrations are disabled for speed. PostgreSQL tests run migrations normally to ensure collations are created.
- **Collation troubleshooting**: For `has no actual collation version, but a version was recorded`, run `ALTER DATABASE <db> REFRESH COLLATION VERSION` (see root README). For `case_insensitive has version mismatch`, run `ALTER COLLATION public.case_insensitive REFRESH VERSION` in the affected database.

## Environment Variables

Create `src/.env` from `src/demo.env`. Key vars:
- `SECRET_KEY`, `DEBUG`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `OPENAI_API_KEY` (optional, for OpenAI integration)
- `ORIGIN` (for `CSRF_TRUSTED_ORIGINS`)
- `WIZER_USE_POSTGRES_TESTS=1` (for pytest with PostgreSQL)

## CI/CD

`.github/workflows/ci.yml` runs on push/PR to main:
- Backend: pytest with PostgreSQL 15
- Frontend: Vitest with Node 20

## Key URLs/Endpoints

- Admin: `/admin/` (custom admin site)
- User: `/user/*` (auth, profiles)
- Property: `/property/*`
- Building: `/building/*`
- Blog: `/blogs/*`
- Schedule: `/schedule/*`
- Core: `/core/*` (contact, etc.)
- Advertise: `/advertise/*`, `/reels/`
- SEO: `/robots.txt`, `/sitemap.xml`

## Integrations

- **django-allauth**: Google OAuth2 login. `CustomAccountAdapter` (`user.adapters`) extends `DefaultSocialAccountAdapter` and accepts `request` in `__init__`. Test settings override `SOCIALACCOUNT_PROVIDERS` with a dummy Google APP for `/accounts/google/login/` and adapter tests.
- **OpenAI**: Set `OPENAI_API_KEY` in `.env`
- **Zoho CRM**: Configure in admin (requires active subscription)
- **CKEditor 5**: Rich text editing at `/ckeditor5/`

## Static Files & Media

- Static source: `src/wizerproperties/static/src/`
- Compiled CSS: `src/wizerproperties/static/css/tailwind.css`
- Media: `src/wizerproperties/media/`
- Production: Run `collectstatic` after Tailwind build

## Common Gotchas

1. **Tailwind commands run from project root**, not `src/`
2. **Custom admin** - always use `custom_admin_site`, not `admin.site`
3. **PostgreSQL collation** - add `CreateCollation` before first `CreateModel` in initial migrations
4. **Test DB** - use PostgreSQL for full test compatibility; SQLite has workarounds but may fail on collations
5. **Docker volumes** - `docker-compose-dev.yml` mounts `..` (project root) for assets service to access npm
6. **Model imports** - import from app level (e.g., `from user.models import User`), not from submodules
7. **Production nginx/certbot** - copy `docs/nginx-default.conf.example` to `src/nginx/conf/default.conf`; create `src/certbot/www` and `src/certbot/conf`. Certbot has `depends_on: nginx` in `docker-compose.yml`.
8. **Pytest log noise** - `duplicate key ... ipdata_ipdata_ip_key` with `(ip)=(192.168.255.254)` during pytest is expected from `ipdata.tests.test_models::test_ipdata_ip_unique`.
9. **Stale CSRF token after login (Home Helper AI chat, or any authenticated POST)** - allauth rotates the CSRF token on login. A browser tab open before login (with a token baked into its HTML) will submit that old token and get 403 CSRF Failed: ... incorrect on POST, even though the user is now authenticated. Anonymous requests are unaffected (no CSRF-authenticated session to enforce against). Fix for the user: reload the page after logging in. Not currently patched in code - accepted as a known edge case (July 2026).
10. **New Tailwind classes not rendering** - Tailwind only includes classes it finds at build time. Adding a new utility class (e.g. `font-display`, `text-[#C9A84C]`, arbitrary values) to a template will have no effect until the CSS is rebuilt. Run `npm run tailwind:build` (or `npm run tailwind:watch` during development) from the project root. In Docker, this runs via the `assets` service. Prefer inline `style=""` attributes for one-off values that would otherwise require a rebuild.
