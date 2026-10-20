// Toast notification container and micro-interaction feedback

import { store } from '../core/store.js';

export function renderToastContainer() {
  let toastEl = document.getElementById('toastNotification');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toastNotification';
    toastEl.className = 'toast-notification';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }

  store.subscribe((state, prop) => {
    if (prop === 'toast') {
      const toast = state.toast;
      if (toast) {
        toastEl.textContent = toast.message;
        toastEl.className = `toast-notification on toast-${toast.type}`;
      } else {
        toastEl.classList.remove('on');
      }
    }
  });
}
