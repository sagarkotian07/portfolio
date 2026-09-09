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
export interface Ring { x: number; y: number; taken: boolean; t: number }
export interface Spring { cx: number; cy: number; t: number }
export interface Button { cx: number; cy: number; pressed: boolean; gate: number }
export interface Gate { cx: number; top: number; bottom: number; open: number }
export interface Platform { x: number; y: number; w: number; h: number; axis: 'x' | 'y'; min: number; max: number; dir: number; speed: number; vx: number; vy: number }
export interface Fan { cx: number; cy: number; dir: Dir; reach: number }
export interface Checkpoint { cx: number; cy: number; hit: boolean }
export interface Pad { cx: number; cy: number; form: Form }
export interface Level {
  w: number; h: number; solid: Uint8Array; // 0 empty, 1 solid, 2 one-way, 3 cracked, 4 housing
  spikes: Spike[]; rings: Ring[]; springs: Spring[]; buttons: Button[]; gates: Gate[]; platforms: Platform[]; fans: Fan[];
  checkpoints: Checkpoint[]; pads: Pad[]; exit: { cx: number; cy: number }; start: { cx: number; cy: number }; ringTotal: number; chunkOffsets: number[];
}
export type Act = 'run' | 'stop' | 'left' | 'jump' | 'hop' | 'wait' | 'jumplow';
export interface DebugInfo { state: string; x: number; y: number; vx: number; vy: number; grounded: boolean; form: Form; lives: number; rings: number; ringsLeft: number; hazard: { kind: string; x: number; dist: number } | null; platforms: { x: number; y: number; vx: number; vy: number }[] }
export interface Waypoint { chunk: number; col: number; act: Act; hold?: number; below?: number; until?: (d: DebugInfo) => boolean }
