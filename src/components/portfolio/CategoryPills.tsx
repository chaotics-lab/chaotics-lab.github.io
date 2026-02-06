import React from 'react';
import { Package } from 'lucide-react';
import { ProjectData } from './types';
import { LucideIcon, Grid2X2, Brain, Globe, Bot, Cpu, Smartphone, FileChartColumn, AudioWaveform, Gamepad, AppWindow, CodeXml, DatabaseZap } from 'lucide-react';

interface CategoryPillsProps {
  projects: ProjectData[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  all: { label: 'All Projects', color: 'from-slate-500 to-gray-500', icon: Grid2X2 },
  ai: { label: 'AI & ML', color: 'from-purple-500 to-pink-500', icon: Brain },
  web: { label: 'Web Dev', color: 'from-blue-500 to-cyan-500', icon: Globe },
  robotics: { label: 'Robotics', color: 'from-green-500 to-emerald-500', icon: Bot },
  'embedded-systems': { label: 'Embedded', color: 'from-orange-500 to-red-500', icon: Cpu },
  mobile: { label: 'Mobile', color: 'from-cyan-500 to-blue-500', icon: Smartphone },
  data: { label: 'Data Science', color: 'from-yellow-500 to-orange-500', icon: FileChartColumn },
  sp: { label: 'Signal Processing', color: 'from-pink-500 to-rose-500', icon: AudioWaveform },
  game: { label: 'Game Dev', color: 'from-red-500 to-purple-500', icon: Gamepad },
  gui: { label: 'GUI', color: 'from-teal-500 to-cyan-500', icon: AppWindow },
  software: { label: 'Software', color: 'from-indigo-500 to-purple-500', icon: CodeXml },
  backend: { label: 'Backend', color: 'from-gray-500 to-slate-500', icon: DatabaseZap },
};

export const CategoryPills: React.FC<CategoryPillsProps> = ({ projects, selectedCategory, setSelectedCategory }) => {
  const availableCategories = React.useMemo(() => {
    const categorySet = new Set<string>();
    projects.forEach(p => p.category?.forEach(cat => categorySet.add(cat)));
    return ['all', ...Array.from(categorySet).sort()];
  }, [projects]);

  return (
    <div className="max-w-5xl mx-auto mb-10">
      <div className="flex flex-wrap justify-center gap-3">
        {availableCategories.map(category => {
          const config = CATEGORY_CONFIG[category] || {
            label: category.charAt(0).toUpperCase() + category.slice(1),
            color: 'from-gray-500 to-slate-500',
            icon: Package
          };
          const isActive = selectedCategory === category;
          const count = category === 'all' ? projects.length : projects.filter(p => p.category?.includes(category)).length;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-2xl font-mono transition-transform duration-300
                ${isActive ? 'scale-105 -translate-y-1' : 'hover:scale-105 hover:-translate-y-0.5'}`}
            >
              {/* Glass background */}
              <div className={`absolute inset-0 rounded-2xl backdrop-blur-sm border border-white/10 transition-all duration-300
                ${isActive ? 'bg-white/10 border-white/20' : 'bg-white/5 group-hover:bg-white/10 group-hover:border-white/25'}`} />

              {/* Radial hover glow */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
                ${isActive ? 'opacity-100' : 'group-hover:opacity-100'}`}
                style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />

              {/* Icon */}
              <config.icon className="relative w-4 h-4 text-space-muted transition-colors duration-300 group-hover:text-white" />
              {/* Label */}
              <span className="relative text-white font-medium">{config.label}</span>
              {/* Count */}
              <span className="relative text-xs text-white/70 font-mono">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};