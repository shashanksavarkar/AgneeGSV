// 3D Campus Map section wrapper, lazy loader, event pins, walking directions, screenshot capture, and accessibility fallback

import { store } from '../core/store.js';
import { analytics } from '../core/analytics.js';

let placesData = [];
let eventsData = [];
let threeLoaded = false;
let is3DActive = false;

export function renderMapSection(places = [], events = []) {
  placesData = places;
  eventsData = events;
  const mount = document.getElementById('map-mount');
  if (!mount) return;

  // Restore full interactive 3D map

  mount.innerHTML = `
    <section class="section map-section" id="map" aria-labelledby="mapHeading">
      <div class="map-runway" id="mapRunway"><div class="map-stage" id="mapStage">
      <div class="container map-head">
        <div class="section-header">
          <h2 class="section-title" id="mapHeading">Explore the Venue & Campus</h2>
        </div>
      </div>

        <!-- 3D Interactive Canvas Wrapper -->
        <div class="map-viewport-wrapper glass-panel" id="mapViewportWrapper">
          <!-- Poster / Lazy-Load Placeholder (First paint does not wait for Three.js) -->
          <div class="map-poster-placeholder" id="mapPosterPlaceholder">
            <div class="poster-overlay">
              <span class="poster-badge">3D INTERACTIVE CAMPUS</span>
              <h3 class="poster-title">Gati Shakti Vishwavidyalaya in 3D</h3>
              <p class="poster-desc">Full 3D campus model with camera presets, event pins, walking navigation, and lighting simulations.</p>
              <button type="button" class="btn-primary btn-lg" id="btnActivate3D">
                <span>Launch 3D Campus Map</span>
                <span class="btn-arrow" aria-hidden="true">↗</span>
              </button>
              <span class="poster-hint">Optimized for touch, trackpad, and mouse controls</span>
            </div>
          </div>

          <!-- Canvas Mount -->
          <div class="canvas-container" id="canvasMount">
            <div class="view" id="view">
              <canvas id="c" aria-label="Interactive 3D model of the campus. Drag to rotate, hold Ctrl and scroll to zoom."></canvas>
              <div class="earth-intro" aria-hidden="true">
                <div class="earth-stars"></div>
                <div class="earth-globe"><span></span></div>
                <small>GATI SHAKTI VISHWAVIDYALAYA · VADODARA</small>
              </div>
              <div class="tag" id="t1">Gati Shakti Vishwavidyalaya (current academic block)</div>
              <div class="tag" id="t12">Sardar Patel Sabhagrah</div>
              <div class="tag a" id="t13">Pahune Hostel</div>
              <div class="tag m" id="t16">GSV-MESS</div>
              <div class="tag r" id="t3">Current hostel (NHSRCL)</div>
              <div class="tag g" id="t4">Proposed hostel block</div>
              <div class="tag a" id="t5">Atithi hostel</div>
              <div class="tag a" id="t15">Mehman Boy's Hostel</div>
              <div class="tag o" id="t6">Proposed laboratory block</div>
              <div class="tag o" id="t7">Proposed academic block</div>
              <div class="tag" id="t8">Pratap Vilas Palace</div>
              <div class="tag f" id="t14">★ Rajabaug · Pre-Agnee Stalls</div>
              <div class="tag" id="t17">Darshan building</div>
              <div class="tag a" id="t18">Giriraj (Guest House)</div>
              <div class="tag" id="t19">Sports Complex</div>
              <div class="tag" id="t9">Manthan building</div>
              <div class="tag p" id="t10">AGNEE · The Cultural Fest — Oval Ground</div>
              <div class="tag e" id="t11">Main entrance gate</div>
              <!-- Luxury Top Map Bar -->
              <div class="map-hud-top" id="mapHudTop">
                <div class="hud-top-left">
                  <div class="hud-brand-pill">
                    <span class="hud-beacon" aria-hidden="true"></span>
                    <span class="hud-brand-text">GSV CAMPUS 3D</span>
                  </div>
                  <button type="button" class="hud-guide-btn" id="hudGuideBtn" title="Open Campus Guide & Landmarks">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    <span>Landmarks & Guide</span>
                  </button>
                </div>

                <div class="hud-top-center">
                  <div class="hud-lighting-dock" role="group" aria-label="Campus Atmosphere Lighting">
                    <button type="button" class="hud-light-btn" data-light="day" title="Brilliant Daylight">
                      <span>☀️ Day</span>
                    </button>
                    <button type="button" class="hud-light-btn" data-light="golden" title="Sunset Golden Hour">
                      <span>🌅 Golden</span>
                    </button>
                    <button type="button" class="hud-light-btn active" data-light="dusk" title="Royal Dusk & Fest Lasers">
                      <span>🌙 Royal Dusk</span>
                    </button>
                  </div>
                </div>

                <div class="hud-top-right">
                  <button type="button" class="hud-icon-btn" id="hudSnapBtn" title="Capture HD Poster" aria-label="Capture Poster">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </button>
                  <button type="button" class="hud-icon-btn" id="hudFullscreenBtn" title="Toggle Fullscreen" aria-label="Fullscreen">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                  </button>
                </div>
              </div>

              <!-- Floating Director Dock -->
              <div class="bar" role="group" aria-label="Camera Presets">
                <button id="bFree" type="button" class="on" title="Free Camera Orbit"><span class="bar-icon">🌐</span><span>3D Orbit</span></button>
                <button id="bTop" type="button" title="Architectural Top-Down View"><span class="bar-icon">📐</span><span>Top View</span></button>
                <button id="bHos" type="button" title="Hostels & Residences"><span class="bar-icon">🏨</span><span>Hostels</span></button>
                <button id="bRaj" type="button" title="Rajabaug Pre-Agnee Stalls"><span class="bar-icon">🎪</span><span>Rajabaug</span></button>
                <button id="bOval" type="button" title="Agnee Festival Arena"><span class="bar-icon">✨</span><span>★ Agnee Fest</span></button>
              </div>

              <!-- Interactive Gesture Hint -->
              <div class="map-gesture-hint" id="mapGestureHint" aria-hidden="true">
                <span>Drag to orbit · Ctrl + scroll to zoom · Click any tag to visit</span>
              </div>
              </div>
              
              <!-- Rajabaug Pre-Agnee Stalls Interactive Counter Navigator -->
              <div class="rb-nav glass-panel" id="rbNav" hidden>
                <div class="rb-header">
                  <div class="rb-badge">★ RAJABAUG CARNIVAL</div>
                  <div class="rb-counter-no">COUNTER <span id="rbCurNum">1</span> OF 10</div>
                  <button type="button" class="rb-close" id="rbCloseBtn" aria-label="Close counter view">✕</button>
                </div>
                <div class="rb-body">
                  <div class="rb-title-row">
                    <h3 class="rb-stall-title" id="rbStallTitle">Counter 1: Ring Toss & Bulls-Eye</h3>
                    <span class="rb-tag" id="rbStallTag">Carnival Game</span>
                  </div>
                  <div class="rb-meta-row">
                    <span class="rb-meta-chip" id="rbStallPrice">₹30 / 5 Rings</span>
                    <span class="rb-meta-chip highlight" id="rbStallReward">Agnee Badges</span>
                  </div>
                  <p class="rb-desc" id="rbStallDesc">Toss rings onto colored glass bottles to win official Agnee badges & prizes!</p>
                  <div class="rb-action-box" id="rbStallAction"></div>
                </div>
                <div class="rb-controls">
                  <button type="button" class="rb-btn prev" id="rbPrevBtn">‹ Prev</button>
                  <div class="rb-dots" id="rbDots">
                    <button type="button" class="rb-dot active" data-idx="0">1</button><button type="button" class="rb-dot " data-idx="1">2</button><button type="button" class="rb-dot " data-idx="2">3</button><button type="button" class="rb-dot " data-idx="3">4</button><button type="button" class="rb-dot " data-idx="4">5</button><button type="button" class="rb-dot " data-idx="5">6</button><button type="button" class="rb-dot " data-idx="6">7</button><button type="button" class="rb-dot " data-idx="7">8</button><button type="button" class="rb-dot " data-idx="8">9</button><button type="button" class="rb-dot " data-idx="9">10</button>
                  </div>
                  <button type="button" class="rb-btn next" id="rbNextBtn">Next ›</button>
                </div>
                <div class="rb-actions">
                  <button type="button" class="rb-view-btn" id="rbOverviewBtn">Garden Overview</button>
                </div>
              </div>
  
<div id="load"><div class="ld"><i></i><b>Campus in 3D</b><span>Gati Shakti Vishwavidyalaya · building the map…</span></div></div>
            </div>
          </div>

        </div>

      </div></div>
      <div class="container">
        <!-- Venue quick selector -->
        <div class="vp-bar" aria-label="Campus Landmarks Selector">
          <div class="vp-nav">
            <button type="button" class="vp-arrow" id="btnPinsScrollLeft" title="Scroll left" aria-label="Scroll venues left">‹</button>
            <div class="vp-list" id="pinsScrollList">
              ${places.map((place, i) => {
    const isFest = place.id === 'oval-ground';
    return `
                  <button type="button" class="venue-pin-btn vp-chip ${isFest ? 'active' : ''}" data-place-id="${place.id}" data-category="${place.category}">
                    <span class="vp-no">${String(i + 1).padStart(2, '0')}</span>
                    <span class="vp-text"><b>${place.name}</b><small>${place.category}</small></span>
                    ${place.featured ? '<span class="vp-fest">Fest</span>' : ''}
                  </button>
                `;
  }).join('')}
            </div>
            <button type="button" class="vp-arrow" id="btnPinsScrollRight" title="Scroll right" aria-label="Scroll venues right">›</button>
          </div>
        </div>
      </div>
    </section>
  `;

  setupMapSectionInteractions();
  initMapScrollExpand();
}

// Pins the map stage while scrolling; the map clip grows from the top corners to fill the screen
function initMapScrollExpand() {
  const runway = document.getElementById('mapRunway');
  const stage = document.getElementById('mapStage');
  const wrap = document.getElementById('mapViewportWrapper');
  const head = stage?.querySelector('.map-head');
  if (!runway || !wrap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.getElementById('map').classList.add('map-scrollfx');

  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  let ticking = false;

  function update() {
    ticking = false;
    const W = stage.clientWidth, H = stage.clientHeight;
    const navH = document.querySelector('.site-header')?.offsetHeight || 0;
    const box = head.querySelector('.section-header').getBoundingClientRect();
    const st = stage.getBoundingClientRect();
    const c = document.querySelector('#map .container').getBoundingClientRect();
    const sT = box.bottom - st.top + 18, sB = H - 24, sL = c.left, sR = c.right;
    const p = clamp01(-runway.getBoundingClientRect().top / (runway.offsetHeight - H));
    const pt = ease(clamp01(p * 1.35)), pb = ease(clamp01(p * 1.35 - 0.35));
    const pt_ = (x0, y0, x1, y1, k) => lerp(x0, x1, k) + 'px ' + lerp(y0, y1, k) + 'px';
    wrap.style.clipPath = 'polygon(' + [
      pt_(sL, sT, 0, navH, pt), pt_(sR, sT, W, navH, pt),
      pt_(sR, sB, W, H, pb), pt_(sL, sB, 0, H, pb)
    ].join(',') + ')';
    head.style.opacity = 1 - clamp01(p * 2.5);
    head.style.transform = 'translateY(' + -p * 40 + 'px)';
  }
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
}

function setupMapSectionInteractions() {
  // Bind Luxury Top HUD Controls
  setTimeout(() => {
    const guideBtn = document.getElementById('hudGuideBtn');
    const compassBtn = document.getElementById('hudCompassBtn');
    const snapBtn = document.getElementById('hudSnapBtn');
    const fullBtn = document.getElementById('hudFullscreenBtn');
    const lightBtns = document.querySelectorAll('.hud-light-btn');

    if (guideBtn) {
      guideBtn.onclick = () => {
        const panel = document.getElementById('earthSidePanel');
        if (panel) {
          panel.classList.toggle('collapsed');
        }
      };
    }

    if (compassBtn) {
      compassBtn.onclick = () => {
        if (typeof window.orb !== 'undefined') {
          window.orb.theta = 0;
          window.orb.vt = 0;
        }
        const dial = compassBtn.querySelector('.compass-dial');
        if (dial) dial.style.transform = 'rotate(0deg)';
      };
    }

    if (snapBtn) snapBtn.onclick = () => window.captureMapPoster?.();
    if (fullBtn) fullBtn.onclick = () => window.toggleMapFullscreen?.();

    lightBtns.forEach(btn => {
      btn.onclick = () => {
        const mode = btn.dataset.light;
        const k = mode === 'day' ? 0 : mode === 'golden' ? 0.5 : 1.0;
        if (typeof window.setCampusAtmosphere === 'function') {
          window.setCampusAtmosphere(k);
        }
        lightBtns.forEach(b => b.classList.toggle('active', b === btn));
      };
    });

    // Tag click-to-fly
    const TAG_MAP = {
      t1: 'academic-block',
      t12: 'sabhagrah',
      t13: 'pahune-hostel',
      t3: 'current-hostel',
      t4: 'proposed-hostel',
      t5: 'atithi-hostel',
      t6: 'proposed-lab',
      t7: 'proposed-academic',
      t8: 'palace',
      t16: 'gsv-mess',
      t17: 'darshan',
      t18: 'giriraj',
      t19: 'sports-complex',
      t9: 'manthan',
      t10: 'oval-ground',
      t11: 'main-gate',
      t14: 'rajabaug'
    };

    Object.entries(TAG_MAP).forEach(([tagId, placeId]) => {
      const el = document.getElementById(tagId);
      if (el) {
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
        el.onclick = (e) => {
          e.stopPropagation();
          flyToPlace(placeId);
        };
      }
    });

    // Gesture hint auto-dismiss
    const hintEl = document.getElementById('mapGestureHint');
    if (hintEl) {
      const dismissHint = () => {
        hintEl.classList.add('fade-out');
        setTimeout(() => hintEl.remove(), 1000);
        window.removeEventListener('pointerdown', dismissHint);
      };
      setTimeout(dismissHint, 5000);
      window.addEventListener('pointerdown', dismissHint, { once: true });
    }
  }, 150);
  // Setup Rajabaug Counter Navigator Event Handlers
  setTimeout(() => {
    const prevBtn = document.getElementById('rbPrevBtn');
    const nextBtn = document.getElementById('rbNextBtn');
    const closeBtn = document.getElementById('rbCloseBtn');
    const overBtn = document.getElementById('rbOverviewBtn');
    const dots = document.querySelectorAll('#rbDots .rb-dot');

    if (prevBtn) prevBtn.onclick = () => window.RB_NAV?.go(window.RB_NAV.i - 1);
    if (nextBtn) nextBtn.onclick = () => window.RB_NAV?.go(window.RB_NAV.i + 1);
    if (closeBtn) closeBtn.onclick = () => window.RB_NAV?.close();
    if (overBtn) overBtn.onclick = () => window.RB_NAV?.showOverview();

    dots.forEach((dot, idx) => {
      dot.onclick = () => window.RB_NAV?.go(idx);
    });
  }, 100);

  const activateBtn = document.getElementById('btnActivate3D');
  const placeholder = document.getElementById('mapPosterPlaceholder');
  const canvasMount = document.getElementById('canvasMount');
  const toolbar = document.getElementById('mapFloatingToolbar');

  function activate3D() {
    is3DActive = true;
    analytics.trackMapEngagement('activate_3d');

    if (placeholder) placeholder.hidden = true;
    if (canvasMount) canvasMount.hidden = false;
    if (toolbar) toolbar.hidden = false;

    const existingView = document.getElementById('view');
    if (existingView) {
      existingView.classList.remove('landing');
      window.dispatchEvent(new Event('resize'));
    }

    // Lazy-load Three.js if not yet loaded and boot is not already active
    if (!window.THREE && !threeLoaded && !window.__AGNEE_BOOTED__ && !document.querySelector('script[src*="boot.js"]')) {
      loadThreeAndBoot();
    }
  }

  activateBtn?.addEventListener('click', activate3D);

  // Auto-activate on intersection if device is not low-data
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !is3DActive) {
          // If user hasn't enabled data saver, activate
          if (!navigator.connection?.saveData) {
            activate3D();
          }
          observer.disconnect();
        }
      });
    }, { rootMargin: '100px' });

    const wrapper = document.getElementById('mapViewportWrapper');
    if (wrapper) observer.observe(wrapper);
  }

  // Handle external event fly-to requests
  window.addEventListener('agnee:fly-to-place', (e) => {
    activate3D();
    const placeId = e.detail?.placeId;
    if (placeId) {
      flyToPlace(placeId);
    }
  });

  window.addEventListener('agnee:launch-map', () => {
    activate3D();
  });

  // Quick jump pins
  document.querySelectorAll('.venue-pin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activate3D();
      const placeId = btn.dataset.placeId;
      flyToPlace(placeId);
    });
  });

  // Pins navigation scroll arrows
  const pinsList = document.getElementById('pinsScrollList');
  document.getElementById('btnPinsScrollLeft')?.addEventListener('click', () => {
    pinsList?.scrollBy({ left: -240, behavior: 'smooth' });
  });
  document.getElementById('btnPinsScrollRight')?.addEventListener('click', () => {
    pinsList?.scrollBy({ left: 240, behavior: 'smooth' });
  });

  // Global methods for Earth 3D HUD integration
  window.captureMapPoster = captureMapPoster;

  window.toggleMapFullscreen = () => {
    const wrapper = document.getElementById('mapViewportWrapper');
    if (!wrapper) return;
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  };

  window.highlightVenuePin = (placeId) => {
    document.querySelectorAll('.venue-pin-btn').forEach(btn => {
      const match = btn.dataset.placeId === placeId;
      btn.classList.toggle('active', match);
      if (match) {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  };

  // Automatically activate 3D map
  activate3D();
}

function flyToPlace(placeId, attempts = 0) {
  const p = placesData.find(x => x.id === placeId);
  if (!p) return;
  if (typeof window.earthFlyTo === 'function') {
    window.earthFlyTo(p);
  } else if (attempts < 15) {
    activate3D();
    setTimeout(() => flyToPlace(placeId, attempts + 1), 300);
  }
}

function loadThreeAndBoot() {
  if (window.THREE || window.__AGNEE_BOOTED__ || document.querySelector('script[src*="boot.js"]')) return;
  threeLoaded = true;
  // Download the runtime modules in parallel with three.js (app.js reuses them from the HTTP cache)
  ['runtime-context', 'campus-geo', 'campus-scene', 'festival-scene', 'camera-effects', 'places', 'earth-ui', 'landing-and-loop'].forEach((m) => {
    const l = document.createElement('link');
    l.rel = 'preload'; l.as = 'fetch'; l.crossOrigin = 'anonymous'; l.href = `src/modules/${m}.js`;
    document.head.appendChild(l);
  });
  const mapImg = document.createElement('link');
  mapImg.rel = 'preload'; mapImg.as = 'image'; mapImg.href = 'assets/mics/campus-map.webp';
  document.head.appendChild(mapImg);
  const scriptThree = document.createElement('script');
  scriptThree.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  scriptThree.onload = () => {
    if (!window.__AGNEE_BOOTED__) {
      const bootScript = document.createElement('script');
      bootScript.src = 'src/boot.js';
      document.body.appendChild(bootScript);
    }
  };
  document.body.appendChild(scriptThree);
}

function captureMapPoster() {
  const canvas = document.getElementById('c');
  if (!canvas) {
    store.showToast('Please activate the 3D map first to capture.');
    return;
  }

  try {
    // Composite onto a 1920x1080 high-res card with branding
    const off = document.createElement('canvas');
    off.width = canvas.width || 1280;
    off.height = canvas.height || 720;
    const ctx = off.getContext('2d');

    // Draw the 3D scene
    ctx.drawImage(canvas, 0, 0, off.width, off.height);

    // Add cinematic gradient scrim
    const grad = ctx.createLinearGradient(0, off.height - 140, 0, off.height);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(10,5,20,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, off.height - 140, off.width, 140);

    // Watermark
    ctx.fillStyle = '#e0b860';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText('AGNEE 2026', 36, off.height - 56);
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 16px system-ui, sans-serif';
    ctx.fillText('Gati Shakti Vishwavidyalaya · Vadodara', 36, off.height - 30);

    // Download image
    const dataUrl = off.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `agnee2026-campus-view-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    store.showToast('Poster-quality view captured!');
    analytics.trackMapEngagement('capture_view');
  } catch (err) {
    console.error('Failed to capture map screenshot:', err);
    store.showToast('Could not export screenshot due to browser security restrictions.');
  }
}
