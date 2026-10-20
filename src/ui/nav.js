// Accessible sticky glass navigation header + mobile bottom action dock + drawer

import { router } from '../core/router.js';
import { t } from '../core/i18n.js';

export function renderNavbar(siteData = {}) {
  const navContainer = document.getElementById('navbar-mount');
  if (!navContainer) return;

  const wordmarkSrc = window.WMURI || '';

  navContainer.innerHTML = `
    <header class="site-header" role="banner">
      <div class="header-inner container">
        <a href="#home" class="brand-link" aria-label="Agnee 2026 Home">
          <img class="brand-wordmark" src="${wordmarkSrc}" alt="Agnee 2026" width="160" height="42">
        </a>

        <div class="header-actions">
          <button class="menu-toggle" id="menuToggleBtn" type="button" aria-expanded="false" aria-controls="mobileDrawer" aria-label="Toggle navigation menu">
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Slide-out Drawer -->
    <div class="mobile-drawer-backdrop" id="mobileDrawerBackdrop" aria-hidden="true"></div>
    <div class="mobile-drawer" id="mobileDrawer" role="dialog" aria-modal="true" aria-label="Navigation Menu" hidden>
      <div class="drawer-header">
        <img class="brand-wordmark" src="${wordmarkSrc}" alt="Agnee 2026" width="140" height="36">
        <button class="drawer-close" id="drawerCloseBtn" type="button" aria-label="Close navigation menu">✕</button>
      </div>
      <nav class="drawer-nav" aria-label="Mobile Navigation">
        <ul class="drawer-links">
          <li><a href="#home" class="drawer-link" data-route="home"><span class="link-icon">⌂</span> ${t('nav.home')}</a></li>
          <li><a href="#about" class="drawer-link" data-route="about"><span class="link-icon">ℹ</span> ${t('nav.about')}</a></li>
          <li><a href="#events" class="drawer-link" data-route="events"><span class="link-icon">⚡</span> ${t('nav.events')}</a></li>
          <li><a href="#schedule" class="drawer-link" data-route="schedule"><span class="link-icon">⏱</span> ${t('nav.schedule')}</a></li>
          <li><a href="#map" class="drawer-link" data-route="map"><span class="link-icon">🗺</span> ${t('nav.map')}</a></li>
          <li><a href="#lineup" class="drawer-link" data-route="lineup"><span class="link-icon">🎤</span> ${t('nav.lineup')}</a></li>
          <li><a href="#sponsors" class="drawer-link" data-route="sponsors"><span class="link-icon">🤝</span> ${t('nav.sponsors')}</a></li>
          <li><a href="#gallery" class="drawer-link" data-route="gallery"><span class="link-icon">📷</span> ${t('nav.gallery')}</a></li>
          <li><a href="#team" class="drawer-link" data-route="team"><span class="link-icon">👥</span> ${t('nav.team')}</a></li>
          <li><a href="#faq" class="drawer-link" data-route="faq"><span class="link-icon">❓</span> ${t('nav.faq')}</a></li>
          <li><a href="#contact" class="drawer-link" data-route="contact"><span class="link-icon">✉</span> ${t('nav.contact')}</a></li>
        </ul>
      </nav>
    </div>

    <!-- Mobile Bottom Action Dock (Visible on 360-768px screens) -->
    <nav class="mobile-bottom-dock" aria-label="Quick Actions">
      <a href="#home" class="dock-item" data-route="home">
        <span class="dock-icon">⌂</span>
        <span class="dock-label">${t('nav.home')}</span>
      </a>
      <a href="#events" class="dock-item" data-route="events">
        <span class="dock-icon">⚡</span>
        <span class="dock-label">${t('nav.events')}</span>
      </a>
      <a href="#map" class="dock-item dock-item-highlight" data-route="map">
        <span class="dock-icon">🗺</span>
        <span class="dock-label">3D Map</span>
      </a>
    </nav>
  `;

  // Attach event handlers
  setupNavInteractions();
}

function setupNavInteractions() {
  const menuBtn = document.getElementById('menuToggleBtn');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('mobileDrawerBackdrop');
  const closeBtn = document.getElementById('drawerCloseBtn');

  function openDrawer() {
    drawer.hidden = false;
    backdrop.classList.add('on');
    menuBtn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    closeBtn.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('on');
    menuBtn.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      drawer.hidden = true;
    }, 300);
  }

  menuBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-link, .drawer-register-btn').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Esc key listener for drawer accessibility
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer && !drawer.hidden) {
      closeDrawer();
      menuBtn?.focus();
    }
  });

  // Hide the navbar (and mobile dock) while the hero is on screen; it appears from the 2nd section
  const toggleBars = () => {
    const hero = document.getElementById('home'); // rendered after the navbar, so look it up lazily
    const onHero = hero && window.scrollY < hero.offsetHeight - 80;
    document.body.classList.toggle('on-hero', !!onHero);
  };
  window.addEventListener('scroll', toggleBars, { passive: true });
  window.addEventListener('resize', toggleBars);
  window.addEventListener('load', toggleBars);
  setTimeout(toggleBars, 0);

  // Highlight active nav links on route changes
  router.subscribe((currentRoute) => {
    document.querySelectorAll('[data-route]').forEach(link => {
      const match = link.getAttribute('data-route') === currentRoute;
      link.classList.toggle('active', match);
      link.setAttribute('aria-current', match ? 'page' : 'false');
    });
  });
}
