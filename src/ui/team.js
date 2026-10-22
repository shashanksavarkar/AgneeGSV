// Organizing team directory: faculty advisors and core student committee

export function renderTeam(teamData = { coreTeam: [], facultyAdvisors: [] }) {
  const mount = document.getElementById('team-mount');
  if (!mount) return;

  const core = teamData.coreTeam || [];
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
            ${faculty.map(f => `
              <div class="team-card glass-panel">
                <div class="team-avatar-slot" aria-hidden="true">
                  ${f.avatar ? `<img class="avatar-img" src="${f.avatar}" alt="">` : `<span class="avatar-initials">${f.name.split(' ').map(n => n[0]).join('')}</span>`}
                </div>
                <div class="team-info">
                  <h4 class="member-name">${f.name}</h4>
                  <span class="member-role">${f.role}</span>
                  ${f.department ? `<span class="member-dept">${f.department}</span>` : ''}
                  ${f.email ? `<a href="mailto:${f.email}" class="member-email">${f.email}</a>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Student Core Committee -->
        <div class="team-subgroup">
          <h3 class="subgroup-title">Student Core Committee</h3>
          <div class="team-grid core-grid">
            ${core.map(m => `
              <div class="team-card glass-panel">
                <div class="team-avatar-slot" aria-hidden="true">
                  ${m.avatar ? `<img class="avatar-img" src="${m.avatar}" alt="">` : `<span class="avatar-initials">${m.name.split(' ').map(n => n[0]).join('')}</span>`}
                </div>
                <div class="team-info">
                  <span class="member-team-badge">${m.team}</span>
                  <h4 class="member-name">${m.name}</h4>
                  <span class="member-role">${m.role}</span>
                  ${m.email ? `<a href="mailto:${m.email}" class="member-email">${m.email}</a>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}
