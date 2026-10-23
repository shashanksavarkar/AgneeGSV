// Merchandise section: product cards. Data: merch in data/data.js

const buyButton = (item) => item.buyUrl
  ? `<a class="merch-buy" href="${item.buyUrl}" target="_blank" rel="noopener noreferrer">Buy now <span aria-hidden="true">→</span></a>`
  : `<button type="button" class="merch-buy" disabled>Sales open soon</button>`;

const artMarkup = (item) => item.image
  ? `<img src="${item.image}" alt="${item.name}" loading="lazy">`
  : `<span class="merch-ph" aria-hidden="true">AGNEE'26</span>`;

export function renderMerch(items = []) {
  const mount = document.getElementById('merch-mount');
  if (!mount || items.length === 0) return;

  mount.innerHTML = `
    <section class="section merch-section" id="merch" aria-labelledby="merchHeading">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title" id="merchHeading">Official Merchandise</h2>
        </div>

        <div class="merch-grid">
          ${items.map(item => `
            <article class="merch-card" data-id="${item.id}">
              <button type="button" class="merch-img merch-open" aria-label="View ${item.name}">
                ${artMarkup(item)}
                <span class="merch-badge">${item.state}</span>
              </button>
              <div class="merch-info">
                <h3 class="merch-name">${item.name}</h3>
                <span class="merch-price">${item.price}</span>
                ${buyButton(item)}
              </div>
            </article>
          `).join('')}
        </div>

        <dialog class="merch-modal" id="merchModal" aria-label="Merchandise details">
          <button type="button" class="merch-modal-close" aria-label="Close">&times;</button>
          <div class="merch-modal-body"></div>
        </dialog>
      </div>
    </section>
  `;

  // Click a card (anywhere except its buy button) to open it in a modal
  const modal = mount.querySelector('#merchModal');
  const body = modal.querySelector('.merch-modal-body');
  mount.querySelector('.merch-grid').addEventListener('click', (e) => {
    if (e.target.closest('.merch-buy')) return;
    const card = e.target.closest('.merch-card');
    const item = card && items.find(i => i.id === card.dataset.id);
    if (!item) return;
    body.innerHTML = `
      <div class="merch-modal-art">${artMarkup(item)}</div>
      <div class="merch-modal-info">
        <span class="merch-badge">${item.state}</span>
        <h3 class="merch-modal-name">${item.name}</h3>
        <span class="merch-price">${item.price}</span>
        ${buyButton(item)}
      </div>`;
    modal.showModal();
  });
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('.merch-modal-close')) modal.close(); });
}
