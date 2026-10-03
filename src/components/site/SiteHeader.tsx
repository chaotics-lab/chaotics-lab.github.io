import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SOCIALS, isExternal } from './links';

// Unseen-style header: a pill of links on the right with a cream
// highlight that slides to whichever link is hovered. On phones the links
// shrink to their icons.
export const SiteHeader = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const [blob, setBlob] = useState({ x: 0, w: 0, on: false });

  const place = useCallback(() => {
    const el = navRef.current?.querySelector<HTMLElement>(`[data-name="${hovered}"]`);
    setBlob(b => (el ? { x: el.offsetLeft, w: el.offsetWidth, on: true } : { ...b, on: false }));
  }, [hovered]);

  useLayoutEffect(place, [place]);
  useEffect(() => {
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [place]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 select-none">
      <div className="flex items-center justify-end px-4 sm:px-6 py-4">
        <nav ref={navRef} className="s-nav flex" onMouseLeave={() => setHovered(null)} aria-label="Contact">
          <span
            className="s-nav-blob"
            style={{ width: blob.w, transform: `translateX(${blob.x}px)`, opacity: blob.on ? 1 : 0 }}
            aria-hidden="true"
          />
          {SOCIALS.map(({ name, url, icon: Icon }) => (
            <a
              key={name}
              href={url}
              target={isExternal(url) ? '_blank' : undefined}
              rel={isExternal(url) ? 'noopener noreferrer' : undefined}
              data-name={name}
              data-on={hovered === name}
              className="s-nav-item h-swap-host"
              aria-label={name}
              onMouseEnter={() => setHovered(name)}
              onFocus={() => setHovered(name)}
              onBlur={() => setHovered(null)}
            >
              <Icon size={18} weight="duotone" className="s-icon" />
              <span className="h-swap s-nav-label">
                <span>{name}</span>
                <span className="h-serif text-[1.1rem] leading-[1.05]" aria-hidden="true">{name}</span>
              </span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};
