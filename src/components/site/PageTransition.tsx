import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransitionContext, type TransitionOpts } from '@/lib/pageTransition';
import { prefersReducedMotion } from '@/lib/ticker';
import { WAVE, WAVE_V } from '@/lib/wave';

// P3R-style page changes. 'sea': three layers of sea (cyan, blue, deep
// blue) rise over the screen with drifting wave edges, the page switches
// underneath, then they leave through the top in reverse order. 'slash':
// three slanted bands cut in from the right and carry on off to the left.
// 'blot': Persona 3 Reload's menu cut. Three blots (circles with a wavy,
// slowly turning edge) grow one after the other from the clicked point and
// cover the screen; the page switches; then a wavy hole grows from the
// middle of each, front one first, and lets the new page through. The
// shape follows the blot cut mask of github.com/Ultipuk/persona_3_reload_pause_menu
// (assets/shaders/blot_cut_mask.gdshader): radius progress * (R - amp *
// sin(lobes * (angle - progress * turn))), with R reaching the far corner.
// Keep the timings in sync with .pt-layer / .pts-band in index.css.
const BLOT = { in: 320, out: 380, gap: 75 }; // ms per blot, and between them
const TIMING = {
  sea: { cover: 260 + 2 * 45, hold: 40, reveal: 300 + 2 * 45 },
  slash: { cover: 280 + 2 * 60, hold: 320, reveal: 320 + 2 * 60 }, // hold: time to read the title
  blot: { cover: BLOT.gap * 2 + BLOT.in, hold: 120, reveal: BLOT.gap * 2 + BLOT.out },
  fade: { cover: 160, hold: 30, reveal: 220 }, // minimal quality: one plain fade (.pt-fade)
};

const LAYERS = ['var(--h-c1)', 'var(--h-top)', 'var(--h-deep)'];
const SLASH: [string, string, string] = ['var(--h-c1)', 'var(--h-top)', 'var(--h-deep)'];
const BLOT_COLORS: [string, string, string] = ['var(--h-cream)', 'var(--h-c1)', 'var(--h-deep)'];

// The blot's outline as an SVG path in screen px: a wavy circle around
// (cx, cy) at `k` (0..1) of the size that covers the screen, or that circle
// cut out of the whole screen (hole). Five lobes; the wave turns with k.
function blotPath(cx: number, cy: number, k: number, hole: boolean, w: number, h: number) {
  const amp = 0.1 * h, R = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy)) + amp;
  const N = 90, turn = 0.4 * Math.PI;
  let d = hole ? `M-2 -2H${w + 2}V${h + 2}H-2Z` : '';
  for (let i = 0; i < N; i++) {
    const a = (i / N) * 2 * Math.PI, r = Math.max(0, k * (R - amp * Math.sin(5 * (a - k * turn))));
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy - Math.sin(a) * r).toFixed(1)}`;
  }
  return `path(evenodd, "${d}Z")`;
}
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle');
  const [opts, setOpts] = useState<TransitionOpts>({});
  const busy = useRef(false);
  // a request made while a transition is still running plays right after it
  const queued = useRef<[() => void, TransitionOpts] | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dive = useCallback((swap: () => void, given: TransitionOpts = {}) => {
    if (prefersReducedMotion()) { swap(); return; }
    if (busy.current) { queued.current = [swap, given]; return; }
    busy.current = true;
    // The transitions are cheap (CSS transforms, a clip path per blot per
    // frame) and stay on every device.
    const o: TransitionOpts = given;
    const t = TIMING[o.kind ?? 'sea'];
    setOpts(o);
    setPhase('cover');
    if (o.kind === 'blot') runBlots('cover', BLOT, o.origin);
    timers.current.push(window.setTimeout(() => {
      swap();
      setPhase('reveal');
      if (o.kind === 'blot') runBlots('reveal', BLOT);
      timers.current.push(window.setTimeout(() => {
        setPhase('idle');
        busy.current = false;
        const next = queued.current;
        queued.current = null;
        if (next) diveRef.current(...next);
      }, t.reveal));
    }, t.cover + t.hold));
  }, []);

  // Blots: the clip path of each layer, set every frame.
  const blots = useRef<(HTMLDivElement | null)[]>([]);
  const blotRaf = useRef(0);
  const runBlots = (step: 'cover' | 'reveal', bt: typeof BLOT, at?: { x: number; y: number }) => {
    cancelAnimationFrame(blotRaf.current);
    const w = window.innerWidth, h = window.innerHeight;
    let start = -1; // from the first frame the layers are there (they mount with the phase)
    const cx = step === 'reveal' ? w / 2 : at?.x ?? w / 2, cy = step === 'reveal' ? h / 2 : at?.y ?? h / 2;
    const frame = () => {
      if (!blots.current[2]?.isConnected) { blotRaf.current = requestAnimationFrame(frame); return; }
      if (start < 0) start = performance.now();
      const ms = performance.now() - start;
      let running = false;
      blots.current.forEach((el, i) => {
        if (!el) return;
        // cover: back to front (cream first); reveal: the front layer opens first
        const delay = (step === 'cover' ? i : 2 - i) * bt.gap, dur = step === 'cover' ? bt.in : bt.out;
        const k = Math.min(1, Math.max(0, (ms - delay) / dur));
        if (k < 1) running = true;
        el.style.clipPath = step === 'cover' ? blotPath(cx, cy, easeOut(k) * (k < 1 ? 1 : 1.02), false, w, h) : blotPath(cx, cy, easeInOut(k) * 1.02, true, w, h);
      });
      if (running) blotRaf.current = requestAnimationFrame(frame);
    };
    blotRaf.current = requestAnimationFrame(frame);
  };
  useEffect(() => () => cancelAnimationFrame(blotRaf.current), []);

  const diveRef = useRef(dive);
  diveRef.current = dive;

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
        <div className="pt" data-phase={phase} data-dir={opts.dir} aria-hidden="true">
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
      {opts.kind === 'blot' && phase !== 'idle' && (
        <div className="pt" data-phase={phase} aria-hidden="true">
          {(opts.colors ?? BLOT_COLORS).map((color, i) => (
            <div key={i} ref={el => { blots.current[i] = el; }} className="pt-blot" style={{ background: color, clipPath: 'circle(0)' }} />
          ))}
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
      <div className="pt" data-phase={opts.kind === 'slash' || opts.kind === 'fade' || sideways || opts.kind === 'blot' ? 'idle' : phase} data-dir={opts.dir ?? 'up'} aria-hidden="true">
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
