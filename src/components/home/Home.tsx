import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/ticker';
import { useLocation } from 'react-router-dom';
import { CATEGORIES } from '@/config/categories';
import { PROJECTS } from '@/lib/projects';
import { AIUsedShowcase } from '@/components/portfolio/AIUsedShowcase';
import { ElementMarquee } from '@/components/portfolio/ElementMarquee';
import { HomeHero } from './HomeHero';
import { ProjectGrid } from './ProjectGrid';

// Length of the grid wipe (keep in sync with .g-old in index.css).
const WIPE_MS = 620;

export const Home = () => {
  const projects = PROJECTS;
  // `category` follows the pills at once. On a change, the grid it had
  // (`prev`) stays on top of the new one and is wiped away by a slanted
  // edge, then the wrapper eases to the new height.
  const [category, setCategory] = useState('all');
  const [prev, setPrev] = useState<string | null>(null);
  const [minH, setMinH] = useState<number | undefined>(undefined);
  const [switched, setSwitched] = useState(false);
  const swapRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const pick = (id: string) => {
    if (id === category) return;
    setCategory(id);
    if (prefersReducedMotion()) return;
    timers.current.forEach(clearTimeout);
    setSwitched(true);
    setPrev(category);
    setMinH(swapRef.current?.offsetHeight);
    timers.current = [
      window.setTimeout(() => { setPrev(null); setMinH(0); }, WIPE_MS),
      window.setTimeout(() => setMinH(undefined), WIPE_MS + 500),
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
  const inCategory = useCallback(
    (id: string) => (id === 'all' ? projects : projects.filter(p => p.category?.includes(id))),
    [projects],
  );
  // Both grids keep their keys, so the old one is not remounted when it
  // moves on top.
  const layers = useMemo(() => (prev && prev !== category ? [category, prev] : [category]), [category, prev]);
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
          <div ref={swapRef} className="g-swap" data-switched={switched || undefined} data-wiping={prev ? 'true' : undefined} style={{ minHeight: minH, ['--h' as string]: minH ? `${minH}px` : undefined, ['--lean' as string]: minH ? `${Math.round(minH * 0.32)}px` : undefined }}>
            {layers.map(id => (
              <div key={id} className={id === prev ? 'g-layer g-old' : 'g-layer'} aria-hidden={id === prev || undefined}>
                <ProjectGrid projects={inCategory(id)} />
              </div>
            ))}
            {prev && <span className="g-edge" aria-hidden="true" />}
          </div>
        </div>
      </section>
    </main>
  );
};
