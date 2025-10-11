import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp, ExternalLink, Github } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SoftwarePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [frameCount, setFrameCount] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHovering, setIsHovering] = useState(false);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
    
    // Scroll to top when page loads
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

  // --- auto rotate carousel (pauses on hover/interaction) ---
  useEffect(() => {
    if (frameCount <= 1 || isPaused || isHovering) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        // Loop back to start when reaching the end
        if (prev >= frameCount - 1) return 0;
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [frameCount, isPaused, isHovering]);

  // --- mobile scroll to top button ---
  useEffect(() => {
    if (!isMobile) return;
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  const handlePrevFrame = () => {
    if (currentFrame === 0) return; // Don't go before first frame
    if (isMobile) {
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000);
    }
    setCurrentFrame((prev) => prev - 1);
  };
  
  const handleNextFrame = () => {
    if (currentFrame >= frameCount - 1) return; // Don't go past last frame
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
      // Swipe left - next frame (only if not at last frame)
      setIsPaused(true);
      setCurrentFrame((prev) => prev + 1);
      setTimeout(() => setIsPaused(false), 5000);
    }
    if (diff < -50 && currentFrame > 0) {
      // Swipe right - previous frame (only if not at first frame)
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

  if (!project)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  const date = project.date ? new Date(project.date) : null;

  return (
    <div className="relative w-full text-white flex flex-col overflow-hidden min-h-screen">
      {/* Starfield */}
      <div
        className="fixed inset-0 -z-10 starfield"
        style={
          { "--deep-space-color": hexToRgba(project.themeColor) } as React.CSSProperties
        }
      />

      <style>{`
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

      {/* --- main content --- */}
      <div className="relative z-10 container mx-auto py-4 md:py-8 px-4 flex flex-col gap-4 md:gap-6 md:h-screen md:overflow-hidden">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="text-space-muted hover:text-space-primary flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </Button>
        </Link>

        {/* --- HERO --- */}
        <div className="md:flex md:gap-4 md:flex-shrink-0 grid grid-cols-1 gap-4">
          <div className="p-6 bg-gradient-to-br from-space-surface/80 to-space-surface/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col min-h-0 md:flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-3 flex-wrap">
              {project.logoUrl && (
                <img
                  src={project.logoUrl}
                  alt="logo"
                  className="h-12 w-12 object-contain rounded-md"
                />
              )}
              <h1
                className="text-3xl md:text-4xl font-bold flex-1 min-w-0"
                style={{ color: project.titleColor }}
              >
                {project.title}
              </h1>
              {project.type && (
                <Badge
                  variant="outline"
                  className="font-mono text-xs md:text-sm bg-white/10 border-white/20 shrink-0"
                >
                  {project.type}
                </Badge>
              )}
            </div>

            {project.description && (
              <p className="text-base md:text-lg text-space-secondary mb-4">
                {project.description}
              </p>
            )}

            <div className="flex gap-3 flex-wrap mt-auto">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="ghost"
                    className="text-space-muted hover:text-space-primary flex items-center gap-2 border border-space-border"
                  >
                    <Github size={16} /> GitHub
                  </Button>
                </a>
              )}
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="ghost"
                    className="text-space-muted hover:text-space-primary flex items-center gap-2 border border-space-border"
                  >
                    <ExternalLink size={16} /> Link
                  </Button>
                </a>
              )}
            </div>
            </div>
          </div>

          {/* Date (desktop only - matches main section height) */}
          {date && (
            <div className="hidden md:block shrink-0 self-stretch">
              <div
                className="relative bg-gradient-to-br from-space-surface/80 to-space-surface/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden h-full aspect-square"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
                <div className="relative flex flex-col items-center justify-center h-full w-full p-4">
                  <div className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-none mb-2">
                    {date.getDate()}
                  </div>
                  <div className="text-xs lg:text-sm uppercase text-white/50 font-semibold tracking-widest text-center">
                    {date.toLocaleString("default", { month: "short" })}{" "}
                    {date.getFullYear()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- LAYOUTS --- */}
        {!isMobile ? (
          /* --- DESKTOP: 2-column --- */
          <div className="grid lg:grid-cols-2 gap-4 flex-1 min-h-0">
            {/* Markdown (scrollable) */}
            {project.markdown && (
              <div className="relative rounded-2xl shadow-2xl border border-white/10 overflow-hidden h-full bg-gradient-to-br from-space-surface/80 to-space-surface/40 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none"></div>
                <div
                  className="markdown-scroll p-6 overflow-y-auto prose prose-invert prose-sm md:prose-base max-w-none h-full relative z-10"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.markdown}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Carousel + tags */}
            <div className="flex flex-col min-h-0 gap-3">
              <div
                className="carousel-container relative w-full flex-shrink-0"
                style={{ paddingTop: "56.25%" }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div className="absolute inset-0 overflow-hidden rounded-2xl border border-space-border">
                  <div
                    className="flex h-full transition-transform duration-700 ease-in-out"
                    style={{
                      width: `${frameCount * 100}%`,
                      transform: `translateX(-${
                        (currentFrame * 100) / frameCount
                      }%)`,
                    }}
                  >
                    {Array.from({ length: frameCount }, (_, i) => (
                      <img
                        key={i}
                        src={`${project.imageUrl}/${i + 1}.png`}
                        alt={`Frame ${i + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    ))}
                  </div>

                  {/* Arrows - Show on hover */}
                  {frameCount > 1 && isHovering && (
                    <>
                      {currentFrame > 0 && (
                        <button
                          onClick={handlePrevFrame}
                          className="carousel-arrow absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity"
                        >
                          <ArrowLeft size={20} />
                        </button>
                      )}
                      {currentFrame < frameCount - 1 && (
                        <button
                          onClick={handleNextFrame}
                          className="carousel-arrow absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity"
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
                        if (!isMobile) {
                          setIsPaused(true);
                          setTimeout(() => setIsPaused(false), 5000);
                        }
                      }}
                      className={`h-2 rounded-full transition-all ${
                        i === currentFrame ? "bg-white w-6" : "bg-white/40 w-2"
                      }`}
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
                      className="bg-space-elevated/50 text-space-muted border-space-border font-mono text-sm px-3 py-1.5"
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
          <div className="flex flex-col gap-6">
            {/* Carousel */}
            <div 
              className="relative w-full" 
              style={{ paddingTop: "56.25%" }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl border border-space-border">
                <div
                  className="flex h-full transition-transform duration-700 ease-in-out"
                  style={{
                    width: `${frameCount * 100}%`,
                    transform: `translateX(-${
                      (currentFrame * 100) / frameCount
                    }%)`,
                  }}
                >
                  {Array.from({ length: frameCount }, (_, i) => (
                    <img
                      key={i}
                      src={`${project.imageUrl}/${i + 1}.png`}
                      alt={`Frame ${i + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Dots for mobile */}
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
                    className={`h-2 rounded-full transition-all ${
                      i === currentFrame ? "bg-white w-6" : "bg-white/40 w-2"
                    }`}
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
                    className="bg-space-surface/60 text-white border border-white/20 font-mono text-sm px-2 py-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Markdown */}
            {project.markdown && (
              <div className="relative rounded-2xl shadow-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-space-surface/80 to-space-surface/40 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none"></div>
                <div className="p-6 prose prose-invert prose-sm md:prose-base max-w-none relative z-10">
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
          className={`fixed bottom-6 right-6 bg-black rounded-full p-3 shadow-lg z-50 transition-transform duration-300 ease-in-out ${
            showScrollTop ? 'translate-y-0' : 'translate-y-24'
          }`}
        >
          <ArrowUp size={20} color="white" />
        </button>
      )}
    </div>
  );
};

export default SoftwarePage;