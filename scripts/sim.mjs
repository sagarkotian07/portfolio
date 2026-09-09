// Offline simulator: bundles src/game/engine.ts and drives tick() in node with a stub canvas.
// Usage: node sim.mjs [maxSeconds]  -> prints where the scripted run gets to, with a trace around the stall.
import { rolldown } from 'rolldown';
const build = async ({ entryPoints, outfile }) => { const b = await rolldown({ input: entryPoints[0], platform: 'node' }); await b.write({ file: outfile, format: 'esm' }); await b.close(); };
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
const root = process.cwd(); const simDir = root + '/qa/sim'; mkdirSync(simDir, { recursive: true });
await build({ entryPoints: [root + '/src/game/engine.ts'], outfile: simDir + '/engine.bundle.mjs' });
const stub = new Proxy(function () {}, { get: (_, k) => (k === 'then' ? undefined : stub), apply: () => stub, set: () => true });
globalThis.ResizeObserver = class { observe() {} };
globalThis.IntersectionObserver = class { observe() {} };
globalThis.requestAnimationFrame = () => 0; globalThis.cancelAnimationFrame = () => {};
globalThis.devicePixelRatio = 1; globalThis.performance = globalThis.performance ?? { now: () => 0 };
const canvas = { getContext: () => stub, getBoundingClientRect: () => ({ width: 800, height: 440 }), width: 800, height: 440, style: {} };
const { Game } = await import(pathToFileURL(simDir + '/engine.bundle.mjs').href);
const lvl = await build({ entryPoints: [root + '/src/game/level.ts'], outfile: simDir + '/level.bundle.mjs' }).then(() => import(pathToFileURL(simDir + '/level.bundle.mjs').href));
const maxS = Number(process.argv[2] ?? 200);
const g = new Game(canvas, { onHud() {}, onWin() {}, onDeath() {} }, () => false);
g.start(); g.autopilot(lvl.WAYPOINTS);
const trace = []; let lastWp = -1;
for (let i = 0; i < 60 * maxS; i++) {
  g.tick(1 / 60);
  const d = g.debug();
  if (i % 15 === 0 || d.wp !== lastWp) trace.push({ t: +(i / 60).toFixed(2), x: +(d.x / 40).toFixed(2), y: +(d.y / 40).toFixed(2), vx: Math.round(d.vx), vy: Math.round(d.vy), g: d.grounded ? 1 : 0, d: d.deaths, e: d.eggs, wp: d.wp });
  if (d.wp !== lastWp && lvl.WAYPOINTS[d.wp]?.step && process.argv.includes('--steps')) console.log(`step ${d.wp} at t=${(i / 60).toFixed(2)} x=${(d.x / 40).toFixed(2)} y=${(d.y / 40).toFixed(2)} eggs=${d.eggs} deaths=${d.deaths}`);
  lastWp = d.wp;
  if (g.state === 'won') break;
}
const d = g.debug();
console.log('eggs left:', g.level.eggs.filter((e) => !e.taken).map((e) => `${e.x / 40 - 0.5},${e.y / 40 - 0.5}`).join(' '));
console.log(JSON.stringify({ state: g.state, deaths: d.deaths, eggs: d.eggs, of: g.level.eggTotal, x: +(d.x / 40).toFixed(2), y: +(d.y / 40).toFixed(2), wp: d.wp, wps: lvl.WAYPOINTS.length, t: +(g.time).toFixed(1) }));
if (g.state !== 'won') { let k = trace.length - 1; while (k > 0 && Math.abs(trace[k].x - trace[k - 1].x) < 0.01 && Math.abs(trace[k].y - trace[k - 1].y) < 0.01) k--; console.log('stall from', trace[k].t, 's; waypoint', d.wp, JSON.stringify(lvl.WAYPOINTS[d.wp] ?? null, (k, v) => typeof v === 'function' ? '[fn]' : v)); console.log(trace.slice(Math.max(0, k - 12), k + 2).map((r) => JSON.stringify(r)).join('\n')); }
const win = process.argv.find((a) => a.startsWith('--from=')); if (win) { const [f, t] = win.slice(7).split(':').map(Number); console.log(trace.filter((r) => r.t >= f && r.t <= t).map((r) => JSON.stringify(r)).join('\n')); }
if (process.argv.includes('--deaths')) console.log('deaths trace:', JSON.stringify(trace.filter((r, i, a) => i && r.d !== a[i - 1].d)));
