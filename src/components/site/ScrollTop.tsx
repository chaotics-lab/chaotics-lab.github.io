import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import { usePageTransition } from '@/lib/pageTransition';

const DOCK_MS = 1100;
const DOCK_AT = 40; // px from the bottom of the page

// easeInOutElastic
const elastic = (x: number) => {
  const c = (2 * Math.PI) / 4.5;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x < 0.5
    ? -(2 ** (20 * x - 10) * Math.sin((20 * x - 11.125) * c)) / 2
    : (2 ** (-20 * x + 10) * Math.sin((20 * x - 11.125) * c)) / 2 + 1;
};

// Back-to-top pill, bottom right, styled like the header links. It shows
// up once the page has been scrolled a little. At the bottom of the page it
// jumps, with an elastic in-out, onto the footer's back-to-top pill
// (#footer-top) and hands over to it (same height and arrow position, so
// the arrow lands on the footer's); scrolling back up sends it home the
// same way. Going up, the sea pours in from the top.
export const ScrollTop = () => {
  const { dive } = usePageTransition();
  const [shown, setShown] = useState(false);
  const outer = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let anim = 0;
    let tx = 0; // current offset from the resting spot
    let ty = 0;
    let docked = false;
    let landed = false; // docking finished, footer pill showing

    const dockEl = () => document.getElementById('footer-top');
    const setOffset = (x: number, y: number) => {
      tx = x;
      ty = y;
      if (outer.current) outer.current.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    };
    const showDock = (on: boolean) => {
      landed = on;
      if (pill.current) pill.current.style.opacity = on ? '0' : '1';
      const d = dockEl();
      if (d) d.style.opacity = on || window.scrollY <= 120 ? '1' : '0';
    };
    // where the footer pill rests, relative to the floating pill's home
    const target = () => {
      const d = dockEl();
      const me = pill.current;
      if (!d || !me) return [0, 0];
      const r = d.getBoundingClientRect();
      const home = me.getBoundingClientRect();
      const left = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      return [r.left - (home.left - tx), r.top - left - (home.top - ty)];
    };
    const glide = (to: [number, number], done?: () => void) => {
      cancelAnimationFrame(anim);
      const from = [tx, ty];
      const start = performance.now();
      const frame = (now: number) => {
        const k = Math.min(1, (now - start) / DOCK_MS);
        const e = elastic(k);
        setOffset(from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e);
        if (k < 1) anim = requestAnimationFrame(frame);
        else done?.();
      };
      anim = requestAnimationFrame(frame);
    };

    const update = () => {
      raf = 0;
      const on = window.scrollY > 120;
      setShown(on);
      const left = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      const want = on && !!dockEl() && left < DOCK_AT;
      if (want && !docked) {
        docked = true;
        glide(target() as [number, number], () => showDock(true));
      } else if (!want && docked) {
        docked = false;
        showDock(false);
        glide([0, 0]);
      } else if (landed) {
        const [x, y] = target();
        setOffset(x, y);
      }
      if (!docked && !landed) showDock(false);
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    const ro = new ResizeObserver(queue);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(anim);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={outer} className="s-top select-none" data-shown={shown}>
      <div ref={pill} className="s-nav s-top-pill">
        <button
          type="button"
          className="s-nav-item s-top-item"
          onClick={() => dive(() => window.scrollTo(0, 0), { dir: 'down' })}
          tabIndex={shown ? 0 : -1}
          aria-label="Back to top"
        >
          <ArrowUp size={18} weight="bold" className="s-icon" />
        </button>
      </div>
    </div>
  );
};
