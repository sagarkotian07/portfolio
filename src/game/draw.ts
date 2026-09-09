// The sky forest, drawn with canvas paths. Shared with the hero idle canvas and the preloader.
import { T, type Form, type Level, type Dir, type Decor } from './types';
import { contours } from './contour';

export const C = {
  skyTop: '#58AFE4', skyBottom: '#58AFE4', cloud: '#FFFFFF',
  ball: '#EE3B2C', ball2: '#B4231B', ballLine: '#3A110E', ink: '#14120F',
  body: '#063D1C', body2: '#042D14', edge: '#012713', rim: '#2F8F3A',
  grass: '#31D32B', grass2: '#83E94F', grass3: '#24AB21',
  bush: '#1E7A2A', bush2: '#2FA038',
  egg: '#FFD494', eggShade: '#E8A75A', eggLight: '#FFF1D2', eggLine: '#8A5A2B',
  plank: '#B5793F', plank2: '#7A4E24', rope: '#8A6540',
  sign: '#C48A4A', signHit: '#DDA463', sign2: '#7A4E24', arrow: '#F7C531', arrowHit: '#F7C531',
  flower: '#F0384D', flower2: '#B8233A', flowerLine: '#7A1526', petalWhite: '#FFFFFF', petalWhite2: '#E1E6EC', whiteLine: '#8E98A6', centre: '#F7C531', stem: '#3FBF2E', stem2: '#2A8F27',
  spike: '#F4F7FA', spike2: '#AEB9C6',
  vine: '#4FD03A', vine2: '#1F7A22',
  bg1: '#76AFBA', bg2: '#5795A4', bgCap: '#8EDC62', bgWater: '#72AFBA', bgWater2: '#4C8D9F', bgGrass: '#66D641', bgBush: '#2F7346',
  ring: '#F5B400', rock: '#8A8F99', rock2: '#5E626B', light: '#FFF6E5', light2: '#E9D9BE',
};

const hash = (x: number, y: number) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; };

export function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, form: Form, sx: number, sy: number, eyeDir: number, blink: number, t: number) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy);
  const fill = form === 'rock' ? C.rock : form === 'light' ? C.light : C.ball;
  const shade = form === 'rock' ? C.rock2 : form === 'light' ? C.light2 : C.ball2;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  ctx.beginPath(); ctx.arc(r * 0.3, r * 0.3, r * 0.95, 0, Math.PI * 2); ctx.fillStyle = shade; ctx.globalAlpha = 0.55; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r - 0.8, 0, Math.PI * 2); ctx.strokeStyle = C.ballLine; ctx.lineWidth = Math.max(2, r * 0.13); ctx.stroke();
  ctx.beginPath(); ctx.arc(-r * 0.34, -r * 0.36, r * 0.28, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.32)'; ctx.fill();
  ctx.beginPath(); ctx.arc(-r * 0.5, -r * 0.5, r * 0.19, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();
  if (form === 'light') { ctx.strokeStyle = C.light2; ctx.lineWidth = r * 0.07; for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + t * 0.5; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.18, 0, Math.PI * 2); ctx.stroke(); } }
  // face: eyes and a smile
  const ex = r * 0.27, ey = -r * 0.04, er = r * 0.18, look = Math.max(-1, Math.min(1, eyeDir)) * r * 0.07;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(s * ex, ey, er, er * (1 - blink), 0, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    if (blink < 0.9) { ctx.beginPath(); ctx.arc(s * ex + look, ey + r * 0.03, er * 0.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill(); }
  }
  ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1.5, r * 0.08); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.36); ctx.lineTo(-r * 0.16, -r * 0.38); ctx.moveTo(r * 0.16, -r * 0.38); ctx.lineTo(r * 0.4, -r * 0.36); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, r * 0.28, r * 0.23, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  ctx.restore();
}

export function drawSky(ctx: CanvasRenderingContext2D, camX: number, camY: number, vw: number, vh: number, t: number, worldH = 64 * T) {
  void worldH; ctx.fillStyle = C.skyTop; ctx.fillRect(camX, camY, vw, vh);
  ctx.fillStyle = C.cloud;
  const step = 720, rows = 3;
  for (let j = 0; j < rows; j++) {
    const py = camY * (0.55 + j * 0.1); // slower than the world, so clouds drift as you climb
    const off = (camX * 0.25 + t * (4 + j * 2)) % step;
    for (let i = -1; i < vw / step + 2; i++) {
      const x = camX + i * step - off + ((i * 131 + j * 77) % 200);
      const y = py + ((i * 97 + j * 211) % 700) - 60 + j * 160;
      if (y < camY - 80 || y > camY + vh + 80) continue;
      cloud(ctx, x, y, 56 + ((i * 53 + j * 31) % 40), hash(i + 7, j + 3));
    }
  }
}
function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, v = 0.5) {
  ctx.beginPath(); ctx.roundRect(x - w * 0.5, y - w * 0.1, w, w * 0.2, w * 0.1); ctx.fill();
  ctx.beginPath(); ctx.arc(x - w * (0.16 + v * 0.1), y - w * 0.1, w * (0.13 + v * 0.07), 0, Math.PI * 2); ctx.arc(x + w * (0.12 - v * 0.14), y - w * (0.14 + v * 0.06), w * (0.26 - v * 0.08), 0, Math.PI * 2); ctx.arc(x + w * (0.24 + v * 0.1), y - w * 0.08, w * (0.11 + v * 0.07), 0, Math.PI * 2); ctx.fill();
}

/** Pale vine trunks and small floating islands far behind the level, with a little parallax. */
export function drawBackdrop(ctx: CanvasRenderingContext2D, L: Level, camX: number, camY: number, vw: number, vh: number, _t: number) {
  for (const d of L.decor) {
    if (d.kind !== 'island' && d.kind !== 'stalk') continue;
    const p = d.kind === 'island' ? 0.84 : 0.76;
    const wx = (d.cx + 0.5) * T, wy = (d.cy + 0.5) * T;
    const x = camX + vw * 0.5 + (wx - camX - vw * 0.5) * p, y = camY + vh * 0.5 + (wy - camY - vh * 0.5) * p;
    if (x < camX - 200 || x > camX + vw + 200 || y < camY - 800 || y > camY + vh + 200) continue;
    const s = hash(d.cx, d.cy);
    if (d.kind === 'island') {
      const w = 85 + s * 45, dp = 25 + s * 20;
      ctx.save(); ctx.globalAlpha = 0.82;
      ctx.fillStyle = C.bgWater2; ctx.beginPath(); ctx.moveTo(x - w / 2, y);
      ctx.lineTo(x - w * 0.36, y + dp * 0.55); ctx.lineTo(x - w * 0.2, y + dp * 0.35); ctx.lineTo(x - w * 0.04, y + dp); ctx.lineTo(x + w * 0.12, y + dp * 0.5); ctx.lineTo(x + w * 0.3, y + dp * 0.72); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.bgWater; ctx.beginPath(); ctx.moveTo(x - w / 2 + 6, y + 1); ctx.lineTo(x + w / 2 - 6, y + 1); ctx.lineTo(x + w * 0.2, y + dp * 0.3); ctx.lineTo(x - w * 0.05, y + dp * 0.42); ctx.lineTo(x - w * 0.3, y + dp * 0.22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.bgGrass; ctx.beginPath(); ctx.roundRect(x - w / 2 - 3, y - 7, w + 6, 9, 4.5); ctx.fill();
      ctx.fillStyle = C.bgBush; ctx.beginPath(); ctx.moveTo(x + w * 0.1, y - 6); ctx.lineTo(x + w * 0.2, y - 20); ctx.lineTo(x + w * 0.28, y - 10); ctx.lineTo(x + w * 0.36, y - 16); ctx.lineTo(x + w * 0.42, y - 6); ctx.closePath(); ctx.fill();
      const h = 60 + s * 50;
      ctx.fillStyle = C.bg2; ctx.beginPath(); ctx.roundRect(x - w * 0.15 - 6, y - 7 - h, 12, h, 6); ctx.fill();
      ctx.fillStyle = C.bg1; ctx.beginPath(); ctx.roundRect(x - w * 0.15 - 3, y - 7 - h + 3, 6, h - 6, 3); ctx.fill();
      ctx.fillStyle = C.bgCap; ctx.beginPath(); ctx.ellipse(x - w * 0.15, y - 7 - h, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else {
      // a big pale trunk: goes well below and above its anchor, with cut branch stubs and a bright cap
      const s2 = hash(d.cy, d.cx), h = 300 + s * 420, w = 12 + s2 * 32, top = y - h * (0.45 + s2 * 0.3), bottom = top + h;
      ctx.save(); ctx.globalAlpha = 0.65; ctx.translate(x, y); ctx.rotate((s - 0.5) * 0.2); ctx.translate(-x, -y);
      ctx.fillStyle = C.bg2; ctx.beginPath(); ctx.roundRect(x - w / 2, top, w, bottom - top, w / 2); ctx.fill();
      ctx.fillStyle = C.bg1; ctx.beginPath(); ctx.roundRect(x - w / 2 + 5, top + 5, w - 10, bottom - top - 10, (w - 10) / 2); ctx.fill();
      for (let i = 0; i < 4; i++) {
        const by = top + 60 + i * ((bottom - top - 90) / 3.4) + hash(i, d.cx) * 60, side = hash(i + 3, d.cx + d.cy) < 0.5 ? 1 : -1, len = 14 + hash(d.cy, i) * 26;
        if (hash(i + 9, d.cy) < 0.3) continue;
        ctx.save(); ctx.translate(x + side * (w / 2 - 6), by); ctx.rotate(side * -0.5);
        ctx.fillStyle = C.bg2; ctx.beginPath(); ctx.roundRect(side < 0 ? -len : 0, -6, len, 12, 6); ctx.fill();
        ctx.fillStyle = C.bg1; ctx.beginPath(); ctx.roundRect((side < 0 ? -len : 0) + 3, -3, len - 6, 6, 3); ctx.fill();
        ctx.fillStyle = C.bgCap; ctx.beginPath(); ctx.ellipse(side * len, 0, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = C.bgCap; ctx.beginPath(); ctx.ellipse(x, top + 2, w / 2 - 2, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.bg2; ctx.beginPath(); ctx.ellipse(x, top + 2, Math.max(1, w / 2 - 8), 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
}

const isBody = (v: number) => v === 1 || v === 3 || v === 5 || v === 6;
export function drawTiles(ctx: CanvasRenderingContext2D, L: Level, solid: Uint8Array, x0: number, x1: number, y0: number, y1: number) {
  const at = (x: number, y: number) => (x < 0 || x >= L.w || y < 0 || y >= L.h ? 0 : solid[y * L.w + x]);
  const { loops, caps } = contours(L, solid);
  const vx0 = x0 * T, vx1 = (x1 + 1) * T, vy0 = y0 * T, vy1 = (y1 + 1) * T;
  const trace = () => {
    ctx.beginPath();
    for (const lp of loops) {
      if (lp.maxX < vx0 || lp.minX > vx1 || lp.maxY < vy0 || lp.minY > vy1) continue;
      lp.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath();
    }
  };
  trace(); ctx.fillStyle = C.body; ctx.fill('evenodd');
  // bark spots and a soft inner shade, clipped to the shape
  ctx.save(); trace(); ctx.clip('evenodd');
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const v = at(x, y); if (!isBody(v)) continue;
    const h = hash(x, y);
    if (h < 0.2 && isBody(at(x, y - 1))) { ctx.fillStyle = C.body2; ctx.beginPath(); ctx.ellipse(x * T + 12 + h * 70, y * T + 8 + hash(y, x) * 24, 6 + h * 9, 5 + h * 5, h * 3, 0, Math.PI * 2); ctx.fill(); }
    if (!isBody(at(x, y + 1))) { ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(x * T, y * T + T - 7, T, 7); }
    if (v === 3) { ctx.strokeStyle = C.body2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x * T + 8, y * T + 8); ctx.lineTo(x * T + 20, y * T + 20); ctx.lineTo(x * T + 14, y * T + 32); ctx.stroke(); }
  }
  // a lighter rim just inside the left and top edges
  trace(); ctx.strokeStyle = C.rim; ctx.lineWidth = 7; ctx.globalAlpha = 0.28; ctx.save(); ctx.translate(3, 3); trace(); ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1;
  ctx.restore();
  trace(); ctx.strokeStyle = C.edge; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  // grass on every top edge that meets the sky
  for (const c of caps) if (c.x1 - c.x0 >= 2 * T && c.x1 > vx0 - T && c.x0 < vx1 + T && c.y > vy0 - T && c.y < vy1 + T) grassCap(ctx, c.x0, c.y, c.x1 - c.x0, true, true);
  // hanging planks
  for (let y = y0; y <= y1; y++) {
    let x = 0;
    while (x < L.w) {
      if (at(x, y) !== 2) { x++; continue; }
      let len = 1; while (x + len < L.w && at(x + len, y) === 2) len++;
      drawPlank(ctx, x * T, y * T, len * T, ropeTopFn(L, solid, y));
      x += len;
    }
  }
}
/** Secret passages are painted over the ball, nearly opaque, so the ball only shows faintly while inside. */
export function drawSecret(ctx: CanvasRenderingContext2D, L: Level, solid: Uint8Array, x0: number, x1: number, y0: number, y1: number) {
  ctx.fillStyle = C.body; ctx.globalAlpha = 0.86;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x >= 0 && y >= 0 && x < L.w && y < L.h && solid[y * L.w + x] === 6) ctx.fillRect(x * T - 1, y * T - 1, T + 2, T + 2);
  ctx.globalAlpha = 1;
}
export function ropeTopFn(L: Level, solid: Uint8Array, row: number) {
  return (col: number) => { for (let yy = row - 1; yy >= Math.max(0, row - 10); yy--) { const v = yy * L.w + col >= 0 && col < L.w ? solid[yy * L.w + col] : 0; if (isBody(v)) return (yy + 1) * T - 4; } return row * T - 10 * T; };
}
export function grassCap(ctx: CanvasRenderingContext2D, px: number, py: number, w: number, leftOpen: boolean, rightOpen: boolean) {
  const x0 = px - (leftOpen ? 5 : 0), x1 = px + w + (rightOpen ? 5 : 0);
  ctx.fillStyle = C.grass3; ctx.beginPath(); ctx.roundRect(x0, py - 4, x1 - x0, 13, 6); ctx.fill();
  ctx.fillStyle = C.grass; ctx.beginPath(); ctx.moveTo(x0, py + 5); ctx.lineTo(x0, py - 4);
  for (let wx = x0; wx <= x1; wx += 8) ctx.lineTo(wx, py - 6 + Math.sin(wx / 13) * 2.2 + Math.sin(wx / 31) * 1.5);
  ctx.lineTo(x1, py - 4); ctx.lineTo(x1, py + 5); ctx.closePath(); ctx.fill();
  // uneven humps along the top, with the odd pointed tuft
  ctx.beginPath(); let tx = x0 + 5, k = 0;
  while (tx < x1 - 4) {
    const h = hash(Math.round(tx), py), r = 2.5 + h * 4;
    if (k % 5 === 3) { ctx.moveTo(tx - 4, py - 5); ctx.lineTo(tx + 1 + h * 3, py - 12 - h * 4); ctx.lineTo(tx + 5, py - 5); ctx.closePath(); }
    else { ctx.moveTo(tx + r, py - 6); ctx.arc(tx, py - 6, r, 0, Math.PI * 2); }
    tx += 7 + h * 7; k++;
  }
  ctx.fill();
  ctx.fillStyle = C.grass2; ctx.beginPath(); ctx.roundRect(x0 + 3, py - 5, x1 - x0 - 6, 2.5, 1.2); ctx.fill();
}
export function drawPlank(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, ropeTop?: (col: number) => number) {
  ctx.strokeStyle = C.rope; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (const rx of [x + 9, x + w - 9]) { const top = ropeTop ? ropeTop(Math.floor(rx / T)) : y - 240; ctx.beginPath(); ctx.moveTo(rx, top); ctx.lineTo(rx, y + 8); ctx.stroke(); }
  const v = hash(Math.round(x / 7), Math.round(y / 7));
  ctx.fillStyle = C.plank2; ctx.beginPath(); ctx.roundRect(x, y + 3, w, 17, 3); ctx.fill();
  ctx.fillStyle = v < 0.5 ? C.plank : '#C3844A'; ctx.beginPath(); ctx.roundRect(x + 2, y + 1, w - 4, 14, 2); ctx.fill();
  // grain and board joints
  ctx.save(); ctx.beginPath(); ctx.rect(x + 3, y + 2, w - 6, 12); ctx.clip(); ctx.strokeStyle = 'rgba(70,40,15,0.45)'; ctx.lineWidth = 1;
  for (let i = 0; i < w / 18; i++) { const gx = x + 6 + i * 18 + hash(i, x) * 6, gy = y + 4 + hash(x, i) * 7; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(gx + 6, gy + 2, gx + 12, gy + (hash(i, y) - 0.5) * 3); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = C.plank2; ctx.lineWidth = 1.5; for (let i = 1; i < w / 30; i++) { ctx.beginPath(); ctx.moveTo(x + i * 30, y + 3); ctx.lineTo(x + i * 30, y + 14); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x + 4, y + 2, w - 8, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x + 2, y + 13, w - 4, 3);
}
export function drawPlatform(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, ropeTop?: (col: number) => number) { drawPlank(ctx, x, y, w, ropeTop); }
export function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

export function drawSpike(ctx: CanvasRenderingContext2D, cx: number, cy: number, dir: Dir) {
  const px = cx * T, py = cy * T, n = 3, s = T / n;
  ctx.fillStyle = C.spike; ctx.strokeStyle = C.spike2; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    if (dir === 'up') { ctx.moveTo(px + i * s, py + T); ctx.lineTo(px + i * s + s / 2, py + 2); ctx.lineTo(px + (i + 1) * s, py + T); }
    else if (dir === 'down') { ctx.moveTo(px + i * s, py); ctx.lineTo(px + i * s + s / 2, py + T - 2); ctx.lineTo(px + (i + 1) * s, py); }
    else if (dir === 'right') { ctx.moveTo(px, py + i * s); ctx.lineTo(px + T - 2, py + i * s + s / 2); ctx.lineTo(px, py + (i + 1) * s); }
    else { ctx.moveTo(px + T, py + i * s); ctx.lineTo(px + 2, py + i * s + s / 2); ctx.lineTo(px + T, py + (i + 1) * s); }
  }
  ctx.fill(); ctx.stroke();
}
export function drawEgg(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const bob = Math.sin(t * 2.2) * 3;
  ctx.save(); ctx.translate(x, y + bob);
  const pear = () => { ctx.beginPath(); ctx.moveTo(0, -14); ctx.bezierCurveTo(6.5, -14, 11.5, -3, 11.5, 4); ctx.bezierCurveTo(11.5, 10.5, 6.5, 14.5, 0, 14.5); ctx.bezierCurveTo(-6.5, 14.5, -11.5, 10.5, -11.5, 4); ctx.bezierCurveTo(-11.5, -3, -6.5, -14, 0, -14); ctx.closePath(); };
  pear(); ctx.fillStyle = C.egg; ctx.fill();
  ctx.save(); pear(); ctx.clip(); ctx.fillStyle = C.eggShade; ctx.beginPath(); ctx.ellipse(5, 5, 10, 12, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.fillStyle = C.eggLight; ctx.beginPath(); ctx.ellipse(-4, -5, 3, 4.5, -0.35, 0, Math.PI * 2); ctx.fill();
  pear(); ctx.strokeStyle = C.eggLine; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
export function drawSpring(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  // a curled vine on the ground: one broad sweep that stretches upward for a moment when it fires
  const px = cx * T + T / 2, py = cy * T + T - 2, fire = Math.max(0, 1 - t * 3);
  ctx.save(); ctx.translate(px, py); ctx.scale(1, 1 + fire * 0.7); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const path = () => {
    ctx.beginPath(); ctx.moveTo(-26, 0);
    ctx.bezierCurveTo(-30, -22, -16, -38, 4, -36);
    ctx.bezierCurveTo(24, -34, 32, -20, 22, -10);
    ctx.bezierCurveTo(14, -2, 2, -6, 4, -14);
    ctx.bezierCurveTo(6, -20, 14, -20, 14, -16);
  };
  ctx.strokeStyle = C.vine2; ctx.lineWidth = 9; path(); ctx.stroke();
  ctx.strokeStyle = C.vine; ctx.lineWidth = 5; path(); ctx.stroke();
  ctx.restore();
  leaf(ctx, px - 24, py - 2, -2.3, 16);
}
export function drawButton(ctx: CanvasRenderingContext2D, cx: number, cy: number, pressed: boolean) {
  const px = cx * T, py = cy * T; ctx.fillStyle = C.rock; rrect(ctx, px + 4, py + T - 10, T - 8, 10, 3); ctx.fill();
  ctx.fillStyle = pressed ? C.grass : C.ball; rrect(ctx, px + 8, py + T - (pressed ? 14 : 22), T - 16, 12, 4); ctx.fill();
}
export function drawGate(ctx: CanvasRenderingContext2D, cx: number, top: number, bottom: number, open: number) {
  const h = (bottom - top + 1) * T, px = cx * T, py = top * T - h * open;
  ctx.fillStyle = C.plank2; rrect(ctx, px + 8, py, T - 16, h, 6); ctx.fill();
}
export function drawFan(ctx: CanvasRenderingContext2D, cx: number, cy: number, dir: Dir, _reach: number, t: number) {
  const x = cx * T + T / 2, y = cy * T + T / 2;
  ctx.save(); ctx.translate(x, y); if (dir === 'right') ctx.rotate(Math.PI / 2); if (dir === 'left') ctx.rotate(-Math.PI / 2);
  ctx.rotate(t * 18); ctx.fillStyle = C.spike2; for (let i = 0; i < 3; i++) { ctx.rotate((Math.PI * 2) / 3); ctx.beginPath(); ctx.ellipse(0, -9, 5, 11, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
export function drawCheckpoint(ctx: CanvasRenderingContext2D, cx: number, cy: number, hit: boolean, dir: Dir, t: number) {
  drawSign(ctx, cx, cy, dir, C.arrow, t, hit);
  if (hit) {
    const px = cx * T + T / 2, py = cy * T + T - 46;
    ctx.strokeStyle = C.stem; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px + 12, py); ctx.quadraticCurveTo(px + 14, py - 10, px + 20, py - 12 + Math.sin(t * 3) * 1.5); ctx.stroke();
    ctx.fillStyle = C.grass; ctx.beginPath(); ctx.ellipse(px + 22, py - 13, 6, 3.5, -0.5, 0, Math.PI * 2); ctx.fill();
  }
}
function drawSign(ctx: CanvasRenderingContext2D, cx: number, cy: number, dir: Dir, arrow: string, _t: number, lit = false) {
  const px = cx * T + T / 2, py = cy * T + T;
  ctx.fillStyle = C.sign2; ctx.beginPath(); ctx.roundRect(px - 3, py - 26, 6, 27, 2); ctx.fill();
  ctx.fillStyle = C.sign2; ctx.beginPath(); ctx.roundRect(px - 18, py - 46, 36, 26, 4); ctx.fill();
  ctx.fillStyle = lit ? C.signHit : C.sign; ctx.beginPath(); ctx.roundRect(px - 16, py - 44, 32, 22, 3); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(px - 16, py - 26, 32, 4);
  ctx.save(); ctx.translate(px, py - 33);
  const rot = dir === 'up' ? -Math.PI / 2 : dir === 'down' ? Math.PI / 2 : dir === 'left' ? Math.PI : 0; ctx.rotate(rot);
  ctx.fillStyle = arrow; ctx.beginPath(); ctx.moveTo(-9, -4); ctx.lineTo(1, -4); ctx.lineTo(1, -9); ctx.lineTo(11, 0); ctx.lineTo(1, 9); ctx.lineTo(1, 4); ctx.lineTo(-9, 4); ctx.closePath(); ctx.fill();
  ctx.restore();
}
export function drawPad(ctx: CanvasRenderingContext2D, cx: number, cy: number, form: Form, t: number) {
  const px = cx * T, py = cy * T; ctx.save(); ctx.translate(px + T / 2, py + T - 20 + Math.sin(t * 3) * 3); drawBall(ctx, 0, 0, 9, form, 1, 1, 0, 0, t); ctx.restore();
}
/** The goal: a big red flower on a tall stem with three leaves, bigger than any other bloom. Base on the E cell. */
export function drawExit(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  const x = (cx + 0.5) * T, base = (cy + 1) * T, sway = Math.sin(t * 1.5) * 3, h = 70;
  ctx.strokeStyle = C.stem2; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + 8, base - h * 0.55, x + sway, base - h); ctx.stroke();
  ctx.strokeStyle = C.stem; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + 8, base - h * 0.55, x + sway, base - h); ctx.stroke();
  leaf(ctx, x - 5, base - 16, -0.95, 24); leaf(ctx, x + 6, base - 34, 0.6, 22); leaf(ctx, x - 3, base - 48, -1.15, 18);
  drawBloom(ctx, x + sway, base - h - 12, 38, C.flower, C.flower2, t);
}
function leaf(ctx: CanvasRenderingContext2D, x: number, y: number, a: number, len: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = C.stem2; ctx.beginPath(); ctx.ellipse(len * 0.5 + 1, 1, len * 0.5 + 1, len * 0.24 + 1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.stem; ctx.beginPath(); ctx.ellipse(len * 0.5, 0, len * 0.5, len * 0.24, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#1B6B1E'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.strokeStyle = C.stem2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(len - 3, 0); ctx.stroke();
  ctx.restore();
}
function drawBloom(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, petal: string, petal2: string, t: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t) * 0.05);
  const n = 5, line = petal === C.flower ? C.flowerLine : C.whiteLine, seed = Math.round(x * 0.37 + y * 0.11);
  const size = (i: number) => 1 + (hash(seed, i) - 0.5) * 0.16;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2, k = size(i); ctx.fillStyle = petal2; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.58, Math.sin(a) * r * 0.58 + 2, r * 0.45 * k, r * 0.32 * k, a, 0, Math.PI * 2); ctx.fill(); }
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2, k = size(i);
    ctx.fillStyle = petal; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.56, Math.sin(a) * r * 0.56, r * 0.44 * k, r * 0.3 * k, a, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = line; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3); ctx.lineTo(Math.cos(a) * r * 0.82 * k, Math.sin(a) * r * 0.82 * k); ctx.globalAlpha = 0.35; ctx.stroke(); ctx.globalAlpha = 1;
  }
  ctx.fillStyle = '#D89A1E'; ctx.beginPath(); ctx.arc(1, 2, r * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.centre; ctx.beginPath(); ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8A5A2B'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(-r * 0.1, -r * 0.1, r * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
export function drawDecor(ctx: CanvasRenderingContext2D, d: Decor, t: number) {
  if (d.kind === 'island' || d.kind === 'stalk') return; // drawn in the backdrop
  const px = d.cx * T, py = d.cy * T, base = py + T + 4, s = hash(d.cx, d.cy);
  if (d.kind === 'bush') {
    const x = px + T / 2, w = 34 + s * 18;
    const blobs = [[-0.42, 0.16, 0.34], [-0.18, 0.44, 0.4], [0.16, 0.5, 0.44], [0.42, 0.2, 0.34], [0, 0.22, 0.42], [-0.28, 0.7, 0.26], [0.3, 0.74, 0.24]];
    const rad = (bx: number, br: number) => w * br * (0.9 + hash(d.cx + bx * 10, d.cy) * 0.25);
    ctx.fillStyle = C.edge; ctx.beginPath();
    for (const [bx, by, br] of blobs) { const r = rad(bx, br) + 2; ctx.moveTo(x + bx * w + r, base - by * w + 1); ctx.arc(x + bx * w, base - by * w + 1, r, 0, Math.PI * 2); }
    ctx.fill();
    ctx.fillStyle = C.bush; ctx.beginPath();
    for (const [bx, by, br] of blobs) { const r = rad(bx, br); ctx.moveTo(x + bx * w + r, base - by * w); ctx.arc(x + bx * w, base - by * w, r, 0, Math.PI * 2); }
    ctx.fill();
    ctx.fillStyle = C.bush2; ctx.beginPath();
    for (const [bx, by, br] of blobs.slice(0, 5)) { const r = w * br * 0.5 * (0.92 + hash(d.cy, d.cx + bx * 10) * 0.16); ctx.moveTo(x + bx * w - w * 0.07 + r, base - by * w - w * 0.12); ctx.arc(x + bx * w - w * 0.07, base - by * w - w * 0.12, r, 0, Math.PI * 2); }
    ctx.fill();
    ctx.fillStyle = C.grass2; ctx.beginPath(); ctx.arc(x - w * 0.24, base - w * 0.64, 2, 0, Math.PI * 2); ctx.arc(x + w * 0.12, base - w * 0.78, 1.8, 0, Math.PI * 2); ctx.fill();
  } else if (d.kind === 'flower' || d.kind === 'whiteflower') {
    const x = px + T / 2, sway = Math.sin(t * 1.4 + s * 6) * 2, h = (d.kind === 'flower' ? 40 : 32) + s * 10;
    ctx.strokeStyle = C.stem2; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + 4, base - h * 0.6, x + sway, base - h); ctx.stroke();
    ctx.strokeStyle = C.stem; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + 4, base - h * 0.6, x + sway, base - h); ctx.stroke();
    leaf(ctx, x - 2, base - h * 0.4, -0.9, 12); leaf(ctx, x + 2, base - h * 0.6, 0.6, 11);
    if (d.kind === 'flower') drawBloom(ctx, x + sway, base - h - 12, 28, C.flower, C.flower2, t + s * 6);
    else drawBloom(ctx, x + sway, base - h - 9, 17, C.petalWhite, C.petalWhite2, t + s * 6);
  } else if (d.kind === 'sign') {
    drawSign(ctx, d.cx, d.cy, d.dir ?? 'right', C.arrow, t);
  }
}
export function drawHill(ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number) {
  ctx.fillStyle = C.body; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, groundY + 8); ctx.quadraticCurveTo(w * 0.5, groundY - 24, w, groundY + 8); ctx.lineTo(w, h); ctx.fill();
  ctx.fillStyle = C.grass; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, groundY + 16); ctx.quadraticCurveTo(w * 0.5, groundY - 12, w, groundY + 16); ctx.lineTo(w, groundY + 30); ctx.quadraticCurveTo(w * 0.5, groundY + 2, 0, groundY + 30); ctx.fill();
}
