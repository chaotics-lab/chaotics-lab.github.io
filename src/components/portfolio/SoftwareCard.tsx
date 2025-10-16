import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { memo, useMemo } from "react";

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

export const SoftwareCard = memo((props: Partial<SoftwareCardProps>) => {
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

  // Memoize tech badges to prevent re-renders
  const techBadges = useMemo(() => {
    const desktop = technologies.slice(0, 3);
    const mobile = technologies.slice(0, 2);
    return { desktop, mobile };
  }, [technologies]);

  // Generate unique glow position for each card
  const glowPosition = useMemo(() => {
    const positions = [
      "top left",
      "top right", 
      "bottom left",
      "bottom right",
      "center top",
      "center bottom",
      "left center",
      "right center",
      "center",
    ];
    return positions[Math.floor(Math.random() * positions.length)];
  }, []);

  const cardContent = (
    <Card
      className={`
        group relative overflow-hidden
        backdrop-blur-md flex flex-col
        h-full md:min-h-[400px]
        transition-all duration-200 ease-out
        ${isUpcoming 
          ? "cursor-default border-dashed border-2 bg-white/5" 
          : "cursor-pointer border-2 bg-white/5 md:hover:-translate-y-2 md:hover:shadow-2xl"
        }
      `}
      style={{
        borderColor: isUpcoming ? `${themeColor}40` : `${themeColor}30`,
      }}
    >
      {/* Intense colorful glow - Multiple layers for richness */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at ${glowPosition}, ${themeColor}70 0%, ${themeColor}40 30%, transparent 70%),
            radial-gradient(circle at center, ${themeColor}20 0%, transparent 100%)
          `,
          filter: "blur(60px)",
          animation: isUpcoming ? "slowPulse 4s ease-in-out infinite" : "softPulse 3s ease-in-out infinite",
          willChange: "opacity, transform",
        }}
      />

      {/* Secondary glow layer for depth */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse at ${glowPosition}, ${themeColor}90 0%, transparent 60%)`,
          filter: "blur(40px)",
          animation: "rotatePulse 6s ease-in-out infinite",
          willChange: "opacity",
        }}
      />

      {/* Liquid Glass Gradient Background with Full Color - Desktop Only */}
      {!isUpcoming && (
        <div 
          className="hidden md:block absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(circle at center, ${themeColor}50 0%, ${themeColor}30 40%, transparent 70%)
            `,
          }}
        />
      )}

      {/* Vibrant border glow on hover */}
      {!isUpcoming && (
        <div
          className="hidden md:block absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0 rounded-md"
          style={{
            boxShadow: `inset 0 0 60px ${themeColor}40, 0 0 40px ${themeColor}30`,
          }}
        />
      )}

      {/* Floating particles for upcoming projects - Optimized */}
      {isUpcoming && (
        <>
          <div
            className="absolute w-2 h-2 rounded-full z-0"
            style={{
              background: themeColor,
              boxShadow: `0 0 10px ${themeColor}`,
              top: "20%",
              left: "15%",
              opacity: 0.6,
              animation: "float 6s ease-in-out infinite",
              willChange: "transform, opacity",
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full z-0"
            style={{
              background: themeColor,
              boxShadow: `0 0 8px ${themeColor}`,
              top: "60%",
              right: "20%",
              opacity: 0.5,
              animation: "float 7s ease-in-out infinite 1s",
              willChange: "transform, opacity",
            }}
          />
          <div
            className="absolute w-1 h-1 rounded-full z-0"
            style={{
              background: themeColor,
              boxShadow: `0 0 6px ${themeColor}`,
              bottom: "30%",
              left: "70%",
              opacity: 0.7,
              animation: "float 5s ease-in-out infinite 2s",
              willChange: "transform, opacity",
            }}
          />
        </>
      )}

      {/* Arrow indicator - Desktop only */}
      {!isUpcoming && (
        <div className="hidden md:block absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1">
          <ArrowRight className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
      )}

      {/* Coming Soon overlay - Desktop */}
      {isUpcoming && (
        <div className="hidden md:flex absolute inset-0 z-20 items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="relative mb-3">
              <div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{
                  background: `radial-gradient(circle, ${themeColor}80 0%, transparent 70%)`,
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <Sparkles
                className="w-10 h-10 mx-auto relative"
                style={{ 
                  color: themeColor,
                  filter: `drop-shadow(0 0 10px ${themeColor})`,
                }}
              />
            </div>
            <div
              className="text-xl font-bold font-inter mb-2"
              style={{
                color: themeColor,
                textShadow: `0 0 30px ${themeColor}80, 0 0 10px ${themeColor}`,
              }}
            >
              Coming Soon
            </div>
            <div className="flex gap-2 items-center justify-center">
              {[0, 0.3, 0.6].map((delay, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: themeColor,
                    boxShadow: `0 0 10px ${themeColor}`,
                    animation: `blink 1.5s ease-in-out infinite ${delay}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon overlay - Mobile */}
      {isUpcoming && (
        <div className="md:hidden absolute inset-0 z-20 flex items-center justify-end pr-4 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-xl"
                style={{
                  background: `radial-gradient(circle, ${themeColor}80 0%, transparent 70%)`,
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <Sparkles 
                className="w-6 h-6 relative" 
                style={{ 
                  color: themeColor,
                  filter: `drop-shadow(0 0 6px ${themeColor})`,
                }} 
              />
            </div>
            <div
              className="text-xs font-bold font-inter"
              style={{
                color: themeColor,
                textShadow: `0 0 15px ${themeColor}80`,
              }}
            >
              Coming Soon
            </div>
            <div className="flex gap-1 items-center">
              {[0, 0.3, 0.6].map((delay, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{
                    backgroundColor: themeColor,
                    boxShadow: `0 0 6px ${themeColor}`,
                    animation: `blink 1.5s ease-in-out infinite ${delay}s`,
                  }}
                />
              ))}
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
            style={{ 
              backgroundColor: `${themeColor}20`,
              boxShadow: `inset 0 0 40px ${themeColor}30`,
            }}
          >
            <img
              src={`${imageUrl}/1.png`}
              alt={title || "Project"}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Body */}
        <div className="relative p-6 flex flex-col flex-grow">
          <h3
            className="text-xl font-semibold font-inter line-clamp-2 mb-2 transition-colors duration-200"
            style={{ color: titleColor || "inherit" }}
          >
            {title}
          </h3>

          <p className="text-space-secondary leading-relaxed line-clamp-3 mb-4">
            {description}
          </p>

          <div className="flex flex-wrap gap-2 items-center overflow-hidden max-h-[28px]">
            {techBadges.desktop.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="bg-white/5 text-space-muted border border-white/10 font-mono text-xs"
              >
                {tech}
              </Badge>
            ))}
            {technologies.length > 3 && (
              <Badge
                variant="secondary"
                className="bg-white/5 text-space-muted border border-white/10 font-mono text-xs"
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
            style={{ 
              backgroundColor: `${themeColor}20`,
              boxShadow: `inset 0 0 20px ${themeColor}30`,
            }}
          >
            <img
              src={`${imageUrl}/1.png`}
              alt={title || "Project"}
              loading="lazy"
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
            {techBadges.mobile.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="bg-white/5 text-space-muted border border-white/10 font-mono text-xs"
              >
                {tech}
              </Badge>
            ))}
            {technologies.length > 2 && (
              <Badge
                variant="secondary"
                className="bg-white/5 text-space-muted border border-white/10 font-mono text-xs"
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
    return <div className="block w-full">{cardContent}</div>;
  }

  return (
    <Link to={`/project/${id}`} className="block w-full">
      {cardContent}
    </Link>
  );
});

SoftwareCard.displayName = "SoftwareCard";

/* Optimized animations with will-change */
const style = document.createElement("style");
style.textContent = `
@keyframes softPulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1); 
  }
  50% { 
    opacity: 0.85; 
    transform: scale(1.3); 
  }
}

@keyframes slowPulse {
  0%, 100% { 
    opacity: 0.9; 
    transform: scale(1); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2); 
  }
}

@keyframes rotatePulse {
  0%, 100% { 
    opacity: 0.6; 
  }
  50% { 
    opacity: 0.8; 
  }
}

@keyframes float {
  0%, 100% { 
    transform: translate3d(0, 0, 0); 
    opacity: 0.4; 
  }
  50% { 
    transform: translate3d(10px, -20px, 0); 
    opacity: 0.8; 
  }
}

@keyframes blink {
  0%, 100% { 
    opacity: 0.4; 
    transform: scale(0.8); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2); 
  }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.line-clamp-1 { 
  display: -webkit-box; 
  -webkit-line-clamp: 1; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
}
.line-clamp-2 { 
  display: -webkit-box; 
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
}
.line-clamp-3 { 
  display: -webkit-box; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
}
`;
document.head.appendChild(style);

export default SoftwareCard;