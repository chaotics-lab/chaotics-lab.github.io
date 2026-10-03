import { ArrowUp, ArrowUpRight } from '@phosphor-icons/react';
import { SOCIALS, isExternal } from './links';

export const SiteFooter = () => (
  <footer className="relative mt-28">
    <div className="container mx-auto px-5 sm:px-8">
      <div className="pt-12 border-t-[1.5px] border-[var(--h-c2)]/20 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <p className="h-display text-[clamp(5rem,16vw,13rem)]" aria-hidden="true">
            Lox<span className="text-[var(--h-c1)]">.</span>
          </p>
          <p className="mt-4 h-serif text-2xl md:text-3xl text-[var(--h-c3)]">Exploring new ideas and building cool things.</p>
        </div>
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
      </div>
      <div className="mt-12 py-6 border-t-[1.5px] border-[var(--h-c2)]/20 flex justify-between gap-4 text-sm text-[var(--h-c2)]">
        <span>© {new Date().getFullYear()} Lox</span>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
        >
          Back to top <ArrowUp size={14} weight="bold" />
        </button>
      </div>
    </div>
  </footer>
);
