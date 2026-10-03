import { useCallback } from 'react';
import { usePageTransition, type TransitionOpts } from './pageTransition';
import { prefersReducedMotion } from './ticker';

// Scroll to a far spot through the sea transition, with real motion on
// both sides of it: the page starts moving (speeding up) LEAD ms before the
// sea covers it, jumps most of the way while covered, and is still moving
// when the sea leaves, slowing down onto the target. The two runs are sized
// so the speed matches across the cut.
const LEAD = 200;
const TAIL = 200;
const COVER = 260 + 2 * 45 + 40; // .pt-layer cover + hold, as in PageTransition
const REVEAL = 300 + 2 * 45;
const RUN = 240; // px moved on each side of the cut, at most

const jump = (y: number) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });

export function useDiveScroll() {
  const { dive } = usePageTransition();
  return useCallback((target: () => number, opts?: TransitionOpts) => {
    const y0 = window.scrollY;
    const goal0 = target();
    if (prefersReducedMotion() || Math.abs(goal0 - y0) < 2) { jump(goal0); return; }
    const sign = Math.sign(goal0 - y0);
    const run = Math.min(RUN, Math.abs(goal0 - y0) / 3);
    const tA = LEAD + COVER;
    const tB = REVEAL + TAIL;
    const runA = run * (tA / tB); // same speed at the cut
    let raf = 0;

    // speeding up (ease-in) until the swap
    const startA = performance.now();
    const stepA = (now: number) => {
      const k = Math.min(1, (now - startA) / tA);
      jump(y0 + sign * runA * k * k);
      // (stops on its own if the transition never swaps, e.g. one was busy)
      if (now - startA < tA + 800) raf = requestAnimationFrame(stepA);
    };
    raf = requestAnimationFrame(stepA);

    window.setTimeout(() => {
      dive(() => {
        cancelAnimationFrame(raf);
        // slowing down (ease-out) onto the target, starting while covered
        const goal = target();
        const from = goal - sign * run;
        jump(from);
        const startB = performance.now();
        const stepB = (now: number) => {
          const k = Math.min(1, (now - startB) / tB);
          jump(from + sign * run * (1 - (1 - k) * (1 - k)));
          if (k < 1) raf = requestAnimationFrame(stepB);
        };
        raf = requestAnimationFrame(stepB);
      }, opts);
    }, LEAD);
  }, [dive]);
}
