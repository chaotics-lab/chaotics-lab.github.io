import React, { useEffect, useState } from 'react';
import { SoftwareCard } from './SoftwareCard';

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  status: 'active' | 'beta' | 'archived';
  imageUrl?: string;
  logoUrl?: string;
  themeColor?: string;         // formerly themeColor
  logoBackgroundColor?: string;
  category?: string[];
  tags?: string[];
  date?: string;
}

export const SoftwareGrid: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
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
                status={project.status}
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

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p>Loading projects...</p>
          </div>
        )}
      </div>
    </section>
  );
};