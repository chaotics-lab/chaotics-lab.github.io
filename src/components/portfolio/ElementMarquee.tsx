import { useEffect, useRef, useState } from 'react';
import { ELEMENTS } from '@/config/elements';
import { applyTheme, currentElement, onThemeChange } from '@/lib/theme';
import { usePageTransition } from '@/lib/pageTransition';
import { THEMES } from '@/config/themes';
import { onTick, prefersReducedMotion } from '@/lib/ticker';
import { IconTile } from './IconTile';

const LOOP_S = 38; // seconds for one full loop at normal speed
const DRAG_PX = 6; // movement that turns a press into a drag (no click)
const HINT_KEY = 'lox-theme-hint', HINT_HOVER_MS = 1000, HINT_TOUCH_MS = 4000;
const hintDone = () => { try { return !!sessionStorage.getItem(HINT_KEY); } catch { return false; } };
const hintOff = () => { try { sessionStorage.setItem(HINT_KEY, '1'); } catch { /* storage unavailable */ } };

// Slanted black band with the elements scrolling past (P5-style ticker).
// The list is rendered twice and wraps at half its width, so the loop is
// seamless. It can be dragged (finger or mouse) and keeps a little momentum;
// hovering eases it down to 20% speed. A tap or click picks an element and
// fills the page with its colours from the band out (PageTransition 'band').
// Until someone does, resting the mouse on an element for a moment shows
// "Click to change theme" by the cursor (on touch screens, once under the
// band after a few seconds in view). The ocean layer is clipped to the
// band's bottom edge, found through data-ocean-top.
export const ElementMarquee = () => {
  const [active, setActive] = useState(currentElement);
  useEffect(() => onThemeChange(() => setActive(currentElement())), []);

  const { dive } = usePageTransition();
  const trackRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState<{ x: number; y: number } | null>(null);
  const [touchHint, setTouchHint] = useState(false);
  const hintTimer = useRef(0);
  const hintAt = useRef({ x: 0, y: 0 });
  const hideHint = () => { clearTimeout(hintTimer.current); setHint(null); };
  const onHover = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || hintDone()) return;
    hintAt.current = { x: e.clientX, y: e.clientY };
    if (hint) { setHint({ ...hintAt.current }); return; }
    clearTimeout(hintTimer.current);
    if (!(e.target as Element).closest('.e-pick')) return;
    hintTimer.current = window.setTimeout(() => setHint({ ...hintAt.current }), HINT_HOVER_MS);
  };
  useEffect(() => () => clearTimeout(hintTimer.current), []);

  // touch screens: once, a few seconds after the band comes into view
  useEffect(() => {
    const band = bandRef.current;
    if (!band || hintDone() || !window.matchMedia('(hover: none)').matches) return;
    let t = 0, off = 0;
    const io = new IntersectionObserver(([e]) => {
      clearTimeout(t);
      if (!e.isIntersecting || hintDone()) return;
      t = window.setTimeout(() => { hintOff(); setTouchHint(true); off = window.setTimeout(() => setTouchHint(false), 3200); io.disconnect(); }, HINT_TOUCH_MS);
    }, { threshold: 0.6 });
    io.observe(band);
    return () => { clearTimeout(t); clearTimeout(off); io.disconnect(); };
  }, []);
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

  const pick = (id: string) => {
    if (drag.current.moved > DRAG_PX) return; // that was a drag, not a click
    hintOff();
    hideHint();
    setTouchHint(false);
    if (id === currentElement()) return;
    // the new colours fill the page from the band out (PageTransition 'band')
    const band = bandRef.current, r = band?.getBoundingClientRect(), pal = THEMES[id] ?? THEMES.aqua;
    dive(() => applyTheme(id), {
      kind: 'band', angle: -2, gap: band?.offsetHeight ?? 0, colors: [pal.top, pal.deep],
      origin: r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined,
    });
  };

  return (
    <div className="relative">
    <div
      ref={bandRef}
      data-ocean-top
      onPointerEnter={e => { if (e.pointerType === 'mouse') motion.current.target = 0.2; }}
      onPointerLeave={() => { motion.current.target = 1; hideHint(); }}
      onPointerDown={onDown}
      onPointerMove={e => { onMove(e); onHover(e); }}
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
                onClick={() => pick(e.id)}
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
    {hint && <span className="e-hint" style={{ left: hint.x, top: hint.y }} aria-hidden="true">Click to change theme</span>}
    {touchHint && <span className="e-hint e-hint-under" aria-hidden="true">Tap to change theme</span>}
    </div>
  );
};
