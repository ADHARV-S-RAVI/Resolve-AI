import { SplineRobot, WhiteScrim } from "@/components/landing/Backdrop";
import { CtaBand } from "@/components/landing/CtaBand";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";

const Index = () => {
  return (
    <div className="relative min-h-full w-full overflow-y-auto bg-white antialiased">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[880px]">
          <SplineRobot />
          <WhiteScrim />
        </div>
        <div className="pointer-events-none relative z-10">
          <Navbar />
          <Hero />
        </div>
      </div>
      <FeatureGrid />
      <CtaBand />
    </div>
  );
};

export default Index;
