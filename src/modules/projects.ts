// Card tilt on fine pointers and play buttons wired to the lightbox.
import { gsap } from './scroll';
import { qa, richHero } from './prefs';
import { openVideo } from './lightbox';

export function initProjects() {
  qa<HTMLButtonElement>('.play').forEach((btn) => {
    btn.addEventListener('click', () => openVideo(btn.dataset.video!, btn.dataset.title ?? 'Demo', btn));
  });

  if (!richHero) return;
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
