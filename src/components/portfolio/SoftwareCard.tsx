import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, ArrowRight } from "lucide-react";
import { useMemo } from "react";

export interface SoftwareCardProps {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  type: "active" | "beta" | "archived" | "completed";
  imageUrl?: string;
  themeColor?: string;
  titleColor?: string;
  tags?: string[];
  category?: string[];
}

export const SoftwareCard = (props: Partial<SoftwareCardProps>) => {
  const {
    id,
    title,
    description,
    technologies = [],
    liveUrl,
    githubUrl,
    demoUrl,
    imageUrl,
    themeColor = "#8888ff",
    titleColor,
  } = props;

  const glowPosition = useMemo(() => {
    const positions = [
      "top left",
      "top right",
      "bottom left",
      "bottom right",
      "center top",
      "center bottom",
      "center left",
      "center right",
      "center",
    ];
    return positions[Math.floor(Math.random() * positions.length)];
  }, []);

  return (
    <Link to={`/project/${id}`} className="block w-full select-none">
      <Card
        className={`
          relative overflow-hidden bg-space-surface/50
          backdrop-blur-sm flex flex-col transition-transform duration-150 ease-in-out
          md:hover:-translate-y-1
          cursor-pointer h-full
          md:min-h-[400px]
        `}
        style={{
          "--glow-origin": glowPosition,
        } as React.CSSProperties}
      >
        {/* Inner glow behind image */}
        <div
          className="absolute inset-0 pointer-events-none rounded-md z-0"
          style={{
            background: `radial-gradient(circle at var(--glow-origin), ${themeColor}44 0%, transparent 100%)`,
            filter: "blur(50px)",
            animation: "softPulse 3s ease-in-out infinite",
          }}
        />

        {/* Overlay icon for click indication - Desktop only */}
        <div className="hidden md:block absolute bottom-2 right-2 z-20">
          <ArrowRight className="w-6 h-6 text-white/70" />
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex relative z-10 flex-col pointer-events-none">
          {/* Thumbnail */}
          {imageUrl && (
            <div
              className="aspect-video w-full relative overflow-hidden rounded-t-md"
              style={{ backgroundColor: themeColor + "22" }}
            >
              <img
                src={`${imageUrl}/1.png`}
                alt={`${title} Thumbnail`}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
          )}

          {/* Body */}
          <div className="relative p-6 flex flex-col flex-grow">
            <h3
              className="text-xl font-semibold font-inter line-clamp-2 mb-2"
              style={{ color: titleColor || "inherit" }}
            >
              {title}
            </h3>

            <p className="text-space-secondary leading-relaxed line-clamp-3 mb-2">
              {description}
            </p>

            <div className="flex flex-wrap gap-2 items-center overflow-hidden mb-4 max-h-[28px]">
              {technologies.slice(0, 3).map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="bg-space-elevated/50 text-space-muted border-space-border font-mono text-xs"
                >
                  {tech}
                </Badge>
              ))}
              {technologies.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-space-elevated/50 text-space-muted border-space-border font-mono text-xs"
                >
                  +{technologies.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden relative z-10 flex flex-row pointer-events-none h-32">
          {/* Thumbnail */}
          {imageUrl && (
            <div
              className="w-32 h-32 flex-shrink-0 relative overflow-hidden rounded-l-md"
              style={{ backgroundColor: themeColor + "22" }}
            >
              <img
                src={`${imageUrl}/1.png`}
                alt={`${title} Thumbnail`}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
          )}

          {/* Body */}
          <div className="relative p-4 flex flex-col flex-grow">
            <h3
              className="text-base font-semibold font-inter line-clamp-2 mb-2"
              style={{ color: titleColor || "inherit" }}
            >
              {title}
            </h3>

            <div className="flex flex-wrap gap-1.5 items-start max-h-[48px] overflow-hidden">
              {technologies.slice(0, 2).map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="bg-space-elevated/50 text-space-muted border-space-border font-mono text-xs"
                >
                  {tech}
                </Badge>
              ))}
              {technologies.length > 2 && (
                <Badge
                  variant="secondary"
                  className="bg-space-elevated/50 text-space-muted border-space-border font-mono text-xs"
                >
                  +{technologies.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

/* Inject softPulse animation */
const style = document.createElement("style");
style.textContent = `
@keyframes softPulse {
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
`;
document.head.appendChild(style);

export default SoftwareCard;