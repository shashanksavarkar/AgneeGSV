// Line-up, Guests & Judges showcase with reveal states and strict placeholder compliance

export function renderLineup(guests = []) {
  const mount = document.getElementById('lineup-mount');
  if (!mount) return;

  mount.innerHTML = `
    <section class="section lineup-section" id="lineup" aria-labelledby="lineupHeading">
      <div class="container">
        <div class="section-header">
          <span class="section-kicker">STAR NIGHTS & ADJUDICATORS</span>
          <h2 class="section-title" id="lineupHeading">Headliners & Renowned Guests</h2>
        </div>

        <div class="lineup-grid">
          ${guests.map(guest => `
            <div class="lineup-card glass-panel" data-id="${guest.id}">
              <div class="lineup-avatar-slot">
                ${guest.photo ? `
                  <img src="${guest.photo}" alt="${guest.name}" class="guest-img" width="120" height="120" loading="lazy">
                ` : `
                  <div class="guest-silhouette" aria-hidden="true">
                    <span class="silhouette-icon">👤</span>
                  </div>
                `}
                <span class="reveal-badge">${guest.revealState}</span>
              </div>

              <div class="lineup-info">
                <span class="guest-cat">${guest.category} · ${guest.day}</span>
                <h3 class="guest-name">${guest.name}</h3>
                <h4 class="guest-role">${guest.role}</h4>
                <p class="guest-bio">${guest.bio}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
