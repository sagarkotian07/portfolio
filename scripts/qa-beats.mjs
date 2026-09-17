// Screenshots of the level at each beat of the brief, for comparing against the reference frames.
// Usage: node scripts/qa-beats.mjs [baseUrl] [outDir] [phone]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base = process.argv[2] ?? 'http://localhost:4173/', out = process.argv[3] ?? 'qa/beats', phone = process.argv[4] === 'phone';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(base, { waitUntil: 'load' }); await page.waitForTimeout(3500);
await page.evaluate(() => document.getElementById('play').scrollIntoView()); await page.waitForTimeout(800);
const stage = page.locator('#game-stage');
await stage.screenshot({ path: `${out}/00-idle-card.png` });
await page.evaluate(() => { document.documentElement.classList.add('is-playing'); document.getElementById('game-start').hidden = true; });
await page.waitForTimeout(600);
// [name, x, y] in diameters (the ball's resting position), plus optional world state
const beats = [
  ['01-start', 0, 0], ['02-first-slope', 12, 2.7], ['03-lower-run', 24, 9.65], ['04-white-islands', 36, 5.7], ['05-vine-b', 50, 8.4],
  ['06-plank-up', 73, 7.1], ['07-plank-down', 77, 6.7, { plank: 'down' }], ['08-branch-d', 85, 7.15], ['09-ledges', 100.9, 7.5], ['10-hill-top', 118, 6.2],
  ['11-valley', 127, 12.4], ['12-island-hopping', 161.5, 7.5], ['13-hill-2-plateau', 193, 6.1], ['14-drop', 198.3, 9.1], ['15-purple-floor', 199, 33.5, { corrupted: true }],
  ['16-staircase', 206.5, 21.4, { corrupted: true }], ['17-machine', 216, 7.5, { corrupted: true }], ['18-wreck', 223, 7.5, { destroyed: true }], ['19-pumpkin', 225.5, 7.5, { destroyed: true }],
];
for (const [name, x, y, st = {}] of beats) {
  await page.evaluate(([x, y, st]) => {
    const { game } = window.__bounce; document.getElementById('game-end').hidden = true; game.autopilot([]); game.start(); game.input.left = game.input.right = false;
    if (st.plank) { game.level.plank.state = st.plank; game.level.plank.a = Math.PI / 2; }
    if (st.destroyed) game.level.machine.destroyed = true;
    game.refresh(); game.teleport(x * 40, y * 40);
    for (let i = 0; i < 40; i++) game.tick(1 / 60);
    if (st.corrupted !== undefined) game.corrupted = st.corrupted; if (st.destroyed) game.corrupted = false;
    game.draw();
  }, [x, y, st]);
  await stage.screenshot({ path: `${out}/${name}.png` });
}
await browser.close();
console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no page errors', '->', out);
