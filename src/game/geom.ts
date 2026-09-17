// Curves, polygons and the segment index the physics collides against.
import { D, type Pt, type BBox, type Solid, type Seg, type Spot, type PolyRole } from './types';

export const hash = (x: number, y: number) => { let h = (Math.round(x * 7) * 374761393 + Math.round(y * 7) * 668265263) | 0; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; };
export const P = (x: number, y: number): Pt => ({ x: x * D, y: y * D });

/** Catmull-Rom through the points, sampled every `step` px. Open or closed. */
export function spline(pts: Pt[], closed = false, step = 9): Pt[] {
  const n = pts.length; if (n < 2) return pts.slice();
  const out: Pt[] = [];
  const get = (i: number) => closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y), k = Math.max(2, Math.ceil(len / step));
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

export function bbox(pts: Pt[], pad = 0): BBox {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  return { x0: x0 - pad, y0: y0 - pad, x1: x1 + pad, y1: y1 + pad };
}
const area = (pts: Pt[]) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p.x * q.y - q.x * p.y; } return a / 2; };

let nextId = 1;
/** Points are in diameters. The tube's half-width w is in px. */
export function vine(w: number, ctrl: [number, number][]): Solid {
  const pts = spline(ctrl.map(([x, y]) => P(x, y)));
  const id = nextId++;
  const spots: Spot[] = [];
  for (let i = 4; i < pts.length - 4; i += 6) { const h = hash(pts[i].x, pts[i].y + id); if (h < 0.42) { const a = pts[i + 1], b = pts[i - 1], dx = a.x - b.x, dy = a.y - b.y, l = Math.hypot(dx, dy) || 1, nx = dy / l, ny = -dx / l, off = (hash(id, i) - 0.5) * w * 1.1; spots.push({ x: pts[i].x + nx * off, y: pts[i].y + ny * off, rx: 6 + h * 12, ry: 5 + h * 6, a: h * 3 }); } }
  const grass: Pt[][] = []; let run: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.min(pts.length - 1, i + 1)], b = pts[Math.max(0, i - 1)], dx = a.x - b.x, dy = a.y - b.y, l = Math.hypot(dx, dy) || 1;
    let nx = dy / l, ny = -dx / l; if (ny > 0) { nx = -nx; ny = -ny; }
    if (ny < -0.42) run.push({ x: pts[i].x + nx * w, y: pts[i].y + ny * w }); else if (run.length) { if (run.length > 3) grass.push(run); run = []; }
  }
  if (run.length > 3) grass.push(run);
  return { kind: 'vine', pts, w, bbox: bbox(pts, w + 24), spots, grass, id };
}
/** A closed polygon from control points in diameters, smoothed unless `sharp`. Grass grows on every upward-facing run. */
export function poly(role: PolyRole, ctrl: [number, number][], sharp = false): Solid {
  return polyPts(role, sharp ? ctrl.map(([x, y]) => P(x, y)) : spline(ctrl.map(([x, y]) => P(x, y)), true));
}
/** A polygon from points already in px. */
export function polyPts(role: PolyRole, raw: Pt[]): Solid {
  let pts = raw;
  if (area(pts) < 0) pts = pts.slice().reverse();
  const id = nextId++;
  const bb = bbox(pts);
  const spots: Spot[] = [];
  const n = Math.min(14, Math.round(((bb.x1 - bb.x0) * (bb.y1 - bb.y0)) / 9000));
  for (let i = 0; i < n; i++) { const hx = hash(id * 3 + i, 1), hy = hash(id * 5, i * 2 + 1); const x = bb.x0 + hx * (bb.x1 - bb.x0), y = bb.y0 + 28 + hy * (bb.y1 - bb.y0 - 28); if (inside(pts, x, y, 16)) spots.push({ x, y, rx: 6 + hx * 10, ry: 5 + hy * 6, a: hx * 3 }); }
  const grass: Pt[][] = []; let run: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[(i + 1) % pts.length], b = pts[(i - 1 + pts.length) % pts.length], dx = a.x - b.x, dy = a.y - b.y, l = Math.hypot(dx, dy) || 1;
    const ny = -dx / l;
    if (ny < -0.4) run.push(pts[i]); else if (run.length) { if (run.length > 3) grass.push(run); run = []; }
  }
  if (run.length > 3) grass.push(run);
  return { kind: 'poly', pts, bbox: bbox(pts, 24), spots, grass, role, id };
}
/** Point-in-polygon with an inset margin (approximate: the point and the four points `m` away must all be inside). */
export function inside(pts: Pt[], x: number, y: number, m = 0): boolean {
  const test = (px: number, py: number) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if (a.y > py !== b.y > py && px < ((b.x - a.x) * (py - a.y)) / (b.y - a.y) + a.x) c = !c; } return c; };
  if (!m) return test(x, y);
  return test(x, y) && test(x - m, y) && test(x + m, y) && test(x, y - m) && test(x, y + m);
}

// ---- convenient shapes (all in diameters) --------------------------------------------------------------------------
/** A floating island: a gently domed top at `top` from x0 to x1, and a lobed underside `depth` deep. */
export function island(x0: number, x1: number, top: number, depth = 1.6): Solid {
  const w = x1 - x0, cx = (x0 + x1) / 2;
  return poly('island', [[x0, top + 0.05], [x0 + w * 0.25, top - 0.03], [cx, top - 0.06], [x1 - w * 0.25, top - 0.03], [x1, top + 0.05], [x1 - w * 0.08, top + depth * 0.45], [x1 - w * 0.32, top + depth * 0.9], [cx + w * 0.05, top + depth * 0.7], [x0 + w * 0.3, top + depth], [x0 + w * 0.06, top + depth * 0.5]]);
}
/** A thin floating ledge, a rounded pill about 0.5 diameters thick. */
export function ledge(x0: number, x1: number, top: number): Solid {
  const w = x1 - x0, cx = (x0 + x1) / 2;
  return poly('ledge', [[x0, top + 0.08], [x0 + w * 0.3, top], [cx, top - 0.02], [x1 - w * 0.3, top], [x1, top + 0.08], [x1 - w * 0.12, top + 0.42], [cx + w * 0.1, top + 0.55], [x0 + w * 0.3, top + 0.5], [x0 + w * 0.1, top + 0.38]]);
}
/** A slab with rounded ends, for the machine platform and the purple ground. */
export function slab(role: PolyRole, x0: number, x1: number, top: number, thick: number): Solid {
  const w = x1 - x0;
  return poly(role, [[x0 + 0.3, top], [x0 + w * 0.33, top - 0.03], [x0 + w * 0.66, top - 0.03], [x1 - 0.3, top], [x1, top + thick * 0.35], [x1 - 0.2, top + thick * 0.8], [x1 - w * 0.3, top + thick], [x0 + w * 0.3, top + thick], [x0 + 0.2, top + thick * 0.8], [x0, top + thick * 0.35]]);
}
/** A tall block with rounded top corners: cliffs and walls. */
export function cliff(x0: number, x1: number, top: number, bottom: number): Solid {
  const r = Math.min(0.5, (x1 - x0) / 3);
  return poly('cliff', [[x0 + r, top], [(x0 + x1) / 2, top - 0.03], [x1 - r, top], [x1, top + r], [x1 + 0.05, (top + bottom) / 2], [x1, bottom], [x0, bottom], [x0 - 0.05, (top + bottom) / 2], [x0, top + r]]);
}
/** A hill or ridge: the top profile is given, the shape is closed straight down to `bottom`. */
export function hill(profile: [number, number][], bottom: number): Solid {
  // the top is a smooth curve; the sides drop straight down so the edges are crisp
  const top = spline(profile.map(([x, y]) => P(x, y)));
  const first = top[0], last = top[top.length - 1];
  return polyPts('hill', [...top, { x: last.x, y: bottom * D }, { x: first.x, y: bottom * D }]);
}

// ---- segment index ------------------------------------------------------------------------------------------------
export function segmentsOf(solids: Solid[]): Seg[] {
  const out: Seg[] = [];
  solids.forEach((s, si) => {
    if (s.kind === 'vine') {
      for (let i = 0; i + 1 < s.pts.length; i++) { const a = s.pts[i], b = s.pts[i + 1]; if (Math.hypot(b.x - a.x, b.y - a.y) < 0.5) continue; out.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, nx: 0, ny: 0, w: s.w, poly: false, aConvex: true, bConvex: true, solid: si }); }
    } else {
      const n = s.pts.length;
      const convex = (i: number) => { const p = s.pts[(i - 1 + n) % n], v = s.pts[i], q = s.pts[(i + 1) % n]; return (v.x - p.x) * (q.y - v.y) - (v.y - p.y) * (q.x - v.x) > 0; };
      for (let i = 0; i < n; i++) {
        const a = s.pts[i], b = s.pts[(i + 1) % n], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy); if (l < 0.5) continue;
        out.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, nx: dy / l, ny: -dx / l, w: 0, poly: true, aConvex: convex(i), bConvex: convex((i + 1) % n), solid: si });
      }
    }
  });
  return out;
}
export const CELL = 160;
export class SegIndex {
  private cells = new Map<number, Seg[]>();
  constructor(segs: Seg[]) { for (const s of segs) this.add(s); }
  private key(cx: number, cy: number) { return (cx + 4096) * 16384 + (cy + 4096); }
  add(s: Seg) {
    const pad = s.w + 2;
    const x0 = Math.floor((Math.min(s.ax, s.bx) - pad) / CELL), x1 = Math.floor((Math.max(s.ax, s.bx) + pad) / CELL), y0 = Math.floor((Math.min(s.ay, s.by) - pad) / CELL), y1 = Math.floor((Math.max(s.ay, s.by) + pad) / CELL);
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const k = this.key(cx, cy); const l = this.cells.get(k); if (l) l.push(s); else this.cells.set(k, [s]); }
  }
  /** Every segment whose cell touches the circle. */
  near(x: number, y: number, r: number, out: Seg[]): Seg[] {
    out.length = 0;
    const x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL), y0 = Math.floor((y - r) / CELL), y1 = Math.floor((y + r) / CELL);
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const l = this.cells.get(this.key(cx, cy)); if (l) for (const s of l) if (out.indexOf(s) < 0) out.push(s); }
    return out;
  }
}
/** A dynamic box (the plank standing, the machine, the wreck) as four polygon segments. Corners in px, clockwise on screen. */
export function boxSegs(pts: Pt[], tag: string): Seg[] {
  const segs = segmentsOf([{ kind: 'poly', pts, bbox: bbox(pts), spots: [], grass: [], role: 'platform', id: 0 }]);
  for (const s of segs) s.tag = tag;
  return segs;
}
