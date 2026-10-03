import { ELEMENT_PATHS } from '@/config/elementPaths';

// Each element's icon as a filled silhouette, for the element switch
// (PageTransition 'element'): the outer outline only (the largest subpath of
// the traced icon, so rings and cut-outs come out solid), as an SVG for CSS
// masks, plus the point deepest inside it, which the shape grows around so
// even thin shapes (the bolt) end up covering the screen.

const BOX = 512;
type Shape = { url: string; path: Path2D; core: { x: number; y: number } };
const cache = new Map<string, Shape>();

function outer(d: string) {
  const subs = d.split(/(?=M)/).map(s => s.trim()).filter(Boolean);
  let best = subs[0], area = -1;
  for (const s of subs) {
    const n = s.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
    const a = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    if (a > area) { area = a; best = s; }
  }
  return best;
}

export function elementShape(id: string): Shape {
  const hit = cache.get(id);
  if (hit) return hit;
  const d = outer(ELEMENT_PATHS[id] ?? ELEMENT_PATHS.aqua), path = new Path2D(d);
  const g = document.createElement('canvas').getContext('2d')!;
  // deepest point: on a coarse grid, the inside point farthest from any outside point
  const N = 48, step = BOX / N, inside: boolean[] = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) inside.push(g.isPointInPath(path, (i + 0.5) * step, (j + 0.5) * step));
  const out: [number, number][] = [];
  inside.forEach((v, k) => { if (!v) out.push([k % N, Math.floor(k / N)]); });
  let core = { x: BOX / 2, y: BOX / 2 }, far = -1;
  inside.forEach((v, k) => {
    if (!v) return;
    const i = k % N, j = Math.floor(k / N);
    let near = Infinity;
    for (const [a, b] of out) near = Math.min(near, (a - i) ** 2 + (b - j) ** 2);
    if (near > far) { far = near; core = { x: (i + 0.5) * step, y: (j + 0.5) * step }; }
  });
  const url = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}"><path d="${d}"/></svg>`)}")`;
  const s = { url, path, core };
  cache.set(id, s);
  return s;
}

// The size (px for the whole 512 box) at which the shape, its core put at
// (ox, oy), covers the w x h screen; capped, past which the layer is simply
// filled at the end.
export function coverSize(s: Shape, ox: number, oy: number, w: number, h: number) {
  const g = document.createElement('canvas').getContext('2d')!, pts: [number, number][] = [];
  for (let k = 0; k <= 8; k++) pts.push([(w * k) / 8, 0], [(w * k) / 8, h], [0, (h * k) / 8], [w, (h * k) / 8]);
  const covers = (size: number) => pts.every(([x, y]) => g.isPointInPath(s.path, s.core.x + ((x - ox) * BOX) / size, s.core.y + ((y - oy) * BOX) / size));
  let lo = Math.hypot(w, h), hi = lo * 24;
  if (!covers(hi)) return hi;
  for (let n = 0; n < 18; n++) { const mid = (lo + hi) / 2; if (covers(mid)) hi = mid; else lo = mid; }
  return hi;
}
