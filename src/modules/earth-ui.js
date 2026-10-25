
window.setCampusAtmosphere = (k) => {
  if (typeof duskT !== 'undefined') {
    duskT = k;
    if (typeof AF !== 'undefined') AF.touched = true;
  }
  document.querySelectorAll('.hud-light-btn').forEach(btn => {
    const mode = btn.dataset.light;
    const match = (mode === 'day' && k < 0.2) || (mode === 'golden' && k >= 0.2 && k <= 0.7) || (mode === 'dusk' && k > 0.7);
    btn.classList.toggle('active', match);
  });
};
// Google Earth-inspired map chrome: search, layers, compass, view mode and shareable state.
const EARTH_DEFAULT_LAYERS = {
  buildings: true,
  labels: true,
  roads: true,
  trees: true,
  crowd: true,
  fest: true,
  dusk: true,
  lite: false
};
const EARTH_LAYER_LABELS = {
  buildings: 'Buildings',
  labels: 'Labels',
  roads: 'Roads & paths',
  trees: 'Trees',
  crowd: 'Crowd & people',
  fest: 'Fest zone',
  dusk: 'Day / dusk',
  lite: 'Lite mode'
};
const EARTH_STATE = {
  layers: { ...EARTH_DEFAULT_LAYERS },
  heading: 0,
  flat: false,
  ground: false,
  selected: null,
  uiHidden: false
};
const earthRead = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    return fallback;
  }
};
const earthWrite = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {}
};
try {
  const saved = JSON.parse(earthRead('agnee-layers', '{}'));
  Object.assign(EARTH_STATE.layers, saved);
} catch (error) {}
const earthPlaceList = () => (typeof PLACES !== 'undefined' ? PLACES : []);
function earthPlaceById(id) {
  return earthPlaceList().find((p) => p.id === id);
}
function earthFlyTo(placeOrId) {
  if (!placeOrId) return;
  const id = typeof placeOrId === 'string' ? placeOrId : placeOrId.id;
  const p3d = earthPlaceById(id);
  const place = p3d
    ? Object.assign({}, p3d, typeof placeOrId === 'object' ? placeOrId : {})
    : typeof placeOrId === 'object'
      ? placeOrId
      : null;
  if (!place) return;
  const wW = typeof W !== 'undefined' ? W : 800;
  const wH = typeof H !== 'undefined' ? H : 600;
  const pos = place.position ||
    (p3d && p3d.position) || {
      x: (place.mapCoords?.x ?? 400) - wW / 2,
      y: 6,
      z: (place.mapCoords?.y ?? 300) - wH / 2
    };
  EARTH_STATE.selected = place.id;
  if (typeof window.highlightVenuePin === 'function') window.highlightVenuePin(place.id);
  if (typeof FT !== 'undefined') {
    FT.set(pos.x, pos.y || 6, pos.z);
    FR = place.pose?.distance || 120;
    focA = place.pose?.heading || 0;
    if (typeof focTilt !== 'undefined') focTilt = place.pose?.tilt || 0.18;
    mode = 'focus';
    modeT = typeof now !== 'undefined' ? now : performance.now() / 1000;
    if (typeof setOn === 'function') setOn(null);
  }
  earthShowCard(place);
  earthHashUpdate();
}
window.earthFlyTo = earthFlyTo;
const VENUE_EVENTS = {
  'oval-ground': ['🔥 Agnee Pro-Shows & Grand Finale', '🎸 Battle of the Bands', '👗 Fashion Night · DJ Arena'],
  'rajabaug': ['🎪 10 Pre-Agnee Carnival Stalls', '🎭 Street Plays & Nukkad Natak', '🏆 Games & Agnee Merch'],
  'sabhagrah': ['🎭 Classical Dance & Dramatics', '🎤 Solo & Duet Vocals', '🏆 Cultural Inauguration'],
  'manthan': ['♟️ Chess Championship', '🗣️ Youth Parliament & Debates', '📚 Creative Writing'],
  'academic-block': ['🎨 Fine Arts, Rangoli & Sketching', '💻 Tech Innovation Exhibits', '🎯 Hackathon Hub'],
  'palace': ['🏛️ Historic Landmark Tours', '📸 Heritage Photo Walk', '🌳 Garden Promenade']
};

function earthShowCard(place) {
  let card = document.querySelector('.earth-place-card');
  if (!card) {
    card = document.createElement('section');
    card.className = 'earth-place-card';
    card.setAttribute('aria-live', 'polite');
    document.getElementById('view').appendChild(card);
  }
  card.classList.remove('route');
  const walkMins = place.walkTimeMinutes || 3;
  const kicker = (place.featured ? '★ FEATURED · ' : '') + (place.category || 'VENUE').toUpperCase();
  const events = VENUE_EVENTS[place.id] || [];
  const eventsHtml = events.length
    ? '<div class="earth-card-events">' + events.map(ev => '<span class="ev-chip">' + ev + '</span>').join('') + '</div>'
    : '';

  card.innerHTML =
    '<button class="earth-card-close" type="button" aria-label="Close place card">✕</button>' +
    '<div class="earth-card-meta">' +
      '<span class="earth-card-kicker">' + kicker + '</span>' +
      '<span class="earth-card-badge">⏱ ~' + walkMins + ' min walk</span>' +
    '</div>' +
    '<h2>' + (place.name || 'Venue') + '</h2>' +
    '<p>' + (place.description || '') + '</p>' +
    eventsHtml +
    '<div class="earth-card-actions">' +
      '<button type="button" data-card-tour>★ 3D Focus</button>' +
    '</div>';

  card.querySelector('.earth-card-close').onclick = () => card.classList.remove('on');
  card.querySelector('[data-card-tour]').onclick = () => {
    if (place.id === 'oval-ground') {
      if (typeof TOUR !== 'undefined' && typeof TOUR.start === 'function') TOUR.start();
    } else if (place.id === 'rajabaug') {
      if (window.RB_NAV) window.RB_NAV.enter(0);
    } else {
      earthFlyTo(place);
    }
  };
  requestAnimationFrame(() => card.classList.add('on'));
}
function earthApplyLayer(key, value) {
  EARTH_STATE.layers[key] = value;
  earthWrite('agnee-layers', JSON.stringify(EARTH_STATE.layers));
  if (key === 'labels')
    document
      .querySelectorAll('.tag')
      .forEach((el) => (el.style.visibility = value ? 'visible' : 'hidden'));
  if (key === 'buildings' && typeof blds !== 'undefined')
    blds.forEach((item) => {
      if (item.m) item.m.visible = value;
    });
  if (key === 'dusk' && typeof duskT !== 'undefined') {
    duskT = value ? 1 : 0;
    const button = document.querySelector('.tbtn');
    if (button) button.textContent = value ? '☀ Day' : '☾ Dusk';
  }
  if (key === 'lite' && window.AGNEE_RUNTIME) window.AGNEE_RUNTIME.lite = value;
}
function earthHashUpdate() {
  const p = earthPlaceById(EARTH_STATE.selected);
  const hash = new URLSearchParams({
    place: EARTH_STATE.selected || '',
    flat: EARTH_STATE.flat ? '1' : '0',
    ground: EARTH_STATE.ground ? '1' : '0',
    heading: String(Math.round(EARTH_STATE.heading))
  });
  if (p) hash.set('q', p.id);
  history.replaceState(null, '', '#' + hash.toString());
}
function earthRestoreHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const p = earthPlaceById(params.get('place') || params.get('q'));
  if (params.get('flat') === '1') earthSetFlat(true);
  if (p) setTimeout(() => earthFlyTo(p), 500);
}
function earthSetFlat(flat) {
  EARTH_STATE.flat = flat;
  if (typeof orb !== 'undefined') {
    orb.phi = flat ? 0.03 : 0.78;
    orb.rt = flat ? 720 : Math.max(orb.rt, 300);
  }
  const button = document.querySelector('[data-earth-flat]');
  if (button) {
    button.setAttribute('aria-pressed', String(flat));
    button.querySelector('span').textContent = flat ? '2D' : '3D';
  }
  earthHashUpdate();
}
function earthBuildUI() {
  const viewEl = document.getElementById('view');
  if (!viewEl) return;
  viewEl.classList.add('earth-mode');
  const shell = document.createElement('div');
  shell.className = 'earth-ui';
  shell.innerHTML =
    '<aside class="earth-side-panel collapsed" id="earthSidePanel" aria-label="Campus 3D Explorer Controls">' +
      '<div class="esp-header">' +
        '<div class="esp-brand">' +
          '<div class="esp-badge">GSV</div>' +
          '<div class="esp-title-group">' +
            '<span class="esp-main-title">Campus 3D</span>' +
            '<span class="esp-sub-title">Vadodara · Agnee 2026</span>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="esp-toggle-btn" id="espToggleBtn" title="Toggle Side Panel" aria-label="Toggle Panel">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>' +
        '</button>' +
      '</div>' +

      '<div class="esp-search-container">' +
        '<div class="earth-search">' +
          '<span class="earth-search-icon" aria-hidden="true">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '</span>' +
          '<input id="earthSearchInput" type="search" autocomplete="off" placeholder="Search campus landmarks, hostels…" aria-label="Search campus places">' +
          '<button type="button" data-earth-clear aria-label="Clear search">×</button>' +
        '</div>' +
        '<div class="earth-suggest" role="listbox" hidden></div>' +
      '</div>' +

      '<div class="esp-section-heading"><span>QUICK ACTIONS</span></div>' +
      '<div class="earth-actions" role="toolbar" aria-label="Map Controls">' +
        '<button type="button" data-earth-home title="Campus Overview (Reset)" aria-label="Campus Overview">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' +
          '<span>Home</span>' +
        '</button>' +
        '<button type="button" data-earth-layers title="Map Layers" aria-label="Map Layers">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>' +
          '<span>Layers</span>' +
        '</button>' +
        '<button type="button" data-earth-flat aria-pressed="false" title="Toggle 2D / 3D Tilt" aria-label="Switch 2D/3D">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' +
          '<span>3D Tilt</span>' +
        '</button>' +
        '<button type="button" data-earth-ground title="Ground Cam" aria-label="Ground Cam">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M3 12h3M18 12h3M12 3v3M12 18v3"/></svg>' +
          '<span>Ground</span>' +
        '</button>' +
        '<button type="button" data-earth-capture title="Capture Screenshot" aria-label="Capture Poster">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>' +
          '<span>Snap</span>' +
        '</button>' +
        '<button type="button" data-earth-fullscreen title="Toggle Fullscreen" aria-label="Toggle Fullscreen">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>' +
          '<span>Expand</span>' +
        '</button>' +
      '</div>' +
      '<div class="esp-section-heading"><span>ZOOM CAMERA</span><span class="esp-badge-count" id="espZoomBadge">MID</span></div>' +
      '<div class="esp-zoom-container" role="group" aria-label="Zoom Controls">' +
        '<button type="button" class="esp-zoom-btn" data-earth-zoom-out title="Zoom Out (Min) · Double-click for full overview" aria-label="Zoom Out Min">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          '<span>Min</span>' +
        '</button>' +
        '<div class="esp-zoom-meter-wrap" title="Current Zoom Level">' +
          '<button type="button" class="esp-zoom-preset" data-earth-zoom-min-quick title="Full Min Overview">Min</button>' +
          '<div class="esp-zoom-track"><div class="esp-zoom-bar-fill" id="espZoomBarFill"></div></div>' +
          '<button type="button" class="esp-zoom-preset" data-earth-zoom-max-quick title="Full Max Close-up">Max</button>' +
        '</div>' +
        '<button type="button" class="esp-zoom-btn esp-zoom-btn-in" data-earth-zoom-in title="Zoom In (Max) · Double-click for full close-up" aria-label="Zoom In Max">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          '<span>Max</span>' +
        '</button>' +
      '</div>' +

      '<div class="earth-layers" hidden>' +
        '<div class="earth-layers-header"><b>3D Map Display Layers</b><button type="button" class="earth-layers-close" aria-label="Close layers">✕</button></div>' +
        '<div class="earth-layer-list"></div>' +
      '</div>' +

      '<div class="esp-section-heading"><span>CAMPUS LANDMARKS</span><span class="esp-badge-count">10</span></div>' +
      '<div class="esp-landmarks-scroll" id="espLandmarksContainer"></div>' +
    '</aside>' +
    '<div class="earth-floating-zoom" role="group" aria-label="Campus Zoom Dock">' +
      '<button type="button" class="efz-btn efz-max" data-floating-zoom-in title="Zoom In / Max (Double-click for full zoom)" aria-label="Max Zoom In">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
        '<span class="efz-text">Max</span>' +
      '</button>' +
      '<div class="efz-sep"></div>' +
      '<button type="button" class="efz-btn efz-min" data-floating-zoom-out title="Zoom Out / Min (Double-click for full overview)" aria-label="Min Zoom Out">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
        '<span class="efz-text">Min</span>' +
      '</button>' +
    '</div>' +
    '<div class="earth-readout"><span>ALT <b>—</b></span><span>·</span><span>VADODARA · CAMPUS</span></div>' +
    '<div class="earth-scale">100 m</div>';

  viewEl.appendChild(shell);

  // Populate landmarks list
  const landmarksBox = shell.querySelector('#espLandmarksContainer');
  if (landmarksBox) {
    const places = earthPlaceList();
    landmarksBox.innerHTML = places.map((p, i) => {
      const isFest = p.id === 'oval-ground';
      return '<button type="button" class="esp-landmark-item ' + (isFest ? 'fest-highlight' : '') + '" data-landmark-id="' + p.id + '">' +
        '<span class="esp-lm-index">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<div class="esp-lm-details">' +
          '<strong>' + p.name + '</strong>' +
          '<small>' + (p.category || 'venue').toUpperCase() + ' · ~' + (p.walkTimeMinutes || 3) + 'm</small>' +
        '</div>' +
        (isFest ? '<span class="esp-lm-fest">FEST</span>' : '<span class="esp-lm-arrow">↗</span>') +
      '</button>';
    }).join('');

    landmarksBox.querySelectorAll('[data-landmark-id]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.landmarkId;
        const place = earthPlaceById(id);
        if (place) {
          earthFlyTo(place);
          landmarksBox.querySelectorAll('.esp-landmark-item').forEach(b => b.classList.toggle('active', b === btn));
        }
      };
    });
  }

  // Collapse / Expand toggle
  const panel = shell.querySelector('#earthSidePanel');
  const toggleBtn = shell.querySelector('#espToggleBtn');
  if (toggleBtn && panel) toggleBtn.onclick = () => panel.classList.add('collapsed');

  const list = shell.querySelector('.earth-layer-list');
  Object.entries(EARTH_LAYER_LABELS).forEach(([key, label]) => {
    const row = document.createElement('label');
    row.innerHTML =
      '<span>' + label + '</span><input type="checkbox" data-layer="' + key + '"><i></i>';
    row.querySelector('input').checked = EARTH_STATE.layers[key];
    row.querySelector('input').onchange = (e) => earthApplyLayer(key, e.target.checked);
    list.appendChild(row);
  });
  const input = shell.querySelector('#earthSearchInput'),
    suggest = shell.querySelector('.earth-suggest');
  const renderSuggestions = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      suggest.hidden = true;
      suggest.innerHTML = '';
      return;
    }
    const places = earthPlaceList()
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 6);
    suggest.innerHTML = places
      .map(
        (p) =>
          '<button type="button" role="option" data-place="' +
          p.id +
          '"><span class="esp-sug-name">' +
          p.name +
          '</span><small class="esp-sug-tag">' +
          p.category +
          '</small></button>'
      )
      .join('');
    suggest.hidden = !places.length;
  };
  input.addEventListener('input', renderSuggestions);
  input.addEventListener('focus', renderSuggestions);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const p = earthPlaceList().find((x) =>
        x.name.toLowerCase().includes(input.value.trim().toLowerCase())
      );
      if (p) {
        earthFlyTo(p);
        suggest.hidden = true;
        input.blur();
      }
    }
  });
  suggest.addEventListener('click', (e) => {
    const button = e.target.closest('[data-place]');
    if (button) {
      earthFlyTo(earthPlaceById(button.dataset.place));
      suggest.hidden = true;
      input.value = earthPlaceById(button.dataset.place)?.name || '';
      input.blur();
    }
  });
  shell.querySelector('[data-earth-clear]').onclick = () => {
    input.value = '';
    suggest.hidden = true;
    input.focus();
  };
  shell.querySelector('[data-earth-layers]').onclick = () => {
    const p = shell.querySelector('.earth-layers');
    p.hidden = !p.hidden;
    shell.querySelector('[data-earth-layers]').classList.toggle('on', !p.hidden);
  };
  shell.querySelector('.earth-layers-close')?.addEventListener('click', () => {
    shell.querySelector('.earth-layers').hidden = true;
    shell.querySelector('[data-earth-layers]').classList.remove('on');
  });
  shell.querySelector('[data-earth-flat]').onclick = () => earthSetFlat(!EARTH_STATE.flat);
  shell.querySelector('[data-earth-home]').onclick = () => {
    EARTH_STATE.selected = null;
    if (typeof goFree === 'function') goFree();
    earthHashUpdate();
  };
  shell.querySelector('[data-earth-ground]').onclick = () => {
    EARTH_STATE.ground = !EARTH_STATE.ground;
    viewEl.classList.toggle('ground-view', EARTH_STATE.ground);
    shell.querySelector('[data-earth-ground]').classList.toggle('on', EARTH_STATE.ground);
    earthHashUpdate();
  };
  shell.querySelector('[data-earth-capture]').onclick = () => {
    if (typeof window.captureMapPoster === 'function') window.captureMapPoster();
  };
  shell.querySelector('[data-earth-fullscreen]').onclick = () => {
    if (typeof window.toggleMapFullscreen === 'function') window.toggleMapFullscreen();
  };
  shell.querySelector('[data-earth-ground]').title = 'Ground view';
  // Wire Zoom Max / Min Controls
  function wireZoomBtn(btn, zoomFn, fullZoomFn) {
    if (!btn) return;
    let holdTimer = null;
    let holdInterval = null;
    const startHold = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      zoomFn();
      holdTimer = setTimeout(() => {
        holdInterval = setInterval(() => {
          zoomFn(0.9);
        }, 70);
      }, 280);
    };
    const stopHold = () => {
      if (holdTimer) clearTimeout(holdTimer);
      if (holdInterval) clearInterval(holdInterval);
      holdTimer = null;
      holdInterval = null;
    };
    btn.addEventListener('pointerdown', startHold);
    btn.addEventListener('pointerup', stopHold);
    btn.addEventListener('pointerleave', stopHold);
    btn.addEventListener('pointercancel', stopHold);
    btn.addEventListener('dblclick', (e) => {
      e.preventDefault();
      stopHold();
      if (typeof fullZoomFn === 'function') fullZoomFn();
    });
  }
  const doZoomIn = (amt) => (typeof earthZoomIn === 'function' ? earthZoomIn(amt) : window.earthZoomIn && window.earthZoomIn(amt));
  const doZoomOut = (amt) => (typeof earthZoomOut === 'function' ? earthZoomOut(amt) : window.earthZoomOut && window.earthZoomOut(amt));
  const doZoomMax = () => (typeof earthZoomMax === 'function' ? earthZoomMax() : window.earthZoomMax && window.earthZoomMax());
  const doZoomMin = () => (typeof earthZoomMin === 'function' ? earthZoomMin() : window.earthZoomMin && window.earthZoomMin());

  wireZoomBtn(shell.querySelector('[data-earth-zoom-in]'), () => doZoomIn(), doZoomMax);
  wireZoomBtn(shell.querySelector('[data-earth-zoom-out]'), () => doZoomOut(), doZoomMin);
  wireZoomBtn(shell.querySelector('[data-floating-zoom-in]'), () => doZoomIn(), doZoomMax);
  wireZoomBtn(shell.querySelector('[data-floating-zoom-out]'), () => doZoomOut(), doZoomMin);

  shell.querySelector('[data-earth-zoom-max-quick]')?.addEventListener('click', doZoomMax);
  shell.querySelector('[data-earth-zoom-min-quick]')?.addEventListener('click', doZoomMin);

  // Continuous HUD and Zoom status updater
  function earthUpdateHUD() {
    if (typeof camPos !== 'undefined') {
      const altEl = document.querySelector('.earth-readout b');
      if (altEl) altEl.textContent = Math.round(camPos.y) + ' m';
    }
    if (typeof orb !== 'undefined') {
      const needle = document.querySelector('.esp-compass-needle');
      if (needle) needle.style.transform = 'rotate(' + (-orb.theta * 180 / Math.PI).toFixed(1) + 'deg)';
      const topDial = document.querySelector('#hudCompassBtn .compass-dial');
      if (topDial) topDial.style.transform = 'rotate(' + (-orb.theta * 180 / Math.PI).toFixed(1) + 'deg)';
      const fill = document.getElementById('espZoomBarFill');
      const badge = document.getElementById('espZoomBadge');
      if (fill || badge) {
        const minR = typeof rMin === 'function' ? rMin() : 90;
        const maxR = typeof rMax === 'function' ? rMax() : 1100;
        const frac = Math.max(0, Math.min(1, 1 - (orb.r - minR) / (maxR - minR)));
        if (fill) fill.style.width = (frac * 100).toFixed(1) + '%';
        if (badge) {
          if (frac > 0.88) badge.textContent = 'MAX';
          else if (frac < 0.12) badge.textContent = 'MIN';
          else badge.textContent = Math.round(frac * 100) + '%';
        }
      }
    }
  }
  setInterval(earthUpdateHUD, 120);

  window.addEventListener('popstate', earthRestoreHash);
  setTimeout(earthRestoreHash, 0);
}
earthBuildUI();