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
const NODES = 72;
const EDGE = 60; // nodes run this far past both sides, so shifted ends stay hidden
// One petal, in screen px around its centre (HeroWaves undoes the SVG's
// stretch before drawing it).
const PETAL = 'M0 -7 C 5 -5, 6 2, 0 7 C -6 2, -5 -5, 0 -7 Z';

const LAYERS = [
  { base: 95, a: [18, 8], k: [0.007, 0.017], w: [0.45, -0.7], stir: 0.15, phase: 0 },
  { base: 150, a: [14, 7], k: [0.009, 0.021], w: [-0.6, 0.9], stir: 0.35, phase: 2.1 },
  { base: 205, a: [11, 6], k: [0.011, 0.026], w: [0.8, -1.1], stir: 0.7, phase: 4.2 },
];

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
    const spray = [...svg.querySelectorAll<SVGEllipseElement>('[data-spray]')];
    const petalEls = [...svg.querySelectorAll<SVGPathElement>('[data-petal]')];
    const h = new Float32Array(NODES);
    const v = new Float32Array(NODES);
    const xs = new Float32Array(NODES);
    const ys = new Float32Array(NODES);
    const frontX = new Float32Array(NODES);
    const frontY = new Float32Array(NODES);
    // Volta: per-node jitter and the phase of the crawling teeth, both
    // refreshed at ~14 Hz like a flickering current.
    const jitter = new Float32Array(NODES);
    let zapShift = 0;
    let flick = 0;

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
          const x0 = -EDGE + (i / (NODES - 1)) * (W + 2 * EDGE);
          const kx = x0 * S.freq;
          const swell = (1 + S.drift * 0.45 * Math.sin(x0 * 0.0023 + t * 0.3 + n * 2)) * gust * breathe;
          const a0 = L.a[0] * S.amp * swell;
          const a1 = L.a[1] * S.amp * swell;
          const p0 = kx * L.k[0] + t * L.w[0] + L.phase;
          const p1 = kx * L.k[1] + t * L.w[1] + Math.cos(x0 * 0.004 + t * 0.3) * 1.5;
          // Volta bends the sines into triangles.
          let y = a0 * (Math.sin(p0) + S.zig * (tri(p0) - Math.sin(p0))) + a1 * (Math.sin(p1) + S.zig * (tri(p1) - Math.sin(p1)));
          // Pyra: a faster harmonic rolling the other way.
          y += S.fluid * 0.4 * L.a[0] * Math.sin(kx * L.k[0] * 2.7 - t * L.w[0] * 1.9 + L.phase * 2);
          // Cryo / Gaia: slow lumps.
          y += S.lumps * (4 * Math.sin(kx * 0.09 + t * 0.12 + n) + 3 * Math.sin(kx * 0.153 - t * 0.08 + n * 2));
          // Volta: zigzag teeth that crawl along, plus a jittery spark.
          y += S.zig * (5 * ((i + zapShift + n) % 2 ? 1 : -1) * (0.75 + 0.25 * jitter[i]) + 2.5 * jitter[i]);
          // Aero: wind chop.
          y += S.storm * gust * (5 * Math.sin(kx * 0.05 + t * 2.6 + n) + 3.5 * Math.sin(kx * 0.083 - t * 3.1));
          // Aero: crests pulled together into sharp peaks (Gerstner-style;
          // kept under the point where the surface would fold over).
          xs[i] = x0 - S.storm * Math.min(2.6, 0.85 / (a0 * L.k[0] * S.freq || 1)) * a0 * Math.cos(p0);
          ys[i] = base + y + h[i] * L.stir * S.stir;
        }
        const top = curve(S.zig > 0.5);
        fills[n].setAttribute('d', `${top} L${W} ${H} L0 ${H} Z`);
        if (n === LAYERS.length - 1) {
          crest.setAttribute('d', top);
          frontX.set(xs);
          frontY.set(ys);
        }
      });
      // Volta: the crest burns brighter and flickers. Aero: white caps.
      crest.style.stroke = S.zig > 0.5 ? 'var(--h-c1)' : S.storm > 0.5 ? '#fff' : 'var(--h-c3)';
      crest.setAttribute('stroke-opacity', String(Math.min(0.95, 0.45 + S.zig * (0.25 + 0.3 * flick) + S.storm * 0.3 * gust)));
      crest.setAttribute('stroke-width', String(1.5 + S.zig + S.storm * gust));
    };

    // Height of the front surface at x (viewBox units) and its slope.
    const surface = (x: number) => {
      let i = 0;
      while (i < NODES - 2 && frontX[i + 1] < x) i++;
      const span = frontX[i + 1] - frontX[i] || 1;
      const k = Math.min(1, Math.max(0, (x - frontX[i]) / span));
      return { y: frontY[i] + (frontY[i + 1] - frontY[i]) * k, slope: (frontY[i + 1] - frontY[i]) / span };
    };

    // Aero: spray torn off the crests by the wind.
    type Drop = { x: number; y: number; vx: number; vy: number; age: number; life: number; r: number };
    const drops: Drop[] = [];
    // Flora: petals riding the front surface.
    const petals = petalEls.map((_, i) => ({ u: i / petalEls.length + Math.random() * 0.05, speed: 0.008 + Math.random() * 0.01, phase: Math.random() * 6.3, size: 0.8 + Math.random() * 0.5 }));

    const fx = (dt: number, t: number) => {
      const sx = box.w / W || 1;
      const sy = box.h / H || 1;
      const S = style;
      // spawn spray at steep crests during gusts
      if (S.storm > 0.05) {
        for (let i = 2; i < NODES - 2; i++) {
          if (frontY[i] < frontY[i - 1] && frontY[i] < frontY[i + 1] && Math.random() < S.storm * (0.5 + Math.max(0, gust - 1) * 3) * dt * 6 && drops.length < spray.length) {
            for (let k = 0; k < 3 && drops.length < spray.length; k++) {
              drops.push({ x: frontX[i] + k * 4, y: frontY[i], vx: 90 + Math.random() * 120, vy: -(50 + Math.random() * 70), age: 0, life: 0.5 + Math.random() * 0.6, r: 1.6 + Math.random() * 2.2 });
            }
          }
        }
      }
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.age += dt;
        if (d.age >= d.life) { drops.splice(i, 1); continue; }
        d.vy += 170 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
      }
      spray.forEach((el, i) => {
        const d = drops[i];
        if (!d) { el.setAttribute('opacity', '0'); return; }
        el.setAttribute('cx', d.x.toFixed(1));
        el.setAttribute('cy', d.y.toFixed(1));
        el.setAttribute('rx', (d.r / sx).toFixed(2));
        el.setAttribute('ry', (d.r / sy).toFixed(2));
        el.setAttribute('opacity', ((1 - d.age / d.life) * 0.85 * S.storm).toFixed(2));
      });
      // petals drift right, bob and turn with the surface
      petalEls.forEach((el, i) => {
        const p = petals[i];
        p.u = (p.u + p.speed * dt) % 1.04;
        const x = (p.u - 0.02) * W;
        const s = surface(x);
        const tilt = Math.atan(s.slope * sy / sx) * 57.3 + 25 * Math.sin(t * 0.9 + p.phase);
        const y = s.y - 1.5 + Math.sin(t * 1.3 + p.phase) * 1.2;
        el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(1 / sx).toFixed(4)} ${(1 / sy).toFixed(4)}) rotate(${tilt.toFixed(1)}) scale(${p.size.toFixed(2)})`);
        el.setAttribute('opacity', (S.petals * 0.95).toFixed(2));
      });
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
    const off = onTick((_t, dt) => {
      if (!visible) return;
      const px = pointer.x - box.x;
      const py = pointer.y - (box.y - window.scrollY);
      if (pointer.active && px >= 0 && px <= box.w && py >= -60 && py <= box.h) {
        const push = Math.max(-0.6, Math.min(0.6, ((pointer.y - lastY) + Math.abs(pointer.x - lastX) * 0.35) * 0.012));
        const j = (px / box.w) * (NODES - 1);
        for (let i = 0; i < NODES; i++) v[i] += push * Math.exp(-((i - j) ** 2) / 8);
      }
      lastX = pointer.x;
      lastY = pointer.y;
      acc = Math.min(acc + dt, 0.1);
      while (acc >= 1 / 60) { acc -= 1 / 60; step(); }
      const ease = Math.min(1, dt * 3);
      (Object.keys(style) as (keyof WaveStyle)[]).forEach(k => { style[k] += (target[k] - style[k]) * ease; });
      zapClock += dt;
      if (zapClock > 0.07) {
        zapClock = 0;
        zapShift++;
        flick = Math.random();
        for (let i = 0; i < NODES; i++) jitter[i] = Math.random() * 2 - 1;
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
        <path data-fill fill="url(#hw-0)" />
        <path data-fill fill="url(#hw-1)" />
        <path data-fill fill="url(#hw-2)" />
        <path data-crest fill="none" style={{ stroke: 'var(--h-c3)' }} strokeOpacity="0.45" strokeWidth="1.5" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
        {/* Aero spray and Flora petals, positioned every frame */}
        <g style={{ fill: '#fff' }}>
          {Array.from({ length: 70 }, (_, i) => <ellipse key={i} data-spray opacity="0" />)}
        </g>
        <g style={{ fill: 'var(--h-c2)', stroke: 'var(--h-c3)', strokeWidth: 0.8 }}>
          {Array.from({ length: 11 }, (_, i) => <path key={i} data-petal opacity="0" d={PETAL} vectorEffect="non-scaling-stroke" />)}
        </g>
      </svg>
    </div>
  );
};
