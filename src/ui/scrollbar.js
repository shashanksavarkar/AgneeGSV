// Custom page scrollbar: a slim rail with a pumpkin that rides down as you scroll; click or drag to scroll.
// Section ticks on the rail replace the header nav: hover for the name, click to jump.

const SECTIONS = [['about', 'About'], ['events', 'Events'], ['schedule', 'Schedule'], ['map', 'Campus Map'], ['lineup', 'Line-up'], ['sponsors', 'Sponsors'], ['gallery', 'Gallery'], ['team', 'Team'], ['faq', 'FAQ'], ['contact', 'Contact']];

export function initScrollRail() {
  const rail = document.createElement('div');
  rail.className = 'scroll-rail';
  rail.setAttribute('aria-hidden', 'true');
  rail.innerHTML = '<div class="scroll-rail-fill"></div><span class="scroll-rail-pumpkin">🎃</span>';
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
  const pumpkin = rail.lastChild;

  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;

  function update() {
    const pct = maxScroll() > 0 ? (scrollY / maxScroll()) * 100 : 0;
    fill.style.height = pumpkin.style.top = `${pct}%`;
    rail.hidden = maxScroll() <= 0;
    let current = null;
    for (const [a, id] of marks) {
      const el = document.getElementById(id);
      if (!el) { a.hidden = true; continue; }
      a.hidden = false;
      const top = el.getBoundingClientRect().top + scrollY;
      a.style.top = `${Math.min(100, (top / maxScroll()) * 100)}%`;
      if (top - innerHeight * 0.4 <= scrollY) current = a;
      a.classList.remove('active');
    }
    current?.classList.add('active');
  }

  function scrollToPointer(e) {
    const r = rail.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    scrollTo({ top: ratio * maxScroll(), behavior: 'instant' }); // instant: dragging must not lag behind smooth scrolling
  }

  rail.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.scroll-rail-mark')) return; // let the tick's link navigate
    rail.setPointerCapture(e.pointerId);
    rail.classList.add('dragging');
    scrollToPointer(e);
  });
  rail.addEventListener('pointermove', (e) => { if (rail.classList.contains('dragging')) scrollToPointer(e); });
  rail.addEventListener('pointerup', () => rail.classList.remove('dragging'));

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  new ResizeObserver(update).observe(document.body); // page height changes as sections render
  update();
}
