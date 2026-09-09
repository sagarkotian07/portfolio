import { Game } from './engine';
import { bindInput } from './input';
import { WAYPOINTS } from './level';
import { game as copy, links } from '../content';
import { q } from '../modules/prefs';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function mountGame(opts: { onPlay(): void; onStop(): void }) {
  const canvas = q<HTMLCanvasElement>('#game-canvas');
  const stage = q('#game-stage'), start = q('#game-start'), end = q('#game-end'), leave = q<HTMLButtonElement>('#game-leave');
  const hud = { eggs: q('#hud-eggs'), time: q('#hud-time') };
  let active = false, inView = false;
  new IntersectionObserver(([e]) => (inView = e.intersectionRatio > 0.5), { threshold: [0, 0.5, 1] }).observe(stage);

  q('#game-title').textContent = copy.title; q('#game-intro').textContent = copy.intro;
  q('#game-controls').textContent = matchMedia('(pointer: coarse)').matches ? copy.touch : copy.controls;
  q<HTMLAnchorElement>('#game-sayhi').href = links.whatsapp;

  const showEnd = (label: string, title: string, line: string) => { q('#game-end-label').textContent = label; q('#game-end-title').textContent = title; q('#game-end-line').textContent = line; end.hidden = false; leave.hidden = true; deactivate(); };

  const g = new Game(canvas, {
    onHud(e, total, time) { hud.eggs.textContent = `${e}/${total}`; hud.time.textContent = fmt(time); },
    onWin(e, total, time) { setTimeout(() => showEnd('Done', copy.win(e, total, fmt(time)), copy.winLine), 500); },
    onDeath() { stage.classList.add('is-shaking'); setTimeout(() => stage.classList.remove('is-shaking'), 300); },
  }, () => matchMedia('(max-width: 899px)').matches);
  hud.eggs.textContent = `0/${g.level.eggTotal}`;

  function activate() { if (active) return; active = true; opts.onPlay(); document.documentElement.classList.add('is-playing'); canvas.focus({ preventScroll: true }); }
  function deactivate() { if (!active) return; active = false; opts.onStop(); document.documentElement.classList.remove('is-playing'); }
  function play() { start.hidden = true; end.hidden = true; leave.hidden = false; activate(); g.start(); }
  function quit() { deactivate(); g.leave(); start.hidden = false; end.hidden = true; leave.hidden = true; }

  q('#game-play').addEventListener('click', play);
  q('#game-again').addEventListener('click', play);
  leave.addEventListener('click', quit);
  bindInput(g.input, { isActive: () => active, onEscape: quit, touchRoot: document.getElementById('game-touch') });
  window.addEventListener('keydown', (e) => { if (!active && inView && e.code === 'Space' && (g.state === 'idle' || !end.hidden)) { e.preventDefault(); play(); } });
  canvas.addEventListener('pointerdown', () => { if (!active && g.state === 'idle') play(); });

  (window as unknown as { __bounce?: unknown }).__bounce = { game: g, input: g.input, waypoints: WAYPOINTS };
  return { play, isActive: () => active, game: g };
}
