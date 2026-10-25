// Hero wordmark built from tiny petals: they scatter and spin away from the pointer, then settle back.

const SRC = 'assets/logos/logo-crop.webp'; // logo cropped to its lettering (assets/logos/logo.webp has a lot of empty margin)
const STEP = 4; // pixel grid for one petal at 640px wide; smaller = denser and slower

export function initHeroPetals(section) {
  const cv = section.querySelector('.hero-petals');
  if (!cv) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const img = new Image();
  img.src = SRC;

  img.onload = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let petals = [];
    let mx = -999;
    let my = -999;
    let raf = 0;
    let visible = true;

    const build = () => {
      const w = cv.clientWidth;
      const h = Math.round(w * img.naturalHeight / img.naturalWidth);
      cv.style.height = `${h}px`;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const o = document.createElement('canvas');
      o.width = w; o.height = h;
      const oc = o.getContext('2d', { willReadFrequently: true });
      oc.drawImage(img, 0, 0, w, h);
      const d = oc.getImageData(0, 0, w, h).data;
      const k = w / 640; // grid and petal size follow the logo size
      const step = Math.max(3, Math.round(STEP * k));
      const f = step / STEP;
      petals = [];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          if (d[i + 3] < 128) continue;
          petals.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, a: Math.random() * 6.3, va: 0, s: (3.4 + Math.random() * 1.6) * f * 1.1, c: `rgb(${d[i]},${d[i + 1]},${d[i + 2]})` });
        }
      }
    };

    const draw = () => {
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const p of petals) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < 80 && !reduce) {
          const f = (80 - dist) / 80 * 7;
          p.vx += dx / (dist || 1) * f;
          p.vy += dy / (dist || 1) * f;
          p.va += (Math.random() - 0.5) * 0.5;
        }
        p.vx += (p.hx - p.x) * 0.06; p.vy += (p.hy - p.y) * 0.06;
        p.vx *= 0.82; p.vy *= 0.82; p.va *= 0.9;
        p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.s, p.s * 0.5, 0, 0, 6.3);
        ctx.fill();
        ctx.restore();
      }
      raf = visible ? requestAnimationFrame(draw) : 0;
    };

    // hero-content is pointer-events:none, so track the pointer on the whole hero
    section.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    section.addEventListener('pointerleave', () => { mx = my = -999; });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(draw); }).observe(section);
    let rw = cv.clientWidth;
    addEventListener('resize', () => { if (cv.clientWidth !== rw) { rw = cv.clientWidth; build(); } });

    build();
    draw();
  };
}
