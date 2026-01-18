# Audits & Design

Consolidated from: codebase-audit-findings, home-page-audit, ui-ux-redesign-audit, ui-ux-redesign-status.

---

## 1. Codebase audit

**Status:** Critical & high-priority items fixed. Remaining technical debt in this doc.

### Priority summary

- **Critical:** Indentation in `admin_settings.py` (fixed).
- **High:** Save search (implemented), bare `except:` (fixed), `print()` → logging (fixed).
- **Medium:** Empty `except: pass`, commented code, incomplete functions, missing returns, error-handling gaps, dashboard context (various fixed).
- **Low:** Legacy cleanup, type hints, docstrings.

### Module status

- **Advertise, Blog, Building:** Complete.
- **Core, Property, Schedule, User, Utils:** Needs-review items documented; most high-impact fixes done.

### User flows (audit)

- **Prospect:** Signup → verify → profile → dashboard; Search → details → compare/favorite → schedule. Save search and CRM sync in place.
- **Developer:** Signup → verify → profile → dashboard; Create building → property → manage; Discount/featured promotions.
- **Auth:** Email verify, password reset, profile completion. Middleware and permissions working.

### Files often touched

- `utils/admin_settings.py`, `user/views/auth/*`, `schedule/api/serializers.py`, `core/api/views.py`, `property/api/views/default.py`, `user/views/auth/profile/complete_profile.py`, `property/api/serializers/create_n_update.py`, `property/views/discount_featured.py`, `core/views/dashboard.py`, `user/models/auth/user.py`.

---

## 2. Home page audit

**Scope:** Buyer `home.html`, Developer `home_developer.html`. **Overall: 6.5/10.**

### Strengths

- Clear value props, PASTOR-style structure, working search, responsive layout.

### Critical

1. **Design system** — Replace hardcoded colors with tokens (`text-brand-purple`, `text-accent`, `bg-accent`, `bg-accent/10`, `text-foreground`, `text-muted-foreground`, `bg-muted`). Badges, buttons, icons. Effort: 2–3h.
2. **Placeholder images** — Buyer: Bangkok area cards and Chiang Mai use `bangkok.jpg`; use unique images per area. Effort: 1–2h.
3. **H1** — Reduce `lg:text-5xl` to `lg:text-4xl`. Effort: ~5min.

### High

4. **Buyer: Problem statement** — Add Problem section before Trust Band (PASTOR). Effort: 1–2h.
5. **Accessibility** — Audit (e.g. WAVE, axe); contrast, focus, screen reader. Effort: 2–3h.

### Scores (summary)

- **Design system:** 3/10 → fix with tokens.
- **Typography:** 4/10 → H1 and body sizes.
- **Content:** 7/10. **Visual:** 5/10 (images). **UX:** 7/10. **Technical:** 8/10. **Conversion:** 6/10. **Accessibility:** 6/10. **Mobile:** 7/10. **SEO:** 8/10.

### Buyer vs Developer

- **Buyer 6/10:** Good content and search; design tokens, problem section, and images need work.
- **Developer 7.5/10:** Strong conversion, pricing, CTAs; mainly design token fixes.

---

## 3. UI/UX redesign — master audit (high level)

**Purpose:** What to touch for Tailwind + shadcn migration. UI = look/feel; UX = structure, flow, accessibility.

### Global foundations

- **base.html:** Tailwind layout, design tokens, nav, modals, comparison badge, Zoho chat position. Done.
- **googletranslate/translate.html:** Tailwind, a11y. Done.
- **Static CSS:** `style.css`, `auth.css`, `header.css`, `search-with-map.css`. Tailwind base in place; legacy deprecation deferred. `gptchat.css` removed. Comparison/featured/spotlight and chat positioning done.
- **JS:** `header.js`, `auth/*.js`, `g_map.js` updated (ARIA, fetch, validation, Map renaming). `main.js` still legacy.
- **Tailwind:** `tailwind.config.js`, `tailwind.css`, brand tokens (`brand.teal`, `brand.purple`, `accent`, `featured`, `discounted`), utilities. New palette and typography (Alegreya Sans, David Libre) in use.

### Modules (summary)

- **Building:** create, update, get (incl. detail-page JS). Done.
- **Property:** create, update, get, list, comparison, favorite, search, search-with-map, discount/featured, card-factory, filter-init, compair-favorite, detail-page, compare-manager, comparison view. Done. `search` view: list default; `/property/search-with-map/` for map; list-only mode removed; CSS scoped for map page.
- **Advertise:** Analytics, performance, reels. Done.
- **User:** Auth (signup, login, verify, forgot, update-password, complete_profile, profile_settings), emails. Redesign and a11y done. Open redirect in `is_safe_url` fixed.
- **Blog:** list, details. Done.
- **Schedule:** create_schedule, email templates. Done.
- **Core:** home, home_developer, developers_pricing, contact, about, privacy, 404, Home Helper AI (chat, OpenRouter, property search). Admin, `home.js`. Done. Design token and H1 fixes applied; homepages consolidated; search improvements.
- **Media/pipeline:** Docker entrypoint (migrate, static), Dockerfile. Done. Image audit deferred.
- **SEO & analytics:** Meta, JSON-LD (Organization, Product, Place, Article, Breadcrumb), sitemap, robots, GA4/Meta/PostHog, `analytics.js`, `seo.py`, `seo_tags`, breadcrumbs. Done.
- **CRM:** Zoho lead/contact/deal sync, SalesIQ, PostHog. Done. Ad engine: home, building, property; `status='running'` fix. Done.

### Deferred (v1.1+)

- Legacy CSS and `main.js` migration; image audit; Splide helper; extra componentization; design-decision log; full a11y checklist; hreflang, LocalBusiness, VideoObject schema.

---

## 4. UI/UX redesign — status (v1.0)

**Branch:** `ux-fix`. **Status:** v1.0 complete.

### Highlights

- Type safety: JS type errors greatly reduced; `globals.d.ts`. Mypy clean for audited Python.
- Tailwind across 50+ templates; auth and marketing pages redesigned; new design system (colors, Alegreya Sans, David Libre).
- Context-aware auth and marketing (`?from=developer`, `?from=buyer`).
- ARIA and WCAG improvements; modern JS (fetch, ES6+, modular).
- Shared components (property card, filter panel); compare-manager; comparison page rebuilt.
- SEO (meta, 5 schema types, sitemap, robots); analytics (GA4, Meta, PostHog); CRM (Zoho, SalesIQ, real estate fields).
- Docker: entrypoint (migrate, static); Google Maps API key from env; AdminSettings and AI chat fixes; saved search; codebase audit fixes (indentation, bare except, print, imports, duplicates, migration deps).

### Section checklist (abridged)

- **1. Global:** base, translate, static CSS/JS, Tailwind — mostly done; `main.js` pending.
- **2. Shared / core templates:** developer/prospect dashboards, `no_auth`, dashboard JS. Done. `dashboard.py` context review deferred.
- **3. Building:** create, update, get, detail-page JS. Done.
- **4. Property:** create, update, get, list, comparison, favorite, search, search-with-map, discount/featured, card, filter-panel, compair-favorite, filter-init, detail-page, compare-manager, comparison, `property.py` view. Done.
- **5. Advertise:** templates. Done.
- **6. User:** auth, profile, emails. Done.
- **7. Blog:** list, details. Done.
- **8. Schedule:** create, emails. Done.
- **9. Core:** home, home_developer, developers_pricing, contact, about, privacy, 404, chat, `home.js`, admin. Done.
- **10. Media/pipeline:** build, Docker. Done. Image audit deferred.
- **11. Componentization:** card, filter-panel. In progress.
- **12. SEO & analytics:** meta, sitemap, robots, analytics, utilities, breadcrumbs, CRM. Done.
- **13–15. Docs, libraries, next steps:** partial; design-decision log and full a11y checklist deferred.

### v1.0 stats (summary)

- 50+ templates migrated/redesigned; 20+ JS files updated; 2 shared components + compare-manager + comparison rebuild.
- Security/code: Open redirect, Map shadowing, Google Maps key, AdminSettings, validation, filter logic, retry limits, logging.
- Design system compliance: homepage tokens, H1, badge/button/icon; homepage consolidation; search routing and CSS scoping.

---

## 5. Design system quick reference

### Tokens

- **Badges:** `bg-accent/10 text-brand-purple`, `uppercase tracking-[0.3em]`.
- **Primary CTA:** `bg-accent text-foreground`, hover `bg-accent/90`.
- **Icons/accents:** `text-accent`. Featured: `border-featured`, `text-brand-purple`. Discount: `border-discounted`, `text-brand-teal`.
- **Body:** `text-base text-foreground`; secondary `text-sm text-muted-foreground`.

### Typography

- H1: `text-3xl sm:text-4xl`. H2: `text-3xl sm:text-4xl`. H3: `text-lg`–`text-xl`. Weights: body 400, emphasis 500, headings 600, price 700.

### Brand (current)

- Background `#f2f3f4`; accent light `#b8e9e0`; primary accent `#00deb6`; muted `#53535fcc`; primary blue `#114f8d`; dark `#262637`; darkest `#000433`. Fonts: Alegreya Sans, David Libre.
