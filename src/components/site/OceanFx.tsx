import { useEffect, useRef } from 'react';
import { onTick, pointer, prefersReducedMotion } from '@/lib/ticker';
import { onQuality, quality } from '@/lib/perf';
import { currentElement, onThemeChange } from '@/lib/theme';
import { OCEAN_FX, type Fx } from '@/lib/oceanFx';

// The picked element's effect, rising from the bottom of the screen behind
// the content (src/lib/oceanFx.ts). Full width, reaching higher on the
// sides than in the middle, where the text is, and fading into the page
// through a mask baked once per size. PC at full quality only.

const HEIGHT = 0.7; // of the viewport
const OPACITY = 0.8; // every effect, times its gain
const SWAP_MS = 350;
const NOT_HERE = 'a, button, input, textarea, select, label, [role="button"], [data-no-fx]';

// Alpha mask: opaque at the bottom, fading out above a curve that sits at
// 95% of the height on the sides and 45% in the middle.
function bakeMask(w: number, h: number) {
  const W = Math.max(2, Math.round(w / 8)), H = Math.max(2, Math.round(h / 8)), c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!, img = g.createImageData(W, H), FADE = 0.4;
  for (let i = 0; i < W; i++) {
    const reach = 0.45 + 0.5 * Math.abs((2 * i) / (W - 1) - 1) ** 1.6;
    for (let j = 0; j < H; j++) {
      const up = 1 - j / (H - 1), k = Math.min(1, Math.max(0, (reach - up) / FADE)), o = (j * W + i) * 4;
      img.data[o + 3] = k * k * (3 - 2 * k) * 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL();
}

export const OceanFx = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || prefersReducedMotion()) return;
    const fine = window.matchMedia('(pointer: fine)');

    let vw = 0, vh = 0, h = 0;
    const fit = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      vw = window.innerWidth;
      vh = window.innerHeight;
      h = Math.round(vh * HEIGHT);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const url = `url(${bakeMask(vw, h)})`;
      canvas.style.maskImage = url;
      canvas.style.webkitMaskImage = url;
    };
    fit();
    window.addEventListener('resize', fit);

    // The current element's effect, run ahead a few seconds so it starts
    // grown in (frost, roots); on a change it fades out, swaps, fades in.
    const make = (key: string) => {
      const f = (OCEAN_FX[key] ?? OCEAN_FX.aqua).make(vw);
      for (let i = 0; i < 80; i++) f.draw(ctx, vw, h, 0.05);
      ctx.clearRect(0, 0, vw, h);
      return f;
    };
    let id = currentElement();
    let fx: Fx = make(id);
    let swap = 0;
    const show = () => { canvas.style.opacity = String(OPACITY * (OCEAN_FX[id]?.gain ?? 1)); };
    show();
    const offTheme = onThemeChange(() => {
      const next = currentElement();
      if (next === id) return;
      canvas.style.opacity = '0';
      clearTimeout(swap);
      swap = window.setTimeout(() => {
        id = next;
        fx = make(id);
        show();
      }, SWAP_MS);
    });

    const enabled = () => quality() === 2 && fine.matches;
    const sync = () => { canvas.style.display = enabled() ? '' : 'none'; };
    sync();
    const offQuality = onQuality(sync);
    fine.addEventListener('change', sync);

    const onDown = (e: PointerEvent) => {
      const top = vh - h;
      if (!enabled() || e.clientY < top || (e.target as Element | null)?.closest?.(NOT_HERE)) return;
      fx.click?.(vw, h, e.clientX, e.clientY - top);
    };
    window.addEventListener('pointerdown', onDown, { passive: true });

    // Nothing above the black element band (same rule as the ocean layer).
    let band: HTMLElement | null = null;
    const clearAboveBand = (top: number) => {
      if (!band?.isConnected) band = document.querySelector<HTMLElement>('[data-ocean-top]');
      if (!band) return;
      const r = band.getBoundingClientRect();
      if (r.bottom + 40 < top) return; // band is above the box
      const a = (-2 * Math.PI) / 180, half = band.offsetHeight / 2;
      const mx = r.left + r.width / 2 - half * Math.sin(a), my = r.top + r.height / 2 + half * Math.cos(a) - top;
      const yAt = (x: number) => my + (x - mx) * Math.tan(a);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(0, yAt(0)); ctx.lineTo(vw, yAt(vw)); ctx.lineTo(vw, 0); ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const off = onTick((_, dt) => {
      if (!enabled()) return;
      const top = vh - h;
      fx.move?.(pointer.active ? pointer.x : null, pointer.y - top);
      ctx.clearRect(0, 0, vw, h);
      fx.draw(ctx, vw, h, dt);
      clearAboveBand(top);
    });

    return () => {
      off();
      offTheme();
      offQuality();
      clearTimeout(swap);
      fine.removeEventListener('change', sync);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', fit);
    };
  }, []);

  return <canvas ref={ref} className="ocean-fx" aria-hidden="true" />;
};
