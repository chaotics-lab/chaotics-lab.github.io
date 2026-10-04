// One colour scheme per element. Aqua is the original P3R blue and the
// reference; every other one is derived from its element icon's colour
// (ELEMENTS[].color, sampled from the PNGs) in OKLCH: each role keeps
// Aqua's lightness, takes the icon's exact hue, and Aqua's chroma scaled by
// how saturated the icon is next to Aqua's (then clipped to sRGB). Pyra is
// moved off its icon's hue (24, a little pink) to pure red, hue 29, with
// its pale accents a few degrees warmer (31 to 33) so they read as light
// red rather than salmon. Keys match the CSS variables --h-<key>.
//   top/mid/deep/night: page gradient, from the surface to the deep
//   c1/c2/c3: accents, from strongest to palest
//   ramp: first step of the AI usage ramp

export type Palette = Record<'top' | 'mid' | 'deep' | 'night' | 'ramp' | 'c1' | 'c2' | 'c3', string>;

export const THEMES: Record<string, Palette> = {
  aqua: { top: '#0B5BD9', mid: '#0842B0', deep: '#052C7E', night: '#031A4E', ramp: '#4C8DFF', c1: '#16CFFB', c2: '#7DE6FD', c3: '#BFF4FF' },
  pyra: { top: '#C10002', mid: '#970001', deep: '#6B0000', night: '#440000', ramp: '#FE4133', c1: '#FF9E8C', c2: '#FEC4B7', c3: '#FEE3DC' },
  volta: { top: '#5C7001', mid: '#465600', deep: '#2F3B00', night: '#1B2300', ramp: '#839F01', c1: '#ABCB38', c2: '#C8E183', c3: '#E2F1BF' },
  aero: { top: '#4C6F64', mid: '#37554C', deep: '#243B34', night: '#15231E', ramp: '#7A9A8F', c1: '#A8C2B9', c2: '#C7D9D3', c3: '#E2ECE8' },
  cryo: { top: '#017480', mid: '#035962', deep: '#003D45', night: '#00252A', ramp: '#02A4B5', c1: '#4FCFE1', c2: '#92E4F0', c3: '#C8F2F9' },
  gaia: { top: '#9A4E23', mid: '#7A3912', deep: '#562609', night: '#341605', ramp: '#C57D59', c1: '#E7AC8F', c2: '#F5CAB4', c3: '#FCE4D8' },
  flora: { top: '#AC0398', mid: '#860076', deep: '#5E0053', night: '#3B0033', ramp: '#DC50C5', c1: '#FC8EE6', c2: '#FEBBEF', c3: '#FFDEF6' },
};
