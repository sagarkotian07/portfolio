import { gsap } from './scroll';

export function initCursor() {
  const el = document.querySelector<HTMLElement>('.cursor');
  if (!el) return;
  const label = el.querySelector<HTMLElement>('.cursor__label')!;
  const xTo = gsap.quickTo(el, 'x', { duration: 0.16, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.16, ease: 'power3' });
  const labels: Record<string, string> = { drag: 'drag', play: 'play', fan: 'hover', copy: 'copy', grabbing: '' };

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    xTo(e.clientX); yTo(e.clientY);
    if (!el.classList.contains('is-on')) el.classList.add('is-on');
  }, { passive: true });

  document.addEventListener('pointerover', (e) => {
    if (el.dataset.state === 'grabbing') return;
    const t = (e.target as Element).closest<HTMLElement>('a, button, .note, [data-cursor]');
    const state = t?.dataset.cursor ?? (t ? 'link' : '');
    el.dataset.state = state;
    label.textContent = labels[state] ?? '';
  });
  document.addEventListener('pointerleave', () => el.classList.remove('is-on'));
  document.addEventListener('pointerenter', () => el.classList.add('is-on'));
}

export function setCursorState(state: string) {
  const el = document.querySelector<HTMLElement>('.cursor');
  if (!el) return;
  el.dataset.state = state;
  const label = el.querySelector<HTMLElement>('.cursor__label');
  if (label) label.textContent = state === 'drag' ? 'drag' : '';
}
