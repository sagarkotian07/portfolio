import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { reducedMotion } from './prefs';

gsap.registerPlugin(ScrollTrigger);

export let lenis: Lenis | null = null;

export function initScroll() {
  if (!reducedMotion) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis!.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

export { gsap, ScrollTrigger };
