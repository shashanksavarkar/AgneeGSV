// Gallery and aftermovie showcase with privacy-friendly click-to-load video embed

export function renderGallery(gallery = { top: [], bottom: [] }) {
  const mount = document.getElementById('gallery-mount');
  if (!mount) return;

  mount.innerHTML = `
    <section class="section gallery-section" id="gallery" aria-labelledby="galleryHeading">
      <div class="container">
        <div class="section-header">
          <span class="section-kicker">MOMENTS & MEMORIES</span>
          <h2 class="section-title" id="galleryHeading">Festival Gallery & Aftermovie</h2>
        </div>

        <!-- Privacy-Friendly Click-to-Load Video Showcase -->
        <div class="aftermovie-container glass-panel">
          <div class="video-placeholder" id="videoPlaceholderSlot">
            <div class="video-overlay-content">
              <span class="video-badge">AFTERMOVIE REEL</span>
              <h3 class="video-title">Agnee Festival Experience Teaser</h3>
              <p class="video-desc">Click below to load the festival teaser. No external trackers or cookies are loaded until you play.</p>
              <button type="button" class="btn-play-video" id="btnPlayVideo" aria-label="Play festival teaser video">
                <span class="play-icon" aria-hidden="true">▶</span>
                <span class="play-text">Load & Watch Video</span>
              </button>
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
          <p class="lightbox-caption" id="lightboxCaption"></p>
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
    box.querySelector('#lightboxCaption').textContent = title;
    box.showModal();
  });
  box.addEventListener('click', (e) => { if (e.target === box || e.target.closest('.lightbox-close')) box.close(); });

  // Attach click-to-load video behavior
  const playBtn = document.getElementById('btnPlayVideo');
  const slot = document.getElementById('videoPlaceholderSlot');
  const frame = document.getElementById('videoEmbedFrame');

  playBtn?.addEventListener('click', () => {
    if (!slot || !frame) return;
    slot.hidden = true;
    frame.hidden = false;
    // Embed privacy-enhanced YouTube or placeholder video
    frame.innerHTML = `
      <iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1" 
        title="Agnee Festival Aftermovie" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        style="width: 100%; aspect-ratio: 16/9; border-radius: 16px; border: 0;"
      ></iframe>
    `;
  });
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
            <figcaption class="gallery-caption">
              <span class="item-tag">${item.tag}</span>
              <h4 class="item-title">${item.title}</h4>
            </figcaption>
          </figure>`).join('')).join('')}
      </div>
    </div>`;
}
