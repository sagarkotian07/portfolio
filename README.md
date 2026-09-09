# sagar-kotian.vercel.app

Personal site for Sagar Kotian. Founder's Office, GTM and customer success at Superjoin, Bengaluru.

The metaphor is the sticky-note wall behind his desk: physics notes you can throw, a small WebGL stack of notes, a timeline that draws itself, and demo cards.

## Stack

Vite + vanilla TypeScript. GSAP + ScrollTrigger, Lenis, Matter.js (lazy, desktop only), Three.js (lazy, desktop only). No framework, no CMS.

## Run it

```
npm install
npm run dev
```

All copy lives in `src/content.ts`. Images are generated from `assets/src` with `npm run prep` (sharp). Fonts are self-hosted latin subsets, refreshed with `npm run fonts`. `node scripts/qa-shots.mjs` screenshots the site at five viewports using the installed Chrome.
