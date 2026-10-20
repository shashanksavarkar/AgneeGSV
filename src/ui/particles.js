// Decorative particle layers: falling marigold petals ("petals") or rising diya sparks ("sparks").
// Positions are spread deterministically so the markup is stable between renders.

export function particleField(kind, count = 12) {
  const items = Array.from({ length: count }, (_, i) => {
    const x = (i * 37 + 11) % 97;
    const s = kind === 'petals' ? 14 + ((i * 7) % 12) : 10 + ((i * 5) % 12);
    const t = 9 + ((i * 3) % 8);
    const d = -((i * 5) % 13);
    const dx = ((i % 2 ? 1 : -1) * (40 + ((i * 13) % 90)));
    return `<i style="--x:${x}%;--s:${s}px;--t:${t}s;--d:${d}s;--dx:${dx}px"></i>`;
  });
  return `<div class="fx-field fx-${kind}" aria-hidden="true">${items.join('')}</div>`;
}
