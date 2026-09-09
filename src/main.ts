import { renderAll, initCopyEmail } from './modules/render';
import { initScroll } from './modules/scroll';
import { initReveals } from './modules/reveal';
import { initHeroIntro } from './modules/hero-intro';
import { initTimeline } from './modules/timeline';
import { initProjects } from './modules/projects';
import { initCounters } from './modules/counters';
import { richHero, hasWebGL, q } from './modules/prefs';

renderAll();
initScroll();
initProjects();
initCopyEmail();
initCounters();
initTimeline();

document.fonts.ready.then(() => {
  initReveals();
  initHeroIntro(() => {
    if (richHero) import('./modules/hero-physics').then((m) => m.startPhysics()).catch(() => {});
  });
});

if (richHero) {
  import('./modules/cursor').then((m) => m.initCursor());
  if (hasWebGL()) {
    const go = () => import('./modules/hero-3d').then((m) => m.mount(q('#hero-3d'))).catch(() => {});
    window.addEventListener('load', () => {
      'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 2500 }) : setTimeout(go, 800);
    }, { once: true });
  }
}
