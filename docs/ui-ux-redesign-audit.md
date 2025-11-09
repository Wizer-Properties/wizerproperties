# UI/UX Redesign Master Audit

This audit lists every template and supporting asset that should be touched during the redesign, why each change is needed, and whether the driver is primarily **UI** (visual styling, component look-and-feel) or **UX** (structure, flow, usability, accessibility). Use it as the working master document while planning and executing the Tailwind + shadcn migration. No visual work has been implemented yet.

## How to Use This Document
- Work top to bottom; global foundations unlock downstream template refactors.
- For each file, address the **UI** items (look & consistency) in parallel with the **UX** items (workflow, information architecture).
- When both bullets appear, the task spans both domains.
- Keep the audit updated as new findings surface.

---

## 1. Global Foundations

### `src/wizerproperties/templates/base.html`
- ✅ **UI**: Rebuilt layout using Tailwind (sticky header, responsive nav, card-based footer), introduced design tokens, and removed legacy Bootstrap styling.
- ✅ **UX**: Simplified navigation hierarchy, improved mobile interactions, added accessible modals, and standardized CTA placement.

### `src/wizerproperties/templates/googletranslate/translate.html`
- ✅ **UI**: Restyled dropdown to Tailwind components with consistent spacing/iconography.
- ✅ **UX**: Added accessible toggle, clearer language labels, and click-outside handling.

### Static Stylesheets
- `src/wizerproperties/static/css/style.css`
- `src/wizerproperties/static/css/auth.css`
- `src/wizerproperties/static/css/header.css`
- `src/wizerproperties/static/css/gptchat.css`
- ◻️ **UI**: Pending full deprecation; Tailwind foundation (`tailwind.config.js`, `tailwind.css`) created.
- ◻️ **UX**: Legacy CSS still in place for unaffected templates; remove in subsequent phases.

### Global JavaScript
- `src/wizerproperties/static/js/main.js`
- `src/wizerproperties/static/js/header.js`
- `src/wizerproperties/static/js/auth/login.js`
- `src/wizerproperties/static/js/auth/signup.js`
- `src/wizerproperties/static/js/auth/forgot_password.js`
- `src/wizerproperties/static/js/auth/update_password.js`
- `src/wizerproperties/static/js/auth/complete_profile.js`
- `src/wizerproperties/static/js/auth/profile_settings.js`
- `src/wizerproperties/static/js/g_map.js`
- ✅ **UX/UI** (`header.js`, `auth/login.js`, `auth/signup.js`, `auth/forgot_password.js`, `auth/update_password.js`, `auth/complete_profile.js`, `auth/profile_settings.js`): Rewritten for new markup, accessible toggles, modern message rendering with Tailwind-styled alerts, comprehensive ARIA attribute management, dynamic error handling, and proper script loading order. Enhanced error display with field-specific validation feedback.
- ✅ **UX** (`g_map.js`): Added HTMLInputElement validation checks to prevent Google Maps autocomplete errors, improved error handling for missing elements.
- ◻️ `main.js`: still pending migration from legacy selectors.

### Third-Party Dependencies
- **UI**: Remove Bootstrap styles/icons; replace with Tailwind + shadcn component library (use Heroicons or Lucide for icons).
- **UX**: Evaluate modal, tooltip, and disclosure behaviors using shadcn/headless-h UI primitives for predictable interaction.

### New Foundation Files to Add
- `tailwind.config.js` (extended theme tokens, shadcn presets)
- `postcss.config.js` / `tailwind.css` entry point
- `docs/design-system.md` (living style guide once tokens defined)
- **UI**: Document color palette, typography, spacing, and component variants.
- **UX**: Define motion guidelines (even if deferred), focus states, density modes, and accessibility heuristics.

---

## 2. Shared Template Includes & Layout Pieces

### `src/core/templates/` (e.g., `core/base_dashboard.html`, `core/includes/*`)
- **UI**: Align dashboards, cards, table headers with the new visual language; unify empty states.
- **UX**: Reassess information hierarchy, reduce cognitive load in dashboard summaries, and ensure responsive readability.

### User Dashboard Templates

#### `src/core/templates/core/developer_or_agent_dashboard.html`
- ✅ **UI**: Complete Tailwind redesign with modern gradient statistics cards, responsive data tables using shadcn-inspired styling, modern toggle switches, badge components, and cohesive spacing/typography. Removed all legacy Bootstrap classes and inline styles.
- ✅ **UX**: Improved information hierarchy with clear section headers, better mobile responsiveness, enhanced table readability with hover states, accessible toggle controls, and streamlined action buttons. Tables now use proper semantic HTML with better screen reader support.

#### `src/core/templates/core/prospect_dashboard.html`
- ✅ **UI**: Complete Tailwind redesign with gradient statistics cards matching design system, modern quick action cards with hover effects, responsive table layout, and consistent spacing throughout.
- ✅ **UX**: Improved quick action affordances with clear visual hierarchy, better mobile layout optimization, enhanced schedule status visibility with color-coded badges, and improved empty state handling.

#### `src/core/views/dashboard.py`
- ◻️ **UX**: Review context data structure for dashboard efficiency; consider adding pagination or lazy loading for large datasets; ensure proper error handling and fallback states.

#### `src/wizerproperties/static/css/dashboard.css`
- ✅ **UI**: Deprecated - all styles migrated to Tailwind utilities. File can be removed after verification.
- ✅ **UX**: Legacy CSS removed; responsive design now handled by Tailwind breakpoints.

#### `src/wizerproperties/static/js/dashboard.js`
- ✅ **UX**: Complete rewrite using modern JavaScript patterns (IIFE, ES6+), improved error handling, updated DataTables initialization for new markup, better separation of concerns, and enhanced user feedback with success/error messages. Maintains jQuery compatibility for DataTables while using modern patterns elsewhere.

### `src/wizerproperties/templates/no_auth.html`
- ✅ **UI**: Converted to Tailwind card layout with brand header/footer; removed Bootstrap dependencies.
- ✅ **UX**: Clarified primary CTA, added structured wrapper for guest views, preserved extendable content area. Added jQuery script loading to ensure proper dependency order for auth pages.

---

## 3. Building Module Templates

### `src/building/templates/create_building.html`
- ✅ **UI**: Converted to Tailwind sections, cards, chip-based checklists, and reorganized media upload tiles.
- ✅ **UX**: Streamlined grouping, added AI modal flow, contextual helper text, and accessible validation.

### `src/building/templates/update_building.html`
- ✅ **UI**: Alignment with create form components, modernized media gallery list, Tailwind styling.
- ✅ **UX**: Inline removal for media, required toggles, consistent error handling.

### `src/building/templates/get_building.html`
- ✅ **UI**: New hero gallery, stat grid, amenity chips, card/aside layout.
- ✅ **UX**: CTA hierarchy, lazy-loaded units, map/media panels, accessible review module.

### `src/wizerproperties/static/js/building/detail-page.js`
- ✅ **UI/UX**: Rebuilt media gallery orchestration, Splide integrations, amenities chips, lazy-loaded units, and review workflow using modern JS modules.

---

## 4. Property Module Templates

### `src/property/templates/create_property.html`
- ✅ **UI**: Rebuilt with Tailwind cards, modern inputs, chip-style checklists, and cohesive CTA footer; removed legacy Bootstrap classes.
- ✅ **UX**: Streamlined data entry, contextual helper copy, tenant availability logic, and AI modal aligned with new interaction patterns.

### `src/wizerproperties/static/js/property/create_property.js`
- ✅ **UI/UX**: Updated DOM bindings, modal controls, tenant toggle behavior, and shared success/error messaging for the redesigned form.

### `src/property/templates/update_property.html`
- ✅ **UI**: Brought update form to parity with the Tailwind components used in create flow (carded sections, modern inputs, tenant chips, media gallery, spinner states).
- ✅ **UX**: Added inline helper copy, chip-based feature toggles, tenant availability controls, refreshed success/error messaging, and accessible media removal interactions.

### `src/property/templates/get_property.html`
- **UI**: Modernize listing detail layout (hero area, key stats, feature chips, gallery slider).
- **UX**: Prioritize high-intent actions (contact, schedule viewing), improve scannability, and surface comparison/favorite controls prominently.

### `src/property/templates/developer-agent-property-list.html`
- **UI**: Replace legacy table styles with responsive data cards or enhanced tables using shadcn table components.
- **UX**: Support filtering, sorting, and batch actions without overwhelming the user; ensure mobile usability.

### `src/property/templates/comparison.html`
- **UI**: Redesign comparison matrix with responsive grid, sticky headers, color-coded highlights.
- **UX**: Improve affordances for adding/removing properties, clarify differences, ensure accessible contrast.

### `src/property/templates/favorite-list.html`
- **UI**: Align card layout with new design tokens.
- **UX**: Provide clear grouping, allow quick actions (schedule, share), and communicate availability changes.

### `src/property/templates/search_property.html` & `search_property_with_map.html`
- **UI**: Rebuild filter panels, result cards, and map overlay using Tailwind; ensure consistent spacing and typography.
- **UX**: Enhance filtering workflow (collapsible sections, chips for active filters), improve map/list synchronization, and introduce sensible defaults.

### `src/property/templates/property/create_discount_featured.html`, `edit_discount_featured.html`, `discount_featured_list.html`, `delete_discount_featured.html`
- **UI**: Use shadcn dialogs, form components, and alert styles instead of Bootstrap modals.
- **UX**: Clarify discount logic, show preview of impact, reinforce confirmation before destructive actions.

### `src/property/templates/review-box.html`
- 🌟 **UI/UX (new)**: Now restyled within `get_building.html` context with card-based layout; global template pending.

### `src/property/templates/search-filter-box.html`
- **UI**: Convert to reusable filter components with Tailwind utilities.
- **UX**: Improve discoverability of advanced filters, manage vertical space on mobile, and make reset/apply actions clear.

---

## 5. Advertise Module Templates

### `src/advertise/templates/advertise-analytics.html`
- ✅ **UI**: Refreshed analytics layout with Tailwind cards, filter chips, responsive chart canvas, and modal panels styled with the new design tokens.
- ✅ **UX**: Streamlined timeframe/pagination controls, improved modal access, added loaders/skeletons, and clarified insight descriptions for quicker comprehension.

### `src/advertise/templates/advertise-performance.html`
- ✅ **UI**: Modernised campaign list table with responsive card container, summary metric tiles, and updated analytics modal visuals (legacy template remnants removed 2025-11-09).
- ✅ **UX**: Simplified data scans with improved search/filter inputs, actionable CTA styling, and clear feedback while analytics load.

### `src/advertise/templates/create-edit-reels.html`
- ✅ **UI**: Rebuilt reel form using Tailwind cards, consistent inputs, and streamlined action bar (duplicate block cleanup completed 2025-11-09).
- ✅ **UX**: Added contextual helper text, improved validation feedback, disabled states, and success messaging aligned with other modules.

### `src/advertise/templates/reels.html`
- ✅ **UI**: Introduced gradient hero, Tailwind-styled filter chips, and modern reel cards within Splide slider (legacy template remnants removed 2025-11-09).
- ✅ **UX**: Enhanced filtering interactions, added empty states, and clarified platform/manager attribution to support user decisions.

---

## 6. User Module Templates

### Authentication Flow (`src/user/templates/auth/*.html`)
- ✅ **UI**: Fully migrated to Tailwind design system with consistent grid layout (`lg:grid-cols-[1.05fr_1fr]`), hero sidebars, and modern form inputs across login, signup, forgot/reset, and verification templates. All templates now use unified styling, error/success message rendering, and responsive design patterns.
- ✅ **UX**: Comprehensive ARIA accessibility implementation across all auth forms:
  - Form-level: `aria-label`, `novalidate`, `aria-live="polite"`, `aria-atomic="true"`
  - Input fields: `aria-required`, `aria-describedby`, `aria-invalid` (dynamically managed), `aria-readonly`, `autocomplete` attributes
  - Buttons: `aria-label`, `aria-busy` (dynamically updated), proper disabled states
  - Messages: `role="alert"`/`role="status"`, `aria-live`, `aria-hidden` on decorative icons
  - Error containers: Hidden error divs with `sr-only` class, dynamically shown with proper ARIA roles
  - Enhanced error handling: Field-specific error display, automatic scrolling to errors, comprehensive error format handling
  - SEA country codes: Added phone number country selector with 13 SEA countries (Thailand, Malaysia, Singapore, Hong Kong, China, Taiwan, Vietnam, Indonesia, Philippines, Myanmar, Cambodia, Laos, Brunei)
  - Auto-strip country codes: Prevents duplicate country codes in phone input
  - Helper text: Password requirements, field descriptions, and contextual guidance
  - Modern JavaScript handles form submissions with consistent loading states, dynamic ARIA updates, and comprehensive error handling.

### Profile Completion & Settings (`src/user/templates/auth/profile/*.html`)
- ✅ **UI**: Complete Tailwind redesign with two-column grid layout matching auth forms, modern form inputs, consistent spacing, and hero sidebars. SEA country codes added to phone selectors.
- ✅ **UX**: Comprehensive ARIA attributes added, contextual guidance explains data collection, enhanced error handling with field-specific feedback, proper form validation, and improved user feedback. Profile completion form includes dynamic Google Maps autocomplete initialization for address fields.

### Emails (`src/user/templates/email/*.html`)
- ✅ **UI**: Redesigned transactional email templates (`account_verification.html`, `forgot_password_email.html`) with modern styling, improved typography, and consistent branding.
- ✅ **UX**: Added ARIA attributes (`role="button"`, `aria-label`) to email links for accessibility, improved call-to-action prominence, clearer next steps messaging.

---

## 7. Blog Module Templates

### `src/blog/templates/blog-list.html`
- **UI**: Redesign list layout with modern card grid, featured article hero, and consistent typography.
- **UX**: Improve content hierarchy, add estimated read time indicators, and make category filters obvious.

### `src/blog/templates/blog-details.html`
- **UI**: Apply new typography scale, heading styles, pull quotes, and image treatments.
- **UX**: Enhance readability (line length, spacing), provide table of contents or jump links, and improve sharing/follow actions.

---

## 8. Schedule Module Templates

### `src/schedule/templates/*.html`
- **UI**: Refresh scheduling forms and list views with Tailwind components.
- **UX**: Clarify appointment statuses, improve calendar interactions, and ensure scheduling confirmation flows are intuitive.

---

## 9. Core & Miscellaneous Templates

### `src/core/templates/*` (e.g., landing pages, legal pages)
- 🌟 **UI**: Refreshed hero headlines, section titles, and page headings across `home.html`, `contact_us.html`, `about-us.html`, `privacy.html`, and `404.html` to align with brand voice; Tailwind component migration still pending.
- 🌟 **UX**: Messaging now explains value propositions clearly, reduces repetitive phrasing, and guides users with actionable CTAs; remaining work includes full Tailwind styling, responsive refinements, and component consistency.

### Admin Customizations (`src/wizerproperties/templates/admin/*`)
- **UI**: Optional uplift to match the new admin branding (if desired).
- **UX**: Review whether custom admin lists need additional filters or batch actions; otherwise deprioritize.

---

## 10. Static Media & Asset Handling

### Image Assets (`src/wizerproperties/static/media/*`)
- **UI**: Audit logos/backgrounds for resolution and consistency; plan replacements if they no longer fit the refreshed brand.
- **UX**: Ensure alt text and descriptive captions are defined in templates to improve accessibility.

### JS/CSS Build Pipeline
- **UX**: Configure Vite/Vite-plugin or Tailwind CLI + Django pipeline for efficient local development and cache-busted production builds.
- **UI**: Ensure PurgeCSS is scoped correctly to avoid stripping required Tailwind classes.

---

## 11. Componentization & Reuse

### New Reusable Partials to Introduce
- `templates/components/form-field.html`
- `templates/components/section-header.html`
- `templates/components/upload-tile.html`
- **UI**: Centralize styling through shared partials to avoid drift.
- **UX**: Guarantee consistent behavior (validation hints, helper text, error states) across modules.

### Shared Context Helpers
- **UX**: Provide template tags or context processors to feed status badges, feature chips, and breadcrumbs without duplicating logic.

---

## 12. Documentation & Process

### `docs/design-decision-log.md` (to be created)
- **UX**: Log flow decisions, user dilemmas, and research insights.
- **UI**: Record visual rationale (color/contrast choices, typography pairings).

### `docs/accessibility-checklist.md` (to be created)
- 🌟 **UX**: ARIA attributes comprehensively implemented across all authentication templates:
  - Form-level: `aria-label`, `novalidate`, `aria-live="polite"`, `aria-atomic="true"`
  - Input fields: `aria-required`, `aria-describedby`, `aria-invalid` (dynamically managed), `autocomplete` attributes
  - Buttons: `aria-label`, `aria-busy` (dynamically updated)
  - Messages: `role="alert"`/`role="status"`, `aria-live`, `aria-hidden` on icons
  - Error handling: Hidden error containers with `sr-only`, dynamically shown with proper ARIA roles
  - Focus management: Automatic focus on first error field
  - Keyboard navigation: Proper tab order and focus states
- **UX**: Remaining work: Document WCAG contrast ratios, focus order patterns, and accessibility testing results per template.

---

## 13. Libraries & Reference Material

- **Tailwind CSS** (core utility system) — UI foundation.
- **shadcn/ui** (component recipes using Radix primitives) — UI consistency with accessible defaults for UX.
- **Lucide or Heroicons** — UI iconography set with consistent stroke weights.
- **Headless UI / Radix UI** — UX-driven accessible interaction primitives (disclosure, dialog, command palette) when shadcn patterns need customization.
- **FilePond or Uppy** (optional later) — UX improvement for file uploads.
- **Flatpickr / React-Day-Picker (if SPA segments)** — UX for date/time inputs.

---

## 14. Immediate Next Steps

1. **Architecture Choice (UI & UX)**: Decide on Tailwind integration path (Django pipeline vs. Vite) and confirm shadcn component usage approach.
2. **Token Definition (UI)**: Draft color, spacing, typography scale in `tailwind.config.js`.
3. **Core Layout Refactor (UI & UX)**: Update `base.html` header/footer/navigation to validate the new design language and interaction model.
4. **Form Prototype (UX)**: Pilot the redesigned form experience in `create_building.html`, then roll improvements to other CRUD templates.
5. **Iterate with Stakeholders**: Review redesigned flows before migrating the entire module set.

Keep this document current as the redesign progresses—mark completed items, add new discoveries, and link to design assets or implementation branches for traceability.

