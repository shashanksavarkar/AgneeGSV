// High-Performance Silk Golden Butterfly Stardust & Glitter Trail
// Uses pre-rendered GPU texture sprites, frame-throttled emission, zero CPU blur, and idle sleep

const rand = (a, b) => a + Math.random() * (b - a);

export function initCursorFx() {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'cfx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  };
  resize();
  addEventListener('resize', resize, { passive: true });

  // --------------------------------------------------------------------------
  // Pre-rendered GPU Sprites (Eliminates CPU shadowBlur and matrix overhead)
  // --------------------------------------------------------------------------
  const makeSprite = (size, drawFn) => {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    drawFn(g, size / 2, size / 2);
    return c;
  };

  // 1. Radiant 4-Point Diamond Starlight Star
  const starSprite = makeSprite(44, (g, cx, cy) => {
    // Soft outer golden glow
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, 20);
    grad.addColorStop(0, 'rgba(255, 240, 150, 0.95)');
    grad.addColorStop(0.35, 'rgba(255, 200, 30, 0.55)');
    grad.addColorStop(0.7, 'rgba(255, 140, 0, 0.15)');
    grad.addColorStop(1, 'rgba(255, 110, 0, 0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(cx, cy, 20, 0, 6.283);
    g.fill();

    // Sharp 4-point diamond star
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(cx, cy - 18);
    g.quadraticCurveTo(cx, cy, cx + 18, cy);
    g.quadraticCurveTo(cx, cy, cx, cy + 18);
    g.quadraticCurveTo(cx, cy, cx - 18, cy);
    g.quadraticCurveTo(cx, cy, cx, cy - 18);
    g.closePath();
    g.fill();

    // Central pinpoint highlight
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(cx, cy, 2.2, 0, 6.283);
    g.fill();
  });

  // 2. Silky Golden Pixie Dust Mote
  const dustSprite = makeSprite(32, (g, cx, cy) => {
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, 14);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 225, 120, 0.9)');
    grad.addColorStop(0.7, 'rgba(255, 160, 0, 0.35)');
    grad.addColorStop(1, 'rgba(255, 110, 0, 0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(cx, cy, 14, 0, 6.283);
    g.fill();
  });

  // 3. Ethereal Golden Fairy Halo Orb
  const haloSprite = makeSprite(44, (g, cx, cy) => {
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, 21);
    grad.addColorStop(0, 'rgba(255, 215, 64, 0.45)');
    grad.addColorStop(0.5, 'rgba(255, 160, 0, 0.18)');
    grad.addColorStop(1, 'rgba(255, 110, 0, 0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(cx, cy, 21, 0, 6.283);
    g.fill();
  });

  // --------------------------------------------------------------------------
  // Particle State & Lifecycle
  // --------------------------------------------------------------------------
  let particles = [];
  let mousePos = null;
  let lastSpawnPos = null;
  let isLoopActive = false;
  let idleCounter = 0;

  const spawnParticle = (x, y, vx, vy, isClick = false) => {
    if (particles.length >= 75) return;
    const kindRand = Math.random();
    const type = isClick
      ? (kindRand < 0.6 ? 0 : 1) // 0: star, 1: dust
      : (kindRand < 0.28 ? 0 : kindRand < 0.88 ? 1 : 2); // 2: halo

    const sprite = type === 0 ? starSprite : type === 1 ? dustSprite : haloSprite;
    const baseSize = type === 0 ? rand(14, 22) : type === 1 ? rand(8, 14) : rand(18, 30);
    const maxAge = isClick ? Math.floor(rand(24, 38)) : Math.floor(rand(20, 34));

    particles.push({
      x,
      y,
      vx,
      vy,
      sprite,
      size: baseSize,
      age: 0,
      maxAge,
      phase: rand(0, Math.PI * 2)
    });

    wakeLoop();
  };

  const wakeLoop = () => {
    if (!isLoopActive) {
      isLoopActive = true;
      requestAnimationFrame(frame);
    }
  };

  // Record mouse position with zero allocation
  addEventListener('mousemove', (e) => {
    mousePos = { x: e.clientX, y: e.clientY };
    idleCounter = 0;
    wakeLoop();
  }, { passive: true });

  // Tactile champagne burst on click
  addEventListener('mousedown', (e) => {
    const originX = e.clientX + 10;
    const originY = e.clientY + 10;
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 6.283 + rand(-0.2, 0.2);
      const speed = rand(1.2, 3.4);
      spawnParticle(originX, originY, Math.cos(angle) * speed, Math.sin(angle) * speed, true);
    }
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    mousePos = null;
    lastSpawnPos = null;
  });

  // --------------------------------------------------------------------------
  // Main VSync-Locked Render Loop
  // --------------------------------------------------------------------------
  const frame = () => {
    // 1. Frame-based throttled trail emission (Max 1-3 particles per frame)
    if (mousePos) {
      if (lastSpawnPos) {
        const dx = mousePos.x - lastSpawnPos.x;
        const dy = mousePos.y - lastSpawnPos.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 2.0) {
          // Trail originates from behind butterfly wings (~10px offset from antenna tip at 7,7)
          const wingX = 10;
          const wingY = 10;
          const count = Math.min(Math.floor(dist / 6) + 1, 3);
          const perpX = -dy / dist;
          const perpY = dx / dist;

          for (let i = 0; i < count; i++) {
            const t = (i + 1) / count;
            const px = lastSpawnPos.x + dx * t + wingX + rand(-2, 2);
            const py = lastSpawnPos.y + dy * t + wingY + rand(-2, 2);
            const spread = rand(-3.5, 3.5);

            spawnParticle(
              px + perpX * spread,
              py + perpY * spread,
              perpX * spread * 0.08 + rand(-0.25, 0.25) + dx * 0.03,
              perpY * spread * 0.08 + rand(-0.4, 0.1) + dy * 0.03
            );
          }
          lastSpawnPos = { x: mousePos.x, y: mousePos.y };
        }
      } else {
        lastSpawnPos = { x: mousePos.x, y: mousePos.y };
      }
    }

    // 2. Gentle idle shimmer when resting
    idleCounter++;
    if (mousePos && idleCounter > 15 && Math.random() < 0.12) {
      spawnParticle(mousePos.x + 10 + rand(-4, 4), mousePos.y + 10 + rand(-4, 4), rand(-0.15, 0.15), rand(-0.25, 0.05));
    }

    // 3. Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 4. Render particles with hardware-accelerated additive blitting
    if (particles.length > 0) {
      ctx.globalCompositeOperation = 'lighter';
      const alive = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.age++;

        if (p.age >= p.maxAge) continue;

        // Fluid motion
        p.x += p.vx + Math.sin(p.age * 0.15 + p.phase) * 0.18;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy = p.vy * 0.94 - 0.02; // Soft thermal lift

        // Smooth bell-curve alpha: 0 -> 1 -> 0
        const progress = p.age / p.maxAge;
        const alpha = Math.sin(progress * Math.PI);
        const scale = 0.5 + 0.5 * alpha;
        const drawSize = p.size * scale * dpr;

        ctx.globalAlpha = alpha;
        ctx.drawImage(
          p.sprite,
          Math.round((p.x * dpr) - drawSize / 2),
          Math.round((p.y * dpr) - drawSize / 2),
          Math.round(drawSize),
          Math.round(drawSize)
        );

        alive.push(p);
      }

      particles = alive;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
    }

    // 5. Sleep loop when idle and empty to save 100% CPU/GPU
    if (particles.length === 0 && (!mousePos || idleCounter > 30)) {
      isLoopActive = false;
      return;
    }

    requestAnimationFrame(frame);
  };
}
