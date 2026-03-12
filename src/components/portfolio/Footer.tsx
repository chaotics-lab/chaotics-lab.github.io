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
              className="border-space-border text-space-muted font-ui text-xs bg-space-surface/30"
            >
              END OF TRANSMISSION
            </Badge>
           
            <p className="text-space-muted font-ui text-sm">
              Exploring new ideas and building cool things.
            </p>

            <div className="flex justify-center gap-6">
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-space-muted hover:text-white transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-space-muted hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
         
          <Separator className="bg-space-border" />
         
          {/* Bottom Info */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-space-muted">
            <div className="font-ui flex items-center gap-2">
              © {new Date().getFullYear()} Chaotics Lab. All rights reserved.
            </div>
           
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-ui text-xs">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};