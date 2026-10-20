// Events discovery hub with category filters, debounced search, day tabs, and modal bottom sheet

import { store } from '../core/store.js';
import { router } from '../core/router.js';
import { analytics } from '../core/analytics.js';
import { generateEventICS, downloadICSFile } from '../core/ics-export.js';
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
          <span class="section-kicker">DISCOVER & PARTICIPATE</span>
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
      </div>
    </section>

    <!-- Event Detail Modal / Bottom Sheet -->
    <div class="modal-backdrop" id="eventModalBackdrop" aria-hidden="true"></div>
    <div class="event-modal-container" id="eventModal" role="dialog" aria-modal="true" aria-labelledby="modalEventTitle" hidden>
      <div class="modal-header">
        <div class="modal-badge-group">
          <span class="badge-category" id="modalCategory">Category</span>
          <span class="badge-state" id="modalRegState">Status</span>
        </div>
        <button type="button" class="modal-close-btn" id="eventModalCloseBtn" aria-label="Close event details">✕</button>
      </div>
      <div class="modal-body" id="eventModalBody">
        <!-- Injected via openEventModal -->
      </div>
    </div>
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

  // Modal close handlers
  const modalBackdrop = document.getElementById('eventModalBackdrop');
  const modalCloseBtn = document.getElementById('eventModalCloseBtn');
  modalBackdrop?.addEventListener('click', closeEventModal);
  modalCloseBtn?.addEventListener('click', closeEventModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('eventModal');
      if (modal && !modal.hidden) closeEventModal();
    }
  });

  // Listen for external URL route parameter e.g. #event/battle-of-the-bands
  router.subscribe((route, params) => {
    if (route === 'events' && params?.id) {
      const ev = cachedEvents.find(e => e.id === params.id);
      if (ev) openEventModal(ev);
    }
  });
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
    if (openOnly && ev.registrationState !== 'open') return false;
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

  const shown = isFiltered ? filtered : filtered.slice(0, 6);

  if (countLabel) {
    countLabel.textContent = `Showing ${shown.length} of ${cachedEvents.length} competitions`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  grid.innerHTML = shown.map(ev => renderEventCard(ev)).join('');

  // Attach card event listeners
  grid.querySelectorAll('.event-card').forEach(card => {
    const eventId = card.dataset.id;
    const ev = cachedEvents.find(e => e.id === eventId);
    if (!ev) return;

    card.querySelector('.btn-card-detail')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openEventModal(ev);
    });

    // Whole card click also opens detail
    card.addEventListener('click', () => {
      openEventModal(ev);
    });
  });
}

function renderEventCard(ev) {
  const stateBadge = getStateBadge(ev.registrationState);
  const teamText = ev.teamSize.min === ev.teamSize.max 
    ? (ev.teamSize.min === 1 ? 'Solo' : `${ev.teamSize.min} Members`) 
    : `${ev.teamSize.min}–${ev.teamSize.max} Members`;

  return `
    <article class="event-card glass-panel" data-id="${ev.id}" tabindex="0" aria-label="${ev.name}">
      <div class="card-top">
        <span class="card-category-tag">${ev.category}</span>
        ${stateBadge}
      </div>

      <div class="card-main">
        <h3 class="event-card-title">${ev.name}</h3>
        <p class="event-card-tagline">${ev.tagline || ''}</p>
      </div>

      <div class="event-card-meta">
        <div class="meta-row">
          <span class="meta-icon" aria-hidden="true">👥</span>
          <span>${teamText}</span>
        </div>
        <div class="meta-row">
          <span class="meta-icon" aria-hidden="true">📍</span>
          <span>${ev.schedule?.venueName || 'Venue TBA'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-icon" aria-hidden="true">⏱</span>
          <span>${ev.schedule?.day || 'Day TBA'}</span>
        </div>
      </div>

      <div class="event-card-actions">
        <button type="button" class="btn-secondary btn-sm btn-card-detail">
          ${t('events.viewRules')}
        </button>
      </div>
    </article>
  `;
}

function getStateBadge(state) {
  switch (state) {
    case 'open':
      return `<span class="badge-state state-open">Registration Open</span>`;
    case 'soon':
      return `<span class="badge-state state-soon">Opening Soon</span>`;
    case 'closed':
      return `<span class="badge-state state-closed">Closed</span>`;
    case 'sold_out':
      return `<span class="badge-state state-soldout">Slots Full</span>`;
    default:
      return `<span class="badge-state state-soon">Announcing Soon</span>`;
  }
}

export function openEventModal(ev) {
  analytics.trackEventView(ev.id, ev.name);
  const modal = document.getElementById('eventModal');
  const backdrop = document.getElementById('eventModalBackdrop');
  const body = document.getElementById('eventModalBody');
  const catEl = document.getElementById('modalCategory');
  const stateEl = document.getElementById('modalRegState');
  if (!modal || !body) return;

  if (catEl) catEl.textContent = ev.category;
  if (stateEl) {
    stateEl.className = 'badge-state ' + (ev.registrationState === 'open' ? 'state-open' : 'state-soon');
    stateEl.textContent = ev.registrationState === 'open' ? 'Registration Open' : 'Opening Soon';
  }

  const teamText = ev.teamSize.min === ev.teamSize.max 
    ? (ev.teamSize.min === 1 ? 'Solo' : `${ev.teamSize.min} Members`) 
    : `${ev.teamSize.min} to ${ev.teamSize.max} Members`;

  body.innerHTML = `
    <h2 class="modal-title" id="modalEventTitle">${ev.name}</h2>
    <p class="modal-tagline">${ev.tagline || ''}</p>
    <p class="modal-description">${ev.description || ''}</p>

    <div class="modal-meta-grid">
      <div class="modal-meta-card">
        <span class="label">${t('events.teamSizeLabel')}</span>
        <span class="val">${teamText}</span>
      </div>
      <div class="modal-meta-card">
        <span class="label">Schedule Slot</span>
        <span class="val">${ev.schedule?.day || 'TBA'} · ${ev.schedule?.time || 'Timing TBA'}</span>
      </div>
      <div class="modal-meta-card">
        <span class="label">Venue</span>
        <span class="val">${ev.schedule?.venueName || 'Venue TBA'}</span>
      </div>
      <div class="modal-meta-card">
        <span class="label">${t('events.prizesLabel')}</span>
        <span class="val">${ev.prizes || t('common.tba')}</span>
      </div>
    </div>

    <!-- Eligibility -->
    <div class="modal-section">
      <h3 class="section-sub">${t('events.eligibilityLabel')}</h3>
      <p class="text-sm">${ev.eligibility || 'Open to all enrolled college and university students with valid ID.'}</p>
    </div>

    <!-- Rules & Regulations List -->
    <div class="modal-section">
      <h3 class="section-sub">Rules & Guidelines</h3>
      <ul class="rules-list">
        ${(ev.rules || []).map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>

    <!-- Judging Criteria -->
    ${(ev.judgingCriteria && ev.judgingCriteria.length > 0) ? `
      <div class="modal-section">
        <h3 class="section-sub">Judging Criteria</h3>
        <ul class="criteria-list">
          ${ev.judgingCriteria.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <!-- Modal Action Buttons -->
    <div class="modal-actions-footer">
      <button type="button" class="btn-secondary" id="modalShowMapBtn">
        🗺 ${t('events.showOnMap')}
      </button>

      <button type="button" class="btn-secondary" id="modalExportIcsBtn">
        📅 Calendar (.ics)
      </button>

      <button type="button" class="btn-secondary" id="modalShareBtn">
        ↗ ${t('common.share')}
      </button>

      ${ev.registrationLink ? `<a href="${ev.registrationLink}" target="_blank" rel="noopener noreferrer" class="btn-primary" id="modalRegBtn">${ev.registrationState === 'open' ? 'Register on Portal' : 'Register (Opening Soon)'}</a>` : ''}
    </div>
  `;

  // Attach modal action listeners
  const showMapBtn = document.getElementById('modalShowMapBtn');
  showMapBtn?.addEventListener('click', () => {
    closeEventModal();
    // Navigate to 3D map with venue focus
    const venueId = ev.schedule?.venueId || 'stage';
    location.hash = `map?place=${venueId}`;
    window.dispatchEvent(new CustomEvent('agnee:fly-to-place', { detail: { placeId: venueId } }));
  });

  const exportIcsBtn = document.getElementById('modalExportIcsBtn');
  exportIcsBtn?.addEventListener('click', () => {
    const icsContent = generateEventICS(ev);
    downloadICSFile(icsContent, `agnee2026-${ev.id}.ics`);
    analytics.trackICSDownload('single_event');
    store.showToast('Calendar (.ics) downloaded!');
  });

  const shareBtn = document.getElementById('modalShareBtn');
  shareBtn?.addEventListener('click', () => {
    const shareUrl = `${location.origin}${location.pathname}#events/${ev.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Agnee 2026: ${ev.name}`,
        text: `${ev.tagline || ev.name} at Agnee 2026, GSV Vadodara`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareUrl);
      store.showToast(t('common.copied'));
    }
    analytics.trackShare('event_modal', shareUrl);
  });

  // Display modal
  modal.hidden = false;
  backdrop.classList.add('on');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeEventModal() {
  const modal = document.getElementById('eventModal');
  const backdrop = document.getElementById('eventModalBackdrop');
  if (!modal) return;

  modal.classList.remove('open');
  backdrop?.classList.remove('on');
  document.body.style.overflow = '';
  modal.hidden = true;
}
