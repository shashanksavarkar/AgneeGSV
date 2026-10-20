// Anti-spam contact form and official festival inquiry channels

import { store } from '../core/store.js';
import { socialIcon } from './social-icons.js';

export function renderContact(siteData = {}) {
  const mount = document.getElementById('contact-mount');
  if (!mount) return;

  const email = siteData.contactEmail || 'student.cell@gsv.ac.in';
  const socials = siteData.socials || [];

  mount.innerHTML = `
    <section class="section contact-section" id="contact" aria-labelledby="contactHeading">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" id="contactHeading">Contact & Inquiries</h2>
        </div>

        <div class="contact-grid">
          <!-- Anti-Spam Contact Form -->
          <div class="contact-form-card glass-panel">
            <div class="contact-strip">
              <a href="mailto:${email}" class="contact-strip-mail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                <span>${email}</span>
              </a>
              <div class="contact-strip-socials">
                ${socials.map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="contact-chip" aria-label="${s.platform} ${s.url.split('/').pop()}" title="${s.platform} · ${s.url.split('/').pop()}">${socialIcon(s.platform)}</a>`).join('')}
              </div>
            </div>
            <form id="contactForm" class="contact-form" novalidate>
              <!-- Honeypot anti-spam trap (invisible to human visitors) -->
              <div class="honeypot-wrap" style="display:none!important;" aria-hidden="true">
                <label for="contactHoneypot">Do not fill this</label>
                <input type="text" id="contactHoneypot" name="user_verification_field" tabindex="-1" autocomplete="off">
              </div>

              <!-- Timestamp tracking anti-bot token -->
              <input type="hidden" id="formLoadTime" name="form_timestamp" value="${Date.now()}">

              <div class="form-row">
                <div class="form-field">
                  <label for="contactName">Your Name <span class="req">*</span></label>
                  <input type="text" id="contactName" name="name" required placeholder="Aarav Patel">
                  <span class="field-error" id="errContactName"></span>
                </div>
                <div class="form-field">
                  <label for="contactEmail">Email Address <span class="req">*</span></label>
                  <input type="email" id="contactEmail" name="email" required placeholder="aarav@college.edu">
                  <span class="field-error" id="errContactEmail"></span>
                </div>
              </div>

              <div class="form-field">
                <label for="contactCategory">Inquiry Type</label>
                <select id="contactCategory" name="category" class="form-select">
                  <option value="Competitions">Event / Competition Inquiry</option>
                  <option value="Sponsorship">Sponsorship & Brand Partnership</option>
                  <option value="Accommodation">Accommodation & Travel</option>
                  <option value="Media">Media & Photography Accreditation</option>
                  <option value="Other">General Query</option>
                </select>
              </div>

              <div class="form-field">
                <label for="contactMessage">Message <span class="req">*</span></label>
                <textarea id="contactMessage" name="message" rows="3" required placeholder="Type your message here..."></textarea>
                <span class="field-error" id="errContactMessage"></span>
              </div>

              <button type="submit" class="btn-primary btn-block" id="btnSubmitContact">
                <span>Send Message</span>
                <span class="btn-arrow" aria-hidden="true">→</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;

  setupContactForm();
}

function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Anti-spam honeypot check
    const honey = document.getElementById('contactHoneypot')?.value;
    if (honey) {
      console.warn('Bot submission blocked via honeypot.');
      return;
    }

    // 2. Anti-spam timing check (humans take > 2 seconds to fill)
    const loadTime = Number(document.getElementById('formLoadTime')?.value || 0);
    const timeTaken = (Date.now() - loadTime) / 1000;
    if (timeTaken < 2) {
      console.warn('Submission blocked: too rapid (anti-bot safeguard).');
      return;
    }

    // 3. Validation
    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();

    const errName = document.getElementById('errContactName');
    const errEmail = document.getElementById('errContactEmail');
    const errMessage = document.getElementById('errContactMessage');

    if (errName) errName.textContent = name ? '' : 'Name is required.';
    if (errEmail) errEmail.textContent = (email && email.includes('@')) ? '' : 'Valid email is required.';
    if (errMessage) errMessage.textContent = message ? '' : 'Message is required.';

    if (!name || !email || !email.includes('@') || !message) {
      return;
    }

    // Successful submit simulation
    store.showToast('Thank you! Your message has been sent to the Agnee secretariat.', 'success', 5000);
    form.reset();
  });
}
