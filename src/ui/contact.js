// Anti-spam contact form and official festival inquiry channels

import { store } from '../core/store.js';
import { socialIcon } from './social-icons.js';

// Paste the Google Apps Script web app URL here (see docs/contact-sheet.gs). Empty = form only simulates sending.
const CONTACT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw5_D60nrsvvHF0opThUUJcNH8-eeinJBDMwph2lnFpdl4E1VP91ZI9cTbhBPWGR6MYKw/exec';

export function renderContact(siteData = {}, events = []) {
  const mount = document.getElementById('contact-mount');
  if (!mount) return;

  const email = siteData.contactEmail || 'student.cell@gsv.ac.in';
  const socials = siteData.socials || [];
  const eventItems = events.map(e => [e.name, e.name]);
  const categories = [
    ['Competitions', 'Event / Competition Inquiry'],
    ['Sponsorship', 'Sponsorship & Brand Partnership'],
    ['Accommodation', 'Accommodation & Travel'],
    ['Media', 'Media & Photography Accreditation'],
    ['Other', 'General Query'],
  ];

  mount.innerHTML = `
    <section class="section contact-section" id="contact" data-v="A" aria-labelledby="contactHeading">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" id="contactHeading">Contact & Inquiries</h2>
        </div>

        <div class="ct-wrap">
          <div class="ct-info">
            <h3 class="ct-lead">Let's talk.</h3>
            <p class="ct-sub">Questions about events, sponsorship, stay or media? Write to the Agnee secretariat and we'll get back to you.</p>
            <a href="mailto:${email}" class="ct-mail">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
              <span>${email}</span>
            </a>
            <div class="ct-socials">
              ${socials.map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="contact-chip" aria-label="${s.platform} ${s.url.split('/').pop()}" title="${s.platform} · ${s.url.split('/').pop()}">${socialIcon(s.platform)}</a>`).join('')}
            </div>
          </div>

          <div class="ct-form-card">
            <form id="contactForm" class="contact-form ct-form" novalidate>
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
                  <input type="text" id="contactName" name="name" required>
                  <span class="field-error" id="errContactName"></span>
                </div>
                <div class="form-field">
                  <label for="contactEmail">Email Address <span class="req">*</span></label>
                  <input type="email" id="contactEmail" name="email" required>
                  <span class="field-error" id="errContactEmail"></span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label for="contactCollege">College / Organisation <span class="req">*</span></label>
                  <input type="text" id="contactCollege" name="college" required>
                  <span class="field-error" id="errContactCollege"></span>
                </div>
                <div class="form-field">
                  <label for="contactPhone">Phone / WhatsApp <span class="opt">(optional)</span></label>
                  <input type="tel" id="contactPhone" name="phone" inputmode="tel" autocomplete="tel">
                </div>
              </div>

              <div class="form-field">
                <label for="contactCategory">Inquiry Type</label>
                ${selectMarkup('ctCategory', 'contactCategory', 'category', categories)}
              </div>

              <div class="form-field" id="ctEventField">
                <label for="contactEvent">Which event?</label>
                ${selectMarkup('ctEvent', 'contactEvent', 'event', [['', 'Not sure yet'], ...eventItems])}
              </div>

              <div class="form-field">
                <label for="contactMessage">Message <span class="req">*</span></label>
                <textarea id="contactMessage" name="message" rows="4" required></textarea>
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

  setupSelects();
  setupContactForm();
}

// Custom dropdown (native <select> popups can't be themed). Value lives in a hidden input.
function selectMarkup(id, inputId, name, items) {
  return `
    <div class="ct-select" id="${id}">
      <input type="hidden" id="${inputId}" name="${name}" value="${items[0][0]}">
      <button type="button" class="ct-select-btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}Label">
        <span class="ct-select-val" id="${id}Label">${items[0][1]}</span>
        <span class="ct-select-caret" aria-hidden="true"></span>
      </button>
      <ul class="ct-select-list" role="listbox" hidden>
        ${items.map(([val, label], i) => `<li role="option" tabindex="-1" data-value="${val}" aria-selected="${i === 0}"><span>${label}</span></li>`).join('')}
      </ul>
    </div>`;
}

function setupSelect(id, onChange) {
  const root = document.getElementById(id);
  const btn = root?.querySelector('.ct-select-btn');
  const list = root?.querySelector('.ct-select-list');
  const input = root?.querySelector('input[type=hidden]');
  if (!root || !btn || !list || !input) return;

  const opts = [...list.children];
  const setOpen = (open) => {
    list.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    root.classList.toggle('open', open);
    if (open) (opts.find(o => o.getAttribute('aria-selected') === 'true') || opts[0]).focus();
  };
  const choose = (opt, refocus = true) => {
    opts.forEach(o => o.setAttribute('aria-selected', String(o === opt)));
    input.value = opt.dataset.value;
    btn.querySelector('.ct-select-val').textContent = opt.textContent.trim();
    setOpen(false);
    if (refocus) btn.focus();
    onChange?.(input.value);
  };

  btn.addEventListener('click', () => setOpen(list.hidden));
  list.addEventListener('mouseover', (e) => { const o = e.target.closest('[role=option]'); if (o && o !== document.activeElement) o.focus(); }); // one highlight at a time
  list.addEventListener('click', (e) => { const o = e.target.closest('[role=option]'); if (o) choose(o); });
  list.addEventListener('keydown', (e) => {
    const i = opts.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); opts[Math.min(i + 1, opts.length - 1)].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); opts[Math.max(i - 1, 0)].focus(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (i > -1) choose(opts[i]); }
    else if (e.key === 'Escape') { setOpen(false); btn.focus(); }
  });
  document.addEventListener('click', (e) => { if (!root.contains(e.target)) setOpen(false); });
  root.closest('form')?.addEventListener('reset', () => choose(opts[0], false));
}

function setupSelects() {
  const eventField = document.getElementById('ctEventField');
  const sync = (cat) => { if (eventField) eventField.hidden = cat !== 'Competitions'; };
  setupSelect('ctCategory', sync);
  setupSelect('ctEvent');
  sync('Competitions');
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
    const college = document.getElementById('contactCollege')?.value.trim();
    const errCollege = document.getElementById('errContactCollege');

    const errName = document.getElementById('errContactName');
    const errEmail = document.getElementById('errContactEmail');
    const errMessage = document.getElementById('errContactMessage');

    if (errName) errName.textContent = name ? '' : 'Name is required.';
    if (errEmail) errEmail.textContent = (email && email.includes('@')) ? '' : 'Valid email is required.';
    if (errMessage) errMessage.textContent = message ? '' : 'Message is required.';
    if (errCollege) errCollege.textContent = college ? '' : 'College or organisation is required.';

    if (!name || !email || !email.includes('@') || !message || !college) {
      return;
    }

    const btn = document.getElementById('btnSubmitContact');
    const done = () => {
      store.showToast('Thank you! Your message has been sent to the Agnee secretariat.', 'success', 5000);
      form.reset();
    };

    if (!CONTACT_ENDPOINT) return done();

    // Apps Script web apps don't send CORS headers, so the reply is opaque (no-cors); only network errors are visible.
    const body = new URLSearchParams(new FormData(form));
    body.delete('user_verification_field');
    body.delete('form_timestamp');
    btn.disabled = true;
    fetch(CONTACT_ENDPOINT, { method: 'POST', mode: 'no-cors', body })
      .then(done)
      .catch(() => store.showToast('Could not send your message. Please check your connection and try again.', 'error', 5000))
      .finally(() => { btn.disabled = false; });
  });
}
