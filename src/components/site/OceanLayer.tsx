import { useEffect, useRef } from 'react';
import { ELEMENTS } from '@/config/elements';
import { onTick, pointer, prefersReducedMotion } from '@/lib/ticker';
import { themeRgb } from '@/lib/theme';

// The whole page is an ocean that gets deeper as you scroll. One fixed
// canvas behind the content draws, in flat shapes:
//   - the element icons as white silhouettes, sinking and tumbling at
//     different depths (far ones smaller, fainter and slower),
//   - Persona-style light: slanted shards rising and twinkling, and
//     four-point glints that flare now and then. Both get denser deeper.
// Positions live in "layer space": x as a fraction of the width, y as a
// fraction of the page height. Things further away (smaller z) move
// slower with the scroll.

type Icon = { img: HTMLCanvasElement | null; u: number; x: number; z: number; vu: number; phase: number; tumble: number; nx: number };
type Shard = { u: number; x: number; z: number; len: number; tilt: number; phase: number; freq: number; rise: number; tone: number };
type Glint = { u: number; x: number; z: number; size: number; t: number; life: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const TOP = 0.12; // the ocean starts below the hero
const MAX_TILT = (120 * Math.PI) / 180; // icons never turn further than this either way

// Biased towards 1: more things the deeper you go.
const deep = (from: number) => from + (1 - (1 - Math.random()) ** 1.7) * (1 - from);

// Element icon recoloured to a white silhouette, drawn once.
function whiteIcon(src: string, px: number, done: (c: HTMLCanvasElement) => void) {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = c.height = px;
    const g = c.getContext('2d');
    if (!g) return;
    g.drawImage(img, 0, 0, px, px);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 0, px, px);
    done(c);
  };
  img.src = src;
}

// Keep icons mostly towards the sides, where there is no text.
const sideX = () => (Math.random() < 0.5 ? rand(0.02, 0.16) : rand(0.84, 0.98));

export const OceanLayer = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || prefersReducedMotion()) return;

    let vw = 0;
    let vh = 0;
    let pageH = 1;
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pageH = Math.max(document.documentElement.scrollHeight, vh);
    };
    fit();
    window.addEventListener('resize', fit);
    const ro = new ResizeObserver(() => { pageH = Math.max(document.documentElement.scrollHeight, vh); });
    ro.observe(document.body);

    // Layer -> screen: centred on the same scroll position as the content
    // at that depth, but moving z times as fast.
    const screenY = (u: number, z: number) => (u * pageH - window.scrollY - vh / 2) * z + vh / 2;

    // Three of each element, spread over the whole depth.
    const icons: Icon[] = [];
    ELEMENTS.forEach((e, i) => {
      const copies: Icon[] = [0, 1, 2].map(n => ({
        img: null,
        u: TOP + ((i * 3 + n) / (ELEMENTS.length * 3)) * (1 - TOP) + rand(0, 0.03),
        x: n === 2 ? rand(0.05, 0.95) : sideX(),
        z: n === 2 ? rand(0.35, 0.5) : rand(0.55, 0.9),
        vu: rand(0.004, 0.009),
        phase: rand(0, Math.PI * 2),
        tumble: rand(0.35, 1),
        nx: 0,
      }));
      icons.push(...copies);
      whiteIcon(`/${e.id}.png`, 128, c => copies.forEach(ic => { ic.img = c; }));
    });
    icons.sort((a, b) => a.z - b.z); // far ones first

    const shards: Shard[] = Array.from({ length: 110 }, () => ({
      u: deep(TOP),
      x: Math.random(),
      z: rand(0.45, 0.9),
      len: rand(4, 11),
      tilt: rand(-0.5, -0.2),
      phase: rand(0, Math.PI * 2),
      freq: rand(0.5, 1.4),
      rise: rand(0.004, 0.012),
      tone: Math.floor(Math.random() * 4), // c1, c2, c3 or white
    }));

    const glints: Glint[] = [];
    let glintClock = 0;

    // Nothing is drawn above the black element band: clip to the area under
    // its slanted bottom edge. Pages without the band draw everywhere.
    let band: HTMLElement | null = null;
    const clipBelowBand = () => {
      if (!band?.isConnected) band = document.querySelector<HTMLElement>('[data-ocean-top]');
      if (!band) return;
      const r = band.getBoundingClientRect();
      const a = (-2 * Math.PI) / 180; // matches the band's -rotate-2
      const h = band.offsetHeight / 2;
      const mx = r.left + r.width / 2 - h * Math.sin(a);
      const my = r.top + r.height / 2 + h * Math.cos(a);
      const yAt = (x: number) => my + (x - mx) * Math.tan(a);
      ctx.beginPath();
      ctx.moveTo(0, yAt(0));
      ctx.lineTo(vw, yAt(vw));
      ctx.lineTo(vw, vh);
      ctx.lineTo(0, vh);
      ctx.closePath();
      ctx.clip();
    };

    const off = onTick((t, dt) => {
      ctx.clearRect(0, 0, vw, vh);
      ctx.save();
      clipBelowBand();

      // Icons sink, sway and tumble, wrap back to the top of the ocean at
      // the bottom, and drift aside from the cursor.
      for (const ic of icons) {
        ic.u += (ic.vu * ic.z * dt * 120) / pageH;
        if (ic.u > 1.02) ic.u = TOP;
        if (!ic.img) continue;
        const y = screenY(ic.u, ic.z);
        if (y < -80 || y > vh + 80) continue;
        const base = ic.x * vw + Math.sin(t * 0.5 + ic.phase) * 14 * ic.z;
        if (pointer.active) {
          const dx = base + ic.nx - pointer.x;
          const dy = y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < 140) ic.nx += (dx / (d || 1)) * (140 - d) * 0.02 * ic.z;
        }
        ic.nx *= 0.97;
        const fade = Math.max(0, Math.min(1, (ic.u - TOP) / 0.04, (1.02 - ic.u) / 0.04));
        const size = 18 + ic.z * 46;
        ctx.save();
        ctx.globalAlpha = fade * (ic.z < 0.5 ? 0.22 : 0.3 + ic.z * 0.45);
        ctx.translate(base + ic.nx, y);
        // Two slow swings mixed together, so the tumble never repeats
        // exactly but always stays within +-120 degrees.
        const swing = 0.7 * Math.sin(t * 0.37 + ic.phase) + 0.3 * Math.sin(t * 0.83 + ic.phase * 1.7);
        ctx.rotate(swing * ic.tumble * MAX_TILT);
        ctx.drawImage(ic.img, -size / 2, -size / 2, size, size);
        ctx.restore();
      }

      // Shards: slanted slivers of light rising slowly, twinkling.
      const rgb = themeRgb();
      const tones = [rgb.c1, rgb.c2, rgb.c3, '255, 255, 255'].map(c => `rgb(${c})`);
      for (const s of shards) {
        s.u -= (s.rise * dt * 60) / pageH;
        if (s.u < TOP) s.u = deep(0.5);
        const y = screenY(s.u, s.z);
        if (y < -12 || y > vh + 12) continue;
        const x = s.x * vw + Math.sin(t * 0.35 + s.phase) * 10;
        const tw = 0.5 + 0.5 * Math.sin(t * s.freq * 2 + s.phase);
        // fainter near the surface, brighter in the dark
        const depth = Math.min(1, Math.max(0.25, (s.u - TOP) / 0.6));
        ctx.globalAlpha = (0.15 + 0.6 * tw) * depth * s.z;
        ctx.fillStyle = tones[s.tone];
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(s.tilt);
        ctx.transform(1, 0, -0.36, 1, 0, 0); // skewX(-20deg), like the AI tag bars
        const l = s.len * s.z;
        ctx.fillRect(-l / 2, -1.4, l, 2.8);
        ctx.restore();
      }

      // Glints: a four-point star that flares and fades. More appear
      // deeper down, so they spawn at random depths biased to the bottom.
      glintClock += dt;
      if (glintClock > 0.18 && glints.length < 14) {
        glintClock = 0;
        const u = deep(0.3);
        const z = rand(0.5, 0.9);
        const y = screenY(u, z);
        if (y > 0 && y < vh) glints.push({ u, x: Math.random(), z, size: rand(5, 11), t: 0, life: rand(0.6, 1) });
      }
      ctx.fillStyle = '#FFFFFF';
      for (let i = glints.length - 1; i >= 0; i--) {
        const g = glints[i];
        g.t += dt;
        const k = g.t / g.life;
        if (k >= 1) { glints.splice(i, 1); continue; }
        const flare = Math.sin(k * Math.PI);
        const y = screenY(g.u, g.z);
        const x = g.x * vw;
        const r = g.size * g.z * flare;
        ctx.globalAlpha = 0.9 * flare;
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.quadraticCurveTo(x, y, x + r * 0.55, y);
        ctx.quadraticCurveTo(x, y, x, y + r);
        ctx.quadraticCurveTo(x, y, x - r * 0.55, y);
        ctx.quadraticCurveTo(x, y, x, y - r);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    });

    return () => {
      off();
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  return <canvas ref={ref} className="ocean-layer" aria-hidden="true" />;
};
