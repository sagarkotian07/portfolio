import { q, qa } from './prefs';
import { guestbook } from '../content';

interface Note { id: string; n: number; text: string; at: number }
const API = '/api/guestbook', LS = 'guestbook-notes';
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const when = (t: number) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', ' ·');

/** Anonymous notes, numbered, newest first. The live site talks to the API; the static preview keeps notes in this browser. */
export function initGuestbook() {
  const form = q<HTMLFormElement>('#note-form'), textEl = q<HTMLTextAreaElement>('#note-text'), count = q('#note-count-chars'), status = q('#note-status'), list = q('#notes'), total = q('#note-count'), submit = q<HTMLButtonElement>('#note-submit');
  let local = false;
  const localNotes = (): Note[] => { try { return JSON.parse(localStorage.getItem(LS) ?? 'null') ?? guestbook.seed; } catch { return guestbook.seed; } };
  const render = (notes: Note[]) => {
    list.innerHTML = notes.length
      ? notes.map((n) => `<li class="entry"><span class="entry__meta"><b class="entry__n">#${n.n}</b><time datetime="${new Date(n.at).toISOString()}">${when(n.at)}</time></span><p class="entry__text">${esc(n.text)}</p></li>`).join('')
      : `<li class="entry entry--empty">${esc(guestbook.empty)}</li>`;
    total.textContent = notes.length ? `${notes.length} note${notes.length === 1 ? '' : 's'}${local ? ' · kept in this browser until the site goes live' : ''}` : '';
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
  const grow = () => { textEl.style.height = 'auto'; textEl.style.height = `${Math.max(64, textEl.scrollHeight)}px`; };
  textEl.addEventListener('input', () => { count.textContent = String(280 - textEl.value.length); grow(); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = textEl.value.trim().slice(0, 280);
    if (text.length < 2) { status.textContent = 'Write a little more than that.'; textEl.focus(); return; }
    submit.disabled = true; status.textContent = '';
    if (local) {
      const prev = localNotes(), n = prev.reduce((m, x) => Math.max(m, x.n), 0) + 1;
      const notes = [{ id: String(Date.now()), n, text, at: Date.now() }, ...prev];
      try { localStorage.setItem(LS, JSON.stringify(notes.slice(0, 200))); } catch { /* ignore */ }
      render(notes); textEl.value = ''; count.textContent = '280'; grow(); submit.disabled = false; status.textContent = `Pinned as #${n}.`;
      return;
    }
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, website: qa<HTMLInputElement>('.note-form__hp', form)[0]?.value ?? '' }) });
      const d = (await r.json()) as { note?: Note; error?: string };
      if (!r.ok || !d.note) throw new Error(d.error ?? 'Could not pin that. Try again.');
      textEl.value = ''; count.textContent = '280'; grow(); status.textContent = `Pinned as #${d.note.n}.`; await load();
    } catch (err) { status.textContent = (err as Error).message; }
    submit.disabled = false;
  });
  load();
}
