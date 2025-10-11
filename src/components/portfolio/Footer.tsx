import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="border-t border-space-border mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <Badge 
              variant="outline" 
              className="border-space-border text-space-muted font-mono text-xs bg-space-surface/30"
            >
              END OF TRANSMISSION
            </Badge>
            
            <p className="text-space-muted font-mono text-sm">
              Building tomorrow's software, today.
            </p>
          </div>
          
          <Separator className="bg-space-border" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-space-muted">
            <div className="font-mono">
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