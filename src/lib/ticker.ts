// One shared requestAnimationFrame loop for all procedural animation, plus
// a smoothed pointer. The loop only runs while something is subscribed and
// pauses with the tab (rAF does that on its own).

type TickFn = (t: number, dt: number) => void;

const subs = new Set<TickFn>();
let raf = 0;
let last = 0;

export const pointer = { x: -9999, y: -9999, active: false };

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.active = false; });
}

const loop = (now: number) => {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;
  subs.forEach(fn => fn(t, dt));
};

export function onTick(fn: TickFn) {
  subs.add(fn);
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  return () => {
    subs.delete(fn);
    if (!subs.size) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// Document offset that ignores CSS transforms (unlike getBoundingClientRect).
export function docOffset(el: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}
