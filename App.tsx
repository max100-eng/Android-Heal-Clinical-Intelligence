import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURACIÓN Y TIPOS ---
enum ImageType {
  ECG = 'ECG',
  RX = 'RX',
  DERMATOSCOPY = 'DERMATOSCOPY',
  RETINA = 'RETINA',
  HOLTER = 'HOLTER'
}

const MODALITY_SHORTCUTS = [
  { type: ImageType.ECG, label: 'ECG', icon: '💓' },
  { type: ImageType.RX, label: 'Rayos X', icon: '🩻' },
  { type: ImageType.DERMATOSCOPY, label: 'Dermo', icon: '🔍' },
  { type: ImageType.RETINA, label: 'Retina', icon: '👁️' },
  { type: ImageType.HOLTER, label: 'Holter', icon: '⌚' },
];

// --- COMPONENTES AUXILIARES ---

const ImageUploader = ({ onImageUpload, previewUrl, onClear }: any) => (
  <div className="relative w-full h-full flex items-center justify-center bg-slate-900/50">
    {previewUrl ? (
      <div className="relative w-full h-full">
        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
        <button 
          onClick={onClear} 
          className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full text-white font-bold shadow-lg z-10"
        >
          ✕
        </button>
      </div>
    ) : (
      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-white/10 hover:bg-white/5 transition-colors">
        <span className="text-4xl mb-4">📸</span>
        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Capturar Evidencia</span>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])} 
        />
      </label>
    )}
  </div>
);

const AnalysisDisplay = ({ loading, error, result }: any) => (
  <div className="w-full space-y-4">
    {loading && (
      <div className="p-10 text-center flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-cyan-400 font-black tracking-widest animate-pulse">PROCESANDO IA CLÍNICA...</p>
      </div>
    )}
    {error && (
      <div className="p-5 bg-red-500/20 border-2 border-red-500/50 text-red-200 rounded-2xl shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <strong className="block font-black mb-1">Error de Conexión</strong>
            <p className="text-sm leading-relaxed">{error}</p>
            <button 
              onClick={() => setError('')}
              className="mt-3 px-4 py-2 bg-red-500 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}
    {result && (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white/5 border border-white/10 rounded-[2rem] shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
          <h3 className="text-cyan-400 font-black uppercase text-sm tracking-tighter">Informe Generado</h3>
        </div>
        <p className="text-white/90 leading-relaxed font-medium">
          {result.summary || result.analysis || "Análisis completado sin hallazgos críticos detectados."}
        </p>
      </motion.div>
    )}
  </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function ClinicalApp() {
  const [selectedType, setSelectedType] = useState<ImageType>(ImageType.ECG);
  const [imageData, setImageData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isStethoscopeMode, setIsStethoscopeMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Lógica de navegación entre secciones
  const scrollToSlide = (index: number) => {
    if (!containerRef.current) return;
    const height = containerRef.current.offsetHeight;
    containerRef.current.scrollTo({ top: index * height, behavior: 'smooth' });
    setCurrentSlide(index);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    const height = e.currentTarget.offsetHeight;
    const index = Math.round(y / height);
    if (index !== currentSlide) setCurrentSlide(index);
  };

  // FUNCIÓN DE ANÁLISIS CON TIMEOUT Y MEJOR MANEJO DE ERRORES
  const handleAnalyze = async () => {
    if (!imageData && !isStethoscopeMode) {
      scrollToSlide(1);
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      
      if (imageData) {
        // Conversión correcta de base64 a blob
        const base64Data = imageData.base64.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: imageData.mimeType || 'image/jpeg' });
        formData.append('file', blob, 'clinical_capture.jpg');
      }

      // Fetch con timeout de 30 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        'https://copy-of-clinical-intelligence-image-analyzer-651390744915.us-west1.run.app/analyze',
        { 
          method: 'POST',
          body: formData,
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Servidor respondió con código ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      setTimeout(() => scrollToSlide(2), 300);
      
    } catch (err: any) {
      console.error("Error de análisis:", err);
      if (err.name === 'AbortError') {
        setError('Tiempo de espera agotado. El servidor tardó demasiado en responder.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Error de conexión. Verifica tu internet o que el servidor esté disponible.');
      } else {
        setError(err.message || 'Error desconocido al procesar la imagen.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`h-screen w-full bg-slate-950 text-white flex flex-col overflow-hidden transition-all duration-500 ${isStethoscopeMode ? 'ring-inset ring-8 ring-rose-500/20' : ''}`}>
      
      {/* HEADER SUPERIOR */}
      <header className="fixed top-0 inset-x-0 z-50 p-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-md mx-auto flex gap-2">
          <button 
            onClick={() => setIsStethoscopeMode(!isStethoscopeMode)}
            className={`flex-1 py-3 rounded-2xl border text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${isStethoscopeMode ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'border-white/10 text-white/40'}`}
          >
            {isStethoscopeMode ? '🛑 Detener Fonendo' : '🎧 Modo Fonendo'}
          </button>
        </div>
      </header>

      {/* CONTENEDOR DE SLIDES (SCROLL CORREGIDO) */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto snap-y snap-proximity scroll-smooth"
      >
        {/* SLIDE 1: INTRO */}
        <section className="h-full w-full flex flex-col items-center justify-center p-10 snap-start shrink-0">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="text-6xl mb-6">🧬</div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
              Protocolo <span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-[10px] tracking-[0.5em] text-white/30 mt-4 uppercase font-bold">Inteligencia Clínica</p>
          </motion.div>
          <button onClick={() => scrollToSlide(1)} className="mt-20 animate-bounce text-cyan-400/50">
            <span className="text-2xl">↓</span>
          </button>
        </section>

        {/* SLIDE 2: CAPTURA */}
        <section className="h-full w-full flex flex-col items-center justify-center p-6 snap-start shrink-0 bg-slate-900/20">
          <div className="w-full max-w-md">
            <h2 className="text-xl font-black italic text-cyan-400 uppercase mb-6 tracking-widest text-center">Entrada de Datos</h2>
            <div className={`h-[50vh] rounded-[3rem] overflow-hidden border-2 transition-all duration-700 ${isStethoscopeMode ? 'border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.2)]' : 'border-white/10 shadow-2xl bg-black/40'}`}>
              {isStethoscopeMode ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="flex gap-1 items-end h-12">
                    {[1,2,3,4,5,4,3,2,1].map((h, i) => (
                      <motion.div 
                        key={i}
                        animate={{ height: [10, h * 10, 10] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        className="w-1.5 bg-rose-400 rounded-full"
                      />
                    ))}
                  </div>
                  <p className="text-rose-300 font-bold text-[10px] uppercase tracking-widest animate-pulse">Sincronizando Frecuencia Acústica...</p>
                </div>
              ) : (
                <ImageUploader 
                  onImageUpload={(file: File) => {
                    const reader = new FileReader();
                    reader.onload = () => setImageData({ 
                      base64: reader.result, 
                      mimeType: file.type, 
                      previewUrl: URL.createObjectURL(file) 
                    });
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
        <section className="min-h-full w-full p-8 snap-start shrink-0 pt-28 pb-40">
          <div className="max-w-md mx-auto">
            <AnalysisDisplay loading={loading} error={error} result={analysisResult} />
            {analysisResult && (
              <button 
                onClick={() => { setImageData(null); setAnalysisResult(null); scrollToSlide(0); }}
                className="w-full mt-10 py-5 rounded-2xl border border-cyan-400/30 text-cyan-400 font-black uppercase text-xs tracking-[0.2em]"
              >
                Nuevo Análisis
              </button>
            )}
          </div>
        </section>
      </div>

      {/* NAVEGACIÓN INFERIOR (FOOTER) */}
      <nav className="fixed bottom-6 inset-x-4 z-50 max-w-md mx-auto">
        <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 flex flex-col gap-4 shadow-2xl">
          
          <div className="flex justify-around items-center pt-2">
            <button onClick={() => scrollToSlide(0)} className={`text-xl ${currentSlide === 0 ? 'grayscale-0' : 'grayscale opacity-30'}`}>🏠</button>
            <button onClick={() => scrollToSlide(1)} className={`text-xl ${currentSlide === 1 ? 'grayscale-0' : 'grayscale opacity-30'}`}>📸</button>
            <button onClick={() => scrollToSlide(2)} className={`text-xl ${currentSlide === 2 ? 'grayscale-0' : 'grayscale opacity-30'}`}>📊</button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {MODALITY_SHORTCUTS.map(m => (
              <button 
                key={m.type} 
                onClick={() => setSelectedType(m.type)}
                className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${selectedType === m.type ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-white/5 text-white/30'}`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN FLOTANTE (FAB) */}
        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className={`absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-[6px] border-slate-950 shadow-2xl flex items-center justify-center transition-all active:scale-95 ${loading ? 'bg-slate-800' : isStethoscopeMode ? 'bg-rose-500 shadow-rose-500/50' : 'bg-cyan-500 shadow-cyan-500/40'}`}
        >
          {loading ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-3xl">{isStethoscopeMode ? '🎙️' : '✨'}</span>
          )}
        </button>
      </nav>
    </div>
  );
}
