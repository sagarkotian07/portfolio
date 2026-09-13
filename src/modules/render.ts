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
  q<HTMLAnchorElement>('#hero-whatsapp').href = links.whatsapp;

  q('#levels').innerHTML = stops.map((s) => `<li class="level">
    <h3 class="level__org"><a class="level__link" href="${s.url}" target="_blank" rel="noopener" aria-label="${esc(s.org)}, opens their website in a new tab"><img class="level__logo" src="${s.logo}" alt="" width="36" height="36" loading="lazy" decoding="async">${esc(s.org)}<span class="level__arrow" aria-hidden="true">↗</span></a></h3>
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
      <a class="card__link" href="${p.url}" target="_blank" rel="noopener">${esc(p.cta)} ↗</a>
    </article>`;
  }).join('');

  q('#about-lines').innerHTML = about.lines.map((l) => `<li>${esc(l)}</li>`).join('');
  q('#about-hint').textContent = about.hint;
  q('#about-tags').innerHTML = about.tags.map((t, i) => `<button class="tag${i === 0 ? ' is-on' : ''}" type="button" data-tag="${t}" aria-pressed="${i === 0}">${esc(t)}</button>`).join('');
  q('#wall').innerHTML = about.photos.map((ph, i) => {
    const media = ph.kind === 'image'
      ? picture(ph.key!, { alt: ph.alt, sizes: '(max-width: 899px) 44vw, 230px' })
      : `<video class="polaroid__video" src="${ph.src}" muted playsinline loop preload="metadata" aria-label="${esc(ph.alt)}"></video><span class="polaroid__play" aria-hidden="true">${playIcon}</span>`;
    return `<figure class="polaroid" data-id="${ph.id}" data-tag="${ph.tag}" data-i="${i}">
      <span class="polaroid__pin" aria-hidden="true"></span>
      <button class="polaroid__open" type="button" aria-label="Open photo: ${esc(ph.caption)}">${media}</button>
      <figcaption class="polaroid__cap">${esc(ph.caption)}</figcaption>
    </figure>`;
  }).join('');
  q('#guestbook-lead').textContent = guestbook.lead;
  q<HTMLInputElement>('#note-name').placeholder = guestbook.namePlaceholder;
  q<HTMLTextAreaElement>('#note-text').placeholder = guestbook.textPlaceholder;
  q('#note-submit').textContent = guestbook.button;

  q('#sayhi-links').innerHTML = `
    <li><a class="sayhi__row sayhi__row--wa" href="${links.whatsapp}" target="_blank" rel="noopener" data-cursor="open"><span>WhatsApp</span><small>${esc(links.whatsappLabel)} ↗</small></a></li>
    <li><button class="sayhi__row" type="button" id="copy-email" data-cursor="copy"><span>${esc(links.email)}</span><small>copy</small></button></li>
    <li><a class="sayhi__row" href="${links.linkedin}" target="_blank" rel="noopener" data-cursor="open"><span>LinkedIn</span><small>↗</small></a></li>`;
}

export function initCopyEmail() {
  const btn = document.getElementById('copy-email'); if (!btn) return;
  const small = btn.querySelector('small')!;
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(links.email); small.textContent = 'copied'; small.classList.add('is-copied'); setTimeout(() => { small.textContent = 'copy'; small.classList.remove('is-copied'); }, 1600); }
    catch { location.href = `mailto:${links.email}`; }
  });
}
