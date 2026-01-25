import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- CONFIGURACIÓN ---
const API_URL = 'https://copy-of-clinical-intelligence-image-analyzer-651390744915.us-west1.run.app/analyze';

export default function ClinicalApp() {
  const [imageData, setImageData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStethoscopeMode, setIsStethoscopeMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToSlide = (index: number) => {
    if (!containerRef.current) return;
    const height = containerRef.current.offsetHeight;
    containerRef.current.scrollTo({ top: index * height, behavior: 'smooth' });
  };

  const handleAnalyze = async () => {
    if (!imageData && !isStethoscopeMode) return scrollToSlide(1);

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      if (imageData) {
        // Conversión segura de Base64 a Blob
        const blob = await fetch(imageData.base64).then(r => r.blob());
        formData.append('file', blob, 'capture.jpg');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors', // Habilita CORS explícitamente
        body: formData,
      });

      if (!response.ok) throw new Error(`Servidor respondió con status ${response.status}`);

      const data = await response.json();
      setAnalysisResult(data);
      scrollToSlide(2);
    } catch (err: any) {
      console.error("Error técnico:", err);
      // Mensaje amigable pero informativo
      setError(err.message === 'Failed to fetch' 
        ? 'No se pudo contactar al servidor. Esto suele ser un error de CORS en el Backend de Google Cloud.' 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Header con toggle de Fonendo */}
      <header className="p-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5 flex justify-center">
        <button 
          onClick={() => setIsStethoscopeMode(!isStethoscopeMode)}
          className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${isStethoscopeMode ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50' : 'bg-white/5 text-white/40'}`}
        >
          {isStethoscopeMode ? '🔊 FONENDO ACTIVO' : '🎧 MODO FONENDO'}
        </button>
      </header>

      {/* Contenedor Principal con Scroll */}
      <div ref={containerRef} className="flex-1 overflow-y-auto snap-y snap-mandatory">
        
        {/* Slide 1: Inicio */}
        <section className="h-full w-full flex flex-col items-center justify-center snap-start p-6">
           <h1 className="text-4xl font-black italic uppercase text-cyan-400">Captura Médica</h1>
           <p className="text-white/30 text-[10px] tracking-[0.4em] mt-2">INTELIGENCIA CLÍNICA v2.0</p>
           <button onClick={() => scrollToSlide(1)} className="mt-20 text-3xl animate-bounce">↓</button>
        </section>

        {/* Slide 2: Captura */}
        <section className="h-full w-full flex flex-col items-center justify-center snap-start p-6">
          <div className="w-full max-w-md h-96 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex items-center justify-center relative overflow-hidden">
            {imageData ? (
              <img src={imageData.previewUrl} className="w-full h-full object-contain" />
            ) : (
              <label className="cursor-pointer text-center">
                <span className="text-4xl">📸</span>
                <p className="text-[10px] font-bold text-white/40 uppercase mt-4">Subir Imagen Médica</p>
                <input type="file" className="hidden" onChange={(e: any) => {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = () => setImageData({ base64: reader.result, previewUrl: URL.createObjectURL(file) });
                  reader.readAsDataURL(file);
                }} />
              </label>
            )}
          </div>
          
          <button 
            onClick={handleAnalyze} 
            className={`mt-10 px-12 py-4 rounded-2xl font-black uppercase text-xs transition-all ${loading ? 'bg-slate-800' : 'bg-cyan-500 shadow-xl shadow-cyan-500/40'}`}
          >
            {loading ? 'Analizando...' : 'Ejecutar Análisis'}
          </button>
        </section>

        {/* Slide 3: Resultados y Errores */}
        <section className="h-full w-full flex flex-col items-center justify-center snap-start p-6 pt-20">
          <div className="w-full max-w-md">
            {error && (
              <div className="bg-red-500/20 border border-red-500 p-6 rounded-3xl text-center">
                <span className="text-3xl">⚠️</span>
                <h3 className="text-red-400 font-bold mt-2">Error de Conexión</h3>
                <p className="text-red-200/60 text-xs mt-2 italic">{error}</p>
                <button onClick={() => scrollToSlide(1)} className="mt-4 bg-red-500 px-6 py-2 rounded-xl text-[10px] font-bold">REINTENTAR</button>
              </div>
            )}
            {analysisResult && (
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                <h3 className="text-cyan-400 font-black uppercase text-sm mb-4 tracking-widest">Informe de IA</h3>
                <p className="text-white/80 leading-relaxed italic">"{analysisResult.summary || analysisResult.analysis}"</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
