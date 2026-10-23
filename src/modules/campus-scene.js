// ---- texture (erase the baked-in 2D icons)
const cv = document.createElement('canvas');
cv.width = W;
cv.height = H;
const cx = cv.getContext('2d', { willReadFrequently: true });
cx.drawImage(img, 0, 0, W, H);
cx.drawImage(cv, 270, 20, 40, 46, 323, 20, 40, 46);
cx.drawImage(cv, 630, 172, 34, 32, 636, 124, 34, 32);
const px = cx.getImageData(0, 0, W, H).data;
const lumAt = (x, y) => {
  const i = ((y | 0) * W + (x | 0)) * 4;
  return [px[i], px[i + 1], px[i + 2]];
};

const canvas = document.getElementById('c'),
  view = document.getElementById('view');
// Mobile quality profile: keep the first interaction responsive on mid-range phones.
const isMobileDevice = matchMedia('(max-width: 767px)').matches || navigator.maxTouchPoints > 0;
const isLowEndDevice = isMobileDevice && (navigator.hardwareConcurrency || 4) <= 4;
window.AGNEE_RUNTIME = { isMobileDevice, isLowEndDevice, paused: false };
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, isLowEndDevice ? 1.5 : 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = !isMobileDevice;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  window.AGNEE_RUNTIME.contextLost = true;
  const load = document.getElementById('load');
  if (load) {
    load.innerHTML =
      '<div class="ld"><b>3D paused</b><span>Reload this page to restore the campus view.</span></div>';
    load.style.opacity = 1;
    load.style.display = 'grid';
  }
});
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe0ea);
scene.fog = new THREE.Fog(0xcfe0ea, 900, 2200);
const cam = new THREE.PerspectiveCamera(38, 1.6, 1, 4000);

const tex = new THREE.CanvasTexture(cv);
tex.encoding = THREE.sRGBEncoding;
tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

const hemi = new THREE.HemisphereLight(0xffffff, 0x8a9a80, 0.75);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2dd, 0.7);
sun.position.set(-260, 380, 200);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {
  left: -460,
  right: 460,
  top: 300,
  bottom: -300,
  near: 50,
  far: 1200
});
sun.shadow.bias = -0.0006;
scene.add(sun);

// ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(W, H),
  new THREE.MeshBasicMaterial({ map: tex })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const sh = new THREE.Mesh(
  new THREE.PlaneGeometry(W, H),
  new THREE.ShadowMaterial({ opacity: 0.38 })
);
sh.rotation.x = -Math.PI / 2;
sh.position.y = 0.15;
sh.receiveShadow = true;
scene.add(sh);
const terr = (() => {
  const TW = 512,
    TH = Math.round((512 * H) / W),
    c = document.createElement('canvas');
  c.width = TW * 3;
  c.height = TH * 3;
  const g = c.getContext('2d');
  try {
    g.filter = 'blur(2px)';
  } catch (e) { }
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) {
      g.save();
      g.translate((i + 1.5) * TW, (j + 1.5) * TH);
      g.scale(i ? -1 : 1, j ? -1 : 1);
      g.drawImage(cv, -TW / 2, -TH / 2, TW, TH);
      g.restore();
    }
  g.filter = 'none';
  const e = Math.round(TW * 0.9),
    eh = Math.round(TH * 0.9);
  [
    [0, 0, c.width, eh, 0, 0, 0, eh],
    [0, c.height - eh, c.width, eh, 0, c.height, 0, c.height - eh],
    [0, 0, e, c.height, 0, 0, e, 0],
    [c.width - e, 0, e, c.height, c.width, 0, c.width - e, 0]
  ].forEach(([x, y, w, h, x0, y0, x1, y1]) => {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, 'rgb(127,139,114)');
    gr.addColorStop(1, 'rgba(127,139,114,0)');
    g.fillStyle = gr;
    g.fillRect(x, y, w, h);
  });
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 3, H * 3),
    new THREE.MeshBasicMaterial({ map: t })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = -0.4;
  scene.add(m);
  return m;
})();
const apron = new THREE.Mesh(
  new THREE.PlaneGeometry(6000, 6000),
  new THREE.MeshBasicMaterial({ color: 0x7f8b72 })
);
apron.rotation.x = -Math.PI / 2;
apron.position.y = -0.6;
scene.add(apron);

// walls
const wc = document.createElement('canvas');
wc.width = wc.height = 64;
const g = wc.getContext('2d');
g.fillStyle = '#ddd6c8';
g.fillRect(0, 0, 64, 64);
g.fillStyle = '#51697c';
[
  [7, 12],
  [37, 12]
].forEach(([a, b]) => g.fillRect(a, b, 20, 26));
g.fillStyle = 'rgba(255,255,255,.25)';
[
  [7, 12],
  [37, 12]
].forEach(([a, b]) => g.fillRect(a, b, 20, 8));
g.fillStyle = '#c9c1b1';
g.fillRect(0, 56, 64, 8);
// Night windows: LITMAP maps a diffuse texture to its emissive twin; LIT holds the materials whose glow follows dusk (see P_look).
const LIT = [],
  LITMAP = new Map(),
  BUMPMAP = new Map(),
  WALLMAT = new Map();
function litTex(c) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}
// Derive a warm emissive window map from a diffuse canvas: dark, non-red pixels (glass, arches) light up per cell.
function litFromCanvas(c) {
  const w = c.width,
    h = c.height,
    s = c.getContext('2d').getImageData(0, 0, w, h).data,
    o = document.createElement('canvas');
  o.width = w;
  o.height = h;
  const g = o.getContext('2d'),
    im = g.createImageData(w, h),
    d = im.data;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4,
        l = (s[i] + s[i + 1] + s[i + 2]) / 3;
      if (l > 30 && l < 112 && s[i] - s[i + 2] < 38) {
        const cell = (Math.imul(x >> 3, 73856093) ^ Math.imul(y >> 4, 19349663)) >>> 0;
        if (cell % 100 < 68) {
          const k = 0.55 + (0.45 * ((cell >> 8) % 100)) / 100;
          d[i] = 255 * k;
          d[i + 1] = 172 * k;
          d[i + 2] = 80 * k;
          d[i + 3] = 255;
        }
      }
    }
  g.putImageData(im, 0, 0);
  return o;
}
// One shared wall material per texture + repeat; it carries the emissive window map and relief when they exist.
function litMat(base, rep) {
  const key = base.uuid + rep.join();
  let m = WALLMAT.get(key);
  if (!m) {
    const wt = base.clone();
    wt.needsUpdate = true;
    wt.repeat.set(...rep);
    m = new THREE.MeshStandardMaterial({
      map: wt,
      roughness: 0.84,
      metalness: 0.04,
      envMap: ENV,
      envMapIntensity: 0.3,
      bumpMap: BUMPMAP.get(base) || wt,
      bumpScale: BUMPMAP.has(base) ? 1.4 : 0.5,
      side: THREE.DoubleSide
    });
    const lm = LITMAP.get(base);
    if (lm) {
      m.emissive.setHex(0xffffff);
      m.emissiveMap = lm;
      m.emissiveIntensity = 0;
      LIT.push(m);
    }
    WALLMAT.set(key, m);
  }
  return m;
}
// 512px facade: recessed windows with frames, sills, slab bands and streaking; also paints the night-window (emissive) and relief (bump) maps.
function facadeTexture({
  base = '#ddd6c8',
  accent = '#51697c',
  trim = '#c9c1b1',
  seed = 17,
  windows = true
} = {}) {
  const mkc = () => {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    return c;
  };
  const c = mkc(),
    ec = mkc(),
    bc = mkc();
  const g = c.getContext('2d'),
    eg = ec.getContext('2d'),
    bg = bc.getContext('2d');
  [g, eg, bg].forEach((x) => x.scale(2, 2));
  let q = seed | 0;
  const rnd = () => {
    q = (q * 1664525 + 1013904223) >>> 0;
    return q / 4294967296;
  };
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  eg.fillStyle = '#000';
  eg.fillRect(0, 0, 256, 256);
  bg.fillStyle = '#808080';
  bg.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 7000; i++) {
    g.fillStyle = (rnd() < 0.52 ? 'rgba(255,255,255,' : 'rgba(40,35,30,') + (0.025 + rnd() * 0.075) + ')';
    const s = 0.3 + rnd() * 1.5;
    g.fillRect(rnd() * 256, rnd() * 256, s, s);
  }
  // slab bands between floors
  for (let row = 0; row <= 5; row++) {
    const y = 8 + row * 40 - 5;
    g.fillStyle = trim;
    g.fillRect(0, y, 256, 3);
    g.fillStyle = 'rgba(30,24,18,.28)';
    g.fillRect(0, y + 3, 256, 1.4);
    bg.fillStyle = '#b4b4b4';
    bg.fillRect(0, y, 256, 3);
  }
  g.fillStyle = trim;
  g.fillRect(0, 239, 256, 17);
  g.fillRect(0, 0, 256, 7);
  if (windows) {
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 6; col++) {
        const x = 17 + col * 43 + (row % 2) * 4,
          y = 18 + row * 40;
        // staining below the sill
        const st = g.createLinearGradient(0, y + 23, 0, y + 40);
        st.addColorStop(0, 'rgba(45,38,30,.16)');
        st.addColorStop(1, 'rgba(45,38,30,0)');
        g.fillStyle = st;
        g.fillRect(x + 1, y + 23, 17, 17);
        // surround and recess
        g.fillStyle = 'rgba(255,250,240,.32)';
        g.fillRect(x - 3, y - 3, 25, 27);
        g.fillStyle = 'rgba(20,16,12,.55)';
        g.fillRect(x - 1, y - 1, 21, 23);
        const gl = g.createLinearGradient(x, y, x + 19, y + 21);
        gl.addColorStop(0, '#9fb4c2');
        gl.addColorStop(0.45, accent);
        gl.addColorStop(1, '#1d2a36');
        g.fillStyle = gl;
        g.fillRect(x + 1, y + 2, 17, 19);
        g.fillStyle = 'rgba(235,245,250,.38)';
        g.beginPath();
        g.moveTo(x + 1, y + 2);
        g.lineTo(x + 9, y + 2);
        g.lineTo(x + 1, y + 14);
        g.fill();
        g.fillStyle = 'rgba(14,18,22,.7)';
        g.fillRect(x + 9, y + 2, 1.2, 19);
        g.fillRect(x + 1, y + 11, 17, 1);
        g.fillStyle = trim;
        g.fillRect(x - 3, y + 21, 25, 3);
        g.fillStyle = 'rgba(20,16,12,.4)';
        g.fillRect(x - 3, y + 24, 25, 1.2);
        // relief: raised surround, deep recess, raised sill
        bg.fillStyle = '#c8c8c8';
        bg.fillRect(x - 3, y - 3, 25, 27);
        bg.fillStyle = '#101010';
        bg.fillRect(x, y + 1, 19, 20);
        bg.fillStyle = '#d8d8d8';
        bg.fillRect(x - 3, y + 21, 25, 3);
        // lit window
        if (rnd() < 0.62) {
          const k = 0.6 + rnd() * 0.4,
            lg = eg.createLinearGradient(0, y, 0, y + 21);
          lg.addColorStop(0, `rgb(${255 * k | 0},${200 * k | 0},${120 * k | 0})`);
          lg.addColorStop(1, `rgb(${255 * k | 0},${150 * k | 0},${64 * k | 0})`);
          eg.fillStyle = lg;
          eg.fillRect(x + 1, y + 2, 17, 19);
          eg.fillStyle = '#000';
          eg.fillRect(x + 9, y + 2, 1.2, 19);
          if (rnd() < 0.4) eg.fillRect(x + 1, y + 2, 17, 5 + rnd() * 6);
        }
      }
  }
  const shade = g.createLinearGradient(0, 0, 256, 0);
  shade.addColorStop(0, 'rgba(0,0,0,.12)');
  shade.addColorStop(0.12, 'transparent');
  shade.addColorStop(0.86, 'transparent');
  shade.addColorStop(1, 'rgba(0,0,0,.16)');
  g.fillStyle = shade;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 8;
  if (windows) {
    LITMAP.set(t, litTex(ec));
    BUMPMAP.set(t, litTex(bc));
  }
  return t;
}
const wallBase = facadeTexture({ base: '#ddd6c8', accent: '#51697c', trim: '#c9c1b1', seed: 17 });
// Small night-sky environment so metals, glass and walls pick up a warm horizon sheen.
const ENV = (() => {
  const es = new THREE.Scene(),
    sg = new THREE.SphereGeometry(50, 24, 16),
    pos = sg.attributes.position,
    col = [],
    top = new THREE.Color(0x120d1c),
    hor = new THREE.Color(0xff9a5c),
    cc = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const h = Math.max(0, pos.getY(i) / 50);
    cc.copy(hor).lerp(top, Math.pow(h, 0.5));
    col.push(cc.r, cc.g, cc.b);
  }
  sg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  es.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const pm = new THREE.PMREMGenerator(renderer),
    t = pm.fromScene(es, 0.04).texture;
  pm.dispose();
  return t;
})();
// Roofs: tiled concrete / gravel (UVs are in map pixels, 1 tile = 10 units) instead of the aerial photo.
const roofT = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#c4bfb6';
  g.fillRect(0, 0, 256, 256);
  let q = 91;
  const r = () => ((q = (q * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = (r() < 0.5 ? 'rgba(255,255,255,' : 'rgba(30,26,22,') + (0.04 + r() * 0.1) + ')';
    g.fillRect(r() * 256, r() * 256, 0.6 + r() * 1.6, 0.6 + r() * 1.6);
  }
  g.strokeStyle = 'rgba(40,34,28,.32)';
  g.lineWidth = 1.2;
  for (let i = 0; i <= 256; i += 128) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 256);
    g.moveTo(0, i);
    g.lineTo(256, i);
    g.stroke();
  }
  for (let i = 0; i < 7; i++) {
    g.fillStyle = 'rgba(30,26,22,.07)';
    g.fillRect(r() * 200, r() * 200, 30 + r() * 50, 20 + r() * 40);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 8;
  t.repeat.set(0.1, 0.1);
  return t;
})();
const ROOFMAT = new Map();
const roofMatFor = (col) => {
  let m = ROOFMAT.get(col);
  if (!m) ROOFMAT.set(col, (m = new THREE.MeshLambertMaterial({ color: col, map: roofT, side: THREE.DoubleSide })));
  return m;
};
const roofMat = roofMatFor(0x8a847c);

// ---- buildings (pixel boxes on the photo: x0,y0,x1,y1,height)
const BUILDINGS = []; // superseded by the real footprints in GEO (see the footprints section below)
const blds = [];
function addB(x0, y0, x1, y1, h, delay) {
  const w = x1 - x0,
    d = y1 - y0,
    cxp = (x0 + x1) / 2,
    cyp = (y0 + y1) / 2;
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv,
    p = geo.attributes.position,
    n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++)
    if (n.getY(i) > 0.5) uv.setXY(i, cxp + p.getX(i), cyp + p.getZ(i));
  geo.translate(0, h / 2, 0);
  const wall = litMat(wallBase, [
    Math.max(1, Math.round(Math.max(w, d) / 16)),
    Math.max(1, Math.round(h / 9))
  ]);
  const m = new THREE.Mesh(geo, [wall, wall, roofMat, wall, wall, wall]);
  m.position.set(cxp - W / 2, 0, cyp - H / 2);
  m.castShadow = m.receiveShadow = true;
  m.scale.y = RM ? 1 : 0.001;
  scene.add(m);
  blds.push({ m, d: delay });
}
BUILDINGS.forEach((b) => addB(...b, 0.5 + (b[0] / W) * 1.6));
// ---- the two hostels, traced from the red / green boxes (map pixels)
const hc = document.createElement('canvas');
hc.width = hc.height = 64;
const hg = hc.getContext('2d');
hg.fillStyle = '#e7dac6';
hg.fillRect(0, 0, 64, 64);
hg.fillStyle = '#5a463a';
hg.fillRect(9, 13, 16, 22);
hg.fillRect(39, 13, 16, 22);
hg.fillStyle = 'rgba(255,255,255,.2)';
hg.fillRect(9, 13, 16, 6);
hg.fillRect(39, 13, 16, 6);
hg.fillStyle = '#cdbba3';
hg.fillRect(0, 40, 64, 5);
const hostelBase = facadeTexture({ base: '#e7dac6', accent: '#5a463a', trim: '#cdbba3', seed: 43 });
function mk(pts, h, col, edge, delay, holes, strips, base, rep) {
  const P = (a) => a.map(([x, z]) => new THREE.Vector2(x - W / 2, -(z - H / 2)));
  const sh = new THREE.Shape(P(pts));
  (holes || []).forEach((a) => sh.holes.push(new THREE.Path(P(a))));
  // chamfered roof edge (bevelOffset keeps the footprint exact); the sharp-edged twin feeds the accent outline
  const geo = new THREE.ExtrudeGeometry(sh, {
    depth: h,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.3,
    bevelOffset: -0.3,
    bevelSegments: 2
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -0.35, 0);
  const eg = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }).rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, [
    roofMatFor(col),
    litMat(base || hostelBase, rep || [1 / 14, 1 / 3.15])
  ]);
  m.castShadow = m.receiveShadow = true;
  m.scale.y = RM ? 1 : 0.001;
  m.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(eg, 40),
      new THREE.LineBasicMaterial({ color: edge })
    )
  );
  (strips || []).forEach(([x0, z0, x1, z1]) => {
    const s = new THREE.Mesh(
      new THREE.BoxGeometry(x1 - x0, 0.8, z1 - z0),
      new THREE.MeshLambertMaterial({ color: 0x1f3350 })
    );
    s.position.set((x0 + x1) / 2 - W / 2, h + 0.4, (z0 + z1) / 2 - H / 2);
    m.add(s);
  });
  scene.add(m);
  blds.push({ m, d: delay });
  return m;
}
// current hostel (red): closed courtyard block
const solar = [];
for (let i = 0; i < 4; i++) {
  const x0 = 621 + i * 9;
  solar.push([x0, 133.4, x0 + 7, 138.2], [x0, 158.2, x0 + 7, 162.8]);
}
const redM = mk(
  [
    [609, 132],
    [669, 132],
    [669, 164],
    [609, 164]
  ],
  22,
  0xbdb5a8,
  0xff3b30,
  2.2,
  [
    [
      [618, 139.5],
      [658, 139.5],
      [658, 157],
      [618, 157]
    ]
  ],
  solar
);
// new hostel (green): three tall slabs
const tower = tx((g) => {
  g.fillStyle = '#dcc3a0';
  g.fillRect(0, 0, 64, 64);
  [0, 32].forEach((x) => {
    g.fillStyle = '#a9573a';
    g.fillRect(x, 0, 12, 64);
    g.fillStyle = '#8f4730';
    g.fillRect(x + 12, 0, 1, 64);
    g.fillStyle = '#46586a';
    g.fillRect(x + 16, 10, 10, 34);
    g.fillStyle = '#efe6d4';
    g.fillRect(x + 14, 44, 14, 3);
  });
  g.fillStyle = '#efe6d4';
  g.fillRect(0, 59, 64, 5);
});
// new hostel: footprint traced from the architect's site plan (comb with 3 slots + 3 courtyards open to the south)
const HP = [
  [100, 38],
  [137, 38],
  [137, 90],
  [162, 90],
  [162, 35],
  [200, 35],
  [200, 100],
  [227, 100],
  [227, 36],
  [260, 36],
  [260, 90],
  [290, 90],
  [290, 33],
  [338, 33],
  [338, 161],
  [305, 161],
  [305, 123],
  [272, 123],
  [272, 161],
  [243, 161],
  [243, 123],
  [208, 123],
  [208, 161],
  [178, 161],
  [178, 123],
  [145, 123],
  [145, 161],
  [100, 161]
].map(([x, y]) => [610 + (x - 100) * 0.316, 80.05 + (y - 33) * 0.316]);
mk(HP, 38, 0xd8cfbb, 0xa6f040, 2.5, [], [], tower, [1 / 14, 1 / 3.3]);
// courtyard trees
for (let i = 0; i < 6; i++) {
  const cx0 = 624 + (i % 3) * 14,
    cz0 = 145 + Math.floor(i / 3) * 8;
  const tr = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.7, 4, 5),
    new THREE.MeshLambertMaterial({ color: 0x5a4632 })
  );
  tr.position.set(cx0 - W / 2, 2, cz0 - H / 2);
  const cr = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.4, 1),
    new THREE.MeshLambertMaterial({ color: 0x4a8a3a })
  );
  cr.position.set(cx0 - W / 2, 6.5, cz0 - H / 2);
  cr.castShadow = true;
  scene.add(tr, cr);
}
// open land for the new hostel, and the entrance side of the current hostel (west)
const flat = (x0, z0, x1, z1, y, col) => {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(x1 - x0, z1 - z0),
    new THREE.MeshLambertMaterial({ color: col })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set((x0 + x1) / 2 - W / 2, y, (z0 + z1) / 2 - H / 2);
  m.receiveShadow = true;
  scene.add(m);
  return m;
};
flat(598, 60, 696, 121, 0.2, 0x9b8466);
// 6M road between the two hostels + west forecourt with the entrance canopy
flat(604, 120.5, 692, 132, 0.35, 0x3f4146);
flat(588, 78, 610, 121, 0.35, 0x3f4146);
const can = new THREE.Mesh(
  new THREE.BoxGeometry(7, 0.8, 16),
  new THREE.MeshLambertMaterial({ color: 0xf4f4f4 })
);
can.position.set(606.5 - W / 2, 7, 100 - H / 2);
can.castShadow = true;
scene.add(can);
[
  [604, 93],
  [604, 107],
  [609, 93],
  [609, 107]
].forEach(([x, z]) => {
  const cl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 7, 8),
    new THREE.MeshLambertMaterial({ color: 0xe9e4d8 })
  );
  cl.position.set(x - W / 2, 3.5, z - H / 2);
  scene.add(cl);
});
// ---- NHSRCL (High Speed Rail Training Institute) authentic entrance, portico, signage and forecourt
flat(580, 126, 608.2, 142.5, 0.28, 0x487d32); // North forecourt lawn
flat(580, 153.5, 608.2, 170, 0.28, 0x487d32); // South forecourt lawn
flat(576, 142.5, 601.5, 153.5, 0.32, 0xd8cfbe); // Central paved pedestrian approach
flat(579.5, 142, 601.5, 142.6, 0.34, 0x823b2c); // Terracotta lawn edging
flat(579.5, 153.4, 601.5, 154, 0.34, 0x823b2c); // Terracotta lawn edging

// Materials
const nhSandstone = new THREE.MeshLambertMaterial({ color: 0xd6ccb9 });
const nhMaroon = new THREE.MeshLambertMaterial({ color: 0x701824 });
const nhWhite = new THREE.MeshLambertMaterial({ color: 0xf5f1e8 });
const nhDarkMetal = new THREE.MeshLambertMaterial({ color: 0x22262d });
const nhGlass = new THREE.MeshLambertMaterial({ color: 0x1f364a, transparent: true, opacity: 0.85 });
const nhTerra = new THREE.MeshLambertMaterial({ color: 0x933d31 });

// 1. Entrance Plinth and Cascading Terraced Steps
const nhPlinth = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.5, 17.6), nhSandstone);
nhPlinth.position.set(605.4 - W / 2, 0.25, 148 - H / 2);
nhPlinth.castShadow = nhPlinth.receiveShadow = true;
redM.add(nhPlinth);

// 3 Terraced low steps descending to the approach walkway
[
  [16.8, 0.36, 0.8, 601.4, 0.18],
  [16.4, 0.24, 0.8, 600.6, 0.12],
  [16.0, 0.12, 0.8, 599.8, 0.06]
].forEach(([w, h, d, x, y]) => {
  const step = new THREE.Mesh(new THREE.BoxGeometry(d, h, w), nhSandstone);
  step.position.set(x - W / 2, y, 148 - H / 2);
  step.castShadow = step.receiveShadow = true;
  redM.add(step);
});

// 2. Grand Entrance Canopy Portico ("HIGH SPEED RAIL TRAINING INSTITUTE")
const nhCanopy = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.15, 17.0), nhMaroon);
nhCanopy.position.set(605.4 - W / 2, 4.75, 148 - H / 2);
nhCanopy.castShadow = true;
redM.add(nhCanopy);

// White coping / trims on canopy
const nhCanopyTop = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.16, 17.2), nhWhite);
nhCanopyTop.position.set(605.4 - W / 2, 5.38, 148 - H / 2);
redM.add(nhCanopyTop);

const nhCanopyBot = new THREE.Mesh(new THREE.BoxGeometry(7.3, 0.12, 17.1), nhWhite);
nhCanopyBot.position.set(605.4 - W / 2, 4.14, 148 - H / 2);
redM.add(nhCanopyBot);

// Canopy soffit (underside ceiling) with warm recessed lights
const nhSoffit = new THREE.Mesh(new THREE.PlaneGeometry(16.8, 7.0), new THREE.MeshLambertMaterial({ color: 0xf0ebe1 }));
nhSoffit.rotation.x = Math.PI / 2;
nhSoffit.position.set(605.4 - W / 2, 4.12, 148 - H / 2);
redM.add(nhSoffit);

// Recessed ceiling light fixtures
const nhLightMat = new THREE.MeshBasicMaterial({ color: 0xfff3da });
for (let lx = 603; lx <= 607; lx += 2) {
  for (let lz = 142; lz <= 154; lz += 3) {
    const dl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 10), nhLightMat);
    dl.position.set(lx - W / 2, 4.12, lz - H / 2);
    redM.add(dl);
  }
}

// Canopy Front Fascia Signboard: "HIGH SPEED RAIL TRAINING INSTITUTE"
const nhEngC = document.createElement('canvas');
nhEngC.width = 1024;
nhEngC.height = 128;
const nhEg = nhEngC.getContext('2d');
nhEg.fillStyle = '#701824';
nhEg.fillRect(0, 0, 1024, 128);
nhEg.fillStyle = '#ffffff';
nhEg.fillRect(0, 0, 1024, 6);
nhEg.fillRect(0, 122, 1024, 6);
nhEg.font = '700 46px "Arial", "Trebuchet MS", sans-serif';
nhEg.textAlign = 'center';
nhEg.textBaseline = 'middle';
nhEg.letterSpacing = '1px';
nhEg.fillText('HIGH SPEED RAIL TRAINING INSTITUTE', 512, 64);
const nhEngTx = new THREE.CanvasTexture(nhEngC);
nhEngTx.encoding = THREE.sRGBEncoding;

const nhCanopyFront = new THREE.Mesh(
  new THREE.PlaneGeometry(17.0, 1.15),
  new THREE.MeshBasicMaterial({ map: nhEngTx })
);
nhCanopyFront.position.set(601.76 - W / 2, 4.75, 148 - H / 2);
nhCanopyFront.rotation.y = -Math.PI / 2;
redM.add(nhCanopyFront);

// Return fascia on north and south sides of canopy
[-8.5, 8.5].forEach((dz) => {
  const sidePlate = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.15), new THREE.MeshLambertMaterial({ color: 0x701824 }));
  sidePlate.position.set(605.4 - W / 2, 4.75, 148 + dz - H / 2);
  sidePlate.rotation.y = dz > 0 ? 0 : Math.PI;
  redM.add(sidePlate);
});

// Robust square support columns under canopy
[
  [602.4, 141.2],
  [602.4, 154.8],
  [605.2, 141.2],
  [605.2, 154.8]
].forEach(([cx, cz]) => {
  const col = new THREE.Mesh(new THREE.BoxGeometry(0.65, 4.2, 0.65), nhSandstone);
  col.position.set(cx - W / 2, 2.1, cz - H / 2);
  col.castShadow = true;
  redM.add(col);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.25, 0.85), nhSandstone);
  cap.position.set(cx - W / 2, 4.1, cz - H / 2);
  redM.add(cap);
});

// 3. Recessed Ground Floor Glass Lobby & Entrance Doors
const nhGlassWall = new THREE.Mesh(new THREE.PlaneGeometry(16.4, 3.8), nhGlass);
nhGlassWall.position.set(608.6 - W / 2, 2.4, 148 - H / 2);
nhGlassWall.rotation.y = -Math.PI / 2;
redM.add(nhGlassWall);

// Warm interior lobby illumination backing
const nhLobbyGlow = new THREE.Mesh(
  new THREE.PlaneGeometry(16.0, 3.6),
  new THREE.MeshBasicMaterial({ color: 0xf5dfb5 })
);
nhLobbyGlow.position.set(608.8 - W / 2, 2.4, 148 - H / 2);
nhLobbyGlow.rotation.y = -Math.PI / 2;
redM.add(nhLobbyGlow);

// Double automatic sliding glass doors frame in the center
const nhDoorFrame = new THREE.Mesh(
  new THREE.PlaneGeometry(4.2, 2.6),
  new THREE.MeshLambertMaterial({ color: 0x14181f })
);
nhDoorFrame.position.set(608.55 - W / 2, 1.8, 148 - H / 2);
nhDoorFrame.rotation.y = -Math.PI / 2;
redM.add(nhDoorFrame);

// Door glass panes
const nhDoorGlass = new THREE.Mesh(
  new THREE.PlaneGeometry(3.6, 2.3),
  new THREE.MeshBasicMaterial({ color: 0x3d5a73 })
);
nhDoorGlass.position.set(608.53 - W / 2, 1.8, 148 - H / 2);
nhDoorGlass.rotation.y = -Math.PI / 2;
redM.add(nhDoorGlass);

// 4. Forecourt Monument / Signage Stone in front of Entrance
const nhMonuBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.15, 5.6), new THREE.MeshLambertMaterial({ color: 0x22242a }));
nhMonuBase.position.set(598.0 - W / 2, 0.58, 148 - H / 2);
nhMonuBase.castShadow = true;
redM.add(nhMonuBase);

// Monument plaque facing approaching visitors (West)
const nhMonuC = document.createElement('canvas');
nhMonuC.width = 512;
nhMonuC.height = 128;
const nhMg = nhMonuC.getContext('2d');
nhMg.fillStyle = '#1c1f24';
nhMg.fillRect(0, 0, 512, 128);
nhMg.strokeStyle = '#d4af37';
nhMg.lineWidth = 4;
nhMg.strokeRect(6, 6, 500, 116);
nhMg.fillStyle = '#ffffff';
nhMg.font = '700 28px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
nhMg.textAlign = 'center';
nhMg.textBaseline = 'middle';
nhMg.fillText('हाई स्पीड रेल प्रशिक्षण संस्थान', 256, 38);
nhMg.fillStyle = '#e8d5a8';
nhMg.font = '700 20px "Arial", sans-serif';
nhMg.fillText('HIGH SPEED RAIL TRAINING INSTITUTE', 256, 84);
const nhMonuTx = new THREE.CanvasTexture(nhMonuC);
nhMonuTx.encoding = THREE.sRGBEncoding;

const nhMonuPlaque = new THREE.Mesh(
  new THREE.PlaneGeometry(5.4, 1.05),
  new THREE.MeshBasicMaterial({ map: nhMonuTx })
);
nhMonuPlaque.position.set(597.26 - W / 2, 0.62, 148 - H / 2);
nhMonuPlaque.rotation.y = -Math.PI / 2;
redM.add(nhMonuPlaque);

// Low planter box & shrubbery around the monument plinth
const nhPlanter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 6.4), nhTerra);
nhPlanter.position.set(598.0 - W / 2, 0.18, 148 - H / 2);
redM.add(nhPlanter);

// 5. Twin Corner Pylons (North & South) with Arched Niches matching Image 1 & 2
[
  [134.7, 'north'],
  [161.3, 'south']
].forEach(([pz]) => {
  // Sandstone pylon body
  const pylon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 22.2, 5.2), nhSandstone);
  pylon.position.set(608.5 - W / 2, 11.1, pz - H / 2);
  pylon.castShadow = true;
  redM.add(pylon);

  // Top arched relief crown (Y = 20.8)
  const archPanel = new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.4, 2.2), nhTerra);
  archPanel.position.set(608.45 - W / 2, 20.6, pz - H / 2);
  redM.add(archPanel);

  // Arched top cylinder niche
  const archCurve = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 1.25, 16, 1, false, 0, Math.PI),
    nhTerra
  );
  archCurve.rotation.z = Math.PI / 2;
  archCurve.position.set(608.45 - W / 2, 21.8, pz - H / 2);
  redM.add(archCurve);

  // Vertically stacked window frames with terracotta architraves
  for (let wy = 3.6; wy <= 18.0; wy += 3.6) {
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.26, 2.0, 1.4), nhTerra);
    winFrame.position.set(608.45 - W / 2, wy, pz - H / 2);
    redM.add(winFrame);
    const winGlass = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1.6, 1.0), nhGlass);
    winGlass.position.set(608.45 - W / 2, wy, pz - H / 2);
    redM.add(winGlass);
  }
});

// 6. Upper Floor Balconies and Decorative Lattice (Jali) Screen Pilasters (Floors 1 to 5)
// Jali screen canvas texture with diamond lattice pattern
const jaliC = document.createElement('canvas');
jaliC.width = 64;
jaliC.height = 128;
const jg = jaliC.getContext('2d');
jg.fillStyle = '#f2ede4';
jg.fillRect(0, 0, 64, 128);
jg.fillStyle = '#3a342c';
for (let jy = 8; jy < 128; jy += 16) {
  for (let jx = (jy % 32 === 0 ? 8 : 24); jx < 64; jx += 32) {
    jg.beginPath();
    jg.moveTo(jx, jy - 6);
    jg.lineTo(jx + 7, jy);
    jg.lineTo(jx, jy + 6);
    jg.lineTo(jx - 7, jy);
    jg.closePath();
    jg.fill();
  }
}
const jaliTx = new THREE.CanvasTexture(jaliC);
jaliTx.wrapS = jaliTx.wrapT = THREE.RepeatWrapping;
jaliTx.repeat.set(1, 4);
jaliTx.encoding = THREE.sRGBEncoding;
const jaliMat = new THREE.MeshLambertMaterial({ map: jaliTx });

// 4 Decorative vertical lattice columns dividing window bays
[141.2, 145.7, 150.3, 154.8].forEach((jz) => {
  const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.85, 15.6, 0.7), jaliMat);
  pilaster.position.set(608.4 - W / 2, 13.2, jz - H / 2);
  pilaster.castShadow = true;
  redM.add(pilaster);
});

// Balcony floor ledges and railings on upper floors
for (let by = 5.4; by <= 19.0; by += 3.4) {
  // Cantilevered balcony slab
  const balcSlab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 21.4), nhWhite);
  balcSlab.position.set(608.35 - W / 2, by, 148 - H / 2);
  redM.add(balcSlab);

  // Horizontal balcony railing
  const balcRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.75, 21.2),
    new THREE.MeshLambertMaterial({ color: 0x3e4a57 })
  );
  balcRail.position.set(607.95 - W / 2, by + 0.5, 148 - H / 2);
  redM.add(balcRail);
}

// 7. Top Roof Signboard Crown: "हाई स्पीड रेल प्रशिक्षण संस्थान" with Logo
const nhTopC = document.createElement('canvas');
nhTopC.width = 1024;
nhTopC.height = 128;
const nhTg = nhTopC.getContext('2d');
nhTg.fillStyle = '#701824';
nhTg.fillRect(0, 0, 1024, 128);
nhTg.fillStyle = '#ffffff';
nhTg.fillRect(0, 0, 1024, 5);
nhTg.fillRect(0, 123, 1024, 5);

// Logo badge on the left
nhTg.fillStyle = '#ffffff';
nhTg.beginPath();
nhTg.roundRect ? nhTg.roundRect(28, 20, 96, 88, 14) : nhTg.fillRect(28, 20, 96, 88);
nhTg.fill();
// High speed train graphic in logo
nhTg.fillStyle = '#16448e';
nhTg.beginPath();
nhTg.moveTo(42, 68);
nhTg.lineTo(105, 52);
nhTg.lineTo(110, 68);
nhTg.lineTo(75, 78);
nhTg.closePath();
nhTg.fill();
nhTg.fillStyle = '#2277c2';
nhTg.fillRect(52, 74, 56, 6);

// Hindi Devanagari text
nhTg.fillStyle = '#ffffff';
nhTg.font = '700 50px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
nhTg.textAlign = 'center';
nhTg.textBaseline = 'middle';
nhTg.fillText('हाई स्पीड रेल प्रशिक्षण संस्थान', 560, 64);

const nhTopTx = new THREE.CanvasTexture(nhTopC);
nhTopTx.encoding = THREE.sRGBEncoding;

const nhTopSign = new THREE.Mesh(
  new THREE.PlaneGeometry(21.4, 2.7),
  new THREE.MeshBasicMaterial({ map: nhTopTx })
);
nhTopSign.position.set(608.4 - W / 2, 22.1, 148 - H / 2);
nhTopSign.rotation.y = -Math.PI / 2;
redM.add(nhTopSign);

// White stone cornice crowning top signboard
const nhTopCornice = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 22.0), nhWhite);
nhTopCornice.position.set(608.5 - W / 2, 23.6, 148 - H / 2);
redM.add(nhTopCornice);

// 8. Forecourt Landscaping: Conical Golden Cypresses & Black Streetlamps matching Image 1 & 2
const nhCypressMat = new THREE.MeshLambertMaterial({ color: 0x6ca32a });
const nhTrunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3622 });

// Conical cypress topiaries along the forecourt lawn
[
  [599.5, 137.5, 2.4, 0.75],
  [596.5, 135.5, 2.2, 0.7],
  [593.5, 134.0, 2.0, 0.65],
  [599.5, 158.5, 2.4, 0.75],
  [596.5, 160.5, 2.2, 0.7],
  [593.5, 162.0, 2.0, 0.65],
  [598.0, 144.2, 1.8, 0.6],
  [598.0, 151.8, 1.8, 0.6]
].forEach(([tx, tz, th, tr]) => {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.6, 6), nhTrunkMat);
  trunk.position.set(tx - W / 2, 0.3, tz - H / 2);
  scene.add(trunk);

  const foliage = new THREE.Mesh(new THREE.ConeGeometry(tr, th, 8), nhCypressMat);
  foliage.position.set(tx - W / 2, 0.5 + th / 2, tz - H / 2);
  foliage.castShadow = true;
  scene.add(foliage);
});

// Sleek black light posts flanking entrance approach
const nhLampMat = new THREE.MeshLambertMaterial({ color: 0x1a1c20 });
[
  [582.0, 139.5],
  [582.0, 156.5],
  [592.0, 139.5],
  [592.0, 156.5]
].forEach(([lx, lz]) => {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8), nhLampMat);
  pole.position.set(lx - W / 2, 2.1, lz - H / 2);
  pole.castShadow = true;
  scene.add(pole);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.25, 0.45), nhLampMat);
  head.position.set(lx - W / 2, 4.3, lz - H / 2);
  scene.add(head);

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), nhLightMat);
  bulb.position.set(lx - W / 2, 4.15, lz - H / 2);
  scene.add(bulb);
});
// Atithi hostel (existing, near the main road): white block, red-brown trim, 5 floors, courtyard
const ac = document.createElement('canvas');
ac.width = ac.height = 64;
const ag = ac.getContext('2d');
ag.fillStyle = '#f3f0e9';
ag.fillRect(0, 0, 64, 64);
[8, 40].forEach((x) => {
  ag.fillStyle = '#a8483e';
  ag.fillRect(x - 2, 9, 22, 28);
  ag.fillStyle = '#f3f0e9';
  ag.fillRect(x, 11, 18, 24);
  ag.fillStyle = '#5f7184';
  ag.fillRect(x + 2, 13, 14, 20);
  ag.fillStyle = '#f3f0e9';
  ag.fillRect(x + 8, 13, 2, 20);
  ag.fillRect(x + 2, 22, 14, 2);
});
ag.fillStyle = '#b9a99a';
ag.fillRect(0, 60, 64, 4);
const atiBase = new THREE.CanvasTexture(ac);
atiBase.wrapS = atiBase.wrapT = THREE.RepeatWrapping;
atiBase.encoding = THREE.sRGBEncoding;
LITMAP.set(atiBase, litTex(litFromCanvas(ac)));
atiBase.anisotropy = 4;
const atiM = mk(
  [
    [506, 56],
    [555, 56],
    [555, 105],
    [506, 105]
  ],
  16,
  0xd0cabe,
  0xb5483c,
  1.6,
  [
    [
      [524, 65],
      [545, 65],
      [545, 93],
      [524, 93]
    ]
  ],
  [],
  atiBase
);
const trim = new THREE.MeshLambertMaterial({ color: 0xa8483e });
const apo = new THREE.Mesh(
  new THREE.BoxGeometry(13, 5, 2),
  new THREE.MeshLambertMaterial({ color: 0xefe8dc })
);
apo.position.set(516 - W / 2, 2.5, 106 - H / 2);
apo.castShadow = true;
atiM.add(apo);
[510.2, 521.8].forEach((x) => {
  const pl = new THREE.Mesh(new THREE.BoxGeometry(1.4, 10, 1.4), trim);
  pl.position.set(x - W / 2, 5, 106.7 - H / 2);
  atiM.add(pl);
});
[
  [549, 61],
  [512, 99]
].forEach(([x, z]) => {
  const tk = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.2, 3, 14),
    new THREE.MeshLambertMaterial({ color: 0xf2f2f2 })
  );
  tk.position.set(x - W / 2, 17.5, z - H / 2);
  atiM.add(tk);
});
const ac2 = document.createElement('canvas');
ac2.width = 256;
ac2.height = 48;
const ag2 = ac2.getContext('2d');
ag2.fillStyle = '#f3f0e9';
ag2.fillRect(0, 0, 256, 48);
ag2.fillStyle = '#8a2f2a';
ag2.font = '700 28px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
ag2.textAlign = 'center';
ag2.textBaseline = 'middle';
ag2.fillText('अतिथि   ATITHI', 128, 26);
const atx = new THREE.CanvasTexture(ac2);
atx.encoding = THREE.sRGBEncoding;
const asg = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 2.6),
  new THREE.MeshBasicMaterial({ map: atx })
);
asg.position.set(516 - W / 2, 10.5, 105.15 - H / 2);
atiM.add(asg);
// proposed blocks from the master plan (orange = proposed)
function tx(draw) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  draw(g);
  const grain = g.getImageData(0, 0, 64, 64),
    data = grain.data;
  let q = 31;
  for (let i = 0; i < data.length; i += 4) {
    q = (q * 1664525 + 1013904223) >>> 0;
    const n = ((q >>> 24) & 15) - 7;
    data[i] = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  g.putImageData(grain, 0, 0);
  g.fillStyle = 'rgba(35,28,22,.1)';
  for (let y = 16; y < 64; y += 32) g.fillRect(0, y, 64, 1);
  const shade = g.createLinearGradient(0, 0, 64, 0);
  shade.addColorStop(0, 'rgba(0,0,0,.08)');
  shade.addColorStop(0.15, 'transparent');
  shade.addColorStop(0.85, 'transparent');
  shade.addColorStop(1, 'rgba(0,0,0,.1)');
  g.fillStyle = shade;
  g.fillRect(0, 0, 64, 64);
  const T = new THREE.CanvasTexture(c);
  T.wrapS = T.wrapT = THREE.RepeatWrapping;
  T.encoding = THREE.sRGBEncoding;
  T.anisotropy = 4;
  LITMAP.set(T, litTex(litFromCanvas(c)));
  return T;
}

// ============================================================================
// Sardar Patel Sabhagrah (Auditorium & Conference Hall)
// ============================================================================
const sabT = tx((g) => {
  g.fillStyle = '#f5eee2';
  g.fillRect(0, 0, 64, 64);
  [8, 38].forEach((x) => {
    // Window surround / trim
    g.fillStyle = '#ffffff';
    g.fillRect(x - 2, 8, 18, 24);
    // Dark glazing
    g.fillStyle = '#3c4e5e';
    g.fillRect(x, 10, 14, 20);
    // White window mullions
    g.fillStyle = '#ffffff';
    g.fillRect(x + 6, 10, 2, 20);
    g.fillRect(x, 19, 14, 2);

    // Ground floor window
    g.fillStyle = '#ffffff';
    g.fillRect(x - 2, 38, 18, 20);
    g.fillStyle = '#3c4e5e';
    g.fillRect(x, 40, 14, 16);
    g.fillStyle = '#ffffff';
    g.fillRect(x + 6, 40, 2, 16);
    g.fillRect(x, 47, 14, 2);
  });
  // Plinth and upper cornice bands
  g.fillStyle = '#dfd2bc';
  g.fillRect(0, 34, 64, 3);
  g.fillStyle = '#d0c3ad';
  g.fillRect(0, 60, 64, 4);
});

// Sabhagrah Main Auditorium Hall
const sabM = mk(
  [
    [404, 56],
    [446, 56],
    [446, 82],
    [404, 82]
  ],
  10.5,
  0xd0c9be,
  0xd4a040,
  1.6,
  [],
  [],
  sabT,
  [1 / 14, 1 / 5.2]
);

// East side stepped annex (seen in satellite view)
const sabAnnex = mk(
  [
    [446, 62],
    [451, 62],
    [451, 82],
    [446, 82]
  ],
  8.5,
  0xd0c9be,
  0xd4a040,
  1.7,
  [],
  [],
  sabT,
  [1 / 10, 1 / 4.2]
);

// Grand Art-Deco Entrance Pavilion (center of South facade)
const sabPorch = mk(
  [
    [419, 82],
    [431, 82],
    [431, 86.5],
    [419, 86.5]
  ],
  12.2,
  0xd8d1c4,
  0xd4a040,
  1.65,
  [],
  [],
  sabT,
  [1 / 12, 1 / 6]
);

// Art Deco stepped crown on the roof parapet
const sabCream = new THREE.MeshLambertMaterial({ color: 0xf2ebdc });
const sabCrownC = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.4, 0.6), sabCream);
sabCrownC.position.set(425 - W / 2, 12.8, 86.6 - H / 2);
sabPorch.add(sabCrownC);
[-2.6, 2.6].forEach((dx) => {
  const sc = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.6), sabCream);
  sc.position.set(425 + dx - W / 2, 12.4, 86.6 - H / 2);
  sabPorch.add(sc);
});
const sabFlute = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.0, 0.3), sabCream);
sabFlute.position.set(425 - W / 2, 11.4, 86.75 - H / 2);
sabPorch.add(sabFlute);

// 3 large first-floor window bays on the entrance facade
const sabWinC = document.createElement('canvas');
sabWinC.width = 512;
sabWinC.height = 192;
const sabWg = sabWinC.getContext('2d');
sabWg.fillStyle = '#f5eee2';
sabWg.fillRect(0, 0, 512, 192);
[32, 192, 352].forEach((wx) => {
  sabWg.fillStyle = '#ffffff';
  sabWg.fillRect(wx - 4, 12, 136, 168);
  sabWg.fillStyle = '#3a4b5c';
  sabWg.fillRect(wx, 16, 128, 160);
  sabWg.fillStyle = '#ffffff';
  for (let vx = 32; vx < 128; vx += 32) sabWg.fillRect(wx + vx, 16, 3, 160);
  for (let vy = 32; vy < 160; vy += 32) sabWg.fillRect(wx, 16 + vy, 128, 3);
});
const sabWinTx = new THREE.CanvasTexture(sabWinC);
sabWinTx.encoding = THREE.sRGBEncoding;
const sabWinM = new THREE.Mesh(
  new THREE.PlaneGeometry(10.5, 4.0),
  new THREE.MeshBasicMaterial({ map: sabWinTx })
);
sabWinM.position.set(425 - W / 2, 8.6, 86.65 - H / 2);
sabPorch.add(sabWinM);

// Signboard: सरदार पटेल सभागृह / SARDAR PATEL SABHAGRIHA
const sabSignC = document.createElement('canvas');
sabSignC.width = 512;
sabSignC.height = 96;
const sabSg = sabSignC.getContext('2d');
sabSg.fillStyle = '#f8f4e6';
sabSg.fillRect(0, 0, 512, 96);
sabSg.strokeStyle = '#bda77a';
sabSg.lineWidth = 4;
sabSg.strokeRect(4, 4, 504, 88);
sabSg.fillStyle = '#2a2420';
sabSg.textAlign = 'center';
sabSg.textBaseline = 'middle';
sabSg.font = '700 32px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
sabSg.fillText('सरदार पटेल सभागृह', 256, 34);
sabSg.font = '700 24px Arial,sans-serif';
sabSg.fillText('SARDAR PATEL SABHAGRIHA', 256, 70);
const sabSignTx = new THREE.CanvasTexture(sabSignC);
sabSignTx.encoding = THREE.sRGBEncoding;
const sabSignM = new THREE.Mesh(
  new THREE.PlaneGeometry(9.6, 1.8),
  new THREE.MeshBasicMaterial({ map: sabSignTx })
);
sabSignM.position.set(425 - W / 2, 5.5, 86.68 - H / 2);
sabPorch.add(sabSignM);

// Ground floor glass entrance doors
const sabDoorC = document.createElement('canvas');
sabDoorC.width = 384;
sabDoorC.height = 160;
const sabDg = sabDoorC.getContext('2d');
sabDg.fillStyle = '#ffffff';
sabDg.fillRect(0, 0, 384, 160);
for (let dx = 8; dx < 380; dx += 92) {
  sabDg.fillStyle = '#24323e';
  sabDg.fillRect(dx, 8, 84, 144);
  sabDg.fillStyle = '#ffffff';
  sabDg.fillRect(dx + 40, 8, 4, 144);
  sabDg.fillRect(dx, 80, 84, 4);
}
const sabDoorTx = new THREE.CanvasTexture(sabDoorC);
sabDoorTx.encoding = THREE.sRGBEncoding;
const sabDoorM = new THREE.Mesh(
  new THREE.PlaneGeometry(7.8, 3.2),
  new THREE.MeshBasicMaterial({ map: sabDoorTx })
);
sabDoorM.position.set(425 - W / 2, 2.4, 86.65 - H / 2);
sabPorch.add(sabDoorM);

// Terracotta entrance steps and approach
const sabTerra = new THREE.MeshLambertMaterial({ color: 0x9b4637 });
[
  [10.8, 0.35, 1.4, 87.2, 0.18],
  [9.8, 0.35, 1.2, 88.0, 0.52],
  [8.8, 0.35, 1.0, 88.7, 0.85]
].forEach(([w, h, d, z, y]) => {
  const step = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), sabTerra);
  step.position.set(425 - W / 2, y, z - H / 2);
  step.castShadow = true;
  sabPorch.add(step);
});
flat(412, 86, 438, 102, 0.25, 0xc8bcab);

// ============================================================================
// Pahune Hostel (Student Hostel & Front Recreation Hall)
// ============================================================================
const pahBase = tx((g) => {
  g.fillStyle = '#ded9ce';
  g.fillRect(0, 0, 64, 64);
  [8, 38].forEach((x) => {
    // Upper floor balcony doors/windows
    g.fillStyle = '#3f4f5f';
    g.fillRect(x, 10, 14, 22);
    g.fillStyle = '#ffffff';
    g.fillRect(x + 6, 10, 2, 22);
    // Lower floor windows
    g.fillStyle = '#3f4f5f';
    g.fillRect(x, 40, 14, 18);
    g.fillStyle = '#ffffff';
    g.fillRect(x + 6, 40, 2, 18);
  });
  // Terracotta plinth and intermediate trim
  g.fillStyle = '#8b3b2d';
  g.fillRect(0, 34, 64, 3);
  g.fillRect(0, 60, 64, 4);
});

// Main 2-story Hostel residential block
const pahM = mk(
  [
    [456, 58],
    [498, 58],
    [498, 80],
    [456, 80]
  ],
  9.2,
  0xcfc7ba,
  0xb87333,
  1.7,
  [],
  [],
  pahBase,
  [1 / 14, 1 / 3.4]
);

// Upper floor open balcony corridor square pillars
const pahColMat = new THREE.MeshLambertMaterial({ color: 0xe4ded4 });
for (let k = 0; k <= 9; k++) {
  const colX = 458 + k * 4.2;
  const col = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4.2, 0.55), pahColMat);
  col.position.set(colX - W / 2, 6.7, 80.1 - H / 2);
  col.castShadow = true;
  pahM.add(col);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.8), pahColMat);
  cap.position.set(colX - W / 2, 8.9, 80.1 - H / 2);
  pahM.add(cap);
}
// Balcony steel railing
const pahRail = new THREE.Mesh(
  new THREE.BoxGeometry(40, 0.9, 0.1),
  new THREE.MeshLambertMaterial({ color: 0x3d4852 })
);
pahRail.position.set(477 - W / 2, 5.2, 80.15 - H / 2);
pahM.add(pahRail);

// Prominent central-right chimney / stairwell shaft
const pahTower = new THREE.Mesh(
  new THREE.BoxGeometry(2.4, 12.8, 2.4),
  new THREE.MeshLambertMaterial({ color: 0xa8a196 })
);
pahTower.position.set(486 - W / 2, 6.4, 80.3 - H / 2);
pahTower.castShadow = true;
pahM.add(pahTower);
const pahTowerCap = new THREE.Mesh(
  new THREE.BoxGeometry(2.8, 0.6, 2.8),
  new THREE.MeshLambertMaterial({ color: 0xe0d8cc })
);
pahTowerCap.position.set(486 - W / 2, 12.9, 80.3 - H / 2);
pahM.add(pahTowerCap);

// Front 1-story Entrance Recreation Hall Pavilion (warm ochre plaster, terracotta trim)
const pahOchre = new THREE.MeshLambertMaterial({ color: 0xeed99c });
const pahTerraTrim = new THREE.MeshLambertMaterial({ color: 0x8a382c });
const pRec = new THREE.Mesh(new THREE.BoxGeometry(14, 4.6, 8.5), pahOchre);
pRec.position.set(476 - W / 2, 2.3, 84.25 - H / 2);
pRec.castShadow = true;
pahM.add(pRec);

// Dado wall around pavilion
const pDado = new THREE.Mesh(new THREE.BoxGeometry(14.2, 1.2, 8.7), pahTerraTrim);
pDado.position.set(476 - W / 2, 0.6, 84.25 - H / 2);
pahM.add(pDado);

// Sloped terracotta hip roof border around pavilion
const pRoofTile = new THREE.Mesh(
  new THREE.BoxGeometry(14.8, 0.6, 9.3),
  new THREE.MeshLambertMaterial({ color: 0x9a4130 })
);
pRoofTile.position.set(476 - W / 2, 4.7, 84.25 - H / 2);
pahM.add(pRoofTile);

// Front projecting entrance porch / pediment
const pPorch = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.8, 2.6), pahOchre);
pPorch.position.set(476 - W / 2, 1.9, 89.8 - H / 2);
pPorch.castShadow = true;
pahM.add(pPorch);
const pPorchDado = new THREE.Mesh(new THREE.BoxGeometry(7.3, 1.2, 2.7), pahTerraTrim);
pPorchDado.position.set(476 - W / 2, 0.6, 89.8 - H / 2);
pahM.add(pPorchDado);
const pPorchRoof = new THREE.Mesh(
  new THREE.BoxGeometry(7.8, 0.5, 3.1),
  new THREE.MeshLambertMaterial({ color: 0x9a4130 })
);
pPorchRoof.position.set(476 - W / 2, 3.9, 89.8 - H / 2);
pahM.add(pPorchRoof);

// Stepped pediment crown
const pPedCrown = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 0.4), pahTerraTrim);
pPedCrown.position.set(476 - W / 2, 4.4, 91.1 - H / 2);
pahM.add(pPedCrown);

// Authentic Pahune / Recreation Hall Signboard
const pahSignC = document.createElement('canvas');
pahSignC.width = 512;
pahSignC.height = 160;
const pahSg = pahSignC.getContext('2d');
pahSg.fillStyle = '#eed99c';
pahSg.fillRect(0, 0, 512, 160);
// Top Devanagari plate
pahSg.fillStyle = '#ffffff';
pahSg.fillRect(176, 8, 160, 48);
pahSg.strokeStyle = '#8a382c';
pahSg.lineWidth = 2;
pahSg.strokeRect(176, 8, 160, 48);
pahSg.fillStyle = '#16448e';
pahSg.textAlign = 'center';
pahSg.textBaseline = 'middle';
pahSg.font = '700 36px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
pahSg.fillText('पाहुणे', 256, 32);
// Middle English plate
pahSg.fillStyle = '#ffffff';
pahSg.fillRect(136, 62, 240, 44);
pahSg.strokeStyle = '#8a382c';
pahSg.strokeRect(136, 62, 240, 44);
pahSg.fillStyle = '#16448e';
pahSg.font = '700 30px Arial,sans-serif';
pahSg.fillText('PAHUNE', 256, 84);
// Bottom Recreation Hall green plate
pahSg.fillStyle = '#1e6834';
pahSg.fillRect(146, 114, 220, 36);
pahSg.fillStyle = '#ffffff';
pahSg.font = '700 20px Arial,sans-serif';
pahSg.fillText('RECREATION HALL', 256, 132);
const pahSignTx = new THREE.CanvasTexture(pahSignC);
pahSignTx.encoding = THREE.sRGBEncoding;
const pahSignM = new THREE.Mesh(
  new THREE.PlaneGeometry(6.4, 2.0),
  new THREE.MeshBasicMaterial({ map: pahSignTx })
);
pahSignM.position.set(476 - W / 2, 3.4, 91.15 - H / 2);
pahM.add(pahSignM);

// Double entrance wooden glass doors
const pahDoor = new THREE.Mesh(
  new THREE.PlaneGeometry(3.0, 2.2),
  new THREE.MeshBasicMaterial({ color: 0x2e1e14 })
);
pahDoor.position.set(476 - W / 2, 1.2, 91.13 - H / 2);
pahM.add(pahDoor);

// Entrance terracotta steps and ramp
[
  [5.6, 0.3, 1.2, 91.7, 0.15],
  [4.8, 0.3, 1.0, 92.3, 0.45]
].forEach(([w, h, d, z, y]) => {
  const step = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), pahTerraTrim);
  step.position.set(476 - W / 2, y, z - H / 2);
  step.castShadow = true;
  pahM.add(step);
});

// Flanking ornamental gate pillars with classical urn / lamp finials
[-4.6, 4.6].forEach((dx) => {
  const post = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 1.1), sabCream);
  post.position.set(476 + dx - W / 2, 0.9, 92.5 - H / 2);
  post.castShadow = true;
  pahM.add(post);
  const urn = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 14, 14),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  urn.position.set(476 + dx - W / 2, 2.1, 92.5 - H / 2);
  urn.castShadow = true;
  pahM.add(urn);
});

// Forecourt pavement for Pahune Hostel
flat(468, 88, 484, 102, 0.25, 0xcabdb0);

const brick = tx((g) => {
  g.fillStyle = '#b9623f';
  g.fillRect(0, 0, 64, 64);
  [0, 21, 42].forEach((x) => {
    g.fillStyle = '#e4d0ae';
    g.fillRect(x, 0, 3, 64);
    g.fillStyle = '#9d4d30';
    g.fillRect(x + 3, 0, 1, 64);
    g.fillStyle = '#46576a';
    g.fillRect(x + 6, 12, 4, 40);
    g.fillRect(x + 13, 12, 4, 40);
  });
  g.fillStyle = '#d9c3a0';
  g.fillRect(0, 58, 64, 6);
});
const arcade = tx((g) => {
  g.fillStyle = '#e9ddc4';
  g.fillRect(0, 0, 64, 64);
  [8, 38].forEach((x) => {
    g.fillStyle = '#52483f';
    g.fillRect(x, 26, 16, 34);
    g.beginPath();
    g.arc(x + 8, 26, 8, Math.PI, 0);
    g.fill();
    g.fillStyle = '#d6c6a5';
    g.fillRect(x - 2, 60, 20, 4);
  });
});
const acSolar = [];
for (let i = 0; i < 4; i++) acSolar.push([458 + i * 17, 248, 458 + i * 17 + 14, 269]);
acSolar.push([514, 278, 536, 290], [514, 293, 536, 305]);
// academic block (from the renders): cream arcaded base + brick-and-fin upper floors
mk(
  [
    [451, 244],
    [541, 244],
    [541, 310],
    [509, 310],
    [509, 273],
    [451, 273]
  ],
  5,
  0xdccdad,
  0xe08a3c,
  2.0,
  [],
  [],
  arcade,
  [1 / 16, 1 / 5]
);
const acM = mk(
  [
    [452, 245],
    [540, 245],
    [540, 309],
    [510, 309],
    [510, 272],
    [452, 272]
  ],
  32,
  0xa9a49a,
  0xe08a3c,
  2.3,
  [],
  acSolar,
  brick,
  [1 / 21, 1 / 3.4]
);
const por = new THREE.Mesh(
  new THREE.BoxGeometry(14, 13, 2.4),
  new THREE.MeshLambertMaterial({ color: 0xe6d8bb })
);
por.position.set(481 - W / 2, 6.5, 273.2 - H / 2);
por.castShadow = true;
acM.add(por);
const arch = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 9),
  new THREE.MeshBasicMaterial({ color: 0x3b322b })
);
arch.position.set(481 - W / 2, 4.8, 274.45 - H / 2);
acM.add(arch);
flat(452, 272, 510, 309, 0.3, 0xb9b8b2);
[
  [16, 2.4],
  [13, 1.6],
  [10, 0.8]
].forEach(([r, hh], i) => {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, hh, 8, 1, false, Math.PI / 2, Math.PI),
    new THREE.MeshLambertMaterial({ color: 0xcdbb9d - i * 0x080808 })
  );
  m.position.set(481 - W / 2, hh / 2 + 0.3, 292 - H / 2);
  m.receiveShadow = true;
  scene.add(m);
});
const stage = new THREE.Mesh(
  new THREE.CylinderGeometry(6.5, 6.5, 1.1, 8),
  new THREE.MeshLambertMaterial({ color: 0xffffff })
);
stage.position.set(481 - W / 2, 0.85, 292 - H / 2);
stage.castShadow = true;
scene.add(stage);
(() => {
  const g2 = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.4, 7, 6),
    new THREE.MeshLambertMaterial({ color: 0x888888 })
  );
  pole.position.y = 3.5;
  g2.add(pole);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3,
      pn = new THREE.Mesh(
        new THREE.BoxGeometry(5, 0.2, 2),
        new THREE.MeshLambertMaterial({ color: 0x1f3350 })
      );
    pn.position.set(Math.cos(a) * 2.8, 7.4, Math.sin(a) * 2.8);
    pn.rotation.y = -a;
    g2.add(pn);
  }
  g2.position.set(500 - W / 2, 0, 301 - H / 2);
  scene.add(g2);
})();
// laboratory block (from the renders): cream arcaded base, brick-and-fin floors, cream parapet, rooftop solar
const labSolar = [];
for (let i = 0; i < 5; i++)
  for (let j = 0; j < 2; j++)
    labSolar.push([479 + i * 13.6, 138 + j * 21, 479 + i * 13.6 + 11.5, 138 + j * 21 + 18]);
mk(
  [
    [474, 133],
    [549, 133],
    [549, 183],
    [474, 183]
  ],
  5,
  0xdccdad,
  0xe08a3c,
  1.9,
  [],
  [],
  arcade,
  [1 / 16, 1 / 5]
);
const labM = mk(
  [
    [475, 134],
    [548, 134],
    [548, 182],
    [475, 182]
  ],
  34,
  0xa9a49a,
  0xe08a3c,
  2.1,
  [],
  labSolar,
  brick,
  [1 / 21, 1 / 3.4]
);
const cm = new THREE.MeshLambertMaterial({ color: 0xe6d8bb });
[
  [77, 1.8, 2, 511.5, 133.5],
  [77, 1.8, 2, 511.5, 182.5],
  [2, 1.8, 52, 474.5, 158],
  [2, 1.8, 52, 548.5, 158]
].forEach(([a, b, c, x, z]) => {
  const pb = new THREE.Mesh(new THREE.BoxGeometry(a, b, c), cm);
  pb.position.set(x - W / 2, 34.1, z - H / 2);
  pb.castShadow = true;
  labM.add(pb);
});
const lp = new THREE.Mesh(new THREE.BoxGeometry(16, 14, 2.6), cm);
lp.position.set(511.5 - W / 2, 7, 132.7 - H / 2);
lp.castShadow = true;
labM.add(lp);
const la = new THREE.Mesh(
  new THREE.PlaneGeometry(9, 9.5),
  new THREE.MeshBasicMaterial({ color: 0xb0562f })
);
la.position.set(511.5 - W / 2, 4.8, 131.38 - H / 2);
la.rotation.y = Math.PI;
labM.add(la);
const ls = new THREE.Mesh(
  new THREE.BoxGeometry(22, 0.8, 3),
  new THREE.MeshLambertMaterial({ color: 0xcdbb9d })
);
ls.position.set(511.5 - W / 2, 0.4, 130.5 - H / 2);
labM.add(ls);
// Pratap Vilas Palace (from the photos): front faces west onto the lawn
(function () {
  const palT = tx((g) => {
    g.fillStyle = '#cdb089';
    g.fillRect(0, 0, 64, 64);
    [4, 36].forEach((x) => {
      g.fillStyle = '#8a7355';
      g.fillRect(x, 40, 20, 24);
      g.beginPath();
      g.arc(x + 10, 40, 10, Math.PI, 0);
      g.fill();
      g.fillStyle = '#e8dcc0';
      g.fillRect(x + 3, 43, 14, 18);
      g.fillStyle = '#6d5a42';
      g.fillRect(x + 9, 43, 2, 18);
      g.fillStyle = '#f1ece0';
      g.fillRect(x - 1, 6, 22, 22);
      g.fillStyle = '#b9ad98';
      for (let k = 0; k < 4; k++) g.fillRect(x, 9 + k * 5, 20, 1);
      g.fillStyle = '#d9c9a6';
      g.fillRect(x - 2, 29, 24, 2);
    });
    g.fillStyle = '#b99d73';
    g.fillRect(0, 32, 64, 3);
  });
  const PP = [
    [322, 158],
    [360, 158],
    [360, 220],
    [322, 220]
  ];
  const M = mk(PP, 15, 0xc7a97f, 0xc9a86a, 1.8, [], [], palT, [1 / 16, 1 / 15]);
  const stone = new THREE.MeshLambertMaterial({ color: 0xc9b48c }),
    gst = new THREE.MeshLambertMaterial({ color: 0x9a927f }),
    cop = new THREE.MeshLambertMaterial({ color: 0xc47c58 }),
    trim = new THREE.MeshLambertMaterial({ color: 0xe3d4b2 }),
    dk = new THREE.MeshLambertMaterial({ color: 0x3b322b });
  const Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d),
    Cy = (a, b, h, s, hs, ts, tl) =>
      new THREE.CylinderGeometry(a, b, h, s || 16, 1, false, ts || 0, tl || Math.PI * 2),
    Dm = (r, s) => new THREE.SphereGeometry(r, s || 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const A = (g, m, x, y, z) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x - W / 2, y, z - H / 2);
    o.castShadow = true;
    M.add(o);
    return o;
  };
  // cornice + balustrade
  A(Bx(40, 0.8, 64), trim, 341, 14.5, 189);
  for (let i = 0; i < 4; i++) {
    const p0 = PP[i],
      p1 = PP[(i + 1) % 4],
      dx = p1[0] - p0[0],
      dz = p1[1] - p0[1],
      L = Math.hypot(dx, dz),
      n = Math.floor(L / 2.6);
    A(
      dz === 0 ? Bx(L, 0.35, 0.5) : Bx(0.5, 0.35, L),
      trim,
      (p0[0] + p1[0]) / 2,
      16.3,
      (p0[1] + p1[1]) / 2
    );
    for (let k = 0; k <= n; k++) {
      const f = k / n;
      A(Bx(0.5, 1.2, 0.5), trim, p0[0] + dx * f, 15.6, p0[1] + dz * f);
    }
  }
  // central porch, pediment, steps, door
  A(Bx(4, 8, 16), stone, 320, 4, 189);
  const tri = new THREE.Shape();
  tri.moveTo(-9, 0);
  tri.lineTo(9, 0);
  tri.lineTo(0, 3.4);
  tri.closePath();
  const pd = new THREE.Mesh(
    new THREE.ExtrudeGeometry(tri, { depth: 4, bevelEnabled: false }),
    stone
  );
  pd.rotation.y = Math.PI / 2;
  pd.position.set(318 - W / 2, 8, 189 - H / 2);
  pd.castShadow = true;
  M.add(pd);
  [181.5, 185.8, 192.2, 196.5].forEach((z) => A(Cy(0.55, 0.55, 8, 10), trim, 318.6, 4, z));
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 5),
    new THREE.MeshBasicMaterial({ color: 0x2a2420 })
  );
  door.position.set(321.95 - W / 2, 2.5, 189 - H / 2);
  door.rotation.y = -Math.PI / 2;
  M.add(door);
  [0, 1, 2].forEach((i) =>
    A(Bx(1.8, 0.5 * (3 - i) + 0.2, 14), trim, 317 - 1.8 * i, (0.5 * (3 - i) + 0.2) / 2, 189)
  );
  // central tower, copper dome, lantern, flanking pavilions
  A(Bx(14, 9, 14), stone, 331, 19.5, 189);
  const tw = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 5),
    new THREE.MeshBasicMaterial({ color: 0x4a3f35 })
  );
  tw.position.set(323.95 - W / 2, 20, 189 - H / 2);
  tw.rotation.y = -Math.PI / 2;
  M.add(tw);
  A(Cy(5.2, 5.2, 2.6, 24), stone, 331, 25.3, 189);
  A(Dm(5.4, 28), cop, 331, 26.6, 189);
  A(Cy(1.3, 1.6, 3, 10), stone, 331, 33.5, 189);
  A(new THREE.ConeGeometry(0.5, 3, 8), dk, 331, 36.5, 189);
  [176, 202].forEach((z) => {
    A(Bx(5, 9, 5), stone, 328.5, 19.5, z);
    A(Dm(3, 14), gst, 328.5, 24, z);
  });
  // wing-end towers with domes and curved balconies (north end, mirrored to the south)
  [1, -1].forEach((s) => {
    const Z = (zz) => (s === 1 ? zz : 378 - zz);
    A(Bx(8, 22, 8), stone, 326, 11, Z(162));
    A(Dm(4.4, 16), gst, 326, 22, Z(162));
    A(Bx(9, 26, 9), stone, 326, 13, Z(174));
    A(Dm(5, 16), gst, 326, 26, Z(174));
    const bz = Z(168);
    A(Cy(4.6, 4.6, 0.6, 22, 1, Math.PI, Math.PI), trim, 322, 8, bz);
    A(Cy(4.8, 4.8, 0.5, 22, 1, Math.PI, Math.PI), trim, 322, 14.6, bz);
    A(Cy(3.2, 3.2, 6, 18, 1, Math.PI, Math.PI), dk, 322, 11.3, bz);
    for (let k = 0; k < 5; k++) {
      const a = (k * Math.PI) / 4;
      A(Cy(0.35, 0.35, 6, 8), trim, 322 - 4.2 * Math.sin(a), 11.3, bz + 4.2 * Math.cos(a));
    }
    A(Bx(0.5, 1.1, 6), trim, 317.7, 9, bz);
  });
  // small roof domes
  [
    [345, 176],
    [345, 202],
    [352, 189]
  ].forEach(([x, z]) => A(Dm(2.5, 12), gst, x, 15, z));
  // lawn: sign, path, conifer, bushes
  const nc = document.createElement('canvas');
  nc.width = 512;
  nc.height = 128;
  const ng = nc.getContext('2d');
  ng.fillStyle = '#fff';
  ng.font = '700 96px Arial,sans-serif';
  ng.textAlign = 'center';
  ng.textBaseline = 'middle';
  ng.fillText('I', 50, 68);
  ng.fillStyle = '#d62d2d';
  ng.fillText('\u2665', 140, 68);
  ng.fillStyle = '#fff';
  ng.fillText('GSV', 330, 68);
  const ntx = new THREE.CanvasTexture(nc);
  ntx.encoding = THREE.sRGBEncoding;
  const nsn = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 3),
    new THREE.MeshBasicMaterial({ map: ntx, transparent: true })
  );
  nsn.position.set(309 - W / 2, 2, 206 - H / 2);
  nsn.rotation.y = -Math.PI / 2;
  scene.add(nsn);
  flat(296, 185, 316, 193, 0.35, 0xcdb8a0);
  const co = new THREE.Mesh(
    new THREE.ConeGeometry(3.8, 14, 12),
    new THREE.MeshLambertMaterial({ color: 0x2f5a34 })
  );
  co.position.set(306 - W / 2, 7, 178 - H / 2);
  co.castShadow = true;
  scene.add(co);
  [
    [309, 168, 3],
    [309, 210, 3],
    [304, 198, 2.6]
  ].forEach(([x, z, r]) => {
    const bs = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, 1),
      new THREE.MeshLambertMaterial({ color: 0x4a8a3a })
    );
    bs.position.set(x - W / 2, r * 0.9, z - H / 2);
    bs.castShadow = true;
    scene.add(bs);
  });
})();

// ============================================================================
// RAJABAUG — PRE-AGNEE CARNIVAL & FUN STALLS (10 STALLS + PERFORMANCE AREA)
// Sited directly west of Pratap Vilas Palace across the arterial road:
// - Manicured royal garden lawns, sandstone promenades, and perimeter boxwood hedges
// - Iconic western concentric circular fountain plaza (as in official master plan)
// - Central open-air "PERFORMANCE AREA" with busking platform and stage perimeter
// - 10 Pre-Agnee Canopied Fun Stalls (5 along Top / North, 5 along Bottom / South)
// - Bold numbered stall plaques (1 to 10) matching layout diagram
// - Custom carnival games, interactive festival booths, and festoon fairy lights
// - Grand eastern ceremonial entrance gateway with "RAJABAUG" welcome banner
// ============================================================================
// RAJABAUG — PRE-AGNEE CARNIVAL & FUN STALLS (REALISTIC 3D ARCHITECTURE)
// Faithfully modeled from the official master plan & stall layout diagram:
// - Realistic manicured parterre turf with mowed stripes, curbs & stone edging
// - Flagstone sandstone promenade network linking all 10 stalls and palace
// - Western concentric circular fountain plaza with cascading water & marigold beds
// - Central open-air "PERFORMANCE AREA" with circular acoustic stage & truss lighting
// - 10 Pre-Agnee Canopied Fun Stalls (5 North row, 5 South row) with:
//   * Striped canvas tent canopies & scalloped cloth valance fringes
//   * Bold, high-contrast overhead number plaques (1 to 10)
//   * Detailed interactive carnival games & food counters
//   * Warm glowing interior lanterns & catenary festoon fairy lights
//   * Interactive clickable stalls for counter-to-counter navigation
// - Grand eastern ceremonial entrance gateway with double-sided illuminated banner
// ============================================================================

(function () {
  const rajabaug = new THREE.Group();
  rajabaug.name = 'rajabaugCarnival';

  const RB_CX = 256 - W / 2; // -119.5
  const RB_CZ = 189 - H / 2; // -26
  const RB_W = 82;
  const RB_D = 68;
  rajabaug.position.set(RB_CX, 0.04, RB_CZ);

  // ---- 1. Realistic Procedural Turf Texture (Mowed Parterre Bands & Natural Grain)
  const lawnTex = (() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const g = c.getContext('2d');

    // Rich deep emerald turf base
    g.fillStyle = '#346d2c';
    g.fillRect(0, 0, 512, 512);

    // Subtle alternating mowed lawn bands (light/dark green stripes)
    for (let y = 0; y < 512; y += 32) {
      g.fillStyle = (Math.floor(y / 32) % 2 === 0) ? 'rgba(64, 134, 54, 0.45)' : 'rgba(40, 85, 34, 0.3)';
      g.fillRect(0, y, 512, 32);
    }

    // Natural grass speckling and grain
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const rCol = Math.random() > 0.5 ? 'rgba(74, 150, 62, 0.35)' : 'rgba(30, 65, 26, 0.35)';
      g.fillStyle = rCol;
      g.fillRect(rx, ry, 1.5, 3);
    }

    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4);
    t.encoding = THREE.sRGBEncoding;
    return t;
  })();

  const lawnBase = new THREE.Mesh(
    new THREE.BoxGeometry(RB_W, 0.16, RB_D),
    new THREE.MeshLambertMaterial({ map: lawnTex, roughness: 0.85 })
  );
  lawnBase.position.set(0, 0.08, 0);
  lawnBase.receiveShadow = true;
  rajabaug.add(lawnBase);

  // Sandstone beveled perimeter curb around the entire lawn
  const curbMat = new THREE.MeshLambertMaterial({ color: 0xd4c8b2 });
  [
    { w: RB_W + 0.6, d: 0.8, x: 0, z: -RB_D / 2 - 0.4 },
    { w: RB_W + 0.6, d: 0.8, x: 0, z: RB_D / 2 + 0.4 },
    { w: 0.8, d: RB_D + 0.6, x: -RB_W / 2 - 0.4, z: 0 },
    { w: 0.8, d: RB_D + 0.6, x: RB_W / 2 + 0.4, z: 0 }
  ].forEach((cb) => {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(cb.w, 0.22, cb.d), curbMat);
    curb.position.set(cb.x, 0.11, cb.z);
    rajabaug.add(curb);
  });

  // Manicured Dark Green Boxwood Perimeter Hedges
  const hedgeMat = new THREE.MeshLambertMaterial({ color: 0x1b4018 });
  const northHedge = new THREE.Mesh(new THREE.BoxGeometry(RB_W - 2, 0.95, 1.5), hedgeMat);
  northHedge.position.set(0, 0.52, -RB_D / 2 + 1.0);
  northHedge.castShadow = true;
  rajabaug.add(northHedge);

  const southHedge = new THREE.Mesh(new THREE.BoxGeometry(RB_W - 2, 0.95, 1.5), hedgeMat);
  southHedge.position.set(0, 0.52, RB_D / 2 - 1.0);
  southHedge.castShadow = true;
  rajabaug.add(southHedge);

  const westHedge = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.95, RB_D - 2), hedgeMat);
  westHedge.position.set(-RB_W / 2 + 1.0, 0.52, 0);
  westHedge.castShadow = true;
  rajabaug.add(westHedge);

  // East perimeter hedge (framing the grand entrance gate with 14m opening)
  const eastHedgeHalfD = (RB_D - 16) / 2;
  [-RB_D / 4 - 4, RB_D / 4 + 4].forEach((hz) => {
    const eh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.95, eastHedgeHalfD), hedgeMat);
    eh.position.set(RB_W / 2 - 1.0, 0.52, hz);
    eh.castShadow = true;
    rajabaug.add(eh);
  });

  // ---- 2. Realistic Sandstone Flagstone Pathways Texture
  const paverTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#dbcfba';
    g.fillRect(0, 0, 256, 256);

    // Stone joint lines
    g.strokeStyle = '#baa990';
    g.lineWidth = 2;
    for (let y = 0; y < 256; y += 32) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke();
    }
    for (let row = 0; row < 256; row += 32) {
      const off = (row % 64 === 0) ? 0 : 24;
      for (let x = off; x < 256; x += 48) {
        g.beginPath(); g.moveTo(x, row); g.lineTo(x, row + 32); g.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(8, 2);
    t.encoding = THREE.sRGBEncoding;
    return t;
  })();

  const pathMat = new THREE.MeshLambertMaterial({ map: paverTex, roughness: 0.8 });

  // Main Central East-West Sandstone Promenade
  const mainAvenue = new THREE.Mesh(new THREE.BoxGeometry(RB_W, 0.08, 5.2), pathMat);
  mainAvenue.position.set(0, 0.14, 0);
  mainAvenue.receiveShadow = true;
  rajabaug.add(mainAvenue);

  // North-South cross pathway connecting stalls to performance area
  const crossAvenue = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, RB_D - 4), pathMat);
  crossAvenue.position.set(4, 0.14, 0);
  crossAvenue.receiveShadow = true;
  rajabaug.add(crossAvenue);

  // Stall Apron Walkways (In front of Stalls 1-5 and Stalls 6-10)
  [-17, 17].forEach((wz) => {
    const apron = new THREE.Mesh(new THREE.BoxGeometry(64, 0.08, 4.6), pathMat);
    apron.position.set(4, 0.14, wz);
    apron.receiveShadow = true;
    rajabaug.add(apron);
  });

  // ---- 3. Western Fountain & Concentric Circular Plaza (Matching Reference Diagram)
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(-28, 0, 0); // mapX = 228, mapY = 189

  // Concentric sandstone plaza terraces
  const plazaOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(9.6, 9.6, 0.12, 32),
    new THREE.MeshLambertMaterial({ color: 0xd6cdba, roughness: 0.75 })
  );
  plazaOuter.position.y = 0.14;
  plazaOuter.receiveShadow = true;
  fountainGroup.add(plazaOuter);

  const plazaInner = new THREE.Mesh(
    new THREE.CylinderGeometry(6.8, 6.8, 0.16, 32),
    new THREE.MeshLambertMaterial({ color: 0xebe3d3, roughness: 0.7 })
  );
  plazaInner.position.y = 0.16;
  plazaInner.receiveShadow = true;
  fountainGroup.add(plazaInner);

  // Tiered Royal Marble & Sandstone Fountain
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0xded5c4, roughness: 0.65 });
  const waterMat = new THREE.MeshLambertMaterial({
    color: 0x2980b9,
    transparent: true,
    opacity: 0.88,
    roughness: 0.1
  });

  // Octagonal/Circular stone basin with carved lip
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.6, 0.85, 24), stoneMat);
  basin.position.y = 0.54;
  basin.castShadow = true;
  fountainGroup.add(basin);

  const basinLip = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.6, 0.15, 24), stoneMat);
  basinLip.position.y = 0.98;
  fountainGroup.add(basinLip);

  // Shimmering water pool disc
  const waterPool = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.3, 0.06, 24), waterMat);
  waterPool.position.y = 0.88;
  fountainGroup.add(waterPool);

  // Ornate central pedestal
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.0, 1.9, 16), stoneMat);
  pedestal.position.y = 1.45;
  pedestal.castShadow = true;
  fountainGroup.add(pedestal);

  // Upper overflowing scalloped basin
  const upperBasin = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.1, 0.5, 20), stoneMat);
  upperBasin.position.y = 2.25;
  upperBasin.castShadow = true;
  fountainGroup.add(upperBasin);

  const upperWater = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.15, 0.05, 20), waterMat);
  upperWater.position.y = 2.48;
  fountainGroup.add(upperWater);

  // Fountain finial & crystal water plume
  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.48, 1.2, 12), stoneMat);
  finial.position.y = 2.95;
  finial.castShadow = true;
  fountainGroup.add(finial);

  // Upward foaming crystal water spray plume
  const waterPlume = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 1.8, 12),
    new THREE.MeshLambertMaterial({ color: 0xceeaf5, transparent: true, opacity: 0.82 })
  );
  waterPlume.position.y = 3.95;
  fountainGroup.add(waterPlume);

  // 6 curved dancing water spray jets
  for (let j = 0; j < 6; j++) {
    const jAngle = (j * Math.PI) / 3;
    const sprayCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 3.2, 0),
      new THREE.Vector3(Math.cos(jAngle) * 1.5, 3.5, Math.sin(jAngle) * 1.5),
      new THREE.Vector3(Math.cos(jAngle) * 2.2, 2.4, Math.sin(jAngle) * 2.2)
    );
    const sprayGeo = new THREE.TubeGeometry(sprayCurve, 8, 0.08, 4, false);
    const sprayMesh = new THREE.Mesh(sprayGeo, waterMat);
    fountainGroup.add(sprayMesh);
  }

  // Concentric Blooming Marigold Flowerbeds surrounding the terrace
  const flowerColors = [0xe67300, 0xf5b800, 0x9b1b6e, 0xf58e00];
  for (let fb = 0; fb < 8; fb++) {
    const fAngle = (fb * Math.PI) / 4;
    const fRad = 8.3;
    const bed = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.4, 0.32, 14),
      new THREE.MeshLambertMaterial({ color: 0x224a1d })
    );
    bed.position.set(Math.cos(fAngle) * fRad, 0.24, Math.sin(fAngle) * fRad);
    fountainGroup.add(bed);

    // Blooming flower blossoms
    const flowerHead = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 8, 6),
      new THREE.MeshLambertMaterial({ color: flowerColors[fb % flowerColors.length] })
    );
    flowerHead.position.set(Math.cos(fAngle) * fRad, 0.52, Math.sin(fAngle) * fRad);
    flowerHead.scale.y = 0.45;
    fountainGroup.add(flowerHead);
  }

  // 4 Classical Stone Garden Urns framing plaza corners
  [
    [-6.8, -6.8], [6.8, -6.8], [-6.8, 6.8], [6.8, 6.8]
  ].forEach(([ux, uz]) => {
    const urn = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.25, 0.9, 12), stoneMat);
    urn.position.set(ux, 0.65, uz);
    urn.castShadow = true;
    fountainGroup.add(urn);

    const bush = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x2d6124 })
    );
    bush.position.set(ux, 1.25, uz);
    fountainGroup.add(bush);
  });

  rajabaug.add(fountainGroup);

  // ---- 4. Central "PERFORMANCE AREA" (Matching Layout Image 3)
  const perfGroup = new THREE.Group();
  perfGroup.position.set(4, 0, 0); // mapX = 260, mapY = 189

  // Performance arena dashed border (34m wide x 18m deep)
  const perfW = 34;
  const perfD = 18;
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const addDashedLine = (x0, z0, x1, z1, segments = 12) => {
    for (let s = 0; s < segments; s++) {
      if (s % 2 === 0) {
        const t0 = s / segments;
        const t1 = (s + 0.85) / segments;
        const sx = x0 + (x1 - x0) * (t0 + t1) / 2;
        const sz = z0 + (z1 - z0) * (t0 + t1) / 2;
        const len = Math.hypot(x1 - x0, z1 - z0) / segments * 0.85;
        const isHoriz = Math.abs(x1 - x0) > Math.abs(z1 - z0);
        const dash = new THREE.Mesh(
          new THREE.BoxGeometry(isHoriz ? len : 0.24, 0.03, isHoriz ? 0.24 : len),
          dashMat
        );
        dash.position.set(sx, 0.17, sz);
        perfGroup.add(dash);
      }
    }
  };
  addDashedLine(-perfW / 2, -perfD / 2, perfW / 2, -perfD / 2, 14); // North line
  addDashedLine(-perfW / 2, perfD / 2, perfW / 2, perfD / 2, 14);   // South line
  addDashedLine(-perfW / 2, -perfD / 2, -perfW / 2, perfD / 2, 8);  // West line
  addDashedLine(perfW / 2, -perfD / 2, perfW / 2, perfD / 2, 8);   // East line

  // Raised Circular Acoustic Teak Busking Platform
  const buskStage = new THREE.Mesh(
    new THREE.CylinderGeometry(4.4, 4.5, 0.4, 24),
    new THREE.MeshLambertMaterial({ color: 0x82522c, roughness: 0.7 })
  );
  buskStage.position.y = 0.28;
  buskStage.receiveShadow = true;
  buskStage.castShadow = true;
  perfGroup.add(buskStage);

  // Stage center decorative starburst inlay
  const stageInlay = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.6, 0.04, 16),
    new THREE.MeshLambertMaterial({ color: 0xda9442, roughness: 0.6 })
  );
  stageInlay.position.y = 0.49;
  perfGroup.add(stageInlay);

  // Central microphone stand & acoustic monitors
  const micStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8),
    new THREE.MeshLambertMaterial({ color: 0x222222 })
  );
  micStand.position.set(0, 1.38, 0);
  perfGroup.add(micStand);

  [-1.6, 1.6].forEach((mx) => {
    const speaker = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.9, 0.55),
      new THREE.MeshLambertMaterial({ color: 0x1f2226 })
    );
    speaker.position.set(mx, 0.75, 2.4);
    speaker.rotation.y = mx > 0 ? -0.35 : 0.35;
    speaker.castShadow = true;
    perfGroup.add(speaker);
  });

  // 4 Corner Aluminum Stage Lighting Truss Towers with Angled Floodlights
  [
    [-perfW / 2 + 1.2, -perfD / 2 + 1.2],
    [perfW / 2 - 1.2, -perfD / 2 + 1.2],
    [-perfW / 2 + 1.2, perfD / 2 - 1.2],
    [perfW / 2 - 1.2, perfD / 2 - 1.2]
  ].forEach(([tx, tz]) => {
    const truss = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 4.8, 8),
      new THREE.MeshLambertMaterial({ color: 0x7c8591, roughness: 0.5 })
    );
    truss.position.set(tx, 2.4, tz);
    truss.castShadow = true;
    perfGroup.add(truss);

    const spotFixture = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.35, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xffb74d })
    );
    spotFixture.position.set(tx, 4.8, tz);
    spotFixture.lookAt(0, 0.5, 0);
    perfGroup.add(spotFixture);
  });

  // 4 Wooden Picnic / Bistro Tables with Umbrellas for Spectators
  [
    [-11, -5.5], [11, -5.5], [-11, 5.5], [11, 5.5]
  ].forEach(([bx, bz]) => {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(bx, 0.15, bz);

    // Wooden table
    const table = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.1, 0.1, 12),
      new THREE.MeshLambertMaterial({ color: 0xa06d42 })
    );
    table.position.y = 0.75;
    table.castShadow = true;
    tableGroup.add(table);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8),
      new THREE.MeshLambertMaterial({ color: 0x444444 })
    );
    pole.position.y = 1.2;
    tableGroup.add(pole);

    // Colorful umbrella canopy
    const umbrella = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 0.6, 10),
      new THREE.MeshLambertMaterial({ color: (bx * bz > 0) ? 0xe67e22 : 0x2980b9 })
    );
    umbrella.position.y = 2.4;
    tableGroup.add(umbrella);

    perfGroup.add(tableGroup);
  });

  rajabaug.add(perfGroup);

  // ---- 5. The 10 Pre-Agnee Canopied Fun Stalls (High-Fidelity 3D Models & Authentic Props)
  const STALL_CONFIGS = [
    { num: 1, name: 'Ring Toss & Bulls-Eye', tag: 'Carnival Game', desc: 'Toss rings onto colored glass bottles to win official Agnee badges & keychains!', roofCol: '#e86820', stripeCol: '#ffffff', type: 'toss', price: '🎟️ ₹30 / 5 Rings', reward: '🏆 Agnee Badges & Toys' },
    { num: 2, name: 'Balloon Dart Blitz', tag: 'Action Game', desc: 'Pop 3 target balloons in a row with precision darts for Agnee vouchers & passes!', roofCol: '#1d55b8', stripeCol: '#ffffff', type: 'dart', price: '🎯 ₹40 / 3 Darts', reward: '🎟️ Fest Day Passes' },
    { num: 3, name: 'Can Knockout Alley', tag: 'Skill Game', desc: 'Knock down the silver tin can pyramid in a single clean strike to win an Agnee cap!', roofCol: '#ce2626', stripeCol: '#ffe600', type: 'cans', price: '⚾ ₹30 / 2 Throws', reward: '🧢 Agnee Festival Cap' },
    { num: 4, name: 'Agnee VR & Retro Gaming', tag: 'Arcade Hub', desc: 'Challenge friends at 90s retro arcade cabinets and experience immersive campus VR tours!', roofCol: '#1f8a4e', stripeCol: '#00f0ff', type: 'arcade', price: '🎮 Free to Play', reward: '✨ VR Experience & Highscores' },
    { num: 5, name: 'Fortune Wheel & Lucky Draw', tag: 'Prize Spin', desc: 'Spin the giant 12-segment carnival wheel for fest merch, stickers, and pro-show passes!', roofCol: '#7b2391', stripeCol: '#f39c12', type: 'wheel', price: '🎡 ₹50 per Spin', reward: '🎁 Hoodies & VIP Passes' },
    { num: 6, name: 'Face Art & Glitter Tattoos', tag: 'Art Studio', desc: 'Vibrant tribal face paint, neon glowing decals, and metallic Agnee fest tattoos!', roofCol: '#e86820', stripeCol: '#ffea00', type: 'face', price: '🎨 ₹50 – ₹100', reward: '✨ UV Glow & Decals' },
    { num: 7, name: 'Agnee Merch & Souvenirs', tag: 'Official Shop', desc: 'Official Agnee 2026 hoodies (Eclipse Black & Inferno Red), tees, totes, and caps!', roofCol: '#1d55b8', stripeCol: '#f1c40f', type: 'merch', price: '🏷️ ₹499 Official Merch', reward: '🛍️ Hoodies, Tees, Totes & Caps', isMerch: true },
    { num: 8, name: 'Popcorn & Candy Floss', tag: 'Festival Treats', desc: 'Fresh hot buttered popcorn, twirled cotton candy, and chilled fruit slushies!', roofCol: '#ce2626', stripeCol: '#ff66cc', type: 'popcorn', price: '🍿 ₹40 – ₹60', reward: '🍿 Hot Buttered Treats' },
    { num: 9, name: 'Chai & Street Munchies', tag: 'Campus Food', desc: 'Traditional cutting masala chai in clay kulhads with hot golden samosas and spicy bites!', roofCol: '#1f8a4e', stripeCol: '#f39c12', type: 'chai', price: '☕ ₹20 – ₹50', reward: '☕ Cutting Chai & Samosas' },
    { num: 10, name: 'Polaroid Memory Wall', tag: 'Photo Zone', desc: 'Capture instant retro Polaroid snapshots and pin your memory onto the Agnee memory wall!', roofCol: '#7b2391', stripeCol: '#00d2d3', type: 'photo', price: '📸 ₹50 per Print', reward: '🖼️ Custom Keepsake Frame' }
  ];

  const stallXs = [-17, -6, 5, 16, 27]; // 5 columns across the field
  const interactiveStallMeshes = [];

  // Helper to create high-resolution striped awning canopy texture
  const createAwningTex = (baseHex, stripeHex) => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = baseHex;
    g.fillRect(0, 0, 256, 256);

    // 8 vertical bold festival stripes
    g.fillStyle = stripeHex;
    for (let x = 0; x < 256; x += 32) {
      g.fillRect(x, 0, 16, 256);
    }
    // Shadow shading along eaves
    const shGrad = g.createLinearGradient(0, 200, 0, 256);
    shGrad.addColorStop(0, 'rgba(0,0,0,0)');
    shGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
    g.fillStyle = shGrad;
    g.fillRect(0, 200, 256, 56);

    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  };

  STALL_CONFIGS.forEach((cfg) => {
    const isTop = cfg.num <= 5;
    const colIdx = isTop ? cfg.num - 1 : cfg.num - 6;
    const sx = stallXs[colIdx];
    const sz = isTop ? -21 : 21;
    const sRot = isTop ? 0 : Math.PI;

    const stall = new THREE.Group();
    stall.name = 'stall_' + cfg.num;
    stall.userData = { stallIndex: cfg.num - 1, stallConfig: cfg };
    stall.position.set(sx, 0, sz);
    stall.rotation.y = sRot;

    // A. Raised Teak Wood Deck Platform
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.14, 4.2),
      new THREE.MeshLambertMaterial({ color: 0x8a5933, roughness: 0.7 })
    );
    deck.position.set(0, 0.07, 0);
    deck.receiveShadow = true;
    stall.add(deck);

    // B. Corner Timber Posts with Brass Base Rings
    const postMat = new THREE.MeshLambertMaterial({ color: 0xeee9df, roughness: 0.5 });
    const brassMat = new THREE.MeshLambertMaterial({ color: 0xe6b325, roughness: 0.3 });
    [
      [-2.1, -1.8], [2.1, -1.8], [-2.1, 1.8], [2.1, 1.8]
    ].forEach(([px, pz]) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.9, 8), postMat);
      pole.position.set(px, 1.48, pz);
      pole.castShadow = true;
      stall.add(pole);

      const footing = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.24), brassMat);
      footing.position.set(px, 0.14, pz);
      stall.add(footing);
    });

    // C. Realistic Striped Pagoda Fabric Canopy Roof
    const awningTex = createAwningTex(cfg.roofCol, cfg.stripeCol);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.4, 1.75, 4),
      new THREE.MeshLambertMaterial({ map: awningTex, roughness: 0.65, side: THREE.DoubleSide })
    );
    roof.position.set(0, 3.65, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    stall.add(roof);

    // D. Scalloped Cloth Valance Fringe around Eaves
    const valanceMat = new THREE.MeshLambertMaterial({ color: cfg.stripeCol === '#ffffff' ? cfg.roofCol : cfg.stripeCol });
    const valanceFront = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 0.06), valanceMat);
    valanceFront.position.set(0, 2.85, 1.85);
    stall.add(valanceFront);

    const valanceBack = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 0.06), valanceMat);
    valanceBack.position.set(0, 2.85, -1.85);
    stall.add(valanceBack);

    [-2.2, 2.2].forEach((vx) => {
      const valanceSide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 3.8), valanceMat);
      valanceSide.position.set(vx, 2.85, 0);
      stall.add(valanceSide);
    });

    // Warm Festoon Fairy String Lights under Eave
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff099 });
    for (let b = -1.8; b <= 1.8; b += 0.45) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), bulbMat);
      bulb.position.set(b, 2.68 - Math.sin((b + 1.8) / 3.6 * Math.PI) * 0.08, 1.84);
      stall.add(bulb);
    }

    // Brass Apex Finial with Waving Agnee Festival Pennant
    const finialPin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.08, 0.6, 8),
      brassMat
    );
    finialPin.position.set(0, 4.75, 0);
    stall.add(finialPin);

    const flagMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.65, 3),
      new THREE.MeshLambertMaterial({ color: cfg.roofCol, side: THREE.DoubleSide })
    );
    flagMesh.position.set(0.25, 4.9, 0);
    flagMesh.rotation.z = -Math.PI / 2;
    stall.add(flagMesh);

    // E. Polished Hardwood Front Serving Counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(3.9, 0.95, 0.85),
      new THREE.MeshLambertMaterial({ color: 0x9e6538, roughness: 0.6 })
    );
    counter.position.set(0, 0.48, 1.4);
    counter.castShadow = true;
    stall.add(counter);

    // Front Decorative Festival Skirt Banner
    const skirt = new THREE.Mesh(
      new THREE.PlaneGeometry(3.85, 0.78),
      new THREE.MeshLambertMaterial({ color: cfg.roofCol })
    );
    skirt.position.set(0, 0.45, 1.83);
    stall.add(skirt);

    // Front Desk Emblem Plate
    const deskCanvas = document.createElement('canvas');
    deskCanvas.width = 384;
    deskCanvas.height = 96;
    const dg = deskCanvas.getContext('2d');
    dg.fillStyle = '#0e1624';
    dg.fillRect(0, 0, 384, 96);
    dg.strokeStyle = '#f5b800';
    dg.lineWidth = 4;
    dg.strokeRect(3, 3, 378, 90);
    dg.fillStyle = '#ffffff';
    dg.font = '800 24px Arial, sans-serif';
    dg.textAlign = 'center';
    dg.textBaseline = 'middle';
    dg.fillText('AGNEE FESTIVAL · STALL ' + cfg.num, 192, 48);
    const deskTex = new THREE.CanvasTexture(deskCanvas);
    deskTex.encoding = THREE.sRGBEncoding;
    const deskPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.45),
      new THREE.MeshBasicMaterial({ map: deskTex, side: THREE.DoubleSide })
    );
    deskPlate.position.set(0, 0.46, 1.84);
    stall.add(deskPlate);

    // F. Backboard Display Wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 2.3, 0.12),
      new THREE.MeshLambertMaterial({ color: 0x483a2e, roughness: 0.8 })
    );
    backWall.position.set(0, 1.55, -1.75);
    backWall.castShadow = true;
    stall.add(backWall);

    // G. Realistic Overhead Eaves Marquee Banner (Mounted above serving window at Y = 3.12m!)
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 140;
    const sg = signCanvas.getContext('2d');

    // Obsidian glossy plate with brushed gold metallic double-border
    sg.fillStyle = '#0b1320';
    sg.fillRect(0, 0, 512, 140);
    sg.strokeStyle = '#f5b800';
    sg.lineWidth = 6;
    sg.strokeRect(4, 4, 504, 132);
    sg.lineWidth = 2;
    sg.strokeRect(10, 10, 492, 120);

    // Number Badge (Left Pill / Circle)
    sg.fillStyle = '#f5b800';
    sg.beginPath();
    sg.arc(60, 70, 42, 0, Math.PI * 2);
    sg.fill();
    sg.fillStyle = '#0c1322';
    sg.font = '900 44px Arial, sans-serif';
    sg.textAlign = 'center';
    sg.textBaseline = 'middle';
    sg.fillText(String(cfg.num), 60, 70);

    // Activity Title (Right Bold Heading)
    sg.fillStyle = '#ffffff';
    sg.font = '900 30px Arial, sans-serif';
    sg.textAlign = 'left';
    sg.textBaseline = 'alphabetic';
    sg.fillText(cfg.name.toUpperCase(), 124, 62);

    // Activity Tag Subtitle
    sg.fillStyle = '#f5b800';
    sg.font = '700 18px Arial, sans-serif';
    sg.fillText('★ ' + cfg.tag.toUpperCase() + ' · ' + (cfg.price || 'PRE-AGNEE'), 124, 100);

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.encoding = THREE.sRGBEncoding;
    const signBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 0.68),
      new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
    );
    signBoard.position.set(0, 3.12, 1.86);
    stall.add(signBoard);

    // H. Warm Interior Glowing Lantern Fixture
    const interiorLantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffea88 })
    );
    interiorLantern.position.set(0, 2.5, 0);
    stall.add(interiorLantern);

    // I. Custom High-Fidelity 3D Game & Merchandise Props
    if (cfg.type === 'toss') {
      // 1. Rustic wooden bottle crate with 10 colored glass bottles
      const crateMat = new THREE.MeshLambertMaterial({ color: 0x6e4726 });
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.7), crateMat);
      crate.position.set(-0.6, 0.98, 1.4);
      stall.add(crate);

      const bCols = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6];
      for (let b = 0; b < 10; b++) {
        const row = Math.floor(b / 5);
        const col = b % 5;
        const bottle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.045, 0.065, 0.44, 12),
          new THREE.MeshLambertMaterial({ color: bCols[b % 5], roughness: 0.15 })
        );
        bottle.position.set(-1.1 + col * 0.26, 1.15, 1.25 + row * 0.28);
        bottle.castShadow = true;
        stall.add(bottle);
      }
      // Rattan hoop rings stack
      for (let r = 0; r < 5; r++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.16, 0.022, 8, 16),
          new THREE.MeshLambertMaterial({ color: 0xc8a165 })
        );
        ring.position.set(1.1, 0.98 + r * 0.028, 1.4);
        ring.rotation.x = Math.PI / 2;
        stall.add(ring);
      }
      // Giant Plush Teddy Bear Prize on Back Shelf
      const bearShelf = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.4), crateMat);
      bearShelf.position.set(0, 1.6, -1.55);
      const bearBody = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshLambertMaterial({ color: 0x8d5524 }));
      bearBody.position.set(0, 1.88, -1.55);
      const bearHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshLambertMaterial({ color: 0xa06535 }));
      bearHead.position.set(0, 2.2, -1.55);
      const ear1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshLambertMaterial({ color: 0x8d5524 }));
      ear1.position.set(-0.14, 2.34, -1.55);
      const ear2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshLambertMaterial({ color: 0x8d5524 }));
      ear2.position.set(0.14, 2.34, -1.55);
      stall.add(bearShelf, bearBody, bearHead, ear1, ear2);

    } else if (cfg.type === 'dart') {
      const bCols = [0xe91e63, 0x00bcd4, 0xffeb3b, 0x4caf50, 0xff5722];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
          const balloon = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 10, 10),
            new THREE.MeshLambertMaterial({ color: bCols[(row * 5 + col) % 5], roughness: 0.3 })
          );
          balloon.scale.set(0.9, 1.25, 0.8);
          balloon.position.set(-1.2 + col * 0.6, 1.35 + row * 0.52, -1.6);
          stall.add(balloon);
        }
      }
      // Cork dartboard with bullseye
      const dartboard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 0.06, 16),
        new THREE.MeshLambertMaterial({ color: 0x222222 })
      );
      dartboard.rotation.x = Math.PI / 2;
      dartboard.position.set(0, 1.6, -1.65);
      const bull = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.07, 16), new THREE.MeshLambertMaterial({ color: 0xe74c3c }));
      bull.rotation.x = Math.PI / 2;
      bull.position.set(0, 1.6, -1.63);
      stall.add(dartboard, bull);

      // Dart tray with steel darts
      const dTray = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.35), new THREE.MeshLambertMaterial({ color: 0x3e2723 }));
      dTray.position.set(0.8, 0.98, 1.4);
      stall.add(dTray);
      for (let d = 0; d < 3; d++) {
        const dart = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 6), new THREE.MeshLambertMaterial({ color: 0xffd700 }));
        dart.position.set(0.65 + d * 0.14, 1.04, 1.4);
        dart.rotation.x = Math.PI / 2;
        stall.add(dart);
      }

    } else if (cfg.type === 'cans') {
      const canMat = new THREE.MeshLambertMaterial({ color: 0xe0e0e0, roughness: 0.2 });
      [-0.7, 0.7].forEach((cx) => {
        // Base row (3 cans)
        for (let i = 0; i < 3; i++) {
          const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.24, 12), canMat);
          c.position.set(cx - 0.22 + i * 0.22, 1.05, 1.4);
          c.castShadow = true;
          stall.add(c);
        }
        // Middle row (2 cans)
        for (let i = 0; i < 2; i++) {
          const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.24, 12), canMat);
          c.position.set(cx - 0.11 + i * 0.22, 1.29, 1.4);
          c.castShadow = true;
          stall.add(c);
        }
        // Top can
        const topCan = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.24, 12), canMat);
        topCan.position.set(cx, 1.53, 1.4);
        topCan.castShadow = true;
        stall.add(topCan);
      });
      // Soft base balls
      for (let b = 0; b < 3; b++) {
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshLambertMaterial({ color: 0xff3b30 }));
        ball.position.set(-0.2 + b * 0.2, 1.01, 1.4);
        stall.add(ball);
      }

    } else if (cfg.type === 'arcade') {
      [-0.85, 0.85].forEach((ax) => {
        const cabinet = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 1.8, 0.8),
          new THREE.MeshLambertMaterial({ color: 0x121824, roughness: 0.5 })
        );
        cabinet.position.set(ax, 0.9, 0.3);
        cabinet.castShadow = true;
        stall.add(cabinet);

        const screen = new THREE.Mesh(
          new THREE.PlaneGeometry(0.7, 0.5),
          new THREE.MeshBasicMaterial({ color: ax < 0 ? 0x00f0ff : 0xff007f })
        );
        screen.position.set(ax, 1.25, 0.71);
        stall.add(screen);
      });
      // VR Headset on tabletop stand
      const vrVisor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.24), new THREE.MeshLambertMaterial({ color: 0x222222 }));
      vrVisor.position.set(0, 1.05, 1.4);
      const vrLed = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.04), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
      vrLed.position.set(0, 1.05, 1.53);
      stall.add(vrVisor, vrLed);

    } else if (cfg.type === 'wheel') {
      const wheelStand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 1.9, 8),
        new THREE.MeshLambertMaterial({ color: 0x333333 })
      );
      wheelStand.position.set(0, 1.25, 0.3);
      stall.add(wheelStand);

      const wheelDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 0.95, 0.08, 20),
        new THREE.MeshLambertMaterial({ color: 0xf39c12, roughness: 0.5 })
      );
      wheelDisc.rotation.x = Math.PI / 2;
      wheelDisc.position.set(0, 1.9, 0.35);
      stall.add(wheelDisc);

      // Raffle ticket box & prize packages
      const raffle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.35), new THREE.MeshLambertMaterial({ color: 0xe67e22 }));
      raffle.position.set(-0.8, 1.12, 1.4);
      stall.add(raffle);

    } else if (cfg.type === 'face') {
      const palette = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.04, 12),
        new THREE.MeshLambertMaterial({ color: 0xdeb887 })
      );
      palette.position.set(-0.6, 0.98, 1.4);
      stall.add(palette);

      [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6].forEach((col, k) => {
        const blob = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8),
          new THREE.MeshLambertMaterial({ color: col })
        );
        blob.position.set(-0.75 + k * 0.08, 1.01, 1.4);
        stall.add(blob);
      });
      // Vanity mirror stand
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.04), new THREE.MeshLambertMaterial({ color: 0xdddddd }));
      mirror.position.set(0.6, 1.28, 1.4);
      stall.add(mirror);

    } else if (cfg.type === 'merch') {
      // ================================================================
      // HIGH-FIDELITY OFFICIAL AGNEE'26 MERCHANDISE SELLING COUNTER
      // ================================================================
      // 1. Chrome Clothes Display Rail with Vertical Standards & Feet
      const rackMat = new THREE.MeshLambertMaterial({ color: 0xe0e0e0, roughness: 0.2 });
      const rackBar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.3, 12), rackMat);
      rackBar.position.set(0, 1.7, -0.6);
      rackBar.rotation.z = Math.PI / 2;
      stall.add(rackBar);

      [-1.05, 1.05].forEach((rx) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.7, 12), rackMat);
        post.position.set(rx, 0.85, -0.6);
        stall.add(post);
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12), rackMat);
        foot.position.set(rx, 0.08, -0.6);
        stall.add(foot);
      });

      // 2. Three Distinct Official Agnee Garments on Hangers
      // Center: "Eclipse Black" Official Hoodie (₹499)
      const blackHoodie = new THREE.Group();
      blackHoodie.position.set(0, 1.22, -0.6);
      const bBody = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.68, 0.16), new THREE.MeshLambertMaterial({ color: 0x111114 }));
      const bHood = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshLambertMaterial({ color: 0x18181c }));
      bHood.scale.set(1.1, 1.3, 0.9);
      bHood.position.set(0, 0.36, -0.04);
      const bLogo = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0xff7700 }));
      bLogo.position.set(0, 0.1, 0.09);
      blackHoodie.add(bBody, bHood, bLogo);
      stall.add(blackHoodie);

      // Left: "Inferno Red" Festival Hoodie (₹499)
      const redHoodie = new THREE.Group();
      redHoodie.position.set(-0.64, 1.22, -0.6);
      const rBody = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.65, 0.15), new THREE.MeshLambertMaterial({ color: 0xb51e2b }));
      const rHood = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), new THREE.MeshLambertMaterial({ color: 0xc92433 }));
      rHood.scale.set(1.1, 1.3, 0.9);
      rHood.position.set(0, 0.35, -0.04);
      const rLogo = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      rLogo.position.set(0, 0.1, 0.085);
      redHoodie.add(rBody, rHood, rLogo);
      stall.add(redHoodie);

      // Right: "Ethereal White" Festival Tote / Tee (₹499)
      const whiteItem = new THREE.Group();
      whiteItem.position.set(0.64, 1.22, -0.6);
      const wBody = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.12), new THREE.MeshLambertMaterial({ color: 0xf4f0e6 }));
      const wLogo = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), new THREE.MeshBasicMaterial({ color: 0xd4a017 }));
      wLogo.position.set(0, 0.08, 0.07);
      whiteItem.add(wBody, wLogo);
      stall.add(whiteItem);

      // 3. Tabletop Folded Merchandise Stacks
      // Black folded hoodies stack
      for (let s = 0; s < 4; s++) {
        const stack1 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.42), new THREE.MeshLambertMaterial({ color: 0x16161a }));
        stack1.position.set(-1.15, 0.98 + s * 0.065, 1.4);
        stall.add(stack1);
      }
      // Red folded tees stack
      for (let s = 0; s < 4; s++) {
        const stack2 = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.40), new THREE.MeshLambertMaterial({ color: 0xb51e2b }));
        stack2.position.set(-0.6, 0.98 + s * 0.055, 1.4);
        stall.add(stack2);
      }

      // 4. Two Embroidered Festival Caps on Stand
      [0.05, 0.55].forEach((cx, idx) => {
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.06, 0.22, 8), new THREE.MeshLambertMaterial({ color: 0x8a5933 }));
        stand.position.set(cx, 1.06, 1.4);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: idx === 0 ? 0x0f172a : 0xb51e2b }));
        cap.position.set(cx, 1.18, 1.4);
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 12, 1, false, 0, Math.PI), new THREE.MeshLambertMaterial({ color: idx === 0 ? 0x0f172a : 0xb51e2b }));
        brim.position.set(cx, 1.16, 1.48);
        stall.add(stand, cap, brim);
      });

      // 5. Official Acrylic Price Plaque Stand
      const priceCanvas = document.createElement('canvas');
      priceCanvas.width = 256;
      priceCanvas.height = 128;
      const pg = priceCanvas.getContext('2d');
      pg.fillStyle = '#0f1724';
      pg.fillRect(0, 0, 256, 128);
      pg.strokeStyle = '#f5b800';
      pg.lineWidth = 4;
      pg.strokeRect(2, 2, 252, 124);
      pg.fillStyle = '#ffffff';
      pg.font = '800 24px Arial, sans-serif';
      pg.textAlign = 'center';
      pg.fillText('OFFICIAL HOODIE', 128, 42);
      pg.fillStyle = '#f5b800';
      pg.font = '900 36px Arial, sans-serif';
      pg.fillText('₹499/-', 128, 86);
      const priceTex = new THREE.CanvasTexture(priceCanvas);
      priceTex.encoding = THREE.sRGBEncoding;

      const priceStand = new THREE.Mesh(
        new THREE.PlaneGeometry(0.55, 0.35),
        new THREE.MeshBasicMaterial({ map: priceTex, side: THREE.DoubleSide })
      );
      priceStand.position.set(1.2, 1.14, 1.4);
      priceStand.rotation.y = -0.2;
      stall.add(priceStand);

      // 6. Ceramic Fest Mugs
      [1.0, 1.35].forEach((mx) => {
        const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 12), new THREE.MeshLambertMaterial({ color: 0x1e272e }));
        mug.position.set(mx, 1.02, 1.18);
        stall.add(mug);
      });

      // 7. Back wall official promotional poster
      const merchPoster = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 1.0),
        new THREE.MeshLambertMaterial({ color: 0x1a2536 })
      );
      merchPoster.position.set(0, 1.7, -1.68);
      stall.add(merchPoster);

    } else if (cfg.type === 'popcorn') {
      const warmer = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.95, 0.7),
        new THREE.MeshLambertMaterial({ color: 0xd63031, roughness: 0.4 })
      );
      warmer.position.set(-0.6, 1.42, 1.4);
      warmer.castShadow = true;
      stall.add(warmer);

      const corn = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshLambertMaterial({ color: 0xf1c40f })
      );
      corn.position.set(-0.6, 1.35, 1.4);
      stall.add(corn);

      // Popcorn tubs
      for (let p = 0; p < 3; p++) {
        const tub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.22, 10), new THREE.MeshLambertMaterial({ color: 0xfff275 }));
        tub.position.set(0.2 + p * 0.22, 1.06, 1.4);
        stall.add(tub);
      }

    } else if (cfg.type === 'chai') {
      const kettle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.35, 0.65, 14),
        new THREE.MeshLambertMaterial({ color: 0xb87333, roughness: 0.3 })
      );
      kettle.position.set(-0.7, 1.25, 1.4);
      kettle.castShadow = true;
      stall.add(kettle);

      // Chai cutting glasses in wooden carrier
      const cCarrier = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.4), new THREE.MeshLambertMaterial({ color: 0x5a3d1c }));
      cCarrier.position.set(0.4, 0.98, 1.4);
      stall.add(cCarrier);

      for (let g = 0; g < 4; g++) {
        const glass = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.04, 0.14, 8),
          new THREE.MeshLambertMaterial({ color: 0xdfe6e9, transparent: true, opacity: 0.7 })
        );
        glass.position.set(0.18 + g * 0.15, 1.04, 1.4);
        stall.add(glass);
      }

      // Golden fried samosas on plate
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
      plate.position.set(1.15, 0.98, 1.4);
      stall.add(plate);
      for (let s = 0; s < 3; s++) {
        const samosa = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 3), new THREE.MeshLambertMaterial({ color: 0xd4a017 }));
        samosa.position.set(1.1 + s * 0.08, 1.02, 1.4);
        stall.add(samosa);
      }

    } else if (cfg.type === 'photo') {
      const photoFrame = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 1.9, 0.06),
        new THREE.MeshLambertMaterial({ color: 0x3e2723, roughness: 0.7 })
      );
      photoFrame.position.set(0, 1.65, -1.35);
      stall.add(photoFrame);

      // Hanging Polaroid photo mockups
      for (let p = 0; p < 6; p++) {
        const row = Math.floor(p / 3);
        const col = p % 3;
        const pic = new THREE.Mesh(
          new THREE.PlaneGeometry(0.35, 0.42),
          new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        pic.position.set(-0.6 + col * 0.6, 1.9 - row * 0.52, -1.31);
        stall.add(pic);
      }
      // Polaroid instant camera on tabletop tripod
      const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.20, 0.26), new THREE.MeshLambertMaterial({ color: 0xf5f6fa }));
      camBody.position.set(0.8, 1.08, 1.4);
      const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 12), new THREE.MeshLambertMaterial({ color: 0x222222 }));
      camLens.rotation.x = Math.PI / 2;
      camLens.position.set(0.8, 1.08, 1.54);
      stall.add(camBody, camLens);
    }

    // Assign clickable target
    interactiveStallMeshes.push(stall);
    rajabaug.add(stall);
  });

  window.AGNEE_RAJABAUG_STALLS = interactiveStallMeshes;

  // ---- 6. Overhead Festoon Fairy Lights & Pennant Bunting
  const buntingColors = [0xe74c3c, 0xf39c12, 0x2ecc71, 0x3498db, 0x9b59b6];
  [-21, 21].forEach((bz) => {
    // String wire
    const wireGeo = new THREE.BoxGeometry(56, 0.03, 0.03);
    const wire = new THREE.Mesh(wireGeo, new THREE.MeshBasicMaterial({ color: 0x333333 }));
    wire.position.set(5, 3.5, bz);
    rajabaug.add(wire);

    // Bunting pennants
    for (let bx = -22; bx <= 32; bx += 1.6) {
      const pennant = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.38, 3),
        new THREE.MeshLambertMaterial({
          color: buntingColors[Math.abs(Math.floor(bx)) % buntingColors.length],
          side: THREE.DoubleSide
        })
      );
      pennant.position.set(bx, 3.4 + Math.sin(bx * 0.4) * 0.2, bz);
      pennant.rotation.x = Math.PI;
      rajabaug.add(pennant);

      // Glowing warm bulb node every 3.2m
      if (Math.abs(Math.floor(bx)) % 2 === 0) {
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xffecaa })
        );
        bulb.position.set(bx, 3.25 + Math.sin(bx * 0.4) * 0.2, bz);
        rajabaug.add(bulb);
      }
    }
  });

  // ---- 7. Grand Ceremonial Entrance Gateway (East, Facing Pratap Vilas Palace)
  const gateGroup = new THREE.Group();
  gateGroup.position.set(RB_W / 2 - 1, 0, 0); // mapX = 296, mapY = 189
  gateGroup.rotation.y = -Math.PI / 2;

  // Carved Sandstone Entrance Gate Towers (Left & Right)
  [-4.8, 4.8].forEach((gx) => {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 5.4, 1.6),
      new THREE.MeshLambertMaterial({ color: 0xd9ceb6, roughness: 0.65 })
    );
    pillar.position.set(gx, 2.7, 0);
    pillar.castShadow = true;
    gateGroup.add(pillar);

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.45, 2.0),
      new THREE.MeshLambertMaterial({ color: 0xede4d1 })
    );
    cap.position.set(gx, 5.5, 0);
    gateGroup.add(cap);

    const domePin = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 14, 10),
      new THREE.MeshLambertMaterial({ color: 0xc47c58 })
    );
    domePin.position.set(gx, 6.0, 0);
    gateGroup.add(domePin);

    const lantern = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.7, 0.45),
      new THREE.MeshBasicMaterial({ color: 0xffea88 })
    );
    lantern.position.set(gx, 3.4, 0.95);
    gateGroup.add(lantern);
  });

  const headerBeam = new THREE.Mesh(
    new THREE.BoxGeometry(10.2, 0.75, 0.9),
    new THREE.MeshLambertMaterial({ color: 0xd9ceb6 })
  );
  headerBeam.position.set(0, 5.0, 0);
  headerBeam.castShadow = true;
  gateGroup.add(headerBeam);

  const gateCanvas = document.createElement('canvas');
  gateCanvas.width = 512;
  gateCanvas.height = 128;
  const gg = gateCanvas.getContext('2d');

  const grad = gg.createLinearGradient(0, 0, 512, 128);
  grad.addColorStop(0, '#0e2d78');
  grad.addColorStop(0.5, '#193f9e');
  grad.addColorStop(1, '#0e2d78');
  gg.fillStyle = grad;
  gg.fillRect(0, 0, 512, 128);

  gg.strokeStyle = '#e6b325';
  gg.lineWidth = 6;
  gg.strokeRect(6, 6, 500, 116);
  gg.lineWidth = 2;
  gg.strokeRect(12, 12, 488, 104);

  gg.fillStyle = '#ffffff';
  gg.font = '900 42px Arial, sans-serif';
  gg.textAlign = 'center';
  gg.textBaseline = 'middle';
  gg.fillText('★ RAJABAUG ★', 256, 44);

  gg.fillStyle = '#f5c542';
  gg.font = '700 24px Arial, sans-serif';
  gg.fillText('PRE-AGNEE FUN CARNIVAL · 10 STALLS', 256, 88);

  const gateTex = new THREE.CanvasTexture(gateCanvas);
  gateTex.encoding = THREE.sRGBEncoding;
  const gateBanner = new THREE.Mesh(
    new THREE.PlaneGeometry(8.6, 2.1),
    new THREE.MeshBasicMaterial({ map: gateTex, side: THREE.DoubleSide })
  );
  gateBanner.position.set(0, 4.3, 0.05);
  gateGroup.add(gateBanner);

  rajabaug.add(gateGroup);

  // ---- 8. Boundary Royal Palm Trees Framing Rajabaug Perimeter
  for (let pz = -RB_D / 2 + 5; pz <= RB_D / 2 - 5; pz += 12) {
    const palm = new THREE.Group();
    palm.position.set(-RB_W / 2 + 3.2, 0, pz);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.32, 6.8, 8),
      new THREE.MeshLambertMaterial({ color: 0x7a6c5d })
    );
    trunk.position.y = 3.4;
    trunk.castShadow = true;
    palm.add(trunk);

    const crownMat = new THREE.MeshLambertMaterial({ color: 0x2b6326, side: THREE.DoubleSide });
    for (let f = 0; f < 8; f++) {
      const fAngle = (f * Math.PI) / 4;
      const frondCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 6.6, 0),
        new THREE.Vector3(Math.cos(fAngle) * 2.3, 7.0, Math.sin(fAngle) * 2.3),
        new THREE.Vector3(Math.cos(fAngle) * 3.8, 5.4, Math.sin(fAngle) * 3.8)
      );
      const frondGeo = new THREE.TubeGeometry(frondCurve, 8, 0.16, 4, false);
      const frond = new THREE.Mesh(frondGeo, crownMat);
      frond.castShadow = true;
      palm.add(frond);
    }
    rajabaug.add(palm);
  }

  scene.add(rajabaug);
})();

// ============================================================================
// Gati Shakti Vishwavidyalaya — Central Academic Block
// Faithfully modeled from the physical architectural scale model:
// - Grand 3-storey Neoclassical / Indo-Saracenic institutional palace
// - Warm sandstone & crisp white classical architectural trim
// - 4 Projecting corner towers with authentic domed Chhatris (Pavilions)
// - Grand monumental Triple-Arched Entrance Portico (Porte-Cochère)
// - Stately Central Drum & Heritage Ribbed Dome crowning the main entrance axis
// - Central Roof Atrium with arched barrel-vault glass skylight and white structural ribs
// - Grand 2-storey arched portals on side elevations
// - Classical white balustrades, stringcourses, dentil cornices, and roof urns
// - Refined royal blue & gold institutional plaque above the entrance archway
// - Front garden promenade with formal lawns, hedges, and Royal Palm trees
// ============================================================================

const gsvGroup = new THREE.Group();
gsvGroup.name = 'gsvAcademicBlock';

// ---- 1. High-Resolution Procedural Architectural Facade Textures
const acadFacadeTex = (() => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d');

  // Sandstone wall base
  g.fillStyle = '#e5ddd0';
  g.fillRect(0, 0, 512, 512);

  // Subtle horizontal ashlar stone joint lines
  g.strokeStyle = 'rgba(185, 172, 153, 0.45)';
  g.lineWidth = 1;
  for (let y = 0; y < 512; y += 14) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(512, y);
    g.stroke();
  }

  // Vertical ashlar coursing (staggered)
  for (let row = 0; row < 512; row += 28) {
    const offset = (row % 56 === 0) ? 0 : 28;
    for (let x = offset; x < 512; x += 56) {
      g.beginPath();
      g.moveTo(x, row);
      g.lineTo(x, row + 28);
      g.stroke();
    }
  }

  // 4 repetitive bays across 512px (each bay = 128px)
  for (let b = 0; b < 4; b++) {
    const bx = b * 128;

    // --- Ground Floor (Y: 340 to 500): Rusticated base + Round Arched Windows
    g.fillStyle = '#f8f6f0';
    g.fillRect(bx + 18, 360, 92, 130);
    // Molded Arch Top
    g.beginPath();
    g.arc(bx + 64, 385, 36, Math.PI, 0);
    g.fill();

    // Dark multi-pane window interior
    g.fillStyle = '#222930';
    g.fillRect(bx + 28, 385, 72, 105);
    g.beginPath();
    g.arc(bx + 64, 385, 36 - 6, Math.PI, 0);
    g.fill();

    // Warm interior glow sheen
    const grad1 = g.createRadialGradient(bx + 64, 430, 8, bx + 64, 430, 48);
    grad1.addColorStop(0, 'rgba(255, 215, 120, 0.45)');
    grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = grad1;
    g.fillRect(bx + 28, 370, 72, 120);

    // White glazing bars (muntins)
    g.strokeStyle = '#f8f6f0';
    g.lineWidth = 2.5;
    g.beginPath();
    // Vertical mullions
    g.moveTo(bx + 52, 368); g.lineTo(bx + 52, 490);
    g.moveTo(bx + 76, 368); g.lineTo(bx + 76, 490);
    // Horizontal transoms
    g.moveTo(bx + 28, 415); g.lineTo(bx + 100, 415);
    g.moveTo(bx + 28, 450); g.lineTo(bx + 100, 450);
    g.stroke();

    // Keystone on arch
    g.fillStyle = '#ffffff';
    g.fillRect(bx + 59, 344, 10, 14);

    // Rusticated pier accents
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.fillRect(bx + 2, 355, 12, 145);
    g.fillRect(bx + 114, 355, 12, 145);

    // --- 1st Floor (Y: 175 to 335): Balustrade + Tall Colonial French Windows
    // Balcony white balustrade strip
    g.fillStyle = '#ffffff';
    g.fillRect(bx, 332, 128, 12);
    // Balusters
    for (let bl = bx + 6; bl < bx + 124; bl += 10) {
      g.fillRect(bl, 336, 4, 8);
    }

    // Window frame
    g.fillStyle = '#ffffff';
    g.fillRect(bx + 24, 195, 80, 134);
    // Triangular pediment on top of window
    g.beginPath();
    g.moveTo(bx + 18, 195);
    g.lineTo(bx + 64, 175);
    g.lineTo(bx + 110, 195);
    g.closePath();
    g.fill();

    // Window glass
    g.fillStyle = '#222930';
    g.fillRect(bx + 32, 202, 64, 124);

    // Warm glow
    const grad2 = g.createRadialGradient(bx + 64, 255, 6, bx + 64, 255, 42);
    grad2.addColorStop(0, 'rgba(255, 215, 120, 0.42)');
    grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = grad2;
    g.fillRect(bx + 32, 202, 64, 124);

    // White glazing bars
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(bx + 53, 202); g.lineTo(bx + 53, 326);
    g.moveTo(bx + 75, 202); g.lineTo(bx + 75, 326);
    g.moveTo(bx + 32, 235); g.lineTo(bx + 96, 235);
    g.moveTo(bx + 32, 270); g.lineTo(bx + 96, 270);
    g.moveTo(bx + 32, 300); g.lineTo(bx + 96, 300);
    g.stroke();

    // Paired classical fluted pilasters flanking window
    g.fillStyle = '#f8f6f0';
    g.fillRect(bx + 6, 185, 12, 147);
    g.fillRect(bx + 110, 185, 12, 147);

    // --- 2nd Floor (Y: 40 to 170): Upper Colonial Windows & Entablature
    // Floor dividing band
    g.fillStyle = '#ffffff';
    g.fillRect(bx, 170, 128, 8);

    // Window frame
    g.fillStyle = '#ffffff';
    g.fillRect(bx + 28, 62, 72, 102);

    // Segmental / flat molded pediment
    g.fillRect(bx + 22, 54, 84, 8);

    // Window glass
    g.fillStyle = '#222930';
    g.fillRect(bx + 36, 68, 56, 92);

    // Glazing bars
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(bx + 64, 68); g.lineTo(bx + 64, 160);
    g.moveTo(bx + 36, 98); g.lineTo(bx + 92, 98);
    g.moveTo(bx + 36, 128); g.lineTo(bx + 92, 128);
    g.stroke();

    // Pilasters with Corinthian/Ionic capitals
    g.fillStyle = '#f8f6f0';
    g.fillRect(bx + 6, 50, 12, 120);
    g.fillRect(bx + 110, 50, 12, 120);
    // Capital
    g.fillRect(bx + 3, 44, 18, 7);
    g.fillRect(bx + 107, 44, 18, 7);
  }

  // --- Upper Entablature, Dentil Molding & Parapet (Y: 0 to 45)
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 512, 42);

  // Dentil band
  g.fillStyle = 'rgba(160, 145, 125, 0.45)';
  for (let dx = 4; dx < 512; dx += 12) {
    g.fillRect(dx, 22, 6, 8);
  }

  // Top molded cornice shadow
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(0, 42, 512, 4);

  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.encoding = THREE.sRGBEncoding;
  return t;
})();

// Texture for Central Side Facade Arched Portals
const acadSidePortalTex = (() => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const g = c.getContext('2d');

  g.fillStyle = '#e5ddd0';
  g.fillRect(0, 0, 256, 512);

  // Grand 2-storey classical arched portal in center
  g.fillStyle = '#ffffff';
  g.fillRect(38, 120, 180, 392);
  g.beginPath();
  g.arc(128, 150, 90, Math.PI, 0);
  g.fill();

  // Recessed portal opening
  g.fillStyle = '#222930';
  g.fillRect(56, 160, 144, 352);
  g.beginPath();
  g.arc(128, 160, 72, Math.PI, 0);
  g.fill();

  // Grand fanlight tracery
  g.strokeStyle = '#ffffff';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(128, 160, 72, Math.PI, 0);
  g.stroke();
  for (let a = 0; a <= Math.PI; a += Math.PI / 6) {
    g.beginPath();
    g.moveTo(128, 160);
    g.lineTo(128 + Math.cos(a) * 72, 160 - Math.sin(a) * 72);
    g.stroke();
  }

  // Transom and double entrance doors
  g.fillStyle = '#ffffff';
  g.fillRect(56, 320, 144, 8);

  // Large ornamental keystone
  g.fillStyle = '#ffffff';
  g.fillRect(116, 50, 24, 28);

  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.encoding = THREE.sRGBEncoding;
  return t;
})();

// Dedicated Shared Materials
const acadWhiteMat = new THREE.MeshLambertMaterial({ color: 0xfcfbf8 });
const acadSandstoneMat = new THREE.MeshLambertMaterial({ color: 0xdfd4c1 });
const acadGoldMat = new THREE.MeshLambertMaterial({ color: 0xe5ba5b });
const acadRoofMat = new THREE.MeshLambertMaterial({ color: 0xd8cebd });
const acadDarkMat = new THREE.MeshLambertMaterial({ color: 0x222a32 });
const acadGlassMat = new THREE.MeshStandardMaterial({
  color: 0x98cbe8,
  roughness: 0.12,
  metalness: 0.2,
  transparent: true,
  opacity: 0.65
});

// Coordinate constants (Scaled to harmonious, elegant institutional proportions)
// Center X = 357, Center Z = 64
// World coordinates: x = X - W/2, z = Z - H/2
const AC_CX = 357 - W / 2; // -18.5
const AC_CZ = 64 - H / 2;  // -151
const AC_W = 52;   // Was 70 (scaled down to proportional institutional scale)
const AC_D = 36;   // Was 48
const AC_H = 13.5; // Was 16.2 (scaled 3-storey height)

// ---- 2. Main Building Body (with central courtyard cutout)
const gsv = mk(
  [
    [AC_CX - AC_W / 2 + W / 2, AC_CZ - AC_D / 2 + H / 2],
    [AC_CX + AC_W / 2 + W / 2, AC_CZ - AC_D / 2 + H / 2],
    [AC_CX + AC_W / 2 + W / 2, AC_CZ + AC_D / 2 + H / 2],
    [AC_CX - AC_W / 2 + W / 2, AC_CZ + AC_D / 2 + H / 2]
  ],
  AC_H,
  0xd8cebd,
  0xd4c7b2,
  1.5,
  [
    // Central Atrium Courtyard Hole (width 22m, depth 16m)
    [
      [AC_CX - 11 + W / 2, AC_CZ - 8 + H / 2],
      [AC_CX + 11 + W / 2, AC_CZ - 8 + H / 2],
      [AC_CX + 11 + W / 2, AC_CZ + 8 + H / 2],
      [AC_CX - 11 + W / 2, AC_CZ + 8 + H / 2]
    ]
  ],
  [],
  acadFacadeTex,
  [1 / 6.5, 1 / 4.5]
);

// Add building plinth foundation
const plinth = new THREE.Mesh(
  new THREE.BoxGeometry(AC_W + 1.2, 0.6, AC_D + 1.2),
  new THREE.MeshLambertMaterial({ color: 0x8a8174 })
);
plinth.position.set(AC_CX, 0.3, AC_CZ);
plinth.receiveShadow = true;
gsv.add(plinth);

// ---- 3. Projecting Architectural Moldings & Balustrades
// Continuous white cornice along roofline
const roofCornice = new THREE.Mesh(
  new THREE.BoxGeometry(AC_W + 1.0, 0.55, AC_D + 1.0),
  acadWhiteMat
);
roofCornice.position.set(AC_CX, AC_H + 0.28, AC_CZ);
roofCornice.castShadow = true;
gsv.add(roofCornice);

// Rooftop Balustrade / Parapet around outer roof edge
const parapetFront = new THREE.Mesh(new THREE.BoxGeometry(AC_W + 0.8, 1.0, 0.4), acadWhiteMat);
parapetFront.position.set(AC_CX, AC_H + 0.95, AC_CZ + AC_D / 2);
const parapetBack = new THREE.Mesh(new THREE.BoxGeometry(AC_W + 0.8, 1.0, 0.4), acadWhiteMat);
parapetBack.position.set(AC_CX, AC_H + 0.95, AC_CZ - AC_D / 2);
const parapetLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, AC_D + 0.8), acadWhiteMat);
parapetLeft.position.set(AC_CX - AC_W / 2, AC_H + 0.95, AC_CZ);
const parapetRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, AC_D + 0.8), acadWhiteMat);
parapetRight.position.set(AC_CX + AC_W / 2, AC_H + 0.95, AC_CZ);
gsv.add(parapetFront, parapetBack, parapetLeft, parapetRight);

// Mid-level horizontal white stringcourses
const beltCourse1 = new THREE.Mesh(new THREE.BoxGeometry(AC_W + 0.5, 0.3, AC_D + 0.5), acadWhiteMat);
beltCourse1.position.set(AC_CX, 4.5, AC_CZ);
const beltCourse2 = new THREE.Mesh(new THREE.BoxGeometry(AC_W + 0.5, 0.3, AC_D + 0.5), acadWhiteMat);
beltCourse2.position.set(AC_CX, 9.0, AC_CZ);
gsv.add(beltCourse1, beltCourse2);

// ---- 4. Four Projecting Corner Towers with Heritage Domed Chhatris (Pavilions)
const cornerCoords = [
  [-AC_W / 2, AC_D / 2],   // Front-Left (SW)
  [AC_W / 2, AC_D / 2],    // Front-Right (SE)
  [-AC_W / 2, -AC_D / 2],  // Rear-Left (NW)
  [AC_W / 2, -AC_D / 2]    // Rear-Right (NE)
];

cornerCoords.forEach(([ox, oz]) => {
  const tx = AC_CX + ox;
  const tz = AC_CZ + oz;
  const tower = new THREE.Group();
  tower.position.set(tx, 0, tz);

  // Tower shaft (6.2m x 6.2m)
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(6.4, AC_H + 1.8, 6.4), acadSandstoneMat);
  shaft.position.y = (AC_H + 1.8) / 2;
  shaft.castShadow = shaft.receiveShadow = true;
  tower.add(shaft);

  // Corner white quoins / pilasters
  const quoinGeo = new THREE.BoxGeometry(6.7, 0.35, 6.7);
  for (let qy = 1.0; qy < AC_H + 1.6; qy += 1.6) {
    const qm = new THREE.Mesh(quoinGeo, acadWhiteMat);
    qm.position.y = qy;
    tower.add(qm);
  }

  // Decorative circular medallion (oculus) on upper tower level
  const oculusGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.18, 16);
  oculusGeo.rotateX(Math.PI / 2);
  const oculus = new THREE.Mesh(oculusGeo, acadWhiteMat);
  oculus.position.set(0, AC_H - 1.0, (oz > 0 ? 3.3 : -3.3));
  tower.add(oculus);

  // Tower entablature cornice at roof level
  const tCornice = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.5, 7.0), acadWhiteMat);
  tCornice.position.y = AC_H + 2.0;
  tCornice.castShadow = true;
  tower.add(tCornice);

  // Tower parapet
  const tParapet = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.65, 6.6), acadWhiteMat);
  tParapet.position.y = AC_H + 2.5;
  tower.add(tParapet);

  // ---- Open Chhatri (Pavilion)
  const chhatriY = AC_H + 2.8;
  const colRad = 0.25;
  const colH = 2.6;
  const colOffset = 1.9;
  const colGeo = new THREE.CylinderGeometry(colRad, colRad, colH, 12);

  // 4 classical white pillars
  [[-colOffset, -colOffset], [colOffset, -colOffset], [-colOffset, colOffset], [colOffset, colOffset]].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(colGeo, acadWhiteMat);
    col.position.set(cx, chhatriY + colH / 2, cz);
    col.castShadow = true;
    tower.add(col);
  });

  // Chhatri roof cornice canopy
  const chhatriRoof = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.4, 5.6), acadWhiteMat);
  chhatriRoof.position.y = chhatriY + colH + 0.2;
  chhatriRoof.castShadow = true;
  tower.add(chhatriRoof);

  // Heritage domed cupola
  const domeRadius = 2.0;
  const cupola = new THREE.Mesh(
    new THREE.SphereGeometry(domeRadius, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    acadSandstoneMat
  );
  cupola.position.y = chhatriY + colH + 0.35;
  cupola.castShadow = true;
  tower.add(cupola);

  // Golden finial spire
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.1, 8), acadGoldMat);
  finial.position.y = cupola.position.y + domeRadius + 0.55;
  tower.add(finial);

  gsv.add(tower);
});

// ---- 5. Grand Central Entrance Portico (Porte-Cochère)
// Projects forward towards campus road: width 20m, depth 7.5m, height 8.5m
const portico = new THREE.Group();
const porticoW = 20.0;
const porticoD = 7.5;
const porticoH = 8.5;
const porticoZ = AC_CZ + AC_D / 2 + porticoD / 2; // -129.25 (Front edge at Y = 89.5)
portico.position.set(AC_CX, 0, porticoZ);

// Portico plinth
const portPlinth = new THREE.Mesh(new THREE.BoxGeometry(porticoW + 0.6, 0.5, porticoD + 0.6), acadWhiteMat);
portPlinth.position.y = 0.25;
portico.add(portPlinth);

// Portico ground structure with triple monumental archway
// 6 Classical White Columns along front edge
const portColGeo = new THREE.CylinderGeometry(0.5, 0.55, 4.2, 14);
const colXOffsets = [-8.5, -5.2, -1.8, 1.8, 5.2, 8.5];
colXOffsets.forEach((cx) => {
  const col = new THREE.Mesh(portColGeo, acadWhiteMat);
  col.position.set(cx, 0.5 + 2.1, porticoD / 2 - 0.55);
  col.castShadow = true;
  portico.add(col);
});

// Side return columns
[-porticoW / 2 + 0.55, porticoW / 2 - 0.55].forEach((sx) => {
  const sc = new THREE.Mesh(portColGeo, acadWhiteMat);
  sc.position.set(sx, 0.5 + 2.1, 0);
  portico.add(sc);
});

// Front Archway Lintels & Molded Arches
const archEntablature = new THREE.Mesh(new THREE.BoxGeometry(porticoW + 0.3, 0.9, porticoD + 0.3), acadWhiteMat);
archEntablature.position.y = 5.0;
archEntablature.castShadow = true;
portico.add(archEntablature);

// First Floor Hall over portico
const portUpper = new THREE.Mesh(new THREE.BoxGeometry(porticoW, 3.4, porticoD), acadSandstoneMat);
portUpper.position.y = 5.4 + 1.7;
portUpper.castShadow = portUpper.receiveShadow = true;
portico.add(portUpper);

// First Floor Front Windows & Pilasters
const portUpperTrim = new THREE.Mesh(new THREE.BoxGeometry(porticoW + 0.3, 0.5, porticoD + 0.3), acadWhiteMat);
portUpperTrim.position.y = porticoH + 0.25;
portico.add(portUpperTrim);

// Open Rooftop Terrace with Classical White Balustrade
const balustradeTerrace = new THREE.Mesh(new THREE.BoxGeometry(porticoW, 0.8, porticoD), new THREE.MeshLambertMaterial({ color: 0xdcd3c4 }));
balustradeTerrace.position.y = porticoH + 0.5;
portico.add(balustradeTerrace);

const balFront = new THREE.Mesh(new THREE.BoxGeometry(porticoW + 0.2, 0.85, 0.35), acadWhiteMat);
balFront.position.set(0, porticoH + 0.85, porticoD / 2);
const balSideL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.85, porticoD), acadWhiteMat);
balSideL.position.set(-porticoW / 2, porticoH + 0.85, 0);
const balSideR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.85, porticoD), acadWhiteMat);
balSideR.position.set(porticoW / 2, porticoH + 0.85, 0);
portico.add(balFront, balSideL, balSideR);

// Front pediment accent on portico terrace
const pediment = new THREE.Mesh(new THREE.BoxGeometry(8.0, 1.3, 0.5), acadWhiteMat);
pediment.position.set(0, porticoH + 1.4, porticoD / 2);
portico.add(pediment);

// ---- Official Gati Shakti Vishwavidyalaya Name Board with Blue Background and White Text & Logo
const nameboardLoader = new THREE.TextureLoader();
const nameTex = nameboardLoader.load('assets/gsv-nameboard-blue.png');
nameTex.encoding = THREE.sRGBEncoding;
if (typeof renderer !== 'undefined' && renderer.capabilities) {
  nameTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
}

// 1024 x 195 aspect ratio: 5.25 : 1
const boardW = 18.0;
const boardH = 3.43;
const plaqueFrame = new THREE.Mesh(new THREE.BoxGeometry(boardW + 0.6, boardH + 0.5, 0.35), acadWhiteMat);
plaqueFrame.position.set(0, 6.2, porticoD / 2 + 0.12);
const plaquePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(boardW, boardH),
  new THREE.MeshBasicMaterial({ map: nameTex })
);
plaquePlane.position.set(0, 6.2, porticoD / 2 + 0.32);
portico.add(plaqueFrame, plaquePlane);

gsv.add(portico);

// ---- 6. Monumental Central Heritage Dome & Drum (Crowning Entrance Axis)
const domeGroup = new THREE.Group();
const domeZ = AC_CZ + AC_D / 2 - 3.5;
domeGroup.position.set(AC_CX, AC_H, domeZ);

// Tier 1: Stately White & Sandstone Pedestal Base
const domeBase = new THREE.Mesh(new THREE.BoxGeometry(11.5, 1.8, 11.5), acadWhiteMat);
domeBase.position.y = 0.9;
domeBase.castShadow = true;
domeGroup.add(domeBase);

const domeBaseCornice = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.4, 12.4), acadWhiteMat);
domeBaseCornice.position.y = 2.0;
domeGroup.add(domeBaseCornice);

// Tier 2: Cylindrical Drum with 12 Arched Windows
const drumRadius = 4.8;
const drumH = 3.2;
const drum = new THREE.Mesh(
  new THREE.CylinderGeometry(drumRadius, drumRadius, drumH, 28),
  acadWhiteMat
);
drum.position.y = 2.0 + drumH / 2;
drum.castShadow = true;
domeGroup.add(drum);

// Arched clerestory window panels around drum
const drumWindowGeo = new THREE.BoxGeometry(1.2, 1.8, 0.25);
for (let i = 0; i < 12; i++) {
  const ang = (i * Math.PI * 2) / 12;
  const dw = new THREE.Mesh(drumWindowGeo, acadDarkMat);
  dw.position.set(
    Math.sin(ang) * (drumRadius + 0.04),
    drum.position.y,
    Math.cos(ang) * (drumRadius + 0.04)
  );
  dw.rotation.y = ang;
  domeGroup.add(dw);
}

// Drum upper cornice
const drumCornice = new THREE.Mesh(
  new THREE.CylinderGeometry(drumRadius + 0.55, drumRadius + 0.55, 0.4, 28),
  acadWhiteMat
);
drumCornice.position.y = 2.0 + drumH + 0.2;
domeGroup.add(drumCornice);

// Tier 3: Grand Heritage Ribbed Dome
const mainDomeRad = 5.0;
const mainDome = new THREE.Mesh(
  new THREE.SphereGeometry(mainDomeRad, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  new THREE.MeshLambertMaterial({ color: 0xf4eee2 })
);
mainDome.position.y = drumCornice.position.y + 0.2;
mainDome.castShadow = true;
domeGroup.add(mainDome);

// 8 Classical Architectural Ribs on the dome surface
for (let r = 0; r < 8; r++) {
  const ribCurve = new THREE.EllipseCurve(0, 0, mainDomeRad + 0.06, mainDomeRad + 0.06, 0, Math.PI / 2, false, 0);
  const ribPts = ribCurve.getPoints(14).map(p => new THREE.Vector3(p.x, p.y, 0));
  const ribGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribPts), 12, 0.1, 6, false);
  const rib = new THREE.Mesh(ribGeo, acadWhiteMat);
  rib.position.y = mainDome.position.y;
  rib.rotation.y = (r * Math.PI) / 4;
  domeGroup.add(rib);
}

// Tier 4: Grand Golden Kalash & Finial Spire
const finialBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 1.0, 14), acadGoldMat);
finialBase.position.y = mainDome.position.y + mainDomeRad + 0.5;
const finialBall = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 10), acadGoldMat);
finialBall.position.y = finialBase.position.y + 0.75;
const finialSpire = new THREE.Mesh(new THREE.ConeGeometry(0.28, 2.5, 10), acadGoldMat);
finialSpire.position.y = finialBall.position.y + 1.45;
domeGroup.add(finialBase, finialBall, finialSpire);

gsv.add(domeGroup);

// ---- 7. Central Roof Atrium & Vaulted Glass Skylight
const atriumGroup = new THREE.Group();
const atriumZ = AC_CZ - 2.5;
atriumGroup.position.set(AC_CX, AC_H, atriumZ);

// Raised white perimeter curb around atrium
const curbW = 23.0;
const curbD = 17.0;
const curbH = 1.0;
const curbFront = new THREE.Mesh(new THREE.BoxGeometry(curbW, curbH, 0.5), acadWhiteMat);
curbFront.position.set(0, curbH / 2, curbD / 2);
const curbBack = new THREE.Mesh(new THREE.BoxGeometry(curbW, curbH, 0.5), acadWhiteMat);
curbBack.position.set(0, curbH / 2, -curbD / 2);
const curbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, curbH, curbD), acadWhiteMat);
curbLeft.position.set(-curbW / 2, curbH / 2, 0);
const curbRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, curbH, curbD), acadWhiteMat);
curbRight.position.set(curbW / 2, curbH / 2, 0);
atriumGroup.add(curbFront, curbBack, curbLeft, curbRight);

// Vaulted Glass Skylight
const vaultSpan = curbD - 1.6;
const vaultLen = curbW - 1.6;
const vaultRad = vaultSpan / 2;
const vaultGeo = new THREE.CylinderGeometry(vaultRad, vaultRad, vaultLen, 20, 1, false, 0, Math.PI);
vaultGeo.rotateZ(Math.PI / 2);
vaultGeo.rotateY(Math.PI / 2);
const vaultMesh = new THREE.Mesh(vaultGeo, acadGlassMat);
vaultMesh.position.y = curbH + 0.1;
atriumGroup.add(vaultMesh);

// 6 White Structural Arched Steel Ribs across the barrel vault
for (let ribIdx = 0; ribIdx < 6; ribIdx++) {
  const rx = -vaultLen / 2 + (ribIdx * vaultLen) / 5;
  const archRibGeo = new THREE.TorusGeometry(vaultRad, 0.11, 8, 20, Math.PI);
  archRibGeo.rotateY(Math.PI / 2);
  const archRib = new THREE.Mesh(archRibGeo, acadWhiteMat);
  archRib.position.set(rx, curbH + 0.1, 0);
  atriumGroup.add(archRib);
}

gsv.add(atriumGroup);

// ---- 8. Grand Arched Portals on Center of Side Elevations
[-AC_W / 2 - 0.2, AC_W / 2 + 0.2].forEach((sx) => {
  const sidePortal = new THREE.Mesh(
    new THREE.PlaneGeometry(9.5, 8.0),
    new THREE.MeshBasicMaterial({ map: acadSidePortalTex, side: THREE.DoubleSide })
  );
  sidePortal.position.set(AC_CX + sx, 4.8, AC_CZ);
  sidePortal.rotation.y = (sx > 0 ? Math.PI / 2 : -Math.PI / 2);
  gsv.add(sidePortal);
});

// ---- 9. Front Landscaping Promenade (COMPACT & STRICTLY NORTH OF THE ROAD)
// Sits cleanly in the 22m forecourt between portico front (Y = 89.5) and road curb (Y = 112.65).
// Garden ends at Y = 105, leaving a full 7.6m buffer before the road, so the road NEVER crosses it!
const frontPark = new THREE.Group();
const parkCenterZ = AC_CZ + AC_D / 2 + porticoD + 7.5; // Y = 98 (in world space)
frontPark.position.set(AC_CX, 0.05, parkCenterZ);

// Main Sandstone Paved Promenade Plaza (Leading from portico to sidewalk)
const avenue = new THREE.Mesh(
  new THREE.BoxGeometry(12.0, 0.08, 15.0),
  new THREE.MeshLambertMaterial({ color: 0xe0d9cb })
);
frontPark.add(avenue);

// Sandstone ceremonial circular inlay in center plaza
const plazaCircle = new THREE.Mesh(
  new THREE.CylinderGeometry(4.2, 4.2, 0.1, 24),
  new THREE.MeshLambertMaterial({ color: 0xd6cbb8 })
);
plazaCircle.position.set(0, 0.05, 0);
frontPark.add(plazaCircle);

// Symmetrical Manicured Green Lawn Parterres (Compact size: 9.5m width x 11.0m depth)
// Spans Y = 92.5 to Y = 103.5. Road is at Y = 118. Complete 14.5m separation from road centerline!
const lawnGeo = new THREE.BoxGeometry(9.5, 0.16, 11.0);
const lawnMat = new THREE.MeshLambertMaterial({ color: 0x3d7037 });
const hedgeMat = new THREE.MeshLambertMaterial({ color: 0x1e4219 });

[-11.2, 11.2].forEach((lx) => {
  // Green grass lawn
  const lawn = new THREE.Mesh(lawnGeo, lawnMat);
  lawn.position.set(lx, 0.08, 0);
  lawn.receiveShadow = true;
  frontPark.add(lawn);

  // Dark manicured boxwood border hedge
  const hedgeBorder = new THREE.Mesh(new THREE.BoxGeometry(10.1, 0.38, 11.6), hedgeMat);
  hedgeBorder.position.set(lx, 0.18, 0);
  frontPark.add(hedgeBorder);

  // Decorative circular center floral bed inside each lawn
  const flowerBed = new THREE.Mesh(
    new THREE.CylinderGeometry(2.0, 2.0, 0.22, 18),
    new THREE.MeshLambertMaterial({ color: 0x2e5927 })
  );
  flowerBed.position.set(lx, 0.2, 0);
  frontPark.add(flowerBed);

  // Stately Royal Palm Trees neatly flanking the central promenade inside the lawn
  // Spaced along Z = -3.6, 0, 3.6 (map Y = 94.4, 98.0, 101.6) — all strictly north of the road!
  [-3.6, 0, 3.6].forEach((pz) => {
    const palm = new THREE.Group();
    palm.position.set(lx > 0 ? 5.2 : -5.2, 0, pz);

    // Slender textured palm trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.28, 5.8, 8),
      new THREE.MeshLambertMaterial({ color: 0x7c6d5c })
    );
    trunk.position.y = 2.9;
    trunk.castShadow = true;
    palm.add(trunk);

    // Crown of graceful palm fronds
    const crownMat = new THREE.MeshLambertMaterial({ color: 0x2e6628, side: THREE.DoubleSide });
    for (let f = 0; f < 8; f++) {
      const fAngle = (f * Math.PI) / 4;
      const frondCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 5.7, 0),
        new THREE.Vector3(Math.cos(fAngle) * 2.0, 6.0, Math.sin(fAngle) * 2.0),
        new THREE.Vector3(Math.cos(fAngle) * 3.0, 4.6, Math.sin(fAngle) * 3.0)
      );
      const frondGeo = new THREE.TubeGeometry(frondCurve, 8, 0.13, 4, false);
      const frond = new THREE.Mesh(frondGeo, crownMat);
      frond.castShadow = true;
      palm.add(frond);
    }

    frontPark.add(palm);
  });
});

gsv.add(frontPark);

scene.add(gsv);
// Manthan building: sandstone, two floors, flat dome, pediment porch with maroon columns
const sandT = tx((g) => {
  g.fillStyle = '#d9baa4';
  g.fillRect(0, 0, 64, 64);
  [6, 38].forEach((x) => {
    g.fillStyle = '#c4a088';
    g.fillRect(x - 3, 8, 22, 40);
    g.beginPath();
    g.arc(x + 8, 14, 11, Math.PI, 0);
    g.fill();
    g.fillStyle = '#fff';
    g.fillRect(x, 16, 16, 28);
    g.fillStyle = '#5f7280';
    g.fillRect(x + 1.5, 17.5, 13, 25);
    g.fillStyle = '#fff';
    g.fillRect(x + 7, 17.5, 2, 25);
  });
  g.fillStyle = '#c9a891';
  g.fillRect(0, 56, 64, 8);
});
const manM = mk(
  [
    [418, 184],
    [452, 184],
    [452, 218],
    [418, 218]
  ],
  11,
  0xcfae98,
  0xc08a6a,
  1.9,
  [],
  [],
  sandT,
  [1 / 12, 1 / 5.5]
);
const msand = new THREE.MeshLambertMaterial({ color: 0xd6b8a1 }),
  maroon = new THREE.MeshLambertMaterial({ color: 0x6b2d2a });
[
  [424, 212],
  [446, 212]
].forEach(([x, z]) => {
  const b = new THREE.Mesh(new THREE.BoxGeometry(9, 2.6, 9), msand);
  b.position.set(x - W / 2, 12.3, z - H / 2);
  manM.add(b);
});
const mdome = new THREE.Mesh(
  new THREE.SphereGeometry(6, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2),
  msand
);
mdome.scale.y = 0.6;
mdome.position.set(435 - W / 2, 11, 206 - H / 2);
mdome.castShadow = true;
manM.add(mdome);
const tri = new THREE.Shape();
tri.moveTo(-8.5, 0);
tri.lineTo(8.5, 0);
tri.lineTo(0, 3.6);
tri.closePath();
const ped = new THREE.Mesh(
  new THREE.ExtrudeGeometry(tri, { depth: 3, bevelEnabled: false }),
  msand
);
ped.position.set(435 - W / 2, 9.6, 183.6 - H / 2);
ped.rotation.y = Math.PI;
ped.castShadow = true;
manM.add(ped);
[430, 433.2, 436.8, 440].forEach((x) => {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 9.6, 10), maroon);
  c.position.set(x - W / 2, 4.8, 181.4 - H / 2);
  manM.add(c);
});
const mdoor = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 5),
  new THREE.MeshBasicMaterial({ color: 0x2a2420 })
);
mdoor.position.set(435 - W / 2, 2.5, 183.94 - H / 2);
mdoor.rotation.y = Math.PI;
manM.add(mdoor);
const mc = document.createElement('canvas');
mc.width = 160;
mc.height = 50;
const mg = mc.getContext('2d');
mg.fillStyle = '#d9baa4';
mg.fillRect(0, 0, 160, 50);
mg.fillStyle = '#8a5a14';
mg.font = '700 34px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
mg.textAlign = 'center';
mg.textBaseline = 'middle';
mg.fillText('मंथन', 80, 27);
const mtx = new THREE.CanvasTexture(mc);
mtx.encoding = THREE.sRGBEncoding;
const msg = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 1.6),
  new THREE.MeshBasicMaterial({ map: mtx })
);
msg.position.set(435 - W / 2, 6.6, 183.92 - H / 2);
msg.rotation.y = Math.PI;
manM.add(msg);
for (let i = 0; i < 3; i++) {
  const s = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.6 * (3 - i), 1.6),
    new THREE.MeshLambertMaterial({ color: 0xc9a891 })
  );
  s.position.set(435 - W / 2, 0.3 * (3 - i), 178.6 - i * 1.6 - H / 2);
  scene.add(s);
}
[
  [8, 4, 0xd1b79a, 0.35],
  [7, 3.2, 0x6aa84f, 0.45]
].forEach(([a, b, col, y]) => {
  const o = new THREE.Mesh(
    new THREE.CircleGeometry(1, 28),
    new THREE.MeshLambertMaterial({ color: col })
  );
  o.scale.set(a, b, 1);
  o.rotation.x = -Math.PI / 2;
  o.position.set(435 - W / 2, y, 170 - H / 2);
  scene.add(o);
});
flat(470, 196, 544, 232, 0.3, 0x7fb069);
flat(455, 324, 535, 365, 0.3, 0x7fb069);
const pth = new THREE.Mesh(
  new THREE.CircleGeometry(7, 24),
  new THREE.MeshLambertMaterial({ color: 0xd8cdb4 })
);
pth.rotation.x = -Math.PI / 2;
pth.position.set(507 - W / 2, 0.45, 214 - H / 2);
scene.add(pth);
const treeAt = (x, z, s) => {
  const tr = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.7, s * 0.9, 5),
    new THREE.MeshLambertMaterial({ color: 0x5a4632 })
  );
  tr.position.set(x - W / 2, s * 0.45, z - H / 2);
  const cr = new THREE.Mesh(
    new THREE.IcosahedronGeometry(s * 0.75, 1),
    new THREE.MeshLambertMaterial({ color: 0x4a8a3a })
  );
  cr.position.set(x - W / 2, s * 1.35, z - H / 2);
  cr.castShadow = true;
  scene.add(tr, cr);
};
[
  [476, 200, 5],
  [484, 226, 4.5],
  [492, 201, 5],
  [522, 228, 5],
  [536, 202, 4.5],
  [538, 226, 5],
  [528, 200, 4],
  [477, 222, 4]
].forEach((a) => treeAt(...a));
[
  [460, 336, 5.5],
  [470, 356, 5],
  [490, 336, 4.5],
  [512, 358, 5.5],
  [528, 336, 5],
  [526, 356, 4.5],
  [462, 342, 4.5],
  [534, 342, 5]
].forEach((a) => treeAt(...a));
for (let i = 0; i < 3; i++) {
  const cx0 = 530 + i * 5.5,
    cz0 = 74 + (i % 2) * 9;
  const tr = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.7, 3, 5),
    new THREE.MeshLambertMaterial({ color: 0x5a4632 })
  );
  tr.position.set(cx0 - W / 2, 1.5, cz0 - H / 2);
  const cr = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3, 1),
    new THREE.MeshLambertMaterial({ color: 0x4a8a3a })
  );
  cr.position.set(cx0 - W / 2, 5.5, cz0 - H / 2);
  scene.add(tr, cr);
}
// ---- ROADS & CAMPUS INFRASTRUCTURE (FAITHFULLY TRACED FROM MASTER PLAN)
// Unified, continuous road network strictly routed around all buildings, parks, and structures.
// Guaranteed zero pass-through for the Oval Ground festival arena, Rajabaug, or any building.
// Connected continuous East-West avenues with zero tree blockages.

const RS = [],
  LP = [],
  MAINSP = [],
  MAINW = [];

const nearRoad = (x, y, p = 0) =>
  RS.some(([a, h]) =>
    a.some((q, i) => {
      if (!i) return false;
      const o = a[i - 1],
        dx = q[0] - o[0],
        dy = q[1] - o[1],
        t = clamp(((x - o[0]) * dx + (y - o[1]) * dy) / (dx * dx + dy * dy || 1));
      return Math.hypot(x - o[0] - t * dx, y - o[1] - t * dy) < h + p;
    })
  );

// Major campus junctions / intersections (center coordinates and clear-zone radius)
const JUNCTIONS = [
  [142, 378, 16], // SW Entrance Hub (Gate, Oval Ring, South Boundary)
  [307, 20, 16],  // North Central Hub (North Boundary, Oval Rings, Palace Arterial)
  [307, 118, 11], // Palace North T-Junction (North Central Cross Avenue)
  [307, 345, 10], // Palace South Hub
  [307, 385, 10], // South Arterial / South Boundary
  [577, 20, 14],  // 9M Eastern Spine North Terminal & Main Gate Approach
  [577, 72, 12],  // 9M Spine / Hostel Link Intersection
  [566, 118, 11], // 9M Spine / North Central Cross Avenue
  [566, 188, 11], // 9M Spine / Proposed Garden North
  [566, 238, 12], // 9M Spine / Academic Block North
  [566, 317, 12], // 9M Spine / Academic Block South
  [566, 415, 12], // 9M Spine South Terminal
  [590, 72, 10],  // Hostel Forecourt North T
  [590, 172, 10], // Hostel Forecourt South T
  [196, 122, 10], // West Rajabaug / Oval North Cross
  [38, 140, 10],  // Oval North Cross West
  [385, 118, 9],  // Palace Rear North
  [380, 310, 9],  // Residential Cross 1
  [412, 310, 9],  // Residential Cross 2
  [380, 395, 10]  // Residential Lane 1 South
];

const isJunction = (x, y) => JUNCTIONS.some(([jx, jy, jr]) => Math.hypot(x - jx, y - jy) < jr);

// Complete road network accurately mapped from the official campus master plan
// Guaranteed zero conflict with Oval Ground festival arena, Rajabaug, or any building
const MASTER_ROADS = [
  // 1. North Boundary Arterial Road (Far north: Y=20, well north of Acad Block Y=38)
  {
    name: 'North Boundary Road',
    pts: [[165, 20], [220, 20], [307, 20], [370, 20], [440, 20], [500, 20], [566, 20], [577, 20]],
    w: 8.5,
    main: true
  },
  // 2. Oval Outer Ring Road (Along western boundary fence - sweeps safely outside Oval ground)
  {
    name: 'Oval Outer Ring Road',
    pts: [[105, 412], [122, 395], [142, 378], [90, 345], [52, 280], [36, 210], [38, 140], [62, 85], [105, 50], [165, 20]],
    w: 9,
    main: true
  },
  // 3. West Rajabaug Perimeter Road (Between Oval ground and Rajabaug: X=196, stays outside Oval arena)
  {
    name: 'West Rajabaug Perimeter Road',
    pts: [[307, 20], [250, 40], [215, 80], [196, 122], [196, 175]],
    w: 8,
    main: true
  },
  // 4. Oval North Cross Connector (North of Rajabaug & Oval arena: Y=122)
  {
    name: 'Oval North Cross Connector',
    pts: [[38, 140], [85, 130], [140, 122], [196, 122]],
    w: 7,
    main: false
  },
  // 5. Central Palace North-South Arterial (In corridor between Rajabaug X=297 and Palace X=316: X = 307)
  {
    name: 'Central Palace North-South Arterial',
    pts: [[307, 20], [307, 50], [307, 118], [307, 160], [307, 232], [307, 285], [307, 345], [307, 385]],
    w: 8,
    main: true
  },
  // 6. North Central Cross Avenue (CONNECTED CONTINUOUSLY from X=307 across to X=566 at Y=118!)
  // Perfectly joins left and right sections with zero tree disconnection!
  {
    name: 'North Central Cross Avenue',
    pts: [[307, 118], [360, 118], [412, 118], [440, 118], [500, 118], [566, 118]],
    w: 7.5,
    main: false
  },
  // 7. Palace East Rear Loop (Between Palace X=362 and Manthan X=417: X = 385)
  {
    name: 'Palace East Rear Loop',
    pts: [[385, 118], [385, 170], [385, 232]],
    w: 6.5,
    main: false
  },
  // 8. Eastern Spine Road (9M Wide Road: East of Atithi X=556, Lab Block X=550, Acad Block X=542, West of NHSRCL X=596: X = 566)
  {
    name: 'Eastern Spine Road (9M)',
    pts: [[577, 10], [577, 20], [577, 46], [577, 72], [572, 95], [566, 118], [566, 188], [566, 238], [566, 317], [566, 370], [566, 415]],
    w: 9,
    main: true
  },
  // 9. Road Between Lab Block and Proposed Garden (Between Lab Block Y=184 and Garden Y=196: Y = 188)
  {
    name: 'Road Between Lab Block and Garden (6M)',
    pts: [[465, 188], [500, 188], [566, 188]],
    w: 6.5,
    main: false
  },
  // 10. Road North of Academic Block / South of Garden (Between Garden Y=232 and Acad Block Y=244: Y = 238)
  {
    name: 'Road North of Academic Block (9M)',
    pts: [[440, 238], [500, 238], [566, 238]],
    w: 6,
    main: false
  },
  // 11. Road South of Academic Block (Between Acad Block Y=310 and Garden South Y=324: Y = 317)
  {
    name: 'Road South of Academic Block (9M)',
    pts: [[440, 238], [440, 317], [500, 317], [566, 317]],
    w: 6.5,
    main: false
  },
  // 12. Hostel East-West Link (North of NHSRCL Hostel Y=75: Y = 72)
  {
    name: 'Hostel East-West Link',
    pts: [[566, 72], [577, 72], [590, 72]],
    w: 7,
    main: false
  },
  // 13. Hostel South Road (South of NHSRCL Hostel Y=165: Y = 172)
  {
    name: 'Hostel South Road',
    pts: [[566, 172], [590, 172], [670, 172]],
    w: 7.5,
    main: false
  },
  // 14. Hostel West Forecourt Lane (West of NHSRCL Hostel X=596: X = 590)
  {
    name: 'Hostel West Forecourt',
    pts: [[590, 72], [590, 172]],
    w: 7,
    main: false
  },
  // 15. South Campus Boundary Road (Along southern perimeter fence - south of Oval ground arena)
  {
    name: 'South Campus Boundary Road',
    pts: [[142, 378], [220, 385], [307, 385], [380, 395], [460, 405], [566, 415]],
    w: 9,
    main: true
  },
  // 16. Residential Street 1 (South of Palace rear to South Boundary Y=395: X = 380)
  {
    name: 'Residential Street 1',
    pts: [[380, 232], [380, 310], [380, 395]],
    w: 6.5,
    main: false
  },
  // 17. Residential Street 2 (South of Palace rear to Y=360: X = 412)
  {
    name: 'Residential Street 2',
    pts: [[412, 232], [412, 310], [412, 360]],
    w: 6,
    main: false
  },
  // 18. Residential Cross Street (At Y = 310 from X=340 to X=438, strictly west of Proposed Garden South X=455)
  {
    name: 'Residential Cross Street',
    pts: [[340, 310], [380, 310], [412, 310], [438, 310]],
    w: 6,
    main: false
  },
  // 19. Southwest Main Campus Gate Approach
  {
    name: 'Southwest Gate Approach',
    pts: [[95, 418], [115, 405], [142, 378]],
    w: 10,
    main: true
  }
];

// Sample smooth curve points for each road path
MASTER_ROADS.forEach(rd => {
  const curve = new THREE.CatmullRomCurve3(
    rd.pts.map(([x, y]) => new THREE.Vector3(x, 0, y)),
    false,
    'centripetal',
    0.35
  );
  const len = curve.getLength();
  const numSteps = Math.max(10, Math.ceil(len / 1.6));
  rd.samples = curve.getSpacedPoints(numSteps).map(p => ({ x: p.x, y: p.z }));

  // Push to RS collision data for nearRoad()
  RS.push([
    rd.samples.map(p => [p.x, p.y]),
    rd.w / 2 + 2.4
  ]);

  // Push to MAINSP for festival car traffic
  if (rd.main) {
    MAINSP.push(
      rd.samples.map(p => new THREE.Vector3(p.x - W / 2, 0.3, p.y - H / 2))
    );
    MAINW.push(rd.w);
  }
});

// Render the high-resolution unified road network canvas
const S_ROAD = 4; // 4x supersampling (3004 x 1720) for crisp sub-meter resolution
const roadCv = document.createElement('canvas');
roadCv.width = W * S_ROAD;
roadCv.height = H * S_ROAD;
const rg = roadCv.getContext('2d');
rg.lineJoin = 'round';
rg.lineCap = 'round';

// PASS 1: Light sandstone beveled sidewalk / curb border
// Round line joins fuse all road intersections seamlessly with zero gaps
rg.strokeStyle = '#d0c6b0';
MASTER_ROADS.forEach(rd => {
  rg.lineWidth = (rd.w + 3.2) * S_ROAD;
  rg.beginPath();
  rd.samples.forEach((p, i) => {
    if (i === 0) rg.moveTo(p.x * S_ROAD, p.y * S_ROAD);
    else rg.lineTo(p.x * S_ROAD, p.y * S_ROAD);
  });
  rg.stroke();
});

// PASS 2: Granite curb bevel edge / subtle shadow groove
rg.strokeStyle = '#857e70';
MASTER_ROADS.forEach(rd => {
  rg.lineWidth = (rd.w + 0.8) * S_ROAD;
  rg.beginPath();
  rd.samples.forEach((p, i) => {
    if (i === 0) rg.moveTo(p.x * S_ROAD, p.y * S_ROAD);
    else rg.lineTo(p.x * S_ROAD, p.y * S_ROAD);
  });
  rg.stroke();
});

// PASS 3: Seamless dark matte asphalt carriageway
// Every road's asphalt fuses into a single unified surface (no overlapping alpha or z-fighting)
rg.strokeStyle = '#32353a';
MASTER_ROADS.forEach(rd => {
  rg.lineWidth = rd.w * S_ROAD;
  rg.beginPath();
  rd.samples.forEach((p, i) => {
    if (i === 0) rg.moveTo(p.x * S_ROAD, p.y * S_ROAD);
    else rg.lineTo(p.x * S_ROAD, p.y * S_ROAD);
  });
  rg.stroke();
});

// PASS 4: Realistic asphalt tire wear tracks & fine aggregate texture
rg.save();
rg.globalCompositeOperation = 'source-atop'; // Restrict wear exclusively to the asphalt

// Subtle dual wheel-wear tracks along main roads
MASTER_ROADS.forEach(rd => {
  if (rd.w < 7.5) return;
  const trackOffset = rd.w * 0.22;
  [-trackOffset, trackOffset].forEach(off => {
    rg.strokeStyle = 'rgba(24, 26, 29, 0.38)';
    rg.lineWidth = 1.6 * S_ROAD;
    rg.beginPath();
    for (let i = 0; i < rd.samples.length; i++) {
      const p = rd.samples[i];
      const prev = rd.samples[Math.max(0, i - 1)];
      const next = rd.samples[Math.min(rd.samples.length - 1, i + 1)];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const px = (p.x + nx * off) * S_ROAD;
      const py = (p.y + ny * off) * S_ROAD;
      if (i === 0) rg.moveTo(px, py);
      else rg.lineTo(px, py);
    }
    rg.stroke();
  });
});
rg.restore();

// PASS 5: Road markings (Solid white shoulder lines & dashed center dividers)
// CRITICAL: Markings strictly pause before intersection zones to prevent criss-crossing
MASTER_ROADS.forEach(rd => {
  if (rd.w < 7.2) return;

  const runs = [];
  let curRun = [];
  rd.samples.forEach(p => {
    if (!isJunction(p.x, p.y)) {
      curRun.push(p);
    } else {
      if (curRun.length >= 4) runs.push(curRun);
      curRun = [];
    }
  });
  if (curRun.length >= 4) runs.push(curRun);

  runs.forEach(run => {
    // A. Crisp outer white shoulder lines
    const edgeOffset = rd.w * 0.44;
    [-edgeOffset, edgeOffset].forEach(off => {
      rg.strokeStyle = 'rgba(242, 240, 232, 0.88)';
      rg.lineWidth = 0.45 * S_ROAD;
      rg.beginPath();
      for (let i = 0; i < run.length; i++) {
        const p = run[i];
        const prev = run[Math.max(0, i - 1)];
        const next = run[Math.min(run.length - 1, i + 1)];
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const px = (p.x + nx * off) * S_ROAD;
        const py = (p.y + ny * off) * S_ROAD;
        if (i === 0) rg.moveTo(px, py);
        else rg.lineTo(px, py);
      }
      rg.stroke();
    });

    // B. Warm yellow/amber dashed center lane dividers
    if (rd.w >= 8.2) {
      rg.save();
      rg.strokeStyle = 'rgba(245, 226, 142, 0.92)';
      rg.lineWidth = 0.52 * S_ROAD;
      rg.setLineDash([8 * S_ROAD, 8 * S_ROAD]);
      rg.beginPath();
      run.forEach((p, i) => {
        if (i === 0) rg.moveTo(p.x * S_ROAD, p.y * S_ROAD);
        else rg.lineTo(p.x * S_ROAD, p.y * S_ROAD);
      });
      rg.stroke();
      rg.restore();
    }
  });
});

// PASS 6: Pedestrian Zebra Crossings at key campus gateways & focal buildings
const ZEBRAS = [
  { x: 307, y: 189, angle: 0, bars: 6 },      // Pratap Vilas Palace Grand Entry
  { x: 307, y: 160, angle: 0, bars: 5 },      // Rajabaug North Promenade Entrance
  { x: 566, y: 238, angle: 0, bars: 6 },      // Academic Block East Entrance
  { x: 566, y: 188, angle: 0, bars: 6 },      // Proposed Garden Entry
  { x: 577, y: 72, angle: 0, bars: 6 },       // Hostel Zone / Main Gate Entry Axis
  { x: 577, y: 36, angle: 0, bars: 6 },       // Main Campus Entrance Gate Pedestrian Crossing
  { x: 135, y: 388, angle: -0.65, bars: 6 }   // Southwest Main Campus Gate Entrance
];

ZEBRAS.forEach(z => {
  rg.save();
  rg.translate(z.x * S_ROAD, z.y * S_ROAD);
  rg.rotate(z.angle);
  const barW = 0.52 * S_ROAD;
  const barL = 3.2 * S_ROAD;
  const spacing = 1.05 * S_ROAD;
  const totalW = (z.bars - 1) * spacing;
  rg.fillStyle = '#ffffff';
  for (let b = 0; b < z.bars; b++) {
    const bx = -totalW / 2 + b * spacing - barW / 2;
    rg.fillRect(bx, -barL / 2, barW, barL);
  }
  rg.restore();
});

// Create 3D road network plane in the campus scene
const roadTex = new THREE.CanvasTexture(roadCv);
roadTex.encoding = THREE.sRGBEncoding;
roadTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

const roadGeo = new THREE.PlaneGeometry(W, H);
const roadMat = new THREE.MeshLambertMaterial({
  map: roadTex,
  transparent: true,
  alphaTest: 0.05,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: -2
});
const roadMesh = new THREE.Mesh(roadGeo, roadMat);
roadMesh.rotation.x = -Math.PI / 2;
roadMesh.position.y = 0.28;
roadMesh.receiveShadow = true;
scene.add(roadMesh);

// PASS 7: Intelligent Streetlamp Placement Along Sidewalk Curbs
// Strictly avoids junctions, building footprints, and Rajabaug garden interior
MASTER_ROADS.forEach(rd => {
  if (rd.w < 7.2) return;
  const lampInterval = rd.main ? 26 : 32;
  let distAccum = 0;
  const curbDist = rd.w / 2 + 1.8;

  for (let i = 1; i < rd.samples.length - 1; i++) {
    const prev = rd.samples[i - 1];
    const p = rd.samples[i];
    distAccum += Math.hypot(p.x - prev.x, p.y - prev.y);

    if (distAccum >= lampInterval) {
      distAccum = 0;

      // Skip if inside or near any intersection
      if (isJunction(p.x, p.y)) continue;

      // Skip if near any building footprint or park
      if (p.x > 214 && p.x < 298 && p.y > 154 && p.y < 224) continue; // Rajabaug
      if (p.x > 316 && p.x < 362 && p.y > 156 && p.y < 222) continue; // Palace
      if (p.x > 318 && p.x < 395 && p.y > 38 && p.y < 92) continue;   // Central Acad Block
      if (p.x > 450 && p.x < 542 && p.y > 243 && p.y < 311) continue; // Proposed Acad Block
      if (p.x > 472 && p.x < 550 && p.y > 132 && p.y < 184) continue; // Lab Block
      if (p.x > 504 && p.x < 556 && p.y > 55 && p.y < 106) continue;  // Atithi
      if (p.x > 596 && p.x < 698 && p.y > 75 && p.y < 165) continue;  // NHSRCL Hostel
      if (p.x > 417 && p.x < 453 && p.y > 183 && p.y < 219) continue; // Manthan
      if (p.x > 470 && p.x < 544 && p.y > 196 && p.y < 232) continue; // Garden North
      if (p.x > 455 && p.x < 535 && p.y > 324 && p.y < 365) continue; // Garden South
      if (p.x > 195 && p.x < 285 && p.y > 230 && p.y < 312) continue; // Oval Ground arena

      const next = rd.samples[i + 1];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      const sides = rd.main ? [1, -1] : [(i % 2 === 0 ? 1 : -1)];
      sides.forEach(sd => {
        const lx = p.x + nx * curbDist * sd;
        const lz = p.y + ny * curbDist * sd;

        if (!isJunction(lx, lz)) {
          const inObj = (
            (lx > 214 && lx < 298 && lz > 154 && lz < 224) ||
            (lx > 316 && lx < 362 && lz > 156 && lz < 222) ||
            (lx > 318 && lx < 395 && lz > 38 && lz < 92) ||
            (lx > 450 && lx < 542 && lz > 243 && lz < 311) ||
            (lx > 472 && lx < 550 && lz > 132 && lz < 184) ||
            (lx > 504 && lx < 556 && lz > 55 && lz < 106) ||
            (lx > 596 && lx < 698 && lz > 75 && lz < 165) ||
            (lx > 417 && lx < 453 && lz > 183 && lz < 219) ||
            (lx > 470 && lx < 544 && lz > 196 && lz < 232) ||
            (lx > 455 && lx < 535 && lz > 324 && lz < 365) ||
            (lx > 195 && lx < 285 && lz > 230 && lz < 312)
          );
          if (!inObj) {
            LP.push([lx, lz, -nx * sd, -ny * sd]);
          }
        }
      });
    }
  }
});

const GLW = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d'),
    r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  [
    [0, 'rgba(255,228,175,1)'],
    [0.16, 'rgba(255,208,135,.6)'],
    [0.42, 'rgba(255,178,95,.18)'],
    [0.72, 'rgba(255,165,80,.04)'],
    [1, 'rgba(255,160,70,0)']
  ].forEach(([o, col]) => r.addColorStop(o, col));
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  return t;
})();
const fadeCone = (r, h, pw = 1.4) => {
  const g = new THREE.ConeGeometry(r, h, 14, 1, true).translate(0, -h / 2, 0),
    p = g.attributes.position,
    c = [];
  for (let i = 0; i < p.count; i++) {
    const k = Math.pow(Math.max(0, 1 + p.getY(i) / h), pw);
    c.push(k, k, k);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  return g;
};
// Remove any streetlamps in Acad Block & forecourt to maintain an open, grand, glare-free vista
for (let i = LP.length - 1; i >= 0; i--) {
  const p = LP[i];
  if (p[0] > 298 && p[0] < 418 && p[1] > 30 && p[1] < 155) {
    LP.splice(i, 1);
  }
}

const mt2 = new THREE.Matrix4(),
  L_lq = new THREE.Quaternion(),
  L_le = new THREE.Euler(),
  L_lv = new V(),
  L_ls = new V(1, 1, 1),
  lamp = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.22, 0.32, 7, 6),
    new THREE.MeshLambertMaterial({ color: 0x555b60 }),
    LP.length
  ),
  larm = new THREE.InstancedMesh(
    new THREE.BoxGeometry(2.4, 0.16, 0.16),
    new THREE.MeshLambertMaterial({ color: 0x555b60 }),
    LP.length
  ),
  lhd = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.4, 0.32, 0.75),
    new THREE.MeshBasicMaterial({ color: 0x8c929a }),
    LP.length
  ),
  lcone = new THREE.InstancedMesh(
    fadeCone(4.4, 6.4, 1.5),
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      color: 0xffc878,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    }),
    LP.length
  ),
  gp = [];
LP.forEach((p, i) => {
  const x = p[0] - W / 2,
    z = p[1] - H / 2;
  L_le.set(0, Math.atan2(-p[3], p[2]), 0);
  L_lq.setFromEuler(L_le);
  mt2.makeTranslation(x, 3.5, z);
  lamp.setMatrixAt(i, mt2);
  L_lv.set(x + p[2] * 1.2, 6.9, z + p[3] * 1.2);
  mt2.compose(L_lv, L_lq, L_ls);
  larm.setMatrixAt(i, mt2);
  L_lv.set(x + p[2] * 2.3, 6.7, z + p[3] * 2.3);
  mt2.compose(L_lv, L_lq, L_ls);
  lhd.setMatrixAt(i, mt2);
  mt2.makeTranslation(L_lv.x, 6.55, L_lv.z);
  lcone.setMatrixAt(i, mt2);
  gp.push(L_lv.x, 6.5, L_lv.z);
});
const lgg = new THREE.BufferGeometry();
lgg.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
const lhalo = new THREE.Points(
  lgg,
  new THREE.PointsMaterial({
    map: GLW,
    size: 13,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
scene.add(lamp, larm, lhd, lcone, lhalo);
// houses
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
// Real building footprints (Overture, registered to the photo). The hand-built landmarks keep their own models, so skip anything inside them.
const HAND = [
  [609, 132, 669, 164],
  [610, 80, 686, 121],
  [506, 56, 555, 105],
  [395, 45, 505, 105], // Sabhagrah & Pahune Hostel (between GSV and Atithi)
  [451, 244, 541, 310],
  [474, 133, 549, 183],
  [322, 158, 360, 220],
  [214, 152, 298, 228],
  [322, 40, 392, 93],
  [418, 184, 452, 218]
];
const FOOT = [];
const hash2 = (x, y) => {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
function addPoly(pts, h, delay, base) {
  const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x - W / 2, -(y - H / 2))));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, [roofMatFor(0x8a847c), litMat(base, [1 / 16, 1 / 9])]);
  m.castShadow = m.receiveShadow = true;
  m.scale.y = RM ? 1 : 0.001;
  scene.add(m);
  blds.push({ m, d: delay });
}
GEO.b.forEach(([gh, ...f]) => {
  const pts = [];
  for (let i = 0; i < f.length; i += 2) pts.push([f[i], f[i + 1]]);
  const xs = pts.map((q) => q[0]),
    ys = pts.map((q) => q[1]),
    cxp = (Math.min(...xs) + Math.max(...xs)) / 2,
    cyp = (Math.min(...ys) + Math.max(...ys)) / 2;
  FOOT.push([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]);
  if (HAND.some((b) => cxp > b[0] - 3 && cxp < b[2] + 3 && cyp > b[1] - 3 && cyp < b[3] + 3)) return;
  const r = hash2(cxp, cyp),
    area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)),
    h = gh === 6 ? 7 + r * 8 + (area > 700 ? 4 : 0) : gh * 0.92;
  // Unnamed generic background buildings removed
  // addPoly(pts, h, 1.2 + (cxp / W) * 1.8 + r * 0.6, r < 0.5 ? wallBase : hostelBase);
});

// ---- trees from the green pixels (with enhanced road clearance & obstacle exclusion)
const inB = (x, y) =>
  nearRoad(x, y, 6.0) ||
  BUILDINGS.some((b) => x > b[0] - 6 && x < b[2] + 6 && y > b[1] - 6 && y < b[3] + 6) ||
  (x > 390 && x < 505 && y > 48 && y < 128) || // Sabhagrah & Pahune Hostel (forecourt & entrance)
  (x > 498 && x < 563 && y > 48 && y < 125) || // Atithi Hostel (entrance & south forecourt)
  (x > 468 && x < 554 && y > 110 && y < 190) || // Proposed Lab (entrance & forecourt)
  (x > 446 && x < 546 && y > 225 && y < 314) || // Proposed Academic
  (x > 290 && x < 378 && y > 146 && y < 232) || // Palace (grand lawn)
  (x > 298 && x < 418 && y > 30 && y < 155) ||  // Central Acad Block Vista & Avenue
  (x > 214 && x < 298 && y > 152 && y < 228) || // Rajabaug Carnival Park
  (x > 412 && x < 458 && y > 164 && y < 236) || // Manthan building (front steps & approach)
  (x > 560 && x < 594 && y > 22 && y < 65) ||   // Main Entrance Gate (approach road)
  (x > 565 && x < 614 && y > 124 && y < 172) || // NHSRCL forecourt & entrance approach
  (x > 290 && x < 575 && y > 106 && y < 130) || // North Central Cross Avenue corridor
  (x > 195 && x < 285 && y > 230 && y < 312);   // Oval Ground Cultural Fest Area
const spots = [];
GEO.t.forEach(([x, y, cd]) => {
  if (x >= W || y >= H || inB(x, y) || FOOT.some((f) => x > f[0] && x < f[2] && y > f[1] && y < f[3])) return;
  const [r, gg, b] = lumAt(x, y);
  spots.push([x, y, r, gg, b, cd]);
});
const hsh = (x, y, z) => {
  const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return v - Math.floor(v);
};
function canopy(L) {
  const pos = [],
    col = [],
    top = Math.max(...L.map((l) => l[1] + l[3]));
  L.forEach(([lx, ly, lz, lr], j) => {
    const g = new THREE.IcosahedronGeometry(lr, 1),
      p = g.attributes.position,
      jb = 0.92 + hsh(j, lx, lz) * 0.16;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const k = 1 + (hsh(x / lr + lx, y / lr + ly, z / lr + lz) - 0.5) * 0.45;
      x *= k;
      y *= k * (y < 0 ? 0.65 : 1);
      z *= k;
      const sh = (0.55 + 0.6 * clamp((ly + y + lr * 0.5) / (top + lr * 0.5))) * jb;
      pos.push(x + lx, y + ly, z + lz);
      col.push(sh, sh, sh * 0.96);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
const geoA = canopy([
  [0, 0, 0, 1],
  [0.8, -0.12, 0.25, 0.7],
  [-0.75, -0.08, 0.3, 0.72],
  [0.1, -0.1, -0.8, 0.7],
  [0.05, 0.62, 0.05, 0.65]
]);
const geoB = canopy([
  [0, 0, 0, 0.78],
  [0, 0.85, 0, 0.64],
  [0, 1.55, 0, 0.44],
  [0.4, 0.25, 0.2, 0.5],
  [-0.35, 0.45, -0.25, 0.5]
]);
const TREES = [],
  TM = [],
  gA = [],
  gB = [];
spots.forEach((s, i) => (hsh(s[0], s[1], 7) < 0.28 ? gB : gA).push(s));
const mt = new THREE.Matrix4(),
  q = new THREE.Quaternion(),
  c = new THREE.Color(),
  eu = new THREE.Euler();
const leafM = new THREE.MeshLambertMaterial({ vertexColors: true }),
  trM = new THREE.MeshLambertMaterial({ color: 0x5a4632 });
const sdw = new THREE.InstancedMesh(
  new THREE.CircleGeometry(1, 14).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.2,
    depthWrite: false
  }),
  spots.length
);
let si = 0;
[
  [gA, geoA, 1],
  [gB, geoB, 1.25]
].forEach(([G, geo, hs]) => {
  const cr = new THREE.InstancedMesh(geo, leafM, G.length),
    tk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.8, 1, 6), trM, G.length);
  G.forEach((s, i) => {
    const sz = (s[5] ? clamp(s[5] * 0.42, 3.4, 8.5) : 3.6 + rnd() * 4.2) * (hs > 1 ? 0.85 : 1),
      th = sz * 1.35,
      sx = sz * (0.9 + rnd() * 0.3),
      sy = sz * (0.85 + rnd() * 0.35) * (hs > 1 ? 1.1 : 1);
    q.setFromEuler(eu.set(0, rnd() * 6.28, 0));
    mt.compose(new V(s[0] - W / 2, th + sy * 0.7, s[1] - H / 2), q, new V(sx, sy, sx));
    cr.setMatrixAt(i, mt);
    c.setRGB((s[2] / 255) * 0.95, Math.min(1, (s[3] / 255) * 1.45), (s[4] / 255) * 0.8);
    c.offsetHSL((rnd() - 0.5) * 0.05, (rnd() - 0.5) * 0.1, 0.02 + (rnd() - 0.5) * 0.06);
    cr.setColorAt(i, c);
    mt.compose(
      new V(s[0] - W / 2, th / 2, s[1] - H / 2),
      q,
      new V(1.2 + sz * 0.1, th, 1.2 + sz * 0.1)
    );
    tk.setMatrixAt(i, mt);
    mt.compose(
      new V(s[0] - W / 2 + sz * 0.35, 0.32, s[1] - H / 2 + sz * 0.3),
      q,
      new V(sx * 1.35, 1, sx * 1.2)
    );
    sdw.setMatrixAt(si++, mt);
    TREES.push({
      x: s[0] - W / 2,
      z: s[1] - H / 2,
      sz,
      th,
      sx,
      sy,
      q: q.clone(),
      cr,
      tk,
      i,
      si: si - 1,
      f: 1,
      fl: 1,
      r: sx * 1.15,
      cy: th + sy * 0.7
    });
  });
  cr.castShadow = tk.castShadow = true;
  cr.frustumCulled = tk.frustumCulled = false;
  TM.push(cr, tk);
  scene.add(cr, tk);
});
sdw.count = si;
sdw.frustumCulled = false;
TM.push(sdw);
scene.add(sdw);

// ---- school pin (invisible anchor node, orange balloon pin removed)
const pin = new THREE.Group();
pin.position.set(357 - W / 2, 28, 83 - H / 2);
scene.add(pin);

// ---- location beacon
const LX = 603 - W / 2,
  LZ = 146 - H / 2;
const rings = [0, 1].map(() => {
  const r = new THREE.Mesh(
    new THREE.RingGeometry(0.92, 1, 64),
    new THREE.MeshBasicMaterial({
      color: 0xff7a1a,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  r.rotation.x = -Math.PI / 2;
  r.position.set(LX, 0.6, LZ);
  r.visible = false;
  scene.add(r);
  return r;
});