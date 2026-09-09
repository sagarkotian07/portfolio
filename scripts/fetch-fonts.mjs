// Re-fetch the latin woff2 subsets from Google Fonts. Run once; output lives in public/fonts.
import { writeFile, mkdir } from 'node:fs/promises';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';
const url = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..800&family=Manrope:wght@400..800&family=Caveat:wght@500..700&display=swap';

const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
await mkdir('public/fonts', { recursive: true });
const faces = [];
for (const m of css.matchAll(/\/\*\s*(\w[\w-]*)\s*\*\/\s*@font-face\s*\{([\s\S]*?)\}/g)) {
  const [, subset, body] = m;
  if (subset !== 'latin') continue;
  const fam = /font-family:\s*'([^']+)'/.exec(body)[1];
  const src = /url\(([^)]+)\)/.exec(body)[1];
  const range = /unicode-range:\s*([^;]+);/.exec(body)[1].trim();
  const weight = /font-weight:\s*([^;]+);/.exec(body)[1].trim();
  const file = fam.toLowerCase().replace(/\s+/g, '-') + '.woff2';
  const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
  await writeFile(`public/fonts/${file}`, buf);
  faces.push(`@font-face {\n  font-family: '${fam}';\n  font-style: normal;\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('/fonts/${file}') format('woff2');\n  unicode-range: ${range};\n}`);
  console.log(`${fam} -> public/fonts/${file} (${(buf.length / 1024).toFixed(0)} KB)`);
}
console.log('\nPaste into src/styles/fonts.css:\n\n' + faces.join('\n\n'));
