// Single source of truth for everything written on the page.
// House rules: no em dashes, plain spoken words, short lines.

export type Tone = 'yellow' | 'pink' | 'orange' | 'blue' | 'green';

export interface Note {
  text: string;
  tone: Tone;
  /** Static resting spot (tablet / reduced motion): fractions of the notes band, and a tilt in degrees. */
  seed: { x: number; y: number; r: number };
  /** Same, for phones. Only the first six notes show there. */
  seedM: { x: number; y: number; r: number };
}

export const hero = {
  name: 'Sagar Kotian',
  tagline: ['First non-eng hire.', 'I bring in the demand, keep the customers,', 'and grade the AI’s homework.'],
  meta: 'Founder’s Office, GTM & Customer Success at Superjoin · Bengaluru',
  photoAlt: 'Sagar Kotian in a dark blazer, smiling, standing in front of a wall of green ivy.',
};

export const notes: Note[] = [
  { text: '10 to 20 demos a month, solo', tone: 'yellow', seed: { x: 0.06, y: 0.62, r: -7 }, seedM: { x: 0.02, y: 0.04, r: -6 } },
  { text: 'first 3 paying customers',     tone: 'pink',   seed: { x: 0.30, y: 0.70, r: 5 }, seedM: { x: 0.54, y: 0.02, r: 4 } },
  { text: '6,800 figures checked',        tone: 'blue',   seed: { x: 0.54, y: 0.64, r: -4 }, seedM: { x: 0.18, y: 0.36, r: 3 } },
  { text: 'outbound from zero',           tone: 'green',  seed: { x: 0.76, y: 0.72, r: 8 }, seedM: { x: 0.6, y: 0.4, r: -5 } },
  { text: '4,000+ execs cold emailed',    tone: 'orange', seed: { x: 0.10, y: 0.82, r: 4 }, seedM: { x: 0.04, y: 0.68, r: 5 } },
  { text: '$15K MRR, one engineer, me',   tone: 'yellow', seed: { x: 0.36, y: 0.86, r: -6 }, seedM: { x: 0.5, y: 0.66, r: -4 } },
  { text: '60% less manual CRM work',     tone: 'blue',   seed: { x: 0.60, y: 0.82, r: 3 }, seedM: { x: 0.3, y: 0.5, r: 2 } },
  { text: 'three startups, one degree',   tone: 'pink',   seed: { x: 0.80, y: 0.88, r: -9 }, seedM: { x: 0.3, y: 0.5, r: -2 } },
  { text: 'Bengaluru',                    tone: 'green',  seed: { x: 0.22, y: 0.94, r: 6 }, seedM: { x: 0.3, y: 0.5, r: 3 } },
  { text: 'attendance: allegedly',        tone: 'orange', seed: { x: 0.66, y: 0.95, r: -3 }, seedM: { x: 0.3, y: 0.5, r: -3 } },
];

export interface Stop {
  org: string;
  role: string;
  dates: string;
  about?: string;
  bullets: string[];
  closer: string;
  tone: Tone;
}

export const stops: Stop[] = [
  {
    org: 'Superjoin',
    role: 'Founder’s Office, GTM & Customer Success',
    dates: 'Jan 2026 to now',
    about: 'AI Excel agent for finance teams, backed by Better Capital. Intern to full-time in Aug 2026.',
    tone: 'yellow',
    bullets: [
      'Built outbound from zero. 10 to 20 qualified demos a month, and AI Copilot’s first 3 paying customers from CA firms and merchant banks.',
      'Co-own customer success for a $15K MRR product with one engineer. I’m on every customer issue and I decide what gets fixed first.',
      'Own the Intercom Fin support agent: wrote the knowledge base it answers from, watch its live replies, close the gaps.',
    ],
    closer: 'Sell it, support it, and fact-check the robot when it does math.',
  },
  {
    org: 'Zenskar',
    role: 'Founder’s Office Intern, RevOps & Strategy',
    dates: 'Sep 2025 to Jan 2026',
    about: 'B2B revenue automation, backed by Bessemer',
    tone: 'blue',
    bullets: [
      'Built a bot that scraped LinkedIn, Reddit and Twitter for freshly hired CFOs, then pinged Slack before they had finished onboarding.',
      'Mapped the founder’s and investors’ networks against live deals, so we stopped cold calling people we were two handshakes away from.',
      'Cut manual CRM work by 60%, mostly because I did not want to do it.',
    ],
    closer: 'Final year of engineering through all of this. The bots had better attendance than I did.',
  },
  {
    org: 'CodeRound AI',
    role: 'Chief of Staff',
    dates: 'Aug 2024 to Jul 2025',
    tone: 'orange',
    bullets: [
      'Cold emailed, called and messaged 4,000+ VC partners, YC founders and CTOs. 12+ demos and the company’s first paying customer came out of it.',
      'Ran client ops for 30+ VC-funded startups including Sarvam AI and Nurix AI.',
      'Sat in on candidate interviews for roles paying up to 80 LPA.',
    ],
    closer: 'Did all three while still in college, where I was noticeably worse at attendance than at cold email.',
  },
];

export type Project = {
  id: string;
  title: string;
  blurb: string;
  stack: string[];
  tag: string;
  tone: Tone;
} & (
  | { kind: 'video'; preview: string; poster: 'posterInvoice' | 'posterDashboard'; url: string }
  | { kind: 'link'; url: string; repo?: string; image: 'bengaluruRun' }
);

export const projects: Project[] = [
  {
    id: 'invoice-po',
    kind: 'video',
    preview: '/video/invoice-po-preview.mp4',
    poster: 'posterInvoice',
    url: 'https://screen.studio/share/62w9eq8a',
    title: 'Invoice to PO reconciliation',
    blurb: 'Drop a mixed pile of invoice and PO PDFs into n8n. Claude reads each one. Plain code does the matching: seller GSTIN, many-to-many, line items, GST checks. It remembers past runs.',
    stack: ['n8n', 'Claude', 'JavaScript'],
    tag: 'demo',
    tone: 'yellow',
  },
  {
    id: 'dashboard',
    kind: 'video',
    preview: '/video/dashboard-preview.mp4',
    poster: 'posterDashboard',
    url: 'https://screen.studio/share/c7oyPJeH',
    title: 'Superjoin internal dashboard',
    blurb: 'Stripe billing, PostHog usage, Intercom support and Slack in one screen, so one person can see revenue, usage and support load without opening four tabs.',
    stack: ['React', 'Stripe', 'PostHog', 'Intercom'],
    tag: 'demo',
    tone: 'blue',
  },
  {
    id: 'bengaluru-run',
    kind: 'link',
    url: 'https://bengaluru-run.vercel.app',
    repo: 'https://github.com/sagarkotian07/Bengaluru.run',
    image: 'bengaluruRun',
    title: 'Bengaluru.run',
    blurb: 'A community map of Bengaluru running routes. Upvote routes, find clubs and events, a corporate km leaderboard. Real OpenStreetMap route geometry, not hand-drawn lines.',
    stack: ['React', 'Leaflet', 'Supabase', 'Strava'],
    tag: 'live',
    tone: 'green',
  },
];

export interface Counter {
  value: number;
  from?: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export const counters: Counter[] = [
  { value: 4000, suffix: '+', label: 'execs reached' },
  { value: 20, from: 10, prefix: '10 to ', label: 'demos a month' },
  { value: 3, label: 'first paying customers' },
  { value: 6800, label: 'figures verified' },
  { value: 60, suffix: '%', label: 'less manual CRM work' },
  { value: 3, label: 'startups before graduating' },
];

export const about = {
  heading: 'How I work',
  lines: [
    'I like the part of a startup where nothing has an owner yet.',
    'Sales calls in the morning, support tickets after lunch, arguing with two AI models by evening.',
    'I’m not an engineer. I build things anyway, because waiting for one is slower.',
    'B.Tech in Computer Science, NMAMIT, 2022 to 2026. Three startups in that time. Attendance did not survive.',
    'Bengaluru. I run. I built a map for that too.',
  ],
  wallCaption: 'the wall this site is named after',
  wallAlt: 'Sagar at his desk, glasses on, with a whiteboard of sticky notes behind him.',
  casualAlt: 'Sagar in a black polo, smiling at a cafe table.',
};

export const links = {
  email: 'kotiansagar07@gmail.com',
  linkedin: 'https://linkedin.com/in/sagar-kotian-',
  linkedinLabel: 'linkedin.com/in/sagar-kotian-',
  github: 'https://github.com/sagarkotian07',
  githubLabel: 'github.com/sagarkotian07',
  resume: '/resume.pdf',
};

export const contact = {
  heading: 'Say hi.',
  line: 'Coffee in Bengaluru: yes.',
  footer: 'Built by hand with Vite, GSAP, Matter.js and Three.js. No templates were harmed.',
};
