import { useState, useEffect } from 'react';
import { Mail, Grid2X2, Github, Linkedin, Menu, ScrollText } from 'lucide-react';

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

  // Close menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setMenuOpen(false);
    }
  }, [isMobile]);

  // Apply blur to page content when menu opens
  useEffect(() => {
    const mainContent = document.querySelector('main') || document.querySelector('#root > *:not(header)');
    
    if (mainContent) {
      mainContent.style.transition = 'filter 0.5s ease-in-out';
    }
    
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      if (mainContent) {
        requestAnimationFrame(() => {
          mainContent.style.filter = 'blur(8px)';
        });
      }
    } else {
      document.body.style.overflow = '';
      if (mainContent) {
        mainContent.style.filter = 'blur(0px)';
      }
    }
    
    return () => {
      document.body.style.overflow = '';
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
    { name: 'Resume', icon: ScrollText, url: '/files/Leopold_Rombaut_Resume.pdf' },
  ];

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-starfield/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <a href="#" className="flex items-center relative z-50">
              <img
                src="/img/logos/Chaotics White Transparent.png"
                alt="Chaotics"
                className="h-8 w-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300"
              />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {links.map((link) => {
                const IconComponent = link.icon;
                const isExternal = link.url.startsWith('http');
                
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="group relative flex items-center gap-2 px-4 py-2 text-sm font-mono overflow-visible rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                    title={link.name}
                  >
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/25" />
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                      }}
                    />
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                      style={{
                        boxShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.15)',
                      }}
                    />
                    <IconComponent className="relative w-4 h-4 text-space-muted group-hover:text-white transition-colors duration-300" />
                    <span className="relative text-space-muted group-hover:text-white transition-colors duration-300">
                      {link.name}
                    </span>
                  </a>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden relative z-50 p-2 rounded-xl group overflow-visible"
              aria-label="Toggle menu"
            >
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/25" />
              <div className="relative">
                {menuOpen ? (
                  <X className="w-6 h-6 text-white transition-colors duration-300" />
                ) : (
                  <Menu className="w-6 h-6 text-space-muted group-hover:text-white transition-colors duration-300" />
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Full screen with stars and blur */}
      {isMobile && (
        <div 
          className={`fixed inset-0 z-40 backdrop-blur-md transition-all duration-500 ease-out ${
            menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            transitionProperty: 'opacity, backdrop-filter',
          }}
        >
          {/* Starfield Background */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="stars-small"></div>
              <div className="stars-medium"></div>
              <div className="stars-large"></div>
            </div>
          </div>

          {/* Menu Items Container */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            onClick={() => setMenuOpen(false)}
          >
            <nav 
              className="flex flex-col gap-4 px-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {links.map((link, index) => {
                const IconComponent = link.icon;
                const isExternal = link.url.startsWith('http');
                const delay = index * 80 + 150;
                
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    onClick={handleLinkClick}
                    className="group relative flex items-center gap-4 px-6 py-4 text-lg font-mono rounded-2xl transition-transform duration-300 hover:scale-105 transform-gpu"
                    style={{
                      opacity: menuOpen ? 1 : 0,
                      transform: menuOpen ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                      transition: menuOpen 
                        ? `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
                        : 'opacity 0.3s ease-in, transform 0.3s ease-in',
                      willChange: 'opacity, transform',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Glass morphism background */}
                    <div 
                      className="absolute inset-0 backdrop-blur-md border rounded-2xl transition-all duration-500 transform-gpu"
                      style={{
                        backgroundColor: menuOpen ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0)',
                        borderColor: menuOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0)',
                        transitionDelay: menuOpen ? `${delay}ms` : '0ms',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    />
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
                      }}
                    />
                    
                    {/* Content */}
                    <IconComponent className="relative w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
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

      {/* Starfield Animation Styles */}
      <style jsx>{`
        @keyframes animateStars {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-2000px);
          }
        }

        .stars-small,
        .stars-medium,
        .stars-large {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 200%;
          background-repeat: repeat;
        }

        .stars-small {
          background-image: 
            radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 60px 70px, rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 50px 50px, rgba(255, 255, 255, 0.9), rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 90px 10px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 150px 120px, rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 180px 40px, rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0));
          background-size: 200px 200px;
          animation: animateStars 50s linear infinite;
        }

        .stars-medium {
          background-image:
            radial-gradient(3px 3px at 100px 50px, rgba(255, 255, 255, 0.9), rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 150px 150px, rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0)),
            radial-gradient(3px 3px at 50px 100px, rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 200px 80px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0));
          background-size: 250px 250px;
          animation: animateStars 80s linear infinite;
        }

        .stars-large {
          background-image:
            radial-gradient(4px 4px at 75px 125px, rgba(255, 255, 255, 1), rgba(0, 0, 0, 0)),
            radial-gradient(3px 3px at 175px 75px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
            radial-gradient(4px 4px at 120px 180px, rgba(255, 255, 255, 0.9), rgba(0, 0, 0, 0));
          background-size: 300px 300px;
          animation: animateStars 120s linear infinite;
        }
      `}</style>
    </>
  );
};