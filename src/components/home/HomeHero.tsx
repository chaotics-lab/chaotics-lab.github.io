import { ArrowDown } from '@phosphor-icons/react';
import { useDiveScroll } from '@/lib/diveScroll';
import { HeroWaves } from './HeroWaves';

export const HomeHero = () => {
  const scrollTo = useDiveScroll();

  return (
    <section className="relative min-h-[88svh] overflow-hidden flex items-center pt-28 pb-44">
      {/* soft light from the surface */}
      <div
        className="absolute -top-[30vh] -right-[20vw] w-[80vw] h-[80vh] pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, rgb(var(--h-c2-rgb) / 0.35), transparent)' }}
        aria-hidden="true"
      />
      <HeroWaves />

      <div className="container mx-auto px-5 sm:px-8 relative">
        <h1 className="h-display text-[clamp(4.6rem,15vw,14rem)]">
          <span className="h-line"><span style={{ animationDelay: '100ms' }}>Hey, I'm</span></span>
          <span className="h-line"><span className="text-[var(--h-c1)]" style={{ animationDelay: '200ms' }}>Lox.</span></span>
        </h1>

        <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="h-serif text-3xl md:text-4xl text-[var(--h-c3)]">
              <span className="h-line"><span style={{ animationDelay: '320ms' }}>Welcome to my project portfolio :)</span></span>
            </p>
          </div>
          <a
            href="#projects"
            onClick={e => {
              e.preventDefault();
              scrollTo(() => {
                const el = document.getElementById('projects');
                return el ? el.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(el).scrollMarginTop || '0') : window.scrollY;
              });
            }}
            className="h-btn h-btn-line h-swap-host self-start md:self-auto"
          >
            <span className="h-swap">
              <span>Projects</span>
              <span className="h-serif text-[1.1rem] leading-[1.05]" aria-hidden="true">Projects</span>
            </span>
            <ArrowDown size={16} weight="bold" className="h-bob" />
          </a>
        </div>
      </div>
    </section>
  );
};
