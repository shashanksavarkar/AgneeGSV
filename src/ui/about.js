// About Agnee & GSV factual overview

export function renderAbout(siteData = {}) {
  const aboutContainer = document.getElementById('about-mount');
  if (!aboutContainer) return;

  aboutContainer.innerHTML = `
    <section class="section about-section" id="about" aria-labelledby="aboutHeading">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" id="aboutHeading">A Symphony of Talent, Movement, and Light</h2>
        </div>

        <div class="ab-grid">
          <article class="ab-card">
            <span class="ab-diya" aria-hidden="true"></span>
            <span class="ab-label">THE STORY</span>
            <h3 class="ab-title">Igniting the Creative Spirit</h3>
            <p class="ab-body">
              Named after the primordial element of fire and energy, Agnee stands as a beacon of youth expression, celebrating diverse cultural traditions from classical Indian arts to raw urban street cyphers. For three unforgettable days and nights, the campus comes alive with rhythm, theatre, debate, and music.
            </p>
            <ul class="ab-tags">
              <li>3 Days</li>
              <li>8 Event Categories</li>
              <li>Pan-India Colleges</li>
            </ul>
          </article>

          <article class="ab-card">
            <span class="ab-diya" aria-hidden="true"></span>
            <span class="ab-label">THE UNIVERSITY</span>
            <h3 class="ab-title">Gati Shakti Vishwavidyalaya, Vadodara</h3>
            <p class="ab-body">
              Established as India’s first central university dedicated to transportation, logistics, and infrastructure, Gati Shakti Vishwavidyalaya is nestled within the historic, verdant grounds of Vadodara. The campus is graced by the neoclassical Pratap Vilas Palace, modern academic blocks, and the expansive Oval Ground festival arena.
            </p>
            <ul class="ab-tags">
              <li>Central University</li>
              <li>Vadodara, Gujarat</li>
              <li>Pratap Vilas Palace</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  `;
}
