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
const FADE_S = 0.7; // crossfade between elements, close to the colour blend
const WARM_PER_FRAME = 10; // run-ahead steps per frame (OCEAN_FX[id].warm), so a switch never stalls
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
    type Layer = { id: string; fx: Fx; c: HTMLCanvasElement; g: CanvasRenderingContext2D; warm: number; k: number; dir: 1 | -1 };
    const layers: Layer[] = [];
    function sizeLayer(l: Layer) {
      l.c.width = canvas!.width;
      l.c.height = canvas!.height;
      l.g.setTransform(canvas!.width / vw, 0, 0, canvas!.height / vh, 0, 0);
    }
    const layout = () => {
      pageH = Math.max(document.documentElement.scrollHeight, vh);
      const b = findBand();
      oceanTop = b ? b.getBoundingClientRect().bottom + window.scrollY : vh * 0.5;
      // depth fade over the page: 0 at the top of the ocean, a trace behind
      // the cards, full over the last screen
      const end = Math.max(oceanTop + vh, pageH - vh * 0.6), mid = (oceanTop + end) / 2;
      const depth = `linear-gradient(to bottom, transparent ${oceanTop}px, rgba(0,0,0,0.18) ${oceanTop + vh * 0.35}px, rgba(0,0,0,0.4) ${mid}px, #000 ${end}px)`;
      canvas.style.maskImage = canvas.style.webkitMaskImage = `${depth}, ${SIDES}`;
      // one screen past the page end too, so an overscroll bounce does not cut it
      canvas.style.maskSize = canvas.style.webkitMaskSize = `100% ${pageH + vh}px, 100% 100%`;
    };
    const fit = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const l of layers) sizeLayer(l);
      layout();
    };
    fit();
    window.addEventListener('resize', fit);
    const ro = new ResizeObserver(layout); // the page grows and shrinks (filters, images)
    ro.observe(document.body);
    const floor = () => pageH - window.scrollY;

    // Each effect draws into its own layer; the layers are composited with
    // their gain and fade. On a switch the old one keeps running while it
    // fades out and the new one fades in (eased both ways); the new one is
    // first run ahead if it has to grow in (frost), a few steps per frame.
    const addLayer = (id: string) => {
      const def = OCEAN_FX[id] ?? OCEAN_FX.aqua, c = document.createElement('canvas'), l: Layer = { id, fx: def.make(vw), c, g: c.getContext('2d')!, warm: def.warm ?? 0, k: 0, dir: 1 };
      sizeLayer(l);
      layers.push(l);
    };
    const ease = (k: number) => k * k * (3 - 2 * k);
    const scratchCanvas = document.createElement('canvas');
    scratchCanvas.width = scratchCanvas.height = 1;
    const scratch = scratchCanvas.getContext('2d')!;
    let id = currentElement();
    addLayer(id);
    const offTheme = onThemeChange(() => {
      const next = currentElement();
      if (next === id) return;
      id = next;
      for (let i = layers.length - 1; i >= 0; i--) if (layers[i].warm > 0) layers.splice(i, 1); // never shown: drop it
      for (const l of layers) l.dir = -1;
      addLayer(id);
    });
    const newest = () => layers[layers.length - 1];
    canvas.style.opacity = String(OPACITY);

    const enabled = () => quality() >= 1 && fine.matches; // cheap enough for the lighter level too
    const sync = () => { canvas.style.display = enabled() ? '' : 'none'; };
    sync();
    const offQuality = onQuality(sync);
    fine.addEventListener('change', sync);

    const onDown = (e: PointerEvent) => {
      if (!enabled() || e.clientY + window.scrollY < oceanTop || (e.target as Element | null)?.closest?.(NOT_HERE)) return;
      newest()?.fx.click?.(vw, vh, e.clientX, e.clientY);
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
      // the page height can change without the body resizing (late images, fonts): follow it live
      if (Math.max(document.documentElement.scrollHeight, vh) !== pageH) layout();
      canvas.style.maskPosition = canvas.style.webkitMaskPosition = `0 ${-y}px, 0 0`;
      if (oceanTop - y >= vh) return; // the ocean hasn't started on screen yet
      const fl = floor(), px = pointer.active ? pointer.x : null;
      ctx.clearRect(0, 0, vw, vh);
      for (let i = layers.length - 1; i >= 0; i--) {
        const l = layers[i];
        if (l.warm > 0) { // running ahead, not shown yet
          for (let n = Math.min(WARM_PER_FRAME, l.warm); n > 0; n--) l.fx.draw(scratch, vw, vh, 0.05, fl); // simulate only: output to a 1 px target
          l.warm -= WARM_PER_FRAME;
          continue;
        }
        l.k = Math.max(0, Math.min(1, l.k + (l.dir * dt) / FADE_S));
        if (l.dir < 0 && l.k === 0) { layers.splice(i, 1); continue; }
      }
      for (const l of layers) {
        if (l.warm > 0) continue;
        l.fx.move?.(px, pointer.y);
        l.g.clearRect(0, 0, vw, vh);
        l.fx.draw(l.g, vw, vh, dt, fl);
        ctx.globalAlpha = ease(l.k) * (OCEAN_FX[l.id]?.gain ?? 1);
        ctx.drawImage(l.c, 0, 0, vw, vh);
      }
      ctx.globalAlpha = 1;
      clearAboveBand();
    });

    return () => {
      off();
      offTheme();
      offQuality();
      ro.disconnect();
      fine.removeEventListener('change', sync);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', fit);
    };
  }, []);

  return <canvas ref={ref} className="ocean-fx" aria-hidden="true" />;
};
