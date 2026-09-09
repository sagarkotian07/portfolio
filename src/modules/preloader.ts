import { gsap, lenis } from './scroll';
import { q, qa } from './prefs';
import { preloaderDrop } from '../game/idle';

export function runPreloader(): Promise<void> {
  const root = document.documentElement, pre = q('#preloader');
  if (root.dataset.preload !== 'show') { pre.hidden = true; return Promise.resolve(); }
  try { sessionStorage.setItem('seen', '1'); } catch {}
  lenis?.stop();
  const rings = qa('#pre-rings i');
  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      gsap.to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'power4.inOut', onStart: resolve, onComplete: () => { stop(); pre.hidden = true; root.dataset.preload = 'skip'; lenis?.start(); } });
    };
    const stop = preloaderDrop(q<HTMLCanvasElement>('#pre-canvas'), (n) => { rings[n - 1]?.classList.add('is-on'); if (n >= 3) setTimeout(finish, 350); });
    setTimeout(finish, 2200);
  });
}
