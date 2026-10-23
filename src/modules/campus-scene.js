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
// Gati Shakti Vishwavidyalaya (current academic block, the school pin): white building, triple-arched portico, blue sign, dome
const her = tx((g) => {
  g.fillStyle = '#f2eee3';
  g.fillRect(0, 0, 64, 64);
  [6, 38].forEach((x) => {
    g.fillStyle = '#ffffff';
    g.fillRect(x - 2, 10, 20, 40);
    g.fillStyle = '#4c5a66';
    g.fillRect(x, 12, 16, 34);
    g.fillStyle = '#f2eee3';
    g.fillRect(x + 7, 12, 2, 34);
    g.fillRect(x, 24, 16, 2);
  });
  g.fillStyle = '#d9d1bd';
  g.fillRect(0, 56, 64, 8);
});
const arches3 = tx((g) => {
  g.fillStyle = '#f4f1e8';
  g.fillRect(0, 0, 64, 64);
  const ar = (x, w, top) => {
    g.fillStyle = '#5d4e40';
    g.fillRect(x, top + w / 2, w, 64 - top - w / 2 - 5);
    g.beginPath();
    g.arc(x + w / 2, top + w / 2, w / 2, Math.PI, 0);
    g.fill();
  };
  ar(4, 16, 20);
  ar(24, 16, 6);
  ar(44, 16, 20);
  g.fillStyle = '#c9b78f';
  g.fillRect(0, 59, 64, 5);
});
const gsv = mk(
  [
    [322, 40],
    [392, 40],
    [392, 88],
    [322, 88]
  ],
  14,
  0xe9e3d3,
  0x3a5bd0,
  1.5,
  [],
  [],
  her,
  [1 / 10, 1 / 7]
);
const por2 = mk(
  [
    [342, 88],
    [372, 88],
    [372, 93],
    [342, 93]
  ],
  11,
  0xe9e3d3,
  0x3a5bd0,
  1.7,
  [],
  [],
  arches3,
  [1 / 30, 1 / 11]
);
const gc = document.createElement('canvas');
gc.width = 1024;
gc.height = 96;
const gg = gc.getContext('2d');
gg.fillStyle = '#1f3fa8';
gg.fillRect(0, 0, 1024, 96);
gg.fillStyle = '#fff';
gg.textAlign = 'center';
gg.textBaseline = 'middle';
gg.font = '700 52px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
gg.fillText('गति शक्ति विश्वविद्यालय', 270, 50);
gg.font = '700 40px Arial,sans-serif';
gg.fillText('GATI SHAKTI VISHWAVIDYALAYA', 780, 52);
gg.lineWidth = 4;
gg.strokeStyle = '#fff';
gg.beginPath();
gg.arc(512, 48, 24, 0, Math.PI * 2);
gg.stroke();
const gtx = new THREE.CanvasTexture(gc);
gtx.encoding = THREE.sRGBEncoding;
const gbd = new THREE.Mesh(
  new THREE.BoxGeometry(34, 3.2, 0.8),
  new THREE.MeshLambertMaterial({ color: 0x1f3fa8 })
);
gbd.position.set(357 - W / 2, 12.6, 88.9 - H / 2);
por2.add(gbd);
const gsn = new THREE.Mesh(
  new THREE.PlaneGeometry(34, 3.2),
  new THREE.MeshBasicMaterial({ map: gtx })
);
gsn.position.set(357 - W / 2, 12.6, 89.32 - H / 2);
por2.add(gsn);
const cream = new THREE.MeshLambertMaterial({ color: 0xf0ead9 });
const dbase = new THREE.Mesh(new THREE.BoxGeometry(14, 3, 14), cream);
dbase.position.set(357 - W / 2, 15.5, 70 - H / 2);
gsv.add(dbase);
const ddrum = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 2.4, 20), cream);
ddrum.position.set(357 - W / 2, 18.2, 70 - H / 2);
gsv.add(ddrum);
const dd = new THREE.Mesh(
  new THREE.SphereGeometry(5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
  cream
);
dd.position.set(357 - W / 2, 19.4, 70 - H / 2);
dd.castShadow = true;
gsv.add(dd);
const fin = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.4, 8), cream);
fin.position.set(357 - W / 2, 25.6, 70 - H / 2);
gsv.add(fin);
[
  [351, 64],
  [363, 64],
  [351, 76],
  [363, 76]
].forEach(([x, z]) => {
  const pn = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.4, 6), cream);
  pn.position.set(x - W / 2, 18.2, z - H / 2);
  gsv.add(pn);
});
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
flat(455, 318, 535, 365, 0.3, 0x7fb069);
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
// ---- roads & paths (map pixels), traced from the master plan
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
function mkTex(w, h, fn, rep) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  fn(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}
const asphT = mkTex(128, 128, (g) => {
  g.fillStyle = '#43464c';
  g.fillRect(0, 0, 128, 128);
  let q = 11;
  const r = () => (q = (q * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2600; i++) {
    const v = r() < 0.5 ? 'rgba(255,255,255,' : 'rgba(0,0,0,';
    g.fillStyle = v + (0.05 + r() * 0.12) + ')';
    g.fillRect(r() * 128, r() * 128, 1 + r() * 1.6, 1 + r() * 1.6);
  }
  for (let i = 0; i < 5; i++) {
    g.strokeStyle = 'rgba(20,20,22,.35)';
    g.lineWidth = 0.8;
    g.beginPath();
    let x = r() * 128,
      y = r() * 128;
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      x += r() * 14 - 7;
      y += r() * 14 - 7;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  for (let i = 0; i < 4; i++) {
    g.fillStyle = 'rgba(0,0,0,.08)';
    g.fillRect(r() * 100, r() * 100, 10 + r() * 24, 8 + r() * 18);
  }
});
const pavT = mkTex(64, 64, (g) => {
  g.fillStyle = '#d9cfb8';
  g.fillRect(0, 0, 64, 64);
  g.strokeStyle = 'rgba(120,105,80,.55)';
  g.lineWidth = 1.2;
  for (let i = 0; i <= 64; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 64);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(64, i);
    g.stroke();
  }
});
function strip(sp, w, off, y, col, k, dash, map, opa, sc) {
  const pos = [],
    idx = [],
    uv = [],
    N = sp.length;
  let d = 0;
  sp.forEach((p, i) => {
    const a = sp[Math.max(0, i - 1)],
      b = sp[Math.min(N - 1, i + 1)],
      l = Math.hypot(b.x - a.x, b.z - a.z) || 1,
      nx = -(b.z - a.z) / l,
      nz = (b.x - a.x) / l,
      h = w / 2;
    if (i) d += Math.hypot(p.x - sp[i - 1].x, p.z - sp[i - 1].z);
    pos.push(
      p.x + nx * (off + h),
      y,
      p.z + nz * (off + h),
      p.x + nx * (off - h),
      y,
      p.z + nz * (off - h)
    );
    uv.push(0, d / (sc || w), 1, d / (sc || w));
  });
  for (let i = 0; i < N - 1; i++)
    if (!dash || i % 2 == 0) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(
    g,
    new THREE.MeshLambertMaterial({
      color: col,
      map: map || null,
      side: THREE.DoubleSide,
      transparent: opa != null,
      opacity: opa == null ? 1 : opa,
      depthWrite: opa == null,
      polygonOffset: true,
      polygonOffsetFactor: -k,
      polygonOffsetUnits: -k
    })
  );
  m.receiveShadow = true;
  scene.add(m);
}
function wall(sp, off, y0, y1, col) {
  const pos = [],
    idx = [],
    N = sp.length;
  sp.forEach((p, i) => {
    const a = sp[Math.max(0, i - 1)],
      b = sp[Math.min(N - 1, i + 1)],
      l = Math.hypot(b.x - a.x, b.z - a.z) || 1,
      x = p.x - ((b.z - a.z) / l) * off,
      z = p.z + ((b.x - a.x) / l) * off;
    pos.push(x, y0, z, x, y1, z);
  });
  for (let i = 0; i < N - 1; i++)
    idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(
    g,
    new THREE.MeshLambertMaterial({ color: col, side: THREE.DoubleSide })
  );
  m.receiveShadow = true;
  scene.add(m);
}
function road(P, w, kind) {
  const c = new THREE.CatmullRomCurve3(
    P.map(([x, y]) => new V(x - W / 2, 0, y - H / 2)),
    false,
    kind == 'm' ? 'catmullrom' : 'centripetal',
    0.4
  );
  const sp = c.getSpacedPoints(Math.ceil(c.getLength() / 3));
  RS.push([
    sp.map((p) => [p.x + W / 2, p.z + H / 2]),
    kind == 'r' ? w / 2 + 3 : kind == 'm' ? w / 2 : w / 2 + 1
  ]);
  if (kind == 'r' && w >= 10) {
    MAINSP.push(sp);
    MAINW.push(w);
  }
  if (kind == 'r') {
    if (w >= 10) {
      strip(sp, w + 5, 0, 0.22, 0xcfc8b6, 1);
      [1, -1].forEach((s) => {
        strip(sp, 1.2, s * (w / 2 + 0.6), 0.62, 0xcbc5b5, 5);
        wall(sp, s * (w / 2 + 0.05), 0.3, 0.62, 0xa9a392);
      });
    }
    strip(sp, w, 0, 0.3, 0xffffff, 2, false, asphT);
    [1, -1].forEach((s) => {
      strip(sp, w * 0.2, s * w * 0.2, 0.33, 0x000000, 3, false, null, 0.12);
      strip(sp, 1, s * (w / 2 - 0.5), 0.34, 0x8c7f68, 3, false, null, 0.28);
    });
  }
  if (kind == 'm') strip(sp, w, 0, 0.45, 0xffffff, 2, false, asphT);
  if (kind == 'p') {
    strip(sp, w + 1.4, 0, 0.28, 0xb0a58c, 1);
    strip(sp, w, 0, 0.34, 0xffffff, 2, false, pavT, null, w);
  }
  if (kind != 'p') {
    const yy = kind == 'm' ? 0.52 : 0.38;
    if (w >= 9) [1, -1].forEach((s) => strip(sp, 0.45, s * (w / 2 - 1.3), yy, 0xe9e7dc, 4));
    strip(sp, 0.55, 0, yy, 0xeadf9c, 4, true);
  }
  if (kind != 'p') {
    const big = w >= 10,
      sides0 = big || kind == 'm';
    for (let i = 4, s = 1; i < sp.length - 2; i += big ? 8 : 10, s = -s) {
      const a = sp[i - 1],
        b = sp[i + 1],
        l = Math.hypot(b.x - a.x, b.z - a.z) || 1,
        nx = -(b.z - a.z) / l,
        nz = (b.x - a.x) / l,
        o = w / 2 + (big ? 3.2 : 2.4);
      (sides0 ? [1, -1] : [s]).forEach((sd) =>
        LP.push([sp[i].x + nx * o * sd + W / 2, sp[i].z + nz * o * sd + H / 2, -nx * sd, -nz * sd])
      );
    }
  }
}
const zb = (x, y, ns, n) => {
  for (let i = -n; i <= n; i++)
    ns
      ? flat(x + i * 1.7 - 0.45, y - 2.2, x + i * 1.7 + 0.45, y + 2.2, 0.44, 0xf4f4f4)
      : flat(x - 2.2, y + i * 1.7 - 0.45, x + 2.2, y + i * 1.7 + 0.45, 0.44, 0xf4f4f4);
};
// campus roads & paths traced from the Google Maps road overlay (registered to this photo)
const NET = [
  [
    [292, 383],
    [301, 383]
  ],
  [
    [303, 340],
    [250, 338],
    [246, 329]
  ],
  [
    [373, 392],
    [316, 388],
    [301, 383]
  ],
  [
    [112, 42],
    [133, 45],
    [153, 57]
  ],
  [
    [321, 72],
    [312, 70],
    [299, 80]
  ],
  [
    [388, 405],
    [379, 403],
    [373, 392]
  ],
  [
    [388, 405],
    [393, 399],
    [396, 337],
    [400, 318]
  ],
  [
    [140, 175],
    [136, 120]
  ],
  [
    [204, 329],
    [157, 254],
    [147, 235]
  ],
  [
    [6, 430],
    [3, 409]
  ],
  [
    [374, 107],
    [306, 102]
  ],
  [
    [6, 430],
    [21, 427]
  ],
  [
    [6, 430],
    [3, 444]
  ],
  [
    [400, 318],
    [400, 277],
    [388, 273]
  ],
  [
    [543, 119],
    [483, 115],
    [477, 118]
  ],
  [
    [428, 166],
    [420, 168]
  ],
  [
    [371, 156],
    [375, 160]
  ],
  [
    [371, 156],
    [376, 162]
  ],
  [
    [371, 156],
    [376, 162]
  ],
  [
    [378, 318],
    [382, 286],
    [388, 273]
  ],
  [
    [386, 237],
    [369, 228]
  ],
  [
    [306, 102],
    [299, 80]
  ],
  [
    [184, 353],
    [218, 378],
    [280, 384],
    [292, 383]
  ],
  [
    [373, 392],
    [378, 318]
  ],
  [
    [374, 107],
    [376, 79]
  ],
  [
    [306, 102],
    [303, 132]
  ],
  [
    [308, 314],
    [310, 270],
    [304, 261]
  ],
  [
    [204, 329],
    [216, 334]
  ],
  [
    [308, 314],
    [378, 318]
  ],
  [
    [472, 155],
    [477, 118]
  ],
  [
    [308, 314],
    [303, 340]
  ],
  [
    [299, 80],
    [289, 73],
    [282, 58],
    [268, 54],
    [153, 57]
  ],
  [
    [321, 224],
    [306, 237]
  ],
  [
    [303, 132],
    [136, 120]
  ],
  [
    [303, 132],
    [304, 148]
  ],
  [
    [246, 329],
    [216, 334]
  ],
  [
    [246, 329],
    [281, 291],
    [294, 268],
    [304, 261]
  ],
  [
    [304, 261],
    [306, 237]
  ],
  [
    [321, 224],
    [369, 228]
  ],
  [
    [298, 226],
    [306, 237]
  ],
  [
    [376, 162],
    [372, 168],
    [369, 228]
  ],
  [
    [386, 237],
    [384, 266],
    [388, 273]
  ],
  [
    [430, 241],
    [414, 238],
    [386, 237]
  ],
  [
    [371, 156],
    [374, 107]
  ],
  [
    [420, 168],
    [376, 162]
  ],
  [
    [136, 120],
    [136, 97],
    [153, 57]
  ],
  [
    [303, 340],
    [301, 383]
  ],
  [
    [400, 318],
    [425, 318]
  ],
  [
    [295, 142],
    [298, 228]
  ],
  [
    [135, 170],
    [142, 228]
  ]
];
NET.forEach((p) => road(p, 7, 'r'));
road(
  [
    [0, 77],
    [50, 211],
    [125, 430]
  ],
  15,
  'r'
);
road(
  [
    [0, 0],
    [164, 11],
    [314, 22],
    [465, 32],
    [603, 41],
    [701, 48]
  ],
  12,
  'r'
);
road(
  [
    [577, 41],
    [568, 94],
    [564, 169],
    [557, 253],
    [552, 320],
    [550, 378],
    [552, 430]
  ],
  10,
  'r'
);
// markings only on the existing asphalt (fly route, hostel 6M road, forecourt)
road(
  [
    [350, 98],
    [372, 106],
    [410, 109],
    [480, 109],
    [540, 109],
    [562, 118],
    [554, 138],
    [554, 175]
  ],
  9,
  'm'
);
road(
  [
    [582, 126],
    [640, 126],
    [692, 126]
  ],
  11,
  'm'
);
road(
  [
    [599, 80],
    [599, 120]
  ],
  10,
  'm'
);
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
  addPoly(pts, h, 1.2 + (cxp / W) * 1.8 + r * 0.6, r < 0.5 ? wallBase : hostelBase);
});

// ---- trees from the green pixels
const inB = (x, y) =>
  nearRoad(x, y, 2) ||
  BUILDINGS.some((b) => x > b[0] - 6 && x < b[2] + 6 && y > b[1] - 6 && y < b[3] + 6) ||
  (x > 390 && x < 505 && y > 48 && y < 128) || // Sabhagrah & Pahune Hostel (forecourt & entrance)
  (x > 498 && x < 563 && y > 48 && y < 125) || // Atithi Hostel (entrance & south forecourt)
  (x > 468 && x < 554 && y > 110 && y < 190) || // Proposed Lab (entrance & forecourt)
  (x > 446 && x < 546 && y > 225 && y < 314) || // Proposed Academic
  (x > 290 && x < 378 && y > 146 && y < 232) || // Palace (grand lawn)
  (x > 316 && x < 398 && y > 34 && y < 114) || // GSV Academic Block (entrance portico & avenue)
  (x > 412 && x < 458 && y > 164 && y < 236) || // Manthan building (front steps & approach)
  (x > 560 && x < 594 && y > 22 && y < 65) || // Main Entrance Gate (approach road)
  (x > 565 && x < 614 && y > 124 && y < 172); // NHSRCL forecourt & entrance approach
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

// ---- school pin
const pin = new THREE.Group();
const body = new THREE.MeshLambertMaterial({ color: 0xff7a1a, emissive: 0x9a3a00 });
const cone = new THREE.Mesh(new THREE.ConeGeometry(5, 12, 16), body);
cone.rotation.x = Math.PI;
cone.position.y = 6;
const ball = new THREE.Mesh(new THREE.SphereGeometry(7, 20, 20), body);
ball.position.y = 17;
const dot = new THREE.Mesh(
  new THREE.SphereGeometry(3.2, 12, 12),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
dot.position.set(0, 17, 5.4);
pin.add(cone, ball, dot);
pin.position.set(357 - W / 2, 22, 70 - H / 2);
pin.castShadow = true;
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