---
title: Playing Audio in Allegro 4
date: 2021-10-26
tags:
  - C
  - Allegro
  - gamedev
  - audio
summary: How to initialise sound in Allegro 4 and play WAV and OGG audio files using play_sample(), with a breakdown of every parameter.
---

# Playing Audio in Allegro 4

Allegro 4 handles audio through a simple sample-based system. You load a sound file into a `SAMPLE`, then play it with `play_sample()`. Both `.wav` and `.ogg` files are supported, though `.ogg` requires an extra library.

## Initialising Sound

Sound, like the keyboard and mouse, must be explicitly initialised. The recommended approach is autodetection:

```c
if (install_sound(DIGI_AUTODETECT, MIDI_NONE, 0) != 0)
{
    printf("Sound init failed: %s\n", allegro_error);
    return 1;
}
```

`DIGI_AUTODETECT` lets Allegro pick the best digital audio driver. `MIDI_NONE` disables MIDI support, which you rarely need. The third argument is a configuration file path -- passing `0` uses the default.

## Loading a Sound File

For `.wav` files, use the built-in loader:

```c
SAMPLE *sfx = load_wav("sounds/effect.wav");
```

For `.ogg` files, you need the `logg` library (a separate header):

```c
#include <logg.h>

SAMPLE *music = logg_load("sounds/theme.ogg");
```

Always check that the load succeeded:

```c
if (!sfx)
{
    printf("Failed to load sound file.\n");
    return 1;
}
```

## Playing a Sample

```c
int play_sample(const SAMPLE *spl, int vol, int pan, int freq, int loop);
```

| Parameter | Range | Notes |
|---|---|---|
| `vol` | 0 to 255 | 255 is full volume |
| `pan` | 0 to 255 | 0 = hard left, 128 = centre, 255 = hard right |
| `freq` | relative | 1000 is the original speed and pitch; go higher or lower to pitch-shift |
| `loop` | 0 or non-zero | 0 plays once; any other value loops indefinitely |

### Play a one-shot sound effect

```c
play_sample(sfx, 200, 128, 1000, 0);
```

### Play looping background music

```c
play_sample(music, 255, 128, 1000, 1);
```

### Stop a looping sample

```c
stop_sample(music);
```

## Adjusting a Playing Sample

If a sample is looping, you can modify its volume, panning, and frequency while it plays:

```c
adjust_sample(music, vol, pan, freq, loop);
```

`adjust_sample()` only works on looping samples. It has no effect on a sample that has already finished playing.

## Cleaning Up

Free the memory when you are done:

```c
destroy_sample(sfx);
```

## Full Working Example

```c
#include <allegro.h>
#include <stdio.h>

int main()
{
    SAMPLE *music;

    if (allegro_init() != 0) { printf("Allegro init failed.\n"); return 1; }

    install_keyboard();

    if (install_sound(DIGI_AUTODETECT, MIDI_NONE, 0) != 0)
    {
        printf("Sound init failed: %s\n", allegro_error);
        return 1;
    }

    music = load_wav("sounds/theme.wav");
    if (!music) { printf("Could not load sound.\n"); return 1; }

    play_sample(music, 255, 128, 1000, 1); /* Loop at full volume, centred */

    while (!key[KEY_ESC]) {}

    destroy_sample(music);
    allegro_exit();
    return 0;
}
END_OF_MAIN()
```

## A Note on the freq Parameter

The `freq` parameter is relative, not absolute. A value of `1000` plays the sample at its original recorded speed and pitch. Values above 1000 speed it up and raise the pitch; values below slow it down and lower the pitch. This makes it useful for simple pitch variation on sound effects without needing multiple audio files.
