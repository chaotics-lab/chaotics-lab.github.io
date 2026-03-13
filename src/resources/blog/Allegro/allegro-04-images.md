---
title: "Working with Images in Allegro 4: blit, draw_sprite, and stretch_sprite"
date: 2021-10-26
tags:
  - C
  - Allegro
  - gamedev
  - graphics
summary: How to load, display, and scale images in Allegro 4, and the important difference between blit() and draw_sprite() when it comes to transparency.
---

# Working with Images in Allegro 4: blit, draw\_sprite, and stretch\_sprite

Allegro 4 works exclusively with `.bmp` files for images. Understanding the difference between the three main drawing functions -- `blit()`, `draw_sprite()`, and `stretch_sprite()` -- is essential to getting things to render correctly.

## Preparing Your Images

Allegro 4 only loads `.bmp` files natively. If your images are in another format, convert them first. A simple online converter:
[https://cloudconvert.com/png-to-bmp](https://cloudconvert.com/png-to-bmp)

## Loading a Bitmap

Declare your `BITMAP` pointers globally so that any function in your programme can access them:

```c
BITMAP *background;
BITMAP *sprite;
```

Then load them after the graphics mode is set up:

```c
background = load_bitmap("images/background.bmp", NULL);
sprite     = load_bitmap("images/character.bmp", NULL);
```

The second argument is for a colour palette, which you can leave as `NULL` in most cases.

## blit() vs draw\_sprite(): The Transparency Difference

This is the most important distinction in Allegro image rendering.

**`blit()`** copies a bitmap onto another bitmap pixel for pixel, including any "magic pink" pixels. It does not support transparency.

```c
/* Syntax */
blit(source, dest, source_x, source_y, dest_x, dest_y, width, height);

/* Draw the background filling the entire screen */
blit(background, screen, 0, 0, 0, 0, SCREEN_W, SCREEN_H);
```

**`draw_sprite()`** respects transparency. Any pixel with the colour `RGB(255, 0, 255)` -- known as "magic pink" -- will be rendered as fully transparent. This is how you draw sprites over a background without a coloured rectangle around them.

```c
/* Syntax */
draw_sprite(dest, sprite, x, y);

/* Draw the sprite at position (50, 65), magic pink pixels are invisible */
draw_sprite(screen, sprite, 50, 65);
```

The order of drawing matters: whatever is drawn first ends up at the back. Draw your background first, then your sprites on top.

## Scaling an Image with stretch\_sprite()

To render an image at a different size than its original dimensions, use `stretch_sprite()`:

```c
void stretch_sprite(BITMAP *dest, BITMAP *sprite, int x, int y, int w, int h);
```

`w` and `h` are the target dimensions in pixels. You can calculate these from the original size:

```c
/* Original image is 747x1122 px, render it at one quarter of its size */
stretch_sprite(screen, card_image, 10, 10, 747 / 4, 1122 / 4);
```

This places the image at position (10, 10) from the top-left of the screen, scaled down to a quarter of its original dimensions. `stretch_sprite()` also respects the magic pink transparency colour, just like `draw_sprite()`.

## Double Buffering

Drawing directly to `screen` causes visible flickering because the monitor can catch the image mid-draw. The standard solution is double buffering: draw everything to an off-screen bitmap, then copy that to `screen` in one operation.

```c
BITMAP *buffer;

/* Allocate the buffer once during setup */
buffer = create_bitmap(SCREEN_W, SCREEN_H);

/* In your game loop */
while (!key[KEY_ESC])
{
    clear_bitmap(buffer);            /* Wipe the previous frame */
    blit(background, buffer, 0, 0, 0, 0, SCREEN_W, SCREEN_H);
    draw_sprite(buffer, sprite, x, y);
    blit(buffer, screen, 0, 0, 0, 0, SCREEN_W, SCREEN_H); /* Display all at once */
}
```

`clear_bitmap()` resets every pixel to black. Without it, the previous frame's content would bleed through.

## Quick Reference

| Function | Transparency | Scaling |
|---|---|---|
| `blit()` | No | No |
| `draw_sprite()` | Yes (magic pink) | No |
| `stretch_sprite()` | Yes (magic pink) | Yes |
