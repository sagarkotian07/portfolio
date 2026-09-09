// The ball idling on a hill under the hero, and the preloader drop.
import { drawBall, drawHill } from './draw';

function setup(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!; const dpr = Math.min(devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect(); const w = r.width, h = r.height;
  canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}
export function mountIdle(canvas: HTMLCanvasElement) {
  let { ctx, w, h } = setup(canvas);
  new ResizeObserver(() => ({ ctx, w, h } = setup(canvas))).observe(canvas);
  let t = 0, raf = 0, last = 0, visible = false, blink = 0, blinkT = 2;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop); const dt = Math.min(0.033, (now - last) / 1000 || 0.016); last = now; if (!visible) return;
    t += dt; blinkT -= dt; if (blinkT <= 0) { blink = 1; blinkT = 2 + Math.random() * 4; } blink = Math.max(0, blink - dt * 8);
    ctx.clearRect(0, 0, w, h);
    const groundY = h - 34; drawHill(ctx, w, h, groundY);
    const bounce = Math.abs(Math.sin(t * 2.6)), y = groundY - 22 - bounce * 44, squash = bounce < 0.08 ? 1 - (0.08 - bounce) * 3 : 1;
    const x = w * 0.5 + Math.sin(t * 0.4) * Math.min(120, w * 0.08);
    ctx.fillStyle = 'rgba(20,18,15,0.12)'; ctx.beginPath(); ctx.ellipse(x, groundY + 2, 22 * (1.3 - bounce * 0.4), 5, 0, 0, Math.PI * 2); ctx.fill();
    drawBall(ctx, x, y, 22, 'normal', 1 / squash, squash, Math.cos(t * 0.4), blink, t);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
export function preloaderDrop(canvas: HTMLCanvasElement, onBounce: (n: number) => void) {
  const { ctx, w, h } = setup(canvas);
  let raf = 0, last = 0, t = 0, y = -40, vy = 0, bounces = 0, done = false;
  const groundY = h - 40, r = 26;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop); const dt = Math.min(0.033, (now - last) / 1000 || 0.016); last = now; t += dt;
    if (!done) { vy += 2600 * dt; y += vy * dt; if (y + r > groundY) { y = groundY - r; vy = -Math.abs(vy) * 0.55; bounces++; onBounce(bounces); if (bounces >= 3 && Math.abs(vy) < 260) { done = true; vy = 0; } } }
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#5FBF4B'; ctx.beginPath(); ctx.roundRect(w * 0.2, groundY, w * 0.6, 12, 6); ctx.fill();
    const sq = y + r >= groundY - 1 && vy >= -1 ? 0.8 : 1;
    drawBall(ctx, w / 2, y, r, 'normal', 1 / sq, sq, 0, 0, t);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
