// How much AI went into a project, in steps of 20 (project JSON "AIUsed").
export const AI_LEVELS = [
  { value: 0, short: 'FREE', label: 'AI-Free', description: 'All by hand, with docs, StackOverflow and tutorials.' },
  { value: 20, short: 'DOCS', label: 'Referencing', description: 'AI explains concepts and fixes syntax. I write all the code.' },
  { value: 40, short: 'AUTO', label: 'Automation', description: 'AI writes boilerplate from my comments. I supervise it closely.' },
  { value: 60, short: 'COLLAB', label: 'Collaboration', description: 'AI suggests structures and patterns. I choose, and build the critical parts.' },
  { value: 80, short: 'PILOT', label: 'Situational Autonomy', description: 'AI handles whole parts, like web frontends. I build the core systems.' },
  { value: 100, short: 'VIBE', label: 'Vibe Coding', description: 'AI writes almost everything. I test the behavior. Personal or low-risk projects only.' },
];

// P3R-style ramp for levels 1-5: each step brighter, from blue to white.
// Level 0 (made by hand) has no colour of its own.
export const AI_RAMP = ['#4C8DFF', '#16CFFB', '#7DE6FD', '#BFF4FF', '#FFFFFF'];

export const aiLevel = (value: number) => AI_LEVELS[Math.max(0, Math.min(5, Math.round(value / 20)))];
