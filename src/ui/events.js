// Events discovery hub with category filters, debounced search, day tabs, and cards

import { store } from '../core/store.js';
import { t } from '../core/i18n.js';

let cachedEvents = [];

export function renderEvents(events = []) {
  cachedEvents = events;
  const mount = document.getElementById('events-mount');
  if (!mount) return;

  const categories = ['All', 'Music', 'Dance', 'Drama', 'Fashion', 'Art & Design', 'Literary', 'Photography/Film', 'Gaming/Fun'];
  const days = ['All', 'Day 1', 'Day 2', 'Day 3'];

  mount.innerHTML = `
    <section class="section events-section" id="events" aria-labelledby="eventsHeading">
      <div class="container">
        <div class="section-header">
          <img class="sec-icon" src="assets/elements/mask.svg" alt="" aria-hidden="true">
          <h2 class="section-title" id="eventsHeading">${t('events.title')}</h2>
          <p class="section-subtitle">${t('events.subtitle')}</p>
        </div>

        <!-- Filter Controls -->
        <div class="events-filter-bar glass-panel">
          <!-- Search Input -->
          <div class="search-box">
            <span class="search-icon" aria-hidden="true">🔍</span>
            <input 
              type="search" 
              id="eventSearchInput" 
              placeholder="${t('events.searchPlaceholder')}" 
              aria-label="Search events by title, tag, or rules"
              autocomplete="off"
            >
            <button type="button" id="eventSearchClear" class="clear-btn" aria-label="Clear search" hidden>✕</button>
          </div>

          <!-- Day Filter Buttons -->
          <div class="filter-group">
            <span class="filter-group-label">Day:</span>
            <div class="filter-pill-row" role="tablist" aria-label="Filter events by Day">
              ${days.map(d => `
                <button type="button" class="filter-pill ${d === 'All' ? 'active' : ''}" data-day="${d}" role="tab" aria-selected="${d === 'All'}">${d}</button>
              `).join('')}
            </div>
          </div>

          <!-- Open registrations only toggle -->
          <label class="toggle-control" id="openOnlyToggle">
            <input type="checkbox" id="openOnlyCheckbox">
            <span class="toggle-switch"></span>
            <span class="toggle-label">${t('events.filterOpenOnly')}</span>
          </label>
        </div>

        <!-- Category Filter Chips -->
        <div class="category-chips-scroll" role="tablist" aria-label="Filter events by category">
          ${categories.map(c => `
            <button type="button" class="category-chip ${c === 'All' ? 'active' : ''}" data-category="${c}" role="tab" aria-selected="${c === 'All'}">
              ${getCategoryIcon(c)} ${c}
            </button>
          `).join('')}
        </div>

        <!-- Results Counter & Reset -->
        <div class="events-results-meta">
          <span id="eventsCountLabel">Showing all ${events.length} competitions</span>
          <button type="button" id="eventsResetFilters" class="btn-text-link" hidden>Reset all filters</button>
        </div>

        <!-- Events Grid -->
        <div class="events-grid" id="eventsGrid" role="region" aria-live="polite">
          <!-- Dynamic cards rendered here -->
        </div>

        <!-- Empty state placeholder -->
        <div class="events-empty-state glass-panel" id="eventsEmptyState" hidden>
          <span class="empty-icon" aria-hidden="true">🎭</span>
          <h3>No events found</h3>
          <p>${t('events.emptyState')}</p>
          <button type="button" class="btn-secondary" id="emptyResetBtn">Clear Filters</button>
        </div>

        <dialog class="event-modal" id="eventModal" aria-label="Event details">
          <button type="button" class="event-modal-close" aria-label="Close">&times;</button>
          <div class="event-modal-body" tabindex="-1" autofocus></div>
        </dialog>
      </div>
    </section>
  `;

  setupEventsInteractions();
  applyFiltersAndRender();
}

function getCategoryIcon(cat) {
  const map = {
    'All': '✦',
    'Music': '🎸',
    'Dance': '💃',
    'Drama': '🎭',
    'Fashion': '✨',
    'Art & Design': '🎨',
    'Literary': '📖',
    'Photography/Film': '🎬',
    'Gaming/Fun': '🎮'
  };
  return map[cat] || '•';
}

function setupEventsInteractions() {
  const searchInput = document.getElementById('eventSearchInput');
  const searchClear = document.getElementById('eventSearchClear');
  const openCheckbox = document.getElementById('openOnlyCheckbox');
  const resetBtn = document.getElementById('eventsResetFilters');
  const emptyResetBtn = document.getElementById('emptyResetBtn');

  // Debounced search
  let debounceTimeout = null;
  searchInput?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (searchClear) searchClear.hidden = val.length === 0;

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      store.setEventFilter({ search: val });
      applyFiltersAndRender();
    }, 200);
  });

  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.hidden = true;
    store.setEventFilter({ search: '' });
    applyFiltersAndRender();
    searchInput.focus();
  });

  // Day buttons
  document.querySelectorAll('[data-day]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-day]').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      store.setEventFilter({ day: btn.dataset.day });
      applyFiltersAndRender();
    });
  });

  // Category chips
  document.querySelectorAll('[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-category]').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      store.setEventFilter({ category: btn.dataset.category });
      applyFiltersAndRender();
    });
  });

  // Open only toggle
  openCheckbox?.addEventListener('change', (e) => {
    store.setEventFilter({ openOnly: e.target.checked });
    applyFiltersAndRender();
  });

  // Reset filter handlers
  const handleReset = () => {
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.hidden = true;
    if (openCheckbox) openCheckbox.checked = false;
    document.querySelectorAll('[data-day]').forEach(b => {
      const isAll = b.dataset.day === 'All';
      b.classList.toggle('active', isAll);
      b.setAttribute('aria-selected', String(isAll));
    });
    document.querySelectorAll('[data-category]').forEach(b => {
      const isAll = b.dataset.category === 'All';
      b.classList.toggle('active', isAll);
      b.setAttribute('aria-selected', String(isAll));
    });
    store.resetEventFilter();
    applyFiltersAndRender();
  };

  resetBtn?.addEventListener('click', handleReset);
  emptyResetBtn?.addEventListener('click', handleReset);

  // Click (or Enter/Space on) a card to open its details in a modal
  const modal = document.getElementById('eventModal');
  const grid = document.getElementById('eventsGrid');
  const openEvent = (card) => {
    const ev = card && cachedEvents.find(e => e.id === card.dataset.id);
    if (!ev || !modal) return;
    modal.querySelector('.event-modal-body').innerHTML = renderEventModal(ev);
    modal.showModal();
  };
  grid?.addEventListener('click', (e) => openEvent(e.target.closest('.event-card')));
  grid?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    openEvent(e.target.closest('.event-card'));
  });
  modal?.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('.event-modal-close')) modal.close(); });
}

function applyFiltersAndRender() {
  const { category, day, search, openOnly } = store.getState().eventFilter;
  const grid = document.getElementById('eventsGrid');
  const emptyState = document.getElementById('eventsEmptyState');
  const countLabel = document.getElementById('eventsCountLabel');
  const resetBtn = document.getElementById('eventsResetFilters');
  if (!grid) return;

  const isFiltered = category !== 'All' || day !== 'All' || search.length > 0 || openOnly;
  if (resetBtn) resetBtn.hidden = !isFiltered;

  const filtered = cachedEvents.filter(ev => {
    if (category !== 'All' && ev.category !== category) return false;
    if (day !== 'All' && ev.schedule?.day !== day) return false;
    if (search) {
      const query = search.toLowerCase();
      const inName = ev.name.toLowerCase().includes(query);
      const inTag = (ev.tags || []).some(t => t.toLowerCase().includes(query));
      const inDesc = ev.description.toLowerCase().includes(query);
      const inCat = ev.category.toLowerCase().includes(query);
      if (!inName && !inTag && !inDesc && !inCat) return false;
    }
    return true;
  });

  const shown = filtered;

  if (countLabel) {
    countLabel.textContent = `Showing ${shown.length} of ${cachedEvents.length} competitions`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  grid.innerHTML = shown.map((ev, i) => renderEventCard(ev, i)).join('');
}

function teamLabel({ min, max }) {
  return !min ? 'TBA'
    : min === max ? (min === 1 ? 'Solo' : `${min} Members`)
    : `${min}–${max} Members`;
}

function renderEventModal(ev) {
  const day = ev.schedule?.day || 'TBA';
  return `
    ${ev.posterImage ? `<img class="event-modal-poster" src="${ev.posterImage}" alt="${ev.name} poster">` : `<div class="event-modal-poster event-modal-poster--empty" aria-hidden="true"><img src="assets/logos/logo.webp" alt=""></div>`}
    <div class="event-modal-info">
      <span class="ev-club">${ev.category}</span>
      <h3 class="event-modal-name">${ev.name}</h3>
      ${ev.tagline ? `<p class="event-modal-tagline">${ev.tagline}</p>` : ''}
      <p class="event-modal-desc">${ev.description}</p>
      <dl class="event-modal-stats">
        <div><dt>Day</dt><dd>${day}</dd></div>
        <div><dt>Team</dt><dd>${teamLabel(ev.teamSize)}</dd></div>
        <div><dt>Venue</dt><dd>${ev.schedule?.venueName || 'Venue TBA'}</dd></div>
      </dl>
    </div>`;
}

function renderEventCard(ev, i) {
  const teamText = teamLabel(ev.teamSize);

  return `
    <div class="ev-hang" style="--d:${(i % 3) * -0.8}s"><span class="ev-string" aria-hidden="true"></span>
    <article class="event-card" data-id="${ev.id}" aria-label="${ev.name}" role="button" tabindex="0">
      ${ev.posterImage ? `<img class="ev-poster" src="${ev.posterImage}" alt="${ev.name} poster" loading="lazy">` : `<div class="ev-poster ev-poster--empty" aria-hidden="true"><img src="assets/logos/logo.webp" alt=""></div>`}
      <span class="ev-day">${ev.schedule?.day || 'Day TBA'}</span>

      <div class="ev-body">
        <span class="ev-club">${ev.category}</span>
        <h3 class="event-card-title">${ev.name}</h3>
        <p class="event-card-tagline">${ev.tagline || ''}</p>
        <dl class="ev-stats">
          <div><dt>Team</dt><dd>${teamText}</dd></div>
          <div><dt>Venue</dt><dd>${ev.schedule?.venueName || 'Venue TBA'}</dd></div>
        </dl>
        ${ev.tags?.length ? `<ul class="ev-tags">${ev.tags.map(tag => `<li>${tag}</li>`).join('')}</ul>` : ''}
      </div>
    </article>
    </div>
  `;
}
