// Timeline section: two side-by-side cards (Pre-Agnee | Agnee), each listing its events. Data: schedule.phases in data/data.js

export function renderSchedule(scheduleData = { phases: [] }) {
  const mount = document.getElementById('schedule-mount');
  if (!mount) return;

  const phases = scheduleData.phases || [];
  if (phases.length === 0) return;

  mount.innerHTML = `
    <section class="section schedule-section" id="schedule" aria-labelledby="scheduleHeading">
      <div class="container">
        <div class="section-header">
          <span class="section-kicker">FESTIVAL ITINERARY</span>
          <h2 class="section-title" id="scheduleHeading">Timeline & Stage Tracks</h2>
        </div>

        <div class="phase-grid">
          ${phases.map((phase, i) => `
            <article class="phase-card${i === phases.length - 1 ? ' is-main' : ''}" data-step="0${i + 1}">
              <header class="phase-head">
                <h3 class="phase-title">${phase.name}</h3>
                <span class="phase-count">${phase.events?.length || 0} ${phase.events?.length === 1 ? "event" : "events"}</span>
              </header>
              ${phase.events?.length
                ? `<ul class="phase-events">${phase.events.map((name) => `<li>${name}</li>`).join('')}</ul>`
                : '<p class="phase-empty">Announcing soon</p>'}
            </article>
          `).join('')}
          ${phases.length === 2 ? '<span class="phase-arrow" aria-hidden="true">➜</span>' : ''}
        </div>
      </div>
    </section>
  `;
}
