// Evaluated once. Everything else branches on these.
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(pointer: fine)').matches && matchMedia('(hover: hover)').matches;
export const small = matchMedia('(max-width: 767px)').matches;
/** Physics notes, WebGL stack and custom cursor only when all of these hold. */
export const richHero = !reducedMotion && finePointer && !small;

/**
 * Touch screens get the on-screen keys and the tap copy. The pointer queries catch most devices up front; the first
 * touch catches the rest (Chrome's mobile emulation, for one, can report a mouse). The class lives on <html> so CSS
 * and code agree, and it never comes off: a screen that has been touched can be touched again.
 */
const touchQuery = matchMedia('(pointer: coarse), (hover: none), (any-pointer: coarse)');
const touchWaiters: Array<() => void> = [];
export const touchScreen = () => document.documentElement.classList.contains('has-touch');
/** Runs now if this is a touch screen, otherwise on the first touch. */
export function whenTouch(fn: () => void) { if (touchScreen()) fn(); else touchWaiters.push(fn); }
function markTouch() {
  if (touchScreen()) return;
  document.documentElement.classList.add('has-touch');
  for (const fn of touchWaiters.splice(0)) fn();
}
if (touchQuery.matches) markTouch();
touchQuery.addEventListener('change', (e) => { if (e.matches) markTouch(); });
window.addEventListener('touchstart', markTouch, { once: true, passive: true, capture: true });
window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') markTouch(); }, { passive: true, capture: true });

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export const q = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
};
export const qa = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));
