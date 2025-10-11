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
  status: "active" | "beta" | "archived" | "completed";
  imageUrl?: string;
  logoUrl?: string;
  themeColor?: string;
  logoBackgroundColor?: string;
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
    status,
    imageUrl,
    logoUrl,
    themeColor = "#8888ff",
    logoBackgroundColor,
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
          relative overflow-visible bg-space-surface/50
          backdrop-blur-sm flex flex-col transition-transform duration-150 ease-in-out
          hover:scale-[1.05] hover:-translate-y-1 active:scale-[0.98]
          cursor-pointer
        `}
        style={{
          // Box-shadow replaces border + adds hover glow
          boxShadow: `0 0 0 2px ${themeColor}, 0 0 0 0 ${themeColor}00`,
          transition: "box-shadow 0.25s ease-in-out",
          "--glow-origin": glowPosition,
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          (e.currentTarget.style as any).boxShadow = 
            `0 0 0 2px ${themeColor}, 0 0 20px 5px ${themeColor}55`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget.style as any).boxShadow = `0 0 0 2px ${themeColor}, 0 0 0 0 ${themeColor}00`;
        }}
      >
        {/* Inner pulse glow */}
        <div
          className="absolute inset-0 pointer-events-none rounded-md"
          style={{
            background: `radial-gradient(circle at var(--glow-origin), ${themeColor}44 0%, transparent 70%)`,
            filter: "blur(50px)",
            animation: "softPulse 3s ease-in-out infinite",
            zIndex: 0,
          }}
        />

        {/* Overlay icon for click indication */}
        <div className="absolute bottom-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight className="w-6 h-6 text-white/70 animate-bounce" />
        </div>

        <div className="relative z-10 flex flex-col pointer-events-none">
          {/* Thumbnail */}
          {imageUrl && (
            <div
              className="aspect-video w-full flex items-center justify-center relative overflow-hidden rounded-md"
              style={{ backgroundColor: themeColor + "22" }}
            >
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={`${title} Logo`}
                  className="h-16 w-16 object-contain z-10"
                  style={{ backgroundColor: logoBackgroundColor || "transparent" }}
                />
              )}
              <img
                src={`${imageUrl}/1.png`}
                alt={`${title} Thumbnail`}
                className="absolute inset-0 w-full h-full object-cover object-center z-0"
              />
            </div>
          )}

          {/* Body */}
          <div className="relative p-6 flex flex-col flex-grow">
            <div className="mb-2">
              <h3
                className="text-xl font-semibold font-inter line-clamp-2"
                style={{ color: titleColor || "inherit" }}
              >
                {title}
              </h3>
            </div>

            <p className="text-space-secondary leading-relaxed line-clamp-3 mb-2">
              {description}
            </p>

            <div className="flex flex-wrap gap-2 items-center line-clamp-1 overflow-hidden">
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

            <div className="flex justify-between items-center pt-4 mt-auto">
              <div className="flex gap-2">
                {liveUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:scale-110 active:scale-95 transition-transform"
                    asChild
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
                {githubUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:scale-110 active:scale-95 transition-transform"
                    asChild
                  >
                    <Github className="w-3 h-3" />
                  </Button>
                )}
                {demoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:scale-110 active:scale-95 transition-transform"
                    asChild
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
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
  0%, 100% { opacity: 0.75; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
`;
document.head.appendChild(style);
export default SoftwareCard;
