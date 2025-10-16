import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Github, Linkedin, Sparkles } from "lucide-react";

interface FooterProps {
  githubUrl?: string;
  linkedinUrl?: string;
}

export const Footer = ({
  githubUrl = "https://github.com/yourusername",
  linkedinUrl = "https://linkedin.com/in/yourusername"
}: FooterProps) => {
  return (
    <footer className="border-t border-space-border mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Top Section with Social Links */}
          <div className="text-center space-y-6">
            <Badge
              variant="outline"
              className="border-space-border text-space-muted font-mono text-xs bg-space-surface/30"
            >
              END OF TRANSMISSION
            </Badge>
           
            <p className="text-space-muted font-mono text-sm">
              Building tomorrow's software, today.
            </p>

            {/* Social Links */}
            <div className="flex justify-center items-center gap-4 pt-2">
              <a
                href={"https://github.com/Loxed"}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-full bg-space-surface/30 backdrop-blur-sm border border-space-border/50 hover:border-space-border transition-all duration-300 hover:scale-110"
              >
                <Github className="w-5 h-5 text-space-muted group-hover:text-white transition-colors" />
                <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-colors" />
              </a>

              <div className="w-1 h-1 bg-space-border rounded-full" />

              <a
                href={"https://www.linkedin.com/in/leopold-rombaut/"}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-2.5 rounded-full bg-space-surface/30 backdrop-blur-sm border border-space-border/50 hover:border-[#0A66C2]/50 transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="w-5 h-5 text-space-muted group-hover:text-[#0A66C2] transition-colors" />
                <div className="absolute inset-0 rounded-full bg-[#0A66C2]/0 group-hover:bg-[#0A66C2]/10 transition-colors" />
              </a>
            </div>
          </div>
         
          <Separator className="bg-space-border" />
         
          {/* Bottom Info */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-space-muted">
            <div className="font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-space-border" />
              © 2025 Software Portfolio. All systems operational.
            </div>
           
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-mono text-xs">Status: Active</span>
              </div>
             
              <div className="text-space-border">•</div>
             
              <div className="font-mono text-xs">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};