// Native <dialog> holding a youtube-nocookie iframe that only exists while open.
import { gsap, lenis } from './scroll';
import { q, reducedMotion } from './prefs';

let dialog: HTMLDialogElement, frame: HTMLElement, opener: HTMLElement | null = null;

export function initLightbox() {
  dialog = q<HTMLDialogElement>('#lightbox');
  frame = q('#lightbox-frame');
  q('.lightbox__close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    frame.replaceChildren();
    lenis?.start();
    opener?.focus();
  });
}

export function openVideo(id: string, title: string, from?: HTMLElement) {
  opener = from ?? null;
  const iframe = document.createElement('iframe');
  const params = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
  if (!reducedMotion) params.set('autoplay', '1');
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?${params}`;
  iframe.title = title;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.replaceChildren(iframe);
  lenis?.stop();
  dialog.showModal();
  if (!reducedMotion) gsap.from(dialog.firstElementChild, { y: 26, opacity: 0, duration: 0.4, ease: 'power3.out' });
}
