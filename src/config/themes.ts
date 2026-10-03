// One colour scheme per element. Aqua is the original P3R blue; the others
// are derived from it in OKLCH: each colour keeps its lightness and role,
// the background colours move to the element's hue, the accents to a
// neighbouring hue that stays in the same colour family (Pyra stays red,
// never orange; Volta stays green-lime; Aero stays sea-green), and chroma
// is scaled per element (then clipped to sRGB). Keys match the CSS
// variables --h-<key>.
//   top/mid/deep/night: page gradient, from the surface to the deep
//   c1/c2/c3: accents, from strongest to palest
//   ramp: first step of the AI usage ramp

export type Palette = Record<'top' | 'mid' | 'deep' | 'night' | 'ramp' | 'c1' | 'c2' | 'c3', string>;

export const THEMES: Record<string, Palette> = {
  aqua: { top: '#0B5BD9', mid: '#0842B0', deep: '#052C7E', night: '#031A4E', ramp: '#4C8DFF', c1: '#16CFFB', c2: '#7DE6FD', c3: '#BFF4FF' },
  pyra: { top: '#C0031F', mid: '#960015', deep: '#6A000B', night: '#430004', ramp: '#EC5A56', c1: '#FE9C9F', c2: '#FFC3C3', c3: '#FEE1E1' },
  volta: { top: '#507401', mid: '#3C5800', deep: '#283D00', night: '#162500', ramp: '#74A318', c1: '#ADCA31', c2: '#C8E36C', c3: '#E2F2B5' },
  aero: { top: '#377364', mid: '#24594C', deep: '#163D34', night: '#0C251F', ramp: '#6A9E8F', c1: '#92C9B5', c2: '#B7DFD0', c3: '#DAEFE6' },
  cryo: { top: '#037386', mid: '#055868', deep: '#023C49', night: '#01242C', ramp: '#15A2BD', c1: '#5ECFD5', c2: '#9AE4E1', c3: '#CCF2EF' },
  gaia: { top: '#95522D', mid: '#753D1A', deep: '#52290E', night: '#321707', ramp: '#BF805F', c1: '#DAB57C', c2: '#EFCEA9', c3: '#F9E6D2' },
  flora: { top: '#A42791', mid: '#831171', deep: '#5D074E', night: '#390530', ramp: '#CF62BB', c1: '#FD97BB', c2: '#FEBFDB', c3: '#FEDFED' },
};
