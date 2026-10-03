import { useEffect, useRef } from 'react';
import { docOffset, onTick, pointer, prefersReducedMotion } from '@/lib/ticker';
import { WAVES, type WaveStyle } from '@/config/waves';
import { currentElement, onThemeChange } from '@/lib/theme';

// Water at the foot of the hero. Each layer is a sum of sines; the front
// layer also carries a spring chain that the pointer nudges a little. The
// active element sets the style (src/config/waves.ts), eased in over about
// a second when it changes.
const W = 1000;
const H = 300;
const NODES = 96;
const EDGE = 240; // nodes run this far past both sides, so shifted ends stay hidden
const LAYERS = [
  { base: 95, a: [18, 8], k: [0.007, 0.017], w: [0.45, -0.7], stir: 0.15, phase: 0 },
  { base: 150, a: [14, 7], k: [0.009, 0.021], w: [-0.6, 0.9], stir: 0.35, phase: 2.1 },
  { base: 205, a: [11, 6], k: [0.011, 0.026], w: [0.8, -1.1], stir: 0.7, phase: 4.2 },
];

// Icon particles. Each element that has them gets a pool per depth plane:
// plane k is drawn just behind wave layer k (0 = farthest), twice: as is
// above that wave's surface, and dimmed below it, as if seen through the
// water. Farther planes: smaller, fainter, slower.
const KINDS = ['flora', 'aero', 'cryo', 'pyra', 'aqua', 'gaia', 'volta'] as const;
type Kind = (typeof KINDS)[number];
const POOL: Record<Kind, [number, number, number]> = {
  flora: [4, 5, 7],
  aero: [5, 6, 9],
  cryo: [6, 7, 9],
  pyra: [10, 12, 16],
  aqua: [10, 12, 16],
  gaia: [4, 5, 6],
  volta: [6, 8, 10],
};
const PLANE_SIZE = [0.45, 0.65, 1];
const PLANE_ALPHA = [0.35, 0.6, 0.95];
const PLANE_SPEED = [0.55, 0.75, 1];
// Within a plane, each icon also gets one of three tiers for parallax:
// big and clear, medium, small and faint.
const TIER_SIZE = [1, 0.75, 0.55];
const TIER_ALPHA = [1, 0.7, 0.45];
const TIER_SPEED = [1, 0.8, 0.6];
const UNDER_ALPHA = 0.32; // how much of an icon shows through the water over it

// Element icon turned into a white silhouette, as a data URL. For Aqua only
// the big drop is kept (the small one is cut off).
function whiteIcon(id: Kind, done: (url: string) => void) {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = c.height = 96;
    const g = c.getContext('2d');
    if (!g) return;
    if (id === 'aqua') {
      const w = (390 / 512) * 96;
      g.drawImage(img, 0, 0, 390 * (img.naturalWidth / 512), img.naturalHeight, (96 - w) / 2, 0, w, 96);
      g.clearRect((96 - w) / 2 + (368 / 390) * w, (125 / 512) * 96, 96, (205 / 512) * 96);
    } else g.drawImage(img, 0, 0, 96, 96);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#fff';
    g.fillRect(0, 0, 96, 96);
    done(c.toDataURL());
  };
  img.src = `/${id}.png`;
}

export const HeroWaves = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;
    const fills = [...svg.querySelectorAll<SVGPathElement>('[data-fill]')];
    const stops = [...svg.querySelectorAll<SVGStopElement>('stop[data-op]')];
    const crest = svg.querySelector<SVGPathElement>('[data-crest]')!;
    const clips = [0, 1, 2].map(n => svg.querySelector<SVGPathElement>(`#hw-clip-${n} path`)!);
    const unders = [0, 1, 2].map(n => svg.querySelector<SVGPathElement>(`#hw-under-${n} path`)!);
    // els[kind][plane] = the <image> pool for that kind on that plane
    const els = Object.fromEntries(KINDS.map(k => [k, [0, 1, 2].map(pl => [...svg.querySelectorAll<SVGImageElement>(`[data-p="${k}${pl}"]`)])])) as Record<Kind, SVGImageElement[][]>;
    KINDS.forEach(k => whiteIcon(k, url => els[k].flat().forEach(el => el.setAttribute('href', url))));
    const h = new Float32Array(NODES);
    const v = new Float32Array(NODES);
    // Drip ripples: one small spring chain per layer, dented by rain drops
    // landing on that layer and spreading out from there.
    const dripH = [0, 1, 2].map(() => new Float32Array(NODES));
    const dripV = [0, 1, 2].map(() => new Float32Array(NODES));
    const xs = new Float32Array(NODES);
    const ys = new Float32Array(NODES);
    // every layer's top edge, for particles riding it (2 = front)
    const layerX = [0, 1, 2].map(() => new Float32Array(NODES));
    const layerY = [0, 1, 2].map(() => new Float32Array(NODES));
    // Volta: per-node jitter and the phase of the crawling teeth, refreshed
    // a few times a second, and shocks that jolt the water at random spots.
    const jitter = new Float32Array(NODES);
    let zapShift = 0;
    let flick = 0;
    // The pointer, eased: m.x in px from the left, m.y in px from the top
    // of the waves, m.on fades with pointer presence. near[i] = how close
    // node i is to it (1 at the pointer). Each element reads it its own way.
    const m = { x: 0, y: 0, on: 0 };
    const near = new Float32Array(NODES);
    // Per-node clocks, so the water can run slower (Cryo) or faster (Gaia)
    // around the pointer; they drift back to the shared clock elsewhere.
    const nodeT = new Float32Array(NODES);
    const nodeX = (i: number) => -EDGE + (i / (NODES - 1)) * (W + 2 * EDGE);
    const nodeOf = (x: number) => Math.round(((x + EDGE) / (W + 2 * EDGE)) * (NODES - 1));
    let rainDir = 0;
    let windDir = 1;
    // Volta shocks: a jagged burst at node j that sends a shock wave
    // running both ways along the water, fading as it goes. Layer n feels
    // it a little later and weaker the farther back it is.
    type Shock = { j: number; amp: number; age: number };
    const shocks: Shock[] = [];
    const SHOCK_SPEED = 38; // nodes per second
    const SHOCK_LIFE = 1.6;
    const shockAt = (i: number, n: number) => {
      let y = 0;
      for (const k of shocks) {
        const age = k.age - (2 - n) * 0.07;
        if (age <= 0) continue;
        const d = Math.abs(i - k.j);
        const front = Math.exp(-((d - SHOCK_SPEED * age) ** 2) / 5); // the travelling wave
        const hit = Math.exp(-(d * d) / 6) * Math.exp(-age * 6); // the burst where it struck
        y += k.amp * Math.exp(-age * 1.7) * (front + hit) * (i % 2 ? 1 : -0.7);
      }
      return y * (0.45 + 0.275 * n);
    };

    let box = docOffset(wrap);
    const measure = () => { box = docOffset(wrap); };
    window.addEventListener('resize', measure);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(wrap);

    const style: WaveStyle = { ...(WAVES[currentElement()] ?? WAVES.aqua) };
    let target = style;
    const retarget = () => {
      target = WAVES[currentElement()] ?? WAVES.aqua;
      // Denser water darkens the deep layer and thins the light ones.
      stops.forEach((st, n) => {
        const k = n === stops.length - 1 ? target.opacity : 1 / target.opacity;
        st.setAttribute('stop-opacity', String(Math.min(0.9, Number(st.dataset.op) * k)));
      });
    };
    retarget();
    const offTheme = onThemeChange(retarget);
    let clock = 0;

    // Top edge of a layer through (xs, ys): straight segments for electric
    // water, smoothed quadratics otherwise.
    const curve = (straight: boolean) => {
      let d = `M${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`;
      if (straight) {
        for (let i = 1; i < NODES; i++) d += ` L${xs[i].toFixed(1)} ${ys[i].toFixed(1)}`;
        return d;
      }
      for (let i = 1; i < NODES - 1; i++) {
        d += ` Q${xs[i].toFixed(1)} ${ys[i].toFixed(1)} ${((xs[i] + xs[i + 1]) / 2).toFixed(1)} ${((ys[i] + ys[i + 1]) / 2).toFixed(1)}`;
      }
      return `${d} L${xs[NODES - 1].toFixed(1)} ${ys[NODES - 1].toFixed(1)}`;
    };

    const tri = (a: number) => (2 / Math.PI) * Math.asin(Math.sin(a));
    let gust = 1;

    const draw = (t: number) => {
      const S = style;
      // Aero: gusts swell the whole sea now and then. Flora: it breathes.
      gust = 1 + S.storm * (0.35 * Math.sin(t * 0.31) + 0.25 * Math.sin(t * 0.83 + 1) + 0.15 * Math.sin(t * 1.9 + 2));
      const breathe = 1 + S.breathe * 0.35 * Math.sin(t * 0.45);
      LAYERS.forEach((L, n) => {
        // The layer's depth can wander on its own.
        const base = L.base + S.drift * (14 * Math.sin(t * 0.21 + n * 1.7) + 9 * Math.sin(t * 0.47 + n * 3.1));
        for (let i = 0; i < NODES; i++) {
          const x0 = nodeX(i);
          const kx = x0 * S.freq;
          const tn = nodeT[i] || t; // this node's clock
          // Pyra: the pointer's height sets the waves' height. Gaia swells
          // and Cryo flattens a little around the pointer.
          const local = 1 + (S.earth * 0.7 - S.frost * 0.35) * near[i];
          const swell = (1 + S.drift * 0.45 * Math.sin(x0 * 0.0023 + t * 0.3 + n * 2)) * gust * breathe * local;
          const a0 = L.a[0] * S.amp * swell;
          const a1 = L.a[1] * S.amp * swell;
          const p0 = kx * L.k[0] + tn * L.w[0] + L.phase;
          const p1 = kx * L.k[1] + tn * L.w[1] + Math.cos(x0 * 0.004 + tn * 0.3) * 1.5;
          // Volta bends the sines into triangles.
          let y = a0 * (Math.sin(p0) + S.zig * (tri(p0) - Math.sin(p0))) + a1 * (Math.sin(p1) + S.zig * (tri(p1) - Math.sin(p1)));
          // Pyra: a faster harmonic rolling the other way.
          y += S.fluid * 0.4 * L.a[0] * Math.sin(kx * L.k[0] * 2.7 - t * L.w[0] * 1.9 + L.phase * 2);
          // Cryo / Gaia: slow lumps.
          y += S.lumps * (4 * Math.sin(kx * 0.09 + t * 0.12 + n) + 3 * Math.sin(kx * 0.153 - t * 0.08 + n * 2));
          // Volta: zigzag teeth that crawl along, a jittery spark, shocks.
          y += S.zig * (5 * ((i + zapShift + n) % 2 ? 1 : -1) * (0.75 + 0.25 * jitter[i]) + 2.5 * jitter[i]);
          // Volta: shock waves
          if (S.volt > 0.01) y += S.volt * shockAt(i, n);
          // Aero: wind chop.
          y += S.storm * gust * (5 * Math.sin(kx * 0.05 + t * 2.6 + n) + 3.5 * Math.sin(kx * 0.083 - t * 3.1));
          // Aero: crests pulled together into sharp peaks (Gerstner-style;
          // kept under the point where the surface would fold over).
          // (the lean follows the wind, which follows the pointer)
          xs[i] = x0 - S.storm * windDir * Math.min(2.6, 0.85 / (a0 * L.k[0] * S.freq || 1)) * a0 * Math.cos(p0);
          ys[i] = base + y + h[i] * L.stir * S.stir + dripH[n][i];
        }
        const top = curve(S.zig > 0.5 || S.volt > 0.5);
        fills[n].setAttribute('d', `${top} L${W} ${H} L0 ${H} Z`);
        layerX[n].set(xs);
        layerY[n].set(ys);
        // plane n's icons: full above this surface, dimmed below it
        clips[n].setAttribute('d', `${top} L${W + EDGE} ${-H} L${-EDGE} ${-H} Z`);
        unders[n].setAttribute('d', `${top} L${W + EDGE} ${2 * H} L${-EDGE} ${2 * H} Z`);
        if (n === LAYERS.length - 1) crest.setAttribute('d', top);
      });
      // Volta: the crest burns brighter and flickers. Aero: white caps.
      const charged = Math.max(S.zig, S.volt * Math.min(1, shocks.length));
      crest.style.stroke = S.zig > 0.5 || S.volt > 0.5 ? 'var(--h-c1)' : S.storm > 0.5 ? '#fff' : 'var(--h-c3)';
      crest.setAttribute('stroke-opacity', String(Math.min(0.95, 0.45 + charged * (0.25 + 0.3 * flick) + S.storm * 0.3 * gust)));
      crest.setAttribute('stroke-width', String(1.5 + charged + S.storm * gust));
    };

    // Height of layer k's surface at x (viewBox units) and its slope.
    const surface = (k: number, x: number) => {
      const X = layerX[k];
      const Y = layerY[k];
      let i = 0;
      while (i < NODES - 2 && X[i + 1] < x) i++;
      const span = X[i + 1] - X[i] || 1;
      const f = Math.min(1, Math.max(0, (x - X[i]) / span));
      return { y: Y[i] + (Y[i + 1] - Y[i]) * f, slope: (Y[i + 1] - Y[i]) / span };
    };

    // Particles keep x/y in viewBox units; sizes and speeds are in screen px
    // and converted with the SVG's current stretch (sx, sy).
    type P = { x: number; y: number; vx: number; vy: number; rot: number; spin: number; size: number; age: number; life: number; phase: number; tier: number };
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const tierOf = () => Math.floor(Math.random() * 3);
    const live: Record<Kind, P[][]> = Object.fromEntries(KINDS.map(k => [k, [[], [], []]])) as Record<Kind, P[][]>;
    // the ones that always exist (Flora, Cryo, Gaia)
    [0, 1, 2].forEach(pl => {
      live.flora[pl] = els.flora[pl].map((_, i, a) => ({ x: ((i + rnd(0.1, 0.9)) / a.length) * W, y: 0, vx: rnd(3, 8), vy: 0, rot: rnd(0, 360), spin: rnd(-6, 6), size: rnd(16, 28), age: 0, life: 1, phase: rnd(0, 6.3), tier: tierOf() }));
      live.cryo[pl] = els.cryo[pl].map(() => ({ x: rnd(0, W), y: rnd(8, 60), vx: rnd(-6, 6), vy: rnd(3, 9), rot: rnd(0, 360), spin: rnd(-25, 25), size: rnd(8, 16), age: 0, life: 1, phase: rnd(0, 6.3), tier: tierOf() }));
      live.gaia[pl] = els.gaia[pl].map((_, i, a) => ({ x: ((i + rnd(0.15, 0.85)) / a.length) * W, y: 0, vx: 0, vy: 0, rot: rnd(-10, 10), spin: 0, size: rnd(22, 34), age: 0, life: 1, phase: rnd(0, 6.3), tier: tierOf() }));
    });
    const nextBurst = [rnd(0.2, 0.8), rnd(0.2, 0.8), rnd(0.2, 0.8)];
    // Volta: sparks jump out of the water where it jolts (node j).
    const sparks = (j: number, n: number, pl: number) => {
      const x = -EDGE + (j / (NODES - 1)) * (W + 2 * EDGE);
      const v = PLANE_SPEED[pl];
      for (let i = 0; i < n && live.volta[pl].length < els.volta[pl].length; i++) {
        live.volta[pl].push({ x: x + rnd(-8, 8), y: surface(pl, x).y, vx: rnd(-70, 70) * v, vy: -rnd(90, 190) * v, rot: rnd(-30, 30), spin: rnd(-300, 300), size: rnd(12, 22) * PLANE_SIZE[pl], age: 0, life: rnd(0.45, 0.8), phase: 0, tier: tierOf() });
      }
    };
    const rainClock = [0, 0, 0];

    const place = (el: SVGImageElement, x: number, y: number, rot: number, size: number, alpha: number, sx: number, sy: number, tier = 0) => {
      size *= TIER_SIZE[tier];
      alpha *= TIER_ALPHA[tier];
      el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(1 / sx).toFixed(4)} ${(1 / sy).toFixed(4)}) rotate(${rot.toFixed(1)})`);
      el.setAttribute('x', (-size / 2).toFixed(1));
      el.setAttribute('y', (-size / 2).toFixed(1));
      el.setAttribute('width', size.toFixed(1));
      el.setAttribute('height', size.toFixed(1));
      el.setAttribute('opacity', alpha.toFixed(2));
    };
    const hidden = new Set<Kind>();
    const hide = (k: Kind) => {
      if (hidden.has(k)) return;
      els[k].flat().forEach(el => el.setAttribute('opacity', '0'));
      hidden.add(k);
    };
    // Draws the live particles of a spawned kind, hides the unused images.
    // Spawned ones fade in over FADE_IN s and out over their last FADE_OUT s.
    const FADE_IN = 0.15;
    const FADE_OUT = 0.35;
    const show = (k: Kind, pl: number, pose: (p: P) => [number, number, number, number, number], sx: number, sy: number) => {
      els[k][pl].forEach((el, i) => {
        const p = live[k][pl][i];
        if (!p) { el.setAttribute('opacity', '0'); return; }
        const [x, y, rot, size, alpha] = pose(p);
        const fade = Math.min(1, p.age / FADE_IN, (p.life - p.age) / FADE_OUT);
        place(el, x, y, rot, size, alpha * Math.max(0, fade), sx, sy, p.tier);
      });
    };

    const fx = (dt: number, t: number) => {
      const sx = box.w / W || 1;
      const sy = box.h / H || 1;
      const S = style;
      const weight: Record<Kind, number> = { flora: S.petals, aero: S.storm, cryo: S.frost, pyra: S.solar, aqua: S.rain, gaia: S.earth, volta: Math.max(S.zig, S.volt) };
      KINDS.forEach(k => { if (weight[k] > 0.01) hidden.delete(k); else if (!live[k].some(a => a.length && (k === 'aero' || k === 'pyra' || k === 'aqua' || k === 'volta'))) hide(k); });

      for (let pl = 0; pl < 3; pl++) {
        const f = PLANE_SIZE[pl];
        const v = PLANE_SPEED[pl];
        const al = PLANE_ALPHA[pl];

        // Flora: flowers drift right and slowly turn, resting on the water.
        if (!hidden.has('flora')) els.flora[pl].forEach((el, i) => {
          const p = live.flora[pl][i];
          // flowers drift toward the pointer and open up near it
          const dx = m.x - p.x * sx;
          const bloom = m.on * Math.exp(-(dx * dx) / (2 * 160 * 160));
          p.x += (p.vx * v + (m.on * Math.max(-1, Math.min(1, dx / 300)) * 22 * Math.exp(-Math.abs(dx) / 500)) / sx) * TIER_SPEED[p.tier] * dt;
          if (p.x > W + 40) p.x = -40;
          if (p.x < -40) p.x = W + 40;
          p.rot += p.spin * (1 + 4 * bloom) * dt;
          const s = surface(pl, p.x);
          const size = p.size * f * TIER_SIZE[p.tier] * (1 + 0.04 * Math.sin(t + p.phase)) * (1 + 0.4 * bloom);
          place(el, p.x, s.y - (size * 0.2) / sy + Math.sin(t * 0.8 + p.phase) * 0.5, p.rot + Math.atan(s.slope * sy / sx) * 28, size / TIER_SIZE[p.tier], S.petals * al, sx, sy, p.tier);
        });

        // Cryo: snowflakes hover above the water, sink slowly, turn and
        // twinkle; they start again higher up when they touch it.
        if (!hidden.has('cryo')) els.cryo[pl].forEach((el, i) => {
          const p = live.cryo[pl][i];
          p.x += (p.vx + Math.sin(t * 0.6 + p.phase) * 4) * v * TIER_SPEED[p.tier] * dt;
          p.y -= p.vy * v * TIER_SPEED[p.tier] * dt; // height above the surface, px
          p.rot += p.spin * dt;
          if (p.y < 2) { p.y = rnd(30, 70); p.x = rnd(0, W); }
          if (p.x < -20) p.x = W + 20;
          if (p.x > W + 20) p.x = -20;
          const s = surface(pl, p.x);
          const fade = Math.min(1, (p.y - 2) / 12) * (0.55 + 0.45 * Math.sin(t * 2 + p.phase));
          place(el, p.x, s.y - (p.y * f) / sy, p.rot, p.size * f, S.frost * al * fade, sx, sy, p.tier);
        });

        // Gaia: icons rise out of the water, bob a little, and sink back.
        if (!hidden.has('gaia')) els.gaia[pl].forEach((el, i) => {
          const p = live.gaia[pl][i];
          const up = Math.max(0, Math.sin(t * 0.35 * v + p.phase)); // 0 = under water
          const x = p.x + Math.sin(t * 0.2 + p.phase) * 12;
          const s = surface(pl, x);
          const size = p.size * f * TIER_SIZE[p.tier];
          place(el, x, s.y + ((1 - up) * size * 1.2 - size * 0.55) / sy, p.rot + 6 * Math.sin(t * 0.5 + p.phase), size / TIER_SIZE[p.tier], S.earth * al * Math.min(1, up * 3), sx, sy, p.tier);
        });

        // Aero: little tornadoes torn off the crests and blown downwind.
        if (S.storm > 0.05) {
          const Y = layerY[pl];
          for (let i = 2; i < NODES - 2; i++) {
            if (Y[i] < Y[i - 1] && Y[i] < Y[i + 1] && live.aero[pl].length < els.aero[pl].length && Math.random() < S.storm * (0.25 + Math.max(0, gust - 1) * 2) * dt * 2.5) {
              live.aero[pl].push({ x: layerX[pl][i], y: Y[i], vx: rnd(110, 210) * v, vy: rnd(-45, -15) * v, rot: rnd(-20, 20), spin: rnd(-40, 40), size: rnd(12, 24) * f, age: 0, life: rnd(1.1, 1.9), phase: rnd(0, 6.3), tier: tierOf() });
            }
          }
        }

        // Pyra: solar flares now and then burst out of the water and throw
        // icons up on parabolas; they drop back in.
        if (S.solar > 0.05 && (nextBurst[pl] -= dt) <= 0) {
          // more flares, and mostly right under the pointer when it's there
          const focus = m.on > 0.3 && Math.random() < 0.75;
          nextBurst[pl] = rnd(0.35, 1.1) / (1 + 1.5 * m.on);
          const x = focus ? Math.max(0, Math.min(W, (m.x + (Math.random() - 0.5) * 2 * 140) / sx)) : rnd(0.05, 0.95) * W;
          const n = 2 + Math.floor(Math.random() * 2);
          for (let j = 0; j < n && live.pyra[pl].length < els.pyra[pl].length; j++) {
            live.pyra[pl].push({ x, y: surface(pl, x).y, vx: rnd(-90, 90) * v, vy: -rnd(150, 260) * v, rot: rnd(0, 360), spin: rnd(-200, 200), size: rnd(16, 28) * f, age: 0, life: 4, phase: 0, tier: tierOf() });
          }
        }

        // Aqua: rain drops fall in at a slant and vanish into the water,
        // nudging the front surface where they land.
        if (S.rain > 0.05) {
          rainClock[pl] += dt * S.rain * (4 + pl * 3);
          while (rainClock[pl] > 1 && live.aqua[pl].length < els.aqua[pl].length) {
            rainClock[pl] -= 1;
            live.aqua[pl].push({ x: rnd(-0.2, 1.2) * W, y: -10, vx: rainDir * 170 * v, vy: rnd(260, 360) * v, rot: 0, spin: 0, size: rnd(10, 16) * f, age: 0, life: 3, phase: 0, tier: tierOf() });
          }
          if (rainClock[pl] > 1) rainClock[pl] = 1;
        }

        // move the spawned ones (velocities in px/s)
        for (const k of ['aero', 'pyra', 'aqua', 'volta'] as const) {
          const list = live[k][pl];
          for (let i = list.length - 1; i >= 0; i--) {
            const p = list[i];
            p.age += dt;
            const g = k === 'pyra' ? 300 * v : k === 'volta' ? 420 * v : k === 'aero' ? 12 : 0;
            p.vy += g * dt;
            const ts = TIER_SPEED[p.tier];
            if (k === 'aqua') p.vx += (rainDir * 170 * v - p.vx) * Math.min(1, dt * 2); // drops lean with the pointer
            p.x += (p.vx * ts * (k === 'aero' ? gust * windDir : 1) * dt) / sx;
            p.y += (p.vy * ts * dt) / sy;
            p.rot += p.spin * dt;
            // Falling into the water: keep sinking (slower) and fade out.
            if ((k === 'pyra' || k === 'aqua' || k === 'volta') && p.phase >= 0 && p.vy > 0 && p.y > surface(pl, p.x).y + 2) {
              p.phase = -1;
              p.life = Math.min(p.life, p.age + FADE_OUT);
              p.vy *= 0.3;
              p.vx *= 0.3;
              if (k === 'aqua') {
                const j = Math.round(((p.x + EDGE) / (W + 2 * EDGE)) * (NODES - 1));
                if (j >= 0 && j < NODES) dripV[pl][j] += 0.9 * PLANE_SIZE[pl] * TIER_SIZE[p.tier];
              }
            }
            if (p.age >= p.life) list.splice(i, 1);
          }
        }
        if (!hidden.has('aero')) show('aero', pl, p => { const k = p.age / p.life; return [p.x, p.y, p.rot + 15 * Math.sin(p.age * 6 + p.phase), p.size * (0.6 + 0.6 * Math.sin(Math.PI * k)), Math.sin(Math.PI * k) * S.storm * al]; }, sx, sy);
        if (!hidden.has('pyra')) show('pyra', pl, p => [p.x, p.y, p.rot, p.size, S.solar * al], sx, sy);
        if (!hidden.has('volta')) show('volta', pl, p => { const k = p.age / p.life; return [p.x, p.y, p.rot, p.size * (1.2 - 0.5 * k), Math.max(S.zig, S.volt) * al * (0.6 + 0.4 * flick)]; }, sx, sy);
        if (!hidden.has('aqua')) show('aqua', pl, p => [p.x, p.y, -28 + Math.atan2(-p.vx, p.vy) * 57.3, p.size, S.rain * al], sx, sy);
      }
    };

    // Spring chain: each node is pulled back to rest and towards its
    // neighbours, so a push travels sideways and fades out.
    const step = () => {
      for (let i = 0; i < NODES; i++) {
        const l = h[i > 0 ? i - 1 : i];
        const r = h[i < NODES - 1 ? i + 1 : i];
        v[i] = (v[i] - 0.015 * h[i] + 0.22 * (l + r - 2 * h[i])) * 0.985;
      }
      for (let i = 0; i < NODES; i++) h[i] = Math.max(-14, Math.min(14, h[i] + v[i]));
      for (let n = 0; n < 3; n++) {
        const dh = dripH[n];
        const dv = dripV[n];
        for (let i = 0; i < NODES; i++) {
          const l = dh[i > 0 ? i - 1 : i];
          const r = dh[i < NODES - 1 ? i + 1 : i];
          dv[i] = (dv[i] - 0.06 * dh[i] + 0.25 * (l + r - 2 * dh[i])) * 0.95;
        }
        for (let i = 0; i < NODES; i++) dh[i] = Math.max(-4, Math.min(4, dh[i] + dv[i]));
      }
    };

    if (prefersReducedMotion()) {
      draw(0);
      const offStill = onThemeChange(() => { Object.assign(style, target); draw(0); });
      return () => { offTheme(); offStill(); window.removeEventListener('resize', measure); io.disconnect(); };
    }

    let lastX = pointer.x;
    let lastY = pointer.y;
    let acc = 0;
    let zapClock = 0;
    let nextShock = 1.5;
    const off = onTick((_t, dt) => {
      if (!visible) return;
      const px = pointer.x - box.x;
      const py = pointer.y - (box.y - window.scrollY);
      if (pointer.active && px >= 0 && px <= box.w && py >= -60 && py <= box.h) {
        const push = Math.max(-0.6, Math.min(0.6, ((pointer.y - lastY) + Math.abs(pointer.x - lastX) * 0.35) * 0.012));
        const j = nodeOf(px / (box.w / W || 1));
        for (let i = 0; i < NODES; i++) v[i] += push * Math.exp(-((i - j) ** 2) / 8);
      }
      lastX = pointer.x;
      lastY = pointer.y;
      acc = Math.min(acc + dt, 0.1);
      while (acc >= 1 / 60) { acc -= 1 / 60; step(); }
      const ease = Math.min(1, dt * 3);
      (Object.keys(style) as (keyof WaveStyle)[]).forEach(k => { style[k] += (target[k] - style[k]) * ease; });

      // pointer, eased
      const sxNow = box.w / W || 1;
      const mk = Math.min(1, dt * 6);
      m.on += ((pointer.active ? 1 : 0) - m.on) * Math.min(1, dt * 3);
      if (pointer.active) {
        m.x += (px - m.x) * mk;
        m.y += (py - m.y) * mk;
      }
      // -1 .. 1, already at full strength 25% in from either side
      const side = Math.max(-1, Math.min(1, (m.x / (box.w || 1) - 0.5) / 0.25));
      rainDir += (m.on * side - rainDir) * Math.min(1, dt * 2);
      windDir += ((m.on > 0.5 ? Math.sign(side) * Math.max(0.5, Math.abs(side)) : 1) - windDir) * Math.min(1, dt * 1.5);
      const midY = box.h * 0.6;
      const yNear = Math.exp(-((m.y - midY) ** 2) / (2 * 240 * 240));
      for (let i = 0; i < NODES; i++) {
        const d = nodeX(i) * sxNow - m.x;
        near[i] = m.on * yNear * Math.exp(-(d * d) / (2 * 170 * 170));
        // Cryo freezes the water near the pointer, Gaia makes it run
        const rate = 1 - style.frost * 0.9 * near[i] + style.earth * 1.6 * near[i];
        if (!nodeT[i]) nodeT[i] = clock;
        nodeT[i] += dt * style.speed * rate + (clock - nodeT[i]) * Math.min(1, dt * 0.6);
      }
      zapClock += dt;
      if (zapClock > 0.22) {
        zapClock = 0;
        zapShift++;
        flick = Math.random();
        for (let i = 0; i < NODES; i++) jitter[i] = Math.random() * 2 - 1;
        if (style.zig > 0.5 && Math.random() < 0.6) sparks(Math.floor(Math.random() * NODES), 1, Math.floor(Math.random() * 3));
        // sparks fly off the running shock waves
        if (style.volt > 0.5) for (const k of shocks) {
          const reach = SHOCK_SPEED * k.age;
          for (const j of [k.j - reach, k.j + reach]) if (j > 0 && j < NODES - 1 && Math.random() < 0.7) sparks(Math.round(j), 1, 1 + Math.floor(Math.random() * 2));
        }
      }
      // Volta: the closer the pointer is to the water, the more the current
      // jumps there: more shocks, near it, and more sparks.
      const mNode = nodeOf(m.x / sxNow);
      const charge = mNode >= 0 && mNode < NODES ? near[mNode] : 0;
      const volt = Math.max(style.zig, style.volt);
      if (volt > 0.5 && charge > 0.05 && Math.random() < charge * dt * 4) sparks(Math.max(0, Math.min(NODES - 1, mNode + Math.round((Math.random() - 0.5) * 8))), 1, 2);
      // Volta shocks: often right under the pointer when it's near the
      // water, otherwise now and then somewhere.
      for (let i = shocks.length - 1; i >= 0; i--) if ((shocks[i].age += dt) > SHOCK_LIFE) shocks.splice(i, 1);
      if (volt > 0.5 && (nextShock -= dt * (1 + 8 * charge)) <= 0) {
        nextShock = 2.5 + Math.random() * 3.5;
        const j = charge > 0.05 && Math.random() < 0.5 + 0.5 * charge
          ? Math.max(2, Math.min(NODES - 3, mNode + (Math.random() - 0.5) * 6))
          : 4 + Math.random() * (NODES - 8);
        shocks.push({ j, amp: (Math.random() < 0.5 ? -1 : 1) * (26 + Math.random() * 16), age: 0 });
        flick = 1;
        [0, 1, 2].forEach(pl => sparks(Math.round(j), 2 + pl * 2, pl));
      }
      clock += dt * style.speed;
      draw(clock);
      fx(dt, clock);
    });

    return () => {
      off();
      offTheme();
      window.removeEventListener('resize', measure);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-x-0 bottom-0 h-[34vh] min-h-[180px] pointer-events-none" aria-hidden="true">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="hw-0" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--h-c3)' }} data-op="0.14" stopOpacity="0.14" />
            <stop offset="1" style={{ stopColor: 'var(--h-c3)' }} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hw-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--h-c1)' }} data-op="0.2" stopOpacity="0.2" />
            <stop offset="1" style={{ stopColor: 'var(--h-c1)' }} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hw-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--h-deep)' }} data-op="0.45" stopOpacity="0.45" />
            <stop offset="1" style={{ stopColor: 'var(--h-deep)' }} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map(pl => (
          <g key={pl}>
            {/* icons of plane pl, behind wave layer pl: as is above its
                surface, dimmed below it */}
            <defs>
              <g id={`hw-icons-${pl}`}>
                {KINDS.map(k => Array.from({ length: POOL[k][pl] }, (_, i) => <image key={`${k}${i}`} data-p={`${k}${pl}`} opacity="0" />))}
              </g>
              <clipPath id={`hw-clip-${pl}`}><path /></clipPath>
              <clipPath id={`hw-under-${pl}`}><path /></clipPath>
            </defs>
            <use href={`#hw-icons-${pl}`} clipPath={`url(#hw-clip-${pl})`} />
            <use href={`#hw-icons-${pl}`} clipPath={`url(#hw-under-${pl})`} opacity={UNDER_ALPHA} />
            <path data-fill fill={`url(#hw-${pl})`} />
          </g>
        ))}
        <path data-crest fill="none" style={{ stroke: 'var(--h-c3)' }} strokeOpacity="0.45" strokeWidth="1.5" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};
