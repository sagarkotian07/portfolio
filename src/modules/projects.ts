// Card tilt on fine pointers and play buttons wired to the lightbox.
import { gsap } from './scroll';
import { qa, richHero } from './prefs';
import { openVideo } from './lightbox';

export function initProjects() {
  qa<HTMLButtonElement>('.play').forEach((btn) => {
    btn.addEventListener('click', () => openVideo(btn.dataset.video!, btn.dataset.title ?? 'Demo', btn));
  });

  if (!richHero) return;

  // muted preview while the pointer rests on a demo card
  qa<HTMLElement>('.card__media--video').forEach((media) => {
    const video = media.querySelector<HTMLVideoElement>('.card__preview');
    if (!video) return;
    let timer = 0;
    media.addEventListener('pointerenter', () => {
      timer = window.setTimeout(() => {
        if (!video.src) video.src = video.dataset.src ?? '';
        video.currentTime = 0;
        video.play().then(() => media.classList.add('is-previewing')).catch(() => {});
      }, 180);
    });
    media.addEventListener('pointerleave', () => {
      clearTimeout(timer);
      video.pause();
      media.classList.remove('is-previewing');
    });
  });

  qa('[data-tilt]').forEach((card) => {
    gsap.set(card, { transformPerspective: 900 });
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
    card.addEventListener('pointerenter', () => card.classList.add('is-hot'));
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 9); rx(-py * 7);
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); setTimeout(() => card.classList.remove('is-hot'), 600); });
  });
}
