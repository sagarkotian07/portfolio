import { hero, stops, projects, about, guestbook, links } from '../content';
import { images, type ImageKey } from '../generated/images';
import { q } from './prefs';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export function picture(key: ImageKey, o: { alt: string; sizes: string }) {
  const im = images[key];
  const set = (ext: 'avif' | 'webp') => im[ext].map((w) => `/img/${key}-${w}.${ext} ${w}w`).join(', ');
  return `<picture><source type="image/avif" srcset="${set('avif')}" sizes="${o.sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${o.sizes}"><img src="${im.jpg}" width="${im.width}" height="${im.height}" alt="${esc(o.alt)}" loading="lazy" decoding="async"></picture>`;
}
const playIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5v17l14-8.5z" fill="currentColor"/></svg>`;

export function renderAll() {
  // hero copy is static in index.html so nothing shifts before JS runs; content.ts keeps the same words for the share card and tests
  void hero;

  q('#levels').innerHTML = stops.map((s) => `<li class="level">
    <h3 class="level__org"><a class="level__link" href="${s.url}" target="_blank" rel="noopener" aria-label="${esc(s.org)}, opens their website in a new tab"><img class="level__logo" src="${s.logo}" alt="" width="34" height="34" loading="lazy" decoding="async">${esc(s.org)}</a></h3>
    <p class="level__role">${esc(s.role)}</p>
    <p class="level__dates">${esc(s.dates)}</p>
    <p class="level__line">${esc(s.line)}</p>
  </li>`).join('');
  const map = q('#levelmap'); const ball = document.createElement('i'); ball.className = 'levelmap__ball'; ball.setAttribute('aria-hidden', 'true'); map.appendChild(ball);

  q('#cards').innerHTML = projects.map((p) => {
    const media = p.kind === 'video'
      ? `<a class="card__media card__media--video" href="${p.url}" target="_blank" rel="noopener" data-cursor="play" aria-label="${esc(p.label)}: ${esc(p.cta)} ${esc(p.title)} (opens on Screen Studio)">
          ${picture(p.poster, { alt: '', sizes: '(max-width: 767px) 92vw, 380px' })}
          <video class="card__preview" muted playsinline loop preload="none" data-src="${p.preview}" aria-hidden="true" tabindex="-1"></video>
          <span class="card__badge" aria-hidden="true">${esc(p.label)}</span><span class="card__play" aria-hidden="true">${playIcon}</span></a>`
      : `<a class="card__media" href="${p.url}" target="_blank" rel="noopener" data-cursor="open" aria-label="${esc(p.label)}: ${esc(p.cta)} ${esc(p.title)}">
          ${picture(p.image, { alt: `Screenshot of ${p.title}`, sizes: '(max-width: 767px) 92vw, 380px' })}
          <span class="card__badge" aria-hidden="true">${esc(p.label)}</span></a>`;
    return `<article class="card">${media}
      <h3 class="card__title">${esc(p.title)}</h3>
      <p class="card__line">${esc(p.line)}</p>
      <a class="card__link link" href="${p.url}" target="_blank" rel="noopener">${esc(p.cta)}</a>
    </article>`;
  }).join('');

  // story lines: [o:..] marker loop, [u:..] wavy underline, [h:..] highlighter
  const markSvg: Record<string, string> = {
    o: '<svg class="mark__svg" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M10 24 C 6 10, 38 3, 62 5 C 88 7, 99 15, 95 26 C 91 36, 56 39, 30 36 C 11 34, 2 27, 9 16 C 12 11, 18 8, 24 7"/></svg>',
    u: '<svg class="mark__svg" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M1 6 Q 7 1 13 6 T 25 6 T 37 6 T 49 6 T 61 6 T 73 6 T 85 6 T 99 5"/></svg>',
    h: '',
  };
  const markName: Record<string, string> = { o: 'loop', u: 'wave', h: 'swipe' };
  q('#about-lines').innerHTML = about.lines.map((l) => `<li>${esc(l).replace(/\[([ouh]):([^\]]+)\]/g, (_m, k: string, t: string) => `<span class="mark mark--${markName[k]}">${t}${markSvg[k]}</span>`)}</li>`).join('');
  q('#wall').innerHTML = about.photos.map((ph, i) => `<figure class="print${ph.wide ? ' print--wide' : ''}" data-i="${i}">
      <button class="print__open" type="button" aria-label="Open photo: ${esc(ph.caption)}">${picture(ph.key, { alt: ph.alt, sizes: ph.wide ? '(max-width: 899px) 90vw, 480px' : '(max-width: 899px) 45vw, 240px' })}</button>
      <figcaption class="print__cap">${esc(ph.caption)}</figcaption>
    </figure>`).join('');
  q('#guestbook-lead').textContent = guestbook.lead;
  q<HTMLTextAreaElement>('#note-text').placeholder = guestbook.textPlaceholder;

  q('#sayhi-links').innerHTML = `
    <li><a class="sayhi__row" href="${links.whatsapp}" target="_blank" rel="noopener" data-cursor="open"><span>WhatsApp</span><small>${esc(links.whatsappLabel)}</small></a></li>
    <li><button class="sayhi__row" type="button" id="copy-email" data-cursor="copy"><span>${esc(links.email)}</span><small>copy</small></button></li>
    <li><a class="sayhi__row" href="${links.linkedin}" target="_blank" rel="noopener" data-cursor="open"><span>LinkedIn</span></a></li>`;
}

export function initCopyEmail() {
  const btn = document.getElementById('copy-email'); if (!btn) return;
  const small = btn.querySelector('small')!;
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(links.email); small.textContent = 'copied'; small.classList.add('is-copied'); setTimeout(() => { small.textContent = 'copy'; small.classList.remove('is-copied'); }, 1600); }
    catch { location.href = `mailto:${links.email}`; }
  });
}
