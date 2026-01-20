# Operations & QA

Consolidated from: MEETING.MD, acceptance-test-checklist. Includes deployment and SSL notes.

---

## 1. Meeting notes (summary)

**Participants:** Avi (client), Hari (marketing/strategy), Vaidtech (developer). **Context:** Platform review and strategy.

### Platform status

- 600-item checklist completed; core flows working; minor non-breaking issues documented.
- Working: property CRUD, developer/agent accounts, AI chatbot, user management.

### Technical issues & fixes

- **Zoho CRM:** Subscription expired. Avi to add credit/debit to Zoho (card not charged at first). Needed for lead/contact/deal sync, role assignment, workflows.
- **Ad engine:** New property-link placement added; migration for DB changes not yet deployed (Vaidtech).
- **Design/copy:** Action-oriented, benefit-focused copy; SEO considered. Hero, carousel, “See all” confirmed. Purple prominence noted; design refinement via voice/video: “I’m on [page], [issue], I want [change].”

### Marketing & strategy

- **Acquisition:** Phase 1 — mid/low developers first (need validation; “I just want eyeballs”); Phase 2 — large developers once there’s traction.
- **Materials:** Pitch deck, email copy/sequences, email flow, WhatsApp content, developer list (100–200). Prepare upfront; don’t develop on the fly. Build list in parallel.
- **Channels:** LinkedIn good for Thai devs with Western ties; local Thai less active on LinkedIn. API available to pull developer contacts.

### Action items

- **Avi:** Zoho card (ASAP); design feedback via voice/video (TBD).
- **Hari:** Go-to-market by Monday; materials after strategy; contact list 100–200, in parallel.
- **Vaidtech:** Deploy ad-engine migration; image replacement.

### Next steps

1. Avi: Zoho card, design feedback.  
2. Hari: Strategy, materials, list.  
3. Vaidtech: Migration, image.  
4. Follow-up to review materials and start outreach.

*(Detailed marketing task breakdown is in [product-and-marketing.md](product-and-marketing.md).)*

---

## 2. Deployment & SSL

### Nginx

1. Create `src/nginx/conf/` (it is gitignored). Copy the example:
   ```sh
   mkdir -p src/nginx/conf
   cp docs/nginx-default.conf.example src/nginx/conf/default.conf
   ```
2. The example includes `location /.well-known/acme-challenge/` (required for Certbot) and a proxy to `web:8000`. Adjust `server_name` and optional HTTPS block as needed.

### Certificates (Certbot in Docker)

Ensure `src/certbot/www/` and `src/certbot/conf/` exist before `docker compose up` (e.g. `mkdir -p src/certbot/www src/certbot/conf`). They are wired in `docker-compose.yml`. Certbot has `depends_on: nginx` so nginx is up before certificate requests.

**New certificate:**

```sh
sudo docker compose -f src/docker-compose.yml run --rm certbot certonly --webroot --webroot-path /var/www/certbot -d wizerproperties.com -d www.wizerproperties.com
```

**Renew:**

```sh
sudo docker compose -f src/docker-compose.yml run --rm certbot renew
```

---

## 3. Acceptance test checklist (structure)

Use this as the QA map. Mark items ☑ Pass, ☐ Fail, or ⚠ Needs attention. Attach evidence for failures.

### 1. Code quality & standards

- **Python:** PEP 8, no syntax/import errors, model validation, Django good practices, no hardcoded secrets, error handling, ORM (no raw SQL), CSRF/XSS, decorators, comments. *Many require code review.*
- **JS:** No console errors, ES6+, error handling, no leaks, modular, fetch, API error handling, loading states, client validation. *Several require code review.*
- **HTML/templates:** Valid HTML5, semantic tags, `base.html` extend, Tailwind (no inline), template tags, alt on images, `href`, CSRF. *Several verified in testing.*
- **CSS:** Tailwind, no legacy Bootstrap, spacing/typography, tokens, breakpoints, no conflicts. *Partially reviewed.*
- **Docs:** README, docstrings, comments, API docs, config docs. *Partially done.*

### 2. Security

- **Auth & authz:** Login/logout, password reset, email verify, profile-completion middleware, OAuth, session/CSRF, protected routes, own-data only, admin protection. *Core flows tested.*
- **Input:** Server-side validation, XSS, SQLi (ORM), file upload, email/phone/URL, CKEditor. *Mix of review and tests.*
- **Data:** No secrets in URLs, hashing, env for keys/DB, media access, privacy. *Partially.*
- **API:** Auth where needed, CORS, rate limit, no sensitive data in responses, status codes. *Needs API tests.*
- **Third-party:** Zoho, Google OAuth, OpenAI, trusted scripts, SalesIQ. *Review and config.*

### 3. Performance

- **Page load:** Home &lt;3s, listing &lt;3s, detail &lt;4s; lazy load, minified JS/CSS, caching. *Tooling (e.g. Lighthouse) needed.*
- **Core Web Vitals:** LCP, FID, CLS, FCP, TTI. *Not measured in checklist.*
- **DB:** `select_related`/`prefetch_related`, no N+1, indexes, pagination, filters. *Review.*
- **API:** &lt;500ms, pagination, lean serialization. *Not measured.*
- **Frontend:** Infinite scroll, image optimization, Splide, non-blocking JS, async/defer. *Partially.*

### 4. Accessibility

- **ARIA:** Labels, `aria-required`, `aria-live`, modals, landmarks, loading. *Partially.*
- **Keyboard:** Focus, tab order, focus visible, Escape, Enter, shortcuts. *Some tested.*
- **Screen reader:** Alt, labels, errors, status, decorative hidden. *Partial.*
- **WCAG 2.1:** Contrast, text resize, flash, errors, validation. *Partial.*
- **Semantic HTML:** Headings, lists, forms, buttons vs links. *Observed.*

### 5. Functional testing by module

- **Core:** Home (hero, search, filters, trust, CTAs), About, Contact (form, validation, submit, Zoho), Privacy, 404. *Most covered.*
- **Auth:** Signup, login, verify, profile completion, profile settings, forgot password, logout. *Flows and redirects tested.*
- **Property:** List, create, update, detail, search, search-with-map, comparison, favorites, discount/featured. *Many paths; detail/comparison need IDs/slugs.*
- **Building:** Create, update, detail. *Create tested; detail/update need IDs.*
- **Schedule:** Create, dashboard management, status, cancel, emails. *Create and flows.*
- **Blog:** List, detail. *List; detail needs slug.*
- **Advertise:** Reels list, create/edit, analytics, performance. *Create and dashboards.*
- **Dashboard:** Developer/agent and prospect stats, tables, toggles, quick actions. *Tested.*
- **Home Helper AI:** Chat, input, send, prompts, history, shortcuts, errors, loading. *Route/feature exists; full E2E optional.*

### 6. API testing

- **Property, Building, User, Schedule, Contact, Advertise, Blog:** List, detail, search, filters, pagination, sort, media, compare, favorite, view-time, analytics, auth. *Intended for Postman/curl; not all run in checklist.*

### 7. Integration

- **Google OAuth, Maps:** Login, callback, user create/update, session; Maps display, autocomplete, markers. *OAuth/Maps present.* An integration test (`test_google_oauth2_integration_adapter_instantiation` in `core/tests/test_views_auth.py`) hits `GET /accounts/google/login/` with the real `CustomAccountAdapter` and asserts 302 to Google when test settings provide a dummy `SOCIALACCOUNT_PROVIDERS`.
- **Zoho CRM, SalesIQ:** Sync, leads/contacts/deals, duplicate handling, token refresh; widget load, chat. *Config and sync logic; full E2E with Zoho needed separately.*
- **Analytics:** GA4, Meta, PostHog, identification, ecommerce. *Config; events need verification.*
- **OpenAI:** Descriptions, chat, errors, key in env. *Feature in use; key from env.*
- **Email:** Verify, reset, schedule, contact, templates, links. *Templates and flows; delivery needs env.*
- **File storage:** Images, video, validation, URLs, delete, limits. *Upload UI; backend checks.*

### 8. Browser & 9. Mobile

- **Browsers:** Chrome, Firefox, Safari, Edge (last 2); mobile Chrome, Safari, Samsung. *One environment used in checklist; cross-browser/mobile recommended.*
- **Features:** Grid, Flexbox, ES6, Fetch. *OK in tested env.*
- **Breakpoints:** Mobile &lt;640, tablet 640–1024, desktop &gt;1024. *Desktop/large verified; mobile/tablet to be verified.*
- **Touch, swipe, menu, forms, buttons, text:** *To be tested on devices.*

### 10. SEO & analytics

- **Meta:** Title, description, keywords, OG, Twitter, canonical, robots. *Partially.*
- **JSON-LD:** Organization, Product, Place, Article, Breadcrumb. *Implemented.*
- **Infra:** sitemap, robots. *Routes and generation.*
- **Analytics:** GA4, Meta, PostHog, page and custom events, ecommerce, user id. *Implementation in place; events to be confirmed.*

### 11. CRM

- **SalesIQ:** Load, chat, no blocking. *Widget in use.*
- **Zoho sync:** Contact form→lead, schedule→contact/deal, fields, duplicates, errors, token. *Code and config; full run depends on Zoho.*

### 12. User flows & E2E

- **Prospect:** Signup→verify→profile→dashboard; search→filters→details→favorite/compare→schedule; browse→compare→schedule→contact. *Core path exercised.*
- **Developer/agent:** Signup→profile→dashboard; building→property→media→pricing→publish; discount/featured→analytics→credits; schedules→accept/decline→analytics. *Main flows.*
- **Cross-module:** Property→schedule→CRM; Contact→CRM→analytics. *Described; needs integrated run.*

### 13. Error handling & edge cases

- **Forms:** Required, email/phone, file size/type, length. *Partially.*
- **API:** 404/500, no stack in 500, network, timeout, validation messages. *Needs dedicated API tests.*
- **Edge:** Empty states, no results, pagination, double submit, session expiry, back/forward. *Some.*
- **Data:** Orphans, cascade, FKs, uniques, model validation. *Review.*

### 14. Documentation & 15. Performance benchmarks

- **Docs:** README, setup, env, API, deploy. *README and ops; API to be formalized.*
- **Users:** Guides, FAQ, help, tooltips. *As implemented.*
- **Code:** Comments, docstrings, logic, architecture. *In progress.*
- **Targets:** Page load (e.g. home &lt;3s, search &lt;3s, detail &lt;4s, dashboard &lt;2s); API (list &lt;500ms, detail &lt;300ms, search &lt;1s, upload &lt;5s); DB (no &gt;1s, no N+1, indexes, &lt;50 queries/page). *To be measured.*

---

## 4. Automated test suite

- **Backend:** `npm run test:backend` or `cd src && poetry run pytest --cov`. Coverage in `src/.coveragerc` (`fail_under=85`). Reports: `src/htmlcov/`, `src/coverage.xml`. Test settings provide a dummy Google APP (`SOCIALACCOUNT_PROVIDERS`) so the `/accounts/google/login/` integration test and `CustomAccountAdapter` run. Tests include: `core/tests/test_templatetags_seo.py` (seo_tags), `core/tests/test_views_seo.py` (robots_txt without DB), and `test_google_oauth2_integration_adapter_instantiation` in `core/tests/test_views_auth.py`.
- **Frontend:** `npm run test` (Vitest) or `npm run test:coverage`. Config in `vitest.config.ts`; coverage includes `src/wizerproperties/static/js/` (excl. `__tests__`, `libraries`); thresholds 85%.
- **Both:** `npm run test:all`. CI: `.github/workflows/ci.yml`.

---

## 5. Test execution (acceptance / manual)

### Pre

- [ ] Env set up, data prepared, accounts (all roles), browsers/devices, plan reviewed.

### During

- [ ] Execute systematically, log issues with detail, screenshots/videos for bugs, console and network checked.

### Post

- [ ] Results documented, bugs filed, priorities set, summary and sign-off.

### Sign-off

**Tester:** _________________ **Date:** _________________ **Status:** ☐ Pass ☐ Fail ☐ Conditional **Notes:** _________________

**Client:** _________________ **Date:** _________________ **Signature:** _________________

---

## 6. Test accounts (from testing report)

- **Admin:** admin@example.com  
- **Developer:** satnam182@gmail.com  
- *(Use strong, non-default passwords and rotate for production.)*

---

## 7. Page list (abridged)

**Public:** /, /about-us/, /privacy/, /contact/, /developers/, /developers/pricing/, /reels/, /404/  
**Auth:** /user/login|signup|complete-profile|profile-settings|password/reset|verify-link|…  
**Property:** /property/search/, /property/search-with-map/, /property/details/<id>/, /property/create|update|comparison|favorite-list|discount|featured|…  
**Building:** /building/create|details|update/  
**Schedule:** /schedule/create_schedule/  
**Blog:** /blogs/, /blogs/<slug>/  
**Advertise:** /advertise/create-reels|edit-reels|analytics|performance/  
**Dashboard:** /dashboard/ **Admin:** /admin/ **SEO:** /robots.txt, /sitemap.xml  

*(Full page list was merged from `all_pages_list.md`; detailed coverage is in the testing report and UAT tracker.)*
