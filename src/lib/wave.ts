// Two periods of a smooth wave in a 2880x60 box, so an edge drawn with it
// can drift by half its width and loop (.pt-wave).
export const WAVE = (() => {
  let d = 'M0 30';
  for (let x = 0; x < 2880; x += 360) d += ` Q${x + 90} ${x % 720 ? 52 : 8} ${x + 180} 30 T${x + 360} 30`;
  return `${d} V60 H0 Z`;
})();

// The same wave turned on its side, in a 60x2880 box, filled on its left:
// a vertical edge for layers that sweep sideways (.pt-hedge).
export const WAVE_V = (() => {
  let d = 'M30 0';
  for (let y = 0; y < 2880; y += 360) d += ` Q${y % 720 ? 52 : 8} ${y + 90} 30 ${y + 180} T30 ${y + 360}`;
  return `${d} H0 V0 Z`;
})();
