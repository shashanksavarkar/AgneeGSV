// ---- camera state

const camPos = new V(0, 760, 10),

  camTgt = new V(0, 0, 10);

const orb = { theta: 0.3, phi: 0.95, r: 680, rt: 680, vt: 0, vp: 0 },

  T0 = new V(0, 0, 12);

const FT = new V();

let FR = 150,

  focA = 0,

  focTilt = 0.18,

  pMode = null,

  modeT = -9;

const camV = new V(),

  tgtV = new V();

const AF = {

  fly: false,

  u: 1,

  t0: 0,

  D: 5,

  a0: 0,

  P0: new V(),

  T0: new V(),

  pre: 0,

  touched: false,

  arrived: true

};

const ease5 = (k) => k * k * k * (k * (6 * k - 15) + 10);

const lbT = document.createElement('div'),

  lbB = document.createElement('div'),

  agTT = document.createElement('div');

lbT.className = 'lb';

lbB.className = 'lb b';

agTT.className = 'agtitle';

agTT.innerHTML =

  '<img class="wmi" style="height:60px" alt="Agnee" src="' +

  WMURI +

  '"><small>THE CULTURAL FEST</small>';

view.append(lbT, lbB, agTT);

const orbAt = (a, R, Hh) => new V(240 - W / 2 + Math.sin(a) * R, Hh, 270 - H / 2 + Math.cos(a) * R);

function AFstart() {

  const C = new V(240 - W / 2, 40, 270 - H / 2);

  AF.P0.copy(camPos);

  AF.T0.copy(camTgt);

  AF.D = clamp(6.2 + AF.P0.distanceTo(C) / 160, 7, 10.5);

  AF.a0 =

    Math.hypot(camPos.x - C.x, camPos.z - C.z) > 25

      ? Math.atan2(camPos.x - C.x, camPos.z - C.z)

      : 2.3;

  AF.t0 = now;

  AF.arrived = false;

  AF.pre = duskT;

  AF.touched = false;

  duskT = 1;

  P_tb.textContent = '☀ Day';

  lbT.classList.add('on');

  lbB.classList.add('on');

  agTT.classList.remove('on');

}

function agLeave() {

  if (!AF.touched) {

    duskT = AF.pre;

    P_tb.textContent = duskT ? '☀ Day' : '☾ Dusk';

  }

  lbT.classList.remove('on');

  lbB.classList.remove('on');

  agTT.classList.remove('on');

}

const sd = (c, v, t, st, dt) => {

  const o = 2 / st,

    x = o * dt,

    e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x),

    ch = c.clone().sub(t),

    tp = v.clone().addScaledVector(ch, o).multiplyScalar(dt);

  v.addScaledVector(tp, -o).multiplyScalar(e);

  c.copy(t).addScaledVector(ch.add(tp), e);

};

let mode = RM ? 'idle' : 'intro',

  now = 0,

  t0 = null,

  last = 0;

if (RM) {

  camPos.set(

    ...(() => {

      const p = oPos(orb);

      return [p.x, p.y, p.z];

    })()

  );

}

function oPos(o, t = T0) {

  return new V(

    t.x + o.r * Math.sin(o.phi) * Math.sin(o.theta),

    o.r * Math.cos(o.phi),

    t.z + o.r * Math.sin(o.phi) * Math.cos(o.theta)

  );

}

function grab() {

  if (mode === 'focus') T0.set(FT.x, 0, FT.z);

  const rel = camPos.clone().sub(T0);

  orb.r = orb.rt = rel.length();

  orb.vt = orb.vp = 0;

  orb.phi = Math.acos(clamp(rel.y / orb.r, -1, 1));

  orb.theta = Math.atan2(rel.x, rel.z);

}

const bFree = document.getElementById('bFree'),

  bTop = document.getElementById('bTop'),

  bHos = document.getElementById('bHos'),

  bOval = document.getElementById('bOval');

function setOn(b) {

  [bFree, bTop, bHos, bOval, bRaj].filter(Boolean).forEach((x) => x.classList.toggle('on', x === b));

}

const shareBtn = document.getElementById('shareBtn');

shareBtn?.addEventListener('click', async () => {

  if (navigator.vibrate) navigator.vibrate(10);

  const share = {

    title: "Agnee'26 | Gati Shakti Vishwavidyalaya",

    text: "Explore the Agnee'26 campus in 3D.",

    url: location.href

  };

  try {

    if (navigator.share) await navigator.share(share);

    else {

      await navigator.clipboard.writeText(location.href);

      shareBtn.querySelector('span').textContent = 'Copied';

      setTimeout(() => (shareBtn.querySelector('span').textContent = 'Share'), 1600);

    }

  } catch (error) {

    if (error.name !== 'AbortError') console.warn('Share unavailable', error);

  }

});

function goFree() {

  if (mode !== 'explore') {

    grab();

    mode = 'explore';

  }

  setOn(bFree);

}

window.goFree = goFree;

bFree.onclick = goFree;

bHos.onclick = () => {

  mode = 'hostels';

  setOn(bHos);

};

bOval.onclick = () => TOUR.start();

const bRaj = document.getElementById('bRaj');

if (bRaj) {

  bRaj.onclick = () => {

    if (window.RB_NAV) {

      window.RB_NAV.enter(0);

    } else {

      FT.set(256 - W / 2, 6, 189 - H / 2);

      FR = 110;

      focA = Math.atan2(camPos.x - FT.x, camPos.z - FT.z);

      mode = 'focus';

      setOn(bRaj);

      showInfo('t12');

    }

  };

}



bTop.onclick = () => {

  T0.set(0, 0, 12);

  if (mode !== 'explore') {

    grab();

    mode = 'explore';

  }

  orb.phi = 0.03;

  orb.rt = 720;

  orb.theta = 0;

  orb.vt = orb.vp = 0;

  setOn(bTop);

};

const ptrs = new Map();

let lastPD = 0,

  lastT = 0,

  lastTap = 0,

  tapMoved = false,

  twoFingerTap = false;

const toFree = () => {

  if (mode === 'oval' || mode === 'stage' || mode === 'ground') {

    enterOF();

    return;

  }

  if (mode === 'ovfree') return;

  if (mode !== 'explore') {

    grab();

    mode = 'explore';

    setOn(bFree);

  }

};

function enterOF() {

  if (mode === 'stage') STG.sui0();

  T0.set(240 - W / 2, 0, 270 - H / 2);

  const rel = camPos.clone().sub(T0);

  orb.r = orb.rt = clamp(rel.length(), 30, 150);

  orb.vt = orb.vp = 0;

  orb.phi = clamp(Math.acos(clamp(rel.y / rel.length(), -1, 1)), 0.3, 1.4);

  orb.theta = Math.atan2(rel.x, rel.z);

  mode = 'ovfree';

  setOn(bOval);

  hint.textContent =

    'Drag to look around the ground \u00B7 scroll or pinch to zoom \u00B7 right-drag or shift-drag to pan';

  hint.style.display = '';

  hint.style.opacity = 1;

  setTimeout(() => (hint.style.opacity = 0), 6000);

}

const rMin = () => (mode === 'ovfree' ? 14 : 90),

  rMax = () => (mode === 'ovfree' ? 170 : 1100),

  pMax = () => (mode === 'ovfree' ? 1.45 : 1.25);

function earthZoomIn(step) {

  toFree();

  const factor = typeof step === 'number' ? step : 0.72;

  orb.rt = clamp(orb.rt * factor, rMin(), rMax());

}

function earthZoomOut(step) {

  toFree();

  const factor = typeof step === 'number' ? step : 1.38;

  orb.rt = clamp(orb.rt * factor, rMin(), rMax());

}

function earthZoomMax() {

  toFree();

  orb.rt = rMin();

}

function earthZoomMin() {

  toFree();

  orb.rt = rMax();

}

window.earthZoomIn = earthZoomIn;

window.earthZoomOut = earthZoomOut;

window.earthZoomMax = earthZoomMax;

window.earthZoomMin = earthZoomMin;

const clampOV = () => {

  if (mode !== 'ovfree') return;

  const cx = 240 - W / 2,

    cz = 270 - H / 2,

    dx = T0.x - cx,

    dz = T0.z - cz,

    d = Math.hypot(dx, dz);

  if (d > 46) {

    T0.x = cx + (dx / d) * 46;

    T0.z = cz + (dz / d) * 46;

  }

};

const pan = (dx, dy) => {

  const k = orb.r * 0.0016,

    c = Math.cos(orb.theta),

    n = Math.sin(orb.theta);

  T0.x = clamp(T0.x + (-c * dx - n * dy) * k, -W * 0.45, W * 0.45);

  T0.z = clamp(T0.z + (n * dx - c * dy) * k, -H * 0.45, H * 0.45);

  clampOV();

};

canvas.tabIndex = 0;

canvas.style.outline = 'none';

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('pointerdown', (e) => {

  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });

  canvas.setPointerCapture(e.pointerId);

  canvas.focus({ preventScroll: true });

  orb.vt = orb.vp = 0;

  lastT = e.timeStamp;

  tapMoved = false;

  if (ptrs.size === 2) {

    const [p, q] = [...ptrs.values()];

    lastPD = Math.hypot(p.x - q.x, p.y - q.y);

    twoFingerTap = true;

  }

});

canvas.addEventListener('pointermove', (e) => {

  const p = ptrs.get(e.pointerId);

  if (!p) return;

  const dx = e.clientX - p.x,

    dy = e.clientY - p.y;

  p.x = e.clientX;

  p.y = e.clientY;

  toFree();

  if (Math.abs(dx) + Math.abs(dy) > 6) tapMoved = true;

  if (ptrs.size >= 2) {

    const [a, b] = [...ptrs.values()],

      d = Math.hypot(a.x - b.x, a.y - b.y),

      angle = Math.atan2(b.y - a.y, b.x - a.x);

    if (lastPD) orb.rt = clamp((orb.rt * lastPD) / d, rMin(), rMax());

    if (window.AGNEE_RUNTIME.touchAngle != null) {

      let delta = angle - window.AGNEE_RUNTIME.touchAngle;

      if (delta > Math.PI) delta -= Math.PI * 2;

      if (delta < -Math.PI) delta += Math.PI * 2;

      orb.theta -= delta * 0.35;

    }

    window.AGNEE_RUNTIME.touchAngle = angle;

    lastPD = d;

    pan(dx / 2, dy / 2);

    orb.phi = clamp(orb.phi + dy * 0.003, 0.03, pMax());

  } else if (e.buttons & 2 || e.shiftKey || e.ctrlKey) {

    const h = Math.max(0.008, (e.timeStamp - lastT) / 1000);

    lastT = e.timeStamp;

    orb.theta -= dx * 0.006;

    orb.phi = clamp(orb.phi - dy * 0.005, 0.03, pMax());

    orb.vt = lerp(orb.vt, clamp((-dx * 0.006) / h, -3.5, 3.5), 0.5);

    orb.vp = lerp(orb.vp, clamp((-dy * 0.005) / h, -2.5, 2.5), 0.5);

  } else pan(dx, dy);

});

const up = (e) => {

  const wasTwo = twoFingerTap;

  ptrs.delete(e.pointerId);

  if (ptrs.size < 2) {

    lastPD = 0;

    window.AGNEE_RUNTIME.touchAngle = null;

    if (wasTwo && !tapMoved) {

      orb.rt = clamp(orb.rt * 1.28, rMin(), rMax());

    }

    twoFingerTap = false;

  } else if (!tapMoved) {

    twoFingerTap = true;

  }

  if (!tapMoved && !wasTwo) {

    const t = performance.now();

    if (t - lastTap < 320) {

      orb.rt = clamp(orb.rt * 0.72, rMin(), rMax());

      lastTap = 0;

    } else lastTap = t;

  }

};

canvas.addEventListener('pointerup', up);

canvas.addEventListener('pointercancel', up);



// Interactive 3D Raycasting for Rajabaug Carnival Stalls

const rbRaycaster = new THREE.Raycaster();

const rbMouse = new THREE.Vector2();



canvas.addEventListener('click', (e) => {

  if (tapMoved) return;

  const rect = canvas.getBoundingClientRect();

  rbMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;

  rbMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  rbRaycaster.setFromCamera(rbMouse, cam);



  if (window.AGNEE_RAJABAUG_STALLS && window.AGNEE_RAJABAUG_STALLS.length) {

    const hits = rbRaycaster.intersectObjects(window.AGNEE_RAJABAUG_STALLS, true);

    if (hits.length > 0) {

      let obj = hits[0].object;

      while (obj && (!obj.userData || typeof obj.userData.stallIndex !== 'number')) {

        obj = obj.parent;

      }

      if (obj && typeof obj.userData.stallIndex === 'number' && window.RB_NAV) {

        window.RB_NAV.enter(obj.userData.stallIndex);

        return;

      }

    }

  }

});
let _rbLastRaycast = 0;
let _cRect = null;
const getCRect = () => { if (!_cRect) _cRect = canvas.getBoundingClientRect(); return _cRect; };
window.addEventListener('resize', () => { _cRect = null; }, { passive: true });
window.addEventListener('scroll', () => { _cRect = null; }, { passive: true });

canvas.addEventListener('pointermove', (e) => {
  if (ptrs.size > 0 || !window.AGNEE_RAJABAUG_STALLS || !window.AGNEE_RAJABAUG_STALLS.length) return;
  const now = performance.now();
  if (now - _rbLastRaycast < 100) return;
  _rbLastRaycast = now;

  const rajDist = cam.position.distanceTo(new THREE.Vector3(265 - W / 2, 8, 192 - H / 2));
  if (rajDist > 220) {
    if (canvas.style.cursor === 'pointer') canvas.style.cursor = '';
    return;
  }

  const rect = getCRect();
  rbMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  rbMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  rbRaycaster.setFromCamera(rbMouse, cam);
  const hits = rbRaycaster.intersectObjects(window.AGNEE_RAJABAUG_STALLS, true);
  if (hits.length > 0) {
    if (canvas.style.cursor !== 'pointer') canvas.style.cursor = 'pointer';
  } else if (canvas.style.cursor === 'pointer') {
    canvas.style.cursor = '';
  }
}, { passive: true });

canvas.addEventListener(

  'wheel',

  (e) => {

    e.preventDefault();

    toFree();

    orb.rt = clamp(orb.rt * Math.exp(e.deltaY * 0.0012), rMin(), rMax());

  },

  { passive: false }

);

canvas.addEventListener('keydown', (e) => {

  const k = e.key,

    m = {

      ArrowLeft: () => (orb.vt = -1.3),

      ArrowRight: () => (orb.vt = 1.3),

      ArrowUp: () => (orb.vp = 0.9),

      ArrowDown: () => (orb.vp = -0.9),

      '+': () => (orb.rt = clamp(orb.rt * 0.84, rMin(), rMax())),

      '=': () => (orb.rt = clamp(orb.rt * 0.84, rMin(), rMax())),

      '-': () => (orb.rt = clamp(orb.rt * 1.18, rMin(), rMax()))

    };

  if (m[k]) {

    e.preventDefault();

    toFree();

    m[k]();

  }

});

const hint = document.createElement('div');

hint.textContent = 'Drag to look around · pinch to zoom · tap a label to inspect';

hint.style.cssText =

  'position:absolute;left:50%;bottom:66px;transform:translateX(-50%);padding:6px 12px;border-radius:999px;background:var(--panel);font:600 12px system-ui,sans-serif;pointer-events:none;transition:opacity 1s;white-space:nowrap;max-width:94%;overflow:hidden;text-overflow:ellipsis';

view.appendChild(hint);

setTimeout(() => (hint.style.opacity = 0), 7000);



function resize() {

  const w = Math.max(1, view.clientWidth),

    h = Math.max(1, view.clientHeight),

    portrait = w < h;

  renderer.setSize(w, h, false);

  cam.aspect = w / h;

  cam.fov = portrait ? 42 : 38;

  cam.updateProjectionMatrix();

  window.AGNEE_RUNTIME.viewport = { w, h, portrait, aspect: w / h };

}

new ResizeObserver(resize).observe(view);

resize();



const t1 = document.getElementById('t1'),

  t3 = document.getElementById('t3'),

  t4 = document.getElementById('t4'),

  t5 = document.getElementById('t5'),

  t6 = document.getElementById('t6'),

  t7 = document.getElementById('t7'),

  t8 = document.getElementById('t8'),

  t9 = document.getElementById('t9'),

  t12 = document.getElementById('t12'),

  t13 = document.getElementById('t13'),

  t14 = document.getElementById('t14'),

  t15 = document.getElementById('t15');

window.t14 = t14;

window.t15 = t15;

const TAG_PLACE_MAP = {

  t1: 'academic-block',

  t3: 'current-hostel',

  t4: 'proposed-hostel',

  t5: 'atithi-hostel',

  t6: 'proposed-lab',

  t7: 'proposed-academic',

  t8: 'palace',

  t9: 'manthan',

  t10: 'oval-ground',

  t11: 'main-gate',

  t12: 'sabhagrah',

  t13: 'pahune-hostel',

  t14: 'rajabaug',

  t15: 'mehman-hostel'

};

[

  ['t1', 357, 90.5, 54],

  ['t12', 425, 86.5, 48],

  ['t13', 476, 90, 48],

  ['t14', 256, 189, 110],

  ['t15', 293.8, 51.5, 26],

  ['t4', 606.5, 100, 54],

  ['t5', 516, 105.8, 29],

  ['t6', 511.5, 131.5, 50],

  ['t7', 481, 274.5, 52],

  ['t8', 320, 189, 52],

  ['t9', 435, 183.6, 48],

  ['t11', 577, 46, 52],

  ['t3', 605, 148, 44]

].forEach(([id, x, z, r]) => {

  const el = document.getElementById(id);

  if (!el) return;

  el.style.pointerEvents = 'auto';

  el.style.cursor = 'pointer';

  el.onclick = () => {

    const pid = TAG_PLACE_MAP[id];

    if (pid && typeof window.earthFlyTo === 'function') {

      window.earthFlyTo(pid);

    } else {

      FT.set(x - W / 2, id === 't3' ? 4.8 : (id === 't5' ? 5.5 : (id === 't15' ? 3.6 : 6)), z - H / 2);

      FR = id === 't5' ? 29 : (id === 't15' ? 26 : r);

      focA = (id === 't3' || id === 't4') ? -Math.PI / 2 : (id === 't15' ? 0.60 : 0);

      focTilt = id === 't3' ? 0.08 : (id === 't5' ? 0.11 : (id === 't15' ? 0.07 : 0.15));

      mode = 'focus';

      modeT = typeof now !== 'undefined' ? now : performance.now() / 1000;

      setOn(null);

    }

    showInfo(id);

    if (id === 't14' && window.RB_NAV) {

      setTimeout(() => window.RB_NAV.enter(0), 300);

    }

  };

});

if (t10) {

  t10.style.pointerEvents = 'auto';

  t10.style.cursor = 'pointer';

  t10.onclick = () => {

    if (typeof window.earthFlyTo === 'function') window.earthFlyTo('oval-ground');

    else TOUR.start();

  };

}
let _vW = 0, _vH = 0;
function updateViewDimensions() {
  if (typeof view !== 'undefined' && view) {
    _vW = view.clientWidth;
    _vH = view.clientHeight;
  }
}
updateViewDimensions();
window.addEventListener('resize', updateViewDimensions, { passive: true });
const _projVec = new THREE.Vector3();

function place(el, v) {
  if (!_vW || !_vH) updateViewDimensions();
  _projVec.copy(v).project(cam);
  if (_projVec.z >= 1) {
    if (el.style.display !== 'none') el.style.display = 'none';
    return;
  }
  if (el.style.display !== 'block') el.style.display = 'block';
  const x = Math.round(((_projVec.x + 1) * 0.5) * _vW);
  const y = Math.round(((1 - _projVec.y) * 0.5) * _vH);
  const d = cam.position.distanceTo(v);
  const scale = clamp(1.25 - d / 1400, 0.72, 1.05);
  const zIdx = Math.round(3000 - d);
  el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-100%) scale(' + scale + ')';
  if (el.dataset.z !== '' + zIdx) {
    el.style.zIndex = zIdx;
    el.dataset.z = '' + zIdx;
  }
}



// ---- Cinematic "simulation" transition to Agnee: HUD, warp streaks, holo grid, shockwaves, camera bank/FOV, title reveal

const cinematic = (() => {

  const mk = (c, h, p) => {

    const d = document.createElement('div');

    d.className = c;

    if (h) d.innerHTML = h;

    (p || view).appendChild(d);

    return d;

  };

  const root = mk('cin');

  const bl = document.createElement('canvas');

  bl.className = 'cin-bloom';

  bl.width = 160;

  bl.height = 100;

  root.appendChild(bl);

  const bx = bl.getContext('2d');

  mk('cin-grade', 0, root);

  const dof = mk('cin-dof', 0, root);

  mk('cin-scan', 0, root);

  mk('cin-vig', 0, root);

  const gr = document.createElement('canvas');

  gr.className = 'cin-grain';

  gr.width = 192;

  gr.height = 120;

  root.appendChild(gr);

  const gx = gr.getContext('2d'),

    gI = gx.createImageData(192, 120);

  const sc = document.createElement('canvas');

  sc.className = 'cin-streak';

  root.appendChild(sc);

  const sx = sc.getContext('2d');

  mk('cin-bar', 0, root);

  mk('cin-bar b', 0, root);

  const sweep = mk('cin-sweep', 0, root),

    flash = mk('cin-flash', 0, root);

  const hud = mk(

    'cin-hud',

    '<div class="ch tl"><i></i><b>SIM</b><span id="cPh">INITIALIZING</span></div>' +

      '<div class="ch tr"><span>T+<em id="cT">0.0</em>s</span><button id="cSkip" type="button">SKIP \u203A</button></div>' +

      '<div class="ch bl"><div><small>ALT</small><span><b id="cA">0</b><u>m</u></span></div><div><small>SPD</small><span><b id="cS">0</b><u>km/h</u></span></div><div><small>DST</small><span><b id="cD">0</b><u>m</u></span></div><div class="hd"><small>HDG</small><span><b id="cH">000</b><u>\u00B0</u></span></div></div>' +

      '<div class="ch br"><div class="pg"><i id="cP"></i></div><div class="st"><span>ACQUIRE</span><span>CRUISE</span><span>APPROACH</span><span>LOCK</span></div></div>' +

      '<div class="ret" id="cR"><svg viewBox="0 0 200 200" fill="none" stroke-width="1.5"><g class="rs"><circle cx="100" cy="100" r="94" stroke-dasharray="2 8"/><circle cx="100" cy="100" r="80" opacity=".5"/><path d="M100 2v12M100 186v12M2 100h12M186 100h12"/></g><g class="rb"><path d="M26 58V26h32M142 26h32v32M174 142v32h-32M58 174H26v-32" stroke-width="3"/></g><circle cx="100" cy="100" r="2.5" fill="currentColor"/></svg><span class="rl" id="cRL">AGNEE \u00B7 OVAL GROUND</span></div>',

    root

  );

  const cap = mk(

      'cin-cap',

      '<i></i><b>OVAL GROUND</b><span>Gati Shakti Vishwavidyalaya</span>',

      root

    ),

    flare = mk('cin-flare', 0, root);

  const q = (s) => hud.querySelector(s),

    cPh = q('#cPh'),

    cT = q('#cT'),

    cA = q('#cA'),

    cS = q('#cS'),

    cD = q('#cD'),

    cH = q('#cH'),

    cP = q('#cP'),

    ret = q('#cR'),

    cRL = q('#cRL'),

    steps = [...hud.querySelectorAll('.st span')];

  const title = mk(

    'cin-title',

    '<div class="t"><span style="--i:0"><img class="wm" alt="Agnee 2026" src="' +

      WMURI +

      '"></span></div><div class="ln"></div><div class="s">THE CULTURAL FEST</div>',

    root

  );

  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/#',

    PH = [

      'SIMULATION INITIALIZED',

      'CRUISE \u00B7 TRAJECTORY LOCKED',

      'APPROACH \u00B7 VENUE IN RANGE',

      'ARRIVED \u00B7 AGNEE'

    ];

  const scr = (e, txt, ms) => {

    const id = (e._s = (e._s || 0) + 1),

      t0 = performance.now();

    (function f() {

      if (e._s !== id) return;

      const k = Math.min(1, (performance.now() - t0) / ms),

        n = Math.floor(k * txt.length);

      let o = txt.slice(0, n);

      for (let i = n; i < txt.length; i++)

        o += txt[i] === ' ' ? ' ' : CH[(Math.random() * CH.length) | 0];

      e.textContent = o;

      if (k < 1) setTimeout(f, 32);

    })();

  };

  // 3D: holographic grid disc + shockwave cylinders at the venue

  const venueV = new V(agC.x, 6, agC.z);

  const gm = new THREE.ShaderMaterial({

    transparent: true,

    depthWrite: false,

    blending: THREE.AdditiveBlending,

    side: THREE.DoubleSide,

    uniforms: { uT: { value: 0 }, uK: { value: 0 }, uS: { value: -1 } },

    vertexShader:

      'varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',

    fragmentShader: `varying vec2 vP;uniform float uT,uK,uS;

  float ln(float v){return smoothstep(.43,.5,abs(fract(v)-.5));}

  void main(){float r=length(vP)/96.;

   float g=max(ln(vP.x/6.),ln(vP.y/6.));

   float rg=smoothstep(.44,.5,abs(fract(r*8.)-.5));

   float rim=smoothstep(.95,.985,r)*(1.-smoothstep(.99,1.,r));

   float on=step(0.,uS);

   float dd=(r-uS)*16.;float band=exp(-dd*dd)*on;

   float trail=exp(-max(0.,uS-r)*5.)*step(r,uS)*on;

   float fade=1.-smoothstep(.72,1.,r);

   float a=(g*.14+rg*.2)*fade*(.55+.45*sin(uT*1.6-r*9.));

   a+=band*.9+trail*.2*(g+.5)+rim*.9;

   vec3 c=mix(vec3(1.,.9,.7),vec3(1.,.62,.4),clamp(r+band*.3,0.,1.));

   gl_FragColor=vec4(c,clamp(a,0.,1.)*uK);}`

  });

  const grid = new THREE.Mesh(new THREE.CircleGeometry(96, 96), gm);

  grid.rotation.x = -Math.PI / 2;

  grid.position.set(agC.x, 1.4, agC.z);

  grid.renderOrder = 6;

  grid.visible = false;

  scene.add(grid);

  const shG = () => {

    const g = new THREE.CylinderGeometry(1, 1, 26, 72, 1, true).translate(0, 13, 0),

      p = g.attributes.position,

      c = [];

    for (let i = 0; i < p.count; i++) {

      const k = Math.max(0, 1 - p.getY(i) / 26);

      c.push(k, k, k);

    }

    g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));

    return g;

  };

  const shocks = [

    [0xffe2b0, 125, 2.6],

    [0xffb067, 150, 3.2]

  ].map(([col, R, d]) => {

    const m = new THREE.Mesh(

      shG(),

      new THREE.MeshBasicMaterial({

        color: col,

        vertexColors: true,

        transparent: true,

        opacity: 0,

        blending: THREE.AdditiveBlending,

        depthWrite: false,

        side: THREE.DoubleSide

      })

    );

    m.position.set(agC.x, 0.6, agC.z);

    m.visible = false;

    scene.add(m);

    return { m, R, d, t: 99 };

  });

  const ping = (i, delay) => {

    shocks[i].t = -delay;

  };

  const vl = new THREE.PointLight(0xffb77a, 0, 180, 2);

  vl.position.set(agC.x, 36, agC.z);

  scene.add(vl);

  const pool = new THREE.Mesh(

    new THREE.CircleGeometry(70, 48).rotateX(-Math.PI / 2),

    new THREE.MeshBasicMaterial({

      map: GLW,

      color: 0xffc890,

      transparent: true,

      opacity: 0,

      blending: THREE.AdditiveBlending,

      depthWrite: false

    })

  );

  pool.position.set(agC.x, 1.1, agC.z);

  pool.visible = false;

  scene.add(pool);

  const NP = 140,

    pp = new Float32Array(NP * 3),

    pv = [];

  for (let i = 0; i < NP; i++) {

    const a = Math.random() * 6.283,

      r = Math.sqrt(Math.random()) * 95;

    pp[i * 3] = agC.x + Math.cos(a) * r;

    pp[i * 3 + 1] = Math.random() * 55;

    pp[i * 3 + 2] = agC.z + Math.sin(a) * r;

    pv.push(0.6 + Math.random() * 1.4);

  }

  const pg = new THREE.BufferGeometry();

  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));

  const pts = new THREE.Points(

    pg,

    new THREE.PointsMaterial({

      map: GLW,

      color: 0xffd9a0,

      size: 4,

      transparent: true,

      opacity: 0,

      depthWrite: false,

      blending: THREE.AdditiveBlending

    })

  );

  pts.frustumCulled = false;

  pts.visible = false;

  scene.add(pts);

  let was = false,

    tok = 0,

    pf = 0,

    arrDone = false,

    ph = -1,

    simK = 0,

    roll = 0,

    spd = 0,

    lastTxt = 0,

    lock = false;

  const prev = new V(),

    dirV = new V();

  const sw = new Array(46)

    .fill(0)

    .map((_, i) => ({ a: Math.random() * Math.PI * 2, p: Math.random(), w: 0.5 + Math.random() }));

  const retrig = (e) => {

    e.classList.remove('go');

    void e.offsetWidth;

    e.classList.add('go');

  };

  function begin() {

    ++tok;

    arrDone = false;

    ph = -1;

    lock = false;

    root.className = 'cin on';

    view.classList.add('cine', 'cg');

    hint.style.opacity = 0;

    title.className = 'cin-title';

    cap.classList.remove('on');

    ret.classList.remove('lock');

    cRL.textContent = 'AGNEE \u00B7 OVAL GROUND';

    if (!RM) retrig(flash);

    scr(cPh, PH[0], 900);

    steps.forEach((e) => e.classList.remove('a'));

    ping(0, 0.3);

    ping(1, 1);

    prev.copy(camPos);

    spd = 0;

  }

  function arrive() {

    arrDone = true;

    const k = tok;

    cap.classList.remove('on');

    cam.updateMatrixWorld();

    const fp = venueV.clone().project(cam);

    flare.style.left = ((fp.x + 1) / 2) * view.clientWidth + 'px';

    flare.style.top = ((1 - fp.y) / 2) * view.clientHeight + 'px';

    if (!RM) {

      retrig(sweep);

      retrig(flare);

    }

    ping(0, 0);

    ping(1, 0.45);

    title.className = 'cin-title on';

    scr(cPh, 'SIMULATION ACTIVE // LIVE', 800);

    steps.forEach((e) => e.classList.add('a'));

    setTimeout(() => {

      if (k === tok) title.classList.add('out');

    }, 4300);

    setTimeout(() => {

      if (k === tok) {

        root.classList.add('calm');

        view.classList.remove('cine');

      }

    }, 5000);

    setTimeout(() => {

      if (k === tok) title.className = 'cin-title';

    }, 5600);

  }

  function end() {

    ++tok;

    root.className = 'cin';

    view.classList.remove('cine', 'cg');

    cap.classList.remove('on');

    title.className = 'cin-title';

  }

  q('#cSkip').addEventListener('click', () => {

    if (mode === 'oval' && AF.fly) AF.t0 = now - AF.D;

  });

  bOval.addEventListener('click', () => {

    if (mode === 'oval' && AF.arrived && was) {

      const pr = AF.pre;

      AFstart();

      AF.pre = pr;

      AF.a0 += 2.6;

      was = false;

    }

  });

  function update(dt) {

    const on = mode === 'oval';

    treeRate = on || mode === 'tour' ? 3.4 : simK > 0.04 ? 4.5 : 7;

    if (on && !was) begin();

    if (!on && was) end();

    was = on;

    const fl = on && AF.fly,

      u = on ? clamp((now - AF.t0) / AF.D) : 0;

    if (on && AF.arrived && !arrDone) arrive();

    // holographic grid

    const tk = !on ? 0 : fl ? clamp((u - 0.28) / 0.5) : 0.5;

    simK += (tk - simK) * (1 - Math.exp(-dt * (tk > simK ? 2.2 : 3.5)));

    gm.uniforms.uK.value = simK;

    gm.uniforms.uT.value = now;

    grid.visible = simK > 0.01;

    vl.intensity = simK * 0.9;

    pool.visible = pts.visible = simK > 0.01;

    if (pts.visible) {

      pool.material.opacity = simK * 0.4 * (0.88 + 0.12 * Math.sin(now * 2.1));

      pts.material.opacity = simK * 0.85;

      for (let i = 0; i < NP; i++) {

        pp[i * 3 + 1] += pv[i] * dt * 3;

        if (pp[i * 3 + 1] > 56) pp[i * 3 + 1] = 0;

        pp[i * 3] += Math.sin(now * 0.6 + i) * dt * 0.8;

      }

      pg.attributes.position.needsUpdate = true;

    }

    let s = -1;

    if (on) {

      if (fl) s = clamp((u - 0.4) / 0.55);

      else {

        const c = ((((now - AF.t0 - AF.D) % 5) + 5) % 5) / 5;

        s = c < 0.7 ? c / 0.7 : -1;

      }

    }

    gm.uniforms.uS.value = s;

    shocks.forEach((S) => {

      S.t += dt;

      const k = S.t / S.d;

      if (S.t < 0 || k >= 1) {

        S.m.visible = false;

        return;

      }

      S.m.visible = true;

      const e = 1 - Math.pow(1 - k, 3),

        r = 6 + S.R * e;

      S.m.scale.set(r, 1, r);

      S.m.material.opacity = 0.9 * Math.pow(1 - k, 1.6);

    });

    if (!on && !root.classList.contains('on')) return;

    // HUD

    const calm = root.classList.contains('calm');

    if (on && !calm) {

      const idx = u < 0.14 ? 0 : u < 0.58 ? 1 : u < 0.9 ? 2 : 3;

      cap.classList.toggle('on', idx >= 2 && !arrDone);

      if (!arrDone && idx !== ph) {

        ph = idx;

        scr(cPh, PH[idx], 650);

        steps.forEach((e, i) => e.classList.toggle('a', i <= idx));

        if (idx === 3 && !lock) {

          lock = true;

          cRL.textContent = 'TARGET LOCKED';

          ret.classList.add('lock');

        }

      }

      const sp = dt > 0 ? camPos.distanceTo(prev) / dt : 0;

      prev.copy(camPos);

      spd += (Math.min(sp, 500) - spd) * 0.1;

      if (now - lastTxt > 0.07) {

        lastTxt = now;

        cam.getWorldDirection(dirV);

        cA.textContent = Math.round(camPos.y);

        cS.textContent = Math.round(spd * 3.6);

        cD.textContent = Math.round(camPos.distanceTo(venueV));

        cH.textContent = String(

          Math.round(((Math.atan2(dirV.x, -dirV.z) * 180) / Math.PI + 360) % 360)

        ).padStart(3, '0');

        cT.textContent = Math.max(0, now - AF.t0).toFixed(1);

        cP.style.width = u * 100 + '%';

      }
cam.updateMatrixWorld();
_projVec.copy(venueV).project(cam);
const vis = _projVec.z < 1 && !(arrDone && now - AF.t0 - AF.D > 1.8);
ret.classList.toggle('on', vis);
if (vis) {
  ret.style.transform = `translate3d(${((_projVec.x + 1) * 0.5 * _vW).toFixed(1)}px, ${((1 - _projVec.y) * 0.5 * _vH).toFixed(1)}px, 0)`;
  ret.style.setProperty('--s', Math.max(90, lerp(_vW * 0.42, _vW * 0.17, ease5(u))) + 'px');
}

    } else if (calm) ret.classList.remove('on');

    // warp streaks

    const w2 = view.clientWidth,

      h2 = view.clientHeight;

    if (sc.width !== w2 || sc.height !== h2) {

      sc.width = w2;

      sc.height = h2;

    }

    sx.clearRect(0, 0, w2, h2);

    const I = !RM && fl ? Math.pow(Math.sin(Math.PI * u), 2) : 0;

    dof.style.opacity = on ? (calm ? 0.2 : 0.22 + 0.7 * I) : 0;

    if (I > 0.03) {

      const cx = w2 / 2,

        cy = h2 * 0.52,

        R = Math.hypot(w2, h2) / 2;

      sx.lineCap = 'round';

      for (const st of sw) {

        const t = (st.p + now * (0.35 + I * 0.9) * st.w) % 1,

          r = R * (0.14 + 0.9 * t * t),

          len = R * 0.16 * I * (0.25 + t),

          a = 0.3 * I * t;

        sx.strokeStyle =

          'rgba(' + (st.w > 1.1 ? '255,226,190' : '255,255,255') + ',' + a.toFixed(3) + ')';

        sx.lineWidth = 1 + t * 1.6;

        sx.beginPath();

        sx.moveTo(cx + Math.cos(st.a) * r, cy + Math.sin(st.a) * r);

        sx.lineTo(cx + Math.cos(st.a) * (r + len), cy + Math.sin(st.a) * (r + len));

        sx.stroke();

      }

    }

  }

  function camFx(dt) {

    const fl = mode === 'oval' && AF.fly && !RM,

      u = AF.u,

      sn = Math.sin(Math.PI * u);

    const tr = fl ? 0.085 * Math.sin(u * Math.PI * 2) * Math.pow(sn, 0.6) : 0;

    roll += (tr - roll) * (1 - Math.exp(-dt * 4));

    if (Math.abs(roll) > 1e-4) cam.rotateZ(roll);

    const sh = fl ? 0.0016 * sn * sn : 0;

    if (sh) {

      cam.rotateX(Math.sin(now * 41) * sh);

      cam.rotateY(Math.sin(now * 33 + 1.7) * sh);

    }

    if (!RM && mode === 'oval' && !AF.fly) {

      cam.rotateZ(Math.sin(now * 0.45) * 0.0022);

      cam.rotateX(Math.sin(now * 0.31) * 0.001);

    }

    cam.updateMatrixWorld(true);

  }

  const oTv = new V(agC.x - 4, 6, agC.z + 4);

  treeHook = (T) => {

    let tg, Rv, Rf;

    if (

      simK > 0.04 ||

      mode === 'oval' ||

      mode === 'stage' ||

      mode === 'ovfree' ||

      mode === 'ground'

    ) {

      tg = oTv;

      Rv = 62;

      Rf = 64;

    } else if (mode === 'tour' && TOUR.active) {

      tg = TOUR.lk;

      Rv = 34;

      Rf = 30;

    } else return false;

    const dx = T.x - tg.x,

      dz = T.z - tg.z;

    if (dx * dx + dz * dz < Rf * Rf) return true; // keep the focus area clear

    const C = cam.position,

      top = T.th + T.sy * 1.7,

      hx = T.x - C.x,

      hz = T.z - C.z;

    if (hx * hx + hz * hz < 28 * 28 && C.y < top + 10) return true; // never let a tree sit around the lens

    const vx = tg.x - C.x,

      vy = tg.y - C.y,

      vz = tg.z - C.z,

      L2 = vx * vx + vy * vy + vz * vz || 1,

      s = (hx * vx + (T.cy - C.y) * vy + hz * vz) / L2;

    if (s < 0.03 || s > 1.04) return false;

    if (top < 0.5 * (C.y + vy * s)) return false; // low trees well below the sight line can stay

    const qx = C.x + vx * s - T.x,

      qy = C.y + vy * s - T.cy,

      qz = C.z + vz * s - T.z;

    return Math.hypot(qx, qy, qz) < T.r + 3 + Rv * s; // cone from the lens to the target

  };
function post() {
  // Disabled heavy GPU readback bx.drawImage(canvas) and CPU random noise loop
}

  return { update, camFx, post };

})();



const AFarc = (P0, P3, t, y, k) => {

  const dx = P3.x - P0.x,

    dz = P3.z - P0.z,

    l = Math.hypot(dx, dz) || 1,

    o = Math.min(130, l * 0.3) * k;

  return new V(lerp(P0.x, P3.x, t) - (dz / l) * o, y, lerp(P0.z, P3.z, t) + (dx / l) * o);

};

// ---- Landing screen -> guided journey (gate > hostels > new buildings > academic core > palace > Oval Ground) -> "Enter the Fest"

const FEST = {

  name: 'AGNEE',

  tag: 'The Cultural Fest',

  host: 'Gati Shakti Vishwavidyalaya',

  venue: 'Oval Ground',

  when: 'Dates announcing soon',

  about:

    'Agnee is the cultural fest of Gati Shakti Vishwavidyalaya \u2014 and it happens on the Oval Ground you just flew into. This page will carry the full programme as it is announced.',

  events: [

    ['Music', 'Live bands, solos and open-mic nights'],

    ['Dance', 'Group and solo performances on the main stage'],

    ['Drama', 'Stage plays, street plays and mime'],

    ['Art & Design', 'Exhibitions, live painting and installations'],

    ['Literary', 'Debates, quizzes and creative writing'],

    ['Fashion', 'Showcases and styling contests']

  ],

  steps: [

    ['Dates', 'Announcing soon'],

    ['Line-up', 'Announcing soon'],

    ['Registrations', 'Opening soon']

  ]

};
const SPON = {
  tiers: [
    { t: 'Title Sponsor', s: ['State Bank of India'], logo: 'assets/State_Bank_of_India-removebg-preview.webp' },
    { t: 'Powered By', s: ['Union Bank of India'], logo: 'assets/Union_Bank_of_India_Logo-removebg-preview.webp' },

    {

      t: 'Associate Sponsors',

      s: ['Announcing soon', 'Announcing soon', 'Announcing soon', 'Announcing soon']

    },

    {

      t: 'Partners',

      s: [

        'Food Partner',

        'Media Partner',

        'Tech Partner',

        'Gifting Partner',

        'Radio Partner',

        'Travel Partner'

      ]

    }

  ]

};

const sponTxt = (t) =>

  t.s.length > 1 && new Set(t.s).size === 1

    ? t.s.length + ' slots \u00B7 ' + t.s[0]

    : t.s.join(' \u00B7 ');

const wp = (x, y, h) => new V(x - W / 2, h, y - H / 2);

const ST = [

  {

    chap: 'Arrival',

    name: 'Main Entrance Gate',

    sub: 'Welcome to Gati Shakti Vishwavidyalaya',

    tag: '',

    path: true

  },

  {

    chap: 'Hostels',

    n: 1,

    of: 5,

    name: 'Pahune Hostel',

    sub: 'Hostel',

    tag: 'Existing',

    x: 476,

    y: 90,

    R: 48,

    Hc: 20

  },

  {

    chap: 'Hostels',

    n: 2,

    of: 5,

    name: 'Atithi Hostel',

    sub: 'Hostel',

    tag: 'Existing',

    x: 516,

    y: 105.8,

    R: 29,

    Hc: 6

  },

  {

    chap: 'Hostels',

    n: 3,

    of: 5,

    name: "Mehman Boy's Hostel",

    sub: 'Hostel',

    tag: 'Existing',

    x: 295,

    y: 54,

    R: 30,

    Hc: 8

  },

  {

    chap: 'Hostels',

    n: 4,

    of: 5,

    name: 'Proposed Hostel Block',

    sub: 'Hostel',

    tag: 'Proposed',

    x: 648,

    y: 98,

    R: 90,

    Hc: 56

  },

  {

    chap: 'Hostels',

    n: 5,

    of: 5,

    name: 'Current Hostel (NHSRCL)',

    sub: 'Hostel',

    tag: 'Existing',

    x: 605,

    y: 148,

    R: 44,

    Hc: 14

  },

  {

    chap: 'New Buildings',

    n: 1,

    of: 2,

    name: 'Proposed Laboratory Block',

    sub: 'Laboratory',

    tag: 'Proposed',

    x: 511,

    y: 150,

    R: 88,

    Hc: 54

  },

  {

    chap: 'New Buildings',

    n: 2,

    of: 2,

    name: 'Proposed Academic Block',

    sub: 'Academic',

    tag: 'Proposed',

    x: 496,

    y: 270,

    R: 96,

    Hc: 58

  },

  {

    chap: 'Academic Core',

    n: 1,

    of: 3,

    name: 'Manthan Building',

    sub: 'Classroom building',

    tag: 'Existing',

    x: 435,

    y: 201,

    R: 74,

    Hc: 46

  },

  {

    chap: 'Academic Core',

    n: 2,

    of: 3,

    name: 'Sardar Patel Sabhagrah',

    sub: 'Auditorium & Conference Hall',

    tag: 'Existing',

    x: 425,

    y: 86.5,

    R: 48,

    Hc: 20

  },

  {

    chap: 'Academic Core',

    n: 3,

    of: 3,

    name: 'Gati Shakti Vishwavidyalaya',

    sub: 'Current academic block',

    tag: 'Existing',

    x: 357,

    y: 70,

    R: 100,

    Hc: 62

  },

  {

    chap: 'Heritage',

    name: 'Pratap Vilas Palace',

    sub: 'Landmark',

    tag: 'Existing',

    x: 331,

    y: 189,

    R: 88,

    Hc: 52,

    dwell: 3.6

  },

  { chap: 'Finale', name: 'Oval Ground', sub: 'AGNEE \u00B7 The Cultural Fest', id: 'oval' }

];

const gP = new THREE.CatmullRomCurve3(

  [

    [580, -16, 30],

    [578, 16, 25],

    [576, 46, 25],

    [573, 82, 24],

    [566, 114, 28]

  ].map((p) => wp(...p))

);

const gL = new THREE.CatmullRomCurve3(

  [

    [577, 50, 10],

    [576, 80, 9],

    [570, 112, 9],

    [556, 140, 9],

    [540, 152, 9]

  ].map((p) => wp(...p))

);

const bez = (o, A, B, C, D, e) => {

  const k = 1 - e,

    a = k * k * k,

    b = 3 * k * k * e,

    c = 3 * k * e * e,

    d = e * e * e;

  return o.set(

    A.x * a + B.x * b + C.x * c + D.x * d,

    A.y * a + B.y * b + C.y * c + D.y * d,

    A.z * a + B.z * b + C.z * c + D.z * d

  );

};

const dm = (c, h) => {

  const e = document.createElement('div');

  e.className = c;

  if (h) e.innerHTML = h;

  view.appendChild(e);

  return e;

};
