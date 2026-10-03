import { createContext, useContext } from 'react';

// go(to): cover the screen with the sea, switch page, uncover.
export const PageTransitionContext = createContext<(to: string) => void>(() => {});

export const usePageTransition = () => useContext(PageTransitionContext);
