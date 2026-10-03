// An element icon (public/<id>.png) for the footer picker: a white
// silhouette, or in its own colours when `active` (the chosen element).
export const ElementGlyph = ({ id, size = 18, className = '', active = false }: { id: string; size?: number; className?: string; active?: boolean }) => (
  <img src={`/${id}.png`} alt="" width={size} height={size} draggable={false} className={`e-glyph ${className}`} data-active={active || undefined} aria-hidden="true" />
);
