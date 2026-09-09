// Traces the solid tile grid into closed outlines and rounds them, so trunks and branches read as one organic shape.
import { T, type Level } from './types';

export interface Pt { x: number; y: number }
export interface Loop { pts: Pt[]; minX: number; minY: number; maxX: number; maxY: number }
export interface Cap { x0: number; x1: number; y: number }
export interface Contours { loops: Loop[]; caps: Cap[] }

const isBody = (v: number) => v === 1 || v === 3 || v === 5;
const cache = new WeakMap<Uint8Array, Contours>();
export function invalidateContours(solid: Uint8Array) { cache.delete(solid); }

export function contours(L: Level, solid: Uint8Array): Contours {
  const hit = cache.get(solid); if (hit) return hit;
  const PAD = 3;
  // out-of-map cells copy the nearest in-map cell, so shapes at the edges continue off screen
  const body = (x: number, y: number) => { const cx = Math.max(0, Math.min(L.w - 1, x)), cy = Math.max(0, Math.min(L.h - 1, y)); if (y < -PAD || y >= L.h + PAD || x < -PAD || x >= L.w + PAD) return false; return isBody(solid[cy * L.w + cx]); };
  // directed boundary edges, clockwise on screen (interior on the right of travel)
  type E = { a: Pt; b: Pt; used: boolean };
  const edges: E[] = []; const byStart = new Map<string, E[]>();
  const key = (p: Pt) => p.x + ',' + p.y;
  const add = (ax: number, ay: number, bx: number, by: number) => { const e = { a: { x: ax, y: ay }, b: { x: bx, y: by }, used: false }; edges.push(e); const k = key(e.a); (byStart.get(k) ?? byStart.set(k, []).get(k)!).push(e); };
  for (let y = -PAD; y < L.h + PAD; y++) for (let x = -PAD; x < L.w + PAD; x++) {
    if (!body(x, y)) continue;
    if (!body(x, y - 1)) add(x, y, x + 1, y);
    if (!body(x + 1, y)) add(x + 1, y, x + 1, y + 1);
    if (!body(x, y + 1)) add(x + 1, y + 1, x, y + 1);
    if (!body(x - 1, y)) add(x, y + 1, x, y);
  }
  const loops: Loop[] = []; const caps: Cap[] = [];
  for (const start of edges) {
    if (start.used) continue;
    const poly: Pt[] = []; let e = start;
    while (!e.used) {
      e.used = true; poly.push(e.a);
      const outs = (byStart.get(key(e.b)) ?? []).filter((o) => !o.used);
      if (!outs.length) break;
      // at a diagonal touch prefer the right turn, which keeps separate blobs separate
      const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y;
      outs.sort((p, q) => turn(dx, dy, p) - turn(dx, dy, q));
      e = outs[0];
    }
    // merge collinear runs
    const simp: Pt[] = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[(i + poly.length - 1) % poly.length], v = poly[i], n = poly[(i + 1) % poly.length];
      if ((v.x - p.x) * (n.y - v.y) - (v.y - p.y) * (n.x - v.x) === 0) continue;
      simp.push(v);
    }
    if (simp.length < 4) continue;
    for (let i = 0; i < simp.length; i++) { const v = simp[i], n = simp[(i + 1) % simp.length]; if (n.y === v.y && n.x > v.x) caps.push({ x0: v.x * T, x1: n.x * T, y: v.y * T }); }
    const pts = round(simp);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
    loops.push({ pts, minX, minY, maxX, maxY });
  }
  const out = { loops, caps }; cache.set(solid, out); return out;
}
function turn(dx: number, dy: number, e: { a: Pt; b: Pt }) { const ex = e.b.x - e.a.x, ey = e.b.y - e.a.y; const cross = dx * ey - dy * ex; return cross > 0 ? 0 : cross === 0 ? 1 : 2; } // right turn first (screen coords)

/** Rounds every right-angle corner and bows long vertical sides outward a little. Returns a dense polyline in pixels. */
function round(poly: Pt[]): Pt[] {
  const n = poly.length, out: Pt[] = [], tips: Pt[] = [];
  const px = poly.map((p) => ({ x: p.x * T, y: p.y * T }));
  for (let i = 0; i < n; i++) {
    const p = px[(i + n - 1) % n], v = px[i], q = px[(i + 1) % n];
    const ax = Math.sign(p.x - v.x), ay = Math.sign(p.y - v.y), bx = Math.sign(q.x - v.x), by = Math.sign(q.y - v.y);
    const lenA = Math.abs(p.x - v.x) + Math.abs(p.y - v.y), lenB = Math.abs(q.x - v.x) + Math.abs(q.y - v.y);
    const convex = (v.x - p.x) * (q.y - v.y) - (v.y - p.y) * (q.x - v.x) > 0;
    // a bottom corner of a thin ledge tip: an underside (travelling left) meeting a short vertical side
    if (convex) { const inA = ay === 0 && ax > 0, inB = by === 0 && bx < 0; if ((inA && lenB < 2 * T && by < 0) || (inB && lenA < 2 * T && ay > 0)) tips.push(v); }
    const R = convex ? 30 : 42;
    const r = Math.max(0, Math.min(R, lenA / 2, lenB / 2));
    const s = { x: v.x + ax * r, y: v.y + ay * r }, e = { x: v.x + bx * r, y: v.y + by * r }, c = { x: v.x + (ax + bx) * r, y: v.y + (ay + by) * r };
    // straight part from the previous corner end to this corner start, bowed if it is a long vertical side
    const prevEnd = out.length ? out[out.length - 1] : null;
    if (prevEnd) segment(out, prevEnd, s);
    // the arc
    if (r > 0) {
      const a0 = Math.atan2(s.y - c.y, s.x - c.x); let a1 = Math.atan2(e.y - c.y, e.x - c.x);
      let d = a1 - a0; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
      const steps = 6; for (let k = 0; k <= steps; k++) { const a = a0 + (d * k) / steps; out.push({ x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r }); }
    } else out.push(v);
    if (i === n - 1) { segment(out, out[out.length - 1], out[0]); }
  }
  // lift the bottom corners of ledge tips so the ends taper instead of ending square
  for (const t of tips) for (const o of out) { const d = Math.hypot(o.x - t.x, o.y - t.y); if (d < 64) o.y -= 11 * (1 - d / 64); }
  return out;
}
function segment(out: Pt[], a: Pt, b: Pt) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
  if (len < 1) return;
  // long vertical sides swell outward; long undersides sag a little; top edges stay flat so the grass sits on the collision surface
  const vertical = Math.abs(dx) < 1, underside = !vertical && dx < 0;
  const amp = vertical && len >= 3 * T ? Math.min(12, len / 30) : underside && len >= 4 * T ? Math.min(10, len / 40) : 0;
  const steps = Math.max(1, Math.round(len / 24));
  for (let k = 1; k <= steps; k++) {
    const t = k / steps, bow = amp * Math.sin(Math.PI * t);
    // outward is the left of travel on screen: (dy, -dx) normalised
    out.push({ x: a.x + dx * t + (dy / len) * bow, y: a.y + dy * t - (dx / len) * bow });
  }
}
