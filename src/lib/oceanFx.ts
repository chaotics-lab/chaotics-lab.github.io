// The background effect for each element, drawn on the canvas at the
// bottom of the screen (OceanFx.tsx). Ported from lab/ocean-effects.html,
// where each one was tried out on its own; the comments there say which
// reference pen each one comes from. Every effect draws in its own box
// (w x h, origin top left, the seabed at the bottom) and takes the pointer
// in the same coordinates.

import { themeRgb } from './theme';

export interface Fx {
  draw(g: CanvasRenderingContext2D, w: number, h: number, dt: number): void;
  move?(x: number | null, y: number): void;
  click?(w: number, h: number, x: number, y: number): void;
}
type Ptr = { x: number; y: number } | null;

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
const canvas = () => document.createElement('canvas');

// Gradient noise in about [-1, 1], and a few octaves of it.
const perm = new Uint8Array(512);
{
  const p = [...Array(256).keys()].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
}
const grad = (h: number, x: number, y: number) => { const a = (h / 256) * TAU; return Math.cos(a) * x + Math.sin(a) * y; };
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export function noise(x: number, y: number) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  const u = fade(x), v = fade(y), a = perm[X] + Y, b = perm[X + 1] + Y;
  const l1 = grad(perm[a], x, y) + u * (grad(perm[b], x - 1, y) - grad(perm[a], x, y));
  const l2 = grad(perm[a + 1], x, y - 1) + u * (grad(perm[b + 1], x - 1, y - 1) - grad(perm[a + 1], x, y - 1));
  return l1 + v * (l2 - l1);
}
const fbm = (x: number, y: number, oct = 3) => {
  let s = 0, a = 1, f = 1, n = 0;
  for (let i = 0; i < oct; i++) { s += a * noise(x * f, y * f); n += a; a *= 0.5; f *= 2; }
  return s / n;
};

// ---- Volta: lightning flashes lighting up murky water. A flash starts at
// random; while bright, its power is re-rolled every frame, so it stutters
// for a few frames, then dies out. The glow only shows where a murk texture
// (baked once, two layers turning slowly) is dense.
function murkTexture(seed: number) {
  const W = 160, H = 120, c = canvas();
  c.width = W; c.height = H;
  const x = c.getContext('2d')!, img = x.createImageData(W, H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const a = clamp((fbm(i / 38 + seed, j / 30 + seed * 1.7, 4) + 0.15) * 2.2, 0, 1), o = (j * W + i) * 4;
    img.data[o] = img.data[o + 1] = img.data[o + 2] = 255;
    img.data[o + 3] = a * 255;
  }
  x.putImageData(img, 0, 0);
  return c;
}
function volta(): Fx {
  const murk = [murkTexture(3.1), murkTexture(17.4)], off = canvas(), o = off.getContext('2d')!;
  let power = 0, fx = 0, fy = 0, t = 0;
  const RATE = 0.9; // flashes per second
  const start = (w: number, h: number, x?: number, y?: number) => {
    fx = x ?? rnd(w * 0.05, w * 0.95);
    fy = y ?? rnd(h * 0.35, h * 0.9);
    power = 300 + Math.random() * 250;
  };
  return {
    click: (w, h, x, y) => start(w, h, x, y),
    draw(g, w, h, dt) {
      t += dt;
      if (power < 100 && Math.random() < RATE * dt) start(w, h);
      else if (power > 100) power = 50 + Math.random() * 500;
      else power *= Math.pow(0.02, dt);
      const a = Math.min(1, power / 550);
      if (a <= 0.01) return;
      const Q = 4, ow = Math.ceil(w / Q), oh = Math.ceil(h / Q); // soft glow: a quarter of the resolution is enough
      if (off.width !== ow || off.height !== oh) { off.width = ow; off.height = oh; }
      o.globalCompositeOperation = 'source-over';
      o.clearRect(0, 0, ow, oh);
      murk.forEach((m, i) => { o.save(); o.translate(ow / 2, oh / 2); o.rotate((i ? -1 : 1) * t * 0.03); o.drawImage(m, -ow * 0.8, -oh * 0.8, ow * 1.6, oh * 1.6); o.restore(); });
      o.globalCompositeOperation = 'source-in';
      const { c1, c3 } = themeRgb(), R = Math.max(ow, oh) * 0.5, gr = o.createRadialGradient(fx / Q, fy / Q, 0, fx / Q, fy / Q, R);
      gr.addColorStop(0, `rgba(${c3}, ${a})`);
      gr.addColorStop(0.45, `rgba(${c1}, ${0.55 * a})`);
      gr.addColorStop(1, `rgba(${c1}, 0)`);
      o.fillStyle = gr;
      o.fillRect(0, 0, ow, oh);
      g.globalCompositeOperation = 'lighter';
      g.drawImage(off, 0, 0, w, h);
      g.globalCompositeOperation = 'source-over';
    },
  };
}

// ---- Pyra: a lava lamp. Metaballs whose outline is traced with marching
// squares (only cells along the edge are computed; the sign flips each
// frame so cached cell values can be reused). The heat sits low and
// wanders, or follows the pointer: blobs near it swell and rise, the
// others shrink and sink. The fill is a temperature gradient around it.
function kelvin(k: number) {
  const t = k / 100;
  let r: number, g: number, b: number;
  if (t <= 66) { r = 255; g = 99.4708025861 * Math.log(t) - 161.1195681661; b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307; }
  else { r = 329.698727446 * Math.pow(t - 60, -0.1332047592); g = 288.1221695283 * Math.pow(t - 60, -0.0755148492); b = 255; }
  return [r, g, b].map(v => clamp(v, 0, 255) | 0);
}
const HEAT_STOPS = ([[0, 3600], [0.3, 2400], [0.65, 1500], [1, 1000]] as const).map(([o, k]) => [o, `rgb(${kelvin(k).join(',')})`] as const);
type Cell = { x: number; y: number; magnitude: number; computed: number; force: number };
type Ball = { pos: Cell; vel: { x: number; y: number }; size: number; base: number };
const cell = (x: number, y: number): Cell => ({ x, y, magnitude: x * x + y * y, computed: 0, force: 0 });
const PLX = [0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0];
const PLY = [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1];
const MSCASES = [0, 3, 0, 3, 1, 3, 0, 3, 2, 2, 0, 2, 1, 1, 0];
const IX = [1, 0, -1, 0, 0, 1, 0, -1, -1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1];
function pyra(): Fx {
  const STEP = 5;
  let W = 0, H = 0, sx = 0, sy = 0, grid: Cell[] = [], balls: Ball[] = [], iter = 0, sign = 1, paint = false, t = 0, ptr: Ptr = null;
  const setup = (w: number, h: number) => {
    W = w; H = h; sx = Math.floor(w / STEP); sy = Math.floor(h / STEP);
    grid = [];
    for (let i = 0; i < (sx + 2) * (sy + 2); i++) grid[i] = cell((i % (sx + 2)) * STEP, Math.floor(i / (sx + 2)) * STEP);
    const wh = Math.min(w, h);
    balls = Array.from({ length: Math.max(8, Math.round(w / 110)) }, () => {
      const base = (wh / 13) * rnd(0.7, 1.3);
      return {
        vel: { x: (Math.random() > 0.5 ? 1 : -1) * rnd(0.2, 0.45), y: (Math.random() > 0.5 ? 1 : -1) * rnd(0.08, 0.5) },
        pos: cell(rnd(w * 0.05, w * 0.95), rnd(h * 0.3, h * 0.9)),
        size: base,
        base,
      };
    });
  };
  const force = (x: number, y: number, idx?: number) => {
    const id = idx || x + y * (sx + 2);
    let f: number;
    if (x === 0 || y === 0 || x === sx || y === sy) f = 0.6 * sign;
    else {
      f = 0;
      const c = grid[id];
      for (const b of balls) f += (b.size * b.size) / (-2 * c.x * b.pos.x - 2 * c.y * b.pos.y + b.pos.magnitude + c.magnitude);
      f *= sign;
    }
    grid[id].force = f;
    return f;
  };
  const march = (g: CanvasRenderingContext2D, [x, y, pdir]: [number, number, number | false]): [number, number, number | false] | false => {
    const S = sx + 2, id = x + y * S;
    if (grid[id].computed === iter) return false;
    let dir: number, ms = 0;
    for (let i = 0; i < 4; i++) {
      const idn = x + IX[i + 12] + (y + IX[i + 16]) * S;
      let f = grid[idn].force;
      if ((f > 0 && sign < 0) || (f < 0 && sign > 0) || !f) f = force(x + IX[i + 12], y + IX[i + 16], idn);
      if (Math.abs(f) > 1) ms += 2 ** i;
    }
    if (ms === 15) return [x, y - 1, false]; // inside: walk up to the edge
    if (ms === 5) dir = pdir === 2 ? 3 : 1;
    else if (ms === 10) dir = pdir === 3 ? 0 : 2;
    else { dir = MSCASES[ms]; grid[id].computed = iter; }
    const G = (k: number) => grid[x + PLX[4 * dir + k] + (y + PLY[4 * dir + k]) * S];
    const k = STEP / (Math.abs(Math.abs(G(2).force) - 1) / Math.abs(Math.abs(G(3).force) - 1) + 1);
    g.lineTo(G(0).x + IX[dir] * k, G(1).y + IX[dir + 4] * k);
    paint = true;
    return [x + IX[dir + 4], y + IX[dir + 8], dir];
  };
  return {
    move: (x, y) => { ptr = x === null ? null : { x, y }; },
    click: (w, h, x, y) => { ptr = { x, y }; },
    draw(g, w, h, dt) {
      if (W !== w || H !== h) setup(w, h);
      t += dt;
      const f = dt * 60;
      const inside = ptr && ptr.y > 0;
      const hx = inside ? ptr!.x : w * (0.5 + 0.8 * noise(t * 0.05, 2.2)), hy = inside ? ptr!.y : h * (0.9 + 0.08 * noise(5.1, t * 0.1));
      const R = Math.min(w, h) * 0.5;
      for (const b of balls) {
        const k = Math.max(0, 1 - Math.hypot(b.pos.x - hx, b.pos.y - hy) / R);
        b.size += (b.base * (1 + 0.7 * k) - b.size) * Math.min(1, dt * 1.5);
        b.vel.y = clamp(b.vel.y + (k > 0.15 ? -0.02 * k : 0.008) * f, -0.7, 0.7);
        b.vel.x = clamp(b.vel.x + noise(b.base, t * 0.3) * 0.01 * f, -0.4, 0.4);
        if (b.pos.x >= w - b.size) { if (b.vel.x > 0) b.vel.x = -b.vel.x; b.pos.x = w - b.size; }
        else if (b.pos.x <= b.size) { if (b.vel.x < 0) b.vel.x = -b.vel.x; b.pos.x = b.size; }
        if (b.pos.y >= h - b.size) { if (b.vel.y > 0) b.vel.y = -b.vel.y; b.pos.y = h - b.size; }
        else if (b.pos.y <= b.size) { if (b.vel.y < 0) b.vel.y = -b.vel.y; b.pos.y = b.size; }
        b.pos = cell(b.pos.x + b.vel.x * f, b.pos.y + b.vel.y * f);
      }
      const gr = g.createRadialGradient(hx, hy, 0, hx, hy, Math.max(w, h) * 0.6);
      HEAT_STOPS.forEach(([o, c]) => gr.addColorStop(o, c));
      iter++; sign = -sign; paint = false;
      g.fillStyle = gr;
      g.beginPath();
      for (const b of balls) {
        let next: ReturnType<typeof march> = [Math.round(b.pos.x / STEP), Math.round(b.pos.y / STEP), false], guard = 0;
        do { next = march(g, next); } while (next && ++guard < 20000);
        if (paint) { g.fill(); g.beginPath(); paint = false; }
      }
    },
  };
}

// ---- Cryo: frost creeping in from the bottom and the sides, like on a
// window: straight segments branching at 60 degrees, with short needles.
// Painted into a kept layer that fades in steps (so a frame only draws the
// new bits), over a frosted haze baked once. The pointer melts a patch.
function cryo(): Fx {
  const paint = canvas(), p = paint.getContext('2d')!, haze = canvas(), D = Math.min(2, window.devicePixelRatio || 1);
  type Front = { x: number; y: number; ang: number; len: number; gen: number; d: number; nextBranch: number };
  let fronts: Front[] = [], fadeT = 0, next = 0, ptr: Ptr = null, W = 0, H = 0;
  const bakeHaze = (w: number, h: number) => {
    haze.width = Math.round(w); haze.height = Math.round(h);
    const x = haze.getContext('2d')!, e = Math.min(w, h) * 0.35;
    for (const [x0, y0, x1, y1] of [[0, h, 0, h - e], [0, 0, e, 0], [w, 0, w - e, 0]]) {
      const gr = x.createLinearGradient(x0, y0, x1, y1);
      gr.addColorStop(0, 'rgba(255,255,255,0.22)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = gr;
      x.fillRect(0, 0, w, h);
    }
    x.fillStyle = '#fff';
    for (let i = 0; i < (w * h) / 40; i++) {
      const px = rnd(0, w), py = rnd(0, h);
      if (Math.random() > Math.min(px, w - px, h - py) / e) { x.globalAlpha = rnd(0.1, 0.45); x.fillRect(px, py, 1, 1); }
    }
  };
  const grow = (x: number, y: number, ang: number, len: number, gen: number) => fronts.push({ x, y, ang, len, gen, d: 0, nextBranch: rnd(6, 12) });
  const spawn = (w: number, h: number) => {
    const s = Math.random();
    if (s < 0.7) grow(rnd(0, w), h + 1, -Math.PI / 2 + rnd(-0.6, 0.6), h * rnd(0.15, 0.4), 0);
    else if (s < 0.85) grow(-1, rnd(h * 0.4, h), rnd(-0.6, 0.4), h * rnd(0.2, 0.45), 0);
    else grow(w + 1, rnd(h * 0.4, h), Math.PI + rnd(-0.4, 0.6), h * rnd(0.2, 0.45), 0);
  };
  return {
    move: (x, y) => { ptr = x === null ? null : { x, y }; },
    click: (w, h, x, y) => { for (let i = 0; i < 6; i++) grow(x, y, (i / 6) * TAU + rnd(-0.1, 0.1), rnd(25, 45), 1); },
    draw(g, w, h, dt) {
      if (W !== w || H !== h) { W = w; H = h; paint.width = Math.round(w * D); paint.height = Math.round(h * D); fronts = []; bakeHaze(w, h); }
      p.setTransform(D, 0, 0, D, 0, 0);
      p.lineCap = 'round';
      const cap = Math.round(w / 12);
      if ((next -= dt) <= 0 && fronts.length < cap) { next = rnd(0.12, 0.3) * (1200 / Math.max(600, w)); spawn(w, h); }
      p.strokeStyle = 'rgba(255,255,255,0.8)';
      p.beginPath();
      for (let i = fronts.length - 1; i >= 0; i--) {
        const f = fronts[i], v = (38 - f.gen * 6) * dt, x = f.x + Math.cos(f.ang) * v, y = f.y + Math.sin(f.ang) * v;
        p.moveTo(f.x, f.y); p.lineTo(x, y);
        f.x = x; f.y = y; f.d += v;
        if (f.d >= f.nextBranch) {
          f.nextBranch += rnd(5, 10);
          const side = Math.random() < 0.5 ? -1 : 1;
          if (f.gen < 3 && Math.random() < 0.35) grow(x, y, f.ang + (side * Math.PI) / 3, (f.len - f.d) * rnd(0.35, 0.6), f.gen + 1);
          else {
            const n = rnd(2, 5) * (1 - f.d / f.len) + 1; // needles
            for (const s of [-1, 1]) { const a = f.ang + (s * Math.PI) / 3; p.moveTo(x, y); p.lineTo(x + Math.cos(a) * n, y + Math.sin(a) * n); }
          }
        }
        if (f.d >= f.len) fronts.splice(i, 1);
      }
      p.lineWidth = 0.8;
      p.stroke();
      p.globalCompositeOperation = 'destination-out';
      if (ptr) {
        const gr = p.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 45);
        gr.addColorStop(0, 'rgba(0,0,0,0.35)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        p.fillStyle = gr;
        p.fillRect(ptr.x - 45, ptr.y - 45, 90, 90);
      }
      if ((fadeT += dt) > 1) { fadeT = 0; p.fillStyle = 'rgba(0,0,0,0.12)'; p.fillRect(0, 0, w, h); } // steps: small ones stall on 8-bit alpha
      p.globalCompositeOperation = 'source-over';
      g.drawImage(haze, 0, 0, w, h);
      g.drawImage(paint, 0, 0, w, h);
    },
  };
}

// ---- Aero: the eye of a storm seen from above. Streaks orbit a calm eye
// (faster near the eye wall) and spiral slowly inward; brightness follows
// two turning spiral arms and peaks on the eye wall. The eye wanders and
// leans toward the pointer; a click sends a gust.
function aero(): Fx {
  const BANDS = 4;
  type P = { r: number; th: number; L: number; sp: number };
  let ps: P[] = [], t = 0, cx = 0, cy = 0, ptr: Ptr = null, gust = 0, W = 0, H = 0;
  const born = (R: number, r0: number, far: boolean): P => ({ r: far ? R * rnd(0.75, 1) : rnd(r0 * 1.1, R), th: rnd(0, TAU), L: rnd(14, 40), sp: rnd(0.8, 1.2) });
  return {
    move: (x, y) => { ptr = x === null ? null : { x, y }; },
    click: () => { gust = 1; },
    draw(g, w, h, dt) {
      t += dt;
      const r0 = Math.min(w, h) * 0.09, R = Math.hypot(w, h) * 0.55;
      if (W !== w || H !== h) { W = w; H = h; cx = w / 2; cy = h * 0.65; ps = Array.from({ length: Math.round(w / 3.2) }, () => born(R, r0, false)); }
      const inside = ptr && ptr.y > 0;
      const tx = inside ? ptr!.x : w * (0.5 + 0.3 * noise(t * 0.05, 1.7)), ty = inside ? ptr!.y : h * (0.65 + 0.15 * noise(3.3, t * 0.05));
      cx += (tx - cx) * Math.min(1, dt * 0.8);
      cy += (ty - cy) * Math.min(1, dt * 0.8);
      gust *= Math.pow(0.3, dt);
      const paths = Array.from({ length: BANDS }, () => new Path2D());
      for (const p of ps) {
        const v = 90 * p.sp * Math.sqrt(r0 / p.r) * (1 + 2.5 * gust) + 25;
        p.th += (v / p.r) * dt;
        p.r -= (6 + 40 * (r0 / p.r)) * dt;
        if (p.r < r0 * 1.15) Object.assign(p, born(R, r0, true));
        const arms = 0.5 + 0.5 * Math.cos(2 * p.th - 2.2 * Math.log(p.r / r0) - t * 0.4), wall = Math.exp(-(((p.r - r0 * 1.5) / (r0 * 0.5)) ** 2));
        const b = Math.min(1, 0.04 + 0.9 * arms ** 3 + 0.8 * wall), a1 = p.th, a0 = p.th - p.L / p.r;
        const pa = paths[Math.min(BANDS - 1, (b * BANDS) | 0)];
        pa.moveTo(cx + Math.cos(a0) * p.r, cy + Math.sin(a0) * p.r);
        pa.arc(cx, cy, p.r, a0, a1);
      }
      g.lineCap = 'round';
      paths.forEach((pa, i) => { g.strokeStyle = `rgba(255,255,255,${0.3 + (0.7 * (i + 1)) / BANDS})`; g.lineWidth = 0.8 + i * 0.45; g.stroke(pa); });
    },
  };
}

// ---- Flora: roots and vines growing up from the seabed, swaying around
// their base (eased swings within a few degrees, as the Kodama pen's), and
// thick roots coming in from both sides in three depth layers that shift
// with the pointer. The pointer also nudges the thin ones aside.
type Stroke = { x: number; y: number; pts: [number, number][]; w: number; amp: number; slow: number; a: number; from: number; to: number; t0: number; dur: number; push: number; len: number };
type Thick = { path: Path2D; depth: number };
// A tapering ribbon along a cubic curve, as one closed path.
function ribbon(p0: number[], p1: number[], p2: number[], p3: number[], w0: number, path: Path2D) {
  const at = (t: number, i: number) => (1 - t) ** 3 * p0[i] + 3 * (1 - t) ** 2 * t * p1[i] + 3 * (1 - t) * t * t * p2[i] + t ** 3 * p3[i];
  const left: number[][] = [], right: number[][] = [], N = 28;
  for (let k = 0; k <= N; k++) {
    const t = k / N, x = at(t, 0), y = at(t, 1), e = 0.001, dx = at(Math.min(1, t + e), 0) - at(Math.max(0, t - e), 0), dy = at(Math.min(1, t + e), 1) - at(Math.max(0, t - e), 1);
    const l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, half = (w0 * (1 - t) ** 0.9 + 1.2) / 2 * (1 + 0.12 * Math.sin(t * 17));
    left.push([x + nx * half, y + ny * half]);
    right.push([x - nx * half, y - ny * half]);
  }
  path.moveTo(left[0][0], left[0][1]);
  for (const [x, y] of left) path.lineTo(x, y);
  for (const [x, y] of right.reverse()) path.lineTo(x, y);
  path.closePath();
  return (t: number) => [at(t, 0), at(t, 1)];
}
function flora(): Fx {
  let items: Stroke[] = [], thick: Thick[] = [], t = 0, ptr: Ptr = null, W = 0, H = 0, px = 0, py = 0;
  const add = (x: number, y: number, pts: [number, number][], w: number, amp: number, slow: number) => {
    const a = rnd(-amp, amp) * DEG;
    items.push({ x, y, pts, w, amp, slow, a, from: a, to: rnd(-amp, amp) * DEG, t0: 0, dur: rnd(3, 5) * slow, push: 0, len: pts[pts.length - 1][1] });
  };
  const setup = (w: number, h: number) => {
    items = []; thick = [];
    const n = Math.max(3, Math.round(w / 110));
    for (let c = 0; c < n; c++) {
      const cx = (c + 0.5 + rnd(-0.3, 0.3)) * (w / n), base = h + rnd(-h * 0.03, 12), L = h * rnd(0.25, 0.45);
      for (let r = 0; r < 4; r++) {
        const hook = (Math.random() < 0.5 ? -1 : 1) * rnd(6, 16), ph = rnd(0, TAU), len = L * rnd(0.75, 1), pts: [number, number][] = [];
        for (let y = 0; y <= len; y += 8) { const k = Math.min(1, y / 22); pts.push([hook * Math.sin((k * Math.PI) / 2) + Math.sin(y * 0.045 + ph) * 3 + noise(c * 7 + r, y * 0.02) * 6, y]); }
        add(cx + rnd(-10, 10), base - (r % 2) * rnd(4, 14), pts, r % 2 ? 0.6 : 1.6, 5, 1);
      }
    }
    const m = Math.max(2, Math.round(w / 220));
    for (let v = 0; v < m; v++) {
      const vx = (v + 0.5 + rnd(-0.35, 0.35)) * (w / m), side = Math.random() < 0.5 ? -1 : 1, len = h * rnd(0.55, 0.8), ph = rnd(0, TAU);
      for (const [wd, off] of [[2.4, 0], [0.9, rnd(1.5, 3)]]) {
        const pts: [number, number][] = [];
        for (let y = 0; y <= len; y += 10) { const k = Math.min(1, y / 50); pts.push([side * 30 * (1 - Math.sin((k * Math.PI) / 2)) + off + Math.sin(y * 0.012 + ph) * 5 + noise(v * 13 + off, y * 0.01) * 8, y]); }
        add(vx, h + 6, pts, wd, 2.5, 1.6);
      }
    }
    // thick roots: from each side, curving inward and up, one per depth layer, with an offshoot
    for (let depth = 0; depth < 3; depth++) {
      for (const s of [-1, 1]) {
        const path = new Path2D(), X = (x: number) => (s < 0 ? x : w - x);
        const y0 = h * rnd(0.82, 1.02), reach = w * rnd(0.16, 0.3) * (0.8 + depth * 0.15), top = h * rnd(0.12, 0.4), W0 = 18 + depth * 12;
        const at = ribbon([X(-30), y0], [X(reach * 0.55), y0 - h * rnd(0, 0.1)], [X(reach * 0.9), top + h * 0.25], [X(reach * rnd(0.85, 1.1)), top], W0, path);
        const [bx, by] = at(rnd(0.3, 0.5));
        ribbon([bx, by], [bx + s * -w * 0.04, by - h * 0.1], [bx + s * -w * 0.02, by - h * 0.22], [bx + s * -w * rnd(0.02, 0.07), by - h * rnd(0.25, 0.35)], W0 * 0.45, path);
        thick.push({ path, depth });
      }
    }
  };
  return {
    move: (x, y) => { ptr = x === null ? null : { x, y }; },
    draw(g, w, h, dt) {
      t += dt;
      if (W !== w || H !== h) { W = w; H = h; setup(w, h); }
      // parallax target from the pointer's place on screen, eased
      const tx = ptr ? ptr.x / w - 0.5 : 0, ty = ptr ? clamp(ptr.y / h, 0, 1) - 0.5 : 0;
      px += (tx - px) * Math.min(1, dt * 2);
      py += (ty - py) * Math.min(1, dt * 2);
      for (const r of thick) {
        const par = 8 + r.depth * 14;
        g.save();
        g.translate(-px * par, -py * par * 0.5);
        g.fillStyle = `rgba(255,255,255,${0.07 + r.depth * 0.05})`;
        g.fill(r.path);
        g.restore();
      }
      const P2: Record<number, Path2D> = { 2.4: new Path2D(), 1.6: new Path2D(), 0.9: new Path2D(), 0.6: new Path2D() };
      for (const r of items) {
        let k = (t - r.t0) / r.dur;
        if (k >= 1) { r.from = r.to; r.to = rnd(-r.amp, r.amp) * DEG; r.t0 = t; r.dur = rnd(3, 5) * r.slow; k = 0; }
        let target = 0;
        if (ptr && ptr.y < r.y && ptr.y > r.y - r.len) { const dx = r.x - ptr.x, d = Math.abs(dx); if (d < 70) target = Math.sign(dx || 1) * (1 - d / 70) * 9 * DEG; }
        r.push += (target - r.push) * Math.min(1, dt * 3);
        r.a = r.from + (r.to - r.from) * easeInOut(k) - r.push;
        const cs = Math.cos(r.a), sn = Math.sin(r.a), pa = P2[r.w], P = r.pts.map(([x, y]) => [r.x + x * cs + y * sn, r.y + x * sn - y * cs]);
        pa.moveTo(P[0][0], P[0][1]);
        for (let i = 1; i < P.length - 1; i++) pa.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2);
        const e = P[P.length - 1];
        pa.lineTo(e[0], e[1]);
      }
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (const [wd, al] of [[2.4, 0.8], [1.6, 0.75], [0.9, 0.55], [0.6, 0.5]]) { g.strokeStyle = `rgba(255,255,255,${al})`; g.lineWidth = wd; g.stroke(P2[wd]); }
    },
  };
}

// ---- Aqua: currents. A flock in 3D (particles of four kinds push apart,
// match the velocity of close neighbours of their own kind, and stay in a
// soft ball; now and then one kind twists), drawn as short lines bent
// along their turn, stretched over the whole box.
function aqua(w0: number): Fx {
  const N = Math.round(Math.min(240, Math.max(140, w0 / 6))), hen = 0.16, nen = 0.2;
  type B = { typ: number; x: number; y: number; z: number; rx: number; ry: number; rz: number; rrx: number; rry: number; rrz: number; sx: number | null; sy: number; fx: number; fy: number; lx: number; ly: number; zz: number };
  const bol: B[] = Array.from({ length: N }, (_, a) => ({ typ: a % 4, x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(-1, 1), rx: 0, ry: 0, rz: 0, rrx: 0, rry: 0, rrz: 0, sx: null, sy: 0, fx: 0, fy: 0, lx: 0, ly: 0, zz: 1 }));
  let acc = 0, push: Ptr = null;
  const step = (size: number) => {
    const ban = Math.random() < 0.005 ? (Math.random() * 5) | 0 : -1;
    for (const b of bol) b.rrx = b.rry = b.rrz = 0;
    for (let a = 0; a < N; a++) {
      const b = bol[a];
      for (let c = a + 1; c < N; c++) {
        const d = bol[c];
        let x = b.x - d.x, y = b.y - d.y, z = b.z - d.z;
        const f = b.typ !== d.typ ? hen * 2 : hen;
        if (Math.abs(x) > f || Math.abs(y) > f || Math.abs(z) > f) continue;
        let e = Math.sqrt(x * x + y * y + z * z);
        if (e >= f) continue;
        e = (f - e) / f; x *= e; y *= e; z *= e;
        b.rx += x; b.ry += y; b.rz += z; d.rx -= x; d.ry -= y; d.rz -= z;
        if (b.typ !== d.typ) continue;
        const k = e * nen;
        b.rrx += d.rx * k; b.rry += d.ry * k; b.rrz += d.ry * k; d.rrx += b.rx * k; d.rry += b.ry * k; d.rrz += b.ry * k;
      }
    }
    for (const b of bol) {
      b.rx += b.rrx; b.ry += b.rry; b.rz += b.rrz;
      if (push && b.sx !== null) { const x = b.sx - push.x, y = b.sy - push.y; if (x * x + y * y < (size * 0.48) ** 2) { b.rx += (x / size) * 0.175; b.ry += (y / size) * 0.175; } }
      let c = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
      const d = 7 / (c + 6);
      b.x *= d; b.y *= d; b.z *= d;
      c = (c * c * c * c) / 1000;
      b.rx -= b.x * c; b.ry -= b.y * c; b.rz -= b.z * c;
      c = Math.sqrt(b.rx * b.rx + b.ry * b.ry + b.rz * b.rz);
      if (c > 0.3) { const m = Math.pow(0.5, (c - 0.3) / 0.3); b.rx *= m; b.ry *= m; b.rz *= m; }
      b.x += b.rx; b.y += b.ry; b.z += b.rz;
      if (b.typ === ban - 1) { const s = b.rx; b.rx = b.ry; b.ry = b.rz; b.rz = s; }
    }
    push = null;
  };
  return {
    click: (w, h, x, y) => { push = { x, y }; },
    draw(g, w, h, dt) {
      const size = Math.max(w, h) / 2, cx = w / 2, cy = h * 0.6;
      for (acc += dt; acc >= 1 / 60; acc -= 1 / 60) {
        step(size);
        for (const b of bol) {
          const z = Math.pow(2, b.z), x = cx + b.x * z * w * 0.42, y = cy + b.y * z * h * 0.42;
          if (b.sx !== null) { const dx = x - b.sx, dy = y - b.sy; b.fx += (dx - b.fx) * 0.35; b.fy += (dy - b.fy) * 0.35; b.lx += (dx - b.lx) * 0.1; b.ly += (dy - b.ly) * 0.1; }
          b.zz = z; b.sx = x; b.sy = y;
        }
      }
      g.lineCap = 'round';
      for (const [lo, hi, lw, al] of [[0, 0.8, 0.6, 0.3], [0.8, 1.3, 1, 0.55], [1.3, 9, 1.5, 0.85]]) {
        g.beginPath();
        for (const b of bol) {
          if (b.zz < lo || b.zz >= hi || b.sx === null) continue;
          g.moveTo(b.sx, b.sy);
          g.quadraticCurveTo(b.sx - 1.75 * (b.fx + b.lx), b.sy - 1.75 * (b.fy + b.ly), b.sx - 7 * b.lx, b.sy - 7 * b.ly);
        }
        g.lineWidth = lw;
        g.strokeStyle = `rgba(255,255,255,${al})`;
        g.stroke();
      }
    },
  };
}

// ---- Gaia: a sea of stars. Three depth layers drifting up at their own
// speed, shifted by the pointer for parallax; each star twinkles on its own
// clock and lights up near the pointer; now and then a shooting star.
function gaia(): Fx {
  const LAYERS = [{ n: 800, s: 1.2, v: 6, par: 4 }, { n: 240, s: 2, v: 3, par: 10 }, { n: 90, s: 2.8, v: 2, par: 18 }]; // per million px
  const BANDS = 5;
  type Star = { x: number; y: number; ph: number; sp: number; lit: number };
  type Shoot = { x: number; y: number; ang: number; v: number; age: number };
  let stars: Star[][] = [], shoot: Shoot[] = [], next = 2, t = 0, ptr: Ptr = null, px = 0, py = 0, W = 0, H = 0;
  return {
    move: (x, y) => { ptr = x === null ? null : { x, y }; },
    click: (w, h, x, y) => { shoot.push({ x, y, ang: rnd(0.25, 0.6), v: rnd(380, 520), age: 0 }); },
    draw(g, w, h, dt) {
      t += dt;
      if (W !== w || H !== h) { W = w; H = h; const k = (w * h) / 1e6; stars = LAYERS.map(L => Array.from({ length: Math.round(L.n * k) }, () => ({ x: rnd(0, w), y: rnd(0, h), ph: rnd(0, TAU), sp: rnd(0.6, 2.2), lit: 0 }))); }
      const tx = ptr ? (ptr.x / w - 0.5) * 2 : 0, ty = ptr ? (clamp(ptr.y / h, 0, 1) - 0.5) * 2 : 0;
      px += (tx - px) * Math.min(1, dt * 3);
      py += (ty - py) * Math.min(1, dt * 3);
      const c3 = themeRgb().c3;
      LAYERS.forEach((L, li) => {
        const paths = Array.from({ length: BANDS }, () => new Path2D()), ox = -px * L.par, oy = -py * L.par;
        for (const s of stars[li]) {
          s.y -= L.v * dt;
          if (s.y < 0) s.y += h;
          const x = (((s.x + ox) % w) + w) % w, y = (((s.y + oy) % h) + h) % h;
          if (ptr) { const d2 = (x - ptr.x) ** 2 + (y - ptr.y) ** 2; if (d2 < 3600) s.lit = Math.max(s.lit, 1 - d2 / 3600); }
          s.lit *= Math.pow(0.25, dt);
          const tw = 0.55 + 0.45 * Math.sin(t * s.sp + s.ph), b = Math.min(1, tw * (0.65 + 0.15 * li) + s.lit), size = L.s * (1 + s.lit * 1.5);
          const pa = paths[Math.min(BANDS - 1, (b * BANDS) | 0)];
          if (size < 1.5) pa.rect(x - size / 2, y - size / 2, size, size);
          else { pa.moveTo(x + size / 2, y); pa.arc(x, y, size / 2, 0, TAU); }
        }
        paths.forEach((pa, i) => { g.fillStyle = `rgba(${c3}, ${(i + 1) / BANDS})`; g.fill(pa); });
      });
      if ((next -= dt) <= 0) { next = rnd(2.5, 5); shoot.push({ x: rnd(-0.1, 0.8) * w, y: rnd(0.2, 0.6) * h, ang: rnd(0.25, 0.6), v: rnd(380, 520), age: 0 }); }
      shoot = shoot.filter(s => (s.age += dt) < 0.9);
      g.lineCap = 'round';
      for (const s of shoot) {
        const k = s.age / 0.9, d = s.v * s.age, hx = s.x + Math.cos(s.ang) * d, hy = s.y + Math.sin(s.ang) * d, L = 90 * (1 - k * 0.5);
        const ex = hx - Math.cos(s.ang) * L, ey = hy - Math.sin(s.ang) * L, gr = g.createLinearGradient(hx, hy, ex, ey);
        gr.addColorStop(0, `rgba(255,255,255,${1 - k})`);
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.strokeStyle = gr;
        g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.stroke();
      }
    },
  };
}

// One factory per element, and how strongly each shows, so filled effects
// (Pyra) and sparse line ones end up at about the same visual weight.
export const OCEAN_FX: Record<string, { make: (w: number) => Fx; gain: number }> = {
  aqua: { make: aqua, gain: 1 },
  pyra: { make: pyra, gain: 0.55 },
  cryo: { make: cryo, gain: 0.85 },
  volta: { make: volta, gain: 1 },
  aero: { make: aero, gain: 1 },
  gaia: { make: gaia, gain: 1 },
  flora: { make: flora, gain: 0.85 },
};
