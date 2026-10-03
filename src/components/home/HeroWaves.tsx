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
    const h = new Float32Array(NODES);
    const v = new Float32Array(NODES);
    const ys = new Float32Array(NODES);

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

    const curve = () => {
      let d = `M0 ${ys[0].toFixed(1)}`;
      // Sharp water (Volta): straight segments between every third node.
      if (style.sharp > 0.5) {
        for (let i = 3; i < NODES; i += 3) d += ` L${((i / (NODES - 1)) * W).toFixed(1)} ${ys[i].toFixed(1)}`;
        return `${d} L${W} ${ys[NODES - 1].toFixed(1)}`;
      }
      for (let i = 1; i < NODES - 1; i++) {
        const x = (i / (NODES - 1)) * W;
        const nx = ((i + 1) / (NODES - 1)) * W;
        d += ` Q${x.toFixed(1)} ${ys[i].toFixed(1)} ${((x + nx) / 2).toFixed(1)} ${((ys[i] + ys[i + 1]) / 2).toFixed(1)}`;
      }
      return `${d} L${W} ${ys[NODES - 1].toFixed(1)}`;
    };

    const draw = (t: number) => {
      const S = style;
      LAYERS.forEach((L, n) => {
        const peak = (L.a[0] + L.a[1]) * S.amp;
        // Aero: the layer's depth wanders on its own.
        const base = L.base + S.drift * (14 * Math.sin(t * 0.21 + n * 1.7) + 9 * Math.sin(t * 0.47 + n * 3.1));
        for (let i = 0; i < NODES; i++) {
          const x = (i / (NODES - 1)) * W;
          const kx = x * S.freq;
          const swell = 1 + S.drift * 0.45 * Math.sin(x * 0.0023 + t * 0.3 + n * 2);
          let y = S.amp * swell * (
            L.a[0] * Math.sin(kx * L.k[0] + t * L.w[0] + L.phase)
            + L.a[1] * Math.sin(kx * L.k[1] + t * L.w[1] + Math.cos(x * 0.004 + t * 0.3) * 1.5)
          );
          // Pyra: a faster harmonic rolling the other way.
          y += S.fluid * 0.4 * L.a[0] * Math.sin(kx * L.k[0] * 2.7 - t * L.w[0] * 1.9 + L.phase * 2);
          // Volta: flatten crests and troughs into plateaus.
          if (S.sharp > 0) y += S.sharp * (Math.sign(y) * peak * (Math.abs(y) / peak) ** 0.35 - y);
          // Cryo / Gaia: slow lumps.
          y += S.lumps * (4 * Math.sin(kx * 0.09 + t * 0.12 + n) + 3 * Math.sin(kx * 0.153 - t * 0.08 + n * 2));
          ys[i] = base + y + h[i] * L.stir * S.stir;
        }
        const top = curve();
        fills[n].setAttribute('d', `${top} L${W} ${H} L0 ${H} Z`);
        if (n === LAYERS.length - 1) crest.setAttribute('d', top);
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
      clock += dt * style.speed;
      draw(clock);
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
        <path data-crest fill="none" style={{ stroke: 'var(--h-c3)' }} strokeOpacity="0.45" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};
