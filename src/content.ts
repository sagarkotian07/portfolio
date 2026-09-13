// Everything written on the page. Short, human, no numbers.

export const hero = {
  first: 'Sagar',
  last: 'Kotian',
  meta: 'Founder’s office · Superjoin · Bengaluru',
  line: 'I like the part of a startup where nothing has an owner yet.',
  photoAlt: 'Sagar Kotian in a dark blazer, smiling, in front of a wall of green ivy.',
};

export interface Stop { org: string; url: string; logo: string; role: string; dates: string; line: string }
export const stops: Stop[] = [
  { org: 'Superjoin', url: 'https://www.superjoin.ai/', logo: '/img/logos/superjoin.png', role: 'Founder’s office', dates: 'Jan 2026 to now', line: 'Built the outbound engine from scratch and handle customer support end to end.' },
  { org: 'Zenskar', url: 'https://www.zenskar.com/', logo: '/img/logos/zenskar.png', role: 'Founder’s office intern', dates: 'Sep 2025 to Jan 2026', line: 'Built workflows around intent signals, lead prospecting and a range of go-to-market work.' },
  { org: 'CodeRound AI', url: 'https://www.coderound.ai/', logo: '/img/logos/coderound.png', role: 'Chief of staff', dates: 'Aug 2024 to Jul 2025', line: 'Ran outbound and client operations, from the first message to onboarding.' },
  { org: 'CogniMuse', url: 'https://www.cognimuse.com/', logo: '/img/logos/cognimuse.png', role: 'Digital marketing intern', dates: 'Sep 2023 to Mar 2024', line: 'My first startup, and their first intern. This is where I first heard of YC, in the second year of college.' },
];

export type Project = { id: string; title: string; line: string; label: string; url: string; cta: string } &
  ({ kind: 'video'; preview: string; poster: 'posterInvoice' | 'posterDashboard' } | { kind: 'site'; image: 'bengaluruRun' });
export const projects: Project[] = [
  { id: 'invoice-po', kind: 'video', preview: '/video/invoice-po-preview.mp4', poster: 'posterInvoice', url: 'https://screen.studio/share/62w9eq8a', cta: 'Watch', label: 'demo',
    title: 'Invoice to PO reconciliation', line: 'Drop in invoices and purchase orders. It matches them so nobody has to.' },
  { id: 'dashboard', kind: 'video', preview: '/video/dashboard-preview.mp4', poster: 'posterDashboard', url: 'https://screen.studio/share/c7oyPJeH', cta: 'Watch', label: 'demo',
    title: 'Superjoin internal dashboard', line: 'Billing, usage and support in one screen, so I stop opening four tabs.' },
  { id: 'bengaluru-run', kind: 'site', image: 'bengaluruRun', url: 'https://bengaluru-run.vercel.app', cta: 'Open', label: 'live',
    title: 'Bengaluru.run', line: 'A map of running routes in Bengaluru. I run, so this was inevitable.' },
];

export interface Photo { id: string; key: 'mangalore' | 'waterfall' | 'beach' | 'cafe' | 'lighthouse'; alt: string; caption: string; wide?: boolean }
export const about = {
  // [o:..] marker loop, [u:..] wavy underline, [h:..] highlighter
  lines: ['[o:Somehow] ended up in engineering.', 'Spent all college working at startups and doing [u:random things].', 'I just wanted to figure things out, so I became [h:a generalist].'],
  photos: [
    { id: 'classroom', key: 'mangalore', alt: 'Sagar in a white shirt and college lanyard, leaning over a desk in a classroom.', caption: 'College was fun.' },
    { id: 'waterfall', key: 'waterfall', alt: 'Sagar and three friends grinning in front of a waterfall in the forest.', caption: 'friends<3', wide: true },
    { id: 'beach', key: 'beach', alt: 'Sagar on Udupi beach at dusk, pink sky and waves behind him.', caption: 'Pink Sky and Udupi Beach.' },
    { id: 'cafe', key: 'cafe', alt: 'Sagar at a cafe counter, looking into the camera.', caption: 'my resting face' },
    { id: 'lighthouse', key: 'lighthouse', alt: 'Sagar in a white shirt beside a striped lighthouse, arm raised as if resting it on the top.', caption: 'Almost there.' },
  ] as Photo[],
};

export const links = {
  whatsapp: 'https://wa.me/919321747802?text=Hi%20Sagar',
  whatsappLabel: '+91 93217 47802',
  email: 'kotiansagar07@gmail.com',
  linkedin: 'https://linkedin.com/in/sagar-kotian-',
};

export const game = {
  title: 'Bounce.',
  intro: 'A red ball in a sky forest. Climb the vines, collect the eggs, find the flower at the top.',
  controls: 'arrows or A D to roll · space to jump · the Nokia keys 4 6 5 work too',
  touch: 'hold the arrows to roll, tap the dot to jump',
  win: (eggs: number, total: number, time: string) => `You bounced through. ${eggs} of ${total} eggs in ${time}.`,
  winLine: 'The flower says thanks.',
};
