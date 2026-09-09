import { gsap } from './scroll';
const labels: Record<string, string> = { play: 'play', open: 'open', copy: 'copy' };
export function initCursor() {
  const el = document.querySelector<HTMLElement>('.cursor'); if (!el) return;
  const label = el.querySelector<HTMLElement>('.cursor__label')!;
  const xTo = gsap.quickTo(el, 'x', { duration: 0.15, ease: 'power3' }), yTo = gsap.quickTo(el, 'y', { duration: 0.15, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; xTo(e.clientX); yTo(e.clientY); el.classList.add('is-on'); }, { passive: true });
  window.addEventListener('pointerdown', () => el.classList.add('is-down'));
  window.addEventListener('pointerup', () => el.classList.remove('is-down'));
  document.addEventListener('pointerover', (e) => {
    const t = (e.target as Element).closest<HTMLElement>('a, button, [data-cursor]');
    const state = t?.dataset.cursor ?? (t ? 'link' : '');
    el.dataset.state = state; label.textContent = labels[state] ?? '';
  });
  document.addEventListener('pointerleave', () => el.classList.remove('is-on'));
  document.addEventListener('pointerenter', () => el.classList.add('is-on'));
}
