import React, { useEffect, useState, useMemo } from 'react';
import { SoftwareCard } from './SoftwareCard';
import { AISticker } from '@/components/AISticker';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles, Code, Zap, Brain, Cpu, Rocket, ChevronDown, ExternalLink } from 'lucide-react';

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
  AIUsed?: string;
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

const AI_USAGE_LEVELS = [
  { 
    value: 0, 
    label: 'AI-Free', 
    description: 'I do everything by hand. Every design decision, line of code, and debug session is mine. I learn by doing and thinking through every step, looking at the docs and on StackOverflow / Tutorials.',
    icon: Code,
    color: '#5bbcd6'
  },
  { 
    value: 20, 
    label: 'Referencing', 
    description: 'AI is used for syntax correction, documentation generation, or clarifying concepts. I still write the entire code and make every engineering decision myself.',
    icon: Sparkles,
    color: '#6fb8d1'
  },
  { 
    value: 40, 
    label: 'Automation', 
    description: 'AI handles boilerplate, repetitive lines, and trivial functions from detailed comments. I supervise closely and ensure everything works as intended.',
    icon: Zap,
    color: '#8ea8ce'
  },
  { 
    value: 60, 
    label: 'Collaboration', 
    description: 'AI suggests implementation structures, design patterns, and approaches with tools like PlantUML. I decide what fits best, validate ideas, and implement the critical parts more diligently.',
    icon: Brain,
    color: '#b88fc9'
  },
  { 
    value: 80, 
    label: 'Situational Autonomy', 
    description: 'I let AI fully handle certain parts of the codebase, like web frontends, while I focus on key features, glue code, and core systems.',
    icon: Cpu,
    color: '#e378bc'
  },
  { 
    value: 100, 
    label: 'Vibe Coding', 
    description: 'AI writes the code mostly entirely. I check only behavior, test edge cases, tweak settings and experiment mostly on personal or low-risk projects.',
    icon: Rocket,
    color: '#ff006e'
  },
];


export const SoftwareGrid: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [aiShowcaseOpen, setAiShowcaseOpen] = useState<boolean | null>(null);
  const isMobile = useIsMobile();

  // Initialize AI Showcase state from localStorage and device type
  useEffect(() => {
    const cached = localStorage.getItem('aiShowcaseOpen');
    if (cached !== null) {
      setAiShowcaseOpen(JSON.parse(cached));
    } else {
      // Default: open on desktop, closed on mobile
      setAiShowcaseOpen(!isMobile);
    }
  }, [isMobile]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (aiShowcaseOpen !== null) {
      localStorage.setItem('aiShowcaseOpen', JSON.stringify(aiShowcaseOpen));
    }
  }, [aiShowcaseOpen]);

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

        {/* AI Usage Badge Showcase */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="relative backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-white/10 overflow-hidden bg-white/5 transition-all duration-300 group md:hover:shadow-2xl" style={{}} >
            {/* Background glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
            background: 'radial-gradient(circle at top right, rgba(138, 43, 226, 0.15) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(255, 0, 110, 0.15) 0%, transparent 50%)',
            filter: 'blur(60px)',
              }}
            />
            
            {/* Enhanced glow on hover */}
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
              style={{
                background: 'radial-gradient(circle at top right, rgba(138, 43, 226, 0.25) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(255, 0, 110, 0.25) 0%, transparent 50%)',
                filter: 'blur(60px)',
              }}
            />
            
            {/* Bottom teaser glow when collapsed */}
            <div
              className={`absolute bottom-0 left-0 right-0 pointer-events-none transition-opacity duration-300 rounded-2xl ${
                aiShowcaseOpen ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                height: '80px',
                background: 'radial-gradient(ellipse at center bottom, rgba(138, 43, 226, 0.2) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            
            <div className="relative z-10">
              {/* Header and always-visible content */}
              <button
                onClick={() => setAiShowcaseOpen(!aiShowcaseOpen)}
                className="w-full text-left group px-8 pt-8 pb-4 transition-transform duration-300 md:hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                    <div className="flex items-center flex-shrink-0">
                    <img 
                      src="/img/AI Seal of Quality.png" 
                      alt="AI Seal of Quality" 
                      className="w-32 h-auto md:w-32 md:h-auto"
                    />
                    </div>
                    <blockquote className="text-space-secondary text-xl italic border-l-4 border-gray-300 pl-4 flex-grow">
                      I track my AI usage to focus on learning new skills, not just coding/work efficiency.
                      Overreliance on AI can hinder metacognition and weaken learning compared to active problem solving. 
                      Once I master a tool or concept, I use AI responsibly to speed up work without losing control of my critical mind. <a href="https://www.media.mit.edu/projects/your-brain-on-chatgpt/overview/" className="underline inline-flex items-center gap-1">Your Brain on ChatGPT<ExternalLink className="w-4 h-4" /></a>
                    </blockquote>
                    <ChevronDown 
                      className={`w-6 h-6 flex-shrink-0 absolute right-0 top-0 md:relative md:top-auto md:right-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                        aiShowcaseOpen ? 'rotate-180' : ''
                      }`}
                    />
                </div>
              </button>

              {/* Collapsible badges section */}
              <div
                className={`overflow-visible transition-all duration-300 ease-in-out ${
                  aiShowcaseOpen ? 'max-h-[1000px] opacity-100' : 'max-h-32 opacity-60 md:max-h-4 md:opacity-100 group-hover:md:max-h-8'
                }`}
                style={{ overflow: aiShowcaseOpen ? 'visible' : 'hidden' }}
              >
                <div className="px-8 pb-8 pt-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {AI_USAGE_LEVELS.map((level) => {
                      const Icon = level.icon;
                      return (
                        <div key={level.value} className="flex flex-col items-center text-center group">
                          <div className="relative mb-3">
                            <AISticker value={level.value} size={80} />
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {/* <Icon className="w-4 h-4 text-white/70" /> */}
                            <h4 className="text-sm font-bold text-white">{level.label}</h4>
                          </div>
                          <p className={`text-xs text-space-secondary leading-relaxed ${aiShowcaseOpen ? 'block' : 'hidden md:block'}`}>
                            {level.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              AIUsed={project.AIUsed}
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
        
        @keyframes bounce-arrow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-bounce-arrow {
          animation: bounce-arrow 0.6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}