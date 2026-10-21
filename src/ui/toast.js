// Toast notification container and micro-interaction feedback

const ICONS = {
  success: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  error: '<path d="M6 6l12 12M18 6L6 18"/>',
  info: '<path d="M12 8v.01M12 11.5V17"/>',
};
const TITLES = { success: 'Message sent', error: 'Something went wrong' };

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
        const type = ICONS[toast.type] ? toast.type : 'info';
        toastEl.innerHTML = `
          <span class="toast-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[type]}</svg></span>
          <span class="toast-txt">${TITLES[type] ? `<b>${TITLES[type]}</b>` : ''}<span>${toast.message}</span></span>
          <i class="toast-bar" style="animation-duration:${toast.duration}ms"></i>`;
        toastEl.className = `toast-notification on toast-${toast.type}`;
      } else {
        toastEl.classList.remove('on');
      }
    }
  });
}
