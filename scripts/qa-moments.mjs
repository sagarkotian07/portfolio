// Screenshots of the moments that only exist mid-run: the landing stars, the plank tipping, the machine bursting and the palette flicker, the completion card.
// Also measures how long a frame takes to draw. Usage: node scripts/qa-moments.mjs [baseUrl] [outDir]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base = process.argv[2] ?? 'http://localhost:4173/', out = process.argv[3] ?? 'qa/moments';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(base, { waitUntil: 'load' }); await page.waitForTimeout(3500);
await page.evaluate(() => document.getElementById('play').scrollIntoView()); await page.waitForTimeout(800);
await page.evaluate(() => { document.documentElement.classList.add('is-playing'); document.getElementById('game-start').hidden = true; });
const stage = page.locator('#game-stage');
// run the autopilot until a condition holds, then draw and shoot
const until = async (name, cond, extraTicks = 0) => {
  const ok = await page.evaluate(([cond, extra]) => {
    const { game } = window.__bounce; const f = new Function('d', 'game', 'return (' + cond + ')');
    for (let i = 0; i < 60 * 200; i++) { game.tick(1 / 60); if (f(game.debug(), game)) { for (let k = 0; k < extra; k++) game.tick(1 / 60); game.draw(); return true; } if (game.state === 'won' && !cond.includes('won')) break; }
    const d = game.debug(); return { state: d.state, x: +(d.x / 40).toFixed(1), y: +(d.y / 40).toFixed(1), wp: d.wp, deaths: d.deaths, corrupted: d.corrupted, machine: d.machine };
  }, [cond, extraTicks]);
  await stage.screenshot({ path: `${out}/${name}.png` });
  console.log(name, ok === true ? 'captured' : 'condition never met ' + JSON.stringify(ok));
};
await page.evaluate(() => { const { game, waypoints } = window.__bounce; game.start(); game.autopilot(waypoints); });
await until('01-landing-stars', 'd.x > 30 * 40 && d.grounded', 4);
await until('02-plank-tipping', "d.plank === 'falling' && game.level.plank.a > 0.5");
await until('03-plank-down', "d.plank === 'down'", 40);
await until('04-drop-purple', 'd.corrupted', 12);
await until('05-machine-burst', 'd.machine', 10);
await until('06-flicker-green', 'd.machine && game.palette.sky0 === "#4FA6E6"', 0);
await until('07-restored', 'd.machine && !d.corrupted', 20);
await until('08-into-the-door', "d.state === 'won'", 30);
await until('09-completed-card', "d.state === 'won'", 80);
// a death: teleport over the void and let it fall, then shoot the respawn
await page.evaluate(() => { const { game } = window.__bounce; game.start(); game.autopilot([]); game.teleport(98 * 40, 6 * 40); });
await until('10-falling', 'd.y > 15 * 40', 0);
await until('11-respawned', "d.state === 'running' && d.deaths === 1", 2);
// draw time: 240 frames of the busiest view
const perf = await page.evaluate(() => {
  const { game } = window.__bounce; game.start(); game.autopilot([]); game.teleport(216 * 40, 7.5 * 40); for (let i = 0; i < 30; i++) game.tick(1 / 60);
  const t0 = performance.now(); for (let i = 0; i < 240; i++) { game.tick(1 / 60); game.draw(); } const a = (performance.now() - t0) / 240;
  game.teleport(0, 0); for (let i = 0; i < 30; i++) game.tick(1 / 60);
  const t1 = performance.now(); for (let i = 0; i < 240; i++) { game.tick(1 / 60); game.draw(); } const b = (performance.now() - t1) / 240;
  return { machineViewMs: +a.toFixed(2), startViewMs: +b.toFixed(2) };
});
console.log('frame time', JSON.stringify(perf));
await browser.close();
console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no page errors');
