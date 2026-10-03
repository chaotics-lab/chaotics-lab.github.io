// Two periods of a smooth wave in a 2880x60 box, so an edge drawn with it
// can drift by half its width and loop (.pt-wave).
export const WAVE = (() => {
  let d = 'M0 30';
  for (let x = 0; x < 2880; x += 360) d += ` Q${x + 90} ${x % 720 ? 52 : 8} ${x + 180} 30 T${x + 360} 30`;
  return `${d} V60 H0 Z`;
})();
