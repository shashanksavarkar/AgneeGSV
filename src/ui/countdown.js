// Countdown to Agnee day, shared by the hero and the footer

// ponytail: fixed date at midnight local time, move it to data.js if it changes
const AGNEE_DAY = new Date(2026, 9, 31);

export const igniteHtml = (cls) => `
  <div class="${cls}" aria-live="off">
    <span class="ft-ignite-label">Agnee ignites in</span>
    <div class="ft-ignite-row">
      <span><b data-u="d">00</b><small>Days</small></span>
      <span><b data-u="h">00</b><small>Hrs</small></span>
      <span><b data-u="m">00</b><small>Min</small></span>
      <span><b data-u="s">00</b><small>Sec</small></span>
    </div>
  </div>`;

export function startIgnite(box) {
  if (!box) return;
  const tick = () => {
    const t = Math.max(0, AGNEE_DAY - Date.now());
    if (!t) { box.innerHTML = '<span class="ft-ignite-label">Agnee is live</span>'; clearInterval(id); return; }
    const v = { d: t / 864e5, h: (t / 36e5) % 24, m: (t / 6e4) % 60, s: (t / 1e3) % 60 };
    for (const u in v) box.querySelector(`[data-u="${u}"]`).textContent = String(Math.floor(v[u])).padStart(2, '0');
  };
  const id = setInterval(tick, 1000);
  tick();
}
