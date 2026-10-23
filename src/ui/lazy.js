// Lazy-load below-the-fold images and show a shimmering skeleton until each one has loaded

const SKIP = '.hero-wordmark-img, .brand-wordmark, .sec-icon, [fetchpriority]';

function prepare(img) {
  if (img.dataset.skel || img.matches(SKIP)) return;
  img.dataset.skel = '1';
  img.loading = 'lazy';
  img.decoding = 'async';
  if (img.complete && img.naturalWidth) return;
  img.classList.add('skel');
  const done = () => img.classList.remove('skel');
  img.addEventListener('load', done, { once: true });
  img.addEventListener('error', done, { once: true });
}

export function initLazyImages() {
  document.querySelectorAll('img').forEach(prepare);
  // sections re-render (event filters etc.), so catch images added later
  new MutationObserver((muts) => muts.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType !== 1) return;
    if (n.tagName === 'IMG') prepare(n);
    else n.querySelectorAll?.('img').forEach(prepare);
  }))).observe(document.body, { childList: true, subtree: true });
}
