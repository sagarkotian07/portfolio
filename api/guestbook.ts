// Guestbook API for Vercel: GET lists notes, POST adds one, DELETE removes one with the admin key.
// Store: Upstash Redis (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN from the Vercel marketplace integration).
import { Redis } from '@upstash/redis';

interface Note { id: string; name: string; text: string; at: number }
type Req = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown; query?: Record<string, string | string[] | undefined> };
type Res = { status: (n: number) => Res; json: (b: unknown) => void; setHeader: (k: string, v: string) => void };

const KEY = 'guestbook:notes';
const clean = (s: unknown, max: number) => String(s ?? '').replace(/<[^>]*>/g, '').replace(/https?:\/\/\S+/gi, '').replace(/\s+/g, ' ').trim().slice(0, max);

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return res.status(503).json({ error: 'The guestbook store is not set up yet.' });
  const redis = Redis.fromEnv();
  if (req.method === 'GET') {
    const raw = await redis.lrange<string | Note>(KEY, 0, 199);
    const notes = raw.map((r) => (typeof r === 'string' ? (JSON.parse(r) as Note) : r));
    return res.status(200).json({ notes, total: await redis.llen(KEY) });
  }
  if (req.method === 'POST') {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {}) as Record<string, unknown>;
    if (body.website) return res.status(200).json({ ok: true }); // honeypot
    const name = clean(body.name, 40) || 'Someone', text = clean(body.text, 280);
    if (text.length < 2) return res.status(400).json({ error: 'Write a little more than that.' });
    const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown';
    const rl = await redis.set(`guestbook:rl:${ip}`, '1', { nx: true, ex: 60 });
    if (rl !== 'OK') return res.status(429).json({ error: 'One note a minute, please.' });
    const note: Note = { id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36), name, text, at: Date.now() };
    await redis.lpush(KEY, JSON.stringify(note));
    await redis.ltrim(KEY, 0, 999);
    return res.status(200).json({ note });
  }
  if (req.method === 'DELETE') {
    const id = String(req.query?.id ?? ''), key = String(req.query?.key ?? '');
    if (!process.env.GUESTBOOK_ADMIN_KEY || key !== process.env.GUESTBOOK_ADMIN_KEY) return res.status(403).json({ error: 'No.' });
    const raw = await redis.lrange<string | Note>(KEY, 0, 999);
    for (const r of raw) { const n = typeof r === 'string' ? (JSON.parse(r) as Note) : r; if (n.id === id) { await redis.lrem(KEY, 1, typeof r === 'string' ? r : JSON.stringify(r)); return res.status(200).json({ ok: true }); } }
    return res.status(404).json({ error: 'Not found.' });
  }
  return res.status(405).json({ error: 'Method not allowed.' });
}
