import { ArrowUp, ArrowUpRight } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TOP_RUN, useDiveScroll } from '@/lib/diveScroll';
import { SOCIALS, isExternal } from './links';
import { ElementSwitch } from './ElementSwitch';

export const SiteFooter = () => {
  const scrollTo = useDiveScroll();
  const navigate = useNavigate();
  // project pages wear the project's colours, so the element picker has nothing to do there
  const onProject = useLocation().pathname.startsWith('/project/');
  // back at the top, the address drops any #section (e.g. /#projects -> /)
  const toTop = () => scrollTo(() => 0, { dir: 'down' }, {
    ...TOP_RUN,
    onSwap: () => { if (window.location.hash) navigate(window.location.pathname + window.location.search, { replace: true }); },
  });
  return (
  <footer className="relative mt-28">
    <div className="container mx-auto px-5 sm:px-8">
      <div className="py-8 border-t-[1.5px] border-[rgb(var(--h-c2-rgb)/0.25)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-3">
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
        {!onProject && <ElementSwitch />}
        </div>
        <div className="flex items-center justify-between lg:justify-end gap-6 text-sm text-[var(--h-c2)] whitespace-nowrap">
          <span>© {new Date().getFullYear()} Lox</span>
          {/* the floating back-to-top pill (ScrollTop) docks onto this one */}
          <div id="footer-top" className="s-nav">
            <button
              type="button"
              onClick={toTop}
              className="s-nav-item s-top-item s-top-wide h-swap-host"
            >
              <ArrowUp size={18} weight="bold" className="s-icon" />
              <span className="h-swap">
                <span>Back to top</span>
                <span className="h-serif text-[1.1rem] leading-[1.05]" aria-hidden="true">Resurface</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
  );
};
