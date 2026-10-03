import { useEffect, useRef } from 'react';
import { onTick, pointer, prefersReducedMotion } from '@/lib/ticker';
import { onQuality, quality } from '@/lib/perf';
import { currentElement, onThemeChange } from '@/lib/theme';
import { OCEAN_FX, type Fx } from '@/lib/oceanFx';

// The picked element's effect behind the whole ocean (src/lib/oceanFx.ts).
// A screen-sized canvas; what grows on the seabed hangs off the end of the
// page, the rest fills the screen. A mask tied to the page fades it in with
// depth: nothing at the top of the ocean, a trace behind the cards, full at
// the end; the middle of the screen, where the text is, stays dimmer than
// the sides. PC only, and not at the minimal quality level.

const OPACITY = 0.8; // every effect, times its gain
const SWAP_MS = 350;
const NOT_HERE = 'a, button, input, textarea, select, label, [role="button"], [data-no-fx]';
const SIDES = 'linear-gradient(to right, #000, rgba(0,0,0,0.55) 50%, #000)';

export const OceanFx = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || prefersReducedMotion()) return;
    const fine = window.matchMedia('(pointer: fine)');

    // Where the ocean starts on the page: under the black element band, or
    // half a screen down on pages without it.
    let band: HTMLElement | null = null;
    const findBand = () => {
      if (!band?.isConnected) band = document.querySelector<HTMLElement>('[data-ocean-top]');
      return band;
    };

    let vw = 0, vh = 0, pageH = 1, oceanTop = 0;
    const layout = () => {
      pageH = Math.max(document.documentElement.scrollHeight, vh);
      const b = findBand();
      oceanTop = b ? b.getBoundingClientRect().bottom + window.scrollY : vh * 0.5;
      // depth fade over the page: 0 at the top of the ocean, a trace behind
      // the cards, full over the last screen
      const end = Math.max(oceanTop + vh, pageH - vh * 0.6), mid = (oceanTop + end) / 2;
      const depth = `linear-gradient(to bottom, transparent ${oceanTop}px, rgba(0,0,0,0.18) ${oceanTop + vh * 0.35}px, rgba(0,0,0,0.4) ${mid}px, #000 ${end}px)`;
      canvas.style.maskImage = canvas.style.webkitMaskImage = `${depth}, ${SIDES}`;
      canvas.style.maskSize = canvas.style.webkitMaskSize = `100% ${pageH}px, 100% 100%`;
    };
    const fit = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    };
    fit();
    window.addEventListener('resize', fit);
    const ro = new ResizeObserver(layout); // the page grows and shrinks (filters, images)
    ro.observe(document.body);
    const floor = () => pageH - window.scrollY;

    // The current element's effect, run ahead a few seconds so it starts
    // grown in (frost, roots); on a change it fades out, swaps, fades in.
    const make = (key: string) => {
      const f = (OCEAN_FX[key] ?? OCEAN_FX.aqua).make(vw);
      const fl = floor();
      for (let i = 0; i < 80; i++) f.draw(ctx, vw, vh, 0.05, fl);
      ctx.clearRect(0, 0, vw, vh);
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

    const enabled = () => quality() >= 1 && fine.matches; // cheap enough for the lighter level too
    const sync = () => { canvas.style.display = enabled() ? '' : 'none'; };
    sync();
    const offQuality = onQuality(sync);
    fine.addEventListener('change', sync);

    const onDown = (e: PointerEvent) => {
      if (!enabled() || e.clientY + window.scrollY < oceanTop || (e.target as Element | null)?.closest?.(NOT_HERE)) return;
      fx.click?.(vw, vh, e.clientX, e.clientY);
    };
    window.addEventListener('pointerdown', onDown, { passive: true });

    // Nothing above the black element band (same rule as the ocean layer).
    const clearAboveBand = () => {
      const b = findBand();
      if (!b) return;
      const r = b.getBoundingClientRect();
      if (r.bottom + 40 < 0) return; // band scrolled away
      const a = (-2 * Math.PI) / 180, half = b.offsetHeight / 2;
      const mx = r.left + r.width / 2 - half * Math.sin(a), my = r.top + r.height / 2 + half * Math.cos(a);
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
      const y = window.scrollY;
      canvas.style.maskPosition = canvas.style.webkitMaskPosition = `0 ${-y}px, 0 0`;
      if (oceanTop - y >= vh) return; // the ocean hasn't started on screen yet
      fx.move?.(pointer.active ? pointer.x : null, pointer.y);
      ctx.clearRect(0, 0, vw, vh);
      fx.draw(ctx, vw, vh, dt, floor());
      clearAboveBand();
    });

    return () => {
      off();
      offTheme();
      offQuality();
      ro.disconnect();
      clearTimeout(swap);
      fine.removeEventListener('change', sync);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', fit);
    };
  }, []);

  return <canvas ref={ref} className="ocean-fx" aria-hidden="true" />;
};
