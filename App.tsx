import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Asumiendo que estos tipos y servicios existen en tu proyecto
import { ImageType, AnalysisResult, PatientHealthContext } from './types';
import { fetchHealthData } from './services/healthService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Importación de iconos (Asegúrate de que las rutas sean correctas o usa Lucide-react)
import { 
  SparklesIcon, ActivityIcon, ShieldCheckIcon, CameraIcon, BarChartIcon, 
  HeartPulseIcon, LungIcon, ScanIcon, EyeIcon, SkinIcon, RefreshCwIcon, 
  ChevronLeftIcon, ChevronRightIcon, ClinicalAppLogo, BeakerIcon, 
  TargetIcon, ZapIcon, WindIcon, BrainIcon, ClockIcon, WavesIcon, 
  ChevronDownIcon, BookCheckIcon, VisionHeadsetIcon, WaveformIcon
} from './components/icons/Icons';

// --- COMPONENTES AUXILIARES (Simulados para que el código compile) ---
const ImageUploader = ({ onImageUpload, previewUrl, onClear }: any) => (
  <div className="relative w-full h-full flex items-center justify-center bg-slate-900/50">
    {previewUrl ? (
      <div className="relative w-full h-full">
        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
        <button onClick={onClear} className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white">X</button>
      </div>
    ) : (
      <label className="cursor-pointer flex flex-col items-center">
        <CameraIcon className="h-12 w-12 text-white/20 mb-2" />
        <span className="text-white/40 text-xs font-bold uppercase">Subir o Capturar</span>
        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])} />
      </label>
    )}
  </div>
);

const AnalysisDisplay = ({ loading, error, result }: any) => (
  <div className="w-full space-y-4">
    {loading && <div className="p-8 text-center animate-pulse text-cyan-400 font-bold">PROCESANDO CON IA...</div>}
    {error && <div className="p-4 bg-red-500/20 border border-red-500 text-red-200 rounded-xl">{error}</div>}
    {result && (
      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
        <h3 className="text-cyan-400 font-black mb-2 uppercase">Diagnóstico Detectado</h3>
        <p className="text-white/80 italic">"{result.summary || "Sin hallazgos críticos detectados."}"</p>
      </div>
    )}
  </div>
);

// --- CONFIGURACIÓN DE MODALIDADES ---
const MODALITY_SHORTCUTS = [
  { type: ImageType.ECG, label: 'ECG', icon: HeartPulseIcon },
  { type: ImageType.RX, label: 'Rayos X', icon: LungIcon },
  { type: ImageType.DERMATOSCOPY, label: 'Dermo', icon: SkinIcon },
  { type: ImageType.RETINA, label: 'Retina', icon: EyeIcon },
  { type: ImageType.HOLTER, label: 'Holter', icon: ClockIcon },
];

const ClinicalApp: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<ImageType>(ImageType.ECG);
  const [imageData, setImageData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisionMode, setIsVisionMode] = useState(false);
  const [isStethoscopeMode, setIsStethoscopeMode] = useState(false);

  const reelContainerRef = useRef<HTMLDivElement>(null);

  // Lógica de Scroll mejorada
  const scrollToSlide = (index: number) => {
    if (!reelContainerRef.current) return;
    const slideHeight = reelContainerRef.current.offsetHeight;
    reelContainerRef.current.scrollTo({
      top: index * slideHeight,
      behavior: 'smooth'
    });
    setCurrentSlide(index);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    const height = e.currentTarget.offsetHeight;
    const index = Math.round(y / height);
    if (index !== currentSlide) setCurrentSlide(index);
  };

  const handleAnalyze = async () => {
    if (!imageData && !isStethoscopeMode) {
      scrollToSlide(1);
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      if (imageData) {
        const byteCharacters = atob(imageData.base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: imageData.mimeType });
        formData.append('file', blob, 'capture.jpg');
      }

      // Simulación de llamada al backend
      const response = await fetch('https://copy-of-clinical-intelligence-image-analyzer-651390744915.us-west1.run.app/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error en el motor clínico');
      const data = await response.json();
      setAnalysisResult(data);
      scrollToSlide(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="h-screen bg-black flex items-center justify-center text-cyan-500">CARGANDO...</div>;
  if (!isAuthenticated) return <Login onInstallClick={() => {}} isAppInstalled={false} />;

  return (
    <div className={`h-screen w-full bg-slate-950 text-white flex flex-col overflow-hidden transition-all duration-700 ${isStethoscopeMode ? 'ring-inset ring-[12px] ring-cyan-500/20' : ''}`}>
      
      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-[100] p-4 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-md mx-auto flex gap-2">
          <button onClick={() => setIsVisionMode(!isVisionMode)} className={`flex-1 py-3 rounded-2xl border text-[10px] font-black uppercase transition-all ${isVisionMode ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'border-white/10 text-white/40'}`}>
            <VisionHeadsetIcon className="h-4 w-4 inline mr-2" /> Visión
          </button>
          <button onClick={() => setIsStethoscopeMode(!isStethoscopeMode)} className={`flex-1 py-3 rounded-2xl border text-[10px] font-black uppercase transition-all ${isStethoscopeMode ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-white/10 text-white/40'}`}>
            <HeartPulseIcon className="h-4 w-4 inline mr-2" /> Fonendo
          </button>
        </div>
      </header>

      {/* REEL DE CONTENIDO (SCROLL FIXED) */}
      <div 
        ref={reelContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto snap-y snap-proximity scroll-smooth"
      >
        {/* SLIDE 1: HOME */}
        <section className="h-full w-full flex flex-col items-center justify-center p-8 snap-start shrink-0">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl border border-cyan-400/30 flex items-center justify-center mx-auto shadow-2xl">
              <ClinicalAppLogo className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Protocolo <span className="text-cyan-400">Activo</span></h1>
            <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase">Inteligencia Clínica v2.0</p>
          </div>
          <button onClick={() => scrollToSlide(1)} className="mt-20 p-4 rounded-full bg-white/5 animate-bounce">
            <ChevronDownIcon className="h-6 w-6 text-cyan-400" />
          </button>
        </section>

        {/* SLIDE 2: CAPTURA */}
        <section className="h-full w-full flex flex-col items-center justify-center p-6 snap-start shrink-0 bg-slate-900/20">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black italic text-cyan-300 uppercase">Captura Médica</h2>
              <p className="text-[9px] text-white/40 uppercase tracking-widest">{isStethoscopeMode ? 'Modo Acústico Activado' : 'Sincronización de Imagen'}</p>
            </div>
            
            <div className={`h-[45vh] rounded-[2.5rem] overflow-hidden border-2 transition-all ${isStethoscopeMode ? 'border-rose-500/50 bg-rose-500/5 shadow-[0_0_40px_rgba(244,63,94,0.2)]' : 'border-white/10 shadow-2xl'}`}>
              {isStethoscopeMode ? (
                <div className="h-full flex flex-col items-center justify-center">
                   <WaveformIcon className="h-20 w-20 text-rose-400 animate-pulse" />
                   <span className="mt-4 text-[10px] font-bold text-rose-300/60 uppercase">Escuchando frecuencia...</span>
                </div>
              ) : (
                <ImageUploader 
                  onImageUpload={(file: File) => {
                    const reader = new FileReader();
                    reader.onload = () => setImageData({ base64: reader.result, mimeType: file.type, previewUrl: URL.createObjectURL(file) });
                    reader.readAsDataURL(file);
                  }}
                  previewUrl={imageData?.previewUrl}
                  onClear={() => setImageData(null)}
                />
              )}
            </div>
          </div>
        </section>

        {/* SLIDE 3: RESULTADOS */}
        <section className="h-full w-full p-8 snap-start shrink-0 pt-28 overflow-y-auto">
          <div className="max-w-md mx-auto">
            <AnalysisDisplay loading={loading} error={error} result={analysisResult} />
            <button onClick={() => scrollToSlide(0)} className="w-full mt-12 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase text-white/40 tracking-widest hover:text-white transition-colors">
              Reiniciar Protocolo
            </button>
          </div>
        </section>
      </div>

      {/* NAVEGACIÓN INFERIOR */}
      <nav className="fixed bottom-6 inset-x-4 z-[100] max-w-md mx-auto">
        <div className="bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 flex flex-col gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <div className="flex justify-around items-center px-4">
            <BarChartIcon onClick={() => scrollToSlide(0)} className={`h-6 w-6 transition-colors ${currentSlide === 0 ? 'text-cyan-400' : 'text-white/20'}`} />
            <CameraIcon onClick={() => scrollToSlide(1)} className={`h-6 w-6 transition-colors ${currentSlide === 1 ? 'text-cyan-400' : 'text-white/20'}`} />
            <ActivityIcon onClick={() => scrollToSlide(2)} className={`h-6 w-6 transition-colors ${currentSlide === 2 ? 'text-cyan-400' : 'text-white/20'}`} />
          </div>

          <div className="flex gap-4 overflow-x-auto py-2 px-2 scrollbar-hide no-scrollbar">
            {MODALITY_SHORTCUTS.map(m => (
              <button key={m.type} onClick={() => setSelectedType(m.type)} className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedType === m.type ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/20'}`}>
                <m.icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        {/* FAB (Floating Action Button) */}
        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className={`absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-[6px] border-slate-950 shadow-2xl flex items-center justify-center transition-all active:scale-90 ${loading ? 'bg-slate-800' : isStethoscopeMode ? 'bg-rose-500 shadow-rose-500/50' : 'bg-cyan-500 shadow-cyan-500/50'}`}
        >
          {loading ? (
            <RefreshCwIcon className="h-8 w-8 animate-spin text-white" />
          ) : isStethoscopeMode ? (
            <WaveformIcon className="h-10 w-10 text-white animate-pulse" />
          ) : (
            <SparklesIcon className="h-10 w-10 text-white" />
          )}
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ClinicalApp />
    </AuthProvider>
  );
}
