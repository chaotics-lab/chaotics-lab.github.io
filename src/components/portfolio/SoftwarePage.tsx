// src/pages/SoftwarePage.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Github, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SoftwarePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any | null>(null);
  const [frameCount, setFrameCount] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPausedByClick, setIsPausedByClick] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load all projects at build time
  const modules = import.meta.glob("../../resources/projects/*.json", { eager: true });
  const projects = Object.values(modules).map((m) => (m as any).default || m);

  // Load project
  useEffect(() => {
    if (!projectId) return;
    const found = projects.find((p) => p.id === projectId);
    setProject(found || null);
  }, [projectId]);

  // Load frames
  useEffect(() => {
    if (!project?.imageUrl) return;

    let count = 1;
    const loadFrames = async () => {
      while (true) {
        const path = `${project.imageUrl}/${count}.png`;
        const img = new Image();
        img.src = path;
        try {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
          });
          count++;
        } catch {
          break;
        }
      }
      setFrameCount(count - 1);
    };
    loadFrames();
  }, [project?.imageUrl]);

  // Carousel auto-advance every 4s if not hovering
  useEffect(() => {
    if (frameCount <= 1) return;

    const interval = setInterval(() => {
      if (!isHovered && !isPausedByClick) {
        setCurrentFrame((prev) => (prev + 1) % frameCount);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, frameCount, isPausedByClick]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "beta":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "archived":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const handlePrev = () => {
    setIsPausedByClick(true);
    setCurrentFrame((prev) => (prev - 1 + frameCount) % frameCount);
  };
  const handleNext = () => {
    setIsPausedByClick(true);
    setCurrentFrame((prev) => (prev + 1) % frameCount);
  };

  const showLeftArrow = frameCount > 1 && currentFrame > 0;
  const showRightArrow = frameCount > 1 && currentFrame < frameCount - 1;
  const frameWidth = 100 / frameCount;

  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha = 0.4) => {
    if (!hex) return `rgba(25,25,112,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Starfield background with themeColor */}
      <div
        className="fixed inset-0 -z-10 starfield bg-black"
        style={{ '--deep-space-color': hexToRgba(project?.themeColor) } as React.CSSProperties}
      ></div>

      <div className="relative z-10 flex flex-col min-h-screen text-white">
        {/* Header */}
        <div className="container mx-auto p-6">
          <Link to="/">
            <Button variant="ghost" className="text-space-muted hover:text-space-primary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
        </div>

        <div className="flex-grow container mx-auto max-w-4xl py-6 space-y-4">
          {/* Title, Buttons & Status */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              {project?.logoUrl && (
                <img src={project.logoUrl} alt="logo" className="h-12 w-12 object-contain" />
              )}

              <h1
                className="text-4xl font-light"
                style={{ color: project?.titleColor || "inherit" }}
              >
                {project?.title}
              </h1>

              {project?.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 p-2 bg-gray-800 text-white rounded flex items-center gap-1 hover:bg-gray-700 transition"
                >
                  <Github size={16} /> GitHub
                </a>
              )}

              {project?.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 p-2 bg-gray-800 text-white rounded flex items-center gap-1 hover:bg-gray-700 transition"
                >
                  <ExternalLink size={16} /> Live
                </a>
              )}
            </div>

            <Badge
              variant="outline"
              className={`${getStatusColor(project?.status)} font-mono text-sm`}
            >
              {project?.status}
            </Badge>
          </div>

          {/* Date */}
          {project?.date && (
            <div className="flex items-center gap-2 text-space-muted text-sm">
              <Calendar className="w-4 h-4" /> {project.date}
            </div>
          )}

          {/* Image Carousel */}
          {project?.imageUrl && (
            <div
              className="relative overflow-hidden rounded-lg border border-space-border aspect-[3/2] bg-black"
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                setIsHovered(true);
              }}
              onMouseLeave={() => {
                hoverTimeoutRef.current = setTimeout(() => setIsHovered(false), 500);
              }}
            >
              <div
                className="flex h-full transition-transform duration-700 ease-in-out"
                style={{
                  width: `${frameCount * 100}%`,
                  transform: `translateX(-${currentFrame * frameWidth}%)`,
                }}
              >
                {Array.from({ length: frameCount }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-full h-full"
                    style={{ width: `${frameWidth}%` }}
                  >
                    <img
                      src={`${project.imageUrl}/${i + 1}.png`}
                      alt={`${project.title} frame ${i + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ))}
              </div>

              {/* Arrows */}
              {frameCount > 1 && (
                <>
                  <button
                    className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/25 p-1 rounded-full text-white z-10 transition-opacity duration-300 ${
                      isHovered && showLeftArrow ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={handlePrev}
                    style={{
                      pointerEvents: isHovered && showLeftArrow ? "auto" : "none",
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/25 p-1 rounded-full text-white z-10 transition-opacity duration-300 ${
                      isHovered && showRightArrow ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={handleNext}
                    style={{
                      pointerEvents: isHovered && showRightArrow ? "auto" : "none",
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Dots */}
              {frameCount > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                  {Array.from({ length: frameCount }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentFrame === idx ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-lg text-space-secondary mt-4">{project?.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {(project?.tags || []).map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-space-elevated/50 text-space-muted border-space-border font-mono text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Markdown */}
          {project?.markdown && (
            <div
              className="markdown-section max-w-none mt-8 p-6 bg-space-surface/50 rounded-lg border border-space-border backdrop-blur-sm"
              style={{ '--deep-space-color': hexToRgba(project?.themeColor) } as React.CSSProperties}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {project.markdown}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoftwarePage;
