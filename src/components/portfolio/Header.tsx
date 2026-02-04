import { useState, useEffect } from 'react';
import { Mail, Grid2X2, Github, Linkedin, Menu, X } from 'lucide-react';

export const Header = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const mainContent =
      document.querySelector('main') ||
      document.querySelector('#root > *:not(header)');

    if (mainContent) {
      mainContent.style.transition = 'filter 0.4s ease';
    }

    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflowX = 'hidden';

      if (mainContent) {
        requestAnimationFrame(() => {
          mainContent.style.filter = 'blur(8px)';
        });
      }
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflowX = '';

      if (mainContent) {
        mainContent.style.filter = 'blur(0px)';
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflowX = '';

      if (mainContent) {
        mainContent.style.filter = '';
        mainContent.style.transition = '';
      }
    };
  }, [menuOpen]);

  const links = [
    { name: 'Portfolio', icon: Grid2X2, url: '#' },
    { name: 'GitHub', icon: Github, url: 'https://github.com/Loxed' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/in/leopold-rombaut' },
    { name: 'Mail', icon: Mail, url: 'mailto:leopold@rombaut.org' },
  ];

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-starfield/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex items-center relative z-50">
              <img
                src="/img/logos/Chaotics White Transparent.png"
                alt="Chaotics"
                className="h-8 w-auto transition-all duration-300"
              />
            </a>

            <nav className="hidden md:flex items-center gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isExternal = link.url.startsWith('http');

                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="group relative flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-xl transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl group-hover:bg-white/10 group-hover:border-white/25 transition-colors duration-300" />
                    <Icon className="relative w-4 h-4 text-space-muted group-hover:text-white transition-colors duration-300" />
                    <span className="relative text-space-muted group-hover:text-white transition-colors duration-300">
                      {link.name}
                    </span>
                  </a>
                );
              })}
            </nav>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden relative z-50 p-2 rounded-xl overflow-hidden"
              aria-label="Toggle menu"
            >
              <div
                className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                style={{
                  transition: 'background-color 0.3s ease, border-color 0.3s ease',
                }}
              />
              <div className="relative">
                {menuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-space-muted" />
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {isMobile && (
        <div
          className={`fixed inset-0 z-40 backdrop-blur-md ${
            menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            transition: 'opacity 0.35s ease',
            contain: 'layout paint',
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            onClick={() => setMenuOpen(false)}
          >
            <nav
              className="flex flex-col gap-4 px-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {links.map((link, index) => {
                const Icon = link.icon;
                const isExternal = link.url.startsWith('http');
                const delay = index * 70 + 120;

                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    onClick={handleLinkClick}
                    className="group relative flex items-center gap-4 px-6 py-4 text-lg font-mono rounded-2xl"
                    style={{
                      opacity: menuOpen ? 1 : 0,
                      transform: menuOpen ? 'translateY(0)' : 'translateY(24px)',
                      transition: menuOpen
                        ? `opacity 0.45s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
                        : 'opacity 0.25s ease, transform 0.25s ease',
                      willChange: 'opacity, transform',
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-2xl border"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderColor: 'rgba(255,255,255,0.2)',
                      }}
                    />
                    <Icon className="relative w-6 h-6 text-white" />
                    <span className="relative text-white font-medium">
                      {link.name}
                    </span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};