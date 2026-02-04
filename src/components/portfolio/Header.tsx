import { useState, useEffect } from 'react';
import { Mail, Grid2X2, Github, Linkedin, Menu, X } from 'lucide-react';

// Detect Firefox Mobile
const isFirefoxMobile = typeof navigator !== 'undefined' && /Android.*Firefox/i.test(navigator.userAgent);

export const Header = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const mainContent =
      document.querySelector('main') ||
      document.querySelector('#root > *:not(header)');

    if (mainContent) mainContent.style.transition = 'filter 0.4s ease';

    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
      if (mainContent) requestAnimationFrame(() => { mainContent.style.filter = 'blur(8px)'; });
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflowX = '';
      if (mainContent) mainContent.style.filter = 'blur(0px)';
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

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-starfield/95 backdrop-blur-md border-b border-white/10">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <a href="#" className="flex items-center">
              <img
                src="/img/logos/Chaotics White Transparent.png"
                alt="Chaotics"
                className="h-8 w-auto"
              />
            </a>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden md:flex items-center gap-2 overflow-hidden">
              {links.map((link) => {
                const Icon = link.icon;
                const isExternal = link.url.startsWith('http');

                return (
                  <div key={link.name} className="relative overflow-hidden rounded-xl">
                    <a
                      href={link.url}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="group relative flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-xl transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      {/* Glass background */}
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl transition-colors duration-300 group-hover:bg-white/10 group-hover:border-white/25" />
                      {/* Radial glow */}
                      <div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                        }}
                      />
                      {/* Outer glow */}
                      <div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          boxShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.15)',
                        }}
                      />
                      <Icon className="relative w-4 h-4 text-space-muted group-hover:text-white transition-colors duration-300" />
                      <span className="relative text-space-muted group-hover:text-white transition-colors duration-300">
                        {link.name}
                      </span>
                    </a>
                  </div>
                );
              })}
            </nav>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden relative p-2 rounded-xl overflow-hidden"
              aria-label="Toggle menu"
            >
              <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl" />
              {menuOpen ? <X className="relative w-6 h-6 text-white" /> : <Menu className="relative w-6 h-6 text-space-muted" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DROPDOWN OVERLAY */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-40 backdrop-blur-md ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          style={{
            transition: 'opacity 0.3s ease',
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
                const delay = index * 70 + 100;

                return (
                  <a
                    key={link.name}
                    href={link.url}
                    onClick={() => setMenuOpen(false)}
                    className="relative flex items-center gap-4 px-6 py-4 text-lg font-mono rounded-2xl"
                    style={{
                      opacity: menuOpen ? 1 : 0,
                      // Disable transform and scaling for Firefox Mobile
                      transform: isFirefoxMobile ? 'translateY(0)' : menuOpen ? 'translateY(0)' : 'translateY(24px)',
                      transition: isFirefoxMobile
                        ? 'opacity 0.3s ease'
                        : `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/10 border border-white/20 rounded-2xl" />
                    <Icon className="relative w-6 h-6 text-white" />
                    <span className="relative text-white">{link.name}</span>
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