import { useState } from 'react';
import { ArrowUpRight, Plus } from '@phosphor-icons/react';
import { AI_LEVELS } from '@/config/aiLevels';
import { AITag } from '@/components/home/AITag';

// Closed by default: a title row between two rules, like the rest of the
// site. Opening it drops down the six levels in a 3x2 grid.
export const AIUsedShowcase = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="ai-drop" data-open={open}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="ai-levels"
        className="ai-drop-head"
      >
        <span className="min-w-0">
          <span className="block h-display text-[clamp(2.4rem,5.5vw,4.2rem)] ai-drop-title">How I use AI</span>
          <span className="block mt-4 max-w-2xl text-lg md:text-xl text-[var(--h-c3)] leading-relaxed">
            Every project is tagged with how much AI went into it. I track it so I keep learning new skills, not just work faster.
          </span>
        </span>
        <span className="ai-drop-toggle" aria-hidden="true">
          <Plus size={20} weight="bold" />
        </span>
      </button>

      <div id="ai-levels" className="ai-drop-body">
        <div className="overflow-hidden">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10 pt-2 pb-10">
            {AI_LEVELS.map((level, i) => (
              <li key={level.value} className="ai-drop-item" style={{ transitionDelay: open ? `${60 + i * 50}ms` : '0ms' }}>
                <AITag value={level.value} />
                <h3 className="mt-3 text-lg font-bold text-white">{level.label}</h3>
                <p className="mt-1 leading-relaxed text-[var(--h-c3)]">{level.description}</p>
              </li>
            ))}
          </ul>
          <a
            href="https://www.media.mit.edu/projects/your-brain-on-chatgpt/overview/"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-9 inline-flex items-center gap-1 text-[var(--h-c2)] underline underline-offset-4 hover:text-white"
          >
            Your Brain on ChatGPT <ArrowUpRight size={14} weight="bold" />
          </a>
        </div>
      </div>
    </div>
  );
};
