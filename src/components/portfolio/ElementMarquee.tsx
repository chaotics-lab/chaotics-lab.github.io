import { useEffect, useRef, useState } from 'react';
import { ELEMENTS } from '@/config/elements';
import { currentElement, onThemeChange } from '@/lib/theme';
import { ring, switchElement } from '@/lib/elementSwitch';
import { onTick, prefersReducedMotion } from '@/lib/ticker';
import { IconTile } from './IconTile';

const LOOP_S = 38; // seconds for one full loop at normal speed
const DRAG_PX = 6; // movement that turns a press into a drag (no click)
const NUDGE_KEY = 'lox-el-nudged', NUDGE_AFTER_MS = 3500;

// Slanted black band with the elements scrolling past (P5-style ticker).
// The list is rendered twice and wraps at half its width, so the loop is
// seamless. It can be dragged (finger or mouse) and keeps a little momentum;
// hovering eases it down to 20% speed. A tap or click picks an element and
// switches the colour scheme (src/lib/elementSwitch.ts). The ocean layer is clipped to the
// band's bottom edge, found through data-ocean-top.
export const ElementMarquee = () => {
  const [active, setActive] = useState(currentElement);
  useEffect(() => onThemeChange(() => setActive(currentElement())), []);

  const trackRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  // Once per visit, if the band has been in view for a few seconds and
  // nobody has touched it: two elements near the middle hop in turn, each
  // with a small ring in its colour, the hint that these do something.
  useEffect(() => {
    const band = bandRef.current;
    if (!band || prefersReducedMotion()) return;
    try { if (sessionStorage.getItem(NUDGE_KEY)) return; } catch { /* storage unavailable */ }
    let timer = 0;
    const nudge = () => {
      if (touched.current) return;
      const w = window.innerWidth, picks = [...band.querySelectorAll<HTMLElement>('.e-pick')].filter(el => {
        const r = el.getBoundingClientRect();
        return el.getAttribute('aria-pressed') !== 'true' && r.left > w * 0.2 && r.right < w * 0.8;
      });
      const mid = Math.floor(picks.length / 2), two = picks.slice(Math.max(0, mid - 1), mid + 1);
      if (!two.length) return;
      try { sessionStorage.setItem(NUDGE_KEY, '1'); } catch { /* storage unavailable */ }
      two.forEach((el, i) => window.setTimeout(() => {
        const tile = el.querySelector('.e-tile');
        if (!tile || touched.current) return;
        tile.classList.add('e-nudge');
        window.setTimeout(() => tile.classList.remove('e-nudge'), 800);
        const r = tile.getBoundingClientRect();
        ring(r.left + r.width / 2, r.top + r.height / 2, getComputedStyle(el).getPropertyValue('--el'), 120, true);
      }, i * 450));
      io.disconnect();
    };
    const io = new IntersectionObserver(([e]) => {
      clearTimeout(timer);
      if (e.isIntersecting) timer = window.setTimeout(nudge, NUDGE_AFTER_MS);
    }, { threshold: 0.9 });
    io.observe(band);
    return () => { clearTimeout(timer); io.disconnect(); };
  }, []);

  // Hovering an element (mouse) previews it: the band's edge glows in its colour.
  const preview = (e: React.PointerEvent) => {
    const band = bandRef.current, el = (e.target as Element).closest<HTMLElement>('.e-pick');
    if (!band || e.pointerType !== 'mouse') return;
    if (el) { band.dataset.preview = ''; band.style.setProperty('--preview', el.style.getPropertyValue('--el')); }
    else delete band.dataset.preview;
  };
  const drag = useRef({ on: false, id: -1, x: 0, moved: 0, vel: 0, last: 0 });
  const motion = useRef({ x: 0, rate: 1, target: 1, fling: 0 });

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    return onTick((_t, dt) => {
      const m = motion.current;
      const half = el.scrollWidth / 2 || 1;
      // hover easing towards 20% speed and back (about 0.6 s)
      m.rate += (m.target - m.rate) * Math.min(1, dt * 5);
      if (!drag.current.on) {
        m.x -= (half / LOOP_S) * m.rate * dt;
        // momentum after a drag, decaying
        m.x += m.fling * dt;
        m.fling *= Math.pow(0.04, dt);
      }
      m.x = ((m.x % half) - half) % half; // keep within (-half, 0]
      el.style.transform = `translateX(${m.x.toFixed(1)}px)`;
    });
  }, []);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { on: true, id: e.pointerId, x: e.clientX, moved: 0, vel: 0, last: performance.now() };
    motion.current.fling = 0;
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.on || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    d.moved += Math.abs(dx);
    if (d.moved > DRAG_PX) (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    motion.current.x += dx;
    const now = performance.now();
    d.vel = dx / Math.max(1, now - d.last) * 1000;
    d.last = now;
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.on || e.pointerId !== d.id) return;
    d.on = false;
    if (d.moved > DRAG_PX) motion.current.fling = Math.max(-2500, Math.min(2500, d.vel));
  };

  const pick = (id: string, from: HTMLElement) => {
    if (drag.current.moved > DRAG_PX) return; // that was a drag, not a click
    switchElement(id, from);
  };

  return (
    <div
      ref={bandRef}
      data-ocean-top
      onPointerEnter={e => { if (e.pointerType === 'mouse') motion.current.target = 0.2; }}
      onPointerLeave={() => { motion.current.target = 1; if (bandRef.current) delete bandRef.current.dataset.preview; }}
      onPointerOver={preview}
      onPointerDown={e => { touched.current = true; onDown(e); }}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="e-band relative -rotate-2 my-6 md:my-10 -mx-4 bg-[#121212] border-y-[3px] border-[#121212] overflow-hidden select-none touch-pan-y cursor-grab active:cursor-grabbing"
    >
      <div ref={trackRef} className="e-track py-2.5 md:py-4">
        {[0, 1].map(copy => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1 || undefined}>
            {[...ELEMENTS, ...ELEMENTS].map((e, i) => (
              <button
                key={`${copy}-${i}`}
                type="button"
                onClick={ev => pick(e.id, ev.currentTarget)}
                tabIndex={copy === 0 && i < ELEMENTS.length ? 0 : -1}
                aria-pressed={active === e.id}
                aria-label={`${e.name} colour scheme`}
                className="e-pick flex items-center gap-2 md:gap-3 px-3.5 md:px-8"
                style={{ ['--el' as string]: e.color }}
                draggable={false}
              >
                <IconTile id={e.id} shadow="0px" className="w-7 md:w-12" />
                <span className="h-display not-italic text-xl md:text-5xl">{e.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
