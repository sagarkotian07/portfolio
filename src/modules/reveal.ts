import { gsap, ScrollTrigger } from './scroll';
import { qa } from './prefs';

function splitLines(el: HTMLElement) {
  const html = el.innerHTML;
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (!html.includes('<br')) {
    el.dataset.text = text;
    const words = text.split(' ');
    el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
    const spans = qa<HTMLSpanElement>('.w', el);
    const lines: string[][] = []; let last = -1e9;
    for (const s of spans) { if (Math.abs(s.offsetTop - last) > 2) { lines.push([]); last = s.offsetTop; } lines[lines.length - 1].push(s.textContent ?? ''); }
    el.innerHTML = `<span class="sr-only">${text}</span>` + lines.map((ws) => `<span class="line" aria-hidden="true"><span class="line-inner">${ws.join(' ')}</span></span>`).join('');
  } else {
    // explicit <br> lines: keep them
    el.dataset.text = html;
    el.innerHTML = `<span class="sr-only">${text}</span>` + html.split(/<br\s*\/?>/i).map((l) => `<span class="line" aria-hidden="true"><span class="line-inner">${l.trim()}</span></span>`).join('');
  }
  return qa('.line-inner', el);
}

export function initReveals() {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    qa('[data-reveal]').forEach((el) => {
      const lines = splitLines(el);
      gsap.from(lines, { yPercent: 108, duration: 1, ease: 'power4.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    qa('[data-clip]').forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => el.classList.add('is-in') });
    });
    qa<HTMLImageElement>('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('picture') ?? img, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });
  });
  mm.add('(prefers-reduced-motion: reduce)', () => { qa('[data-clip]').forEach((el) => el.classList.add('is-in')); });
}
