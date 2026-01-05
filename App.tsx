
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ImageType, AnalysisResult } from './types';
import { analyzeImage } from './services/geminiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Header from './components/Header';
import ImageTypeSelector from './components/ImageTypeSelector';
import ImageUploader from './components/ImageUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import Login from './components/Login';
import SplashScreen from './components/SplashScreen';
import { 
  ArrowRightIcon, 
  SparklesIcon, 
  ActivityIcon,
  ShieldCheckIcon,
  CameraIcon,
  BarChartIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HeartPulseIcon,
  LungIcon,
  ScanIcon,
  EyeIcon,
  SkinIcon,
  RefreshCwIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClinicalAppLogo,
  BeakerIcon,
  TargetIcon,
  ZapIcon,
  WindIcon,
  BrainIcon,
  ClockIcon,
  WavesIcon
} from './components/icons/Icons';

interface ImageData {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

// DEFINICIÓN COMPLETA DE LAS 14 MODALIDADES
const MODALITY_SHORTCUTS = [
  { type: ImageType.ECG, label: 'ECG', icon: HeartPulseIcon },
  { type: ImageType.RX, label: 'Rayos X', icon: LungIcon },
  { type: ImageType.TC, label: 'TC Scan', icon: ScanIcon },
  { type: ImageType.RMN, label: 'Resonancia', icon: ActivityIcon },
  { type: ImageType.ECO, label: 'Ecografía', icon: WavesIcon },
  { type: ImageType.RETINA, label: 'Retina', icon: EyeIcon },
  { type: ImageType.DERMATOSCOPY, label: 'Dermo', icon: SkinIcon },
  { type: ImageType.URINALYSIS, label: 'Orina', icon: BeakerIcon },
  { type: ImageType.TOXICOLOGY, label: 'Tóxico', icon: BeakerIcon },
  { type: ImageType.NUCLEAR_MEDICINE, label: 'Nuclear', icon: TargetIcon },
  { type: ImageType.EMG, label: 'EMG', icon: ZapIcon },
  { type: ImageType.SPIROMETRY, label: 'Espiro', icon: WindIcon },
  { type: ImageType.EEG, label: 'EEG', icon: BrainIcon },
  { type: ImageType.HOLTER, label: 'Holter', icon: ClockIcon },
];

const ClinicalApp: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [selectedType, setSelectedType] = useState<ImageType>(ImageType.ECG);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightning, setLightning] = useState(false);
  
  const reelContainerRef = useRef<HTMLDivElement>(null);
  const storyCarouselRef = useRef<HTMLDivElement>(null);

  const triggerLightning = () => {
    setLightning(true);
    setTimeout(() => setLightning(false), 300);
  };

  const scrollToSlide = useCallback((index: number) => {
    if (index < 0 || index > 2) return;
    reelContainerRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth' });
    setCurrentSlide(index);
  }, []);

  const handleModalityChange = (type: ImageType) => {
    if (selectedType === type) return;
    triggerLightning();
    setSelectedType(type);
    
    // Auto scroll del carrusel para centrar el icono seleccionado
    const index = MODALITY_SHORTCUTS.findIndex(m => m.type === type);
    if (storyCarouselRef.current) {
        const item = storyCarouselRef.current.children[index] as HTMLElement;
        if (item) {
            storyCarouselRef.current.scrollTo({
                left: item.offsetLeft - (storyCarouselRef.current.offsetWidth / 2) + (item.offsetWidth / 2),
                behavior: 'smooth'
            });
        }
    }
  };

  const navigateModality = (direction: 'next' | 'prev') => {
    const currentIndex = MODALITY_SHORTCUTS.findIndex(m => m.type === selectedType);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % MODALITY_SHORTCUTS.length;
    } else {
      nextIndex = (currentIndex - 1 + MODALITY_SHORTCUTS.length) % MODALITY_SHORTCUTS.length;
    }
    handleModalityChange(MODALITY_SHORTCUTS[nextIndex].type);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') scrollToSlide(currentSlide + 1);
      if (e.key === 'ArrowUp') scrollToSlide(currentSlide - 1);
      if (e.key === 'ArrowRight' && currentSlide === 0) navigateModality('next');
      if (e.key === 'ArrowLeft' && currentSlide === 0) navigateModality('prev');
      if (e.key === ' ') {
        e.preventDefault();
        scrollToSlide(currentSlide + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, selectedType, scrollToSlide]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500); 
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = () => {
    if (!reelContainerRef.current) return;
    const scrollPos = reelContainerRef.current.scrollTop;
    const height = reelContainerRef.current.clientHeight;
    const index = Math.round(scrollPos / height);
    if (index !== currentSlide) setCurrentSlide(index);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageData({
        base64: result.split(',')[1],
        mimeType: file.type || 'image/png',
        previewUrl: result,
      });
      setTimeout(() => scrollToSlide(1), 500);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageData) return;
    setLoading(true);
    setAnalysisResult(null);
    setError('');
    scrollToSlide(2);
    try {
      const result = await analyzeImage(imageData.base64, imageData.mimeType, selectedType);
      setAnalysisResult(result);
    } catch (err) {
      setError('Error en el motor clínico. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading && !showSplash) return null;
  if (!isAuthenticated) return <Login onInstallClick={() => {}} isAppInstalled={false} />;

  return (
    <>
      <div className={`lightning-flash ${lightning ? 'lightning-active' : ''}`} />
      <SplashScreen isVisible={showSplash} />
      
      {/* HUD OVERLAY - CAROUSEL & NAVIGATION */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-6 pt-10">
        <div className="max-w-xl mx-auto flex flex-col gap-6">
          <div className="flex justify-between items-center pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/10 flex items-center gap-4 shadow-2xl">
              <div className="w-3 h-3 rounded-full bg-brand-accent animate-pulse shadow-[0_0_15px_#39ff14]"></div>
              <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white/90">Android Heal Core</span>
            </div>
            <div className="bg-white/10 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/10 text-[11px] font-black text-brand-secondary uppercase tracking-widest">
              Slide {currentSlide + 1} / 3
            </div>
          </div>

          {/* STORY REEL SELECTOR CON FLECHAS LATERALES */}
          <div className="pointer-events-auto flex items-center gap-4">
            <button 
                onClick={() => navigateModality('prev')}
                className="p-4 bg-black/40 hover:bg-brand-secondary/40 rounded-full border border-white/10 text-white transition-all backdrop-blur-xl active:scale-90 shadow-xl"
            >
                <ChevronLeftIcon className="h-6 w-6" />
            </button>
            
            <div className="flex-1 horizontal-carousel glass-morphism p-4 rounded-full overflow-hidden" ref={storyCarouselRef}>
               {MODALITY_SHORTCUTS.map((item) => (
                 <button 
                  key={`${item.type}-${item.label}`}
                  onClick={() => handleModalityChange(item.type)}
                  className={`carousel-item flex flex-col items-center gap-1.5 group transition-all transform active:scale-90`}
                 >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${selectedType === item.type ? 'bg-brand-secondary border-white shadow-[0_0_35px_#0ea5e9]' : 'bg-white/5 border-white/10 group-hover:border-brand-secondary/50'}`}>
                       <item.icon className={`h-7 w-7 ${selectedType === item.type ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${selectedType === item.type ? 'text-brand-secondary' : 'text-white/40'}`}>{item.label}</span>
                 </button>
               ))}
            </div>

            <button 
                onClick={() => navigateModality('next')}
                className="p-4 bg-black/40 hover:bg-brand-secondary/40 rounded-full border border-white/10 text-white transition-all backdrop-blur-xl active:scale-90 shadow-xl"
            >
                <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* LARGE LIQUID PROGRESS INDICATOR (BARRA DE SCROLL) */}
      <div className="liquid-progress pointer-events-auto cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const percent = y / rect.height;
        scrollToSlide(Math.round(percent * 2));
      }}>
        <div 
          className="liquid-thumb" 
          style={{ 
            height: '33.33%', 
            top: `${currentSlide * 33.33}%`
          }} 
        />
      </div>

      <div 
        ref={reelContainerRef} 
        onScroll={handleScroll}
        className="reel-container"
      >
        
        {/* SLIDE 1: MODALITY HERO */}
        <section className="reel-slide flex flex-col items-center justify-center p-6 pt-40">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-secondary/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
             <div className="mb-14 transform hover:scale-110 transition-transform duration-1000 group">
                <div className="w-40 h-40 bg-brand-secondary/5 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_120px_#0ea5e922] relative">
                   <div className="absolute inset-0 bg-brand-secondary/10 rounded-full animate-ping opacity-20"></div>
                   <ClinicalAppLogo className="h-32 w-32 relative z-10" />
                </div>
             </div>
             <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4 text-center neon-text-blue leading-none">
                Inteligencia <br/> <span className="text-brand-secondary">Clínica</span>
             </h2>
             <p className="text-white/30 text-[12px] font-bold uppercase tracking-[0.6em] mb-16 text-center">Protocolo de Análisis Neuronal Activo</p>
             
             <div className="w-full glass-morphism p-12 rounded-[4.5rem] border border-white/10 ring-1 ring-white/10 shadow-3xl">
                <ImageTypeSelector selectedType={selectedType} onTypeChange={handleModalityChange} />
             </div>
             
             <button 
                onClick={() => scrollToSlide(1)}
                className="mt-16 flex flex-col items-center gap-4 group"
             >
                <span className="text-[12px] font-black text-brand-secondary uppercase tracking-[0.8em] animate-pulse">Explorar</span>
                <ChevronDownIcon className="h-10 w-10 text-brand-secondary group-hover:translate-y-4 transition-transform duration-700" />
             </button>
          </div>
        </section>

        {/* SLIDE 2: INPUT & ANALYSIS */}
        <section className="reel-slide flex flex-col items-center justify-center p-6">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-accent/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="w-full max-w-lg space-y-14 flex flex-col items-center">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter neon-text-green leading-none">Carga de <br/>Evidencia</h2>
              <p className="text-brand-accent/60 text-[12px] font-black uppercase tracking-[0.7em]">Procesamiento Computacional</p>
            </div>
            
            <div className="w-full transform transition-all duration-1000 hover:scale-[1.04]">
              <ImageUploader onImageUpload={handleImageUpload} previewUrl={imageData?.previewUrl} onClear={() => setImageData(null)} />
            </div>
            
            {imageData && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-11 bg-brand-secondary rounded-full shadow-[0_45px_90px_rgba(14,165,233,0.6)] neo-button group relative overflow-hidden ring-4 ring-white/10"
              >
                 <span className="flex items-center justify-center gap-7 text-white font-black text-3xl uppercase tracking-widest italic">
                    {loading ? <SparklesIcon className="animate-spin h-10 w-10" /> : <>Interpretar <SparklesIcon className="h-11 w-11 group-hover:rotate-180 transition-transform duration-700" /></>}
                 </span>
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            )}
          </div>
        </section>

        {/* SLIDE 3: DIAGNOSTIC RESULTS */}
        <section className="reel-slide overflow-y-auto pt-44 pb-56">
          <div className="w-full max-w-lg mx-auto px-6">
            <div className="text-center mb-20 flex flex-col items-center gap-8">
               <div className="w-20 h-2 bg-brand-secondary rounded-full shadow-[0_0_20px_#0ea5e9]"></div>
               <span className="text-[13px] font-black uppercase tracking-[0.8em] text-white/50">Informe Médico AI</span>
            </div>
            <AnalysisDisplay loading={loading} error={error} result={analysisResult} previewUrl={imageData?.previewUrl} />
            
            <button 
              onClick={() => { triggerLightning(); scrollToSlide(0); }}
              className="mt-24 w-full py-9 glass-morphism rounded-full border border-brand-secondary/40 text-[13px] font-black uppercase tracking-[0.6em] text-brand-secondary hover:bg-brand-secondary/30 transition-all flex items-center justify-center gap-5 shadow-2xl"
            >
              Nuevo Diagnóstico <RefreshCwIcon className="h-6 w-6" />
            </button>
          </div>
        </section>
      </div>

      {/* DOCK NAVIGATION (ULTRA-ROUNDED) */}
      <nav className="fixed bottom-14 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-8">
         <div className="glass-morphism rounded-full p-3.5 flex justify-between items-center shadow-[0_60px_120px_rgba(0,0,0,0.95)] ring-1 ring-white/20">
            <button onClick={() => scrollToSlide(0)} className={`flex-1 flex justify-center py-6 rounded-full transition-all ${currentSlide === 0 ? 'bg-white/15 text-brand-secondary shadow-xl scale-95' : 'text-white/30 hover:text-white'}`}>
              <BarChartIcon className="h-9 w-9" />
            </button>
            <button onClick={() => scrollToSlide(1)} className={`flex-1 flex justify-center py-6 rounded-full transition-all ${currentSlide === 1 ? 'bg-white/15 text-brand-secondary shadow-xl scale-95' : 'text-white/30 hover:text-white'}`}>
              <CameraIcon className="h-9 w-9" />
            </button>
            <div className="relative group px-4">
               <div className="absolute -inset-6 bg-brand-secondary/50 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-24 h-24 bg-brand-secondary rounded-full flex items-center justify-center shadow-[0_25px_50px_rgba(14,165,233,0.6)] transform -translate-y-12 neo-button border-4 border-[#001219] active:scale-90 transition-all">
                  <SparklesIcon className="h-11 w-11 text-white" />
               </div>
            </div>
            <button onClick={() => scrollToSlide(2)} className={`flex-1 flex justify-center py-6 rounded-full transition-all ${currentSlide === 2 ? 'bg-white/15 text-brand-secondary shadow-xl scale-95' : 'text-white/30 hover:text-white'}`}>
              <ActivityIcon className="h-9 w-9" />
            </button>
            <button onClick={() => window.open('https://wa.me/34670887715', '_blank')} className="flex-1 flex justify-center py-6 rounded-full text-white/30 hover:text-brand-accent transition-all">
              <ShieldCheckIcon className="h-9 w-9" />
            </button>
         </div>
      </nav>
    </>
  );
};

const App: React.FC = () => <AuthProvider><ClinicalApp /></AuthProvider>;
export default App;
