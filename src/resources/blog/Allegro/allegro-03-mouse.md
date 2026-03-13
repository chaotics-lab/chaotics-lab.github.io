---
title: Mouse Input in Allegro 4
date: 2021-10-26
tags:
  - C
  - Allegro
  - gamedev
  - input
summary: Setting up the mouse in Allegro 4, reading cursor position and button state, and detecting hover over UI elements.
---

# Mouse Input in Allegro 4

Like the keyboard, the mouse requires an explicit initialisation call before Allegro will track it. Once set up, you get access to cursor position, button state, and enough to build hover effects and clickable elements.

## Setup

Call this during initialisation, after `allegro_init()`:

```c
install_mouse();
```

To display the default system cursor inside the Allegro window:

```c
show_mouse(screen);
```

`show_mouse(NULL)` hides it again if you want to draw your own cursor.

## Reading Position and Button State

Once installed, Allegro exposes three global variables you can read anywhere in your code:

```c
mouse_x   /* Current X position of the cursor */
mouse_y   /* Current Y position of the cursor */
mouse_b   /* Bitmask of currently held mouse buttons */
```

`mouse_b` uses a bitmask: bit 0 is the left button, bit 1 is the right button. So:

```c
if (mouse_b & 1)  /* Left button held */
if (mouse_b & 2)  /* Right button held */
if (mouse_b == 0) /* No button held */
```

## Minimal Working Example

```c
#include <allegro.h>
#include <stdio.h>
#include <stdlib.h>

#define WIDTH  1280
#define HEIGHT 720

int main()
{
    allegro_init();
    install_keyboard();
    install_mouse();

    set_color_depth(desktop_color_depth());
    if (set_gfx_mode(GFX_AUTODETECT_WINDOWED, WIDTH, HEIGHT, 0, 0) != 0)
    {
        allegro_message("Graphics error: %s", allegro_error);
        allegro_exit();
        exit(EXIT_FAILURE);
    }

    show_mouse(screen);

    while (!key[KEY_ESC]) {}

    allegro_exit();
    return 0;
}
END_OF_MAIN()
```

## Detecting Hover Over a UI Element

A common need is knowing whether the cursor is over a button or a piece of text. The pattern is a simple bounds check against `mouse_x` and `mouse_y`. Here is an example with a text button that changes colour on hover:

```c
int text_w = text_length(font, "New Game");
int text_h = text_height(font);

int btn_x = SCREEN_W / 2 - text_w / 2;
int btn_y = SCREEN_H / 3;

if (mouse_x >= btn_x && mouse_x <= btn_x + text_w &&
    mouse_y >= btn_y && mouse_y <= btn_y + text_h)
{
    textout_centre(page, font, "New Game", SCREEN_W / 2, btn_y, makecol(255, 255, 0)); /* Yellow on hover */
}
else
{
    textout_centre(page, font, "New Game", SCREEN_W / 2, btn_y, makecol(255, 255, 255)); /* White normally */
}
```

Note: this should be drawn to a buffer bitmap first and then `blit()`ed to `screen` to avoid flickering. See the Images post for how double buffering works.

## Checking Whether the Cursor Is Over a Bitmap

Allegro provides a convenience function for this:

```c
int is_inside_bitmap(BITMAP *bmp, int x, int y, int clip);
```

Pass your bitmap, the cursor coordinates, and `0` for the last argument (clip is rarely needed). It returns non-zero if the point is within the bitmap boundaries:

```c
if (is_inside_bitmap(card_image, mouse_x, mouse_y, 0))
{
    /* Cursor is over the bitmap */
}
```

## Further Reading

The full list of mouse functions is in the official docs:
[https://www.allegro.cc/manual/4/api/mouse-routines/](https://www.allegro.cc/manual/4/api/mouse-routines/)
