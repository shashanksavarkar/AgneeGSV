// Custom page scrollbar: a slim rail with a knob that rides down as you scroll; click or drag to scroll.
// Section ticks on the rail replace the header nav: hover for the name, click to jump.

const SECTIONS = [['about', 'About'], ['events', 'Events'], ['schedule', 'Schedule'], ['map', 'Campus Map'], ['lineup', 'Line-up'], ['sponsors', 'Sponsors'], ['gallery', 'Gallery'], ['merch', 'Merch'], ['team', 'Team'], ['faq', 'FAQ'], ['contact', 'Contact']];

export function initScrollRail() {
  const rail = document.createElement('div');
  rail.className = 'scroll-rail';
  rail.setAttribute('aria-hidden', 'true');
  rail.innerHTML = '<div class="scroll-rail-fill"></div><span class="scroll-rail-knob"></span>';
  const marks = SECTIONS.map(([id, label]) => {
    const a = document.createElement('a');
    a.className = 'scroll-rail-mark';
    a.href = `#${id}`;
    a.dataset.label = label;
    a.setAttribute('aria-label', label);
    rail.appendChild(a);
    return [a, id];
  });
  document.body.appendChild(rail);
  const fill = rail.firstChild;
  const knob = rail.querySelector('.scroll-rail-knob');

  let cachedMaxScroll = 0;
  const markData = marks.map(([a, id]) => ({ a, id, el: null, top: 0 }));

  let idle;
  function wake() {
    rail.classList.add('awake');
    clearTimeout(idle);
    idle = setTimeout(() => rail.classList.remove('awake'), 2000);
  }

  function layoutMarks() {
    cachedMaxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    rail.hidden = cachedMaxScroll <= 0;
    if (cachedMaxScroll <= 0) return;

    for (const m of markData) {
      if (!m.el) m.el = document.getElementById(m.id);
      if (!m.el) {
        m.a.hidden = true;
        continue;
      }
      m.a.hidden = false;
      m.top = m.el.getBoundingClientRect().top + scrollY;
      m.a.style.top = `${Math.min(100, (m.top / cachedMaxScroll) * 100)}%`;
    }
  }

  let scrollTicking = false;
  function updateScroll() {
    wake();
    const max = cachedMaxScroll || Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const y = window.scrollY;
    const pct = max > 0 ? (y / max) * 100 : 0;
    fill.style.height = knob.style.top = `${pct}%`;

    let current = null;
    const thresh = y + innerHeight * 0.4;
    for (const m of markData) {
      if (m.top <= thresh) current = m.a;
      m.a.classList.remove('active');
    }
    current?.classList.add('active');
    scrollTicking = false;
  }

  function onScroll() {
    if (!scrollTicking) {
      requestAnimationFrame(updateScroll);
      scrollTicking = true;
    }
  }

  function scrollToPointer(e) {
    const r = rail.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    const max = cachedMaxScroll || (document.documentElement.scrollHeight - innerHeight);
    scrollTo({ top: ratio * max, behavior: 'instant' });
  }

  rail.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.scroll-rail-mark')) return;
    rail.setPointerCapture(e.pointerId);
    rail.classList.add('dragging');
    scrollToPointer(e);
  });
  rail.addEventListener('pointermove', (e) => { if (rail.classList.contains('dragging')) scrollToPointer(e); });
  rail.addEventListener('pointerup', () => rail.classList.remove('dragging'));

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    layoutMarks();
    updateScroll();
  }, { passive: true });

  const ro = new ResizeObserver(() => {
    layoutMarks();
    updateScroll();
  });
  ro.observe(document.body);

  setTimeout(() => {
    layoutMarks();
    updateScroll();
  }, 100);
}