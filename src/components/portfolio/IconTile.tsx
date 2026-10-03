import { memo, type CSSProperties, type ReactNode } from 'react';

// Warped cream tile from the element icon cards: the top edge rises to the
// right and each side bows slightly. Drawn in a 100x100 box, stretched to
// the tile's size, with a hard ink shadow behind.
const PATH = 'M3 9 C 30 4.5, 68 1.5, 97 0 C 99.6 32, 99.6 66, 98.2 97.5 C 66 98.6, 33 99.6, 1 99 C -0.4 70, 0.4 39, 3 9 Z';

export const Tile = ({ children, className = '', shadow = '6px', style }: {
  children?: ReactNode;
  className?: string;
  shadow?: string;
  style?: CSSProperties;
}) => (
  <span className={`e-tile ${className}`} style={{ ['--sh' as string]: shadow, ...style }}>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="e-tile-shadow" aria-hidden="true"><path d={PATH} /></svg>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="e-tile-face" aria-hidden="true"><path d={PATH} /></svg>
    {children}
  </span>
);

// An element icon sitting on its cream tile.
export const IconTile = memo(({ id, className = '', shadow, iconClassName = '' }: {
  id: string;
  className?: string;
  shadow?: string;
  iconClassName?: string;
}) => (
  <Tile className={`aspect-square ${className}`} shadow={shadow}>
    <img src={`/${id}.png`} alt="" draggable={false} className={`w-[64%] h-[64%] object-contain select-none ${iconClassName}`} />
  </Tile>
));
IconTile.displayName = 'IconTile';
