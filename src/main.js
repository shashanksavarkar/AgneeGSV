// Main Application Orchestrator for Agnee 2026

import * as data from '../data/data.js';
import { places } from '../data/places.js';
import { store } from './core/store.js';
import { router } from './core/router.js';
import { analytics } from './core/analytics.js';

import { renderNavbar } from './ui/nav.js';
import { renderHero } from './ui/hero.js';
import { renderAbout } from './ui/about.js';
import { renderEvents } from './ui/events.js';
import { renderSchedule } from './ui/schedule.js';
import { renderLineup } from './ui/lineup.js';
import { renderMapSection } from './ui/map-section.js';
import { renderSponsors } from './ui/sponsors.js';
import { renderGallery } from './ui/gallery.js';
import { renderTeam } from './ui/team.js';
import { renderFaq } from './ui/faq.js';
import { renderContact } from './ui/contact.js';
import { renderFooter } from './ui/footer.js';
import { renderToastContainer } from './ui/toast.js';
import { initScrollRail } from './ui/scrollbar.js';

async function bootstrap() {
  try {

    // 1. Initialize analytics hook
    analytics.init(data.site);

    // 3. Mount all UI sections
    renderNavbar(data.site);
    renderHero(data.site);
    renderAbout(data.site);
    renderEvents(data.events);
    renderSchedule(data.schedule, data.events);
    renderMapSection(places, data.events);
    renderLineup(data.guests);
    renderSponsors(data.sponsors);
    renderGallery(data.gallery);
    renderTeam(data.team);
    renderFaq(data.faqs);
    renderContact(data.site);
    renderFooter(data.site);
    renderToastContainer();
    initScrollRail();

    // 4. Initialize client-side router
    router.init();

    // 5. Setup scroll-triggered reveals
    initScrollReveals();

    // 6. Register Service Worker for PWA & offline support if available
    registerServiceWorker();

    console.log('[Agnee 2026] Successfully initialized.');
  } catch (err) {
    console.error('[Agnee 2026] Initialization error:', err);
  }
}

function initScrollReveals() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.section, .glass-panel, .event-card, .plan-card').forEach(el => {
    el.classList.add('reveal-on-scroll');
    observer.observe(el);
  });
}

function registerServiceWorker() {
  // Dev: the SW serves stale cached files, so drop it and its caches on localhost
  if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    navigator.serviceWorker?.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
      if (regs.length) caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))).then(() => location.reload());
    });
    return;
  }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        console.log('[SW] ServiceWorker registered with scope:', reg.scope);
        // Prompt immediate check for updated sw.js
        reg.update();
      }).catch((err) => {
        console.log('[SW] ServiceWorker registration skipped/failed:', err);
      });

      // When a new service worker takes control (e.g. after clearing v1 cache), reload once
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing && !sessionStorage.getItem('sw-updated-reload')) {
          refreshing = true;
          sessionStorage.setItem('sw-updated-reload', '1');
          console.log('[SW] Controller changed to new version, refreshing...');
          window.location.reload();
        }
      });
    });
  }
}

// Kick off when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
