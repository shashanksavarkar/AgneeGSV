// About Agnee & GSV factual overview

export function renderAbout(siteData = {}) {
  const aboutContainer = document.getElementById('about-mount');
  if (!aboutContainer) return;

  const vc = siteData.vc || {};

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

        <div class="ab-grid ab-vc">
          <article class="ab-card ab-letter">
            <header class="ab-letterhead">
              <span class="ab-photo">
                ${vc.photo
                  ? `<img src="${vc.photo}" alt="${vc.name}" loading="lazy">`
                  : `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4"/><path d="M3.5 21c0-4.7 3.8-7.5 8.5-7.5s8.5 2.8 8.5 7.5z"/></svg>`}
              </span>
              <div class="ab-letterhead-text">
                <span class="ab-label">OFFICE OF THE VICE-CHANCELLOR</span>
                <span class="ab-letter-univ">Gati Shakti Vishwavidyalaya &middot; Vadodara</span>
              </div>
            </header>
            <p class="ab-salute">Dear Participants,</p>
            ${(vc.message || []).map((t) => `<p class="ab-body">${t}</p>`).join('')}
            <footer class="ab-signoff">
              <span>With warm regards,</span>
              <strong class="ab-script">${vc.name}</strong>
              <small>${vc.title}</small>
            </footer>
          </article>

          <article class="ab-card ab-video-card">
            <span class="ab-label">ENCLOSED: A VIDEO MESSAGE</span>
            <div class="ab-video" id="vcVideo">
              ${vc.videoId
                ? `<button type="button" class="ab-video-play" id="vcPlay" aria-label="Play the Vice-Chancellor's message"><span aria-hidden="true">&#9654;</span></button>`
                : `<span class="ab-video-soon">Video message coming soon</span>`}
            </div>
            <p class="ab-video-note">In his own words, for everyone joining Agnee 2026.</p>
          </article>
        </div>
      </div>
    </section>
  `;

  // Nothing from YouTube loads until the visitor presses play
  document.getElementById('vcPlay')?.addEventListener('click', () => {
    document.getElementById('vcVideo').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${vc.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Message from the Vice-Chancellor" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  });
}
