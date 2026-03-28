import React from 'react';
import { ProjectData } from './types';
import { LucideIcon, Grid2X2, Brain, Globe, Cpu, Gamepad, Wrench } from 'lucide-react';

interface CategoryPillsProps {
  projects: ProjectData[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; description: string; color: string; icon: LucideIcon }> = {
  all:     {
    label: 'All Projects',
    description: 'Everything. Some of them shipped, some burnt (literally, a certain drone caught on fire..)',
    color: 'from-slate-500 to-gray-500',
    icon: Grid2X2,
  },
  systems: {
    label: 'Embedded Systems',
    description: 'Low-level projects that interact with the physical world end up here.',
    color: 'from-orange-500 to-red-500',
    icon: Cpu,
  },
  ai:      {
    label: 'AI & ML',
    description: 'The full spectrum of what AI means: from using pre-trained AI models to implementing SOTA research papers to making literal neurons out of resistors and capacitors.',
    color: 'from-purple-500 to-pink-500',
    icon: Brain,
  },
  apps:    {
    label: 'Applications & Tools',
    description: 'Web/Desktop fullstack applications and self-hosted tools built to solve problems.',
    color: 'from-teal-500 to-cyan-500',
    icon: Wrench,
  },
  games:   {
    label: 'Games',
    description: 'Games, game dev tools and gaming related projects, as I have a soft spot for video games :)',
    color: 'from-red-500 to-purple-500',
    icon: Gamepad,
  },
};

export const CategoryPills: React.FC<CategoryPillsProps> = ({ projects, selectedCategory, setSelectedCategory }) => {
  const availableCategories = React.useMemo(() => {
    const categorySet = new Set<string>();
    projects.forEach(p => p.category?.forEach(cat => categorySet.add(cat)));
    return ['all', ...Object.keys(CATEGORY_CONFIG).filter(k => k !== 'all' && categorySet.has(k))];
  }, [projects]);

  const getCount = (category: string) => {
    if (category === 'all') return projects.length;
    return projects.filter(p =>
      p.category?.some(cat => cat === category)
    ).length;
  };

  const activeConfig = CATEGORY_CONFIG[selectedCategory];

  return (
    <div className="max-w-5xl mx-auto mb-10">
      {/* Pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {availableCategories.map(category => {
          const config = CATEGORY_CONFIG[category];
          const isActive = selectedCategory === category;
          const count = getCount(category);

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-2xl font-ui transition-transform duration-300
                ${isActive ? 'scale-105 -translate-y-1' : 'hover:scale-105 hover:-translate-y-0.5'}`}
            >
              <div className={`absolute inset-0 rounded-2xl backdrop-blur-sm border border-white/10 transition-all duration-300
                ${isActive ? 'bg-white/10 border-white/20' : 'bg-white/5'}`} />
              <div
                className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)' }}
              />
              <config.icon className="relative w-4 h-4 text-space-muted" />
              <span className="relative text-white font-medium">{config.label}</span>
              <span className="relative text-xs text-white/70 font-ui">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      {activeConfig && (
        <div className="text-center transition-all duration-300 animate-fade-in min-h-[2rem]">
          <p className="text-sm text-white/50 font-ui max-w-xl mx-auto leading-relaxed">
            {activeConfig.description}
          </p>
        </div>
      )}
    </div>
  );
};