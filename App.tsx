import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ImageType, AnalysisResult, PatientHealthContext } from './types';
import { fetchHealthData } from './services/healthService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import ImageUploader from './components/ImageUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import Login from './components/Login';
import SplashScreen from './components/SplashScreen';

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

  // Estados principales
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
  const [modalityAnimKey, setModalityAnimKey] = useState(0);
  const [showLibrary, setShowLibrary] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // ⭐ Fonendo Digital
  const [isStethoscopeMode, setIsStethoscopeMode] = useState(false);

  const toggleStethoscope = () => {
    setIsStethoscopeMode(prev => !prev);
    triggerLightning();
  };

  // Refs
  const reelContainerRef = useRef<HTMLDivElement>(null);
  const bottomCarouselRef = useRef<HTMLDivElement>(null);

  // Funciones
  const triggerLightning = () => {
    setLightning(true);
    setModalityAnimKey(prev => prev + 1);
    setTimeout(() => setLightning(false), 400);
  };

  const scrollToSlide = useCallback((index: number) => {
    if (!reelContainerRef.current) return;
    if (index < 0 || index > 2) return;
    reelContainerRef.current.children[index]?.scrollIntoView({ behavior: 'smooth' });
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
      const vitals = await fetchHealthData().catch(() => null);
      setHealthData(vitals || null);

      const formData = new FormData();

      const byteCharacters = atob(imageData.base64.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: imageData.mimeType });

      formData.append('file', blob, 'image.jpg');

      const response = await fetch(
        'https://copy-of-clinical-intelligence-image-analyzer-651390744915.us-west1.run.app/analyze',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Error en el análisis clínico');
      }

      const result = await response.json();

      setAnalysisResult(result);
      scrollToSlide(2);
    } catch (err: any) {
      console.error('Error de análisis:', err);
      setError(err.message || 'Error en el motor clínico.');
    } finally {
      setLoading(false);
    }
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
          left:
            item.offsetLeft -
            bottomCarouselRef.current.offsetWidth / 2 +
            item.offsetWidth / 2,
          behavior: 'smooth',
        });
      }
    }
  };

  const navigateModality = (direction: 'next' | 'prev') => {
    const currentIndex = MODALITY_SHORTCUTS.findIndex(m => m.type === selectedType);
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % MODALITY_SHORTCUTS.length
        : (currentIndex - 1 + MODALITY_SHORTCUTS.length) % MODALITY_SHORTCUTS.length;
    handleModalityChange(MODALITY_SHORTCUTS[nextIndex].type);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = () => {
    if (!reelContainerRef.current) return;
    const y = reelContainerRef.current.scrollTop;
    setScrollY(y);
    const index = Math.round(
      y / reelContainerRef.current.clientHeight
    );
    if (index !== currentSlide) setCurrentSlide(index);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const mimeType = file.type;
      const previewUrl = URL.createObjectURL(file);
      setImageData({ base64, mimeType, previewUrl });
      setAnalysisResult(null);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  if (authLoading || showSplash) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const activeModality = MODALITY_SHORTCUTS.find(m => m.type === selectedType)!;
  const ActiveModalityIcon = activeModality.icon;

  const depthFactor = scrollY * 0.0008;

  return (
    <div
      className={`min-h-screen bg-brand-dark text-white flex flex-col relative overflow-hidden ${
        isStethoscopeMode ? 'ring-2 ring-cyan-400/40 shadow-[0_0_60px_rgba(56,189,248,0.5)]' : ''
      }`}
    >
      {/* Vision Mode + Fonendo + Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-6 pb-3 bg-gradient-to-b from-black/70 via-black/30 to-transparent backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">

          {/* Modo Visión */}
          <button
            onClick={() => setIsVisionMode(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${
              isVisionMode
                ? 'border-cyan-400/80 bg-cyan-500/10 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.6)]'
                : 'border-white/10 text-white/40'
            }`}
          >
            <VisionHeadsetIcon className="h-4 w-4" />
            Visión
          </button>

          {/* Fonendo Digital */}
          <button
            onClick={toggleStethoscope}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${
              isStethoscopeMode
                ? 'border-cyan-400/80 bg-cyan-500/10 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.6)]'
                : 'border-white/10 text-white/40'
            }`}
          >
            <HeartPulseIcon className="h-4 w-4" />
            Fonendo
          </button>

          {/* Biblioteca */}
          <button
            onClick={() => setShowLibrary(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 text-white/40 hover:text-white/70 hover:border-white/30 transition-colors"
          >
            <BookCheckIcon className="h-4 w-4" />
            Casos
          </button>
        </div>
      </header>

      {/* MAIN REEL */}
      <motion.div
        ref={reelContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory pt-24 pb-32 relative"
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 20,
        }}
      >

        {/* SLIDE 1 — Protocolo ACTIVO */}
        <section className="reel-slide flex flex-col items-center justify-center p-6 sm:p-12 snap-start relative">
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(56,189,248,0.18), transparent 40%, rgba(15,23,42,1))',
            }}
            animate={{ opacity: [0.6, 0.9, 0.7] }}
            transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
          />

          <motion.div
            className="relative z-10 w-full max-w-lg flex flex-col items-center text-center"
            style={{ transform: `translateY(${scrollY * -0.12}px)` }}
          >
            {/* Logo */}
            <motion.div
              className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-cyan-300/40 glass-morphism sm:w-28 sm:h-28"
              animate={{
                boxShadow: [
                  '0 0 0 rgba(56,189,248,0.0)',
                  '0 0 40px rgba(56,189,248,0.55)',
                  '0 0 20px rgba(56,189,248,0.35)',
                ],
                borderColor: [
                  'rgba(103,232,249,0.4)',
                  'rgba(56,189,248,0.9)',
                  'rgba(103,232,249,0.5)',
                ],
              }}
              transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror' }}
            >
              <ClinicalAppLogo className="h-14 w-14 sm:h-20 sm:w-20" />
            </motion.div>

            {/* Título */}
            <motion.h2
              className="text-3xl font-black italic uppercase tracking-tighter leading-tight mb-2 sm:text-5xl"
              style={{ opacity: Math.max(1 - scrollY * 0.002, 0.2) }}
            >
              Protocolo <br /> <span className="text-cyan-300">ACTIVO</span>
            </motion.h2>

            <motion.p
              className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em] mb-12 sm:text-[11px]"
              style={{ letterSpacing: `${0.4 + depthFactor * 2}em` }}
            >
              Grado Hospitalario
            </motion.p>

            {/* Módulo de modalidad activa */}
            <motion.div
              key={`${selectedType}-${modalityAnimKey}`}
              className={`flex flex-col items-center gap-4 p-8 w-full rounded-[2.5rem] border mb-10 transition-all duration-700 ${
                isVisionMode
                  ? 'glass-morphism shadow-[0_40px_80px_-20px_rgba(8,47,73,0.9)] active-glow'
                  : 'bg-white/5 shadow-xl border-white/10'
              }`}
              style={{
                background:
                  'radial-gradient(circle at top, rgba(56,189,248,0.18), rgba(15,23,42,0.95))',
                borderColor: 'rgba(148, 233, 255, 0.4)',
                boxShadow: `0 0 ${30 + depthFactor * 80}px rgba(56,189,248,0.55)`,
                transform: `translateY(${scrollY * 0.04}px) scale(${1 + depthFactor * 0.2})`,
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(56,189,248,0.4), transparent 60%)',
                  }}
                  animate={{ opacity: [0.4, 0.9, 0.5], scale: [1, 1.2, 1.05] }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: 'mirror' }}
                />

                <motion.div
                  className="relative z-10"
                  animate={{ scale: [1, 1.08, 1], rotate: [-1.5, 1.5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror' }}
                >
                  <ActiveModalityIcon className="h-16 w-16 text-cyan-300 sm:h-20 sm:w-20" />
                </motion.div>
              </div>

              <motion.h3
                className="text-3xl font-black text-white uppercase italic tracking-widest sm:text-4xl"
                animate={{ letterSpacing: ['0.2em', '0.35em', '0.25em'] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror' }}
              >
                {activeModality.label}
              </motion.h3>
            </motion.div>

            {/* Botón siguiente */}
            <motion.button
              onClick={() => scrollToSlide(1)}
              className="flex flex-col items-center gap-3 text-cyan-300/80 hover:text-cyan-200 transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all">
                Siguiente Fase
              </span>
              <ChevronDownIcon className="h-6 w-6 animate-bounce" />
            </motion.button>
          </motion.div>
        </section>

        {/* SLIDE 2 — Captura Médica */}
        <section className="reel-slide flex flex-col items-center justify-center p-4 sm:p-10 snap-start relative">
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(15,23,42,1), rgba(15,23,42,0.9), rgba(8,47,73,0.9))',
            }}
          />

          <motion.div
            className="w-full max-w-md space-y-6 flex flex-col items-center relative z-10"
            style={{ transform: `translateY(${(scrollY - window.innerHeight) * 0.06}px)` }}
          >
            <div className="text-center">
              <motion.h2
                className="text-2xl font-black italic uppercase tracking-tighter text-cyan-300 sm:text-4xl"
                animate={{
                  textShadow: [
                    '0 0 0 rgba(56,189,248,0.0)',
                    '0 0 18px rgba(56,189,248,0.8)',
                    '0 0 8px rgba(56,189,248,0.4)',
                  ],
                }}
                transition={{ duration: 5, repeat: Infinity, repeatType: 'mirror' }}
              >
                Captura Médica
              </motion.h2>

              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">
                Sincronización de Imagen
              </p>
            </div>

            <motion.div
              className="w-full h-[50svh] sm:h-[55svh] flex items-center transition-all"
              style={{
                boxShadow: imageData
                  ? '0 0 40px rgba(56,189,248,0.55)'
                  : '0 0 0 rgba(0,0,0,0)',
                borderRadius: '1.75rem',
              }}
            >
              <ImageUploader
                onImageUpload={handleImageUpload}
                previewUrl={imageData?.previewUrl}
                onClear={() => {
                  setImageData(null);
                  setAnalysisResult(null);
                  setError('');
                }}
              />
            </motion.div>

            {imageData && (
              <motion.button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-6 bg-cyan-500/90 rounded-3xl shadow-2xl neo-button group border border-cyan-200/60"
                whileHover={{ scale: loading ? 1 : 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center justify-center gap-3 text-slate-950 font-black text-lg uppercase italic sm:text-xl">
                  {loading ? (
                    <RefreshCwIcon className="animate-spin h-6 w-6" />
                  ) : (
                    <>
                      Ejecutar Análisis <SparklesIcon className="h-6 w-6" />
                    </>
                  )}
                </span>
              </motion.button>
            )}
          </motion.div>
        </section>

        {/* SLIDE 3 — Resultados */}
        <section className="reel-slide overflow-y-auto pt-24 pb-48 sm:pt-32 snap-start relative">
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at top, rgba(56,189,248,0.25), rgba(15,23,42,1))',
            }}
          />

          <motion.div
            className="w-full max-w-md mx-auto px-6 relative z-10"
            style={{
              transform: `translateY(${(scrollY - 2 * window.innerHeight) * 0.08}px)`,
            }}
          >
            <AnalysisDisplay
              loading={loading}
              error={error}
              result={analysisResult}
              previewUrl={imageData?.previewUrl}
              healthData={healthData}
            />

            <motion.button
              onClick={() => {
                triggerLightning();
                scrollToSlide(0);
              }}
              className="mt-8 mb-12 w-full py-6 glass-morphism rounded-3xl border border-cyan-300/40 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300 flex items-center justify-center gap-3 hover:bg-cyan-500/5 transition-all active:scale-95"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              Nuevo Diagnóstico <RefreshCwIcon className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </section>
      {/* MAIN NAVIGATION HUB */}
      <nav className="fixed bottom-0 left-0 right-0 z-[60] pb-safe-bottom px-4 mb-4">
        <div className="max-w-md mx-auto relative group">
          <motion.div
            className="glass-morphism rounded-[2.5rem] p-3 flex flex-col gap-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] border border-white/10 transition-all duration-700 bg-slate-950/70 backdrop-blur-2xl"
            animate={{
              boxShadow: [
                '0 0 0 rgba(56,189,248,0.0)',
                '0 0 40px rgba(56,189,248,0.55)',
                '0 0 18px rgba(56,189,248,0.35)',
              ],
              borderColor: [
                'rgba(148,163,184,0.4)',
                'rgba(56,189,248,0.7)',
                'rgba(148,163,184,0.5)',
              ],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              repeatType: 'mirror',
            }}
          >

            {/* Quick Access Icons */}
            <div className="flex justify-around items-center px-2 border-b border-white/5 pb-2">
              {[BarChartIcon, CameraIcon, ActivityIcon, ShieldCheckIcon].map((Icon, i) => (
                <motion.button
                  key={i}
                  onClick={() => i < 3 ? scrollToSlide(i) : window.open('https://wa.me/34670887715')}
                  className={`p-3 rounded-2xl transition-all duration-300 active:scale-90 ${
                    currentSlide === i
                      ? 'text-cyan-300 bg-white/5 shadow-inner'
                      : 'text-white/30 hover:text-white/60'
                  }`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </motion.button>
              ))}
            </div>

            {/* Carousel Hub */}
            <div className="relative flex items-center h-16 sm:h-20">
              <button
                onClick={() => navigateModality('prev')}
                className="absolute left-0 z-20 p-2 text-white/30 hover:text-white transition-colors bg-slate-950/80 backdrop-blur-md rounded-r-xl active:scale-90"
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
                    <motion.button
                      key={item.type}
                      onClick={() => handleModalityChange(item.type)}
                      className="carousel-item flex flex-col items-center justify-center gap-1.5 min-w-[56px] sm:min-w-[70px] active:scale-90"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 sm:w-14 sm:h-14"
                        animate={
                          isActive
                            ? {
                                scale: [1, 1.12, 1.05],
                                rotate: [-2, 2, 0],
                                boxShadow: [
                                  '0 0 0 rgba(56,189,248,0.0)',
                                  '0 0 25px rgba(56,189,248,0.9)',
                                  '0 0 12px rgba(56,189,248,0.6)',
                                ],
                              }
                            : {
                                scale: 1,
                                rotate: 0,
                                boxShadow: '0 0 0 rgba(0,0,0,0)',
                              }
                        }
                        transition={{
                          duration: 4,
                          repeat: isActive ? Infinity : 0,
                          repeatType: 'mirror',
                        }}
                        style={{
                          background: isActive
                            ? 'linear-gradient(135deg, rgba(56,189,248,1), rgba(59,130,246,1))'
                            : 'rgba(15,23,42,0.9)',
                          borderColor: isActive ? 'rgba(248,250,252,0.9)' : 'rgba(148,163,184,0.3)',
                          opacity: isActive ? 1 : 0.35,
                        }}
                      >
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'text-white' : 'text-white/80'}`} />
                      </motion.div>

                      <span
                        className={`text-[7px] font-black uppercase tracking-widest transition-all duration-300 ${
                          isActive ? 'text-cyan-300 opacity-100' : 'text-white/10 opacity-0'
                        }`}
                      >
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={() => navigateModality('next')}
                className="absolute right-0 z-20 p-2 text-white/30 hover:text-white transition-colors bg-slate-950/80 backdrop-blur-md rounded-l-xl active:scale-90"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Central Floating Action Button */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <motion.button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(56,189,248,0.7)] border-[5px] border-slate-950 pointer-events-auto sm:w-20 sm:h-20"
              animate={{
                scale: loading ? [1, 0.96, 1] : [1, 1.06, 1],
                boxShadow: loading
                  ? [
                      '0 0 20px rgba(56,189,248,0.7)',
                      '0 0 40px rgba(56,189,248,1)',
                      '0 0 25px rgba(56,189,248,0.8)',
                    ]
                  : [
                      '0 0 18px rgba(56,189,248,0.7)',
                      '0 0 32px rgba(56,189,248,0.9)',
                      '0 0 20px rgba(56,189,248,0.7)',
                    ],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatType: 'mirror',
              }}
              whileTap={{ scale: 0.9 }}
            >
              <SparklesIcon className={`h-8 w-8 text-white sm:h-10 sm:w-10 ${loading ? 'animate-pulse' : ''}`} />
            </motion.button>
          </div>
        </div>
      </nav>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ClinicalApp />
  </AuthProvider>
);

export default App;
