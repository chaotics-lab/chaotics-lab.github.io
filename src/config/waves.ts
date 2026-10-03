// How the hero water moves for each element. Aqua is the reference (all 1
// or 0); the others scale it.
//   amp, speed, freq: wave height, speed and how many crests fit across
//   sharp: 0 = round crests, 1 = flat-topped, straight-edged (Volta)
//   fluid: extra rolling harmonic on top (Pyra)
//   lumps: small slow bumps riding on the swell (Cryo slush, Gaia mud)
//   drift: each layer's depth wanders slowly on its own (Aero)
//   stir: how much the pointer moves the front layer
//   opacity: density of the water layers

export interface WaveStyle {
  amp: number;
  speed: number;
  freq: number;
  sharp: number;
  fluid: number;
  lumps: number;
  drift: number;
  stir: number;
  opacity: number;
}

const BASE: WaveStyle = { amp: 1, speed: 1, freq: 1, sharp: 0, fluid: 0, lumps: 0, drift: 0, stir: 1, opacity: 1 };

export const WAVES: Record<string, WaveStyle> = {
  aqua: BASE,
  volta: { ...BASE, amp: 0.9, speed: 1.3, freq: 1.25, sharp: 1 },
  pyra: { ...BASE, amp: 1.45, speed: 1.6, freq: 0.9, fluid: 1, stir: 1.3 },
  cryo: { ...BASE, amp: 0.6, speed: 0.4, lumps: 1, stir: 0.5 },
  gaia: { ...BASE, amp: 0.75, speed: 0.5, freq: 0.7, lumps: 0.45, stir: 0.35, opacity: 1.8 },
  flora: { ...BASE, amp: 1.05, speed: 0.95, freq: 1.05 },
  aero: { ...BASE, amp: 1, speed: 1.05, drift: 1 },
};
