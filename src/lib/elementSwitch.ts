import { THEMES } from '@/config/themes';
import { applyTheme, currentElement } from './theme';
import { prefersReducedMotion } from './ticker';

// Switching element, kept light: no cover over the page. The clicked tile
// flips over where it is, two rings in the new element's colours ripple out
// from it across the screen, and the colours blend over in under half a
// second (.e-flip, .e-ring in index.css).
const BLEND_MS = 450;

export function ring(x: number, y: number, color: string, delay = 0, small = false) {
  const el = document.createElement('span');
  el.className = small ? 'e-ring e-ring-small' : 'e-ring';
  el.style.cssText = `left:${x}px;top:${y}px;color:${color};--d:${delay}ms`;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 900 + delay);
}

export function flip(tile: Element | null) {
  if (!tile) return;
  tile.classList.remove('e-flip');
  void (tile as HTMLElement).offsetWidth; // restart the animation
  tile.classList.add('e-flip');
  window.setTimeout(() => tile.classList.remove('e-flip'), 600);
}

export function switchElement(id: string, from?: HTMLElement) {
  if (id === currentElement()) return;
  if (prefersReducedMotion() || !from) { applyTheme(id, !prefersReducedMotion(), BLEND_MS); return; }
  const tile = from.querySelector('.e-tile') ?? from, r = tile.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  const pal = THEMES[id] ?? THEMES.aqua;
  flip(tile);
  ring(x, y, pal.c1);
  ring(x, y, 'var(--h-cream)', 90);
  applyTheme(id, true, BLEND_MS);
}
