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
          {/* the floating back-to-top pill (ScrollTop) docks onto this one */}
          <div id="footer-top" className="s-nav">
            <button
              type="button"
              onClick={() => dive(() => window.scrollTo(0, 0), { dir: 'down' })}
              className="s-nav-item s-top-item s-top-wide h-swap-host"
            >
              <ArrowUp size={18} weight="bold" className="s-icon" />
              <span className="h-swap">
                <span>Back to top</span>
                <span className="h-serif text-[1.1rem] leading-[1.05]" aria-hidden="true">Back to top</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
  );
};
