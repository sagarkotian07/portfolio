// Bounce Tales, Chapter 3. A ball on smooth terrain: circle against vines (capsule chains) and polygons. Pure tick(dt) so tests can drive it.
import { D, R, type InputState, type Level, type DebugInfo, type Waypoint, type Seg, type Pt } from './types';
import { buildLevel, machineBox } from './level';
import { SegIndex, boxSegs, hash } from './geom';
import { GREEN, PURPLE, FIXED, type Palette } from './palette';
import { drawSky, drawClouds, drawBackdrop, drawSolid, drawBush, drawFlower, drawSign, drawEgg, drawBall, drawPlank, drawMachine, drawPumpkin, drawStar, drawSpiral, drawSmoke, drawHud, drawCard, drawCorner } from './draw';

type PKind = 'star' | 'spark' | 'smoke' | 'spiral' | 'bit';
interface Particle { kind: PKind; x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; c: string; rot: number; seed: number }
export interface Hooks { onHud(eggs: number, total: number, time: number): void; onWin(eggs: number, total: number, time: number): void; onDeath(): void }
export type State = 'idle' | 'running' | 'dead' | 'won';
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const GRAV = 2200, JUMP = 740, MAXV = 300;
const BEST_KEY = 'bounce-tales-ch3-best';

export class Game {
  private ctx: CanvasRenderingContext2D;
  readonly level: Level; private index: SegIndex; private dyn: Seg[] = [];
  state: State = 'idle';
  x = 0; y = 0; vx = 0; vy = 0; grounded = false; private gnx = 0; private gny = -1; private facing = 1;
  private coyote = 0; private buffer = 0; private jumpHeld = false; private jumping = false;
  deaths = 0; time = 0; eggs = 0; private t = 0; private cssW = 800; private cssH = 440; private scale = 1; private dpr = 1;
  private cx = 0; private cy = 0; private vw = 0; private vh = 0;
  private cpIndex = 0;
  private sx = 1; private sy = 1;
  private parts: Particle[] = []; private deadT = 0; private shake = 0; private wonT = 0; private inDoor = false;
  corrupted = false; private flicker = 0; private best = false;
  private wps: Waypoint[] = []; private wpi = 0; private holdT = 0; private afterWait = false; private braking = false;
  private raf = 0; private last = 0; private visible = false;
  private near: Seg[] = [];
  readonly input: InputState = { left: false, right: false, jumpPressed: false, jumpHeld: false };

  constructor(private canvas: HTMLCanvasElement, private hooks: Hooks, private phone: () => boolean) {
    this.ctx = canvas.getContext('2d')!;
    this.level = buildLevel(); this.index = new SegIndex(this.level.segs);
    this.rebuildDyn();
    this.resetBall(true);
    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas);
    new IntersectionObserver(([e]) => (this.visible = e.isIntersecting)).observe(canvas);
    this.loop = this.loop.bind(this); this.raf = requestAnimationFrame(this.loop);
  }

  // ---------- lifecycle ----------
  start() {
    const L = this.level;
    for (const e of L.eggs) e.taken = false;
    L.checkpoints.forEach((c, i) => (c.hit = i === 0));
    L.plank.state = 'up'; L.plank.a = 0; L.machine.destroyed = false; L.machine.contact = 0; this.rebuildDyn();
    this.deaths = 0; this.time = 0; this.eggs = 0; this.parts = []; this.corrupted = false; this.flicker = 0; this.cpIndex = 0; this.inDoor = false; this.wonT = 0; this.best = false;
    this.resetBall(true); this.state = 'running'; this.wpi = 0; this.afterWait = false; this.holdT = 0;
    this.hooks.onHud(0, L.eggTotal, 0);
  }
  private resetBall(snapCam = false) {
    const c = this.level.checkpoints[this.cpIndex];
    this.x = c.x - (this.cpIndex ? 0.9 * D : 0); this.y = c.y - R - 1; this.vx = 0; this.vy = 0; this.grounded = false; this.facing = 1; this.sx = this.sy = 1;
    if (snapCam) { this.cx = this.x - this.vw * 0.45; this.cy = this.y - this.vh * 0.66; this.clampCam(); }
  }
  leave() { this.state = 'idle'; }
  private rewindRoute() {
    if (!this.wps.length) return;
    let i = this.wps.findIndex((w) => w.step && (w.home ?? 0) >= this.cpIndex);
    if (i < 0) i = 0;
    this.wpi = i; this.afterWait = false; this.holdT = 0; this.braking = false;
    this.input.left = this.input.right = this.input.jumpHeld = false;
  }
  private rebuildDyn() {
    const L = this.level; this.dyn = [];
    // the plank is a capsule that pivots on its bottom-right corner: standing, tipping, or lying flat as the bridge
    { const p = L.plank, w = 0.55 * D, a = p.state === 'up' ? 0 : p.state === 'down' ? Math.PI / 2 : p.a, px = p.x + w / 2, py = p.y + 10;
      const ux = Math.sin(a), uy = -Math.cos(a), lx = -Math.cos(a), ly = -Math.sin(a), ax = px + lx * (w / 2), ay = py + ly * (w / 2);
      this.dyn.push({ ax, ay, bx: ax + ux * p.len, by: ay + uy * p.len, nx: 0, ny: 0, w: w / 2, poly: false, aConvex: true, bConvex: true, solid: -1, tag: p.state === 'up' ? 'plank' : 'bridge' }); }
    this.dyn.push(...boxSegs(machineBox(L.machine), L.machine.destroyed ? 'wreck' : 'machine'));
  }

  /** Tests poke at the plank and the machine; this rebuilds their collision boxes. */
  refresh() { this.rebuildDyn(); }
  autopilot(wps: Waypoint[]) { this.wps = wps.slice(); this.wpi = 0; }
  teleport(x: number, y: number) { this.x = x; this.y = y; this.vx = 0; this.vy = 0; this.cx = x - this.vw * 0.45; this.cy = y - this.vh * 0.66; this.clampCam(); }

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(r.width * this.dpr); this.canvas.height = Math.round(r.height * this.dpr);
    this.cssW = r.width; this.cssH = r.height;
    this.scale = this.phone() ? Math.max(r.width / (8.2 * D), r.height / (15 * D)) : r.height / (12 * D);
    this.vw = this.cssW / this.scale; this.vh = this.cssH / this.scale;
    this.clampCam();
  }

  // ---------- loop ----------
  private loop(now: number) {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.033, (now - this.last) / 1000 || 0.016); this.last = now;
    if (!this.visible || document.hidden) return;
    this.tick(dt); this.draw();
  }

  tick(dt: number) {
    this.t += dt;
    const L = this.level;
    if (this.state === 'running') { if (this.wps.length) this.runAutopilot(dt); this.time += dt; this.step(dt); }
    else if (this.state === 'dead') { this.deadT -= dt; if (this.deadT <= 0) { this.state = 'running'; this.resetBall(true); this.rewindRoute(); } }
    else if (this.state === 'won') { this.wonT += dt; if (!this.inDoor) this.step(dt); }
    if (L.plank.state === 'falling') { L.plank.a = Math.min(Math.PI / 2, L.plank.a + dt * (0.9 + L.plank.a * 2.6)); this.rebuildDyn(); if (L.plank.a >= Math.PI / 2) { L.plank.state = 'down'; this.rebuildDyn(); this.burst(L.plank.x + L.plank.len, L.plank.y, 'spark', 6, '#C9A06B'); this.shake = 0.15; } }
    if (this.flicker > 0) { this.flicker -= dt; if (this.flicker <= 0) { this.flicker = 0; this.corrupted = false; } }
    this.sx += (1 - this.sx) * Math.min(1, dt * 12); this.sy += (1 - this.sy) * Math.min(1, dt * 12);
    if (this.shake > 0) this.shake -= dt;
    for (const p of this.parts) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.rot += dt * 3;
      if (p.kind === 'spark' || p.kind === 'bit') p.vy += 1500 * dt; else if (p.kind === 'smoke' || p.kind === 'spiral') { p.vy -= 60 * dt; p.vx *= 0.97; p.r += dt * 26; } else { p.vx *= 0.9; p.vy *= 0.9; }
    }
    if (this.parts.length > 220) this.parts.splice(0, this.parts.length - 220);
    this.parts = this.parts.filter((p) => p.life > 0);
    this.updateCam(dt);
  }

  private runAutopilot(dt: number) {
    const inp = this.input;
    if (this.holdT > 0 && (this.holdT -= dt) <= 0) inp.jumpHeld = false;
    if (this.braking) { if (Math.abs(this.vx) > 20) { inp.left = this.vx > 0; inp.right = this.vx < 0; } else { inp.left = inp.right = false; this.braking = false; } }
    const wp = this.wps[this.wpi]; if (!wp) return;
    if (wp.act === 'goto') {
      // a small servo: drive toward x, brake when the stopping distance reaches the target, done when parked
      const err = wp.x! - this.x, dist = Math.abs(err), toward = Math.sign(err);
      if (dist < 6 && Math.abs(this.vx) < 25) { inp.left = inp.right = false; this.braking = false; this.afterWait = false; this.wpi++; return; }
      const stop = (this.vx * this.vx) / (2 * 1500), movingToward = this.vx * toward > 0;
      const dir = movingToward && stop >= dist ? -toward : !movingToward && Math.abs(this.vx) > 25 ? -Math.sign(this.vx) : toward;
      inp.right = dir > 0; inp.left = dir < 0; this.braking = false; return;
    }
    if (!this.afterWait && wp.x !== undefined) {
      const passed = wp.dir === 'left' ? this.x <= wp.x + 3 : this.x >= wp.x - 3;
      const yOk = wp.y === undefined || Math.abs(this.y - wp.y) < 0.8 * D;
      if (!passed || !yOk) return;
    }
    switch (wp.act) {
      case 'right': inp.right = true; inp.left = false; this.braking = false; break;
      case 'left': inp.left = true; inp.right = false; this.braking = false; break;
      case 'stop': inp.right = inp.left = false; this.braking = true; break;
      case 'jump': if (!this.grounded && this.coyote <= 0) return; inp.jumpPressed = true; inp.jumpHeld = true; this.holdT = wp.hold ?? 0.45; break;
      case 'wait': if (!wp.until!(this.debug())) return; break;
    }
    this.afterWait = wp.act === 'wait';
    this.wpi++;
  }

  // ---------- physics ----------
  private step(dt: number) {
    const L = this.level, inp = this.input;
    if (inp.jumpPressed) { this.buffer = 0.12; inp.jumpPressed = false; }
    this.jumpHeld = inp.jumpHeld;
    const speed = Math.hypot(this.vx, this.vy) + 1;
    const n = Math.min(10, Math.max(1, Math.ceil((speed * dt) / 7)));
    const sdt = dt / n;
    for (let i = 0; i < n; i++) this.substep(sdt);
    // pickups, flags, hazards
    for (const egg of L.eggs) if (!egg.taken && Math.hypot(egg.x - this.x, egg.y - this.y) < R + 15) { egg.taken = true; this.eggs++; this.burst(egg.x, egg.y, 'spark', 8, FIXED.egg2); this.hooks.onHud(this.eggs, L.eggTotal, this.time); }
    L.checkpoints.forEach((c, i) => { if (!c.hit && Math.abs(c.x - this.x) < 1.1 * D && c.y - this.y < 2.2 * D && c.y - this.y > -0.9 * D) { c.hit = true; this.cpIndex = Math.max(this.cpIndex, i); this.ring(this.x, this.y, 10); } });
    for (const k of L.kills) if (this.x > k.x0 && this.x < k.x1 && this.y > k.y) { this.die(); return; }
    if (this.y > L.y0 + L.h) { this.die(); return; }
    if (!this.corrupted && !L.machine.destroyed && this.y > L.corruptY) this.corrupted = true;
    // the pumpkin's door
    const pk = L.pumpkin, doorX = pk.x + pk.r * 0.12;
    if (this.state === 'running' && this.x > doorX - 6 && Math.abs(this.y - (pk.y - R)) < 1.6 * D) { this.state = 'won'; this.wonT = 0; this.best = this.saveBest(); this.hooks.onWin(this.eggs, L.eggTotal, this.time); }
    if (this.state === 'won' && this.x > doorX + 8) this.inDoor = true;
    if (Math.floor(this.time) !== Math.floor(this.time - dt)) this.hooks.onHud(this.eggs, L.eggTotal, this.time);
  }
  private substep(dt: number) {
    const inp = this.input, L = this.level;
    const target = this.state === 'won' ? 1 : (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    if (target) this.facing = target;
    if (this.grounded) {
      // push along the surface tangent; no input, roll to a stop unless the slope is steep
      const tx = -this.gny, ty = this.gnx; // tangent pointing screen-right along the surface
      const along = this.vx * tx + this.vy * ty;
      if (target) { if (along * target < MAXV) { const a = 1500 * dt * target; this.vx += tx * a; this.vy += ty * a; } }
      else { const f = Math.min(Math.abs(along), 900 * dt) * Math.sign(along); this.vx -= tx * f; this.vy -= ty * f; }
      const sp = this.vx * tx + this.vy * ty; if (Math.abs(sp) > 350) { const k = 350 / Math.abs(sp); this.vx = tx * sp * k + (this.vx - tx * sp); this.vy = ty * sp * k + (this.vy - ty * sp); }
    } else {
      if (Math.abs(this.vx) > 350) this.vx = Math.sign(this.vx) * 350;
      if (target) { if (this.vx * target < MAXV) this.vx += 700 * dt * target; }
      else { const f = Math.min(Math.abs(this.vx), 120 * dt) * Math.sign(this.vx); this.vx -= f; }
    }
    this.vy += GRAV * dt; if (this.vy > 1500) this.vy = 1500;
    if (this.grounded) this.coyote = 0.08; else this.coyote -= dt;
    if (this.buffer > 0) this.buffer -= dt;
    if (this.buffer > 0 && (this.grounded || this.coyote > 0)) {
      this.vy = -JUMP; this.jumping = true; this.grounded = false; this.coyote = 0; this.buffer = 0; this.sx = 0.82; this.sy = 1.22;
      this.burst(this.x, this.y + R, 'spark', 4, 'rgba(255,255,255,0.9)');
    }
    if (this.jumping && !this.jumpHeld && this.vy < -JUMP * 0.55) this.vy = -JUMP * 0.55;
    if (this.vy >= 0) this.jumping = false;
    // move, then push out of everything
    this.x += this.vx * dt; this.y += this.vy * dt;
    const wasGrounded = this.grounded; this.grounded = false;
    let bestNy = 0, bestNx = 0, landed = 0;
    const segs = this.index.near(this.x, this.y, R + 8, this.near);
    for (let pass = 0; pass < 3; pass++) {
      let moved = false;
      const resolve = (s: Seg) => {
        const abx = s.bx - s.ax, aby = s.by - s.ay, l2 = abx * abx + aby * aby || 1;
        let t = ((this.x - s.ax) * abx + (this.y - s.ay) * aby) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const cxp = s.ax + abx * t, cyp = s.ay + aby * t;
        let nx: number, ny: number, pen: number;
        if (s.poly && t > 0 && t < 1) { const sd = (this.x - s.ax) * s.nx + (this.y - s.ay) * s.ny; if (sd >= R || sd < -R * 1.6) return; nx = s.nx; ny = s.ny; pen = R - sd; }
        else {
          if (s.poly && ((t === 0 && !s.aConvex) || (t === 1 && !s.bConvex))) return;
          const dx = this.x - cxp, dy = this.y - cyp, d = Math.hypot(dx, dy), reach = R + s.w;
          if (d >= reach) return;
          if (d < 0.001) { nx = 0; ny = -1; } else { nx = dx / d; ny = dy / d; }
          pen = reach - d;
        }
        if (pen <= 0) return;
        this.x += nx * pen; this.y += ny * pen; moved = true;
        const vn = this.vx * nx + this.vy * ny;
        if (vn < 0) {
          const hard = vn < -560 && ny < -0.3, sp0 = Math.hypot(this.vx, this.vy), vx0 = Math.abs(this.vx);
          this.vx -= nx * vn * (hard ? 1.12 : 1); this.vy -= ny * vn * (hard ? 1.12 : 1);
          const sp1 = Math.hypot(this.vx, this.vy); if (sp1 > sp0 && sp1 > 0) { this.vx *= sp0 / sp1; this.vy *= sp0 / sp1; } // a wall never adds speed
          if (ny < -0.45 && Math.abs(this.vx) > vx0) this.vx = Math.sign(this.vx) * vx0; // and the ground never speeds the ball up sideways
          if (ny < -0.3 && -vn > landed) landed = -vn;
        }
        if (ny < -0.45 && ny < bestNy) { bestNy = ny; bestNx = nx; }
        if (s.tag === 'machine' && nx < -0.5 && target > 0 && !L.machine.destroyed) L.machine.contact += dt * 1.5;
        if (s.tag === 'plank' && nx < -0.5 && target > 0 && L.plank.state === 'up') { L.plank.state = 'falling'; L.plank.a = 0.02; this.rebuildDyn(); }
      };
      for (const s of segs) resolve(s);
      for (const s of this.dyn) resolve(s);
      if (!moved) break;
    }
    if (bestNy < 0) { this.grounded = true; this.gnx = bestNx; this.gny = bestNy; }
    // stay glued to a smooth surface over small bumps: probe a little below and keep the contact if there is one
    if (!this.grounded && wasGrounded && !this.jumping && this.vy >= -120) {
      const px = this.x, py = this.y, pvx = this.vx, pvy = this.vy; this.y += 7;
      let gnx = 0, gny = 0;
      const probe = (s: Seg) => {
        const abx = s.bx - s.ax, aby = s.by - s.ay, l2 = abx * abx + aby * aby || 1;
        let t = ((this.x - s.ax) * abx + (this.y - s.ay) * aby) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const cxp = s.ax + abx * t, cyp = s.ay + aby * t;
        let nx: number, ny: number, pen: number;
        if (s.poly && t > 0 && t < 1) { const sd = (this.x - s.ax) * s.nx + (this.y - s.ay) * s.ny; if (sd >= R || sd < -R * 1.6) return; nx = s.nx; ny = s.ny; pen = R - sd; }
        else { if (s.poly && ((t === 0 && !s.aConvex) || (t === 1 && !s.bConvex))) return; const dx = this.x - cxp, dy = this.y - cyp, d = Math.hypot(dx, dy), reach = R + s.w; if (d >= reach || d < 0.001) return; nx = dx / d; ny = dy / d; pen = reach - d; }
        if (pen <= 0 || ny > -0.45) return;
        this.x += nx * pen; this.y += ny * pen; if (ny < gny) { gny = ny; gnx = nx; }
      };
      for (const s of segs) probe(s); for (const s of this.dyn) probe(s);
      if (gny < 0) { this.grounded = true; this.gnx = gnx; this.gny = gny; const vn = this.vx * gnx + this.vy * gny; if (vn > 0) { this.vx -= gnx * vn; this.vy -= gny * vn; } }
      else { this.x = px; this.y = py; this.vx = pvx; this.vy = pvy; }
    }
    if (this.grounded && !wasGrounded) {
      const k = Math.min(1, landed / 900);
      this.sx = 1 + 0.32 * k; this.sy = 1 - 0.3 * k;
      if (landed > 330) this.ring(this.x, this.y, 8);
    }
    if (L.machine.contact >= 0.9 && !L.machine.destroyed) this.destroyMachine();
    if (this.x - R < L.x0) { this.x = L.x0 + R; if (this.vx < 0) this.vx = 0; }
    if (this.x + R > L.x0 + L.w) { this.x = L.x0 + L.w - R; if (this.vx > 0) this.vx = 0; }
  }
  private destroyMachine() {
    const m = this.level.machine; m.destroyed = true; this.rebuildDyn();
    const cx = m.x + m.w / 2, cy = m.y + m.h / 2;
    for (let i = 0; i < 12; i++) this.parts.push({ kind: 'smoke', x: cx + rand(-40, 40), y: cy + rand(-20, 30), vx: rand(-90, 90), vy: rand(-140, -30), life: rand(0.9, 1.5), max: 1.5, r: rand(14, 26), c: '', rot: 0, seed: i });
    for (let i = 0; i < 7; i++) this.parts.push({ kind: 'spiral', x: cx + rand(-50, 50), y: cy + rand(-30, 20), vx: rand(-120, 120), vy: rand(-160, -40), life: rand(0.8, 1.3), max: 1.3, r: rand(12, 20), c: FIXED.spiralTeal, rot: rand(0, 6), seed: i });
    for (let i = 0; i < 10; i++) this.parts.push({ kind: 'star', x: cx + rand(-30, 30), y: cy + rand(-30, 20), vx: rand(-260, 260), vy: rand(-320, -60), life: rand(0.5, 0.9), max: 0.9, r: rand(6, 11), c: FIXED.star, rot: rand(0, 6), seed: i });
    for (let i = 0; i < 10; i++) this.parts.push({ kind: 'bit', x: cx, y: cy, vx: rand(-300, 300), vy: rand(-500, -100), life: rand(0.5, 1), max: 1, r: rand(3, 6), c: FIXED.machine2, rot: 0, seed: i });
    this.flicker = 1.05; this.shake = 0.5;
    this.vx = -180; this.vy = -260; this.grounded = false;
  }
  private die() {
    if (this.state !== 'running') return;
    this.deaths++; this.burst(this.x, this.y, 'bit', 18, FIXED.ball); this.shake = 0.3; this.hooks.onDeath();
    this.state = 'dead'; this.deadT = 0.75;
  }
  private burst(x: number, y: number, kind: PKind, n: number, c: string) { for (let i = 0; i < n; i++) this.parts.push({ kind, x, y, vx: rand(-220, 220), vy: rand(-380, 40), life: rand(0.3, 0.6), max: 0.6, r: rand(2, 4.5), c, rot: 0, seed: i }); }
  private ring(x: number, y: number, n: number) { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + 0.3; this.parts.push({ kind: 'star', x: x + Math.cos(a) * 18, y: y + Math.sin(a) * 18, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190, life: 0.32, max: 0.32, r: 7, c: FIXED.star, rot: rand(0, 6), seed: i }); } }
  private saveBest(): boolean {
    try { const prev = Number(localStorage.getItem(BEST_KEY) ?? 'Infinity'); if (this.time < prev) { localStorage.setItem(BEST_KEY, String(Math.floor(this.time))); return true; } } catch { /* private mode */ }
    return false;
  }

  // ---------- camera ----------
  private updateCam(dt: number) {
    const ph = this.phone();
    const lead = this.facing * this.vw * (ph ? 0.08 : 0.12) * Math.min(1, Math.abs(this.vx) / 250 + 0.3);
    const tx = this.x + lead - this.vw * (ph ? 0.5 : 0.45);
    const falling = this.vy > 500 && !this.grounded;
    const ty = this.y - this.vh * (falling ? 0.42 : ph ? 0.55 : 0.66);
    const k = Math.min(1, dt * (falling ? 9 : 6));
    this.cx += (tx - this.cx) * k;
    const dz = falling ? 0 : 40; if (ty > this.cy + dz) this.cy += (ty - dz - this.cy) * k; else if (ty < this.cy - dz) this.cy += (ty + dz - this.cy) * k;
    this.clampCam();
  }
  private clampCam() { const L = this.level; this.cx = Math.max(L.x0, Math.min(L.x0 + L.w - this.vw, this.cx)); this.cy = Math.max(L.y0, Math.min(L.y0 + L.h - this.vh, this.cy)); }

  // ---------- draw ----------
  get palette(): Palette { if (this.flicker > 0) return Math.floor(this.flicker * 11) % 2 === 0 ? GREEN : PURPLE; return this.corrupted ? PURPLE : GREEN; }
  draw() {
    const { ctx, level: L } = this, P = this.palette, s = this.scale * this.dpr;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    drawSky(ctx, P, this.cssW, this.cssH);
    const shx = this.shake > 0 ? rand(-4, 4) * this.shake * 3 : 0, shy = this.shake > 0 ? rand(-3, 3) * this.shake * 3 : 0;
    ctx.setTransform(s, 0, 0, s, (-this.cx + shx) * s, (-this.cy + shy) * s);
    const x0 = this.cx - 60, x1 = this.cx + this.vw + 60, y0 = this.cy - 60, y1 = this.cy + this.vh + 60;
    const inView = (x: number, y: number, m = 120) => x > x0 - m && x < x1 + m && y > y0 - m && y < y1 + m;
    drawClouds(ctx, P, this.cx, this.cy, this.vw, this.vh, this.t);
    drawBackdrop(ctx, P, L.bg, this.cx, this.cy, this.vw, this.vh);
    for (const so of L.solids) if (so.bbox.x1 > x0 && so.bbox.x0 < x1 && so.bbox.y1 > y0 && so.bbox.y0 < y1) drawSolid(ctx, P, so);
    for (const b of L.bushes) if (inView(b.x, b.y)) drawBush(ctx, P, b);
    for (const f of L.flowers) if (inView(f.x, f.y)) drawFlower(ctx, P, f, this.t);
    for (const sg of L.signs) if (inView(sg.x, sg.y)) drawSign(ctx, P, sg);
    if (inView(L.plank.x, L.plank.y, 260)) drawPlank(ctx, L.plank);
    if (inView(L.machine.x, L.machine.y, 320)) drawMachine(ctx, P, L.machine, this.t);
    for (const e of L.eggs) if (!e.taken && inView(e.x, e.y, 40)) drawEgg(ctx, e.x, e.y, e.t + this.t);
    if (this.state !== 'dead' && !this.inDoor) {
      // a soft shadow on the surface below
      const gy = this.groundBelow();
      if (gy !== null) { const dist = Math.max(0, gy - (this.y + R)), k = Math.max(0.2, 1 - dist / (6 * D)); ctx.fillStyle = `rgba(0,0,0,${0.16 * k})`; ctx.beginPath(); ctx.ellipse(this.x, gy + 2, R * 0.95 * k, 4.5 * k, 0, 0, Math.PI * 2); ctx.fill(); }
      drawBall(ctx, this.x, this.y, R, this.sx, this.sy);
    }
    if (inView(L.pumpkin.x, L.pumpkin.y, 200)) drawPumpkin(ctx, L.pumpkin);
    for (const p of this.parts) {
      const a = Math.min(1, (p.life / p.max) * 2);
      if (p.kind === 'star') drawStar(ctx, p.x, p.y, p.r * (0.6 + 0.4 * a), p.rot, p.c, FIXED.star2);
      else if (p.kind === 'smoke') drawSmoke(ctx, p.x, p.y, p.r, a * 0.9, p.seed);
      else if (p.kind === 'spiral') drawSpiral(ctx, p.x, p.y, p.r, p.rot, p.c, a);
      else { ctx.globalAlpha = a; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    }
    // screen space
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.state === 'idle') drawCard(ctx, this.cssW, this.cssH, { kind: 'start', eggs: 0, total: L.eggTotal, time: 0, best: false }, this.t);
    else if (this.state === 'won' && this.wonT > 0.9) drawCard(ctx, this.cssW, this.cssH, { kind: 'done', eggs: this.eggs, total: L.eggTotal, time: this.time, best: this.best }, this.t);
    else { drawHud(ctx, this.cssW, this.eggs, L.eggTotal, this.time, this.cssW < 500); drawCorner(ctx, this.cssW, this.cssH); }
  }
  /** The nearest upward-facing surface under the ball, for the shadow. */
  private groundBelow(): number | null {
    let best: number | null = null;
    const segs = this.index.near(this.x, this.y + 3 * D, 3.2 * D, this.near);
    const test = (s: Seg) => {
      const x0 = Math.min(s.ax, s.bx) - s.w, x1 = Math.max(s.ax, s.bx) + s.w; if (this.x < x0 || this.x > x1) return;
      if (s.poly && s.ny > -0.3) return;
      const t = s.bx === s.ax ? 0 : (this.x - s.ax) / (s.bx - s.ax), y = s.ay + (s.by - s.ay) * Math.max(0, Math.min(1, t)) - s.w;
      if (y >= this.y + R - 6 && (best === null || y < best)) best = y;
    };
    for (const s of segs) test(s); for (const s of this.dyn) test(s);
    return best;
  }

  // ---------- debug ----------
  debug(): DebugInfo {
    const L = this.level;
    return { state: this.state, x: this.x, y: this.y, vx: this.vx, vy: this.vy, grounded: this.grounded, deaths: this.deaths, eggs: this.eggs, eggsLeft: L.eggTotal - this.eggs, wp: this.wpi, corrupted: this.corrupted, machine: L.machine.destroyed, plank: L.plank.state, cp: this.cpIndex };
  }
  destroy() { cancelAnimationFrame(this.raf); }
}
void hash; export type { Pt };
