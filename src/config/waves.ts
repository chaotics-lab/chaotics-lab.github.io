// How the hero water moves for each element. Aqua is the reference (all 1
// or 0); the others scale it.
//   amp, speed, freq: wave height, speed and how many crests fit across
//   zig: electric water (Volta): triangle swell, crawling zigzag teeth,
//        flickering crest, random shocks, drawn with straight segments
//   fluid: extra rolling harmonic on top (Pyra)
//   lumps: small slow bumps riding on the swell (Cryo slush, Gaia mud)
//   drift: each layer's depth wanders slowly on its own
//   storm: stormy sea (Aero): sharp leaning crests, gusts, chop, and
//          tornado icons blown off the crests
//   petals: flower icons resting on the surface (Flora), as their opacity
//   frost: snowflake icons hovering over the surface (Cryo)
//   solar: solar flares throwing icons up on parabolas (Pyra)
//   rain: drop icons raining into the water (Aqua)
//   earth: icons slowly rising out of the water and sinking back (Gaia)
//   (icon effects play on three depth planes, behind each wave layer)
//   breathe: the swell slowly grows and settles (Flora)
//   stir: how much the pointer moves the front layer
//   opacity: density of the water layers

export interface WaveStyle {
  amp: number;
  speed: number;
  freq: number;
  zig: number;
  fluid: number;
  lumps: number;
  drift: number;
  storm: number;
  petals: number;
  frost: number;
  solar: number;
  rain: number;
  earth: number;
  breathe: number;
  stir: number;
  opacity: number;
}

const BASE: WaveStyle = { amp: 1, speed: 1, freq: 1, zig: 0, fluid: 0, lumps: 0, drift: 0, storm: 0, petals: 0, frost: 0, solar: 0, rain: 0, earth: 0, breathe: 0, stir: 1, opacity: 1 };

export const WAVES: Record<string, WaveStyle> = {
  aqua: { ...BASE, rain: 1 },
  volta: { ...BASE, amp: 0.85, speed: 1.4, freq: 1.3, zig: 1 },
  pyra: { ...BASE, amp: 1.45, speed: 1.6, freq: 0.9, fluid: 1, solar: 1, stir: 1.3 },
  cryo: { ...BASE, amp: 0.6, speed: 0.4, lumps: 1, frost: 1, stir: 0.5 },
  gaia: { ...BASE, amp: 0.75, speed: 0.5, freq: 0.7, lumps: 0.45, earth: 1, stir: 0.35, opacity: 1.8 },
  flora: { ...BASE, amp: 0.4, speed: 0.4, freq: 0.7, petals: 1, breathe: 0.4, stir: 0.4 },
  aero: { ...BASE, amp: 1.6, speed: 1.6, freq: 1.15, drift: 0.6, storm: 1, stir: 1.4, opacity: 1.5 },
};
