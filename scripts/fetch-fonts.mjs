// Re-fetch the latin woff2 subsets from Google Fonts. Run once; output lives in public/fonts.
// Also prints metric-matched Arial fallbacks (via @capsizecss/metrics) to paste into src/styles/fonts.css.
import { writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';
const url = 'https://fonts.googleapis.com/css2?family=Young+Serif&family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&display=swap';

const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
await mkdir('public/fonts', { recursive: true });
const faces = [];
const families = new Set();
for (const m of css.matchAll(/\/\*\s*(\w[\w-]*)\s*\*\/\s*@font-face\s*\{([\s\S]*?)\}/g)) {
  const [, subset, body] = m;
  if (subset !== 'latin') continue;
  const fam = /font-family:\s*'([^']+)'/.exec(body)[1];
  const style = /font-style:\s*([^;]+);/.exec(body)[1].trim();
  const src = /url\(([^)]+)\)/.exec(body)[1];
  const range = /unicode-range:\s*([^;]+);/.exec(body)[1].trim();
  const weight = /font-weight:\s*([^;]+);/.exec(body)[1].trim();
  const file = fam.toLowerCase().replace(/\s+/g, '-') + (style === 'italic' ? '-italic' : '') + '.woff2';
  const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
  await writeFile(`public/fonts/${file}`, buf);
  families.add(fam);
  faces.push(`@font-face {\n  font-family: '${fam}';\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('/fonts/${file}') format('woff2');\n  unicode-range: ${range};\n}`);
  console.log(`${fam} ${style} -> public/fonts/${file} (${(buf.length / 1024).toFixed(0)} KB)`);
}

// fallback faces so the layout does not shift while the real font loads
const { createFontStack } = require('@capsizecss/core');
const arial = require('@capsizecss/metrics/arial');
const fallbacks = [];
for (const fam of families) {
  const key = fam.replace(/\s+(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, (c) => c.toLowerCase());
  try {
    const metrics = require(`@capsizecss/metrics/${key}`);
    const { fontFaces } = createFontStack([metrics, arial]);
    fallbacks.push(fontFaces.replace(/\n\s*/g, ' ').trim());
  } catch (e) { console.warn(`no capsize metrics for ${fam} (${key}):`, e.message); }
}
console.log('\nPaste into src/styles/fonts.css:\n\n' + faces.join('\n\n') + '\n\n' + fallbacks.join('\n'));
