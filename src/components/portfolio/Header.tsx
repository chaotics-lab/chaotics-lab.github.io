import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShaderSVG } from '../ShaderSVG';
import {Starfield } from '../Starfield'; // Import the new Starfield component

interface HeaderProps {
  title?: string;
}

export const Header = ({ title = "Chaotics Lab" }: HeaderProps) => {
  return (
    <header className="relative overflow-hidden select-none">
      {/* The starfield background, positioned absolutely to fill the header */}
      <Starfield />
      
      {/* Main content, with z-10 to ensure it's on top of the background */}
      <div className="relative container mx-auto px-6 py-20 text-center z-10 space-y-8 max-w-4xl">
        <Badge
          variant="outline"
          className="border-space-border text-space-muted font-mono text-sm bg-space-surface/50 backdrop-blur-sm glow-subtle pulse-star mx-auto">
          @PRISONLOX PRESENTS
        </Badge>
        
        {/* SVG Logo Container (no changes here) */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl h-32 md:h-40">
            <ShaderSVG />
          </div>
        </div>
        
        <p className="text-xl text-space-secondary max-w-2xl mx-auto leading-relaxed opacity-90">
          First came Chaos, vast and formless.
        </p>
        
        <div className="flex justify-center items-center gap-6 pt-6">
          <div className="flex items-center gap-2 text-space-muted font-mono text-sm bg-space-surface/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-space-border/50">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Stars Aligned
          </div>
          <div className="w-1 h-1 bg-space-border rounded-full pulse-star" />
          <div className="text-space-muted font-mono text-sm bg-space-surface/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-space-border/50">
            Est. 2025
          </div>
        </div>
      </div>
      <Separator className="bg-space-border mt-12" />
    </header>
  );
};