import { gsap } from './scroll';
import { q, qa, reducedMotion } from './prefs';
import { mountIdle } from '../game/idle';

export function initHero(onPlay: () => void) {
  const hero = q('.hero'), words = qa('.hero__word'), meta = q('#hero-meta'), tag = q('#hero-tag'), cta = q('.hero__cta'), hint = q('#hero-hint'), hoop = q('.hoop');
  if (!reducedMotion) mountIdle(q<HTMLCanvasElement>('#hero-idle'));
  hint.addEventListener('click', onPlay);
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.target !== document.body || document.documentElement.classList.contains('is-playing')) return;
    if (hero.getBoundingClientRect().bottom > window.innerHeight * 0.5) { e.preventDefault(); onPlay(); }
  });
  if (reducedMotion) return;
  gsap.set(words, { yPercent: 110 });
  gsap.set([meta, tag, cta, hint], { opacity: 0, y: 12 });
  gsap.set(hoop, { scale: 0.55 });
  return () => {
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .to(words, { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.05)
      .to(hoop, { scale: 1, duration: 1, ease: 'back.out(1.7)' }, 0.25)
      .to(meta, { opacity: 1, y: 0, duration: 0.6 }, 0.4)
      .to(tag, { opacity: 1, y: 0, duration: 0.7 }, 0.55)
      .to(cta, { opacity: 1, y: 0, duration: 0.6 }, 0.75)
      .to(hint, { opacity: 1, y: 0, duration: 0.6 }, 1.0);
  };
}
