import { createContext, useContext } from 'react';

// 'sea' (default): sea layers rise from the bottom and leave at the top.
// 'slash': slanted bands sweep across from the right, in `colors` (front
// band last), with `label` written on the front band; dir 'left' sweeps the
// other way. Used between projects.
// dir (sea only): 'up' (default) rises from the bottom, 'down' pours in from
// the top, 'right' / 'left' sweep sideways in that direction.
// 'element': `element`'s card flies out of `origin` (screen px) with blots in
// its colours, used when switching elements (the colours swap while covered).
// 'blot': wavy blots in `colors` (back to front) grow from `origin` (screen
// px) over the screen, then open from the middle onto the new page.
export type TransitionOpts = {
  kind?: 'sea' | 'slash' | 'blot' | 'fade' | 'element';
  dir?: 'up' | 'down' | 'left' | 'right';
  colors?: [string, string, string];
  label?: string;
  origin?: { x: number; y: number };
  element?: string;
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
