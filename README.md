# sagar-kotian.vercel.app

Personal site for Sagar Kotian, with a ball game in it.

The whole site is themed around **Bounce**, an original homage to the Nokia ball platformer: a red ball with eyes, gold rings, spikes, springs, buttons and gates, moving platforms, fans, checkpoints, and two transformations (a heavy rock ball that smashes cracked blocks, a light ball that jumps higher). One long sky level. Keyboard on desktop (arrows or A D, space, or the Nokia keys 4 6 5), on-screen buttons on phones. Everything is drawn with canvas paths; no sprites, no engine, and nothing copied from the original.

## Stack

Vite + vanilla TypeScript. GSAP + ScrollTrigger and Lenis for the page. The game is plain canvas in `src/game/`.

## Run it

```
npm install
npm run dev                     # http://localhost:5173
npm run build && npm run preview
node scripts/qa-shots.mjs       # screenshots at five viewports with the installed Chrome
node scripts/qa-game.mjs        # drives the game through its waypoints and checks it can be won
```

Copy lives in `src/content.ts` and `index.html`. The level is text in `src/game/level.ts`. Images come from `assets/src` via `npm run prep`; fonts are self-hosted subsets (`npm run fonts`).
