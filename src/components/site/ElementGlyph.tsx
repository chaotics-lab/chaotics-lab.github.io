import { ELEMENT_PATHS } from '@/config/elementPaths';

// An element icon drawn like the header's duotone icons: a faint fill and
// an outline in the current text colour; `filled` draws it solid instead
// (the chosen element). Pyra's traced ring is two contours less than 2 px
// apart at this size, whose strokes merge into a thick band: its outline is
// the star plus one thin circle along the middle of the ring.
const PYRA_STAR = ELEMENT_PATHS.pyra.split(/(?=M)/)[0];
const OUTLINE: Record<string, string> = {
  pyra: `${PYRA_STAR} M 372.5 256 A 116 116 0 1 0 140.5 256 A 116 116 0 1 0 372.5 256 Z`,
};

export const ElementGlyph = ({ id, size = 18, className = '', filled = false }: { id: string; size?: number; className?: string; filled?: boolean }) => (
  <svg viewBox="0 0 512 512" width={size} height={size} className={className} aria-hidden="true">
    {filled
      ? <path d={ELEMENT_PATHS[id]} fill="currentColor" fillRule="evenodd" />
      : <path d={OUTLINE[id] ?? ELEMENT_PATHS[id]} fill="currentColor" fillOpacity={0.2} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
  </svg>
);
