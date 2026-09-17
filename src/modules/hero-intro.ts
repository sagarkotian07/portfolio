import { gsap } from './scroll';
import { q, qa, reducedMotion, whenTouch } from './prefs';
import { mountIdle } from '../game/idle';
import { hero as copy } from '../content';

export function initHero(onPlay: () => void) {
  const hero = q('.hero'), words = qa('.hero__word'), quote = q('#hero-quote'), tag = q('#hero-tag'), hint = q('#hero-hint'), portrait = q('.portrait');
  if (!reducedMotion) mountIdle(q<HTMLCanvasElement>('#hero-idle'));
  hint.addEventListener('click', onPlay);
  whenTouch(() => { hint.textContent = copy.hintTouch; });
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.target !== document.body || document.documentElement.classList.contains('is-playing')) return;
    if (hero.getBoundingClientRect().bottom > window.innerHeight * 0.5) { e.preventDefault(); onPlay(); }
  });
  if (reducedMotion) return;
  gsap.set(words, { yPercent: 110 });
  gsap.set([quote, tag, hint], { opacity: 0, y: 12 });
  gsap.set(portrait, { scale: 0.94, opacity: 0 });
  return () => {
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .to(words, { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.05)
      .to(portrait, { scale: 1, opacity: 1, duration: 1.1 }, 0.3)
      .to(quote, { opacity: 1, y: 0, duration: 0.6 }, 0.4)
      .to(tag, { opacity: 1, y: 0, duration: 0.7 }, 0.55)
      .to(hint, { opacity: 1, y: 0, duration: 0.6 }, 0.8);
  };
}
