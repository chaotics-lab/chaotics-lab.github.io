import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CATEGORIES } from '@/config/categories';
import { PROJECTS } from '@/lib/projects';
import { AIUsedShowcase } from '@/components/portfolio/AIUsedShowcase';
import { ElementMarquee } from '@/components/portfolio/ElementMarquee';
import { HomeHero } from './HomeHero';
import { ProjectGrid } from './ProjectGrid';

export const Home = () => {
  const projects = PROJECTS;
  const [category, setCategory] = useState('all');
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
    () => (category === 'all' ? projects : projects.filter(p => p.category?.includes(category))),
    [projects, category],
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
          <div className="mt-8 inline-flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter projects">
            {tabs.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={category === t.id}
                onClick={() => setCategory(t.id)}
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
          <ProjectGrid key={category} projects={filtered} />
        </div>
      </section>
    </main>
  );
};
