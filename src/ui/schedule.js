// Timeline section: one vertical "Performances" card - the program blocks. Data: schedule.program in data/data.js

export function renderSchedule(scheduleData = { program: [] }) {
  const mount = document.getElementById('schedule-mount');
  if (!mount) return;

  const program = scheduleData.program || [];
  if (program.flat().length === 0) return;

  mount.innerHTML = `
    <section class="section schedule-section" id="schedule" aria-labelledby="scheduleHeading">
      <div class="container">
        <div class="section-header">
          <img class="sec-icon" src="assets/elements/tabla.svg" alt="" aria-hidden="true">
          <h2 class="section-title" id="scheduleHeading">Timeline & Stage Tracks</h2>
        </div>

        <article class="phase-card">
          <header class="phase-head">
            <h3 class="phase-title">Performances</h3>
          </header>
          <div class="phase-events-wrap">
            ${program.map((block) => `<ul class="phase-events">${block.map(({ time, mins, name }) => `<li><span class="phase-time">${time}</span><span class="phase-name">${name}</span>${mins ? `<span class="phase-mins">${mins} min</span>` : ''}</li>`).join('')}</ul>`).join('')}
          </div>
        </article>
      </div>
    </section>
  `;
}
