import { useEffect, useState } from 'react';
import { ELEMENTS } from '@/config/elements';
import { applyTheme, currentElement, onThemeChange } from '@/lib/theme';
import { usePageTransition } from '@/lib/pageTransition';
import { THEMES } from '@/config/themes';
import { ElementGlyph } from './ElementGlyph';

// The seven elements as a header-style pill (footer). Hovering tints an
// icon towards its element's colour; clicking switches the colour scheme.
export const ElementSwitch = () => {
  const [active, setActive] = useState(currentElement);
  const { dive } = usePageTransition();
  useEffect(() => onThemeChange(() => setActive(currentElement())), []);

  return (
    <div className="s-nav flex" role="group" aria-label="Colour scheme">
      {ELEMENTS.map(e => (
        <button
          key={e.id}
          type="button"
          className="s-nav-item s-el"
          style={{ ['--el' as string]: e.color }}
          aria-pressed={active === e.id}
          aria-label={`${e.name} colour scheme`}
          title={e.name}
          onClick={ev => {
            if (e.id === currentElement()) return;
            // the new colours sweep round from this button (PageTransition 'wipe')
            const r = ev.currentTarget.getBoundingClientRect(), pal = THEMES[e.id] ?? THEMES.aqua;
            dive(() => applyTheme(e.id), { kind: 'wipe', colors: [pal.c1, pal.top], origin: { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
          }}
        >
          <ElementGlyph id={e.id} size={20} className="s-icon" filled={active === e.id} />
        </button>
      ))}
    </div>
  );
};
