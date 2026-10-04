import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/ticker';
import { useLocation } from 'react-router-dom';
import { CATEGORIES } from '@/config/categories';
import { PROJECTS } from '@/lib/projects';
import { AIUsedShowcase } from '@/components/portfolio/AIUsedShowcase';
import { ElementMarquee } from '@/components/portfolio/ElementMarquee';
import { HomeHero } from './HomeHero';
import { ProjectGrid } from './ProjectGrid';

// Filter change: the sea transition over the whole page, with the
// "Projects" title and the pills kept above it, in three steps:
//   1. the sea covers the page (SWEEP_COVER_MS),
//   2. the grid swaps and the page takes its new height while hidden (so
//      the background gradient and the sea settle before anyone sees
//      them); the grid only keeps a min-height if the page would get too
//      short to stay at the same scroll position. The reveal waits until
//      the new cards on screen have their images (at most READY_MAX_MS),
//   3. the sea leaves (SWEEP_REVEAL_MS).
// Three arrow-shaped bands (.f-chev in index.css) sweep against the way the
// cream highlight moves: left when it goes right, up when it goes down (the
// pills wrap onto several rows on phones), and so on.
const SWEEP_COVER_MS = 260 + 2 * 45;
const SWEEP_REVEAL_MS = 300 + 2 * 45;
const READY_MAX_MS = 600;
const SWEEP_LAYERS = ['var(--h-c1)', 'var(--h-top)', 'var(--h-deep)'];

export const Home = () => {
  const projects = PROJECTS;
  // `category` follows the pills at once, `shown` is what the grid holds.
  const [category, setCategory] = useState('all');
  const [shown, setShown] = useState('all');
  const [swapped, setSwapped] = useState(false);
  const [sweep, setSweep] = useState<'cover' | 'reveal' | null>(null);
  const [sweepDir, setSweepDir] = useState<'right' | 'left' | 'down' | 'up'>('right');
  const [holdH, setHoldH] = useState<number | undefined>(undefined);
  const gridRef = useRef<HTMLDivElement>(null);
  const run = useRef(0); // id of the latest filter change; older steps stop
  const pick = (id: string) => {
    if (id === category) return;
    setCategory(id);
    if (prefersReducedMotion()) { setShown(id); return; }
    const me = ++run.current;
    const alive = () => run.current === me;
    const after = (ms: number, fn: () => void) => window.setTimeout(() => { if (alive()) fn(); }, ms);

    // which way the highlight moves, and the sweep goes the other way
    const pill = (c: string) => tabsRef.current?.querySelector<HTMLElement>(`[data-cat="${c}"]`);
    const from = pill(category), to = pill(id);
    if (from && to) {
      const dx = to.offsetLeft - from.offsetLeft, dy = to.offsetTop - from.offsetTop;
      setSweepDir(Math.abs(dy) > from.offsetHeight / 2 ? (dy > 0 ? 'up' : 'down') : dx > 0 ? 'left' : 'right');
    } else setSweepDir('right');
    setSweep('cover');
    after(SWEEP_COVER_MS + 20, () => {
      // Smallest grid height that keeps the page long enough for the current
      // scroll position, so the title and pills don't move.
      const grid = gridRef.current;
      if (grid) {
        const doc = document.documentElement;
        const gridTop = grid.getBoundingClientRect().top + window.scrollY;
        const below = doc.scrollHeight - gridTop - grid.offsetHeight;
        const need = Math.ceil(window.scrollY + window.innerHeight - gridTop - below);
        setHoldH(need > 0 ? need : undefined);
      }
      setSwapped(true);
      setShown(id);
      const start = performance.now();
      const ready = () => {
        if (!alive()) return;
        const vh = window.innerHeight;
        const waiting = [...(gridRef.current?.querySelectorAll<HTMLElement>('[data-wcard]') ?? [])].some(el => {
          const r = el.getBoundingClientRect();
          return r.bottom > 0 && r.top < vh && !('ready' in el.dataset);
        });
        if (waiting && performance.now() - start < READY_MAX_MS) { requestAnimationFrame(ready); return; }
        // one more frame so the cards have painted
        requestAnimationFrame(() => {
          if (!alive()) return;
          setSweep('reveal');
          after(SWEEP_REVEAL_MS, () => setSweep(null));
        });
      };
      requestAnimationFrame(ready);
    });
  };
  useEffect(() => () => { run.current++; }, []);

  // Cream highlight that slides to the selected pill.
  const tabsRef = useRef<HTMLDivElement>(null);
  const [blob, setBlob] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const place = useCallback(() => {
    const el = tabsRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (el) setBlob({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  }, []);
  useLayoutEffect(place, [place, category]);
  useEffect(() => {
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [place]);
  const location = useLocation();

  useEffect(() => { document.title = 'Lox | Project Portfolio'; }, []);

  // Links to /#projects land on the grid: instantly when arriving from
  // another page (the transition hides the jump), smoothly otherwise.
  const arrived = useRef(false);
  useEffect(() => {
    const first = !arrived.current;
    arrived.current = true;
    if (location.hash !== '#projects') return;
    document.getElementById('projects')?.scrollIntoView({ behavior: first ? 'auto' : 'smooth' });
  }, [location.key, location.hash]);

  const available = useMemo(() => new Set(projects.flatMap(p => p.category ?? [])), [projects]);
  const count = (id: string) => (id === 'all' ? projects.length : projects.filter(p => p.category?.includes(id)).length);
  const filtered = useMemo(
    () => (shown === 'all' ? projects : projects.filter(p => p.category?.includes(shown))),
    [projects, shown],
  );
  const tabs = CATEGORIES.filter(c => c.id === 'all' || available.has(c.id));
  const active = CATEGORIES.find(c => c.id === shown) ?? CATEGORIES[0]; // description swaps with the grid

  return (
    <main>
      <HomeHero />
      <ElementMarquee />

      <section id="ai-usage" className="pt-16 md:pt-20">
        <div className="container mx-auto px-5 sm:px-8">
          <AIUsedShowcase />
        </div>
      </section>

      <section id="projects" className="pt-24 md:pt-32 scroll-mt-4">
        <div className="container mx-auto px-5 sm:px-8 text-center">
          <h2 className={`relative ${sweep ? 'z-[61]' : ''} h-display text-[clamp(3.4rem,9vw,8rem)]`}>Projects</h2>
          {/* title and pills rise above the sea only during a filter change, so
              they never cover the fixed header or back-to-top button */}
          <div ref={tabsRef} className={`relative ${sweep ? 'z-[61]' : ''} mt-8 inline-flex flex-wrap justify-center gap-2`} role="tablist" aria-label="Filter projects">
            {blob && (
              <span
                className="h-pill-blob"
                style={{ width: blob.w, height: blob.h, transform: `translate(${blob.x}px, ${blob.y}px)` }}
                aria-hidden="true"
              />
            )}
            {tabs.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={category === t.id}
                data-cat={t.id}
                onClick={() => pick(t.id)}
                className="h-pill"
              >
                {t.label}<sup>{count(t.id)}</sup>
              </button>
            ))}
          </div>
          <p key={active.id} className="mt-6 mx-auto max-w-2xl h-serif text-xl md:text-2xl text-[var(--h-c3)] h-swap-in">
            {active.description}
          </p>
        </div>

        <div className="mt-16">
          <div ref={gridRef} className="f-hold" data-swapped={swapped || undefined} style={{ minHeight: holdH }}>
            <ProjectGrid key={shown} projects={filtered} />
          </div>
        </div>
      </section>

      {sweep && (
        <div className="pt f-sweep" data-phase={sweep} data-dir={sweepDir} aria-hidden="true">
          {SWEEP_LAYERS.map((color, i) => (
            <div key={color} className="f-chev" style={{ background: color, ['--in' as string]: `${i * 45}ms`, ['--out' as string]: `${(SWEEP_LAYERS.length - 1 - i) * 45}ms` }} />
          ))}
        </div>
      )}
    </main>
  );
};
