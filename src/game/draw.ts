// Every shape in the game, drawn with paths. Shared with the hero idle canvas and the preloader.
import { T, type Form, type Level, type Dir } from './types';

export const C = { ball: '#E8402F', ball2: '#B92E22', ring: '#F5B400', ring2: '#C98F00', grass: '#5FBF4B', grass2: '#3E8F33', cloud: '#FFFFFF', cloud2: '#DCE9F6', ink: '#14120F', rock: '#8A8F99', rock2: '#5E626B', light: '#FFF6E5', light2: '#E9D9BE', spike: '#4A4F58', sky: '#BFE3FF' };

export function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, form: Form, sx: number, sy: number, eyeDir: number, blink: number, t: number) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy);
  const fill = form === 'rock' ? C.rock : form === 'light' ? C.light : C.ball;
  const shade = form === 'rock' ? C.rock2 : form === 'light' ? C.light2 : C.ball2;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  // shading crescent
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.25, r * 1.05, 0, Math.PI * 2); ctx.fillStyle = shade; ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath(); ctx.arc(r * 0.35, r * 0.35, r * 0.95, 0, Math.PI * 2); ctx.fillStyle = shade; ctx.globalAlpha = 0.55; ctx.fill(); ctx.restore();
  if (form === 'rock') { ctx.strokeStyle = C.rock2; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.2); ctx.lineTo(-r * 0.1, r * 0.1); ctx.lineTo(r * 0.3, -r * 0.35); ctx.stroke(); }
  if (form === 'light') { ctx.strokeStyle = C.light2; ctx.lineWidth = r * 0.07; for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + t * 0.5; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.18, 0, Math.PI * 2); ctx.stroke(); } }
  // highlight
  ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.22, r * 0.12, -0.6, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
  // eyes
  const ex = r * 0.3, ey = -r * 0.1, er = r * 0.24, look = Math.max(-1, Math.min(1, eyeDir)) * r * 0.08;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(s * ex, ey, er, er * (1 - blink), 0, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    if (blink < 0.9) { ctx.beginPath(); ctx.arc(s * ex + look, ey + r * 0.02, er * 0.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
  }
  // mouth
  ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1.5, r * 0.09); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, r * 0.25, r * 0.32, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  ctx.restore();
}

export function drawSky(ctx: CanvasRenderingContext2D, camX: number, camY: number, vw: number, vh: number, t: number) {
  const g = ctx.createLinearGradient(0, camY, 0, camY + vh);
  g.addColorStop(0, '#BFE3FF'); g.addColorStop(1, '#EAF4FF');
  ctx.fillStyle = g; ctx.fillRect(camX, camY, vw, vh);
  // two cloud layers, parallax
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (const [par, size, yBase, seed] of [[0.15, 1.2, 80, 3], [0.35, 0.8, 200, 7]] as const) {
    const step = 420 * size;
    const off = (camX * par + t * 6) % step;
    for (let i = -1; i < vw / step + 2; i++) {
      const x = camX + i * step - off + ((seed * 37 * i) % 60);
      const y = camY + yBase + Math.sin(i * seed) * 40 - camY * (par * 0.3);
      cloud(ctx, x, y, 90 * size);
    }
  }
}
function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.beginPath(); ctx.ellipse(x, y, w * 0.55, w * 0.22, 0, 0, Math.PI * 2); ctx.arc(x - w * 0.15, y - w * 0.12, w * 0.24, 0, Math.PI * 2); ctx.arc(x + w * 0.15, y - w * 0.16, w * 0.3, 0, Math.PI * 2); ctx.fill();
}

export function drawTiles(ctx: CanvasRenderingContext2D, L: Level, solid: Uint8Array, x0: number, x1: number, y0: number, y1: number) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const v = solid[y * L.w + x]; if (!v) continue;
    const px = x * T, py = y * T;
    if (v === 2) { ctx.fillStyle = C.cloud; rrect(ctx, px + 2, py + 4, T - 4, T * 0.4, 8); ctx.fill(); ctx.fillStyle = C.grass; rrect(ctx, px + 2, py + 2, T - 4, 8, 4); ctx.fill(); continue; }
    if (v === 4) { ctx.fillStyle = C.rock; rrect(ctx, px + 1, py + 1, T - 2, T - 2, 6); ctx.fill(); continue; }
    const above = y > 0 ? solid[(y - 1) * L.w + x] : 0;
    ctx.fillStyle = v === 3 ? '#F1E9DA' : C.cloud;
    ctx.fillRect(px, py, T, T);
    if (v === 3) { ctx.strokeStyle = C.rock; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + 6, py + 8); ctx.lineTo(px + 18, py + 20); ctx.lineTo(px + 12, py + 32); ctx.moveTo(px + 22, py + 6); ctx.lineTo(px + 30, py + 18); ctx.lineTo(px + 34, py + 34); ctx.stroke(); ctx.strokeStyle = C.cloud2; ctx.strokeRect(px + 1, py + 1, T - 2, T - 2); continue; }
    if (!above || above === 2) { ctx.fillStyle = C.grass; ctx.beginPath(); ctx.roundRect(px - 1, py - 3, T + 2, 13, [5, 5, 0, 0]); ctx.fill(); ctx.fillStyle = C.grass2; ctx.fillRect(px, py + 8, T, 3); }
    else { ctx.fillStyle = C.cloud2; ctx.fillRect(px, py, T, 1); }
  }
}
export function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

export function drawSpike(ctx: CanvasRenderingContext2D, cx: number, cy: number, dir: Dir) {
  const px = cx * T, py = cy * T; ctx.fillStyle = C.spike; ctx.beginPath();
  const n = 2, s = T / n;
  for (let i = 0; i < n; i++) {
    if (dir === 'up') { ctx.moveTo(px + i * s, py + T); ctx.lineTo(px + i * s + s / 2, py + 4); ctx.lineTo(px + (i + 1) * s, py + T); }
    else if (dir === 'down') { ctx.moveTo(px + i * s, py); ctx.lineTo(px + i * s + s / 2, py + T - 4); ctx.lineTo(px + (i + 1) * s, py); }
    else if (dir === 'right') { ctx.moveTo(px, py + i * s); ctx.lineTo(px + T - 4, py + i * s + s / 2); ctx.lineTo(px, py + (i + 1) * s); }
    else { ctx.moveTo(px + T, py + i * s); ctx.lineTo(px + 4, py + i * s + s / 2); ctx.lineTo(px + T, py + (i + 1) * s); }
  }
  ctx.fill();
}
export function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const w = Math.abs(Math.cos(t * 3)) * 12 + 2;
  ctx.lineWidth = 5; ctx.strokeStyle = C.ring2; ctx.beginPath(); ctx.ellipse(x, y + 1, w, 12, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = C.ring; ctx.beginPath(); ctx.ellipse(x, y, w, 12, 0, 0, Math.PI * 2); ctx.stroke();
}
export function drawSpring(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  const px = cx * T, py = cy * T, comp = Math.max(0, 1 - t * 4) * 12;
  ctx.strokeStyle = C.rock2; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i < 4; i++) { const y = py + T - 4 - i * ((T - 14 - comp) / 3); ctx.moveTo(px + 10, y); ctx.lineTo(px + T - 10, y - 4); }
  ctx.stroke(); ctx.fillStyle = C.ball; rrect(ctx, px + 6, py + 6 + comp, T - 12, 8, 4); ctx.fill();
}
export function drawButton(ctx: CanvasRenderingContext2D, cx: number, cy: number, pressed: boolean) {
  const px = cx * T, py = cy * T; ctx.fillStyle = C.rock; rrect(ctx, px + 4, py + T - 10, T - 8, 10, 3); ctx.fill();
  ctx.fillStyle = pressed ? C.grass : C.ball; rrect(ctx, px + 8, py + T - (pressed ? 14 : 22), T - 16, 12, 4); ctx.fill();
}
export function drawGate(ctx: CanvasRenderingContext2D, cx: number, top: number, bottom: number, open: number) {
  const h = (bottom - top + 1) * T, px = cx * T, py = top * T - h * open;
  ctx.fillStyle = C.rock; rrect(ctx, px + 8, py, T - 16, h, 6); ctx.fill();
  ctx.fillStyle = C.rock2; for (let y = py + 10; y < py + h - 6; y += 16) ctx.fillRect(px + 12, y, T - 24, 4);
}
export function drawPlatform(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = C.cloud; rrect(ctx, x, y, w, h, 10); ctx.fill(); ctx.fillStyle = C.grass; rrect(ctx, x, y, w, 10, 5); ctx.fill(); ctx.fillStyle = C.grass2; ctx.fillRect(x + 4, y + 8, w - 8, 3);
}
export function drawFan(ctx: CanvasRenderingContext2D, cx: number, cy: number, dir: Dir, _reach: number, t: number) {
  const px = cx * T, py = cy * T, x = px + T / 2, y = py + T / 2;
  ctx.save(); ctx.translate(x, y); if (dir === 'right') ctx.rotate(Math.PI / 2); if (dir === 'left') ctx.rotate(-Math.PI / 2);
  // wind streaks
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
  ctx.globalAlpha = 0.45; for (let i = 0; i < 3; i++) { const off = ((t * 220 + i * 90) % (5 * T)); ctx.beginPath(); ctx.moveTo(-10 + i * 10, -T / 2 - off); ctx.lineTo(-10 + i * 10, -T / 2 - off - 18); ctx.stroke(); } ctx.globalAlpha = 1;
  ctx.rotate(t * 18); ctx.fillStyle = C.cloud2;
  for (let i = 0; i < 3; i++) { ctx.rotate((Math.PI * 2) / 3); ctx.beginPath(); ctx.ellipse(0, -9, 5, 11, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = C.rock2; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
export function drawCheckpoint(ctx: CanvasRenderingContext2D, cx: number, cy: number, hit: boolean, t: number) {
  const px = cx * T + 12, py = cy * T;
  ctx.fillStyle = C.rock2; ctx.fillRect(px, py + 4, 3, T - 4);
  ctx.fillStyle = hit ? C.grass : C.ball; ctx.beginPath(); ctx.moveTo(px + 3, py + 6); ctx.lineTo(px + 22 + Math.sin(t * 6) * 2, py + 12); ctx.lineTo(px + 3, py + 18); ctx.fill();
}
export function drawPad(ctx: CanvasRenderingContext2D, cx: number, cy: number, form: Form, t: number) {
  const px = cx * T, py = cy * T; ctx.fillStyle = C.rock; rrect(ctx, px + 4, py + T - 8, T - 8, 8, 3); ctx.fill();
  ctx.save(); ctx.translate(px + T / 2, py + T - 20 + Math.sin(t * 3) * 3); drawBall(ctx, 0, 0, 9, form, 1, 1, 0, 0, t); ctx.restore();
}
export function drawExit(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  const x = (cx + 0.5) * T, y = (cy - 0.5) * T, p = 1 + Math.sin(t * 3) * 0.06;
  ctx.fillStyle = C.rock; ctx.fillRect(x - 3, y + T * 0.9, 6, T * 0.6);
  ctx.lineWidth = 7; ctx.strokeStyle = C.ring2; ctx.beginPath(); ctx.ellipse(x, y + 2, 14 * p, 34 * p, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = C.ring; ctx.beginPath(); ctx.ellipse(x, y, 14 * p, 34 * p, 0, 0, Math.PI * 2); ctx.stroke();
}
export function drawHill(ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number) {
  ctx.fillStyle = C.grass2; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, groundY + 10); ctx.quadraticCurveTo(w * 0.5, groundY - 30, w, groundY + 10); ctx.lineTo(w, h); ctx.fill();
  ctx.fillStyle = C.grass; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, groundY + 18); ctx.quadraticCurveTo(w * 0.5, groundY - 16, w, groundY + 18); ctx.lineTo(w, h); ctx.fill();
}
