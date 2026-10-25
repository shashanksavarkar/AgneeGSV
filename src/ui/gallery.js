// Gallery and aftermovie showcase with privacy-friendly click-to-load video embed

export function renderGallery(gallery = { photos: [] }) {
  const mount = document.getElementById('gallery-mount');
  if (!mount) return;

  const photos = gallery.photos;

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

        <!-- Coverflow: the front photo holds for 2.5 s, then the stack moves on, forever -->
        <div class="gf" tabindex="0" aria-roledescription="carousel" aria-label="Festival photos">
          ${photos
            .map(
              (item, index) => `
            <figure class="gf-it" data-index="${index}" aria-label="${item.title}">
              <img src="${item.src}" alt="${item.title}" loading="lazy" draggable="false">
            </figure>`
            )
            .join('')}
        </div>

        <dialog class="gallery-lightbox" id="galleryLightbox" aria-label="Gallery image">
          <button type="button" class="lightbox-close" aria-label="Close">✕</button>
          <div class="lightbox-art" id="lightboxArt"></div>
        </dialog>
      </div>
    </section>
  `;

  // Coverflow: auto-advance every 2.5 s (looping), click a side photo to bring it forward, click the front one to enlarge it
  const box = document.getElementById('galleryLightbox');
  const flow = mount.querySelector('.gf');
  const items = [...flow.querySelectorAll('.gf-it')];
  const HOLD = 1500;
  let cur = 0;
  let timer;

  const paint = () =>
    items.forEach((it, i) => {
      const n = items.length;
      const d = ((i - cur + n + n / 2) % n) - n / 2; // shortest signed distance, so the stack wraps around
      const a = Math.abs(d);
      it.style.transform = `translateX(${d * 52}%) translateZ(${-a * 150}px) rotateY(${Math.max(-60, Math.min(60, -d * 42))}deg)`;
      it.style.zIndex = 20 - Math.round(a);
      it.style.opacity = a > 3 ? 0 : 1 - a * 0.14;
      it.style.filter = `brightness(${1 - Math.min(a, 3) * 0.22})`;
      it.style.pointerEvents = a > 3 ? 'none' : 'auto';
    });
  const go = (i) => {
    cur = (i + items.length) % items.length;
    paint();
  };
  const play = () => {
    clearInterval(timer);
    timer = setInterval(() => go(cur + 1), HOLD);
  };

  paint();
  play();
  flow.addEventListener('mouseenter', () => clearInterval(timer));
  flow.addEventListener('mouseleave', play);
  flow.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(cur - 1);
    if (e.key === 'ArrowRight') go(cur + 1);
  });

  let x0 = null;
  flow.addEventListener('pointerdown', (e) => {
    x0 = e.clientX;
  });
  flow.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) {
      go(cur + (dx < 0 ? 1 : -1));
      play();
    }
  });

  flow.addEventListener('click', (e) => {
    const item = e.target.closest('.gf-it');
    if (!item) return;
    const index = +item.dataset.index;
    if (index !== cur) {
      go(index);
      play();
      return;
    }
    const { title, src } = photos[index];
    const art = box.querySelector('#lightboxArt');
    art.style.background = '#000';
    art.innerHTML = `<img src="${src}" alt="${title}">`;
    box.showModal();
  });
  box.addEventListener('click', (e) => {
    if (e.target === box || e.target.closest('.lightbox-close')) box.close();
  });

  // Attach click-to-load video behavior
  const playBtn = document.getElementById('btnPlayVideo');
  const slot = document.getElementById('videoPlaceholderSlot');
  const frame = document.getElementById('videoEmbedFrame');

  let started = false;
  let playing = false;
  let resumeOnReturn = false;
  const YT_ORIGIN = 'https://www.youtube-nocookie.com';
  let volumeSet = false;
  const ytCommand = (func, args = '') =>
    frame
      .querySelector('iframe')
      ?.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), YT_ORIGIN);

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
      frame
        .querySelector('iframe')
        .contentWindow.postMessage(
          JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
          YT_ORIGIN
        );
    });
  };

  window.addEventListener('message', (e) => {
    if (e.origin !== YT_ORIGIN) return;
    try {
      const data = JSON.parse(e.data);
      if (data.event !== 'infoDelivery') return;
      if (!volumeSet) {
        ytCommand('setVolume', [75]);
        volumeSet = true;
      } // default volume 75%
      if (data.info?.playerState !== undefined) playing = data.info.playerState === 1;
    } catch {
      /* not a YouTube state message */
    }
  });

  playBtn?.addEventListener('click', () => startTrailer(false));

  // Whole player visible: autoplay or resume. Less than 70% visible: pause.
  // Sound is on only if the visitor has already clicked or tapped the page; browsers block autoplay with sound otherwise.
  const reel = mount.querySelector('.aftermovie-container');
  if (reel)
    new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        if (!started) {
          if (ratio >= 0.98)
            setTimeout(() => startTrailer(!navigator.userActivation?.hasBeenActive), 300);
          return;
        }
        if (ratio < 0.7 && playing) {
          ytCommand('pauseVideo');
          resumeOnReturn = true;
        } else if (ratio >= 0.98 && resumeOnReturn) {
          ytCommand('playVideo');
          resumeOnReturn = false;
        }
      },
      { threshold: [0, 0.7, 0.98] }
    ).observe(reel);
}
