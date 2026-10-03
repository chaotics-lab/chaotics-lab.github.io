import { createContext, useContext } from 'react';

// 'sea' (default): sea layers rise from the bottom and leave at the top.
// 'slash': slanted bands sweep across from the right, in `colors` (front
// band last), with `label` written on the front band. Used between projects.
// dir (sea only): 'up' (default) rises from the bottom, 'down' pours in from
// the top, 'right' / 'left' sweep sideways in that direction.
// 'zoom': the page content `zoomEl` zooms into `origin` (px in its own box)
// with a turn while `tint` washes over the screen; then the sea (already
// covering) leaves upward.
export type TransitionOpts = {
  kind?: 'sea' | 'slash' | 'zoom';
  dir?: 'up' | 'down' | 'left' | 'right';
  colors?: [string, string, string];
  label?: string;
  zoomEl?: HTMLElement;
  origin?: { x: number; y: number };
  tint?: string;
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
