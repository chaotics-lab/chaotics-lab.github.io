import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Header } from "@/components/portfolio/Header";
import { Footer } from "@/components/portfolio/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 — no route matched:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="bg-background starfield min-h-screen">
      <Header />

      <main className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <p className="text-space-muted font-mono text-sm uppercase tracking-widest mb-4">
          404
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Page not found
        </h1>
        <p className="text-space-muted font-ui text-base max-w-md mb-10">
          Whatever was here either moved, never existed, or drifted off into the void.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-ui hover:bg-white/10 hover:border-white/25 transition-all duration-200"
        >
          Back to home
        </Link>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;  