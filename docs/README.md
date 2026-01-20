# Wizer Properties — Documentation

Index of project documentation.

---

## Operations & deployment

- **Docker:** See root [README.md](../README.md#quick-start-docker) for `docker-compose` and `docker-compose-dev`.
- **PostgreSQL:** Default dev/test uses PostgreSQL 15; `localhost:5492` when running DB in Docker.
- **SSL / nginx / certbot:** Copy `docs/nginx-default.conf.example` to `src/nginx/conf/default.conf`; ensure `src/certbot/www/` and `src/certbot/conf/` exist. [operations-and-qa.md](operations-and-qa.md#2-deployment--ssl) — Certbot commands, renew, and nginx details.
- **Static/media:** `collectstatic` and volume mounts for `static_root` and `media` are in `docker-compose.yml`.

---

## Testing & QA

- **Backend:** pytest in `src/`. Use `WIZER_USE_POSTGRES_TESTS=1` and a running Postgres for full runs. Coverage: `pytest --cov` → `htmlcov/`, `coverage.xml`; `fail_under=85` in `src/.coveragerc`. Target 85%. Test settings override `SOCIALACCOUNT_PROVIDERS` with a dummy Google APP for `/accounts/google/login/` and adapter tests. New tests: `core/tests/test_templatetags_seo.py` (seo_tags), `core/tests/test_views_seo.py` (robots_txt, no DB), and `test_google_oauth2_integration_adapter_instantiation` in `core/tests/test_views_auth.py`. Known log noise (e.g. ipdata duplicate key) is in the root README.
- **Frontend:** Vitest in `src/wizerproperties/static/js/__tests__/`. Run via `npm run test` or `npm run test:coverage`. Coverage in `vitest.config.ts`: `include` for app JS, thresholds 85% (lines, functions, branches, statements).
- **CI:** `.github/workflows/ci.yml` runs backend and frontend tests on push/PR.
- **Acceptance tests & checklist:** [operations-and-qa.md](operations-and-qa.md#3-acceptance-test-checklist-structure).

---

## Product & marketing

- [product-and-marketing.md](product-and-marketing.md) — Positioning, personas, landing, go-to-market, marketing tasks.

---

## Codebase & design

- [audits-and-design.md](audits-and-design.md) — Codebase audit, home page audit, UI/UX redesign status.
- [operations-and-qa.md](operations-and-qa.md) — Meeting notes, deployment, SSL, acceptance checklist.
- [Wizer Properties WIP Task Tracker - 0812-UAT.csv](Wizer%20Properties%20WIP%20Task%20Tracker%20-%200812-UAT.csv) — UAT task tracker (optional).
