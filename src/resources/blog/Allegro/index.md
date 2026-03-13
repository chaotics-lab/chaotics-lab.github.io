---
title: "Allegro 4 — A Practical Guide"
description: "Notes from building games in C with Allegro 4. Covers setup, input, graphics, audio, and a few useful tricks I figured out the hard way."
coverImage: "blog/world.jpg"

tags: ["C", "C++", "Allegro", "gamedev"]
order:
  - allegro-01-initialisation
  - allegro-02-keyboard
  - allegro-03-mouse
  - allegro-04-images
  - allegro-05-text
  - allegro-06-sound
  - allegro-07-drawing-and-extras
---

**Allegro 4** is a **C game library** from the early 2000s. It's not what anyone would reach for today, but it is an absolutely brilliant way to learn how graphics programming actually works. No abstraction layers hiding what is happening beneath.

I used it during my first and second year computer science courses during my engineering studies and ended up going far deeper than required to validate the course material. I built three projects using this fun library (a wild-west themed implementation of the French board game [*Le Saboteur*](/project/le-saboteur-(french-board-game)), a Hollow Knight themed *"Cluedo"* adaptation ([Cluedo Knight](/project/cluedo-knight)) and an *Animal Crossing* themed [Air Traffic Controller](/project/air-traffic-simulation) simulation that uses Graph Theory algorithms). These blogs posts are some reference I wrote while learning how to use Allegro 4 that I wish had existed when I started.
## Prerequisites

When we were first starting out with C programming we were using Code::Blocks on Windows 10 with MinGW as a compiler. Install instructions are probably available in the official [Allegro]([https://www.allegro.cc/manual/4/api/using-allegro/](https://www.allegro.cc/resource/HelpDocuments/AllegroNewbie)) documentation for other OSes.

- A working C or C++ compiler (MinGW/GCC recommended on Windows)
- Code::Blocks or any IDE that lets you link libraries manually
- The Allegro 4.4 DLL. We followed the [Fercoq setup guide]([https://fercoq.bitbucket.io/allegro/](https://fercoq-bitbucket-io.translate.goog/allegro/?_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp))(Translated from French) to get it installed
## How to use this series

Each post is self-contained, but they build on each other. The [initialisation](allegro/allegro-01-initialisation) post establishes the boilerplate that every other post assumes is in place. If something is not working, that is the first place to check.