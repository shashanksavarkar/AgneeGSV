# Agnee 2026 - Tech Stack

Official festival website and 3D campus experience for Agnee 2026, the annual cultural festival of Gati Shakti Vishwavidyalaya (GSV), Vadodara.

In short: a **framework-free, build-step-free static web app** (vanilla JavaScript ES modules, handwritten CSS) with a **Three.js** 3D campus map, packaged as an offline-capable **PWA**, deployed on **Vercel**, and tested with **Playwright**.

---

## 1. At a Glance

| Layer | Technology |
|---|---|
| Language | JavaScript (ES2022, native ES modules), HTML5, CSS3 |
| Framework | None (vanilla JS, no React/Vue/Svelte) |
| Bundler / build | None (files are served as-is) |
| 3D engine | Three.js r128, loaded from cdnjs |
| Styling | Handwritten CSS (`styles.css`, `festival.css`), CSS custom properties |
| Fonts | Google Fonts: Cinzel Decorative, Inter, Spectral |
| Offline / install | Service Worker + Web App Manifest (PWA) |
| Backend | None. Contact form posts to a Google Apps Script web app that writes to Google Sheets |
| Local dev server | Custom zero-dependency Node.js `http` server with SSE live reload (`server.js`) |
| Testing | Playwright (`@playwright/test` ^1.64) |
| Lint / format | ESLint, Prettier, EditorConfig |
| Hosting / CI | Vercel (project `agnee26`), GitHub Actions manual production deploy |
| Runtime dependencies | **0** (only one devDependency: Playwright) |

---

## 2. Frontend

### 2.1 Languages and module system
- Plain **ES modules** (`<script type="module" src="src/main.js">`), `"type": "module"` in `package.json`.
- ESLint targets `es2022` + browser env. No TypeScript, no JSX, no transpilation.
- Runs directly in modern browsers, so it must be served over HTTP (not `file://`) because modules and data are fetched.

### 2.2 Application structure (`src/`)

| Path | Role |
|---|---|
| `src/main.js` | Entry point: bootstraps the app, registers the Service Worker, scroll-reveal via `IntersectionObserver` |
| `src/app.js` | Loads shared HTML section partials with `fetch()` |
| `src/boot.js` | Lazy-loads the heavy 3D part (Three.js fallback loader, `IntersectionObserver`-triggered start) |
| `src/core/router.js` | Hash-based deep-link router; updates document title, meta description, canonical link per section |
| `src/core/store.js` | Tiny reactive state store with safe `localStorage` persistence (registration draft, map layers, preferences) |
| `src/core/i18n.js` | Dictionary-based internationalization, ready for English / Hindi / Gujarati |
| `src/core/ics-export.js` | Builds `.ics` calendar files client-side (Blob + `URL.createObjectURL`) for "My Plan" export |
| `src/core/analytics.js` | Privacy-first analytics dispatcher, off by default; forwards to Plausible or Umami if present |
| `src/ui/*.js` | One module per page section: nav, hero, about, events, schedule, lineup, map-section, sponsors, gallery, merch, team, faq, contact, developers, footer, toast, scrollbar, particles, social-icons |
| `src/modules/*.js` | The 3D layer: campus scene, festival scene, camera effects, landing/animation loop, place data, Earth-style UI, runtime context |

### 2.3 Data layer (`data/`)
- `data/data.js` - events, schedule, line-up, sponsors, team, socials as JS modules (about 420 lines).
- `data/places.js` - campus landmarks and coordinates for the 3D map (about 240 lines).
- No database. All content is static and bundled with the site.

### 2.4 3D campus map
- **Three.js r128**, loaded from `cdnjs.cloudflare.com` (`three.min.js`), global `THREE`.
- Scene is **fully procedural**: no glTF models. Textures are generated at runtime with `CanvasTexture`, with sRGB encoding and anisotropic filtering.
- Techniques in use: instanced meshes for the crowd (smaller crowd on mobile), icosahedron-based tree canopies, LED screen canvas textures, a day/dusk toggle, and a "lite" mode for weak devices.
- Camera-flight cinematics, Raycaster-style place picking and layer toggles (buildings, labels, roads, trees, crowd, fest, dusk, lite) persisted via the store.
- Web Share API (`navigator.share`) with clipboard fallback for sharing places.

### 2.5 Styling
- Two handwritten stylesheets: `styles.css` (about 450 lines, base) and `festival.css` (about 4,800 lines, theme and components).
- No Tailwind, Sass, or CSS-in-JS. Design tokens via CSS custom properties.
- Cultural dark-and-gold visual direction. Decorative SVG assets in `assets/elements/` (diya, rangoli corner, ghungroo, mask, mic, petal, feather, butterfly, curtain, divider).
- Fonts via Google Fonts with `preconnect`: **Cinzel Decorative** (display), **Inter** (UI), **Spectral** (serif body/italic).
- `styleguide.html` documents the design system.

### 2.6 Assets
- Images are mostly **WebP** (logo, team, sponsors, gallery); PNG for PWA icons and the Open Graph image.

---

## 3. PWA and Offline

- **Service Worker** (`sw.js`, cache `agnee-2026-v72`):
  - `data/` requests: stale-while-revalidate.
  - Same-origin HTML/JS/CSS: network-first with cache fallback, falling back to the cached `index.html` for failed navigations.
  - External resources (CDN scripts, fonts): cache-first.
  - Old caches are deleted on activate; `controllerchange` handled in `main.js`.
- **Web App Manifest** (`manifest.webmanifest`): standalone display, theme/background `#07050a`, 192 and 512 px icons.
- `404.html` is provided as a fallback page.

---

## 4. SEO and Metadata

- Canonical URL `https://agnee.gsv.ac.in/`, Open Graph and Twitter Card tags, `og-image.png` (1200x630).
- Schema.org **JSON-LD** structured data in `index.html`.
- `robots.txt` and `sitemap.xml`.
- Per-route title and description updates from `router.js`.

---

## 5. Backend and Integrations

| Concern | Approach |
|---|---|
| Contact form | `src/ui/contact.js` posts to a **Google Apps Script** web app; `docs/contact-sheet.gs` appends rows to a Google Sheet and neutralizes spreadsheet-formula injection (`= + - @` prefix) |
| Registration | Adapter pattern (see `docs/REGISTRATION.md`): default is redirect to external gateways (Unstop / Google Forms / Eventbrite) with UTM tags; payment data never touches this site |
| Analytics | Optional, consent-aware; Plausible or Umami hooks via `window.plausible` / `window.umami` |
| Calendar | Client-side `.ics` generation |
| Video | YouTube embeds via `youtube-nocookie.com` |
| State persistence | `localStorage` only (wrapped in try/catch) |

There is no server-side runtime, no database and no authentication.

---

## 6. Tooling

| Tool | Config | Purpose |
|---|---|---|
| Node.js (ES modules) | `package.json` | Runs `server.js` and Playwright |
| `server.js` | custom | Static server with MIME map, path-traversal protection, 404 fallback, and **live reload** over Server-Sent Events (`/__reload`, `fs.watch`) |
| ESLint | `.eslintrc.json` | `no-unused-vars` warn, `prefer-const` warn |
| Prettier | `.prettierrc.json` | semicolons, single quotes, 2 spaces, no trailing commas, width 100 |
| EditorConfig | `.editorconfig` | Consistent editor settings |

### npm scripts
```
npm start | npm run dev   # node server.js
npm test                  # npx playwright test
npm run test:ui           # Playwright UI mode
npm run lint              # eslint src/**/*.js
npm run format            # prettier --write
```

---

## 7. Testing

- **Playwright** end-to-end suite in `tests/e2e.spec.js`: clean page load with zero console errors, metadata checks, navigation across sections, and more.
- Four device projects in `playwright.config.js`:
  - Desktop Chrome (1440x900)
  - Pixel 7 (mobile)
  - iPhone SE (small mobile)
  - iPad Mini (tablet)
- CI settings: retries 2, single worker, `forbidOnly`. Reporter: HTML. Trace on first retry, screenshots on failure.

---

## 8. Deployment and CI/CD

- **Host: Vercel**, project `agnee26` (linked via `.vercel/project.json`). Served as a static site with no build command.
- **GitHub Actions** (`.github/workflows/prod-deploy.yml`), manually triggered (`workflow_dispatch`):
  1. `vercel pull --environment=production`
  2. `vercel build --prod`
  3. `vercel deploy --prebuilt --prod`
  Requires secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- `docs/DEPLOY.md` also covers Cloudflare Pages, Netlify and GitHub Pages, plus recommended security headers and CSP (needs `cdnjs.cloudflare.com`, `fonts.googleapis.com`, `fonts.gstatic.com`, and YouTube for frames).

---

## 9. External Services Summary

| Service | Used for |
|---|---|
| cdnjs.cloudflare.com | Three.js r128 |
| fonts.googleapis.com / fonts.gstatic.com | Web fonts |
| script.google.com | Contact form endpoint (Apps Script) |
| youtube-nocookie.com | Embedded video |
| Vercel | Hosting and deployment |
| GitHub | Source control and Actions |

---

## 10. Design Decisions

- **No framework, no bundler**: tiny footprint, zero dependency churn, instant dev loop, easy for student contributors.
- **Static-first**: cheap, fast CDN hosting; content edits happen in `data/`.
- **Procedural 3D**: no heavy model downloads; textures drawn on canvas.
- **Performance guards**: lazy-load Three.js on scroll, mobile crowd reduction, lite mode.
- **Resilience**: Service Worker offline shell, safe storage access, graceful fallbacks.

---

## 11. Known Inconsistencies Worth Fixing

- `server.js` listens on port **8002**, but `playwright.config.js` (`baseURL` and `webServer.port`) and the README assume **8000**. Tests will only work if the server is started on 8000 or the config is aligned.
- Three.js is pinned to **r128** (2021) and uses the removed-in-later-versions `renderer`/texture `encoding` API. Upgrading needs `colorSpace` migration.
- `src/ui/gallery.js` contains a placeholder YouTube embed ID.
- Docs mention files that do not exist in the repo (`src/ui/register.js`, `data/site.json`, `data/events.json`); content now lives in `data/data.js`.
- `package.json` `lint` script and README claims should be re-checked against the current structure.
