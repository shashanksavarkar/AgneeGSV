// Timeline section: "Night sky". Slide (or play) the time forward and the sky goes from dusk to midnight
// while the current act shows in the sky. Data: schedule.program in data/data.js

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
// "20-25" -> 22.5; an empty slot (the last act) counts as 30 min
const durOf = (s) => { if (!s) return 30; const p = String(s).split('-').map(Number); return p.reduce((a, b) => a + b, 0) / p.length; };
const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));

const HOLD = 1800; // ms each act stays up while playing
const TWEEN = 700; // ms the sky takes to move to the next act

export function renderSchedule(scheduleData = { program: [] }) {
  const mount = document.getElementById('schedule-mount');
  if (!mount) return;

  const program = scheduleData.program || [];
  const acts = program.flat().map(({ time, mins, name }) => ({ time, name, start: toMin(time), dur: durOf(mins), label: mins ? `${mins} min` : 'Late night' }));
  if (!acts.length) return;
  const N = acts.length;
  const T0 = acts[0].start - 10;
  const T1 = acts[N - 1].start + acts[N - 1].dur + 10;

  mount.innerHTML = `
    <section class="section schedule-section" id="schedule" aria-labelledby="scheduleHeading">
      <div class="container">
        <div class="section-header">
          <img class="sec-icon" src="assets/elements/tabla.svg" alt="" aria-hidden="true">
          <h2 class="section-title" id="scheduleHeading">Timeline & Stage Tracks</h2>
        </div>

        <div class="sky" id="skyBox">
          <div class="sky-stars" aria-hidden="true"></div>
          <div class="sky-orb" aria-hidden="true"></div>
          <div class="sky-txt" aria-live="polite">
            <div class="sky-time"></div>
            <div class="sky-name"></div>
            <div class="sky-meta"></div>
          </div>
          <div class="sky-hill" aria-hidden="true"></div>
          <div class="sky-palace" aria-hidden="true"></div>
        </div>
        <div class="sky-ctl">
          <button type="button" class="sky-play" id="skyPlay" aria-label="Play the evening">&#9654;</button>
          <input type="range" id="skyRange" min="${T0}" max="${T1}" value="${T0}" aria-label="Time of evening">
        </div>

        <ol class="sky-list">${acts.map((a) => `<li>${a.time} ${a.name} (${a.label})</li>`).join('')}</ol>
      </div>
    </section>
  `;

  const box = mount.querySelector('#skyBox');
  const stars = box.querySelector('.sky-stars');
  const orb = box.querySelector('.sky-orb');
  const range = mount.querySelector('#skyRange');
  const playBtn = mount.querySelector('#skyPlay');
  const $ = (s) => box.querySelector(s);
  stars.innerHTML = Array.from({ length: 80 }, (_, i) => `<i style="left:${(i * 53) % 100}%;top:${(i * 31) % 70}%;animation-delay:${-(i % 9) * 0.35}s"></i>`).join('');

  let t = T0;
  let timer = null;
  let raf = 0;

  const paint = (text = true) => {
    const k = Math.max(0, Math.min(1, (t - T0) / (T1 - T0)));
    const top = mix([255, 122, 26], [5, 3, 10], Math.min(1, k * 1.6));
    const mid = mix([138, 40, 60], [12, 6, 24], Math.min(1, k * 1.4));
    const bot = mix([255, 190, 90], [24, 10, 40], Math.min(1, k * 1.3));
    box.style.background = `linear-gradient(180deg, rgb(${top}) 0%, rgb(${mid}) 55%, rgb(${bot}) 100%)`;
    stars.style.opacity = Math.max(0, (k - 0.25) * 1.6);
    orb.style.left = `${8 + k * 84}%`;
    // rises steeply and peaks above the clock, so it never crosses the palace or the text
    orb.style.top = `${84 - Math.sin(k * Math.PI) ** 0.6 * 74}%`;
    const moon = k > 0.45;
    orb.style.background = moon ? 'radial-gradient(circle at 35% 35%, #fff, #cfd6ee 70%)' : 'radial-gradient(circle at 35% 35%, #fff1d2, #ffb347 70%)';
    orb.style.boxShadow = moon ? '0 0 50px 10px rgba(200, 210, 255, 0.5)' : '0 0 60px 16px rgba(255, 150, 40, 0.7)';
    if (!text) return;

    // acts can overlap (a short act starts inside a longer one), so the current act is the latest one that has started
    const last = acts.findLastIndex((a) => a.start <= t);
    const cur = last >= 0 && t < acts[last].start + acts[last].dur ? last : -1;
    const nxt = acts.findIndex((a) => a.start > t);
    const a = cur >= 0 ? acts[cur] : acts[nxt] || acts[N - 1];
    $('.sky-time').textContent = fmt(Math.round(t));
    $('.sky-name').textContent = cur >= 0 ? a.name : nxt >= 0 ? `Next: ${acts[nxt].name}` : 'That is a wrap';
    $('.sky-meta').textContent = cur >= 0 ? `Now playing - ${a.label}` : nxt >= 0 ? `in ${Math.round(acts[nxt].start - t)} min` : 'Thank you for coming';
  };

  // glide the sky to a time instead of jumping, so the change is easy to follow
  const glide = (to) => {
    cancelAnimationFrame(raf);
    const from = t;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / TWEEN);
      t = from + (to - from) * (1 - (1 - p) ** 3);
      range.value = t;
      paint(p >= 1); // text changes only when the sky arrives, not on the way
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  const stop = () => { clearTimeout(timer); timer = null; playBtn.innerHTML = '&#9654;'; playBtn.setAttribute('aria-label', 'Play the evening'); };
  const step = () => {
    const nxt = acts.findIndex((a) => a.start > t + 0.5);
    if (nxt < 0) { glide(T1); stop(); return; }
    glide(acts[nxt].start);
    timer = setTimeout(step, HOLD);
  };

  range.addEventListener('input', () => { cancelAnimationFrame(raf); stop(); t = +range.value; paint(); });
  playBtn.addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (t >= T1 - 1) t = T0;
    playBtn.innerHTML = '&#10074;&#10074;';
    playBtn.setAttribute('aria-label', 'Pause');
    step();
  });

  paint();
}
