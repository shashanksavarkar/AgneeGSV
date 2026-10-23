// Ember trail: glowing sparks rise behind the veena cursor and fade out; it keeps flaring when the cursor is still

const rand = (a, b) => a + Math.random() * (b - a);

export function initCursorFx() {
  // no trail on touch screens, or for visitors who ask for reduced motion
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'cfx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  resize();
  addEventListener('resize', resize);

  let embers = [];
  let pos = null; // last known cursor position
  const spawn = () => {
    if (embers.length > 300) return;
    embers.push({ x: pos.x, y: pos.y, vx: rand(-0.4, 0.4), vy: rand(-1.3, -0.3), r: rand(1.5, 3.5), life: 1, decay: rand(0.015, 0.03) });
  };
  addEventListener('mousemove', (e) => {
    pos = { x: e.clientX, y: e.clientY };
    spawn();
  });
  document.documentElement.addEventListener('mouseleave', () => { pos = null; }); // cursor left the window

  const frame = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (pos && Math.random() < 0.35) spawn(); // keeps flaring while the cursor is still
    embers = embers.filter((p) => p.life > 0);
    ctx.shadowColor = '#ff7a1a';
    ctx.shadowBlur = 10;
    for (const p of embers) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.life > 0.5 ? '#ffd27a' : '#ff7a1a';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life + 0.5, 0, 6.28);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  };
  frame();
}
