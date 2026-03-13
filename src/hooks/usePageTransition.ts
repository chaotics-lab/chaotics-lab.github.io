/**
 * usePageTransition.ts — drop in src/hooks/usePageTransition.ts
 *
 * Provides:
 *   opacity       — apply to your <main> style
 *   transitionTo  — call instead of navigate() for animated transitions
 *
 * On mount (or when watchKeys change): scrolls to top instantly, fades in.
 * On transitionTo: fades out + smooth scrolls, waits for both, then navigates.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const FADE_MS = 200;

export function usePageTransition(watchKeys: unknown[] = []) {
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fade in on mount + whenever watchKeys change (e.g. postSlug changes)
  useEffect(() => {
    window.scrollTo(0, 0);
    setOpacity(0);
    const t = setTimeout(() => setOpacity(1), 30);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, watchKeys);

  const transitionTo = useCallback((to: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    // Fade out + smooth scroll simultaneously
    setOpacity(0);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const startedAt = Date.now();

    pollRef.current = setInterval(() => {
      const fadeElapsed = Date.now() - startedAt >= FADE_MS;
      const atTop = window.scrollY < 4;
      if (fadeElapsed && atTop) {
        clearInterval(pollRef.current!);
        navigate(to);
        // fade-in is handled by the useEffect above reacting to the new route
      }
    }, 16);
  }, [navigate]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  return { opacity, transitionTo, FADE_MS };
}