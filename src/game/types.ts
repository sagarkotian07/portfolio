export const T = 40;
export type Form = 'normal' | 'rock' | 'light';
export interface FormSpec { r: number; grav: number; accel: number; max: number; jump: number; fan: number }
export const FORMS: Record<Form, FormSpec> = {
  normal: { r: 16, grav: 1, accel: 1, max: 380, jump: 780, fan: 1 },
  rock: { r: 16, grav: 1.35, accel: 0.7, max: 300, jump: 620, fan: 0 },
  light: { r: 20, grav: 0.7, accel: 0.9, max: 360, jump: 900, fan: 1.6 },
};
export interface InputState { left: boolean; right: boolean; jumpPressed: boolean; jumpHeld: boolean }
export type Dir = 'up' | 'down' | 'left' | 'right';
export interface Spike { cx: number; cy: number; dir: Dir }
export interface Egg { x: number; y: number; taken: boolean; t: number }
export interface Spring { cx: number; cy: number; t: number }
/** A hidden passage: a ball whose centre enters `from` (tile units) reappears at `to` (tile units) with its speed kept. */
export interface Warp { from: { x0: number; x1: number; y0: number; y1: number }; to: { x: number; y: number } }
export interface Button { cx: number; cy: number; pressed: boolean; gate: number }
export interface Gate { cx: number; top: number; bottom: number; open: number }
export interface Platform { x: number; y: number; w: number; h: number; axis: 'x' | 'y'; min: number; max: number; dir: number; speed: number; vx: number; vy: number }
export interface Fan { cx: number; cy: number; dir: Dir; reach: number }
export interface Checkpoint { cx: number; cy: number; hit: boolean; dir: Dir }
export interface Pad { cx: number; cy: number; form: Form }
export type DecorKind = 'bush' | 'flower' | 'whiteflower' | 'sign' | 'island' | 'stalk';
export interface Decor { kind: DecorKind; cx: number; cy: number; dir?: Dir; seed: number }
/** solid codes: 0 empty, 1 grass block, 2 plank (one-way), 3 cracked, 4 housing, 5 trunk, 6 secret passage (drawn as trunk, no collision) */
export interface Level {
  w: number; h: number; solid: Uint8Array;
  spikes: Spike[]; eggs: Egg[]; springs: Spring[]; buttons: Button[]; gates: Gate[]; platforms: Platform[]; fans: Fan[];
  checkpoints: Checkpoint[]; pads: Pad[]; decor: Decor[]; warps: Warp[]; exit: { cx: number; cy: number }; start: { cx: number; cy: number }; eggTotal: number;
}
export type Act = 'right' | 'left' | 'stop' | 'jump' | 'wait';
export interface DebugInfo { state: string; x: number; y: number; vx: number; vy: number; grounded: boolean; form: Form; deaths: number; eggs: number; eggsLeft: number; wp: number; hazard: { kind: string; x: number; dist: number } | null; platforms: { x: number; y: number; vx: number; vy: number }[] }
/** col/row are tile units. A waypoint with a col fires once the ball has passed it in `dir` (default right) and, if row is set, is within 1.6 rows of it; without a col it fires at once. `home` is the platform row the route stands on at that point (used to resume after a respawn); `step` marks the start of a route step. */
export interface Waypoint { col?: number; row?: number; dir?: 'right' | 'left'; act: Act; hold?: number; until?: (d: DebugInfo) => boolean; home?: number; step?: boolean }
