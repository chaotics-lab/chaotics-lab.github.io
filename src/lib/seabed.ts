// Aqua's seabed caustics on the GPU, the Super Mario Galaxy way: nothing is
// generated per frame, everything is a small seamless texture that scrolls.
//   1. a displacement texture (red pushes x, green pushes y) scrolls and
//      shifts where the caustics are read from (the video's first trick),
//   2. the two caustic textures (/caustic-deep.jpg, /caustic.jpg) scroll in
//      their own directions, squashed so they lie flat, and add up,
//   3. everything under a brightness threshold is cut away, so only where
//      their bright lines meet survives (the pooled-water trick),
// then the band fades out toward its top edge. Textures repeat natively on
// the GPU, so it is seamless whatever the scales and speeds, and the cost is
// a few texture reads per pixel at any zoom. WebGL 1, which every current
// browser has; null when it is missing (oceanFx.ts falls back to Canvas2D).

// [texture, size px, scale, squash (lower lies flatter), drift x and y px/s, strength]
export const CAUSTIC_LAYERS = [['/caustic-deep.jpg', 512, 1.5, 0.55, -7, 5, 0.75], ['/caustic.jpg', 256, 1.6, 0.38, 9, 3, 0.75]] as const;
// Set by eye: lo / hi where the cutout starts and reaches full; alpha, scale,
// flat, speed multiply both layers; warp (px), warpSize (px per displacement
// noise cell) and warpSpeed for the displacement.
export const CAUSTIC_TUNE = { lo: 0, hi: 0.69, alpha: 0.8, scale: 1.05, flat: 0.55, speed: 2.3, warp: 8, warpSize: 40, warpSpeed: 3 };
const WARP_DRIFT = [23, 11]; // px/s at warpSpeed 1

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;
const FRAG = `precision mediump float;
uniform vec2 uSize;      // band size, CSS px
uniform float uRes;      // canvas px per CSS px
uniform sampler2D uA, uB, uW;
uniform vec4 uLA, uLB;   // per layer: offset (x, y) in CSS px, 1 / (size of one tile on screen) (x, y)
uniform vec2 uAl;        // layer strengths
uniform vec3 uWp;        // displacement: offset x, offset y (CSS px), 1 / tile size
uniform float uWarp;     // displacement strength, px
uniform vec2 uCut;       // cutout start, end
void main() {
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uRes - gl_FragCoord.y) / uRes; // CSS px, from the top left
  vec2 d = (texture2D(uW, (p - uWp.xy) * uWp.z).rg - 0.5) * uWarp;
  vec2 q = p + d;
  vec3 a = texture2D(uA, (q - uLA.xy) * uLA.zw).rgb, b = texture2D(uB, (q - uLB.xy) * uLB.zw).rgb;
  float s = min(1.0, max(a.r, max(a.g, a.b)) * uAl.x + max(b.r, max(b.g, b.b)) * uAl.y);
  float v = smoothstep(uCut.x, uCut.y, s) * clamp(p.y / (0.7 * uSize.y), 0.0, 1.0);
  gl_FragColor = vec4(v, v, v, v); // white, premultiplied
}`;

// The displacement tile: smooth random noise (red pushes x, green pushes y)
// over CELLS x CELLS noise cells, with a second octave, its lattice wrapped
// so the tile repeats without seams; each cell spans warpSize px on screen,
// so it only repeats every CELLS * warpSize px. Baked once.
const CELLS = 8;
function warpTile() {
  const N = 256, c = document.createElement('canvas');
  c.width = c.height = N;
  const x = c.getContext('2d')!, img = x.createImageData(N, N);
  const hash = (i: number, j: number, k: number) => { const h = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return h - Math.floor(h); };
  const fade = (t: number) => t * t * (3 - 2 * t);
  const vnoise = (u: number, v: number, period: number, k: number) => {
    const i = Math.floor(u), j = Math.floor(v), fu = fade(u - i), fv = fade(v - j);
    const at = (a: number, b: number) => hash(((a % period) + period) % period, ((b % period) + period) % period, k);
    return (at(i, j) * (1 - fu) + at(i + 1, j) * fu) * (1 - fv) + (at(i, j + 1) * (1 - fu) + at(i + 1, j + 1) * fu) * fv;
  };
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = (i / N) * CELLS, v = (j / N) * CELLS, o = (j * N + i) * 4;
    const r = (vnoise(u, v, CELLS, 1) * 2 + vnoise(u * 2, v * 2, CELLS * 2, 2)) / 3;
    const g = (vnoise(u, v, CELLS, 3) * 2 + vnoise(u * 2, v * 2, CELLS * 2, 4)) / 3;
    img.data[o] = r * 255; img.data[o + 1] = g * 255; img.data[o + 2] = 128; img.data[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return c;
}

export function seabedGL() {
  const c = document.createElement('canvas');
  const gl = c.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // one triangle over the whole canvas
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = { size: U('uSize'), res: U('uRes'), la: U('uLA'), lb: U('uLB'), al: U('uAl'), wp: U('uWp'), warp: U('uWarp'), cut: U('uCut') };
  ['uA', 'uB', 'uW'].forEach((n, i) => gl.uniform1i(U(n), i));

  let ready = 0;
  const texture = (unit: number, src: TexImageSource, mips: boolean) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // power-of-two sizes, so repeat works in WebGL 1
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (mips) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    ready++;
  };
  CAUSTIC_LAYERS.forEach(([src], i) => { const img = new Image(); img.onload = () => texture(i, img, true); img.src = src; });
  texture(2, warpTile(), true);

  let lost = false;
  c.addEventListener('webglcontextlost', e => { e.preventDefault(); lost = true; });

  return {
    el: c,
    get lost() { return lost; },
    // draw the band (w x h CSS px) at time t (s)
    render(w: number, h: number, t: number) {
      const res = Math.min(1.5, window.devicePixelRatio || 1), cw = Math.round(w * res), ch = Math.round(h * res);
      if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; c.style.width = `${Math.round(w)}px`; c.style.height = `${Math.round(h)}px`; gl.viewport(0, 0, cw, ch); }
      if (lost) return;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (ready < 3) return;
      const T = CAUSTIC_TUNE, ts = t * T.speed;
      // each layer: anchored at the middle of the band's bottom edge, drifting; offsets wrapped to one tile so they stay small
      const layer = (i: number) => {
        const [, size, k, flat, vx, vy] = CAUSTIC_LAYERS[i], tw = size * k * T.scale, th = tw * flat * T.flat;
        const ox = (w / 2 + ts * vx) % tw, oy = (h + ts * vy) % th;
        return [ox, oy, 1 / tw, 1 / th] as const;
      };
      gl.uniform2f(u.size, w, h);
      gl.uniform1f(u.res, res);
      gl.uniform4f(u.la, ...layer(0));
      gl.uniform4f(u.lb, ...layer(1));
      gl.uniform2f(u.al, Math.min(1, CAUSTIC_LAYERS[0][6] * T.alpha), Math.min(1, CAUSTIC_LAYERS[1][6] * T.alpha));
      const wt = t * T.warpSpeed;
      const wtile = T.warpSize * CELLS;
      gl.uniform3f(u.wp, (wt * WARP_DRIFT[0]) % wtile, (wt * WARP_DRIFT[1]) % wtile, 1 / wtile);
      gl.uniform1f(u.warp, T.warp);
      gl.uniform2f(u.cut, T.lo, T.hi);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
