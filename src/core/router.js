// Router handling hash-based deep linking, document title, meta descriptions and canonical links

const ROUTE_META = {
  'home': {
    title: 'Agnee 2026 · Campus in 3D | Gati Shakti Vishwavidyalaya',
    desc: 'The official website of Agnee 2026, the annual cultural festival of Gati Shakti Vishwavidyalaya, Vadodara. Explore the 3D campus, events, and festival lineup.'
  },
  'about': {
    title: 'About Agnee 2026 & GSV | Cultural Fest',
    desc: 'Learn about Agnee 2026, the spirit of creative expression at Gati Shakti Vishwavidyalaya, Vadodara.'
  },
  'events': {
    title: 'Events & Competitions · Agnee 2026',
    desc: 'Discover competitions across Music, Dance, Drama, Fine Arts, Fashion, Literary, and Gaming at Agnee 2026.'
  },
  'schedule': {
    title: 'Festival Schedule & Timeline · Agnee 2026',
    desc: 'Day-wise timeline, stage tracks, and live event indicators for Agnee 2026 at Gati Shakti Vishwavidyalaya.'
  },
  'lineup': {
    title: 'Line-up & Judges · Agnee 2026',
    desc: 'Celebrity pro-show artists, performance guests, and competitive judges for Agnee 2026.'
  },
  'map': {
    title: 'Explore the Venue · 3D Campus Map · Agnee 2026',
    desc: 'Interactive 3D campus map of Gati Shakti Vishwavidyalaya, Vadodara. Explore landmarks, Oval Ground festival arena, and walking directions.'
  },
  'sponsors': {
    title: 'Sponsors & Corporate Partners · Agnee 2026',
    desc: 'Our valued festival sponsors, partners, and corporate allies powering Agnee 2026 at GSV Vadodara.'
  },
  'gallery': {
    title: 'Gallery & Aftermovie · Agnee 2026',
    desc: 'Relive the festival energy, stage spectacles, and campus moments from Agnee at GSV.'
  },
  'team': {
    title: 'Organizing Team · Agnee 2026',
    desc: 'The student coordinators, fest secretariat, and faculty leadership behind Agnee 2026.'
  },
  'faq': {
    title: 'Frequently Asked Questions · Agnee 2026',
    desc: 'Answers regarding participation, eligibility, passes, accommodation, and campus rules for Agnee 2026.'
  },
  'contact': {
    title: 'Contact & Inquiries · Agnee 2026',
    desc: 'Get in touch with the Agnee 2026 secretariat, events team, and sponsorship desk.'
  }
};

class Router {
  constructor() {
    this.currentRoute = 'home';
    this.routeParams = {};
    this.listeners = new Set();

    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  init() {
    // On reload keep the reader where they were instead of jumping to the hash section / top
    const KEY = 'agnee-scrollY';
    history.scrollRestoration = 'manual';
    addEventListener('scroll', () => { try { sessionStorage.setItem(KEY, scrollY); } catch {} }, { passive: true });

    let y = 0;
    try { y = performance.getEntriesByType('navigation')[0]?.type === 'reload' ? Number(sessionStorage.getItem(KEY)) || 0 : 0; } catch {}

    this.restoring = y > 0;
    this.handleHashChange();
    this.restoring = false;
    if (y > 0) {
      const restore = () => scrollTo({ top: y, behavior: 'instant' });
      restore();
      addEventListener('load', restore, { once: true }); // images/fonts can change page height
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  handleHashChange() {
    const rawHash = location.hash.replace(/^#\/?/, '').trim();
    if (!rawHash) {
      this.setRoute('home');
      return;
    }

    // Check for query or path syntax: e.g. event/battle-of-the-bands or map?place=oval-ground
    const [pathPart, queryPart] = rawHash.split('?');
    const segments = pathPart.split('/');
    const primary = segments[0] || 'home';

    const params = {};
    if (segments.length > 1) {
      params.id = segments[1];
    }
    if (queryPart) {
      const q = new URLSearchParams(queryPart);
      for (const [k, v] of q.entries()) {
        params[k] = v;
      }
    }

    this.routeParams = params;
    this.setRoute(primary, params);
  }

  setRoute(route, params = {}) {
    this.currentRoute = route;
    this.routeParams = params;

    this.updateMeta(route, params);
    this.scrollToSection(route);

    this.listeners.forEach(fn => fn(route, params));
  }

  updateMeta(route, params) {
    const meta = ROUTE_META[route] || ROUTE_META.home;
    document.title = meta.title;

    // Update meta description
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', meta.desc);

    // Update og:title & twitter:title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title);

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', meta.title);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${location.origin}${location.pathname}#${route}`;
  }

  scrollToSection(route) {
    if (this.restoring) return;
    if (route === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectionEl = document.getElementById(route);
    if (sectionEl) {
      // Small offset for sticky header
      const headerOffset = 70;
      const elementPosition = sectionEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  }

  navigate(route) {
    location.hash = route;
  }
}

export const router = new Router();
