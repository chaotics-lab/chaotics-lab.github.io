import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { onTick, pointer, prefersReducedMotion } from '@/lib/ticker';
import { onQuality, quality } from '@/lib/perf';
import { currentElement, onThemeChange } from '@/lib/theme';
import { OCEAN_FX, type Fx } from '@/lib/oceanFx';

// The picked element's effect behind the whole ocean (src/lib/oceanFx.ts).
// A screen-sized canvas per effect, plus the effect's own pictures that only
// move (placed by the compositor); what grows on the seabed hangs off the
// end of the page, the rest fills the screen. A mask tied to the page fades it in with
// depth: nothing at the top of the ocean, a trace behind the cards, full at
// the end; the middle of the screen, where the text is, stays dimmer than
// the sides. PC only, not at the minimal quality level, and not on project
// pages (they keep the icons only).

const OPACITY = 0.8; // every effect, times its gain
const FADE_S = 0.4; // crossfade between elements (the switch itself happens under the element transition)
const STEP = 1 / 30 - 0.004; // drawing interval while the page is still (a little early, so 60 Hz screens hit every other frame)
const WARM_PER_FRAME = 10; // run-ahead steps per frame (OCEAN_FX[id].warm), so a switch never stalls
const NOT_HERE = 'a, button, input, textarea, select, label, [role="button"], [data-no-fx]';
const SIDES = 'linear-gradient(to right, #000, rgba(0,0,0,0.55) 50%, #000)';

export const OceanFx = () => {
  const onProject = useLocation().pathname.startsWith('/project/');
  return onProject ? null : <OceanFxCanvas />;
};

const OceanFxCanvas = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || prefersReducedMotion()) return;
    const fine = window.matchMedia('(pointer: fine)');

    // Where the ocean starts on the page: under the black element band, or
    // half a screen down on pages without it.
    let band: HTMLElement | null = null;
    const findBand = () => {
      if (!band?.isConnected) band = document.querySelector<HTMLElement>('[data-ocean-top]');
      return band;
    };

    // Each effect draws into its own canvas, at most one canvas pixel per CSS
    // pixel (the effects are soft; more pixels would cost more than they show).
    let vw = 0, vh = 0, res = 1, pageH = 1, oceanTop = 0;
    type Layer = { id: string; fx: Fx; el: HTMLDivElement; c: HTMLCanvasElement; g: CanvasRenderingContext2D; warm: number; k: number; dir: 1 | -1; op: number };
    const layers: Layer[] = [];
    function sizeLayer(l: Layer) {
      const r = res * (OCEAN_FX[l.id]?.res ?? 1);
      l.c.width = Math.round(vw * r);
      l.c.height = Math.round(vh * r);
      l.g.setTransform(l.c.width / vw, 0, 0, l.c.height / vh, 0, 0);
    }
    const layout = () => {
      pageH = Math.max(document.documentElement.scrollHeight, vh);
      const b = findBand(), H = pageH + vh;
      // the ocean starts at the band's lower edge, which is tilted like the band (-2 degrees)
      let tilt = 0, mx = vw / 2;
      if (b) {
        const r = b.getBoundingClientRect(), half = b.offsetHeight / 2;
        tilt = (-2 * Math.PI) / 180;
        mx = r.left + r.width / 2 - half * Math.sin(tilt);
        oceanTop = r.top + r.height / 2 + half * Math.cos(tilt) + window.scrollY;
      } else oceanTop = vh * 0.5;
      // depth fade over the page: 0 at the top of the ocean, a trace behind
      // the cards, full over the last screen. The gradient runs at the
      // band's angle, so its lines are parallel to the band's edge: stops are
      // given as page heights along the vertical through (mx, y)
      const A = Math.PI + tilt, L = Math.abs(vw * Math.sin(A)) + Math.abs(H * Math.cos(A));
      const at = (y: number) => `${((mx - vw / 2) * Math.sin(A) - (y - H / 2) * Math.cos(A) + L / 2).toFixed(1)}px`;
      const end = Math.max(oceanTop + vh, pageH - vh * 0.6), mid = (oceanTop + end) / 2;
      const depth = `linear-gradient(${(A * 180) / Math.PI}deg, transparent ${at(oceanTop)}, rgba(0,0,0,0.18) ${at(oceanTop + vh * 0.35)}, rgba(0,0,0,0.4) ${at(mid)}, #000 ${at(end)})`;
      host.style.maskImage = host.style.webkitMaskImage = `${depth}, ${SIDES}`;
      // one screen past the page end too, so an overscroll bounce does not cut it
      host.style.maskSize = host.style.webkitMaskSize = `100% ${H}px, 100% 100%`;
      lastY = NaN;
    };
    const fit = () => {
      res = Math.min(1, window.devicePixelRatio || 1) * (quality() >= 2 ? 1 : 0.75);
      vw = window.innerWidth;
      vh = window.innerHeight;
      for (const l of layers) sizeLayer(l);
      layout();
    };
    let lastY = NaN;
    fit();
    window.addEventListener('resize', fit);
    const ro = new ResizeObserver(layout); // the page grows and shrinks (filters, images)
    ro.observe(document.body);
    const floor = () => pageH - window.scrollY;

    // On a switch the old effect keeps running while it fades out and the
    // new one fades in (eased both ways, on the canvases' opacity, so the
    // compositor blends them); the new one is first run ahead if it has to
    // grow in (frost), a few steps per frame.
    const addLayer = (id: string) => {
      const def = OCEAN_FX[id] ?? OCEAN_FX.aqua, el = document.createElement('div'), c = document.createElement('canvas'), fx = def.make(vw);
      const l: Layer = { id, fx, el, c, g: c.getContext('2d')!, warm: def.warm ?? 0, k: 0, dir: 1, op: -1 };
      el.style.opacity = '0';
      el.append(...(fx.els ?? []), c); // the effect's own elements behind its drawing
      sizeLayer(l);
      layers.push(l);
      host.appendChild(el);
    };
    const dropLayer = (i: number) => { layers[i].el.remove(); layers.splice(i, 1); };
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
      for (let i = layers.length - 1; i >= 0; i--) if (layers[i].warm > 0) dropLayer(i); // never shown: drop it
      for (const l of layers) l.dir = -1;
      addLayer(id);
    });
    const newest = () => layers[layers.length - 1];

    const enabled = () => quality() >= 1 && fine.matches; // cheap enough for the lighter level too
    const sync = () => { host.style.display = enabled() ? '' : 'none'; };
    sync();
    const offQuality = onQuality(() => { sync(); fit(); });
    fine.addEventListener('change', sync);

    const onDown = (e: PointerEvent) => {
      if (!enabled() || e.clientY + window.scrollY < oceanTop || (e.target as Element | null)?.closest?.(NOT_HERE)) return;
      newest()?.fx.click?.(vw, vh, e.clientX, e.clientY);
    };
    window.addEventListener('pointerdown', onDown, { passive: true });

    // 30 drawings a second while the page is still, which is plenty for
    // these slow motions; every frame while it scrolls, so what sits on
    // the seabed moves with the page.
    let acc = 0;
    const off = onTick((_, dt) => {
      if (!enabled()) return;
      const y = window.scrollY, scrolled = y !== lastY;
      // the page height can change without the body resizing (late images, fonts): follow it live
      if (Math.max(document.documentElement.scrollHeight, vh) !== pageH) layout();
      if (scrolled) { host.style.maskPosition = host.style.webkitMaskPosition = `0 ${-y}px, 0 0`; lastY = y; }
      if (oceanTop - y >= vh) return; // the ocean hasn't started on screen yet
      acc += dt;
      if (!scrolled && acc < STEP) return;
      const step = Math.min(0.1, acc);
      acc = 0;
      const fl = floor(), px = pointer.active ? pointer.x : null;
      for (let i = layers.length - 1; i >= 0; i--) {
        const l = layers[i];
        if (l.warm > 0) { // running ahead, not shown yet
          for (let n = Math.min(WARM_PER_FRAME, l.warm); n > 0; n--) l.fx.draw(scratch, vw, vh, 0.05, fl); // simulate only: output to a 1 px target
          l.warm -= WARM_PER_FRAME;
          continue;
        }
        l.k = Math.max(0, Math.min(1, l.k + (l.dir * step) / FADE_S));
        if (l.dir < 0 && l.k === 0) { dropLayer(i); continue; }
        const op = Math.round(ease(l.k) * (OCEAN_FX[l.id]?.gain ?? 1) * OPACITY * 1000) / 1000;
        if (op !== l.op) { l.el.style.opacity = String(op); l.op = op; }
        l.fx.move?.(px, pointer.y);
        l.g.clearRect(0, 0, vw, vh);
        l.fx.draw(l.g, vw, vh, step, fl);
      }
    });

    return () => {
      off();
      offTheme();
      offQuality();
      ro.disconnect();
      for (let i = layers.length - 1; i >= 0; i--) dropLayer(i);
      fine.removeEventListener('change', sync);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', fit);
    };
  }, []);

  return <div ref={ref} className="ocean-fx" aria-hidden="true" />;
};
