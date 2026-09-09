// Drives the game deterministically through tick(), follows the waypoints, and checks it can be won.
// Usage: node scripts/qa-game.mjs [baseUrl] [outDir]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base = process.argv[2] ?? 'http://localhost:4173/', out = process.argv[3] ?? 'qa';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];

// ---- desktop: scripted completion ----
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => errors.push('desktop pageerror: ' + e.message));
  await page.goto(base, { waitUntil: 'load' }); await page.waitForTimeout(3500);
  await page.evaluate(() => document.getElementById('play').scrollIntoView()); await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/game-start.png` });
  const result = await page.evaluate(() => {
    const { game, waypoints } = window.__bounce;
    game.start(); game.autopilot(waypoints);
    const trace = [];
    for (let i = 0; i < 60 * 150; i++) {
      game.tick(1 / 60);
      if (i % 30 === 0) { const d = game.debug(); trace.push({ t: i / 60, x: Math.round(d.x / 40 * 10) / 10, y: Math.round(d.y / 40 * 10) / 10, vx: Math.round(d.vx), vy: Math.round(d.vy), g: d.grounded ? 1 : 0, d: d.deaths, e: d.eggs, wp: d.wp }); }
      if (game.state === 'won') break;
    }
    const d = game.debug(); game.draw();
    return { ...d, trace };
  });
  await page.screenshot({ path: `${out}/game-final.png` });
  console.log('desktop run:', JSON.stringify({ state: result.state, deaths: result.deaths, eggs: result.eggs, xTiles: Math.round(result.x / 40 * 10) / 10, yTiles: Math.round(result.y / 40 * 10) / 10, wp: result.wp, time: result.trace.length / 2 }));
  if (result.state !== 'won') { const tr = result.trace; let k = tr.length - 1; while (k > 0 && tr[k].x === tr[k - 1].x && tr[k].y === tr[k - 1].y) k--; console.log('stalled at sample', k, 'of', tr.length); console.log('trace:', JSON.stringify(tr.slice(Math.max(0, k - 14), k + 2))); }
  // a few mid-level frames for the eye (autopilot off, nav faded out, end card hidden)
  await page.evaluate(() => { document.documentElement.classList.add('is-playing'); document.getElementById('game-start').hidden = true; });
  await page.waitForTimeout(900);
  for (const [name, tx, ty] of [['bottom', 6, 60], ['spring', 22, 52], ['island', 25, 40], ['plank', 19, 34], ['top', 9, 4]]) {
    await page.evaluate(([x, y]) => { const { game } = window.__bounce; document.getElementById('game-end').hidden = true; game.autopilot([]); game.start(); game.input.left = game.input.right = false; game.teleport(x * 40, y * 40); for (let i = 0; i < 40; i++) game.tick(1 / 60); game.draw(); }, [tx, ty]);
    await page.screenshot({ path: `${out}/game-${name}.png` });
  }
  await page.close();
}
// ---- phone: touch buttons move and jump; page does not scroll while playing ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('phone pageerror: ' + e.message));
  await page.goto(base, { waitUntil: 'load' }); await page.waitForTimeout(3500);
  await page.evaluate(() => document.getElementById('play').scrollIntoView()); await page.waitForTimeout(600);
  await page.locator('#game-play').tap(); await page.waitForTimeout(500);
  const touchVisible = await page.locator('#game-touch').isVisible();
  const x0 = await page.evaluate(() => window.__bounce.game.debug().x);
  const right = await page.locator('[data-key="right"]').boundingBox(), jump = await page.locator('[data-key="jump"]').boundingBox();
  const cdp = await ctx.newCDPSession(page);
  const touch = async (type, id, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: right.x + right.width / 2, y: right.y + right.height / 2, id: 1 }] });
  await page.waitForTimeout(900);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: right.x + right.width / 2, y: right.y + right.height / 2, id: 1 }, { x: jump.x + jump.width / 2, y: jump.y + jump.height / 2, id: 2 }] });
  await page.waitForTimeout(120);
  const mid = await page.evaluate(() => window.__bounce.game.debug());
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/phone-game.png` });
  const x1 = await page.evaluate(() => window.__bounce.game.debug().x);
  const scrolled = await page.evaluate(() => window.scrollY);
  console.log('phone run:', JSON.stringify({ touchVisible, movedRight: x1 > x0 + 40, jumped: mid.vy < -100 || !mid.grounded, scrollY: scrolled }));
  // the whole route on the phone build (same physics, phone camera): deterministic ticks
  const phoneRoute = await page.evaluate(() => { const { game, waypoints } = window.__bounce; game.start(); game.autopilot(waypoints); for (let i = 0; i < 60 * 150; i++) { game.tick(1 / 60); if (game.state === 'won') break; } const d = game.debug(); return { state: game.state, deaths: d.deaths, eggs: d.eggs, time: Math.round(game.time) }; });
  console.log('phone route:', JSON.stringify(phoneRoute));
  void touch;
  await ctx.close();
}
await browser.close();
if (errors.length) { console.log('ISSUES:'); errors.forEach((e) => console.log(' -', e)); } else console.log('no page errors');
