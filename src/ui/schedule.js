// Timeline section: "Night sky". The evening plays by itself while the section is on screen (or slide the time) and the sky goes from dusk to midnight
// while the current act shows in the sky. Data: schedule.program in data/data.js

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
// "20-25" -> 22.5; an empty slot (the last act) counts as 30 min
const durOf = (s) => { if (!s) return 30; const p = String(s).split('-').map(Number); return p.reduce((a, b) => a + b, 0) / p.length; };
const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));

const HOLD = 1100; // ms each act stays up while playing
const TWEEN = 450; // ms the sky takes to move to the next act

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
          <div class="sky-day" aria-hidden="true"></div>
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
          <input type="range" id="skyRange" min="${T0}" max="${T1}" value="${T0}" aria-label="Time of evening">
        </div>

        <ol class="sky-list">${acts.map((a) => `<li>${a.time} ${a.name} (${a.label})</li>`).join('')}</ol>
      </div>
    </section>
  `;

  const box = mount.querySelector('#skyBox');
  const stars = box.querySelector('.sky-stars');
  const orb = box.querySelector('.sky-orb');
  const day = box.querySelector('.sky-day');
  const range = mount.querySelector('#skyRange');
  const $ = (s) => box.querySelector(s);
  stars.innerHTML = Array.from({ length: 80 }, (_, i) => `<i style="left:${(i * 53) % 100}%;top:${(i * 31) % 70}%;animation-delay:${-(i % 9) * 0.35}s"></i>`).join('');

  let t = T0;
  let timer = null;
  let raf = 0;
  let moon = null;
  let manual = false; // the visitor dragged the slider: stay put until they scroll away and back

  // sky visuals: only opacity and transform change per frame, so the browser can keep each layer on the GPU
  const paint = () => {
    const k = Math.max(0, Math.min(1, (t - T0) / (T1 - T0)));
    day.style.opacity = 1 - Math.min(1, k * 1.4);
    stars.style.opacity = Math.max(0, (k - 0.25) * 1.6);
    // rises steeply and peaks above the clock, so it never crosses the palace or the text
    const x = (8 + k * 84) / 100 * box.clientWidth;
    const y = (84 - Math.sin(k * Math.PI) ** 0.6 * 74) / 100 * box.clientHeight;
    orb.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const m = k > 0.45;
    if (m !== moon) {
      moon = m;
      orb.style.background = m ? 'radial-gradient(circle at 35% 35%, #fff, #cfd6ee 70%)' : 'radial-gradient(circle at 35% 35%, #fff1d2, #ffb347 70%)';
      orb.style.boxShadow = m ? '0 0 50px 10px rgba(200, 210, 255, 0.5)' : '0 0 60px 16px rgba(255, 150, 40, 0.7)';
    }
    $('.sky-time').textContent = fmt(Math.round(t));
  };

  // act name and note for a given time (acts can overlap, so the current act is the latest one that has started)
  const label = (tt) => {
    const last = acts.findLastIndex((a) => a.start <= tt);
    const cur = last >= 0 && tt < acts[last].start + acts[last].dur ? last : -1;
    const nxt = acts.findIndex((a) => a.start > tt);
    $('.sky-name').textContent = cur >= 0 ? acts[cur].name : nxt >= 0 ? `Next: ${acts[nxt].name}` : 'That is a wrap';
    $('.sky-meta').textContent = cur >= 0 ? `Now playing - ${acts[cur].label}` : nxt >= 0 ? `in ${Math.round(acts[nxt].start - tt)} min` : 'Thank you for coming';
  };

  // glide the sky to a time; the act text switches the moment the glide starts, so text and sky stay in step
  const glide = (to) => {
    cancelAnimationFrame(raf);
    const from = t;
    const t0 = performance.now();
    label(to);
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / TWEEN);
      t = from + (to - from) * (1 - (1 - p) ** 3);
      range.value = t;
      paint();
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  const stop = () => { clearTimeout(timer); timer = null; };
  const step = () => {
    const nxt = acts.findIndex((a) => a.start > t + 0.5);
    if (nxt < 0) {
      // after the last act, hold, then loop back to the start
      glide(T1);
      timer = setTimeout(() => { glide(T0); timer = setTimeout(step, HOLD); }, HOLD * 1.5);
      return;
    }
    glide(acts[nxt].start);
    timer = setTimeout(step, HOLD);
  };

  range.addEventListener('input', () => { cancelAnimationFrame(raf); stop(); manual = true; t = +range.value; paint(); label(t); });

  // autoplay while at least half of the sky is on screen
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { manual = false; if (!timer) step(); }
      else if (!manual) { stop(); cancelAnimationFrame(raf); }
    }, { threshold: 0.5 }).observe(box);
  }

  paint();
  label(t);
}
