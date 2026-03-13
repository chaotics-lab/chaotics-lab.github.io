---
title: Drawing Shapes, Custom Cursors, and Hex Colours in Allegro 4
date: 2021-11-03
tags:
  - C
  - Allegro
  - gamedev
  - graphics
summary: A reference for Allegro 4's primitive drawing functions, how to implement a custom mouse cursor with state changes, and a utility for using hex colour codes with makecol().
---
	
# Drawing Shapes, Custom Cursors, and Hex Colours in Allegro 4

This post covers three practical topics: the built-in shape drawing functions, how to build a custom mouse cursor that changes state, and a utility function for using hex colour codes instead of RGB triplets.

## Drawing Primitives

Allegro 4 provides a full set of functions for drawing basic shapes directly to any bitmap. All of them follow the same pattern: pass the destination bitmap, the geometry, and a colour produced by `makecol()`.

```c
void vline(BITMAP *bmp, int x, int y1, int y2, int color);
void hline(BITMAP *bmp, int x1, int y, int x2, int color);
void line(BITMAP *bmp, int x1, int y1, int x2, int y2, int color);

void rect(BITMAP *bmp, int x1, int y1, int x2, int y2, int color);     /* Outline */
void rectfill(BITMAP *bmp, int x1, int y1, int x2, int y2, int color); /* Filled */

void triangle(BITMAP *bmp, int x1, int y1, int x2, int y2, int x3, int y3, int color);
void polygon(BITMAP *bmp, int vertices, const int *points, int color);

void circle(BITMAP *bmp, int x, int y, int radius, int color);
void circlefill(BITMAP *bmp, int x, int y, int radius, int color);

void ellipse(BITMAP *bmp, int x, int y, int rx, int ry, int color);
void ellipsefill(BITMAP *bmp, int x, int y, int rx, int ry, int color);

void arc(BITMAP *bmp, int x, int y, fixed ang1, fixed ang2, int r, int color);

void floodfill(BITMAP *bmp, int x, int y, int color);
```

All of these can be drawn to `screen` directly or to an off-screen buffer first. Drawing to a buffer and then blitting is strongly preferred to avoid flickering.

## Custom Mouse Cursor

Allegro's built-in cursor disappears inside the Allegro window on some systems, or you might simply want a cursor that matches your game's visual style. The approach is to hide the system cursor and draw your own bitmap in the game loop at `mouse_x`, `mouse_y`.

You can also change the cursor bitmap based on state -- for instance, switching between a normal cursor and a drag cursor when a mouse button is held.

```c
BITMAP *cursor_normal;
BITMAP *cursor_drag;
BITMAP *active_cursor;

/* During setup */
cursor_normal = load_bitmap("cursors/normal.bmp", NULL);
cursor_drag   = load_bitmap("cursors/drag.bmp", NULL);
/* Do not call show_mouse() -- we will draw our own */

/* In the game loop */
while (!key[KEY_ESC])
{
    clear_bitmap(buffer);

    /* Pick cursor based on button state */
    if (mouse_b == 0) active_cursor = cursor_normal;
    else              active_cursor = cursor_drag;

    /* Draw the cursor bitmap, scaled down, at the cursor position */
    /* Subtract an offset so the hotspot aligns with the tip of the cursor */
    stretch_sprite(buffer, active_cursor, mouse_x - 15, mouse_y - 25, 427 / 8, 512 / 8);

    blit(buffer, screen, 0, 0, 0, 0, SCREEN_W, SCREEN_H);
}
```

The offset subtracted from `mouse_x` and `mouse_y` shifts the bitmap so that the cursor's tip (the hotspot) aligns with the actual pointer position rather than the top-left corner of the bitmap. Adjust these values to match your cursor image.

## Using Hex Colour Codes with makecol()

`makecol(r, g, b)` takes integer RGB values, which is fine but tedious if you are working from a design file or colour picker that gives you hex codes. Here is a pair of utility functions that converts a hex string like `"#ff00ff"` into a value `makecol()` can use:

```c
/* Converts a hex colour string to separate R, G, B integer values */
/* Accepts "#rrggbb" or "rrggbb" format */
void hex_to_rgb(char *hex, int *r, int *g, int *b)
{
    int digits[6];

    if (*hex == '#') hex++;

    for (int i = 0; i < 6; i++)
    {
        if (*hex >= 'A' && *hex <= 'F') digits[i] = *hex - 'A' + 10;
        else if (*hex >= 'a' && *hex <= 'f') digits[i] = *hex - 'a' + 10;
        else if (*hex >= '0' && *hex <= '9') digits[i] = *hex - '0';
        hex++;
    }

    *r = digits[0] * 16 + digits[1];
    *g = digits[2] * 16 + digits[3];
    *b = digits[4] * 16 + digits[5];
}

/* Returns an Allegro colour value from a hex string */
int hexcol(char *hex)
{
    int r, g, b;
    hex_to_rgb(hex, &r, &g, &b);
    return makecol(r, g, b);
}
```

Usage:

```c
textout_ex(screen, font, "Hello", 0, 0, hexcol("#ff00ff"), -1);
rectfill(screen, 0, 0, 200, 100, hexcol("1a2b3c"));
```

Drop these two functions at the top of your file and you can use hex colour codes anywhere that `makecol()` would otherwise appear. Note that the function does no validation -- if the string is malformed, the output will be wrong without any error. Add bounds checking if you are feeding it user input.
