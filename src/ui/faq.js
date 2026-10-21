// FAQ accordion with category filters and keyboard accessibility

export function renderFaq(faqs = []) {
  const mount = document.getElementById('faq-mount');
  if (!mount) return;


  mount.innerHTML = `
    <section class="section faq-section" id="faq" data-v="B" aria-labelledby="faqHeading">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" id="faqHeading">Frequently Asked Questions</h2>
        </div>

        <div class="faq-layout">
          <div class="faq-accordion" id="faqAccordion">
            ${faqs.map((faq, index) => `
              <div class="faq-item" data-cat="${faq.category}">
                <button type="button" class="faq-question-btn" id="faq-header-${index}" aria-expanded="false" aria-controls="faq-panel-${index}">
                  <span class="faq-no" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
                  <span class="faq-q-mark" aria-hidden="true">Q</span>
                  <span class="faq-question-text">${faq.question}</span>
                  <span class="faq-chevron" aria-hidden="true">+</span>
                </button>
                <div class="faq-answer-panel" id="faq-panel-${index}" role="region" aria-labelledby="faq-header-${index}" hidden>
                  <p class="faq-answer-text">${faq.answer}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;

  setupFaqInteractions();
}

function setupFaqInteractions() {
  // Accordion toggle
  document.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const panel = document.getElementById(btn.getAttribute('aria-controls'));

      // Close all other panels for clean single-expand accordion
      document.querySelectorAll('.faq-question-btn').forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherPanel = document.getElementById(otherBtn.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.hidden = true;
          otherBtn.closest('.faq-item')?.classList.remove('open');
        }
      });

      btn.setAttribute('aria-expanded', String(!isExpanded));
      if (panel) panel.hidden = isExpanded;
      btn.closest('.faq-item')?.classList.toggle('open', !isExpanded);
    });
  });
}
