// Footer: brand + socials band, link columns, address card, legal strip

import { socialIcon } from './social-icons.js';
import { particleField } from './particles.js';

export function renderFooter(siteData = {}) {
  const mount = document.getElementById('footer-mount');
  if (!mount) return;

  const socials = siteData.socials || [];

  mount.innerHTML = `
    <footer class="site-footer" role="contentinfo">
      ${particleField('sparks', 14)}
      <div class="container">
        <div class="ft-band">
          <a href="#home" class="ft-brand" aria-label="Agnee 2026 Home">
            <img class="ft-logo" src="assets/logo.webp" alt="Agnee 2026" loading="lazy">
            <p class="ft-tagline">The flagship annual cultural festival of Gati Shakti Vishwavidyalaya, Vadodara. Celebrating innovation, rhythm, and artistic expression.</p>
          </a>
          <div class="ft-actions">
            <div class="ft-social">
            ${socials.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.platform}">${socialIcon(s.platform)}</a>`).join('')}
            </div>
          </div>
        </div>

        <div class="ft-grid">
          <nav aria-label="Festival discovery">
            <h4 class="ft-title">Festival Discovery</h4>
            <ul class="ft-links">
              <li><a href="#about">About Agnee</a></li>
              <li><a href="#events">Competitions & Rules</a></li>
              <li><a href="#schedule">Schedule & Timeline</a></li>
              <li><a href="#map">3D Campus Map</a></li>
              <li><a href="#lineup">Guest Headliners</a></li>
            </ul>
          </nav>

          <nav aria-label="Participation">
            <h4 class="ft-title">Participation</h4>
            <ul class="ft-links">
              <li><a href="#sponsors">Sponsors & Alliances</a></li>
              <li><a href="#team">Organizing Committee</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
              <li><a href="#contact">Contact Secretariat</a></li>
            </ul>
          </nav>

          <div>
            <h4 class="ft-title">Campus Address</h4>
            <address class="ft-address">
              <strong>Gati Shakti Vishwavidyalaya</strong>
              Lalbaug, Vadodara, Gujarat 390004, India<br>
              <a href="mailto:student.cell@gsv.ac.in">student.cell@gsv.ac.in</a><br>
              <a href="https://www.google.com/maps/search/?api=1&query=Gati+Shakti+Vishwavidyalaya+Vadodara" target="_blank" rel="noopener noreferrer">Get directions</a>
            </address>
          </div>
        </div>

        <div class="ft-bottom">
          <div class="ft-legal">
            <button type="button" id="linkPrivacyModal">Privacy Policy</button>
            <button type="button" id="linkTermsModal">Terms of Participation</button>
            <button type="button" id="linkCodeOfConduct">Code of Conduct</button>
          </div>
          <a href="#home" class="ft-top">Back to top ↑</a>
          <p class="ft-copy">© 2026 Agnee · Gati Shakti Vishwavidyalaya, Vadodara. All rights reserved.<span>Designed & Built with passion by the Agnee Web & Creative Tech Team</span></p>
        </div>
      </div>
      <div class="ft-rangoli" aria-hidden="true"><img src="assets/logo.webp" alt="" loading="lazy"></div>
    </footer>

    <!-- Policy dialog -->
    <div class="lg-backdrop" id="legalModalBackdrop" aria-hidden="true"></div>
    <div class="lg-dialog" id="legalModal" role="dialog" aria-modal="true" aria-labelledby="legalModalTitle" hidden>
      <span class="lg-icon" id="legalModalIcon" aria-hidden="true"></span>
      <div class="lg-head">
        <div>
          <span class="lg-kicker">Agnee '26 · Festival Policy</span>
          <h3 class="lg-title" id="legalModalTitle">Policy</h3>
        </div>
        <button type="button" class="lg-close" id="legalModalCloseBtn" aria-label="Close policy">✕</button>
      </div>
      <ol class="lg-points" id="legalModalBody"></ol>
      <div class="lg-foot">
        <small>Gati Shakti Vishwavidyalaya</small>
        <button type="button" class="btn-primary" id="legalModalOkBtn">Got it</button>
      </div>
    </div>
  `;

  setupFooterLegalModals();
}

const POLICIES = {
  linkPrivacyModal: {
    title: 'Privacy Policy',
    icon: '🔒',
    points: [
      'At Agnee 2026 and Gati Shakti Vishwavidyalaya, we respect participant privacy.',
      'Registration data collected is used solely for competition verification, safety accreditation, and certificate generation.',
      'We do not sell or monetize personal student data to third parties.',
      'Analytical tracking is disabled by default.'
    ]
  },
  linkTermsModal: {
    title: 'Terms of Participation',
    icon: '📜',
    points: [
      'All participants must adhere to collegiate eligibility guidelines.',
      "Judges' decisions in competitive tracks are final and binding.",
      'The organizing committee reserves the right to adjust event schedules or disqualify any delegate displaying misconduct.'
    ]
  },
  linkCodeOfConduct: {
    title: 'Campus Code of Conduct',
    icon: '🛡️',
    points: [
      'Gati Shakti Vishwavidyalaya is committed to maintaining an inclusive, secure, and respectful campus environment.',
      'Discrimination, harassment, substance possession, or destruction of heritage property (including Pratap Vilas Palace) will result in immediate disqualification and campus debarment.'
    ]
  }
};

function setupFooterLegalModals() {
  const modal = document.getElementById('legalModal');
  const backdrop = document.getElementById('legalModalBackdrop');
  const body = document.getElementById('legalModalBody');
  const title = document.getElementById('legalModalTitle');
  const icon = document.getElementById('legalModalIcon');
  const closeBtn = document.getElementById('legalModalCloseBtn');
  if (!modal) return;

  function openLegal({ title: titleText, icon: iconChar, points }) {
    title.textContent = titleText;
    icon.textContent = iconChar;
    body.innerHTML = points.map((p) => `<li>${p}</li>`).join('');
    modal.hidden = false;
    requestAnimationFrame(() => {
      backdrop.classList.add('on');
      modal.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLegal() {
    modal.classList.remove('open');
    backdrop.classList.remove('on');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 250);
  }

  closeBtn.addEventListener('click', closeLegal);
  document.getElementById('legalModalOkBtn').addEventListener('click', closeLegal);
  backdrop.addEventListener('click', closeLegal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeLegal(); });

  Object.entries(POLICIES).forEach(([id, policy]) => {
    document.getElementById(id)?.addEventListener('click', () => openLegal(policy));
  });
}
