// Hero: full-bleed background video with the Agnee wordmark centred on it

import { particleField } from './particles.js';
import { igniteHtml, startIgnite } from './countdown.js';
import { initHeroPetals } from './hero-petals.js';

export function renderHero() {
  const heroContainer = document.getElementById('hero-mount');
  if (!heroContainer) return;

  heroContainer.innerHTML = `
    <section class="hero-section" id="home" aria-label="Agnee 2026">
      <!-- Festival video: assets/gallery/hero_bg.mp4 -->
      <video class="hero-video" src="assets/gallery/hero_bg.mp4" autoplay muted loop playsinline preload="auto" aria-hidden="true"></video>

      ${particleField('petals', 14)}

      ${igniteHtml('ft-ignite hero-ignite')}

      <div class="hero-content">
      <canvas class="hero-petals" role="img" aria-label="Agnee 2026"></canvas>
      </div>

      <button type="button" class="hero-trailer-btn" id="btnWatchTrailer"><span aria-hidden="true">▶</span> Watch Agnee'26 Trailer</button>
    </section>
  `;

  startIgnite(heroContainer.querySelector('.hero-ignite'));
  initHeroPetals(heroContainer.querySelector('.hero-section'));

  // Jump to the gallery and start the trailer (the click counts as the gesture browsers need for autoplay)
  document.getElementById('btnWatchTrailer').addEventListener('click', () => {
    document.querySelector('#gallery .aftermovie-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('btnPlayVideo')?.click();
  });
}
