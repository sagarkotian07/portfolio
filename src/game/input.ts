import type { InputState } from './types';

const LEFT = new Set(['ArrowLeft', 'KeyA', 'Digit4', 'Numpad4']);
const RIGHT = new Set(['ArrowRight', 'KeyD', 'Digit6', 'Numpad6']);
const JUMP = new Set(['ArrowUp', 'Space', 'KeyW', 'Digit5', 'Numpad5']);

export function bindInput(input: InputState, opts: { isActive(): boolean; onEscape(): void; touchRoot: HTMLElement | null }) {
  window.addEventListener('keydown', (e) => {
    if (!opts.isActive()) return;
    if (e.code === 'Escape') { opts.onEscape(); return; }
    if (LEFT.has(e.code)) { input.left = true; e.preventDefault(); }
    else if (RIGHT.has(e.code)) { input.right = true; e.preventDefault(); }
    else if (JUMP.has(e.code)) { if (!e.repeat) input.jumpPressed = true; input.jumpHeld = true; e.preventDefault(); }
  });
  window.addEventListener('keyup', (e) => {
    if (LEFT.has(e.code)) input.left = false;
    else if (RIGHT.has(e.code)) input.right = false;
    else if (JUMP.has(e.code)) input.jumpHeld = false;
  });
  window.addEventListener('blur', () => { input.left = input.right = input.jumpHeld = false; });
  const root = opts.touchRoot; if (!root) return;
  root.querySelectorAll<HTMLButtonElement>('[data-key]').forEach((btn) => {
    const key = btn.dataset.key!;
    const set = (on: boolean) => {
      btn.classList.toggle('is-down', on);
      if (key === 'left') input.left = on; else if (key === 'right') input.right = on;
      else { if (on) input.jumpPressed = true; input.jumpHeld = on; }
    };
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); btn.setPointerCapture(e.pointerId); set(true); });
    const off = (e: PointerEvent) => { e.preventDefault(); set(false); };
    btn.addEventListener('pointerup', off); btn.addEventListener('pointercancel', off); btn.addEventListener('lostpointercapture', () => set(false));
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}
