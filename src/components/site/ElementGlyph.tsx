import { ELEMENT_PATHS } from '@/config/elementPaths';

// An element icon drawn like the header's Phosphor duotone icons: line art
// on a 24 px grid with the same stroke (1.5 units, 1.25 px at 20 px) and a
// faint fill, redrawn by hand after the element icons (the traced outlines
// in elementPaths.ts outline both edges of every line, which reads as a
// thick double stroke this small). `filled` draws the traced icon solid
// instead (the chosen element).
const LINES: Record<string, { fill: string; line?: string }> = {
  // a drop leaning right, with its highlight, and a small drop beside it
  aqua: {
    fill: 'M17.5 3 L16.69 14.92 A6.2 6.2 0 1 1 7.28 9.2 Z M21.6 8.2 L21.29 11.75 A1.7 1.7 0 1 1 18.65 10.19 Z',
    line: 'M7.2 16.4 a1.4 1.4 0 1 0 2.8 0 a1.4 1.4 0 1 0 -2.8 0',
  },
  // eight-point star around a ring
  pyra: {
    fill: 'M12 1.4 L14.83 5.16 L19.5 4.5 L18.84 9.17 L22.6 12 L18.84 14.83 L19.5 19.5 L14.83 18.84 L12 22.6 L9.17 18.84 L4.5 19.5 L5.16 14.83 L1.4 12 L5.16 9.17 L4.5 4.5 L9.17 5.16 Z',
    line: 'M7.8 12 a4.2 4.2 0 1 0 8.4 0 a4.2 4.2 0 1 0 -8.4 0',
  },
  // twelve-point star around a hexagon
  cryo: {
    fill: 'M12 1.6 L14.28 3.5 L17.2 2.99 L18.22 5.78 L21.01 6.8 L20.5 9.72 L22.4 12 L20.5 14.28 L21.01 17.2 L18.22 18.22 L17.2 21.01 L14.28 20.5 L12 22.4 L9.72 20.5 L6.8 21.01 L5.78 18.22 L2.99 17.2 L3.5 14.28 L1.6 12 L3.5 9.72 L2.99 6.8 L5.78 5.78 L6.8 2.99 L9.72 3.5 Z',
    line: 'M12 7.2 L16.16 9.6 L16.16 14.4 L12 16.8 L7.84 14.4 L7.84 9.6 Z',
  },
  // a bolt striking down to the left, with a spark where it lands
  volta: {
    fill: 'M15.5 2 L7.5 12.6 H12.4 L9.6 21.2 L18.6 9.6 H13.4 Z',
    line: 'M5.6 19.2 L3.4 20.2 M6.4 21.6 L5.2 23 M4.4 16.8 L2.4 16.2',
  },
  // a tornado: rings narrowing and drifting as they go down
  aero: {
    fill: '',
    line: 'M2.6 4 C8 2.6 16 2.6 21.4 4 C16 5.6 8 5.6 3.4 4.4 M5.4 8.6 C10 7.6 15.6 7.8 19.4 8.8 M8.2 12.8 C11 12.2 14.6 12.4 16.6 13.2 M9.8 16.8 C11.6 16.4 13.4 16.6 14.2 17.2 M11.4 20.2 L12.6 22',
  },
  // a mountain rising out of a wave
  gaia: {
    fill: 'M2.8 14.6 L8.2 7.4 L10.8 10.4 L13.6 4 L21.2 14.6 C21.2 19 17 22 12 22 C7 22 2.8 19 2.8 14.6 Z',
    line: 'M6.6 17 C9.6 14.6 14.4 14.6 17.4 17',
  },
  // a five-lobed flower with a small one inside
  flora: {
    fill: 'M8.24 6.82 Q12 -1.2 15.76 6.82 Q24.55 7.92 18.09 13.98 Q19.76 22.68 12 18.4 Q4.24 22.68 5.91 13.98 Q-0.55 7.92 8.24 6.82 Z',
    line: 'M10.71 10.22 Q12 7.4 13.29 10.22 Q16.37 10.58 14.09 12.68 Q14.7 15.72 12 14.2 Q9.3 15.72 9.91 12.68 Q7.63 10.58 10.71 10.22 Z',
  },
};

export const ElementGlyph = ({ id, size = 18, className = '', filled = false }: { id: string; size?: number; className?: string; filled?: boolean }) => {
  if (filled) {
    return (
      <svg viewBox="0 0 512 512" width={size} height={size} className={className} aria-hidden="true">
        <path d={ELEMENT_PATHS[id]} fill="currentColor" fillRule="evenodd" />
      </svg>
    );
  }
  const g = LINES[id] ?? LINES.aqua;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {g.fill && <path d={g.fill} fill="currentColor" fillOpacity={0.2} />}
      {g.line && <path d={g.line} />}
    </svg>
  );
};
