// Organizing team directory: faculty advisors and core student committee

const GITHUB =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.3 6.4-1.5 6.4-7a5.4 5.4 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.7s-1.2-.3-3.9 1.5a13.4 13.4 0 0 0-7 0C6.3 1.5 5.1 1.8 5.1 1.8a5 5 0 0 0-.1 3.7A5.4 5.4 0 0 0 3.5 9.3c0 5.5 3.3 6.7 6.4 7a3.4 3.4 0 0 0-.9 2.6V22"/></svg>';
const LINKEDIN =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>';
const memberLink = (href, label, icon) =>
  `<a class="member-link" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${icon}</a>`;
// LinkedIn on every OC card; GitHub only where m.github is set (creative team)
const links = (m) =>
  m.linkedin || m.github
    ? `<span class="member-links">${m.linkedin ? memberLink(m.linkedin, `${m.name} on LinkedIn`, LINKEDIN) : ''}${m.github ? memberLink(m.github, `${m.name} on GitHub`, GITHUB) : ''}</span>`
    : '';

const studentCard = (m) => `
  <div class="team-card glass-panel">
    <div class="team-avatar-slot" aria-hidden="true">
      ${
        m.avatar
          ? `<img class="avatar-img" src="${m.avatar}" alt="">`
          : `<span class="avatar-initials">${m.name
              .split(' ')
              .map((n) => n[0])
              .join('')}</span>`
      }
    </div>
    <div class="team-info">
      <span class="member-team-badge">${m.team}</span>
      <h4 class="member-name">${m.name}</h4>
      <span class="member-role">${m.role}</span>
      ${m.email ? `<a href="mailto:${m.email}" class="member-email">${m.email}</a>` : ''}
    </div>
    ${links(m)}
  </div>
`;

export function renderTeam(teamData = { coreTeam: [], facultyAdvisors: [] }) {
  const mount = document.getElementById('team-mount');
  if (!mount) return;

  const core = teamData.coreTeam || [];
  const creative = teamData.creativeTeam || [];
  const faculty = teamData.facultyAdvisors || [];

  mount.innerHTML = `
    <section class="section team-section" id="team" aria-labelledby="teamHeading">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" id="teamHeading">Organizing Committee</h2>
        </div>

        <!-- Faculty Leadership -->
        <div class="team-subgroup">
          <h3 class="subgroup-title">Faculty Advisory Board</h3>
          <div class="team-grid faculty-grid">
            ${faculty
              .map(
                (f) => `
              <div class="team-card glass-panel">
                <div class="team-avatar-slot" aria-hidden="true">
                  ${
                    f.avatar
                      ? `<img class="avatar-img" src="${f.avatar}" alt="">`
                      : `<span class="avatar-initials">${f.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}</span>`
                  }
                </div>
                <div class="team-info">
                  <h4 class="member-name">${f.name}</h4>
                  <span class="member-role">${f.role}</span>
                  ${f.department ? `<span class="member-dept">${f.department}</span>` : ''}
                  ${f.email ? `<a href="mailto:${f.email}" class="member-email">${f.email}</a>` : ''}
                </div>
                ${links(f)}
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Student Core Committee -->
        <div class="team-subgroup">
          <h3 class="subgroup-title">Student Core Committee</h3>
          <div class="team-grid core-grid">${core.map(studentCard).join('')}</div>
        </div>

        <!-- Developer Team: five members -->
        ${
          creative.length
            ? `<div class="team-subgroup">
          <h3 class="subgroup-title">Developer Team</h3>
          <div class="team-grid creative-grid">${creative.map(studentCard).join('')}</div>
        </div>`
            : ''
        }
      </div>
    </section>
  `;
}
