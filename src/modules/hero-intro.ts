// Page-load choreography for the hero, then hands off to the notes (physics or static bounce).
import { gsap } from './scroll';
import { q, qa, richHero, reducedMotion } from './prefs';

function splitChars(word: HTMLElement) {
  const text = word.textContent ?? '';
  word.setAttribute('aria-hidden', 'true');
  word.innerHTML = [...text].map((c) => `<span class="ch-mask"><span class="ch">${c}</span></span>`).join('');
  return qa('.ch', word);
}

export function initHeroIntro(onNotes: () => void) {
  const name = q('.hero__name');
  const words = qa('.hero__name .word');
  const tagline = qa('.hero__tagline .line-inner');
  const meta = q('.hero__meta');
  const cta = q('.hero__cta');
  const hint = qa('.hero__hint');
  const photo = q('.hero__photo-wrap');
  const notes = qa('.note');

  const heroEl = q('.hero');
  if (reducedMotion) { heroEl.classList.add('is-ready'); onNotes(); return; }

  // keep the accessible name on the h1 itself
  name.setAttribute('aria-label', words.map((w) => w.textContent).join(' '));

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  if (richHero) {
    const chars = words.flatMap(splitChars);
    tl.from(chars, { yPercent: 115, duration: 1.05, stagger: 0.032 }, 0.05)
      .from(tagline, { yPercent: 110, duration: 0.85, stagger: 0.1 }, 0.5)
      .from(meta, { opacity: 0, y: 8, duration: 0.6 }, 0.55)
      .from(photo, { opacity: 0, y: 24, rotation: 4, duration: 1.1 }, 0.45)
      .from(cta, { opacity: 0, y: 12, duration: 0.6 }, 0.95)
      .from(hint, { opacity: 0, duration: 0.6 }, 1.6)
      .add(onNotes, 0.8);
    heroEl.classList.add('is-ready');
  } else {
    tl.from(name, { opacity: 0, y: 22, duration: 0.9 }, 0.05)
      .from(tagline, { yPercent: 110, duration: 0.8, stagger: 0.1 }, 0.35)
      .from(meta, { opacity: 0, y: 8, duration: 0.5 }, 0.4)
      .from(photo, { opacity: 0, y: 20, duration: 0.9 }, 0.5)
      .from(cta, { opacity: 0, y: 12, duration: 0.6 }, 0.8)
      .from(notes, { y: -320, rotation: 'random(-40, 40)', opacity: 0, ease: 'bounce.out', duration: 1.15, stagger: 0.07 }, 0.6)
      .from(hint, { opacity: 0, duration: 0.6 }, 1.8)
      .add(onNotes, 0.6);
    heroEl.classList.add('is-ready');

    // tap to wiggle
    notes.forEach((n) => n.addEventListener('pointerdown', () => {
      gsap.fromTo(n, { rotation: '+=0' }, { rotation: '+=9', duration: 0.12, yoyo: true, repeat: 3, ease: 'sine.inOut', overwrite: 'auto' });
    }));
  }
}
