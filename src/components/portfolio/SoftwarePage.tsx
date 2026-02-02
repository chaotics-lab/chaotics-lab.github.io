import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp, ExternalLink, Github } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AISticker } from "@/components/AISticker";

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
    if (frameCount <= 1 || isPaused || isHovering) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev >= frameCount - 1 ? 0 : prev + 1));
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

  if (!project)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  const date = project.date ? new Date(project.date) : null;
  const themeColor = project.themeColor || "#8888ff";

  return (
    <div className="relative w-full text-white flex flex-col overflow-hidden min-h-screen">
      {/* Starfield */}
      <div
        className="fixed inset-0 -z-10 starfield"
        style={
          { "--deep-space-color": hexToRgba(themeColor) } as React.CSSProperties
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

      {/* --- main content --- */}
      <div className={`relative z-10 container mx-auto py-4 md:py-8 px-4 flex flex-col gap-4 ${isMobile ? '' : 'h-screen overflow-hidden'}`}>
        {/* Back Button */}
        <Link to="/" className="shrink-0">
          <Button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 backdrop-blur-sm transition-all">
            <ArrowLeft size={16} /> Back
          </Button>
        </Link>

        {/* --- HERO --- */}
        <div className={`flex flex-col md:flex-row gap-4 ${isMobile ? '' : 'md:h-[25%] md:min-h-[180px] md:max-h-[200px] shrink-0'}`}>
          {/* Hero Content - flex: 2 */}
          <div 
            className="relative p-6 backdrop-blur-xl rounded-2xl shadow-2xl border-2 overflow-hidden flex flex-col flex-1 md:flex-[2]"
            style={{ borderColor: `${themeColor}30` }}
          >
            {/* Multi-layer colorful glow */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: `
                  radial-gradient(circle at ${glowPositions.hero}, ${themeColor}70 0%, ${themeColor}40 30%, transparent 70%),
                  radial-gradient(circle at center, ${themeColor}20 0%, transparent 100%)
                `,
                filter: "blur(60px)",
                animation: "softPulse 3s ease-in-out infinite",
                willChange: "opacity, transform",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none z-0 opacity-60"
              style={{
                background: `radial-gradient(ellipse at ${glowPositions.hero}, ${themeColor}90 0%, transparent 60%)`,
                filter: "blur(40px)",
                animation: "rotatePulse 6s ease-in-out infinite",
                willChange: "opacity",
              }}
            />
            <div className="absolute inset-0 bg-white/5 pointer-events-none z-0" />
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Title Row */}
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                <h1
                  className="text-3xl md:text-4xl font-bold flex-1 min-w-0"
                  style={{ color: project.titleColor }}
                >
                  {project.title}
                </h1>
                {date && (
                  <div className="text-sm text-white/70 font-medium tracking-wide shrink-0">
                    {date.toLocaleString("default", { month: "long" })} {date.getFullYear()}
                  </div>
                )}
                {project.type && (
                  <Badge
                    variant="outline"
                    className="font-mono text-xs md:text-sm bg-white/10 border-white/20 shrink-0"
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
                    <Button
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 backdrop-blur-sm transition-all"
                    >
                      <Github size={16} /> GitHub
                    </Button>
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 backdrop-blur-sm transition-all"
                    >
                      <ExternalLink size={16} /> Link
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Logo - aspect-square, shrink-0 (desktop only) */}
          {project.logoUrl && (
            <div className="hidden md:block shrink-0 max-w-[200px]">
              <div
                className="relative backdrop-blur-xl rounded-2xl shadow-2xl border-2 overflow-hidden h-full aspect-square"
                style={{ borderColor: `${themeColor}30` }}
              >
                {/* Multi-layer colorful glow */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: `
                      radial-gradient(circle at ${glowPositions.logo}, ${themeColor}70 0%, ${themeColor}40 30%, transparent 70%),
                      radial-gradient(circle at center, ${themeColor}20 0%, transparent 100%)
                    `,
                    filter: "blur(60px)",
                    animation: "softPulse 3s ease-in-out infinite",
                    willChange: "opacity, transform",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none z-0 opacity-60"
                  style={{
                    background: `radial-gradient(ellipse at ${glowPositions.logo}, ${themeColor}90 0%, transparent 60%)`,
                    filter: "blur(40px)",
                    animation: "rotatePulse 6s ease-in-out infinite",
                    willChange: "opacity",
                  }}
                />
                
                {/* Contrasting glow for logo visibility */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 0%, transparent 70%)',
                    filter: "blur(50px)",
                  }}
                />
                
                <div className="absolute inset-0 bg-white/5" />
                
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
              <div className="relative rounded-2xl shadow-2xl border-2 overflow-hidden h-full backdrop-blur-xl"
                style={{ borderColor: `${themeColor}30` }}>

                {/* Multi-layer colorful glow */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: `
                      radial-gradient(circle at ${glowPositions.markdown}, ${themeColor}70 0%, ${themeColor}40 30%, transparent 70%),
                      radial-gradient(circle at center, ${themeColor}20 0%, transparent 100%)
                    `,
                    filter: "blur(60px)",
                    animation: "softPulse 3s ease-in-out infinite",
                    willChange: "opacity, transform",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none z-0 opacity-60"
                  style={{
                    background: `radial-gradient(ellipse at ${glowPositions.markdown}, ${themeColor}90 0%, transparent 60%)`,
                    filter: "blur(40px)",
                    animation: "rotatePulse 6s ease-in-out infinite",
                    willChange: "opacity",
                  }}
                />
                <div className="absolute inset-0 bg-white/5 pointer-events-none rounded-2xl" />
                
                <div
                  className="markdown-scroll p-6 overflow-y-auto prose prose-invert prose-sm md:prose-base max-w-none h-full relative z-10"
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
                className="relative w-full flex-shrink-0"
                style={{ paddingTop: "56.25%" }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div className="absolute inset-0 overflow-hidden rounded-2xl border-2"
                  style={{ 
                    borderColor: `${themeColor}30`,
                    backgroundColor: `${themeColor}20`,
                    boxShadow: `inset 0 0 40px ${themeColor}30`,
                  }}>
                  {/* Carousel glow background */}
                  <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                      background: `radial-gradient(circle at ${glowPositions.carousel}, ${themeColor}70 0%, ${themeColor}40 30%, transparent 70%)`,
                      filter: "blur(60px)",
                      animation: "softPulse 3s ease-in-out infinite",
                      willChange: "opacity, transform",
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
                          onClick={handlePrevFrame}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-20"
                        >
                          <ArrowLeft size={20} />
                        </button>
                      )}
                      {currentFrame < frameCount - 1 && (
                        <button
                          onClick={handleNextFrame}
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
                      className="bg-white/5 text-space-muted border border-white/10 font-mono text-sm px-3 py-1.5"
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
              className="relative w-full" 
              style={{ paddingTop: "56.25%" }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl border-2"
                style={{ 
                  borderColor: `${themeColor}30`,
                  backgroundColor: `${themeColor}20`,
                  boxShadow: `inset 0 0 40px ${themeColor}30`,
                }}>
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: `radial-gradient(circle at center, ${themeColor}70 0%, ${themeColor}40 30%, transparent 70%)`,
                    filter: "blur(60px)",
                    animation: "softPulse 3s ease-in-out infinite",
                    willChange: "opacity, transform",
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
                    className="bg-white/5 text-white border border-white/20 font-mono text-sm px-2 py-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Markdown */}
            {project.markdown && (
              <div className="relative rounded-2xl shadow-2xl border-2 overflow-hidden backdrop-blur-xl"
                style={{ borderColor: `${themeColor}30` }}>
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: `
                      radial-gradient(circle at center, ${themeColor}70 0%, ${themeColor}40 30%, transparent 70%),
                      radial-gradient(circle at center, ${themeColor}20 0%, transparent 100%)
                    `,
                    filter: "blur(60px)",
                    animation: "softPulse 3s ease-in-out infinite",
                    willChange: "opacity, transform",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none z-0 opacity-60"
                  style={{
                    background: `radial-gradient(ellipse at center, ${themeColor}90 0%, transparent 60%)`,
                    filter: "blur(40px)",
                    animation: "rotatePulse 6s ease-in-out infinite",
                    willChange: "opacity",
                  }}
                />
                <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                
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
          className={`fixed bottom-6 right-6 rounded-full p-3 shadow-lg z-50 transition-all duration-300 ease-in-out ${
            showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
          }`}
          style={{
            backgroundColor: `${themeColor}80`,
            boxShadow: `0 0 20px ${themeColor}60`,
          }}
        >
          <ArrowUp size={20} color="white" />
        </button>
      )}
    </div>
  );
};

export default SoftwarePage;