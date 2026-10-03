import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import { usePageTransition } from '@/lib/pageTransition';

const DOCK_AT = 40; // px from the bottom of the page
const FADE_MS = 220; // keep in sync with the opacity transition in index.css

// Back-to-top pill, bottom right, styled like the header links. It shows
// up once the page has been scrolled a little. At the bottom of the page it
// crossfades into the footer's back-to-top pill (#footer-top), and back
// when scrolling up. Going up, the sea pours in from the top.
export const ScrollTop = () => {
  const { dive } = usePageTransition();
  const [shown, setShown] = useState(false);
  const pill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let docked = false;
    const timers: number[] = [];
    const dockEl = () => document.getElementById('footer-top');
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const clear = () => { timers.forEach(clearTimeout); timers.length = 0; };

    // crossfade: one pill fades out while the other fades in
    const handOver = (from: HTMLElement, to: HTMLElement) => {
      clear();
      from.style.opacity = '0';
      to.style.opacity = '1';
      later(FADE_MS, () => { timers.length = 0; });
    };

    const update = () => {
      raf = 0;
      const on = window.scrollY > 120;
      setShown(on);
      const me = pill.current;
      const dock = dockEl();
      if (!me || !dock) return;
      const left = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      const want = on && left < DOCK_AT;
      if (want && !docked) {
        docked = true;
        handOver(me, dock);
      } else if (!want && docked) {
        docked = false;
        handOver(dock, me);
      } else if (!docked && !timers.length) {
        // footer pill shows on its own only when the floating one is hidden
        dock.style.opacity = on ? '0' : '1';
        me.style.opacity = '1';
      }
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    const ro = new ResizeObserver(queue);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      clear();
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="s-top select-none" data-shown={shown}>
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
