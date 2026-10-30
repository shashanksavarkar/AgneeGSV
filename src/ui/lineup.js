// Line-up, Guests & Judges: stage-style section (curtains + spotlights) with reveal states

export function renderLineup(guests = []) {
  const mount = document.getElementById('lineup-mount');
  if (!mount) return;

  // One row per guest id (SBI, UBI, ...): guests sharing an id sit in the same row; nameless entries are skipped
  const byId = {};
  guests
    .filter(g => g.name?.trim() && g.category?.toLowerCase() !== 'judge')
    .forEach(g => (byId[g.id] ||= []).push(g));
  const rows = Object.values(byId);

  mount.innerHTML = `
    <section class="section lineup-section" id="lineup" aria-labelledby="lineupHeading">
      <span class="lu-curtain lu-curtain-l" aria-hidden="true"></span>
      <span class="lu-curtain lu-curtain-r" aria-hidden="true"></span>
      <div class="container">
        <div class="section-header">
          <img class="sec-icon" src="assets/elements/mic.svg" alt="" aria-hidden="true">
          <h2 class="section-title" id="lineupHeading">Guest of Honour</h2>
        </div>

        ${rows.map(row => `
        <div class="lu-grid" style="--cols: ${row.length}">
          ${row.map(guest => `
            <article class="lu-card" data-id="${guest.id}">
              <div class="lu-photo">
                ${guest.photo
                  ? `<img src="${guest.photo}" alt="${guest.name}" loading="lazy">`
                  : `<span class="lu-ph" aria-hidden="true"><img src="assets/elements/mask.svg" alt=""></span>`}
              </div>
              <div class="lu-info">
                ${guest.category ? `<span class="lu-cat">${guest.category}</span>` : ''}
                <h3 class="lu-name">${guest.name}</h3>
                <p class="lu-bio">${[guest.role, guest.bank, guest.place].filter(Boolean).map(v => `<span>${v}</span>`).join('') || guest.bio}</p>
              </div>
            </article>
          `).join('')}
        </div>
        `).join('')}
      </div>
    </section>
  `;
}
