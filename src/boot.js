var WMURI = window.WMURI || 'assets/logos/logo.webp';
window.WMURI = WMURI;
if (!window.__AGNEE_BOOTED__) {
  window.__AGNEE_BOOTED__ = true;
  window.WMI = new Image();
function startApp() {
  const script = document.createElement('script');
  script.src = 'src/app.js';
  script.async = false;
  document.body.appendChild(script);
}
function loadThreeFallback() {
  if (window.THREE) return startApp();
  const fallback = document.createElement('script');
  fallback.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  fallback.onload = startApp;
  fallback.onerror = () => {
    const message = document.querySelector('#load .ld span');
    if (message) message.textContent = '3D could not load. Check your connection and reload.';
  };
  document.head.appendChild(fallback);
}
// Perf: boot the 3D runtime only when the map nears the viewport or is launched,
// and pause its render loop while the map is off screen.
function when3DNeeded(go) {
  let done = false;
  const fire = () => { if (!done) { done = true; go(); } };
  window.addEventListener('agnee:launch-map', fire);
  window.addEventListener('agnee:fly-to-place', fire);
  const mount = document.getElementById('map-mount');
  if (!mount || !('IntersectionObserver' in window)) return fire();
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) { obs.disconnect(); fire(); }
  }, { rootMargin: '600px' }).observe(mount);
}
function pauseWhenOffscreen() {
  const mount = document.getElementById('map-mount');
  if (!mount || !('IntersectionObserver' in window)) return;
  new IntersectionObserver((entries) => {
    const rt = window.AGNEE_RUNTIME;
    if (!rt) return;
    rt.paused = !entries[0].isIntersecting;
    // runtime restarts its loop on visibilitychange when not paused
    if (!rt.paused && !rt.raf) document.dispatchEvent(new Event('visibilitychange'));
  }).observe(mount);
}
window.WMI.onload = window.WMI.onerror = () => {
  when3DNeeded(() => { loadThreeFallback(); pauseWhenOffscreen(); });
};
window.WMI.src = WMURI;

}
