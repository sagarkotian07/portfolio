import { q, qa } from './prefs';
import { about } from '../content';

// Where each polaroid sits on the wall (percent of the wall, degrees), first twelve slots. Later ones cycle.
const SLOTS = [[4, 6, -6], [40, 2, 4], [70, 10, -3], [16, 40, 5], [52, 36, -5], [74, 52, 6], [6, 66, 3], [38, 64, -4], [66, 78, 2], [28, 18, 7], [60, 60, -7], [10, 82, 4]];

/** The polaroid wall: pinned prints you can drag around on a laptop, filter by tag, and open big. */
export function initAbout() {
  const wall = q('#wall'), polaroids = qa<HTMLElement>('.polaroid', wall);
  polaroids.forEach((el, i) => { const [x, y, r] = SLOTS[i % SLOTS.length]; el.style.setProperty('--x', `${x}%`); el.style.setProperty('--y', `${y}%`); el.style.setProperty('--r', `${r}deg`); });

  // tags
  qa<HTMLButtonElement>('.tag').forEach((btn) => btn.addEventListener('click', () => {
    qa<HTMLButtonElement>('.tag').forEach((b) => { b.classList.toggle('is-on', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    const tag = btn.dataset.tag;
    polaroids.forEach((el) => el.classList.toggle('is-hidden', tag !== 'all' && el.dataset.tag !== tag));
  }));

  // drag on fine pointers; a tap without a drag opens the lightbox
  let z = 10;
  const fine = matchMedia('(pointer: fine) and (min-width: 900px)').matches;
  polaroids.forEach((el) => {
    let sx = 0, sy = 0, ox = 0, oy = 0, moved = false, active = false, onOpen = false, suppress = false;
    el.addEventListener('pointerdown', (e) => {
      if (!fine || e.button !== 0) return;
      active = true; moved = false; sx = e.clientX; sy = e.clientY; onOpen = !!(e.target as Element).closest('.polaroid__open');
      const r = el.getBoundingClientRect(), w = wall.getBoundingClientRect();
      ox = r.left - w.left + (r.width - el.offsetWidth) / 2; oy = r.top - w.top + (r.height - el.offsetHeight) / 2;
      el.setPointerCapture(e.pointerId); el.style.zIndex = String(++z);
    });
    el.addEventListener('pointermove', (e) => {
      if (!active) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true; el.classList.add('is-dragging');
      el.style.left = `${ox + dx}px`; el.style.top = `${oy + dy}px`;
    });
    const end = () => { if (!active) return; active = false; el.classList.remove('is-dragging'); };
    // with pointer capture the click lands on the figure, so a tap on the photo opens from pointerup; the button keeps keyboard access
    el.addEventListener('pointerup', () => { const tap = active && !moved && onOpen; end(); if (tap) { open(Number(el.dataset.i)); suppress = true; setTimeout(() => (suppress = false), 0); } });
    el.addEventListener('pointercancel', end);
    el.querySelector<HTMLButtonElement>('.polaroid__open')!.addEventListener('click', () => { if (!suppress && !moved) open(Number(el.dataset.i)); });
    const v = el.querySelector<HTMLVideoElement>('.polaroid__video');
    if (v) {
      v.addEventListener('error', () => el.classList.add('is-missing'));
      el.addEventListener('pointerenter', () => { v.play().catch(() => {}); });
      el.addEventListener('pointerleave', () => v.pause());
    }
  });

  // lightbox
  const dlg = q<HTMLDialogElement>('#lightbox'), media = q('#lightbox-media'), cap = q('#lightbox-cap');
  let cur = 0;
  const show = (i: number) => {
    cur = (i + about.photos.length) % about.photos.length;
    const ph = about.photos[cur];
    const src = ph.kind === 'image' ? (qa<HTMLImageElement>('img', polaroids[cur])[0]?.currentSrc || qa<HTMLImageElement>('img', polaroids[cur])[0]?.src) : ph.src!;
    media.innerHTML = ph.kind === 'image' ? `<img src="${src}" alt="${ph.alt.replace(/"/g, '&quot;')}">` : `<video src="${src}" controls autoplay playsinline loop aria-label="${ph.alt.replace(/"/g, '&quot;')}"></video>`;
    cap.textContent = ph.caption;
  };
  const open = (i: number) => { show(i); if (!dlg.open) dlg.showModal(); };
  q('#lightbox-prev').addEventListener('click', () => show(cur - 1));
  q('#lightbox-next').addEventListener('click', () => show(cur + 1));
  q('#lightbox-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { media.innerHTML = ''; });
  dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
}
