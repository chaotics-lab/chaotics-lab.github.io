import { useEffect, useRef } from 'react';
import { docOffset, onTick, pointer, prefersReducedMotion } from '@/lib/ticker';

// Water at the foot of the hero. Each layer is a sum of sines; the front
// layer also carries a spring chain that the pointer nudges a little.
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

    const curve = () => {
      let d = `M0 ${ys[0].toFixed(1)}`;
      for (let i = 1; i < NODES - 1; i++) {
        const x = (i / (NODES - 1)) * W;
        const nx = ((i + 1) / (NODES - 1)) * W;
        d += ` Q${x.toFixed(1)} ${ys[i].toFixed(1)} ${((x + nx) / 2).toFixed(1)} ${((ys[i] + ys[i + 1]) / 2).toFixed(1)}`;
      }
      return `${d} L${W} ${ys[NODES - 1].toFixed(1)}`;
    };

    const draw = (t: number) => {
      LAYERS.forEach((L, n) => {
        for (let i = 0; i < NODES; i++) {
          const x = (i / (NODES - 1)) * W;
          ys[i] = L.base
            + L.a[0] * Math.sin(x * L.k[0] + t * L.w[0] + L.phase)
            + L.a[1] * Math.sin(x * L.k[1] + t * L.w[1] + Math.cos(x * 0.004 + t * 0.3) * 1.5)
            + h[i] * L.stir;
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
      return () => { window.removeEventListener('resize', measure); io.disconnect(); };
    }

    let lastX = pointer.x;
    let lastY = pointer.y;
    let acc = 0;
    const off = onTick((t, dt) => {
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
      draw(t);
    });

    return () => {
      off();
      window.removeEventListener('resize', measure);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-x-0 bottom-0 h-[34vh] min-h-[180px] pointer-events-none" aria-hidden="true">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="hw-0" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#BFF4FF" stopOpacity="0.14" />
            <stop offset="1" stopColor="#BFF4FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hw-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#16CFFB" stopOpacity="0.2" />
            <stop offset="1" stopColor="#16CFFB" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hw-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#052C7E" stopOpacity="0.45" />
            <stop offset="1" stopColor="#052C7E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path data-fill fill="url(#hw-0)" />
        <path data-fill fill="url(#hw-1)" />
        <path data-fill fill="url(#hw-2)" />
        <path data-crest fill="none" stroke="#BFF4FF" strokeOpacity="0.45" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};
