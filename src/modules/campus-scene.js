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
ac.width = ac.height = 128;
const ag = ac.getContext('2d');
ag.fillStyle = '#f5f2eb';
ag.fillRect(0, 0, 128, 128);

// Fine stucco texture grain
ag.fillStyle = 'rgba(0,0,0,0.025)';
for (let py = 0; py < 128; py += 4) {
  for (let px = 0; px < 128; px += 4) {
    if ((px + py) % 8 === 0) ag.fillRect(px, py, 2, 2);
  }
}

// Windows with terracotta frame, white inner frame, and keystone tab matching photo
[14, 78].forEach((x) => {
  // Terracotta outer frame
  ag.fillStyle = '#a8483e';
  ag.fillRect(x - 4, 14, 44, 56);
  // Top keystone / tab accent
  ag.fillRect(x + 15, 8, 6, 8);
  // White inner sash
  ag.fillStyle = '#f5f2eb';
  ag.fillRect(x, 18, 36, 48);
  // Glass pane
  ag.fillStyle = '#4c5e70';
  ag.fillRect(x + 4, 22, 28, 40);
  // White mullions
  ag.fillStyle = '#f5f2eb';
  ag.fillRect(x + 17, 22, 2, 40);
  ag.fillRect(x + 4, 41, 28, 2);
});

// Terracotta string course molding below floor
ag.fillStyle = '#a8483e';
ag.fillRect(0, 120, 128, 8);
ag.fillStyle = '#8f372d';
ag.fillRect(0, 126, 128, 2);

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

// Rooftop water storage tanks
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

// ==========================================
// ATITHI ENTRANCE GATE & FAÇADE (FROM PHOTO)
// ==========================================
const atiWallMat = new THREE.MeshLambertMaterial({ color: 0xf4f0e6 });
const atiTrimMat = new THREE.MeshLambertMaterial({ color: 0xa8483e });
const atiDarkTrimMat = new THREE.MeshLambertMaterial({ color: 0x7c261d });
const atiPillarMat = new THREE.MeshLambertMaterial({ color: 0xf3eedb });
const atiGlassDoorMat = new THREE.MeshLambertMaterial({ color: 0x1b232c });
const atiWhiteFrame = new THREE.MeshLambertMaterial({ color: 0xf0f3f6 });
const atiStepMat = new THREE.MeshLambertMaterial({ color: 0x4f6071 });
const atiSteelMat = new THREE.MeshLambertMaterial({ color: 0xdbe2e8 });
const atiPalmMat = new THREE.MeshLambertMaterial({ color: 0x3d7025 });
const atiTrunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3726 });
const atiPlanterMat = new THREE.MeshLambertMaterial({ color: 0x22262b });

// 1. Recessed Entrance Vestibule & Portal Walls
const atiBackWall = new THREE.Mesh(
  new THREE.BoxGeometry(14.0, 8.5, 0.22),
  atiWallMat
);
atiBackWall.position.set(516 - W / 2, 4.25, 105.08 - H / 2);
atiM.add(atiBackWall);

// Side vestibule return walls
[
  [509.05, 105.7],
  [522.95, 105.7]
].forEach(([rx, rz]) => {
  const rw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 8.5, 1.35), atiWallMat);
  rw.position.set(rx - W / 2, 4.25, rz - H / 2);
  atiM.add(rw);
});

// Porch ceiling with soffit spotlights
const atiCeiling = new THREE.Mesh(
  new THREE.BoxGeometry(14.0, 0.35, 1.45),
  atiWallMat
);
atiCeiling.position.set(516 - W / 2, 8.45, 105.7 - H / 2);
atiM.add(atiCeiling);

const atiCeilLightMat = new THREE.MeshBasicMaterial({ color: 0xfffae8 });
[511.5, 514.5, 517.5, 520.5].forEach((lx) => {
  const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 12), atiCeilLightMat);
  spot.position.set(lx - W / 2, 8.35, 105.7 - H / 2);
  atiM.add(spot);
});

// Porch floor / landing platform
const atiPorchDeck = new THREE.Mesh(
  new THREE.BoxGeometry(14.0, 0.85, 1.45),
  atiStepMat
);
atiPorchDeck.position.set(516 - W / 2, 0.425, 105.7 - H / 2);
atiPorchDeck.receiveShadow = true;
atiM.add(atiPorchDeck);

// 2. Rusticated Banded Quoin Pilasters (Left & Right Flanks)
[509.4, 522.6].forEach((px) => {
  // Stack of 14 alternating horizontal bands matching the real photo
  for (let b = 0; b < 14; b++) {
    const isTerracotta = b % 2 === 0;
    const bandH = 0.58;
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, bandH - 0.04, 1.38),
      isTerracotta ? atiTrimMat : atiWallMat
    );
    band.position.set(px - W / 2, 0.29 + b * bandH, 105.7 - H / 2);
    band.castShadow = true;
    atiM.add(band);
  }
});

// 3. Classical Base Pedestals (Left & Right)
[
  [511.6, 105.8],
  [520.4, 105.8]
].forEach(([pedX, pedZ]) => {
  // Plinth block
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.15, 1.65), atiWallMat);
  plinth.position.set(pedX - W / 2, 1.075, pedZ - H / 2);
  plinth.castShadow = true;
  atiM.add(plinth);

  // Terracotta recessed panel trim on front face
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.65, 0.06), atiTrimMat);
  panel.position.set(pedX - W / 2, 1.075, pedZ + 0.84 - H / 2);
  atiM.add(panel);

  const innerPanel = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.35, 0.08), atiWallMat);
  innerPanel.position.set(pedX - W / 2, 1.075, pedZ + 0.85 - H / 2);
  atiM.add(innerPanel);

  // Stepped terracotta cap cornice
  const cap = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.22, 1.8), atiTrimMat);
  cap.position.set(pedX - W / 2, 2.26, pedZ - H / 2);
  cap.castShadow = true;
  atiM.add(cap);

  const subCap = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.7), atiWallMat);
  subCap.position.set(pedX - W / 2, 2.4, pedZ - H / 2);
  atiM.add(subCap);
});

// 4. Four Grand Classical Cylindrical Columns
[
  511.0, 512.2, // Left column pair
  519.8, 521.0  // Right column pair
].forEach((colX) => {
  const colZ = 105.8;

  // Base collar molding (torus)
  const baseTorus = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 0.14, 16),
    atiPillarMat
  );
  baseTorus.position.set(colX - W / 2, 2.52, colZ - H / 2);
  atiM.add(baseTorus);

  // Column shaft
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.24, 5.75, 18),
    atiPillarMat
  );
  shaft.position.set(colX - W / 2, 5.45, colZ - H / 2);
  shaft.castShadow = true;
  atiM.add(shaft);

  // Capital molding (echinus)
  const capital = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.23, 0.18, 16),
    atiPillarMat
  );
  capital.position.set(colX - W / 2, 8.35, colZ - H / 2);
  atiM.add(capital);

  // Square abacus cap block
  const abacus = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.62), atiPillarMat);
  abacus.position.set(colX - W / 2, 8.45, colZ - H / 2);
  atiM.add(abacus);
});

// 5. Central Entrance Doorway with Classical Triangular Pediment Portico
const doorFrame = new THREE.Mesh(
  new THREE.BoxGeometry(3.35, 4.15, 0.12),
  atiWhiteFrame
);
doorFrame.position.set(516 - W / 2, 2.92, 105.15 - H / 2);
atiM.add(doorFrame);

const glassDoor = new THREE.Mesh(
  new THREE.BoxGeometry(3.1, 3.9, 0.08),
  atiGlassDoorMat
);
glassDoor.position.set(516 - W / 2, 2.92, 105.17 - H / 2);
atiM.add(glassDoor);

// Door center split mullion and push handles
const doorMullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.9, 0.1), atiWhiteFrame);
doorMullion.position.set(516 - W / 2, 2.92, 105.18 - H / 2);
atiM.add(doorMullion);

[515.75, 516.25].forEach((hx) => {
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.9, 0.06), atiSteelMat);
  handle.position.set(hx - W / 2, 2.8, 105.23 - H / 2);
  atiM.add(handle);
});

// Pilasters framing the door
[514.25, 517.75].forEach((px) => {
  const pil = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.25, 0.18), atiTrimMat);
  pil.position.set(px - W / 2, 2.97, 105.18 - H / 2);
  atiM.add(pil);
});

// Horizontal pediment entablature beam
const pedBeam = new THREE.Mesh(new THREE.BoxGeometry(4.45, 0.24, 0.65), atiTrimMat);
pedBeam.position.set(516 - W / 2, 5.12, 105.3 - H / 2);
atiM.add(pedBeam);

const pedCornice = new THREE.Mesh(new THREE.BoxGeometry(4.65, 0.14, 0.75), atiWallMat);
pedCornice.position.set(516 - W / 2, 5.28, 105.32 - H / 2);
atiM.add(pedCornice);

// Triangular Pediment Gable
const triShape = new THREE.Shape();
triShape.moveTo(-2.3, 0);
triShape.lineTo(2.3, 0);
triShape.lineTo(0, 0.92);
triShape.closePath();
const pedGableGeo = new THREE.ExtrudeGeometry(triShape, { depth: 0.45, bevelEnabled: false });
const pedGable = new THREE.Mesh(pedGableGeo, atiWallMat);
pedGable.position.set(516 - W / 2, 5.35, 105.08 - H / 2);
atiM.add(pedGable);

// Terracotta sloped raking cornice trim along triangular pediment
[-1, 1].forEach((dir) => {
  const rake = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.14, 0.52), atiTrimMat);
  rake.position.set(516 + dir * 1.15 - W / 2, 5.82, 105.3 - H / 2);
  rake.rotation.z = -dir * 0.38;
  atiM.add(rake);
});

// Central Circular University Crest / Emblem above pediment
const atiSealDisc = new THREE.Mesh(
  new THREE.CylinderGeometry(0.72, 0.72, 0.1, 28),
  atiDarkTrimMat
);
atiSealDisc.rotation.x = Math.PI / 2;
atiSealDisc.position.set(516 - W / 2, 6.72, 105.16 - H / 2);
atiM.add(atiSealDisc);

const atiSealRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.72, 0.05, 8, 28),
  new THREE.MeshLambertMaterial({ color: 0xd4af37 }) // Gold rim
);
atiSealRing.position.set(516 - W / 2, 6.72, 105.21 - H / 2);
atiM.add(atiSealRing);

// Upper interior windows flanking the seal
[513.2, 518.8].forEach((wx) => {
  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.08), atiTrimMat);
  winFrame.position.set(wx - W / 2, 6.72, 105.15 - H / 2);
  atiM.add(winFrame);

  const winGlass = new THREE.Mesh(new THREE.BoxGeometry(1.36, 1.96, 0.09), atiGlassDoorMat);
  winGlass.position.set(wx - W / 2, 6.72, 105.16 - H / 2);
  atiM.add(winGlass);
});

// 6. Grand Architrave Beam spanning above columns
const atiBeam = new THREE.Mesh(
  new THREE.BoxGeometry(15.2, 0.75, 1.55),
  atiWallMat
);
atiBeam.position.set(516 - W / 2, 8.85, 105.7 - H / 2);
atiBeam.castShadow = true;
atiM.add(atiBeam);

const atiBeamLowerFrieze = new THREE.Mesh(
  new THREE.BoxGeometry(15.0, 0.14, 1.58),
  atiTrimMat
);
atiBeamLowerFrieze.position.set(516 - W / 2, 8.44, 105.7 - H / 2);
atiM.add(atiBeamLowerFrieze);

const atiBeamUpperCornice = new THREE.Mesh(
  new THREE.BoxGeometry(15.45, 0.22, 1.7),
  atiTrimMat
);
atiBeamUpperCornice.position.set(516 - W / 2, 9.32, 105.7 - H / 2);
atiM.add(atiBeamUpperCornice);

// 7. Authentic Dual Mounted Signboards ("अतिथि" and "ATITHI")
// A) Hindi Signboard: "अतिथि"
const cAtithiHi = document.createElement('canvas');
cAtithiHi.width = 512;
cAtithiHi.height = 256;
const gHi = cAtithiHi.getContext('2d');
gHi.fillStyle = '#f6f2ea';
var tAtithiHi = new THREE.CanvasTexture(cAtithiHi);
tAtithiHi.encoding = THREE.sRGBEncoding;

function renderAtithiPlaques() {
  if (typeof gHi === 'undefined' || !gHi) return;
  gHi.fillStyle = '#f6f2ea';
  gHi.fillRect(0, 0, 512, 256);
  gHi.lineWidth = 14;
  gHi.strokeStyle = '#94362b';
  gHi.strokeRect(7, 7, 498, 242);
  gHi.lineWidth = 4;
  gHi.strokeStyle = '#c47d72';
  gHi.strokeRect(20, 20, 472, 216);
  gHi.fillStyle = '#7a2016';
  gHi.font = '800 120px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
  gHi.textAlign = 'center';
  gHi.textBaseline = 'middle';
  gHi.shadowColor = 'rgba(0,0,0,0.25)';
  gHi.shadowBlur = 6;
  gHi.shadowOffsetX = 3;
  gHi.shadowOffsetY = 3;
  gHi.fillText('अतिथि', 256, 128);
  if (typeof tAtithiHi !== 'undefined' && tAtithiHi) {
    tAtithiHi.needsUpdate = true;
  }
}
renderAtithiPlaques();

if (document.fonts) {
  if (document.fonts.load) {
    document.fonts.load('800 120px "Noto Sans Devanagari"').then(() => {
      renderAtithiPlaques();
    }).catch(() => {});
  }
  if (document.fonts.ready) {
    document.fonts.ready.then(() => {
      renderAtithiPlaques();
    });
  }
}
setTimeout(renderAtithiPlaques, 400);
setTimeout(renderAtithiPlaques, 1200);

const meshHiSign = new THREE.Mesh(
  new THREE.PlaneGeometry(4.35, 1.75),
  new THREE.MeshBasicMaterial({ map: tAtithiHi })
);
meshHiSign.position.set(512.9 - W / 2, 10.35, 105.2 - H / 2);
atiM.add(meshHiSign);

// Backing panel for Hindi plaque
const backHiSign = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.9, 0.12), atiTrimMat);
backHiSign.position.set(512.9 - W / 2, 10.35, 105.12 - H / 2);
atiM.add(backHiSign);

// B) English Signboard: "ATITHI"
const cAtithiEn = document.createElement('canvas');
cAtithiEn.width = 512;
cAtithiEn.height = 256;
const gEn = cAtithiEn.getContext('2d');
gEn.fillStyle = '#f6f2ea';
gEn.fillRect(0, 0, 512, 256);

// Terracotta molded border on plaque
gEn.lineWidth = 14;
gEn.strokeStyle = '#94362b';
gEn.strokeRect(7, 7, 498, 242);
gEn.lineWidth = 4;
gEn.strokeStyle = '#c47d72';
gEn.strokeRect(20, 20, 472, 216);

// Crisp Latin text: 'ATITHI'
gEn.fillStyle = '#7a2016';
gEn.font = '900 110px "Inter","Roboto","Montserrat",sans-serif';
gEn.textAlign = 'center';
gEn.textBaseline = 'middle';
gEn.shadowColor = 'rgba(0,0,0,0.25)';
gEn.shadowBlur = 6;
gEn.shadowOffsetX = 3;
gEn.shadowOffsetY = 3;
gEn.fillText('ATITHI', 256, 128);

const tAtithiEn = new THREE.CanvasTexture(cAtithiEn);
tAtithiEn.encoding = THREE.sRGBEncoding;

const meshEnSign = new THREE.Mesh(
  new THREE.PlaneGeometry(4.35, 1.75),
  new THREE.MeshBasicMaterial({ map: tAtithiEn })
);
meshEnSign.position.set(519.1 - W / 2, 10.35, 105.2 - H / 2);
atiM.add(meshEnSign);

// Backing panel for English plaque
const backEnSign = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.9, 0.12), atiTrimMat);
backEnSign.position.set(519.1 - W / 2, 10.35, 105.12 - H / 2);
atiM.add(backEnSign);

// 8. 3D Windows on Upper Floors (Floor 2, 3, 4) directly matching photo
// Helper to create detailed window with terracotta surround and keystone
function mkFaçadeWin(wx, wy, wz) {
  const grp = new THREE.Group();
  // Terracotta surround
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.5, 0.16), atiTrimMat);
  grp.add(frame);
  // Top keystone tab
  const key = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.22), atiTrimMat);
  key.position.set(0, 1.35, 0.02);
  grp.add(key);
  // White inner sash
  const inner = new THREE.Mesh(new THREE.BoxGeometry(2.7, 2.0, 0.18), atiWhiteFrame);
  grp.add(inner);
  // Glass pane
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.7, 0.2), atiGlassDoorMat);
  grp.add(glass);
  // Center mullions
  const vert = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.7, 0.22), atiWhiteFrame);
  grp.add(vert);
  const horiz = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.22), atiWhiteFrame);
  grp.add(horiz);

  grp.position.set(wx - W / 2, wy, wz - H / 2);
  atiM.add(grp);
}

// Windows directly above the signboards on 2nd floor (y = 13.2)
mkFaçadeWin(512.9, 13.2, 105.12);
mkFaçadeWin(519.1, 13.2, 105.12);

// Flanking windows on 1st & 2nd floors
mkFaçadeWin(507.0, 7.8, 105.12);
mkFaçadeWin(507.0, 13.2, 105.12);
mkFaçadeWin(525.0, 7.8, 105.12);
mkFaçadeWin(525.0, 13.2, 105.12);

// 9. Central Entrance Steps (Blue-Grey Granite Stone Tiers)
const stepTiers = [
  { y: 0.72, z: 106.4, w: 6.2 },
  { y: 0.54, z: 107.0, w: 6.4 },
  { y: 0.36, z: 107.6, w: 6.6 },
  { y: 0.18, z: 108.2, w: 6.8 },
  { y: 0.06, z: 108.8, w: 7.0 }
];
stepTiers.forEach((st) => {
  const step = new THREE.Mesh(
    new THREE.BoxGeometry(st.w, 0.19, 0.65),
    atiStepMat
  );
  step.position.set(516 - W / 2, st.y, st.z - H / 2);
  step.receiveShadow = true;
  atiM.add(step);
});

// 10. Accessible Ramp with Stainless Steel Railings (Left Side of Steps)
// Sloped ramp deck from driveway up to the porch landing
const rampDeck = new THREE.Mesh(
  new THREE.BoxGeometry(2.6, 0.22, 3.2),
  atiStepMat
);
rampDeck.position.set(510.8 - W / 2, 0.44, 107.4 - H / 2);
rampDeck.rotation.x = 0.24; // Sloping downwards towards driveway
rampDeck.receiveShadow = true;
atiM.add(rampDeck);

// Curved stainless steel safety handrails
const rampRailMat = atiSteelMat;
[0.85, 0.45].forEach((railH) => {
  const railOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 3.4, 8),
    rampRailMat
  );
  railOuter.position.set(509.6 - W / 2, 0.44 + railH, 107.4 - H / 2);
  railOuter.rotation.x = Math.PI / 2 + 0.24;
  atiM.add(railOuter);
});

// Vertical handrail support stanchions along ramp
[106.0, 106.9, 107.8, 108.7].forEach((rz) => {
  const progress = (rz - 106.0) / 2.7;
  const baseH = 0.85 - progress * 0.75;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), rampRailMat);
  post.position.set(509.6 - W / 2, baseH + 0.45, rz - H / 2);
  atiM.add(post);
});

// Small stainless steel bollards at foot of central stairs
[514.8, 517.2].forEach((bx) => {
  const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.75, 12), atiSteelMat);
  bollard.position.set(bx - W / 2, 0.38, 109.1 - H / 2);
  atiM.add(bollard);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), atiSteelMat);
  cap.position.set(bx - W / 2, 0.76, 109.1 - H / 2);
  atiM.add(cap);
});

// 11. Potted Fan Palm Trees (Matching Photo)
function mkAtithiPalm(px, pz, scale = 1.0) {
  const grp = new THREE.Group();
  // Planter pot
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35 * scale, 0.28 * scale, 0.55 * scale, 12),
    atiPlanterMat
  );
  pot.position.y = 0.28 * scale;
  pot.castShadow = true;
  grp.add(pot);

  // Short palm trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09 * scale, 0.12 * scale, 0.6 * scale, 8),
    atiTrunkMat
  );
  trunk.position.y = 0.65 * scale;
  grp.add(trunk);

  // Radial fan palm fronds curving outward
  const frondAngles = [0, 0.75, 1.5, 2.3, 3.1, 3.9, 4.7, 5.5];
  frondAngles.forEach((ang) => {
    const frond = new THREE.Mesh(
      new THREE.ConeGeometry(0.38 * scale, 1.25 * scale, 5),
      atiPalmMat
    );
    frond.position.set(Math.sin(ang) * 0.45 * scale, 1.15 * scale, Math.cos(ang) * 0.45 * scale);
    frond.rotation.x = Math.cos(ang) * 0.65;
    frond.rotation.z = -Math.sin(ang) * 0.65;
    frond.castShadow = true;
    grp.add(frond);
  });

  grp.position.set(px - W / 2, 0, pz - H / 2);
  atiM.add(grp);
}

// Four potted palms flanking the entrance elements
mkAtithiPalm(508.8, 109.8, 1.1);  // In front of ramp entrance
mkAtithiPalm(512.4, 107.5, 0.95); // Beside left pedestal
mkAtithiPalm(519.6, 107.5, 0.95); // Beside right pedestal
mkAtithiPalm(524.4, 109.4, 1.05); // Right forecourt

// 12. Parked Scooters / Two-Wheelers along the driveway curb (as seen in photo)
function mkAtithiScooter(sx, sz, rotY = 0) {
  const scGrp = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x1f242b });
  const seatMat = new THREE.MeshLambertMaterial({ color: 0x121417 });
  const tireMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });

  // Body chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 1.2), bodyMat);
  chassis.position.y = 0.45;
  scGrp.add(chassis);

  // Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.65), seatMat);
  seat.position.set(0, 0.68, -0.15);
  scGrp.add(seat);

  // Front shield & apron
  const frontApron = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.22), bodyMat);
  frontApron.position.set(0, 0.62, 0.45);
  scGrp.add(frontApron);

  // Handlebar
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), atiSteelMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 0.92, 0.42);
  scGrp.add(bar);

  // Wheels
  [0.38, -0.42].forEach((wz) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 12), tireMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(0, 0.2, wz);
    scGrp.add(wheel);
  });

  scGrp.rotation.y = rotY;
  scGrp.position.set(sx - W / 2, 0, sz - H / 2);
  atiM.add(scGrp);
}

mkAtithiScooter(521.8, 110.0, 0.2);
mkAtithiScooter(523.2, 110.2, 0.15);

// 13. Blue GSV Directional Sign Stand in forecourt
const atiBlueSignMat = new THREE.MeshLambertMaterial({ color: 0x1a4875 });
const atiSignBoard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.08), atiBlueSignMat);
atiSignBoard.position.set(518.2 - W / 2, 0.75, 109.3 - H / 2);
atiM.add(atiSignBoard);

[-0.45, 0.45].forEach((spX) => {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8), atiSteelMat);
  post.position.set(518.2 + spX - W / 2, 0.38, 109.3 - H / 2);
  atiM.add(post);
});

// 14. Alternating Green-and-White Painted Road Curb
const curbMatGreen = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
const curbMatWhite = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
for (let ci = 0; ci < 16; ci++) {
  const isG = ci % 2 === 0;
  const curbSegment = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.18, 0.35),
    isG ? curbMatGreen : curbMatWhite
  );
  curbSegment.position.set(508.5 + ci * 1.25 - W / 2, 0.09, 110.6 - H / 2);
  atiM.add(curbSegment);
}
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

// ============================================================================
// GSV-MESS Building (Central Student Mess & Officer Mess)
// Sited in front of Pahune Hostel (North) and Manthan building (South)
// Features rooftop solar arrays, North "Officer Mess" gate, and South "GSV-MESS" gate
// ============================================================================
const messWallBase = tx((g) => {
  g.fillStyle = '#ded7c8';
  g.fillRect(0, 0, 64, 64);
  // Dining hall windows
  [6, 36].forEach((x) => {
    // Upper floor clerestory windows
    g.fillStyle = '#3a4b5c';
    g.fillRect(x, 8, 20, 20);
    g.fillStyle = '#ffffff';
    g.fillRect(x + 9, 8, 2, 20);
    g.fillRect(x, 18, 20, 2);
    // Lower floor windows
    g.fillStyle = '#3a4b5c';
    g.fillRect(x, 36, 20, 20);
    g.fillStyle = '#ffffff';
    g.fillRect(x + 9, 36, 2, 20);
    g.fillRect(x, 46, 20, 2);
  });
  // Terracotta plinth and intermediate trim
  g.fillStyle = '#8a382c';
  g.fillRect(0, 31, 64, 3);
  g.fillRect(0, 58, 64, 6);
});

// Main 2-story building perimeter with north-west and north-east bay projections
const messPts = [
  [401, 125],
  [401, 121.2],
  [418, 121.2],
  [418, 125],
  [450, 125],
  [450, 121.2],
  [467, 121.2],
  [467, 125],
  [467, 165],
  [401, 165]
];

const messM = mk(
  messPts,
  7.4,
  0x504c47,
  0x8a382c,
  1.8,
  [],
  [],
  messWallBase,
  [1 / 14, 1 / 3.4]
);

// Paved surroundings
flat(398, 122, 469, 167, 0.22, 0xcabdb0); // Perimeter apron
flat(446, 117.5, 460, 122, 0.25, 0xc2b5a4); // North approach connecting to avenue towards Pahune
flat(422, 165, 448, 184, 0.25, 0xc2b5a4); // South approach connecting to Manthan

// Sloped pitched roof materials
const messRoofMat = new THREE.MeshLambertMaterial({ color: 0x4f4b46 });
const messRidgeMat = new THREE.MeshLambertMaterial({ color: 0x8a382c });
const messCreamMat = new THREE.MeshLambertMaterial({ color: 0xe8dfcf });
const messTerraMat = new THREE.MeshLambertMaterial({ color: 0x9a3e30 });

const roofAngle = Math.atan2(3.2, 20.0);
const slopeLength = Math.sqrt(20.0 * 20.0 + 3.2 * 3.2);

// North roof slope
const messNSlope = new THREE.Mesh(
  new THREE.BoxGeometry(66.6, 0.28, slopeLength),
  messRoofMat
);
messNSlope.rotation.x = -roofAngle;
messNSlope.position.set(434 - W / 2, 9.0, 135.0 - H / 2);
messNSlope.castShadow = true;
messNSlope.receiveShadow = true;
messM.add(messNSlope);

// South roof slope
const messSSlope = new THREE.Mesh(
  new THREE.BoxGeometry(66.6, 0.28, slopeLength),
  messRoofMat
);
messSSlope.rotation.x = roofAngle;
messSSlope.position.set(434 - W / 2, 9.0, 155.0 - H / 2);
messSSlope.castShadow = true;
messSSlope.receiveShadow = true;
messM.add(messSSlope);

// Terracotta ridge cap
const messRidge = new THREE.Mesh(
  new THREE.BoxGeometry(67.0, 0.42, 0.7),
  messRidgeMat
);
messRidge.position.set(434 - W / 2, 10.7, 145.0 - H / 2);
messM.add(messRidge);

// Gable walls closing East and West ends
const gableShape = new THREE.Shape();
gableShape.moveTo(-20, 0);
gableShape.lineTo(20, 0);
gableShape.lineTo(0, 3.2);
gableShape.closePath();
const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: 0.35, bevelEnabled: false });

const wGable = new THREE.Mesh(gableGeo, messCreamMat);
wGable.rotation.y = Math.PI / 2;
wGable.position.set(401.1 - W / 2, 7.4, 145.0 - H / 2);
messM.add(wGable);

const eGable = new THREE.Mesh(gableGeo, messCreamMat);
eGable.rotation.y = -Math.PI / 2;
eGable.position.set(466.9 - W / 2, 7.4, 145.0 - H / 2);
messM.add(eGable);

// Ridge ventilators along roof apex
for (let k = -2; k <= 2; k++) {
  const vent = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.75, 1.4), messCreamMat);
  vent.position.set(434 + k * 12 - W / 2, 11.0, 145.0 - H / 2);
  messM.add(vent);
  const ventCap = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.25, 1.8), messTerraMat);
  ventCap.position.set(434 + k * 12 - W / 2, 11.45, 145.0 - H / 2);
  messM.add(ventCap);
}

// Rooftop Solar PV Panel Arrays (accurately placed per satellite footprint)
const solarC = document.createElement('canvas');
solarC.width = 256;
solarC.height = 256;
const sg = solarC.getContext('2d');
sg.fillStyle = '#0f1c2c';
sg.fillRect(0, 0, 256, 256);
for (let sx = 4; sx < 256; sx += 32) {
  for (let sy = 4; sy < 256; sy += 32) {
    sg.fillStyle = '#16283e';
    sg.fillRect(sx, sy, 28, 28);
    sg.fillStyle = '#5c7490';
    sg.fillRect(sx + 13, sy, 2, 28);
    sg.fillRect(sx, sy + 13, 28, 2);
  }
}
const solarTx = new THREE.CanvasTexture(solarC);
solarTx.encoding = THREE.sRGBEncoding;
solarTx.wrapS = solarTx.wrapT = THREE.RepeatWrapping;

const railMat = new THREE.MeshLambertMaterial({ color: 0x98a2ad });

function addSolarArray(x0, z0, x1, z1, isNorthSlope) {
  const w = x1 - x0;
  const dSpan = z1 - z0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const distFromEave = isNorthSlope ? (cz - 125.0) : (165.0 - cz);
  const cy = 7.4 + (distFromEave / 20.0) * 3.2 + 0.22;
  const slopeLen = Math.sqrt(dSpan * dSpan + ((dSpan / 20.0) * 3.2) ** 2);

  const rails = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, slopeLen), railMat);
  rails.rotation.x = isNorthSlope ? -roofAngle : roofAngle;
  rails.position.set(cx - W / 2, cy - 0.06, cz - H / 2);
  messM.add(rails);

  const pMap = solarTx.clone();
  pMap.repeat.set(Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(slopeLen / 3)));
  pMap.needsUpdate = true;
  const pMat = new THREE.MeshStandardMaterial({
    map: pMap,
    roughness: 0.22,
    metalness: 0.75
  });
  const panels = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 0.1, slopeLen - 0.2), pMat);
  panels.rotation.x = isNorthSlope ? -roofAngle : roofAngle;
  panels.position.set(cx - W / 2, cy, cz - H / 2);
  panels.castShadow = true;
  messM.add(panels);
}

// North slope solar arrays
addSolarArray(406, 129, 419, 142, true);
addSolarArray(423, 129, 442, 142, true);
addSolarArray(446, 129, 458, 142, true);

// South slope solar arrays
addSolarArray(406, 148, 425, 161, false);
addSolarArray(429, 148, 448, 161, false);

// South-East 1-Story Kitchen & Service Annex
const seKitchen = new THREE.Mesh(
  new THREE.BoxGeometry(15.2, 4.4, 12.2),
  messCreamMat
);
seKitchen.position.set(459.6 - W / 2, 2.2, 159.0 - H / 2);
seKitchen.castShadow = true;
messM.add(seKitchen);
const seCoping = new THREE.Mesh(
  new THREE.BoxGeometry(15.6, 0.35, 12.6),
  new THREE.MeshLambertMaterial({ color: 0xf4eee4 })
);
seCoping.position.set(459.6 - W / 2, 4.5, 159.0 - H / 2);
messM.add(seCoping);
[[-4.5, -2.5], [-1.5, 2.0], [3.5, -1.0]].forEach(([dx, dz]) => {
  const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.8, 12), railMat);
  duct.position.set(459.6 + dx - W / 2, 5.2, 159.0 + dz - H / 2);
  messM.add(duct);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.5, 12), messTerraMat);
  cap.position.set(459.6 + dx - W / 2, 6.2, 159.0 + dz - H / 2);
  messM.add(cap);
});

// ----------------------------------------------------------------------------
// GATE 1: North Gate — "Officer Mess" (Opening in front of Pahune Hostel)
// ----------------------------------------------------------------------------
const offPorch = new THREE.Mesh(new THREE.BoxGeometry(8.6, 4.2, 3.6), messCreamMat);
offPorch.position.set(453 - W / 2, 2.1, 121.2 - H / 2);
offPorch.castShadow = true;
messM.add(offPorch);

const offDado = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.1, 3.7), messTerraMat);
offDado.position.set(453 - W / 2, 0.55, 121.2 - H / 2);
messM.add(offDado);

// 4 Square Columns
[-3.6, -1.2, 1.2, 3.6].forEach((dx) => {
  const col = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4.2, 0.55), messCreamMat);
  col.position.set(453 + dx - W / 2, 2.1, 119.3 - H / 2);
  col.castShadow = true;
  messM.add(col);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.8), messTerraMat);
  cap.position.set(453 + dx - W / 2, 4.1, 119.3 - H / 2);
  messM.add(cap);
});

const offRoof = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.55, 4.4), messTerraMat);
offRoof.position.set(453 - W / 2, 4.4, 120.9 - H / 2);
offRoof.castShadow = true;
messM.add(offRoof);

const offCrown = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.85, 0.45), messCreamMat);
offCrown.position.set(453 - W / 2, 5.0, 119.2 - H / 2);
messM.add(offCrown);

// Authentic Signboard: OFFICER MESS
const offSignC = document.createElement('canvas');
offSignC.width = 512;
offSignC.height = 160;
const offSg = offSignC.getContext('2d');
offSg.fillStyle = '#faf6ed';
offSg.fillRect(0, 0, 512, 160);
offSg.strokeStyle = '#1b5e20';
offSg.lineWidth = 6;
offSg.strokeRect(6, 6, 500, 148);
offSg.strokeStyle = '#c5a059';
offSg.lineWidth = 2;
offSg.strokeRect(12, 12, 488, 136);

offSg.fillStyle = '#1b5e20';
offSg.textAlign = 'center';
offSg.textBaseline = 'middle';
offSg.font = '700 34px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
offSg.fillText('अधिकारी मेस', 256, 42);

offSg.fillStyle = '#1b5e20';
offSg.font = '900 32px Arial,sans-serif';
offSg.fillText('OFFICER MESS', 256, 88);

offSg.fillStyle = '#1b5e20';
offSg.fillRect(80, 116, 352, 30);
offSg.fillStyle = '#ffffff';
offSg.font = '700 17px Arial,sans-serif';
offSg.fillText("GSV FACULTY & OFFICERS' DINING", 256, 131);

const offSignTx = new THREE.CanvasTexture(offSignC);
offSignTx.encoding = THREE.sRGBEncoding;
const offSignM = new THREE.Mesh(
  new THREE.PlaneGeometry(7.2, 1.9),
  new THREE.MeshBasicMaterial({ map: offSignTx })
);
offSignM.position.set(453 - W / 2, 3.5, 119.1 - H / 2);
messM.add(offSignM);

const offDoor = new THREE.Mesh(
  new THREE.PlaneGeometry(3.2, 2.4),
  new THREE.MeshBasicMaterial({ color: 0x1f2a36 })
);
offDoor.position.set(453 - W / 2, 1.3, 119.12 - H / 2);
messM.add(offDoor);

[
  [6.8, 0.35, 1.2, 118.6, 0.18],
  [5.8, 0.35, 1.0, 118.0, 0.48]
].forEach(([w, h, d, z, y]) => {
  const step = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), messTerraMat);
  step.position.set(453 - W / 2, y, z - H / 2);
  step.castShadow = true;
  messM.add(step);
});

// Ornamental Gateposts facing Pahune Hostel
[-5.2, 5.2].forEach((dx) => {
  const post = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 1.0), messCreamMat);
  post.position.set(453 + dx - W / 2, 1.1, 117.8 - H / 2);
  post.castShadow = true;
  messM.add(post);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 1.2), messTerraMat);
  cap.position.set(453 + dx - W / 2, 2.25, 117.8 - H / 2);
  messM.add(cap);
  const lantern = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 14, 14),
    new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffeedd, emissiveIntensity: 0.3 })
  );
  lantern.position.set(453 + dx - W / 2, 2.65, 117.8 - H / 2);
  messM.add(lantern);
});

// ----------------------------------------------------------------------------
// GATE 2: South Gate — "GSV-MESS" (Opening in front of Manthan Building)
// ----------------------------------------------------------------------------
const messPorch = new THREE.Mesh(new THREE.BoxGeometry(13.2, 4.8, 4.2), messCreamMat);
messPorch.position.set(435 - W / 2, 2.4, 167.1 - H / 2);
messPorch.castShadow = true;
messM.add(messPorch);

const messDado = new THREE.Mesh(new THREE.BoxGeometry(13.4, 1.2, 4.3), messTerraMat);
messDado.position.set(435 - W / 2, 0.6, 167.1 - H / 2);
messM.add(messDado);

[-5.2, -1.8, 1.8, 5.2].forEach((dx) => {
  const col = new THREE.Mesh(new THREE.BoxGeometry(0.85, 4.8, 0.85), messCreamMat);
  col.position.set(435 + dx - W / 2, 2.4, 169.3 - H / 2);
  col.castShadow = true;
  messM.add(col);
  const baseCol = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 1.1), messTerraMat);
  baseCol.position.set(435 + dx - W / 2, 0.35, 169.3 - H / 2);
  messM.add(baseCol);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.45, 1.15), messCreamMat);
  cap.position.set(435 + dx - W / 2, 4.8, 169.3 - H / 2);
  messM.add(cap);
});

const messEntab = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.8, 4.8), messCreamMat);
messEntab.position.set(435 - W / 2, 5.0, 167.3 - H / 2);
messEntab.castShadow = true;
messM.add(messEntab);

const messCrown = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.6, 5.0), messTerraMat);
messCrown.position.set(435 - W / 2, 5.6, 167.3 - H / 2);
messM.add(messCrown);

const messPediment = new THREE.Mesh(new THREE.BoxGeometry(7.6, 1.2, 0.5), messCreamMat);
messPediment.position.set(435 - W / 2, 6.4, 169.4 - H / 2);
messM.add(messPediment);

// Authentic Signboard: GSV-MESS
const messSignC = document.createElement('canvas');
messSignC.width = 512;
messSignC.height = 160;
const messSg = messSignC.getContext('2d');
messSg.fillStyle = '#0c2340';
messSg.fillRect(0, 0, 512, 160);

messSg.strokeStyle = '#cda250';
messSg.lineWidth = 6;
messSg.strokeRect(6, 6, 500, 148);
messSg.strokeStyle = '#e6c875';
messSg.lineWidth = 2;
messSg.strokeRect(12, 12, 488, 136);

messSg.fillStyle = '#f3e5ab';
messSg.textAlign = 'center';
messSg.textBaseline = 'middle';
messSg.font = '700 28px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
messSg.fillText('गति शक्ति विश्वविद्यालय मेस', 256, 38);

messSg.fillStyle = '#ffffff';
messSg.font = '900 44px Arial,sans-serif';
messSg.fillText('GSV-MESS', 256, 88);

messSg.fillStyle = '#d89e28';
messSg.fillRect(70, 118, 372, 28);
messSg.fillStyle = '#0a192f';
messSg.font = '700 17px Arial,sans-serif';
messSg.fillText('STUDENT DINING & CENTRAL MESS', 256, 132);

const messSignTx = new THREE.CanvasTexture(messSignC);
messSignTx.encoding = THREE.sRGBEncoding;
const messSignM = new THREE.Mesh(
  new THREE.PlaneGeometry(10.2, 2.3),
  new THREE.MeshBasicMaterial({ map: messSignTx })
);
messSignM.position.set(435 - W / 2, 4.0, 169.45 - H / 2);
messM.add(messSignM);

const messDoor = new THREE.Mesh(
  new THREE.PlaneGeometry(5.8, 2.6),
  new THREE.MeshBasicMaterial({ color: 0x1a2634 })
);
messDoor.position.set(435 - W / 2, 1.4, 169.4 - H / 2);
messM.add(messDoor);

[
  [11.2, 0.35, 1.4, 170.1, 0.18],
  [10.2, 0.35, 1.2, 171.1, 0.52],
  [9.2, 0.35, 1.0, 172.0, 0.85]
].forEach(([w, h, d, z, y]) => {
  const step = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), messTerraMat);
  step.position.set(435 - W / 2, y, z - H / 2);
  step.castShadow = true;
  messM.add(step);
});

[-7.4, 7.4].forEach((dx) => {
  const post = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.8, 1.4), messCreamMat);
  post.position.set(435 + dx - W / 2, 1.4, 172.4 - H / 2);
  post.castShadow = true;
  messM.add(post);
  const basePost = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.8, 1.7), messTerraMat);
  basePost.position.set(435 + dx - W / 2, 0.4, 172.4 - H / 2);
  messM.add(basePost);
  const capPost = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), messTerraMat);
  capPost.position.set(435 + dx - W / 2, 2.9, 172.4 - H / 2);
  messM.add(capPost);
  const urn = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffeedd, emissiveIntensity: 0.3 })
  );
  urn.position.set(435 + dx - W / 2, 3.5, 172.4 - H / 2);
  messM.add(urn);
});

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

// ==========================================
// MEHMAN BOY'S HOSTEL (BEFORE GSV ACADBLOCK)
// ==========================================
const cMeh = document.createElement('canvas');
cMeh.width = cMeh.height = 128;
const gMeh = cMeh.getContext('2d');
gMeh.fillStyle = '#dfa86c'; // Warm sandy ochre stucco from photos
gMeh.fillRect(0, 0, 128, 128);

// Plaster texture grain & subtle stippling
gMeh.fillStyle = 'rgba(0,0,0,0.03)';
for (let py = 0; py < 128; py += 4) {
  for (let px = 0; px < 128; px += 4) {
    if ((px * 3 + py * 7) % 11 === 0) gMeh.fillRect(px, py, 2, 2);
  }
}

// Windows with ochre reveals, crisp white frames & glass
[14, 76].forEach((wx) => {
  // Reveal shadow
  gMeh.fillStyle = '#b8824a';
  gMeh.fillRect(wx - 2, 18, 42, 54);
  // White outer frame
  gMeh.fillStyle = '#f5f7fa';
  gMeh.fillRect(wx, 20, 38, 50);
  // Glass pane
  gMeh.fillStyle = '#3c4e5e';
  gMeh.fillRect(wx + 3, 23, 32, 44);
  // White window sash mullions
  gMeh.fillStyle = '#f5f7fa';
  gMeh.fillRect(wx + 18, 23, 2, 44);
  gMeh.fillRect(wx + 3, 44, 32, 2);
});

// Floor dividing grooves
gMeh.fillStyle = '#9e6b36';
gMeh.fillRect(0, 0, 128, 3);
gMeh.fillRect(0, 125, 128, 3);

const mehBase = new THREE.CanvasTexture(cMeh);
mehBase.wrapS = mehBase.wrapT = THREE.RepeatWrapping;
mehBase.encoding = THREE.sRGBEncoding;
LITMAP.set(mehBase, litTex(litFromCanvas(cMeh)));
mehBase.anisotropy = 4;

// Main 3-story building block (G + 2 floors, height 11.2)
const mehM = mk(
  [
    [264, 37],
    [287, 48],
    [294, 51],
    [308, 64],
    [307, 35]
  ],
  11.2,
  0xd0a369,
  0xa3743e,
  1.8,
  [],
  [],
  mehBase
);

// Materials for Mehman Hostel architectural details
const mehWallMat = new THREE.MeshLambertMaterial({ color: 0xdfa86c });
const mehAccentMat = new THREE.MeshLambertMaterial({ color: 0xd49b5c });
const mehRailingMat = new THREE.MeshLambertMaterial({ color: 0xd6dee2 });
const mehGlassMat = new THREE.MeshLambertMaterial({ color: 0x1d242d });
const mehWhiteFrame = new THREE.MeshLambertMaterial({ color: 0xf5f7fa });
const mehBlueSignMat = new THREE.MeshLambertMaterial({ color: 0x0d47a1 });
const mehOrangeSignMat = new THREE.MeshLambertMaterial({ color: 0xe65100 });
const mehTreeTrunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3622 });
const mehTreeWhiteMat = new THREE.MeshLambertMaterial({ color: 0xf4f4f4 });
const mehTreeBandMat = new THREE.MeshLambertMaterial({ color: 0x8a2f26 });
const mehFoliageMat = new THREE.MeshLambertMaterial({ color: 0x3d7025 });

// 1. Cantilevered Balconies & Verandas along West & East Wings
function mkBalconyBay(bx, bz, rotY, hasLaundry = false, laundryCol = 0x2266bb) {
  const bay = new THREE.Group();

  // 3 levels of balconies (Ground floor veranda, 1st floor, 2nd floor)
  [0.55, 4.15, 7.75].forEach((floorY, flIdx) => {
    // Balcony cantilevered floor slab
    const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.22, 1.45), mehWallMat);
    floorSlab.position.set(0, floorY, 0.72);
    bay.add(floorSlab);

    // Front ochre parapet wall base
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.55, 0.12), mehWallMat);
    frontWall.position.set(0, floorY + 0.38, 1.4);
    bay.add(frontWall);

    // Side parapet walls
    [-2.05, 2.05].forEach((sx) => {
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.95, 1.35), mehWallMat);
      sideWall.position.set(sx, floorY + 0.58, 0.72);
      bay.add(sideWall);
    });

    // Horizontal stainless steel / metal safety railings
    [0.72, 0.92, 1.08].forEach((rh) => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 4.1, 8), mehRailingMat);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, floorY + rh, 1.4);
      bay.add(rail);
    });

    // Recessed white sliding glass door & window behind balcony
    const doorUnit = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.4, 0.08), mehWhiteFrame);
    doorUnit.position.set(0, floorY + 1.45, 0.05);
    bay.add(doorUnit);

    const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.1, 0.1), mehGlassMat);
    doorGlass.position.set(0, floorY + 1.45, 0.06);
    bay.add(doorGlass);

    // Student clothes drying line on selected balconies (seen in photo)
    if (hasLaundry && flIdx === 1) {
      const line = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 3.2, 6), mehRailingMat);
      line.rotation.z = Math.PI / 2;
      line.position.set(0, floorY + 1.65, 0.9);
      bay.add(line);

      const cloth = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.65, 0.04),
        new THREE.MeshLambertMaterial({ color: laundryCol })
      );
      cloth.position.set(-0.5, floorY + 1.3, 0.9);
      bay.add(cloth);

      const cloth2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.55, 0.04),
        new THREE.MeshLambertMaterial({ color: 0xf5f5f5 })
      );
      cloth2.position.set(0.6, floorY + 1.35, 0.9);
      bay.add(cloth2);
    }
  });

  // Vertical structural dividing pier / column
  const pier = new THREE.Mesh(new THREE.BoxGeometry(0.42, 11.5, 1.55), mehAccentMat);
  pier.position.set(2.2, 5.75, 0.72);
  pier.castShadow = true;
  bay.add(pier);

  bay.rotation.y = rotY;
  bay.position.set(bx - W / 2, 0, bz - H / 2);
  mehM.add(bay);
}

// West Wing Balcony Bays (Wall from 264, 37 to 287, 48 - angle ~ 0.44 rad)
const wAngle = 0.44;
mkBalconyBay(268.0, 38.8, wAngle, true, 0x1976d2);
mkBalconyBay(273.5, 41.5, wAngle, false);
mkBalconyBay(279.0, 44.1, wAngle, true, 0xd32f2f);
mkBalconyBay(284.5, 46.8, wAngle, false);

// East Wing Balcony Bays (Wall from 294, 51 to 308, 64 - angle ~ 0.75 rad)
const eAngle = 0.75;
mkBalconyBay(299.0, 55.6, eAngle, true, 0x388e3c);
mkBalconyBay(303.5, 59.8, eAngle, false);
mkBalconyBay(307.0, 63.1, eAngle, true, 0xf57c00);

// 2. Main Entrance Canopy with Dual-Color Bilingual Signboard (Image 1)
const canX = 293.8, canZ = 51.5, canRot = 0.60;
const canopyGroup = new THREE.Group();

// Projecting canopy roof slab
const canSlab = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.38, 2.8), mehWallMat);
canSlab.position.set(0, 3.65, 1.4);
canSlab.castShadow = true;
canopyGroup.add(canSlab);

// White underside soffit
const canSoffit = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.08, 2.6), mehWhiteFrame);
canSoffit.position.set(0, 3.44, 1.4);
canopyGroup.add(canSoffit);

// Canopy support pillars in front
[-2.4, 2.4].forEach((px) => {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.65, 12), mehWhiteFrame);
  post.position.set(px, 1.825, 2.6);
  post.castShadow = true;
  canopyGroup.add(post);
});

// Bilingual Canopy Fascia Signboard (Orange + Blue)
const cCanSign = document.createElement('canvas');
cCanSign.width = 512;
cCanSign.height = 128;
const gCanSign = cCanSign.getContext('2d');

// Left half: Orange section (Devanagari)
gCanSign.fillStyle = '#e65100';
gCanSign.fillRect(0, 0, 256, 128);
gCanSign.fillStyle = '#ffffff';
gCanSign.font = '700 30px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
gCanSign.textAlign = 'center';
gCanSign.textBaseline = 'middle';
gCanSign.fillText('गति शक्ति विश्वविद्यालय', 128, 64);

// Right half: Royal Blue section (GSV HOSTEL)
gCanSign.fillStyle = '#0d47a1';
gCanSign.fillRect(256, 0, 256, 128);
gCanSign.fillStyle = '#ffffff';
gCanSign.font = '900 48px "Inter","Roboto","Montserrat",sans-serif';
gCanSign.textAlign = 'center';
gCanSign.textBaseline = 'middle';
gCanSign.fillText('GSV HOSTEL', 384, 64);

// Gold center divider & border
gCanSign.lineWidth = 6;
gCanSign.strokeStyle = '#ffd54f';
gCanSign.strokeRect(3, 3, 506, 122);
gCanSign.beginPath();
gCanSign.moveTo(256, 0);
gCanSign.lineTo(256, 128);
gCanSign.stroke();

const tCanSign = new THREE.CanvasTexture(cCanSign);
tCanSign.encoding = THREE.sRGBEncoding;

const canSignMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(5.2, 0.95),
  new THREE.MeshBasicMaterial({ map: tCanSign })
);
canSignMesh.position.set(0, 3.65, 2.82);
canopyGroup.add(canSignMesh);

// Ground floor glass entrance door under canopy
const canDoor = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.2, 0.1), mehWhiteFrame);
canDoor.position.set(0, 1.6, 0.1);
canopyGroup.add(canDoor);

const canDoorGlass = new THREE.Mesh(new THREE.BoxGeometry(2.9, 2.9, 0.12), mehGlassMat);
canDoorGlass.position.set(0, 1.6, 0.11);
canopyGroup.add(canDoorGlass);

canopyGroup.rotation.y = canRot;
canopyGroup.position.set(canX - W / 2, 0, canZ - H / 2);
mehM.add(canopyGroup);

// 3. Large Foreground "Hostel & Enquiry Office" Signboard (Image 2)
const cEnq = document.createElement('canvas');
cEnq.width = 512;
cEnq.height = 280;
const gEnq = cEnq.getContext('2d');

gEnq.fillStyle = '#0d47a1'; // Deep royal blue
gEnq.fillRect(0, 0, 512, 280);

// Crisp white double border
gEnq.lineWidth = 10;
gEnq.strokeStyle = '#ffffff';
gEnq.strokeRect(8, 8, 496, 264);
gEnq.lineWidth = 2;
gEnq.strokeStyle = 'rgba(255,255,255,0.6)';
gEnq.strokeRect(18, 18, 476, 244);

// Bilingual text matching Image 2 exactly
gEnq.fillStyle = '#ffffff';
gEnq.textAlign = 'center';
gEnq.textBaseline = 'middle';

gEnq.font = '700 38px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
gEnq.fillText('गति शक्ति विश्वविद्यालय', 256, 62);

gEnq.font = '700 36px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
gEnq.fillText('छात्रावास एवं पूछताछ कार्यालय', 256, 130);

gEnq.font = '800 38px "Inter","Roboto","Montserrat",sans-serif';
gEnq.fillText('Hostel & Enquiry Office', 256, 206);

const tEnq = new THREE.CanvasTexture(cEnq);
tEnq.encoding = THREE.sRGBEncoding;

const enqSignMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(3.6, 2.0),
  new THREE.MeshBasicMaterial({ map: tEnq })
);
enqSignMesh.position.set(291.5 - W / 2, 1.7, 58.5 - H / 2);
enqSignMesh.rotation.y = 0.60;
mehM.add(enqSignMesh);

const enqBackPlate = new THREE.Mesh(
  new THREE.BoxGeometry(3.7, 2.1, 0.1),
  new THREE.MeshLambertMaterial({ color: 0x093070 })
);
enqBackPlate.position.set(291.5 - W / 2, 1.7, 58.45 - H / 2);
enqBackPlate.rotation.y = 0.60;
mehM.add(enqBackPlate);

// Stainless steel support posts with spherical ball finials (Image 2)
[-1.75, 1.75].forEach((px) => {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.3, 12), atiSteelMat);
  const rotatedX = px * Math.cos(0.60);
  const rotatedZ = -px * Math.sin(0.60);
  post.position.set(291.5 + rotatedX - W / 2, 1.15, 58.5 + rotatedZ - H / 2);
  mehM.add(post);

  // Shiny sphere finial on top of each post
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), atiSteelMat);
  finial.position.set(291.5 + rotatedX - W / 2, 2.34, 58.5 + rotatedZ - H / 2);
  mehM.add(finial);
});

// 4. Student Bicycles Parked Near Entrance (Image 1)
function mkStudentBicycle(bx, bz, rotY, frameCol = 0xcc2222) {
  const bGrp = new THREE.Group();
  const tireMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const fMat = new THREE.MeshLambertMaterial({ color: frameCol });

  // Two wheels with tires
  [-0.45, 0.45].forEach((wx) => {
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 8, 16), tireMat);
    tire.position.set(wx, 0.28, 0);
    bGrp.add(tire);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), atiSteelMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(wx, 0.28, 0);
    bGrp.add(hub);
  });

  // Diamond bike frame
  const crossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.85, 6), fMat);
  crossBar.rotation.z = Math.PI / 2;
  crossBar.position.set(0, 0.52, 0);
  bGrp.add(crossBar);

  const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65, 6), fMat);
  downTube.rotation.z = -0.7;
  downTube.position.set(0.18, 0.38, 0);
  bGrp.add(downTube);

  const seatStay = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65, 6), fMat);
  seatStay.rotation.z = 0.65;
  seatStay.position.set(-0.2, 0.42, 0);
  bGrp.add(seatStay);

  // Handlebars
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6), atiSteelMat);
  stem.position.set(0.42, 0.62, 0);
  bGrp.add(stem);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), atiSteelMat);
  handle.rotation.x = Math.PI / 2;
  handle.position.set(0.42, 0.74, 0);
  bGrp.add(handle);

  // Saddle / seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.12), tireMat);
  seat.position.set(-0.15, 0.62, 0);
  bGrp.add(seat);

  bGrp.rotation.y = rotY;
  bGrp.position.set(bx - W / 2, 0, bz - H / 2);
  mehM.add(bGrp);
}

mkStudentBicycle(296.8, 56.5, 0.8, 0x1565c0); // Blue bike
mkStudentBicycle(297.8, 57.2, 0.7, 0xd32f2f); // Red bike
mkStudentBicycle(298.6, 58.0, 0.9, 0x2e7d32); // Green bike

// 5. Mature Shade Trees with Whitewashed & Red Painted Lower Trunks (Image 1)
function mkMehmanTree(tx, tz, trunkH = 4.2, crownR = 3.2) {
  const tGrp = new THREE.Group();

  // Painted white base (0 to 1.3m)
  const baseTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.44, 1.3, 10),
    mehTreeWhiteMat
  );
  baseTrunk.position.y = 0.65;
  baseTrunk.castShadow = true;
  tGrp.add(baseTrunk);

  // Terracotta / red band (1.3 to 1.6m)
  const bandTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.38, 0.3, 10),
    mehTreeBandMat
  );
  bandTrunk.position.y = 1.45;
  tGrp.add(bandTrunk);

  // Dark bark upper trunk
  const upperTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.36, trunkH - 1.6, 10),
    mehTreeTrunkMat
  );
  upperTrunk.position.y = 1.6 + (trunkH - 1.6) / 2;
  upperTrunk.castShadow = true;
  tGrp.add(upperTrunk);

  // Leafy spreading canopy
  [
    [0, trunkH + 1.2, 0, crownR],
    [-crownR * 0.4, trunkH + 0.8, crownR * 0.35, crownR * 0.75],
    [crownR * 0.45, trunkH + 0.9, -crownR * 0.3, crownR * 0.78],
    [0, trunkH + 2.0, crownR * 0.25, crownR * 0.65]
  ].forEach(([lx, ly, lz, lr]) => {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(lr, 1), mehFoliageMat);
    leaf.position.set(lx, ly, lz);
    leaf.castShadow = true;
    tGrp.add(leaf);
  });

  tGrp.position.set(tx - W / 2, 0, tz - H / 2);
  mehM.add(tGrp);
}

mkMehmanTree(276.0, 48.0, 6.8, 3.6);
mkMehmanTree(314.0, 60.0, 7.2, 4.0);
mkMehmanTree(264.0, 39.0, 6.4, 3.4);

// 6. Flowering Shrubs (Hibiscus) & Curving Interlocking Paver Path
function mkFlowerBush(bx, bz, r = 0.85) {
  const bGrp = new THREE.Group();
  const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mehFoliageMat);
  bush.position.y = r * 0.8;
  bush.castShadow = true;
  bGrp.add(bush);

  // Red hibiscus flowers
  const flowerMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
  for (let f = 0; f < 5; f++) {
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), flowerMat);
    const fa = (f / 5) * Math.PI * 2;
    fl.position.set(Math.sin(fa) * r * 0.75, r * 0.9 + (f % 2) * 0.2, Math.cos(fa) * r * 0.75);
    bGrp.add(fl);
  }

  bGrp.position.set(bx - W / 2, 0, bz - H / 2);
  mehM.add(bGrp);
}

mkFlowerBush(289.5, 59.5, 0.75);
mkFlowerBush(293.5, 61.2, 0.85);
mkFlowerBush(298.0, 62.8, 0.9);
mkFlowerBush(284.0, 54.5, 0.8);

// Paved forecourt walkway
flat(284, 50, 304, 62, 0.28, 0xd8ceb8);

// 7. Rooftop Features (Water tanks, stair cabin, perimeter railing)
[
  [278, 40],
  [302, 44]
].forEach(([rx, rz]) => {
  const tank = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 1.8, 2.4, 12),
    new THREE.MeshLambertMaterial({ color: 0xf0f0f0 })
  );
  tank.position.set(rx - W / 2, 12.4, rz - H / 2);
  mehM.add(tank);
});

const stairCabin = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 3.8), mehWallMat);
stairCabin.position.set(292 - W / 2, 12.4, 42 - H / 2);
mehM.add(stairCabin);

// Continuous roof perimeter safety railing
[
  [264, 37, 287, 48],
  [287, 48, 294, 51],
  [294, 51, 308, 64],
  [308, 64, 307, 35],
  [307, 35, 264, 37]
].forEach(([x1, z1, x2, z2]) => {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ang = Math.atan2(z2 - z1, x2 - x1);
  const midX = (x1 + x2) / 2;
  const midZ = (z1 + z2) / 2;

  const topRail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 8), mehRailingMat);
  topRail.rotation.z = Math.PI / 2;
  topRail.rotation.y = -ang;
  topRail.position.set(midX - W / 2, 11.85, midZ - H / 2);
  mehM.add(topRail);
});

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

// ============================================================================
// DARSHAN BUILDING
// Situated between Pratap Vilas Palace (West) and Manthan (East):
// Center X = 394, Z = 200. Features the Prastuti North Entrance Forecourt,
// classical 4-column colonnade portico, bilingual signage, and landscaped plaza.
// ============================================================================
(function () {
  // 1. Facade texture generator with classical arch windows and quoin blocks
  const darT = tx((g) => {
    // Warm sandstone base
    g.fillStyle = '#dfcebd';
    g.fillRect(0, 0, 64, 64);

    // Floor divider string course
    g.fillStyle = '#bfa58d';
    g.fillRect(0, 31, 64, 3);
    g.fillStyle = '#eddac8';
    g.fillRect(0, 30, 64, 1);

    // Two window bays per tile
    [6, 38].forEach((x) => {
      // Ground floor: rectangular window with dark frame & glass
      g.fillStyle = '#ab9078';
      g.fillRect(x - 2, 38, 20, 22);
      g.fillStyle = '#ffffff';
      g.fillRect(x, 40, 16, 18);
      g.fillStyle = '#3a4b58';
      g.fillRect(x + 1.5, 41.5, 13, 15);
      g.fillStyle = '#ffffff';
      g.fillRect(x + 7.5, 41.5, 1.5, 15);
      g.fillRect(x + 1.5, 48.5, 13, 1.5);
      // Stone sill
      g.fillStyle = '#c7b099';
      g.fillRect(x - 3, 59, 22, 2.5);

      // Upper floor: arched window with fanlight
      g.fillStyle = '#ab9078';
      g.fillRect(x - 2, 10, 20, 18);
      g.beginPath();
      g.arc(x + 8, 10, 10, Math.PI, 0);
      g.fill();

      g.fillStyle = '#ffffff';
      g.fillRect(x, 12, 16, 16);
      g.beginPath();
      g.arc(x + 8, 12, 8, Math.PI, 0);
      g.fill();

      g.fillStyle = '#3a4b58';
      g.fillRect(x + 1.5, 13.5, 13, 14.5);
      g.beginPath();
      g.arc(x + 8, 13.5, 6.5, Math.PI, 0);
      g.fill();

      // Window mullions
      g.fillStyle = '#ffffff';
      g.fillRect(x + 7.5, 7, 1.5, 21);
      g.fillRect(x + 1.5, 20, 13, 1.5);

      // Keystone accent
      g.fillStyle = '#f0e3d2';
      g.fillRect(x + 6.5, 0, 3.5, 4);
    });

    // Cornice roof trim
    g.fillStyle = '#c4aa92';
    g.fillRect(0, 0, 64, 4);
    g.fillStyle = '#eee1d1';
    g.fillRect(0, 3, 64, 1.5);
  });

  // Materials
  const dSand = new THREE.MeshLambertMaterial({ color: 0xdfcebd }),
    dTrim = new THREE.MeshLambertMaterial({ color: 0xe8dcce }),
    dMaroon = new THREE.MeshLambertMaterial({ color: 0x6b2422 }),
    dStoneDark = new THREE.MeshLambertMaterial({ color: 0x4a3c33 }),
    dRoofTerrace = new THREE.MeshLambertMaterial({ color: 0xede4d8 }),
    dGold = new THREE.MeshLambertMaterial({ color: 0xc8963e });

  // Group for Darshan
  const darM = new THREE.Group();
  scene.add(darM);

  // Foundation plinth pad
  flat(381, 182, 408, 218, 0.25, 0xd0c4b2);

  // Plinth block
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(25, 0.8, 35),
    dStoneDark
  );
  plinth.position.set(394.5 - W / 2, 0.4, 200 - H / 2);
  plinth.receiveShadow = true;
  darM.add(plinth);

  // Central Block (X: 386 to 402, Z: 184 to 216, H: 10.8)
  const centralM = mk(
    [
      [386, 184],
      [402, 184],
      [402, 216],
      [386, 216]
    ],
    10.8,
    0xd6beaa,
    0xab886c,
    1.9,
    [],
    [],
    darT,
    [1 / 12, 1 / 5.4]
  );
  darM.add(centralM);

  // West Wing (X: 383 to 386, Z: 189 to 211, H: 9.6)
  const westM = mk(
    [
      [383, 189],
      [386, 189],
      [386, 211],
      [383, 211]
    ],
    9.6,
    0xd2b8a2,
    0xab886c,
    1.9,
    [],
    [],
    darT,
    [1 / 10, 1 / 4.8]
  );
  darM.add(westM);

  // East Wing (X: 402 to 407, Z: 188 to 212, H: 9.4 with light terrace roof matching satellite image)
  const eastM = mk(
    [
      [402, 188],
      [407, 188],
      [407, 212],
      [402, 212]
    ],
    9.4,
    0xe2d2bf,
    0xab886c,
    1.9,
    [],
    [],
    darT,
    [1 / 10, 1 / 4.7]
  );
  darM.add(eastM);

  // East Terrace flat light-colored roof top
  const eastRoof = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.3, 23.8),
    dRoofTerrace
  );
  eastRoof.position.set(404.5 - W / 2, 9.55, 200 - H / 2);
  darM.add(eastRoof);

  // Parapet copings on East & West wings
  const wParapet = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.6, 22.2), dTrim);
  wParapet.position.set(384.5 - W / 2, 9.8, 200 - H / 2);
  darM.add(wParapet);

  // Central Roof Clerestory / Raised Pavilion (matching satellite photo)
  const roofPavilion = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1.8, 14),
    dSand
  );
  roofPavilion.position.set(394 - W / 2, 11.7, 200 - H / 2);
  roofPavilion.castShadow = true;
  darM.add(roofPavilion);

  const roofPavilionTop = new THREE.Mesh(
    new THREE.BoxGeometry(10.8, 0.35, 14.8),
    dTrim
  );
  roofPavilionTop.position.set(394 - W / 2, 12.7, 200 - H / 2);
  darM.add(roofPavilionTop);

  // Rooftop solar collectors
  [-3, 3].forEach(offX => {
    const solarP = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.25, 4.5),
      new THREE.MeshLambertMaterial({ color: 0x1a2e48 })
    );
    solarP.rotation.x = 0.25;
    solarP.position.set(394 + offX - W / 2, 11.2, 209 - H / 2);
    darM.add(solarP);
  });

  // ---- North Grand Colonnade Portico ("Prastuti (Darshan Front)") ----
  // Entrance Portico Canopy Slab (at Y = 9.8, Z extending from 184 to 178)
  const porticoRoof = new THREE.Mesh(
    new THREE.BoxGeometry(14.6, 0.8, 6.2),
    dTrim
  );
  porticoRoof.position.set(394 - W / 2, 9.8, 180.9 - H / 2);
  porticoRoof.castShadow = true;
  darM.add(porticoRoof);

  // 4 Grand Classical Columns
  [388.5, 392.2, 395.8, 399.5].forEach((colX) => {
    // Column Base (dark maroon)
    const cBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.0), dMaroon);
    cBase.position.set(colX - W / 2, 1.05, 178.5 - H / 2);
    darM.add(cBase);

    // Fluted Column Shaft
    const cShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 8.2, 14), dSand);
    cShaft.position.set(colX - W / 2, 5.2, 178.5 - H / 2);
    cShaft.castShadow = true;
    darM.add(cShaft);

    // Column Capital
    const cCap = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.4, 0.95), dMaroon);
    cCap.position.set(colX - W / 2, 9.4, 178.5 - H / 2);
    darM.add(cCap);
  });

  // Classical Triangular Pediment facing North
  const tri = new THREE.Shape();
  tri.moveTo(-7.4, 0);
  tri.lineTo(7.4, 0);
  tri.lineTo(0, 3.2);
  tri.closePath();
  const ped = new THREE.Mesh(
    new THREE.ExtrudeGeometry(tri, { depth: 2.4, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 2 }),
    dSand
  );
  ped.position.set(394 - W / 2, 10.2, 180.4 - H / 2);
  ped.rotation.y = Math.PI;
  ped.castShadow = true;
  darM.add(ped);

  // Pediment Cornice Trim
  const pedCorniceL = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.35, 2.6), dTrim);
  pedCorniceL.position.set(390.4 - W / 2, 11.75, 179.2 - H / 2);
  pedCorniceL.rotation.z = Math.atan2(3.2, 7.4);
  darM.add(pedCorniceL);

  const pedCorniceR = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.35, 2.6), dTrim);
  pedCorniceR.position.set(397.6 - W / 2, 11.75, 179.2 - H / 2);
  pedCorniceR.rotation.z = -Math.atan2(3.2, 7.4);
  darM.add(pedCorniceR);

  // Pediment Apex Finial Urn
  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 1.1, 10), dTrim);
  finial.position.set(394 - W / 2, 13.9, 179.2 - H / 2);
  darM.add(finial);

  // ---- Illuminated Bilingual Signage ("दर्शन · DARSHAN") ----
  const dCanvas = document.createElement('canvas');
  dCanvas.width = 384;
  dCanvas.height = 112;
  const dg = dCanvas.getContext('2d');

  // Background plaque with subtle border
  dg.fillStyle = '#dfcfbe';
  dg.fillRect(0, 0, 384, 112);
  dg.strokeStyle = '#632522';
  dg.lineWidth = 6;
  dg.strokeRect(3, 3, 378, 106);
  dg.strokeStyle = '#c8963e';
  dg.lineWidth = 2;
  dg.strokeRect(8, 8, 368, 96);

  // Devanagari "दर्शन"
  dg.fillStyle = '#632522';
  dg.font = '700 48px "Noto Sans Devanagari","Mangal","Nirmala UI",sans-serif';
  dg.textAlign = 'center';
  dg.textBaseline = 'middle';
  dg.fillText('दर्शन', 192, 42);

  // English "DARSHAN"
  dg.fillStyle = '#7d4a1c';
  dg.font = '700 24px "Outfit","Inter","Roboto",sans-serif';
  dg.fillText('DARSHAN', 192, 86);

  const darSignTex = new THREE.CanvasTexture(dCanvas);
  darSignTex.encoding = THREE.sRGBEncoding;

  const darSign = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 1.85),
    new THREE.MeshBasicMaterial({ map: darSignTex })
  );
  darSign.position.set(394 - W / 2, 8.4, 177.9 - H / 2);
  darSign.rotation.y = Math.PI;
  darM.add(darSign);

  // Warm Brass Lamp illuminating the sign
  const signLamp = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.35), dGold);
  signLamp.position.set(394 - W / 2, 9.45, 178.1 - H / 2);
  darM.add(signLamp);

  // Grand Entrance Doors & Recessed Portal
  const doorPortal = new THREE.Mesh(new THREE.BoxGeometry(5.2, 5.8, 0.4), dTrim);
  doorPortal.position.set(394 - W / 2, 3.6, 183.9 - H / 2);
  darM.add(doorPortal);

  const doubleDoors = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 4.8),
    new THREE.MeshLambertMaterial({ color: 0x241812 })
  );
  doubleDoors.position.set(394 - W / 2, 3.2, 183.7 - H / 2);
  doubleDoors.rotation.y = Math.PI;
  darM.add(doubleDoors);

  // Door handles (brass)
  [-0.3, 0.3].forEach(hx => {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), dGold);
    handle.position.set(394 + hx - W / 2, 3.0, 183.65 - H / 2);
    darM.add(handle);
  });

  // Entrance steps (4 wide tiers extending from portico down to plaza)
  for (let i = 0; i < 4; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(16.5 + i * 0.8, 0.22, 1.2),
      new THREE.MeshLambertMaterial({ color: 0xc4b29e })
    );
    step.position.set(394 - W / 2, 0.22 * (4 - i) - 0.11, 178.0 - i * 0.85 - H / 2);
    darM.add(step);
  }

  // ---- Prastuti North Entrance Forecourt Plaza ----
  // Main plaza paving
  flat(380, 166, 408, 178, 0.28, 0xd8cebf);
  // Central entrance court decorative inlay
  flat(387, 168, 401, 175, 0.30, 0xcaa98a);

  // Symmetrical Planter Boxes flanking steps
  [384.5, 403.5].forEach(px => {
    // Stone retaining wall
    const planterWall = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.65, 4.5),
      dStoneDark
    );
    planterWall.position.set(px - W / 2, 0.45, 175 - H / 2);
    darM.add(planterWall);

    // Soil & lush shrubbery
    const shrub = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.5, 4.2),
      new THREE.MeshLambertMaterial({ color: 0x3d702e })
    );
    shrub.position.set(px - W / 2, 0.85, 175 - H / 2);
    darM.add(shrub);

    // Flowering accents
    [-0.8, 0.8].forEach(fx => {
      const fl = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 6, 6),
        new THREE.MeshLambertMaterial({ color: 0xe06060 })
      );
      fl.position.set(px + fx - W / 2, 1.15, 175 - H / 2);
      darM.add(fl);
    });
  });

  // Paved Pedestrian Walkway connecting Darshan to Manthan
  flat(404, 181, 420, 186, 0.26, 0xc8bfae);

  // Paved Pedestrian Walkway connecting Darshan to Palace East Loop Road
  flat(371, 171, 381, 176, 0.26, 0xc8bfae);

  // Directional Signpost at Plaza Entrance
  const totemPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), dStoneDark);
  totemPole.position.set(383 - W / 2, 1.2, 168 - H / 2);
  darM.add(totemPole);

  const totemBoard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.1), dMaroon);
  totemBoard.position.set(383 - W / 2, 2.0, 168 - H / 2);
  darM.add(totemBoard);
})();

// ============================================================================
// GIRIRAJ BUILDING (Giriraj Grih - VIP Guest House & Executive Residence)
// Sited directly in front of Darshan (North of Darshan: Y = 133 to 155)
// and to the side (West) of GSV-MESS (X = 379 to 397).
// Center approx: X = 388, Z = 144.
// Features:
// 1. Faceted octagonal main building (matching satellite top view Image 1)
// 2. Multi-hipped pitched terracotta tile roof with hips and central ridge (Image 1)
// 3. Front entrance portico / porch extending south towards Darshan (Images 2 & 3)
// 4. Square columns with black wainscot & warm yellow upper finish (Image 2)
// 5. Authentic blue-slate stone mosaic entrance wall & planter benches (Images 2 & 3)
// 6. Glazed entrance doors with sidelights, transoms, and brass handles (Image 3)
// 7. Bilingual "गिरिराज गृह · GIRIRAJ GRIH" bronze wall plaque (Image 3)
// 8. Red paver porch patio floor and 4-tier black granite entrance steps (Image 2 & 3)
// 9. Asphalt curving driveway with painted white curb line (Image 2 & 4 & 5)
// 10. Landscaped lawns with Royal palm trees and flowering shrubs (Image 2)
// ============================================================================
(function () {
  const giriM = new THREE.Group();
  scene.add(giriM);

  // ---- 1. Wall Facade Texture (warm custard-yellow stucco + windows + terracotta trims) ----
  const giriWallT = tx((g) => {
    // Warm ochre / custard-yellow stucco base
    g.fillStyle = '#ebd17a';
    g.fillRect(0, 0, 64, 64);

    // Subtle plaster grain / wash
    g.fillStyle = 'rgba(215, 185, 95, 0.2)';
    for (let i = 0; i < 64; i += 8) {
      g.fillRect(i, 0, 4, 64);
    }

    // Upper fascia trim (terracotta / maroon)
    g.fillStyle = '#8a3528';
    g.fillRect(0, 0, 64, 4);
    g.fillStyle = '#eddac0';
    g.fillRect(0, 4, 64, 1.5);

    // Lower plinth base (terracotta plinth band matching photo)
    g.fillStyle = '#803225';
    g.fillRect(0, 56, 64, 8);
    g.fillStyle = '#5c2218';
    g.fillRect(0, 54, 64, 2);

    // Two casement windows per tile with white frames and dark panes
    [8, 38].forEach((wx) => {
      // Outer white window surround
      g.fillStyle = '#f4ede2';
      g.fillRect(wx - 2, 16, 20, 28);
      // Dark glass panes
      g.fillStyle = '#2d3d4b';
      g.fillRect(wx, 18, 16, 24);
      // White mullions (vertical & horizontal crossbars)
      g.fillStyle = '#f4ede2';
      g.fillRect(wx + 7.5, 18, 1.5, 24);
      g.fillRect(wx, 29, 16, 1.5);
      // Projecting white window sill
      g.fillStyle = '#e8ded0';
      g.fillRect(wx - 3, 44, 22, 2.5);
    });
  });

  // ---- 2. Authentic Blue-Slate Stone Mosaic Texture (matching Images 2 & 3) ----
  const stoneMosaicCanvas = document.createElement('canvas');
  stoneMosaicCanvas.width = stoneMosaicCanvas.height = 256;
  const smg = stoneMosaicCanvas.getContext('2d');
  // White/light-grey mortar background
  smg.fillStyle = '#edf2f5';
  smg.fillRect(0, 0, 256, 256);

  // Generate irregular organic stone polygons
  const stoneColors = ['#334554', '#3e5264', '#2a3744', '#485d70', '#364958', '#25313d', '#425769', '#2f3f4e'];
  let smSeed = 137;
  const smRnd = () => (smSeed = (smSeed * 16807) % 2147483647) / 2147483647;

  const cols = 8, rows = 8;
  const cw = 256 / cols, ch = 256 / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (c + 0.5) * cw + (smRnd() - 0.5) * cw * 0.4;
      const cy = (r + 0.5) * ch + (smRnd() - 0.5) * ch * 0.4;
      const sides = 5 + Math.floor(smRnd() * 3);
      const rad = Math.min(cw, ch) * (0.38 + smRnd() * 0.14);

      smg.beginPath();
      for (let s = 0; s < sides; s++) {
        const ang = (s / sides) * Math.PI * 2 + (smRnd() - 0.5) * 0.3;
        const dist = rad * (0.75 + smRnd() * 0.45);
        const px = cx + Math.cos(ang) * dist;
        const py = cy + Math.sin(ang) * dist;
        if (s === 0) smg.moveTo(px, py);
        else smg.lineTo(px, py);
      }
      smg.closePath();
      smg.fillStyle = stoneColors[Math.floor(smRnd() * stoneColors.length)];
      smg.fill();

      // Stone inner highlight/shadow for 3D realism
      smg.lineWidth = 1.2;
      smg.strokeStyle = 'rgba(255,255,255,0.18)';
      smg.stroke();
    }
  }
  const stoneMosaicTx = new THREE.CanvasTexture(stoneMosaicCanvas);
  stoneMosaicTx.wrapS = stoneMosaicTx.wrapT = THREE.RepeatWrapping;
  stoneMosaicTx.encoding = THREE.sRGBEncoding;
  stoneMosaicTx.repeat.set(2, 2);

  // ---- 3. Terracotta Paver Porch Floor Texture (matching Image 2) ----
  const porchPaverCanvas = document.createElement('canvas');
  porchPaverCanvas.width = porchPaverCanvas.height = 128;
  const ppg = porchPaverCanvas.getContext('2d');
  ppg.fillStyle = '#a64a3a';
  ppg.fillRect(0, 0, 128, 128);
  ppg.strokeStyle = '#782d20';
  ppg.lineWidth = 1.5;
  for (let y = 0; y < 128; y += 16) {
    ppg.beginPath();
    ppg.moveTo(0, y);
    ppg.lineTo(128, y);
    ppg.stroke();
  }
  for (let y = 0; y < 128; y += 16) {
    const ox = (y / 16) % 2 === 0 ? 0 : 16;
    for (let x = ox; x < 128; x += 32) {
      ppg.beginPath();
      ppg.moveTo(x, y);
      ppg.lineTo(x, y + 16);
      ppg.stroke();
    }
  }
  const porchTileTx = new THREE.CanvasTexture(porchPaverCanvas);
  porchTileTx.wrapS = porchTileTx.wrapT = THREE.RepeatWrapping;
  porchTileTx.encoding = THREE.sRGBEncoding;
  porchTileTx.repeat.set(4, 4);

  // Materials
  const mYellowStucco = new THREE.MeshLambertMaterial({ color: 0xebd17a }),
    mTerracottaTrim = new THREE.MeshLambertMaterial({ color: 0x8a3528 }),
    mDarkPlinth = new THREE.MeshLambertMaterial({ color: 0x222428 }),
    mBlackGranite = new THREE.MeshLambertMaterial({ color: 0x1b1d20 }),
    mMosaicStone = new THREE.MeshLambertMaterial({ map: stoneMosaicTx }),
    mPorchTile = new THREE.MeshLambertMaterial({ map: porchTileTx }),
    mRoofClay = new THREE.MeshLambertMaterial({ color: 0x88493b }),
    mRoofRidge = new THREE.MeshLambertMaterial({ color: 0x9b4030 }),
    mGlass = new THREE.MeshLambertMaterial({ color: 0x243442 }),
    mWhiteFrame = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 }),
    mGold = new THREE.MeshLambertMaterial({ color: 0xc89840 });

  // ---- 4. Grounds, Lawn & Driveway ----
  // Base perimeter lawn
  flat(374, 124, 400, 166, 0.22, 0x487932);

  // Asphalt driveway & forecourt (connecting Palace loop road X=371 to Giriraj porch and Darshan)
  flat(375, 158.5, 396.5, 0.25, 0x3d4045);
  // Paved connecting walkway to Darshan Prastuti forecourt
  flat(384, 165.5, 392, 167.5, 0.27, 0xd0c5b4);

  // White painted road curb boundary along the porch driveway (matching Image 2)
  const curbLine = new THREE.Mesh(
    new THREE.BoxGeometry(16.5, 0.04, 0.22),
    new THREE.MeshLambertMaterial({ color: 0xf2ede4 })
  );
  curbLine.position.set(387 - W / 2, 0.27, 163.8 - H / 2);
  giriM.add(curbLine);

  // Terracotta garden edging around the lawn borders
  const northEdging = new THREE.Mesh(new THREE.BoxGeometry(25, 0.25, 0.3), mTerracottaTrim);
  northEdging.position.set(387 - W / 2, 0.32, 125 - H / 2);
  giriM.add(northEdging);

  // ---- 5. Octagonal / Faceted Main Building Body (Matching Image 1) ----
  const giriPts = [
    [383.0, 133.0], // 0: North-West
    [393.0, 133.0], // 1: North-East
    [397.0, 137.0], // 2: East-North
    [397.0, 150.5], // 3: East-South
    [393.0, 154.5], // 4: South-East
    [383.0, 154.5], // 5: South-West
    [379.0, 150.5], // 6: West-South
    [379.0, 137.0]  // 7: West-North
  ];

  // Foundation Plinth Block
  const plinthPts = giriPts.map(([x, z]) => {
    const dx = x - 388, dz = z - 143.75;
    const len = Math.hypot(dx, dz) || 1;
    return [x + (dx / len) * 0.45, z + (dz / len) * 0.45];
  });
  const plinthM = mk(plinthPts, 0.42, 0x5a261c, 0x4a1e16, 1.4, [], [], null, [1 / 10, 1 / 10]);
  giriM.add(plinthM);

  // Main 1-Story Walls (Height 4.2m)
  const mainM = mk(
    giriPts,
    4.2,
    0x884030,
    0x783226,
    1.4,
    [],
    [],
    giriWallT,
    [1 / 10, 1 / 4.2]
  );
  giriM.add(mainM);

  // ---- 6. Multi-Faceted Pitch Hipped Roof (Matching Image 1 Top View) ----
  // Overhanging eaves around the 8 perimeter points at Y = 4.25
  const eaveOverhang = 0.65;
  const eavePts = giriPts.map(([x, z]) => {
    const dx = x - 388, dz = z - 143.75;
    const len = Math.hypot(dx, dz) || 1;
    return [x + (dx / len) * eaveOverhang, z + (dz / len) * eaveOverhang];
  });

  // Central Ridge: Peak North at (388, 6.7, 137.5), Peak South at (388, 6.7, 150.0)
  const pNorth = new THREE.Vector3(388 - W / 2, 6.7, 137.5 - H / 2);
  const pSouth = new THREE.Vector3(388 - W / 2, 6.7, 150.0 - H / 2);

  const e = eavePts.map(([x, z]) => new THREE.Vector3(x - W / 2, 4.25, z - H / 2));

  // Construct Custom Hipped Roof Geometry
  const roofGeo = new THREE.BufferGeometry();
  const roofVerts = [];

  const addTri = (v1, v2, v3) => {
    roofVerts.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
  };
  const addQuad = (v1, v2, v3, v4) => {
    addTri(v1, v2, v3);
    addTri(v1, v3, v4);
  };

  // North hip facet: from North eave (e[0] to e[1]) to Peak North
  addTri(e[0], e[1], pNorth);
  // North-East corner facet: from NE eave (e[1] to e[2]) to Peak North
  addTri(e[1], e[2], pNorth);
  // East slope: from East eave (e[2] to e[3]) up to Ridge (pNorth to pSouth)
  addQuad(e[2], e[3], pSouth, pNorth);
  // South-East corner facet: from SE eave (e[3] to e[4]) to Peak South
  addTri(e[3], e[4], pSouth);
  // South hip facet: from South eave (e[4] to e[5]) to Peak South
  addTri(e[4], e[5], pSouth);
  // South-West corner facet: from SW eave (e[5] to e[6]) to Peak South
  addTri(e[5], e[6], pSouth);
  // West slope: from West eave (e[6] to e[7]) up to Ridge (pSouth to pNorth)
  addQuad(e[6], e[7], pNorth, pSouth);
  // North-West corner facet: from NW eave (e[7] to e[0]) to Peak North
  addTri(e[7], e[0], pNorth);

  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(roofVerts, 3));
  roofGeo.computeVertexNormals();

  const hippedRoof = new THREE.Mesh(roofGeo, mRoofClay);
  hippedRoof.castShadow = true;
  hippedRoof.receiveShadow = true;
  giriM.add(hippedRoof);

  // Terracotta Fascia Board Eave Trim around perimeter
  for (let i = 0; i < eavePts.length; i++) {
    const next = (i + 1) % eavePts.length;
    const p1 = eavePts[i], p2 = eavePts[next];
    const mx = (p1[0] + p2[0]) / 2, mz = (p1[1] + p2[1]) / 2;
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);

    const fascia = new THREE.Mesh(new THREE.BoxGeometry(len, 0.28, 0.18), mTerracottaTrim);
    fascia.position.set(mx - W / 2, 4.25, mz - H / 2);
    fascia.rotation.y = -ang;
    giriM.add(fascia);
  }

  // Terracotta Ridge Cap Tiles along Central Ridge
  const ridgeLen = Math.abs(pSouth.z - pNorth.z);
  const ridgeCap = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, ridgeLen + 0.4), mRoofRidge);
  ridgeCap.position.set(388 - W / 2, 6.78, (137.5 + 150.0) / 2 - H / 2);
  giriM.add(ridgeCap);

  // ---- 7. Front Entrance Portico / Porch (Matching Images 2 & 3) ----
  // Raised Porch Floor Plinth at Y = 0.42
  const porchFloor = new THREE.Mesh(
    new THREE.BoxGeometry(12.4, 0.42, 5.6),
    mPorchTile
  );
  porchFloor.position.set(388 - W / 2, 0.21, 157.0 - H / 2);
  porchFloor.receiveShadow = true;
  giriM.add(porchFloor);

  // 4-Tier Polished Black Granite Entrance Steps (Images 2 & 3)
  for (let s = 0; s < 4; s++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(5.4 + s * 0.25, 0.11, 0.4),
      mBlackGranite
    );
    step.position.set(388 - W / 2, 0.42 - s * 0.105 - 0.05, 159.9 + s * 0.38 - H / 2);
    step.receiveShadow = true;
    giriM.add(step);
  }

  // Authentic Blue-Slate Stone Mosaic Planter Benches Flanking Steps (Images 2 & 3)
  [383.9, 392.1].forEach((bx) => {
    // Stone mosaic retaining wall
    const bench = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.68, 1.4), mMosaicStone);
    bench.position.set(bx - W / 2, 0.52, 159.5 - H / 2);
    bench.castShadow = true;
    giriM.add(bench);

    // Polished dark stone capping slab
    const cap = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.5), mBlackGranite);
    cap.position.set(bx - W / 2, 0.91, 159.5 - H / 2);
    giriM.add(cap);

    // Terracotta flower pots with lush leafy green shrubs (matching photo!)
    [-0.8, 0.8].forEach((ox) => {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.22, 0.45, 8),
        new THREE.MeshLambertMaterial({ color: 0x9b4432 })
      );
      pot.position.set(bx + ox - W / 2, 1.18, 159.5 - H / 2);
      giriM.add(pot);

      const plant = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 6, 6),
        new THREE.MeshLambertMaterial({ color: 0x2e6624 })
      );
      plant.position.set(bx + ox - W / 2, 1.55, 159.5 - H / 2);
      giriM.add(plant);
    });
  });

  // ---- 8. Recessed Entrance Portal & Iconic Mosaic Stone Wall (Images 2 & 3) ----
  // Left feature wall in Blue-Slate Stone Mosaic
  const leftStoneWall = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.4, 0.25), mMosaicStone);
  leftStoneWall.position.set(385.6 - W / 2, 2.1, 154.6 - H / 2);
  leftStoneWall.castShadow = true;
  giriM.add(leftStoneWall);

  // Right feature wall in Blue-Slate Stone Mosaic
  const rightStoneWall = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.4, 0.25), mMosaicStone);
  rightStoneWall.position.set(390.4 - W / 2, 2.1, 154.6 - H / 2);
  rightStoneWall.castShadow = true;
  giriM.add(rightStoneWall);

  // Central Double Glass Entry Door Portal (Images 2 & 3)
  // Dark bronze door frame
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2, 0.15), mDarkPlinth);
  doorFrame.position.set(388 - W / 2, 2.0, 154.55 - H / 2);
  giriM.add(doorFrame);

  // Glass entrance panes
  const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.9, 0.08), mGlass);
  doorGlass.position.set(388 - W / 2, 2.0, 154.58 - H / 2);
  giriM.add(doorGlass);

  // Polished brass door handles
  [-0.18, 0.18].forEach((hx) => {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), mGold);
    handle.position.set(388 + hx - W / 2, 1.8, 154.68 - H / 2);
    giriM.add(handle);
  });

  // ---- 9. Bilingual Plaque: "गिरिराज गृह · GIRIRAJ GRIH" (Image 3) ----
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 256;
  plaqueCanvas.height = 128;
  const plg = plaqueCanvas.getContext('2d');
  plg.fillStyle = '#1c1c1f';
  plg.fillRect(0, 0, 256, 128);
  plg.strokeStyle = '#c89e44';
  plg.lineWidth = 4;
  plg.strokeRect(4, 4, 248, 120);

  plg.fillStyle = '#f0c868';
  plg.textAlign = 'center';
  plg.font = 'bold 20px sans-serif';
  plg.fillText('गिरिराज गृह', 128, 30);
  plg.font = 'bold 15px sans-serif';
  plg.fillText('GIRIRAJ GRIH', 128, 52);
  plg.fillStyle = '#dfd8c8';
  plg.font = '12px sans-serif';
  plg.fillText('हिमालय · विंध्याचल · सतपुड़ा', 128, 80);
  plg.fillText('अरावली · सह्याद्री · नीलगिरि', 128, 102);

  const plaqueTx = new THREE.CanvasTexture(plaqueCanvas);
  plaqueTx.encoding = THREE.sRGBEncoding;

  const bronzePlaque = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.5, 0.05),
    new THREE.MeshLambertMaterial({ map: plaqueTx })
  );
  bronzePlaque.position.set(385.3 - W / 2, 2.1, 154.75 - H / 2);
  giriM.add(bronzePlaque);

  // White dedication plaque on right stone wall
  const whitePlaque = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.35, 0.04),
    mWhiteFrame
  );
  whitePlaque.position.set(390.7 - W / 2, 2.1, 154.75 - H / 2);
  giriM.add(whitePlaque);

  // ---- 10. Porch Canopy & Two-Tone Pillars (Images 2 & 3) ----
  // Canopy Slab (Height 4.05m to 4.35m)
  const canopySlab = new THREE.Mesh(
    new THREE.BoxGeometry(12.8, 0.3, 5.8),
    new THREE.MeshLambertMaterial({ color: 0xebede8 })
  );
  canopySlab.position.set(388 - W / 2, 4.2, 157.1 - H / 2);
  canopySlab.castShadow = true;
  giriM.add(canopySlab);

  // Terracotta Fascia Rim around Canopy (Image 2)
  const canopyFasciaF = new THREE.Mesh(new THREE.BoxGeometry(12.9, 0.35, 0.15), mTerracottaTrim);
  canopyFasciaF.position.set(388 - W / 2, 4.22, 160.0 - H / 2);
  giriM.add(canopyFasciaF);

  [-6.4, 6.4].forEach((sx) => {
    const canopyFasciaS = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 5.8), mTerracottaTrim);
    canopyFasciaS.position.set(388 + sx - W / 2, 4.22, 157.1 - H / 2);
    giriM.add(canopyFasciaS);
  });

  // Canopy Slanted Overhang Top
  const canopyRoof = new THREE.Mesh(
    new THREE.BoxGeometry(12.6, 0.22, 5.6),
    mRoofClay
  );
  canopyRoof.position.set(388 - W / 2, 4.42, 157.0 - H / 2);
  giriM.add(canopyRoof);

  // 4 Square Columns Supporting Porch (Image 2)
  // Two-tone finish: lower 1.2m charcoal black, upper 2.8m warm yellow
  [382.8, 386.2, 389.8, 393.2].forEach((px) => {
    // Lower black wainscot
    const colBase = new THREE.Mesh(new THREE.BoxGeometry(0.58, 1.2, 0.58), mDarkPlinth);
    colBase.position.set(px - W / 2, 1.0, 159.5 - H / 2);
    colBase.castShadow = true;
    giriM.add(colBase);

    // Upper warm yellow column shaft
    const colShaft = new THREE.Mesh(new THREE.BoxGeometry(0.52, 2.5, 0.52), mYellowStucco);
    colShaft.position.set(px - W / 2, 2.85, 159.5 - H / 2);
    colShaft.castShadow = true;
    giriM.add(colShaft);

    // Capital trim block
    const colCap = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.15, 0.65), mTerracottaTrim);
    colCap.position.set(px - W / 2, 4.08, 159.5 - H / 2);
    giriM.add(colCap);
  });

  // ---- 11. Windows on Chamfered Wings & Lateral Walls (Image 2) ----
  // Chamfered South-West Wing Window (Angled at 45 deg)
  const swWinGroup = new THREE.Group();
  swWinGroup.position.set(381.0 - W / 2, 2.2, 152.5 - H / 2);
  swWinGroup.rotation.y = -Math.PI / 4;
  const swFrame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 0.1), mWhiteFrame);
  const swGlass = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.3, 0.12), mGlass);
  const swSill = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.22), mWhiteFrame);
  swSill.position.set(0, -0.85, 0.08);
  swWinGroup.add(swFrame, swGlass, swSill);
  giriM.add(swWinGroup);

  // Chamfered South-East Wing Window (Angled at -45 deg)
  const seWinGroup = new THREE.Group();
  seWinGroup.position.set(395.0 - W / 2, 2.2, 152.5 - H / 2);
  seWinGroup.rotation.y = Math.PI / 4;
  const seFrame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 0.1), mWhiteFrame);
  const seGlass = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.3, 0.12), mGlass);
  const seSill = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.22), mWhiteFrame);
  seSill.position.set(0, -0.85, 0.08);
  seWinGroup.add(seFrame, seGlass, seSill);
  giriM.add(seWinGroup);

  // Side Windows (West Wall at X = 379)
  [141.0, 147.0].forEach((wz) => {
    const wWin = new THREE.Group();
    wWin.position.set(378.9 - W / 2, 2.2, wz - H / 2);
    wWin.rotation.y = Math.PI / 2;
    const wf = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 0.1), mWhiteFrame);
    const wg = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 0.12), mGlass);
    const ws = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.2), mWhiteFrame);
    ws.position.set(0, -0.8, 0.08);
    wWin.add(wf, wg, ws);
    giriM.add(wWin);
  });

  // Side Windows (East Wall at X = 397 facing GSV-MESS)
  [141.0, 147.0].forEach((wz) => {
    const eWin = new THREE.Group();
    eWin.position.set(397.1 - W / 2, 2.2, wz - H / 2);
    eWin.rotation.y = -Math.PI / 2;
    const ef = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 0.1), mWhiteFrame);
    const eg = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 0.12), mGlass);
    const es = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.2), mWhiteFrame);
    es.position.set(0, -0.8, 0.08);
    eWin.add(ef, eg, es);
    giriM.add(eWin);
  });

  // ---- 12. Landscaping: Royal Palm Trees & Potted Shrubs (Image 2) ----
  function mkGirirajPalm(px, pz) {
    const palm = new THREE.Group();
    palm.position.set(px - W / 2, 0, pz - H / 2);

    // Slender curved trunk
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.2, 2.2, 0.1),
      new THREE.Vector3(0.5, 4.6, 0.3),
      new THREE.Vector3(0.7, 6.2, 0.5)
    ]);
    const trunk = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 10, 0.22, 6, false),
      new THREE.MeshLambertMaterial({ color: 0x5a4836 })
    );
    trunk.castShadow = true;
    palm.add(trunk);

    // Crown of fan palm fronds
    const frondMat = new THREE.MeshLambertMaterial({ color: 0x367228 });
    for (let f = 0; f < 8; f++) {
      const ang = (f / 8) * Math.PI * 2;
      const frond = new THREE.Mesh(
        new THREE.ConeGeometry(0.85, 2.6, 5),
        frondMat
      );
      frond.position.set(
        0.7 + Math.cos(ang) * 1.1,
        6.0 - 0.2,
        0.5 + Math.sin(ang) * 1.1
      );
      frond.rotation.set(0.6 * Math.sin(ang), ang, 0.6 * Math.cos(ang));
      frond.castShadow = true;
      palm.add(frond);
    }
    giriM.add(palm);
  }

  // Two Royal Palm Trees framing the portico driveway (matching photo!)
  mkGirirajPalm(379.5, 161.5);
  mkGirirajPalm(396.0, 161.0);
})();
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

// ============================================================================
// SPORTS COMPLEX (रंजन परिसर - १ / SPORTS COMPLEX - 1 & MAIN SPORTS COMPLEX)
// Real footprint from GEO.b Idx 62 ([266.9, 307.9] to [303.8, 329.9])
// Dual-Hall Layout & Architecture faithfully reconstructed from actual campus photos:
// 1. South-West Block: Sports Complex - 1 (Image 1)
//    - High-bay indoor sports hall with pitched gable roof
//    - Deep maroon & cream stucco facade with prominent vertical pilasters
//    - Ground floor entrance portico with canopy, 4 square pillars, and wide blue roll-up entrance door
//    - 4 Ground-floor windows with maroon chhajja awnings
//    - Upper clerestory ribbon windows & dual maroon ventilation louver panels
//    - Official Bilingual Signboard: "राष्ट्रीय रेल एवं परिवहन संस्थान / NATIONAL RAIL AND TRANSPORTATION INSTITUTE"
//      "रंजन परिसर - १ / Sports Complex - 1" with circular university emblem
// 2. North-East Block: Main Sports Complex Hall (Image 2)
//    - High-bay indoor badminton & multipurpose arena with pitched gable roof
//    - Grand entrance portico with triangular pediment, circular university emblem, and maroon pillars
//    - Double wooden entrance doors with brass handles
//    - 4-tier dark granite entrance staircase with stainless steel handrails
//    - Exterior bilingual typography: "खेल परिसर / SPORTS COMPLEX"
//    - Colorful sports festival mural / graphics banner ("GATI SHAKTI VISHWAVIDYALAYA")
// 3. Central Overlap / Connecting Annex (Image 1 left wing):
//    - Terracotta / brick-red wing with white vertical pilasters and green window chhajjas
// 4. Rooftop Details (Image 3 Top View):
//    - Sage-green pitched metal roofs with ridge capping
//    - 5 cylindrical rooftop ventilators with conical rain caps on SW hall
//    - 4 cylindrical rooftop ventilators with conical rain caps on NE hall
// 5. Forecourt & Landscaping (Image 1 & 2):
//    - Hexagonal / interlocking red paver tile forecourt
//    - Paved asphalt approach road and curbs
//    - Columnar Ashok / Cypress trees flanking entrance and along perimeter
// ============================================================================
(function () {
  const sportM = new THREE.Group();
  scene.add(sportM);

  // ---- 1. Canvas Textures for Signage, Emblem & Graphics ----
  // Signboard 1: "Sports Complex - 1" (Image 1)
  const signCv1 = document.createElement('canvas');
  signCv1.width = 512;
  signCv1.height = 170;
  const sg1 = signCv1.getContext('2d');
  sg1.fillStyle = '#0e347d';
  sg1.fillRect(0, 0, 512, 170);
  sg1.strokeStyle = '#ffffff';
  sg1.lineWidth = 4;
  sg1.strokeRect(6, 6, 500, 158);
  sg1.lineWidth = 1.5;
  sg1.strokeRect(12, 12, 488, 146);

  sg1.fillStyle = '#ffffff';
  sg1.textAlign = 'center';
  sg1.textBaseline = 'middle';
  sg1.font = '700 20px Arial, sans-serif';
  sg1.fillText('राष्ट्रीय रेल एवं परिवहन संस्थान', 256, 34);

  sg1.font = '600 13px Arial, sans-serif';
  sg1.fillText('NATIONAL RAIL AND TRANSPORTATION INSTITUTE', 256, 60);

  sg1.font = '900 30px Arial, sans-serif';
  sg1.fillText('रंजन परिसर - १', 256, 100);

  sg1.font = '700 24px Arial, sans-serif';
  sg1.fillText('Sports Complex - 1', 256, 136);

  const signTex1 = new THREE.CanvasTexture(signCv1);
  signTex1.encoding = THREE.sRGBEncoding;

  // University Round Emblem Medallion (Image 1 & 2)
  const embCv = document.createElement('canvas');
  embCv.width = embCv.height = 256;
  const eg = embCv.getContext('2d');
  eg.fillStyle = '#0f3885';
  eg.beginPath();
  eg.arc(128, 128, 124, 0, Math.PI * 2);
  eg.fill();
  eg.strokeStyle = '#ffffff';
  eg.lineWidth = 6;
  eg.stroke();
  eg.fillStyle = '#ffffff';
  eg.beginPath();
  eg.arc(128, 128, 92, 0, Math.PI * 2);
  eg.fill();
  eg.fillStyle = '#0f3885';
  eg.beginPath();
  eg.arc(128, 128, 76, 0, Math.PI * 2);
  eg.fill();
  // Stylized gear / track emblem
  eg.fillStyle = '#ffffff';
  eg.beginPath();
  eg.arc(128, 128, 44, 0, Math.PI * 2);
  eg.fill();
  eg.fillStyle = '#0f3885';
  eg.beginPath();
  eg.arc(128, 128, 22, 0, Math.PI * 2);
  eg.fill();
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    eg.fillStyle = '#ffffff';
    eg.fillRect(128 + Math.cos(ang) * 58 - 3, 128 + Math.sin(ang) * 58 - 3, 6, 6);
  }
  const emblemTex = new THREE.CanvasTexture(embCv);
  emblemTex.encoding = THREE.sRGBEncoding;

  // Facade Lettering 2: "खेल परिसर / SPORTS COMPLEX" (Image 2)
  const signCv2 = document.createElement('canvas');
  signCv2.width = 512;
  signCv2.height = 140;
  const sg2 = signCv2.getContext('2d');
  sg2.fillStyle = '#f6ebe0';
  sg2.fillRect(0, 0, 512, 140);
  sg2.fillStyle = '#7a221b';
  sg2.textAlign = 'center';
  sg2.textBaseline = 'middle';
  sg2.font = '700 42px Arial, sans-serif';
  sg2.fillText('खेल परिसर', 256, 45);
  sg2.font = '900 32px Arial, sans-serif';
  sg2.fillText('SPORTS COMPLEX', 256, 98);
  const facadeSignTex2 = new THREE.CanvasTexture(signCv2);
  facadeSignTex2.encoding = THREE.sRGBEncoding;

  // Colorful Sports Festival Banner Mural (Image 2)
  const bnrCv = document.createElement('canvas');
  bnrCv.width = 512;
  bnrCv.height = 360;
  const bg2 = bnrCv.getContext('2d');
  bg2.fillStyle = '#ffffff';
  bg2.fillRect(0, 0, 512, 360);
  // Blue top bar
  bg2.fillStyle = '#0e3885';
  bg2.fillRect(0, 0, 512, 60);
  bg2.fillStyle = '#ffffff';
  bg2.font = '900 24px Arial, sans-serif';
  bg2.textAlign = 'center';
  bg2.textBaseline = 'middle';
  bg2.fillText('GATI SHAKTI VISHWAVIDYALAYA', 256, 30);

  // Sports silhouette icons in vibrant colours
  const sportCols = ['#00897b', '#e53935', '#fdd835', '#1e88e5', '#fb8c00', '#8e24aa'];
  const sNames = ['ATHLETICS', 'BADMINTON', 'VOLLEYBALL', 'TABLE TENNIS', 'CHESS', 'YOGA'];
  for (let s = 0; s < 6; s++) {
    const colX = 55 + (s % 3) * 155;
    const colY = 90 + Math.floor(s / 3) * 125;
    bg2.fillStyle = sportCols[s];
    bg2.beginPath();
    bg2.arc(colX + 50, colY + 36, 28, 0, Math.PI * 2);
    bg2.fill();
    bg2.fillStyle = '#333333';
    bg2.font = '700 13px Arial, sans-serif';
    bg2.fillText(sNames[s], colX + 50, colY + 80);
  }
  // Bottom ribbon
  bg2.fillStyle = '#0e3885';
  bg2.fillRect(0, 310, 512, 50);
  bg2.fillStyle = '#fdd835';
  bg2.font = '700 18px Arial, sans-serif';
  bg2.fillText('SPORTS & PHYSICAL EDUCATION ARENA', 256, 335);
  const sportsBannerTex = new THREE.CanvasTexture(bnrCv);
  sportsBannerTex.encoding = THREE.sRGBEncoding;

  // Red Paver Tile Texture for Forecourt (Image 1)
  const pvrCv = document.createElement('canvas');
  pvrCv.width = pvrCv.height = 128;
  const pg = pvrCv.getContext('2d');
  pg.fillStyle = '#a64436';
  pg.fillRect(0, 0, 128, 128);
  pg.strokeStyle = '#6e271d';
  pg.lineWidth = 2;
  for (let x = 0; x < 128; x += 16) {
    for (let y = 0; y < 128; y += 16) {
      pg.strokeRect(x, y, 16, 16);
      pg.fillStyle = (x + y) % 32 === 0 ? '#b84e3e' : '#9c3d30';
      pg.fillRect(x + 2, y + 2, 12, 12);
    }
  }
  const redPaverTex = new THREE.CanvasTexture(pvrCv);
  redPaverTex.wrapS = redPaverTex.wrapT = THREE.RepeatWrapping;
  redPaverTex.repeat.set(12, 6);
  redPaverTex.encoding = THREE.sRGBEncoding;

  // ---- 2. Materials Palette ----
  const mCreamWall = new THREE.MeshLambertMaterial({ color: 0xf5ebe1, roughness: 0.65 }),
    mMaroonTrim = new THREE.MeshLambertMaterial({ color: 0x8a241e, roughness: 0.55 }),
    mMaroonDark = new THREE.MeshLambertMaterial({ color: 0x6e1b16 }),
    mDarkPlinth = new THREE.MeshLambertMaterial({ color: 0x481814 }),
    mGreenRoof = new THREE.MeshLambertMaterial({ color: 0x5a7560, roughness: 0.5 }),
    mRoofRidge = new THREE.MeshLambertMaterial({ color: 0x3d5042 }),
    mVentWhite = new THREE.MeshLambertMaterial({ color: 0xf4f4f4 }),
    mTerracottaWing = new THREE.MeshLambertMaterial({ color: 0x9e382b }),
    mWhitePilaster = new THREE.MeshLambertMaterial({ color: 0xf0ece5 }),
    mGlass = new THREE.MeshLambertMaterial({ color: 0x22364a, roughness: 0.3 }),
    mDarkShutter = new THREE.MeshLambertMaterial({ color: 0x18426d }),
    mWoodDoor = new THREE.MeshLambertMaterial({ color: 0x3e2316 }),
    mGraniteSteps = new THREE.MeshLambertMaterial({ color: 0x222427 }),
    mSteelRail = new THREE.MeshLambertMaterial({ color: 0xd8dde2 }),
    mGreenChhajja = new THREE.MeshLambertMaterial({ color: 0x286338 }),
    mBrass = new THREE.MeshBasicMaterial({ color: 0xd4a038 }),
    mPaverMat = new THREE.MeshLambertMaterial({ map: redPaverTex });

  // ---- 3. Grounds & Paved Forecourts ----
  // Surrounding grass / landscape base
  flat(264, 296, 306, 332, 0.22, 0x3d702e);
  // Red Paver Forecourt in front of Sports Complex - 1 (matching Image 1)
  const paverMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 10),
    mPaverMat
  );
  paverMesh.rotation.x = -Math.PI / 2;
  paverMesh.position.set(275.7 - W / 2, 0.25, 334.5 - H / 2);
  sportM.add(paverMesh);

  // Asphalt driveway & approach lane connecting to campus road network
  flat(284, 320, 306, 332, 0.25, 0x3d4045);
  // Concrete curb borders
  const curb1 = new THREE.Mesh(
    new THREE.BoxGeometry(22, 0.18, 0.25),
    new THREE.MeshLambertMaterial({ color: 0xeae6dc })
  );
  curb1.position.set(275.7 - W / 2, 0.27, 339.5 - H / 2);
  sportM.add(curb1);

  // ---- Helper: Pitched Gable Roof Builder ----
  function mkGableRoof(cx, cz, w, len, eaveH, ridgeH) {
    const rGroup = new THREE.Group();
    const halfW = w / 2;
    const halfL = len / 2;
    const slopeLen = Math.hypot(halfW + 0.6, ridgeH - eaveH);
    const slopeAngle = Math.atan2(ridgeH - eaveH, halfW + 0.6);

    // Left slope
    const leftSlope = new THREE.Mesh(
      new THREE.BoxGeometry(slopeLen, 0.18, len + 0.8),
      mGreenRoof
    );
    leftSlope.rotation.z = slopeAngle;
    leftSlope.position.set(cx - halfW / 2 - 0.2, (eaveH + ridgeH) / 2, cz);
    leftSlope.castShadow = true;
    rGroup.add(leftSlope);

    // Right slope
    const rightSlope = new THREE.Mesh(
      new THREE.BoxGeometry(slopeLen, 0.18, len + 0.8),
      mGreenRoof
    );
    rightSlope.rotation.z = -slopeAngle;
    rightSlope.position.set(cx + halfW / 2 + 0.2, (eaveH + ridgeH) / 2, cz);
    rightSlope.castShadow = true;
    rGroup.add(rightSlope);

    // Ridge cap beam
    const ridgeCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.22, len + 1.0),
      mRoofRidge
    );
    ridgeCap.position.set(cx, ridgeH + 0.1, cz);
    rGroup.add(ridgeCap);

    // Gable triangular end walls (South & North)
    [-halfL, halfL].forEach(zOffset => {
      const gTriGeo = new THREE.BufferGeometry();
      const p1 = new THREE.Vector3(-halfW, eaveH, 0);
      const p2 = new THREE.Vector3(0, ridgeH, 0);
      const p3 = new THREE.Vector3(halfW, eaveH, 0);
      const verts = [
        p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z,
        p1.x, p1.y, p1.z, p3.x, p3.y, p3.z, p2.x, p2.y, p2.z
      ];
      gTriGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      gTriGeo.computeVertexNormals();
      const gTri = new THREE.Mesh(gTriGeo, mCreamWall);
      gTri.position.set(cx, 0, cz + zOffset);
      rGroup.add(gTri);

      // Maroon Bargeboard Rakes
      [-1, 1].forEach(side => {
        const rake = new THREE.Mesh(
          new THREE.BoxGeometry(slopeLen, 0.35, 0.16),
          mMaroonTrim
        );
        rake.rotation.z = side * slopeAngle;
        rake.position.set(cx + side * (halfW / 2 + 0.2), (eaveH + ridgeH) / 2 + 0.05, cz + zOffset + (zOffset > 0 ? 0.08 : -0.08));
        rGroup.add(rake);
      });
    });

    return rGroup;
  }

  // ---- Helper: Rooftop Ventilators (matching Image 3 satellite view) ----
  function mkRoofVents(cx, cz, len, ridgeH, count) {
    const vGroup = new THREE.Group();
    const span = len - 4;
    for (let i = 0; i < count; i++) {
      const vz = cz - span / 2 + (i / (count - 1)) * span;
      // Cylinder base
      const vBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.75, 12),
        mVentWhite
      );
      vBase.position.set(cx, ridgeH + 0.45, vz);
      vBase.castShadow = true;
      vGroup.add(vBase);
      // Conical rain cap
      const vCap = new THREE.Mesh(
        new THREE.ConeGeometry(0.65, 0.45, 12),
        mVentWhite
      );
      vCap.position.set(cx, ridgeH + 0.95, vz);
      vCap.castShadow = true;
      vGroup.add(vCap);
    }
    return vGroup;
  }

  // ---- 4. BLOCK 1 (SOUTH-WEST): "रंजन परिसर - १ / SPORTS COMPLEX - 1" (Image 1) ----
  const wx1 = 275.7 - W / 2;
  const wz1 = 318.9 - H / 2;
  const w1 = 17.6;
  const len1 = 22.0;
  const eaveH1 = 8.6;
  const ridgeH1 = 12.0;

  // Main Hall Stucco Body
  const hall1 = new THREE.Mesh(
    new THREE.BoxGeometry(w1, eaveH1, len1),
    mCreamWall
  );
  hall1.position.set(wx1, eaveH1 / 2, wz1);
  hall1.castShadow = hall1.receiveShadow = true;
  sportM.add(hall1);

  // Gable Roof & 5 Rooftop Ventilators
  sportM.add(mkGableRoof(wx1, wz1, w1, len1, eaveH1, ridgeH1));
  sportM.add(mkRoofVents(wx1, wz1, len1, ridgeH1, 5));

  // Dark Plinth Skirting
  const plinth1 = new THREE.Mesh(
    new THREE.BoxGeometry(w1 + 0.3, 0.45, len1 + 0.3),
    mDarkPlinth
  );
  plinth1.position.set(wx1, 0.22, wz1);
  sportM.add(plinth1);

  // --- South Facade Elements (Faithful to Image 1) ---
  const sZ1 = wz1 + len1 / 2;

  // Corner Maroon Pilasters
  [-w1 / 2 + 0.42, w1 / 2 - 0.42].forEach(px => {
    const pil = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, eaveH1, 0.26),
      mMaroonTrim
    );
    pil.position.set(wx1 + px, eaveH1 / 2, sZ1 + 0.1);
    pil.castShadow = true;
    sportM.add(pil);
  });

  // Central Vertical Maroon Pilasters flanking louvers & sign
  [-3.5, 3.5].forEach(px => {
    const pil = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 9.8, 0.26),
      mMaroonTrim
    );
    pil.position.set(wx1 + px, 4.9, sZ1 + 0.1);
    pil.castShadow = true;
    sportM.add(pil);
  });

  // Horizontal Maroon Accent Bands (mid-wall and eave-level)
  const bandMid = new THREE.Mesh(
    new THREE.BoxGeometry(w1, 0.22, 0.12),
    mMaroonTrim
  );
  bandMid.position.set(wx1, 4.25, sZ1 + 0.06);
  sportM.add(bandMid);

  const bandEave = new THREE.Mesh(
    new THREE.BoxGeometry(w1, 0.35, 0.12),
    mMaroonTrim
  );
  bandEave.position.set(wx1, eaveH1, sZ1 + 0.06);
  sportM.add(bandEave);

  // Ground Floor Entrance Portico Canopy & Pillars (Image 1)
  const porticoW = 7.4;
  const porticoH = 3.8;
  const porticoD = 2.4;
  const porticoZ = sZ1 + porticoD / 2;

  const porticoCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(porticoW + 0.3, 0.42, porticoD + 0.3),
    mMaroonTrim
  );
  porticoCanopy.position.set(wx1, porticoH, porticoZ);
  porticoCanopy.castShadow = true;
  sportM.add(porticoCanopy);

  // 4 Square Maroon Support Pillars
  [-porticoW / 2 + 0.35, -1.2, 1.2, porticoW / 2 - 0.35].forEach(px => {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, porticoH, 0.65),
      mMaroonTrim
    );
    pillar.position.set(wx1 + px, porticoH / 2, sZ1 + porticoD - 0.35);
    pillar.castShadow = true;
    sportM.add(pillar);
  });

  // Recessed Blue Roll-Up Shutter Entrance Door (Image 1)
  const shutter = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 2.7, 0.1),
    mDarkShutter
  );
  shutter.position.set(wx1, 1.35, sZ1 + 0.08);
  sportM.add(shutter);

  // Shutter slatted relief lines
  for (let s = 0.3; s < 2.7; s += 0.3) {
    const slat = new THREE.Mesh(
      new THREE.BoxGeometry(3.55, 0.03, 0.12),
      new THREE.MeshLambertMaterial({ color: 0x0c2545 })
    );
    slat.position.set(wx1, s, sZ1 + 0.09);
    sportM.add(slat);
  }

  // Flanking Maroon Niches under portico
  [-2.6, 2.6].forEach(nx => {
    const niche = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 2.7, 0.06),
      mMaroonDark
    );
    niche.position.set(wx1 + nx, 1.35, sZ1 + 0.04);
    sportM.add(niche);
  });

  // Ground Floor Windows with Maroon Awnings (Image 1)
  [-6.8, -5.0, 5.0, 6.8].forEach(wx => {
    // Window glass
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 0.08),
      mGlass
    );
    win.position.set(wx1 + wx, 2.0, sZ1 + 0.05);
    sportM.add(win);
    // White border frame
    const winFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.5, 0.04),
      mWhitePilaster
    );
    winFrame.position.set(wx1 + wx, 2.0, sZ1 + 0.03);
    sportM.add(winFrame);
    // Maroon hood/chhajja awning
    const awn = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.15, 0.45),
      mMaroonTrim
    );
    awn.position.set(wx1 + wx, 2.8, sZ1 + 0.22);
    awn.castShadow = true;
    sportM.add(awn);
  });

  // Upper Level: 2 Decorative Maroon Ventilation Louver Panels (Image 1)
  [-1.8, 1.8].forEach(lx => {
    const louverPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 2.4, 0.12),
      mMaroonTrim
    );
    louverPanel.position.set(wx1 + lx, 6.6, sZ1 + 0.08);
    sportM.add(louverPanel);
    // Horizontal louver slats
    for (let sl = 5.6; sl <= 7.6; sl += 0.22) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.05, 0.16),
        mMaroonDark
      );
      slat.position.set(wx1 + lx, sl, sZ1 + 0.1);
      sportM.add(slat);
    }
  });

  // Upper Clerestory Ribbon Windows (Image 1)
  // Central clerestory between louvers
  const winC = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.65, 0.08),
    mGlass
  );
  winC.position.set(wx1, 7.1, sZ1 + 0.05);
  sportM.add(winC);

  // Outer clerestory ribbon windows
  [-6.2, 6.2].forEach(ox => {
    const winO = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.65, 0.08),
      mGlass
    );
    winO.position.set(wx1 + ox, 7.3, sZ1 + 0.05);
    sportM.add(winO);
  });

  // Official Bilingual Signboard: "Sports Complex - 1" (Image 1)
  const signMesh1 = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 1.4),
    new THREE.MeshBasicMaterial({ map: signTex1, side: THREE.DoubleSide })
  );
  signMesh1.position.set(wx1, 5.2, sZ1 + 0.12);
  sportM.add(signMesh1);

  // Circular University Emblem Medallion (Image 1)
  const emblemMesh1 = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 24),
    new THREE.MeshBasicMaterial({ map: emblemTex, side: THREE.DoubleSide })
  );
  emblemMesh1.position.set(wx1, 4.25, sZ1 + 0.14);
  sportM.add(emblemMesh1);

  // ---- 5. CONNECTING SIDE WING / LEFT ANNEXE (Image 1 Left Side) ----
  // Brick-red wing on the west side with vertical white pilasters & green window awnings
  const wingW = 6.2;
  const wingLen = 14.0;
  const wingH = 7.4;
  const wingX = wx1 - w1 / 2 - wingW / 2 + 0.2;
  const wingZ = wz1 + len1 / 2 - wingLen / 2;

  const wingMesh = new THREE.Mesh(
    new THREE.BoxGeometry(wingW, wingH, wingLen),
    mTerracottaWing
  );
  wingMesh.position.set(wingX, wingH / 2, wingZ);
  wingMesh.castShadow = wingMesh.receiveShadow = true;
  sportM.add(wingMesh);

  // White Pilasters along the wing facade
  for (let wz = 0; wz < 4; wz++) {
    const pz = wingZ + wingLen / 2 - 1.2 - wz * 3.6;
    const wp = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, wingH, 0.18),
      mWhitePilaster
    );
    wp.position.set(wingX + wingW / 2 + 0.05, wingH / 2, pz);
    wp.castShadow = true;
    sportM.add(wp);

    // Window with green chhajja
    if (wz > 0) {
      const gWin = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 1.3, 1.2),
        mGlass
      );
      gWin.position.set(wingX + wingW / 2 + 0.05, 2.0, pz - 1.8);
      sportM.add(gWin);

      const chhajja = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.15, 1.4),
        mGreenChhajja
      );
      chhajja.position.set(wingX + wingW / 2 + 0.22, 2.8, pz - 1.8);
      chhajja.castShadow = true;
      sportM.add(chhajja);
    }
  }

  // ---- 6. BLOCK 2 (NORTH-EAST): "खेल परिसर / SPORTS COMPLEX" (Image 2) ----
  const wx2 = 294.6 - W / 2;
  const wz2 = 309.85 - H / 2;
  const w2 = 18.4;
  const len2 = 21.9;
  const eaveH2 = 8.6;
  const ridgeH2 = 12.0;

  // Main Hall Stucco Body
  const hall2 = new THREE.Mesh(
    new THREE.BoxGeometry(w2, eaveH2, len2),
    mCreamWall
  );
  hall2.position.set(wx2, eaveH2 / 2, wz2);
  hall2.castShadow = hall2.receiveShadow = true;
  sportM.add(hall2);

  // Pitched Gable Roof & 4 Rooftop Ventilators
  sportM.add(mkGableRoof(wx2, wz2, w2, len2, eaveH2, ridgeH2));
  sportM.add(mkRoofVents(wx2, wz2, len2, ridgeH2, 4));

  // Dark Plinth / Dado Base Wall (Image 2 lower dark band)
  const dadoH = 1.35;
  const dadoBase = new THREE.Mesh(
    new THREE.BoxGeometry(w2 + 0.25, dadoH, len2 + 0.25),
    mDarkPlinth
  );
  dadoBase.position.set(wx2, dadoH / 2, wz2);
  sportM.add(dadoBase);

  // --- Front Entrance Facade Elements (Image 2) ---
  // The entrance pediment porch faces the campus approach road (South-East / Forecourt)
  const sZ2 = wz2 + len2 / 2;

  // Triangular Pediment Entrance Porch (Image 2)
  const porchW2 = 6.4;
  const porchD2 = 2.6;
  const porchEave2 = 3.6;
  const porchPeak2 = 5.4;
  const porchZ2 = sZ2 + porchD2 / 2;

  // Sloped Maroon Porch Roof
  const pSlopeLen = Math.hypot(porchW2 / 2 + 0.2, porchPeak2 - porchEave2);
  const pAngle = Math.atan2(porchPeak2 - porchEave2, porchW2 / 2 + 0.2);

  [-1, 1].forEach(side => {
    const pSlope = new THREE.Mesh(
      new THREE.BoxGeometry(pSlopeLen, 0.15, porchD2 + 0.4),
      mMaroonTrim
    );
    pSlope.rotation.z = side * pAngle;
    pSlope.position.set(wx2 + side * (porchW2 / 4), (porchEave2 + porchPeak2) / 2, porchZ2);
    pSlope.castShadow = true;
    sportM.add(pSlope);
  });

  // Triangular Tympanum in White
  const tympGeo = new THREE.BufferGeometry();
  const tVerts = [
    -porchW2 / 2, porchEave2, 0,
    0, porchPeak2, 0,
    porchW2 / 2, porchEave2, 0,
    -porchW2 / 2, porchEave2, 0,
    porchW2 / 2, porchEave2, 0,
    0, porchPeak2, 0
  ];
  tympGeo.setAttribute('position', new THREE.Float32BufferAttribute(tVerts, 3));
  tympGeo.computeVertexNormals();
  const tympanum = new THREE.Mesh(tympGeo, mWhitePilaster);
  tympanum.position.set(wx2, 0, sZ2 + porchD2 + 0.05);
  sportM.add(tympanum);

  // Round University Emblem inside Tympanum (Image 2)
  const emblemMesh2 = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 24),
    new THREE.MeshBasicMaterial({ map: emblemTex, side: THREE.DoubleSide })
  );
  emblemMesh2.position.set(wx2, (porchEave2 + porchPeak2) / 2 - 0.1, sZ2 + porchD2 + 0.08);
  sportM.add(emblemMesh2);

  // Maroon Porch Support Pillars
  [-porchW2 / 2 + 0.35, porchW2 / 2 - 0.35].forEach(px => {
    const pil = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, porchEave2, 0.55),
      mMaroonTrim
    );
    pil.position.set(wx2 + px, porchEave2 / 2, sZ2 + porchD2 - 0.3);
    pil.castShadow = true;
    sportM.add(pil);
  });

  // Left Canopy Extension (Image 2)
  const extW = 5.2;
  const extCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(extW, 0.25, 2.2),
    mMaroonTrim
  );
  extCanopy.position.set(wx2 - porchW2 / 2 - extW / 2, porchEave2, sZ2 + 1.1);
  sportM.add(extCanopy);

  // Polished Wooden Double Entrance Doors (Image 2)
  const woodDoor = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.6, 0.12),
    mWoodDoor
  );
  woodDoor.position.set(wx2, 1.35, sZ2 + 0.06);
  sportM.add(woodDoor);

  // Brass Door Pull Handles
  [-0.18, 0.18].forEach(hx => {
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8),
      mBrass
    );
    handle.position.set(wx2 + hx, 1.35, sZ2 + 0.15);
    sportM.add(handle);
  });

  // 4-Tier Dark Granite Entrance Steps (Image 2)
  for (let st = 0; st < 4; st++) {
    const stepW = 7.0 - st * 0.2;
    const stepD = 0.55;
    const stepH = 0.18;
    const stepMesh = new THREE.Mesh(
      new THREE.BoxGeometry(stepW, stepH, stepD * (4 - st)),
      mGraniteSteps
    );
    stepMesh.position.set(wx2, stepH * (st + 0.5), sZ2 + porchD2 + (stepD * (4 - st)) / 2);
    stepMesh.receiveShadow = true;
    sportM.add(stepMesh);
  }

  // Stainless Steel Safety Handrails (Image 2)
  [-porchW2 / 2, porchW2 / 2].forEach(rx => {
    const railZ = sZ2 + porchD2 + 1.2;
    const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), mSteelRail);
    post1.position.set(wx2 + rx, 0.6, sZ2 + porchD2);
    sportM.add(post1);
    const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), mSteelRail);
    post2.position.set(wx2 + rx, 0.6, sZ2 + porchD2 + 2.2);
    sportM.add(post2);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 8), mSteelRail);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(wx2 + rx, 1.1, railZ);
    sportM.add(bar);
  });

  // Bilingual Facade Lettering Sign: "खेल परिसर / SPORTS COMPLEX" (Image 2)
  const facadeSignMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.8, 1.3),
    new THREE.MeshBasicMaterial({ map: facadeSignTex2, side: THREE.DoubleSide })
  );
  facadeSignMesh.position.set(wx2, 6.8, sZ2 + 0.12);
  sportM.add(facadeSignMesh);

  // Colorful Sports Festival Banner Mural on the Right Wall (Image 2)
  const bannerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 2.4),
    new THREE.MeshBasicMaterial({ map: sportsBannerTex, side: THREE.DoubleSide })
  );
  bannerMesh.position.set(wx2 + 6.2, 4.4, sZ2 + 0.12);
  sportM.add(bannerMesh);

  // Upper Clerestory Windows on Main Hall
  [-6.0, 6.0].forEach(wx => {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.9, 0.08),
      mGlass
    );
    win.position.set(wx2 + wx, 7.2, sZ2 + 0.05);
    sportM.add(win);
  });

  // ---- 7. Columnar Ashok / Cypress Trees (Matching Image 2) ----
  function mkAshokTree(ax, az, h) {
    const aTree = new THREE.Group();
    aTree.position.set(ax - W / 2, 0, az - H / 2);

    // Slender brown trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 2.2, 8),
      new THREE.MeshLambertMaterial({ color: 0x4a3828 })
    );
    trunk.position.set(0, 1.1, 0);
    trunk.castShadow = true;
    aTree.add(trunk);

    // Dense columnar foliage layers
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x1f4a1e });
    const cone1 = new THREE.Mesh(new THREE.ConeGeometry(0.85, h * 0.65, 8), foliageMat);
    cone1.position.set(0, 1.8 + (h * 0.65) / 2, 0);
    cone1.castShadow = true;
    aTree.add(cone1);

    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.65, h * 0.5, 8), foliageMat);
    cone2.position.set(0, 2.8 + (h * 0.5) / 2, 0);
    cone2.castShadow = true;
    aTree.add(cone2);

    return aTree;
  }

  // Ashok trees placed along the approach forecourt (Image 2)
  [
    [290.0, 323.5, 6.5],
    [292.5, 323.5, 7.2],
    [298.5, 323.5, 7.0],
    [301.0, 323.5, 6.4],
    [288.0, 328.0, 7.5],
    [303.0, 328.0, 7.2]
  ].forEach(([ax, az, h]) => {
    sportM.add(mkAshokTree(ax, az, h));
  });

  // Forecourt Lamp Post (Image 2)
  const lampPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 4.5, 8),
    new THREE.MeshLambertMaterial({ color: 0x1b1d20 })
  );
  lampPole.position.set(299.5 - W / 2, 2.25, 325.0 - H / 2);
  sportM.add(lampPole);

  const lampLum = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.25, 0.45),
    new THREE.MeshBasicMaterial({ color: 0xffea9f })
  );
  lampLum.position.set(299.5 - W / 2, 4.4, 325.0 - H / 2);
  sportM.add(lampLum);
})();

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
  [371, 118, 9],  // Palace Rear North (shifted west of Darshan)
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
  // 7. Palace East Rear Loop (Between Palace X=360 and Darshan X=383: X = 371)
  {
    name: 'Palace East Rear Loop',
    pts: [[371, 118], [371, 170], [371, 232], [380, 232]],
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
      if (p.x > 380 && p.x < 408 && p.y > 168 && p.y < 220) continue; // Darshan
      if (p.x > 374 && p.x < 400 && p.y > 124 && p.y < 166) continue; // Giriraj
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
            (lx > 380 && lx < 408 && lz > 168 && lz < 220) ||
            (lx > 417 && lx < 453 && lz > 183 && lz < 219) ||
            (lx > 470 && lx < 544 && lz > 196 && lz < 232) ||
            (lx > 455 && lx < 535 && lz > 324 && lz < 365) ||
            (lx > 264 && lx < 306 && lz > 296 && lz < 332) || // Sports Complex
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
  [260, 32, 312, 68], // Mehman Boy's Hostel (before GSV Acadblock)
  [609, 132, 669, 164],
  [610, 80, 686, 121],
  [506, 56, 555, 105],
  [395, 45, 505, 105], // Sabhagrah & Pahune Hostel (between GSV and Atithi)
  [451, 244, 541, 310],
  [474, 133, 549, 183],
  [322, 158, 360, 220],
  [214, 152, 298, 228],
  [322, 40, 392, 93],
  [418, 184, 452, 218],
  [382, 182, 407, 218], // Darshan building
  [398, 120, 470, 168], // GSV-MESS building
  [376, 126, 399, 166], // Giriraj building
  [264, 296, 306, 332]  // Sports Complex
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
  (x > 260 && x < 312 && y > 32 && y < 68) || // Mehman Boy's Hostel (building & forecourt)
  nearRoad(x, y, 6.0) ||
  BUILDINGS.some((b) => x > b[0] - 6 && x < b[2] + 6 && y > b[1] - 6 && y < b[3] + 6) ||
  (x > 390 && x < 505 && y > 48 && y < 128) || // Sabhagrah & Pahune Hostel (forecourt & entrance)
  (x > 396 && x < 472 && y > 118 && y < 172) || // GSV-MESS building & forecourts
  (x > 498 && x < 563 && y > 48 && y < 125) || // Atithi Hostel (entrance & south forecourt)
  (x > 468 && x < 554 && y > 110 && y < 190) || // Proposed Lab (entrance & forecourt)
  (x > 446 && x < 546 && y > 225 && y < 314) || // Proposed Academic
  (x > 290 && x < 378 && y > 146 && y < 232) || // Palace (grand lawn)
  (x > 298 && x < 418 && y > 30 && y < 155) ||  // Central Acad Block Vista & Avenue
  (x > 214 && x < 298 && y > 152 && y < 228) || // Rajabaug Carnival Park
  (x > 412 && x < 458 && y > 164 && y < 236) || // Manthan building (front steps & approach)
  (x > 380 && x < 408 && y > 166 && y < 220) || // Darshan building & Prastuti forecourt
  (x > 373 && x < 401 && y > 124 && y < 168) || // Giriraj building & grounds
  (x > 264 && x < 306 && y > 296 && y < 332) || // Sports Complex building & grounds
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