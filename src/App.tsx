import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Starfield } from "@/components/Starfield";
import Index from "./pages/Index";
import SoftwarePage from "@/components/portfolio/SoftwarePage";
import BlogPage from "./pages/BlogPage";
import BlogSlugPage from "./pages/BlogSlugPage";
import BlogPostPage from "./pages/BlogPostPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Global starfield background */}
        {/* <Starfield /> */}
        
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/project/:projectId" element={<SoftwarePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:seriesId/:postSlug" element={<BlogPostPage />} />
          <Route path="/blog/:slug" element={<BlogSlugPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;