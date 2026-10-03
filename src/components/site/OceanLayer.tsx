import { useEffect, useRef } from 'react';
import { ELEMENTS } from '@/config/elements';
import { onTick, pointer, prefersReducedMotion } from '@/lib/ticker';
import { quality } from '@/lib/perf';
import { currentIcon, onThemeChange } from '@/lib/theme';

// The whole page is an ocean that gets deeper as you scroll. One fixed
// canvas behind the content draws, in flat shapes:
//   - the element icons as white silhouettes, sinking and tumbling at
//     different depths (far ones smaller, fainter and slower); mostly the
//     picked element's, all elements evenly on project pages; one under the
//     cursor fades to its own colours, and back when the cursor leaves,
//   - tiny element icons rising and twinkling, denser deeper down.
// Positions live in "layer space": x as a fraction of the width, y as a
// fraction of the page height. Things further away (smaller z) move
// slower with the scroll.

type Icon = { img: HTMLCanvasElement | null; tint: HTMLImageElement | null; u: number; x: number; z: number; vu: number; phase: number; tumble: number; hot: number; dim: number; check: number; over?: boolean };
type Speck = { u: number; x: number; z: number; size: number; rot: number; spin: number; phase: number; freq: number; rise: number; main: boolean; id: string };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
// Things an icon dims behind.
const TEXTY = 'p, h1, h2, h3, h4, li, dt, dd, blockquote, pre, table, .h-pill, .w-label';
const TOP = 0.12; // the ocean starts below the hero
const MAX_TILT = (120 * Math.PI) / 180; // icons never turn further than this either way

// Biased towards 1: more things the deeper you go.
const deep = (from: number) => from + (1 - (1 - Math.random()) ** 1.7) * (1 - from);

// Element icon recoloured to a white silhouette, drawn once.
function whiteIcon(src: string, px: number, done: (c: HTMLCanvasElement, img: HTMLImageElement) => void) {
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
    done(c, img);
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
    // When the page grows or shrinks (a filter change, images loading),
    // rescale every depth so things keep their place on the page instead
    // of sliding with the new height.
    const ro = new ResizeObserver(() => {
      const next = Math.max(document.documentElement.scrollHeight, vh);
      if (next === pageH) return;
      const k = pageH / next;
      for (const ic of icons) ic.u *= k;
      for (const sp of specks) sp.u *= k;
      pageH = next;
    });
    ro.observe(document.body);

    // Layer -> screen: centred on the same scroll position as the content
    // at that depth, but moving z times as fast.
    const screenY = (u: number, z: number) => (u * pageH - window.scrollY - vh / 2) * z + vh / 2;

    // 21 icons spread over the whole depth. Two in three are the active
    // element, the rest cycle through the other six.
    const art = new Map<string, HTMLCanvasElement>(), tints = new Map<string, HTMLImageElement>(); // white silhouettes, and the icons in colour
    ELEMENTS.forEach(e => whiteIcon(`/${e.id}.png`, 128, (c, img) => { art.set(e.id, c); tints.set(e.id, img); assign(); }));
    const icons: Icon[] = Array.from({ length: ELEMENTS.length * 3 }, (_, k) => ({
      img: null,
      tint: null,
      u: TOP + (k / (ELEMENTS.length * 3)) * (1 - TOP) + rand(0, 0.03),
      x: k % 3 === 2 ? rand(0.05, 0.95) : sideX(),
      z: k % 3 === 2 ? rand(0.35, 0.5) : rand(0.55, 0.9),
      vu: rand(0.004, 0.009),
      phase: rand(0, Math.PI * 2),
      tumble: rand(0.35, 1),
      hot: 0,
      dim: 1,
      check: Math.floor(Math.random() * 12),
    }));
    const slots = [...icons];
    let assigned = currentIcon();
    function assign() {
      const main = currentIcon();
      assigned = main;
      // no main icon (project pages): every element shows evenly
      const others = ELEMENTS.filter(e => e.id !== main);
      slots.forEach((ic, k) => {
        const id = !main ? ELEMENTS[k % ELEMENTS.length].id : k % 3 === 2 ? others[Math.floor(k / 3) % others.length].id : main;
        ic.img = art.get(id) ?? null;
        ic.tint = tints.get(id) ?? null;
      });
    }
    // On an element change the icons fade out, swap, and fade back in.
    let iconAlpha = 1;
    let swapPending = false;
    const offTheme = onThemeChange(() => { if (currentIcon() !== assigned) swapPending = true; });
    icons.sort((a, b) => a.z - b.z); // far ones first

    // Specks: tiny element icons rising slowly and twinkling, half of them
    // the main icon (when there is one), the rest any element.
    const specks: Speck[] = Array.from({ length: 70 }, () => ({
      u: deep(TOP),
      x: Math.random(),
      z: rand(0.45, 0.9),
      size: rand(7, 13),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.6, 0.6),
      phase: rand(0, Math.PI * 2),
      freq: rand(0.5, 1.4),
      rise: rand(0.004, 0.012),
      main: Math.random() < 0.5,
      id: ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)].id,
    }));


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

    let blank = false;
    const off = onTick((t, dt) => {
      // minimal quality: no ocean at all
      if (quality() === 0) {
        if (!blank) { ctx.clearRect(0, 0, vw, vh); blank = true; }
        return;
      }
      ctx.clearRect(0, 0, vw, vh);
      if (swapPending) {
        iconAlpha -= dt / 0.3;
        if (iconAlpha <= 0) { iconAlpha = 0; swapPending = false; assign(); }
      } else iconAlpha = Math.min(1, iconAlpha + dt / 0.4);
      ctx.save();
      clipBelowBand();

      // Icons sink, sway and tumble, and wrap back to the top of the ocean at
      // the bottom; the one under the cursor fades to its colours.
      for (const ic of icons) {
        ic.u += (ic.vu * ic.z * dt * 120) / pageH;
        if (ic.u > 1.02) ic.u = TOP;
        if (!ic.img) continue;
        const y = screenY(ic.u, ic.z);
        if (y < -80 || y > vh + 80) continue;
        const base = ic.x * vw + Math.sin(t * 0.5 + ic.phase) * 14 * ic.z;
        const size = 18 + ic.z * 46;
        const over = pointer.active && Math.hypot(base - pointer.x, y - pointer.y) < size * 0.6;
        ic.hot += ((over ? 1 : 0) - ic.hot) * Math.min(1, dt * (over ? 6 : 3)); // quick in, slower out
        const fade = Math.max(0, Math.min(1, (ic.u - TOP) / 0.04, (1.02 - ic.u) / 0.04));
        // Fainter while behind text (checked every dozen frames or so).
        if (--ic.check <= 0) {
          ic.check = 12;
          const under = document.elementFromPoint(base, y);
          ic.over = !!under?.closest(TEXTY);
        }
        ic.dim += ((ic.over ? 0.35 : 1) - ic.dim) * Math.min(1, dt * 4);
        const rest = ic.z < 0.5 ? 0.22 : 0.3 + ic.z * 0.45, a = iconAlpha * fade * (ic.dim * rest + (0.95 - ic.dim * rest) * ic.hot);
        ctx.save();
        ctx.translate(base, y);
        // Two slow swings mixed together, so the tumble never repeats
        // exactly but always stays within +-120 degrees.
        const swing = 0.7 * Math.sin(t * 0.37 + ic.phase) + 0.3 * Math.sin(t * 0.83 + ic.phase * 1.7);
        ctx.rotate(swing * ic.tumble * MAX_TILT);
        ctx.globalAlpha = a * (1 - ic.hot);
        ctx.drawImage(ic.img, -size / 2, -size / 2, size, size);
        if (ic.hot > 0.01 && ic.tint) { ctx.globalAlpha = a * ic.hot; ctx.drawImage(ic.tint, -size / 2, -size / 2, size, size); }
        ctx.restore();
      }

      // Specks: tiny icons rising, turning and twinkling; fainter near the
      // surface, brighter in the dark.
      const mainId = currentIcon();
      const mainArt = mainId ? art.get(mainId) : undefined;
      const lite = quality() < 2;
      for (let si = 0; si < specks.length; si++) {
        const sp = specks[si];
        if (lite && si % 2) continue; // lighter: half the specks
        sp.u -= (sp.rise * dt * 60) / pageH;
        if (sp.u < TOP) sp.u = deep(0.5);
        sp.rot += sp.spin * dt;
        const img = sp.main && mainArt ? mainArt : art.get(sp.id);
        if (!img) continue;
        const y = screenY(sp.u, sp.z);
        if (y < -16 || y > vh + 16) continue;
        const x = sp.x * vw + Math.sin(t * 0.35 + sp.phase) * 10;
        const tw = 0.5 + 0.5 * Math.sin(t * sp.freq * 2 + sp.phase);
        const depth = Math.min(1, Math.max(0.25, (sp.u - TOP) / 0.6));
        const size = sp.size * (0.6 + sp.z * 0.6);
        ctx.globalAlpha = iconAlpha * (0.12 + 0.45 * tw) * depth * sp.z;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(sp.rot);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    });

    return () => {
      off();
      offTheme();
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  return <canvas ref={ref} className="ocean-layer" aria-hidden="true" />;
};
