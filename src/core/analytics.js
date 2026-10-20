// Privacy-first, consent-aware analytics dispatcher (off by default)

class Analytics {
  constructor() {
    this.enabled = false;
  }

  init(siteConfig = {}) {
    this.enabled = !!siteConfig.analyticsEnabled;
    if (this.enabled) {
      console.log('[Analytics] Initialized in privacy-preserving mode.');
    }
  }

  track(eventName, properties = {}) {
    if (!this.enabled) return;

    try {
      // Dispatch to custom event or console in development
      const payload = {
        event: eventName,
        timestamp: new Date().toISOString(),
        properties
      };

      window.dispatchEvent(new CustomEvent('agnee:analytics', { detail: payload }));
      // Hook for privacy-friendly collectors (Umami / Plausible) if configured
      if (window.plausible) {
        window.plausible(eventName, { props: properties });
      } else if (window.umami) {
        window.umami.track(eventName, properties);
      }
    } catch (err) {
      console.warn('[Analytics] Failed to track event:', err);
    }
  }

  // Pre-configured event helpers
  trackRegisterClick(eventId = null, passType = null) {
    this.track('click_register', { eventId, passType });
  }

  trackEventView(eventId, eventName) {
    this.track('view_event_detail', { eventId, eventName });
  }

  trackMapEngagement(action, placeId = null) {
    this.track('map_engagement', { action, placeId });
  }

  trackShare(target, url) {
    this.track('share_action', { target, url });
  }

  trackPlanAdd(eventId) {
    this.track('plan_add_event', { eventId });
  }

  trackICSDownload(type) {
    this.track('download_ics', { type });
  }
}

export const analytics = new Analytics();
