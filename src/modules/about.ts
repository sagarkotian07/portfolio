import { q, qa } from './prefs';
import { about } from '../content';

/** Five fixed prints, black and white until someone looks at them, plus a lightbox for the big version. */
export function initAbout() {
  const wall = q('#wall'), lines = q('#about-lines'), polaroids = qa<HTMLElement>('.polaroid', wall);

  // the marker marks draw themselves once, when the story scrolls in
  new IntersectionObserver((entries, io) => { if (entries.some((e) => e.isIntersecting)) { lines.classList.add('is-drawn'); io.disconnect(); } }, { threshold: 0.6 }).observe(lines);

  // touch screens have no hover: a print comes into colour while it sits in the middle of the screen
  if (!matchMedia('(hover: hover)').matches) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-color', e.isIntersecting)), { rootMargin: '-35% 0px -35% 0px' });
    polaroids.forEach((el) => io.observe(el));
  }

  // lightbox, always in colour, largest version of the photo
  const dlg = q<HTMLDialogElement>('#lightbox'), media = q('#lightbox-media'), cap = q('#lightbox-cap');
  let cur = 0;
  const show = (i: number) => {
    cur = (i + about.photos.length) % about.photos.length;
    const ph = about.photos[cur];
    media.innerHTML = `<img src="/img/${ph.key}.jpg" alt="${ph.alt.replace(/"/g, '&quot;')}">`;
    cap.textContent = ph.caption;
  };
  const open = (i: number) => { show(i); if (!dlg.open) dlg.showModal(); };
  polaroids.forEach((el) => el.querySelector<HTMLButtonElement>('.polaroid__open')!.addEventListener('click', () => open(Number(el.dataset.i))));
  q('#lightbox-prev').addEventListener('click', () => show(cur - 1));
  q('#lightbox-next').addEventListener('click', () => show(cur + 1));
  q('#lightbox-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { media.innerHTML = ''; });
  dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
}
