# Product & Marketing

Consolidated from: positioning-memo, customer-segment-persona-brief, landingpage, landing-page-sitemap-structure, marketing-task-list, property-listing.

---

## 1. Positioning & strategy

### Overview

Wizer Properties is a developer-centric property comparison platform for Thailand and Malaysia. It helps developers sell unsold inventory via 3D walkthroughs, comparison tools, and a subscription model that replaces expensive launch events (150k+ MYR).

### Market

- **Geography:** Thailand (Bangkok, Phuket, Pattaya), Malaysia (KL, Penang)
- **Focus:** Primary market (new developments), not secondary/resale
- **Gap:** No other platform focuses on primary market with immersive comparison

### Value propositions

**Developers:** *Sell unsold inventory at a fraction of traditional launch costs with better prospect targeting.*

- Cost efficiency (subscription vs 150k+ MYR events)
- Reach international buyers through our platform
- 3D Matterport walkthroughs
- Side-by-side comparison, credit-based promotions, direct control

**Prospects:** *Compare luxury properties side-by-side with immersive 3D tours before visiting.*

- 360° walkthroughs, comparison across 25+ attributes, transparent pricing, time savings

### Differentiation

1. Primary market only (developer-first, not agent-first)
2. Immersive tech (Matterport, drone, phone-based 3D for agents)
3. Comparison-first design (built-in tool, not just listings)
4. Subscription + credits (no commission)
5. Cost-effective vs traditional launches

### Positioning statement

*For* real estate developers in Thailand and Malaysia *who* need to sell unsold inventory efficiently, **Wizer Properties** is the only property comparison platform *that* combines immersive 3D walkthroughs, intelligent comparison tools, and a subscription model. *Unlike* traditional portals focused on secondary markets and agent listings, *our platform* helps developers reach qualified buyers at a fraction of launch costs and gives prospects an immersive, comparison-first discovery experience.

### Go-to-market

- **Phase 1 (Months 1–3):** Mid to large developers, 10+ units; direct outreach; free trial until first sale.
- **Phase 2 (Months 2–4):** Prospect database via SEO, content, partnerships.
- **Phase 3 (Months 4–6):** Agents with phone-based 3D; same subscription + credit model.

---

## 2. Customer segments & personas

### Segment 1: Developers (primary)

- **Mid-market (e.g. Somchai Tan):** Sales & Marketing Director, 50–200 staff, 3–5 projects. Goals: move inventory, cut launch costs, reach qualified buyers. Pain: 150k+ MYR launches, cluttered portals, hard to showcase quality. Messaging: replace 150k MYR launches, reach qualified buyers, 3D tours, pay only for promotions.
- **Luxury (e.g. David Chen):** Managing Director, 20–50 staff, 1–2 projects. Goals: luxury brand, HNW buyers, international. Messaging: immersive 3D, international reach, premium presentation.

### Segment 2: Agents (secondary, future)

- **Independent (e.g. Sarah Lim):** 5–10 years, residential. Pain: Matterport cost, portal fees. Messaging: phone-based 3D, lower listing costs, pay only for promotions.

### Segment 3: Prospects (acquisition, not direct customers)

- **Foreign investor (e.g. Mikhail Petrov):** 35–45, 5–20M THB. Needs: 3D tours, comparison, transparent pricing, can’t visit easily.
- **Local HNW (e.g. Tan Wei Ming):** 40–50, 2–5M MYR. Needs: comparison, specs, pricing, efficiency.

### Phase priorities

- **Months 1–3:** Developers only (Somchai, David).
- **Months 4–6:** Add agents (Sarah).
- **Ongoing:** Prospect acquisition via SEO, content, referrals (Mikhail, Tan Wei Ming).

---

## 3. Landing pages & sitemap

### Pre-launch messaging guidelines

**Important:** All landing pages use pre-launch appropriate messaging:
- No false user/property counts (e.g., "10,000+ buyers", "1,200+ agents")
- No claims about existing partnerships unless confirmed
- Use forward-looking language: "Built for", "Join", "We're building"
- Replace "Trusted by" with "Join" or "Built for"
- Partner CTAs invite developers to join rather than claiming existing partnerships
- All metrics removed or replaced with aspirational language

### Pages

| Page | Audience | Goal | File |
|------|----------|------|------|
| Buyer homepage | Buyers, investors | Search & discovery | `core/templates/home.html` |
| Developer homepage | Developers, agents | Signup & leads | `core/templates/home_developer.html` |

**Buyer:** 14 sections — Hero (search), Sponsored ads, Problem, Trust band, Bangkok areas, Spotlight, Personalized, Comparison, Partner with us CTA, Account CTA, Resources, Other destinations, Blog, Developer CTA.

**Developer:** 10 sections — Hero, Sponsored ads, Problem, Solution, Partner with us CTA, How it works, Comparison, Pricing, FAQ, Final CTA.

### Design tokens (landing)

- `text-brand-purple` (badges, headings) — not `text-[#7F1377]`
- `text-accent`, `bg-accent` (icons, buttons) — not `text-[#00deb6]`, `bg-[#00deb6]`
- `bg-accent/10` (icon backgrounds) — not `bg-[#b8e9e0]/20`
- `text-foreground`, `text-muted-foreground`, `bg-muted` for text/backgrounds

**Typography:** H1 `text-3xl`–`text-4xl` (not `text-5xl`/`text-6xl`); body min 16px (`text-base`), not `text-sm` for body.

### Typography (landing)

- H1: 32–40px desktop, 28–32px mobile.
- H2: 24–32px. H3: 18–24px. Body: 16–18px; labels/badges 12px OK.
- Replace `text-sm` with `text-base` for body; reduce H1 desktop (`lg:text-5xl` or `lg:text-4xl`).

### JS & API (home)

- Buyer: `splide`, `card-factory`, `time-count-down`, `home`, `compair-favorite`, `chatbot-gpt`, `ads`.
- Developer: `splide`, `ads`.
- APIs: `/property/api/search/`, `/property/api/discount/`, `/property/api/recommended/`, `/property/api/popular/`, `/advertise/api/advertisement/suggested/`.

---

## 4. Marketing task list

### Phase 1: Go-to-market

- [ ] Target segments (mid/low, large), phases, timelines, success metrics, value prop per segment, positioning, pricing.
- [ ] Channels (LinkedIn, email, WhatsApp); note: LinkedIn better for Thai devs with Western ties; local Thai less active.
- [ ] Target list: criteria, prioritization (mid/low first), 100–200 developers.

### Phase 2: Materials

- **Pitch deck:** Cover, problem, solution, features, cost comparison (150k+ MYR vs subscription), how it works, benefits, showcase, pricing, testimonials, CTA, contact.
- **Email:** Subject lines, body (problem/solution/CTA), personalization, follow-up sequence (Day 3–5, 7–10, 14), response templates, multi-touch, A/B, segmentation.
- **WhatsApp:** Greeting, value prop, CTA; response templates (interest, objections, FAQ); sequence vs email, timing, tone.
- **One-pager, case study template, FAQ.**

### Phase 3: Contact list

- [ ] 100–200 developers (Thailand: BKK, Phuket, Pattaya; Malaysia: KL, Penang); mid/low first.
- [ ] Fields: company, contact, email, phone, WhatsApp, LinkedIn, website, location, segment, units, notes.
- [ ] Use API or manual research; prioritization and segmentation.

### Phase 4: Integration

- [ ] Review with team; brand consistency; links/CTAs work.
- [ ] CRM prep (Zoho when ready): field mapping, sequences, tracking.
- [ ] Outreach: priority order, open/click tracking, response process, success criteria.

---

## 5. Property listing & search-with-map

### URL

`/property/search/?place=...&latitude=...&longitude=...&fature_type=locality&min_price=...`

### Sections

1. **Sponsored ads** — Top; Splide carousel; `ads.js`; “SPONSORED LISTINGS”.
2. **Filter panel** — Location, quick filters (price, beds), active filters, advanced (radius, price, beds, type, “More” modal: area, bathrooms, quota, furnishing, ownership, status).
3. **Results bar** — Breadcrumb, area name, count, sort (Newest, Highest/Lowest price, Most popular), view toggle, Save search.
4. **Main** — List (left) + Map (right, sticky, 75vh). List: `#search-result-list`, infinite scroll; map: Google Maps, markers (brand purple/red for spotlight), info window (card-style, price, stats, CTA). Empty state, “Reset map view.”
5. **Property card** — Developer header, image hero (Splide, badges, compare/favorite, price, 3D/Aerial, count), stats (beds, baths, area, floor, parking, type), title, location, media, description, features. Hover: lift, shadow, border.
6. **Modals** — Map info popup, 3D model, 3D drone (Video.js).

### Design system (search)

- Brand purple `#7f1377` (buttons, markers, featured); teal `#15c1b9` (icons, accents).
- `bg-muted/40`, `bg-muted/30`; cards white, `rounded-2xl`, `border`, `shadow-*`.
- Text: foreground `#262637`, muted `#53535fcc`.

### Responsive

- Mobile: single column, stacked. Desktop: grid with 480px map sidebar. Breakpoints: mobile, tablet, desktop.
