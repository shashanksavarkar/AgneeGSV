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

  mount.innerHTML = `
    <section class="section map-section" id="map" aria-labelledby="mapHeading">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" id="mapHeading">Explore the Venue & Campus</h2>
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
              <canvas id="c" aria-label="Interactive 3D model of the campus. Drag to rotate, scroll to zoom."></canvas>
              <div class="earth-intro" aria-hidden="true">
                <div class="earth-stars"></div>
                <div class="earth-globe"><span></span></div>
                <small>GATI SHAKTI VISHWAVIDYALAYA · VADODARA</small>
              </div>
              <div class="tag" id="t1">Gati Shakti Vishwavidyalaya (current academic block)</div>
              <div class="tag r" id="t3">Current hostel (NHSRCL)</div>
              <div class="tag g" id="t4">Proposed hostel block</div>
              <div class="tag a" id="t5">Atithi hostel</div>
              <div class="tag o" id="t6">Proposed laboratory block</div>
              <div class="tag o" id="t7">Proposed academic block</div>
              <div class="tag" id="t8">Pratap Vilas Palace</div>
              <div class="tag" id="t9">Manthan building</div>
              <div class="tag p" id="t10">AGNEE · The Cultural Fest — Oval Ground</div>
              <div class="tag e" id="t11">Main entrance gate</div>
              <div class="bar" role="group" aria-label="Camera">
                <button id="bFree" type="button">Free look</button>
                <button id="bTop" type="button">Top view</button>
                <button id="bHos" type="button">Hostels</button>
                <button id="bOval" type="button">★ Agnee Fest</button>
              </div>
              <button id="shareBtn" class="share-btn" type="button" aria-label="Share Agnee 2026">↗ <span>Share</span></button>
              <div id="load"><div class="ld"><i></i><b>Campus in 3D</b><span>Gati Shakti Vishwavidyalaya · building the map…</span></div></div>
            </div>
          </div>

          <!-- Directions Drawer / Flyout -->
          <div class="map-directions-drawer glass-panel" id="mapDirectionsDrawer" hidden>
            <div class="drawer-top">
              <h4>🚶 Campus Walking Directions</h4>
              <button type="button" class="drawer-close-btn" id="closeDirectionsBtn" aria-label="Close directions">✕</button>
            </div>
            <div class="directions-selector">
              <label for="directionsDestinationSelect">Destination from Main Gate:</label>
              <select id="directionsDestinationSelect" class="form-select">
                ${places.filter(p => p.id !== 'main-gate').map(p => `
                  <option value="${p.id}" ${p.id === 'oval-ground' ? 'selected' : ''}>
                    ${p.name} (~${p.walkTimeMinutes} mins)
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="directions-result" id="directionsResult">
              <!-- Injected dynamically -->
            </div>
          </div>
        </div>

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
}

function setupMapSectionInteractions() {
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

  // Directions drawer interactions
  const dirDrawer = document.getElementById('mapDirectionsDrawer');
  const closeDirBtn = document.getElementById('closeDirectionsBtn');
  const destSelect = document.getElementById('directionsDestinationSelect');

  closeDirBtn?.addEventListener('click', () => {
    if (dirDrawer) dirDrawer.hidden = true;
  });

  destSelect?.addEventListener('change', updateDirectionsDisplay);

  function updateDirectionsDisplay() {
    const destId = destSelect?.value || 'oval-ground';
    const place = placesData.find(p => p.id === destId);
    const resultEl = document.getElementById('directionsResult');
    if (!resultEl || !place) return;

    resultEl.innerHTML = `
      <div class="dir-summary">
        <span class="dir-time">⏱ Approx. ${place.walkTimeMinutes} mins walk</span>
        <span class="dir-dist">· ~${place.walkTimeMinutes * 80} metres</span>
      </div>
      <p class="dir-text">${place.directionsFromGate}</p>
      <button type="button" class="btn-secondary btn-sm" id="btnFocusVenueIn3D">
        Focus Venue in 3D Map
      </button>
    `;

    resultEl.querySelector('#btnFocusVenueIn3D')?.addEventListener('click', () => {
      flyToPlace(place.id);
    });
  }

  // Global methods for Earth 3D HUD integration
  window.captureMapPoster = captureMapPoster;

  window.toggleMapFullscreen = () => {
    const wrapper = document.getElementById('mapViewportWrapper');
    if (!wrapper) return;
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  window.toggleMapDirections = (destId) => {
    if (!dirDrawer) return;
    if (destId && destSelect) {
      destSelect.value = destId;
      updateDirectionsDisplay();
      dirDrawer.hidden = false;
    } else {
      dirDrawer.hidden = !dirDrawer.hidden;
      if (!dirDrawer.hidden) updateDirectionsDisplay();
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
