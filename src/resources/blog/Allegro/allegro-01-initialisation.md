---
title: Getting Started with Allegro 4 in C
date: 2021-10-26
tags:
  - C
  - Allegro
  - gamedev
summary: How to set up an Allegro 4 project from scratch, open a window, and structure the boilerplate you will write every single time.
---

Allegro 4 is an old-school C game library that handles graphics, input, and sound. It is not the most modern choice, but it is a genuinely great way to learn how graphics programming works without being buried in API surface area. This post covers the minimum setup to get a window open and running.

![Logo Chaotics](../../img/logos/Chaotics%20White%20Transparent.png)

![Logo Chaotics](../../img/logos/Chaotics%20White%20Transparent.png)


## Installation

The best setup guide for Allegro 4 on Windows with Code::Blocks is the one by Fercoq (Google translated to English from French):
[https://fercoq.bitbucket.io/allegro/](https://fercoq-bitbucket-io.translate.goog/allegro/?_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp#Installation)

The official reference documentation lives here:
[https://www.allegro.cc/manual/4/api/using-allegro/](https://www.allegro.cc/manual/4/api/using-allegro/)

Once the library is installed, you need to link it in your project. In Code::Blocks:

> Project > Build Options > [Your Project Name] (above Debug) > Linker Settings > Add > type `alleg44.dll` > OK

## The Boilerplate

Every Allegro 4 project starts with essentially the same skeleton. Here it is in full, with comments explaining each part:

```c
#include <allegro.h>
#include <stdio.h>
#include <stdlib.h>

#define WIDTH  1280
#define HEIGHT 720

int main()
{
    allegro_init();    /* Initialise the Allegro library -- always first */
    install_keyboard(); /* Required to read keyboard input */

    /* Open a windowed graphics mode at the given resolution */
    set_color_depth(desktop_color_depth());
    if (set_gfx_mode(GFX_AUTODETECT_WINDOWED, WIDTH, HEIGHT, 0, 0) != 0)
    {
        allegro_message("Graphics mode error: %s", allegro_error);
        allegro_exit();
        exit(EXIT_FAILURE);
    }

    /* Your code goes here */

    while (!key[KEY_ESC]) {} /* Keep the window open until Escape is pressed */

    allegro_exit(); /* Clean up and exit */
    return 0;
}
END_OF_MAIN() /* Required macro when using Allegro -- place after main() */
```

## What Each Part Does

**`allegro_init()`** must be called before anything else. It sets up all of Allegro's internal state.

**`set_color_depth(desktop_color_depth())`** tells Allegro to match the colour depth of your monitor. This avoids colour palette issues.

**`set_gfx_mode()`** opens the actual window. `GFX_AUTODETECT_WINDOWED` means Allegro picks the best windowed mode available. The two zeros at the end are for virtual screen size and can be left as zero for standard usage.

**`END_OF_MAIN()`** is a macro Allegro requires on Windows to handle the `WinMain` vs `main` entry point difference. It must appear after the closing brace of `main`.

## The Main Loop

The `while (!key[KEY_ESC])` pattern is the simplest possible game loop. As long as the Escape key is not pressed, the programme keeps running. Most real projects will replace this with a more structured loop, but it is fine for getting started.

## Error Handling

If `set_gfx_mode` returns anything other than zero, something went wrong. The `allegro_error` string will contain a human-readable description. Always handle this -- leaving it out means your programme will silently crash or misbehave on machines where the mode is unavailable.
