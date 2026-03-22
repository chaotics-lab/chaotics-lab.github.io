import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { memo, useRef, useState, useReducer, useLayoutEffect, useEffect } from "react";
import { AISticker } from "@/components/AISticker";
import { useGithubStars } from "@/hooks/useGithubStars";
import { useGithubStats } from "@/hooks/useGithubStats";
import { GithubStarsBadge, GithubDownloadsBadge } from "@/components/GithubBadges";

function adjustHexBrightness(hex: string, minLight = 0.5) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  let r = parseInt(hex.slice(0,2),16)/255;
  let g = parseInt(hex.slice(2,4),16)/255;
  let b = parseInt(hex.slice(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  const l = (max+min)/2;
  if (l < minLight) {
    const scale = minLight/l;
    r = Math.min(1, r*scale);
    g = Math.min(1, g*scale);
    b = Math.min(1, b*scale);
  }
  const toHex = (x: number) => Math.round(x*255).toString(16).padStart(2,'0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRGBA(hex: string, alpha = 1) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
  const r = parseInt(hex.slice(0,2),16);
  const g = parseInt(hex.slice(2,4),16);
  const b = parseInt(hex.slice(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const FittingBadges = ({ technologies, borderColor, maxInitial, className }: {
  technologies: string[];
  borderColor: string;
  maxInitial: number;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(() => Math.min(maxInitial, technologies.length));
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    setVisibleCount(Math.min(maxInitial, technologies.length));
  }, [technologies, maxInitial]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length <= 1) return;
    const containerRight = el.getBoundingClientRect().right;
    for (let i = 0; i < children.length; i++) {
      if (children[i].getBoundingClientRect().right > containerRight + 1) {
        setVisibleCount(v => Math.min(v, Math.max(0, i - 1)));
        return;
      }
    }
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setVisibleCount(Math.min(maxInitial, technologies.length));
      forceRender();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [technologies, maxInitial]);

  const remaining = technologies.length - visibleCount;

  return (
    <div ref={containerRef} className={className} style={{ flexWrap: 'nowrap', overflow: 'hidden' }}>
      {technologies.slice(0, visibleCount).map(t => (
        <Badge key={t} variant="secondary" className="bg-white/5 text-space-muted border text-xs whitespace-nowrap flex-shrink-0" style={{ borderColor }}>{t}</Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="secondary" className="bg-white/5 text-space-muted border text-xs whitespace-nowrap flex-shrink-0" style={{ borderColor }}>+{remaining}</Badge>
      )}
    </div>
  );
};

export interface SoftwareCardProps {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  type: "Personal Project" | "Academic Project" | "Internship" | "Upcoming";
  imageUrl?: string;
  themeColor?: string;
  themeColors?: string[];
  titleColor?: string;
  AIUsed?: string;
  githubUrl?: string;
  showGithubStats?: boolean;
}

export const SoftwareCard = memo((props: Partial<SoftwareCardProps>) => {
  const {
    id, title, description, technologies = [],
    type, imageUrl, themeColor = "#8888ff", themeColors, titleColor, AIUsed,
    githubUrl, showGithubStats,
  } = props;

  const colors = themeColors && themeColors.length > 0 ? themeColors : [themeColor];
  const primaryColor = colors[0];
  const secondaryColor = colors.length > 1 ? colors[1] : null;
  const borderColor = hexToRGBA(adjustHexBrightness(primaryColor, 0.5), 0.3);
  const isUpcoming = type === "Upcoming";

  const stars = useGithubStars(githubUrl, showGithubStats);
  const stats = useGithubStats(showGithubStats);
  const combinedDownloads = stats ? stats.total_downloads + stats.unique_cloners : null;

  const statsBadges = showGithubStats && (
    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
      {stars !== null && <GithubStarsBadge stars={stars} />}
      <GithubDownloadsBadge downloads={combinedDownloads} />
    </div>
  );

  const cardContent = (
    <div className={`relative w-full flex flex-col ${!isUpcoming ? "group transition-all duration-300 md:hover:-translate-y-2" : ""}`}>
      {secondaryColor && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${hexToRGBA(adjustHexBrightness(primaryColor, 0.5), 0.7)}, ${hexToRGBA(adjustHexBrightness(secondaryColor, 0.4), 0.5)})`,
            padding: '2px',
            borderRadius: '0.75rem',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
          }}
        />
      )}

      {AIUsed && (
        <>
          <div className="hidden md:block absolute -top-5 -left-5 z-30 pointer-events-none">
            <AISticker value={parseInt(AIUsed, 10)} size={58} />
          </div>
          <div className="md:hidden absolute -top-4 -left-4 z-30 pointer-events-none">
            <AISticker value={parseInt(AIUsed, 10)} size={40} />
          </div>
        </>
      )}

      <Card
        className={`relative overflow-hidden flex flex-col h-full md:min-h-[400px] z-10
          transition-all duration-300 ${isUpcoming
            ? "cursor-default border-dashed border-2"
            : secondaryColor
              ? "cursor-pointer border-0"
              : "cursor-pointer border-2"
          }`}
        style={{
          borderColor: secondaryColor ? undefined : borderColor,
          backgroundColor: "rgba(255,255,255,0.05)",
          boxShadow: `0 0 20px ${primaryColor}20, inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)`,
          ...(secondaryColor ? { margin: '2px', borderRadius: 'calc(0.75rem - 2px)' } : {}),
        }}
      >
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none z-0 hidden md:block" style={{
          background: [
            `linear-gradient(165deg, ${hexToRGBA(primaryColor, 0.20)} 0%, rgba(255,255,255,0.05) 24%, transparent 44%)`,
            secondaryColor
              ? `linear-gradient(345deg, transparent 55%, ${hexToRGBA(secondaryColor, 0.12)} 78%, rgba(255,255,255,0.03) 100%)`
              : 'linear-gradient(345deg, transparent 55%, rgba(255,255,255,0.10) 78%, rgba(255,255,255,0.03) 100%)',
            `radial-gradient(120% 90% at 12% 10%, ${hexToRGBA(primaryColor, 0.16)} 0%, transparent 58%)`,
            secondaryColor
              ? `radial-gradient(120% 90% at 88% 85%, ${hexToRGBA(secondaryColor, 0.12)} 0%, transparent 62%)`
              : `radial-gradient(120% 90% at 88% 85%, ${hexToRGBA(primaryColor, 0.10)} 0%, transparent 62%)`,
          ].join(', '),
          borderRadius: 'inherit',
        }} />
        <div className="absolute inset-0 pointer-events-none z-0 hidden md:block" style={{
          background: `linear-gradient(90deg, ${hexToRGBA(primaryColor, 0.12)} 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.07) 100%)`,
          borderRadius: 'inherit',
          opacity: 0.95,
        }} />
        <div className="absolute inset-0 pointer-events-none z-0 md:hidden" style={{
          background: `linear-gradient(160deg, ${hexToRGBA(primaryColor, 0.18)} 0%, rgba(255,255,255,0.04) 30%, transparent 55%)`,
          borderRadius: 'inherit',
          opacity: 0.9,
        }} />

        {secondaryColor ? (
          <>
            <div className="absolute pointer-events-none z-0 hidden md:block" style={{ top: '60%', right: '0%', transform: 'translateY(-50%)', width: '60%', height: '50%', background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${hexToRGBA(primaryColor, 0.10)} 0%, ${hexToRGBA(primaryColor, 0.04)} 40%, transparent 70%)` }} />
            <div className="absolute pointer-events-none z-0 hidden md:block" style={{ bottom: '0%', left: '0%', width: '60%', height: '50%', background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${hexToRGBA(secondaryColor, 0.08)} 0%, ${hexToRGBA(secondaryColor, 0.03)} 35%, transparent 65%)` }} />
            <div className="absolute pointer-events-none z-0 md:hidden" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '55%', height: '45%', background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${hexToRGBA(primaryColor, 0.08)} 0%, transparent 65%)` }} />
          </>
        ) : (
          <div className="absolute pointer-events-none z-0" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '50%', background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${hexToRGBA(primaryColor, 0.10)} 0%, ${hexToRGBA(primaryColor, 0.04)} 40%, transparent 70%)` }} />
        )}

        {/* Desktop Layout */}
        <div className={`hidden md:flex relative z-10 flex-col pointer-events-none ${isUpcoming ? "opacity-30" : ""}`}>
          {imageUrl && (
            <div className="relative w-full h-52 overflow-hidden rounded-t-md" style={{ backgroundColor: `${primaryColor}20` }}>
              <img src={`${imageUrl}/1.png`} alt={title || "Project"} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110" />
            </div>
          )}
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-xl font-display font-semibold line-clamp-2 flex-1 min-w-0" style={{ color: titleColor || "inherit" }}>{title}</h3>
              {statsBadges}
            </div>
            <p className="text-space-secondary leading-relaxed line-clamp-3 mb-4">{description}</p>
            <FittingBadges technologies={technologies} borderColor={borderColor} maxInitial={3} className="flex flex-wrap gap-2 items-center mt-auto" />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className={`md:hidden relative z-10 flex flex-row pointer-events-none h-32 ${isUpcoming ? "opacity-30" : ""}`}>
          {imageUrl && (
            <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden rounded-l-md" style={{ backgroundColor: `${primaryColor}20` }}>
              <img src={`${imageUrl}/1.png`} alt={title || "Project"} className="absolute inset-0 w-full h-full object-cover object-center" />
            </div>
          )}
          <div className="relative p-4 flex flex-col flex-grow">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-base font-display font-semibold line-clamp-2 flex-1 min-w-0" style={{ color: titleColor || "inherit" }}>{title}</h3>
              {statsBadges}
            </div>
            <FittingBadges technologies={technologies} borderColor={borderColor} maxInitial={2} className="flex flex-wrap gap-1.5 items-center" />
          </div>
        </div>

        {!isUpcoming && (
          <div className="hidden md:block absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <ArrowRight className="w-6 h-6 text-white" style={{ filter: `drop-shadow(0 0 8px ${primaryColor})` }} />
          </div>
        )}
      </Card>
    </div>
  );

  return isUpcoming
    ? <div className="block w-full">{cardContent}</div>
    : <Link to={`/project/${id}`} className="block w-full">{cardContent}</Link>;
});

SoftwareCard.displayName = "SoftwareCard";
export default SoftwareCard;