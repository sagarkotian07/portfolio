// Compresses the demo recordings in assets/src to web size and pulls a poster frame from each.
// Uses the ffmpeg-static binary, so nothing needs installing system-wide.
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';

const jobs = [
  { src: 'assets/src/invoice-po.mp4', out: 'public/video/invoice-po.mp4', frame: 'assets/src/frame-invoice.jpg', at: 3 },
  { src: 'assets/src/dashboard.mp4',  out: 'public/video/dashboard.mp4',  frame: 'assets/src/frame-dashboard.jpg', at: 3 },
];
await mkdir('public/video', { recursive: true });
const run = (args) => execFileSync(ffmpeg, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

for (const j of jobs) {
  let info = '';
  try { execFileSync(ffmpeg, ['-i', j.src], { stdio: 'pipe' }); } catch (e) { info = e.stderr.toString(); }
  const dur = /Duration: (\d+):(\d+):([\d.]+)/.exec(info);
  const secs = dur ? (+dur[1]) * 3600 + (+dur[2]) * 60 + (+dur[3]) : 0;
  const hasAudio = /Stream #\d+:\d+.*Audio/.test(info);
  const res = /(\d{3,4})x(\d{3,4})/.exec(info)?.[0];
  console.log(`${j.src}: ${res} ${secs.toFixed(0)}s audio=${hasAudio}`);
  run(['-y', '-i', j.src, '-vf', 'scale=1280:-2,fps=30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '28', '-pix_fmt', 'yuv420p',
       '-movflags', '+faststart', ...(hasAudio ? ['-c:a', 'aac', '-b:a', '96k', '-ac', '2'] : ['-an']), j.out]);
  run(['-y', '-ss', String(j.at), '-i', j.src, '-frames:v', '1', '-q:v', '2', j.frame]);
  const size = (await stat(j.out)).size / 1024 / 1024;
  console.log(`  -> ${j.out} ${size.toFixed(1)} MB, poster ${j.frame}`);
}
