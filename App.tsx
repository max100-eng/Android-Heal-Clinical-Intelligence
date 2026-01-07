import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ImageType, AnalysisResult, PatientHealthContext } from './types';
import { analyzeImage } from './services/geminiService';
import { fetchHealthData } from './services/healthService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import ImageUploader from './components/ImageUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import Login from './components/Login';
import SplashScreen from './components/SplashScreen';
import CaseLibrary, { ClinicalExample } from './components/CaseLibrary';
import { 
  SparklesIcon, 
  ActivityIcon,
  ShieldCheckIcon,
  CameraIcon,
  BarChartIcon,
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
  WavesIcon,
  ChevronDownIcon,
  EarIcon,
  FlaskConicalIcon,
  VisionHeadsetIcon,
  BookCheckIcon,
  MicroscopeIcon,
  WaveformIcon
} from './components/icons/Icons';

interface ImageData {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

const MODALITY_SHORTCUTS = [
  { type: ImageType.ECG, label: 'ECG', icon: HeartPulseIcon },
  { type: ImageType.POCUS, label: 'POCUS', icon: WaveformIcon },
  { type: ImageType.HEMATOLOGY, label: 'Hemat.', icon: MicroscopeIcon },
  { type: ImageType.SPIROMETRY, label: 'Espiro', icon: WindIcon },
  { type: ImageType.OTOSCOPY, label: 'Otosc.', icon: EarIcon },
  { type: ImageType.OPHTHALMOSCOPY, label: 'Oftalm.', icon: EyeIcon },
  { type: ImageType.IONOGRAM, label: 'Ionog.', icon: BeakerIcon },
  { type: ImageType.EMG, label: 'EMG', icon: ZapIcon },
  { type: ImageType.RX, label: 'Rayos X', icon: LungIcon },
  { type: ImageType.RETINA, label: 'Retina', icon: EyeIcon },
  { type: ImageType.DERMATOSCOPY, label: 'Dermo', icon: SkinIcon },
  { type: ImageType.TC, label: 'TC Scan', icon: ScanIcon },
  { type: ImageType.EEG, label: 'EEG', icon: BrainIcon },
  { type: ImageType.RMN, label: 'RMN', icon: ActivityIcon },
  { type: ImageType.ECO, label: 'Ecografía', icon: WavesIcon },
  { type: ImageType.UROGRAPHY, label: 'Urograf.', icon: FlaskConicalIcon },
  { type: ImageType.URINALYSIS, label: 'Orina', icon: BeakerIcon },
  { type: ImageType.TOXICOLOGY, label: 'Tóxico', icon: BeakerIcon },
  { type: ImageType.NUCLEAR_MEDICINE, label: 'Nuclear', icon: TargetIcon },
  { type: ImageType.HOLTER, label: 'Holter', icon: ClockIcon },
];

const ClinicalApp: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [selectedType, setSelectedType] = useState<ImageType>(ImageType.ECG);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [healthData, setHealthData] = useState<PatientHealthContext | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightning, setLightning] = useState(false);
  const [isVisionMode, setIsVisionMode] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [modalityAnimKey, setModalityAnimKey] = useState(0);
  
  const reelContainerRef = useRef<HTMLDivElement>(null);
  const bottomCarouselRef = useRef<HTMLDivElement>(null);

  const triggerLightning = () => {
    setLightning(true);
    setModalityAnimKey(prev => prev + 1);
    setTimeout(() => setLightning(false), 400);
  };

  const scrollToSlide = useCallback((index: number) => {
    if (index < 0 || index > 2) return;
    reelContainerRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth' });
    setCurrentSlide(index);
  }, []);

  const handleAnalyze = async () => {
    if (!imageData) {
      scrollToSlide(1);
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const vitals = await fetchHealthData();
      setHealthData(vitals);
      const result = await analyzeImage(imageData.base64, imageData.mimeType, selectedType, vitals);
      setAnalysisResult(result);
      scrollToSlide(2);
    } catch (err) {
      setError('Error en la sincronización o motor clínico.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExample = (example: ClinicalExample) => {
    setShowLibrary(false);
    setLoading(true);
    triggerLightning();
    setSelectedType(example.modality);
    setImageData({
      base64: '', 
      mimeType: 'image/jpeg',
      previewUrl: example.placeholderUrl
    });
    
    setTimeout(() => {
      setAnalysisResult(example.analysis);
      setHealthData(null);
      setLoading(false);
      scrollToSlide(2);
    }, 1200);
  };

  const handleModalityChange = (type: ImageType) => {
    if (selectedType === type) return;
    triggerLightning();
    setSelectedType(type);
    const index = MODALITY_SHORTCUTS.findIndex(m => m.type === type);
    if (bottomCarouselRef.current) {
        const item = bottomCarouselRef.current.children[index] as HTMLElement;
        if (item) {
            bottomCarouselRef.current.scrollTo({
                left: item.offsetLeft - (bottomCarouselRef.current.offsetWidth / 2) + (item.offsetWidth / 2),
                behavior: 'smooth'
            });
        }
    }
  };

  const navigateModality = (direction: 'next' | 'prev') => {
    const currentIndex = MODALITY_SHORTCUTS.findIndex(m => m.type === selectedType);
    let nextIndex = direction === 'next' ? (currentIndex + 1) % MODALITY_SHORTCUTS.length : (currentIndex - 1 + MODALITY_SHORTCUTS.length) % MODALITY_SHORTCUTS.length;
    handleModalityChange(MODALITY_SHORTCUTS[nextIndex].type);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500); 
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = () => {
    if (!reelContainerRef.current) return;
    const index = Math.round(reelContainerRef.current.scrollTop / reelContainerRef.current.clientHeight);
    if (index !== currentSlide) setCurrentSlide(index);
  };

  const handleImageUpload = (file: File, isAnnotation: boolean = false) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageData({ base64: result.split(',')[1], mimeType: file.type || 'image/png', previewUrl: result });
      if (!isAnnotation) setTimeout(() => scrollToSlide(1), 500);
    };
    reader.readAsDataURL(file);
  };

  const activeModality = MODALITY_SHORTCUTS.find(m => m.type === selectedType) || MODALITY_SHORTCUTS[0];
  const ActiveModalityIcon = activeModality.icon;

  if (authLoading && !showSplash) return null;
  if (!isAuthenticated) return <Login onInstallClick={() => {}} isAppInstalled={false} />;

  return (
    <div className={`app-wrapper ${isVisionMode ? 'vision-theme' : ''}`}>
      <div className={`lightning-flash ${lightning ? 'lightning-active' : ''}`} />
      <SplashScreen isVisible={showSplash} />
      {showLibrary && <CaseLibrary onSelect={handleSelectExample} onClose={() => setShowLibrary(false)} />}
      
      {/* Dynamic Indicators */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5 pointer-events-none sm:right-6">
        {[0, 1, 2].map(idx => (
          <button 
            key={idx} 
            onClick={() => scrollToSlide(idx)}
            className={`w-1 transition-all duration-500 rounded-full pointer-events-auto ${currentSlide === idx ? 'h-10 bg-brand-accent shadow-[0_0_15px_#39ff14]' : 'h-2.5 bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>

      {/* Persistent HUD Header */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-4 pt-safe-top sm:p-6">
        <div className="max-w-xl mx-auto flex justify-between items-center pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-3xl px-3 py-1.5 rounded-2xl border border-white/5 flex items-center gap-2 shadow-2xl sm:px-4">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/80 sm:text-[10px]">AndroidHeal v1.5</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowLibrary(true)}
              className="p-2.5 rounded-xl border bg-white/5 border-white/10 text-white/60 hover:text-brand-secondary hover:border-brand-secondary transition-all active:scale-90"
            >
              <BookCheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button 
              onClick={() => setIsVisionMode(!isVisionMode)}
              className={`p-2.5 rounded-xl border transition-all duration-500 active:scale-90 ${isVisionMode ? 'bg-brand-accent border-white text-black shadow-[0_0_20px_rgba(57,255,20,0.5)]' : 'bg-white/5 border-white/10 text-white/60'}`}
            >
              <VisionHeadsetIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={reelContainerRef} onScroll={handleScroll} className="reel-container">
        {/* Slide 1: Welcome & Active Modality */}
        <section className="reel-slide flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-secondary/10 via-transparent to-brand-dark pointer-events-none"></div>
          
          <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 glass-morphism animate-breath sm:w-28 sm:h-28">
                <ClinicalAppLogo className="h-14 w-14 sm:h-20 sm:w-20" />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-tight mb-2 sm:text-5xl">Protocolo <br/> <span className="text-brand-secondary">ACTIVO</span></h2>
            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] mb-12 sm:text-[11px]">Grado Hospitalario</p>
            
            <div 
              key={`${selectedType}-${modalityAnimKey}`} 
              className={`flex flex-col items-center gap-4 p-8 w-full bg-white/5 rounded-[2.5rem] border border-white/10 mb-10 transition-all duration-700 animate-lightning-icon ${isVisionMode ? 'glass-morphism shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] scale-105 active-glow' : 'shadow-xl'}`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-brand-secondary/20 blur-2xl rounded-full animate-pulse"></div>
                <ActiveModalityIcon className="h-16 w-16 text-brand-secondary relative z-10 sm:h-20 sm:w-20" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-widest sm:text-4xl">{activeModality.label}</h3>
            </div>
            
            <button onClick={() => scrollToSlide(1)} className="flex flex-col items-center gap-3 text-brand-secondary/80 hover:text-brand-accent transition-colors group">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all">Siguiente Fase</span>
              <ChevronDownIcon className="h-6 w-6 animate-bounce" />
            </button>
          </div>
        </section>

        {/* Slide 2: Capture */}
        <section className="reel-slide flex flex-col items-center justify-center p-4 sm:p-10">
          <div className="w-full max-w-md space-y-6 flex flex-col items-center">
            <div className="text-center">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-brand-accent sm:text-4xl">Captura Médica</h2>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Sincronización de Imagen</p>
            </div>
            <div className="w-full h-[50svh] sm:h-[55svh] flex items-center transition-all">
              <ImageUploader onImageUpload={handleImageUpload} previewUrl={imageData?.previewUrl} onClear={() => setImageData(null)} />
            </div>
            {imageData && (
              <button onClick={handleAnalyze} disabled={loading} className="w-full py-6 bg-brand-secondary rounded-3xl shadow-2xl neo-button group">
                <span className="flex items-center justify-center gap-3 text-white font-black text-lg uppercase italic sm:text-xl">
                  {loading ? <RefreshCwIcon className="animate-spin h-6 w-6" /> : <>Ejecutar Análisis <SparklesIcon className="h-6 w-6" /></>}
                </span>
              </button>
            )}
          </div>
        </section>

        {/* Slide 3: Results */}
        <section className="reel-slide overflow-y-auto pt-24 pb-48 sm:pt-32">
          <div className="w-full max-w-md mx-auto px-6">
            <AnalysisDisplay 
              loading={loading} 
              error={error} 
              result={analysisResult} 
              previewUrl={imageData?.previewUrl} 
              healthData={healthData}
            />
            <button 
              onClick={() => { triggerLightning(); scrollToSlide(0); }} 
              className="mt-8 mb-12 w-full py-6 glass-morphism rounded-3xl border border-white/10 text-[11px] font-black uppercase tracking-[0.3em] text-brand-secondary flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95"
            >
              Nuevo Diagnóstico <RefreshCwIcon className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>

      {/* Main Navigation Hub - Optimized for thumb interaction */}
      <nav className="fixed bottom-0 left-0 right-0 z-[60] pb-safe-bottom px-4 mb-4">
        <div className="max-w-md mx-auto relative group">
          <div className={`glass-morphism rounded-[2.5rem] p-3 flex flex-col gap-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] border border-white/10 transition-all duration-700 ${isVisionMode ? 'bg-white/10 ring-2 ring-brand-accent/20' : ''}`}>
            
            {/* Quick Access Icons */}
            <div className="flex justify-around items-center px-2 border-b border-white/5 pb-2">
              {[BarChartIcon, CameraIcon, ActivityIcon, ShieldCheckIcon].map((Icon, i) => (
                <button 
                  key={i} 
                  onClick={() => i < 3 ? scrollToSlide(i) : window.open('https://wa.me/34670887715')} 
                  className={`p-3 rounded-2xl transition-all duration-300 active:scale-90 ${currentSlide === i ? 'text-brand-accent bg-white/5 shadow-inner' : 'text-white/30 hover:text-white/60'}`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              ))}
            </div>

            {/* Carousel Hub - Centered Snap Selection */}
            <div className="relative flex items-center h-16 sm:h-20">
              <button 
                onClick={() => navigateModality('prev')} 
                className="absolute left-0 z-20 p-2 text-white/30 hover:text-white transition-colors bg-brand-dark/60 backdrop-blur-md rounded-r-xl active:scale-90"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              
              <div 
                ref={bottomCarouselRef} 
                className="flex-1 horizontal-carousel px-10 py-1 gap-6 overflow-x-auto"
              >
                {MODALITY_SHORTCUTS.map((item) => {
                  const Icon = item.icon;
                  const isActive = selectedType === item.type;
                  return (
                    <button 
                      key={item.type} 
                      onClick={() => handleModalityChange(item.type)} 
                      className={`carousel-item flex flex-col items-center justify-center gap-1.5 min-w-[56px] sm:min-w-[70px] active:scale-90`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 sm:w-14 sm:h-14 ${isActive ? `bg-brand-secondary border-white scale-110 shadow-[0_0_20px_rgba(14,165,233,0.5)] rotate-2` : 'bg-white/5 border-white/5 opacity-30'}`} key={isActive ? modalityAnimKey : item.type}>
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'text-white' : 'text-white/80'}`} />
                      </div>
                      <span className={`text-[7px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'text-brand-secondary opacity-100' : 'text-white/10 opacity-0'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => navigateModality('next')} 
                className="absolute right-0 z-20 p-2 text-white/30 hover:text-white transition-colors bg-brand-dark/60 backdrop-blur-md rounded-l-xl active:scale-90"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Central Fab Trigger */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <button 
              onClick={handleAnalyze} 
              disabled={loading} 
              className={`w-16 h-16 bg-brand-secondary rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(14,165,233,0.5)] border-[5px] border-brand-dark pointer-events-auto active:scale-90 transition-all sm:w-20 sm:h-20 ${loading ? 'animate-spin-slow' : 'animate-breath'}`}
            >
               <SparklesIcon className={`h-8 w-8 text-white sm:h-10 sm:w-10 ${loading ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

const App: React.FC = () => <AuthProvider><ClinicalApp /></AuthProvider>;
export default App;