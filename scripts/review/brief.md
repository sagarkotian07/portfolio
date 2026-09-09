You are reviewing a small browser game that is meant to be a faithful, original homage to the sky-forest chapters of Nokia's "Bounce Tales" (2008). It is one long climbing level drawn entirely with canvas paths in a personal portfolio site. No Rovio art or level data is used and the name is never shown; the goal is the same look, mood and feel.

The reference images are the first group attached (phone screenshots and stills from a playthrough of the original). The frames after them are captures of OUR level at different points (desktop 1440x900 and a phone 390x844 capture with the touch controls). Our source code is in src/game/ (level.ts paints the map, draw.ts renders it, engine.ts is the physics and rules).

What the original shows, element by element:
- flat bright blue sky, a few soft white clouds
- giant dark green vine trunks with rounded bends and darker bark spots; branches that stick out of them
- grass ledges: bright green cap with tufts and a light highlight line, dark green body
- eggs as the collectible, counted n/30 next to an egg icon top left; timer and a round button top right
- hanging wooden planks on ropes, some moving
- curled green vine springs that launch the ball upward
- thin white spikes in pits
- wooden signposts with a yellow arrow, dark green bushes, red flowers with leaves, white flowers on stems
- pale teal floating islands and tall pale stalks in the background
- a red glossy ball (ours has a small face, as the Android remake does)

Rules we follow: no lives; when the ball dies it respawns at the nearest signpost flag it has already passed. One level only. Goal is the red flower at the top.

Please review and answer with exactly these sections:

1. CHECKLIST: for every element in the list above, one line: present in ours? same style? (yes / partly / no) and a short note.
2. GAPS: the biggest visual differences from the reference, in order of importance, with a concrete suggestion for each (colour values, shapes, sizes, density, placement).
3. PLAYABILITY: anything in level.ts and engine.ts that looks unfair or broken for a human player on keyboard or phone (jump reach, checkpoint placement, blind jumps, camera, controls).
4. VERDICT: exactly one line, either "VERDICT: APPROVED" if ours is a convincing match of the reference's style and structure with no important gaps left, or "VERDICT: CHANGES" if not.

Be specific and honest. Do not approve out of politeness. Do not ask for anything that would require copying the original's assets.
