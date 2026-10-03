import { ELEMENT_PATHS } from '@/config/elementPaths';

// An element icon drawn like the header's duotone icons: a faint fill and
// an outline in the current text colour.
export const ElementGlyph = ({ id, size = 18, className = '' }: { id: string; size?: number; className?: string }) => (
  <svg viewBox="0 0 512 512" width={size} height={size} className={className} aria-hidden="true">
    <path d={ELEMENT_PATHS[id]} fill="currentColor" fillOpacity={0.2} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
  </svg>
);
