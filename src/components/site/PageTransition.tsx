import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransitionContext } from '@/lib/pageTransition';
import { prefersReducedMotion } from '@/lib/ticker';

// P3R-style page change: three layers of sea (cyan, blue, deep blue) rise
// over the screen with drifting wave edges, the page switches underneath,
// then they leave through the top in reverse order.
const COVER_MS = 260 + 2 * 45;  // keep in sync with .pt-layer timings
const REVEAL_MS = 300 + 2 * 45;

// Two periods of a smooth wave, so the edge can drift by half its width.
const WAVE = (() => {
  let d = 'M0 30';
  for (let x = 0; x < 2880; x += 360) d += ` Q${x + 90} ${x % 720 ? 52 : 8} ${x + 180} 30 T${x + 360} 30`;
  return `${d} V60 H0 Z`;
})();

const LAYERS = ['var(--h-c1)', 'var(--h-top)', 'var(--h-deep)'];

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle');
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dive = useCallback((swap: () => void) => {
    if (prefersReducedMotion()) { swap(); return; }
    if (busy.current) return;
    busy.current = true;
    setPhase('cover');
    timers.current.push(window.setTimeout(() => {
      swap();
      setPhase('reveal');
      timers.current.push(window.setTimeout(() => {
        setPhase('idle');
        busy.current = false;
      }, REVEAL_MS));
    }, COVER_MS + 40));
  }, []);

  const value = useMemo(() => ({ dive, go: (to: string) => dive(() => navigate(to)) }), [dive, navigate]);

  // A small water ring wherever a button or link is pressed.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !(e.target as HTMLElement).closest?.('a, button')) return;
      const ring = document.createElement('span');
      ring.className = 'tap-ripple';
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      document.body.appendChild(ring);
      window.setTimeout(() => ring.remove(), 800);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <div className="pt" data-phase={phase} aria-hidden="true">
        {LAYERS.map((color, i) => (
          <div
            key={color}
            className="pt-layer"
            style={{ color, ['--in' as string]: `${i * 45}ms`, ['--out' as string]: `${(LAYERS.length - 1 - i) * 45}ms`, ['--drift' as string]: `${-i * 0.4}s` }}
          >
            <svg className="pt-wave" viewBox="0 0 2880 60" preserveAspectRatio="none"><path d={WAVE} fill="currentColor" /></svg>
            <div className="pt-body" />
            <div className="pt-flip"><svg className="pt-wave" viewBox="0 0 2880 60" preserveAspectRatio="none"><path d={WAVE} fill="currentColor" /></svg></div>
          </div>
        ))}
      </div>
    </PageTransitionContext.Provider>
  );
};
