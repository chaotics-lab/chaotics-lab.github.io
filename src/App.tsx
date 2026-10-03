import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { PageTransition } from "@/components/site/PageTransition";
import Index from "./pages/Index";
import ProjectPage from "./pages/ProjectPage";
import BlogPage from "./pages/BlogPage";
import BlogSlugPage from "./pages/BlogSlugPage";
import BlogPostPage from "./pages/BlogPostPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Each page fades in when the path changes (the sea transition covers the
// swap when it is used).
const AppRoutes = () => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="pt-page">
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/project/:projectId" element={<ProjectPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:seriesId/:postSlug" element={<BlogPostPage />} />
        <Route path="/blog/:slug" element={<BlogSlugPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageTransition>
          <AppRoutes />
        </PageTransition>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;