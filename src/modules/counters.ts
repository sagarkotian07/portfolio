// Count-ups when the numbers scroll in, with a small paper burst when each one lands.
import { gsap, ScrollTrigger } from './scroll';
import { qa } from './prefs';

const TONES = ['var(--note-yellow)', 'var(--note-pink)', 'var(--note-blue)', 'var(--note-green)', 'var(--leaf)'];

function burst(host: HTMLElement) {
  const rect = host.getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('i');
    s.className = 'paper';
    s.style.background = TONES[i % TONES.length];
    s.style.left = `${rect.width * 0.35}px`;
    s.style.top = '12px';
    host.appendChild(s);
    gsap.to(s, {
      x: gsap.utils.random(-110, 110), y: gsap.utils.random(-130, 40), rotation: gsap.utils.random(-200, 200),
      opacity: 0, duration: gsap.utils.random(0.7, 1.1), ease: 'power2.out', onComplete: () => s.remove(),
    });
  }
}

export function initCounters() {
  const fmt = new Intl.NumberFormat('en-IN');
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    qa('.counter__value').forEach((el) => {
      const value = Number(el.dataset.value), from = Number(el.dataset.from ?? 0);
      const prefix = el.dataset.prefix ?? '', suffix = el.dataset.suffix ?? '';
      const o = { v: from };
      el.textContent = prefix + fmt.format(from) + suffix;
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => gsap.to(o, {
          v: value, duration: 1.5, ease: 'power2.out', snap: { v: 1 },
          onUpdate: () => (el.textContent = prefix + fmt.format(o.v) + suffix),
          onComplete: () => burst(el.parentElement as HTMLElement),
        }),
      });
    });
  });
}
