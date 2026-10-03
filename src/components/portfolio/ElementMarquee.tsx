import { useEffect, useRef, useState } from 'react';
import { ELEMENTS } from '@/config/elements';
import { applyTheme, currentElement, onThemeChange } from '@/lib/theme';
import { usePageTransition } from '@/lib/pageTransition';
import { IconTile } from './IconTile';

// Slanted black band with the elements scrolling past (P5-style ticker).
// The list is rendered twice so the -50% loop is seamless. Clicking an
// element dives into its colour scheme. The ocean layer is clipped to the
// band's bottom edge, found through data-ocean-top.
export const ElementMarquee = () => {
  const { dive } = usePageTransition();
  const [active, setActive] = useState(currentElement);
  useEffect(() => onThemeChange(() => setActive(currentElement())), []);

  // Hovering eases the scroll down to 20% speed (sine in-out) and back.
  const trackRef = useRef<HTMLDivElement>(null);
  const tween = useRef(0);
  useEffect(() => () => cancelAnimationFrame(tween.current), []);
  const ease = (to: number) => {
    const anim = trackRef.current?.getAnimations()[0];
    if (!anim) return;
    cancelAnimationFrame(tween.current);
    const from = anim.playbackRate;
    const start = performance.now();
    const MS = 600;
    const frame = (now: number) => {
      const k = Math.min(1, (now - start) / MS);
      anim.updatePlaybackRate(from + (to - from) * (0.5 - 0.5 * Math.cos(Math.PI * k)));
      if (k < 1) tween.current = requestAnimationFrame(frame);
    };
    tween.current = requestAnimationFrame(frame);
  };

  const pick = (id: string) => {
    if (id !== currentElement()) dive(() => applyTheme(id));
  };

  return (
    <div
      data-ocean-top
      onPointerEnter={() => ease(0.2)}
      onPointerLeave={() => ease(1)}
      className="e-band relative -rotate-2 my-6 md:my-10 -mx-4 bg-[#121212] border-y-[3px] border-[#121212] overflow-hidden select-none">
      <div ref={trackRef} className="h-marquee py-3 md:py-4">
        {[0, 1].map(copy => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1 || undefined}>
            {[...ELEMENTS, ...ELEMENTS].map((e, i) => (
              <button
                key={`${copy}-${i}`}
                type="button"
                onClick={() => pick(e.id)}
                tabIndex={copy === 0 && i < ELEMENTS.length ? 0 : -1}
                aria-pressed={active === e.id}
                aria-label={`${e.name} colour scheme`}
                className="e-pick flex items-center gap-3 px-6 md:px-8"
                style={{ ['--el' as string]: e.color }}
              >
                <IconTile id={e.id} shadow="0px" className="w-10 md:w-12" />
                <span className="h-display not-italic text-3xl md:text-5xl">{e.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
