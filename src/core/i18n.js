// Internationalization (i18n) dictionary ready for EN, HI, GU

const DICTIONARY = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      events: 'Events',
      schedule: 'Schedule',
      lineup: 'Line-up',
      map: 'Campus Map',
      sponsors: 'Sponsors',
      gallery: 'Gallery',
      team: 'Team',
      register: 'Register',
      travel: 'Travel',
      faq: 'FAQ',
      contact: 'Contact',
      myPlan: 'My Plan'
    },
    hero: {
      taglineDefault: 'Igniting the Spirit of Expression',
      subtagline: 'Annual Cultural Festival of Gati Shakti Vishwavidyalaya',
      exploreMap: 'Explore Campus 3D',
      registerCTA: 'Register Now',
      countdownDays: 'Days',
      countdownHours: 'Hours',
      countdownMins: 'Mins',
      countdownSecs: 'Secs',
      datesAnnounceSoon: 'Dates Announcing Soon',
      venueBadge: 'GSV Vadodara'
    },
    events: {
      title: 'Events & Competitions',
      subtitle: '',
      searchPlaceholder: 'Search events, genres, rules...',
      allCategories: 'All Categories',
      allDays: 'All Days',
      filterOpenOnly: 'Open Registrations Only',
      addToPlan: 'Add to Plan',
      inPlan: 'In My Plan',
      registerNow: 'Register',
      showOnMap: 'Show on 3D Map',
      teamSizeLabel: 'Team Size',
      eligibilityLabel: 'Eligibility',
      prizesLabel: 'Prizes',
      emptyState: 'No events match your current filter. Try resetting filters.'
    },
    plan: {
      title: 'My Festival Itinerary',
      subtitle: '',
      emptyPlan: 'You haven’t added any events to your plan yet. Browse competitions and tap "Add to Plan".',
      exportICS: 'Export to Calendar (.ics)',
      clearPlan: 'Clear Plan',
      conflictAlert: 'Schedule Warning: You have events occurring concurrently.'
    },
    map: {
      title: 'Campus in 3D',
      subtitle: 'Fly across Gati Shakti Vishwavidyalaya and locate stages, hostels, and festival zones.',
      launchFullScreen: 'Enter Immersive Map',
      captureView: 'Capture Screenshot',
      directions: 'Get Walking Directions',
      liteMode: 'Lite Performance Mode',
      accessibleHeading: 'Campus Landmarks & Walking Guide'
    },
    common: {
      tba: 'To be announced',
      comingSoon: 'Coming Soon',
      announcingSoon: 'Announcing Soon',
      share: 'Share',
      copied: 'Link Copied!',
      close: 'Close',
      back: 'Back'
    }
  }
};

let currentLang = 'en';

export function t(path, fallback = '') {
  const parts = path.split('.');
  let curr = DICTIONARY[currentLang] || DICTIONARY.en;
  for (const part of parts) {
    if (curr && curr[part] !== undefined) {
      curr = curr[part];
    } else {
      return fallback || path;
    }
  }
  return curr;
}

export function setLanguage(lang) {
  if (DICTIONARY[lang]) {
    currentLang = lang;
    document.documentElement.setAttribute('lang', lang);
  }
}

export function getLanguage() {
  return currentLang;
}
