import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { SoftwareCard } from './SoftwareCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { ProjectData } from './types';
import { CategoryPills } from './CategoryPills';
import { AIUsedShowcase } from './AIUsedShowcase';
import { projectOrder } from '@/config/projectOrder';

export const SoftwareGrid: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterVersion, setFilterVersion] = useState(0);
  const isMobile = useIsMobile();

  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setFilterVersion(v => v + 1);
  }, []);

  useEffect(() => {
    const modules = import.meta.glob<ProjectData>('../../resources/projects/*.json', { eager: true });
    const loaded: ProjectData[] = Object.values(modules).map((m: any) => m.default || m);

    const byDate = (a: ProjectData, b: ProjectData) => {
      if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.title.localeCompare(b.title);
    };

    if (projectOrder.enabled) {
      loaded.sort((a, b) => {
        const ai = projectOrder.order.indexOf(a.id);
        const bi = projectOrder.order.indexOf(b.id);
        // Both pinned → use config order
        if (ai !== -1 && bi !== -1) return ai - bi;
        // Pinned items come first
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        // Neither pinned → fall back to date
        return byDate(a, b);
      });
    } else {
      loaded.sort(byDate);
    }

    setProjects(loaded);
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter(project =>
      project.category?.some(cat => cat === selectedCategory)
    );
  }, [projects, selectedCategory]);

  // Placeholder counts per breakpoint to fill incomplete rows.
  // 2-col (sm): add 1 if odd, 0 if even.
  // 3-col (lg): add (3 - count%3) % 3.
  const placeholders = useMemo(() => {
    const count = filteredProjects.length;
    if (count === 0) return { sm: 0, lg: 0 };
    return {
      sm: count % 2,
      lg: (3 - (count % 3)) % 3,
    };
  }, [filteredProjects.length]);

  return (
    <section className="py-20 relative overflow-x-hidden">
      <div className="container mx-auto px-6 relative">

        {/* Logo & tagline */}
<div className="flex flex-col items-center mb-12">
  <div className="w-full max-w-2xl">
    <img
      src="/img/logos/Chaotics Logo White.svg"
      alt="Chaotics Logo"
      draggable={false}
      className="w-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 hover:drop-shadow-[0_0_50px_rgba(255,255,255,0.5)] select-none"
    />
  </div>
  <p className="text-xl font-display text-space-secondary max-w-2xl text-center leading-snug -mt-6 opacity-90">
    First came Chaos, vast and formless.
  </p>
</div>

        {/* Header */}
        <h2 className="text-center font-display font-light text-space-primary mb-16 tracking-tight" style={{ fontSize: '2.5rem', lineHeight: '1.1', wordSpacing: '0.05em' }}>
          <i>
            Hey, I'm Lox. Welcome to my project <span className="font-semibold glow-text-medium">portfolio</span> :)
          </i>
        </h2>

        {/* AI Showcase */}
        <AIUsedShowcase />

        {/* Category Pills */}
        <CategoryPills projects={projects} selectedCategory={selectedCategory} setSelectedCategory={handleCategoryChange} />

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredProjects.map((project, i) => (
            <div
              key={`${project.id}-${filterVersion}`}
              className="animate-grid-item-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <SoftwareCard
                {...project}
                technologies={project.technologies || project.tags || []}
              />
            </div>
          ))}
          {/* 2-col placeholders: visible at sm, hidden at lg */}
          {Array.from({ length: placeholders.sm }).map((_, i) => (
            <div
              key={`ph-sm-${i}-${filterVersion}`}
              className="hidden sm:flex lg:hidden relative w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] min-h-[130px] animate-grid-item-in"
              style={{ animationDelay: `${(filteredProjects.length + i) * 40}ms` }}
            >
              <span className="text-white/20 text-sm font-ui font-medium tracking-wide">Coming Soon 👀</span>
            </div>
          ))}
          {/* 3-col placeholders: visible at lg only */}
          {Array.from({ length: placeholders.lg }).map((_, i) => (
            <div
              key={`ph-lg-${i}-${filterVersion}`}
              className="hidden lg:flex relative w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] md:min-h-[400px] animate-grid-item-in"
              style={{ animationDelay: `${(filteredProjects.length + i) * 40}ms` }}
            >
              <span className="text-white/20 text-sm font-ui font-medium tracking-wide">Coming Soon 👀</span>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && projects.length > 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-display font-semibold text-space-primary mb-2">No projects found</h3>
            <p className="text-space-secondary mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              View all projects
            </button>
          </div>
        )}

        {/* Loading State */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">⚡</div>
              <p className="text-space-secondary">Loading projects...</p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};