import React, { useEffect, useState, useMemo } from 'react';
import { SoftwareCard } from './SoftwareCard';
import { Badge } from '@/components/ui/badge';

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  type: 'Personal Project' | 'Academic Project' | 'Internship';
  imageUrl?: string;
  logoUrl?: string;
  themeColor?: string;
  logoBackgroundColor?: string;
  category?: string[];
  tags?: string[];
  date?: string;
}

// Category display configuration
const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  'all': { label: 'All Projects', color: 'bg-white/10 hover:bg-white/20 border-white/30' },
  'ai': { label: 'AI & ML', color: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/50' },
  'web': { label: 'Web Dev', color: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/50' },
  'robotics': { label: 'Robotics', color: 'bg-green-500/20 hover:bg-green-500/30 border-green-400/50' },
  'embedded-systems': { label: 'Embedded', color: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-400/50' },
  'mobile': { label: 'Mobile', color: 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/50' },
  'data': { label: 'Data Science', color: 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-400/50' },
  'sp': { label: 'Signal Processing', color: 'bg-pink-500/20 hover:bg-pink-500/30 border-pink-400/50' },
  'game': { label: 'Game Dev', color: 'bg-red-500/20 hover:bg-red-500/30 border-red-400/50' },
  'gui': { label: 'GUI', color: 'bg-teal-500/20 hover:bg-teal-500/30 border-teal-400/50' },
  'software' : { label: 'Software', color: 'bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-400/50' },
  'backend': { label: 'Backend', color: 'bg-gray-500/20 hover:bg-gray-500/30 border-gray-400/50' },
};

export const SoftwareGrid: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Dynamically import all JSONs
    const modules = import.meta.glob<ProjectData>('../../resources/projects/*.json', { eager: true });
    const loaded: ProjectData[] = Object.values(modules).map((m: any) => m.default || m);
    
    // Sort by date descending if present
    loaded.sort((a, b) => {
      if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.title.localeCompare(b.title);
    });
    
    setProjects(loaded);
  }, []);

  // Extract all unique categories from projects
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    projects.forEach(project => {
      project.category?.forEach(cat => categorySet.add(cat));
    });
    return ['all', ...Array.from(categorySet).sort()];
  }, [projects]);

  // Filter projects by selected category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter(project => 
      project.category?.includes(selectedCategory)
    );
  }, [projects, selectedCategory]);

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6 relative">
        <div className="text-center space-y-6 mb-12">
          <h2 className="text-3xl font-light text-space-primary">
            Software <span className="font-semibold glow-text-medium">Portfolio</span>
          </h2>
          <p className="text-space-secondary max-w-2xl mx-auto">
            A curated collection of software projects, libraries, and experiments.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {availableCategories.map((category) => {
            const config = CATEGORY_CONFIG[category] || { 
              label: category.charAt(0).toUpperCase() + category.slice(1), 
              color: 'bg-white/10 hover:bg-white/20 border-white/30' 
            };
            const isActive = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-full border transition-all duration-300
                  ${config.color}
                  ${isActive 
                    ? 'ring-2 ring-white/50 scale-105 font-semibold' 
                    : 'opacity-70 hover:opacity-100'
                  }
                `}
              >
                {config.label}
                {category !== 'all' && (
                  <span className="ml-2 text-xs opacity-60">
                    ({projects.filter(p => p.category?.includes(category)).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
            >
              <SoftwareCard
                id={project.id}
                title={project.title}
                description={project.description}
                technologies={project.technologies || project.tags || []}
                type={project.type}
                liveUrl={project.liveUrl}
                githubUrl={project.githubUrl}
                imageUrl={project.imageUrl}
                logoUrl={project.logoUrl}
                themeColor={project.themeColor}
                logoBackgroundColor={project.logoBackgroundColor}
                category={project.category}
                tags={project.tags}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && projects.length > 0 && (
          <div className="text-center py-12">
            <p className="text-space-secondary text-lg">
              No projects found in this category
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-4 text-space-primary hover:underline"
            >
              View all projects
            </button>
          </div>
        )}

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p>Loading projects...</p>
          </div>
        )}
      </div>
    </section>
  );
};