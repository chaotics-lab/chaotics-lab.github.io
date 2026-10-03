import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import { usePageTransition } from '@/lib/pageTransition';

const GLIDE = 240;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Back-to-top pill, bottom right, styled like the header links. It shows
// up once the page has been scrolled a little. Near the bottom of the page
// it glides, with the scroll, onto the footer's back-to-top pill
// (#footer-top) and hands over to it: same height and arrow position, so
// the arrow lands exactly on the footer's. Going up, the sea pours in from
// the top.
export const ScrollTop = () => {
  const { dive } = usePageTransition();
  const [shown, setShown] = useState(false);
  const outer = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let tx = 0; // current glide offset
    let ty = 0;
    const update = () => {
      raf = 0;
      const on = window.scrollY > 120;
      setShown(on);
      const el = outer.current;
      const me = pill.current;
      const dock = document.getElementById('footer-top');
      if (!el || !me) return;
      if (!dock) {
        el.style.translate = '';
        me.style.opacity = '';
        tx = ty = 0;
        return;
      }
      const vh = window.innerHeight;
      const r = dock.getBoundingClientRect();
      // Over the last GLIDE px of scrolling the pill heads for the spot where
      // the dock will rest once the page ends, so they meet at the bottom.
      const left = document.documentElement.scrollHeight - vh - window.scrollY;
      const finalTop = r.top - left;
      const p = Math.min(1, Math.max(0, 1 - left / GLIDE));
      // pill's resting box (its translate removed)
      const rest = me.getBoundingClientRect();
      const e = p * p * (3 - 2 * p);
      const nx = (r.left - (rest.left - tx)) * e;
      const ny = (finalTop - (rest.top - ty)) * e;
      tx = nx;
      ty = ny;
      el.style.translate = `${nx.toFixed(1)}px ${ny.toFixed(1)}px`;
      const handOver = smooth(0.8, 1, p);
      me.style.opacity = String(1 - handOver);
      dock.style.opacity = on ? String(handOver) : '1';
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    const ro = new ResizeObserver(queue);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={outer} className="s-top select-none" data-shown={shown}>
      <div ref={pill} className="s-nav">
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
