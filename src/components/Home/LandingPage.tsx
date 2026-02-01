import React, { useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import AppsSection from './AppsSection';
import FeaturesSection from './FeaturesSection';
import BenefitsSection from './BenefitsSection';
import TestimonialsSection from './TestimonialsSection';
import StepsSection from './StepsSection';
import ContactSection from './ContactSection';
import Footer from './Footer';

const LandingPage: React.FC = () => {
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollBehavior = 'smooth';
    return () => {
      root.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div
      className={`min-h-screen w-full relative overflow-x-hidden selection:bg-blue-600 selection:text-white ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}
    >

      <Navigation />
      <HeroSection />
      <AppsSection />
      <FeaturesSection />
      <BenefitsSection />
      <TestimonialsSection />
      <StepsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
