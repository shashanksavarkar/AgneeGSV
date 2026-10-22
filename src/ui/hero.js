// Hero: full-bleed background video with the Agnee wordmark centred on it

import { particleField } from './particles.js';

export function renderHero() {
  const heroContainer = document.getElementById('hero-mount');
  if (!heroContainer) return;

  const wordmarkSrc = window.WMURI || 'assets/logo.webp';

  heroContainer.innerHTML = `
    <section class="hero-section" id="home" aria-label="Agnee 2026">
      <!-- Drop the festival video at assets/hero.mp4 -->
      <video class="hero-video" src="assets/hero_bg.mp4" autoplay muted loop playsinline preload="auto" aria-hidden="true"></video>

      ${particleField('petals', 14)}

      <div class="hero-content">
        <img class="hero-wordmark-img" src="${wordmarkSrc}" alt="Agnee 2026" width="620" height="150" fetchpriority="high">
      </div>
    </section>
  `;

}
