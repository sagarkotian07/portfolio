// Cuts a short, muted, good-quality preview clip from each demo recording in assets/src and pulls a poster frame.
// The full recordings stay on Screen Studio; the cards link there.
// Uses the ffmpeg-static binary, so nothing needs installing system-wide.
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';

const jobs = [
  { src: 'assets/src/invoice-po.mp4', out: 'public/video/invoice-po-preview.mp4', frame: 'assets/src/frame-invoice.jpg', at: 3, seconds: 30 },
];
await mkdir('public/video', { recursive: true });
const run = (args) => execFileSync(ffmpeg, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

import { existsSync } from 'node:fs';
for (const j of jobs) {
  if (j.optional && !existsSync(j.src)) { console.log(`${j.src}: not there yet, skipped`); continue; }
  let info = '';
  try { execFileSync(ffmpeg, ['-i', j.src], { stdio: 'pipe' }); } catch (e) { info = e.stderr.toString(); }
  const dur = /Duration: (\d+):(\d+):([\d.]+)/.exec(info);
  const secs = dur ? (+dur[1]) * 3600 + (+dur[2]) * 60 + (+dur[3]) : 0;
  const res = /(\d{3,4})x(\d{3,4})/.exec(info)?.[0];
  console.log(`${j.src}: ${res} ${secs.toFixed(0)}s -> first ${j.seconds}s muted preview`);
  run(['-y', '-i', j.src, '-t', String(j.seconds), '-vf', 'scale=1280:-2,fps=30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p',
       '-movflags', '+faststart', '-an', j.out]);
  run(['-y', '-ss', String(j.at), '-i', j.src, '-frames:v', '1', '-q:v', '2', j.frame]);
  const size = (await stat(j.out)).size / 1024 / 1024;
  console.log(`  -> ${j.out} ${size.toFixed(1)} MB, poster ${j.frame}`);
}
