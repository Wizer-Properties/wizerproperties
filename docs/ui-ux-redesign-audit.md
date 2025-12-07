# UI/UX Redesign Master Audit

**Version 1.0 Release** — January 2025

This audit lists every template and supporting asset that should be touched during the redesign, why each change is needed, and whether the driver is primarily **UI** (visual styling, component look-and-feel) or **UX** (structure, flow, usability, accessibility). Use it as the working master document while planning and executing the Tailwind + shadcn migration.

## 🎉 v1.0 Release Highlights

The v1.0 release represents a comprehensive UI/UX overhaul of the Wizer Properties platform:

- **Complete Tailwind CSS migration** across all major templates and components
- **Complete auth pages redesign from scratch (2025-01-XX)** with modern design system, context-aware messaging (developer vs buyer flows), improved visual hierarchy, refined form UX, and new color palette (`#f2f3f4`, `#b8e9e0`, `#00deb6`, `#53535fcc`, `#114f8d`, `#262637`, `#000433`) and typography (Alegreya Sans & David Libre)
- **New developer-focused pages (2025-01-XX)**: Developer homepage (`home_developer.html`) and pricing page (`developers_pricing.html`) with developer-specific messaging, value propositions, and transparent pricing comparison
- **Bangkok-focused landing page redesign** with streamlined buyer journey and reduced cognitive load
- **Comprehensive copy optimization** following high-converting landing page principles—benefit-driven messaging, clear CTAs, trust signals, PASTOR framework alignment across all user-facing pages, forms, cards, search pages, AI chat, and JavaScript messages
- **Context-aware differentiation (2025-01-XX)**: Auth and marketing pages support developer vs buyer messaging via URL parameters (`?from=developer` or `?from=buyer`), unified auth flow with role selection during profile completion
- **Comprehensive accessibility improvements** with ARIA attributes, keyboard navigation, and WCAG 2.1 compliance
- **Modern component architecture** with reusable property cards, filter panels, and shared JavaScript modules
- **Performance optimizations** including lazy loading, image fallbacks, and efficient data handling
- **Brand consistency** with design tokens for featured/discounted properties and consistent pill badge styling
- **Mobile-first responsive design** with improved touch interactions and breakpoint optimization
- **Complete SEO implementation** with meta tags, structured data (JSON-LD), sitemap generation, and robots.txt
- **Comprehensive analytics tracking** with GA4, Meta Pixel, and PostHog integration for user behavior and conversion tracking
- **Enhanced Zoho CRM and SalesIQ integration** with automatic lead/contact/deal sync from contact forms and viewing schedules, real estate-specific custom fields (property preferences, building details, demographics), smart duplicate handling, record updates, notes/activities tracking, comprehensive property information in deals, live chat widget, and CRM event tracking

**Deferred to v1.1+**: Legacy CSS deprecation (`main.js` migration, remaining legacy stylesheet cleanup), image asset audit, additional componentization work, and optional SEO enhancements (hreflang tags, additional schema types).

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
- ✅ **Accessibility** (2025-11-10): Header login modal now uses a semantic form wrapper with labelled inputs, inline error regions, and autocomplete hints to satisfy browser/password manager requirements.
- ✅ **Comparison Integration (2025-01-XX)**: Added comparison count badge to navigation menu "Compare side-by-side" link. Included `compare-manager.js` script for floating bar and count management. Added CSS to position Zoho chat widget at bottom-left (z-index 40) to avoid blocking toast notifications.

### `src/wizerproperties/templates/googletranslate/translate.html`
- ✅ **UI**: Restyled dropdown to Tailwind components with consistent spacing/iconography.
- ✅ **UX**: Added accessible toggle, clearer language labels, and click-outside handling.

### Static Stylesheets
- `src/wizerproperties/static/css/style.css`
- `src/wizerproperties/static/css/auth.css`
- `src/wizerproperties/static/css/header.css`
~~`src/wizerproperties/static/css/gptchat.css`~~ (removed 2025-11-10)
- ✅ **UI**: Tailwind-based chat shell now lives directly in `chat.html`; legacy chat styling removed to reduce drift.
- ✅ **UX**: Home Helper AI now inherits design tokens and responsive spacing; focus states and status messaging handled in-module.
- ◻️ **UI**: Pending full deprecation; Tailwind foundation (`tailwind.config.js`, `tailwind.css`) created.
- ◻️ **UX**: Legacy CSS still in place for unaffected templates; remove in subsequent phases.
- ✅ **Comparison & Featured Styling (2025-01-XX)**: 
  - **Comparison cards** (`.property-compared`): Teal gradient background (`rgba(0, 222, 182, 0.1)` to `rgba(0, 222, 182, 0.05)`), teal border, top accent bar, enhanced shadow. Non-compared cards explicitly set to white background.
  - **Featured listings** (`.property-featured`): Normal white background with teal border (2px) and top accent bar indicator. Hover effects for border color change.
  - **Spotlight listings** (`.property-spotlight`): Purple gradient background with purple border and top accent bar.
  - **Zoho chat widget**: Positioned at bottom-left (z-index 40) to avoid blocking toast notifications (z-index 50).
- ✅ **Code Cleanup (2025-01-XX)**: Removed commented-out Montserrat font imports and declarations from `style.css` (legacy font migration cleanup—now using Effra via Tailwind config).

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
- ✅ **UX** (`g_map.js`): Added HTMLInputElement validation checks to prevent Google Maps autocomplete errors, improved error handling for missing elements. **2025-01-XX**: Fixed Map shadowing issue—renamed destructured `Map` to `GoogleMap` to avoid shadowing the global JavaScript Map constructor.
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

### Brand Accent Guidance (Client Request 2025-11-16)
- Subtle retention of brand accents across the site:
  - Discounted/spotlight contexts: outline/badge accent `#15c1b9`.
  - Featured contexts: outline/badge accent `#7f1377`.
- Keep usage minimal and clean; prefer outlines/borders, subtle badges, or icon strokes over large fills.
- Primary CTA style remains unchanged; do not recolor the main CTA button.

### Tailwind Tokens & Utilities (2025-11-16)
- Added brand colors to Tailwind for consistent use across templates:
  - `brand.teal` = `#15c1b9`
  - `brand.purple` = `#7f1377`
  - Semantic aliases: `featured` = `#7f1377`, `discounted` = `#15c1b9`
- Semantic utilities registered:
  - Borders: `border-featured`, `border-discounted`
  - Rings: `ring-featured`, `ring-discounted`
  - Text: `text-brand-teal`, `text-brand-purple`
  - Backgrounds: `bg-brand-teal`, `bg-brand-purple`
- Usage guidance:
  - Featured cards/badges: prefer `border-featured`, `ring-featured`, or `text-brand-purple` for icon strokes.
  - Discounted/spotlight: prefer `border-discounted`, `ring-discounted`, or `text-brand-teal`.
  - Avoid changing primary CTA; accents should be outlines/badges only.

### New Design System (2025-01-XX)
- **Color Palette**: Updated to new brand colors:
  - Background: `#f2f3f4` (light grey)
  - Accent Light: `#b8e9e0` (mint green)
  - Primary Accent: `#00deb6` (teal/cyan)
  - Muted Text: `#53535fcc` (grey with opacity)
  - Primary Blue: `#114f8d` (dark blue)
  - Dark Text: `#262637` (dark grey)
  - Darkest: `#000433` (near black)
- **Typography**: New font system:
  - Sans-serif: `Alegreya Sans` (weights: 400, 500, 700)
  - Heading: `David Libre` (weights: 400, 500, 700)
  - Fonts loaded via Google Fonts with preconnect optimization
- **Context-Aware Design**: Auth pages and marketing pages support context-aware messaging:
  - URL parameter `?from=developer` shows developer-focused copy
  - URL parameter `?from=buyer` or default shows buyer-focused copy
  - Same form structure, different messaging based on user journey
  - Unified auth flow with role selection during profile completion

---

## 2. Shared Template Includes & Layout Pieces

### `src/core/templates/` (e.g., `core/base_dashboard.html`, `core/includes/*`)
- **UI**: Align dashboards, cards, table headers with the new visual language; unify empty states.
- **UX**: Reassess information hierarchy, reduce cognitive load in dashboard summaries, and ensure responsive readability.

### User Dashboard Templates

#### `src/core/templates/core/developer_or_agent_dashboard.html`
- ✅ **UI**: Complete Tailwind redesign with modern gradient statistics cards, responsive data tables using shadcn-inspired styling, modern toggle switches, badge components, and cohesive spacing/typography. Removed all legacy Bootstrap classes and inline styles.
- ✅ **UX**: Improved information hierarchy with clear section headers, better mobile responsiveness, enhanced table readability with hover states, accessible toggle controls, and streamlined action buttons. Tables now use proper semantic HTML with better screen reader support.
- 🌟 **Audit 2025-11-23**: Updated statistics card gradients to use brand semantic colors (Purple/Teal) and updated toggles/actions to `text-primary` / `text-accent`.

#### `src/core/templates/core/prospect_dashboard.html`
- ✅ **UI**: Complete Tailwind redesign with gradient statistics cards matching design system, modern quick action cards with hover effects, responsive table layout, and consistent spacing throughout.
- ✅ **UX**: Improved quick action affordances with clear visual hierarchy, better mobile layout optimization, enhanced schedule status visibility with color-coded badges, and improved empty state handling.
- 🌟 **Audit 2025-11-23**: Updated statistics card gradients to use brand semantic colors and updated quick action icons to `text-primary` / `text-accent` on `bg-primary/10` / `bg-accent/10`.

#### `src/core/views/dashboard.py`
- ◻️ **UX**: Review context data structure for dashboard efficiency; consider adding pagination or lazy loading for large datasets; ensure proper error handling and fallback states.

#### `src/wizerproperties/static/css/dashboard.css`
- ✅ **UI**: Deprecated - all styles migrated to Tailwind utilities. File can be removed after verification.
- ✅ **UX**: Legacy CSS removed; responsive design now handled by Tailwind breakpoints.

#### `src/wizerproperties/static/js/dashboard.js`
- ✅ **UX**: Complete rewrite using modern JavaScript patterns (IIFE, ES6+), improved error handling, updated DataTables initialization for new markup, better separation of concerns, and enhanced user feedback with success/error messages. Maintains jQuery compatibility for DataTables while using modern patterns elsewhere.

### `src/wizerproperties/templates/no_auth.html`
- ✅ **UI**: Complete redesign (2025-01-XX): Removed card wrapper to allow full-width auth page layouts. Updated to use new color scheme (`bg-[#f2f3f4]`, `text-[#262637]`) and fonts (Alegreya Sans & David Libre). Simplified layout structure—auth pages now render full-width without nested card containers. Footer updated with new color tokens.
- ✅ **UX**: Streamlined base template to support modern auth page designs. Removed Bootstrap dependencies. Added jQuery script loading to ensure proper dependency order for auth pages. Template now provides clean foundation for redesigned auth flows.

---

## 3. Building Module Templates

### `src/building/templates/create_building.html`
- ✅ **UI**: Converted to Tailwind sections, cards, chip-based checklists, and reorganized media upload tiles.
- ✅ **UX**: Streamlined grouping, added AI modal flow, contextual helper text, and accessible validation.
- 🌟 **Audit 2025-11-23**: Updated header and checkbox highlights to Teal accent.
- ✅ **Copy Optimization** (2025-01-XX): Headline updated to emphasize benefit ("Launch your development to international buyers"). Section descriptions reframed to be benefit-focused. Dropdown options updated ("Choose building type" vs "Select type"). AI description prompts updated for clarity. Media upload guidance more specific. Button text changed to "Publish project" for action-orientation.
- ✅ **Bug Fix (2025-01-XX)**: Added retry limit (50 attempts, 5 seconds) to Google Maps loader `initMapPicker()` function to prevent infinite retry loops if Google Maps fails to load due to network issues or blocked scripts.

### `src/building/templates/update_building.html`
- ✅ **UI**: Alignment with create form components, modernized media gallery list, Tailwind styling.
- ✅ **UX**: Inline removal for media, required toggles, consistent error handling.
- 🌟 **Audit 2025-11-23**: Updated header and checkbox highlights to Teal accent.

### `src/building/templates/get_building.html`
- ✅ **UI**: New hero gallery, stat grid, amenity chips, card/aside layout.
- ✅ **UX**: CTA hierarchy, lazy-loaded units, map/media panels, accessible review module.
- ✅ **Detail Page Redesign (2025-12-XX)**: Complete redesign to match property card design system:
  - **Hero Image First**: Moved hero image/video section to top of page (before header) for better visual impact
  - **Header Section**: Updated header with badge, title, address, and "Schedule" CTA button matching property page design
  - **Building Stats Section**: Converted key metrics to icon+text format with `bg-muted/30` background, matching card stats section
  - **Typography Standardization**: Standardized all fonts—headings (`text-lg font-semibold`), body text (`text-sm font-normal`), values (`text-sm font-medium`), labels (`text-xs font-medium`)
  - **Image Rendering Fix**: Fixed hero images to use `h-full w-full` instead of fixed `h-72` to properly fill container

### `src/wizerproperties/static/js/building/detail-page.js`
- ✅ **UI/UX**: Rebuilt media gallery orchestration, Splide integrations, amenities chips, lazy-loaded units, and review workflow using modern JS modules.
- ✅ **Detail Page Redesign (2025-12-XX)**: Updated to support new detail page structure:
  - **Stats Section Population**: Populates building stats (type, units, area, floors, completion, BTS/MRT, ARL, quota) with conditional display wrappers
  - **Price Overlay**: Shows/hides price overlay in hero section based on price data availability
  - **Image Rendering**: Fixed hero slider images to use `h-full w-full` instead of fixed `h-72` to properly fill container

---

## 4. Property Module Templates

### `src/property/templates/create_property.html`
- ✅ **UI**: Rebuilt with Tailwind cards, modern inputs, chip-style checklists, and cohesive CTA footer; removed legacy Bootstrap classes.
- ✅ **UX**: Streamlined data entry, contextual helper copy, tenant availability logic, and AI modal aligned with new interaction patterns.
- 🌟 **Audit 2025-11-23**: Updated header and checkbox highlights to Teal accent.
- ✅ **Copy Optimization** (2025-01-XX): Headline updated to emphasize outcome ("List your property and start getting qualified leads"). Section descriptions reframed to be benefit-focused ("Create a compelling first impression—this is what buyers see in search results"). Dropdown options updated ("Choose building project" vs "Select building"). AI description prompts and modal copy updated for clarity. Media upload guidance more specific. Availability section copy updated ("Tell buyers about the unit's current status and special features").

### `src/wizerproperties/static/js/property/create_property.js`
- ✅ **UI/UX**: Updated DOM bindings, modal controls, tenant toggle behavior, and shared success/error messaging for the redesigned form.

### `src/property/templates/update_property.html`
- ✅ **UI**: Brought update form to parity with the Tailwind components used in create flow (carded sections, modern inputs, tenant chips, media gallery, spinner states).
- ✅ **UX**: Added inline helper copy, chip-based feature toggles, tenant availability controls, refreshed success/error messaging, and accessible media removal interactions.
- ✅ **Maintenance** (2025-11-10): Removed duplicated legacy Bootstrap block so only the Tailwind implementation ships; no placeholder/commented markup remains.
- 🌟 **Audit 2025-11-23**: Updated header and checkbox highlights to Teal accent.

### `src/property/templates/get_property.html`
- ✅ **UI**: Modernized listing detail layout (hero area, key stats, feature chips, gallery slider, CTA sidebar) now aligned with building detail style.
- ✅ **UX**: Prioritizes high-intent actions, supports new review card, and exposes comparison/favorite entry points; map/media frames now fully accessible.
- ✅ **Resilience** (2025-11-10): Shared card factory attaches fallback imagery for developer avatars/gallery slides to protect carousels from missing media.
- 🌟 **Audit 2025-11-23**:
  - **Color Balance**: Badges and key highlights heavily rely on `bg-primary/10 text-primary` (Purple). Need to shift to `bg-accent/10 text-primary` (Teal BG + Purple Text) to match updated `home.html` aesthetic.
  - **Icons**: Location and contact icons should use `text-accent` (Teal) to differentiate from primary text.
  - **Reviews**: Star ratings in JS need to align with the new accent color or a standard rating color.
- 🌟 **Refactor 2025-11-25**: Refactored "Unit Specifications" to use Tailwind grid cards and "Building Snapshot" to use a cleaner definition list style with Teal accent actions. Fixed `AVAILABLE_API_URL` query parameter collision to prevent 500 errors.
- ✅ **SEO** (2025-01-XX): Comprehensive property-specific meta tags (dynamic title, description, keywords, canonical, Open Graph with property images, Twitter Cards, article meta), Product schema JSON-LD, and Breadcrumb schema. Property view analytics tracking on page load.
- ✅ **Detail Page Redesign (2025-12-XX)**: Complete redesign to match property card design system:
  - **Hero Image First**: Moved hero image/video section to top of page (before header) for better visual impact
  - **Developer/Agent Header**: Added compact header with developer avatar, name, relative date ("Added X days ago"), and "Book" CTA button matching card design
  - **Property Stats Section**: Converted key attributes to icon+text format with `bg-muted/30` background, matching card stats section
  - **Property Type Badge**: Moved property type to compact badge in header next to developer name (shows sub-type only, e.g., "Condo" instead of "Residential - Apartment/Condo/Service Residence")
  - **Consolidated Information**: Merged duplicate "Property Information" and "Unit specifications" sections into single unified section with card-based grid layout
  - **Typography Standardization**: Standardized all fonts—headings (`text-lg font-semibold`), body text (`text-sm font-normal`), values (`text-sm font-medium`), labels (`text-xs font-medium`)
  - **Image Rendering Fix**: Fixed hero images to use `h-full w-full` instead of fixed `h-72` to properly fill container
  - **Similar Properties & Available Units**: Updated both sections to use `PropertyCardFactory.createCard()` for consistent card styling matching homepage/search pages

### `src/property/templates/developer-agent-property-list.html`
- ✅ **UI**: Tailwind card grid with responsive breakpoints, skeleton loaders, and badge styling for credit cues.
- ✅ **UX**: Infinite-scroll experience rewritten with IntersectionObserver, quick actions surfaced, empty state messaging added.
- ✅ **Component Note**: Consumes shared `components/property/card.html` partial and `property/card-factory.js` helper for consistent markup with search/favorites.
- 🌟 **Audit 2025-11-23**: Updated user profile badges and location icons to Teal/Accent theme.

### `src/property/templates/comparison.html`
- ✅ **UI**: Comparison view rebuilt as Tailwind cards within Splide carousel; consistent typography and loader skeletons.
- ✅ **UX**: Column toggles, remove actions, and media embeds simplified; async pagination now resilient.
- 🌟 **Audit 2025-11-23**: Updated header and add-button styles to match Teal/Accent theme.
- ✅ **Fix 2025-01-XX**: Fixed API response handling to correctly extract `property_info` from CompareProperty serializer response structure. Improved error handling with graceful fallbacks and better error messages. Enhanced empty state with clear CTA to browse properties.

### `src/property/templates/favorite-list.html`
- ✅ **UI**: Favorites page mirrors property card design with unified badges and CTA layout.
- ✅ **UX**: Saved count kept in sync via updated JS; empty state messaging and navigation affordances improved.
- ✅ **Component Note**: Uses shared property card partial + factory for markup parity and Splide initialisation.

### `src/property/templates/search_property.html` & `search_property_with_map.html`
- ✅ **UI**: Complete Tailwind conversion—shared hero banner, card layout, skeleton loaders, updated filter header, and refreshed modals.
- ✅ **UX**: Search results support gallery Splide, compare/favorite actions, countdown badges, and map/list parity; page structure supports accessibility landmarks.
- ✅ **Data Handling** (2025-11-10): Home landing sliders now defer nearest-property API calls until geolocation is granted, keeping console noise low and messaging focused when users opt out.
- ✅ **Component Note**: Shared card partial handles result rendering; `property/search.js` now boots cards via factory + lazy Splide loader. **2025-01-XX**: Map view uses dedicated `card-map-view.html` template with 3-section layout.
- 🌟 **Audit 2025-11-23**: Updated filter/sort chips to use `text-primary` on `bg-accent/10` and updated 3D view modal to full-screen immersive style.
- 🌟 **Refactor 2025-11-23**: Completely rewrote `property/search.js` to use a robust class-based `PropertySearchManager` with debounce, abort controllers, and strict pagination parsing to fix infinite scroll/blank page issues. Fixed modal visibility on load by adding explicit `display: none`.
- 🌟 **Audit 2025-11-25**: Updated secondary actions (Reset map, List View) in `search_property_with_map.html` to use Teal accent hover states for consistency.
- 🌟 **Fix 2025-11-25**: Fixed `Invalid URL` error in pagination by adding base origin to URL constructor. Fixed 404 error on map view by renaming URL pattern to `search-with-map/` in `urls.py`. Added `display: none` to modals in both templates to prevent blocking the screen on load.
- ✅ **Copy Optimization** (2025-01-XX): Results text updated ("results" → "verified properties", "Properties available" → "Verified properties found"). Button text updated ("Clear map" → "Reset map view"). Meta tags updated to reflect benefit-focused messaging.
- ✅ **Comparison UX Enhancement (2025-01-XX)**: 
  - **Floating comparison bar**: Added floating bar at bottom of search pages showing "Compare X of 3 Properties Selected" with "View Comparison" and "Clear" buttons. Auto-hides when count is 0.
  - **Visual card indicators**: Properties in comparison have teal gradient background (`property-compared` class), unselected properties have white background. Cards update in real-time when added/removed.
  - **Filter state persistence**: Filter panel expanded/collapsed state saved to localStorage and restored on page refresh.
  - **Navigation badges**: Comparison count badge added to navigation menu "Compare side-by-side" link, updates in real-time.
  - **Toast notifications**: Success/warning/info toasts for comparison actions with auto-dismiss.
  - **Zoho chat positioning**: Moved chat widget to bottom-left (z-index 40) to avoid blocking toast notifications (z-index 50).
- ✅ **Button Styling Consistency (2025-01-XX)**: Updated all buttons in search pages (sorting button, map view toggle, save search button, reset map view button, list view toggle, "Clear all filters" button, "Back to top" button) to match filter bar button styling for visual consistency.

### `src/property/templates/property/create_discount_featured.html`
- ✅ **UI**: Promotion wizard updated to Tailwind panel with credit summary, button hierarchy, and helper copy.
- ✅ **UX**: Clear messaging around cost, balance, and eligibility with disabled CTA states.
- 🌟 **Audit 2025-11-25**: Updated "Promotion" header label and cost badges to Teal accent.

### `src/property/templates/property/edit_discount_featured.html`
- ✅ **UI**: Matches create flow styling with property info summary cards.
- ✅ **UX**: Exposes current metrics while focusing on expiry adjustment, cancel paths prominent.
- 🌟 **Audit 2025-11-25**: Updated "Promotion" header label to Teal accent.

### `src/property/templates/property/discount_featured_list.html`, `delete_discount_featured.html`
- ✅ **UI**: Tailwind card/table layout with badge system, responsive credit summary, and destructive confirmation modal aligned to design tokens.
- ✅ **UX**: Clear empty states, credit visibility, and confirm flow with irreversible warning copy.
- 🌟 **Audit 2025-11-25**: Updated page badge, secondary icons (wallet, calendar), and status badges to Teal accent theme.

### `src/property/templates/review-box.html`
- ✅ **UI/UX**: Shared review component migrated to Tailwind card with submission/CTA areas; JS updated for fetch-based workflows.
- 🌟 **Audit 2025-11-25**: Updated "Reviews" header label to Teal accent.

### `src/property/templates/components/property/filter-panel.html`
- ✅ **UI**: Tailwind chip triggers, popover shells, and modal overlay replace legacy CSS.
- ✅ **UX**: Vanilla JS controller manages state, emits `propertyFilters:changed` events, and supports keyboard-friendly clear/apply semantics. Popovers now announce expanded state; modal focus trap and Escape handling implemented for accessibility.
- ✅ **Componentization** (2025-11-10): Extracted into reusable `components/property/filter-panel.html` partial with modular `initPropertyFilters(options)` function in `js/property/filter-init.js` for use across search contexts.
- 🌟 **Audit 2025-11-25**: Updated hover states for filter chips and buttons to use Teal accent.
- ✅ **State Persistence (2025-01-XX)**: Filter panel expanded/collapsed state saved to localStorage and automatically restored on page refresh. `restorePopoverState()` method restores the last open filter popover when page loads.
- ✅ **Bug Fix (2025-01-XX)**: Fixed critical logic bug in `handleQuickFilter()` method—moved `isActive` check before setting filter values to prevent immediate filter clearing. Improved button state management to update all quick filter buttons based on current filter state.

### `src/wizerproperties/static/js/property/detail-page.js`
- ✅ **UI/UX**: Converted to modular fetch with Tailwind hooks, lazy gallery loading, updated compare/favorite logic, and review submission.
- ✅ **Code Quality (2025-01-XX)**: 
  - Extracted duplicated video tracking code into `attachVideoTracking()` helper function (used in both `renderHeroSlides` and `renderModalSlides`).
  - Added property price validation in `fetchSimilarProperties()`—validates price is finite, positive number before calculating similar properties range to prevent invalid API queries.
  - Added error handling for `JSON.parse()` in `initBackToSearch()` to handle corrupted localStorage data gracefully.
  - Added comprehensive error handling for localStorage operations in `initNotes()` to handle quota exceeded and security errors (private browsing mode).
- ✅ **Detail Page Redesign (2025-12-XX)**: Updated to support new detail page structure:
  - **Developer Header Population**: Populates developer image, name, and relative date ("Added X days ago") in new header section
  - **Property Type Badge**: Shows property sub-type as compact badge in header (e.g., "Condo" instead of full "Residential - Apartment/Condo/Service Residence")
  - **Featured Accent Bar**: Shows/hides teal gradient accent bar at top for featured properties
  - **Price Overlay**: Populates price, original price, and discount amount in hero image overlay
  - **Badges & Actions**: Builds badges dynamically, initializes compare/favorite buttons with proper states
  - **View Buttons**: Shows/hides 3D Tour and Aerial View buttons based on property data
  - **Stats Section**: Populates property stats (beds, baths, sqft, floor, parking, tenure) with conditional display wrappers
  - **Property Information**: Populates consolidated property information section (Unit ID, Floor Number, Tenure, Balconies, Car Parks, Availability, Orientation, Door Direction, Unit Position)
  - **Similar Properties**: Updated `renderSimilarProperties()` to use `PropertyCardFactory.createCard()` for consistent card styling
  - **Available Units**: Updated `createAvailableCard()` to use `PropertyCardFactory.createCard()` for consistent card styling, properly initializes Splide for card image sliders

### `src/wizerproperties/static/js/property/card-factory.js`
- ✅ **UI/UX**: Adds resilient image fallbacks for developer avatars/gallery slides; keeps Splide cards functional when media misses. Currency formatting aligned to whole baht (no decimals) for price and per‑sqm. Badge styling updated to use `bg-accent/10 text-primary` for consistent color balance.
- ✅ **Property Card Redesign (2025-01-XX)**:
  - **Template Selection**: Automatically detects map view (`window.location.pathname.includes("search-with-map")` or `window.page_view === "map-list"`) and selects appropriate template (`property-card-map-view-template` vs `property-card-template`).
  - **Developer Header Population**: Populates developer/agent name and company in new header section, includes developer image fallback (generic building icon if image fails to load).
  - **Featured Accent Bar Logic**: Shows `data-card-featured-accent` div only when `property.tag === "feature"`.
  - **Relative Date Formatting**: Added `formatRelativeDate()` function to calculate and display dates as "Added X days/weeks/months ago" or "today", with fallback to DD/MM/YYYY format for dates older than a year.
  - **Date Population**: Populates `data-card-date-value` and `data-card-date-label` in developer info section with relative date formatting.
  - **Media Button Population**: Dynamically creates and appends buttons for various media types (Images, Unit Plans, Master Plan, Video, Interior 360°, Facilities, Aerial, View Gallery) based on property data availability (`property.has_unit_plans`, `property.has_master_plan`, `property.has_video`, `property.facility_view`, `property.location_view`, `property.interior_view`, `property.aerial_drone_video`). Each button links to detail page with specific gallery filter (`?gallery=images`, `?gallery=unit_plans`, etc.).
  - **Card Clickability**: Added event listener to entire card to navigate to detail page on click, prevents propagation for clicks on interactive elements (buttons, links) using `e.stopPropagation()`.
  - **Stats Population**: Updated logic to populate `data-card-beds`, `data-card-baths`, `data-card-size`, `data-card-size-display`, `data-card-floor-number`, `data-card-parking`, and `data-card-property-type-stats` in dedicated stats section.
  - **Conditional Display for Stats**: Added logic to show/hide `data-card-floor-wrapper`, `data-card-parking-wrapper`, and `data-card-property-type-wrapper` based on data availability (only shows if data exists).
  - **Property Type Full Display**: Removed truncation constraints, uses `flex-1` layout with `min-w-0` to allow property type to display fully while other stats maintain compact size (`flex-shrink-0`).

### `src/wizerproperties/static/js/property/dev-agent-pros-list.js`
- ✅ **UI/UX**: Rewritten around IntersectionObserver, Tailwind card rendering, and empty state management.
- ✅ **Component Note**: Relies on shared card factory; only source-specific wrappers remain.

### `src/wizerproperties/static/js/comparison.js`
- ✅ **UI/UX**: Splide-based comparison columns with loader slides, boolean badges, and video embedding; improved removal flow.
- ✅ **API Response Handling (2025-01-XX)**: Fixed to correctly extract `property_info` from CompareProperty serializer response structure. Handles both CompareProperty objects (with `property_info` field) and direct Property objects. Improved error handling with graceful fallbacks and better error messages. Dispatches `compare:count_updated` event after fetching list to sync count badges.

### `src/wizerproperties/static/js/property/compare-manager.js`
- ✅ **UX/UI**: **New module (2025-01-XX)**: Manages floating comparison bar, count badges, and toast notifications. Features:
  - Fetches initial comparison count from API on page load
  - Updates floating comparison bar (shows/hides based on count, displays "Compare X of 3 Properties Selected")
  - Updates navigation menu count badge in real-time
  - Listens for `compare:added`, `compare:removed`, and `compare:count_updated` events
  - Shows toast notifications for comparison actions (success, warning, info)
  - Manages localStorage for quick count access
  - Handles "Clear" action to remove all properties from comparison

### `src/wizerproperties/static/js/favorite-list.js`
- ✅ **UI/UX**: Infinite scroll, count syncing, and empty state detection added; cards reuse shared markup.
- ✅ **Component Note**: Shared card factory ensures visual consistency; Splide initialised per card.

### `src/wizerproperties/static/js/property/search.js`
- ✅ **UI/UX**: Search results cards rewritten, loader skeletons introduced, countdown badges updated, and modals refreshed.
- ✅ **Component Note**: Imports shared card factory for rendering and lazy Splide mounting. **2025-01-XX**: Modified `renderProperties()` to pass `mapView: true` option to `PropertyCardFactory.createCard()` when rendering for map view sidebar, enabling automatic template selection.
- 🌟 **Refactor 2025-11-23**: Complete rewrite to class-based `PropertySearchManager`. Features: `AbortController` for request cancellation, 500ms input debounce, strict pagination parsing (prevents infinite loops), and robust error/empty state handling.
- ✅ **Comparison Integration (2025-01-XX)**: Added event listeners for `compare:added` and `compare:removed` to update card visual state in real-time. `updateCardComparisonState()` method toggles `property-compared` class and updates button states when properties are added/removed from comparison.
- ✅ **Button Styling Consistency (2025-01-XX)**: Updated "Back to top" button classes to match filter bar button styling for visual consistency.

### `src/wizerproperties/static/js/property/compair-favorite.js`
- ✅ **UX/UI**: Complete modernization (2025-11-10): Removed jQuery dependencies, migrated to fetch API, integrated with card factory button states (proper icon updates), emits `compare:added`, `compare:removed`, `favorite:added`, and `favorite:removed` events for count syncing. Improved error handling, loading states with ARIA attributes, and visual feedback effects. Maintains backward compatibility with `favorite-list.js` event listeners.
- ✅ **Analytics** (2025-01-XX): Analytics tracking integrated for favorite and compare actions. Tracks `property_favorite`/`property_unfavorite` and `property_compare`/`property_uncompare` events with property data to GA4, Meta Pixel, and PostHog.
- ✅ **Comparison Limit & Visual Feedback (2025-01-XX)**: 
  - Added frontend validation to prevent adding more than 3 properties (shows warning toast).
  - Backend validation in `ComparePropertyViewSet.perform_create()` enforces 3-property limit with clear error messages.
  - Toggles `property-compared` class on cards when added/removed (teal background for selected, white for unselected).
  - Improved error handling with specific API error message parsing and display.

### Currency Formatting Consistency (2025-11-16)
- ✅ All property card prices (total and per-sqm) now display as whole baht values (no decimals) to match detail pages and badges. Implemented in `static/js/property/card-factory.js` via flooring to the nearest baht for clean presentation.

### Property Card Redesign (2025-01-XX)
- ✅ **Complete UX/UI Overhaul**: Comprehensive redesign of property cards across search and map views with focus on improved iconography, visual hierarchy, consistency, and accessibility.
- ✅ **Key Improvements**:
  - **Iconography**: Bootstrap Icons (`bi-` classes) added throughout cards for beds, baths, size, location, floor, property type, developer info, CTAs, and actions.
  - **Developer/Agent Header**: Compact header bar at top of card with avatar, name, company, and "Contact" button for improved information hierarchy.
  - **Featured Accent Bar**: Brand-teal accent bar (`bg-brand-teal h-1`) at top of featured property cards for visual distinction.
  - **Button Consistency**: All card buttons (Contact, 3D Tour, Aerial View, Media buttons) match filter bar button styling for visual consistency.
  - **Media Buttons**: Dynamic buttons for various media types (Images, Unit Plans, Master Plan, Video, Interior 360°, Facilities, Aerial) based on property data availability.
  - **Card Clickability**: Entire card navigates to detail page while buttons remain functional independently (event propagation handling).
  - **Compact Design**: Reduced padding, smaller elements, tighter spacing while maintaining readability and all essential information.
  - **Mobile Optimization**: Improved tap targets (`min-h-[44px]`), responsive button placement, icon-only labels on mobile.
- ✅ **Relative Date Formatting**: Dates displayed as "Added X days/weeks/months ago" or "today" instead of "Added on DD/MM/YYYY" for better UX.
- ✅ **Stats Section**: Dedicated bordered section below image with icon+text format for all property stats (beds, baths, sqft, floor, parking, property type), conditional display for optional stats, clean minimalistic design with proper spacing and typography.
- ✅ **Property Type Display**: Fixed truncation issue—property type now displays fully using `flex-1` layout while other stats maintain compact size.

### Typography Standardization (2025-12-04)
- ✅ **Unified Card Template**: Consolidated `card.html` and `card-map-view.html` into single unified template used across home page, search page, and map view for consistent design.
- ✅ **Site-Wide Typography Alignment**: Analyzed existing site typography metrics and aligned card to match:
  - **Font Sizes**: 16px (`text-base`) dominant for body, 14px (`text-sm`) for secondary, 12px (`text-xs`) minimum for captions. Removed all sub-12px sizes (`text-[10px]`, `text-[11px]`) following accessibility best practices.
  - **Font Weights**: 400 (normal) for body text and labels, 500 (`font-medium`) for emphasis (title, stats values, CTAs), 700 (`font-bold`) reserved only for price (key data point).
  - **Typography Scale**: Price hero (24-30px `text-2xl/3xl`), Title (16-18px `text-base/lg`), Stats/Body (14px `text-sm`), Captions (12px `text-xs`).
- ✅ **Layout Refinements**:
  - **Header Bar**: "Book Viewing" CTA (for prospects) or "View Details" (for agents/developers) and relative date moved to top header alongside developer info for prominent placement.
  - **Stats Section**: Property specs (beds, baths, sqft, floor, parking, type) in dedicated section below image with icon+text format and `bg-muted/30` background.
  - **Content Section**: Simplified to title, address, media buttons, description (wide only), and features (wide only).
- ✅ **JavaScript Updates**: `card-factory.js` simplified to use single template ID, `querySelectorAll` helper for populating multiple stat element instances, date attributes updated to `data-card-date-relative/label/value`.

### Featured/Discounted Card Styling (2025-11-16)
- ✅ Subtle outlines/badges applied via design tokens:
  - Discounted/spotlight: border/badge accent `#15c1b9`.
  - Featured: border/badge accent `#7f1377`.
- Primary CTA retains existing color and style for consistency.

### Comparison Feature Enhancements (2025-01-XX)
- ✅ **Visual Card Indicators**: Properties in comparison list have teal gradient background (`.property-compared` class), unselected properties have white background. Cards update in real-time when added/removed via event listeners.
- ✅ **Floating Comparison Bar**: Added to search pages showing "Compare X of 3 Properties Selected" with "View Comparison" and "Clear" buttons. Auto-hides when count is 0.
- ✅ **Navigation Badges**: Comparison count badge added to navigation menu, updates in real-time across all pages.
- ✅ **Filter State Persistence**: Filter panel expanded/collapsed state saved to localStorage and restored on page refresh.
- ✅ **3-Property Limit**: Frontend validation prevents adding more than 3 properties, backend validation in `ComparePropertyViewSet.perform_create()` enforces limit with clear error messages.
- ✅ **Toast Notifications**: Success/warning/info toasts for all comparison actions with auto-dismiss.
- ✅ **Zoho Chat Positioning**: Moved chat widget to bottom-left (z-index 40) to avoid blocking toast notifications (z-index 50).
- ✅ **API Error Handling**: Improved error handling in comparison API with graceful fallbacks, proper serializer error handling, and better user feedback.

---

## 5. Advertise Module Templates

### `src/advertise/templates/advertise-analytics.html`
- ✅ **UI**: Refreshed analytics layout with Tailwind cards, filter chips, responsive chart canvas, and modal panels styled with the new design tokens; empty state messaging now matches component styling.
- ✅ **UX**: Streamlined timeframe/pagination controls, improved modal access, added loaders/skeletons, clarified insight descriptions, and ensured graceful empty states for charts and DataTables when analytics data is unavailable.
- ✅ **Component Note**: Shared partial `advertise/partials/analytics-modals.html` mirrors the new styling and interaction patterns; no Bootstrap remnants remain.

### `src/advertise/templates/advertise-performance.html`
- ✅ **UI**: Modernised campaign list table with responsive card container, summary metric tiles, and updated analytics modal visuals (legacy template remnants removed 2025-11-09); added Tailwind-styled empty state for zero-campaign scenarios.
- ✅ **UX**: Simplified data scans with improved search/filter inputs, actionable CTA styling, clear feedback while analytics load, and prevented redundant DataTable initialisation with explicit empty-state handling.
- 🌟 **Audit 2025-11-23**: Updated header and loader spinner to Teal accent.

### `src/advertise/templates/create-edit-reels.html`
- ✅ **UI**: Rebuilt reel form using Tailwind cards, consistent inputs, and streamlined action bar (duplicate block cleanup completed 2025-11-09).
- ✅ **UX**: Added contextual helper text, improved validation feedback, disabled states, and success messaging aligned with other modules.
- 🌟 **Audit 2025-11-23**: Updated "Advertise" badge to Teal accent.

### `src/advertise/templates/reels.html`
- ✅ **UI**: Introduced gradient hero, Tailwind-styled filter chips, and modern reel cards within Splide slider (legacy template remnants removed 2025-11-09).
- ✅ **UX**: Enhanced filtering interactions, added empty states, and clarified platform/manager attribution to support user decisions.
- 🌟 **Audit 2025-11-23**: Updated "Media hub" badge and filter buttons to Teal accent.

### Ad Engine Implementation (2025-01-XX)
- ✅ **Backend API** (`src/advertise/api/views/advertisement.py`): Fixed queryset filtering to include `status='running'` in addition to `expired_at >= now()` to ensure only active ads are returned. API endpoint `/advertise/api/advertisement/suggested/` supports 7 ad locations: `home`, `search`, `search_inline`, `details_topbar`, `details_sidebar`, `map_below`, `blog`.
- ✅ **Frontend JavaScript** (`src/wizerproperties/static/js/ads.js`): Ad loading and rendering handler with support for multiple ad types (top banner slider, sidebar slider, inline cards, map below ads). Handles Splide slider initialization, empty state hiding, and ad click tracking.
- ✅ **Property Detail Page** (`src/property/templates/get_property.html`): Ad containers implemented for `details_topbar` (top banner) and `details_sidebar` (sidebar) locations with proper script configuration.
- ✅ **Building Detail Page** (`src/building/templates/get_building.html`): **New (2025-01-XX)**: Added ad support matching property detail page structure—top banner ad section after breadcrumb, sidebar ad section in aside, script configuration with `ADS_LOCATION_PARAM = ['details_sidebar', 'details_topbar']`, and `ads.js` script inclusion. Fixed breadcrumb URL (changed from non-existent `building:search` to `/property/search/`).
- ✅ **Home Pages** (`src/core/templates/home.html`, `src/core/templates/home_developer.html`): **New (2025-01-XX)**: Added ad support to both buyer and developer home pages—ad banner section after hero section, Splide CSS inclusion, script configuration with `ADS_LOCATION_PARAM = ['home']`, and `ads.js` script inclusion. Developer home page includes new `extend_script` block.
- ✅ **Search Pages** (`src/property/templates/search_property.html`, `search_property_with_map.html`): Ad containers already implemented for `search` (top banner), `search_inline` (inline ads every 6 properties), and `map_below` (below map) locations.
- ✅ **Blog Pages** (`src/blog/templates/blog-details.html`, `blog-list.html`): Ad containers implemented with separate `blog-ads.js` script for `blog` location.
- ✅ **Ad Placement Summary**: Ad engine now fully functional across all major pages:
  - Property Detail: Topbar + Sidebar ✅
  - Building Detail: Topbar + Sidebar ✅ (newly added)
  - Home Page: Home ads ✅ (newly added)
  - Developer Home: Home ads ✅ (newly added)
  - Property Search: Search + Inline + Map Below ✅
  - Blog Pages: Blog ads ✅

---

## 6. User Module Templates

### Authentication Flow (`src/user/templates/auth/*.html`)
- ✅ **UI**: Complete redesign from scratch (2025-01-XX) with modern two-column grid layout (`lg:grid-cols-[1fr_1fr]`), context-aware hero sidebars, and refined form inputs across all auth templates (signup, login, email_verification, forgot_password, forgot_password_verification, update-password, complete_profile). New design system: color palette (`#f2f3f4`, `#b8e9e0`, `#00deb6`, `#53535fcc`, `#114f8d`, `#262637`, `#000433`), fonts (Alegreya Sans & David Libre), unified styling with improved spacing, shadows, and hover states. All templates use consistent error/success message rendering with icons and responsive design patterns.
- ✅ **UX**: Context-aware messaging differentiation—auth pages detect `?from=developer` or `?from=buyer` URL parameter to show appropriate messaging (developer-focused: "90%+ cost savings", "Free until first sale" vs buyer-focused: "Verified listings", "Compare properties"). Comprehensive ARIA accessibility implementation across all auth forms. Enhanced form UX with better visual hierarchy, improved error states, modern button designs with icons, and clear CTAs. **Security Fix (2025-01-XX)**: Fixed open redirect vulnerability in `is_safe_url()` function—now properly rejects protocol-relative URLs (`//evil.com`) and validates with `urlparse` to prevent security issues.
- 🌟 **Redesign 2025-01-XX**: Complete redesign from scratch with modern design patterns, context-aware messaging, improved visual hierarchy, and refined user experience. Side panels use gradient backgrounds (`bg-gradient-to-br from-[#f2f3f4] via-[#f2f3f4] to-[#b8e9e0]/30`), feature cards with backdrop blur, and consistent iconography. Form inputs have improved focus states, hover effects, and better spacing.
- ✅ **Copy Optimization** (2025-01-XX): All auth pages updated with benefit-driven headlines and descriptions. Login: "Get back to managing your properties faster" (developer) / "Access your saved properties and price alerts" (buyer). Signup: "Sell Your Unsold Inventory at a Fraction of Launch Costs" (developer) / "Find Your Perfect Bangkok Property—Verified, Transparent, Trusted" (buyer). Password reset: "Reset your password—it takes 30 seconds" with clear expectations. Email verification: "Verify your email and unlock your account" with benefit-focused sidebar. All meta tags updated to reflect new messaging.

### Profile Completion & Settings (`src/user/templates/auth/profile/*.html`)
- ✅ **UI**: Complete Tailwind redesign with two-column grid layout matching auth forms, modern form inputs, consistent spacing, and hero sidebars. SEA country codes added to phone selectors.
- ✅ **UX**: Comprehensive ARIA attributes added, contextual guidance explains data collection, enhanced error handling with field-specific feedback, proper form validation, and improved user feedback. Profile completion form includes dynamic Google Maps autocomplete initialization for address fields.
- 🌟 **Audit 2025-11-23**: Updated sidebar background gradients and icons to use Teal accent tokens (`bg-accent/10`, `text-accent`).
- ✅ **Copy Optimization** (2025-01-XX): Form placeholders updated for clarity (e.g., "e.g. ABC Real Estate", "Tell buyers about your company—years of experience, specialties, languages spoken..."). Dropdown options updated ("Choose your role" vs "Select User Type"). Button text updated ("Finish setup" vs "Complete Profile", "Save changes" vs "Update Profile").

### Emails (`src/user/templates/email/*.html`)
- ✅ **UI**: Redesigned transactional email templates (`account_verification.html`, `forgot_password_email.html`) with modern styling, improved typography, and consistent branding.
- ✅ **UX**: Added ARIA attributes (`role="button"`, `aria-label`) to email links for accessibility, improved call-to-action prominence, clearer next steps messaging.
- ✅ **Copy Optimization** (2025-01-XX): Account verification email updated to be more welcoming ("Welcome to Wizer Properties! Verify Your Account") with benefit-focused body copy. Password reset email updated to be more direct and reassuring with clear warnings about link expiry. Schedule acceptance/cancellation emails updated with clearer next steps and more helpful messaging.

---

## 7. Blog Module Templates

### `src/blog/templates/blog-list.html`
- ✅ **UI**: Tailwind hero banner with sponsored Splide slider, filter chip toolkit, and responsive card grid with hover states.
- ✅ **UX**: Vanilla fetch-based filtering with load more control, badges for reads/likes, and empty-state messaging for no results.
- 🌟 **Audit 2025-11-23**: Updating loader spinner to Teal accent.
- ✅ **SEO** (2025-01-XX): Complete meta tags (title, description, keywords, canonical, Open Graph, Twitter Cards) and Organization schema implemented.

### `src/blog/templates/blog-details.html`
- ✅ **UI**: Gradient intro, Tailwind prose article body, share actions, and related stories grid; legacy CSS removed.
- ✅ **UX**: Author/read-time metadata surfaced, like/dislike controls modernised, accessible share links, and personalised related-content feed.
- 🌟 **Audit 2025-11-23**: Updating category badges, icons, and share buttons to use Teal accent.
- ✅ **SEO** (2025-01-XX): Enhanced article meta tags (published_time, modified_time, article tags), Article schema JSON-LD, and Breadcrumb schema. Breadcrumbs added to view context.

---

## 8. Schedule Module Templates

### `src/schedule/templates/create_schedule.html`
- ✅ **UI**: Tailwind scheduling workspace with carded stepper, Splide sliders styled via tokens, and property summary panel with skeleton state.
- ✅ **UX**: Modern fetch workflow, inline alerts, selection highlights, and contextual copy for confirmation/edit flows.
- 🌟 **Audit 2025-11-23**: Header badge updated to Teal accent.

### `src/schedule/templates/email/schedule_accept.html`
- ✅ **UI**: Responsive email shell with gradient header, summary card, and branded CTA built with inline Tailwind-inspired tokens.
- ✅ **UX**: Clear confirmation messaging, next steps guidance, and support contact block.

### `src/schedule/templates/email/schedule_cancel.html`
- ✅ **UI**: Cancellation email redesign with status badge, action buttons, and muted alert palette.
- ✅ **UX**: Provides explanation, reschedule CTA, and concierge escalation paths to reduce drop-off.

### `src/schedule/templates/*.html`
- **UI**: Refresh scheduling forms and list views with Tailwind components.
- **UX**: Clarify appointment statuses, improve calendar interactions, and ensure scheduling confirmation flows are intuitive.

---

## 9. Core & Miscellaneous Templates

### `src/core/templates/home.html`
- ✅ **UI**: `home.html` fully rebuilt with Tailwind primitives — gradient hero, trust badges, benefit grid, developer CTA, modular Splide carousels, and updated blog spotlight. Updated with new color scheme and fonts (Alegreya Sans & David Libre). Remaining landing/utility pages inherit refreshed typography but keep UI uplift on the roadmap.
- ✅ **UX**: Home experience now follows 2025 landing page best practices (clarity, social proof, urgency). Hero search clarifies outcomes for international buyers, trust signals are surface-level, and developer/guide funnels support key conversion paths. Localised onboarding copy & CTA hierarchy tuned for remote investors.
- ✅ **Layout Fix** (2025-11-10): Rebuilt property card component from scratch to fix layout issues in Splide carousels. Replaced fixed-width grid layout with vertical flexbox design that works seamlessly in both full-width search results and constrained slider contexts. Styles organized in `home.css` with proper flex display rules for slider slides.
- 🌟 **Audit 2025-11-23**: Color balance audit. Updated all section badges (Trusted developers, Bangkok spotlight, Picked for you, Bangkok areas, Beyond Bangkok, For developers, Insights, Buyer resources) to `bg-accent/10 text-primary` (Teal BG + Purple Text). Secondary icons updated to `text-accent` (Teal) or `text-primary` on `bg-accent/10` backgrounds. This reduces purple dominance and balances the brand palette.
- ✅ **Copy Optimization** (2025-01-XX): Complete copy restructuring following high-converting landing page principles. Hero headline emphasizes risk elimination ("Buy your Bangkok property with confidence—no scams, no hidden fees, no surprises"). Trust band reframed as benefit-focused guarantees. Added problem/amplify section addressing common pain points. Buyer resources reframed as questions. CTAs updated to be action-oriented ("Find My Verified Property", "Get free account"). Meta tags updated to reflect new benefit-driven messaging.
- ✅ **SEO** (2025-01-XX): Comprehensive meta tags (title, description, keywords, canonical, Open Graph, Twitter Cards) and Organization schema JSON-LD implemented. Template uses `{% load seo_tags %}` and `{% organization_schema %}` for structured data.

### `src/core/templates/home_developer.html`
- ✅ **UI**: New developer-focused homepage (2025-01-XX) with modern design matching buyer homepage structure. Uses new color scheme and fonts. Hero section emphasizes cost savings ("Sell Your Unsold Inventory at a Fraction of Launch Costs"), problem statement, solution overview, how it works, comparison tool, pricing preview, FAQ, and final CTA sections.
- ✅ **UX**: Developer-focused messaging throughout—emphasizes 90%+ cost savings, free trial until first sale, direct buyer access, no commission fees. Clear CTAs: "Get Started Free" and "Book a Demo". Pricing section links to dedicated pricing page. FAQ addresses developer concerns.
- ✅ **Copy Optimization** (2025-01-XX): Complete copy aligned with developer personas and positioning memo. Headlines emphasize cost savings and business outcomes. Problem statement addresses unsold inventory and high launch costs. Solution highlights subscription model and credit system. CTAs action-oriented.
- ✅ **Button Consistency Fix (2025-12-XX)**: Fixed button sizing inconsistency—"Get Started Free" button now uses same explicit padding (`px-8 py-4`) and font styling (`text-base font-semibold`) as "Book a Demo" button for consistent appearance across both CTA buttons.

### `src/core/templates/developers_pricing.html`
- ✅ **UI**: New developer pricing page (2025-01-XX) with comprehensive pricing comparison (Traditional Launch vs Wizer Properties), detailed credit system explanation, subscription model breakdown, FAQ section, and final CTA. Uses new color scheme and fonts. Modern card-based layout with clear visual hierarchy.
- ✅ **UX**: Transparent pricing presentation with side-by-side comparison showing 90%+ savings. Credit system clearly explained (100 free credits, 3 credits per featured/discount listing). Free trial messaging prominent. FAQ addresses common pricing questions. Clear CTAs throughout.
- ✅ **Copy Optimization** (2025-01-XX): Benefit-focused copy emphasizing cost savings, transparency, and value. Comparison table shows traditional launch costs (150,000+ MYR) vs Wizer subscription model. Credit costs clearly explained. FAQ answers developer concerns about pricing, credits, and cancellation.
- ✅ **SEO** (2025-01-XX): Comprehensive meta tags (title, description, keywords, canonical, Open Graph, Twitter Cards) and Organization schema JSON-LD implemented.
- ✅ **Button Consistency Fix (2025-12-XX)**: Fixed button sizing inconsistency—"Get Started Free" button now uses same explicit padding (`px-8 py-4`) and font styling (`text-base font-semibold`) as "Talk to Sales" button for consistent appearance.

### `src/core/templates/contact_us.html`
- ✅ **UI**: Tailwind contact hero with backdrop overlay, dual card layout for contact details and form, removed legacy `contact.css`, and aligned spacing/typography with design tokens.
- ✅ **UX**: Accessible form with inline validation, modern fetch-based submission, success/error alert messaging, clarified operating hours, and direct contact options surfaced for quick routing.
- 🌟 **Audit 2025-11-23**: Updating badges and contact icons to use Teal/Accent colors.
- ✅ **Copy Optimization** (2025-01-XX): Headline updated to set clear expectations ("Ask us anything—we respond within 24 hours"). CTA changed from "Send message" to "Get my answer" for action-orientation. Meta tags updated to reflect new messaging.
- ✅ **SEO** (2025-01-XX): Complete meta tags (title, description, keywords, canonical, Open Graph, Twitter Cards) and Organization schema implemented.

### `src/core/templates/about-us.html`
- ✅ **UI**: Story-driven Tailwind page with gradient hero, three-card highlight grid, mission/metrics sections, and leadership spotlight; removed inline styles.
- ✅ **UX**: Reframed copy around mission, market outcomes, and team expertise with scannable bullets; emphasised data points and support pathways for investor confidence.
- 🌟 **Audit 2025-11-23**: Updating badges and key metric labels to use Teal/Accent colors.
- ✅ **Copy Optimization** (2025-01-XX): Headline reframed to emphasize benefit ("We eliminate the risk and confusion of buying property in Bangkok"). Cards updated to highlight benefits ("No scams, ever", "Complete price transparency", "Buy from anywhere, in your language"). Meta tags updated to align with new trust-focused messaging.
- ✅ **SEO** (2025-01-XX): Complete meta tags (title, description, keywords, canonical, Open Graph, Twitter Cards) and Organization schema implemented.

### `src/core/templates/privacy.html`
- ✅ **UI**: Converted to Tailwind prose within a layered card, hero introduction, and policy sections with clear hierarchy; stripped legacy styling.
- ✅ **UX**: Structured policy into numbered sections, added actionable bullet lists, privacy contact CTA, and timestamped update notice for transparency.
- 🌟 **Audit 2025-11-23**: Updating badge to Teal/Purple balance.
- ✅ **Copy Optimization** (2025-01-XX): Headline updated to be more trust-focused ("Your data is safe with us—here's how"). Content emphasizes "We never sell your personal information." Meta tags updated to reflect new messaging.
- ✅ **SEO** (2025-01-XX): Complete meta tags with `noindex` directive for privacy page, canonical URL, and Open Graph tags.

### `src/core/templates/404.html`
- ✅ **UI**: Created Tailwind error card with background overlay, responsive typography, and dual CTA buttons aligned to design system tokens.
- ✅ **UX**: Added clear recovery paths (home, property search, support), contextual copy, and consistent tone to reassure users.
- 🌟 **Audit 2025-11-23**: Updating error label and support link to use Teal accent.
- ✅ **Copy Optimization** (2025-01-XX): Headline updated to be more user-friendly ("Oops! That page doesn't exist"). Meta tags updated to reflect new messaging.

### Home Helper AI (`src/core/templates/chat.html`, `src/wizerproperties/static/js/chatbot-gpt.js`)
- ✅ **UI**: Rebuilt as a Tailwind card with scrollable conversation history, quick-prompt chips, and elevated messaging patterns; removed legacy Bootstrap-era markup and external stylesheet.
- ✅ **UX**: Modern fetch-based controller (no jQuery) provides optimistic updates, request state feedback, keyboard shortcuts (Enter to send, Shift+Enter for newline), and resilience messaging when the AI endpoint is unavailable.
- ✅ **Accessibility**: SR-only labels, focus outlines, live status indicator, and polite copy keep the assistant compliant with WCAG expectations.
- ✅ **Data Resilience**: Property cards now ship with gallery/developer image fallbacks to shield carousels from missing media; nearby slider defers API calls until geolocation is granted, avoiding console noise and empty responses.
- ✅ **Copy Optimization** (2025-01-XX): Complete copy restructuring for clarity and benefit-focus. Empty state updated to be more inviting. Quick prompts reframed as direct questions ("What developer incentives can I get?"). Placeholder text provides examples. Status message simplified ("Getting your answer…"). Error messages more helpful and reassuring. Backend system prompts aligned with brand voice emphasizing trust and expertise. Disclaimer updated to be more user-friendly.
- ✅ **Layout Fixes (2025-12-XX)**: Fixed chat layout issues—moved prompt buttons ("Find Properties" and "Property Questions") inside scrollable chat history container for better UX. Replaced static "Getting your answer…" status message below input with dynamic typing indicator bubble within chat history. Typing indicator shows animated ping dot with "Getting your answer…" text, automatically removed when response arrives.
- ✅ **OpenRouter Integration & Property Search** (2025-01-XX): Integrated OpenRouter API for AI chatbot functionality. **Model Selection**: Uses `openai/gpt-4o-mini` (cost-effective model that supports function calling) instead of `openrouter/auto` which doesn't support function calling. Removed manual model selection from AdminSettings; API key configuration streamlined. Backend tracks which model was selected for each response. **Property Search Function**: Implemented OpenAI function calling with `search_properties` tool—allows AI to search properties when users ask about finding listings. Function automatically extracts search criteria (price, bedrooms, location, property type) from natural language queries. **Smart Intent Detection**: Keyword detection automatically forces function calling when property search intent is detected ("show me", "find", "condo", "villa", "million", "baht", etc.). **Internal API Calls**: Uses Django's `RequestFactory` for internal property API calls instead of external HTTP requests—avoids network issues, handles authentication properly, faster and more reliable. **Enhanced Prompts**: Improved system prompts with explicit instructions on when to use search function and how to format results cleanly. **Response Formatting**: Clean, concise property listings with bullet points (•) separating info, no verbose labels, formatted as "**Title** • ฿Price • XBR • Location [View Property](url)". **2025-01-XX**: Enhanced error handling—frontend displays actual API error messages, improved content validation, better user feedback. Fixed AdminSettings singleton pattern—smart record selection prefers records with API key when multiple exist, allows cleanup of duplicates via admin interface. Comprehensive logging added for debugging function calls and API responses.

### Admin Customizations (`src/core/admin.py`, `src/core/models.py`)
- ✅ **UI/UX** (2025-01-XX): Enhanced AdminSettings admin interface:
  - **List Display**: Added `has_openai_key` method showing "✅ Configured" or "❌ Not Set" status for OpenRouter API key visibility
  - **Form Layout**: Moved "🤖 AI Chatbot Configuration" section to top of fieldsets with prominent header and improved description
  - **Field Organization**: API Keys section now first fieldset with clear instructions and help text
  - **Model Simplification**: Removed manual AI model selection dropdown—using OpenRouter Auto Router (`openrouter/auto`) for automatic optimal model selection
  - **Status Tracking**: Admin can quickly see API key configuration status without opening edit form
- ✅ **UX**: Streamlined configuration workflow—single API key field with clear guidance, automatic model selection eliminates manual choice complexity
- ✅ **Singleton Pattern & Data Integrity** (2025-01-XX):
  - **Custom Form**: `AdminSettingsForm` with API key validation, whitespace stripping, and format checking
  - **Singleton Enforcement**: `has_add_permission()` prevents creating multiple records, `has_delete_permission()` allows deletion only when duplicates exist for cleanup
  - **Smart Record Selection**: `get_admin_settings()` function prefers records with API key when multiple exist, falls back to most recently updated record
  - **Duplicate Detection**: Warning messages in admin when multiple records detected, `get_queryset()` shows all records for cleanup
  - **Error Handling**: Comprehensive logging to track which record is being used and why
  - **Save Method**: `save_model()` ensures API key whitespace is stripped before saving

---

## 10. Static Media & Asset Handling

### Image Assets (`src/wizerproperties/static/media/*`)
- **UI**: Audit logos/backgrounds for resolution and consistency; plan replacements if they no longer fit the refreshed brand.
- **UX**: Ensure alt text and descriptive captions are defined in templates to improve accessibility.

### JS/CSS Build Pipeline
- ✅ **UX**: Tailwind CLI + npm scripts configured for efficient local development and cache-busted production builds.
- ✅ **UI**: PurgeCSS scoped correctly to avoid stripping required Tailwind classes.
- ✅ **Docker Integration** (2025-01-XX): Added `docker-entrypoint.sh` script for automatic migrations:
  - **Database Readiness Check**: Waits for PostgreSQL to be ready before running migrations
  - **Automatic Migrations**: Runs `python manage.py migrate --noinput` on container startup
  - **Static Files**: Collects static files automatically (`collectstatic --noinput`)
  - **Application Startup**: Executes main command (Gunicorn/Django server) after setup
  - **Error Handling**: Graceful handling of static file collection failures
  - **Dockerfile Updates**: Entrypoint script copied and made executable, ENTRYPOINT configured
  - **Docker Compose**: Updated to use entrypoint pattern (removed `bash -c` wrappers)
  - **Benefits**: No manual migration commands needed, production-ready pattern, prevents race conditions with database
- ✅ **Static Files Configuration** (2025-01-XX): Fixed static files serving:
  - **Corrected Path**: Updated `STATICFILES_DIRS` to point to `wizerproperties/static/` where files actually exist
  - **URL Patterns**: Changed to use `staticfiles_urlpatterns()` for automatic serving from `STATICFILES_DIRS` in DEBUG mode
  - **Media Files**: Properly configured `MEDIA_URL` and `MEDIA_ROOT` for user-uploaded files
  - **Benefits**: Static files now load correctly, CSS/JS files served with proper MIME types, no more 404 errors for static assets

---

## 10a. SEO & Analytics Implementation

### SEO Meta Tags & Structured Data
- ✅ **UI/UX** (`src/core/templates/home.html`): Comprehensive meta tags (title, description, keywords, canonical, Open Graph, Twitter Cards) and Organization schema JSON-LD. **2025-01-XX**: Full SEO implementation with template tags.
- ✅ **UI/UX** (`src/property/templates/get_property.html`): Dynamic property-specific meta tags, Product schema JSON-LD, Breadcrumb schema, property images for social sharing. **2025-01-XX**: Complete SEO for property pages.
- ✅ **UI/UX** (`src/blog/templates/blog-list.html`, `blog-details.html`): Article meta tags, Article schema JSON-LD, Breadcrumb schema, category keywords. **2025-01-XX**: Blog SEO complete.
- ✅ **UI/UX** (`src/core/templates/contact_us.html`, `about-us.html`, `privacy.html`): Page-specific meta tags, Organization schema, proper canonical URLs. Privacy page includes `noindex` directive. **2025-01-XX**: Static page SEO complete.

### Sitemap & Robots.txt
- ✅ **UX** (`src/core/sitemaps.py`): Dynamic XML sitemap generation with 4 sections:
  - Static pages (home, contact, about, privacy, search, blog list, reels) - Priority 1.0, Monthly
  - Property listings (all active properties) - Priority 0.8, Weekly
  - Blog posts (all published posts) - Priority 0.7, Monthly
  - Buildings/Projects (all active buildings) - Priority 0.6, Monthly
  - Includes last modified dates, auto-updates on content changes. **2025-01-XX**: Sitemap operational at `/sitemap.xml`.
- ✅ **UX** (`src/core/views/seo.py`): Dynamic robots.txt generation blocking admin, API, user, and management pages while allowing public content. Includes sitemap reference. **2025-01-XX**: Robots.txt operational at `/robots.txt`.

### Analytics Tracking
- ✅ **UX/UI** (`src/wizerproperties/static/js/analytics.js`): Centralized analytics module supporting:
  - Google Analytics 4 (GA4) - Measurement ID: `G-MRZK1TTB7H`
  - Meta Pixel (Facebook Pixel) - Configurable via environment variable
  - PostHog - API Key: `phc_9rRjJCeqbR89x5Lgc3imxOq8guqKc9rJHGBN5GKhmZM`
  - Unified event tracking API with automatic platform-specific mapping
  - Ecommerce tracking for property listings
  - Helper methods for common events (property views, favorites, comparisons, searches, signups, logins). **2025-01-XX**: Analytics system operational.
- ✅ **UX** (`src/wizerproperties/templates/base.html`): Analytics initialization with configuration from Django context. GA4, Meta Pixel, and PostHog loaded and initialized. **2025-01-XX**: Analytics integrated in base template.
- ✅ **UX** (`src/property/templates/get_property.html`): Property view tracking on page load with comprehensive property data. **2025-01-XX**: Property analytics tracking live.
- ✅ **UX** (`src/wizerproperties/static/js/property/compair-favorite.js`): Analytics tracking integrated for favorite and compare actions. Tracks add/remove events with property data. **2025-01-XX**: User interaction tracking complete.

### SEO Utilities & Template Tags
- ✅ **UX** (`src/utils/seo.py`): SEO utility functions:
  - `generate_meta_tags()` - Comprehensive meta tag generation
  - `generate_property_schema()` - Product JSON-LD for properties
  - `generate_building_schema()` - Place JSON-LD for buildings
  - `generate_organization_schema()` - Organization JSON-LD
  - `generate_article_schema()` - Article JSON-LD for blog posts
  - `generate_breadcrumb_schema()` - Breadcrumb JSON-LD
  - `get_site_url()` - Site URL helper. **2025-01-XX**: SEO utilities complete.
- ✅ **UX** (`src/core/templatetags/seo_tags.py`): Django template tags for easy schema injection (moved from `utils/templatetags/` to `core/templatetags/` for Django compatibility):
  - `{% organization_schema %}` - Organization schema
  - `{% property_schema property %}` - Property Product schema
  - `{% building_schema building %}` - Building Place schema
  - `{% article_schema post %}` - Blog Article schema
  - `{% breadcrumb_schema breadcrumbs %}` - Breadcrumb schema. **2025-01-XX**: Template tags operational in core app.
- ✅ **UX** (`src/property/models/default.py`, `src/building/models/default.py`, `src/blog/models.py`): Added `get_absolute_url()` methods to Property, Building, and Post models for sitemap generation and canonical URLs. **2025-01-XX**: Model methods complete.
- ✅ **UX** (All templates): Comprehensive SEO meta tags added to all pages:
  - **Public pages (12)**: Home, property detail, building detail, blog list, blog detail, contact, about, privacy, search pages, developer/agent listings, reels - all with full meta tags and appropriate schemas
  - **User-specific pages (12)**: All auth pages (login, signup, forgot password, email verification, complete profile, update password, profile settings), comparison, favorites, schedule creation, 404 - all with `noindex, follow` directives
  - **Admin/management pages (13)**: All create/update pages, dashboards, advertising pages, promotion management - all with `noindex, follow` directives. **2025-01-XX**: Complete SEO coverage across entire platform.

### Breadcrumbs
- ✅ **UX/UI** (Property, Building, Blog detail pages): Breadcrumbs implemented with dual purpose:
  - **Visual Navigation**: HTML breadcrumb navigation displayed for users (e.g., "Home > Properties > Property Details")
  - **Structured Data**: JSON-LD Breadcrumb schema generated via `{% breadcrumb_schema breadcrumbs %}` template tag for search engines
  - Breadcrumbs context added to views (`property/views/property.py`, `building/views.py`, `blog/views.py`)
  - Schema.org BreadcrumbList structure includes position, name, and URL for each breadcrumb item
  - **2025-01-XX**: Breadcrumb navigation and SEO structured data complete on property, building, and blog detail pages.
- 🌟 **Recommended**: Add breadcrumbs to search results pages (with applied filters), developer/agent property listings, comparison page, and favorite list page for improved navigation and SEO.

### Configuration & Settings
- ✅ **UX** (`src/wizerproperties/settings/base.py`): Analytics configuration:
  - `GA4_MEASUREMENT_ID` - Default: `G-MRZK1TTB7H`
  - `META_PIXEL_ID` - Configurable via environment variable
  - `POSTHOG_API_KEY` - Default: `phc_9rRjJCeqbR89x5Lgc3imxOq8guqKc9rJHGBN5GKhmZM`
  - `POSTHOG_HOST` - Default: `https://us.i.posthog.com`
  - Added `django.contrib.sitemaps` to INSTALLED_APPS. **2025-01-XX**: Configuration complete.
- ✅ **UX** (`src/utils/custom/context_processors.py`): Context processor passes analytics IDs to templates. **2025-01-XX**: Context processor updated.
- ✅ **UX** (`src/wizerproperties/urls.py`): Added sitemap and robots.txt routes. **2025-01-XX**: URL routing complete.

### Documentation
- ✅ **UX** (`docs/seo-analytics-implementation.md`): Comprehensive consolidated guide covering:
  - SEO implementation (meta tags, structured data, sitemap, robots.txt, breadcrumbs)
  - Analytics overview and architecture (GA4, Meta Pixel, PostHog)
  - Configuration (environment variables, settings)
  - Event tracking methods and examples
  - Breadcrumb implementation (visual navigation + structured data)
  - Testing and validation procedures
  - Current analytics configuration with specific IDs
  - Implementation checklist
  - Troubleshooting guide
  - Quick reference for template tags and utilities. **2025-01-XX**: Complete consolidated documentation available.

### CRM Integration
- ✅ **UX/UI** (`src/utils/zoho_crm.py`): Zoho CRM integration utility module providing:
  - OAuth2 authentication with automatic token refresh
  - Lead creation from contact form submissions with real estate-specific custom fields
  - Contact management (create/update/search) with property preferences
  - Deal creation for property viewing schedules with comprehensive property details
  - Record search to prevent duplicates
  - Record updates to existing leads/contacts
  - Notes/activities creation for tracking inquiries and property views
  - Comprehensive error handling and logging
  - Real estate-specific field support: property type, preferred location, budget range, bedrooms, bathrooms, building info, property URLs, and more
  - **2025-01-XX**: Enhanced Zoho CRM integration module complete with real estate optimizations.
  - **Code Quality (2025-01-XX)**: Improved error logging—changed `logger.error()` to `logger.exception()` in 4 locations (`_get_access_token`, `_make_request`, `sync_contact_to_crm`, `sync_schedule_to_crm`) to preserve full stack traces for better debugging.
- ✅ **UX** (`src/wizerproperties/templates/base.html`): Zoho SalesIQ widget integrated for live chat functionality. Widget code: `siq2fd15ec878c972695203786423fd2bfe16724f6a241f02927b924a0534d7edf1`. Loads on all pages automatically. **2025-01-XX**: SalesIQ widget operational.
- ✅ **UX** (`src/core/api/views.py`): Contact form submissions automatically sync to Zoho CRM as Leads with smart duplicate handling. If a Lead/Contact already exists, adds a note instead of creating duplicates. Supports real estate preferences (property type, location, budget, bedrooms, bathrooms). Non-blocking implementation—CRM sync failures don't break form submissions. **2025-01-XX**: Enhanced contact form CRM sync live. **Code Quality (2025-01-XX)**: Moved logger initialization to module level (removed inline import), changed to use `response.data` instead of `request.data` to get actual persisted values, improved exception handling with `logger.exception()` to preserve stack traces.
- ✅ **UX** (`src/schedule/api/views.py`): Property viewing schedules automatically create/update Contacts and create Deals in Zoho CRM with comprehensive real estate data. Includes:
  - Property details: title, ID, URL, bedrooms, bathrooms, size, floor, building name/type/status, location, completion year
  - Financial: property price as deal amount
  - User demographics: name, email, phone, gender, address
  - Schedule: visiting time, asset type
  - Real estate custom fields mapped to Zoho CRM fields (Property_Type, Property_URL, Building_Name, Location, Bedrooms, Bathrooms, Property_Size, Floor_Number, Building_Status, Completion_Year, Property_ID)
  - **2025-01-XX**: Enhanced schedule CRM sync live with full property context.
  - **Code Quality (2025-01-XX)**: Removed duplicate logger initialization, fixed exception handler (removed unused variable, fixed f-string), improved error logging.
- ✅ **UX** (`src/wizerproperties/static/js/analytics.js`): Added `trackCrmSync()` method to track CRM sync events in PostHog. Tracks event type, entity type, entity ID, and success status. **2025-01-XX**: CRM event tracking integrated.
- ✅ **UX** (`src/wizerproperties/settings/base.py`): Zoho CRM configuration added:
  - `ZOHO_CRM_ENABLED` - Enable/disable flag
  - `ZOHO_CRM_CLIENT_ID` - OAuth2 client ID
  - `ZOHO_CRM_CLIENT_SECRET` - OAuth2 client secret
  - `ZOHO_CRM_REFRESH_TOKEN` - OAuth2 refresh token
  - `ZOHO_CRM_API_DOMAIN` - API domain (region-specific). **2025-01-XX**: Configuration complete.
- ✅ **UX** (`docs/zoho-crm-integration.md`): Comprehensive documentation covering:
  - Features overview (SalesIQ widget, CRM sync)
  - Integration points (contact form, schedule creation)
  - Real estate-specific custom fields and field mappings
  - Configuration guide (environment variables, OAuth2 setup)
  - API methods and usage examples (including record updates and notes)
  - PostHog integration details
  - Error handling and troubleshooting
  - Testing procedures
  - Real estate-specific features and supported custom fields
  - Future enhancements. **2025-01-XX**: Complete documentation with real estate enhancements available.

---

## 11. Componentization & Reuse

### New Reusable Partials to Introduce
- `templates/components/form-field.html`
- `templates/components/section-header.html`
- `templates/components/upload-tile.html`
- ✅ `templates/components/property/card.html` (implemented) — shared across search, favorites, developer listings via `property/card-factory.js`. Rebuilt from scratch (2025-11-10): replaced problematic grid layout with vertical flexbox design (image on top, content below) for proper display in both full-width and slider contexts. Enhanced with responsive image heights, proper text truncation (line-clamp), overflow handling, and improved spacing. **2025-11-25**: Removed `h-full` from wrapper to prevent excessive height stretching. Fixed static default image path. **2025-01-XX**: Complete UX/UI redesign with enhanced iconography, developer header, featured accent bar, improved button consistency, media buttons, card clickability, compact minimalistic design. **2025-12-04 (Typography Standardization)**: Unified card template for all views (home, search, map). Typography aligned to site-wide design system: 16px (`text-base`) for body, 14px (`text-sm`) for secondary, 12px (`text-xs`) minimum. Font weights: 400 (normal) dominant, 500 (`font-medium`) for emphasis, 700 (`font-bold`) only for price. "Book Viewing" CTA and date moved to header bar. Property stats section below image with icon+text format.
- ~~`templates/components/property/card-map-view.html`~~ **Deprecated 2025-12-04** — Removed in favor of unified `card.html` template. Map view now uses the same card design as home/search pages for consistency.
- ✅ `templates/components/property/filter-panel.html` (implemented 2025-11-10) — componentized filter panel with modular `initPropertyFilters(options)` function in `js/property/filter-init.js`; used across search and map views.
- **UI**: Centralize styling through shared partials to avoid drift.
- **UX**: Guarantee consistent behavior (validation hints, helper text, error states) across modules.

### Shared Context Helpers
- **UX**: Provide template tags or context processors to feed status badges, feature chips, and breadcrumbs without duplicating logic.

---

## 12. Documentation & Process

### `docs/design-decision-log.md` (to be created)
- **UX**: Log flow decisions, user dilemmas, and research insights.
- **UI**: Record visual rationale (color/contrast choices, typography pairings).
- **Property Components**: Shared card/filter patterns documented inline within this audit; standalone `property-component-plan.md` consolidated and removed.
- 🌟 **Quality Assurance Support**: `scripts/submit_projects_units.py` now seeds researched building + unit fixtures through the authenticated API, giving designers consistent data when reviewing Tailwind forms and detail views locally.

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

### `docs/seo-analytics-implementation.md`
- ✅ **UX/UI**: Comprehensive consolidated guide covering:
  - SEO implementation (meta tags, structured data, sitemap, robots.txt, breadcrumbs)
  - Analytics architecture (GA4, Meta Pixel, PostHog)
  - Configuration and environment variables
  - Event tracking methods and examples
  - Breadcrumb implementation (visual navigation + structured data)
  - Testing and validation procedures
  - Current analytics configuration with specific IDs
  - Implementation checklist
  - Troubleshooting guide
  - Quick reference for template tags and utilities. **2025-01-XX**: Complete consolidated documentation delivered.

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

1. ✅ **Componentise Search Filters**: Converted `search-filter-box.html` into reusable `components/property/filter-panel.html` partial with modular `initPropertyFilters(options)` function (2025-11-10). **v1.0 Complete**
2. ✅ **Modernise Compare/Favorite JS**: Refactored `property/compair-favorite.js` to use fetch API, removed jQuery dependencies, integrated with card factory button states, and emits proper events for count syncing (2025-11-10). **v1.0 Complete**
3. ◻️ **Splide Helper Module**: Extract lazy gallery mounting into `static/js/modules/property-card-gallery.js` for reuse across detail/search/favorites. **Deferred to v1.1**

---

## v1.0 Release Summary

**Release Date**: January 2025  
**Branch**: `ux-fix`

### Completed Modules (v1.0)
- ✅ Global foundations (base templates, Tailwind config, design tokens)
- ✅ Building module (create, update, detail pages)
- ✅ Property module (all CRUD operations, search, comparison, favorites)
- ✅ Advertise module (analytics, performance, reels)
- ✅ User module (authentication, profile, emails)
- ✅ Blog module (list, details)
- ✅ Schedule module (creation, email templates)
- ✅ Core templates (home, contact, about, privacy, 404, chat)
- ✅ SEO & Analytics (meta tags, structured data, sitemap, robots.txt, analytics tracking)

### Deferred to v1.1+
- ◻️ Legacy CSS cleanup (`main.js` migration, remaining stylesheet deprecation)
- ◻️ Image asset audit and optimization
- ◻️ Splide gallery helper module extraction
- ◻️ Additional componentization (form-field, section-header, upload-tile partials)
- ✅ Admin template customization (AdminSettings improvements completed 2025-01-XX)
- ◻️ Design decision log documentation
- ◻️ Full accessibility checklist documentation
- ◻️ Additional SEO enhancements (hreflang tags for multi-language, LocalBusiness schema, VideoObject schema, FAQPage schema)

### Key Metrics
- **Templates migrated**: 50+ templates fully converted to Tailwind
- **JavaScript modules modernized**: 20+ files updated with modern patterns
- **Copy optimization**: Complete restructuring across all user-facing pages, forms, cards, search pages, AI chat, JavaScript messages, and email templates following high-converting landing page principles (benefit-driven messaging, clear CTAs, trust signals, PASTOR framework)
- **Accessibility improvements**: Comprehensive ARIA implementation across all auth flows
- **Component reuse**: Shared property card and filter panel components
- **Performance**: Lazy loading, image fallbacks, and optimized data handling
- **SEO implementation**: Meta tags on 37+ pages (12 public, 12 user-specific, 13 admin), 5 schema types (Organization, Product, Place/Building, Article, Breadcrumb), dynamic sitemap with 4 sections, robots.txt
- **Analytics integration**: 3 platforms (GA4, Meta Pixel, PostHog), 8+ event types tracked, centralized tracking module
- **CRM integration**: Enhanced Zoho CRM and SalesIQ integrated—contact form and schedule creation automatically sync leads, contacts, and deals with real estate-specific data (property preferences, building details, demographics). Features include smart duplicate handling, record updates, notes/activities tracking, and comprehensive property information in deals. Live chat widget operational on all pages
- **Code quality & security**: Fixed 13 CodeRabbit review issues including security vulnerabilities (open redirect fix, Map shadowing fix), bug fixes (filter logic, price validation, retry limits), improved error logging (`logger.exception` instead of `logger.error`), enhanced error handling (JSON.parse, localStorage), and code cleanup (removed commented font code)
- **AI Chatbot enhancements**: OpenRouter API integration with `openai/gpt-4o-mini` model (supports function calling), property search functionality via OpenAI function calling, smart intent detection for automatic function triggering, internal Django RequestFactory for reliable API calls, clean property listing formatting, streamlined admin configuration with status indicators, enhanced error handling with actual API error messages, fixed AdminSettings singleton pattern with smart record selection, comprehensive logging for debugging
- **Docker & deployment**: Automatic migration execution via entrypoint script, database readiness checks, streamlined container startup workflow
- **Static files & media**: Fixed STATICFILES_DIRS configuration, improved static file serving in DEBUG mode, proper MIME type handling
- **Analytics improvements**: Fixed PostHog initialization (changed from inline snippet to script tag to avoid array property conflicts), improved error handling
- **Ad Engine Implementation (2025-01-XX)**: Fixed API queryset filtering to include `status='running'`, added ad support to building detail page (topbar + sidebar), added ad support to home pages (buyer and developer), ad engine now fully functional across all major pages (property detail, building detail, home pages, search pages, blog pages)

