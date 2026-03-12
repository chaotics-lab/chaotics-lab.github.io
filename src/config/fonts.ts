/**
 * Centralized font configuration.
 * Edit font stacks here — they flow into Tailwind, CSS, and components automatically.
 */

export const fonts = {
  /** Display — hero headings, large type near logo */
  display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],

  /** Serif — contrast accent headings */
  serif: ['"DM Serif Display"', 'Georgia', 'serif'],

  /** Sans — body text */
  sans: ['"Sora"', 'system-ui', 'sans-serif'],

  /** UI — labels, nav, tags */
  ui: ['"Outfit"', 'sans-serif'],

  /** Mono — code blocks, badges, technical labels */
  mono: ['"Fira Code"', '"JetBrains Mono"', 'monospace'],

  /** Prose — long-form markdown paragraphs */
  prose: ['"Source Serif 4"', 'Georgia', 'serif'],

  /** Sticker — AI usage stickers */
  sticker: ['"Archivo Black"', 'sans-serif'],
} as const;

/** Google Fonts URL importing all web fonts used above. */
export const googleFontsUrl =
  'https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Serif+Display&family=JetBrains+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,400&family=Space+Grotesk:wght@400;500;600;700&display=swap';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Turn a font array into a CSS `font-family` value (for inline styles / CSS). */
export function toCssFontFamily(stack: readonly string[]): string {
  return stack.join(', ');
}
