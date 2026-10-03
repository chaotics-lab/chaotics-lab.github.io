import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

  // progress bars, counter, then the controls as a header-style pill (with
  // the full-screen button under the inline gallery)
  const bar = (inline: boolean) => (
    <div className="g-bar">
      {count > 1 && (
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
      )}
      {count > 1 && <span className="g-count" aria-live="polite">{pad(current + 1)} <span>/ {pad(count)}</span></span>}
      <div className="s-nav flex g-ctrl">
        {count > 1 && (
          <>
            <button type="button" className="s-nav-item s-top-item" onClick={() => go(-1)} aria-label="Previous image"><CaretLeft size={16} weight="bold" className="s-icon" /></button>
            <button type="button" className="s-nav-item s-top-item" onClick={() => go(1)} aria-label="Next image"><CaretRight size={16} weight="bold" className="s-icon" /></button>
          </>
        )}
        {inline && <button type="button" className="s-nav-item s-top-item" onClick={() => setViewer(true)} aria-label="View full screen"><ArrowsOut size={16} weight="bold" className="s-icon" /></button>}
      </div>
    </div>
  );

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
      </div>

      {bar(true)}

      {/* Full screen: the page's deep colours, title and close on top, the
          slides moving sideways like above, the same bars and pill below.
          Clicking around the image closes it. */}
      {viewer && createPortal(
        <div className="g-viewer" role="dialog" aria-modal="true" aria-label={`${title}, images`} onClick={() => setViewer(false)}>
          <div className="g-v-head" onClick={e => e.stopPropagation()}>
            <div className="min-w-0">
              <p className="h-caps text-[0.62rem] text-[var(--h-c2)]">Images</p>
              <p className="h-display g-v-title">{title}</p>
            </div>
            <div className="s-nav flex flex-none">
              <button type="button" className="s-nav-item s-top-item s-top-wide h-swap-host" onClick={() => setViewer(false)} aria-label="Close">
                <X size={16} weight="bold" className="s-icon" />
                <span className="h-swap">
                  <span>Close</span>
                  <span className="h-serif text-[1.1rem] leading-[1.05]" aria-hidden="true">Close</span>
                </span>
              </button>
            </div>
          </div>
          <div className="g-v-stage" {...swipe}>
            <div className="g-track" style={{ transform: `translateX(${-current * 100}%)` }}>
              {frames.map((src, i) => (
                <div key={src} className="g-v-slide" aria-hidden={i !== current}>
                  <img src={src} alt={alt(i)} draggable={false} onClick={e => e.stopPropagation()} />
                </div>
              ))}
            </div>
          </div>
          <div onClick={e => e.stopPropagation()}>{bar(false)}</div>
        </div>,
        document.body,
      )}
    </div>
  );
};
