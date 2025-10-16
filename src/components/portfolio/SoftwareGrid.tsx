import React, { useEffect, useState, useMemo } from 'react';
import { SoftwareCard } from './SoftwareCard';
import { X } from 'lucide-react';

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

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  'all': { label: 'All Projects', color: 'from-slate-500 to-gray-500', icon: '✨' },
  'ai': { label: 'AI & ML', color: 'from-purple-500 to-pink-500', icon: '🧠' },
  'web': { label: 'Web Dev', color: 'from-blue-500 to-cyan-500', icon: '🌐' },
  'robotics': { label: 'Robotics', color: 'from-green-500 to-emerald-500', icon: '🤖' },
  'embedded-systems': { label: 'Embedded', color: 'from-orange-500 to-red-500', icon: '⚡' },
  'mobile': { label: 'Mobile', color: 'from-cyan-500 to-blue-500', icon: '📱' },
  'data': { label: 'Data Science', color: 'from-yellow-500 to-orange-500', icon: '📊' },
  'sp': { label: 'Signal Processing', color: 'from-pink-500 to-rose-500', icon: '〰️' },
  'game': { label: 'Game Dev', color: 'from-red-500 to-purple-500', icon: '🎮' },
  'gui': { label: 'GUI', color: 'from-teal-500 to-cyan-500', icon: '🖥️' },
  'software': { label: 'Software', color: 'from-indigo-500 to-purple-500', icon: '💻' },
  'backend': { label: 'Backend', color: 'from-gray-500 to-slate-500', icon: '⚙️' },
};

export const SoftwareGrid: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const modules = import.meta.glob<ProjectData>('../../resources/projects/*.json', { eager: true });
    const loaded: ProjectData[] = Object.values(modules).map((m: any) => m.default || m);
    
    loaded.sort((a, b) => {
      if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.title.localeCompare(b.title);
    });
    
    setProjects(loaded);
  }, []);

  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    projects.forEach(project => {
      project.category?.forEach(cat => categorySet.add(cat));
    });
    return ['all', ...Array.from(categorySet).sort()];
  }, [projects]);

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

        {/* Category Pills */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="flex flex-wrap justify-center gap-2.5">
            {availableCategories.map((category) => {
              const config = CATEGORY_CONFIG[category] || { 
                label: category.charAt(0).toUpperCase() + category.slice(1), 
                color: 'from-gray-500 to-slate-500',
                icon: '📦'
              };
              const isActive = selectedCategory === category;
              const count = category === 'all' 
                ? projects.length 
                : projects.filter(p => p.category?.includes(category)).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    group relative px-4 py-2.5 rounded-lg overflow-hidden
                    transition-all duration-200 flex items-center gap-2
                    ${isActive 
                      ? 'scale-105 shadow-lg' 
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                    }
                  `}
                >
                  {/* Gradient Background */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r ${config.color}
                    ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'}
                    transition-opacity duration-200
                  `} />
                  
                  {/* Border */}
                  <div className={`
                    absolute inset-0 border-2 rounded-lg
                    ${isActive 
                      ? 'border-white/50' 
                      : 'border-white/10 group-hover:border-white/30'
                    }
                    transition-colors duration-200
                  `} />
                  
                  {/* Content */}
                  <span className="relative text-xl">{config.icon}</span>
                  <span className="relative font-medium text-white">{config.label}</span>
                  <span className="relative text-xs text-white/70 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count
        {selectedCategory !== 'all' && (
          <div className="text-center mb-6">
            <p className="text-space-secondary text-sm">
              Showing <span className="text-space-primary font-semibold">{filteredProjects.length}</span> {filteredProjects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
        )} */}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <SoftwareCard
              key={project.id}
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
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && projects.length > 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-space-primary mb-2">
              No projects found
            </h3>
            <p className="text-space-secondary mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg
                       font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              View all projects
            </button>
          </div>
        )}

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">⚡</div>
              <p className="text-space-secondary">Loading projects...</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </section>
  );
}