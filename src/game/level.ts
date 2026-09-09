// One tall sky-forest level: two giant vine trunks at the edges, grass branches, floating islands, hanging planks.
// The map is painted from a station list so the geometry stays in one place; the ball starts at the bottom and climbs.
import { T, type Level, type Waypoint, type Dir, type Platform, type DebugInfo, type Warp } from './types';

export const W = 44, H = 64;
export const PARAMS = { platformSpeed: 85, fanForce: 2600, fanReach: 12, gateOpenTime: 0.35, springTiles: 10.5 };

// ---- painting helpers -------------------------------------------------------------------------------------------
const grid: string[][] = Array.from({ length: H }, () => Array.from({ length: W }, () => ' '));
const put = (c: number, r: number, ch: string) => { if (c >= 0 && c < W && r >= 0 && r < H) grid[r][c] = ch; };
const rect = (c0: number, c1: number, r0: number, r1: number, ch: string) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) put(c, r, ch); };
const ledge = (row: number, c0: number, c1: number) => rect(c0, c1, row, row, '#');

// ground with a spike pit
rect(0, W - 1, 61, 63, '#'); rect(14, 17, 61, 62, ' '); for (let c = 14; c <= 17; c++) put(c, 62, '^');
// the two trunks: two tiles thick with a third column that comes and goes, so the sides wave instead of running straight
rect(0, 1, 6, 60, 'T'); rect(42, 43, 0, 60, 'T');
const WAIST_A = [[9, 11], [17, 24], [29, 31], [35, 38], [42, 43], [48, 51], [55, 58]], WAIST_B = [[2, 6], [13, 14], [18, 19], [24, 28], [33, 36], [42, 47], [53, 55]];
for (let r = 6; r <= 60; r++) if (!WAIST_A.some(([a, b]) => r >= a && r <= b)) put(2, r, 'T');
for (let r = 0; r <= 60; r++) if (!WAIST_B.some(([a, b]) => r >= a && r <= b)) put(41, r, 'T');
// stations, bottom to top (planks are three tiles wide so the ball has room to stop)
ledge(59, 26, 30);            // L1 island
ledge(57, 34, 40);            // L2 branch of trunk B
rect(27, 30, 55, 55, '-');    // P1, four wide
ledge(53, 19, 24);            // L3 island, spring at its left end
ledge(45, 3, 13);             // L4 branch of trunk A
rect(16, 19, 43, 43, '-');    // P2, four wide
ledge(41, 22, 28);            // IS big island
ledge(39, 33, 40);            // L6 branch of trunk B
rect(25, 28, 37, 37, '-');    // P3, four wide
ledge(35, 18, 23);            // L7 island
put(9, 33, 'M'); put(14, 33, 'M'); // M1 moving plank (four wide), travels between x=9 and x=13 and meets L8
ledge(33, 3, 8);              // L8 branch of trunk A, spring near its right end
ledge(25, 7, 19);             // L9 island, long enough to catch a weak steer off the spring
ledge(23, 23, 29);            // L10 island
ledge(21, 33, 40);            // L11 branch of trunk B
rect(26, 29, 19, 19, '-');    // P4, four wide
ledge(17, 18, 23);            // L12 island
ledge(15, 11, 16);            // L13 island
ledge(13, 20, 25);            // L14 island
ledge(11, 29, 40);            // L15 branch of trunk B
rect(26, 29, 9, 9, '-');      // P5, four wide
ledge(7, 18, 23);             // L16 island
ledge(5, 0, 15);              // L17 the top branch of trunk A, with the flower
// thicker branches and short hooks off the edge trunks, all clear of the jump arcs
rect(36, 40, 58, 58, '#'); rect(3, 10, 46, 46, '#'); rect(35, 40, 40, 40, '#'); rect(3, 6, 34, 34, '#'); rect(36, 40, 22, 22, '#'); rect(33, 40, 12, 12, '#'); rect(0, 12, 6, 6, '#');
rect(38, 40, 50, 51, 'T'); rect(37, 40, 30, 31, 'T'); rect(38, 40, 15, 16, 'T'); rect(3, 5, 52, 53, 'T'); rect(3, 6, 39, 40, 'T'); rect(3, 5, 20, 21, 'T'); rect(3, 5, 12, 13, 'T');
rect(3, 9, 41, 42, 'T'); rect(36, 40, 7, 8, 'T'); rect(37, 40, 52, 54, 'T'); rect(37, 40, 34, 35, 'T'); rect(37, 40, 15, 17, 'T'); // low ceilings that turn the inner ends of L4, L15, L2, L6 and L11 into short tunnels
// vine stubs under the islands, at one end so each island reads as a branch off a bend (placed clear of every jump arc)
rect(29, 30, 60, 60, 'T');                              // L1 stands on a short trunk
rect(23, 24, 54, 55, 'T'); rect(22, 23, 56, 56, 'T');   // under L3, with a kink
rect(27, 28, 42, 45, 'T'); rect(26, 27, 46, 49, 'T');   // under IS, an S bend
rect(28, 29, 24, 27, 'T'); rect(27, 28, 28, 30, 'T');   // under L10
rect(12, 13, 16, 17, 'T'); rect(11, 12, 18, 19, 'T');   // under L13
rect(19, 20, 8, 9, 'T');                                // under L16
// the hidden passage: the notch by the start leads into the left trunk; roll all the way in and the ball comes out of the right trunk into the tunnel above the first right-hand branch (and back the other way)
rect(0, 1, 56, 58, 'h'); rect(41, 41, 55, 56, 'h');
const WARPS: Warp[] = [
  { from: { x0: -1, x1: 1.0, y0: 55, y1: 59.5 }, to: { x: 41.3, y: 56.65 } },
  { from: { x0: 41.65, x1: 43, y0: 54.5, y1: 57.5 }, to: { x: 1.9, y: 58.65 } },
];
// start, springs, goal
put(4, 60, 'P'); put(19, 52, 'S'); put(3, 32, 'S'); put(6, 4, 'E');
// checkpoints: signposts on the branches, arrow in the route direction
const CPS: [number, number, Dir][] = [[28, 58, 'right'], [37, 56, 'left'], [21, 52, 'left'], [6, 44, 'right'], [25, 40, 'right'], [21, 34, 'left'], [8, 32, 'left'], [16, 24, 'right'], [37, 20, 'left'], [13, 14, 'right'], [36, 10, 'left']];
for (const [c, r] of CPS) put(c, r, 'C');
// eggs, 30 of them
const EGGS: [number, number][] = [[8, 60], [15, 57], [16, 57], [30, 58], [29, 58], [36, 56], [32, 53], [20, 52], [23, 52], [18, 48], [16, 44], [12, 44], [15, 41], [26, 40], [27, 40], [34, 38], [29, 35], [19, 34], [12, 31], [4, 28], [6, 24], [7, 22], [9, 22], [18, 24], [26, 22], [36, 20], [21, 16], [15, 14], [23, 12], [21, 6]];
for (const [c, r] of EGGS) put(c, r, 'o');
// decor
const DECOR: [number, number, string][] = [
  [2, 60, 'f'], [10, 60, 'b'], [20, 60, 'w'], [24, 60, 'b'], [30, 60, 'b'], [36, 60, 'b'], [38, 60, 'b'],
  [39, 56, 'f'], [36, 56, 'b'], [5, 44, 'f'], [13, 44, 'b'], [11, 44, 'w'], [8, 44, 'b'], [28, 40, 'b'], [35, 38, 'b'], [39, 38, 'f'], [36, 38, 'w'],
  [23, 34, 'f'], [7, 32, 'b'], [14, 24, 'f'], [18, 24, 'b'], [15, 24, 'b'], [28, 22, 'b'], [25, 22, 'w'], [39, 20, 'f'], [35, 20, 'b'], [22, 16, 'b'], [19, 16, 'b'], [12, 14, 'w'], [11, 14, 'b'],
  [24, 12, 'b'], [21, 12, 'w'], [34, 10, 'b'], [31, 10, 'f'], [19, 6, 'b'], [20, 6, 'b'], [3, 4, 'b'], [9, 4, 'w'], [12, 4, 'b'], [14, 4, 'w'],
  // background trunks and islands (parallax, no collision): roughly one of each per phone screen
  [8, 54, 'k'], [24, 50, 'k'], [37, 47, 'k'], [15, 41, 'k'], [31, 37, 'k'], [6, 33, 'k'], [21, 30, 'k'], [36, 27, 'k'], [12, 23, 'k'], [27, 19, 'k'], [38, 15, 'k'], [8, 12, 'k'], [24, 9, 'k'], [33, 5, 'k'], [17, 3, 'k'],
  [22, 56, 'i'], [33, 52, 'i'], [5, 48, 'i'], [28, 44, 'i'], [10, 38, 'i'], [38, 33, 'i'], [16, 29, 'i'], [30, 24, 'i'], [7, 18, 'i'], [22, 14, 'i'], [35, 9, 'i'], [13, 7, 'i'], [29, 2, 'i'],
];
for (const [c, r, ch] of DECOR) if (grid[r][c] === ' ') put(c, r, ch);

export const MAP = grid.map((r) => r.join(''));

export function parseLevel(): Level {
  const h = H, w = W;
  const L: Level = { w, h, solid: new Uint8Array(w * h), spikes: [], eggs: [], springs: [], buttons: [], gates: [], platforms: [], fans: [], checkpoints: [], pads: [], decor: [], warps: WARPS, exit: { cx: 6, cy: 4 }, start: { cx: 4, cy: 60 }, eggTotal: 0 };
  const at = (x: number, y: number) => grid[y]?.[x] ?? ' ';
  const dirOf: Record<string, Dir> = { '^': 'up', v: 'down', '}': 'right', '{': 'left', u: 'up', d: 'down', l: 'left', r: 'right' };
  let seed = 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = at(x, y), i = y * w + x; seed = (seed * 9301 + 49297) % 233280;
    switch (ch) {
      case '#': L.solid[i] = 1; break;
      case 'T': L.solid[i] = 5; break;
      case '-': L.solid[i] = 2; break;
      case '^': case 'v': case '}': case '{': L.spikes.push({ cx: x, cy: y, dir: dirOf[ch] }); break;
      case 'o': L.eggs.push({ x: (x + 0.5) * T, y: (y + 0.5) * T, taken: false, t: (seed % 600) / 100 }); break;
      case 'h': L.solid[i] = 6; break;
      case 'S': L.springs.push({ cx: x, cy: y, t: 1 }); break;
      case 'C': { const cp = CPS.find(([c, r]) => c === x && r === y); L.checkpoints.push({ cx: x, cy: y, hit: false, dir: cp?.[2] ?? 'up' }); break; }
      case 'E': L.exit = { cx: x, cy: y }; break;
      case 'P': L.start = { cx: x, cy: y }; break;
      case 'b': L.decor.push({ kind: 'bush', cx: x, cy: y, seed }); break;
      case 'f': L.decor.push({ kind: 'flower', cx: x, cy: y, seed }); break;
      case 'w': L.decor.push({ kind: 'whiteflower', cx: x, cy: y, seed }); break;
      case 'u': case 'd': case 'l': case 'r': L.decor.push({ kind: 'sign', cx: x, cy: y, dir: dirOf[ch], seed }); break;
      case 'i': L.decor.push({ kind: 'island', cx: x, cy: y, seed }); break;
      case 'k': L.decor.push({ kind: 'stalk', cx: x, cy: y, seed }); break;
    }
  }
  for (let y = 0; y < h; y++) { const cols: number[] = []; for (let x = 0; x < w; x++) if (at(x, y) === 'M') cols.push(x); for (let k = 0; k + 1 < cols.length; k += 2) L.platforms.push(plat(cols[k] * T, y * T, 'x', cols[k] * T, (cols[k + 1] - 1) * T, 1)); }
  L.checkpoints.unshift({ cx: L.start.cx, cy: L.start.cy, hit: true, dir: 'right' }); // the start is a flag too
  L.eggTotal = L.eggs.length;
  return L;
}
function plat(x: number, y: number, axis: 'x' | 'y', min: number, max: number, dir: number): Platform {
  return { x, y, w: 4 * T, h: T, axis, min, max, dir, speed: PARAMS.platformSpeed, vx: 0, vy: 0 };
}

// ---- the scripted climb (used by the tests and by the respawn logic) -------------------------------------------
type D = 'right' | 'left';
type Step =
  | { jump: D; at: number; land: number; hold?: number }      // run in a direction, jump when passing col `at`, wait to land on platform row `land`
  | { spring: D; land: number; fly?: D }                      // roll onto the spring, keep `fly` held in the air, land on row `land`
  | { walk: D; to: number }                                   // roll to col `to` and settle
  | { wait: (d: DebugInfo) => boolean }                       // hold still until a condition
  | { settle: true };

const onRow = (row: number) => (d: DebugInfo) => d.grounded && Math.abs(d.y / T - (row - 0.35)) < 0.5;
const still = (d: DebugInfo) => d.grounded && Math.abs(d.vx) < 5;
const plankX = (d: DebugInfo) => d.platforms[0].x / T, plankVx = (d: DebugInfo) => d.platforms[0].vx;

export const ROUTE: Step[] = [
  { jump: 'right', at: 13.3, land: 61 },                       // over the spike pit
  { jump: 'right', at: 23.3, land: 59 },                       // L1
  { jump: 'right', at: 30.3, land: 57 },                       // L2 (trunk B)
  { jump: 'left', at: 34.7, land: 55 },                        // P1
  { jump: 'left', at: 27.7, land: 53 },                        // L3
  { spring: 'left', land: 45 },                                // vine spring up to L4 (trunk A)
  { jump: 'right', at: 12.3, land: 43 },                       // P2
  { jump: 'right', at: 19.7, land: 41 },                       // IS
  { jump: 'right', at: 28.3, land: 39 },                       // L6 (trunk B)
  { jump: 'left', at: 32.7, land: 37 },                        // P3
  { jump: 'left', at: 25.3, land: 35 },                        // L7 (P3 spans 25-28)
  { wait: (d) => plankVx(d) < 0 && plankX(d) <= 12.6 && plankX(d) > 12.0 },
  { jump: 'left', at: 17.7, land: 33 },                        // onto M1
  { wait: (d) => plankX(d) <= 9.1 },                           // ride ends at L8 (trunk A)
  { spring: 'left', land: 25, fly: 'right' },                  // roll left onto the vine spring by the trunk; it fires up the wall and the ball drifts right to L9
  { jump: 'right', at: 19.3, land: 23 },                       // L10
  { jump: 'right', at: 29.3, land: 21 },                       // L11 (trunk B)
  { jump: 'left', at: 33.7, land: 19 },                        // P4
  { jump: 'left', at: 26.3, land: 17 },                        // L12
  { jump: 'left', at: 18.7, land: 15 },                        // L13
  { jump: 'right', at: 16.3, land: 13 },                       // L14
  { jump: 'right', at: 25.3, land: 11 },                       // L15 (trunk B)
  { jump: 'left', at: 33.7, land: 9 },                         // P5
  { jump: 'left', at: 26.3, land: 7 },                         // L16
  { jump: 'left', at: 18.7, land: 5 },                         // L17, the top
  { walk: 'left', to: 6.5 },                                   // to the flower
];

export function buildWaypoints(route: Step[]): Waypoint[] {
  const out: Waypoint[] = []; let row = 61;
  const push = (w: Waypoint) => out.push({ home: row, ...w });
  for (const s of route) {
    if ('jump' in s) {
      push({ act: s.jump, step: true }); push({ col: s.at, row: row - 1, dir: s.jump, act: 'jump', hold: s.hold ?? 0.5 });
      row = s.land; push({ act: 'wait', until: onRow(row) }); push({ act: 'stop' }); push({ act: 'wait', until: still });
    } else if ('spring' in s) {
      push({ act: s.spring, step: true }); push({ act: 'wait', until: (d) => d.vy < -900 });
      push({ act: s.fly ?? s.spring }); row = s.land; push({ act: 'wait', until: onRow(row) }); push({ act: 'stop' }); push({ act: 'wait', until: still });
    } else if ('walk' in s) {
      push({ act: s.walk, step: true }); push({ col: s.to, dir: s.walk, act: 'stop' }); push({ act: 'wait', until: still });
    } else if ('wait' in s) push({ act: 'wait', until: s.wait, step: true });
    else push({ act: 'stop' }), push({ act: 'wait', until: still });
  }
  return out;
}
export const WAYPOINTS = buildWaypoints(ROUTE);
/** The hidden passage from the start: hop into the notch, roll left into the trunk, come out of the right trunk into the tunnel over L2. */
export const HIDDEN_WAYPOINTS: Waypoint[] = [
  { act: 'left', step: true, home: 61 },
  { col: 3.6, dir: 'left', row: 60, act: 'jump', hold: 0.45 },
  { act: 'wait', until: (d) => d.x > 30 * T },
  { act: 'wait', until: (d) => d.x < 39.5 * T && onRow(57)(d) },
  { act: 'stop' }, { act: 'wait', until: still },
];
