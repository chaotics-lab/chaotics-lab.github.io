import { useEffect, useState } from 'react';
import { ELEMENTS } from '@/config/elements';
import { applyTheme, currentElement, onThemeChange } from '@/lib/theme';
import { ElementGlyph } from './ElementGlyph';

// The seven elements as a header-style pill (footer). Hovering tints an
// icon towards its element's colour; clicking switches the colour scheme.
export const ElementSwitch = () => {
  const [active, setActive] = useState(currentElement);
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
          onClick={() => { if (e.id !== currentElement()) applyTheme(e.id, true); }}
        >
          <ElementGlyph id={e.id} size={20} className="s-icon" />
        </button>
      ))}
    </div>
  );
};
