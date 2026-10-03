import { useEffect, useRef } from 'react';
import { ArrowDownRight } from '@phosphor-icons/react';
import type { ProjectData } from '@/components/portfolio/types';
import { categoryLabel } from '@/config/categories';
import { GithubStarsBadge, GithubDownloadsBadge } from '@/components/GithubBadges';
import { useGithubStars } from '@/hooks/useGithubStars';
import { useGithubStats } from '@/hooks/useGithubStats';
import { docOffset, lerp, onTick, pointer, prefersReducedMotion, smoothstep } from '@/lib/ticker';
import { AITag } from './AITag';
import { projectPalette, themeRgb } from '@/lib/theme';
import { TransitionLink } from '@/components/site/TransitionLink';
import type { TransitionOpts } from '@/lib/pageTransition';

// Each card image is painted on a canvas in thin rows. Every row sits on a
// curved sheet (sine ripple + cursor bulge + a curl near the top of the
// screen) and is projected with perspective, so cards bend like cloth
// without WebGL. The rows tile a single bitmap exactly, so no seams show.
const PERSPECTIVE = 1100; // keep in sync with .w-labelwrap
const PAD = 64;           // room around the image for the bend to grow into
const ROW = 3;            // px of image per painted row (doubles on slow machines)
const FX = 0.5;           // overall strength of the bend, ripple and parallax

export const ProjectGrid = ({ projects }: { projects: ProjectData[] }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  useWaveField(gridRef, cursorRef);

  return (
    <>
      <div
        ref={gridRef}
        className="container mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 lg:gap-x-10 gap-y-16 md:gap-y-24 pb-16"
      >
        {projects.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
      </div>
      <div ref={cursorRef} className="w-cursor" aria-hidden="true"><span /></div>
    </>
  );
};

// Clicking a card zooms the whole page into it while the project's deep
// colour washes over, which the sea then carries away (PageTransition 'zoom').
const zoomInto = (p: ProjectData): TransitionOpts => {
  const frame = document.querySelector<HTMLElement>(`[data-wcard][href="/project/${p.id}"] [data-frame]`);
  const main = frame?.closest('main') ?? undefined;
  const r = frame?.getBoundingClientRect();
  const m = main?.getBoundingClientRect();
  const pal = projectPalette((p as { themeColors?: string[] }).themeColors);
  return {
    kind: 'zoom',
    zoomEl: main,
    origin: r && m ? { x: r.left + r.width / 2 - m.left, y: r.top + r.height / 2 - m.top } : undefined,
    tint: pal?.deep,
  };
};

const ProjectCard = ({ p, i }: { p: ProjectData & { showGithubStats?: boolean }; i: number }) => {
  const stars = useGithubStars(p.githubUrl, p.showGithubStats);
  const stats = useGithubStats(p.showGithubStats);
  const year = p.date ? new Date(p.date).getFullYear() : null;

  return (
    <TransitionLink to={`/project/${p.id}`} transition={() => zoomInto(p)} className="w-card" data-wcard data-img={p.imageUrl ?? ''} style={{ ['--i' as string]: Math.min(i, 8) }}>
      <div className="w-frame" data-frame>
        <canvas
          className="w-canvas"
          role="img"
          aria-label={p.title}
          style={{ left: -PAD, top: -PAD, width: `calc(100% + ${2 * PAD}px)`, height: `calc(100% + ${2 * PAD}px)` }}
        />
      </div>

      <div className="w-labelwrap" data-labelwrap>
        <div className="w-label" data-label>
          <div className="flex items-start gap-4">
            <h3 className="flex-1 text-[1.3rem] md:text-[1.45rem] font-bold leading-tight text-white">{p.title}</h3>
            <ArrowDownRight className="w-arrow" weight="bold" />
          </div>
          <p className="mt-2 flex-1 leading-relaxed text-[var(--h-c3)]">{p.description}</p>
          <span className="w-rule"><span /></span>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[var(--h-c2)]">
            <span className="h-caps text-[0.62rem]">{[categoryLabel(p.category?.[0]), year].filter(Boolean).join(' · ')}</span>
            {p.AIUsed && <AITag value={parseInt(p.AIUsed, 10)} className="ml-auto" />}
            {p.showGithubStats && (
              <span className="flex items-center gap-1.5">
                {stars !== null && <GithubStarsBadge stars={stars} />}
                <GithubDownloadsBadge downloads={stats ? stats.total_downloads + stats.unique_cloners : null} />
              </span>
            )}
          </div>
        </div>
      </div>
    </TransitionLink>
  );
};

type Card = {
  el: HTMLElement;
  frame: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  base: string;
  img: HTMLImageElement | null;
  tex: HTMLCanvasElement | null; // image cover-cropped to the frame, at screen resolution
  labelWrap: HTMLElement;
  label: HTMLElement;
  fx: number; fy: number; fw: number; fh: number;
  lx: number; ly: number; lh: number;
  hover: number; hoverTarget: number; zoom: number;
  live: boolean;
};

// Where a point `v` px down the image lands on the card's canvas.
type Proj = { x: number; y: number; w: number; z: number };

const dprOf = () => Math.min(2, window.devicePixelRatio || 1);

// Pre-scales the image once, so the per-row draws are close to 1:1.
function texture(c: Card, dpr: number) {
  const img = c.img;
  if (!img) return null;
  const w = Math.max(1, Math.round(c.fw * dpr));
  const h = Math.max(1, Math.round(c.fh * dpr));
  if (c.tex && c.tex.width === w && c.tex.height === h) return c.tex;
  const tex = c.tex ?? document.createElement('canvas');
  tex.width = w;
  tex.height = h;
  const t = tex.getContext('2d');
  if (!t) return null;
  const k = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  t.imageSmoothingQuality = 'high';
  t.drawImage(img, (w - img.naturalWidth * k) / 2, (h - img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
  c.tex = tex;
  return tex;
}

const A: Proj = { x: 0, y: 0, w: 0, z: 0 };
const B: Proj = { x: 0, y: 0, w: 0, z: 0 };

function paint(c: Card, map: (v: number, out: Proj) => void, row = ROW) {
  const ctx = c.ctx;
  if (!ctx) return;
  const dpr = dprOf();
  const cw = Math.round((c.fw + 2 * PAD) * dpr);
  const ch = Math.round((c.fh + 2 * PAD) * dpr);
  if (c.canvas.width !== cw || c.canvas.height !== ch) {
    c.canvas.width = cw;
    c.canvas.height = ch;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, c.fw + 2 * PAD, c.fh + 2 * PAD);
  const tex = texture(c, dpr);
  if (!tex) return;

  // Hover zoom: sample a smaller window of the texture around its centre.
  const zoom = 1 + c.zoom * 0.08;
  const sw = tex.width / zoom;
  const sh = tex.height / zoom;
  const sx = (tex.width - sw) / 2;
  const sy = (tex.height - sh) / 2;
  const snap = (y: number) => Math.round(y * dpr) / dpr;

  map(0, A);
  const yTop = snap(A.y);
  let y0 = yTop;
  let v0 = 0;
  let n = 0;
  const light: number[] = []; // [y, slope] pairs for the shading pass
  for (let v = row; v < c.fh + row; v += row) {
    const v1 = Math.min(c.fh, v);
    map(v1, B);
    const y1 = snap(B.y);
    if (y1 <= y0) continue; // squeezed below a pixel: merge into the next row
    const fade = 1 - smoothstep(60, 700, -(A.z + B.z) / 2) * 0.85;
    const x = (A.x + B.x) / 2;
    const w = (A.w + B.w) / 2;
    ctx.globalAlpha = fade;
    ctx.drawImage(tex, sx, sy + (v0 / c.fh) * sh, sw, ((v1 - v0) / c.fh) * sh, x, y0, w, y1 - y0);
    if (n++ % 4 === 0) light.push((y0 + y1) / 2, (B.z - A.z) / (v1 - v0));
    A.x = B.x; A.y = B.y; A.w = B.w; A.z = B.z;
    y0 = y1;
    v0 = v1;
  }

  // Light from above, in one pass over what was just drawn: rows tilting
  // up catch some cyan, rows tilting down sink into the blue.
  if (light.length >= 4 && y0 > yTop) {
    const g = ctx.createLinearGradient(0, yTop, 0, y0);
    for (let i = 0; i < light.length; i += 2) {
      const slope = light[i + 1];
      const a = Math.min(0.16, Math.abs(slope) * 1.3).toFixed(3);
      const at = Math.min(1, Math.max(0, (light[i] - yTop) / (y0 - yTop)));
      g.addColorStop(at, slope > 0 ? `rgba(${themeRgb().c3}, ${a})` : `rgba(${themeRgb().night}, ${a})`);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = g;
    ctx.fillRect(0, yTop, c.fw + 2 * PAD, y0 - yTop);
    ctx.globalCompositeOperation = 'source-over';
  }
}

function useWaveField(gridRef: React.RefObject<HTMLDivElement>, cursorRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const grid = gridRef.current;
    const cursor = cursorRef.current;
    if (!grid || !cursor) return;
    const ring = cursor.firstElementChild as HTMLElement;
    const reduced = prefersReducedMotion();

    const cards: Card[] = [...grid.querySelectorAll<HTMLElement>('[data-wcard]')].map(el => {
      const canvas = el.querySelector('canvas')!;
      return {
        el,
        frame: el.querySelector<HTMLElement>('[data-frame]')!,
        canvas,
        ctx: canvas.getContext('2d'),
        base: el.dataset.img ?? '',
        img: null,
        tex: null,
        labelWrap: el.querySelector<HTMLElement>('[data-labelwrap]')!,
        label: el.querySelector<HTMLElement>('[data-label]')!,
        fx: 0, fy: 0, fw: 0, fh: 0, lx: 0, ly: 0, lh: 0,
        hover: 0, hoverTarget: 0, zoom: 0,
        live: false,
      };
    });

    const flat = (c: Card) => (v: number, out: Proj) => {
      out.x = PAD;
      out.y = PAD + v;
      out.w = c.fw;
      out.z = 0;
    };

    // Layout is read only here, never inside the animation loop.
    let gridTop = 0;
    let gridBottom = 0;
    const measure = () => {
      const g = docOffset(grid);
      gridTop = g.y;
      gridBottom = g.y + g.h;
      for (const c of cards) {
        const f = docOffset(c.frame);
        c.fx = f.x; c.fy = f.y; c.fw = f.w; c.fh = f.h;
        const l = docOffset(c.labelWrap);
        c.lx = l.x; c.ly = l.y; c.lh = l.h;
        if (reduced) paint(c, flat(c));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    ro.observe(grid);
    window.addEventListener('resize', measure);

    // Load each image when its card gets close; thumbnail first, original
    // PNG if the thumbnail is missing.
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        const c = cards.find(k => k.el === e.target);
        if (!c) continue;
        // data-ready: the image is in (or there is none), so the card
        // paints on the next frame. Home waits for it before a reveal.
        if (!c.base) { c.el.dataset.ready = ''; continue; }
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          c.img = img;
          c.el.dataset.ready = '';
          if (reduced) paint(c, flat(c));
        };
        img.onerror = () => {
          if (!img.src.endsWith('/1.png')) img.src = `${c.base}/1.png`;
          else c.el.dataset.ready = '';
        };
        img.src = `${c.base}/thumb-1.webp`;
      }
    }, { rootMargin: '900px 0px' });
    cards.forEach(c => io.observe(c.el));

    let hovering = 0;
    const listeners = cards.map(c => {
      const enter = () => { c.hoverTarget = 1; hovering++; };
      const leave = () => { c.hoverTarget = 0; hovering = Math.max(0, hovering - 1); };
      c.el.addEventListener('pointerenter', enter);
      c.el.addEventListener('pointerleave', leave);
      return () => {
        c.el.removeEventListener('pointerenter', enter);
        c.el.removeEventListener('pointerleave', leave);
      };
    });

    const cleanup = () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('resize', measure);
      listeners.forEach(off => off());
    };
    if (reduced) return cleanup;

    let lastScroll = window.scrollY;
    let vel = 0;
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cam = { x: 0, y: 0 };
    const cur = { x: -200, y: -200, px: -200, py: -200, s: 0 };
    const P = { y: 0, z: 0 };
    // If painting is slow (no GPU canvas), paint coarser rows instead.
    let row = ROW;
    let cost = 0;
    let frames = 0;

    const off = onTick((t, dt) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sy = window.scrollY;

      // Smoothed native scroll speed (px/s); only feeds the animation.
      vel = lerp(vel, (sy - lastScroll) / Math.max(dt, 1 / 240), 0.08);
      lastScroll = sy;
      const speed = Math.min(1, Math.abs(vel) / 2500);
      const drag = Math.max(-1, Math.min(1, vel / 3000));

      if (pointer.active) {
        mouse.x = lerp(mouse.x, pointer.x, 0.12);
        mouse.y = lerp(mouse.y, pointer.y, 0.12);
      }

      // Ring around the (still visible) system cursor while over a card;
      // it trails a little and stretches along its motion.
      cur.s = lerp(cur.s, hovering > 0 && pointer.active ? 1 : 0, 0.16);
      cur.x = lerp(cur.x, pointer.x, 0.22);
      cur.y = lerp(cur.y, pointer.y, 0.22);
      const cvx = (cur.x - cur.px) / Math.max(dt, 1 / 240);
      const cvy = (cur.y - cur.py) / Math.max(dt, 1 / 240);
      cur.px = cur.x;
      cur.py = cur.y;
      const stretch = Math.min(0.45, Math.hypot(cvx, cvy) / 4000);
      cursor.style.visibility = cur.s < 0.01 ? 'hidden' : 'visible';
      cursor.style.transform = `translate3d(${cur.x.toFixed(1)}px,${cur.y.toFixed(1)}px,0) scale(${cur.s.toFixed(3)})`;
      ring.style.transform = `rotate(${Math.atan2(cvy, cvx).toFixed(3)}rad) scale(${(1 + stretch).toFixed(3)},${(1 - stretch * 0.6).toFixed(3)})`;

      if (gridBottom - sy < -vh || gridTop - sy > vh * 1.5) return;

      // Camera: slight mouse parallax plus a slow drift made of sines.
      cam.x = lerp(cam.x, (mouse.x - vw / 2) * -0.12 * FX, 0.05);
      cam.y = lerp(cam.y, (mouse.y - vh / 2) * -0.08 * FX, 0.05);
      const ox = vw / 2 + cam.x + (Math.sin(t * 0.31) * 18 + Math.sin(t * 0.17 + 1.3) * 10) * FX;
      const oy = vh * 0.45 + cam.y + Math.cos(t * 0.23) * 12 * FX;

      // Screen y -> point on a sheet that curls away near the top and
      // dips back a little at the bottom. The curl angle is capped so the
      // receding part converges above the screen instead of piling up.
      const topLine = vh * 0.3;
      const topR = (vh * 0.45) / FX;
      const topMax = Math.atan(PERSPECTIVE / (oy + 250));
      const footLine = vh * 0.92;
      const footR = (vh * 1.2) / FX;
      const bend = (y: number) => {
        if (y < topLine) {
          const d = topLine - y;
          const th = Math.min(d / topR, topMax);
          const rest = d - th * topR;
          P.y = topLine - topR * Math.sin(th) - rest * Math.cos(th);
          P.z = -topR * (1 - Math.cos(th)) - rest * Math.sin(th);
        } else if (y > footLine) {
          const d = y - footLine;
          const th = Math.min(d / footR, 0.5 * FX);
          const rest = d - th * footR;
          P.y = footLine + footR * Math.sin(th) + rest * Math.cos(th);
          P.z = -footR * (1 - Math.cos(th)) - rest * Math.sin(th);
        } else {
          P.y = y;
          P.z = 0;
        }
      };

      const amp = (16 + speed * 40) * FX;
      const ripple = (x: number, docY: number) =>
        amp * Math.sin((x - docY) * 0.0065 - t * 1.7) +
        7 * FX * Math.sin((x * 0.6 + docY) * 0.011 + t * 1.15 + Math.cos(docY * 0.003 + t * 0.6) * 2);

      const t0 = performance.now();
      for (const c of cards) {
        const top = c.fy - sy;
        if (top > vh + 200 || c.ly + c.lh - sy < -vh * 0.6) {
          c.hover = c.zoom = c.hoverTarget;
          if (c.live) {
            // Off screen: free the canvas memory and drop the 3D transform.
            c.canvas.width = 0;
            c.canvas.height = 0;
            c.label.style.transform = '';
            c.labelWrap.style.opacity = '';
            c.live = false;
          }
          continue;
        }
        c.live = true;
        c.hover = lerp(c.hover, c.hoverTarget, 0.1);
        c.zoom = lerp(c.zoom, c.hoverTarget, 0.06);
        const lift = c.hover * 28 * FX;
        const cx = c.fx + c.fw / 2;
        const dx = Math.max(0, c.fx - mouse.x, mouse.x - c.fx - c.fw);
        const near = pointer.active ? Math.exp(-(dx * dx) / (2 * 170 * 170)) : 0;
        const depth = (ys: number, docY: number, k: number) => {
          bend(ys);
          const z = P.z +
            k * ripple(cx, docY) +
            k * near * 46 * FX * Math.exp(-((ys - mouse.y) ** 2) / (2 * 150 * 150)) -
            drag * (ys - vh * 0.5) * 0.06 * FX +
            lift * k;
          // Soft cap towards the viewer so the bend stays inside the canvas.
          return z > 0 ? 70 * Math.tanh(z / 70) : z;
        };

        paint(c, (v, out) => {
          const z = depth(top + v, c.fy + v, 1);
          const s = PERSPECTIVE / (PERSPECTIVE - z);
          out.y = oy + (P.y - oy) * s - (top - PAD);
          out.x = ox + (c.fx - ox) * s - (c.fx - PAD);
          out.w = c.fw * s;
          out.z = z;
        }, row);

        // The label rides the same surface as one rigid piece.
        const lt = c.ly - sy;
        const lz0 = depth(lt, c.ly, 0.6);
        const ly0 = P.y;
        const lz1 = depth(lt + c.lh, c.ly + c.lh, 0.6);
        const ly1 = P.y;
        c.labelWrap.style.perspectiveOrigin = `${(ox - c.lx).toFixed(1)}px ${(oy - lt).toFixed(1)}px`;
        c.labelWrap.style.opacity = (1 - smoothstep(60, 700, -(lz0 + lz1) / 2) * 0.85).toFixed(3);
        c.label.style.transform =
          `translate3d(0,${(ly0 - lt).toFixed(2)}px,${lz0.toFixed(2)}px) rotateX(${Math.atan2(lz1 - lz0, ly1 - ly0).toFixed(4)}rad)`;
      }
      cost = lerp(cost, performance.now() - t0, 0.1);
      if (++frames > 30 && cost > 8 && row < ROW * 4) {
        row *= 2;
        frames = 0;
        cost = 0;
      }
    });

    return () => {
      off();
      cleanup();
    };
  }, [gridRef, cursorRef]);
}
