// Line-mask text reveals. Splits after fonts are ready, restores plain text once revealed.
import { gsap } from './scroll';
import { qa } from './prefs';

/** Wrap each visual line in .line > .line-inner. Screen readers get the original string via aria-label. */
export function splitLines(el: HTMLElement): HTMLElement[] {
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', text);
  const words = text.split(' ');
  el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
  const spans = qa<HTMLSpanElement>('.w', el);
  const lines: string[][] = [];
  let lastTop = Number.NEGATIVE_INFINITY;
  for (const s of spans) {
    const top = s.offsetTop;
    if (Math.abs(top - lastTop) > 2) { lines.push([]); lastTop = top; }
    lines[lines.length - 1].push(s.textContent ?? '');
  }
  el.innerHTML = lines
    .map((ws) => `<span class="line" aria-hidden="true"><span class="line-inner">${ws.join(' ')}</span></span>`)
    .join('');
  return qa('.line-inner', el);
}

function restore(el: HTMLElement) {
  const text = el.getAttribute('aria-label');
  if (text != null) { el.textContent = text; el.removeAttribute('aria-label'); }
}

export function initReveals() {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    qa('[data-reveal]').forEach((el) => {
      const lines = splitLines(el);
      gsap.from(lines, {
        yPercent: 110, duration: 0.9, ease: 'power3.out', stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        onComplete: () => restore(el),
      });
    });
    qa('[data-fade]').forEach((el) => {
      gsap.from(el, { y: 26, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
  });
}
