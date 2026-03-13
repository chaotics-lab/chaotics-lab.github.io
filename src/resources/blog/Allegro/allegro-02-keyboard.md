---
title: Handling Keyboard Input in Allegro 4
date: 2021-10-26
tags:
  - C
  - Allegro
  - gamedev
  - input
summary: How to read keyboard state and individual key presses in Allegro 4, including ASCII keys, scancodes, and modifier combinations.
---

# Handling Keyboard Input in Allegro 4

Allegro 4 gives you two distinct ways to read the keyboard: polling the `key[]` array for real-time state, or using `readkey()` to capture a single key press as an event. Both have their place depending on what you are building.

## Setup

Before reading any keyboard input, you need to tell Allegro you intend to use the keyboard. Call this once during initialisation, after `allegro_init()`:

```c
install_keyboard();
```

Without this, the `key[]` array will not be populated and `readkey()` will not work.

## Polling the Key Array

The `key[]` array holds the current state of every key on the keyboard. It is non-zero if the key is held down, and zero if it is not. This is what you will use inside a game loop for movement, actions, and the standard exit condition:

```c
while (!key[KEY_ESC])
{
    if (key[KEY_LEFT])  player_x--;
    if (key[KEY_RIGHT]) player_x++;
    if (key[KEY_SPACE]) fire_bullet();
}
```

The `KEY_*` constants cover every standard key. A full list is in the [official docs](https://www.allegro.cc/manual/4/api/keyboard-routines/).

## Reading a Single Key Press

For menus, text input, or anything where you want to capture one key at a time rather than check state continuously, use `readkey()`. It blocks until a key is pressed and returns an integer encoding both the ASCII value and the scancode:

```c
int val = readkey();
```

The integer packs two values:
- The **low byte** (`val & 0xff`) is the ASCII character code.
- The **high byte** (`val >> 8`) is the hardware scancode.

### Checking by ASCII character

```c
if ((val & 0xff) == 'd')
    allegro_message("You pressed 'd'");
```

### Checking by scancode (for non-character keys)

```c
if ((val >> 8) == KEY_SPACE)
    allegro_message("You pressed Space");
```

### Modifier combinations

Ctrl and Alt combinations are also detectable:

```c
if ((val & 0xff) == 3)          /* Ctrl+C produces ASCII code 3 */
    allegro_message("You pressed Ctrl+C");

if (val == (KEY_X << 8))        /* Alt+X has no ASCII code, just a scancode */
    allegro_message("You pressed Alt+X");
```

## When to Use Each Approach

| Use case | Approach |
|---|---|
| Player movement, held actions | `key[]` array in the game loop |
| Menu navigation, single presses | `readkey()` |
| Quitting on Escape | `while (!key[KEY_ESC])` |

The `key[]` array is almost always the right choice inside a game loop. `readkey()` is better suited to moments when you want to pause and wait for user input, such as a "press any key to continue" screen.
