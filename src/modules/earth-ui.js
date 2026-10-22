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
    mode = 'focus';
    if (typeof setOn === 'function') setOn(null);
  }
  earthShowCard(place);
  earthHashUpdate();
}
window.earthFlyTo = earthFlyTo;
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
  const kicker =
    (place.featured ? '★ FEATURED · ' : '') + (place.category || 'VENUE').toUpperCase();
  card.innerHTML =
    '<button class="earth-card-close" type="button" aria-label="Close place card">✕</button>' +
    '<div class="earth-card-meta"><span class="earth-card-kicker">' +
    kicker +
    '</span><span class="earth-card-badge">⏱ ~' +
    walkMins +
    ' min walk</span></div>' +
    '<h2>' +
    (place.name || 'Venue') +
    '</h2>' +
    '<p>' +
    (place.description || '') +
    '</p>' +
    '<div class="earth-card-actions">' +
    '<button type="button" data-card-route>🚶 Directions</button>' +
    '<button type="button" data-card-tour>★ Agnee Fest Tour</button>' +
    '<button type="button" data-card-share>↗ Share</button>' +
    '</div>';
  card.querySelector('.earth-card-close').onclick = () => card.classList.remove('on');
  card.querySelector('[data-card-route]').onclick = () => {
    if (typeof window.toggleMapDirections === 'function') window.toggleMapDirections(place.id);
  };
  card.querySelector('[data-card-tour]').onclick = () => {
    card.classList.remove('on');
    if (typeof TOUR !== 'undefined' && typeof TOUR.start === 'function') TOUR.start();
  };
  card.querySelector('[data-card-share]').onclick = () => {
    if (navigator.share)
      navigator.share({ title: place.name, text: place.description, url: location.href });
    else navigator.clipboard?.writeText(location.href);
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
    '<div class="earth-search"><span class="earth-search-icon" aria-hidden="true">⌕</span><input id="earthSearchInput" type="search" autocomplete="off" placeholder="Search campus landmarks, stages, hostels…" aria-label="Search campus places"><button type="button" data-earth-clear aria-label="Clear search">×</button><div class="earth-suggest" role="listbox"></div></div>' +
    '<div class="earth-actions">' +
    '<button type="button" data-earth-home title="Campus Overview (Reset)" aria-label="Campus Overview">⌂<span>Home</span></button>' +
    '<button type="button" data-earth-directions title="Walking Directions" aria-label="Walking Directions">🚶<span>Walk</span></button>' +
    '<button type="button" data-earth-layers title="Map Layers" aria-label="Map Layers">▣<span>Layers</span></button>' +
    '<button type="button" data-earth-flat aria-pressed="false" title="Toggle 2D / 3D Tilt" aria-label="Switch 2D/3D"><span>3D</span></button>' +
    '<button type="button" data-earth-compass title="Reset North" aria-label="Reset North">N</button>' +
    '<button type="button" data-earth-ground title="Ground Cam" aria-label="Ground Cam">●<span>Ground</span></button>' +
    '<button type="button" data-earth-capture title="Capture Screenshot" aria-label="Capture Poster">📷<span>Snap</span></button>' +
    '<button type="button" data-earth-fullscreen title="Toggle Fullscreen" aria-label="Toggle Fullscreen">⛶<span>Full</span></button>' +
    '</div>' +
    '<div class="earth-layers" hidden><div class="earth-layers-header"><b>3D Map Layers</b><button type="button" class="earth-layers-close" aria-label="Close layers">✕</button></div><div class="earth-layer-list"></div></div>' +
    '<div class="earth-readout"><span>ALT <b>—</b></span><span>·</span><span>VADODARA · CAMPUS</span></div><div class="earth-scale">100 m</div>';
  viewEl.appendChild(shell);
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
    const places = earthPlaceList()
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 6);
    suggest.innerHTML = places
      .map(
        (p) =>
          '<button type="button" role="option" data-place="' +
          p.id +
          '"><b>' +
          p.name +
          '</b><small>' +
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
    const panel = shell.querySelector('.earth-layers');
    panel.hidden = !panel.hidden;
  };
  shell.querySelector('.earth-layers-close')?.addEventListener('click', () => {
    shell.querySelector('.earth-layers').hidden = true;
  });
  shell.querySelector('[data-earth-flat]').onclick = () => earthSetFlat(!EARTH_STATE.flat);
  shell.querySelector('[data-earth-compass]').onclick = () => {
    EARTH_STATE.heading = 0;
    if (typeof orb !== 'undefined') orb.theta = 0;
    shell.querySelector('[data-earth-compass]').style.transform = 'rotate(0deg)';
    earthHashUpdate();
  };
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
  shell.querySelector('[data-earth-directions]').onclick = () => {
    if (typeof window.toggleMapDirections === 'function') window.toggleMapDirections();
  };
  shell.querySelector('[data-earth-capture]').onclick = () => {
    if (typeof window.captureMapPoster === 'function') window.captureMapPoster();
  };
  shell.querySelector('[data-earth-fullscreen]').onclick = () => {
    if (typeof window.toggleMapFullscreen === 'function') window.toggleMapFullscreen();
  };
  shell.querySelector('[data-earth-ground]').title = 'Ground view';
  window.addEventListener('popstate', earthRestoreHash);
  setTimeout(earthRestoreHash, 0);
}
earthBuildUI();
