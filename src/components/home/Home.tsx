import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/ticker';
import { useLocation } from 'react-router-dom';
import { CATEGORIES } from '@/config/categories';
import { PROJECTS } from '@/lib/projects';
import { AIUsedShowcase } from '@/components/portfolio/AIUsedShowcase';
import { ElementMarquee } from '@/components/portfolio/ElementMarquee';
import { HomeHero } from './HomeHero';
import { ProjectGrid } from './ProjectGrid';

// How long the outgoing cards take to be covered (see .w-card in index.css).
const LEAVE_MS = 380;

export const Home = () => {
  const projects = PROJECTS;
  // `category` follows the pills at once; `shown` is what the grid holds,
  // switched once the old cards have been slashed out.
  const [category, setCategory] = useState('all');
  const [shown, setShown] = useState('all');
  const [leaving, setLeaving] = useState(false);
  const swapTimer = useRef(0);
  useEffect(() => () => clearTimeout(swapTimer.current), []);
  const pick = (id: string) => {
    if (id === category) return;
    setCategory(id);
    clearTimeout(swapTimer.current);
    if (prefersReducedMotion()) { setShown(id); return; }
    setLeaving(true);
    swapTimer.current = window.setTimeout(() => { setShown(id); setLeaving(false); }, LEAVE_MS);
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
          <div data-leaving={leaving || undefined}>
            <ProjectGrid key={shown} projects={filtered} />
          </div>
        </div>
      </section>
    </main>
  );
};
