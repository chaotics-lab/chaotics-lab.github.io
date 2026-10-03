// Quality governor. 2 = everything, 1 = lighter (fewer particles, coarser
// card bending, no backdrop blur), 0 = minimal (no ocean canvas, no hero
// particles, flat cards). It starts from a guess about the device, then
// watches frame times from the shared ticker: it steps down one level only
// when frames stay slow for a few seconds (not for a load spike or a page
// transition), and steps back up, never past the device's ceiling, once
// they are smooth again. The level is kept for the session so other pages
// start there.

type Level = 0 | 1 | 2;
const KEY = 'lox-quality';
const listeners = new Set<(q: Level) => void>();

// What the device should manage. Desktops (a fine pointer) get everything:
// core and memory counts are rough and often capped by the browser, and the
// frame times below catch the ones that struggle anyway.
function ceiling(): Level {
  if (typeof window === 'undefined') return 2;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return 0;
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  if (cores <= 2 && mem <= 2) return 0;
  if (window.matchMedia('(pointer: fine)').matches) return 2;
  const touchSmall = window.innerWidth <= 820;
  if (touchSmall || cores <= 4 || mem <= 4) return 1;
  return 2;
}

const top = ceiling();
function guess(): Level {
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved === '0' || saved === '1' || saved === '2') return Math.min(top, Number(saved)) as Level;
  } catch { /* storage unavailable */ }
  return top;
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

function setLevel(next: Level) {
  if (next === level) return;
  level = next;
  try { sessionStorage.setItem(KEY, String(level)); } catch { /* storage unavailable */ }
  apply();
  listeners.forEach(fn => fn(level));
}

// Called by the ticker with each raw frame duration (ms), judged over 2 s
// windows after a 3 s settling time (again after each change), on the 75th
// percentile frame:
//   slow (over ~34 ms, under ~30 fps) three times in a row (about 6 s):
//   one level down, but to the minimal level only when severe (over ~50 ms,
//   under ~20 fps);
//   smooth (under ~20 ms) three times in a row: one level back up.
const SETTLE = 3000;
let settle = SETTLE;
let frames: number[] = [];
let windowMs = 0;
let slow = 0, severe = 0, smooth = 0;
export function recordFrame(ms: number) {
  if (ms > 250) return; // tab was hidden or the page was busy loading
  if (settle > 0) { settle -= ms; return; }
  frames.push(ms);
  windowMs += ms;
  if (windowMs < 2000) return;
  const p75 = frames.sort((a, b) => a - b)[Math.floor(frames.length * 0.75)];
  frames = [];
  windowMs = 0;
  slow = p75 > 34 ? slow + 1 : 0;
  severe = p75 > 50 ? severe + 1 : 0;
  smooth = p75 < 20 ? smooth + 1 : 0;
  let next = level;
  if (slow >= 3 && level > 1) next = (level - 1) as Level;
  else if (severe >= 3 && level === 1) next = 0;
  else if (smooth >= 3 && level < top) next = (level + 1) as Level;
  if (next !== level) {
    setLevel(next);
    settle = SETTLE;
    slow = severe = smooth = 0;
  }
}
