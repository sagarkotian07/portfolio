import { renderAll, initCopyEmail } from './modules/render';
import { initScroll, lenis } from './modules/scroll';
import { runPreloader } from './modules/preloader';
import { initHero } from './modules/hero-intro';
import { initReveals } from './modules/reveal';
import { initProjects } from './modules/projects';
import { initLevelMap } from './modules/levelmap';
import { initAbout } from './modules/about';
import { mountGame } from './game';
import { richHero } from './modules/prefs';

renderAll();
initScroll();

// The stage may not fit where the visitor left it (a tap on Start half way down, a short screen): bring it fully into view, then lock the page.
const stage = document.getElementById('game-stage')!;
const fitStage = () => {
  const r = stage.getBoundingClientRect();
  if (r.top >= 0 && r.bottom <= innerHeight) return;
  const y = Math.round(scrollY + r.top - Math.max(0, (innerHeight - r.height) / 2));
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
};
const gameCtl = mountGame({ onPlay() { fitStage(); lenis?.stop(); }, onStop() { lenis?.start(); } });
const goPlay = () => {
  const target = document.getElementById('play')!;
  if (lenis) lenis.scrollTo(target, { duration: 1 }); else target.scrollIntoView();
  setTimeout(() => gameCtl.play(), lenis ? 1050 : 50);
};
const heroIntro = initHero(goPlay);
initCopyEmail();
const nav = document.getElementById('nav')!;
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

document.fonts.ready.then(() => runPreloader().then(() => heroIntro?.()));

const later = () => {
  initReveals(); initProjects(); initLevelMap(); initAbout();
  if (richHero) { import('./modules/cursor').then((m) => m.initCursor()); import('./modules/magnetic').then((m) => m.initMagnetic()); }
};
window.addEventListener('load', () => ('requestIdleCallback' in window ? requestIdleCallback(later, { timeout: 1500 }) : setTimeout(later, 300)), { once: true });
