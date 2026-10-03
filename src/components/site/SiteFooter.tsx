import { ArrowUp, ArrowUpRight } from '@phosphor-icons/react';
import { usePageTransition } from '@/lib/pageTransition';
import { SOCIALS, isExternal } from './links';

export const SiteFooter = () => {
  const { dive } = usePageTransition();
  return (
  <footer className="relative mt-28">
    <div className="container mx-auto px-5 sm:px-8">
      <div className="py-8 border-t-[1.5px] border-[var(--h-c2)]/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <nav className="flex flex-wrap gap-3" aria-label="Contact">
          {SOCIALS.map(({ name, url, icon: Icon }) => (
            <a
              key={name}
              href={url}
              target={isExternal(url) ? '_blank' : undefined}
              rel={isExternal(url) ? 'noopener noreferrer' : undefined}
              className="h-btn h-btn-line h-swap-host"
            >
              <Icon size={18} weight="duotone" className="s-icon" />
              <span className="h-swap">
                <span>{name}</span>
                <span className="h-serif text-[1.1rem] leading-[1.05]" aria-hidden="true">{name}</span>
              </span>
              <ArrowUpRight size={14} weight="bold" />
            </a>
          ))}
        </nav>
        <div className="flex items-center justify-between md:justify-end gap-6 text-sm text-[var(--h-c2)]">
          <span>© {new Date().getFullYear()} Lox</span>
          <button
            type="button"
            onClick={() => dive(() => window.scrollTo(0, 0))}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            Back to top <ArrowUp size={14} weight="bold" className="h-bob-up" />
          </button>
        </div>
      </div>
    </div>
  </footer>
  );
};
