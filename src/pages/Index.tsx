import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhatIs from "@/components/WhatIs";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import InstallSection from "@/components/InstallSection";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <WhatIs />
        <Features />
        <HowItWorks />
        <InstallSection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
