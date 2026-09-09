// A line that draws itself through the three stops as you scroll. The path is built from the
// markers' real positions, so it survives any layout, and pathLength="1" keeps the draw math trivial.
import { gsap, ScrollTrigger } from './scroll';
import { q, qa } from './prefs';

export function initTimeline() {
  const wrap = q('#timeline');
  const svg = q<HTMLElement>('.timeline__svg', wrap) as unknown as SVGSVGElement;
  const path = svg.querySelector('path')!;
  const stops = qa('.stop', wrap);
  const markers = qa('.stop__marker', wrap);

  function build() {
    const wr = wrap.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${Math.max(1, wr.width)} ${Math.max(1, wr.height)}`);
    const pts = markers.map((m) => {
      const r = m.getBoundingClientRect();
      return { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 };
    });
    if (!pts.length) return;
    const f = (n: number) => n.toFixed(1);
    let d = `M ${f(pts[0].x + 6)} ${f(pts[0].y - 90)} C ${f(pts[0].x - 26)} ${f(pts[0].y - 60)}, ${f(pts[0].x + 18)} ${f(pts[0].y - 28)}, ${f(pts[0].x)} ${f(pts[0].y)}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const dy = b.y - a.y;
      const side = i % 2 ? 1 : -1;
      const bulge = side * Math.min(160, Math.abs(b.x - a.x) * 0.5 + 70);
      d += ` C ${f(a.x + bulge)} ${f(a.y + dy * 0.38)}, ${f(b.x - bulge * 0.7)} ${f(b.y - dy * 0.34)}, ${f(b.x)} ${f(b.y)}`;
    }
    const l = pts[pts.length - 1];
    d += ` C ${f(l.x + 40)} ${f(l.y + 50)}, ${f(l.x - 46)} ${f(l.y + 96)}, ${f(l.x + 14)} ${f(l.y + 140)}`;
    path.setAttribute('d', d);
  }

  build();
  document.fonts.ready.then(build);
  window.addEventListener('load', build, { once: true });
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = window.setTimeout(() => { build(); ScrollTrigger.refresh(); }, 150); });

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(path, { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top 70%', end: 'bottom 85%', scrub: 0.6 },
    });
    stops.forEach((stop) => ScrollTrigger.create({ trigger: stop, start: 'top 80%', once: true, onEnter: () => stop.classList.add('is-on') }));
  });
}
