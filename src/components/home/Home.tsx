import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/ticker';
import { WAVE } from '@/lib/wave';
import { useLocation } from 'react-router-dom';
import { CATEGORIES } from '@/config/categories';
import { PROJECTS } from '@/lib/projects';
import { AIUsedShowcase } from '@/components/portfolio/AIUsedShowcase';
import { ElementMarquee } from '@/components/portfolio/ElementMarquee';
import { HomeHero } from './HomeHero';
import { ProjectGrid } from './ProjectGrid';

// Filter change: two sea layers rise from the bottom of the screen to the
// top of the cards, the grid swaps underneath (the page shrinks or grows
// out of sight), then they carry on up and out. Same layers and timings as
// the page transition (.pt-layer in index.css), clipped to the card area.
const SWEEP_COVER_MS = 260 + 45;
const SWEEP_REVEAL_MS = 300 + 45;
const SWEEP_LAYERS = ['var(--h-c1)', 'var(--h-mid)'];

export const Home = () => {
  const projects = PROJECTS;
  // `category` follows the pills at once, `shown` is what the grid holds.
  const [category, setCategory] = useState('all');
  const [shown, setShown] = useState('all');
  const [sweep, setSweep] = useState<{ top: number; phase: 'cover' | 'reveal' } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const pick = (id: string) => {
    if (id === category) return;
    setCategory(id);
    timers.current.forEach(clearTimeout);
    if (prefersReducedMotion()) { setShown(id); return; }
    const top = Math.max(0, (gridRef.current?.getBoundingClientRect().top ?? 0) - 32);
    setSweep({ top, phase: 'cover' });
    timers.current = [
      window.setTimeout(() => { setShown(id); setSweep({ top, phase: 'reveal' }); }, SWEEP_COVER_MS + 30),
      window.setTimeout(() => setSweep(null), SWEEP_COVER_MS + 30 + SWEEP_REVEAL_MS),
    ];
  };

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
  const active = CATEGORIES.find(c => c.id === category) ?? CATEGORIES[0];

  return (
    <main>
      <HomeHero />
      <ElementMarquee />

      <section className="pt-16 md:pt-20">
        <div className="container mx-auto px-5 sm:px-8">
          <AIUsedShowcase />
        </div>
      </section>

      <section id="projects" className="pt-24 md:pt-32 scroll-mt-4">
        <div className="container mx-auto px-5 sm:px-8 text-center">
          <h2 className="h-display text-[clamp(3.4rem,9vw,8rem)]">Projects</h2>
          <div ref={tabsRef} className="relative mt-8 inline-flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter projects">
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
          <div ref={gridRef}>
            <ProjectGrid key={shown} projects={filtered} />
          </div>
        </div>
      </section>

      {sweep && (
        <div className="pt f-sweep" data-phase={sweep.phase} style={{ top: sweep.top }} aria-hidden="true">
          {SWEEP_LAYERS.map((color, i) => (
            <div
              key={color}
              className="pt-layer"
              style={{ color, ['--in' as string]: `${i * 45}ms`, ['--out' as string]: `${(SWEEP_LAYERS.length - 1 - i) * 45}ms`, ['--drift' as string]: `${-i * 0.4}s` }}
            >
              <svg className="pt-wave" viewBox="0 0 2880 60" preserveAspectRatio="none"><path d={WAVE} fill="currentColor" /></svg>
              <div className="pt-body" />
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
