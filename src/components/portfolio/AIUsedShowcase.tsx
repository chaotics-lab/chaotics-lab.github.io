import React, { useState } from 'react';
import { AISticker } from '@/components/AISticker';
import { ChevronDown, Code, Sparkles, Zap, Brain, Cpu, Rocket, ExternalLink } from 'lucide-react';

const AI_USAGE_LEVELS = [
  { value: 0, label: 'AI-Free', description: 'I do everything by hand. Every design decision, line of code, and debug session is mine. I learn by doing and thinking through every step, looking at the docs and on StackOverflow / Tutorials.', icon: Code },
  { value: 20, label: 'Referencing', description: 'AI is used for syntax correction, documentation generation, or clarifying concepts. I still write the entire code and make every engineering decision myself.', icon: Sparkles },
  { value: 40, label: 'Automation', description: 'AI handles boilerplate, repetitive lines, and trivial functions from detailed comments. I supervise closely and ensure everything works as intended.', icon: Zap },
  { value: 60, label: 'Collaboration', description: 'AI suggests implementation structures, design patterns, and approaches with tools like PlantUML. I decide what fits best, validate ideas, and implement the critical parts more diligently.', icon: Brain },
  { value: 80, label: 'Situational Autonomy', description: 'I let AI fully handle certain parts of the codebase, like web frontends, while I focus on key features, glue code, and core systems.', icon: Cpu },
  { value: 100, label: 'Vibe Coding', description: 'AI writes the code mostly entirely. I check only behavior, test edge cases, tweak settings and experiment mostly on personal or low-risk projects.', icon: Rocket },
];

export const AIUsedShowcase: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto mb-16">
      <div
        className={`relative backdrop-blur-xl rounded-2xl shadow-2xl border-2 transition-all duration-300 group
        ${open ? 'bg-white/5 border-white/10 md:hover:shadow-2xl' : 'bg-white/[0.02] border-white/5 md:scale-95 md:hover:scale-100 md:hover:bg-white/5 md:hover:border-white/10'}`}
      >
        {/* Background glows */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'
          }`}
          style={{
            background:
              'radial-gradient(circle at top right, rgba(138, 43, 226, 0.15) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(255, 0, 110, 0.15) 0%, transparent 50%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
          style={{
            background:
              'radial-gradient(circle at top right, rgba(138, 43, 226, 0.25) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(255, 0, 110, 0.25) 0%, transparent 50%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <button
            onClick={() => setOpen(!open)}
            className="w-full text-left px-8 pt-8 pb-4 transition-transform duration-300 md:hover:-translate-y-2.5"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 relative pr-10">
              <ChevronDown
                className={`w-6 h-6 flex-shrink-0 absolute right-0 top-0 transition-all duration-300 ${
                  open ? 'rotate-180 text-white' : 'rotate-0 text-gray-400 md:animate-bob md:group-hover:animate-bob-intense'
                }`}
              />
              <div className="hidden md:flex items-center justify-center flex-shrink-0">
                <img
                  src="/img/AI Seal of Quality.png"
                  alt="AI Seal of Quality"
                  className={`transition-all duration-300 object-contain ${
                    open ? 'h-24 md:h-32 w-auto' : 'h-12 md:h-16 w-auto grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'
                  }`}
                />
              </div>
              <div className="flex-grow relative min-w-0">
                <blockquote
                  className={`text-base md:text-xl italic border-l-4 pl-4 transition-all duration-300 ${
                    open
                      ? 'text-space-secondary border-gray-300'
                      : 'text-gray-500 border-gray-600 md:text-lg group-hover:text-space-secondary group-hover:border-gray-300 line-clamp-6 md:line-clamp-none'
                  }`}
                  style={
                    !open
                      ? {
                          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                        }
                      : undefined
                  }
                >
                  I track my AI usage to focus on learning new skills, not just coding/work efficiency.
                  Overreliance on AI can hinder metacognition and weaken learning compared to active problem solving.
                  Once I master a tool or concept, I use AI responsibly to speed up work without losing control of my critical mind.{' '}
                  <a
                    href="https://www.media.mit.edu/projects/your-brain-on-chatgpt/overview/"
                    className={`underline inline-flex items-center gap-1 transition-opacity duration-300 ${
                      open ? 'cursor-pointer' : 'pointer-events-none opacity-50'
                    }`}
                    onClick={(e) => !open && e.preventDefault()}
                    tabIndex={open ? 0 : -1}
                  >
                    Your Brain on ChatGPT <ExternalLink className="w-4 h-4" />
                  </a>
                </blockquote>
              </div>
            </div>
          </button>

          {/* Collapsible badges */}
          <div
            className={`transition-all duration-300 ease-in-out ${open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
            style={{ overflow: open ? 'visible' : 'hidden' }}
          >
            <div className="px-8 pb-8 pt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {AI_USAGE_LEVELS.map((level) => (
                <div key={level.value} className="flex flex-col items-center text-center">
                  <AISticker value={level.value} size={80} />
                  <h4 className="text-sm font-bold text-white mt-2">{level.label}</h4>
                  <p className="text-xs text-space-secondary leading-relaxed">{level.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};