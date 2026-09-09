// Matter.js world with the sticky notes as DOM-synced bodies. Desktop only. Loaded on demand.
import type MatterNS from 'matter-js';
import { gsap } from './scroll';
import { q, qa } from './prefs';
import { setCursorState } from './cursor';

type Body = MatterNS.Body;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export async function startPhysics() {
  const Matter = (await import('matter-js')).default;
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping, Vector } = Matter;

  const hero = q('.hero');
  const noteEls = qa<HTMLLIElement>('.note');

  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 1.35;
  const world = engine.world;
  const T = 240;
  let W = hero.clientWidth, H = hero.clientHeight;
  let statics: Body[] = [];

  function buildStatics() {
    if (statics.length) Composite.remove(world, statics);
    W = hero.clientWidth; H = hero.clientHeight;
    statics = [
      Bodies.rectangle(W / 2, H + T / 2, W + T * 2, T, { isStatic: true }),
      Bodies.rectangle(-T / 2, H / 2 - H, T, H * 4, { isStatic: true }),
      Bodies.rectangle(W + T / 2, H / 2 - H, T, H * 4, { isStatic: true }),
    ];
    Composite.add(world, statics);
  }
  buildStatics();

  const pairs: { body: Body; el: HTMLElement; w: number; h: number }[] = [];
  function spawn(el: HTMLElement) {
    const w = el.offsetWidth, h = el.offsetHeight;
    const body = Bodies.rectangle(rand(w / 2 + 24, W - w / 2 - 24), -h - rand(20, 220), w, h, {
      restitution: 0.16, friction: 0.72, frictionAir: 0.028, density: 0.0022,
      angle: rand(-0.45, 0.45), chamfer: { radius: 14 }, // rounded corners so notes topple instead of standing on edge
    });
    Body.setAngularVelocity(body, rand(-0.05, 0.05));
    Composite.add(world, body);
    pairs.push({ body, el, w, h });
    el.style.opacity = '1';
  }

  // hide until spawned so they don't flash at (0,0)
  noteEls.forEach((el) => (el.style.opacity = '0'));
  noteEls.forEach((el, i) => gsap.delayedCall(i * 0.09, () => spawn(el)));

  let visible = true, frame = 0;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 }).observe(hero);

  function step() {
    if (!visible) return;
    Engine.update(engine, 1000 / 60);
    for (const p of pairs) {
      const { x, y } = p.body.position;
      p.el.style.transform = `translate3d(${(x - p.w / 2).toFixed(2)}px, ${(y - p.h / 2).toFixed(2)}px, 0) rotate(${p.body.angle.toFixed(4)}rad)`;
    }
    if (++frame % 30 === 0) {
      for (const p of pairs) {
        const { x, y } = p.body.position;
        if (y > H + 120 || x < -120 || x > W + 120) {
          Body.setPosition(p.body, { x: rand(W * 0.2, W * 0.8), y: -120 });
          Body.setVelocity(p.body, { x: 0, y: 0 });
          Sleeping.set(p.body, false);
        }
      }
    }
  }
  gsap.ticker.add(step);

  // ---- drag and throw (Pointer Events, no MouseConstraint) ----
  const toLocal = (e: PointerEvent) => {
    const r = hero.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  let constraint: MatterNS.Constraint | null = null;
  let dragging: (typeof pairs)[number] | null = null;
  let samples: { x: number; y: number; t: number }[] = [];

  hero.addEventListener('pointerdown', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('.note');
    if (!el || e.button !== 0) return;
    const pair = pairs.find((p) => p.el === el);
    if (!pair) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    const p = toLocal(e);
    Sleeping.set(pair.body, false);
    const offset = Vector.rotate(Vector.sub(p, pair.body.position), -pair.body.angle);
    constraint = Constraint.create({ pointA: p, bodyB: pair.body, pointB: offset, stiffness: 0.22, damping: 0.08, length: 0 });
    Composite.add(world, constraint);
    dragging = pair;
    samples = [{ ...p, t: performance.now() }];
    el.classList.add('is-drag');
    setCursorState('grabbing');
  });

  hero.addEventListener('pointermove', (e) => {
    if (!constraint || !dragging) return;
    const p = toLocal(e);
    constraint.pointA = p;
    samples.push({ ...p, t: performance.now() });
    if (samples.length > 6) samples.shift();
    Sleeping.set(dragging.body, false);
  });

  const release = () => {
    if (!constraint || !dragging) return;
    Composite.remove(world, constraint);
    const a = samples[0], b = samples[samples.length - 1];
    const dt = Math.max(16, b.t - a.t);
    let vx = ((b.x - a.x) / dt) * (1000 / 60), vy = ((b.y - a.y) / dt) * (1000 / 60);
    const mag = Math.hypot(vx, vy), max = 26;
    if (mag > max) { vx *= max / mag; vy *= max / mag; }
    Body.setVelocity(dragging.body, { x: vx, y: vy });
    Body.setAngularVelocity(dragging.body, rand(-0.08, 0.08));
    dragging.el.classList.remove('is-drag');
    dragging = null; constraint = null;
    setCursorState('drag');
  };
  hero.addEventListener('pointerup', release);
  hero.addEventListener('pointercancel', release);

  // ---- resize: rebuild walls and keep-outs, keep bodies inside ----
  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => {
      buildStatics();
      for (const p of pairs) {
        const x = Math.min(Math.max(p.body.position.x, p.w / 2 + 8), W - p.w / 2 - 8);
        Body.setPosition(p.body, { x, y: Math.min(p.body.position.y, H - p.h / 2 - 8) });
        Sleeping.set(p.body, false);
      }
    }, 200);
  });
}
