import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { memo, useMemo } from "react";
import { AISticker } from "@/components/AISticker";

// Adjust brightness for border
function adjustHexBrightness(hex: string, minLight = 0.5) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  let r = parseInt(hex.slice(0,2),16)/255;
  let g = parseInt(hex.slice(2,4),16)/255;
  let b = parseInt(hex.slice(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let l = (max+min)/2;
  if(l<minLight) {
    const scale = minLight/l;
    r = Math.min(1,r*scale);
    g = Math.min(1,g*scale);
    b = Math.min(1,b*scale);
  }
  const toHex = (x: number) => Math.round(x*255).toString(16).padStart(2,'0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert hex to rgba for border opacity
function hexToRGBA(hex: string, alpha = 1) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
  const r = parseInt(hex.slice(0,2),16);
  const g = parseInt(hex.slice(2,4),16);
  const b = parseInt(hex.slice(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export interface SoftwareCardProps {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  type: "Personal Project" | "Academic Project" | "Internship" | "Upcoming";
  imageUrl?: string;
  themeColor?: string;
  titleColor?: string;
  AIUsed?: string;
}

export const SoftwareCard = memo((props: Partial<SoftwareCardProps>) => {
  const {
    id, title, description, technologies = [],
    type, imageUrl, themeColor = "#8888ff", titleColor, AIUsed
  } = props;

  const isUpcoming = type === "Upcoming";

  const techBadges = useMemo(() => ({
    desktop: technologies.slice(0,3),
    mobile: technologies.slice(0,2),
  }), [technologies]);

  // Stable inner glow position and shape
  const glowProps = useMemo(() => {
    const seed = (id || title || "").split("").reduce((a,c)=>a+c.charCodeAt(0),0);
    const offsetX = 40 + (seed % 21 - 10); // ±10%
    const offsetY = 40 + ((seed>>3) % 21 -10);
    const scaleX = 1 + ((seed>>5)%20-10)/100;
    const scaleY = 1 + ((seed>>7)%20-10)/100;
    return { offsetX, offsetY, scaleX, scaleY };
  }, [id,title]);

  const borderColor = hexToRGBA(adjustHexBrightness(themeColor,0.5), 0.3);

  const cardContent = (
    <div className="relative w-full">
      {/* AI Sticker - overlapping card */}
      {AIUsed && (
        <>
          {/* Desktop - top left */}
          <div className="hidden md:block absolute -top-5 -left-5 z-30 pointer-events-none">
            <AISticker value={parseInt(AIUsed, 10)} size={58} />
          </div>

          {/* Mobile - top right */}
          <div className="md:hidden absolute -top-4 -right-4 z-30 pointer-events-none">
            <AISticker value={parseInt(AIUsed, 10)} size={40} />
          </div>
        </>
      )}

      {/* Card */}
      <Card
        className={`group relative overflow-hidden flex flex-col h-full md:min-h-[400px]
          transition-all duration-300 ${isUpcoming ? "cursor-default border-dashed border-2" : "cursor-pointer border-2 md:hover:-translate-y-2 md:hover:shadow-2xl"}`}
        style={{
          borderColor,
          boxShadow: `0 0 20px ${themeColor}20`,
          backgroundColor: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(6px)",
        }}
      >
        {/* Inner circular glow */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background: `radial-gradient(ellipse ${glowProps.scaleX*100}% ${glowProps.scaleY*100}% at ${glowProps.offsetX}% ${glowProps.offsetY}%, ${themeColor}80 0%, transparent 70%)`,
            filter: "blur(60px)",
            opacity: 0.8,
          }}
        />

        {/* Desktop Layout */}
        <div className={`hidden md:flex relative z-10 flex-col pointer-events-none ${isUpcoming ? "opacity-30" : ""}`}>
          {imageUrl && (
            <div className="relative w-full h-52 overflow-hidden rounded-t-md" style={{backgroundColor: `${themeColor}20`}}>
              <img src={`${imageUrl}/1.png`} alt={title||"Project"} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"/>
            </div>
          )}
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-semibold line-clamp-2 mb-2" style={{color: titleColor||"inherit"}}>{title}</h3>
            <p className="text-space-secondary leading-relaxed line-clamp-3 mb-4">{description}</p>
            <div className="flex flex-wrap gap-2 items-center">
              {techBadges.desktop.map(t => <Badge key={t} variant="secondary" className="bg-white/5 text-space-muted border text-xs" style={{borderColor}}>{t}</Badge>)}
              {technologies.length>3 && <Badge variant="secondary" className="bg-white/5 text-space-muted border text-xs" style={{borderColor}}>+{technologies.length-3}</Badge>}
            </div>
          </div>
        </div>

        {/* Mobile Layout - no hover effects */}
        <div className={`md:hidden relative z-10 flex flex-row pointer-events-none h-32 ${isUpcoming ? "opacity-30" : ""}`}>
          {imageUrl && (
            <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden rounded-l-md" style={{backgroundColor: `${themeColor}20`}}>
              <img src={`${imageUrl}/1.png`} alt={title||"Project"} className="absolute inset-0 w-full h-full object-cover object-center"/>
            </div>
          )}
          <div className="relative p-4 flex flex-col flex-grow">
            <h3 className="text-base font-semibold line-clamp-2 mb-2" style={{color: titleColor||"inherit"}}>{title}</h3>
            <div className="flex flex-wrap gap-1.5 items-start max-h-[48px] overflow-hidden">
              {techBadges.mobile.map(t => <Badge key={t} variant="secondary" className="bg-white/5 text-space-muted border text-xs" style={{borderColor}}>{t}</Badge>)}
              {technologies.length>2 && <Badge variant="secondary" className="bg-white/5 text-space-muted border text-xs" style={{borderColor}}>+{technologies.length-2}</Badge>}
            </div>
          </div>
        </div>

        {/* Arrow hover only on desktop */}
        {!isUpcoming && (
          <div className="hidden md:block absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <ArrowRight className="w-6 h-6 text-white" style={{filter:`drop-shadow(0 0 8px ${themeColor})`}}/>
          </div>
        )}
      </Card>
    </div>
  );

  return isUpcoming ? <div className="block w-full">{cardContent}</div> : <Link to={`/project/${id}`} className="block w-full">{cardContent}</Link>;
});

SoftwareCard.displayName = "SoftwareCard";
export default SoftwareCard;