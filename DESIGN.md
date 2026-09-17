# Design: one sheet, one window, one ball

## Concept

The page is a single quiet sheet of pale leaf green. Near the end, the game canvas is the one bright window cut into it, and the page lands on the dark forest floor right after, where the closing "Say hi" lives. The red ball is the thread that runs down the sheet: it idles on the hero's baseline, rolls along the Work map as you scroll, is the cursor on desktop, and waits in the sky window at the bottom, one press of space away. Everything around the canvas is disciplined typography on one ground, so the game and the person carry the play instead of hills, polaroids and wood grain.

The palette is taken from the game's own art and toned for reading: the level's deep tree green becomes the ink, its grass becomes a pale tint for the ground, its ball is the accent, its eggs are the highlight. The saturated sky appears only inside the canvas, so the window reads as a window.

## Palette

| token | hex | use |
| --- | --- | --- |
| leaf | #EEF2E8 | the page ground, everywhere |
| leaf-2 | #DFE7D6 | quiet surfaces: map hills, pills, key caps, badges |
| line | #C3CEBB | rules and borders |
| paper | #FFFFFF | the lightbox plate |
| forest | #102A1B | ink, headings, rules |
| moss | #4E6353 | secondary text: meta, dates, captions |
| ball | #E8402F | the accent, always as an object: dots, the ball, the send key, the play key |
| ball-2 | #B92E22 | link colour on leaf (contrast), pressed states |
| egg | #F5B400 | highlights: the loop mark, the preloader dots, active states |
| marker | #FFD84D | the highlighter swipe in the story |
| deep | #0B2416 | the closing block (Say hi + footer) |
| sky | #58AFE4 | only inside the game canvas (drawn by the game) |

## Type

- Display: Young Serif (single weight, chunky, low contrast). The name, the section headings, "Bounce.", "Say hi.".
- Text: Schibsted Grotesk variable 400 to 900 with true italics. Everything else. Italic for captions and the small human asides (photo captions, "Coffee in Bengaluru: yes.").
- Both self-hosted as latin woff2 subsets under public/fonts, preloaded, with metric-matched Arial fallbacks so nothing shifts.

Scale (1.25 modular from 17px):
- name: clamp(3.4rem, 12vw, 10.75rem), line-height 0.9, one line on desktop, two lines under 720px
- h2: clamp(2.5rem, 1.8rem + 3.2vw, 4.75rem), line-height 0.98
- game title: clamp(3.2rem, 2rem + 6vw, 7rem)
- step 2: clamp(1.45rem, 1.2rem + 1vw, 1.9rem) for the tagline and story lines
- step 1: clamp(1.12rem, 1.05rem + 0.35vw, 1.3rem) for leads, org names, card titles
- step 0: 17px body, line-height 1.55
- step -1: 14.5px for meta, dates, captions, hints

Line length: body 60ch max. Story lines 26ch. Left aligned throughout.

## Layout

Order: Hero, Work, Built, About, Play, Say hi. One container, max 1200px, gutter clamp(20px, 5vw, 64px). From 1000px up, every content section is a two-column grid: a 150px margin column on the left holding the section's running head (sticky while the section scrolls), and the content column on the right. Below 1000px the running head sits above the content as a small line. Sections are separated by a 2px forest rule that starts at the margin, not by colour blocks.

- Header: fixed, thin. A small ball face and "Sagar" on the left, four links on the right. Transparent until you scroll, then a translucent leaf backdrop.
- Hero: the meta line, then the name as a one-line masthead across the full container, then a row with the tagline and "press space to play" grouped on the left, centred against the portrait (300px, 4:5, rounded) on the right. The ball idles along the hero's bottom rule. On phones the name takes two lines and the portrait is square, full width, under the name.
- Work: the heading "Work so far.", then the hill map in leaf-2 with the ball rolling the forest-ink path as you scroll, then four columns under a 2px rule each: logo and org name (a link, underlined on hover), role, dates, one line.
- Built: heading, three columns: media box (rounded, thin border, badge as a leaf pill, play key as a red ball on the demos), bold title, line, an underlined Watch or Open link.
- About: heading and the three story lines with the hand-drawn marks on the left, five prints on the right as a 3-column grid (the wide one spans two), italic captions under each. Lightbox is a white plate on a deep backdrop, the close key sits on the photo's corner.
- Play: its own chapter after About, with the rule and the "Play" running head like the others, and the window as a full-width figure under them: the canvas at the container's width, rounded, with a 2px forest frame, sized to fit under the rule in one viewport so the hero's hint and the nav's Play link land on the whole window. Inside the window is Bounce Tales chapter 3, "Seeking Answers", rebuilt beat for beat: the notebook chapter card while idle, then the HUD (egg count top-left, timer top-right, chunky cream digits with a brown outline) drawn on the canvas. The level runs left to right on smooth curved terrain: the start vine, the white-flower islands (checkpoints), the tipping plank, the thin ledges, the big hill, more islands, the second hill with the down-arrow sign, the drop into the corrupted purple zone, the two-column staircase, the machine under its lightning beam, and the pumpkin house. Breaking the machine flickers the palette and settles the world back to green. The page only adds a soft bar under the card with the Start key; the win card is drawn on the canvas too. Phone touch controls are three keypad caps: left and right arrows bottom-left, a round key with the red ball bottom-right.
- Say hi: the deep block. "Say hi." in leaf, then three big rows separated by hairlines (the email with copy, LinkedIn, GitHub), then "Coffee in Bengaluru: yes." in italic. The footer lines sit inside the same block under a hairline.

## Motion

- One page-load sequence: the ball drops on the preloader onto a forest line (three dots light gold on each bounce), the sheet wipes up, the name rises, the portrait settles, meta, tagline and hint fade in. Nothing else animates on entry.
- "press space to play" (or the space key while the hero is on screen) scrolls the page down to the Play chapter in one second and starts the game when it arrives.
- Scroll answers: the map ball rolls with the scroll and the path draws just ahead of it; the story marks draw themselves once when the story is in view.
- Pointer answers: link underlines, the demo preview plays while the pointer rests on it, the play key grows, keys press down. No lift-on-hover cards.
- Reduced motion: no preloader, no idle ball, no cursor, no smooth scroll, marks drawn, map ball parked at the start, everything visible.
- The desktop cursor is the red ball with eyes; its label is a forest pill.

## Share card

og.html renders the same hero (masthead, tagline, portrait, the ball on the rule) at 1200x630; public/og.jpg is its screenshot.

## Rules kept

No em dashes in visible text. Every word in content.ts and index.html as written, with Sagar's later changes: the Work heading is "Work so far." and the guestbook is gone (section, module, API, copy, styles and the Redis dependency). Say hi only at the end. No resume, no music, no stats. Game files untouched.
