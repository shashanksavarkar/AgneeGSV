// About Agnee & GSV factual overview

export function renderAbout(siteData = {}) {
  const aboutContainer = document.getElementById('about-mount');
  if (!aboutContainer) return;

  aboutContainer.innerHTML = `
    <section class="section about-section" id="about" aria-labelledby="aboutHeading">
      <div class="container">
        <div class="section-header">
          <span class="section-kicker">THE FESTIVAL & THE CAMPUS</span>
          <h2 class="section-title" id="aboutHeading">A Symphony of Talent, Movement, and Light</h2>
        </div>

        <div class="about-grid">
          <div class="about-card glass-panel">
            <div class="card-badge">THE STORY</div>
            <h3 class="card-title">Igniting the Creative Spirit</h3>
            <p class="card-body">
              Named after the primordial element of fire and energy, Agnee stands as a beacon of youth expression, celebrating diverse cultural traditions from classical Indian arts to raw urban street cyphers. For three unforgettable days and nights, the campus comes alive with rhythm, theatre, debate, and music.
            </p>
            <div class="card-footer-tags">
              <span class="tag-pill">3 Days</span>
              <span class="tag-pill">8 Event Categories</span>
              <span class="tag-pill">Pan-India Colleges</span>
            </div>
          </div>

          <div class="about-card glass-panel">
            <div class="card-badge">THE UNIVERSITY</div>
            <h3 class="card-title">Gati Shakti Vishwavidyalaya, Vadodara</h3>
            <p class="card-body">
              Established as India’s first central university dedicated to transportation, logistics, and infrastructure, Gati Shakti Vishwavidyalaya is nestled within the historic, verdant grounds of Vadodara. The campus is graced by the neoclassical Pratap Vilas Palace, modern academic blocks, and the expansive Oval Ground festival arena.
            </p>
            <div class="card-footer-tags">
              <span class="tag-pill">Central University</span>
              <span class="tag-pill">Vadodara, Gujarat</span>
              <span class="tag-pill">Pratap Vilas Palace</span>
            </div>
          </div>
        </div>

        <div class="about-pillars-grid">
          <div class="pillar-item">
            <div class="pillar-icon" aria-hidden="true">🎵</div>
            <h4 class="pillar-title">Pure Live Energy</h4>
            <p class="pillar-desc">Battle of the Bands, solo serenades, and pro-show artists rocking the Oval Stage under dusk skies.</p>
          </div>
          <div class="pillar-item">
            <div class="pillar-icon" aria-hidden="true">🎭</div>
            <h4 class="pillar-title">Stories that Resonate</h4>
            <p class="pillar-desc">Street theatre (Nukkad Natak), parliamentary debate, and cinema capturing India’s modern heartbeat.</p>
          </div>
          <div class="pillar-item">
            <div class="pillar-icon" aria-hidden="true">💃</div>
            <h4 class="pillar-title">Rhythm & Synchrony</h4>
            <p class="pillar-desc">From traditional classical mudras to explosive hip-hop crew battles on the festival floor.</p>
          </div>
          <div class="pillar-item">
            <div class="pillar-icon" aria-hidden="true">🌐</div>
            <h4 class="pillar-title">Campus in 3D</h4>
            <p class="pillar-desc">Our digital campus map lets visitors discover stages, hostels, and landmarks in real-time 3D.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}
