// The background effect for each element, drawn on the screen-sized canvas
// behind the ocean (OceanFx.tsx). Ported from lab/ocean-effects.html, where
// each one was tried out on its own; the comments there say which reference
// pen each one comes from. Every effect draws in the screen box (w x h,
// origin top left) and takes the pointer in the same coordinates. `floor`
// is where the seabed (the end of the page) is in that box: below the
// screen until you scroll down to it. Things that grow on the seabed hang
// off it; the rest fills the screen.

import { themeRgb } from './theme';

export interface Fx {
  // Elements the effect keeps itself, shown behind what it draws: parts that
  // stay the same and only move, which the compositor places without them
  // being drawn again (see sprite()).
  els?: HTMLElement[];
  draw(g: CanvasRenderingContext2D, w: number, h: number, dt: number, floor: number): void;
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

// A canvas shown as it is, one pixel per CSS pixel, which the compositor
// moves: at() puts its top left at (x, y) in the screen box, or hides it
// (null). Only touches the style when something changed.
function sprite(moving = true) {
  const c = canvas(), g = c.getContext('2d')!;
  c.style.cssText = `position:absolute;left:0;top:0;display:none${moving ? ';will-change:transform' : ''}`;
  let last = 'none';
  return {
    c, g,
    size(w: number, h: number) {
      c.width = Math.round(w); c.height = Math.round(h);
      c.style.width = `${c.width}px`; c.style.height = `${c.height}px`;
    },
    at(x: number, y: number | null) {
      const v = y === null ? 'none' : `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;
      if (v === last) return;
      if (y === null) c.style.display = 'none';
      else { if (last === 'none') c.style.display = ''; c.style.transform = v; }
      last = v;
    },
  };
}

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
      const Q = 4, ow = Math.ceil(w / Q), oh = Math.ceil(h / Q); // soft glow: a quarter of the resolution is enough (its layer is that size too)
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
    draw(g, w, h, dt, floor) {
      if (W !== w || H !== h) setup(w, h);
      t += dt;
      const f = dt * 60;
      const inside = ptr && ptr.y > 0;
      const hx = inside ? ptr!.x : w * (0.5 + 0.8 * noise(t * 0.05, 2.2)), hy = inside ? ptr!.y : Math.min(floor, h) - h * (0.1 - 0.08 * noise(5.1, t * 0.1));
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
// Painted into kept layers that fade in steps (so a frame only draws the new
// bits), over a frosted haze baked once. Two of each: what grows on the
// seabed belongs to the page (its layer covers the last screen and is drawn
// at the seabed, so it scrolls with it and nothing is lost), what grows from
// the sides higher up stays with the screen. The pointer melts a patch.
function cryo(): Fx {
  type Front = { x: number; y: number; ang: number; len: number; gen: number; d: number; nextBranch: number };
  type Pane = ReturnType<typeof sprite> & { fronts: Front[] };
  const bed: Pane = { ...sprite(), fronts: [] }, side: Pane = { ...sprite(false), fronts: [] }; // bed: y from 0 (one screen above the seabed) to h (the seabed)
  // the frosted haze in two parts: the sides stay with the screen, the bottom band sits on the seabed
  const sides = sprite(false), bottom = sprite();
  let fadeT = 0, next = 0, ptr: Ptr = null, W = 0, H = 0, fl = 0, band = 0;
  const bakeHaze = (w: number, h: number) => {
    const e = Math.min(w, h) * 0.35;
    band = Math.round(e);
    sides.size(w, h);
    bottom.size(w, band);
    const s = sides.g, b = bottom.g;
    for (const [x0, x1] of [[0, e], [w, w - e]]) {
      const gr = s.createLinearGradient(x0, 0, x1, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0.22)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      s.fillStyle = gr;
      s.fillRect(0, 0, w, h);
    }
    const gb = b.createLinearGradient(0, band, 0, 0);
    gb.addColorStop(0, 'rgba(255,255,255,0.22)');
    gb.addColorStop(1, 'rgba(255,255,255,0)');
    b.fillStyle = gb;
    b.fillRect(0, 0, w, band);
    // fine speckle, denser toward each edge, written straight into the pixels
    const speckle = (x: CanvasRenderingContext2D, W: number, Hh: number, n: number, weight: (px: number, py: number) => number) => {
      const img = x.getImageData(0, 0, W, Hh), d = img.data;
      for (let i = 0; i < n; i++) {
        const px = Math.floor(Math.random() * W), py = Math.floor(Math.random() * Hh);
        if (Math.random() <= weight(px, py)) continue;
        const o = (py * W + px) * 4, a = rnd(0.1, 0.45);
        d[o] = d[o + 1] = d[o + 2] = 255;
        d[o + 3] = Math.min(255, d[o + 3] + a * 255);
      }
      x.putImageData(img, 0, 0);
    };
    speckle(s, sides.c.width, sides.c.height, (w * h) / 60, px => Math.min(px, w - px) / e);
    speckle(b, bottom.c.width, band, (w * band) / 40, (px, py) => (band - py) / e);
  };

  const grow = (pn: Pane, x: number, y: number, ang: number, len: number, gen: number) => pn.fronts.push({ x, y, ang, len, gen, d: 0, nextBranch: rnd(6, 12) });
  // from the seabed and the sides just above it when it is in view, else from the sides of the screen
  const spawn = (w: number, h: number, floor: number) => {
    const s = Math.random(), near = floor < h + 40, pn = near ? bed : side, y = () => (near ? h * rnd(0.35, 1) : h * rnd(0.2, 1));
    if (s < 0.7 && near) grow(bed, rnd(0, w), h + 1, -Math.PI / 2 + rnd(-0.6, 0.6), h * rnd(0.15, 0.4), 0);
    else if (s < 0.85) grow(pn, -1, y(), rnd(-0.6, 0.4), h * rnd(0.2, 0.45), 0);
    else grow(pn, w + 1, y(), Math.PI + rnd(-0.4, 0.6), h * rnd(0.2, 0.45), 0);
  };
  const step = (pn: Pane, w: number, h: number, dt: number, mx: number | null, my: number) => {
    const p = pn.g, fronts = pn.fronts;
    if (fronts.length) {
      p.lineCap = 'round';
      p.strokeStyle = 'rgba(255,255,255,0.8)';
      p.beginPath();
      for (let i = fronts.length - 1; i >= 0; i--) {
        const f = fronts[i], v = (38 - f.gen * 6) * dt, x = f.x + Math.cos(f.ang) * v, y = f.y + Math.sin(f.ang) * v;
        p.moveTo(f.x, f.y); p.lineTo(x, y);
        f.x = x; f.y = y; f.d += v;
        if (f.d >= f.nextBranch) {
          f.nextBranch += rnd(5, 10);
          const sd = Math.random() < 0.5 ? -1 : 1;
          if (f.gen < 3 && Math.random() < 0.35) grow(pn, x, y, f.ang + (sd * Math.PI) / 3, (f.len - f.d) * rnd(0.35, 0.6), f.gen + 1);
          else {
            const n = rnd(2, 5) * (1 - f.d / f.len) + 1; // needles
            for (const k of [-1, 1]) { const a = f.ang + (k * Math.PI) / 3; p.moveTo(x, y); p.lineTo(x + Math.cos(a) * n, y + Math.sin(a) * n); }
          }
        }
        if (f.d >= f.len) fronts.splice(i, 1);
      }
      p.lineWidth = 0.8;
      p.stroke();
    }
    p.globalCompositeOperation = 'destination-out';
    if (mx !== null && my > -45 && my < h + 45) {
      const gr = p.createRadialGradient(mx, my, 0, mx, my, 45);
      gr.addColorStop(0, 'rgba(0,0,0,0.35)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      p.fillStyle = gr;
      p.fillRect(mx - 45, my - 45, 90, 90);
    }
    if (fadeT > 1) { p.fillStyle = 'rgba(0,0,0,0.12)'; p.fillRect(0, 0, w, h); } // steps: small ones stall on 8-bit alpha
    p.globalCompositeOperation = 'source-over';
  };
  return {
    els: [sides.c, side.c, bottom.c, bed.c],
    move: (x, y) => { ptr = x === null ? null : { x, y }; },
    click: (w, h, x, y) => {
      const onBed = y > fl - h, pn = onBed ? bed : side, yy = onBed ? y - (fl - h) : y;
      for (let i = 0; i < 6; i++) grow(pn, x, yy, (i / 6) * TAU + rnd(-0.1, 0.1), rnd(25, 45), 1);
    },
    draw(g, w, h, dt, floor) {
      fl = floor;
      if (W !== w || H !== h) {
        W = w; H = h;
        for (const pn of [bed, side]) { pn.size(w, h); pn.fronts = []; }
        bakeHaze(w, h);
      }
      const cap = Math.round(w / 12);
      if ((next -= dt) <= 0 && bed.fronts.length + side.fronts.length < cap) { next = rnd(0.12, 0.3) * (1200 / Math.max(600, w)); spawn(w, h, floor); }
      fadeT += dt;
      const top = floor - h; // where the bed pane sits on screen
      step(bed, w, h, dt, ptr && ptr.x, ptr ? ptr.y - top : 0);
      step(side, w, h, dt, ptr && ptr.x, ptr ? ptr.y : 0);
      if (fadeT > 1) fadeT = 0;
      if (g.canvas.width === 1) return; // running ahead (OceanFx.tsx): nothing to show
      sides.at(0, 0);
      side.at(0, 0);
      const seen = top < h;
      bottom.at(0, seen ? floor - band : null); // hugs the seabed
      bed.at(0, seen ? top : null);
    },
  };
}

// ---- Air: wind on the seabed. Gusts roll from left to right (a scrolled
// noise sets how hard it blows at each x): the grass leans with them, a few
// taller plants rock and their fronds flutter harder in a gust, and a handful
// of cyclone icons are carried along, turning toward where they go and
// spinning a little, with a faint wake. The pointer pushes the icons and
// parts the grass; a click sends a strong gust across.
let cycloneArt: HTMLCanvasElement | null = null;
function cyclone() {
  if (cycloneArt) return cycloneArt;
  const c = canvas(), img = new Image();
  c.width = c.height = 96;
  img.onload = () => { const x = c.getContext('2d')!; x.drawImage(img, 0, 0, 96, 96); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, 96, 96); };
  img.src = '/aero.png';
  return (cycloneArt = c);
}
function aero(): Fx {
  type Icon = { x: number; y: number; s: number; a: number; spin: number; ph: number; vx: number; vy: number; hx: number[]; hy: number[] };
  type Blade = { x: number; len: number; wb: number; ph: number };
  type Plant = { x: number; len: number; ph: number; fl: number[] };
  let icons: Icon[] = [], blades: Blade[][] = [], plants: Plant[] = [], t = 0, W = 0, H = 0, ptr: Ptr = null, burst = 0, bt = -9;
  const art = cyclone();
  const gust = (x: number, y: number) => Math.max(0, 0.35 + 0.75 * noise(x * 0.003 - t * 0.5, y * 0.002 + t * 0.05) + burst * Math.exp(-(((x - (t - bt) * 650 + 100) / 160) ** 2)));
  const born = (w: number, h: number, anywhere: boolean): Icon => ({ x: anywhere ? rnd(0, w) : rnd(-80, -30), y: rnd(h * 0.1, h * 0.9), s: rnd(16, 34), a: 0, spin: rnd(-1, 1), ph: rnd(0, TAU), vx: 0, vy: 0, hx: [], hy: [] });
  const setup = (w: number, h: number) => {
    icons = Array.from({ length: Math.max(5, Math.round(w / 170)) }, () => born(w, h, true));
    blades = [0, 1].map(layer => Array.from({ length: Math.round(w / (layer ? 11 : 16)) }, () => ({ x: rnd(-10, w + 10), len: rnd(h * 0.04, h * (layer ? 0.12 : 0.16)), wb: rnd(1.2, 2.6), ph: rnd(0, TAU) })));
    const n = Math.max(3, Math.round(w / 300));
    plants = Array.from({ length: n }, (_, i) => ({ x: ((i + 0.5 + rnd(-0.3, 0.3)) / n) * w, len: h * rnd(0.22, 0.34), ph: rnd(0, TAU), fl: Array.from({ length: 7 }, () => rnd(0.24, 0.32)) }));
  };
  return {
    move: (x, y) => { ptr = x === null ? null : { x, y }; },
    click: () => { burst = 1.3; bt = t; },
    draw(g, w, h, dt, floor) {
      t += dt;
      if (W !== w || H !== h) { W = w; H = h; setup(w, h); }
      burst *= Math.pow(0.5, dt);
      // cyclones carried by the wind
      const wake = new Path2D();
      for (const ic of icons) {
        const k = gust(ic.x, ic.y);
        let vx = 50 + 230 * k, vy = 30 * Math.sin(t * 0.7 + ic.ph) + 40 * noise(ic.x * 0.003, t * 0.1 + ic.ph);
        if (ptr) { const dx = ic.x - ptr.x, dy = ic.y - ptr.y, d = Math.hypot(dx, dy); if (d < 140 && d > 1) { const f = (1 - d / 140) ** 2 * 500; vx += (dx / d) * f; vy += (dy / d) * f; } }
        ic.vx += (vx - ic.vx) * Math.min(1, dt * 2.5);
        ic.vy += (vy - ic.vy) * Math.min(1, dt * 2.5);
        ic.x += ic.vx * dt; ic.y += ic.vy * dt;
        ic.a += (ic.spin * 0.6 + ic.vx * 0.004) * dt;
        if (ic.x > w + 60 || ic.y < -60 || ic.y > h + 60) { Object.assign(ic, born(w, h, false)); continue; }
        ic.hx.unshift(ic.x); ic.hy.unshift(ic.y);
        if (ic.hx.length > 10) { ic.hx.pop(); ic.hy.pop(); }
        if (ic.hx.length > 3) { wake.moveTo(ic.hx[2], ic.hy[2]); for (let i = 3; i < ic.hx.length; i++) wake.lineTo(ic.hx[i], ic.hy[i]); }
      }
      g.lineCap = 'round';
      g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1.2; g.stroke(wake);
      for (const ic of icons) {
        const lean = Math.atan2(ic.vy, Math.max(1, ic.vx)) * 0.6; // turned toward where it goes
        g.save();
        g.globalAlpha = 0.45 + 0.35 * ((ic.s - 16) / 18);
        g.translate(ic.x, ic.y);
        g.rotate(lean + 0.25 * Math.sin(ic.a));
        g.drawImage(art, -ic.s / 2, -ic.s / 2, ic.s, ic.s);
        g.restore();
      }
      if (floor > h + h * 0.4) return; // the seabed is not near the screen yet
      // a few taller plants: a trunk rocking with the wind where it stands, fronds fluttering harder in a gust
      const trunks = new Path2D(), fronds = new Path2D();
      for (const p of plants) {
        const k = gust(p.x, floor), rock = 0.1 + 0.2 * k + 0.04 * Math.sin(t * 2.2 + p.ph);
        const tx = p.x + Math.sin(rock) * p.len, ty = floor - Math.cos(rock) * p.len;
        trunks.moveTo(p.x, floor + 4);
        trunks.quadraticCurveTo(p.x + Math.sin(rock * 0.4) * p.len * 0.5, floor - p.len * 0.55, tx, ty);
        p.fl.forEach((f, i) => {
          const base = (i / (p.fl.length - 1) - 0.5) * 2.4 + rock * 1.5, flap = Math.sin(t * (6 + 14 * k) + i * 1.7 + p.ph) * 0.12 * (0.4 + k), a = -Math.PI / 2 + base + flap + k * 0.5;
          const L = p.len * f, ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L + L * 0.35;
          fronds.moveTo(tx, ty);
          fronds.quadraticCurveTo(tx + Math.cos(a) * L * 0.5, ty + Math.sin(a) * L * 0.5 - L * 0.12, ex, ey);
        });
      }
      g.lineJoin = 'round';
      g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.lineWidth = 2.2; g.stroke(trunks);
      g.lineWidth = 1.2; g.stroke(fronds);
      // grass, leaning with the gust where it stands
      blades.forEach((layer, li) => {
        const pa = new Path2D();
        for (const b of layer) {
          const k = gust(b.x, floor);
          let lean = 0.15 + 0.55 * k + 0.05 * Math.sin(t * 7 + b.ph) * k;
          if (ptr && Math.abs(ptr.x - b.x) < 60 && ptr.y > floor - b.len * 1.5) lean += Math.sign(b.x - ptr.x || 1) * (1 - Math.abs(ptr.x - b.x) / 60) * 0.6;
          const a = lean * 1.25, tx = b.x + Math.sin(a) * b.len, ty = floor + 2 - Math.cos(a) * b.len, cx = b.x + Math.sin(a * 0.45) * b.len * 0.55, cy = floor + 2 - b.len * 0.6;
          pa.moveTo(b.x - b.wb, floor + 2);
          pa.quadraticCurveTo(cx - b.wb * 0.5, cy, tx, ty);
          pa.quadraticCurveTo(cx + b.wb * 0.5, cy, b.x + b.wb, floor + 2);
          pa.closePath();
        }
        g.fillStyle = `rgba(255,255,255,${li ? 0.4 : 0.18})`;
        g.fill(pa);
      });
    },
  };
}

// ---- Flora: roots and vines growing up from the seabed, swaying around
// their base (eased swings within a few degrees, as the Kodama pen's), and
// thick roots coming in from both sides in three depth layers. Everything
// has a depth: farther strokes follow the scroll and the pointer less. The
// pointer also nudges the thin ones aside.
type Stroke = { d: number; x: number; y: number; pts: [number, number][]; w: number; amp: number; slow: number; a: number; from: number; to: number; t0: number; dur: number; push: number; len: number };
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
  let items: Stroke[] = [], t = 0, ptr: Ptr = null, W = 0, H = 0, px = 0, py = 0;
  // the thick roots never change shape: one picture per depth layer, with a margin for the parallax, moved by the compositor
  const P = 60, thick = [sprite(), sprite(), sprite()];
  // d: depth, 1 at the front; farther strokes follow the scroll and the pointer less (parallax)
  const add = (d: number, x: number, y: number, pts: [number, number][], w: number, amp: number, slow: number) => {
    const a = rnd(-amp, amp) * DEG;
    items.push({ d, x, y, pts, w, amp, slow, a, from: a, to: rnd(-amp, amp) * DEG, t0: 0, dur: rnd(3, 5) * slow, push: 0, len: pts[pts.length - 1][1] });
  };
  const setup = (w: number, h: number) => {
    items = [];
    for (const sp of thick) { sp.size(w + 2 * P, h + 2 * P); sp.g.translate(P, P); }
    const n = Math.max(3, Math.round(w / 110));
    for (let c = 0; c < n; c++) {
      const cx = (c + 0.5 + rnd(-0.3, 0.3)) * (w / n), base = h + rnd(-h * 0.03, 12), L = h * rnd(0.25, 0.45), d = rnd(0.55, 1);
      for (let r = 0; r < 4; r++) {
        const hook = (Math.random() < 0.5 ? -1 : 1) * rnd(6, 16), ph = rnd(0, TAU), len = L * rnd(0.75, 1), pts: [number, number][] = [];
        for (let y = 0; y <= len; y += 13) { const k = Math.min(1, y / 22); pts.push([hook * Math.sin((k * Math.PI) / 2) + Math.sin(y * 0.045 + ph) * 3 + noise(c * 7 + r, y * 0.02) * 6, y]); }
        add(d, cx + rnd(-10, 10), base - (r % 2) * rnd(4, 14), pts, r % 2 ? 0.6 : 1.6, 5, 1);
      }
    }
    const m = Math.max(2, Math.round(w / 220));
    for (let v = 0; v < m; v++) {
      const vx = (v + 0.5 + rnd(-0.35, 0.35)) * (w / m), side = Math.random() < 0.5 ? -1 : 1, len = h * rnd(0.55, 0.8), ph = rnd(0, TAU), d = rnd(0.75, 1);
      for (const [wd, off] of [[2.4, 0], [0.9, rnd(1.5, 3)]]) {
        const pts: [number, number][] = [];
        for (let y = 0; y <= len; y += 18) { const k = Math.min(1, y / 50); pts.push([side * 30 * (1 - Math.sin((k * Math.PI) / 2)) + off + Math.sin(y * 0.012 + ph) * 5 + noise(v * 13 + off, y * 0.01) * 8, y]); }
        add(d, vx, h + 6, pts, wd, 2.5, 1.6);
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
        const tg = thick[depth].g;
        tg.fillStyle = `rgba(255,255,255,${0.07 + depth * 0.05})`;
        tg.fill(path);
      }
    }
  };
  return {
    els: thick.map(sp => sp.c),
    move: (x, y) => { ptr = x === null ? null : { x, y }; },
    draw(g, w, h, dt, floor) {
      t += dt;
      if (W !== w || H !== h) { W = w; H = h; setup(w, h); }
      const off = floor - h; // everything here grows from the seabed
      if (off * 0.55 > h * 1.2) { for (const sp of thick) sp.at(0, null); return; } // even the farthest strokes are still below the screen
      // parallax target from the pointer's place on screen, eased
      const tx = ptr ? ptr.x / w - 0.5 : 0, ty = ptr ? clamp(ptr.y / h, 0, 1) - 0.5 : 0;
      px += (tx - px) * Math.min(1, dt * 2);
      py += (ty - py) * Math.min(1, dt * 2);
      thick.forEach((sp, depth) => {
        const par = 8 + depth * 14, y = -py * par * 0.5 + off * (0.7 + 0.1 * depth);
        sp.at(-P - px * par, y < h ? y - P : null);
      });
      const P2: Record<number, Path2D> = { 2.4: new Path2D(), 1.6: new Path2D(), 0.9: new Path2D(), 0.6: new Path2D() };
      for (const r of items) {
        let k = (t - r.t0) / r.dur;
        if (k >= 1) { r.from = r.to; r.to = rnd(-r.amp, r.amp) * DEG; r.t0 = t; r.dur = rnd(3, 5) * r.slow; k = 0; }
        let target = 0;
        const ry = r.y + off * r.d, rx = r.x - px * (6 + 18 * r.d);
        if (ptr && ptr.y < ry && ptr.y > ry - r.len) { const dx = rx - ptr.x, d = Math.abs(dx); if (d < 70) target = Math.sign(dx || 1) * (1 - d / 70) * 9 * DEG; }
        r.push += (target - r.push) * Math.min(1, dt * 3);
        r.a = r.from + (r.to - r.from) * easeInOut(k) - r.push;
        const cs = Math.cos(r.a), sn = Math.sin(r.a), pa = P2[r.w], P = r.pts.map(([x, y]) => [rx + x * cs + y * sn, ry + x * sn - y * cs]);
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

// The seabed's caustics: two seamless textures, light lines on black, each
// turned once into white on transparent: /caustic.jpg (sharp, in front) and
// /caustic-deep.jpg (blurred, deeper). Shared by every Aqua; null until loaded.
const causticArt = new Map<string, HTMLCanvasElement | null>();
function caustic(src: string) {
  if (causticArt.has(src)) return causticArt.get(src)!;
  causticArt.set(src, null);
  const img = new Image();
  img.onload = () => {
    const c = canvas(), x = c.getContext('2d')!;
    c.width = img.width; c.height = img.height;
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height), px = d.data;
    for (let i = 0; i < px.length; i += 4) { px[i + 3] = Math.max(px[i], px[i + 1], px[i + 2]); px[i] = px[i + 1] = px[i + 2] = 255; }
    x.putImageData(d, 0, 0);
    causticArt.set(src, c);
  };
  img.src = src;
  return null;
}
// [texture, scale, squash (height / width, lower lies flatter), drift x and y in px/s, alpha]:
// the deep one first, larger and dimmer, drifting the other way
const CAUSTIC_LAYERS = [['/caustic-deep.jpg', 1.5, 0.55, -7, 5, 0.75], ['/caustic.jpg', 1.6, 0.38, 9, 3, 0.75]] as const;
// The cutout, as in Super Mario Galaxy's pooled water: the two layers are
// added, then everything under a brightness threshold is cut away, so only
// where their bright lines meet survives, as sharp shifting shapes rather
// than a soft sum. Done by an SVG filter on the seabed canvas (no per-pixel
// work in JS): alpha below ~0.3 goes to 0, then ramps up steeply.
// Tuning (temporary, #debug on the home page: CausticDebug.tsx). lo / hi:
// where the cutout starts and reaches full; alpha, scale, flat, speed:
// multipliers on both layers.
export const CAUSTIC_TUNE = { lo: 0.3, hi: 0.75, alpha: 1, scale: 1, flat: 1, speed: 1 };
function cutTable() {
  const { lo, hi } = CAUSTIC_TUNE, n = 16;
  return Array.from({ length: n }, (_, i) => { const x = i / (n - 1), k = Math.min(1, Math.max(0, (x - lo) / Math.max(0.01, hi - lo))); return (k * k * (3 - 2 * k)).toFixed(3); }).join(' ');
}
export function retuneCaustics() {
  document.querySelector('#fx-caustic-cut feFuncA')?.setAttribute('tableValues', cutTable());
}
function causticCut() {
  const id = 'fx-caustic-cut';
  if (!document.getElementById(id)) {
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.innerHTML = `<filter id="${id}" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="table" tableValues="${cutTable()}"/></feComponentTransfer></filter>`;
    document.body.appendChild(svg);
  }
  return `url(#${id})`;
}

// ---- Aqua: under water. Slanted light shafts from the surface sway and
// breathe; marine snow drifts in a slow current and swirls away from the
// pointer; on the seabed, caustics: the two textures above, squashed a little
// so they lie flat, the sharp one in front of the blurred one, drifting
// different ways and adding up. A click sends a ripple ring and scatters the snow.
type Ray = { x: number; w: number; ph: number; sp: number };
type Flake = { x: number; y: number; s: number; ph: number; vx: number; vy: number };
function aqua(): Fx {
  let rays: Ray[] = [], snow: Flake[] = [], rings: { x: number; y: number; age: number }[] = [], t = 0, W = 0, H = 0, ptr: Ptr = null;
  let floorT = 0;
  const pats: (CanvasPattern | null)[] = CAUSTIC_LAYERS.map(() => null);
  // soft light at a quarter of the resolution; the seabed rendered 15 times a second and reused in between
  const rays4 = sprite(false), rayBuf = rays4.c, rg = rays4.g, bed = sprite(), floorBuf = bed.c, fg = bed.g;
  rayBuf.style.width = rayBuf.style.height = '100%'; // a quarter of the resolution, stretched by the compositor
  floorBuf.style.maskImage = floorBuf.style.webkitMaskImage = 'linear-gradient(to bottom, transparent, #000 70%)';
  floorBuf.style.filter = causticCut();
  const setup = (w: number, h: number) => {
    const n = Math.max(4, Math.round(w / 220));
    rays = Array.from({ length: n }, (_, i) => ({ x: ((i + 0.5 + rnd(-0.3, 0.3)) / n) * w * 1.1 - w * 0.05, w: rnd(30, 110), ph: rnd(0, TAU), sp: rnd(0.15, 0.3) }));
    snow = Array.from({ length: Math.round((w * h) / 7000) }, () => ({ x: rnd(0, w), y: rnd(0, h), s: rnd(0.8, 2.4), ph: rnd(0, TAU), vx: 0, vy: 0 }));
  };
  return {
    els: [rayBuf, floorBuf],
    move: (x, y) => { ptr = x === null ? null : { x, y }; },
    click: (w, h, x, y) => {
      rings.push({ x, y, age: 0 });
      for (const f of snow) { const dx = f.x - x, dy = f.y - y, d = Math.hypot(dx, dy); if (d < 160 && d > 1) { f.vx += (dx / d) * (160 - d) * 1.2; f.vy += (dy / d) * (160 - d) * 1.2; } }
    },
    draw(g, w, h, dt, floor) {
      t += dt;
      if (W !== w || H !== h) { W = w; H = h; setup(w, h); }
      // light shafts: slanted, widening downward, fading out with depth (soft, so a quarter of the resolution)
      const RQ = 4, slant = 0.28;
      if (rayBuf.width !== Math.ceil(w / RQ) || rayBuf.height !== Math.ceil(h / RQ)) { rayBuf.width = Math.ceil(w / RQ); rayBuf.height = Math.ceil(h / RQ); rays4.at(0, 0); }
      rg.setTransform(1 / RQ, 0, 0, 1 / RQ, 0, 0);
      rg.clearRect(0, 0, w, h);
      for (const r of rays) {
        const sway = Math.sin(t * r.sp + r.ph) * 40, x = r.x + sway, a = 0.05 + 0.05 * (0.5 + 0.5 * Math.sin(t * r.sp * 1.7 + r.ph * 2));
        const len = h * 1.15, bx = x + len * slant, gr = rg.createLinearGradient(x, 0, bx, len);
        gr.addColorStop(0, `rgba(255,255,255,${a})`);
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        rg.fillStyle = gr;
        rg.beginPath(); rg.moveTo(x - r.w / 2, -10); rg.lineTo(x + r.w / 2, -10); rg.lineTo(bx + r.w, len); rg.lineTo(bx - r.w, len); rg.closePath(); rg.fill();
      }
      // marine snow: slow current that varies with depth, sinking a little, swirling from the pointer
      const bands = [new Path2D(), new Path2D(), new Path2D()];
      for (const f of snow) {
        let vx = 10 + 16 * noise(f.y * 0.004, t * 0.1), vy = 5 + Math.sin(t * 0.8 + f.ph) * 6;
        if (ptr) { const dx = f.x - ptr.x, dy = f.y - ptr.y, d = Math.hypot(dx, dy); if (d < 110 && d > 1) { const k = (1 - d / 110) * 70; vx += (dx / d) * k - (dy / d) * k; vy += (dy / d) * k + (dx / d) * k; } }
        f.vx *= Math.pow(0.15, dt); f.vy *= Math.pow(0.15, dt);
        f.x += (vx + f.vx) * dt; f.y += (vy + f.vy) * dt;
        if (f.x > w + 5) f.x -= w + 10; else if (f.x < -5) f.x += w + 10;
        if (f.y > h + 5) f.y -= h + 10; else if (f.y < -5) f.y += h + 10;
        const tw = 0.5 + 0.5 * Math.sin(t * 1.3 + f.ph), b = bands[f.s > 1.9 ? 2 : tw > 0.6 ? 1 : 0];
        b.moveTo(f.x + f.s / 2, f.y); b.arc(f.x, f.y, f.s / 2, 0, TAU);
      }
      bands.forEach((pa, i) => { g.fillStyle = `rgba(255,255,255,${0.3 + i * 0.25})`; g.fill(pa); });
      // the seabed: the caustic band along the end of the page, redrawn 15 times a second
      const band = Math.min(320, h * 0.4), horizon = floor - band;
      if (horizon < h) {
        const B = Math.round(band);
        if (floorBuf.width !== Math.round(w) || floorBuf.height !== B) { bed.size(w, B); floorT = 0; }
        if ((floorT -= dt) <= 0) {
          floorT = 1 / 15;
          fg.setTransform(1, 0, 0, 1, 0, 0);
          fg.clearRect(0, 0, w, B);
          fg.globalCompositeOperation = 'lighter';
          CAUSTIC_LAYERS.forEach(([src, k, flat, vx, vy, al], i) => {
            const art = caustic(src);
            if (art && !pats[i]) pats[i] = fg.createPattern(art, 'repeat');
            const pat = pats[i];
            if (!pat) return;
            const T = CAUSTIC_TUNE, ks = k * T.scale, ts = t * T.speed;
            pat.setTransform(new DOMMatrix([ks, 0, 0, ks * flat * T.flat, w / 2 + ts * vx, B + ts * vy])); // lies flat; anchored at the middle of the page end
            fg.globalAlpha = Math.min(1, al * T.alpha);
            fg.fillStyle = pat;
            fg.fillRect(0, 0, w, B);
          });
          fg.globalCompositeOperation = 'source-over';
          fg.globalAlpha = 1;
        }
        bed.at(0, horizon);
      } else bed.at(0, null);
      // click ripples
      rings = rings.filter(r => (r.age += dt) < 1.4);
      for (const r of rings) { const k = r.age / 1.4; g.strokeStyle = `rgba(255,255,255,${0.6 * (1 - k)})`; g.lineWidth = 1.4; g.beginPath(); g.ellipse(r.x, r.y, 20 + k * 140, (20 + k * 140) * 0.35, 0, 0, TAU); g.stroke(); }
    },
  };
}

// ---- Gaia: a sea of stars. Three depth layers drifting up at their own
// speed, shifted by the pointer for parallax; each star twinkles on its own
// clock and lights up near the pointer; now and then a shooting star.
function gaia(): Fx {
  const LAYERS = [{ n: 600, s: 1.2, v: 6, par: 4 }, { n: 240, s: 2, v: 3, par: 10 }, { n: 90, s: 2.8, v: 2, par: 18 }]; // per million px
  const BANDS = 5;
  type Star = { x: number; y: number; ph: number; sp: number; lit: number };
  type Shoot = { x: number; y: number; ang: number; v: number; age: number };
  let stars: Star[][] = [], shoot: Shoot[] = [], next = 2, t = 0, ptr: Ptr = null, px = 0, py = 0, W = 0, H = 0;
  return {
    move: (x, y) => { ptr = x === null ? null : { x, y }; },
    click: (w, h, x, y) => { shoot.push({ x, y, ang: rnd(0.25, 0.6), v: rnd(380, 520), age: 0 }); },
    draw(g, w, h, dt, floor) {
      t += dt;
      if (W !== w || H !== h) { W = w; H = h; const k = (w * h) / 1e6; stars = LAYERS.map(L => Array.from({ length: Math.round(L.n * k) }, () => ({ x: rnd(0, w), y: rnd(0, h), ph: rnd(0, TAU), sp: rnd(0.6, 2.2), lit: 0 }))); }
      const tx = ptr ? (ptr.x / w - 0.5) * 2 : 0, ty = ptr ? (clamp(ptr.y / h, 0, 1) - 0.5) * 2 : 0;
      px += (tx - px) * Math.min(1, dt * 3);
      py += (ty - py) * Math.min(1, dt * 3);
      const c3 = themeRgb().c3;
      LAYERS.forEach((L, li) => {
        const paths = Array.from({ length: BANDS }, () => new Path2D()), ox = -px * L.par, oy = -py * L.par + (floor - h) * 0.04 * (li + 1); // deeper layers scroll more
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

// One factory per element; how strongly each shows, so filled effects (Pyra)
// and sparse line ones end up at about the same visual weight; how many
// 50 ms steps to run it ahead before it shows (only what has to grow in);
// and the resolution of its layer (soft ones draw fewer pixels and are
// scaled up on screen for free).
export const OCEAN_FX: Record<string, { make: (w: number) => Fx; gain: number; warm?: number; res?: number }> = {
  aqua: { make: aqua, gain: 1 },
  pyra: { make: pyra, gain: 0.55, res: 0.5 },
  cryo: { make: cryo, gain: 0.85, warm: 80 },
  volta: { make: volta, gain: 1, res: 0.25 },
  aero: { make: aero, gain: 1 },
  gaia: { make: gaia, gain: 1 },
  flora: { make: flora, gain: 0.85 },
};
