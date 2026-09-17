// Shared types for the Bounce Tales level. World units are pixels; one ball diameter (D) is 40px.
export const D = 40;
export const R = 20; // ball radius
export interface Pt { x: number; y: number }
export interface BBox { x0: number; y0: number; x1: number; y1: number }

/** A stroked centreline with a radius (the giant vines), or a closed polygon (islands, ledges, hills, cliffs, platforms). */
export type Solid =
  | { kind: 'vine'; pts: Pt[]; w: number; bbox: BBox; spots: Spot[]; grass: Pt[][]; id: number }
  | { kind: 'poly'; pts: Pt[]; bbox: BBox; spots: Spot[]; grass: Pt[][]; role: PolyRole; id: number };
export type PolyRole = 'island' | 'ledge' | 'hill' | 'cliff' | 'platform' | 'ground';
export interface Spot { x: number; y: number; rx: number; ry: number; a: number }

/** One collision segment. Polygons carry an outward unit normal and vertex convexity; vines carry the tube radius. */
export interface Seg { ax: number; ay: number; bx: number; by: number; nx: number; ny: number; w: number; poly: boolean; aConvex: boolean; bConvex: boolean; solid: number; tag?: string }

export type Dir = 'up' | 'down' | 'left' | 'right';
export type SignFace = 'warn' | 'down' | 'up';
export interface Egg { x: number; y: number; taken: boolean; t: number }
export interface Flower { x: number; y: number; kind: 'red' | 'white'; seed: number; checkpoint?: number }
export interface Checkpoint { x: number; y: number; hit: boolean }
export interface Sign { x: number; y: number; face: SignFace; seed: number }
export interface Bush { x: number; y: number; seed: number; size: number }
export interface BgItem { kind: 'stalk' | 'island'; x: number; y: number; seed: number; depth: number }
export interface Plank { x: number; y: number; len: number; state: 'up' | 'falling' | 'down'; a: number }
export interface Machine { x: number; y: number; w: number; h: number; destroyed: boolean; contact: number; trunk: Pt }
export interface Pumpkin { x: number; y: number; r: number }
export interface KillZone { x0: number; x1: number; y: number }

export interface Level {
  w: number; h: number; x0: number; y0: number; // world bounds in px
  solids: Solid[]; segs: Seg[];
  eggs: Egg[]; flowers: Flower[]; checkpoints: Checkpoint[]; signs: Sign[]; bushes: Bush[]; bg: BgItem[];
  plank: Plank; machine: Machine; pumpkin: Pumpkin; kills: KillZone[];
  start: Pt; corruptY: number; eggTotal: number;
}

export interface InputState { left: boolean; right: boolean; jumpPressed: boolean; jumpHeld: boolean }
export type Act = 'right' | 'left' | 'stop' | 'jump' | 'wait' | 'goto';
export interface DebugInfo { state: string; x: number; y: number; vx: number; vy: number; grounded: boolean; deaths: number; eggs: number; eggsLeft: number; wp: number; corrupted: boolean; machine: boolean; plank: string; cp: number }
/** x is in px. A waypoint with x fires once the ball has passed it in `dir` (default right) and, if y is set, is within 0.8 diameters of it. */
export interface Waypoint { x?: number; y?: number; dir?: 'right' | 'left'; act: Act; hold?: number; until?: (d: DebugInfo) => boolean; home?: number; step?: boolean }
