
import React, { useEffect, useState } from 'react';
import { ClinicalAppLogo } from './icons/Icons';

interface SplashScreenProps {
  isVisible: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible }) => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => setShouldRender(false), 700); // Wait for fade-out animation
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-dark transition-opacity duration-700 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative flex flex-col items-center animate-fade-in">
        
        {/* Animated Rings */}
        <div className="absolute inset-0 bg-brand-secondary/20 rounded-full animate-ping blur-xl"></div>
        <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-pulse-fast blur-lg"></div>
        
        {/* Logo - Updated to use new styling */}
        <div className="relative mb-8 shadow-2xl rounded-2xl overflow-hidden">
            <ClinicalAppLogo className="h-28 w-28 text-brand-secondary animate-pulse" />
        </div>

        {/* Text */}
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Clinical<span className="text-brand-secondary">Intelligence</span>
        </h1>
        <p className="text-brand-accent/80 text-sm font-medium tracking-widest uppercase">
          AI Diagnostic Assistant
        </p>

        {/* Loader Bar */}
        <div className="mt-12 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-secondary animate-[loading_2s_ease-in-out_infinite] w-1/2 rounded-full"></div>
        </div>
        
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
      
      <div className="absolute bottom-8 text-gray-500 text-xs">
         Secure Environment • HIPAA Compliant
      </div>
    </div>
  );
};

export default SplashScreen;
