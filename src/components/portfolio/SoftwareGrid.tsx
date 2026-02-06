import React, { useEffect, useState, useMemo } from 'react';
import { SoftwareCard } from './SoftwareCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { ProjectData } from './types';
import { CategoryPills } from './CategoryPills';
import { AIUsedShowcase } from './AIUsedShowcase';

export const SoftwareGrid: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const isMobile = useIsMobile();

  useEffect(() => {
    const modules = import.meta.glob<ProjectData>('../../resources/projects/*.json', { eager: true });
    const loaded: ProjectData[] = Object.values(modules).map((m: any) => m.default || m);

    loaded.sort((a, b) => {
      if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.title.localeCompare(b.title);
    });

    setProjects(loaded);
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter(project => project.category?.includes(selectedCategory));
  }, [projects, selectedCategory]);

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
  <p className="text-xl text-space-secondary max-w-2xl text-center leading-snug -mt-6 opacity-90">
    First came Chaos, vast and formless.
  </p>
</div>

        {/* Header */}
        <h2 className="text-center font-light text-space-primary mb-16" style={{ fontSize: '2.5rem', lineHeight: '1.1' }}>
          <i>
            Hey, I'm Lox. Welcome to my project <span className="font-semibold glow-text-medium">portfolio</span> :)
          </i>
        </h2>

        {/* AI Showcase */}
        <AIUsedShowcase />

        {/* Category Pills */}
        <CategoryPills projects={projects} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredProjects.map(project => (
            <SoftwareCard
              key={project.id}
              {...project}
              technologies={project.technologies || project.tags || []}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && projects.length > 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-space-primary mb-2">No projects found</h3>
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