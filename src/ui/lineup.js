// Line-up, Guests & Judges: stage-style section (curtains + spotlights) with reveal states

export function renderLineup(guests = []) {
  const mount = document.getElementById('lineup-mount');
  if (!mount) return;

  mount.innerHTML = `
    <section class="section lineup-section" id="lineup" aria-labelledby="lineupHeading">
      <span class="lu-curtain lu-curtain-l" aria-hidden="true"></span>
      <span class="lu-curtain lu-curtain-r" aria-hidden="true"></span>
      <span class="lu-beam lu-beam-l" aria-hidden="true"></span>
      <span class="lu-beam lu-beam-r" aria-hidden="true"></span>
      <div class="container">
        <div class="section-header">
          <img class="sec-icon" src="assets/elements/mic.svg" alt="" aria-hidden="true">
          <h2 class="section-title" id="lineupHeading">Headliners & Renowned Guests</h2>
        </div>

        <div class="lu-grid">
          ${guests.map(guest => `
            <article class="lu-card" data-id="${guest.id}">
              <span class="lu-bells" aria-hidden="true"></span>
              <div class="lu-photo">
                ${guest.photo
                  ? `<img src="${guest.photo}" alt="${guest.name}" width="104" height="104" loading="lazy">`
                  : `<span class="lu-ph" aria-hidden="true"><img src="assets/elements/mic.svg" alt=""></span>`}
                <span class="lu-badge">${guest.revealState}</span>
              </div>
              <div class="lu-info">
                <span class="lu-cat">${guest.category} · ${guest.day}</span>
                <h3 class="lu-name">${guest.name}</h3>
                <h4 class="lu-role">${guest.role}</h4>
                <p class="lu-bio">${guest.bio}</p>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
