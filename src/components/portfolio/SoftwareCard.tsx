import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { useMemo } from "react";

export interface SoftwareCardProps {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  type: "Personal Project" | "Academic Project" | "Internship" | "Upcoming";
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
    type,
    imageUrl,
    themeColor = "#8888ff",
    titleColor,
  } = props;

  const isUpcoming = type === "Upcoming";

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

  const cardContent = (
    <Card
      className={`
        relative overflow-hidden bg-space-surface/50
        backdrop-blur-sm flex flex-col transition-transform duration-150 ease-in-out
        ${isUpcoming ? "cursor-default border-dashed border-2 border-space-border/50" : "md:hover:-translate-y-1 cursor-pointer"}
        h-full
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
          animation: isUpcoming ? "slowPulse 4s ease-in-out infinite" : "softPulse 3s ease-in-out infinite",
        }}
      />

      {/* Floating particles for upcoming projects */}
      {isUpcoming && (
        <div className="absolute inset-0 overflow-hidden z-0">
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: themeColor,
              top: "20%",
              left: "15%",
              opacity: 0.4,
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: themeColor,
              top: "60%",
              right: "20%",
              opacity: 0.3,
              animation: "float 7s ease-in-out infinite 1s",
            }}
          />
          <div
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: themeColor,
              bottom: "30%",
              left: "70%",
              opacity: 0.5,
              animation: "float 5s ease-in-out infinite 2s",
            }}
          />
        </div>
      )}

      {/* Overlay icon for click indication - Desktop only (not for upcoming) */}
      {!isUpcoming && (
        <div className="hidden md:block absolute bottom-2 right-2 z-20">
          <ArrowRight className="w-6 h-6 text-white/70" />
        </div>
      )}

      {/* Coming Soon overlay for upcoming projects */}
      {isUpcoming && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="relative mb-3">
              <div
                className="absolute inset-0 rounded-full blur-xl"
                style={{
                  background: `radial-gradient(circle, ${themeColor}44 0%, transparent 70%)`,
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <Sparkles
                className="w-10 h-10 mx-auto relative"
                style={{ color: themeColor }}
              />
            </div>
            <div
              className="text-xl font-bold font-inter mb-2"
              style={{
                color: themeColor,
                textShadow: `0 0 20px ${themeColor}44`,
              }}
            >
              Coming Soon
            </div>
            <div className="flex gap-2 items-center justify-center">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: themeColor,
                  animation: "blink 1.5s ease-in-out infinite",
                }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: themeColor,
                  animation: "blink 1.5s ease-in-out infinite 0.3s",
                }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: themeColor,
                  animation: "blink 1.5s ease-in-out infinite 0.6s",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className={`hidden md:flex relative z-10 flex-col pointer-events-none ${isUpcoming ? "opacity-30" : ""}`}>
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
      <div className={`md:hidden relative z-10 flex flex-row pointer-events-none h-32 ${isUpcoming ? "opacity-30" : ""}`}>
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
  );

  // Wrap in Link only if not upcoming
  if (isUpcoming) {
    return <div className="block w-full select-none">{cardContent}</div>;
  }

  return (
    <Link to={`/project/${id}`} className="block w-full select-none">
      {cardContent}
    </Link>
  );
};

/* Inject animations */
const style = document.createElement("style");
style.textContent = `
@keyframes softPulse {
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

@keyframes slowPulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
  50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
}

@keyframes blink {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
`;
document.head.appendChild(style);

export default SoftwareCard;