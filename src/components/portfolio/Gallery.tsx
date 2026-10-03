import { useEffect, useRef, useState } from 'react';
import { ArrowsOut, CaretLeft, CaretRight, X } from '@phosphor-icons/react';
import { prefersReducedMotion } from '@/lib/ticker';

const AUTOPLAY_MS = 5000;

// Project images: one track of slides that slides sideways, advancing on
// its own (looping) until the visitor hovers, focuses or opens it. Slanted
// bars under it show where you are and how long until the next slide.
export const Gallery = ({ frames, title }: { frames: string[]; title: string }) => {
  const [current, setCurrent] = useState(0);
  const [hold, setHold] = useState(false);
  const [viewer, setViewer] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = frames.length;
  const auto = count > 1 && !hold && !viewer && !prefersReducedMotion();

  useEffect(() => { setCurrent(c => Math.min(c, Math.max(0, count - 1))); }, [count]);

  const go = (d: number) => setCurrent(c => (c + d + count) % count);

  // Restarts on every slide change, so a manual pick gets a full interval.
  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => setCurrent(c => (c + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [auto, current, count]);

  // Full-screen viewer: arrows to browse, Escape to close.
  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewer(false);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  });

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current !== null) {
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }
      touchX.current = null;
    },
  };

  if (!count) return null;
  const alt = (i: number) => `${title}, image ${i + 1}`;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className="g-wrap"
      aria-roledescription="carousel"
      aria-label="Images"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHold(false); }}
    >
      <div className="g-stage" {...swipe}>
        <div className="g-track" style={{ transform: `translateX(${-current * 100}%)` }}>
          {frames.map((src, i) => (
            <div key={src} className="g-slide" aria-hidden={i !== current}>
              <img src={src} alt={alt(i)} draggable={false} onClick={() => setViewer(true)} />
            </div>
          ))}
        </div>
        {count > 1 && (
          <>
            <button type="button" className="g-arrow left-3" onClick={() => go(-1)} aria-label="Previous image"><CaretLeft size={18} weight="bold" /></button>
            <button type="button" className="g-arrow right-3" onClick={() => go(1)} aria-label="Next image"><CaretRight size={18} weight="bold" /></button>
          </>
        )}
        <button type="button" className="g-arrow g-full" onClick={() => setViewer(true)} aria-label="View full screen"><ArrowsOut size={16} weight="bold" /></button>
      </div>

      {count > 1 && (
        <div className="g-bar">
          <div className="g-dots">
            {frames.map((src, i) => (
              <button
                key={src}
                type="button"
                className="g-dot"
                aria-current={i === current}
                aria-label={`Image ${i + 1}`}
                onClick={() => setCurrent(i)}
              >
                <span
                  key={i === current ? `${current}-${auto}` : undefined}
                  className="g-fill"
                  data-run={i === current && auto ? 'true' : undefined}
                  style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                />
              </button>
            ))}
          </div>
          <span className="g-count" aria-live="polite">{pad(current + 1)} <span>/ {pad(count)}</span></span>
        </div>
      )}

      {viewer && (
        <div className="p-viewer" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setViewer(false)} {...swipe}>
          <img src={frames[current]} alt={alt(current)} onClick={e => e.stopPropagation()} />
          <button type="button" className="s-circle absolute top-4 right-4" onClick={() => setViewer(false)} aria-label="Close">
            <X size={20} weight="bold" />
          </button>
          {count > 1 && (
            <>
              <button type="button" className="s-circle absolute left-4 top-1/2 -translate-y-1/2" onClick={e => { e.stopPropagation(); go(-1); }} aria-label="Previous image">
                <CaretLeft size={20} weight="bold" />
              </button>
              <button type="button" className="s-circle absolute right-4 top-1/2 -translate-y-1/2" onClick={e => { e.stopPropagation(); go(1); }} aria-label="Next image">
                <CaretRight size={20} weight="bold" />
              </button>
              <span className="g-count absolute bottom-5 left-1/2 -translate-x-1/2">{pad(current + 1)} <span>/ {pad(count)}</span></span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
