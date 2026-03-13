---
title: Rendering Text in Allegro 4
date: 2021-10-26
tags:
  - C
  - Allegro
  - gamedev
  - graphics
summary: How to display text in Allegro 4 using the built-in font functions, load custom fonts from PCX files, and scale text using a bitmap trick.
---

# Rendering Text in Allegro 4

Allegro 4 provides a small set of functions for rendering text to a bitmap. They cover left-aligned, centred, right-aligned, and justified placement, and all work the same way with any loaded font.

## The Core Text Functions

```c
textout_ex(bmp, font, text, x, y, colour, bg);
textout_centre_ex(bmp, font, text, x, y, colour, bg);
textout_right_ex(bmp, font, text, x, y, colour, bg);
textout_justify_ex(bmp, font, text, x1, x2, y, diff, colour, bg);
```

The arguments follow the same pattern across all four:

- `bmp` -- the bitmap to draw onto, usually `screen` or a buffer
- `font` -- the font to use (built-in `font`, or a loaded custom one)
- `text` -- a C string
- `x`, `y` -- position; for `_centre_ex`, `x` is the centre point
- `colour` -- use `makecol(r, g, b)` with values from 0 to 255
- `bg` -- background colour behind the text; pass `-1` for transparent

### Example: centred red text with a transparent background

```c
textout_centre_ex(screen, font, "GAME OVER", SCREEN_W / 2, SCREEN_H / 2, makecol(255, 0, 0), -1);
```

## Measuring Text

Two utility functions let you calculate the dimensions of a string before drawing it, which is useful for hover detection and layout:

```c
int text_length(const FONT *f, const char *str); /* Width in pixels */
int text_height(const FONT *f);                  /* Height in pixels */
```

Example: centring a button and detecting hover

```c
int w = text_length(font, "Play");
int h = text_height(font);
int x = SCREEN_W / 2 - w / 2;
int y = SCREEN_H / 2;

if (mouse_x >= x && mouse_x <= x + w && mouse_y >= y && mouse_y <= y + h)
    textout_ex(buffer, font, "Play", x, y, makecol(255, 255, 0), -1);
else
    textout_ex(buffer, font, "Play", x, y, makecol(255, 255, 255), -1);
```

## Formatted Text with textprintf

For displaying variable values (scores, coordinates, debug info), use `textprintf`:

```c
textprintf(screen, font, 10, 10, makecol(255, 255, 255), "Score: %d", score);
```

It works identically to `printf` but renders to a bitmap.

## Loading a Custom Font

The built-in `font` is functional but plain. Allegro 4 loads fonts in `.pcx` format, which you generate from a `.ttf` file using a converter:

1. Download a `.ttf` font from [1001fonts.com](https://www.1001fonts.com) or [dafont.com](https://www.dafont.com) and install it on your machine.
2. Convert it to `.pcx` using [ttf2pcx](https://shawnhargreaves.com/ttf2pcx/) -- a small utility from 2002 that still works.
3. You can control the font size at conversion time.

Then load it in your code:

```c
FONT *myfont; /* Declare globally */

myfont = load_font("fonts/myfont.pcx", NULL, NULL);
```

And use it anywhere in place of the built-in `font`:

```c
textout_centre_ex(screen, myfont, "Hello", SCREEN_W / 2, SCREEN_H / 2, makecol(255, 255, 255), -1);
```

## Scaling Text (the Bitmap Trick)

Allegro 4 has no built-in font scaling. If you need large text beyond what ttf2pcx produces, there is a workaround: render the text to a temporary bitmap, then use `masked_stretch_blit()` to scale it up. The magic pink background makes the non-text area transparent.

```c
int scaled_textout(BITMAP *dest, FONT *f, int x, int y, double scale, char *text, int colour)
{
    BITMAP *tmp;

    tmp = create_bitmap(text_length(f, text), text_height(f));
    if (!tmp) return 0;

    clear_to_color(tmp, makecol(255, 0, 255));          /* Fill with magic pink */
    textout_ex(tmp, f, text, 0, 0, colour, -1);         /* Draw text at normal size */

    masked_stretch_blit(                                 /* Scale up to dest */
        tmp, dest,
        0, 0, tmp->w, tmp->h,
        x, y, (int)(tmp->w * scale), (int)(tmp->h * scale)
    );

    destroy_bitmap(tmp);
    return 1;
}
```

This has a small performance cost because it allocates and frees a bitmap every call, so avoid using it inside a tight loop if possible. Pre-render scaled text to a persistent bitmap instead.
