import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TransitionLink } from "@/components/site/TransitionLink";
import { ArrowLeft } from "@phosphor-icons/react";
import { SiteLayout } from "@/components/site/SiteLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 — no route matched:", location.pathname);
  }, [location.pathname]);

  return (
    <SiteLayout>
      <main className="container mx-auto px-5 sm:px-8 pt-40 pb-10">
        <p className="h-caps text-xs text-[var(--h-c2)]">404</p>
        <h1 className="mt-4 h-display text-[clamp(3rem,9vw,7rem)]">Page not found</h1>
        <p className="mt-6 text-lg text-[var(--h-c3)]">Whatever was here either moved or never existed.</p>
        <TransitionLink to="/" className="mt-10 h-btn h-btn-cream">
          <ArrowLeft size={16} weight="bold" /> Back to home
        </TransitionLink>
      </main>
    </SiteLayout>
  );
};

export default NotFound;
