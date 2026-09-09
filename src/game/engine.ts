// Bounce: an original ball platformer. Pure tick(dt) so tests can drive it without frames.
import { T, FORMS, type Form, type InputState, type Level, type DebugInfo, type Waypoint, type Platform } from './types';
import { parseLevel, PARAMS } from './level';
import { invalidateContours } from './contour';
import { ropeTopFn, drawSecret, drawBall, drawSky, drawBackdrop, drawTiles, drawSpike, drawEgg, drawSpring, drawButton, drawGate, drawPlatform, drawFan, drawCheckpoint, drawPad, drawExit, drawDecor, C } from './draw';

interface Particle { x: number; y: number; vx: number; vy: number; life: number; c: string; r: number }
export interface Hooks { onHud(eggs: number, total: number, time: number): void; onWin(eggs: number, total: number, time: number): void; onDeath(): void }
export type State = 'idle' | 'running' | 'dead' | 'won';
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export class Game {
  private ctx: CanvasRenderingContext2D;
  readonly level: Level; private solid: Uint8Array;
  state: State = 'idle';
  form: Form = 'normal';
  x = 0; y = 0; vx = 0; vy = 0; grounded = false; private ridingOn: Platform | null = null; private prevBottom = 0;
  private coyote = 0; private buffer = 0; private jumpHeld = false; private jumping = false;
  deaths = 0; time = 0; eggs = 0; private t = 0; private cssW = 800; private cssH = 440; private baseScale = 1; private zoom = 1;
  private cx = 0; private cy = 0; private vw = 0; private vh = 0; private scale = 1; private dpr = 1;
  private checkpoint = { x: 0, y: 0 };
  private sx = 1; private sy = 1; private blink = 0; private blinkT = 2; private eyeDir = 1;
  private parts: Particle[] = []; private deadT = 0; private shake = 0;
  private wps: Waypoint[] = []; private wpi = 0; private holdT = 0; private afterWait = false;
  private raf = 0; private last = 0; private visible = false;
  readonly input: InputState = { left: false, right: false, jumpPressed: false, jumpHeld: false };

  constructor(private canvas: HTMLCanvasElement, private hooks: Hooks, private phone: () => boolean) {
    this.ctx = canvas.getContext('2d')!;
    this.level = parseLevel(); this.solid = new Uint8Array(this.level.solid);
    this.resetBall(true);
    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas);
    new IntersectionObserver(([e]) => (this.visible = e.isIntersecting)).observe(canvas);
    this.loop = this.loop.bind(this); this.raf = requestAnimationFrame(this.loop);
  }

  // ---------- lifecycle ----------
  start() {
    this.solid = new Uint8Array(this.level.solid);
    for (const e of this.level.eggs) e.taken = false;
    for (const b of this.level.buttons) b.pressed = false;
    for (const g of this.level.gates) g.open = 0;
    this.level.checkpoints.forEach((c, i) => (c.hit = i === 0));
    for (const p of this.level.platforms) { if (p.axis === 'x') { p.x = p.min; p.dir = 1; } else { p.y = p.max; p.dir = -1; } }
    this.form = 'normal'; this.deaths = 0; this.time = 0; this.eggs = 0; this.parts = [];
    this.checkpoint = { x: (this.level.start.cx + 0.5) * T, y: (this.level.start.cy + 0.5) * T };
    this.resetBall(true); this.state = 'running'; this.wpi = 0; this.afterWait = false; this.holdT = 0;
    this.hooks.onHud(0, this.level.eggTotal, 0);
  }
  private resetBall(snapCam = false) {
    this.x = this.checkpoint.x; this.y = this.checkpoint.y + T / 2 - FORMS[this.form].r; this.vx = 0; this.vy = 0; this.grounded = false; this.ridingOn = null;
    if (snapCam) { this.cx = this.x - this.vw * 0.4; this.cy = this.y - this.vh * 0.55; this.clampCam(); }
  }
  leave() { this.state = 'idle'; }
  private rewindRoute() {
    if (!this.wps.length) return;
    const cpRow = Math.round(this.checkpoint.y / T - 0.5) + 1; // the flag sits in the cell above its platform
    const i = this.wps.findIndex((w) => w.step && w.home === cpRow);
    this.wpi = i < 0 ? 0 : i; this.afterWait = false; this.holdT = 0;
    this.input.left = this.input.right = this.input.jumpHeld = false;
  }

  autopilot(wps: Waypoint[]) { this.wps = wps.slice(); this.wpi = 0; }
  teleport(x: number, y: number) { this.x = x; this.y = y; this.vx = 0; this.vy = 0; }

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(r.width * this.dpr); this.canvas.height = Math.round(r.height * this.dpr);
    this.cssW = r.width; this.cssH = r.height;
    this.baseScale = this.phone() ? Math.min(Math.max(r.width / (6.25 * T), r.height / (13 * T)), r.height / (9 * T)) : r.height / (11 * T);
    this.applyZoom();
    this.clampCam();
  }
  /** The view pulls back a little during a spring flight so the landing is on screen. */
  private applyZoom() { this.scale = this.baseScale * this.zoom; this.vw = this.cssW / this.scale; this.vh = this.cssH / this.scale; }

  // ---------- loop ----------
  private loop(now: number) {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.033, (now - this.last) / 1000 || 0.016); this.last = now;
    if (!this.visible || document.hidden) return;
    this.tick(dt); this.draw();
  }

  tick(dt: number) {
    this.t += dt;
    if (this.state === 'running') { if (this.wps.length) this.runAutopilot(dt); this.time += dt; this.step(dt); }
    else if (this.state === 'dead') { this.deadT -= dt; if (this.deadT <= 0) { this.state = 'running'; this.resetBall(true); this.rewindRoute(); } }
    this.blinkT -= dt; if (this.blinkT <= 0) { this.blink = 1; this.blinkT = rand(2, 5); } this.blink = Math.max(0, this.blink - dt * 8);
    this.sx += (1 - this.sx) * Math.min(1, dt * 12); this.sy += (1 - this.sy) * Math.min(1, dt * 12);
    if (this.shake > 0) this.shake -= dt;
    for (const s of this.level.springs) s.t += dt;
    for (const p of this.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 1600 * dt; p.life -= dt; }
    if (this.parts.length > 160) this.parts.splice(0, this.parts.length - 160);
    this.parts = this.parts.filter((p) => p.life > 0);
    this.updateCam(dt);
  }

  private runAutopilot(dt: number) {
    const inp = this.input;
    if (this.holdT > 0 && (this.holdT -= dt) <= 0) inp.jumpHeld = false;
    const wp = this.wps[this.wpi]; if (!wp) return;
    if (!this.afterWait && wp.col !== undefined) {
      const passed = wp.dir === 'left' ? this.x <= wp.col * T + 4 : this.x >= wp.col * T - 4;
      const rowOk = wp.row === undefined || Math.abs(this.y / T - (wp.row + 0.5)) < 1.6;
      if (!passed || !rowOk) return;
    }
    switch (wp.act) {
      case 'right': inp.right = true; inp.left = false; break;
      case 'left': inp.left = true; inp.right = false; break;
      case 'stop': inp.right = inp.left = false; break;
      case 'jump': inp.jumpPressed = true; inp.jumpHeld = true; this.holdT = wp.hold ?? 0.45; break;
      case 'wait': if (!wp.until!(this.debug())) return; break;
    }
    this.afterWait = wp.act === 'wait';
    this.wpi++;
  }

  // ---------- physics ----------
  private step(dt: number) {
    const F = FORMS[this.form], L = this.level, inp = this.input;
    // gates and platforms move first
    for (const g of L.gates) if (g.open > 0 && g.open < 1) g.open = Math.min(1, g.open + dt / PARAMS.gateOpenTime);
    for (const p of L.platforms) {
      if (p.axis === 'x') { p.vx = p.dir * p.speed; p.vy = 0; } else { p.vy = p.dir * p.speed; p.vx = 0; }
    }
    // jump intent
    if (inp.jumpPressed) { this.buffer = 0.12; inp.jumpPressed = false; }
    this.jumpHeld = inp.jumpHeld;
    const speed = Math.max(Math.abs(this.vx), Math.abs(this.vy)) + p_max(L);
    const n = Math.min(8, Math.max(1, Math.ceil((speed * dt) / (T / 2))));
    const sdt = dt / n;
    for (let i = 0; i < n; i++) this.substep(sdt, F);
    // hazards after movement
    const r = F.r;
    for (const s of L.spikes) { if (this.circleHitsSpike(s.cx, s.cy, s.dir, r)) { this.die(); return; } }
    if (this.y - r > L.h * T + T || this.y > this.checkpoint.y + 9 * T) { this.die(); return; }
    for (const egg of L.eggs) if (!egg.taken && Math.hypot(egg.x - this.x, egg.y - this.y) < r + 12) { egg.taken = true; this.eggs++; this.burst(egg.x, egg.y, C.eggShade, 10); this.hooks.onHud(this.eggs, L.eggTotal, this.time); }
    for (const pad of L.pads) if (Math.hypot((pad.cx + 0.5) * T - this.x, (pad.cy + 0.5) * T - this.y) < r + 14 && this.form !== pad.form) { this.form = pad.form; this.burst(this.x, this.y, pad.form === 'rock' ? C.rock : pad.form === 'light' ? C.light : C.ball, 16); this.sx = 1.35; this.sy = 0.7; }
    for (const w of L.warps) if (this.x > w.from.x0 * T && this.x < w.from.x1 * T && this.y > w.from.y0 * T && this.y < w.from.y1 * T) {
      this.burst(this.x, this.y, C.grass, 8); this.x = w.to.x * T; this.y = w.to.y * T; this.burst(this.x, this.y, C.grass, 8);
      this.cx = this.x - this.vw * 0.4; this.cy = this.y - this.vh * 0.55; this.clampCam(); break;
    }
    for (const c of L.checkpoints) if (!c.hit && Math.abs((c.cx + 0.5) * T - this.x) < T * 0.8 && (c.cy + 0.5) * T - this.y > -T && (c.cy + 0.5) * T - this.y < 2.5 * T) { c.hit = true; this.checkpoint = { x: (c.cx + 0.5) * T, y: (c.cy + 0.5) * T }; this.burst(this.x, this.y - r, C.ring, 10); }
    const ex = (L.exit.cx + 0.5) * T, ey = (L.exit.cy - 0.5) * T;
    if (Math.abs(ex - this.x) < r + 14 && Math.abs(ey - this.y) < 34 + r) { this.state = 'won'; this.burst(ex, ey, C.flower, 40); this.hooks.onWin(this.eggs, L.eggTotal, this.time); }
    // hud time once a second
    if (Math.floor(this.time) !== Math.floor(this.time - dt)) this.hooks.onHud(this.eggs, L.eggTotal, this.time);
  }

  private substep(dt: number, F: (typeof FORMS)['normal']) {
    const L = this.level, inp = this.input, r = F.r, hb = r - 2;
    // move platforms and carry the ball first
    for (const p of L.platforms) {
      const nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
      let dx = nx - p.x, dy = ny - p.y;
      if (p.axis === 'x') { if (nx < p.min || nx > p.max) { p.dir *= -1; p.vx = p.dir * p.speed; dx = 0; } }
      else { if (ny < p.min || ny > p.max) { p.dir *= -1; p.vy = p.dir * p.speed; dy = 0; } }
      p.x += dx; p.y += dy;
      if (this.ridingOn === p) { this.x += dx; this.y += dy; }
    }
    // forces
    const g = 2200 * F.grav;
    const target = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    const accel = (this.grounded ? 2400 : 1500) * F.accel;
    if (target !== 0) { if (this.vx * target < F.max) this.vx = target * Math.min(F.max, Math.abs(this.vx * target < 0 ? 0 : this.vx) + accel * dt) + (this.vx * target < 0 ? this.vx + target * accel * dt : 0) * 0; this.eyeDir = target; }
    else { const fr = this.grounded ? 1800 : 300; const s = Math.sign(this.vx); this.vx -= s * Math.min(Math.abs(this.vx), fr * dt); }
    if (Math.abs(this.vx) > 720) this.vx = Math.sign(this.vx) * 720;
    // fans
    for (const f of L.fans) {
      if (F.fan === 0) break;
      const fx = f.cx, fy = f.cy, bx = Math.floor(this.x / T), by = Math.floor(this.y / T);
      if (f.dir === 'up' && (bx === fx || bx === fx + 1 || bx === fx - 1) && by < fy && by >= fy - f.reach) { this.vy -= PARAMS.fanForce * F.fan * dt * (bx === fx ? 1 : 0.5); if (this.vy < -640) this.vy = -640; }
      if (f.dir === 'right' && bx > fx && bx <= fx + f.reach && by <= fy + 1 && by >= fy - 4) this.vx += PARAMS.fanForce * 0.7 * F.fan * dt;
      if (f.dir === 'left' && bx < fx && bx >= fx - f.reach && by <= fy + 1 && by >= fy - 4) this.vx -= PARAMS.fanForce * 0.7 * F.fan * dt;
    }
    this.vy += g * dt; this.vy = Math.min(this.vy, 1400);
    // jump
    if (this.grounded) this.coyote = 0.08; else this.coyote -= dt;
    if (this.buffer > 0) this.buffer -= dt;
    if (this.buffer > 0 && (this.grounded || this.coyote > 0)) { this.vy = -F.jump; this.jumping = true; this.grounded = false; this.ridingOn = null; this.coyote = 0; this.buffer = 0; this.sx = 0.8; this.sy = 1.25; this.burst(this.x, this.y + r, 'rgba(255,255,255,0.9)', 4); }
    if (this.jumping && !this.jumpHeld && this.vy < -F.jump * 0.6) this.vy = -F.jump * 0.6; // release early = shorter jump, but only for jumps
    if (this.vy >= 0) this.jumping = false;

    // X move + resolve
    this.x += this.vx * dt;
    if (this.collideX(hb, F)) this.vx = 0;
    // Y move + resolve
    this.prevBottom = this.y + hb;
    this.y += this.vy * dt;
    const wasGrounded = this.grounded; this.grounded = false; this.ridingOn = null;
    const hitY = this.collideY(hb, F);
    if (hitY === 'floor') {
      if (this.vy > 260 && !wasGrounded) { this.sx = 1.3; this.sy = 0.72; if (this.vy > 900) this.burst(this.x, this.y + hb, 'rgba(255,255,255,0.8)', 6); this.vy = -this.vy * 0.22; if (Math.abs(this.vy) < 120) this.vy = 0; }
      else this.vy = 0;
      this.grounded = this.vy <= 0 ? true : false; if (this.vy < 0) this.grounded = true;
    } else if (hitY === 'ceil') this.vy = 0;
    if (this.y - hb < -2 * T) { this.y = -2 * T + hb; if (this.vy < 0) this.vy = 0; }
    if (this.x - hb < 0) { this.x = hb; this.vx = 0; }
    if (this.x + hb > L.w * T) { this.x = L.w * T - hb; this.vx = 0; }
  }

  private cellSolid(cx: number, cy: number): number {
    if (cx < 0 || cx >= this.level.w || cy < 0) return 0; if (cy >= this.level.h) return 0;
    return this.solid[cy * this.level.w + cx];
  }
  /** returns true when an X collision was resolved */
  private collideX(hb: number, F: (typeof FORMS)['normal']): boolean {
    const L = this.level; let hit = false;
    const y0 = Math.floor((this.y - hb + 1) / T), y1 = Math.floor((this.y + hb - 1) / T);
    if (this.vx > 0) {
      const cx = Math.floor((this.x + hb) / T);
      for (let cy = y0; cy <= y1; cy++) { const v = this.cellSolid(cx, cy); if (v === 1 || v === 4 || v === 3 || v === 5) { if (v === 3 && F === FORMS.rock) { this.smash(cx, cy); continue; } this.x = cx * T - hb; hit = true; } }
    } else if (this.vx < 0) {
      const cx = Math.floor((this.x - hb) / T);
      for (let cy = y0; cy <= y1; cy++) { const v = this.cellSolid(cx, cy); if (v === 1 || v === 4 || v === 3 || v === 5) { if (v === 3 && F === FORMS.rock) { this.smash(cx, cy); continue; } this.x = (cx + 1) * T + hb; hit = true; } }
    }
    // gates and platforms as boxes
    for (const g of L.gates) { const gh = (g.bottom - g.top + 1) * T; const box = { x: g.cx * T + 8, y: g.top * T - gh * g.open, w: T - 16, h: gh }; if (g.open < 1 && this.overlaps(box, hb)) { if (this.vx > 0) this.x = box.x - hb; else if (this.vx < 0) this.x = box.x + box.w + hb; hit = true; } }
    for (const p of L.platforms) if (this.overlaps(p, hb) && this.ridingOn !== p) { const above = this.prevBottom <= p.y + 2; if (!above) { if (this.x < p.x + p.w / 2) this.x = p.x - hb; else this.x = p.x + p.w + hb; hit = true; } }
    return hit;
  }
  private collideY(hb: number, F: (typeof FORMS)['normal']): 'floor' | 'ceil' | null {
    const L = this.level; let res: 'floor' | 'ceil' | null = null;
    const x0 = Math.floor((this.x - hb + 1) / T), x1 = Math.floor((this.x + hb - 1) / T);
    if (this.vy >= 0) {
      const cy = Math.floor((this.y + hb) / T);
      for (let cx = x0; cx <= x1; cx++) {
        const v = this.cellSolid(cx, cy);
        if (v === 1 || v === 4 || v === 3 || v === 5 || (v === 2 && this.prevBottom <= cy * T + 1)) {
          if (v === 3 && F === FORMS.rock && this.vy > 200) { this.smash(cx, cy); continue; }
          this.y = cy * T - hb; res = 'floor';
        }
      }
      for (const p of L.platforms) if (this.overlaps(p, hb) && this.prevBottom <= p.y + Math.abs(p.vy) * 0.04 + 3) { this.y = p.y - hb; res = 'floor'; this.ridingOn = p; }
      for (const g of L.gates) { const gh = (g.bottom - g.top + 1) * T; const box = { x: g.cx * T + 8, y: g.top * T - gh * g.open, w: T - 16, h: gh }; if (g.open < 1 && this.overlaps(box, hb) && this.prevBottom <= box.y + 2) { this.y = box.y - hb; res = 'floor'; } }
      // springs and buttons live in their tiles; touching from above triggers them
      for (const s of L.springs) if (this.overlapsTile(s.cx, s.cy, hb) && this.vy >= 0) { const jump = Math.sqrt(2 * 2200 * F.grav * PARAMS.springTiles * T); this.vy = -jump; this.jumping = false; s.t = 0; this.y = s.cy * T + T - hb - 6; this.sx = 0.75; this.sy = 1.3; this.grounded = false; return null; }
      for (const b of L.buttons) if (!b.pressed && this.overlapsTile(b.cx, b.cy, hb)) { b.pressed = true; const g = L.gates[b.gate]; if (g && g.open === 0) g.open = 0.001; this.burst((b.cx + 0.5) * T, b.cy * T + T - 10, C.grass, 8); }
    } else {
      const cy = Math.floor((this.y - hb) / T);
      for (let cx = x0; cx <= x1; cx++) { const v = this.cellSolid(cx, cy); if (v === 1 || v === 4 || v === 3 || v === 5) { if (v === 3 && F === FORMS.rock) { this.smash(cx, cy); continue; } this.y = (cy + 1) * T + hb; res = 'ceil'; } }
      for (const p of L.platforms) if (this.overlaps(p, hb)) { this.y = p.y + p.h + hb; res = 'ceil'; }
    }
    return res;
  }
  private overlaps(b: { x: number; y: number; w: number; h: number }, hb: number) { return this.x + hb > b.x && this.x - hb < b.x + b.w && this.y + hb > b.y && this.y - hb < b.y + b.h; }
  private overlapsTile(cx: number, cy: number, hb: number) { return this.overlaps({ x: cx * T + 4, y: cy * T + T * 0.45, w: T - 8, h: T * 0.55 }, hb); }
  private circleHitsSpike(cx: number, cy: number, dir: 'up' | 'down' | 'left' | 'right', r: number) {
    const inset = 0.42;
    const box = dir === 'up' ? { x: cx * T + 6, y: cy * T + T * inset, w: T - 12, h: T * (1 - inset) } : dir === 'down' ? { x: cx * T + 6, y: cy * T, w: T - 12, h: T * (1 - inset) }
      : dir === 'right' ? { x: cx * T, y: cy * T + 6, w: T * (1 - inset), h: T - 12 } : { x: cx * T + T * inset, y: cy * T + 6, w: T * (1 - inset), h: T - 12 };
    const nx = Math.max(box.x, Math.min(this.x, box.x + box.w)), ny = Math.max(box.y, Math.min(this.y, box.y + box.h));
    return Math.hypot(this.x - nx, this.y - ny) < r - 3;
  }
  private smash(cx: number, cy: number) { this.solid[cy * this.level.w + cx] = 0; invalidateContours(this.solid); this.burst((cx + 0.5) * T, (cy + 0.5) * T, '#D9CFBB', 14); this.shake = 0.15; }
  private die() {
    if (this.state !== 'running') return;
    this.deaths++; this.burst(this.x, this.y, C.ball, 30); this.shake = 0.3; this.hooks.onDeath();
    // the nearest flag the ball has already passed
    let best = this.checkpoint, bd = Infinity;
    for (const c of this.level.checkpoints) { if (!c.hit) continue; const cx = (c.cx + 0.5) * T, cy = (c.cy + 0.5) * T; const d = Math.hypot(cx - this.x, cy - this.y); if (d < bd) { bd = d; best = { x: cx, y: cy }; } }
    this.checkpoint = best;
    this.state = 'dead'; this.deadT = 0.7;
  }
  private burst(x: number, y: number, c: string, n: number) { for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: rand(-260, 260), vy: rand(-420, 60), life: rand(0.3, 0.7), c, r: rand(2, 5) }); }

  // ---------- camera ----------
  private updateCam(dt: number) {
    const ph = this.phone();
    const flying = !this.grounded && this.vy < -350 && Math.abs(this.vx) > 200; // a spring launch: lead further so the landing is on screen
    const zt = flying || (!this.grounded && this.vy < -900) ? (ph ? 0.82 : 0.88) : 1; this.zoom += (zt - this.zoom) * Math.min(1, dt * 2.5); this.applyZoom();
    const look = flying ? Math.sign(this.vx) * this.vw * 0.3 : this.eyeDir * 90 * Math.min(1, Math.abs(this.vx) / 200 + 0.3);
    const tx = this.x + look - this.vw * 0.42, ty = this.y - this.vh * (flying ? (ph ? 0.74 : 0.7) : this.vy < -200 ? (ph ? 0.58 : 0.66) : ph ? 0.5 : 0.58);
    const k = Math.min(1, dt * 6);
    this.cx += (tx - this.cx) * k;
    const dz = 50; if (ty > this.cy + dz) this.cy += (ty - dz - this.cy) * k; else if (ty < this.cy - dz) this.cy += (ty + dz - this.cy) * k;
    this.clampCam();
  }
  private clampCam() { const L = this.level; this.cx = Math.max(0, Math.min(L.w * T - this.vw, this.cx)); this.cy = Math.max(-2 * T, Math.min(L.h * T - this.vh, this.cy)); }

  // ---------- draw ----------
  draw() {
    const { ctx, level: L } = this;
    const s = this.scale * this.dpr;
    const shx = this.shake > 0 ? rand(-4, 4) * this.shake * 3 : 0, shy = this.shake > 0 ? rand(-3, 3) * this.shake * 3 : 0;
    ctx.setTransform(s, 0, 0, s, (-this.cx + shx) * s, (-this.cy + shy) * s);
    drawSky(ctx, this.cx, this.cy, this.vw, this.vh, this.t, L.h * T);
    drawBackdrop(ctx, L, this.cx, this.cy, this.vw, this.vh, this.t);
    const x0 = Math.max(0, Math.floor(this.cx / T) - 1), x1 = Math.min(L.w - 1, Math.floor((this.cx + this.vw) / T) + 1);
    const y0 = Math.max(0, Math.floor(this.cy / T) - 1), y1 = Math.min(L.h - 1, Math.floor((this.cy + this.vh) / T) + 1);
    drawTiles(ctx, L, this.solid, x0, x1, y0, y1);
    for (const p of L.platforms) if (p.x + p.w > this.cx && p.x < this.cx + this.vw) drawPlatform(ctx, p.x, p.y, p.w, ropeTopFn(L, this.solid, Math.round(p.y / T)));
    const inView = (cx: number, cy: number) => cx >= x0 - 2 && cx <= x1 + 2 && cy >= y0 - 2 && cy <= y1 + 2;
    for (const d of L.decor) if (inView(d.cx, d.cy)) drawDecor(ctx, d, this.t);
    for (const f of L.fans) if (inView(f.cx, f.cy)) drawFan(ctx, f.cx, f.cy, f.dir, f.reach, this.t);
    for (const g of L.gates) if (inView(g.cx, g.top)) drawGate(ctx, g.cx, g.top, g.bottom, g.open);
    for (const b of L.buttons) if (inView(b.cx, b.cy)) drawButton(ctx, b.cx, b.cy, b.pressed);
    for (const sp of L.springs) if (inView(sp.cx, sp.cy)) drawSpring(ctx, sp.cx, sp.cy, sp.t);
    for (const sp of L.spikes) if (inView(sp.cx, sp.cy)) drawSpike(ctx, sp.cx, sp.cy, sp.dir);
    for (const c of L.checkpoints) if (inView(c.cx, c.cy)) drawCheckpoint(ctx, c.cx, c.cy, c.hit, c.dir, this.t);
    for (const p of L.pads) if (inView(p.cx, p.cy)) drawPad(ctx, p.cx, p.cy, p.form, this.t);
    for (const e of L.eggs) if (!e.taken && e.x > this.cx - T && e.x < this.cx + this.vw + T && e.y > this.cy - T && e.y < this.cy + this.vh + T) drawEgg(ctx, e.x, e.y, e.t + this.t);
    drawExit(ctx, L.exit.cx, L.exit.cy, this.t);
    if (this.state !== 'dead') {
      // shadow
      // shadow projected onto the ground below the ball
      const gr = FORMS[this.form].r; const bx = Math.floor(this.x / T); let gy = -1;
      for (let cy = Math.floor((this.y + gr) / T); cy < Math.min(L.h, Math.floor((this.y + gr) / T) + 10); cy++) { const v = this.cellSolid(bx, cy); if (v === 1 || v === 3 || v === 4 || v === 5 || v === 2) { gy = cy * T; break; } }
      for (const pl of L.platforms) if (this.x > pl.x - 4 && this.x < pl.x + pl.w + 4 && pl.y >= this.y + gr - 2 && (gy < 0 || pl.y < gy)) gy = pl.y;
      if (gy >= 0) { const dist = Math.max(0, gy - (this.y + gr)), k = Math.max(0.25, 1 - dist / (8 * T)); ctx.fillStyle = `rgba(20,18,15,${0.14 * k})`; ctx.beginPath(); ctx.ellipse(this.x, gy + 2, gr * 0.9 * this.sx * k, 4 * k, 0, 0, Math.PI * 2); ctx.fill(); }
      drawBall(ctx, this.x, this.y, FORMS[this.form].r, this.form, this.sx, this.sy, this.eyeDir * (0.5 + Math.min(1, Math.abs(this.vx) / 300)), this.blink, this.t);
    }
    drawSecret(ctx, L, this.solid, x0, x1, y0, y1);
    for (const p of this.parts) { ctx.globalAlpha = Math.min(1, p.life * 2.5); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  }

  // ---------- debug ----------
  debug(): DebugInfo {
    const L = this.level, bx = Math.floor(this.x / T), by = Math.floor(this.y / T);
    let hazard: DebugInfo['hazard'] = null;
    for (let cx = bx; cx < Math.min(L.w, bx + 14); cx++) {
      const spike = L.spikes.find((s) => s.cx === cx && Math.abs(s.cy - by) <= 4);
      if (spike) { hazard = { kind: 'spike', x: cx * T, dist: cx * T - this.x }; break; }
    }
    return { state: this.state, x: this.x, y: this.y, vx: this.vx, vy: this.vy, grounded: this.grounded, form: this.form, deaths: this.deaths, eggs: this.eggs, eggsLeft: L.eggTotal - this.eggs, wp: this.wpi, hazard, platforms: L.platforms.map((p) => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy })) };
  }
  destroy() { cancelAnimationFrame(this.raf); }
}
function p_max(L: Level) { let m = 0; for (const p of L.platforms) m = Math.max(m, p.speed); return m; }
