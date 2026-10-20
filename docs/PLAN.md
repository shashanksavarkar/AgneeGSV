# Agnee 2026 Evolution Plan

## 1. Executive Summary
Transform "Agnee 2026 · Campus in 3D" from an isolated 3D campus viewer into an industry-grade college cultural festival website standing alongside Mood Indigo, Saarang, Oasis, and Cognizance. The 3D campus map and Google Earth-style fly-in serve as the signature storytelling spine, accompanied by a comprehensive information architecture, rich event discovery, conflict-aware personal planner, schedule timeline, tiered sponsor wall, registration adapter, and accessible, responsive presentation.

---

## 2. Architecture Decision: Option A (Native ES Modules + Zero Build Static Hosting)
**Decision**: Option A (Framework-free native ES modules, static deployment compatible with GitHub Pages, Cloudflare Pages, Netlify).
**Justification**:
1. **Zero-overhead & Instant Deployment**: The site can be hosted statically and viewed directly via any HTTP server (`npx serve`, `python -m http.server`) without a mandatory build step.
2. **Performance Budget**: Standard framework runtimes (React/Vue/Next) add 40-100KB+ of initial JS overhead before hydration. Native ES modules with vanilla DOM templates achieve under 50KB gzipped initial JS (excluding lazy-loaded 3D WebGL code), easily satisfying Lighthouse 90+ mobile budgets.
3. **Decoupled 3D Isolation**: The Three.js WebGL canvas and campus simulation are lazy-loaded only when requested (or as the visitor scrolls into the map experience), ensuring instant first contentful paint (FCP) and optimal Largest Contentful Paint (LCP < 2.5s).
4. **Data-Driven Architecture**: All festival content (events, schedule, guests, sponsors, team, FAQs, campus places) is decoupled into `/data/*.json` schemas, allowing organizers to update content without editing source code.

---

## 3. Scope of Additions & Work Breakdown

### Phase 1: Architecture, Data Layer & Design Tokens
- Create `/data/*.json` (`site.json`, `events.json`, `schedule.json`, `guests.json`, `sponsors.json`, `team.json`, `faqs.json`, `places.json`).
- Document schemas in `docs/CONTENT.md`.
- Establish design system tokens in `styles.css` (dark + gold palette, typography, glass panels, 12-column desktop / 4-column mobile grid, motion curves, z-index hierarchy).
- Create state management (`src/core/store.js`) and data loader (`src/core/data-loader.js`).

### Phase 2: Shell, Navigation, Router & Cinematic Hero
- Deep-linking client-side router (`src/core/router.js`) handling hash routes, document titles, meta tags, and canonical URLs.
- Accessible sticky glass navigation header + mobile bottom quick-action dock (`src/ui/nav.js`).
- Cinematic Hero (`src/ui/hero.js`) featuring the original Agnee 2026 logo lettering wordmark (`WMURI` asset), announcement ticker, dates & venue placeholders, countdown timer (configurable), primary "Register" CTA, and "Explore the Campus" 3D fly-in launcher.
- About Agnee & GSV factual overview (`src/ui/about.js`).

### Phase 3: Events Discovery, Personal Planner & Schedule
- Filterable, searchable Events Hub (`src/ui/events.js`) with category chips (Music, Dance, Drama, Literary, Art & Design, Fashion, Photography, Gaming), text search with debounce, day filter, card states, detail modal/bottom-sheet.
- "My Plan" (`src/ui/my-plan.js`) with localStorage persistence, conflict-aware timeline visualization, and `.ics` iCalendar export (`src/core/ics-export.js`).
- Schedule Timeline & Stage Grid (`src/ui/schedule.js`) with day tabs, mobile vertical timeline, desktop multi-track stage grid, and live "Happening Now" / "Up Next" status (Asia/Kolkata timezone).

### Phase 4: Signature 3D Campus Map Integration
- Dedicated full-screen and embedded map experience (`src/ui/map-section.js` & `src/modules/earth-ui.js`).
- Event Pins overlaid on the 3D map linking directly to event registration and detail sheets.
- Navigation & Directions preview from Main Gate to Oval Ground / Stage with walking distance and duration.
- Poster-quality view capture tool ("Capture" button exporting canvas screenshot with watermark).
- Lazy-loading Three.js with lightweight canvas poster and Lite mode fallback.
- Screen-reader accessible textual alternative listing all landmarks and walking directions.

### Phase 5: Festival Content Sections
- Line-up & Celebrities / Judges with reveal states (`src/ui/lineup.js`).
- Tiered Sponsor Wall (`src/ui/sponsors.js`) with Title, Powered by, Associate, Partner tiers, and "Become a Sponsor" deck link.
- Media Gallery & Aftermovie (`src/ui/gallery.js`) with lazy-loaded grid and privacy-friendly click-to-load video embed.
- Team directory (`src/ui/team.js`) for core student coordinators and faculty advisors.
- Stay & Travel guide (`src/ui/travel.js`) for GSV Vadodara (Railways, Airport, Road routes, accommodation guidelines).
- Accessible FAQ accordion (`src/ui/faq.js`).
- Anti-spam Contact form (`src/ui/contact.js`) with honeypot and client rate limiting.
- Semantic Footer (`src/ui/footer.js`) with legal policies (Privacy, Terms, Code of Conduct) and festival credits.

### Phase 6: Registration & Passes Hub
- Registration module (`src/ui/register.js`) with adapter interface:
  - Default: External links (Google Forms / Unstop / Official Portal with UTM tracking).
  - Optional: Client-side multi-step registration modal with draft saving, input validation, and endpoint submission.
- Passes tier comparison matrix (TBA placeholders).
- Campus Ambassador referral section (`docs/REGISTRATION.md`).

### Phase 7: SEO, PWA, Styleguide & Fallbacks
- Rich metadata in `index.html` (Open Graph, Twitter Cards, Schema.org JSON-LD Event, Organization, Breadcrumbs).
- `manifest.webmanifest`, `sw.js` service worker (offline caching for assets and schedule).
- Offline fallback page (`offline.html`) and custom 404 page (`404.html`).
- Internal style guide page (`styleguide.html`).
- Privacy-friendly analytics hook (`src/core/analytics.js`).

### Phase 8: Quality Engineering, Tests, CI & Documentation
- Playwright E2E test suite (`tests/e2e.spec.js`) covering navigation, search, modal dialogs, My Plan, .ics export, map launch, offline mode, and axe-core accessibility checks.
- GitHub Actions CI workflow (`.github/workflows/ci.yml`).
- Documentation updates: `docs/MODULES.md`, `docs/CONTENT.md`, `docs/REGISTRATION.md`, `docs/DEPLOY.md`, `docs/PLACEHOLDERS.md`, and `README.md`.

---

## 4. Files Touched and Created
- **Created**:
  - `docs/PLAN.md` (this file)
  - `docs/CONTENT.md`
  - `docs/REGISTRATION.md`
  - `docs/DEPLOY.md`
  - `docs/PLACEHOLDERS.md`
  - `data/site.json`
  - `data/events.json`
  - `data/schedule.json`
  - `data/guests.json`
  - `data/sponsors.json`
  - `data/team.json`
  - `data/faqs.json`
  - `data/places.json`
  - `src/core/router.js`
  - `src/core/store.js`
  - `src/core/data-loader.js`
  - `src/core/ics-export.js`
  - `src/core/analytics.js`
  - `src/core/i18n.js`
  - `src/ui/nav.js`
  - `src/ui/hero.js`
  - `src/ui/about.js`
  - `src/ui/events.js`
  - `src/ui/my-plan.js`
  - `src/ui/schedule.js`
  - `src/ui/lineup.js`
  - `src/ui/map-section.js`
  - `src/ui/sponsors.js`
  - `src/ui/gallery.js`
  - `src/ui/team.js`
  - `src/ui/register.js`
  - `src/ui/travel.js`
  - `src/ui/faq.js`
  - `src/ui/contact.js`
  - `src/ui/footer.js`
  - `src/ui/toast.js`
  - `src/main.js` (application entry point coordinating UI and lazy-loaded 3D runtime)
  - `styleguide.html`
  - `404.html`
  - `offline.html`
  - `manifest.webmanifest`
  - `sw.js`
  - `robots.txt`
  - `sitemap.xml`
  - `tests/e2e.spec.js`
  - `.github/workflows/ci.yml`
  - `package.json`
- **Updated**:
  - `index.html` (transformed into full festival website shell)
  - `styles.css` (expanded with complete festival design tokens and responsive layout rules)
  - `docs/MODULES.md` (documented new modules and boundaries)
  - `README.md` (updated project documentation)
