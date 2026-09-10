import { gsap, ScrollTrigger } from './scroll';
import { q, qa } from './prefs';

/** The About chapters ride a pipeline: on wide screens the section pins and the chapters roll past while the ball turns on the hills. */
export function initAbout() {
  const pin = q('#about-pin'), track = q('#about-track'), hills = q('#about-hills'), ball = q('#about-ball');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 24);
    const turn = (px: number) => { ball.style.transform = `rotate(${px / (Math.PI * 50)}turn)`; };
    pin.classList.toggle('is-fit', dist() <= 80);
    if (dist() > 80) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.5, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => turn(self.progress * dist()),
        },
      });
      tl.to([track, hills], { x: () => -dist(), ease: 'none' }, 0);
      ScrollTrigger.refresh();
      return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([track, hills], { clearProps: 'transform' }); };
    }
    // everything fits: the hills slide under the ball as the section scrolls through
    const st = ScrollTrigger.create({ trigger: pin, start: 'top 90%', end: 'bottom 30%', scrub: 0.5, onUpdate: (self) => { const px = self.progress * 900; hills.style.transform = `translateX(${-px}px)`; turn(px); } });
    return () => { st.kill(); hills.style.transform = ''; };
  });
  // the weekend clip plays while it is on screen; a tap toggles it
  qa<HTMLVideoElement>('.chapter__video').forEach((v) => {
    const frame = v.parentElement!;
    const sync = () => frame.classList.toggle('is-playing', !v.paused && !v.ended);
    new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().then(sync).catch(sync); else { v.pause(); sync(); } }, { threshold: 0.4 }).observe(v);
    frame.addEventListener('click', () => { if (v.paused) v.play().then(sync).catch(sync); else { v.pause(); sync(); } });
    v.addEventListener('error', () => frame.classList.add('is-missing'));
  });
}
