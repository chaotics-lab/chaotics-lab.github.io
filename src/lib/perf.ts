// Quality governor. 2 = everything, 1 = lighter (fewer particles, coarser
// card bending, no backdrop blur), 0 = minimal (no ocean canvas, no hero
// particles, flat cards). It starts from a guess about the device, then
// watches frame times from the shared ticker and steps down one level when
// the page keeps dropping frames. It never steps back up within a visit;
// the level is kept for the session so other pages start there.

type Level = 0 | 1 | 2;
const KEY = 'lox-quality';
const listeners = new Set<(q: Level) => void>();

function guess(): Level {
  if (typeof window === 'undefined') return 2;
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved === '0' || saved === '1' || saved === '2') return Number(saved) as Level;
  } catch { /* storage unavailable */ }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return 0;
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  if (cores <= 2 || mem <= 2) return 0;
  const touchSmall = window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 820;
  if (touchSmall || cores <= 4 || mem <= 4) return 1;
  return 2;
}

let level: Level = guess();
const apply = () => {
  if (typeof document !== 'undefined') document.documentElement.dataset.quality = String(level);
};
apply();

export const quality = () => level;

export function onQuality(fn: (q: Level) => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function stepDown() {
  if (level === 0) return;
  level = (level - 1) as Level;
  try { sessionStorage.setItem(KEY, String(level)); } catch { /* storage unavailable */ }
  apply();
  listeners.forEach(fn => fn(level));
}

// Called by the ticker with each raw frame duration (ms). Judged over 2 s
// windows after a 2.5 s settling time (and again after each step down):
// slow if a quarter of the frames take longer than ~28 ms (under ~36 fps).
let settle = 2500;
let window_: number[] = [];
let windowMs = 0;
export function recordFrame(ms: number) {
  if (ms > 250) return; // tab was hidden or the page was busy loading
  if (settle > 0) { settle -= ms; return; }
  window_.push(ms);
  windowMs += ms;
  if (windowMs < 2000) return;
  const sorted = window_.sort((a, b) => a - b);
  const p75 = sorted[Math.floor(sorted.length * 0.75)];
  window_ = [];
  windowMs = 0;
  if (p75 > 28) {
    stepDown();
    settle = 2500;
  }
}
