# Agnee 2026 Architectural Module Map

The Agnee 2026 website follows a modular, framework-free native ES module architecture with a decoupled data layer, component renderers, and an isolated lazy-loaded 3D simulation engine.

---

## 1. High-Level Architecture

```
Agnee/
├── index.html                   # Semantic HTML5 shell with crawler pre-renders & JSON-LD
├── styles.css                   # Base 3D engine canvas styles & retrofits
├── festival.css                 # Comprehensive festival design system (dark + gold, responsive grid)
├── manifest.webmanifest         # PWA web app manifest
├── sw.js                        # Service worker with offline caching & stale-while-revalidate
├── 404.html                     # Branded 404 error page
├── styleguide.html              # Internal design system tokens & component showcase
├── data/                        # Static JSON data layer
│   ├── site.json                # Festival metadata, branding, announcements, social links
│   ├── events.json              # Competitions, rules, judging criteria, eligibility, prizes
│   ├── schedule.json            # Timeline tracks, stage slots, and Asia/Kolkata indicators
│   ├── guests.json              # Star night headliners, judges, and reveal states
│   ├── sponsors.json            # Tiered corporate sponsors and deck links
│   ├── team.json                # Faculty advisors and core student committee
│   ├── faqs.json                # Categorized participant questions
│   └── places.json              # Campus landmarks, venues, walking directions, 3D poses
├── src/
│   ├── main.js                  # Application orchestrator, data loader & DOM mounting
│   ├── core/                    # Core application logic & state
│   │   ├── store.js             # Tiny reactive store with localStorage persistence
│   │   ├── data-loader.js       # Asynchronous JSON fetcher & memory cache
│   │   ├── router.js            # Hash-based deep linking, meta tag updates, canonicals
│   │   ├── ics-export.js        # RFC 5545 iCalendar (.ics) generator for events & My Plan
│   │   ├── analytics.js         # Privacy-first, consent-aware analytics dispatcher
│   │   └── i18n.js              # Externalized multi-lingual strings dictionary
│   ├── ui/                      # Dependency-free component renderers
│   │   ├── nav.js               # Sticky glass header, mobile drawer, bottom action dock
│   │   ├── hero.js              # Wordmark asset, countdown, CTAs, announcement ticker
│   │   ├── about.js             # Fest story and GSV introduction
│   │   ├── events.js            # Search, category chips, day tabs, modal detail sheet
│   │   ├── my-plan.js           # Personal schedule builder with conflict alerts & .ics
│   │   ├── schedule.js          # Day tabs, mobile vertical timeline, desktop multi-track grid
│   │   ├── lineup.js            # Celebrity headliners & judges with reveal badges
│   │   ├── map-section.js       # 3D canvas mount, event pins, walking directions, screenshot
│   │   ├── sponsors.js          # Tiered wall (Title, Powered by, Associate, Partners)
│   │   ├── gallery.js           # Media grid and click-to-load video embed slot
│   │   ├── team.js              # Faculty advisors and student core coordinators
│   │   ├── register.js          # Pass comparison, external adapter & on-site multi-step flow
│   │   ├── travel.js            # Transit guide (rail/air/road), accommodation, safety rules
│   │   ├── faq.js               # Accessible category-filtered accordion
│   │   ├── contact.js           # Anti-spam contact form with honeypot and timing check
│   │   ├── footer.js            # Semantic footer with legal modals and credits
│   │   └── toast.js             # Micro-interaction toast alerts
│   ├── boot.js                  # Wordmark image data asset and Three.js boot loader
│   ├── app.js                   # 3D module loader function
│   └── modules/                 # Isolated Three.js WebGL simulation runtime
│       ├── runtime-context.js   # Three.js setup, textures, satellite ground map
│       ├── campus-scene.js      # Buildings, roads, palace, academic blocks, lighting
│       ├── festival-scene.js    # Oval ground, stage, crowd, light beams, students
│       ├── camera-effects.js    # Orbital controls, camera modes, cinematic transitions
│       ├── places.js            # Legacy 3D coordinates matching data/places.json
│       ├── earth-ui.js          # Map search, layer controls, compass, 2D/3D toggle
│       └── landing-and-loop.js  # Guided tour, telemetry, render loop
```

---

## 2. Contribution Boundaries

1. **Content & Copy**:
   - Never hardcode event details or sponsor names in JavaScript. Edit `/data/*.json` according to schemas documented in `docs/CONTENT.md`.
2. **Visual Design & Styling**:
   - Global design tokens, color variables, spacing, and component styling belong in `festival.css`.
   - Legacy 3D canvas viewport and Three.js HUD styles are preserved in `styles.css`.
3. **Component Logic**:
   - Each UI section is a self-contained renderer function in `src/ui/*.js` producing semantic HTML, attaching accessible event listeners, and querying state from `src/core/store.js`.
4. **3D Engine**:
   - Isolated in `src/modules/` and lazy-loaded via `src/ui/map-section.js` to ensure fast initial page load.
