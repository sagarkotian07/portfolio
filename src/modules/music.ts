// Background music: an original, cheerful little loop played with the Web Audio API (no audio files, nothing copyrighted).
// Starts only after a user gesture, remembers the choice, pauses when the tab is hidden.
import { q } from './prefs';

const KEY = 'music-on';
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
// note names to MIDI
const N: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const note = (s: string) => (s === '.' ? -1 : N[s[0]] + (s[1] === '#' ? 1 : 0) + 12 * (Number(s[s.length - 1]) + 1));

// 8 bars, 8 eighth notes each. A bright pentatonic tune in C, with a walking bass under it.
const LEAD = (
  'E5 G5 A5 G5 E5 D5 C5 D5  E5 E5 G5 A5 C6 A5 G5 E5  D5 E5 G5 E5 D5 C5 A4 C5  D5 D5 E5 D5 C5 . . .  ' +
  'G5 A5 C6 A5 G5 E5 D5 E5  G5 G5 A5 C6 D6 C6 A5 G5  E5 G5 A5 G5 E5 D5 C5 D5  C5 . E5 . G5 . C6 .'
).split(/\s+/).map(note);
const BASS = 'C3 C3 G2 G2 A2 A2 F2 F2 C3 C3 G2 G2 F2 F2 G2 G2 C3 C3 G2 G2 A2 A2 F2 F2 C3 C3 G2 G2 F2 G2 C3 C3'.split(/\s+/).map(note);
const BPM = 126, STEP = 60 / BPM / 2; // seconds per eighth note

export function initMusic() {
  const btn = q<HTMLButtonElement>('#music'); if (!btn) return;
  const label = btn.querySelector<HTMLElement>('.music__label')!;
  let ctx: AudioContext | null = null, master: GainNode | null = null, timer = 0, step = 0, nextAt = 0, on = false;
  const setUi = (v: boolean) => { btn.setAttribute('aria-pressed', String(v)); btn.classList.toggle('is-on', v); label.textContent = v ? 'Music on' : 'Music off'; };

  const build = () => {
    ctx = new AudioContext();
    master = ctx.createGain(); master.gain.value = 0;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
    const delay = ctx.createDelay(0.5); delay.delayTime.value = STEP * 1.5; const fb = ctx.createGain(); fb.gain.value = 0.22; const wet = ctx.createGain(); wet.gain.value = 0.18;
    master.connect(lp); lp.connect(ctx.destination); lp.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
  };
  const tone = (freq: number, at: number, dur: number, type: OscillatorType, vol: number, glide = false) => {
    if (!ctx || !master) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq * (glide ? 0.97 : 1), at); if (glide) o.frequency.exponentialRampToValueAtTime(freq, at + 0.03);
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.012); g.gain.exponentialRampToValueAtTime(vol * 0.5, at + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(master); o.start(at); o.stop(at + dur + 0.02);
  };
  const thump = (at: number) => {
    if (!ctx || !master) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(150, at); o.frequency.exponentialRampToValueAtTime(48, at + 0.1);
    g.gain.setValueAtTime(0.5, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
    o.connect(g); g.connect(master); o.start(at); o.stop(at + 0.16);
  };
  const hat = (at: number, vol: number) => {
    if (!ctx || !master) return;
    const len = Math.floor(ctx.sampleRate * 0.03), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ctx.createBufferSource(); s.buffer = buf; const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000; const g = ctx.createGain(); g.gain.value = vol;
    s.connect(hp); hp.connect(g); g.connect(master); s.start(at);
  };
  const schedule = () => {
    if (!ctx) return;
    while (nextAt < ctx.currentTime + 0.15) {
      const i = step % LEAD.length, lead = LEAD[i], bass = BASS[Math.floor(i / 2) % BASS.length];
      if (lead >= 0) tone(midi(lead), nextAt, STEP * 0.9, 'square', 0.16, true);
      if (i % 2 === 0) tone(midi(bass), nextAt, STEP * 1.6, 'triangle', 0.22);
      if (i % 4 === 0) thump(nextAt);
      hat(nextAt, i % 2 === 0 ? 0.05 : 0.09);
      nextAt += STEP; step++;
    }
  };
  const start = async () => {
    if (!ctx) build();
    if (ctx!.state === 'suspended') await ctx!.resume();
    step = 0; nextAt = ctx!.currentTime + 0.05;
    master!.gain.cancelScheduledValues(ctx!.currentTime); master!.gain.setValueAtTime(0.0001, ctx!.currentTime); master!.gain.exponentialRampToValueAtTime(0.9, ctx!.currentTime + 1.2);
    clearInterval(timer); timer = window.setInterval(schedule, 25);
  };
  const stop = () => {
    clearInterval(timer);
    if (ctx && master) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(master.gain.value, ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4); }
    setTimeout(() => { if (!on) ctx?.suspend(); }, 450);
  };
  const set = (v: boolean) => { on = v; setUi(v); try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* ignore */ } if (v) start(); else stop(); };
  btn.addEventListener('click', () => set(!on));
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (on) ctx.resume(); });

  // remembered as on: the browser will not let it start until the visitor does something, so wait for that
  let wanted = false; try { wanted = localStorage.getItem(KEY) === '1'; } catch { /* ignore */ }
  if (wanted) {
    setUi(true); label.textContent = 'Music on';
    const kick = () => { window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick); if (!on) set(true); };
    window.addEventListener('pointerdown', kick, { once: true }); window.addEventListener('keydown', kick, { once: true });
  }
}
