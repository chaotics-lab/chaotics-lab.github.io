import { Header } from "@/components/portfolio/Header";
import { SoftwareGrid } from "@/components/portfolio/SoftwareGrid";
import { Footer } from "@/components/portfolio/Footer";

const Index = () => {
  return (
    <div className="bg-background starfield">
      <Header />
      <SoftwareGrid />
      <Footer />
    </div>
  );
};

export default Index;
