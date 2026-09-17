# sagar-kotian.vercel.app

Personal site for Sagar Kotian, with a ball game in it.

The game is a hand-drawn recreation of Bounce Tales chapter 3, "Seeking Answers": a plain red ball on smooth vines, islands and hills, thirty eggs, white-flower checkpoints, a plank that tips into a bridge, a drop into a corrupted purple zone, a staircase back up, a machine to break and a pumpkin house to roll into. Keyboard on desktop (arrows or A D, space, or the Nokia keys 4 6 5), on-screen buttons on phones. Everything is drawn with canvas paths; no sprites, no engine, and no assets taken from the original.

## Stack

Vite + vanilla TypeScript. GSAP + ScrollTrigger and Lenis for the page. The game is plain canvas in `src/game/`.

## Run it

```
npm install
npm run dev                     # http://localhost:5173
npm run build && npm run preview
node scripts/qa-shots.mjs       # screenshots at five viewports with the installed Chrome
node scripts/qa-game.mjs        # drives the game through its waypoints and checks it can be won
node scripts/qa-beats.mjs       # one screenshot per beat of the level (add `phone` for the phone view)
node scripts/qa-moments.mjs     # the plank tipping, the machine bursting, the win card, a death, and frame timing
node scripts/sim.mjs 200 --steps  # the same scripted run offline in node, with a trace when it stalls
```

Copy lives in `src/content.ts` and `index.html`. The level is authored in diameters in `src/game/level.ts` (vines are centrelines, everything else is a polygon; the scripted route lives at the bottom of the file). Images come from `assets/src` via `npm run prep`; fonts are self-hosted subsets (`npm run fonts`).
