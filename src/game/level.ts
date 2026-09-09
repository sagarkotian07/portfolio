// One long sky level, written as ten chunks of text. Rows are bottom-aligned into 18 rows.
import { T, type Level, type Waypoint, type Form, type Dir, type Platform } from './types';

export const ROWS = 18;
const chunk = (w: number, ...rows: string[]) => ({ w, rows });

const CHUNKS = [
  chunk(20,
    '            o  o    ',
    '        o  o    o   ',
    '      o   o      o  ',
    '   P o              ',
    '####################',
    '####################',
    '####################'),
  chunk(24,
    '     o        o      o  ',
    '                        ',
    '    ^^     ^^^      ^^  ',
    '########################',
    '########################',
    '########################'),
  chunk(24,
    '         ---            ',
    '                 o      ',
    '     o      o           ',
    ' C                      ',
    '####  ######   ####   ##',
    '####  ######   ####   ##',
    '####  ######   ####   ##'),
  chunk(20,
    '         o o o      ',
    '        #########   ',
    '        #           ',
    '        #           ',
    '        #           ',
    '        #           ',
    '        #           ',
    '        #           ',
    '        #           ',
    '        #           ',
    '    S   #           ',
    '####################',
    '####################',
    '####################'),
  chunk(20,
    '          G         ',
    '          G         ',
    '          G         ',
    '          G       o ',
    '   B      G     o   ',
    '####################',
    '####################',
    '####################'),
  chunk(28,
    '                    N       ',
    '                    N    o  ',
    '                    N   C   ',
    '                    N  #####',
    '                    N  #####',
    '                    N  #####',
    '                    N  #####',
    '                    N  #####',
    '                    N  #####',
    ' C                  N  #####',
    '###M        M###############',
    '###          ###############',
    '###          ###############'),
  chunk(24,
    '                      ##',
    '                      ##',
    '                      ##',
    '                      ##',
    '                      ##',
    '                      ##',
    '                      ##',
    '  R     o  o          ##',
    '#########XX#############',
    '#########  #############',
    '#########  #############',
    '#########  #############',
    '#########       X   o   ',
    '#########   o   X       ',
    '#########       X  o    ',
    '########################',
    '########################',
    '########################'),
  chunk(26,
    '##########                ',
    '##########        o  C    ',
    '##########          ######',
    '##########          ######',
    '          o         ######',
    '                    ######',
    '  W           L     ######',
    '##########################',
    '##########################',
    '##########################'),
  chunk(30,
    '         o                    ',
    '               o              ',
    '     o               o        ',
    '                              ',
    '                              ',
    '                              ',
    '####                  ########',
    '####                  ########',
    '####                  ########',
    '####                  ########',
    '####  FF   FF   FF  L ########',
    '##############################',
    '##############################',
    '##############################'),
  chunk(32,
    '                                ',
    '                                ',
    '                        o    E  ',
    '                            ####',
    '                       ---  ####',
    '                            ####',
    '                   o        ####',
    '                            ####',
    '                  ---       ####',
    ' C >                        ####',
    '####                        ####',
    '####                  S     ####',
    '####          ##################',
    '####          ##################',
    '####^^^^^^^^^^##################',
    '################################',
    '################################',
    '################################'),
];

export const PARAMS = { platformSpeed: 70, fanForce: 2600, fanReach: 12, gateOpenTime: 0.35 };

export function parseLevel(): Level {
  const offsets: number[] = []; let w = 0;
  for (const c of CHUNKS) { offsets.push(w); w += c.w; }
  const grid: string[] = Array.from({ length: ROWS }, () => '');
  for (const c of CHUNKS) {
    if (c.rows.length > ROWS) throw new Error('chunk too tall');
    const pad = ROWS - c.rows.length;
    for (let r = 0; r < ROWS; r++) {
      const row = r < pad ? '' : c.rows[r - pad];
      if (row.length > c.w) throw new Error(`row wider than chunk: "${row}"`);
      grid[r] += row.padEnd(c.w, ' ');
    }
  }
  const L: Level = { w, h: ROWS, solid: new Uint8Array(w * ROWS), spikes: [], rings: [], springs: [], buttons: [], gates: [], platforms: [], fans: [], checkpoints: [], pads: [], exit: { cx: w - 2, cy: 2 }, start: { cx: 3, cy: 14 }, ringTotal: 0, chunkOffsets: offsets };
  const at = (x: number, y: number) => grid[y]?.[x] ?? ' ';
  const dirOf: Record<string, Dir> = { '^': 'up', v: 'down', '}': 'right', '{': 'left', F: 'up', '>': 'right', '<': 'left' };
  const formOf: Record<string, Form> = { R: 'rock', L: 'light', W: 'normal' };
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < w; x++) {
    const ch = at(x, y), i = y * w + x;
    switch (ch) {
      case '#': L.solid[i] = 1; break;
      case '-': L.solid[i] = 2; break;
      case 'X': L.solid[i] = 3; break;
      case 'F': case '>': case '<': L.solid[i] = 4; L.fans.push({ cx: x, cy: y, dir: dirOf[ch], reach: PARAMS.fanReach }); break;
      case '^': case 'v': case '}': case '{': L.spikes.push({ cx: x, cy: y, dir: dirOf[ch] }); break;
      case 'o': L.rings.push({ x: (x + 0.5) * T, y: (y + 0.5) * T, taken: false, t: Math.random() * 6 }); break;
      case 'S': L.springs.push({ cx: x, cy: y, t: 0 }); break;
      case 'B': L.buttons.push({ cx: x, cy: y, pressed: false, gate: -1 }); break;
      case 'C': L.checkpoints.push({ cx: x, cy: y, hit: false }); break;
      case 'E': L.exit = { cx: x, cy: y }; break;
      case 'P': L.start = { cx: x, cy: y }; break;
      case 'R': case 'L': case 'W': L.pads.push({ cx: x, cy: y, form: formOf[ch] }); break;
    }
  }
  // gates: vertical runs of G per column
  for (let x = 0; x < w; x++) { let y = 0; while (y < ROWS) { if (at(x, y) === 'G') { let top = y; while (y < ROWS && at(x, y) === 'G') y++; L.gates.push({ cx: x, top, bottom: y - 1, open: 0 }); } else y++; } }
  L.buttons.sort((a, b) => a.cx - b.cx); L.gates.sort((a, b) => a.cx - b.cx);
  L.buttons.forEach((b, i) => (b.gate = Math.min(i, L.gates.length - 1)));
  // horizontal platforms: pairs of M in a row
  for (let y = 0; y < ROWS; y++) { const cols: number[] = []; for (let x = 0; x < w; x++) if (at(x, y) === 'M') cols.push(x);
    for (let k = 0; k + 1 < cols.length; k += 2) L.platforms.push(plat(cols[k] * T, y * T, 'x', cols[k] * T, (cols[k + 1] - 1) * T, 1)); }
  // vertical platforms: runs of N in a column, start at the bottom
  for (let x = 0; x < w; x++) { let y = 0; while (y < ROWS) { if (at(x, y) === 'N') { const top = y; while (y < ROWS && at(x, y) === 'N') y++; L.platforms.push(plat(x * T, (y - 1) * T, 'y', top * T, (y - 1) * T, -1)); } else y++; } }
  L.ringTotal = L.rings.length;
  return L;
}
function plat(x: number, y: number, axis: 'x' | 'y', min: number, max: number, dir: number): Platform {
  return { x, y, w: 2 * T, h: T, axis, min, max, dir, speed: PARAMS.platformSpeed, vx: 0, vy: 0 };
}

/** A scripted route through the level, used by the tests. Columns are relative to the chunk. */
export const WAYPOINTS: Waypoint[] = [
  { chunk: 0, col: 0, act: 'run' },
  { chunk: 1, col: 2.6, act: 'jump' }, { chunk: 1, col: 9.4, act: 'jump' }, { chunk: 1, col: 18.2, act: 'jump' },
  { chunk: 2, col: 2.6, act: 'jump' }, { chunk: 2, col: 10.4, act: 'jump' }, { chunk: 2, col: 17.5, act: 'jump' },
  // F: ride the horizontal platform, then the vertical one
  { chunk: 5, col: 1.5, act: 'wait', until: (d) => d.platforms[0].x <= (108 + 3) * T + 6 && d.platforms[0].vx > 0 }, { chunk: 5, col: 1.6, act: 'run' },
  { chunk: 5, col: 3.9, act: 'stop' }, { chunk: 5, col: 4.0, act: 'wait', until: (d) => d.platforms[0].x >= (108 + 11) * T - 8 }, { chunk: 5, col: 4.1, act: 'run' },
  { chunk: 5, col: 18.6, act: 'wait', until: (d) => d.platforms[1].y >= 14 * T - 2 }, { chunk: 5, col: 18.7, act: 'hop', hold: 0.12 },
  { chunk: 5, col: 20.2, act: 'wait', until: (d) => d.platforms[1].y <= 7 * T }, { chunk: 5, col: 20.3, act: 'hop', hold: 0.5 }, { chunk: 5, col: 23.5, act: 'run' },
  // G: rock, drop through the cracked floor by jumping onto it
  { chunk: 6, col: 6.3, act: 'jump' },
  // H: light, clear the cliff
  { chunk: 7, col: 16.0, act: 'jump', hold: 0.6 },
  // I: three fans, then the light jump onto the ledge
  { chunk: 8, col: 4.3, act: 'stop' }, { chunk: 8, col: 4.4, act: 'wait', until: (d) => d.y <= 3 * T }, { chunk: 8, col: 4.5, act: 'run' },
  { chunk: 8, col: 10.2, act: 'stop' }, { chunk: 8, col: 10.3, act: 'wait', until: (d) => d.y <= 3 * T }, { chunk: 8, col: 10.4, act: 'run' },
  { chunk: 8, col: 15.2, act: 'stop' }, { chunk: 8, col: 15.3, act: 'wait', until: (d) => d.y <= 3 * T }, { chunk: 8, col: 15.4, act: 'run' },
  { chunk: 8, col: 19.3, act: 'wait', until: (d) => d.grounded }, { chunk: 8, col: 19.4, act: 'jumplow', below: 12, hold: 0.6 }, { chunk: 8, col: 19.5, act: 'run' },
  // J: jump off the ledge into the side fan, over the spikes; spring to the exit
  { chunk: 9, col: 1.4, act: 'jump', hold: 0.6 }, { chunk: 9, col: 16, act: 'run' },
];
