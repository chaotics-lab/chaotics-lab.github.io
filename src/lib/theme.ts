import { THEMES, type Palette } from '@/config/themes';
import { hexToLch, lchToHex } from './oklch';

// The active element colour scheme. It is applied as CSS variables on
// <html> (--h-top, --h-c1, ... and --h-<key>-rgb triplets for alpha), and
// kept here as plain values for the canvases, which can't read var().

const KEY = 'lox-element';
type Rgb = Record<keyof Palette, string>; // "r, g, b"

let element = 'aqua';
let rgb: Rgb = toRgb(THEMES.aqua);
const listeners = new Set<() => void>();

function toRgb(p: Palette): Rgb {
  const out = {} as Rgb;
  (Object.keys(p) as (keyof Palette)[]).forEach(k => {
    const h = p[k];
    out[k] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ');
  });
  return out;
}

function paint(palette: Palette) {
  rgb = toRgb(palette);
  const root = document.documentElement;
  (Object.keys(palette) as (keyof Palette)[]).forEach(k => {
    root.style.setProperty(`--h-${k}`, palette[k]);
    root.style.setProperty(`--h-${k}-rgb`, rgb[k].replace(/,/g, ''));
  });
  root.dataset.element = element;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palette.top);
  listeners.forEach(fn => fn());
}

// Switch element (remembered for the next visit). A project palette shown
// at the time keeps showing until the project page clears it.
let override: Palette | null = null;
export function applyTheme(id: string) {
  element = THEMES[id] ? id : 'aqua';
  try { localStorage.setItem(KEY, element); } catch { /* storage unavailable */ }
  paint(override ?? THEMES[element]);
}

// A project page paints the site in the project's colours; null goes back
// to the element.
export function setProjectPalette(p: Palette | null) {
  override = p;
  paint(p ?? THEMES[element]);
}

// Project palette from its two theme colours, built like the element ones:
// every colour keeps Aqua's lightness, the background colours take the hue
// of the more saturated project colour and the accents the hue of the
// other one (or a neighbour of the first if the other is grey/white).
// Chroma follows how saturated the source colour is.
const BG_KEYS = ['top', 'mid', 'deep', 'night', 'ramp'] as const;
const ACCENT_KEYS = ['c1', 'c2', 'c3'] as const;
const cache = new Map<string, Palette>();

export function projectPalette(colors?: string[]): Palette | null {
  if (!colors?.length || !colors.every(c => /^#[0-9a-f]{6}$/i.test(c))) return null;
  const key = colors.join();
  const hit = cache.get(key);
  if (hit) return hit;
  const lch = colors.map(hexToLch);
  const [a, b] = [lch[0], lch[1] ?? lch[0]];
  const [bg, acc] = a.c >= b.c ? [a, b] : [b, a];
  const aqua = THEMES.aqua;
  const bgScale = Math.min(1.1, Math.max(0.12, bg.c / hexToLch(aqua.top).c));
  const accSrc = acc.c < 0.04 ? { ...bg, h: (bg.h + 25) % 360 } : acc;
  const accScale = Math.min(1.1, Math.max(0.15, accSrc.c / hexToLch(aqua.c1).c));
  const out = {} as Palette;
  BG_KEYS.forEach(k => { const o = hexToLch(aqua[k]); out[k] = lchToHex({ l: o.l, c: o.c * bgScale, h: bg.h }); });
  ACCENT_KEYS.forEach(k => { const o = hexToLch(aqua[k]); out[k] = lchToHex({ l: o.l, c: o.c * accScale, h: accSrc.h }); });
  cache.set(key, out);
  return out;
}

export function initTheme() {
  let saved: string | null = null;
  try { saved = localStorage.getItem(KEY); } catch { /* storage unavailable */ }
  applyTheme(saved ?? 'aqua');
}

export const currentElement = () => element;

// "r, g, b" for a palette key, e.g. `rgba(${themeRgb().c3}, 0.5)`.
export const themeRgb = () => rgb;

export function onThemeChange(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
