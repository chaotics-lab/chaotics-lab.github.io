// One colour scheme per element. Aqua is the original P3R blue; the others
// are derived from it in OKLCH: each colour keeps its lightness and role,
// the background colours move to the element's hue, the accents to a
// lighter neighbouring hue, and chroma is scaled per element (then clipped
// to sRGB). Keys match the CSS variables --h-<key>.
//   top/mid/deep/night: page gradient, from the surface to the deep
//   c1/c2/c3: accents, from strongest to palest
//   ramp: first step of the AI usage ramp

export type Palette = Record<'top' | 'mid' | 'deep' | 'night' | 'ramp' | 'c1' | 'c2' | 'c3', string>;

export const THEMES: Record<string, Palette> = {
  aqua: { top: '#0B5BD9', mid: '#0842B0', deep: '#052C7E', night: '#031A4E', ramp: '#4C8DFF', c1: '#16CFFB', c2: '#7DE6FD', c3: '#BFF4FF' },
  pyra: { top: '#C0031F', mid: '#960110', deep: '#6A0006', night: '#430003', ramp: '#EC5A55', c1: '#FCA551', c2: '#FFC7A2', c3: '#FFE3D3' },
  volta: { top: '#247B02', mid: '#0F5F02', deep: '#044200', night: '#022800', ramp: '#53A940', c1: '#C3C301', c2: '#E7D857', c3: '#F5ECAD' },
  aero: { top: '#357366', mid: '#22594F', deep: '#143D36', night: '#0B2520', ramp: '#689E92', c1: '#98C8AD', c2: '#BEDEC6', c3: '#DEEEE1' },
  cryo: { top: '#037386', mid: '#055868', deep: '#023C49', night: '#01242C', ramp: '#15A2BD', c1: '#5ECFD5', c2: '#9AE4E1', c3: '#CCF2EF' },
  gaia: { top: '#95522D', mid: '#753D1A', deep: '#52290E', night: '#321707', ramp: '#BF805F', c1: '#DAB57C', c2: '#EFCEA9', c3: '#F9E6D2' },
  flora: { top: '#A42791', mid: '#831171', deep: '#5D074E', night: '#390530', ramp: '#CF62BB', c1: '#FD97BB', c2: '#FEBFDB', c3: '#FEDFED' },
};
