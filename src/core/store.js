// Tiny reactive state store with safe localStorage persistence

const STORAGE_KEYS = {
  REG_DRAFT: 'agnee2026_reg_draft',
  MAP_LAYERS: 'agnee2026_layers',
  PREFERENCES: 'agnee2026_prefs'
};

function safeGet(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (err) {
    console.warn(`[Store] Could not read ${key} from storage:`, err);
    return fallback;
  }
}

function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`[Store] Could not write ${key} to storage:`, err);
  }
}

class Store {
  constructor() {
    this.state = {
      regDraft: safeGet(STORAGE_KEYS.REG_DRAFT, {}),
      layers: safeGet(STORAGE_KEYS.MAP_LAYERS, {
        buildings: true,
        labels: true,
        roads: true,
        trees: true,
        crowd: true,
        fest: true,
        dusk: false,
        lite: false
      }),
      eventFilter: {
        category: 'All',
        day: 'All',
        search: '',
        openOnly: false
      },
      selectedPlaceId: null,
      activeModal: null, // { type: 'event-detail'|'register'|'directions'|'screenshot', data: ... }
      toast: null
    };

    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(changedProp) {
    this.listeners.forEach(fn => {
      try {
        fn(this.state, changedProp);
      } catch (e) {
        console.error('[Store] Listener error:', e);
      }
    });
  }

  // --- Filter Actions ---
  setEventFilter(partial) {
    this.state.eventFilter = { ...this.state.eventFilter, ...partial };
    this.notify('eventFilter');
  }

  resetEventFilter() {
    this.state.eventFilter = { category: 'All', day: 'All', search: '', openOnly: false };
    this.notify('eventFilter');
  }

  // --- Registration Draft Actions ---
  saveRegistrationDraft(draft) {
    this.state.regDraft = { ...this.state.regDraft, ...draft, updatedAt: Date.now() };
    safeSet(STORAGE_KEYS.REG_DRAFT, this.state.regDraft);
    this.notify('regDraft');
  }

  getRegistrationDraft() {
    return this.state.regDraft;
  }

  clearRegistrationDraft() {
    this.state.regDraft = {};
    safeSet(STORAGE_KEYS.REG_DRAFT, {});
    this.notify('regDraft');
  }

  // --- Modal State ---
  openModal(type, data = null) {
    this.state.activeModal = { type, data };
    this.notify('activeModal');
  }

  closeModal() {
    this.state.activeModal = null;
    this.notify('activeModal');
  }

  // --- Toast notifications ---
  showToast(message, type = 'info', duration = 3000) {
    this.state.toast = { message, type, id: Date.now() };
    this.notify('toast');
    setTimeout(() => {
      if (this.state.toast?.message === message) {
        this.state.toast = null;
        this.notify('toast');
      }
    }, duration);
  }
}

export const store = new Store();
