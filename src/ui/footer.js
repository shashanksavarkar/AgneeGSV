// Semantic footer with wordmark, quick links, legal policies, and credits

import { socialIcon } from './social-icons.js';

export function renderFooter(siteData = {}) {
  const mount = document.getElementById('footer-mount');
  if (!mount) return;

  const wordmarkSrc = window.WMURI || '';
  const socials = siteData.socials || [];

  mount.innerHTML = `
    <footer class="site-footer" role="contentinfo">
      <div class="container footer-content">
        <div class="footer-top-grid">
          <!-- Col 1: Brand & Institution -->
          <div class="footer-col brand-col">
            <a href="#home" class="footer-brand-link" aria-label="Agnee 2026 Home">
              <img class="footer-wordmark-img" src="${wordmarkSrc}" alt="Agnee 2026" width="180" height="44" loading="lazy">
            </a>
            <p class="footer-tagline">
              The flagship annual cultural festival of Gati Shakti Vishwavidyalaya, Vadodara. Celebrating innovation, rhythm, and artistic expression.
            </p>
            <div class="footer-social-row">
              ${socials.map(s => `
                <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="footer-social-icon" aria-label="${s.platform}">
                  ${socialIcon(s.platform)}
                </a>
              `).join('')}
            </div>
          </div>

          <!-- Col 2: Quick Links -->
          <div class="footer-col">
            <h4 class="footer-heading">Festival Discovery</h4>
            <ul class="footer-links-list">
              <li><a href="#about">About Agnee</a></li>
              <li><a href="#events">Competitions & Rules</a></li>
              <li><a href="#schedule">Schedule & Timeline</a></li>
              <li><a href="#map">3D Campus Map</a></li>
              <li><a href="#lineup">Guest Headliners</a></li>
            </ul>
          </div>

          <!-- Col 3: Participation & Help -->
          <div class="footer-col">
            <h4 class="footer-heading">Participation</h4>
            <ul class="footer-links-list">
              <li><a href="#sponsors">Sponsors & Alliances</a></li>
              <li><a href="#team">Organizing Committee</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
              <li><a href="#contact">Contact Secretariat</a></li>
            </ul>
          </div>

          <!-- Col 4: Institutional Address -->
          <div class="footer-col">
            <h4 class="footer-heading">Campus Address</h4>
            <address class="footer-address">
              <strong>Gati Shakti Vishwavidyalaya</strong><br>
              Lalbaug, Vadodara,<br>
              Gujarat 390004, India<br>
              <br>
              Email: <a href="mailto:student.cell@gsv.ac.in">student.cell@gsv.ac.in</a>
            </address>
          </div>
        </div>

        <div class="footer-bottom-bar">
          <div class="footer-legal-links">
            <button type="button" class="legal-link" id="linkPrivacyModal">Privacy Policy</button>
            <span class="sep">·</span>
            <button type="button" class="legal-link" id="linkTermsModal">Terms of Participation</button>
            <span class="sep">·</span>
            <button type="button" class="legal-link" id="linkCodeOfConduct">Code of Conduct</button>
          </div>

          <div class="footer-copyright">
            <p>© 2026 Agnee · Gati Shakti Vishwavidyalaya, Vadodara. All rights reserved.</p>
            <p class="credit-line">Designed & Built with passion by the Agnee Web & Creative Tech Team</p>
          </div>
        </div>
      </div>

      <!-- Halloween finale -->
      <div class="footer-halloween" aria-hidden="true">
        <span class="fh-bat fh-bat-1">🦇</span>
        <span class="fh-bat fh-bat-2">🦇</span>
        <span class="fh-bat fh-bat-3">🦇</span>
        <span class="fh-moon">🌕</span>
        <span class="fh-ghost">👻</span>
        <div class="fh-mega">AGNEE'26</div>
      </div>
    </footer>

    <!-- Simple Legal Modal -->
    <div class="modal-backdrop" id="legalModalBackdrop" aria-hidden="true"></div>
    <div class="event-modal-container legal-modal" id="legalModal" role="dialog" aria-modal="true" aria-labelledby="legalModalTitle" hidden>
      <div class="modal-header">
        <h3 id="legalModalTitle">Festival Policy</h3>
        <button type="button" class="modal-close-btn" id="legalModalCloseBtn" aria-label="Close policy">✕</button>
      </div>
      <div class="modal-body" id="legalModalBody"></div>
    </div>
  `;

  setupFooterLegalModals();
}

function setupFooterLegalModals() {
  const modal = document.getElementById('legalModal');
  const backdrop = document.getElementById('legalModalBackdrop');
  const body = document.getElementById('legalModalBody');
  const title = document.getElementById('legalModalTitle');
  const closeBtn = document.getElementById('legalModalCloseBtn');

  function openLegal(titleText, contentHtml) {
    if (!modal || !body || !title) return;
    title.textContent = titleText;
    body.innerHTML = contentHtml;
    modal.hidden = false;
    backdrop.classList.add('on');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLegal() {
    if (!modal) return;
    modal.classList.remove('open');
    backdrop.classList.remove('on');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 300);
  }

  closeBtn?.addEventListener('click', closeLegal);
  backdrop?.addEventListener('click', closeLegal);

  document.getElementById('linkPrivacyModal')?.addEventListener('click', () => {
    openLegal('Privacy Policy', `
      <p>At Agnee 2026 and Gati Shakti Vishwavidyalaya, we respect participant privacy. Registration data collected is used solely for competition verification, safety accreditation, and certificate generation. We do not sell or monetize personal student data to third parties. Analytical tracking is disabled by default.</p>
    `);
  });

  document.getElementById('linkTermsModal')?.addEventListener('click', () => {
    openLegal('Terms of Participation', `
      <p>All participants must adhere to collegiate eligibility guidelines. Judges' decisions in competitive tracks are final and binding. The organizing committee reserves the right to adjust event schedules or disqualify any delegate displaying misconduct.</p>
    `);
  });

  document.getElementById('linkCodeOfConduct')?.addEventListener('click', () => {
    openLegal('Campus Code of Conduct', `
      <p>Gati Shakti Vishwavidyalaya is committed to maintaining an inclusive, secure, and respectful campus environment. Discrimination, harassment, substance possession, or destruction of heritage property (including Pratap Vilas Palace) will result in immediate disqualification and campus debarment.</p>
    `);
  });
}
