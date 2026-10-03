import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransitionContext, type TransitionOpts } from '@/lib/pageTransition';
import { prefersReducedMotion } from '@/lib/ticker';

// P3R-style page changes. 'sea': three layers of sea (cyan, blue, deep
// blue) rise over the screen with drifting wave edges, the page switches
// underneath, then they leave through the top in reverse order. 'slash':
// three slanted bands cut in from the right and carry on off to the left.
// Keep the timings in sync with .pt-layer / .pts-band in index.css.
const TIMING = {
  sea: { cover: 260 + 2 * 45, hold: 40, reveal: 300 + 2 * 45 },
  slash: { cover: 280 + 2 * 60, hold: 320, reveal: 320 + 2 * 60 }, // hold: time to read the title
};

// Two periods of a smooth wave, so the edge can drift by half its width.
const WAVE = (() => {
  let d = 'M0 30';
  for (let x = 0; x < 2880; x += 360) d += ` Q${x + 90} ${x % 720 ? 52 : 8} ${x + 180} 30 T${x + 360} 30`;
  return `${d} V60 H0 Z`;
})();

const LAYERS = ['var(--h-c1)', 'var(--h-top)', 'var(--h-deep)'];
const SLASH: [string, string, string] = ['var(--h-c1)', 'var(--h-top)', 'var(--h-deep)'];

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle');
  const [opts, setOpts] = useState<TransitionOpts>({});
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dive = useCallback((swap: () => void, o: TransitionOpts = {}) => {
    if (prefersReducedMotion()) { swap(); return; }
    if (busy.current) return;
    busy.current = true;
    const t = TIMING[o.kind ?? 'sea'];
    setOpts(o);
    setPhase('cover');
    timers.current.push(window.setTimeout(() => {
      swap();
      setPhase('reveal');
      timers.current.push(window.setTimeout(() => {
        setPhase('idle');
        busy.current = false;
      }, t.reveal));
    }, t.cover + t.hold));
  }, []);

  const value = useMemo(() => ({ dive, go: (to: string, o?: TransitionOpts) => dive(() => navigate(to), o) }), [dive, navigate]);

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
      {opts.kind === 'slash' && (
        <div className="pt" data-phase={phase} aria-hidden="true">
          {(opts.colors ?? SLASH).map((color, i) => (
            <div
              key={i}
              className="pts-band"
              style={{ background: color, ['--in' as string]: `${i * 60}ms`, ['--out' as string]: `${(2 - i) * 60}ms` }}
            >
              {i === 2 && opts.label && (
                <div className="pts-label">
                  <span className="h-caps text-xs">Next</span>
                  <span className="h-display text-[clamp(2.4rem,7vw,6rem)]">{opts.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="pt" data-phase={opts.kind === 'slash' ? 'idle' : phase} aria-hidden="true">
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
