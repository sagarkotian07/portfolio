// The ball idling on the hero's baseline, and the preloader drop. This is the page's mascot with its face; the game's ball is drawn in draw.ts.
const LINE = '#102A1B', INK = '#14120F', BALL = '#EE3B2C', BALL2 = '#B4231B', BALL_LINE = '#3A110E';

export function drawFaceBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, sx: number, sy: number, eyeDir: number, blink: number) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = BALL; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  ctx.beginPath(); ctx.arc(r * 0.3, r * 0.3, r * 0.95, 0, Math.PI * 2); ctx.fillStyle = BALL2; ctx.globalAlpha = 0.55; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r - 0.8, 0, Math.PI * 2); ctx.strokeStyle = BALL_LINE; ctx.lineWidth = Math.max(2, r * 0.13); ctx.stroke();
  ctx.beginPath(); ctx.arc(-r * 0.34, -r * 0.36, r * 0.28, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.32)'; ctx.fill();
  ctx.beginPath(); ctx.arc(-r * 0.5, -r * 0.5, r * 0.19, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();
  const ex = r * 0.27, ey = -r * 0.04, er = r * 0.18, look = Math.max(-1, Math.min(1, eyeDir)) * r * 0.07;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(s * ex, ey, er, er * (1 - blink), 0, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    if (blink < 0.9) { ctx.beginPath(); ctx.arc(s * ex + look, ey + r * 0.03, er * 0.5, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
  }
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1.5, r * 0.08); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.36); ctx.lineTo(-r * 0.16, -r * 0.38); ctx.moveTo(r * 0.16, -r * 0.38); ctx.lineTo(r * 0.4, -r * 0.36); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, r * 0.28, r * 0.23, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  ctx.restore();
}

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
    // the ball bounces on the rule under the hero; the rule itself is CSS
    const r = Math.min(20, Math.max(14, w * 0.016)), groundY = h - 1;
    const bounce = Math.abs(Math.sin(t * 2.6)), y = groundY - r - bounce * (h * 0.42), squash = bounce < 0.08 ? 1 - (0.08 - bounce) * 3 : 1;
    const x = w * 0.5 + Math.sin(t * 0.4) * Math.min(160, w * 0.18);
    ctx.fillStyle = 'rgba(16,42,27,0.14)'; ctx.beginPath(); ctx.ellipse(x, groundY - 1, r * (1.2 - bounce * 0.4), r * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    drawFaceBall(ctx, x, y, r, 1 / squash, squash, Math.cos(t * 0.4), blink);
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
    ctx.fillStyle = LINE; ctx.beginPath(); ctx.roundRect(w * 0.2, groundY, w * 0.6, 2, 1); ctx.fill();
    const sq = y + r >= groundY - 1 && vy >= -1 ? 0.8 : 1;
    ctx.fillStyle = 'rgba(16,42,27,0.14)'; ctx.beginPath(); ctx.ellipse(w / 2, groundY - 1, r * (0.6 + 0.6 * Math.max(0, 1 - (groundY - r - y) / 200)), 5, 0, 0, Math.PI * 2); ctx.fill();
    drawFaceBall(ctx, w / 2, y, r, 1 / sq, sq, 0, 0);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
