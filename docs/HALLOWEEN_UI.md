# Agnee 2026 · Dark Halloween Skeuomorphic UI Spec

Single source of truth for the UI revamp. Every section below maps to an existing mount in `index.html`, an existing renderer in `src/ui/*.js` and an existing block in `festival.css`. Implement **one section at a time**, verify, then move on.

---

## Implementation status
All nine steps are implemented (festival.css theme layers, step 1–9). Deviations from this spec: wood-grain stripe texture removed; events toolbar/chips/results line, schedule status bar/day tabs and sponsor CTA banner hidden via one CSS rule at the end of the step-4 theme layer; 3D runtime lazy-boots from src/boot.js for performance; hero decor (moon, bats, cobwebs, graveyard) is CSS-only.

---

## 0. Ground Rules (read first)

1. **CSS-first.** The revamp lives in `festival.css` (tokens + components) and `styles.css` (3D HUD). No logic changes.
2. **Frozen:** all `id`s, class names, `data-*` attributes, ARIA attributes, visible text content that tests assert on, `src/core/*`, `src/modules/*` logic, `data/*.json` schemas, `sw.js` strategy. Add new classes; never rename or remove existing ones.
3. **Allowed minor markup/JS edits** (cosmetic only): wrapping an existing element in a decorative `<span aria-hidden="true">`, adding a decorative class, swapping an emoji/icon string in a renderer template, adding `<link>` for fonts in `index.html`, bumping `CACHE_NAME` in `sw.js` (`agnee-2026-v3` → `v4`) so users get the new CSS.
4. **No raster images.** All textures are CSS gradients / inline SVG data-URIs / `box-shadow` stacks. Keeps the zero-build, <50KB JS budget and offline cache intact.
5. **Accessibility is not negotiable:** body text contrast ≥ 4.5:1, focus ring always visible, tap targets ≥ 44px, `prefers-reduced-motion` disables every animation in §16.
6. **Skeuomorphism rule of thumb:** every surface must look like a physical object lit from the **top-left** — highlight on top/left edge, shadow on bottom/right, an inner bevel, and a material texture. Never flat colour + glass blur (the old look).
7. Test after each section: `npm run dev` (port 8000), `npm test`, and eyeball at 360px, 768px, 1280px.

---

## 1. Concept

**"The Haunted Festival Hall."** An old wooden-and-iron carnival at midnight: carved dark-oak panels, wrought-iron fittings, tarnished brass, ember-orange lantern light, cold green ghost-fire accents, wax-sealed parchment tickets, cobwebs in corners. Pumpkin orange is the hero colour; blood red and ghost green are accents; gold is retired to *tarnished brass* for hardware only.

Mood words: candlelit · weathered · carved · wax · iron · ember · cobweb · fog.

---

## 2. Design Tokens (replace the `:root` block in `festival.css`)

Keep the **same variable names** where they exist (so every rule keeps working) and re-point their values; add the new ones below.

```css
:root {
  /* Surfaces: night -> oak */
  --bg-dark:      #07050a;   /* page void */
  --bg-surface:   #110c12;   /* section base */
  --bg-card:      #1b1310;   /* carved oak card face */
  --bg-glass:     rgba(255, 180, 90, 0.04);
  --bg-glass-hover: rgba(255, 140, 40, 0.09);

  /* Old gold vars re-pointed -> pumpkin & brass (names kept on purpose) */
  --gold-primary: #ff7a1a;   /* pumpkin / primary accent */
  --gold-hover:   #ffa23d;   /* lit pumpkin */
  --gold-glow:    rgba(255, 122, 26, 0.50);
  --magenta-primary: #b3141f;/* blood red */
  --magenta-glow: rgba(179, 20, 31, 0.50);
  --cyan-accent:  #7dffb0;   /* ghost-fire green */
  --orange-accent:#ffb347;   /* candle flame */

  /* NEW material colours */
  --oak-1: #2a1c14;  --oak-2: #1b110c;  --oak-3: #0f0906;
  --iron-1:#3a3a40;  --iron-2:#1d1d22;  --iron-3:#0c0c0f;
  --brass-1:#c9a05a; --brass-2:#8a6a32; --brass-3:#4a3818;
  --parchment-1:#e8d5a8; --parchment-2:#cdb27c; --parchment-ink:#2b1a0c;
  --wax-red:#8e0f1c; --wax-red-hi:#c22a38;
  --ghost:#7dffb0;   --ghost-glow: rgba(125,255,176,0.35);
  --purple-night:#2a1240;

  /* Text */
  --text-main:      #f3e6d0;  /* warm bone */
  --text-secondary: #cdb9a0;
  --text-muted:     #8f7e6c;  /* use only for >=18px or decorative */
  --text-on-gold:   #1a0c02;  /* on pumpkin buttons */

  /* Borders */
  --border-glass:      rgba(255, 190, 120, 0.14);
  --border-glass-gold: rgba(255, 122, 26, 0.45);

  /* Light model: top-left key light */
  --hi:  inset 1px 1px 0 rgba(255, 220, 170, 0.18);          /* top-left rim light */
  --lo:  inset -1px -1px 0 rgba(0, 0, 0, 0.6);               /* bottom-right rim shade */
  --bevel: var(--hi), var(--lo);
  --recess: inset 0 3px 8px rgba(0,0,0,0.75), inset 0 -1px 0 rgba(255,200,140,0.06);
  --shadow-sm: 0 3px 6px rgba(0,0,0,.55), 0 1px 0 rgba(0,0,0,.8);
  --shadow-md: 0 10px 22px rgba(0,0,0,.65), 0 3px 6px rgba(0,0,0,.6);
  --shadow-lg: 0 24px 50px rgba(0,0,0,.8), 0 8px 16px rgba(0,0,0,.6);
  --shadow-gold: 0 0 22px rgba(255,122,26,.45), 0 0 4px rgba(255,160,60,.8); /* lantern glow */

  /* Radii: less pill, more carved block */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px; --radius-xl: 20px; --radius-full: 9999px;

  /* Fonts (see §3) */
  --font-display: "Creepster", "Pirata One", Georgia, serif;     /* H1 / wordmark only */
  --font-heading: "Cinzel Decorative", "Cinzel", Georgia, serif; /* section titles */
  --font-body:    "Spectral", Georgia, serif;                     /* long text */
  --font-sans:    "Inter", system-ui, -apple-system, "Segoe UI", sans-serif; /* UI, buttons, labels */
  --font-mono:    ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
```

`<meta name="theme-color">` in `index.html` and `manifest.webmanifest` → `#07050a`. Update the inline SVG favicon fill colours (`%230a0514` → `%2307050a`, `%23e0b860` → `%23ff7a1a`).

### Material recipes (define once as utility classes at the end of the tokens block, reuse everywhere)

| Class | Look | Recipe |
|---|---|---|
| `.mat-oak` | Carved dark wood panel | `background: repeating-linear-gradient(92deg, rgba(0,0,0,.18) 0 2px, transparent 2px 7px), repeating-linear-gradient(88deg, rgba(255,170,90,.035) 0 1px, transparent 1px 11px), linear-gradient(160deg, var(--oak-1), var(--oak-2) 55%, var(--oak-3)); box-shadow: var(--bevel), var(--shadow-md); border:1px solid #000;` |
| `.mat-iron` | Wrought-iron plate | `background: radial-gradient(circle at 20% 15%, var(--iron-1), var(--iron-2) 60%, var(--iron-3)); box-shadow: var(--bevel), var(--shadow-sm); border:1px solid #000;` + rivets via `::before/::after` (6px radial-gradient brass dots at corners) |
| `.mat-brass` | Tarnished brass trim | `background: linear-gradient(145deg, var(--brass-1), var(--brass-2) 55%, var(--brass-3)); color:#1a0c02; text-shadow:0 1px 0 rgba(255,230,170,.45);` |
| `.mat-parchment` | Aged paper ticket | `background: radial-gradient(ellipse at 30% 20%, var(--parchment-1), var(--parchment-2)); color: var(--parchment-ink); box-shadow: inset 0 0 40px rgba(90,50,10,.45), var(--shadow-md);` + burnt edge via `mask`/inset shadow |
| `.mat-recess` | Carved-in slot (inputs, tracks) | `background: #090605; box-shadow: var(--recess); border:1px solid #000; border-bottom-color: rgba(255,190,120,.12);` |
| `.mat-wax` | Wax seal | `background: radial-gradient(circle at 35% 30%, var(--wax-red-hi), var(--wax-red) 60%, #4a0610); box-shadow: inset -2px -3px 5px rgba(0,0,0,.55), inset 2px 2px 3px rgba(255,150,150,.35), 0 3px 6px rgba(0,0,0,.6);` |
| `.glow-flicker` | Candle light | `animation: flicker 3.2s infinite steps(1)` (defined in §16) |

`.glass-panel` (existing class used in many sections) must be **re-skinned as `.mat-oak`** — do not use `backdrop-filter` anywhere except the sticky header (perf).

---

## 3. Typography & Fonts

Add to `index.html` `<head>` (Google Fonts is the one allowed external; keep `display=swap`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Creepster&family=Inter:wght@400;600;700&family=Spectral:ital,wght@0,400;0,600;1,400&display=swap">
```

Add the three font hosts to the `sw.js` runtime-cache allow-list if it filters by origin (check before editing; do not change strategy).

| Use | Font | Size (mobile → desktop) | Notes |
|---|---|---|---|
| Hero "Agnee 2026" fallback H1, wordmark text | Creepster | 44 → 96px | Single use per page. letter-spacing .04em, drip text-shadow (§5). |
| `.section-title` | Cinzel Decorative 900 | 28 → 48px | Uppercase, brass-gradient text via `background-clip:text` + `0 2px 0 #000` shadow for letterpress feel. |
| `.section-kicker` | Inter 700 | 12 → 13px | Uppercase, .22em tracking, ghost-green, with a small bat/skull glyph before (CSS `::before`, §14). |
| Card titles / modal titles | Cinzel 700 | 18 → 22px | |
| Body | Spectral 400 | 16 → 17px, line-height 1.65 | |
| Buttons, chips, nav, labels, form fields | Inter 600/700 | 13–15px | Never decorative font (legibility). |

---

## 4. Global Atmosphere (applies to `body`, once)

Add on `body::before` (fixed, `pointer-events:none`, `z-index:0`, behind content):
- **Vignette:** `radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,.75))`.
- **Film grain/dust:** inline SVG feTurbulence data-URI at `opacity:.07`, `mix-blend-mode:overlay`.
- **Fog band:** two slow-drifting `linear-gradient` layers (`animation: fog-drift 60s linear infinite`, §16).

Page background: `var(--bg-dark)` with a very subtle `radial-gradient` of `--purple-night` at the top and `#1a0a04` ember glow at the bottom.

Section rhythm (`.section`): alternating tone — odd = void `--bg-dark`, even = `--bg-surface` with a **chain/rope divider** at the top (`::before`, a 10px tall `repeating-linear-gradient` of iron links, drop-shadow below). Remove the old gold hairline dividers.

---

## 5. Section 1 · Hero (`#hero-mount`, `.hero-section`, `hero.js`, `index.html` pre-render)

**Reference look:** a gate of a haunted carnival at night, huge moon, bats, lantern-lit wordmark.

- `.hero-mesh` → replace colour mesh with: night-sky gradient (`#07050a → #1a0a22 → #2a0f08` at the horizon), a **huge moon** (`radial-gradient(circle, #ffe9b8 0 55%, #f3c97a 70%, transparent 71%)`, 220–320px, top-right, soft outer glow `0 0 120px rgba(255,200,120,.35)`), and a **graveyard/tree silhouette** along the bottom as an inline-SVG `mask`/background (black `#050308`).
- `.hero-noise` → keep, re-tint (grain at .08).
- `.glow-orb.glow-gold/magenta/cyan` → pumpkin / blood / ghost orbs, `filter: blur(70px)`, opacity .35.
- `.hero-wordmark-wrapper` → mount the wordmark on a **hanging wooden sign**: `.mat-oak`, two iron chains (CSS pseudo-elements, 3px vertical `repeating-linear-gradient`) rising to the viewport top, a tiny swing (`animation: sign-sway 6s ease-in-out infinite`, ±1.2°, `transform-origin: top center`). `.hero-wordmark-img` gets `filter: drop-shadow(0 0 18px rgba(255,122,26,.55))`.
- `.hero-badge` → small **wax-seal** (`.mat-wax`) with brass text.
- `.hero-subtitle` → Spectral italic, warm bone, max-width 60ch.
- `.hero-meta-bar` (dates/venue) → `.mat-iron` strip with rivets; `.meta-icon` in pumpkin; `.meta-divider` as a carved vertical groove (2px `--oak-3` + 1px highlight).
- `.hero-countdown-container` / `.countdown-grid` / `.time-card` → each digit block is a **flip-clock / carved tablet**: `.mat-recess` window, digits in Cinzel 900 pumpkin with `text-shadow:0 0 12px var(--gold-glow)`, a thin brass horizontal split line across the middle, brass screws at corners. `.time-sep` = two glowing dots (ghost green). `.countdown-placeholder` = parchment scroll "Dates to be announced" (`.mat-parchment`).
- `.hero-cta-group`: `.btn-primary` = **pumpkin lacquer button** (§6), `.btn-secondary` = **iron button**.
- `.hero-ticker-wrapper` / `.ticker-track` / `.ticker-item` / `.ticker-badge` → **graveyard-fence ticker**: `.mat-iron` bar, items separated by tiny skull glyph (`::after` content `"☠"`), badge is a red wax-seal "LIVE".
- `.scroll-cue` / `.cue-indicator` → a small **hanging lantern** that bobs (`animation: lantern-bob 2.4s ease-in-out infinite`).
- Decorative (new, `aria-hidden`): 5–7 absolutely-positioned bats (inline SVG, black, wings flap via `transform: scaleY` keyframes, drifting across with `animation: bat-fly`). Cap at 7; hide ≤ 480px except 2.
- Corner **cobwebs** (inline SVG data-URI, `opacity:.5`) on `.hero-section` top-left and top-right.

Pre-rendered static `<section>` in `index.html` carries inline styles (`color:#e0b860`) → replace those inline colours with `var(--gold-primary)` so hydration doesn't flash the old palette. Change **only** style attributes.

---

## 6. Section 2 · Shared Primitives (`festival.css` lines ~88–300)

These cascade into every section, so do them right once.

**Buttons**
- `.btn-primary` — pumpkin lacquer: `linear-gradient(180deg,#ffa23d,#ff7a1a 45%,#c9500a)`; text `--text-on-gold`, Inter 700, uppercase .06em; `box-shadow: inset 0 1px 0 rgba(255,235,200,.7), inset 0 -3px 0 rgba(90,25,0,.55), 0 4px 0 #6b2a05, 0 8px 18px rgba(0,0,0,.6), var(--shadow-gold)`. `:hover` brighten + translateY(-1px). **`:active` presses in**: `transform: translateY(4px)`, bottom depth shadow → `0 0 0 #6b2a05`.
- `.btn-secondary` — iron: `.mat-iron` gradient, bone text, same press mechanics, border `#000`, pumpkin text on hover.
- `.btn-sm/.btn-xs/.btn-lg/.btn-block` — only scale padding/size; never change depth model.
- `.btn-plan-toggle`, `.btn-in-plan` — in-plan state = **glowing ghost-green** (`--ghost`) lit button.
- `.btn-text-link` — bone text, pumpkin underline that draws in on hover.
- `:disabled` — desaturated, no depth (flat, `opacity:.5`), `cursor:not-allowed`.
- Focus ring: `outline: 2px solid var(--ghost); outline-offset: 3px;` globally (`:focus-visible`).

**Badges / chips / pills** (`.badge-category`, `.badge-state`, `.tag-pill`, `.category-chip`, `.filter-pill`, `.day-tab-btn`, `.item-tag`, `.perk-tag`, `.tier-badge`)
- Inactive: `.mat-recess` slot, bone-muted text.
- Active: raised brass tag (`.mat-brass`) with `--bevel`, or lit pumpkin.
- State badges: `.state-open` ghost green lit, `.state-soon` candle amber, `.state-closed` iron grey, `.state-soldout` blood red.

**Glass panel → oak** (see §2). **Inputs** (`.search-box`, `.form-field`, `.form-select`): `.mat-recess`, brass focus border with ember glow, placeholder `--text-muted`.

**Scrollbars**: iron track, brass thumb (`scrollbar-color: var(--brass-2) var(--oak-3)`).

---

## 7. Section 3 · Header & Navigation (`#navbar-mount`, `nav.js`, css L300–620)

- `.site-header` — the only blurred surface: `.mat-iron` at ~92% alpha + `backdrop-filter: blur(8px)`, bottom edge is a **brass rail** (2px `--brass-2` + 1px highlight) with the ember `--shadow-md` below. Height stays `--header-height` (72px).
- `.brand-link` / `.brand-wordmark` — wordmark with faint pumpkin glow; `.brand-sub` Inter caps, ghost green.
- `.nav-link` — Inter 600 uppercase 13px; hover: text → `--gold-hover` + small **flame underline** (3px, pumpkin, `box-shadow` glow) sliding in. Active link: lit carved-in plaque (`.mat-recess` + pumpkin text).
- `.header-actions` Register button = `.btn-primary` `.btn-sm`.
- `.menu-toggle` / `.hamburger-bar` — iron square button, bars drawn as three brass rods.
- `.mobile-drawer` — slides in as a **cast-iron gate / dark oak door**: `.mat-oak` with vertical iron straps (two `::before` bands), brass studs. `.mobile-drawer-backdrop` = `rgba(3,1,6,.8)`. `.drawer-link` = carved plank rows with `.mat-recess` on active; `.drawer-close(-btn)` = brass X medallion.
- `.mobile-bottom-dock` — a **wooden shelf**: `.mat-oak` + top brass rail; `.dock-item` icons in bone, active lit pumpkin with lantern glow; `.dock-item-highlight` (Register) = raised pumpkin gem button protruding above the shelf by 8px; `.dock-badge` = red wax dot.

---

## 8. Section 4 · About (`#about-mount`, `about.js`, css L933)

- `.about-card` → large **parchment scroll** (`.mat-parchment`) with rolled ends (top/bottom 14px cylinders via `linear-gradient` + shadow) — text uses `--parchment-ink`. This is the one light surface on the page, deliberately, to give rhythm.
- `.about-grid` – two columns desktop, stack mobile.
- `.about-pillars-grid` / `.pillar-item` — each pillar = **iron medallion card** (`.mat-iron`); `.pillar-icon` inside a brass ring with inner `.mat-recess` well; `.pillar-title` Cinzel, `.pillar-desc` Spectral.
- Decorative: small wax-seal at the scroll's bottom-right (`.mat-wax`, "A" monogram in Creepster).

---

## 9. Section 5 · Events (`#events-mount`, `events.js`, css L1015–1295)

- `.events-filter-bar` — **brass-trimmed oak toolbar**. `.search-box` is a recessed slot with a brass magnifier (`.search-icon`); `.clear-btn` small brass ×.
- `.category-chips-scroll` / `.category-chip` — row of **bone-coloured carved tokens** (like game pieces); active = lit pumpkin. Keep horizontal scroll + fade masks, tinted `--bg-dark`.
- `.filter-group-label` caps muted, `.filter-pill` per §6, `.events-results-meta` muted Inter.
- `.events-grid` stays the same grid. `.event-card` = **tarot / playing card on oak**: `.mat-oak` face, 1px brass inner border inset 6px (`::before`), corner pumpkin glyphs (`::after`), `box-shadow: var(--bevel), var(--shadow-md)`. Hover: lift 4px, add `--shadow-gold` lantern glow, tilt ≤ 1.5° (CSS only). `.card-top` holds `.card-category-tag` (brass tag) and `.badge-state`; `.card-title` Cinzel; `.event-card-tagline` Spectral italic; `.card-footer-tags` pills; `.card-badge`/`.featured-ribbon` = diagonal **red wax-ribbon** on the corner.
- `.event-card-actions`: `.btn-card-detail` iron, `.btn-plan-toggle` pumpkin/ghost per state.
- `.events-empty-state` (`.empty-icon/.empty-title/.empty-desc`) — a cobweb-covered empty chest: `.mat-recess` box, large 👻/🕸 glyph (text, `aria-hidden`), copy untouched.

---

## 10. Section 6 · Event Modal / Bottom Sheet (css L1295–1468)

- `.modal-backdrop` — `rgba(3,1,6,.82)` + faint fog layer.
- `.event-modal-container` — **ornate framed portrait / spellbook page**: `.mat-oak` outer frame (14px thick, carved bevel), inner `.mat-parchment`-dark panel (`#16100c`) with brass corner brackets (4 `::before/::after` L-shapes). Desktop centered; mobile = bottom sheet with a **iron drag-handle** bar (40×5 brass). Entry animation: rise + subtle dust (`modal-in`, §16).
- `.modal-header`, `.modal-title` Cinzel 900 pumpkin; `.modal-badge-group` badges per §6; `.modal-close-btn` = round brass medallion, 44px.
- `.modal-meta-grid` / `.modal-meta-card` — four recessed **stone plaques** (`.mat-recess`) with icon + label + value.
- `.modal-section` headings in Cinzel with a thin brass rule; `.rules-list`, `.rules-bullet-list`, `.criteria-list` use skull/candle bullets (`::marker` replaced via `list-style: none` + `::before` glyph); keep numbering semantics.
- `.modal-actions-footer` — sticky bottom bar `.mat-iron` containing primary/secondary buttons.

---

## 11. Section 7 · My Plan (`#plan-mount`, `my-plan.js`, css L1469–1608)

- Section feels like a **grimoire / planner**: container `.mat-parchment` darkened (`#d8c295`) with a leather-bound left spine (vertical `.mat-oak` strip with brass stitches).
- `.plan-controls-bar` — brass-rail toolbar; `.plan-actions` buttons per §6; `.plan-badge` = wax-seal counter.
- `.plan-timeline-grid` / `.plan-card` — each planned event = **ticket stub** (parchment with perforated left edge via `radial-gradient` dots, notch cut-outs top/bottom via mask). `.plan-card-left` shows time stamped in red ink (`.plan-time-tag`, Courier-like `--font-mono`, rotate −2°). `.plan-day-tag`/`.plan-cat-tag` small ink stamps. `.btn-remove-plan` = tiny wax-red ✕.
- `.plan-conflict-banner` — **blood-red warning tape**: striped (`repeating-linear-gradient(45deg,#8e0f1c 0 14px,#2a0308 14px 28px)`), bone bold text, subtle shake once on appear. Must remain `role`/text unchanged.
- `.plan-empty-card` / `.empty-plan-icon` — empty ticket spike (skull glyph), `.mat-recess`.
- `.plan-note`, `.plan-venue-row` muted Spectral.

---

## 12. Section 8 · Schedule (`#schedule-mount`, `schedule.js`, css L1608–1825)

- `.schedule-day-tabs` / `.day-tab-btn` — **three hanging wooden plaques** (Day 1/2/3): `.mat-oak`, each hung by two short chains; active plaque swings forward, lit pumpkin text and glow. `.tab-day-num` Creepster 28px, `.tab-day-theme` Inter caps muted.
- `.schedule-live-status` (`.status-indicator/.status-headline/.status-sub/.pulse-live-dot`) — an **iron marquee sign** with blinking bulb: `.pulse-live-dot` = glowing red bulb (`animation: bulb-pulse 1.4s infinite`), "Happening Now" in ghost green, "Up Next" in amber.
- **Desktop grid** `.desktop-stage-grid` → `.stage-track-column` = recessed oak lane; `.stage-header` = brass nameplate; `.stage-title` Cinzel; `.stage-slots-list` / `.stage-slot-card` = small **wax-sealed index cards** (parchment-dark `#2a1d14`, bone text, brass left edge). `.slot-time-pill` = brass pill; `.slot-category-tag` per §6.
- **Mobile** `.mobile-vertical-timeline` → `.timeline-spine` = a **hanging rope/chain** (2px dashed `--brass-2`, centered-left), `.timeline-node` = a glowing **candle flame** (8px pumpkin dot, blur glow, flicker), live node = ghost-green. `.timeline-slot-card` = same index-card.
- Live slot highlight: ghost-green rim + `--ghost-glow` shadow.

---

## 13. Section 9 · 3D Campus Map (`#map-mount`, `map-section.js`, `earth-ui.js`, css L1825–2115 + `styles.css`)

> **Logic untouched.** The Three.js scene, camera and pins stay as is. Only chrome around it is re-skinned.

- `.map-viewport-wrapper` / `.canvas-container` — viewport inside a **heavy iron + oak frame** (like a window of a haunted tower): 10px oak border, brass corner plates, inner `.mat-recess` shadow; `border-radius: var(--radius-lg)`. Keep dimensions and `position` rules.
- `.map-poster-placeholder` (`.poster-overlay/.poster-title/.poster-desc/.poster-hint/.poster-badge`) — pre-load poster becomes a **vintage "Haunted Campus" blueprint**: dark sepia-night gradient, faint grid lines, pumpkin title in Creepster, wax-seal badge, button `.btn-primary`.
- `.venue-pins-bar`, `.pins-scroll-list`, `.venue-pin-btn`, `.pin-dot`, `.pins-scroll-arrow`, `.pins-header`, `.pins-hint`, `.pins-badge`, `.pin-featured-badge` — row of **brass map-pins on a cork-and-oak strip**; `.pin-dot` is a glowing pumpkin head; featured pin = ghost green. Arrows are iron round buttons.
- `.map-directions-drawer`, `.directions-selector`, `.dir-summary`, `.dir-text` — a **parchment treasure-map slide-out** (`.mat-parchment`), dashed walking-path line in blood-red ink between selectors, small ☠ at destination (text glyph).
- `.accessible-landmarks-details` / `.accessible-summary` / `.accessible-content-grid` / `.accessible-landmark-card` — keep fully readable: `.mat-oak` cards, bone text; summary is an iron disclosure with a brass chevron.
- `.travel-map-cta` — see §20.
- **`styles.css` 3D HUD** (only colour/material swaps, no layout/logic):
  - `:root` vars `--bg/--ink/--panel/--btn/--btnink` → dark theme values everywhere (drop the light variant): `--bg:#07050a; --ink:#f3e6d0; --panel:rgba(27,19,16,.88); --btn:#ff7a1a; --btnink:#1a0c02;`.
  - `.bar` (bottom control bar) → `.mat-oak` pill with brass rim; `.bar button.on` = lit pumpkin lacquer (replaces blue-grey).
  - `.agcard`, `#t10`, `#bOval` gradients: `#5b1a8f,#d6246e,#ff9a2e` → `#2a1240,#b3141f 55%,#ff7a1a`.
  - `.tag` map labels → small **brass luggage tags** (dark bg `#1b1310`, bone text, 1px brass border; stem `.tag::after` brass-coloured). Per-category left borders `.tag.r/.g/.a/.o/.p/.e` stay (colour-coded) but recolour to the Halloween set: r blood `#c22a38`, g ghost `#7dffb0`, a rust `#b5483c`, o pumpkin `#ff7a1a`, p violet `#9b4dca`, e cold blue `#5aa9ff`.
  - `.info` card → `.mat-oak` plaque; `.info .chip` brass; `.info button` pumpkin.
  - `.tbtn` → iron round button.
  - Cinematic overlay (`.cin*`, `.ch*`, `.ret*`, `.cin-title`): change `--c:#7fe6ff` → `#7dffb0` and `--p:#ff3fa4` → `#ff7a1a`; `.cin-grade` gradient → deep purple-to-ember. **No timing or structure changes.**
  - `.ld i` spinner top colour → `#ff7a1a`; `.live i` stays red.
  - Canvas/scene lighting itself is **out of scope** here (see §22 optional follow-up).

---

## 14. Section 10 · Line-up & Judges (`#lineup-mount`, `lineup.js`, css L2115–2195)

- `.lineup-grid` of `.lineup-card` = **wanted-poster / vintage circus-bill**: `.mat-parchment`, torn edge (`clip-path` zig-zag), nailed at the top with a brass pin (`::before`), slight random rotation ±1.5° via `:nth-child`.
- `.lineup-avatar-slot` / `.guest-silhouette` — oval **cameo frame** (brass ring, dark inner), silhouette is a black figure on moonlit gradient with a "?" while unrevealed.
- `.reveal-badge` — red wax-seal "REVEALING SOON"; revealed → ghost-green seal. `.guest-cat` stamp, `.guest-name` Cinzel (ink), `.guest-role` Spectral italic, `.guest-bio` ink-muted.
- `.lineup-notice` — iron notice plate with rivets.

---

## 15. Section 11 · Sponsors (`#sponsors-mount`, `sponsors.js`, css L2195–2284)

- `.sponsors-tiered-wall` — a **trophy wall of plaques**. `.sponsor-tier-block` has a `.tier-header` banner (`.tier-badge` brass ribbon, `.tier-desc` muted) with tier materials escalating: Title = **gold-brass + pumpkin glow**, Powered-by = polished brass, Associate = iron, Partner = oak.
- `.sponsor-card` / `.sponsor-cards-row` — framed plaques with `.sponsor-placeholder-logo` as an engraved recessed slot (`.mat-recess`, dashed brass inner border), `.sponsor-name` Cinzel, `.sponsor-tag` tiny stamp.
- `.sponsor-cta-banner` + `.banner-*` — **wax-sealed envelope** banner: parchment with big wax-seal at centre-top, `.banner-title` ink, `.banner-actions` buttons.

---

## 16. Motion & Effects Catalogue (keyframes in the "Keyframes" block, L3256)

Define once; reuse. All wrapped by the existing reduced-motion override (extend that block to also kill every item below: `animation:none !important; transition-duration:.01ms !important`).

| Name | Use | Spec |
|---|---|---|
| `flicker` | candle/flame glows | opacity/`filter:brightness` jitter 0.85–1.05, irregular `steps(1)` keyframes, 3.2s |
| `fog-drift` | body fog | translateX −10% → 10%, 60s linear infinite alternate |
| `sign-sway` | hero sign, day tabs | rotate ±1.2°, 6s ease-in-out |
| `lantern-bob` | scroll cue | translateY 0 → 8px, 2.4s |
| `bat-fly` | hero bats | translate across 110vw over 14–24s, random delays, wing flap 0.25s |
| `bulb-pulse` | live dots | box-shadow 0 → 12px red, 1.4s |
| `modal-in` | modals | translateY(16px)+opacity → 0, 260ms `cubic-bezier(.2,.7,.2,1)` |
| `reveal` | `.reveal-on-scroll` | opacity + translateY(24px) → 0 with a slight blur-in (6px → 0), 600ms |
| `cobweb-sway` | cobwebs | skewX ±1.5°, 8s |

Hover micro-interaction on every raised surface: 120ms transition on `transform`/`box-shadow` only (compositor-friendly). No animation on `filter: blur` for large areas.

Performance caps: ≤ 7 bats, fog = 2 layers, no `backdrop-filter` except header, all decorative SVG inlined and < 2KB each.

---

## 17. Section 12 · Gallery (`#gallery-mount`, `gallery.js`, css L2284–2379)

- `.gallery-grid` of `.gallery-item` = **polaroid / framed photographs pinned to a board** (white-ish bone border 10px bottom 36px, slight alternating rotation ±2°, brass pin, drop shadow). `.gallery-thumb-slot` + `.thumb-ambient-art` placeholders: dark gradient with faint ghost shapes; `.ambient-num`/`.ambient-tag` in muted brass. `.gallery-caption` handwritten feel using Spectral italic.
- `.aftermovie-container` / `.video-placeholder` — **old projector screen / TV with rounded CRT corners**, scanlines overlay (`repeating-linear-gradient`), iron bezel; `.btn-play-video` = big pumpkin round play button with rivets; `.video-badge` red wax tag; `.video-title/.video-desc` per type scale.

---

## 18. Section 13 · Team (`#team-mount`, `team.js`, css L2379–2452)

- `.team-grid` of `.team-card` = **ID-badge / museum exhibit card** on oak; `.team-avatar-slot` + `.avatar-initials` = round cameo with brass ring and initials in Cinzel pumpkin.
- `.member-name` Cinzel, `.member-role` pumpkin Inter caps, `.member-dept` muted, `.member-email` bone link (underline on hover), `.member-team-badge` brass tag.
- `.team-subgroup` / `.subgroup-title` — iron divider plate with chain links either side (faculty vs students).

---

## 19. Section 14 · Registration & Passes (`#register-mount`, `register.js`, css L2452–2810)

- `.ambassador-banner` (+ `.ambassador-*`, `.banner-*`) — **blood-red velvet ribbon banner** with brass trim, `.ambassador-badge` wax seal, `.ambassador-perks-row` pills.
- `.pass-tiers-grid` / `.pass-tier-card` — **admission tickets**: `.mat-parchment`-dark variants per tier; perforated edge, notches, barcode strip (`repeating-linear-gradient` bars) at the bottom. `.pass-featured` = pumpkin foil edge + lantern glow and a "BEST" wax seal; `.pass-tag` stamp; `.pass-title` Cinzel; `.price-val` Creepster 40px; `.price-period` muted; `.pass-perks-list` with candle bullets; `.pass-action-wrapper` holds `.btn-primary`.
- `.adapter-control-panel` / `.adapter-status` / `.toggle-control` / `.toggle-switch` — **iron control panel with a brass toggle lever** (knob slides, ghost-green lamp when on). `.toggle-label` Inter.
- `.onsite-form-container` + `.form-*` — **registration ledger**: parchment page inside an oak book cover.
  - `.form-stepper`, `.step-node`, `.step-line` — numbered wax-seals joined by a rope; current = pumpkin lit, done = ghost green with ✓ (existing glyph), future = recessed.
  - `.form-field` inputs per §6; `.field-error` = blood-red ink with a small ⚠ (existing text). `.form-events-select-grid` + `.event-checkbox-label` = checkbox as a **carved box with a brass tick**; `.event-check-text` normal; `.consent-checkbox-label` same.
  - `.review-summary-card`/`.review-row` — receipt style (dashed leaders, mono prices), `.form-nav-controls` button row.
  - `.step-heading`, `.step-note` Spectral.

---

## 20. Section 15 · Travel (`#travel-mount`, `travel.js`, css L2811–2912)

- `.travel-modes-grid` / `.travel-card` — **steam-train / luggage-label cards**: `.mat-oak` + leather strap detail; `.transit-badge` brass luggage tag (Rail / Air / Road), `.transit-title` Cinzel, `.transit-desc` Spectral, `.transit-meta` muted mono.
- `.travel-guidelines-grid` / `.guideline-card` — `.mat-recess` rule plaques with ⚠ amber accent, bone text; `.info-card-title/.info-card-text`.
- `.travel-map-cta` — a **signpost** (wood plank pointing right, CSS clip-path arrow) containing `.btn-primary`.

---

## 21. Section 16 · FAQ (`#faq-mount`, `faq.js`, css L2912–2996)

- `.faq-category-pills` / `.faq-cat-btn` / `.faq-cat-badge` — chips per §6.
- `.faq-accordion` / `.faq-item` — stack of **old book spines / drawers**: `.mat-oak` rows, brass pull-handle on the right. `.faq-question-btn` full-width, 48px min height, Cinzel 700; `.faq-chevron` = brass arrow that rotates 180° when open. `.faq-answer-panel` = pulled-out drawer interior, `.mat-recess` dark with parchment text `.faq-answer-text` (bone on dark, Spectral 17px). Open state: ember rim light. Keep `aria-expanded` / `hidden` mechanics untouched.

---

## 22. Section 17 · Contact (`#contact-mount`, `contact.js`, css L2996–3088)

- `.contact-grid` two columns → mobile stack.
- `.contact-info-card` — **iron mailbox / telegram office plate**: `.mat-iron`, `.contact-channels`, `.channel-row` with `.channel-icon` in brass circle, `.channel-label` caps muted, `.channel-value` bone link; `.socials-label`, `.socials-links-row`, `.social-btn` = round brass buttons (44px) with pumpkin glow on hover.
- `.contact-form-card` — **letter writing desk**: parchment paper on oak with a wax-seal submit button (`.btn-primary` skinned with `.mat-wax` look in this card only: red wax seal, "Send" on it). Inputs recessed; honeypot field remains hidden (don't touch).
- `.form-card-title` Cinzel, `.form-kicker` ghost-green caps.

---

## 23. Section 18 · Footer (`#footer-mount`, `footer.js`, css L3088–3213)

- `.site-footer` — **crypt gate base**: `.mat-iron` top border as spiked fence silhouette (CSS `clip-path` zigzag or SVG mask), deep black-purple background with fog, tiny tombstones row (decorative).
- `.footer-top-grid` columns; `.footer-heading` Cinzel brass; `.footer-links-list` bone links with pumpkin hover; `.footer-wordmark-img` glow; `.footer-tagline` Spectral italic; `.footer-address` muted; `.footer-social-row` / `.footer-social-icon` brass round buttons.
- `.footer-bottom-bar` / `.footer-legal-links` / `.legal-link` / `.credit-line` — small caps, muted, with ☠ separators. Legal modal reuses §10 modal skin.

---

## 24. Section 19 · Toasts, Skip link, Misc (css L3214+, L88)

- `.toast-notification` / `.toast-success` — **small wax-sealed note**: parchment-dark, wax-seal icon at left, ghost-green success edge; slide-in from bottom with `modal-in`; sits above `.mobile-bottom-dock` (keep existing offset).
- `.skip-link` — pumpkin button when focused, high contrast.
- Selection colour: `::selection { background: #ff7a1a; color: #1a0c02; }`.
- Print overrides: switch to light, remove textures (keep existing block).

---

## 25. Satellite Pages (reskin only, same tokens)

- `404.html` — a large tombstone "404 · Here lies this page" (existing text unchanged where tested), bats, lantern, `.btn-primary` home link.
- `styleguide.html` — update swatches/tokens to this spec and add material samples (§2 table), button states, badges, typography ladder. This becomes the visual QA page.

---

## 26. Implementation Order (one section per commit)

1. Tokens + fonts + materials + global atmosphere + primitives (§2, §3, §4, §6)
2. Header, drawer, dock (§7)
3. Hero (§5)
4. About (§8) → Events (§9) → Modal (§10)
5. My Plan (§11) → Schedule (§12)
6. Map chrome + `styles.css` HUD (§13)
7. Line-up (§14) → Sponsors (§15) → Gallery (§17) → Team (§18)
8. Registration (§19) → Travel (§20) → FAQ (§21) → Contact (§22) → Footer (§23)
9. Toasts/misc (§24) → satellite pages + styleguide (§25) → motion pass (§16) → `sw.js` cache bump → `manifest`/meta colours

Per-section **done** checklist:
- [ ] Matches the material rules in §2 (bevel, shadow, texture; lit from top-left)
- [ ] No class/id/ARIA/text renamed; `npm test` green
- [ ] Contrast ≥ 4.5:1 (check bone-on-oak, ink-on-parchment, pumpkin-on-iron)
- [ ] Good at 360 / 768 / 1280; no horizontal scroll; tap targets ≥ 44px
- [ ] Reduced-motion respected; no new `backdrop-filter`
- [ ] Hard-refresh with service worker unregistered looks right

---

## 27. Out of Scope / Optional Follow-ups

- Re-lighting the 3D campus scene (night sky, orange lamps, pumpkins on buildings) in `src/modules/*` — touches logic-adjacent code, do separately if wanted.
- Custom illustrated assets (real pumpkin/bat artwork), sound effects, cursor trail.
- Copy changes (spooky microcopy). Current text is preserved on purpose.
