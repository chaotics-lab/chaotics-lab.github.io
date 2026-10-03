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
const EASE_OUT = 4; // the end slows down hard (ease-out quart)

const jump = (y: number) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });

// Optional: `lead` (ms of motion before the sea starts), `end` (ms of
// motion from the moment the sea starts leaving) and `after` (px covered in
// that end part, or measured at the cut), e.g. to pass through a section.
// `onSwap` runs while the sea covers the page (e.g. to tidy the URL).
type RunOpts = { lead?: number; end?: number; after?: number | (() => number); onSwap?: () => void };

export function useDiveScroll() {
  const { dive } = usePageTransition();
  return useCallback((target: () => number, opts?: TransitionOpts, more: RunOpts = {}) => {
    const y0 = window.scrollY;
    const goal0 = target();
    if (prefersReducedMotion() || Math.abs(goal0 - y0) < 2) { jump(goal0); return; }
    const sign = Math.sign(goal0 - y0);
    const measure = () => (typeof more.after === 'function' ? more.after() : more.after);
    const run = Math.min(measure() ?? RUN, Math.abs(goal0 - y0) / 2);
    const lead = more.lead ?? LEAD;
    const tA = lead + COVER;
    const tB = Math.max(REVEAL, more.end ?? REVEAL + TAIL);
    // ease-in (quad) before, ease-out (EASE_OUT power) after: same speed at
    // the cut when runA = EASE_OUT/2 * run * tA/tB
    const runA = Math.min(RUN, (EASE_OUT / 2) * run * (tA / tB));
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
        more.onSwap?.();
        // slowing down (ease-out) onto the target, starting while covered
        const goal = target();
        const runB = Math.min(measure() ?? run, Math.abs(goal - window.scrollY));
        const from = goal - sign * runB;
        jump(from);
        const startB = performance.now();
        const stepB = (now: number) => {
          const k = Math.min(1, (now - startB) / tB);
          jump(from + sign * runB * (1 - (1 - k) ** EASE_OUT));
          if (k < 1) raf = requestAnimationFrame(stepB);
        };
        raf = requestAnimationFrame(stepB);
      }, opts);
    }, lead);
  }, [dive]);
}

// Back to the top: half a second before the sea, a long soft landing after.
export const TOP_RUN: RunOpts = { lead: 500, end: 900 };
