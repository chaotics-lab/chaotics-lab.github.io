import { createContext, useContext } from 'react';

type PageTransition = {
  // Cover the screen with the sea, run `swap` while hidden, uncover.
  dive: (swap: () => void) => void;
  // dive() into another route.
  go: (to: string) => void;
};

export const PageTransitionContext = createContext<PageTransition>({
  dive: swap => swap(),
  go: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);
