// Native <dialog> holding a <video> that only exists while open.
import { gsap, lenis } from './scroll';
import { q, reducedMotion } from './prefs';

let dialog: HTMLDialogElement, frame: HTMLElement, opener: HTMLElement | null = null;

export function initLightbox() {
  dialog = q<HTMLDialogElement>('#lightbox');
  frame = q('#lightbox-frame');
  q('.lightbox__close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    frame.querySelector('video')?.pause();
    frame.replaceChildren();
    lenis?.start();
    opener?.focus();
  });
}

export function openVideo(src: string, title: string, from?: HTMLElement) {
  opener = from ?? null;
  const video = document.createElement('video');
  video.src = src;
  video.controls = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('aria-label', title);
  frame.replaceChildren(video);
  lenis?.stop();
  dialog.showModal();
  if (!reducedMotion) video.play().catch(() => {});
  if (!reducedMotion) gsap.from(dialog.firstElementChild, { y: 26, opacity: 0, duration: 0.4, ease: 'power3.out' });
}
