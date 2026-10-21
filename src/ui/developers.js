// Developers section: ID-pass cards for the people who built the site. Data: developers in data/data.js

const GITHUB = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.3 6.4-1.5 6.4-7a5.4 5.4 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.7s-1.2-.3-3.9 1.5a13.4 13.4 0 0 0-7 0C6.3 1.5 5.1 1.8 5.1 1.8a5 5 0 0 0-.1 3.7A5.4 5.4 0 0 0 3.5 9.3c0 5.5 3.3 6.7 6.4 7a3.4 3.4 0 0 0-.9 2.6V22"/></svg>';
const LINKEDIN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>';

export function renderDevelopers(developers = []) {
  const mount = document.getElementById('developers-mount');
  if (!mount || developers.length === 0) return;

  const link = (href, label, icon) => `<a class="dev-link" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${icon}</a>`;

  mount.innerHTML = `
    <section class="section dev-section" id="developers" aria-labelledby="devHeading">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" id="devHeading">Developers</h2>
        </div>

        <div class="dev-grid">
          ${developers.map((d, i) => `
            <article class="dev-pass" data-no="${String(i + 1).padStart(2, '0')}">
              <span class="dev-slot" aria-hidden="true"></span>
              <div class="dev-ring">${d.avatar ? `<img src="${d.avatar}" alt="${d.name}" loading="lazy">` : `<span>${d.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>`}</div>
              <h3 class="dev-name">${d.name}</h3>
              ${d.role ? `<span class="dev-role">${d.role}</span>` : ''}
              <div class="dev-foot">
                <span class="dev-tag">Agnee '26 Dev Team</span>
                <span class="dev-links">
                  ${d.github ? link(d.github, `${d.name} on GitHub`, GITHUB) : ''}
                  ${d.linkedin ? link(d.linkedin, `${d.name} on LinkedIn`, LINKEDIN) : ''}
                </span>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
