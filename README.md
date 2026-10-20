# Agnee 2026 · Official Festival Website & 3D Campus Experience

![Agnee 2026 Banner](data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1200'%20height='300'%20viewBox='0%200%201200%20300'%3E%3Crect%20width='1200'%20height='300'%20fill='%230a0514'/%3E%3Ctext%20x='600'%20y='150'%20fill='%23e0b860'%20font-family='Georgia,serif'%20font-size='90'%20font-weight='700'%20text-anchor='middle'%3Eagnee%202026%3C/text%3E%3Ctext%20x='600'%20y='210'%20fill='%23fff'%20font-family='system-ui'%20font-size='24'%20text-anchor='middle'%3EThe%20Annual%20Cultural%20Fest%20of%20Gati%20Shakti%20Vishwavidyalaya%2C%20Vadodara%3C/text%3E%3C/svg%3E)

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA-orange.svg)](#)
[![3D Engine](https://img.shields.io/badge/3D%20Engine-Three.js%20r128-blue.svg)](#)
[![Testing](https://img.shields.io/badge/Tested%20with-Playwright-45ba4b.svg)](#)

**Agnee 2026** is the flagship digital platform and interactive festival website for the annual cultural festival of **Gati Shakti Vishwavidyalaya (GSV), Vadodara** (Central University under the Ministry of Railways, Government of India).

Designed and engineered as an industry-grade festival experience, it combines a cinematic dark-and-gold visual direction, comprehensive event discovery, a conflict-aware personal planner, multi-track schedule, registration adapters, and a signature **3D interactive campus map** of the university grounds.

---

## 🚀 Quick Start

Because the project utilizes native ES modules and JSON data fetches, it must be served over an HTTP server.

```bash
# 1. Clone the repository
git clone https://github.com/rishavgsv/Agnee26.git
cd Agnee26

# 2. Start the local server (zero-dependency Node.js HTTP server)
npm start
# or: node server.js
```

Then visit: **[http://localhost:8000/](http://localhost:8000/)**

### Alternative Run Methods

- **Python:**
  ```bash
  python -m http.server 8000
  ```
- **npx serve:**
  ```bash
  npx serve .
  ```

---

## 🌟 Key Features

### 1. Cinematic Hero & Brand Showcase
- **Original Wordmark Asset**: Displays the official Agnee 2026 lettering wordmark (`WMURI` asset) across titles.
- **Announcement Ticker**: Dynamic updates bar rotating real-time bulletins and campus notices.
- **Dates & Venue Status**: Pre-festival placeholders with automated countdown timer activating once dates are configured.
- **Action CTAs**: Immediate pathways to register and launch the 3D campus fly-in.

### 2. Events Discovery & Competition Hub
- **8 Dynamic Categories**: Music, Dance, Drama, Fine Arts, Fashion, Literary, Photography/Film, and Esports.
- **Filter & Search Engine**: Debounced instant search, category chips, day pills, and "Open Only" toggle.
- **Event Detail Modal / Bottom Sheet**: Complete rulebooks, eligibility criteria, judging weights, schedule slots, and organizer contacts.
- **Deep Linking**: Direct "Show on 3D Map" button flying the camera to the specific competition venue.

### 3. "My Plan" Personal Itinerary & Calendar Export
- **Local Storage Drafts**: Save events to your personal schedule with one tap (`★`).
- **Conflict Detection**: Automatically warns delegates if overlapping competitions occur in the same stage or time window.
- **RFC 5545 iCalendar (.ics) Export**: Export individual competitions or your complete 3-day itinerary directly to Google Calendar, Apple Calendar, or Outlook.

### 4. Schedule & Stage Tracks
- **Day Tabs**: Day 1 (Heritage & Folkloric Rhythms), Day 2 (Fusion & Band Battles), Day 3 (Runway & Grand Finale).
- **Dual Visualizations**: Multi-track stage column grid on desktop and vertical timeline on mobile.
- **Live Status Indicator**: Real-time awareness in `Asia/Kolkata` (IST) timezone.

### 5. Signature 3D Campus Map Experience
- **Gati Shakti Vishwavidyalaya in 3D**: Illustrated campus model rendering the Pratap Vilas Palace, academic buildings, hostels, and Oval Ground festival arena.
- **Lazy-Loaded Three.js**: Initial page load does not download or block on Three.js; launches seamlessly on user opt-in or scroll intersection.
- **Google Earth-Style Navigation**: Camera fly-tos, smooth orbital controls, landmark cards, search, and layer toggles.
- **Event Pins Overlay**: Tapping pins on stages flies the 3D camera to the landmark and opens the competition sheet.
- **Walking Directions**: Calculates approximate walking duration and step-by-step route preview from the Main Gate to any campus landmark.
- **Capture Poster**: High-resolution screenshot export tool with Agnee branding watermark.
- **Accessibility Fallback**: Full textual landmark directory for screen readers and low-bandwidth networks.

### 6. Registration & Passes Hub
- **Adapter Pattern**:
  - *Default Adapter*: Direct external links to official portals (Unstop, Google Forms) with campaign UTM tags.
  - *Optional Adapter*: On-site multi-step application form with draft caching in `localStorage`, client validation, and honeypot anti-spam protection.
- **Pass Tiers Matrix**: Clear tier breakdowns (Delegate Pass, Competitor Pass, College Contingent) marked with transparent TBA states.
- **Campus Ambassador Programme**: Student representative referral perks and tracking.

### 7. Tiered Sponsor Showcase & Partnerships
- **Tiered Wall**: Title Sponsor, Powered By, Associate Sponsors, and Supporting Partners.
- **Downloadable Deck**: Corporate sponsorship brochure download link and direct alliance inquiries.

### 8. Transit, Stay & Safety Guidelines
- **Transit Routes**: Step-by-step transit guides from Vadodara Junction Railway Station (BRC, 5 km) and Vadodara Airport (BDQ, 10 km).
- **Campus Guidelines**: Accommodation assistance rules, gate security protocols, and safety norms.

### 9. Media Gallery, FAQ & Anti-Spam Contact
- **Click-to-Load Video**: Privacy-friendly aftermovie embed that loads zero third-party cookies or frames until explicit click.
- **Accessible Accordion**: FAQ categorized across registrations, eligibility, and rules with keyboard ARIA navigation.
- **Honeypot Contact Form**: Anti-bot safeguards preventing automated submissions.

---

## 🛠 Tech Stack & Architecture

- **Architecture**: Framework-free native ES modules (`<script type="module">`). Zero mandatory build step required.
- **Styling**: Vanilla CSS custom properties (Design tokens for dark + gold theme, glassmorphism, 12-col desktop / 4-col mobile grid, GPU animations).
- **3D Engine**: Three.js (r128) isolated in `src/modules/` and lazy-loaded on demand.
- **Data Layer**: Fully decoupled in `/data/*.json` (`site.json`, `events.json`, `schedule.json`, `guests.json`, `sponsors.json`, `team.json`, `faqs.json`, `places.json`).
- **PWA & Offline**: Web App Manifest (`manifest.webmanifest`), Service Worker (`sw.js`) with cache-first and stale-while-revalidate strategies, and dedicated `offline.html` page.

---

## 📋 Available Scripts

The project includes helpful npm scripts configured in `package.json`:

| Script | Command | Description |
|---|---|---|
| `npm start` | `node server.js` | Runs the zero-dependency local HTTP server on port 8000 |
| `npm run dev` | `node server.js` | Development alias for `npm start` |
| `npm test` | `npx playwright test` | Executes the end-to-end test suite across desktop & mobile viewports |
| `npm run test:ui` | `npx playwright test --ui` | Opens Playwright's interactive visual UI test runner |
| `npm run lint` | `npx eslint src/**/*.js` | Checks code formatting and syntax standards |
| `npm run format` | `npx prettier --write "**/*.{js,json,css,html,md}"` | Auto-formats code and markdown files |

---

## 📂 Project Structure

```text
Agnee/
├── index.html                   # Semantic HTML5 shell with crawler pre-renders & JSON-LD
├── styles.css                   # Base 3D engine canvas styles
├── festival.css                 # Festival design system & component styles
├── manifest.webmanifest         # PWA web app manifest
├── sw.js                        # Offline service worker
├── 404.html                     # 404 error page
├── offline.html                 # Offline fallback page
├── styleguide.html              # Internal component & tokens style guide
├── server.js                    # Zero-dependency local Node.js HTTP server
├── data/                        # Decoupled festival data layer
│   ├── site.json                # General festival metadata & announcements
│   ├── events.json              # Cultural events, rules, criteria
│   ├── schedule.json            # Timeline tracks & stage slots
│   ├── guests.json              # Headliners, judges, reveal states
│   ├── sponsors.json            # Sponsor tiers & deck link
│   ├── team.json                # Organizing committee
│   ├── faqs.json                # Categorized FAQs
│   └── places.json              # Campus landmarks & 3D poses
├── docs/                        # Architectural documentation
│   ├── PLAN.md                  # Evolution plan & architecture decisions
│   ├── MODULES.md               # Complete module directory
│   ├── CONTENT.md               # Data schemas & organizer guide
│   ├── REGISTRATION.md          # Registration adapter data flow & privacy
│   ├── DEPLOY.md                # Deployment guide & security headers
│   └── PLACEHOLDERS.md          # Organizer checklist of pending data
├── src/
│   ├── main.js                  # Main application orchestrator
│   ├── core/                    # Core reactive state, routing, data loading
│   │   ├── store.js             # Reactive store with localStorage
│   │   ├── data-loader.js       # Data fetcher & memory cache
│   │   ├── router.js            # Hash-based deep link router
│   │   ├── ics-export.js        # iCalendar (.ics) generator
│   │   ├── analytics.js         # Privacy-friendly analytics hook
│   │   └── i18n.js              # Multi-lingual dictionary
│   ├── ui/                      # Modular UI component renderers
│   │   ├── nav.js               # Sticky glass header, drawer, action dock
│   │   ├── hero.js              # Wordmark asset, countdown, ticker
│   │   ├── about.js             # Fest story and GSV introduction
│   │   ├── events.js            # Events discovery & modal sheet
│   │   ├── my-plan.js           # Conflict-aware personal planner
│   │   ├── schedule.js          # Schedule timeline & tracks
│   │   ├── lineup.js            # Headliners & adjudicators
│   │   ├── map-section.js       # 3D canvas mount, pins, directions
│   │   ├── sponsors.js          # Tiered sponsor wall
│   │   ├── gallery.js           # Media grid & click-to-load video
│   │   ├── team.js              # Committee directory
│   │   ├── register.js          # Pass matrix & registration flows
│   │   ├── travel.js            # Transit guide & safety norms
│   │   ├── faq.js               # Accessible accordion
│   │   ├── contact.js           # Anti-spam inquiry form
│   │   ├── footer.js            # Semantic footer with legal modals
│   │   └── toast.js             # Toast feedback alerts
│   ├── boot.js                  # Wordmark image asset & loader
│   ├── app.js                   # 3D runtime bootstrap
│   └── modules/                 # Three.js WebGL campus scene modules
└── tests/                       # E2E test suite
    └── e2e.spec.js              # Playwright mobile & desktop tests
```

---

## ✏️ Content Management for Organizers

Festival organizers can update rules, guest lineups, and schedules without touching any application code.
- Data format specifications: [`docs/CONTENT.md`](docs/CONTENT.md)
- Organizer pending items checklist: [`docs/PLACEHOLDERS.md`](docs/PLACEHOLDERS.md)
- Registration flows & pass tiers: [`docs/REGISTRATION.md`](docs/REGISTRATION.md)

---

## 🧪 Testing

To run tests:
```bash
npm test
```
The suite verifies:
- Clean page load with zero console errors
- Hash routing and deep linking
- Event filtering, search debounce, and detail modal
- "My Plan" addition, removal, and `.ics` download
- 3D map lazy-loading activation and landmark fly-to
- On-site registration draft validation and honeypot protection
- Keyboard navigation and WCAG 2.2 accessibility compliance

---

## 📜 License & Credits

Designed and built for **Agnee 2026** at **Gati Shakti Vishwavidyalaya, Vadodara**.  
Campus 3D model, illustrations, and web application developed with pride by the Agnee Web & Creative Tech Team.
