// Hero: full-bleed background video with the Agnee wordmark centred on it and Halloween props around it

export function renderHero() {
  const heroContainer = document.getElementById('hero-mount');
  if (!heroContainer) return;

  const wordmarkSrc = window.WMURI || '';

  heroContainer.innerHTML = `
    <section class="hero-section" id="home" aria-label="Agnee 2026">
      <!-- Drop the festival video at assets/hero.mp4 -->
      <video class="hero-video" src="assets/hero.mp4" autoplay muted loop playsinline preload="auto" aria-hidden="true"></video>

      <!-- Halloween: moon, graveyard skyline, bats and cobwebs (hero-mesh) + ghosts, tombstones, candles (hero-decor) -->
      <div class="hero-mesh" aria-hidden="true"><div class="hero-noise"></div></div>
      <div class="hero-decor" aria-hidden="true">
        <i class="gh gh1"></i><i class="gh gh2"></i><i class="gh gh3"></i>
        <i class="tb tb1"></i><i class="tb tb2"></i><i class="tb tb3"></i>
        <i class="cd cd1"></i><i class="cd cd2"></i>
      </div>

      <div class="hero-content">
        <img class="hero-wordmark-img" src="${wordmarkSrc}" alt="Agnee 2026" width="620" height="150" fetchpriority="high">
      </div>
    </section>
  `;

}
