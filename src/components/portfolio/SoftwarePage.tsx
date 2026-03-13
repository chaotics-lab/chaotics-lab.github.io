import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowUp, ExternalLink, Github, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AISticker } from "@/components/AISticker";

const SoftwarePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [frameCount, setFrameCount] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHovering, setIsHovering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenAnimating, setIsFullscreenAnimating] = useState(false);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Generate unique glow positions for each section
  const glowPositions = useMemo(() => ({
    hero: ["top left", "top right", "bottom left", "bottom right", "center"][
      Math.floor(Math.random() * 5)
    ],
    logo: ["top left", "top right", "bottom left", "bottom right", "center"][
      Math.floor(Math.random() * 5)
    ],
    markdown: ["top left", "top right", "bottom left", "bottom right", "center"][
      Math.floor(Math.random() * 5)
    ],
    carousel: ["top left", "top right", "bottom left", "bottom right", "center"][
      Math.floor(Math.random() * 5)
    ],
  }), [projectId]);

  // --- responsive handling ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- load project data ---
  useEffect(() => {
    if (!projectId) return;
    const modules = import.meta.glob("../../resources/projects/*.json", { eager: true });
    const projects = Object.values(modules).map((m) => (m as any).default || m);
    setProject(projects.find((p) => p.id === projectId) || null);
    setLoaded(true);
    
    window.scrollTo(0, 0);
  }, [projectId]);

  // --- count frames in carousel ---
  useEffect(() => {
    if (!project?.imageUrl) return;
    let count = 1;
    const checkFrame = () => {
      const img = new Image();
      img.src = `${project.imageUrl}/${count}.png`;
      img.onload = () => {
        count++;
        checkFrame();
      };
      img.onerror = () => setFrameCount(count - 1);
    };
    checkFrame();
  }, [project?.imageUrl]);

  // --- auto rotate carousel ---
  useEffect(() => {
    if (frameCount <= 1 || isPaused || isHovering || isFullscreen) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev >= frameCount - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [frameCount, isPaused, isHovering, isFullscreen]);

  // --- mobile scroll to top button ---
  useEffect(() => {
    if (!isMobile) return;
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  // --- prevent body scroll when fullscreen ---
  useEffect(() => {
    if (isFullscreen || isFullscreenAnimating) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen, isFullscreenAnimating]);

  // --- keyboard navigation for fullscreen ---
  useEffect(() => {
    if (!isFullscreen && !isFullscreenAnimating) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeFullscreen();
      } else if (isFullscreen && e.key === 'ArrowLeft' && currentFrame > 0) {
        setCurrentFrame(prev => prev - 1);
      } else if (isFullscreen && e.key === 'ArrowRight' && currentFrame < frameCount - 1) {
        setCurrentFrame(prev => prev + 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isFullscreenAnimating, currentFrame, frameCount]);

  const handlePrevFrame = () => {
    if (currentFrame === 0) return;
    if (isMobile) {
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000);
    }
    setCurrentFrame((prev) => prev - 1);
  };
  
  const handleNextFrame = () => {
    if (currentFrame >= frameCount - 1) return;
    if (isMobile) {
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000);
    }
    setCurrentFrame((prev) => prev + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50 && currentFrame < frameCount - 1) {
      setIsPaused(true);
      setCurrentFrame((prev) => prev + 1);
      setTimeout(() => setIsPaused(false), 5000);
    }
    if (diff < -50 && currentFrame > 0) {
      setIsPaused(true);
      setCurrentFrame((prev) => prev - 1);
      setTimeout(() => setIsPaused(false), 5000);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const hexToRgba = (hex: string = "#191970", alpha = 0.4) => {
    const r = parseInt(hex.slice(1, 3), 16) || 25;
    const g = parseInt(hex.slice(3, 5), 16) || 25;
    const b = parseInt(hex.slice(5, 7), 16) || 112;
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const openFullscreen = () => {
    if (!isMobile) {
      setIsFullscreenAnimating(true);
      setTimeout(() => {
        setIsFullscreen(true);
      }, 300); // Half of the fade duration
    } else {
      setIsFullscreen(true);
    }
  };

  const closeFullscreen = () => {
    if (!isMobile) {
      setIsFullscreen(false);
      setTimeout(() => {
        setIsFullscreenAnimating(false);
      }, 500); // Full fade duration
    } else {
      setIsFullscreen(false);
    }
  };

  if (!loaded)
    return (
    <div className="min-h-screen flex items-center justify-center text-white bg-background starfield">
    <div className="animate-pulse text-space-muted font-ui">Loading...</div>
    </div>
    );

  if (!project)
    return (
      <div className="bg-background starfield min-h-screen">
        <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <p className="text-space-muted font-mono text-sm uppercase tracking-widest mb-4">404</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Project not found</h1>
          <p className="text-space-muted font-ui text-base max-w-md mb-10">
            There's no project with the id "{projectId}".
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-ui hover:bg-white/10 hover:border-white/25 transition-all duration-200"
          >
            Back to home
          </a>
        </main>
      </div>
  );

  const date = project.date ? new Date(project.date) : null;
  const themeColor = project.themeColor || project.themeColors?.[0] || "#8888ff";
  const secondaryColor = project.themeColors?.[1] || null;

  return (
    <div className="relative w-full text-white flex flex-col overflow-hidden min-h-screen bg-starfield">
      {/* Starfield */}
        <div
          className="fixed inset-0 -z-10 starfield"
          style={
            { "--deep-space-color": hexToRgba(secondaryColor || themeColor) } as React.CSSProperties
          }
        />

      <style>{`
        @keyframes softPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.3); }
        }

        @keyframes rotatePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }

        .markdown-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.3) rgba(25,25,112,0.2);
        }
        .markdown-scroll:hover {
          scrollbar-color: rgba(255,255,255,0.5) rgba(25,25,112,0.2);
        }
        .markdown-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .markdown-scroll::-webkit-scrollbar-track {
          background: rgba(25,25,112,0.2);
          border-radius: 9999px;
        }
        .markdown-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 9999px;
        }
        .markdown-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.5);
        }
      `}</style>

      {/* Fullscreen Image Viewer */}
      {(isFullscreen || isFullscreenAnimating) && (
        <div 
          className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
            isFullscreen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeFullscreen}
          style={{
            backgroundColor: 'black',
          }}
        >
          {/* Close button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-[110] bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/20"
          >
            <X size={24} />
          </button>

          {/* Image container */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image carousel */}
            <div className="relative w-full h-full max-w-7xl max-h-full flex items-center justify-center">
              <img
                src={`${project.imageUrl}/${currentFrame + 1}.png`}
                alt={`Frame ${currentFrame + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Navigation arrows */}
              {frameCount > 1 && (
                <>
                  {currentFrame > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevFrame();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 md:p-4 rounded-full transition-all z-[105]"
                    >
                      <ArrowLeft size={24} />
                    </button>
                  )}
                  {currentFrame < frameCount - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextFrame();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 md:p-4 rounded-full transition-all z-[105]"
                    >
                      <ArrowLeft size={24} className="rotate-180" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Dots indicator */}
            {frameCount > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-[105]">
                {Array.from({ length: frameCount }, (_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentFrame(i);
                      setIsPaused(true);
                      setTimeout(() => setIsPaused(false), 5000);
                    }}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: i === currentFrame ? '32px' : '8px',
                      backgroundColor: i === currentFrame 
                        ? 'white'
                        : 'rgba(255, 255, 255, 0.5)',
                      boxShadow: i === currentFrame ? `0 0 12px rgba(255, 255, 255, 0.8)` : 'none',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- main content --- */}
      <div className={`relative z-10 container mx-auto py-4 md:py-8 px-4 flex flex-col gap-4 ${isMobile ? '' : 'h-screen overflow-hidden'}`}>
        {/* Back Button */}
        <Link to="/" className="shrink-0">
          <button className="group relative flex items-center gap-2 px-4 py-2 text-sm font-ui overflow-visible rounded-xl transition-all duration-300 hover:-translate-y-0.5">
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
            <ArrowLeft className="relative w-4 h-4 text-space-muted group-hover:text-white transition-colors duration-300" />
            <span className="relative text-space-muted group-hover:text-white transition-colors duration-300">
              Back
            </span>
          </button>
        </Link>

        {/* --- HERO --- */}
        <div className={`flex flex-col md:flex-row gap-4 ${isMobile ? '' : 'md:h-[25%] md:min-h-[180px] md:max-h-[200px] shrink-0'}`}>
          {/* Hero Content - flex: 2 */}
          <div 
            className="relative p-6 rounded-2xl shadow-2xl border-2 overflow-hidden flex flex-col flex-1 md:flex-[2]"
            style={{ 
              borderColor: secondaryColor ? `${themeColor}50` : `${themeColor}30`,
              backgroundColor: `${themeColor}10`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03), 0 0 20px ${themeColor}20`,
            }}
          >
            {/* Liquid glass highlight */}
            <div className="absolute inset-0 pointer-events-none z-0" style={{
              background: 'linear-gradient(165deg, rgba(255,255,255,0.07) 0%, transparent 35%, transparent 75%, rgba(255,255,255,0.03) 100%)',
            }} />
            {/* Static glow - no blur for performance */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: secondaryColor
                  ? `radial-gradient(ellipse 100% 80% at ${glowPositions.hero}, ${hexToRgba(themeColor, 0.10)} 0%, ${hexToRgba(themeColor, 0.02)} 40%, transparent 70%), radial-gradient(ellipse 90% 70% at ${glowPositions.hero === 'top left' ? 'bottom right' : glowPositions.hero === 'top right' ? 'bottom left' : 'top left'}, ${hexToRgba(secondaryColor, 0.08)} 0%, transparent 50%)`
                  : `radial-gradient(ellipse 100% 80% at ${glowPositions.hero}, ${hexToRgba(themeColor, 0.10)} 0%, ${hexToRgba(themeColor, 0.02)} 40%, transparent 70%)`,
              }}
            />
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Title Row */}
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                <h1
                  className="text-3xl md:text-4xl font-display font-bold flex-1 min-w-0"
                  style={{ color: project.titleColor }}
                >
                  {project.title}
                </h1>
                {date && (
                  <div className="text-sm text-white/70 font-ui font-medium tracking-wide shrink-0">
                    {date.toLocaleString("default", { month: "long" })} {date.getFullYear()}
                  </div>
                )}
                {project.type && (
                  <Badge
                    variant="outline"
                    className="font-ui text-xs md:text-sm bg-white/10 border-white/20 shrink-0"
                  >
                    {project.type}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-base md:text-lg text-space-secondary mb-4">
                  {project.description}
                </p>
              )}

              {/* Links */}
              <div className="flex gap-3 flex-wrap mt-auto">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <button className="group relative flex items-center gap-2 px-4 py-2 text-sm font-ui overflow-visible rounded-xl transition-all duration-300 hover:-translate-y-0.5">
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl transition-all duration-300 group-hover:bg-white/5 group-hover:border-white/10" />
                      <div className="absolute inset-0 rounded-xl opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                        }}
                      />
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
                      <Github className="relative w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-300" />
                      <span className="relative text-gray-300 group-hover:text-white transition-colors duration-300">
                        GitHub
                      </span>
                    </button>
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <button className="group relative flex items-center gap-2 px-4 py-2 text-sm font-ui overflow-visible rounded-xl transition-all duration-300 hover:-translate-y-0.5">
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl transition-all duration-300 group-hover:bg-white/5 group-hover:border-white/10" />
                      <div className="absolute inset-0 rounded-xl opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                        }}
                      />
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
                      <ExternalLink className="relative w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-300" />
                      <span className="relative text-gray-300 group-hover:text-white transition-colors duration-300">
                        Link
                      </span>
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Logo - aspect-square, shrink-0 (desktop only) */}
          {project.logoUrl && (
            <div className="hidden md:block shrink-0 max-w-[200px]">
              <div
                className="relative rounded-2xl shadow-2xl border-2 overflow-hidden h-full aspect-square"
                style={{ 
                  borderColor: secondaryColor ? `${themeColor}50` : `${themeColor}30`,  
                  backgroundColor: `${themeColor}10`, 
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03), 0 0 20px ${themeColor}20`,
                }}
              >
                {/* Liquid glass highlight */}
                <div className="absolute inset-0 pointer-events-none z-0" style={{
                  background: 'linear-gradient(165deg, rgba(255,255,255,0.07) 0%, transparent 35%, transparent 75%, rgba(255,255,255,0.03) 100%)',
                }} />
                {/* Static glow - no blur for performance */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: secondaryColor
                      ? `radial-gradient(ellipse 100% 80% at ${glowPositions.logo}, ${hexToRgba(themeColor, 0.10)} 0%, ${hexToRgba(themeColor, 0.02)} 40%, transparent 70%), radial-gradient(ellipse 90% 70% at ${glowPositions.logo === 'top left' ? 'bottom right' : glowPositions.logo === 'top right' ? 'bottom left' : 'top left'}, ${hexToRgba(secondaryColor, 0.08)} 0%, transparent 50%)`
                      : `radial-gradient(ellipse 100% 80% at ${glowPositions.logo}, ${hexToRgba(themeColor, 0.10)} 0%, ${hexToRgba(themeColor, 0.02)} 40%, transparent 70%)`,
                  }}
                />
                
                <div className="relative flex items-center justify-center h-full w-full p-8 z-10">
                  <img
                    src={project.logoUrl}
                    alt={`${project.title} logo`}
                    className="max-w-full max-h-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- BOTTOM SECTION --- */}
        {!isMobile ? (
          /* --- DESKTOP: 2-column grid --- */
          <div className="relative grid grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
            {/* Markdown (scrollable) */}
            {project.markdown && (
              <div className="relative rounded-2xl shadow-2xl border-2 overflow-hidden h-full"
                style={{ 
                  borderColor: secondaryColor ? `${themeColor}50` : `${themeColor}30`,
                  backgroundColor: `${themeColor}10`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03), 0 0 20px ${themeColor}20`,
                }}>

                {/* Liquid glass highlight */}
                <div className="absolute inset-0 pointer-events-none z-0 rounded-2xl" style={{
                  background: 'linear-gradient(165deg, rgba(255,255,255,0.07) 0%, transparent 35%, transparent 75%, rgba(255,255,255,0.03) 100%)',
                }} />
                
                {/* Static glow - no blur for performance */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: secondaryColor
                      ? `radial-gradient(ellipse 100% 80% at ${glowPositions.markdown}, ${hexToRgba(themeColor, 0.10)} 0%, ${hexToRgba(themeColor, 0.02)} 40%, transparent 70%), radial-gradient(ellipse 90% 70% at ${glowPositions.markdown === 'top left' ? 'bottom right' : glowPositions.markdown === 'top right' ? 'bottom left' : 'top left'}, ${hexToRgba(secondaryColor, 0.08)} 0%, transparent 50%)`
                      : `radial-gradient(ellipse 100% 80% at ${glowPositions.markdown}, ${hexToRgba(themeColor, 0.10)} 0%, ${hexToRgba(themeColor, 0.02)} 40%, transparent 70%)`,
                  }}
                />
                
                <div
                  className="markdown-section markdown-scroll p-6 overflow-y-auto h-full relative z-10"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.markdown}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Carousel + tags column */}
            <div className="flex flex-col gap-3 min-h-0">
              {/* Carousel - 16:9 aspect ratio */}
              <div
                className="relative w-full flex-shrink-0 cursor-pointer"
                style={{ paddingTop: "56.25%" }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={openFullscreen}
              >
                <div className="absolute inset-0 overflow-hidden rounded-2xl border-2"
                  style={{ 
                    borderColor: secondaryColor ? `${themeColor}50` : `${themeColor}30`,
                    backgroundColor: `${themeColor}10`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03), 0 0 20px ${themeColor}20`,
                  }}>
                  {/* Liquid glass highlight */}
                  <div className="absolute inset-0 pointer-events-none z-0" style={{
                    background: 'linear-gradient(165deg, rgba(255,255,255,0.07) 0%, transparent 35%, transparent 75%, rgba(255,255,255,0.03) 100%)',
                  }} />
                  {/* Static glow - no blur for performance */}
                  <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                      background: secondaryColor
                        ? `radial-gradient(ellipse 100% 80% at ${glowPositions.carousel}, ${hexToRgba(themeColor, 0.10)} 0%, ${hexToRgba(themeColor, 0.02)} 40%, transparent 70%), radial-gradient(ellipse 90% 70% at ${glowPositions.carousel === 'top left' ? 'bottom right' : glowPositions.carousel === 'top right' ? 'bottom left' : 'top left'}, ${hexToRgba(secondaryColor, 0.08)} 0%, transparent 50%)`
                        : `radial-gradient(ellipse 100% 80% at ${glowPositions.carousel}, ${hexToRgba(themeColor, 0.10)} 0%, ${hexToRgba(themeColor, 0.02)} 40%, transparent 70%)`,
                    }}
                  />
                  
                  <div
                    className="flex h-full transition-transform duration-700 ease-in-out relative z-10"
                    style={{
                      width: `${frameCount * 100}%`,
                      transform: `translateX(-${(currentFrame * 100) / frameCount}%)`,
                    }}
                  >
                    {Array.from({ length: frameCount }, (_, i) => (
                      <img
                        key={i}
                        src={`${project.imageUrl}/${i + 1}.png`}
                        alt={`Frame ${i + 1}`}
                        loading={i === 0 ? "eager" : "lazy"}
                        className="w-full h-full object-cover object-center"
                      />
                    ))}
                  </div>

                  {/* Arrows */}
                  {frameCount > 1 && isHovering && (
                    <>
                      {currentFrame > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevFrame();
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-20"
                        >
                          <ArrowLeft size={20} />
                        </button>
                      )}
                      {currentFrame < frameCount - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextFrame();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-20"
                        >
                          <ArrowLeft size={20} className="rotate-180" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Dots */}
              {frameCount > 1 && (
                <div className="flex justify-center gap-2 flex-shrink-0">
                  {Array.from({ length: frameCount }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentFrame(i);
                        setIsPaused(true);
                        setTimeout(() => setIsPaused(false), 5000);
                      }}
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: i === currentFrame ? '24px' : '8px',
                        backgroundColor: i === currentFrame 
                          ? `color-mix(in srgb, white 90%, ${themeColor} 10%)`
                          : 'rgba(255, 255, 255, 0.4)',
                        boxShadow: i === currentFrame ? `0 0 8px rgba(255, 255, 255, 0.5)` : 'none',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center flex-shrink-0">
                  {project.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-white/5 text-space-muted border border-white/10 font-ui text-sm px-3 py-1.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* --- MOBILE: stacked layout --- */
          <div className="flex flex-col gap-6 pb-8">
            {/* Carousel */}
            <div 
              className="relative w-full cursor-pointer" 
              style={{ paddingTop: "56.25%" }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={openFullscreen}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl border-2"
                style={{ 
                  borderColor: secondaryColor ? `${themeColor}50` : `${themeColor}30`,
                  backgroundColor: `${themeColor}10`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03), 0 0 20px ${themeColor}20`,
                }}>
                {/* Liquid glass highlight */}
                <div className="absolute inset-0 pointer-events-none z-0" style={{
                  background: 'linear-gradient(165deg, rgba(255,255,255,0.07) 0%, transparent 35%, transparent 75%, rgba(255,255,255,0.03) 100%)',
                }} />
                {/* Static glow - no blur for performance */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: secondaryColor
                      ? `radial-gradient(ellipse 100% 80% at center, ${hexToRgba(secondaryColor, 0.10)} 0%, ${hexToRgba(secondaryColor, 0.03)} 35%, transparent 65%), radial-gradient(ellipse 90% 70% at bottom right, ${hexToRgba(themeColor, 0.08)} 0%, transparent 50%)`
                      : `radial-gradient(ellipse 100% 80% at center, ${hexToRgba(themeColor, 0.10)} 0%, ${hexToRgba(themeColor, 0.02)} 40%, transparent 70%)`,
                  }}
                />
                
                <div
                  className="flex h-full transition-transform duration-700 ease-in-out relative z-10"
                  style={{
                    width: `${frameCount * 100}%`,
                    transform: `translateX(-${(currentFrame * 100) / frameCount}%)`,
                  }}
                >
                  {Array.from({ length: frameCount }, (_, i) => (
                    <img
                      key={i}
                      src={`${project.imageUrl}/${i + 1}.png`}
                      alt={`Frame ${i + 1}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="w-full h-full object-cover object-center"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Dots */}
            {frameCount > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: frameCount }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentFrame(i);
                      setIsPaused(true);
                      setTimeout(() => setIsPaused(false), 5000);
                    }}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: i === currentFrame ? '24px' : '8px',
                      backgroundColor: i === currentFrame 
                        ? `color-mix(in srgb, white 90%, ${themeColor} 10%)`
                        : 'rgba(255, 255, 255, 0.4)',
                      boxShadow: i === currentFrame ? `0 0 8px rgba(255, 255, 255, 0.5)` : 'none',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {project.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-white/5 text-white border border-white/20 font-ui text-sm px-2 py-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Markdown */}
            {project.markdown && (
              <div className="relative rounded-2xl shadow-2xl border-2 overflow-hidden"
                style={{
                  borderColor: secondaryColor ? `${themeColor}50` : `${themeColor}30`,
                  backgroundColor: `${themeColor}10`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03), 0 0 20px ${themeColor}20`,
                }}>
                {/* Liquid glass highlight */}
                <div className="absolute inset-0 pointer-events-none z-0 rounded-2xl" style={{
                  background: 'linear-gradient(165deg, rgba(255,255,255,0.07) 0%, transparent 35%, transparent 75%, rgba(255,255,255,0.03) 100%)',
                }} />
                {/* Static glow - no blur for performance */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: secondaryColor
                      ? `radial-gradient(ellipse 100% 80% at center, ${hexToRgba(themeColor, 0.10)} 0%, ${hexToRgba(themeColor, 0.02)} 40%, transparent 70%), radial-gradient(ellipse 90% 70% at bottom right, ${hexToRgba(secondaryColor, 0.08)} 0%, transparent 50%)`
                      : `radial-gradient(ellipse 100% 80% at center, ${hexToRgba(themeColor, 0.10)} 0%, ${hexToRgba(themeColor, 0.02)} 40%, transparent 70%)`,
                  }}
                />
                
                <div className="markdown-section p-6 h-full overflow-y-auto relative z-10">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.markdown}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating scroll-to-top for mobile */}
      {isMobile && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 rounded-full p-3 shadow-lg z-50 transition-all duration-300 ease-in-out ${
            showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
          }`}
          style={{
            backgroundColor: `${themeColor}80`,
            boxShadow: `0 0 20px ${themeColor}60${secondaryColor ? `, 0 0 30px ${secondaryColor}30` : ''}`,
          }}
        >
          <ArrowUp size={20} color="white" />
        </button>
      )}
    </div>
  );
};

export default SoftwarePage;