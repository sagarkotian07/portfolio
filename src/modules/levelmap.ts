import { gsap, ScrollTrigger } from './scroll';
import { q, qa } from './prefs';
export function initLevelMap() {
  const map = q('#levelmap'), path = map.querySelector<SVGPathElement>('.levelmap__path')!, levels = qa('.level', map);
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: map, start: 'top 80%', end: 'top 30%', scrub: 0.5 } });
    levels.forEach((lv, i) => ScrollTrigger.create({ trigger: lv, start: 'top 88%', once: true, onEnter: () => setTimeout(() => lv.classList.add('is-in'), i * 120) }));
  });
  mm.add('(prefers-reduced-motion: reduce)', () => { levels.forEach((lv) => lv.classList.add('is-in')); });
}
