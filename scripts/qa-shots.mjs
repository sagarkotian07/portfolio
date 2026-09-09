// Visual QA: drives the installed Google Chrome against a running server, captures console
// errors, and writes screenshots for desktop, tablet and phone. Usage: node scripts/qa-shots.mjs [baseUrl] [outDir]
import { chromium, devices } from 'playwright';
void devices;
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:4173/';
const out = process.argv[3] ?? 'qa';
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];

async function run(name, ctxOpts, { fullPage = true, settle = 4500, scrollThrough = true } = {}) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`[${name}] pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${name}] console.${m.type()}: ${m.text()}`); });
  page.on('requestfailed', (r) => errors.push(`[${name}] requestfailed: ${r.url()} ${r.failure()?.errorText ?? ''}`));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(settle);
  await page.screenshot({ path: `${out}/${name}-hero.png` });
  if (scrollThrough) {
    // scroll in steps so ScrollTrigger reveals fire the way they do for a person
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 400) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(140); }
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
  }
  if (fullPage) await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
  const metrics = await page.evaluate(() => ({
    viewport: [innerWidth, innerHeight],
    scrollWidth: document.documentElement.scrollWidth,
    hero: document.documentElement.dataset.hero,
    motion: document.documentElement.dataset.motion,
    preloaderGone: !document.querySelector('.preloader:not([hidden])'),
    gameCanvas: !!document.querySelector('canvas.game__canvas'),
    levelsIn: document.querySelectorAll('.level.is-in').length,
  }));
  console.log(name, JSON.stringify(metrics));
  await ctx.close();
}

await run('desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

await run('laptop', { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 }, { fullPage: false, scrollThrough: false });
await run('tablet', { ...devices['iPad (gen 7)'], viewport: { width: 810, height: 1080 } });
await run('phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true }); // DPR 1: tall captures tile badly with smooth scroll at 2x
await run('reduced', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, { settle: 1500 });

await browser.close();
if (errors.length) { console.log('\nISSUES:'); errors.forEach((e) => console.log(' -', e)); }
else console.log('\nno console errors, page errors or failed requests');
