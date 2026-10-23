// ---- Oval Ground: Agnee cultural fest venue (bare field SW of the palace)
const t10 = document.getElementById('t10');
const OV = new THREE.Group();
OV.position.set(240 - W / 2, 0, 270 - H / 2);
OV.rotation.y = Math.PI / 4;
OV.userData.e = 0;
scene.add(OV);
const bx = (w, h, d, col, x, y, z, p = OV) => {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    col.isMaterial ? col : new THREE.MeshLambertMaterial({ color: col })
  );
  m.position.set(x, y, z);
  m.castShadow = true;
  p.add(m);
  return m;
};
const cyl = (r, h, col, x, y, z, p = OV) => {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r * 1.1, h, 8),
    new THREE.MeshLambertMaterial({ color: col })
  );
  m.position.set(x, y, z);
  m.castShadow = true;
  p.add(m);
  return m;
};
// running track: clay ring + white lane lines
{
  const sh = new THREE.Shape();
  sh.absellipse(0, 0, 40, 23, 0, Math.PI * 2, false);
  const ho = new THREE.Path();
  ho.absellipse(0, 0, 35.5, 18.8, 0, Math.PI * 2, true);
  sh.holes.push(ho);
  const tr = new THREE.Mesh(
    new THREE.ShapeGeometry(sh, 48).rotateX(-Math.PI / 2),
    new THREE.MeshLambertMaterial({
      color: 0xb97a52,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    })
  );
  tr.position.y = 0.3;
  tr.receiveShadow = true;
  OV.add(tr);
  [
    [40, 23],
    [37.8, 20.9],
    [35.5, 18.8]
  ].forEach(([a, b]) => {
    const pts = new THREE.EllipseCurve(0, 0, a, b).getPoints(120),
      pa = [];
    pts.forEach((p) => pa.push(p.x, 0.45, p.y));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pa, 3));
    OV.add(
      new THREE.LineLoop(
        g,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
      )
    );
  });
}
// stage at the west end, facing the field
const SG = new THREE.Group();
SG.position.set(-30, 0, 0);
OV.add(SG);
const bn = document.createElement('canvas');
bn.width = 512;
bn.height = 256;
{
  const g = bn.getContext('2d'),
    gr = g.createLinearGradient(0, 0, 512, 256);
  gr.addColorStop(0, '#5b1a8f');
  gr.addColorStop(0.55, '#d6246e');
  gr.addColorStop(1, '#ff9a2e');
  g.fillStyle = gr;
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = 'rgba(255,255,255,.12)';
  for (let i = 0; i < 9; i++) {
    g.beginPath();
    g.arc(30 + i * 60, 250, 40 + i * 6, Math.PI, 0);
    g.fill();
  }
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '900 112px Arial,sans-serif';
  if (WMI.naturalWidth) g.drawImage(WMI, 96, 36, 320, 104);
  else g.fillText('AGNEE', 256, 106);
  g.font = '600 34px Arial,sans-serif';
  g.fillText('THE CULTURAL FEST', 256, 184);
}
const bt = new THREE.CanvasTexture(bn);
bt.encoding = THREE.sRGBEncoding;
// big stage screen: 18 x 10 face, redrawn with the fest information when the camera is at the stage
const SCR = document.createElement('canvas');
SCR.width = 1152;
SCR.height = 640;
SCR.getContext('2d').drawImage(bn, 0, 0, 1152, 640);
const SCRT = new THREE.CanvasTexture(SCR);
SCRT.encoding = THREE.sRGBEncoding;
SCRT.anisotropy = renderer.capabilities.getMaxAnisotropy();
const dk = new THREE.MeshLambertMaterial({ color: 0x22252e });
bx(8, 1.6, 18, 0x2b2f3a, 0, 0.8, 0, SG);
bx(8.2, 0.25, 18.2, 0xd6246e, 0, 1.7, 0, SG);
bx(0.8, 10, 18, dk, -3.6, 6.6, 0, SG).material = [
  new THREE.MeshBasicMaterial({ map: SCRT }),
  dk,
  dk,
  dk,
  dk,
  dk
];
[
  [3.6, -9],
  [3.6, 9],
  [-3.6, -9],
  [-3.6, 9]
].forEach(([x, z]) => cyl(0.35, 11, 0x3a3d46, x, 5.5, z, SG));
bx(8.6, 0.5, 18.8, 0x3a3d46, 0, 11.2, 0, SG);
bx(0.5, 0.5, 18.8, 0x555a66, 3.8, 9.4, 0, SG);
const SPC = [0xff3fa4, 0x38d0ff, 0xffc233, 0x7cff5a, 0xff3fa4, 0x38d0ff];
SPC.forEach((c, i) =>
  bx(0.9, 0.9, 0.9, new THREE.MeshBasicMaterial({ color: c }), 4.2, 9.2, -7.5 + i * 3, SG)
);
[-11.6, 11.6].forEach((z) => {
  bx(2, 5, 2.2, 0x1a1c22, 1, 4.1, z, SG);
  bx(1.2, 1.2, 0.1, 0x555, 2.05, 5.4, z, SG);
});
// light beams that sweep over the crowd
const beams = [0, 1, 2, 3].map((i) => {
  const m = new THREE.Mesh(
    fadeCone(3.4, 17, 1.2),
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      color: SPC[i],
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  m.position.set(4.2, 9.2, -6 + i * 4);
  SG.add(m);
  return m;
});
// crowd in front of the stage
// ---- Students: Indian boys and girls (kurtas, jeans, dupattas, backpacks) dancing, chatting, studying and walking in
const PPL = [];
const SKN = [0x8d5524, 0xa96b3b, 0xc68642, 0xd4a06a, 0xe0b080, 0x7a4a2a, 0xb9783f],
  HRC = [0x14100d, 0x1c130d, 0x261a12, 0x33231a, 0x14100d],
  TPB = [
    0xffffff, 0x1f2a56, 0x7a1f2b, 0x5b6b3a, 0xe0a526, 0x6ab0e0, 0x1b1b1f, 0xd6246e, 0x2c8c7a,
    0xe8704a, 0x8a4fb8, 0xcfd6dd
  ],
  TPG = [
    0xe8458b, 0x1fa39a, 0xf2c230, 0xffffff, 0x9b2335, 0x7cb9e8, 0xff7a3c, 0x3f9d52, 0xb06bff,
    0xf5a3c1, 0x2d4a8a
  ],
  BTB = [0x2f4a78, 0x1f2a44, 0x3a3f4a, 0xb9a27a, 0x16181d, 0x4a5a7a],
  BTG = [0x16181d, 0x2f4a78, 0xf5f1e6, 0x5a2d6e, 0x3a3f4a],
  PKC = [0x2b2f3a, 0xd6246e, 0x1fa39a, 0xe0a526, 0x3f6fe0, 0x555a66],
  pick = (a) => a[(Math.random() * a.length) | 0];
function mkP(girl, kind, x, z, rot) {
  const kurta = girl ? Math.random() < 0.75 : Math.random() < 0.18,
    top = pick(girl ? TPG : TPB);
  PPL.push({
    girl,
    kind,
    x,
    z,
    rot,
    x0: x,
    ph: Math.random() * 6.28,
    sp: 0.8 + Math.random() * 0.3,
    off: Math.random() * 17,
    sc: girl ? 0.92 + Math.random() * 0.08 : 0.97 + Math.random() * 0.1,
    skin: pick(SKN),
    hair: pick(HRC),
    top,
    sleeve: Math.random() < 0.3,
    kurta,
    bot: pick(girl ? BTG : BTB),
    scarf: girl && Math.random() < 0.55 ? pick(TPG) : -1,
    long: girl && Math.random() < 0.85,
    pack: kind !== 'sit' && Math.random() < 0.45 ? pick(PKC) : -1,
    book: kind === 'sit' ? pick([0xc0392b, 0x2c6fbb, 0xf0c040, 0x27ae60, 0xffffff]) : -1,
    shoe: Math.random() < 0.5 ? 0xf2f2f2 : 0x22242b
  });
}
const near = (x, z, d) => PPL.some((q) => (q.x - x) ** 2 + (q.z - z) ** 2 < d * d);
for (let n = 0; n < 1500 && PPL.length < (isMobileDevice ? 84 : 165); n++) {
  const x = -23 + Math.random() * 19,
    z = (Math.random() - 0.5) * 29;
  if (
    (x / 40) ** 2 + (z / 22) ** 2 < 0.82 &&
    !(Math.abs(x + 6) < 4.2 && Math.abs(z) < 4.2) &&
    !near(x, z, 1.15)
  ) {
    const r = Math.random();
    mkP(
      Math.random() < 0.5,
      r < 0.55 ? 'dance' : r < 0.72 ? 'jump' : 'sway',
      x,
      z,
      -Math.PI / 2 + (Math.random() - 0.5) * 0.7
    );
  }
}
// visitors queueing and chatting at the pre-Agnee stalls
[-11, -6.6, -2.2, 2.2, 6.6, 11].forEach((zc) => {
  for (let n = 0, c = 0; n < 40 && c < 3; n++) {
    const x = 20.2 + Math.random() * 3.2,
      z = zc + (Math.random() - 0.5) * 3.6;
    if (!near(x, z, 1.1)) {
      mkP(
        c % 2 === 0 ? Math.random() < 0.5 : !PPL[PPL.length - 1].girl,
        Math.random() < 0.75 ? 'chat' : 'sway',
        x,
        z,
        Math.PI / 2 + (Math.random() - 0.5) * 0.8
      );
      c++;
    }
  }
});
// students seated in the stands, reading and enjoying the show
[
  [11, -14],
  [11, 7]
].forEach(([x0, z0]) => {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 7; c++)
      if (Math.random() < 0.62)
        mkP(
          Math.random() < 0.5,
          'sit',
          x0 + r * 1.6,
          z0 + c * 1.1,
          -Math.PI / 2 + (Math.random() - 0.5) * 0.25
        );
});
// walking in through the entrance gate in pairs
for (let k = 0; k < 5; k++) {
  const z = -3 + k * 1.5,
    g = Math.random() < 0.5;
  mkP(g, 'walk', 46, z, -Math.PI / 2);
  PPL[PPL.length - 1].off = k * 3.2;
  mkP(!g, 'walk', 46, z + 0.55, -Math.PI / 2);
  PPL[PPL.length - 1].off = k * 3.2 + 0.25;
}
for (let i = PPL.length - 1; i > 0; i--) {
  const j = (Math.random() * (i + 1)) | 0;
  [PPL[i], PPL[j]] = [PPL[j], PPL[i]];
}
const NP_ = PPL.length,
  PG = {
    thigh: new THREE.CylinderGeometry(0.15, 0.13, 0.5, 8).translate(0, -0.25, 0),
    shin: new THREE.CylinderGeometry(0.13, 0.1, 0.5, 8).translate(0, -0.25, 0),
    shoe: new THREE.BoxGeometry(0.2, 0.12, 0.36).translate(0, -0.04, 0.07),
    torso: new THREE.CylinderGeometry(0.44, 0.38, 0.92, 10),
    skirt: new THREE.CylinderGeometry(0.38, 0.5, 0.8, 10).translate(0, -0.4, 0),
    scarf: new THREE.TorusGeometry(0.43, 0.07, 6, 14).rotateX(Math.PI / 2),
    uarm: new THREE.CylinderGeometry(0.1, 0.09, 0.42, 7).translate(0, -0.21, 0),
    farm: new THREE.CylinderGeometry(0.085, 0.07, 0.42, 7).translate(0, -0.21, 0),
    hand: new THREE.SphereGeometry(0.09, 6, 5),
    head: new THREE.SphereGeometry(0.32, 10, 8),
    hair: new THREE.SphereGeometry(0.345, 10, 7),
    hlong: new THREE.CylinderGeometry(0.26, 0.2, 0.9, 7).translate(0, -0.45, 0),
    pack: new THREE.BoxGeometry(0.6, 0.75, 0.28),
    eye: new THREE.SphereGeometry(0.04, 5, 4),
    book: new THREE.BoxGeometry(0.5, 0.07, 0.36)
  };
const mkI = (g, sh) => {
  const m = new THREE.InstancedMesh(
    g,
    new THREE.MeshLambertMaterial(),
    NP_ *
      (g === PG.eye ||
      g === PG.thigh ||
      g === PG.shin ||
      g === PG.shoe ||
      g === PG.uarm ||
      g === PG.farm ||
      g === PG.hand
        ? 2
        : 1)
  );
  m.frustumCulled = false;
  m.castShadow = !!sh;
  OV.add(m);
  return m;
};
const PI_ = {};
Object.keys(PG).forEach((k) => (PI_[k] = mkI(PG[k], k === 'torso')));
{
  const c = new THREE.Color(),
    sk = new THREE.Color(),
    set = (m, i, h) => m.setColorAt(i, c.setHex(h));
  PPL.forEach((a, i) => {
    sk.setHex(a.skin);
    const SK = (m, k) => m.setColorAt(k, sk),
      bot = a.kurta && a.girl ? a.bot : a.bot;
    [0, 1].forEach((s) => {
      const k = i * 2 + s;
      set(PI_.thigh, k, bot);
      set(PI_.shin, k, bot);
      set(PI_.shoe, k, a.shoe);
      set(PI_.uarm, k, a.top);
      set(PI_.farm, k, a.sleeve ? a.top : a.skin);
      SK(PI_.hand, k);
      set(PI_.eye, k, 0x15110e);
    });
    set(PI_.torso, i, a.top);
    set(PI_.skirt, i, a.top);
    set(PI_.scarf, i, a.scarf < 0 ? 0 : a.scarf);
    SK(PI_.head, i);
    set(PI_.hair, i, a.hair);
    set(PI_.hlong, i, a.hair);
    set(PI_.pack, i, a.pack < 0 ? 0 : a.pack);
    set(PI_.book, i, a.book < 0 ? 0 : a.book);
  });
  Object.values(PI_).forEach((m) => m.instanceColor && (m.instanceColor.needsUpdate = true));
}
const _e = new THREE.Euler(),
  _q = new THREE.Quaternion(),
  _v = new V(),
  _s = new V(),
  _B = new THREE.Matrix4(),
  _T = new THREE.Matrix4(),
  _H = new THREE.Matrix4(),
  _A = new THREE.Matrix4(),
  _F = new THREE.Matrix4(),
  _M = new THREE.Matrix4(),
  _O = new THREE.Matrix4(),
  _Z = new THREE.Matrix4().makeScale(0, 0, 0),
  _TM = new THREE.Matrix4();
const lm = (M, px, py, pz, rx, ry, rz, sx = 1, sy = 1, sz = 1) => {
  _e.set(rx, ry, rz);
  _q.setFromEuler(_e);
  _v.set(px, py, pz);
  _s.set(sx, sy, sz);
  return M.compose(_v, _q, _s);
};
const put = (m, k, P, px, py, pz, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
  lm(_M, px, py, pz, rx, ry, rz, sx, sy, sz);
  _O.multiplyMatrices(P, _M);
  m.setMatrixAt(k, _O);
};
function peopleAnim(t, e) {
  const K = 0.3 + 0.7 * e,
    PI = Math.PI,
    cnt = Math.max(1, Math.floor(NP_ * (0.2 + 0.8 * e)));
  for (const m in PI_)
    PI_[m].count =
      m === 'eye' ||
      m === 'thigh' ||
      m === 'shin' ||
      m === 'shoe' ||
      m === 'uarm' ||
      m === 'farm' ||
      m === 'hand'
        ? cnt * 2
        : cnt;
  for (let i = 0; i < cnt; i++) {
    const a = PPL[i],
      ph = a.ph,
      kd = a.kind;
    let bob = 0,
      aL = 0.08,
      aR = 0.08,
      zL = 0.1,
      zR = 0.1,
      eL = -0.15,
      eR = -0.15,
      tL = 0,
      tR = 0,
      kL = 0,
      kR = 0,
      sw = 0,
      hx = 0,
      hy = 0,
      sit = false,
      x = a.x;
    if (kd === 'dance') {
      const w = Math.sin(t * 4 + ph);
      bob = Math.abs(w) * 0.28 * K;
      aL = PI * 0.8 + Math.sin(t * 5 + ph) * 0.35 * K;
      aR = PI * 0.8 + Math.sin(t * 5 + ph + 1.6) * 0.35 * K;
      zL = 0.3 + Math.sin(t * 2.5 + ph) * 0.15;
      zR = zL;
      eL = eR = -0.3;
      tL = w * 0.35 * K;
      tR = -w * 0.35 * K;
      kL = Math.max(0, -w) * 0.5;
      kR = Math.max(0, w) * 0.5;
      sw = Math.sin(t * 2 + ph) * 0.1;
    } else if (kd === 'jump') {
      const w = Math.max(0, Math.sin(t * 6 + ph));
      bob = w * 0.7 * K;
      aL = aR = PI * 0.95;
      zL = zR = 0.25;
      eL = eR = -0.1;
      tL = tR = -0.5 * w;
      kL = kR = 0.8 * w;
    } else if (kd === 'sway') {
      sw = Math.sin(t * 1.8 + ph) * 0.09;
      bob = Math.abs(Math.sin(t * 1.8 + ph)) * 0.06;
      aR = PI * 0.78;
      eR = -0.7;
      zR = 0.25;
      aL = 0.1 + Math.sin(t * 1.8 + ph) * 0.2;
      hy = Math.sin(t * 0.9 + ph) * 0.3;
    } else if (kd === 'chat') {
      aR = -0.5 + Math.sin(t * 2 + ph) * 0.35;
      eR = -1;
      aL = -0.25;
      eL = -0.95;
      hy = Math.sin(t * 0.7 + ph) * 0.45;
      bob = Math.sin(t * 1.3 + ph) * 0.015;
      sw = Math.sin(t * 0.8 + ph) * 0.03;
    } else if (kd === 'sit') {
      sit = true;
      tL = tR = -PI / 2;
      kL = kR = PI / 2;
      aL = aR = -0.85;
      eL = eR = -1;
      hx = 0.35 + Math.sin(t * 0.6 + ph) * 0.05;
    } else if (kd === 'walk') {
      const w = Math.sin(t * 5 + ph);
      x = 48 - ((t * a.sp + a.off) % 17);
      tL = -w * 0.6;
      tR = w * 0.6;
      kL = Math.max(0, -w) * 0.7;
      kR = Math.max(0, w) * 0.7;
      aL = -tL * 0.8;
      aR = -tR * 0.8;
      eL = eR = -0.25;
      bob = Math.abs(w) * 0.05;
      hy = Math.sin(t * 1.2 + ph) * 0.2;
    }
    lm(_B, x, bob, a.z, 0, a.rot, 0, a.sc, a.sc, a.sc);
    const lg = sit ? 1.75 : 1;
    [
      [-1, tL, kL],
      [1, tR, kR]
    ].forEach(([sd, th, kn], s) => {
      const k = i * 2 + s;
      lm(_T, sd * 0.17, 0.95, 0, th, 0, 0);
      _A.multiplyMatrices(_B, _T);
      PI_.thigh.setMatrixAt(k, _A);
      lm(_M, 0, -0.5, 0, kn, 0, 0, 1, sit ? lg : 1, 1);
      _F.multiplyMatrices(_A, _M);
      PI_.shin.setMatrixAt(k, _F);
      lm(_M, 0, -0.5 * (sit ? lg : 1), 0, 0, 0, 0);
      _H.multiplyMatrices(_F, _M);
      PI_.shoe.setMatrixAt(k, _H);
    });
    if (a.kurta && !sit) {
      lm(_T, 0, 0.98, 0, 0, 0, 0, 1.1, 1, 0.85);
      _A.multiplyMatrices(_B, _T);
      PI_.skirt.setMatrixAt(i, _A);
    } else PI_.skirt.setMatrixAt(i, _Z);
    lm(_T, 0, 0.95, 0, 0, 0, sw);
    _A.multiplyMatrices(_B, _T);
    _TM.copy(_A);
    const TM = _TM;
    put(PI_.torso, i, TM, 0, 0.46, 0, 0, 0, 0, 1.1, 1, 0.78);
    PI_.scarf.setMatrixAt(i, _Z);
    if (a.scarf >= 0) put(PI_.scarf, i, TM, 0, 0.8, 0.04, 0, 0, 0, 1.05, 1, 0.9);
    if (a.pack >= 0) put(PI_.pack, i, TM, 0, 0.5, -0.4);
    else PI_.pack.setMatrixAt(i, _Z);
    if (a.book >= 0) put(PI_.book, i, TM, 0, 0.28, 0.44, -0.45);
    else PI_.book.setMatrixAt(i, _Z);
    [
      [-1, aL, eL, zL],
      [1, aR, eR, zR]
    ].forEach(([sd, ax, el, az], s) => {
      const k = i * 2 + s;
      lm(_T, sd * 0.53, 0.83, 0, ax, 0, sd * az);
      _A.multiplyMatrices(TM, _T);
      PI_.uarm.setMatrixAt(k, _A);
      lm(_M, 0, -0.42, 0, el, 0, 0);
      _F.multiplyMatrices(_A, _M);
      PI_.farm.setMatrixAt(k, _F);
      lm(_M, 0, -0.43, 0, 0, 0, 0);
      _H.multiplyMatrices(_F, _M);
      PI_.hand.setMatrixAt(k, _H);
    });
    lm(_T, 0, 1.17, 0, hx, hy, 0, 0.92, 1.05, 0.95);
    _H.multiplyMatrices(TM, _T);
    PI_.head.setMatrixAt(i, _H);
    lm(_T, 0, 1.17, 0, hx, hy, 0);
    _H.multiplyMatrices(TM, _T);
    put(PI_.hair, i, _H, 0, 0.07, -0.045, 0, 0, 0, 1, 0.92, 1);
    if (a.long) put(PI_.hlong, i, _H, 0, -0.02, -0.2, 0.12);
    else PI_.hlong.setMatrixAt(i, _Z);
    [-1, 1].forEach((sd, s) => put(PI_.eye, i * 2 + s, _H, sd * 0.12, 0.03, 0.285));
  }
  for (const m in PI_) PI_[m].instanceMatrix.needsUpdate = true;
}
// food & activity stalls on the east side
[0xe8453c, 0xf2a93b, 0x3c9be8, 0xb04ad0, 0x4cc07a, 0xf0d84a].forEach((c, i) => {
  const z = -11 + i * 4.4;
  bx(3, 2, 3, 0xf1ead8, 27, 1, z);
  const r = new THREE.Mesh(
    new THREE.ConeGeometry(2.8, 1.7, 4),
    new THREE.MeshLambertMaterial({ color: c })
  );
  r.position.set(27, 2.9, z);
  r.rotation.y = Math.PI / 4;
  r.castShadow = true;
  OV.add(r);
});
// floodlight masts
[
  [-27, -21],
  [-27, 21],
  [27, -21],
  [27, 21]
].forEach(([x, z]) => {
  cyl(0.45, 24, 0x777c85, x, 12, z);
  bx(3.2, 1.2, 1.2, new THREE.MeshBasicMaterial({ color: 0xfff3c4 }), x, 24.4, z);
});
// ---- Oval Ground detail pass
const pmx = new THREE.Matrix4();
const MB = (c) => new THREE.MeshBasicMaterial({ color: c });
// stone kerb around the track + worn patches + cricket pitch with stumps
{
  const sh = new THREE.Shape();
  sh.absellipse(0, 0, 42, 24.8, 0, Math.PI * 2, false);
  const ho = new THREE.Path();
  ho.absellipse(0, 0, 40.4, 23.4, 0, Math.PI * 2, true);
  sh.holes.push(ho);
  const k = new THREE.Mesh(
    new THREE.ExtrudeGeometry(sh, { depth: 0.9, bevelEnabled: false, curveSegments: 64 }).rotateX(
      -Math.PI / 2
    ),
    new THREE.MeshLambertMaterial({ color: 0xe4ddcb })
  );
  k.receiveShadow = k.castShadow = true;
  OV.add(k);
}
for (let i = 0; i < 14; i++) {
  const a = Math.random() * 6.28,
    r = Math.sqrt(Math.random()) * 0.8,
    m = new THREE.Mesh(
      new THREE.CircleGeometry(1, 14).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: 0x7a5a3c,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      })
    );
  m.position.set(Math.cos(a) * r * 33, 0.31, Math.sin(a) * r * 17);
  m.scale.set(3 + Math.random() * 5, 1, 2 + Math.random() * 4);
  OV.add(m);
}
bx(20, 0.12, 3.2, 0xcdb68c, 7, 0.36, 0);
[-9, 9].forEach((d) => {
  bx(0.15, 0.14, 3.6, 0xffffff, 7 + d, 0.4, 0);
  [-0.4, 0, 0.4].forEach((z) => cyl(0.07, 1, 0xf3e9c9, 7 + d * 1.12, 0.5, z));
});
// front-of-stage barricade
const bar = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.14, 1.1, 1.9),
  new THREE.MeshLambertMaterial({ color: 0x9aa3ad }),
  40
);
for (let i = 0; i < 20; i++) {
  pmx.makeTranslation(-24.2, 0.65, -9.5 + i * 1);
  bar.setMatrixAt(i, pmx);
}
bar.count = 20;
bar.castShadow = true;
OV.add(bar);
bx(0.1, 0.1, 19.5, 0xcfd5db, -24.2, 1.15, 0);
// stage steps, LED edge strip, truss braces, haze
[
  [6, 0.5],
  [5.2, 1],
  [4.4, 1.5]
].forEach(([x, h]) => bx(0.8, h, 3, 0x3a3d46, x, h / 2, 0, SG));
bx(0.15, 0.2, 18, MB(0xff3fa4), 4.05, 1.35, 0, SG);
for (let z = -8; z < 8; z += 2) {
  const br = bx(0.18, 0.18, 2.8, 0x555a66, 3.8, 9.9, z + 1, SG);
  br.rotation.x = ((z / 2) % 2 ? 1 : -1) * 0.7;
}
const haze = [0, 1, 2, 3].map((i) => {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 10, 8),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
    })
  );
  m.position.set(5.5, 2, -6 + i * 4);
  SG.add(m);
  return m;
});
// animated LED screens on both sides of the stage
const LED = document.createElement('canvas');
LED.width = 160;
LED.height = 90;
const lg = LED.getContext('2d'),
  lt = new THREE.CanvasTexture(LED);
lt.encoding = THREE.sRGBEncoding;
let ledT = -1;
function drawLED(t) {
  const gr = lg.createLinearGradient(0, 0, 160, 90);
  gr.addColorStop(0, `hsl(${(t * 40) % 360},85%,48%)`);
  gr.addColorStop(1, `hsl(${(t * 40 + 130) % 360},85%,40%)`);
  lg.fillStyle = gr;
  lg.fillRect(0, 0, 160, 90);
  lg.strokeStyle = 'rgba(255,255,255,.55)';
  lg.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    lg.beginPath();
    for (let x = 0; x <= 160; x += 8)
      lg.lineTo(x, 45 + Math.sin(x * 0.07 + t * 2 + i) * (14 + i * 3));
    lg.stroke();
  }
  lg.fillStyle = '#fff';
  lg.font = '900 24px Arial';
  lg.textAlign = 'center';
  if (WMI.naturalWidth) lg.drawImage(WMI, 20, 22, 120, 39);
  else lg.fillText('AGNEE', 80, 52);
  lg.fillStyle = 'rgba(0,0,0,' + 0.82 * (1 - OV.userData.e) + ')';
  lg.fillRect(0, 0, 160, 90);
  lt.needsUpdate = true;
}
drawLED(0);
[-15.5, 15.5].forEach((z) => {
  const sc = bx(0.6, 6, 8.6, dk, 0, 5.2, z, SG);
  sc.material = [new THREE.MeshBasicMaterial({ map: lt }), dk, dk, dk, dk, dk];
  cyl(0.3, 2.2, 0x3a3d46, 0, 1.1, z - 3, SG);
  cyl(0.3, 2.2, 0x3a3d46, 0, 1.1, z + 3, SG);
});
// ---- Premium stage dressing: gold-framed screen, glossy deck, drapes, line arrays, uplights, moving heads
const SGP = (() => {
  const gold = new THREE.MeshPhongMaterial({ color: 0xd9a93a, specular: 0xffeab0, shininess: 90 }),
    blk = new THREE.MeshPhongMaterial({ color: 0x0b0b0f, specular: 0x3a3a48, shininess: 55 }),
    vel = new THREE.MeshPhongMaterial({ color: 0x22060d, specular: 0x4a1a22, shininess: 12 }),
    glow = new THREE.MeshBasicMaterial({ color: 0xffd68a });
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d),
    hide = [],
    anim = [];
  const add = (g, m, x, y, z, p = SG) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    p.add(o);
    return o;
  };
  // gold bezel + inner glow line around the big screen
  add(B(0.7, 0.55, 19.4), gold, -3.1, 11.9, 0);
  [-9.3, 9.3].forEach((z) => add(B(0.7, 10.5, 0.5), gold, -3.1, 6.85, z));
  add(B(0.3, 0.1, 18.2), glow, -2.9, 11.6, 0);
  [-9.05, 9.05].forEach((z) => add(B(0.3, 10, 0.1), glow, -2.9, 6.6, z));
  // gold deck edge + glossy printed deck + patterned skirt
  add(B(8.3, 0.14, 18.3), gold, 0, 1.82, 0);
  {
    const c = document.createElement('canvas');
    c.width = 400;
    c.height = 900;
    const g = c.getContext('2d');
    g.fillStyle = '#08080b';
    g.fillRect(0, 0, 400, 900);
    g.strokeStyle = 'rgba(217,169,58,.13)';
    g.lineWidth = 2;
    for (let i = -9; i < 14; i++) {
      g.beginPath();
      g.moveTo(i * 50, 0);
      g.lineTo(i * 50 + 450, 900);
      g.moveTo(i * 50 + 450, 0);
      g.lineTo(i * 50, 900);
      g.stroke();
    }
    g.translate(215, 450);
    g.strokeStyle = 'rgba(224,184,96,.7)';
    g.fillStyle = 'rgba(224,184,96,.1)';
    g.lineWidth = 3;
    [150, 118].forEach((r) => {
      g.beginPath();
      g.moveTo(0, -r * 1.5);
      g.lineTo(r, 0);
      g.lineTo(0, r * 1.5);
      g.lineTo(-r, 0);
      g.closePath();
      g.stroke();
    });
    g.beginPath();
    g.arc(0, 0, 64, 0, 6.3);
    g.fill();
    g.stroke();
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12;
      g.beginPath();
      g.moveTo(Math.cos(a) * 74, Math.sin(a) * 74);
      g.lineTo(Math.cos(a) * 104, Math.sin(a) * 104);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    const d = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 18).rotateX(-Math.PI / 2),
      new THREE.MeshPhongMaterial({ map: t, specular: 0x888888, shininess: 110 })
    );
    d.position.set(0, 1.9, 0);
    d.receiveShadow = true;
    SG.add(d);
  }
  {
    const c = document.createElement('canvas');
    c.width = 1152;
    c.height = 102;
    const g = c.getContext('2d');
    g.fillStyle = '#0a0a0e';
    g.fillRect(0, 0, 1152, 102);
    g.strokeStyle = '#d9a93a';
    g.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const x = 48 + i * 96;
      g.beginPath();
      g.moveTo(x, 10);
      g.lineTo(x + 40, 51);
      g.lineTo(x, 92);
      g.lineTo(x - 40, 51);
      g.closePath();
      g.stroke();
      g.globalAlpha = 0.45;
      g.beginPath();
      g.moveTo(x, 34);
      g.lineTo(x + 16, 51);
      g.lineTo(x, 68);
      g.lineTo(x - 16, 51);
      g.closePath();
      g.stroke();
      g.globalAlpha = 1;
    }
    g.fillStyle = '#e8c06a';
    g.fillRect(0, 0, 1152, 5);
    g.fillRect(0, 97, 1152, 5);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 1.6).rotateY(Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: t })
    );
    s.position.set(4.06, 0.8, 0);
    SG.add(s);
  }
  SG.children.forEach((m) => {
    const p = m.geometry && m.geometry.parameters;
    if (p && p.width === 8.6 && p.height === 0.5) hide.push(m);
    if (p && p.width === 0.15 && p.height === 0.2) {
      m.material.color.set(0xffe2a0);
      m.position.y = 1.62;
    }
  });
  // pleated velvet drapes framing the screen
  [-1, 1].forEach((s) => {
    for (let i = 0; i < 9; i++) {
      const r = 0.42 + (i % 2) * 0.1,
        m = add(
          new THREE.CylinderGeometry(r, r, 10.6, 10),
          vel,
          -3.1 + i * 0.78,
          6.9,
          s * (9.9 + (i % 2) * 0.18)
        );
      m.castShadow = false;
      hide.push(m);
    }
    add(B(7.2, 0.5, 2.4), gold, 0.3, 12.3, s * 10.4);
  });
  // hanging line arrays + stacked subs
  [-1, 1].forEach((s) => {
    const z = s * 12.6,
      N = 9;
    for (let i = 0; i < N; i++) {
      const y = 11.3 - i * 0.6,
        a = -i * 0.035;
      const b = add(B(1.5, 0.52, 1.5), blk, 0.8, y, z);
      b.rotation.z = a;
      const gr = add(B(0.05, 0.4, 1.3), gold, 1.56, y, z);
      gr.position.x = 0.8 + Math.cos(a) * 0.78;
      gr.position.y = y + Math.sin(a) * 0.78;
      gr.rotation.z = a;
      gr.material = gold;
      hide.push(b, gr);
    }
    add(B(0.06, 0.06, 0.06), gold, 0.8, 11.8, z);
    add(B(0.14, 1.2, 0.14), blk, 0.8, 12.2, z);
    [0, 1, 2].forEach((k) => {
      add(B(1.8, 1.2, 2.0), blk, 1.2, 2.5 + k * 1.25, s * 11.6);
      add(
        B(0.06, 0.95, 1.6),
        new THREE.MeshPhongMaterial({ color: 0x23232c, specular: 0x666677, shininess: 40 }),
        2.13,
        2.5 + k * 1.25,
        s * 11.6
      );
      add(B(0.08, 0.06, 1.8), gold, 2.14, 3.08 + k * 1.25, s * 11.6);
    });
  });
  // front-of-stage wedges + mic stands
  [-6, -3, 0, 3, 6].forEach((z) => {
    const w = add(B(1.1, 0.5, 0.9), blk, 3.1, 2.15, z);
    w.rotation.z = 0.45;
  });
  [-2.4, 2.4].forEach((z) => {
    add(new THREE.CylinderGeometry(0.03, 0.03, 1.7, 6), blk, 2.4, 2.75, z);
    add(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), gold, 2.4, 3.5, z);
  });
  // low instruments, hidden in the info view
  {
    const kit = new THREE.Group();
    kit.position.set(-1.4, 1.9, 0);
    SG.add(kit);
    hide.push(kit);
    const kick = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.7, 20), gold);
    kick.rotation.z = Math.PI / 2;
    kick.position.set(0.1, 0.65, 0);
    kit.add(kick);
    [
      [0.4, 1.05, -0.45],
      [0.4, 1.05, 0.45]
    ].forEach((p) => {
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.28, 16), blk);
      d.position.set(...p);
      d.rotation.z = 0.2;
      kit.add(d);
    });
    [
      [0, -1.6],
      [0, 1.6]
    ].forEach(([x, z]) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.03, 16), gold);
      c.position.set(x, 1.5, z);
      kit.add(c);
    });
    [-5.2, 5.2].forEach((z) => {
      hide.push(
        add(B(1.2, 1.6, 1.4), blk, -1.2, 2.7, z),
        add(
          B(0.06, 1.3, 1.1),
          new THREE.MeshPhongMaterial({ color: 0x23232c, specular: 0x666677, shininess: 40 }),
          -0.58,
          2.7,
          z
        )
      );
    });
  }
  // uplighters washing the screen + moving heads on the front truss
  const ups = [];
  for (let i = 0; i < 9; i++) {
    const z = -8 + i * 2,
      f = add(B(0.5, 0.18, 0.5), blk, -2.6, 1.99, z);
    f.castShadow = false;
    const c = new THREE.Mesh(
      fadeCone(0.8, 3.2, 1.4),
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        color: 0xffc866,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    c.rotation.z = Math.PI;
    c.position.set(-2.6, 2.05, z);
    SG.add(c);
    ups.push(c);
  }
  const heads = [];
  for (let i = 0; i < 8; i++) {
    const z = -7 + i * 2,
      g = new THREE.Group();
    g.position.set(3.8, 9.1, z);
    SG.add(g);
    const yk = new THREE.Mesh(B(0.5, 0.5, 0.5), blk);
    yk.position.y = 0.1;
    g.add(yk);
    const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.55, 10), gold);
    hd.position.y = -0.25;
    g.add(hd);
    const bm = new THREE.Mesh(
      fadeCone(1.3, 15, 1.2),
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        color: i % 2 ? 0xffe0a0 : 0xffffff,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    bm.position.y = -0.5;
    g.add(bm);
    heads.push(g);
  }
  return {
    hide,
    anim(t) {
      const e = OV.userData.e || 0;
      ups.forEach((c, i) => {
        c.material.opacity = (0.04 + 0.1 * e) * (0.65 + 0.35 * Math.sin(t * 1.3 + i * 0.7));
      });
      heads.forEach((g, i) => {
        g.rotation.z = 0.35 + 0.3 * Math.sin(t * 0.7 + i * 0.9) * e;
        g.rotation.x = 0.4 * Math.sin(t * 0.5 + i * 1.3) * e;
        g.children[2].material.opacity = 0.05 + 0.14 * e;
      });
    }
  };
})();
// front-of-house tent with sound desk
{
  const F = new THREE.Group();
  F.position.set(-6, 0, 0);
  OV.add(F);
  [
    [-2, -2],
    [2, -2],
    [-2, 2],
    [2, 2]
  ].forEach(([x, z]) => cyl(0.12, 3.2, 0xdddddd, x, 1.6, z, F));
  const ro = new THREE.Mesh(
    new THREE.ConeGeometry(3.7, 1.6, 4),
    new THREE.MeshLambertMaterial({ color: 0xf5f5f5 })
  );
  ro.position.y = 4;
  ro.rotation.y = Math.PI / 4;
  ro.castShadow = true;
  F.add(ro);
  bx(2.6, 0.9, 1.3, 0x1b1d22, 0, 0.45, 0, F);
  [-0.8, 0, 0.8].forEach((x, i) =>
    bx(0.5, 0.08, 0.4, MB([0x38d0ff, 0xff3fa4, 0x7cff5a][i]), x, 0.98, 0, F)
  );
}
// seating blocks
{
  const ch = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.8, 0.9, 0.8),
      new THREE.MeshLambertMaterial(),
      60
    ),
    cc = new THREE.Color();
  let n = 0;
  [
    [11, -14],
    [11, 7]
  ].forEach(([x0, z0]) => {
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 7; c++) {
        pmx.makeTranslation(x0 + r * 1.6, 0.45, z0 + c * 1.1);
        ch.setMatrixAt(n, pmx);
        cc.setHex((r + c) % 3 ? 0xf2f2f2 : 0x8a1c2b);
        ch.setColorAt(n++, cc);
      }
  });
  ch.count = n;
  ch.castShadow = true;
  OV.add(ch);
}
// stalls: counters, boards, bins
[0xe8453c, 0xf2a93b, 0x3c9be8, 0xb04ad0, 0x4cc07a, 0xf0d84a].forEach((c, i) => {
  const z = -11 + i * 4.4;
  bx(0.9, 0.9, 3.2, 0x6b4a33, 25.3, 0.45, z);
  bx(0.1, 0.8, 2.6, MB(c), 25.2, 3.8, z);
  bx(0.5, 0.7, 0.5, 0x2f4f3a, 25, 0.35, z + 2.2);
});
// entry gate with banner + rangoli
{
  const gb = document.createElement('canvas');
  gb.width = 512;
  gb.height = 96;
  const g = gb.getContext('2d');
  g.fillStyle = '#d6246e';
  g.fillRect(0, 0, 512, 96);
  g.fillStyle = '#ffc233';
  g.fillRect(0, 0, 512, 8);
  g.fillRect(0, 88, 512, 8);
  g.fillStyle = '#fff';
  g.font = '800 50px Arial';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (WMI.naturalWidth) {
    g.textAlign = 'left';
    g.fillText('WELCOME TO', 22, 50);
    g.drawImage(WMI, 292, 12, 206, 67);
  } else g.fillText('WELCOME TO AGNEE', 256, 50);
  const gt = new THREE.CanvasTexture(gb);
  gt.encoding = THREE.sRGBEncoding;
  [-6, 6].forEach((z) => bx(1.2, 8, 1.2, 0xf1ead8, 44.5, 4, z));
  const bm = bx(1, 2.4, 12.4, dk, 44.5, 8.6, 0);
  bm.material = [
    new THREE.MeshBasicMaterial({ map: gt }),
    new THREE.MeshBasicMaterial({ map: gt }),
    dk,
    dk,
    dk,
    dk
  ];
  const rc = document.createElement('canvas');
  rc.width = rc.height = 256;
  const r = rc.getContext('2d');
  r.translate(128, 128);
  const pal = ['#d6246e', '#ffc233', '#38a6e8', '#7cc243', '#fff', '#ff7a2e'];
  for (let k = 5; k >= 0; k--) {
    for (let p = 0; p < 12; p++) {
      r.save();
      r.rotate((p * Math.PI) / 6);
      r.fillStyle = pal[k];
      r.beginPath();
      r.ellipse(0, 18 + k * 17, 9 + k * 1.5, 16, 0, 0, 6.3);
      r.fill();
      r.restore();
    }
  }
  r.fillStyle = '#ffc233';
  r.beginPath();
  r.arc(0, 0, 14, 0, 6.3);
  r.fill();
  const rt = new THREE.CanvasTexture(rc);
  rt.encoding = THREE.sRGBEncoding;
  const rg = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: rt,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3
    })
  );
  rg.position.set(32, 0.4, 0);
  OV.add(rg);
}
// bunting strung between the floodlight masts
{
  const PEN = [],
    PC = [0xff3fa4, 0xffc233, 0x38d0ff, 0x7cff5a, 0xff7a2e, 0xffffff];
  [
    [
      [-27, -21],
      [27, -21]
    ],
    [
      [-27, 21],
      [27, 21]
    ],
    [
      [-27, -21],
      [-27, 21]
    ],
    [
      [27, -21],
      [27, 21]
    ]
  ].forEach(([A, B]) => {
    const n = Math.round(Math.hypot(B[0] - A[0], B[1] - A[1]) / 2.2),
      rp = [];
    for (let i = 0; i <= n * 2; i++) {
      const u = i / (n * 2),
        y = 23.7 - Math.sin(u * Math.PI) * 3.2;
      rp.push(A[0] + (B[0] - A[0]) * u, y, A[1] + (B[1] - A[1]) * u);
      if (i % 2 && u < 1)
        PEN.push([
          A[0] + (B[0] - A[0]) * u,
          y - 0.75,
          A[1] + (B[1] - A[1]) * u,
          Math.atan2(B[1] - A[1], B[0] - A[0])
        ]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
    OV.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x333333 })));
  });
  const pn = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.55, 1.3, 3).rotateX(Math.PI),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
      PEN.length
    ),
    pc2 = new THREE.Color(),
    pq = new THREE.Quaternion();
  PEN.forEach((p, i) => {
    pq.setFromEuler(new THREE.Euler(0, -p[3], 0));
    pmx.compose(new V(p[0], p[1], p[2]), pq, new V(1, 1, 0.3));
    pn.setMatrixAt(i, pmx);
    pc2.setHex(PC[i % 6]);
    pn.setColorAt(i, pc2);
  });
  OV.add(pn);
}
function festAnim(t) {
  festAnim0(t);
  SGP.anim(t);
  gateAnim(t);
  agneeAnim(t);
  premiumAnim(t);
  if (t - ledT > 0.12) {
    ledT = t;
    drawLED(t);
  }
  haze.forEach((m, i) => {
    const u = (t * 0.35 + i * 0.27) % 1;
    m.position.y = 1.8 + u * 6;
    m.scale.setScalar(0.8 + u * 1.6);
    m.material.opacity = 0.16 * (1 - u) * (0.3 + 0.7 * OV.userData.e);
  });
}
function festAnim0(t) {
  beams.forEach((m, i) => {
    m.rotation.z = 0.55 + Math.sin(t * 1.3 + i * 1.7) * 0.3;
    m.rotation.x = (i - 1.5) * 0.2 + Math.cos(t * 1.1 + i) * 0.22;
  });
  peopleAnim(t, OV.userData.e);
}
// ---- Main entrance gate: where the east road meets Dr Venibhai Modi Marg (terracotta + beige, like the reference render)
const t11 = document.getElementById('t11');
const EGG = new THREE.Group();
EGG.position.set(577 - W / 2, 0, 46 - H / 2);
EGG.rotation.y = 0; // Perfectly perpendicular to the incoming North-South entrance road
scene.add(EGG);
const EWL = new THREE.Group();
EWL.position.copy(EGG.position);
EWL.rotation.y = 0;
scene.add(EWL);
const ETC = 0x9d4a32,
  EBG = 0xe3d3b4,
  EST = 0xd8c3a0;
[-9.3, 9.3].forEach((x) => {
  bx(3.4, 1.4, 3.4, EST, x, 0.7, 0, EGG);
  bx(2.6, 9.6, 2.6, ETC, x, 6.2, 0, EGG);
  bx(3.4, 0.6, 3.4, EBG, x, 11.3, 0, EGG);
  bx(1.4, 1.2, 1.4, ETC, x, 12.2, 0, EGG);
  const lm = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff0b8 })
  );
  lm.position.set(x, 13.3, 0);
  EGG.add(lm);

  // Warm carriage lanterns flanking the entrance arch on each pillar
  [1.35, -1.35].forEach((lz) => {
    const sconce = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.65, 0.35),
      new THREE.MeshBasicMaterial({ color: 0xffe899 })
    );
    sconce.position.set(x, 4.2, lz);
    EGG.add(sconce);
  });
});
bx(22, 3.2, 2.4, EBG, 0, 9.5, 0, EGG);
bx(22.2, 0.7, 2.6, ETC, 0, 7.6, 0, EGG);
bx(23, 0.5, 2.8, EST, 0, 11.35, 0, EGG);
bx(6, 1.4, 2.6, ETC, 0, 12.3, 0, EGG);
const bannerLoader = new THREE.TextureLoader();
const egt = bannerLoader.load('assets/main-gate-banner.png');
egt.encoding = THREE.sRGBEncoding;
if (typeof renderer !== 'undefined' && renderer.capabilities) {
  egt.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
}
[1.25, -1.25].forEach((z, i) => {
  const p = new THREE.Mesh(
    new THREE.PlaneGeometry(16.28, 3.1),
    new THREE.MeshBasicMaterial({ map: egt })
  );
  p.position.set(0, 9.5, z);
  if (i) p.rotation.y = Math.PI;
  EGG.add(p);
});

// Paved pedestrian sidewalk curbs flanking road through the gate portal (15.2m clear opening)
[-7.1, 7.1].forEach((px) => {
  const walkCurb = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.22, 8.0),
    new THREE.MeshLambertMaterial({ color: 0xd0c6b0 })
  );
  walkCurb.position.set(px, 0.11, 0);
  EGG.add(walkCurb);
});

// boundary walls with pilasters (long wing east, short wing west beside Atithi)
[
  [11.0, 26, 1],
  [-11.0, 10, -1]
].forEach(([x0, L, d]) => {
  bx(L, 3.2, 0.9, EBG, x0 + (d * L) / 2, 1.6, 0, EWL);
  bx(L + 0.3, 0.4, 1.2, ETC, x0 + (d * L) / 2, 3.4, 0, EWL);
  for (let u = 0; u <= L; u += 6) bx(1.2, 3.9, 1.4, EST, x0 + d * u, 1.95, 0, EWL);
});
// guard cabins placed outside the portal flanking the road
[-13.5, 13.5].forEach((x) => {
  bx(3.8, 3.5, 3.2, 0xf1ead8, x, 1.75, 4.6, EGG);
  bx(4.6, 0.4, 4, ETC, x, 3.7, 4.6, EGG);
  bx(2.2, 1.2, 0.1, dk, x + (x < 0 ? 1.95 : -1.95) * 0, 2.2, 6.25, EGG);
});
cyl(0.3, 1.8, 0x555a60, -6.2, 0.9, 3.6, EGG);
bx(0.22, 4.2, 0.22, 0xffffff, -6.2, 3.9, 3.6, EGG);
[2.9, 4.1, 5.3].forEach((y) => bx(0.25, 0.7, 0.25, 0xd33, -6.2, y, 3.6, EGG));
// flag pole with waving tricolour
// flag stands on the forecourt in front of the proposed hostel (map px 590,84)
const FLG = new THREE.Group();
FLG.position.set(590 - W / 2, 0, 84 - H / 2);
scene.add(FLG);
cyl(0.25, 18, 0xdddddd, 0, 9, 0, FLG);
const efc = document.createElement('canvas');
efc.width = 96;
efc.height = 64;
{
  const g = efc.getContext('2d');
  g.fillStyle = '#ff9933';
  g.fillRect(0, 0, 96, 22);
  g.fillStyle = '#fff';
  g.fillRect(0, 21, 96, 22);
  g.fillStyle = '#138808';
  g.fillRect(0, 42, 96, 22);
  g.strokeStyle = '#1f4fa3';
  g.lineWidth = 1.6;
  g.beginPath();
  g.arc(48, 32, 8, 0, 6.3);
  g.stroke();
  for (let i = 0; i < 12; i++) {
    g.beginPath();
    g.moveTo(48, 32);
    g.lineTo(48 + Math.cos(i * 0.5236) * 8, 32 + Math.sin(i * 0.5236) * 8);
    g.stroke();
  }
}
const flagM = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 3.3, 14, 1),
  new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(efc), side: THREE.DoubleSide })
);
flagM.position.set(2.6, 16.2, 0);
FLG.add(flagM);
const efp = flagM.geometry.attributes.position,
  efb = Float32Array.from(efp.array);
function gateAnim(t) {
  for (let i = 0; i < efp.count; i++) {
    const u = (efb[i * 3] + 2.5) / 5;
    efp.setZ(i, Math.sin(u * 5 - t * 4) * 0.45 * u);
  }
  efp.needsUpdate = true;
}
// ---- Premium pass: P_sky dome, day/dusk P_look, traffic, cloud shadows, lamp P_pools, info card
let dusk = 1,
  duskT = 1;
const P_tmp = new THREE.Color();
const P_LK = {
  day: {
    top: 0x5f9fe0,
    hor: 0xdde9ef,
    fog: 0xcfe0ea,
    sun: 0xfff2dd,
    si: 0.7,
    hs: 0xffffff,
    hg: 0x8a9a80,
    hi: 0.75,
    gt: 0xffffff,
    sp: [-260, 380, 200]
  },
  dusk: {
    top: 0x07050a,
    hor: 0x5a2a14,
    fog: 0x120d18,
    sun: 0xff9d5c,
    si: 0.5,
    hs: 0x6a5a92,
    hg: 0x2a1f26,
    hi: 0.5,
    gt: 0x6f6b92,
    sp: [-380, 150, 150]
  }
};
const P_skyG = new THREE.SphereGeometry(3400, 24, 16),
  P_skyC = new Float32Array(P_skyG.attributes.position.count * 3);
P_skyG.setAttribute('color', new THREE.BufferAttribute(P_skyC, 3));
const P_sky = new THREE.Mesh(
  P_skyG,
  new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false
  })
);
P_sky.renderOrder = -1;
scene.add(P_sky);
const P_cA = new THREE.Color(),
  P_cC = new THREE.Color();
function P_look(k) {
  const D = P_LK.day,
    N = P_LK.dusk,
    mx = (a, b, o) => o.setHex(a).lerp(P_tmp.setHex(b), k),
    top = mx(D.top, N.top, P_cA),
    hor = mx(D.hor, N.hor, P_cC),
    P = P_skyG.attributes.position;
  for (let i = 0; i < P.count; i++) {
    const h = clamp(P.getY(i) / 3400, -1, 1),
      t = Math.pow(Math.max(h, 0), 0.55);
    P_skyC[i * 3] = lerp(hor.r, top.r, t);
    P_skyC[i * 3 + 1] = lerp(hor.g, top.g, t);
    P_skyC[i * 3 + 2] = lerp(hor.b, top.b, t);
  }
  P_skyG.attributes.color.needsUpdate = true;
  scene.background.copy(hor);
  mx(D.fog, N.fog, scene.fog.color);
  mx(D.sun, N.sun, sun.color);
  sun.intensity = lerp(D.si, N.si, k);
  sun.position.set(lerp(D.sp[0], N.sp[0], k), lerp(D.sp[1], N.sp[1], k), lerp(D.sp[2], N.sp[2], k));
  mx(D.hs, N.hs, hemi.color);
  mx(D.hg, N.hg, hemi.groundColor);
  hemi.intensity = lerp(D.hi, N.hi, k);
  mx(D.gt, N.gt, ground.material.color);
  apron.material.color.setHex(0x7f8b72).multiplyScalar(lerp(1, 0.3, k));
  terr.material.color.copy(ground.material.color);
  P_pools.material.opacity = k * 0.6;
  lhalo.material.opacity = k * 0.95;
  lcone.material.opacity = k * 0.5;
  lhd.material.color.setHex(0x8c929a).lerp(P_tmp.setHex(0xfff0b0), k);
  LIT.forEach((m) => (m.emissiveIntensity = k * 1.1));
}
// lamp light P_pools (glow at dusk)
const P_pools = new THREE.InstancedMesh(
  new THREE.CircleGeometry(11, 24).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({
    map: GLW,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }),
  Math.max(1, LP.length)
);
{
  const m4 = new THREE.Matrix4();
  LP.forEach((p, i) => {
    m4.makeTranslation(p[0] - W / 2 + p[2] * 2.3, 0.95, p[1] - H / 2 + p[3] * 2.3);
    P_pools.setMatrixAt(i, m4);
  });
}
scene.add(P_pools);
// traffic (left-hand drive) on the three main roads
const P_CARN = 30,
  P_carB = new THREE.InstancedMesh(
    new THREE.BoxGeometry(2.1, 1, 4.6),
    new THREE.MeshLambertMaterial(),
    P_CARN
  ),
  P_carC = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.8, 0.8, 2.4),
    new THREE.MeshLambertMaterial({ color: 0x1d2630 }),
    P_CARN
  );
const P_CARS = [],
  P_CCOL = [0xf2f2f2, 0xc0392b, 0x2c3e50, 0x8e9aa6, 0xe0b341, 0x1f6fd6, 0x222222],
  P_cc2 = new THREE.Color();
for (let i = 0; i < P_CARN; i++) {
  P_CARS.push({
    r: i % MAINSP.length,
    u: Math.random(),
    v: 12 + Math.random() * 14,
    d: i % 2 ? 1 : -1
  });
  P_cc2.setHex(P_CCOL[i % 7]);
  P_carB.setColorAt(i, P_cc2);
}
P_carB.castShadow = P_carC.castShadow = true;
scene.add(P_carB, P_carC);
const P_cq = new THREE.Quaternion(),
  P_cm = new THREE.Matrix4(),
  P_cs1 = new V(1, 1, 1),
  P_cp = new V(),
  P_ce = new THREE.Euler();
function P_carsAnim(dt) {
  P_CARS.forEach((c, i) => {
    const sp = MAINSP[c.r],
      N = sp.length;
    c.u = (c.u + (c.v * dt) / (N * 3)) % 1;
    const t = c.d > 0 ? c.u : 1 - c.u,
      f = t * (N - 1),
      i0 = Math.min(N - 2, Math.floor(f)),
      fr = f - i0,
      a = sp[i0],
      b = sp[i0 + 1],
      dx = (b.x - a.x) * c.d,
      dz = (b.z - a.z) * c.d,
      l = Math.hypot(dx, dz) || 1,
      off = MAINW[c.r] * 0.22;
    P_cq.setFromEuler(P_ce.set(0, Math.atan2(dx, dz), 0));
    P_cp.set(
      a.x + (b.x - a.x) * fr + (dz / l) * off,
      0.85,
      a.z + (b.z - a.z) * fr - (dx / l) * off
    );
    P_cm.compose(P_cp, P_cq, P_cs1);
    P_carB.setMatrixAt(i, P_cm);
    P_cp.y = 1.65;
    P_cm.compose(P_cp, P_cq, P_cs1);
    P_carC.setMatrixAt(i, P_cm);
  });
  P_carB.instanceMatrix.needsUpdate = P_carC.instanceMatrix.needsUpdate = true;
}
// drifting cloud shadows
const P_clc = document.createElement('canvas');
P_clc.width = P_clc.height = 128;
{
  const g = P_clc.getContext('2d'),
    gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, 'rgba(0,0,0,.55)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
}
const P_clT = new THREE.CanvasTexture(P_clc),
  P_CLS = [0, 1, 2, 3, 4, 5].map(() => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: P_clT,
        transparent: true,
        opacity: 0.22,
        depthWrite: false
      })
    );
    const z = 170 + Math.random() * 130;
    m.scale.set(z, 1, z * (0.6 + Math.random() * 0.3));
    m.position.set((Math.random() - 0.5) * W, 0.98, (Math.random() - 0.5) * H);
    m.userData.v = 3 + Math.random() * 3;
    scene.add(m);
    return m;
  });
// ---- trees never block the camera: shrink any tree the camera is inside of, or that sits on the line of sight
var treeHook = null,
  treeRate = 7;
const tcD = new V(),
  tcP = new V(),
  tcS = new V(),
  tcM = new THREE.Matrix4();
function treeClear(dt) {
  const C = cam.position,
    low = C.y < 190;
  let ch = false;
  cam.getWorldDirection(tcD);
  const L = tcD.y < -0.02 ? Math.min(700, -C.y / tcD.y) : 600;
  for (const T of TREES) {
    let tf = 1;
    if (low) {
      const px = T.x - C.x,
        py = T.cy - C.y,
        pz = T.z - C.z,
        sv = clamp(px * tcD.x + py * tcD.y + pz * tcD.z, 0, 0.86 * L),
        qx = C.x + tcD.x * sv - T.x,
        qy = C.y + tcD.y * sv - T.cy,
        qz = C.z + tcD.z * sv - T.z;
      if (Math.hypot(qx, qy, qz) < T.r + 2.4) tf = 0;
    }
    if (tf && treeHook && treeHook(T)) tf = 0;
    if (T.f !== tf) {
      T.f += (tf - T.f) * (1 - Math.exp(-dt * treeRate));
      if (Math.abs(T.f - tf) < 0.015) T.f = tf;
    }
    if (T.f !== T.fl) {
      T.fl = T.f;
      ch = true;
      const f = Math.max(0.001, T.f);
      tcP.set(T.x, (T.th + T.sy * 0.7) * f, T.z);
      tcS.set(T.sx * f, T.sy * f, T.sx * f);
      tcM.compose(tcP, T.q, tcS);
      T.cr.setMatrixAt(T.i, tcM);
      const tw = 1.2 + T.sz * 0.1;
      tcP.set(T.x, (T.th / 2) * f, T.z);
      tcS.set(tw * f, T.th * f, tw * f);
      tcM.compose(tcP, T.q, tcS);
      T.tk.setMatrixAt(T.i, tcM);
      tcP.set(T.x + T.sz * 0.35 * f, 0.32, T.z + T.sz * 0.3 * f);
      tcS.set(T.sx * 1.35 * f, 1, T.sx * 1.2 * f);
      tcM.compose(tcP, T.q, tcS);
      sdw.setMatrixAt(T.si, tcM);
    }
  }
  if (ch) TM.forEach((m) => (m.instanceMatrix.needsUpdate = true));
}
[lamp, larm, lhd, lcone, lhalo, P_carB, P_carC, P_pools].forEach((m) => (m.frustumCulled = false));
let P_pT = 0;
function premiumAnim(t) {
  const dt = Math.min(0.05, Math.max(0, t - P_pT));
  P_pT = t;
  P_sky.position.copy(cam.position);
  treeClear(dt);
  if (Math.abs(duskT - dusk) > 0.002) {
    dusk += (duskT - dusk) * (1 - Math.exp(-dt * 2.2));
    P_look(dusk);
  }
  P_carsAnim(dt);
  P_CLS.forEach((m) => {
    m.position.x += m.userData.v * dt;
    if (m.position.x > W / 2 + 200) m.position.x = -W / 2 - 200;
    m.material.opacity = 0.22 * (1 - dusk * 0.6);
  });
}
// day / dusk switch + building info card
const P_tb = document.createElement('button');
P_tb.className = 'tbtn';
P_tb.textContent = '☀ Day';
P_tb.onclick = () => {
  duskT = duskT ? 0 : 1;
  AF.touched = true;
  P_tb.textContent = duskT ? '☀ Day' : '☾ Dusk';
};
view.appendChild(P_tb);
const P_INF = {
  t1: ['Gati Shakti Vishwavidyalaya', 'Current academic block', 'Existing'],
  t4: ['Proposed hostel block', 'Hostel', 'Proposed'],
  t5: ['Atithi hostel', 'Hostel', 'Existing'],
  t6: ['Proposed laboratory block', 'Laboratory', 'Proposed'],
  t7: ['Proposed academic block', 'Academic', 'Proposed'],
  t8: ['Pratap Vilas Palace', 'Landmark', 'Existing'],
  t9: ['Manthan building', 'Classroom building', 'Existing'],
  t11: ['Main entrance gate', 'Campus entrance', '']
};
const P_inf = document.createElement('div');
P_inf.className = 'info';
P_inf.innerHTML =
  '<h4></h4><div class="row"><em class="chip"></em><span></span></div><button>← Back to overview</button>';
view.appendChild(P_inf);
function showInfo(id) {
  const d = P_INF[id];
  if (!d) return;
  P_inf.querySelector('h4').textContent = d[0];
  P_inf.querySelector('span').textContent = d[1];
  const c = P_inf.querySelector('.chip');
  c.textContent = d[2];
  c.style.display = d[2] ? '' : 'none';
  P_inf.classList.add('on');
}
function hideInfo() {
  if (P_inf.classList.contains('on')) P_inf.classList.remove('on');
}
P_inf.querySelector('button').onclick = () => {
  grab();
  T0.set(0, 0, 12);
  orb.rt = 680;
  orb.phi = 0.95;
  orb.theta = 0.3;
  orb.vt = orb.vp = 0;
  mode = 'explore';
  setOn(bFree);
};
P_look(dusk);
// ---- Agnee highlight: sky beams, pulsing ground rings, glowing "way to Agnee" path from the main gate, banner
OV.updateMatrixWorld(true);
const agGeo = () => {
  const g = new THREE.ConeGeometry(9, 130, 14, 1, true).rotateX(Math.PI).translate(0, 65, 0),
    p = g.attributes.position,
    c = [];
  for (let i = 0; i < p.count; i++) {
    const k = Math.pow(Math.max(0, 1 - p.getY(i) / 130), 1.5);
    c.push(k, k, k);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  return g;
};
const agC = new V(240 - W / 2, 0, 270 - H / 2),
  agS = OV.localToWorld(new V(-30, 0, 0));
const agBeams = [0xff3fa4, 0x38d0ff, 0xffc233, 0x7cff5a, 0xb06bff].map((c) => {
  const m = new THREE.Mesh(
    agGeo(),
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      color: c,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  m.position.set(agS.x, 8, agS.z);
  scene.add(m);
  return m;
});
const agRings = [0, 1].map(() => {
  const r = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1, 64),
    new THREE.MeshBasicMaterial({
      color: 0xff3fa4,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  r.rotation.x = -Math.PI / 2;
  r.position.set(agC.x, 0.9, agC.z);
  scene.add(r);
  return r;
});
function agneeAnim(t) {
  const O = OV.userData,
    dA = Math.min(0.05, Math.max(0, t - agT));
  agT = t;
  O.e += ((O.target || 0) - O.e) * (1 - Math.exp(-dA * 0.8));
  agLive.classList.toggle('on', O.e > 0.7);
  beams.forEach((m) => (m.material.opacity = 0.12 + 0.42 * O.e));
  agBeams.forEach((m, i) => {
    m.rotation.z = Math.sin(t * 0.7 + i * 1.26) * 0.42;
    m.rotation.x = Math.cos(t * 0.55 + i * 1.7) * 0.42;
    m.material.opacity = (0.24 + 0.09 * Math.sin(t * 2 + i)) * (1 + dusk * 1.2) * (0.4 + 0.6 * O.e);
  });
  agRings.forEach((r, i) => {
    const k = (t * 0.45 + i * 0.5) % 1;
    r.scale.setScalar(8 + k * 60);
    r.material.opacity = (1 - k) * 0.7;
  });
}
let agT = 0;
const agLive = document.createElement('div');
agLive.className = 'live';
agLive.innerHTML =
  '<i></i>LIVE · <img class="wmi" style="height:15px" alt="Agnee" src="' + WMURI + '">';
view.appendChild(agLive);
const agCard = document.createElement('div');
agCard.className = 'agcard';
agCard.innerHTML =
  '<b><img class="wmi" style="height:30px" alt="Agnee" src="' +
  WMURI +
  '"></b><span>The Cultural Fest · Oval Ground</span><u>Take the journey →</u>';
agCard.onclick = () => TOUR.start();
view.appendChild(agCard);
festAnim(0);
