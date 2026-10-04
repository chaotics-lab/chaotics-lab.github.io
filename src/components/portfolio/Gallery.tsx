import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowsOut, CaretLeft, CaretRight, X } from '@phosphor-icons/react';
import { prefersReducedMotion } from '@/lib/ticker';
import { gifLength } from '@/lib/gifLength';

const AUTOPLAY_MS = 4000; // how long a still image stays
const SLIDE_MS = 450; // one slide change (.g-track in index.css)
const MIN_MS = 2500; // a GIF stays at least this long (whole loops)
const ZOOM_MS = 420; // full screen opening / closing

// How long slide `src` stays: still images AUTOPLAY_MS; a GIF one loop
// minus the slide change in and out, so a loop plays across them (or as
// many whole loops as needed to stay MIN_MS)
const stayFor = (loop: number | undefined) => {
  if (!loop) return AUTOPLAY_MS;
  const loops = Math.max(1, Math.ceil((MIN_MS + 2 * SLIDE_MS) / loop));
  return loops * loop - 2 * SLIDE_MS;
};

// Project images: one track of slides that slides sideways, advancing on
// its own (looping) until the visitor hovers, focuses or opens it. Slanted
// bars under it show where you are and how long until the next slide.
export const Gallery = ({ frames, title }: { frames: string[]; title: string }) => {
  const [current, setCurrent] = useState(0);
  const [hold, setHold] = useState(false);
  const [viewer, setViewer] = useState(false);
  const [loops, setLoops] = useState<Record<string, number>>({});
  const stageRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const touchX = useRef<number | null>(null);
  const count = frames.length;
  const auto = count > 1 && !hold && !viewer && !prefersReducedMotion();

  useEffect(() => { setCurrent(c => Math.min(c, Math.max(0, count - 1))); }, [count]);

  const go = (d: number) => setCurrent(c => (c + d + count) % count);

  // GIF loop lengths, read from the files
  useEffect(() => {
    let alive = true;
    frames.forEach(src => gifLength(src).then(ms => { if (alive && ms) setLoops(l => ({ ...l, [src]: ms })); }));
    return () => { alive = false; };
  }, [frames]);
  const stay = stayFor(loops[frames[current]]);

  // Restarts on every slide change, so a manual pick gets a full interval.
  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => setCurrent(c => (c + 1) % count), stay);
    return () => clearTimeout(id);
  }, [auto, current, count, stay]);

  // Full screen, Persona-style: the backdrop sweeps in from the right as a
  // slanted panel, a cream sliver leading its edge (like the project
  // slashes); the current image zooms out of its spot in the carousel with a
  // slight tilt that straightens as it lands; the title slides in skewed
  // from the left and the bar rises. Closing plays it all back, the panel
  // sweeping away to the left. Only transforms, clip paths and opacity.
  const zoom = (img: HTMLElement | null | undefined, back: boolean) => {
    const from = stageRef.current?.getBoundingClientRect(), view = viewRef.current;
    if (!img || !from || !view || prefersReducedMotion()) return null;
    const to = img.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2), dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const k = Math.min(from.width / to.width, from.height / to.height);
    const run = (el: Element | null, frames: Keyframe[], o: KeyframeAnimationOptions) => el?.animate(back ? [...frames].reverse() : frames, { fill: 'both', ...o }); // both: no flash before a delayed start
    const out = back ? 'cubic-bezier(.6,0,.8,.3)' : 'cubic-bezier(.2,.9,.25,1.08)'; // in: a touch of overshoot
    view.dataset.zoom = '';
    // the panel and its sliver: a slanted edge travelling right to left (out: on to the far left)
    const edge = (x: number) => `polygon(${x}% 0, ${x + 140}% 0, ${x + 140}% 100%, ${x - 12}% 100%)`;
    const sweep = back ? [{ clipPath: edge(-12) }, { clipPath: edge(-160) }] : [{ clipPath: edge(112) }, { clipPath: edge(-12) }];
    view.querySelector('.g-v-sliver')?.animate(sweep, { duration: ZOOM_MS, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'both', delay: back ? 70 : 0 });
    view.querySelector('.g-v-bg')?.animate(sweep, { duration: ZOOM_MS, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'both', delay: back ? 0 : 70 });
    run(view.querySelector('.g-v-head'), [{ opacity: 0, transform: 'translateX(-3rem) skewX(-14deg)' }, { opacity: 1, transform: 'none' }], { duration: ZOOM_MS, easing: out, delay: back ? 0 : 140 });
    run(view.querySelector('.g-v-foot'), [{ opacity: 0, transform: 'translateY(1.5rem)' }, { opacity: 1, transform: 'none' }], { duration: ZOOM_MS, easing: out, delay: back ? 0 : 180 });
    const a = run(img, [{ transform: `translate(${dx}px, ${dy}px) scale(${k}) rotate(-3deg)` }, { transform: 'none' }], { duration: ZOOM_MS + 60, easing: out, delay: back ? 40 : 60 })!;
    if (!back) { a.onfinish = () => { delete view.dataset.zoom; }; a.effect?.updateTiming({ fill: 'none' }); }
    return a;
  };
  const currentViewImg = () => viewRef.current?.querySelectorAll<HTMLElement>('.g-v-slide img')[current];
  useEffect(() => {
    if (viewer) zoom(currentViewImg(), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer]);
  const close = () => {
    if (closing.current) return;
    const a = zoom(currentViewImg(), true);
    if (!a) { setViewer(false); return; }
    closing.current = true;
    a.onfinish = () => { closing.current = false; setViewer(false); };
  };

  // Full-screen viewer: arrows to browse, Escape to close.
  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
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

  // progress bars and counter under the images
  const bar = () => (
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
                style={{ animationDuration: `${stay}ms` }}
              />
            </button>
          ))}
        </div>
      )}
      {count > 1 && <span className="g-count" aria-live="polite">{pad(current + 1)} <span>/ {pad(count)}</span></span>}
    </div>
  );

  // previous / next inside the frame, on its sides (shown on hover, always on touch screens)
  const arrows = (
    count > 1 && (
      <>
        <button type="button" className="g-arrow left-3" onClick={e => { e.stopPropagation(); go(-1); }} aria-label="Previous image"><CaretLeft size={18} weight="bold" /></button>
        <button type="button" className="g-arrow right-3" onClick={e => { e.stopPropagation(); go(1); }} aria-label="Next image"><CaretRight size={18} weight="bold" /></button>
      </>
    )
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
      <div ref={stageRef} className="g-stage" {...swipe}>
        <div className="g-track" style={{ transform: `translateX(${-current * 100}%)` }}>
          {frames.map((src, i) => (
            <div key={src} className="g-slide" aria-hidden={i !== current}>
              <img src={src} alt={alt(i)} draggable={false} onClick={() => setViewer(true)} />
            </div>
          ))}
        </div>
        {arrows}
        <button type="button" className="g-arrow g-full" onClick={() => setViewer(true)} aria-label="View full screen"><ArrowsOut size={16} weight="bold" /></button>
      </div>

      {bar()}

      {/* Full screen: the page's deep colours, title and close on top, the
          slides moving sideways like above, the same bars and pill below.
          Clicking around the image closes it. */}
      {viewer && createPortal(
        <div ref={viewRef} className="g-viewer" role="dialog" aria-modal="true" aria-label={`${title}, images`} onClick={close}>
          <div className="g-v-sliver" aria-hidden="true" />
          <div className="g-v-bg" aria-hidden="true" />
          <div className="g-v-head" onClick={e => e.stopPropagation()}>
            <div className="min-w-0">
              <p className="h-caps text-[0.62rem] text-[var(--h-c2)]">Images</p>
              <p className="h-display g-v-title">{title}</p>
            </div>
            <div className="s-nav flex flex-none">
              <button type="button" className="s-nav-item s-top-item s-top-wide h-swap-host" onClick={close} aria-label="Close">
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
            {arrows}
          </div>
          <div className="g-v-foot" onClick={e => e.stopPropagation()}>{bar()}</div>
        </div>,
        document.body,
      )}
    </div>
  );
};
