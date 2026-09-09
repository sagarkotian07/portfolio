import { gsap, ScrollTrigger } from './scroll';
import { q, qa } from './prefs';

/** The ball rolls along the hill path from the first card to the last as the page scrolls through the map. */
export function initLevelMap() {
  const map = q('#levelmap'), svg = map.querySelector<SVGSVGElement>('.levelmap__svg')!, path = map.querySelector<SVGPathElement>('.levelmap__path')!, ball = map.querySelector<HTMLElement>('.levelmap__ball')!, levels = qa('.level', map);
  const len = path.getTotalLength(), R = 22;
  const place = (p: number) => {
    const r = svg.getBoundingClientRect(); if (!r.width) return;
    const sx = r.width / 1200, sy = r.height / 260;
    const pt = path.getPointAtLength(Math.max(0, Math.min(1, p)) * len);
    const x = pt.x * sx, y = pt.y * sy;
    ball.style.left = `${x - R}px`; ball.style.top = `${y - R * 2 + 4}px`; // left/top, because the bob animation owns transform
  };
  place(0);
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // one scrubbed trigger drives both the ball and the line, so the line always runs just ahead of the ball
    const state = { p: 0 };
    const apply = () => { place(state.p); path.style.strokeDashoffset = String(Math.max(0, 1 - state.p - 0.06)); };
    const st = ScrollTrigger.create({ trigger: map, start: 'top 85%', end: 'bottom 15%', onUpdate: (self) => { gsap.to(state, { p: self.progress, duration: 0.5, ease: 'power2.out', overwrite: true, onUpdate: apply }); } });
    levels.forEach((lv, i) => ScrollTrigger.create({ trigger: lv, start: 'top 88%', once: true, onEnter: () => setTimeout(() => lv.classList.add('is-in'), i * 120) }));
    const onResize = () => { state.p = st.progress; apply(); }; window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });
  mm.add('(prefers-reduced-motion: reduce)', () => { levels.forEach((lv) => lv.classList.add('is-in')); place(0); });
}
