import { q, qa } from './prefs';
import { guestbook } from '../content';

interface Note { id: string; name: string; text: string; at: number }
const API = '/api/guestbook', LS = 'guestbook-notes', NAME = 'guestbook-name';
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const ago = (t: number) => { const s = (Date.now() - t) / 1000; if (s < 60) return 'just now'; const m = s / 60; if (m < 60) return `${Math.floor(m)} min ago`; const h = m / 60; if (h < 24) return `${Math.floor(h)} h ago`; const d = h / 24; if (d < 30) return `${Math.floor(d)} day${d < 2 ? '' : 's'} ago`; return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };

/** Notes come from the API on the live site. Where there is no API (local preview) they live in this browser only. */
export function initGuestbook() {
  const form = q<HTMLFormElement>('#note-form'), nameEl = q<HTMLInputElement>('#note-name'), textEl = q<HTMLTextAreaElement>('#note-text'), count = q('#note-count-chars'), status = q('#note-status'), list = q('#notes'), total = q('#note-count'), submit = q<HTMLButtonElement>('#note-submit');
  let local = false;
  const localNotes = (): Note[] => { try { return JSON.parse(localStorage.getItem(LS) ?? 'null') ?? guestbook.seed; } catch { return guestbook.seed; } };
  const render = (notes: Note[]) => {
    list.innerHTML = notes.length ? notes.map((n, i) => `<li class="note" style="--r:${((i * 7) % 5) - 2}deg"><span class="note__pin" aria-hidden="true"></span><b class="note__name">${esc(n.name)}</b><p class="note__text">${esc(n.text)}</p><time class="note__time" datetime="${new Date(n.at).toISOString()}">${ago(n.at)}</time></li>`).join('') : `<li class="note note--empty">${esc(guestbook.empty)}</li>`;
    total.textContent = notes.length ? `${notes.length} note${notes.length === 1 ? '' : 's'} so far${local ? ' · stored in this browser until the site goes live' : ''}` : '';
  };
  // the static preview has no API; vercel dev (port 3000) and the live site do
  const noApi = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && location.port !== '3000';
  const load = async () => {
    if (noApi) { local = true; render(localNotes()); return; }
    try {
      const r = await fetch(API, { headers: { accept: 'application/json' } });
      if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error('no api');
      const d = (await r.json()) as { notes: Note[] }; render(d.notes);
    } catch { local = true; render(localNotes()); }
  };
  try { nameEl.value = localStorage.getItem(NAME) ?? ''; } catch { /* private mode */ }
  textEl.addEventListener('input', () => { count.textContent = String(280 - textEl.value.length); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameEl.value.trim().slice(0, 40), text = textEl.value.trim().slice(0, 280);
    if (text.length < 2) { status.textContent = 'Write a little more than that.'; textEl.focus(); return; }
    submit.disabled = true; status.textContent = '';
    try { localStorage.setItem(NAME, name); } catch { /* ignore */ }
    if (local) {
      const notes = [{ id: String(Date.now()), name: name || 'Someone', text, at: Date.now() }, ...localNotes()];
      try { localStorage.setItem(LS, JSON.stringify(notes.slice(0, 200))); } catch { /* ignore */ }
      render(notes); textEl.value = ''; count.textContent = '280'; submit.disabled = false; status.textContent = 'Pinned.';
      return;
    }
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, text, website: qa<HTMLInputElement>('.note-form__hp', form)[0]?.value ?? '' }) });
      const d = (await r.json()) as { note?: Note; error?: string };
      if (!r.ok || !d.note) throw new Error(d.error ?? 'Could not pin that. Try again.');
      textEl.value = ''; count.textContent = '280'; status.textContent = 'Pinned.'; await load();
    } catch (err) { status.textContent = (err as Error).message; }
    submit.disabled = false;
  });
  load();
}
