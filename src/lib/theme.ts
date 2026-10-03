import { THEMES, type Palette } from '@/config/themes';

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

export function applyTheme(id: string) {
  const palette = THEMES[id] ?? THEMES.aqua;
  element = THEMES[id] ? id : 'aqua';
  rgb = toRgb(palette);
  const root = document.documentElement;
  (Object.keys(palette) as (keyof Palette)[]).forEach(k => {
    root.style.setProperty(`--h-${k}`, palette[k]);
    root.style.setProperty(`--h-${k}-rgb`, rgb[k].replace(/,/g, ''));
  });
  root.dataset.element = element;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palette.top);
  try { localStorage.setItem(KEY, element); } catch { /* storage unavailable */ }
  listeners.forEach(fn => fn());
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
