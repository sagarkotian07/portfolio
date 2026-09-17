// Bounce Tales, Chapter 3 "Seeking Answers", rebuilt from the walkthrough frames. Coordinates are in ball diameters (D px).
// The ball starts at (0, 0) on the bend of the first vine; x grows to the right, y grows downward.
import { D, type Level, type Solid, type Egg, type Flower, type Checkpoint, type Sign, type Bush, type BgItem, type Waypoint, type DebugInfo, type Pt } from './types';
import { vine, island, ledge, slab, cliff, hill, poly, segmentsOf, hash } from './geom';

export const PARAMS = { corruptY: 15, plankLen: 4.4 };

export function buildLevel(): Level {
  const S: Solid[] = [];
  const W = 28; // vine half-width in px (the tube is 1.4 diameters thick)
  // ---- beats 1 to 3: the start vine, two downhill steps, the steep drop and the lower run --------------------------
  S.push(vine(W, [[-1.6, -24], [-1.6, -4], [-1.6, 0.2], [-1.1, 1.0], [-0.2, 1.2], [2.5, 1.15], [5.5, 1.0], [7, 1.25], [8.3, 2.2], [9.8, 3.4], [11.5, 3.95], [14, 3.9], [16, 3.75], [17.2, 4.3], [17.9, 5.5], [18.2, 7.5], [18.6, 9.3], [19.4, 10.4], [20.6, 10.85], [22.5, 10.9], [25, 10.7], [27, 10.55], [28.6, 10.7]]));
  S.push(island(29.6, 33.8, 8.0)); // checkpoint 1
  S.push(island(34.0, 37.5, 6.2));
  S.push(island(38.4, 42, 4.4));
  S.push(island(33.6, 36.4, 10.4, 1.3)); // the lure with the red flower
  // ---- beat 5: vine B dips into a U, ends over a gap; a low island beyond ----------------------------------------
  S.push(vine(W, [[43.6, 5.6], [45.5, 6.5], [47.5, 7.9], [49.5, 9.2], [51, 9.6], [52.5, 9.2], [54.5, 8.1], [56.3, 7.55], [57.3, 7.6]]));
  S.push(island(59.8, 63.2, 8.6)); // checkpoint 2
  // ---- beats 6 to 8: the plank branch, the long branch, the thin ledges ----------------------------------------
  S.push(island(64.6, 75.2, 7.6, 2.3)); // branch C, checkpoint 3, plank at its right end
  S.push(island(79.2, 92.2, 7.65, 2.5)); // branch D, checkpoint 4
  S.push(ledge(93.8, 97.2, 8.3)); S.push(ledge(99.3, 102.7, 8.0)); S.push(ledge(104.8, 108.2, 7.7));
  // ---- beats 9 to 10: the cliff that becomes the big hill, the valley, the small mound ------------------------------
  S.push(hill([[110, 6.9], [110.6, 6.45], [113, 6.35], [116, 6.4], [117.5, 6.7], [119, 7.5], [121, 9.2], [123, 10.9], [125, 12.2], [127, 12.85], [128.5, 12.9], [129.8, 12.4], [131.5, 11.1], [133.2, 12.4], [134.5, 12.85], [136, 12.9], [136.4, 13.2]], 17.5));
  S.push(ledge(138.3, 142.3, 11.4)); S.push(ledge(143.6, 147.1, 9.8));
  S.push(island(148.2, 152.2, 8.2)); // checkpoint 6
  S.push(island(154.4, 157.9, 9.2));
  // ---- beat 11: island hopping ---------------------------------------------------------------------------------
  S.push(island(159.6, 163, 8.0)); // checkpoint 7
  S.push(island(165.3, 168.7, 9.0));
  S.push(ledge(170.7, 174.1, 7.6));
  S.push(island(175.8, 179.8, 8.4)); // checkpoint 8
  S.push(island(181, 184.8, 9.0));
  // ---- beat 12: the second hill with the plateau and the drop ---------------------------------------------------
  S.push(hill([[185.2, 10.2], [186.4, 9.3], [187.6, 8.3], [188.8, 7.5], [190, 6.95], [191, 6.65], [192.2, 6.6], [193.6, 6.6], [194.7, 6.62], [195.1, 6.9]], 17.5));
  S.push(island(186.8, 189.8, 2.4)); // the red flower island over the shaft
  // ---- beat 13: the shaft ---------------------------------------------------------------------------------------
  S.push(ledge(196.6, 199.1, 9.6)); S.push(ledge(200.6, 203.1, 12.8)); S.push(ledge(196.9, 199.4, 16)); S.push(ledge(200.9, 203.4, 19.2));
  S.push(ledge(197.1, 199.6, 22.4)); S.push(ledge(201.1, 203.6, 25.6));
  // ---- beats 15 to 16: the purple floor, the cliffs, the staircase (2.4 diameter rises) --------------------------------
  S.push(slab('ground', 186, 232.5, 34, 4.5));
  S.push(cliff(186, 191.6, 26, 34.6));
  S.push(cliff(231.8, 236.5, 20, 34.6));
  // two columns 5.3 apart, every hop 2.4 up and across
  S.push(ledge(205, 208, 31.5)); S.push(ledge(210.33, 213.33, 29.1)); S.push(ledge(205, 208, 26.7)); S.push(ledge(210.33, 213.33, 24.3));
  S.push(ledge(205, 208, 21.9)); S.push(ledge(210.33, 213.33, 19.5)); S.push(ledge(205, 208, 17.1)); S.push(ledge(210.33, 213.33, 14.7));
  S.push(ledge(205, 208, 12.3)); S.push(ledge(210.33, 213.33, 10.1));
  // ---- beats 17 to 19: the machine platform and the trunk island above it ------------------------------------------
  S.push(slab('platform', 214.5, 230.6, 8, 1.7));
  S.push(island(219.3, 222, 1.5, 1.1));

  const segs = segmentsOf(S);
  const eggsD: [number, number][] = [[1.9, -0.05], [5.3, -2.4], [14, 3.0], [21.5, 9.9], [31.5, 7.3], [36, 5.5], [40.5, 3.7], [49.5, 8.5], [58.6, 6.4], [62, 7.9], [77.4, 6.2], [86.3, 6.9], [93.7, 6.6], [98.4, 6.5], [103.8, 6.4], [109.3, 6.3], [127.7, 12.1], [142.6, 9.2], [150.3, 7.4], [164.1, 7.3], [174.9, 7.4], [197.8, 8.7], [201.8, 11.9], [198.3, 21.5], [211.8, 28.3], [211.8, 23.5], [206.5, 21.1], [211.8, 13.9], [206.5, 11.5], [225.4, 7.3]];
  const eggs: Egg[] = eggsD.map(([x, y], i) => ({ x: x * D, y: y * D, taken: false, t: hash(i, 9) * 6 }));
  // checkpoints in route order; each is a white flower's base
  const cps: [number, number][] = [[0, 0.45], [31.5, 8.0], [61.6, 8.6], [66.2, 7.6], [81.0, 7.65], [112, 6.45], [149.6, 8.2], [161.4, 8.0], [177.8, 8.4], [192.8, 6.6], [195.4, 34]];
  const checkpoints: Checkpoint[] = cps.map(([x, y], i) => ({ x: x * D, y: y * D, hit: i === 0 }));
  const flowers: Flower[] = [];
  cps.slice(1).forEach(([x, y], i) => flowers.push({ x: x * D, y: y * D, kind: 'white', seed: hash(x, y), checkpoint: i + 1 }));
  const reds: [number, number][] = [[4.3, 0.98], [13, 3.15], [25.5, 10.15], [35, 10.4], [73.6, 7.6], [84.5, 7.65], [131.5, 11.1], [156.2, 9.2], [167, 9.0], [182.9, 9.0], [187, 8.85], [188.3, 2.4], [213.5, 34]];
  for (const [x, y] of reds) flowers.push({ x: x * D, y: y * D, kind: 'red', seed: hash(y, x) });
  const signs: Sign[] = [[56.2, 6.9, 'warn'], [91.2, 7.65, 'warn'], [194.1, 6.6, 'down'], [189, 26, 'down'], [206.5, 34, 'up'], [224, 34, 'warn']].map(([x, y, f]) => ({ x: (x as number) * D, y: (y as number) * D, face: f as Sign['face'], seed: hash(x as number, 3) }));
  const bushes: Bush[] = [[2.8, 0.98, 1], [12, 3.15, 0.9], [23, 10.2, 0.8], [70, 7.6, 1.1], [88.5, 7.65, 0.9], [126, 12.8, 0.9], [129, 12.85, 0.7], [134.6, 12.85, 0.8], [197.6, 34, 0.9], [210.5, 34, 1], [219, 34, 0.8]].map(([x, y, s]) => ({ x: x * D, y: y * D, seed: hash(x, y), size: s }));
  // background: pale stalks on little islands, placed along the route with jitter, plus a column either side of the shaft
  const profile: [number, number][] = [[-8, 1], [0, 1], [12, 3.5], [22, 10.5], [40, 4.5], [55, 8], [75, 7.6], [95, 8], [112, 6.4], [130, 12], [150, 8.5], [175, 8.5], [190, 6.6], [196, 12]];
  const at = (x: number) => { for (let i = 0; i + 1 < profile.length; i++) { const [x0, y0] = profile[i], [x1, y1] = profile[i + 1]; if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0); } return x < profile[0][0] ? profile[0][1] : profile[profile.length - 1][1]; };
  const bg: BgItem[] = [];
  for (let x = -6, i = 0; x < 200; i++) { const h = hash(i, 11), h2 = hash(i, 13); const y = at(x) - 1 - h2 * 9; bg.push({ kind: h < 0.55 ? 'stalk' : 'island', x: (x + h * 3) * D, y: y * D, seed: h2, depth: 0.62 + (h > 0.5 ? 0.16 : 0) }); x += 4.5 + h * 3.5; }
  for (let y = 4, i = 0; y < 36; y += 4.2, i++) { bg.push({ kind: 'stalk', x: (189 + hash(i, 17) * 2) * D, y: y * D, seed: hash(i, 19), depth: 0.66 }); bg.push({ kind: i % 2 ? 'island' : 'stalk', x: (227 + hash(i, 23) * 4) * D, y: (y + 2) * D, seed: hash(i, 29), depth: 0.72 }); }
  const L: Level = {
    x0: -7 * D, y0: -24 * D, w: 246 * D, h: 65 * D,
    solids: S, segs, eggs, flowers, checkpoints, signs, bushes, bg,
    plank: { x: 74.7 * D, y: 7.6 * D, len: PARAMS.plankLen * D, state: 'up', a: 0 },
    machine: { x: 219 * D, y: 5.8 * D, w: 3 * D, h: 2.2 * D, destroyed: false, contact: 0, trunk: { x: 220.65 * D, y: 1.5 * D } },
    pumpkin: { x: 227.6 * D, y: 8 * D, r: 2.3 * D },
    kills: [{ x0: -10 * D, x1: 191.9 * D, y: 17.6 * D }, { x0: -10 * D, x1: 246 * D, y: 41 * D }],
    start: { x: 0, y: 0 }, corruptY: PARAMS.corruptY * D, eggTotal: eggs.length,
  };
  return L;
}
/** The machine's collision box (standing) and the wreck (after). Corners in px, clockwise on screen. */
export function machineBox(m: Level['machine']): Pt[] {
  const h = m.destroyed ? m.h * 0.55 : m.h, top = m.y + m.h - h;
  return [{ x: m.x, y: top }, { x: m.x + m.w, y: top }, { x: m.x + m.w, y: m.y + m.h }, { x: m.x, y: m.y + m.h }];
}
// ---- the scripted run (tests and the respawn logic) ---------------------------------------------------------------
type Dir2 = 'right' | 'left';
type Step =
  | { jump: Dir2; at: number; land: number; hold?: number; air?: 'stop' | Dir2 }  // roll in a direction, jump when passing x, land on the surface whose resting y is `land`
  | { walk: Dir2; to: number }
  | { wait: (d: DebugInfo) => boolean }
  | { fall: Dir2; land: number; drift?: number }                                  // roll off an edge; keep rolling until `drift` diameters above the landing, then let go
  | { push: Dir2; until: (d: DebugInfo) => boolean };                             // lean on something until the condition holds
const onY = (y: number) => (d: DebugInfo) => d.grounded && Math.abs(d.y / D - y) < 0.7;
const still = (d: DebugInfo) => d.grounded && Math.abs(d.vx) < 6;
/** Resting heights are the surface top minus half a diameter. The ball keeps rolling between jumps, as a player would. */
export const ROUTE: Step[] = [
  { fall: 'right', land: 9.65, drift: 4.5 },                       // along the start run, over the shoulder, down the steep vine to the lower run
  { jump: 'right', at: 26.9, land: 7.5 },                          // island 1 (checkpoint)
  { jump: 'right', at: 31.9, land: 5.7 },                          // island 2
  { jump: 'right', at: 36.3, land: 3.9 },                          // island 3
  { jump: 'right', at: 40.7, land: 6.0 },                          // onto vine B
  { walk: 'right', to: 54 },
  { jump: 'right', at: 55.8, land: 8.1 },                          // island 4 (checkpoint)
  { jump: 'right', at: 62.1, land: 7.1 },                          // branch C
  { walk: 'right', to: 75.5 },                                     // into the plank, keep pushing
  { wait: (d) => d.plank === 'down' },
  { walk: 'right', to: 88.5 },                                     // across the plank and along branch D
  { jump: 'right', at: 90.2, land: 7.8 },                          // ledge 1
  { jump: 'right', at: 96.1, land: 7.5 },                          // ledge 2
  { jump: 'right', at: 101.6, land: 7.2 },                         // ledge 3
  { jump: 'right', at: 107.1, land: 5.9 },                         // up onto the hill top (checkpoint)
  { walk: 'right', to: 128.5 },                                    // down the hill into the valley
  { jump: 'right', at: 135.6, land: 10.9 },                        // over the mound, onto the first ledge
  { jump: 'right', at: 140.9, land: 9.3 },                         // ledge
  { jump: 'right', at: 146.1, land: 7.7 },                         // white island (checkpoint)
  { jump: 'right', at: 150.8, land: 8.7 },                         // red island
  { jump: 'right', at: 157.0, land: 7.5 },                         // white island (checkpoint)
  { jump: 'right', at: 161.9, land: 8.5 },                         // red island
  { jump: 'right', at: 167.7, land: 7.1 },                         // ledge
  { jump: 'right', at: 172.9, land: 7.9 },                         // white island (checkpoint)
  { jump: 'right', at: 178.0, land: 8.5 },                         // red island
  { jump: 'right', at: 183.5, land: 7.5 },                         // the left slope of hill 2
  { walk: 'right', to: 193.4 },                                    // up over the hill to the plateau (checkpoint)
  { fall: 'right', land: 33.5 },                                   // the drop, straight down the shaft to the purple floor
  { jump: 'right', at: 202.5, land: 31.0 },                        // the staircase: left column, right column, and so on up
  { jump: 'right', at: 207.5, land: 28.6 },
  { jump: 'left', at: 210.83, land: 26.2 },
  { jump: 'right', at: 207.5, land: 23.8 },
  { jump: 'left', at: 210.83, land: 21.4 },
  { jump: 'right', at: 207.5, land: 19.0 },
  { jump: 'left', at: 210.83, land: 16.6 },
  { jump: 'right', at: 207.5, land: 14.2 },
  { jump: 'left', at: 210.83, land: 11.8 },
  { jump: 'right', at: 207.5, land: 9.6 },
  { jump: 'right', at: 212.83, land: 7.5 },                        // up onto the machine platform
  { push: 'right', until: (d) => d.machine },                      // lean on the machine until it breaks
  { wait: (d) => d.corrupted === false },                          // the flicker settles on green
  { jump: 'right', at: 217.8, land: 7.5 },                         // over the wreck
  { walk: 'right', to: 229 },                                      // into the pumpkin
];
export function buildWaypoints(route: Step[]): Waypoint[] {
  const out: Waypoint[] = []; let curX = 0;
  const flags = [0, 31.5, 61.6, 66.2, 81.0, 112, 149.6, 161.4, 177.8, 192.8, 195.4];
  const cpAt = (x: number) => { let k = 0; for (let i = 0; i < flags.length; i++) if (x >= flags[i] - 0.4) k = i; return k; };
  let cp = 0;
  const push = (w: Waypoint) => out.push({ home: cp, ...w });
  for (const s of route) {
    if ('jump' in s) {
      cp = cpAt(s.jump === 'right' ? s.at : curX);
      // back up a little first, so every jump starts with the same run-up
      push({ act: 'goto', x: (s.at + (s.jump === 'right' ? -1.5 : 1.5)) * D, step: true });
      push({ act: s.jump }); push({ x: s.at * D, dir: s.jump, act: 'jump', hold: s.hold ?? 0.45 });
      if (s.air) push({ act: 'wait', until: (d) => !d.grounded && d.vy > -300 }), push({ act: s.air });
      push({ act: 'wait', until: onY(s.land) });
      curX = s.at + (s.jump === 'right' ? 4 : -4);
    } else if ('walk' in s) {
      cp = cpAt(curX);
      push({ act: s.walk, step: true }); push({ x: s.to * D, dir: s.walk, act: 'stop' }); push({ act: 'wait', until: still });
      curX = s.to;
    } else if ('fall' in s) {
      cp = cpAt(curX);
      push({ act: 'wait', until: (d) => d.grounded, step: true }); push({ act: s.fall }); push({ act: 'wait', until: (d) => !d.grounded && d.vy > 200 && d.y / D > s.land - (s.drift ?? 99) }); push({ act: 'stop' }); push({ act: 'wait', until: onY(s.land) }); push({ act: 'wait', until: still });
      curX += 3;
    } else if ('push' in s) { cp = cpAt(curX); push({ act: s.push, step: true }); push({ act: 'wait', until: s.until }); push({ act: 'stop' }); push({ act: 'wait', until: still }); }
    else { cp = cpAt(curX); push({ act: 'wait', until: s.wait, step: true }); }
  }
  return out;
}
export const WAYPOINTS = buildWaypoints(ROUTE);
void poly;
