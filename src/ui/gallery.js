// Gallery and aftermovie showcase with privacy-friendly click-to-load video embed

export function renderGallery(gallery = { top: [], bottom: [] }) {
  const mount = document.getElementById('gallery-mount');
  if (!mount) return;

  mount.innerHTML = `
    <section class="section gallery-section" id="gallery" aria-labelledby="galleryHeading">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" id="galleryHeading">Gallery</h2>
        </div>

        <!-- Privacy-Friendly Click-to-Load Video Showcase -->
        <div class="aftermovie-container glass-panel">
          <div class="video-placeholder" id="videoPlaceholderSlot">
            <div class="video-overlay-content">
              <span class="video-badge">Aftermovie Reel</span>
              <button type="button" class="btn-play-video" id="btnPlayVideo" aria-label="Play festival teaser video">
                <span class="play-icon" aria-hidden="true">▶</span>
              </button>
              <h3 class="video-title">Agnee'26 Trailer</h3>
              <p class="video-desc">Tap play to watch. Nothing from YouTube loads until you do.</p>
            </div>
          </div>
          <div class="video-embed-frame" id="videoEmbedFrame" hidden></div>
        </div>

        <!-- Media Marquee: top row drifts left, bottom row drifts right; hover pauses -->
        <div class="gallery-marquee">
          ${[['top', 'marquee-left'], ['bottom', 'marquee-right']].map(([key, dir]) => renderRow(gallery[key] || [], key, dir)).join('')}
        </div>

        <dialog class="gallery-lightbox" id="galleryLightbox" aria-label="Gallery image">
          <button type="button" class="lightbox-close" aria-label="Close">✕</button>
          <div class="lightbox-art" id="lightboxArt"></div>
        </dialog>
      </div>
    </section>
  `;

  // Lightbox: click a VIEW button to pop the image up
  const box = document.getElementById('galleryLightbox');
  mount.querySelector('.gallery-marquee')?.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-view')?.closest('.gallery-item');
    if (!item) return;
    const { title, tag, color, src } = gallery[item.dataset.row][item.dataset.index];
    const art = box.querySelector('#lightboxArt');
    art.style.background = src ? '#000' : `linear-gradient(135deg, ${color}99, #0a0514)`;
    art.innerHTML = src
      ? `<img src="${src}" alt="${title}">`
      : `<span class="ambient-tag">${tag}</span><span class="ambient-num">0${+item.dataset.index + 1}</span>`;
    box.showModal();
  });
  box.addEventListener('click', (e) => { if (e.target === box || e.target.closest('.lightbox-close')) box.close(); });

  // Attach click-to-load video behavior
  const playBtn = document.getElementById('btnPlayVideo');
  const slot = document.getElementById('videoPlaceholderSlot');
  const frame = document.getElementById('videoEmbedFrame');

  let started = false;
  let playing = false;
  let resumeOnReturn = false;
  const YT_ORIGIN = 'https://www.youtube-nocookie.com';
  let volumeSet = false;
  const ytCommand = (func, args = '') => frame.querySelector('iframe')?.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), YT_ORIGIN);

  const startTrailer = (muted) => {
    if (!slot || !frame || started || !gallery.trailerId) return;
    started = true;
    slot.hidden = true;
    frame.hidden = false;
    // annotations hidden, captions off; native YouTube controls stay on
    const params = `autoplay=1&mute=${muted ? 1 : 0}&enablejsapi=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&cc_load_policy=0`;
    frame.innerHTML = `
      <iframe src="${YT_ORIGIN}/embed/${gallery.trailerId}?${params}"
        title="Agnee'26 Trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
    `;
    // subscribe to player state so we know whether it is playing (1) or not
    frame.querySelector('iframe').addEventListener('load', () => {
      frame.querySelector('iframe').contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), YT_ORIGIN);
    });
  };

  window.addEventListener('message', (e) => {
    if (e.origin !== YT_ORIGIN) return;
    try {
      const data = JSON.parse(e.data);
      if (data.event !== 'infoDelivery') return;
      if (!volumeSet) { ytCommand('setVolume', [75]); volumeSet = true; } // default volume 75%
      if (data.info?.playerState !== undefined) playing = data.info.playerState === 1;
    } catch { /* not a YouTube state message */ }
  });

  playBtn?.addEventListener('click', () => startTrailer(false));

  // Whole player visible: autoplay or resume. Less than 70% visible: pause.
  // Sound is on only if the visitor has already clicked or tapped the page; browsers block autoplay with sound otherwise.
  const reel = mount.querySelector('.aftermovie-container');
  if (reel) new IntersectionObserver(([entry]) => {
    const ratio = entry.intersectionRatio;
    if (!started) { if (ratio >= 0.98) setTimeout(() => startTrailer(!navigator.userActivation?.hasBeenActive), 300); return; }
    if (ratio < 0.7 && playing) { ytCommand('pauseVideo'); resumeOnReturn = true; }
    else if (ratio >= 0.98 && resumeOnReturn) { ytCommand('playVideo'); resumeOnReturn = false; }
  }, { threshold: [0, 0.7, 0.98] }).observe(reel);
}

// One marquee row. The set is repeated an even number of times (long enough to fill wide screens)
// so the -50% loop animation is seamless.
function renderRow(items, key, dir) {
  if (!items.length) return '';
  const copies = Math.max(1, Math.ceil(2400 / (items.length * 298))) * 2;
  return `
    <div class="marquee-row ${dir}">
      <div class="marquee-track">
        ${Array.from({ length: copies }, (_, copy) => items.map((item, index) => `
          <figure class="gallery-item glass-panel" data-row="${key}" data-index="${index}" style="--accent: ${item.color}" ${copy ? 'aria-hidden="true"' : ''}>
            <div class="gallery-thumb-slot" style="background: linear-gradient(135deg, ${item.color}33, #0a0514)">
              ${item.src
                ? `<img class="gallery-photo" src="${item.src}" alt="${item.title}" loading="lazy" draggable="false">`
                : `<div class="thumb-ambient-art" aria-hidden="true">
                    <span class="ambient-tag">${item.tag}</span>
                    <span class="ambient-num">0${index + 1}</span>
                  </div>`}
              <button type="button" class="gallery-view" ${copy ? 'tabindex="-1"' : ''} aria-label="View ${item.title}">VIEW</button>
            </div>
          </figure>`).join('')).join('')}
      </div>
    </div>`;
}
