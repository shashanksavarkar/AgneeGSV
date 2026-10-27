// Gallery and aftermovie showcase with privacy-friendly click-to-load video embed

export function renderGallery(gallery = { photos: [] }) {
  const mount = document.getElementById('gallery-mount');
  if (!mount) return;

  const photos = gallery.photos;
  // videos[0] is the default (autoplays in the player); the rest sit in a stack below it. Falls back to the single trailerId.
  const videos = gallery.videos?.length ? gallery.videos : gallery.trailerId ? [{ id: gallery.trailerId, title: "Agnee'26 Trailer" }] : [];
  const flowItems = (list, render) => list.map((item, index) => `<figure class="gf-it" data-index="${index}" aria-label="${item.title}">${render(item)}</figure>`).join('');

  mount.innerHTML = `
    <section class="section gallery-section" id="gallery" aria-labelledby="galleryHeading">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" id="galleryHeading">Gallery</h2>
        </div>

        <!-- Privacy-Friendly Click-to-Load Video Showcase -->
        <div class="aftermovie-container glass-panel">
          <div class="video-placeholder" id="videoPlaceholderSlot"${videos[0]?.thumb ? ` style="background: linear-gradient(rgba(8, 4, 14, 0.35), rgba(8, 4, 14, 0.7)), url('${videos[0].thumb}') center / cover no-repeat"` : ''}>
            <div class="video-overlay-content">
              <button type="button" class="btn-play-video" id="btnPlayVideo" aria-label="Play festival teaser video">
                <span class="play-icon" aria-hidden="true">▶</span>
              </button>
              <h3 class="video-title">Agnee'26 Trailer</h3>
            </div>
          </div>
          <div class="video-embed-frame" id="videoEmbedFrame" hidden></div>
        </div>

        <!-- More videos: same coverflow as the photos; click the front one to play it in the player above -->
        ${videos.length > 1 ? `
        <div class="gf gf-video" id="videoFlow" tabindex="0" aria-roledescription="carousel" aria-label="More videos">
          ${flowItems(videos, (v) => `
            <div class="gv-card"${v.thumb ? ` style="background-image:url('${v.thumb}')"` : ''}>
              ${!v.thumb && v.src ? `<video class="gv-media" src="${v.src}#t=0.5" preload="metadata" muted playsinline></video>` : ''}
              <span class="gv-play" aria-hidden="true">&#9654;</span>
              <figcaption>${v.title}</figcaption>
            </div>`)}
        </div>` : ''}

        <!-- Coverflow: the front photo holds for 2.5 s, then the stack moves on, forever -->
        <div class="gf" tabindex="0" aria-roledescription="carousel" aria-label="Festival photos">
          ${flowItems(photos, (item) => `<img src="${item.src}" alt="${item.title}" loading="lazy" draggable="false">`)}
        </div>

        <dialog class="gallery-lightbox" id="galleryLightbox" aria-label="Gallery image">
          <button type="button" class="lightbox-close" aria-label="Close">✕</button>
          <div class="lightbox-art" id="lightboxArt"></div>
        </dialog>
      </div>
    </section>
  `;

  // Coverflow: click a side card to bring it forward, click the front one to act on it (onFront). auto = advance on a timer, looping
  const box = document.getElementById('galleryLightbox');
  const HOLD = 1500;
  function coverflow(flow, { auto, onFront }) {
    const items = [...flow.querySelectorAll('.gf-it')];
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
      if (auto) timer = setInterval(() => go(cur + 1), HOLD);
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
      onFront(index);
    });
  }

  coverflow(mount.querySelector('.gf:not(.gf-video)'), {
    auto: true,
    onFront: (index) => {
      const { title, src } = photos[index];
      const art = box.querySelector('#lightboxArt');
      art.style.background = '#000';
      art.innerHTML = `<img src="${src}" alt="${title}">`;
      box.showModal();
    }
  });
  box.addEventListener('click', (e) => {
    if (e.target === box || e.target.closest('.lightbox-close')) box.close();
  });

  // Attach click-to-load video behavior
  const playBtn = document.getElementById('btnPlayVideo');
  const slot = document.getElementById('videoPlaceholderSlot');
  const frame = document.getElementById('videoEmbedFrame');

  let started = false;
  let current = null;
  let playing = false;
  let resumeOnReturn = false;
  let startTimer = 0;
  const YT_ORIGIN = 'https://www.youtube-nocookie.com';
  let volumeSet = false;
  const ytCommand = (func, args = '') =>
    frame
      .querySelector('iframe')
      ?.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), YT_ORIGIN);

  const startTrailer = (muted, video = videos[0]) => {
    if (!slot || !frame || !video || (started && video === current)) return;
    started = true;
    current = video;
    playing = false;
    slot.hidden = true;
    frame.hidden = false;
    if (video.src) {
      // a video file from assets/: plain HTML5 player
      frame.innerHTML = `<video src="${video.src}" ${video.thumb ? `poster="${video.thumb}"` : ''} controls autoplay playsinline preload="metadata" title="${video.title}"></video>`;
      frame.querySelector('video').muted = muted;
      return;
    }
    // annotations hidden, captions off; native YouTube controls stay on
    const params = `autoplay=1&mute=${muted ? 1 : 0}&enablejsapi=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&cc_load_policy=0`;
    frame.innerHTML = `
      <iframe src="${YT_ORIGIN}/embed/${video.id}?${params}"
        title="${video.title}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
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
  if (videos[0]) mount.querySelector('.video-title').textContent = videos[0].title;

  const fileVideo = () => frame.querySelector('video');
  const isPlaying = () => (fileVideo() ? !fileVideo().paused : playing);
  const pauseCurrent = () => (fileVideo() ? fileVideo().pause() : ytCommand('pauseVideo'));
  const resumeCurrent = () => (fileVideo() ? fileVideo().play().catch(() => {}) : ytCommand('playVideo'));

  // Picking a video from the stack plays it in the player (the click is the gesture, so sound is allowed)
  const videoFlow = mount.querySelector('#videoFlow');
  if (videoFlow)
    coverflow(videoFlow, {
      auto: false,
      onFront: (index) => {
        startTrailer(false, videos[index]);
        mount.querySelector('.aftermovie-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

  // Whole player visible: autoplay or resume. Less than 70% visible: pause.
  // Sound is on only if the visitor has already clicked or tapped the page; browsers block autoplay with sound otherwise.
  const reel = mount.querySelector('.aftermovie-container');
  if (reel)
    new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        if (!started) {
          // wait 1.4 s after the player is fully on screen; scrolling away first cancels it
          clearTimeout(startTimer);
          if (ratio >= 0.98)
            startTimer = setTimeout(() => startTrailer(!navigator.userActivation?.hasBeenActive), 1400);
          return;
        }
        if (ratio < 0.7 && isPlaying()) {
          pauseCurrent();
          resumeOnReturn = true;
        } else if (ratio >= 0.98 && resumeOnReturn) {
          resumeCurrent();
          resumeOnReturn = false;
        }
      },
      { threshold: [0, 0.7, 0.98] }
    ).observe(reel);
}
