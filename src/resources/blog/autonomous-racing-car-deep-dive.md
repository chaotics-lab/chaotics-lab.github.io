---
title: "Building an Autonomous Racing Car from Scratch"
date: "2026-02-20"
description: "How we designed, built, and raced a 1:10 scale autonomous car — the full story from sensor selection to PID tuning."
tags: ["embedded", "robotics", "FPGA", "autonomous"]
coverImage: ""
---

# THIS IS GENERATED AI PLACEHOLDER CONTENT. DON'T WASTE YOUR TIME READING THIS. REAL CONTENT COMING SOON :)

This is the extended write-up for the autonomous racing car project. The short version is on the portfolio page, but there's a lot of nuance that didn't fit in a JSON description.

## The brief

The competition format: a closed circuit, white lines on dark floor, two sensors allowed, no GPS. The car had to navigate a full lap without human input.

## Architecture decisions

We landed on: **STM32 microcontroller + FPGA for vision preprocessing + custom PID controller**.

The FPGA handles the camera feed in real-time and returns a simple "line offset" value. The STM32 runs the control loop.

### Why an FPGA for vision?

Because a microcontroller doing camera frame processing in software would eat all its cycles doing that and have nothing left for control. The FPGA acts as a co-processor — it takes the raw pixel stream and produces a single number: *how far is the line from center*.

```
[Camera] → [FPGA: binarize + find centroid] → [STM32: PID → servo + motor]
```

## The control loop

Classic PID, but the derivative term needed a low-pass filter. Raw derivative on a noisy centroid signal made the steering oscillate badly.

```c
float error = line_offset - CENTER;
float p = Kp * error;
integral += error * dt;
float d = Kd * (error - prev_error) / dt;
float output = p + Ki * integral + d;
prev_error = error;
```

The integral term had an anti-windup clamp. Without it, sharp corners would wind up the integrator and cause overshooting on straights.

## What failed

- First firmware version had an off-by-one in the frame buffer address — the car steered into a wall at 2m/s
- The motor driver PCB had a ground loop causing random resets. Fixed with a ferrite bead on the power rail.
- Lighting conditions in the competition hall were different from our test lab — had to re-tune the binarization threshold on-site

## Result

We placed in the top third. The car ran consistent laps but lost time on a chicane section where the lookahead was too short.

Next time: add lookahead prediction to anticipate the curve rather than react to it.
