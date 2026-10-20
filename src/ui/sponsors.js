// Sponsors and Corporate Partners tiered wall, deck link, and partner CTA

export function renderSponsors(sponsorsData = { tiers: [] }) {
  const mount = document.getElementById('sponsors-mount');
  if (!mount) return;

  const tiers = sponsorsData.tiers || [];
  const contactEmail = sponsorsData.contactEmail || 'sponsorship@gsv.ac.in';

  mount.innerHTML = `
    <section class="section sponsors-section" id="sponsors" aria-labelledby="sponsorsHeading">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" id="sponsorsHeading">Sponsors & Industry Partners</h2>
        </div>

        <!-- Tiered Sponsor Wall -->
        <div class="sponsors-tiered-wall">
          ${tiers.map(tier => `
            <div class="sponsor-tier-block tier-${tier.tierKey}">
              <div class="tier-header">
                <span class="tier-badge">${tier.tierName}</span>
                <p class="tier-desc">${tier.description}</p>
              </div>

              <div class="sponsor-cards-row">
                ${tier.sponsors.map(sp => `
                  <div class="sponsor-card glass-panel ${sp.placeholder ? 'is-placeholder' : ''}">
                    <div class="sponsor-logo-box">
                      ${sp.logo ? `
                        <img src="${sp.logo}" alt="${sp.name}" class="sponsor-logo" loading="lazy">
                      ` : `
                        <div class="sponsor-placeholder-logo" aria-hidden="true">
                          <span class="logo-icon">🤝</span>
                        </div>
                      `}
                    </div>
                    <span class="sponsor-name">${sp.name}</span>
                    <span class="sponsor-tag">${tier.tierName}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Become a Sponsor CTA Banner -->
        <div class="sponsor-cta-banner glass-panel">
          <div class="cta-banner-content">
            <span class="banner-badge">COLLABORATE WITH US</span>
            <h3 class="banner-title">Elevate Your Brand at Agnee 2026</h3>
            <p class="banner-text">
              Engage with thousands of enthusiastic undergraduate and postgraduate students from top engineering, design, and management institutions across India. Customized engagement avenues, main stage naming rights, and hackathon integrations available.
            </p>
            <div class="banner-actions">
              <a href="mailto:${contactEmail}?subject=Agnee%202026%20Sponsorship%20Inquiry" class="btn-primary">
                <span>Become a Sponsor</span>
                <span class="btn-arrow" aria-hidden="true">→</span>
              </a>
              <button type="button" class="btn-secondary" id="btnDownloadDeck">
                <span>Download Sponsorship Deck (.PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById('btnDownloadDeck')?.addEventListener('click', () => {
    alert('The official Agnee 2026 corporate sponsorship deck will be released shortly. For immediate proposals, please reach out directly to sponsorship@gsv.ac.in.');
  });
}
