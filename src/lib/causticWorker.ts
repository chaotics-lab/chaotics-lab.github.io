// Bakes the frames of a looping, seamless water caustic tile off the main
// thread, for Aqua's seabed (oceanFx.ts). White on transparent, one message
// per frame (its pixels, transferred).
//
// The pattern is Dave Hoskins' "Tileable Water Caustic" (Shadertoy MdlXz8,
// after joltz0r's): each pass warps the point with a few sines and adds
// 1 / length(p * k / (sin, cos)), bright where the warped sines cross zero.
// It repeats every 2 pi in p, so one tile is one period. To make it loop in
// time too, every pass turns at a multiple of half a turn per 2 pi of time,
// so after LOOP (4 pi) they are all back where they started. Then the haze is
// cut off so only the bright lines are left.

const N = 256, TAU = Math.PI * 2, LOOP = 4 * Math.PI, START = 23; // START: skip the stiff look at t = 0
const SPEEDS = [-1, -0.5, -0.5, 0.5, 0.5];

self.onmessage = (e: MessageEvent<{ frames: number }>) => {
  const F = e.data.frames;
  for (let f = 0; f < F; f++) {
    const time = START + (f / F) * LOOP, px = new Uint8ClampedArray(N * N * 4);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = (i / N) * TAU - 250, y = (j / N) * TAU - 250;
      let ix = x, iy = y, c = 1;
      for (let n = 0; n < SPEEDS.length; n++) {
        const t = time * SPEEDS[n], nx = x + Math.cos(t - ix) + Math.sin(t + iy), ny = y + Math.sin(t - iy) + Math.cos(t + ix);
        ix = nx; iy = ny;
        c += 1 / Math.hypot((x * 0.005) / Math.sin(ix + t), (y * 0.005) / Math.cos(iy + t));
      }
      c = 1.17 - Math.pow(c / SPEEDS.length, 1.4);
      const raw = Math.min(1, Math.pow(Math.abs(c), 8)), k = Math.min(1, Math.max(0, (raw - 0.14) / 0.75)), o = (j * N + i) * 4;
      px[o] = px[o + 1] = px[o + 2] = 255;
      px[o + 3] = k * k * (3 - 2 * k) * 255;
    }
    (self as unknown as Worker).postMessage({ f, size: N, px }, [px.buffer]);
  }
};
