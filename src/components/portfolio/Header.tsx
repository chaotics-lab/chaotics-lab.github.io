import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Starfield } from '@/components/Starfield';

interface HeaderProps {
  title?: string;
}

export const Header = ({ title = "Chaotics Lab" }: HeaderProps) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="relative overflow-hidden select-none">
      <Starfield />
      
      <div className="relative container mx-auto px-6 py-20 text-center z-10 space-y-8 max-w-4xl">
        <Badge
          variant="outline"
          className="border-space-border text-space-muted font-mono text-sm bg-space-surface/50 backdrop-blur-sm glow-subtle pulse-star mx-auto"
        >
          @PRISONLOX PRESENTS
        </Badge>

        {/* Chaotics logo */}
        <div className="flex justify-center items-center h-40">
          <img
            src="/img/logos/Chaotics White Transparent.png"
            alt="Chaotics Logo"
            className="w-full max-w-2xl object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 hover:drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"
          />
        </div>

        <p className="text-xl text-space-secondary max-w-2xl mx-auto leading-relaxed opacity-90">
          First came Chaos, vast and formless.
        </p>

        <div className="flex justify-center items-center gap-6 pt-6 flex-wrap">
          <div className="flex items-center gap-2 text-space-muted font-mono text-sm bg-space-surface/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-space-border/50 hover:bg-space-surface/50 transition-colors">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            Stars Aligned
          </div>
          <div className="w-1 h-1 bg-space-border rounded-full pulse-star" />
          <div className="text-space-muted font-mono text-sm bg-space-surface/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-space-border/50 hover:bg-space-surface/50 transition-colors">
            Est. 2025
          </div>
        </div>
      </div>
      <Separator className="bg-space-border/50 mt-12" />
    </header>
  );
};