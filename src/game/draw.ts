// Every sprite of the level as canvas paths, in whichever palette the world is wearing.
import { D, type Solid, type BgItem, type Bush, type Flower, type Sign, type Plank, type Machine, type Pumpkin, type Pt } from './types';
import { FIXED as F, type Palette } from './palette';
import { hash } from './geom';

export const FONT = '"Arial Rounded MT Bold", "Nunito", "Varela Round", "Trebuchet MS", "Segoe UI", sans-serif';

// ---- world ---------------------------------------------------------------------------------------------------------
export function drawSky(ctx: CanvasRenderingContext2D, P: Palette, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, P.sky0); g.addColorStop(1, P.sky1);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
export function drawClouds(ctx: CanvasRenderingContext2D, P: Palette, camX: number, camY: number, vw: number, vh: number, t: number) {
  ctx.fillStyle = P.cloud;
  const step = 560;
  for (let j = 0; j < 3; j++) {
    const px = camX * (0.3 + j * 0.08) + t * (5 + j * 3), py = camY * (0.4 + j * 0.1);
    for (let i = Math.floor((camX - px) / step) - 1; i < (camX - px + vw) / step + 1; i++) {
      const h = hash(i, j + 40); if (h < 0.35) continue;
      const x = px + i * step + h * 220, y = py + ((i * 173 + j * 311) % 900) - 300 + j * 140;
      if (y < camY - 80 || y > camY + vh + 80) continue;
      cloud(ctx, x, y, 70 + h * 80, hash(j, i));
    }
  }
}
function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, v: number) {
  const h = w * 0.36;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h * 0.3, w, h * 0.3, h * 0.15);
  ctx.arc(x - w * 0.26, y - h * 0.32, h * (0.32 + v * 0.1), 0, Math.PI * 2);
  ctx.arc(x - w * 0.02, y - h * 0.5, h * (0.5 - v * 0.08), 0, Math.PI * 2);
  ctx.arc(x + w * 0.27, y - h * 0.3, h * (0.34 + v * 0.06), 0, Math.PI * 2);
  ctx.fill();
}
/** Pale vine stalks on little islands far behind the level. */
export function drawBackdrop(ctx: CanvasRenderingContext2D, P: Palette, items: BgItem[], camX: number, camY: number, vw: number, vh: number) {
  for (const d of items) {
    const x = camX + vw * 0.5 + (d.x - camX - vw * 0.5) * d.depth, y = camY + vh * 0.5 + (d.y - camY - vh * 0.5) * d.depth;
    if (x < camX - 200 || x > camX + vw + 200 || y < camY - 500 || y > camY + vh + 200) continue;
    const s = d.seed, iw = 70 + s * 60, dp = 26 + s * 18;
    ctx.save(); ctx.globalAlpha = 0.9;
    // the island: a lobed drop with a grass cap
    ctx.fillStyle = P.bgIsland2; ctx.beginPath(); ctx.moveTo(x - iw / 2, y); ctx.quadraticCurveTo(x - iw * 0.42, y + dp * 0.9, x - iw * 0.18, y + dp * 0.72); ctx.quadraticCurveTo(x, y + dp * 1.15, x + iw * 0.2, y + dp * 0.7); ctx.quadraticCurveTo(x + iw * 0.44, y + dp * 0.85, x + iw / 2, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.bgIsland; ctx.beginPath(); ctx.moveTo(x - iw / 2 + 4, y + 1); ctx.lineTo(x + iw / 2 - 4, y + 1); ctx.quadraticCurveTo(x + iw * 0.1, y + dp * 0.45, x - iw * 0.3, y + dp * 0.3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.bgGrass; ctx.beginPath(); ctx.roundRect(x - iw / 2 - 3, y - 7, iw + 6, 10, 5); ctx.fill();
    ctx.fillStyle = P.bgCap; ctx.beginPath(); ctx.roundRect(x - iw / 2, y - 7, iw, 3, 1.5); ctx.fill();
    if (d.kind === 'stalk') {
      const sh = 130 + s * 220, sw = 22 + hash(s, 2) * 20, sx = x - iw * 0.12;
      ctx.fillStyle = P.bgStalk2; ctx.beginPath(); ctx.roundRect(sx - sw / 2, y - 6 - sh, sw, sh, sw / 2.2); ctx.fill();
      ctx.fillStyle = P.bgStalk; ctx.beginPath(); ctx.roundRect(sx - sw / 2 + 4, y - 6 - sh + 4, sw - 8, sh - 12, (sw - 8) / 2.2); ctx.fill();
      ctx.fillStyle = P.bgStalk2; for (let k = 0; k < 3; k++) { const hy = y - 6 - sh + 30 + k * (sh / 3.2), r = 3 + hash(k, s) * 3; ctx.beginPath(); ctx.arc(sx + (hash(k + 1, s) - 0.5) * (sw - 10), hy, r, 0, Math.PI * 2); ctx.fill(); }
      for (let k = 0; k < 2; k++) {
        if (hash(k + 7, s) < 0.4) continue; const side = k ? 1 : -1, by = y - 6 - sh * (0.35 + k * 0.3), len = 14 + hash(k, s + 1) * 16;
        ctx.save(); ctx.translate(sx + side * (sw / 2 - 5), by); ctx.rotate(side * -0.55); ctx.fillStyle = P.bgStalk2; ctx.beginPath(); ctx.roundRect(side < 0 ? -len : 0, -6, len, 12, 6); ctx.fill(); ctx.fillStyle = P.bgCap; ctx.beginPath(); ctx.ellipse(side * len, 0, 3.5, 5.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = P.bgCap; ctx.beginPath(); ctx.ellipse(sx, y - 6 - sh + 2, sw / 2 - 1, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.bgStalk2; ctx.beginPath(); ctx.ellipse(sx, y - 6 - sh + 2, Math.max(1, sw / 2 - 7), 2.5, 0, 0, Math.PI * 2); ctx.fill();
      // a leaf tuft on the island
      ctx.fillStyle = P.bgLeaf; const lx = x + iw * 0.28, ly = y - 6;
      for (let k = 0; k < 5; k++) { const a = -Math.PI * 0.9 + (k / 4) * Math.PI * 0.8; ctx.beginPath(); ctx.ellipse(lx + Math.cos(a) * 10, ly + Math.sin(a) * 10, 11, 3.5, a, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  }
}
/** Body, bark spots, outline and grass for one vine or polygon. */
export function drawSolid(ctx: CanvasRenderingContext2D, P: Palette, s: Solid) {
  if (s.kind === 'vine') {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); s.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.strokeStyle = P.edge; ctx.lineWidth = s.w * 2 + 7; ctx.stroke();
    ctx.strokeStyle = P.body; ctx.lineWidth = s.w * 2; ctx.stroke();
    ctx.fillStyle = P.spot; for (const sp of s.spots) { ctx.beginPath(); ctx.ellipse(sp.x, sp.y, sp.rx, sp.ry, sp.a, 0, Math.PI * 2); ctx.fill(); }
  } else {
    ctx.beginPath(); s.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath();
    ctx.fillStyle = P.body; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = P.spot; for (const sp of s.spots) { ctx.beginPath(); ctx.ellipse(sp.x, sp.y, sp.rx, sp.ry, sp.a, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = P.body2; ctx.globalAlpha = 0.5; ctx.fillRect(s.bbox.x0, s.bbox.y1 - 24 - 14, s.bbox.x1 - s.bbox.x0, 14); ctx.globalAlpha = 1;
    ctx.restore();
    ctx.strokeStyle = P.edge; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.stroke();
  }
  for (const run of s.grass) grass(ctx, P, run, s.id);
}
function raise(pts: Pt[], u: number): Pt[] {
  const n = pts.length, out: Pt[] = new Array(n);
  for (let i = 0; i < n; i++) { const a = pts[Math.min(n - 1, i + 1)], b = pts[Math.max(0, i - 1)], dx = a.x - b.x, dy = a.y - b.y, l = Math.hypot(dx, dy) || 1; let nx = dy / l, ny = -dx / l; if (ny > 0) { nx = -nx; ny = -ny; } out[i] = { x: pts[i].x + nx * u, y: pts[i].y + ny * u }; }
  return out;
}
const path = (ctx: CanvasRenderingContext2D, pts: Pt[]) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); };
function grass(ctx: CanvasRenderingContext2D, P: Palette, run: Pt[], seed: number) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  path(ctx, raise(run, -6)); ctx.strokeStyle = P.grass3; ctx.lineWidth = 15; ctx.stroke();
  path(ctx, raise(run, -3)); ctx.strokeStyle = P.grass; ctx.lineWidth = 11; ctx.stroke();
  // scalloped tufts along the top, the odd pointed blade
  const top = raise(run, 2); ctx.fillStyle = P.grass; ctx.beginPath();
  let acc = 0;
  for (let i = 1; i < top.length; i++) {
    acc += Math.hypot(top[i].x - top[i - 1].x, top[i].y - top[i - 1].y);
    if (acc < 11) continue; acc = 0;
    const h = hash(top[i].x + seed, top[i].y), r = 3.5 + h * 3;
    if (h > 0.82) { ctx.moveTo(top[i].x - 4, top[i].y + 3); ctx.lineTo(top[i].x + (h - 0.9) * 10, top[i].y - 9 - h * 5); ctx.lineTo(top[i].x + 4, top[i].y + 3); ctx.closePath(); }
    else { ctx.moveTo(top[i].x + r, top[i].y); ctx.arc(top[i].x, top[i].y, r, 0, Math.PI * 2); }
  }
  ctx.fill();
  path(ctx, raise(run, 0)); ctx.strokeStyle = P.grass2; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.85; ctx.stroke(); ctx.globalAlpha = 1;
}

// ---- decor ---------------------------------------------------------------------------------------------------------
export function drawBush(ctx: CanvasRenderingContext2D, P: Palette, b: Bush) {
  const w = 46 * b.size, h = 40 * b.size, x = b.x, y = b.y + 4;
  const lobes: [number, number, number][] = [[-0.5, -0.28, 0.34], [-0.2, -0.6, 0.38], [0.16, -0.66, 0.4], [0.48, -0.32, 0.32], [0.02, -0.3, 0.42]];
  const rad = (i: number, r: number) => w * r * (0.9 + hash(b.seed * 10 + i, 1) * 0.22);
  ctx.fillStyle = P.bushLine; ctx.beginPath(); lobes.forEach(([lx, ly, r], i) => { const rr = rad(i, r) + 2.5; ctx.moveTo(x + lx * w + rr, y + ly * h); ctx.arc(x + lx * w, y + ly * h, rr, 0, Math.PI * 2); }); ctx.fill();
  ctx.fillStyle = P.bush; ctx.beginPath(); lobes.forEach(([lx, ly, r], i) => { const rr = rad(i, r); ctx.moveTo(x + lx * w + rr, y + ly * h); ctx.arc(x + lx * w, y + ly * h, rr, 0, Math.PI * 2); }); ctx.fill();
  ctx.fillStyle = P.bush2; ctx.beginPath(); lobes.slice(0, 4).forEach(([lx, ly, r], i) => { const rr = rad(i, r) * 0.5; ctx.moveTo(x + lx * w - w * 0.06 + rr, y + ly * h - h * 0.14); ctx.arc(x + lx * w - w * 0.06, y + ly * h - h * 0.14, rr, 0, Math.PI * 2); }); ctx.fill();
}
function leaf(ctx: CanvasRenderingContext2D, P: Palette, x: number, y: number, a: number, len: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = P.stem; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -len * 0.42, len, 0); ctx.quadraticCurveTo(len * 0.5, len * 0.42, 0, 0); ctx.fill();
  ctx.strokeStyle = P.leafLine; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(len - 4, 0); ctx.strokeStyle = P.stem2; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.restore();
}
export function drawFlower(ctx: CanvasRenderingContext2D, P: Palette, f: Flower, t: number) {
  const red = f.kind === 'red', x = f.x, base = f.y + 3, sway = Math.sin(t * 1.3 + f.seed * 7) * 2.5;
  ctx.lineCap = 'round';
  if (red) {
    const h = 58 + f.seed * 10, tx = x + 6 + sway, ty = base - h;
    ctx.strokeStyle = P.stem2; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + 3, base - h * 0.55, tx, ty); ctx.stroke();
    ctx.strokeStyle = P.stem; ctx.lineWidth = 4; ctx.stroke();
    leaf(ctx, P, x - 1, base - h * 0.35, -2.5, 22); leaf(ctx, P, x + 3, base - h * 0.55, -0.6, 20);
    bloom(ctx, P, tx, ty - 22, 42, f.seed, t);
  } else {
    // a tall curling stem with a big white five-point bloom
    const h = 96 + f.seed * 16, tx = x + 14 + sway, ty = base - h;
    const stem = () => { ctx.beginPath(); ctx.moveTo(x, base); ctx.bezierCurveTo(x - 6, base - h * 0.45, x - 26, base - h * 0.85, x - 2, base - h * 0.98); ctx.bezierCurveTo(x + 10, base - h * 1.04, tx + 4, base - h * 0.96, tx, ty); };
    stem(); ctx.strokeStyle = P.stem2; ctx.lineWidth = 8; ctx.stroke(); stem(); ctx.strokeStyle = P.stem; ctx.lineWidth = 4.5; ctx.stroke();
    leaf(ctx, P, x - 4, base - h * 0.3, -2.7, 26); leaf(ctx, P, x + 1, base - h * 0.5, -0.5, 24); leaf(ctx, P, x - 14, base - h * 0.72, -2.9, 20);
    whiteBloom(ctx, P, tx, ty + 6, 50, f.seed, t);
  }
}
function bloom(ctx: CanvasRenderingContext2D, P: Palette, x: number, y: number, r: number, seed: number, t: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 0.9 + seed) * 0.04);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2, k = 1 + (hash(seed * 9, i) - 0.5) * 0.14;
    ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(r * 0.56 * k, 0, r * 0.46 * k, r * 0.33 * k, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.flower; ctx.fill(); ctx.strokeStyle = P.flowerLine; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.fillStyle = P.flower2; ctx.beginPath(); ctx.ellipse(r * 0.28, 0, r * 0.26, r * 0.3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.strokeStyle = P.flowerLine; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(r * 0.3, 0); ctx.lineTo(r * 0.9 * k, 0); ctx.moveTo(r * 0.34, -r * 0.1); ctx.lineTo(r * 0.82 * k, -r * 0.16); ctx.moveTo(r * 0.34, r * 0.1); ctx.lineTo(r * 0.82 * k, r * 0.16); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.restore();
  }
  ctx.fillStyle = P.centre2; ctx.beginPath(); ctx.arc(1, 2, r * 0.27, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.centre; ctx.beginPath(); ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = P.flowerLine; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-r * 0.08, -r * 0.09, r * 0.1, r * 0.06, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function whiteBloom(ctx: CanvasRenderingContext2D, P: Palette, x: number, y: number, r: number, seed: number, t: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 0.8 + seed * 3) * 0.05 + 0.3);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2, k = 1 + (hash(seed * 7, i) - 0.5) * 0.12;
    ctx.save(); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(r * 0.12, 0); ctx.quadraticCurveTo(r * 0.5, -r * 0.34 * k, r * k, -r * 0.04); ctx.quadraticCurveTo(r * 0.5, r * 0.34 * k, r * 0.12, 0); ctx.closePath();
    ctx.fillStyle = P.white; ctx.fill(); ctx.strokeStyle = P.whiteLine; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.fillStyle = P.white2; ctx.beginPath(); ctx.moveTo(r * 0.15, 0); ctx.quadraticCurveTo(r * 0.5, r * 0.3, r * 0.95, 0); ctx.quadraticCurveTo(r * 0.5, r * 0.08, r * 0.15, 0); ctx.fill(); ctx.restore();
    ctx.restore();
  }
  ctx.fillStyle = P.whiteCentre; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.13, r * 0.16, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = P.whiteLine; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.arc(-r * 0.04, -r * 0.05, r * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
export function drawSign(ctx: CanvasRenderingContext2D, P: Palette, s: Sign) {
  const x = s.x, y = s.y, bw = 66, bh = 42, by = y - 17 - bh;
  ctx.fillStyle = P.post; ctx.beginPath(); ctx.roundRect(x - 3.5, y - 20, 7, 21, 2); ctx.fill();
  ctx.fillStyle = '#5E5E5E'; ctx.fillRect(x - 3.5, y - 20, 2, 21);
  ctx.save(); ctx.translate(x, by + bh / 2); ctx.rotate((s.seed - 0.5) * 0.08);
  ctx.fillStyle = P.boardLine; ctx.beginPath(); ctx.roundRect(-bw / 2 - 2.5, -bh / 2 - 2.5, bw + 5, bh + 5, 4); ctx.fill();
  ctx.fillStyle = P.board2; ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 3); ctx.fill();
  ctx.fillStyle = P.board; ctx.beginPath(); ctx.roundRect(-bw / 2 + 2, -bh / 2 + 2, bw - 4, bh - 8, 2); ctx.fill();
  ctx.strokeStyle = P.board2; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(-bw / 2 + 6, -bh / 2 + 9); ctx.quadraticCurveTo(-bw / 2 + 14, -bh / 2 + 6, -bw / 2 + 24, -bh / 2 + 10); ctx.moveTo(bw / 2 - 26, bh / 2 - 12); ctx.quadraticCurveTo(bw / 2 - 16, bh / 2 - 15, bw / 2 - 6, bh / 2 - 11); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = P.boardLine; ctx.beginPath(); ctx.arc(-bw / 2 + 5, -bh / 2 + 5, 1.6, 0, Math.PI * 2); ctx.arc(bw / 2 - 5, bh / 2 - 8, 1.6, 0, Math.PI * 2); ctx.fill();
  if (s.face === 'warn') {
    ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(16, 12); ctx.lineTo(-16, 12); ctx.closePath(); ctx.fillStyle = P.icon; ctx.fill(); ctx.strokeStyle = P.iconLine; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = P.iconLine; ctx.beginPath(); ctx.roundRect(-2, -6, 4, 10, 1.5); ctx.fill(); ctx.beginPath(); ctx.arc(0, 8, 2.2, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.save(); if (s.face === 'up') ctx.rotate(Math.PI);
    ctx.beginPath(); ctx.moveTo(-7, -14); ctx.lineTo(7, -14); ctx.lineTo(7, 0); ctx.lineTo(15, 0); ctx.lineTo(0, 15); ctx.lineTo(-15, 0); ctx.lineTo(-7, 0); ctx.closePath();
    ctx.fillStyle = P.icon2; ctx.fill(); ctx.strokeStyle = P.iconLine; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
export function drawEgg(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, scale = 1) {
  const bob = t >= 0 ? Math.sin(t * 2.4) * 3 : 0;
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(scale, scale); ctx.rotate(0.18);
  const egg = () => { ctx.beginPath(); ctx.moveTo(0, -16); ctx.bezierCurveTo(8, -16, 13.5, -5, 13.5, 3); ctx.bezierCurveTo(13.5, 10.5, 7.5, 15.5, 0, 15.5); ctx.bezierCurveTo(-7.5, 15.5, -13.5, 10.5, -13.5, 3); ctx.bezierCurveTo(-13.5, -5, -8, -16, 0, -16); ctx.closePath(); };
  egg(); ctx.fillStyle = F.egg; ctx.fill();
  ctx.save(); egg(); ctx.clip(); ctx.fillStyle = F.egg2; ctx.beginPath(); ctx.ellipse(5, 6, 12, 13, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.fillStyle = F.eggShine; ctx.beginPath(); ctx.ellipse(-4.5, -6, 3.2, 5, -0.3, 0, Math.PI * 2); ctx.fill();
  egg(); ctx.strokeStyle = F.eggLine; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
/** The ball: a plain glossy red sphere. No face. */
export function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, sx: number, sy: number) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = F.ball; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = F.ball2; ctx.beginPath(); ctx.arc(r * 0.28, r * 0.34, r * 0.95, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = F.ball; ctx.beginPath(); ctx.arc(-r * 0.12, -r * 0.14, r * 0.78, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r - 1, 0, Math.PI * 2); ctx.strokeStyle = F.ballLine; ctx.lineWidth = Math.max(2, r * 0.12); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-r * 0.36, -r * 0.4, r * 0.3, r * 0.2, -0.7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = F.shine; ctx.beginPath(); ctx.ellipse(-r * 0.42, -r * 0.46, r * 0.16, r * 0.11, -0.7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
export function drawPlank(ctx: CanvasRenderingContext2D, p: Plank) {
  const w = 0.55 * D, px = p.x + w / 2, py = p.y + 10;
  ctx.save(); ctx.translate(px, py); ctx.rotate(p.state === 'up' ? 0 : p.state === 'down' ? Math.PI / 2 : p.a);
  ctx.fillStyle = F.plank2; ctx.beginPath(); ctx.roundRect(-w - 2, -p.len - 2, w + 4, p.len + 4, 3); ctx.fill();
  ctx.fillStyle = F.plank; ctx.beginPath(); ctx.roundRect(-w, -p.len, w, p.len, 2); ctx.fill();
  ctx.fillStyle = F.plankLight; ctx.fillRect(-w + 2, -p.len + 2, 6, p.len - 4);
  ctx.strokeStyle = F.plank2; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.6; for (let k = 0; k < 4; k++) { const gy = -p.len + 20 + k * (p.len / 4.3); ctx.beginPath(); ctx.moveTo(-w + 9, gy); ctx.quadraticCurveTo(-w / 2 + 2, gy + 8, -3, gy + 2); ctx.stroke(); } ctx.globalAlpha = 1;
  ctx.restore();
}
export function drawMachine(ctx: CanvasRenderingContext2D, P: Palette, m: Machine, t: number) {
  const x = m.x, y = m.y, w = m.w, h = m.h, bottom = y + h;
  // the trunk on the island above, dead while the machine runs, alive again after
  const tx = m.trunk.x, ty = m.trunk.y;
  ctx.fillStyle = P.bgStalk2; ctx.beginPath(); ctx.roundRect(tx - 12, ty - 104, 24, 108, 10); ctx.fill();
  ctx.fillStyle = P.bgStalk; ctx.beginPath(); ctx.roundRect(tx - 8, ty - 100, 16, 100, 7); ctx.fill();
  ctx.fillStyle = P.bgStalk2; ctx.beginPath(); ctx.arc(tx - 2, ty - 60, 3, 0, Math.PI * 2); ctx.arc(tx + 3, ty - 30, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(tx + 9, ty - 70); ctx.rotate(-0.6); ctx.fillStyle = P.bgStalk2; ctx.beginPath(); ctx.roundRect(0, -5, 20, 10, 5); ctx.fill(); ctx.fillStyle = P.bgCap; ctx.beginPath(); ctx.ellipse(20, 0, 3, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.fillStyle = P.bgCap; ctx.beginPath(); ctx.ellipse(tx, ty - 102, 11, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.bgLeaf; for (let k = 0; k < 4; k++) { const a = -Math.PI * 0.85 + (k / 3) * Math.PI * 0.7; ctx.beginPath(); ctx.ellipse(tx + 16 + Math.cos(a) * 9, ty - 4 + Math.sin(a) * 9, 10, 3.2, a, 0, Math.PI * 2); ctx.fill(); }
  if (!m.destroyed) {
    // the lightning from the trunk into the funnel
    const x0 = tx, y0 = ty + 2, x1 = x + w * 0.36, y1 = y - 26, seed = Math.floor(t * 24);
    const bolt = () => { ctx.beginPath(); ctx.moveTo(x0, y0); for (let k = 1; k < 9; k++) { const f = k / 9; ctx.lineTo(x0 + (x1 - x0) * f + (hash(seed, k) - 0.5) * 22, y0 + (y1 - y0) * f + (hash(k, seed) - 0.5) * 8); } ctx.lineTo(x1, y1); };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; bolt(); ctx.strokeStyle = F.bolt2; ctx.lineWidth = 7; ctx.globalAlpha = 0.6; ctx.stroke(); ctx.globalAlpha = 1; bolt(); ctx.strokeStyle = F.bolt; ctx.lineWidth = 3; ctx.stroke();
    // the rainbow pipe elbow on the left
    const cols = ['#F04A4A', '#F5A623', '#F8E71C', '#7ED321', '#4A90E2', '#9013FE'];
    ctx.lineCap = 'butt'; ctx.lineWidth = 3;
    cols.forEach((c, i) => { const o = (i - 2.5) * 3; ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(x + 6, bottom - 24 + o); ctx.lineTo(x - 18 - o * 0.4, bottom - 24 + o); ctx.lineTo(x - 18 - o * 0.4, bottom - 52 + o * 0.4); ctx.stroke(); });
    ctx.strokeStyle = F.machineLine; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 6, bottom - 34); ctx.lineTo(x - 22, bottom - 34); ctx.lineTo(x - 22, bottom - 54); ctx.moveTo(x + 6, bottom - 14); ctx.lineTo(x - 12, bottom - 14); ctx.lineTo(x - 12, bottom - 50); ctx.stroke();
    ctx.fillStyle = F.machine2; ctx.beginPath(); ctx.roundRect(x - 26, bottom - 58, 18, 8, 2); ctx.fill();
    // body
    ctx.fillStyle = F.machineLine; ctx.beginPath(); ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 8); ctx.fill();
    ctx.fillStyle = F.machine; ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill();
    ctx.fillStyle = F.machine2; ctx.beginPath(); ctx.roundRect(x, y + h * 0.7, w, h * 0.3, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.roundRect(x + 4, y + 3, w - 8, 6, 3); ctx.fill();
    ctx.strokeStyle = F.machineLine; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 6, y + h * 0.7); ctx.lineTo(x + w - 6, y + h * 0.7); ctx.stroke();
    ctx.fillStyle = F.machineLine; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x + 12 + k * 10, bottom - 10, 2, 0, Math.PI * 2); ctx.fill(); }
    // the spiral disc
    const cx = x + w * 0.66, cy = y + h * 0.42, r = 27;
    ctx.fillStyle = F.machineLine; ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = F.spiral; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = F.spiralInk; ctx.lineWidth = 6; ctx.lineCap = 'butt'; ctx.beginPath();
    const rot = t * 2.2; for (let k = 0; k <= 60; k++) { const a = rot + (k / 60) * Math.PI * 4.4, rr = 2 + (k / 60) * (r - 5); k ? ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.stroke();
    // the funnel on top
    const fx = x + w * 0.36;
    ctx.fillStyle = F.funnel2; ctx.beginPath(); ctx.moveTo(fx - 22, y - 28); ctx.lineTo(fx + 22, y - 28); ctx.lineTo(fx + 8, y - 6); ctx.lineTo(fx + 8, y + 2); ctx.lineTo(fx - 8, y + 2); ctx.lineTo(fx - 8, y - 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = F.funnel; ctx.beginPath(); ctx.moveTo(fx - 18, y - 26); ctx.lineTo(fx + 18, y - 26); ctx.lineTo(fx + 5, y - 8); ctx.lineTo(fx - 5, y - 8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = F.machineLine; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx - 22, y - 28); ctx.lineTo(fx + 22, y - 28); ctx.lineTo(fx + 8, y - 6); ctx.lineTo(fx + 8, y + 2); ctx.lineTo(fx - 8, y + 2); ctx.lineTo(fx - 8, y - 6); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = F.funnel2; ctx.beginPath(); ctx.ellipse(fx, y - 28, 22, 4, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    // the wreck: a low grey heap, the disc cracked, the funnel bent
    const top = bottom - h * 0.55;
    ctx.fillStyle = F.machineLine; ctx.beginPath(); ctx.moveTo(x - 6, bottom); ctx.lineTo(x + 6, top + 6); ctx.lineTo(x + 30, top - 2); ctx.lineTo(x + 58, top + 10); ctx.lineTo(x + 84, top - 6); ctx.lineTo(x + w + 4, top + 14); ctx.lineTo(x + w + 6, bottom); ctx.closePath(); ctx.fill();
    ctx.fillStyle = F.machine2; ctx.beginPath(); ctx.moveTo(x - 3, bottom); ctx.lineTo(x + 8, top + 9); ctx.lineTo(x + 30, top + 1); ctx.lineTo(x + 58, top + 13); ctx.lineTo(x + 84, top - 3); ctx.lineTo(x + w + 1, top + 16); ctx.lineTo(x + w + 3, bottom); ctx.closePath(); ctx.fill();
    ctx.fillStyle = F.machine; ctx.beginPath(); ctx.moveTo(x + 10, top + 12); ctx.lineTo(x + 30, top + 4); ctx.lineTo(x + 52, top + 14); ctx.lineTo(x + 48, top + 30); ctx.lineTo(x + 12, top + 28); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = F.machineLine; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 14, top + 20); ctx.lineTo(x + 40, top + 16); ctx.moveTo(x + 60, top + 22); ctx.lineTo(x + 90, top + 14); ctx.stroke();
    const cx = x + w * 0.66, cy = top + 12, r = 24;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.5);
    ctx.fillStyle = F.machineLine; ctx.beginPath(); ctx.arc(0, 0, r + 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = F.spiral; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = F.spiralInk; ctx.lineWidth = 5; ctx.beginPath(); for (let k = 0; k <= 50; k++) { const a = (k / 50) * Math.PI * 3.8, rr = 2 + (k / 50) * (r - 5); k ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.stroke();
    ctx.strokeStyle = F.machineLine; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-r, -6); ctx.lineTo(-8, 2); ctx.lineTo(-14, 14); ctx.lineTo(4, r - 2); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = F.funnel2; ctx.save(); ctx.translate(x + 8, top - 4); ctx.rotate(-0.9); ctx.beginPath(); ctx.moveTo(-16, -22); ctx.lineTo(16, -22); ctx.lineTo(5, -4); ctx.lineTo(-5, -4); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = F.machine2; for (let k = 0; k < 5; k++) { const bx = x - 30 + k * 40 + hash(k, 3) * 20, br = 3 + hash(k, 5) * 4; ctx.beginPath(); ctx.arc(bx, bottom - br, br, Math.PI, 0); ctx.fill(); }
  }
}
export function drawPumpkin(ctx: CanvasRenderingContext2D, p: Pumpkin) {
  const x = p.x, base = p.y, rx = p.r, ry = p.r * 0.82, cy = base - ry;
  ctx.fillStyle = F.pumpkinLine; ctx.beginPath(); ctx.ellipse(x, cy, rx + 3, ry + 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = F.pumpkin; ctx.beginPath(); ctx.ellipse(x, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = F.pumpkin2; ctx.beginPath(); ctx.ellipse(x + rx * 0.35, cy + ry * 0.35, rx * 0.95, ry * 0.9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = F.pumpkin; ctx.beginPath(); ctx.ellipse(x - rx * 0.1, cy - ry * 0.12, rx * 0.8, ry * 0.78, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = F.pumpkin2; ctx.lineWidth = 4; for (const k of [-0.62, -0.28, 0.1, 0.5]) { ctx.beginPath(); ctx.ellipse(x + rx * k, cy, rx * 0.34, ry * 0.98, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = F.pumpkinLine; for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.ellipse(x - rx * 0.7 + hash(k, 8) * rx * 1.5, cy - ry * 0.7 + hash(k, 9) * ry * 1.5, 4 + hash(k, 10) * 4, 3 + hash(k, 11) * 3, hash(k, 12) * 3, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  // the door, an arch on the near side
  const dx = x + rx * 0.12, dw = rx * 0.58, dh = ry * 0.98;
  ctx.fillStyle = F.pumpkinLine; ctx.beginPath(); ctx.moveTo(dx - dw / 2 - 3, base + 1); ctx.lineTo(dx - dw / 2 - 3, base - dh + dw / 2); ctx.arc(dx, base - dh + dw / 2, dw / 2 + 3, Math.PI, 0); ctx.lineTo(dx + dw / 2 + 3, base + 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = F.pumpkinDoor; ctx.beginPath(); ctx.moveTo(dx - dw / 2, base); ctx.lineTo(dx - dw / 2, base - dh + dw / 2); ctx.arc(dx, base - dh + dw / 2, dw / 2, Math.PI, 0); ctx.lineTo(dx + dw / 2, base); ctx.closePath(); ctx.fill();
  // stem and leaf
  ctx.strokeStyle = F.pumpkinLine; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 4, cy - ry + 2); ctx.quadraticCurveTo(x - 10, cy - ry - 22, x + 12, cy - ry - 30); ctx.stroke();
  ctx.strokeStyle = F.pumpkinStem; ctx.lineWidth = 7; ctx.stroke();
  ctx.save(); ctx.translate(x + 14, cy - ry - 26); ctx.rotate(-0.4); ctx.fillStyle = F.pumpkinStem; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(16, -14, 34, -2); ctx.quadraticCurveTo(16, 8, 0, 0); ctx.fill(); ctx.strokeStyle = F.pumpkinLine; ctx.lineWidth = 1.8; ctx.stroke(); ctx.restore();
}
export function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, fill: string, line: string) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? r * 0.45 : r; k ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = line; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
export function drawSpiral(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, color: string, alpha: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, r * 0.22); ctx.lineCap = 'round'; ctx.beginPath();
  for (let k = 0; k <= 30; k++) { const a = (k / 30) * Math.PI * 3.6, rr = (k / 30) * r; k ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(0, 0); }
  ctx.stroke(); ctx.restore();
}
export function drawSmoke(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number, seed: number) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = F.smoke2; ctx.beginPath();
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + seed, rr = r * (0.55 + hash(seed, k) * 0.25); ctx.moveTo(x + Math.cos(a) * r * 0.45 + rr, y + Math.sin(a) * r * 0.4); ctx.arc(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.4, rr, 0, Math.PI * 2); }
  ctx.fill(); ctx.fillStyle = F.smoke; ctx.beginPath(); ctx.arc(x - r * 0.15, y - r * 0.15, r * 0.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

// ---- screen space: HUD and the notebook cards ------------------------------------------------------------------------
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function outlined(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, align: CanvasTextAlign, fill = F.hud, line = F.hudLine) {
  ctx.font = `bold ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  ctx.strokeStyle = line; ctx.lineWidth = size * 0.22; ctx.strokeText(text, x, y); ctx.fillStyle = fill; ctx.fillText(text, x, y);
}
export function drawHud(ctx: CanvasRenderingContext2D, w: number, eggs: number, total: number, time: number, small: boolean) {
  const s = small ? 0.8 : 1, top = small ? 30 : 34;
  drawEgg(ctx, 26 * s + 4, top - 2, -1, 0.95 * s);
  outlined(ctx, `${eggs}/${total}`, 46 * s + 6, top + 9 * s, 30 * s, 'left');
  outlined(ctx, fmt(time), w - 56 * s, top + 9 * s, 30 * s, 'right');
  const cx = w - 30 * s, cy = top - 2;
  ctx.fillStyle = F.hudLine; ctx.beginPath(); ctx.arc(cx, cy, 15 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(cx, cy, 12.5 * s, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = F.hudLine; ctx.lineWidth = 2.5 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 7 * s); ctx.moveTo(cx, cy); ctx.lineTo(cx + 5 * s, cy + 2 * s); ctx.stroke();
}
export interface Card { kind: 'start' | 'done'; eggs: number; total: number; time: number; best: boolean }
export function drawCard(ctx: CanvasRenderingContext2D, w: number, h: number, c: Card, t: number) {
  ctx.fillStyle = F.backdrop; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = F.backdrop2; ctx.globalAlpha = 0.5; for (let k = 0; k < 6; k++) { const y = (k / 6) * h + Math.sin(k * 3.1) * 8; ctx.fillRect(0, y, w, h / 12); } ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, w, 3); ctx.fillRect(0, h - 26, w, 26);
  const pw = Math.min(w * 0.6, 330), ph = Math.min(h * 0.78, 420), px = w / 2 - pw / 2, py = h / 2 - ph / 2 - 8;
  // the stacked page
  for (let k = 3; k >= 1; k--) { ctx.save(); ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate(k * 0.012); ctx.fillStyle = k === 1 ? F.paper2 : F.paperLine; ctx.beginPath(); ctx.roundRect(-pw / 2 + k * 3, -ph / 2 + k * 2, pw, ph, 4); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = F.paper; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 4); ctx.fill();
  ctx.strokeStyle = F.paperLine; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = F.paperLine; ctx.globalAlpha = 0.35; for (let y = py + 46; y < py + ph - 10; y += 22) ctx.fillRect(px + 14, y, pw - 28, 1); ctx.globalAlpha = 1;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const s = Math.min(1, pw / 330);
  if (c.kind === 'start') {
    ctx.fillStyle = F.title; ctx.font = `bold ${22 * s}px ${FONT}`; ctx.fillText('Chapter 3:', w / 2, py + 44 * s); ctx.fillText('Seeking Answers', w / 2, py + 72 * s);
    // a sprout on a cloud
    const cx = w / 2, cy = py + ph * 0.5;
    ctx.fillStyle = '#DDE8F2'; cloud(ctx, cx, cy + 30 * s, 120 * s, 0.4); ctx.fillStyle = '#FFFFFF'; cloud(ctx, cx - 4, cy + 26 * s, 110 * s, 0.6);
    ctx.strokeStyle = '#4FAE32'; ctx.lineWidth = 9 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 6 * s, cy + 22 * s); ctx.bezierCurveTo(cx - 10 * s, cy - 10 * s, cx + 30 * s, cy - 40 * s, cx + 8 * s, cy - 58 * s); ctx.stroke();
    ctx.strokeStyle = '#8CE05A'; ctx.lineWidth = 4 * s; ctx.stroke();
    ctx.fillStyle = '#4FAE32'; ctx.beginPath(); ctx.ellipse(cx - 20 * s, cy - 8 * s, 18 * s, 8 * s, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx + 22 * s, cy - 30 * s, 16 * s, 7 * s, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = F.text; ctx.font = `bold ${16 * s}px ${FONT}`; ctx.fillText('Score: 0', w / 2, py + ph - 52 * s);
    drawEgg(ctx, w / 2 - 30 * s, py + ph - 26 * s, -1, 0.6 * s); ctx.fillStyle = F.text; ctx.fillText(`0/${c.total}`, w / 2 + 12 * s, py + ph - 20 * s);
    ctx.fillStyle = '#F2E4C4'; ctx.font = `bold 13px ${FONT}`; ctx.textAlign = 'left'; ctx.fillText('Select', 14, h - 9); ctx.textAlign = 'right'; ctx.fillText('Back', w - 14, h - 9);
    ctx.fillStyle = '#8CE05A'; ctx.globalAlpha = 0.6 + Math.sin(t * 4) * 0.3; ctx.beginPath(); ctx.moveTo(px - 26, py + ph / 2 - 8); ctx.lineTo(px - 10, py + ph / 2); ctx.lineTo(px - 26, py + ph / 2 + 8); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(px + pw + 26, py + ph / 2 - 8); ctx.lineTo(px + pw + 10, py + ph / 2); ctx.lineTo(px + pw + 26, py + ph / 2 + 8); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = '#E8341C'; ctx.font = `bold ${20 * s}px ${FONT}`; ctx.fillText('Chapter completed!', w / 2, py + 40 * s);
    drawEgg(ctx, w / 2 - 40 * s, py + 84 * s, -1, 0.7 * s); ctx.fillStyle = F.text; ctx.font = `bold ${17 * s}px ${FONT}`; ctx.textAlign = 'left'; ctx.fillText(`${c.eggs}/${c.total}`, w / 2 - 20 * s, py + 90 * s);
    ctx.fillStyle = F.hudLine; ctx.beginPath(); ctx.arc(w / 2 - 40 * s, py + 120 * s, 11 * s, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(w / 2 - 40 * s, py + 120 * s, 9 * s, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = F.hudLine; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w / 2 - 40 * s, py + 120 * s); ctx.lineTo(w / 2 - 40 * s, py + 114 * s); ctx.moveTo(w / 2 - 40 * s, py + 120 * s); ctx.lineTo(w / 2 - 36 * s, py + 122 * s); ctx.stroke();
    ctx.fillStyle = F.text; ctx.fillText(fmt(c.time), w / 2 - 20 * s, py + 126 * s);
    ctx.textAlign = 'center'; if (c.best) { ctx.fillStyle = F.text; ctx.font = `bold ${15 * s}px ${FONT}`; ctx.fillText('New high score!', w / 2, py + 160 * s); }
    ctx.fillStyle = '#F2E4C4'; ctx.font = `bold 13px ${FONT}`; ctx.fillText('OK', w / 2, h - 9);
  }
}
/** The small softkey arrow in the corner of the original's screen. */
export function drawCorner(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.moveTo(w - 22, h - 16); ctx.lineTo(w - 10, h - 16); ctx.lineTo(w - 16, h - 9); ctx.closePath(); ctx.fill();
}
