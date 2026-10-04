import { createContext, useContext } from 'react';

// 'sea' (default): sea layers rise from the bottom and leave at the top.
// 'slash': slanted bands sweep across from the right, in `colors` (front
// band last), with `label` written on the front band; dir 'left' sweeps the
// other way. Used between projects.
// dir (sea only): 'up' (default) rises from the bottom, 'down' pours in from
// the top, 'right' / 'left' sweep sideways in that direction.
// 'circles': two circles in `colors` [accent, main] roll in from the side
// opposite `dir` ('left' travels right to left), then a circular hole follows.
// 'blot': wavy blots in `colors` (back to front) grow from `origin` (screen
// px) over the screen, then open from the middle onto the new page.
export type TransitionOpts = {
  kind?: 'sea' | 'slash' | 'blot' | 'fade' | 'circles';
  dir?: 'up' | 'down' | 'left' | 'right';
  colors?: [string, string, string];
  label?: string;
  origin?: { x: number; y: number };
};

type PageTransition = {
  // Cover the screen, run `swap` while hidden, uncover.
  dive: (swap: () => void, opts?: TransitionOpts) => void;
  // dive() into another route.
  go: (to: string, opts?: TransitionOpts) => void;
};

export const PageTransitionContext = createContext<PageTransition>({
  dive: swap => swap(),
  go: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

// Back to the projects: P3R's double circle rolling in from the right, in
// the project's colours (read when clicked, so they don't change when the
// page underneath takes the element's colours back). Used by the header's
// Projects pill and the project page's footer row.
export const backToProjects = (): TransitionOpts => {
  const css = getComputedStyle(document.documentElement);
  return { kind: 'circles', dir: 'left', colors: [css.getPropertyValue('--h-c1').trim(), css.getPropertyValue('--h-deep').trim()] };
};
