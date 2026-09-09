// Builds every list on the page from content.ts. index.html only holds the shells.
import { hero, notes, stops, projects, counters, about, links, contact } from '../content';
import { images, type ImageKey } from '../generated/images';
import { q } from './prefs';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function picture(key: ImageKey, o: { alt: string; sizes: string; className?: string }): string {
  const im = images[key];
  const set = (ext: 'avif' | 'webp') => im[ext].map((w) => `/img/${key}-${w}.${ext} ${w}w`).join(', ');
  return `<picture class="${o.className ?? ''}">
    <source type="image/avif" srcset="${set('avif')}" sizes="${o.sizes}">
    <source type="image/webp" srcset="${set('webp')}" sizes="${o.sizes}">
    <img src="${im.jpg}" width="${im.width}" height="${im.height}" alt="${esc(o.alt)}" loading="lazy" decoding="async">
  </picture>`;
}

const playIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5v17l14-8.5z" fill="currentColor"/></svg>`;
const extIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>`;


export function renderAll() {
  // hero text
  q('#hero-meta').textContent = hero.meta;
  q('#hero-tagline').innerHTML = hero.tagline
    .map((l, i) => `<span class="line"><span class="line-inner">${i === 0 ? `<em>${esc(l)}</em>` : esc(l)}</span></span>`)
    .join('');

  // notes
  q('#notes').innerHTML = notes
    .map(
      (n) =>
        `<li class="note note--${n.tone}" style="--x:${n.seed.x};--y:${n.seed.y};--r:${n.seed.r}deg;--mx:${n.seedM.x};--my:${n.seedM.y};--mr:${n.seedM.r}deg" data-cursor="drag">${esc(n.text)}</li>`,
    )
    .join('');

  // timeline stops
  q('#stops').innerHTML = stops
    .map(
      (s) => `<li class="stop">
      <span class="stop__marker" aria-hidden="true"></span>
      <div class="stop__body">
        <div class="stop__head">
          <span class="stop__tag tone-${s.tone}">${esc(s.org)}</span>
          <span class="stop__dates">${esc(s.dates)}</span>
        </div>
        <h3 class="stop__role">${esc(s.role)}</h3>
        ${s.about ? `<p class="stop__about">${esc(s.about)}</p>` : ''}
        <ul class="stop__bullets">${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
        <p class="stop__closer">${esc(s.closer)}</p>
      </div>
    </li>`,
    )
    .join('');

  // project cards
  q('#cards').innerHTML = projects
    .map((p) => {
      let media = '';
      let actions = '';
      if (p.kind === 'video') {
        media = `<a class="card__media card__media--video" href="${p.url}" target="_blank" rel="noopener" data-cursor="play" aria-label="Watch the demo: ${esc(p.title)} (opens on Screen Studio)">
          ${picture(p.poster, { alt: '', sizes: '(max-width: 767px) 92vw, 380px' })}
          <video class="card__preview" muted playsinline loop preload="none" data-src="${p.preview}" aria-hidden="true" tabindex="-1"></video>
          <span class="play" aria-hidden="true">${playIcon}</span></a>`;
        actions = `<div class="card__actions"><a href="${p.url}" target="_blank" rel="noopener">Watch the demo ${extIcon}</a></div>`;
      } else {
        media = `<a class="card__media" href="${p.url}" target="_blank" rel="noopener" aria-label="Open ${esc(p.title)}">${picture(p.image, { alt: `Screenshot of ${p.title}`, sizes: '(max-width: 767px) 92vw, 380px' })}</a>`;
        actions = `<div class="card__actions"><a href="${p.url}" target="_blank" rel="noopener">Open the site ${extIcon}</a>${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener">Code ${extIcon}</a>` : ''}</div>`;
      }
      return `<article class="card" data-tilt>
        <span class="card__tag tone-${p.tone}" aria-hidden="true">${esc(p.tag)}</span>
        ${media}
        <h3 class="card__title">${esc(p.title)}</h3>
        <p class="card__blurb">${esc(p.blurb)}</p>
        <ul class="card__stack" aria-label="Built with">${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        ${actions}
      </article>`;
    })
    .join('');

  // counters: rendered at their final value; counters.ts winds them back if it runs
  const fmt = new Intl.NumberFormat('en-IN');
  q('#counters').innerHTML = counters
    .map(
      (c) => `<li class="counter">
      <span class="counter__value" data-value="${c.value}" data-from="${c.from ?? 0}" data-prefix="${esc(c.prefix ?? '')}" data-suffix="${esc(c.suffix ?? '')}">${esc(c.prefix ?? '')}${fmt.format(c.value)}${esc(c.suffix ?? '')}</span>
      <span class="counter__label">${esc(c.label)}</span>
    </li>`,
    )
    .join('');

  // about
  q('#about-lines').innerHTML = about.lines.map((l) => `<li data-reveal>${esc(l)}</li>`).join('');

  // contact
  q('#contact-links').innerHTML = `
    <li><button class="contact__row" type="button" id="copy-email" data-cursor="copy"><span>${esc(links.email)}</span><small>copy</small></button></li>
    <li><a class="contact__row" href="${links.linkedin}" target="_blank" rel="noopener"><span>${esc(links.linkedinLabel)}</span><small>LinkedIn</small></a></li>
    <li><a class="contact__row" href="${links.github}" target="_blank" rel="noopener"><span>${esc(links.githubLabel)}</span><small>GitHub</small></a></li>
    <li><a class="contact__row" href="${links.resume}" target="_blank" rel="noopener"><span>Resume</span><small>PDF</small></a></li>`;
  q('#contact-line').textContent = contact.line;
  q('#footer-line').textContent = contact.footer;

  // CSS 3D stack fallback markup is always present; hero-3d replaces it when WebGL mounts
  q('#hero-3d').innerHTML = `<div class="css-stack">${['yellow', 'pink', 'blue', 'green', 'orange']
    .map((t, i) => `<i class="tone-${t}" style="--i:${i}"></i>`)
    .join('')}</div>`;
}

export function initCopyEmail() {
  const btn = document.getElementById('copy-email');
  if (!btn) return;
  const small = btn.querySelector('small')!;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(links.email);
      small.textContent = 'copied';
      small.classList.add('copied');
      setTimeout(() => { small.textContent = 'copy'; small.classList.remove('copied'); }, 1800);
    } catch {
      location.href = `mailto:${links.email}`;
    }
  });
}
