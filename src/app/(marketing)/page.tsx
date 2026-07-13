"use client";

// Reading this as: AI-powered voice interview landing page for software engineers and candidates, with a premium dark-tech / hacker vibe language, leaning toward Tailwind v4 utility constraints + restrained Framer Motion animations.
// Dials:
//   DESIGN_VARIANCE: 7 (Clean SaaS structure with asymmetric bento breaks)
//   MOTION_INTENSITY: 5 (Restrained, responsive physics scroll effects)
//   VISUAL_DENSITY: 3 (Airy, premium display typography and generous negative spaces)

import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import DemoPreviewSection from "@/components/landing/DemoPreviewSection";
import InterviewTypesSection from "@/components/landing/InterviewTypesSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialSection from "@/components/landing/TestimonialSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";

export default function MarketingPage() {
  return (
    <div className="bg-black min-h-screen text-white select-none scroll-smooth">
      <LandingNavbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <DemoPreviewSection />
      <InterviewTypesSection />
      <FeaturesSection />
      <TestimonialSection />
      <FinalCTASection />
      {/* <Footer /> */}
    </div>
  );
}
