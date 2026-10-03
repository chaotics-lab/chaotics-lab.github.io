// Minimal OKLCH helpers (Björn Ottosson's OKLab), used to derive project
// palettes at runtime the same way the element palettes were derived.

export type Lch = { l: number; c: number; h: number };

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function hexToLch(hex: string): Lch {
  const [r, g, b] = [1, 3, 5].map(i => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

function lchToRgb({ l: L, c, h }: Lch): number[] {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

// Back to hex, lowering chroma until the colour fits in sRGB.
export function lchToHex(lch: Lch): string {
  let c = lch.c;
  let rgb = lchToRgb({ ...lch, c });
  while (c > 0 && rgb.some(v => v < -0.0005 || v > 1.0005)) {
    c -= 0.002;
    rgb = lchToRgb({ ...lch, c: Math.max(0, c) });
  }
  return '#' + rgb.map(v => Math.round(Math.min(1, Math.max(0, toGamma(Math.max(0, v)))) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Mix two hex colours in OKLCH, turning the hue the short way round so the
// in-between colours stay as saturated as the ends (k = 0 gives a, 1 b).
export function mixHex(a: string, b: string, k: number): string {
  const p = hexToLch(a);
  const q = hexToLch(b);
  // A grey has no real hue: borrow the other colour's.
  const ph = p.c < 0.02 ? q.h : p.h;
  const qh = q.c < 0.02 ? p.h : q.h;
  const dh = ((qh - ph + 540) % 360) - 180;
  return lchToHex({ l: p.l + (q.l - p.l) * k, c: p.c + (q.c - p.c) * k, h: (ph + dh * k + 360) % 360 });
}
