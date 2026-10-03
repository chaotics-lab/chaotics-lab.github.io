import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransitionContext, type TransitionOpts } from '@/lib/pageTransition';
import { prefersReducedMotion } from '@/lib/ticker';
import { quality } from '@/lib/perf';
import { WAVE, WAVE_V } from '@/lib/wave';

// P3R-style page changes. 'sea': three layers of sea (cyan, blue, deep
// blue) rise over the screen with drifting wave edges, the page switches
// underneath, then they leave through the top in reverse order. 'slash':
// three slanted bands cut in from the right and carry on off to the left.
// 'zoom': the page zooms into a card with a turn while the sea's front
// colour washes over it; the page switches; the sea then leaves upward.
// Keep the timings in sync with .pt-layer / .pts-band in index.css.
const TIMING = {
  sea: { cover: 260 + 2 * 45, hold: 40, reveal: 300 + 2 * 45 },
  slash: { cover: 280 + 2 * 60, hold: 320, reveal: 320 + 2 * 60 }, // hold: time to read the title
  zoom: { cover: 560, hold: 220, reveal: 300 + 2 * 45 }, // cover: .pt-zoom; hold: a beat on the full colour
  fade: { cover: 160, hold: 30, reveal: 220 }, // minimal quality: one plain fade (.pt-fade)
};

const LAYERS = ['var(--h-c1)', 'var(--h-top)', 'var(--h-deep)'];
const SLASH: [string, string, string] = ['var(--h-c1)', 'var(--h-top)', 'var(--h-deep)'];

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle');
  const [opts, setOpts] = useState<TransitionOpts>({});
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dive = useCallback((swap: () => void, given: TransitionOpts = {}) => {
    if (prefersReducedMotion()) { swap(); return; }
    if (busy.current) return;
    busy.current = true;
    // The transitions are cheap CSS transforms and stay on every device;
    // only the card zoom drops its page zoom (keeps the colour wash) on
    // weaker ones (src/lib/perf.ts).
    const o: TransitionOpts = given;
    const t = TIMING[o.kind ?? 'sea'];
    setOpts(o);
    setPhase('cover');
    if (o.kind === 'zoom' && o.zoomEl && o.origin && quality() === 2) {
      o.zoomEl.style.transformOrigin = `${o.origin.x}px ${o.origin.y}px`;
      o.zoomEl.animate(
        [{ transform: 'scale(1) rotate(0deg)' }, { transform: 'scale(2.4) rotate(-4deg)' }],
        { duration: t.cover, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' },
      );
    }
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

  const sideways = opts.dir === 'left' || opts.dir === 'right';

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
      {opts.kind === 'fade' && phase !== 'idle' && <div className="pt pt-fade" data-phase={phase} aria-hidden="true" />}
      {opts.kind === 'zoom' && phase === 'cover' && (
        <div className="pt pt-zoom-wrap" data-phase="cover" aria-hidden="true">
          <div className="pt-zoom" style={{ ['--tint' as string]: opts.tint ?? 'var(--h-deep)' }} />
        </div>
      )}
      {/* sideways sea (dir left/right), same layers as the filter sweep */}
      <div className="pt" data-phase={opts.kind !== 'slash' && opts.kind !== 'fade' && sideways ? phase : 'idle'} data-dir={opts.dir} aria-hidden="true">
        {LAYERS.map((color, i) => (
          <div
            key={color}
            className="pt-hlayer"
            style={{ color, ['--in' as string]: `${i * 45}ms`, ['--out' as string]: `${(LAYERS.length - 1 - i) * 45}ms`, ['--drift' as string]: `${-i * 0.4}s` }}
          >
            <div className="pt-hedge pt-hflip"><svg className="pt-hwave" viewBox="0 0 60 2880" preserveAspectRatio="none"><path d={WAVE_V} fill="currentColor" /></svg></div>
            <div className="pt-hbody" />
            <div className="pt-hedge"><svg className="pt-hwave" viewBox="0 0 60 2880" preserveAspectRatio="none"><path d={WAVE_V} fill="currentColor" /></svg></div>
          </div>
        ))}
      </div>
      <div className="pt" data-phase={opts.kind === 'slash' || opts.kind === 'fade' || sideways || (opts.kind === 'zoom' && phase === 'cover') ? 'idle' : phase} data-dir={opts.dir ?? 'up'} aria-hidden="true">
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
