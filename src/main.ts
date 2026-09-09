import { renderAll, initCopyEmail } from './modules/render';
import { initScroll, lenis } from './modules/scroll';
import { runPreloader } from './modules/preloader';
import { initHero } from './modules/hero-intro';
import { initReveals } from './modules/reveal';
import { initProjects } from './modules/projects';
import { initLevelMap } from './modules/levelmap';
import { mountGame } from './game';
import { richHero } from './modules/prefs';

renderAll();
initScroll();

const gameCtl = mountGame({ onPlay() { lenis?.stop(); }, onStop() { lenis?.start(); } });
const goPlay = () => {
  const target = document.getElementById('play')!;
  if (lenis) lenis.scrollTo(target, { duration: 1 }); else target.scrollIntoView();
  setTimeout(() => gameCtl.play(), lenis ? 1050 : 50);
};
const heroIntro = initHero(goPlay);
initCopyEmail();

document.fonts.ready.then(() => runPreloader().then(() => heroIntro?.()));

const later = () => {
  initReveals(); initProjects(); initLevelMap();
  if (richHero) { import('./modules/cursor').then((m) => m.initCursor()); import('./modules/magnetic').then((m) => m.initMagnetic()); }
};
window.addEventListener('load', () => ('requestIdleCallback' in window ? requestIdleCallback(later, { timeout: 1500 }) : setTimeout(later, 300)), { once: true });
