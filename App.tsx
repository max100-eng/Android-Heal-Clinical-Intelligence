import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProtocoloAI() {
  const [mode, setMode] = useState<'visual' | 'acoustic'>('visual');
  const [source, setSource] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inferenceProgress, setInferenceProgress] = useState(0);
  const [inferenceStage, setInferenceStage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA DE SIMULACIÓN DE INFERENCIA DE IA ---
  const runInference = () => {
    if (!source) return;
    setIsProcessing(true);
    setInferenceProgress(0);
    
    const stages = [
      { p: 10, t: 'Inicializando red neuronal...' },
      { p: 30, t: 'Extrayendo biomarcadores...' },
      { p: 60, t: 'Comparando con base de datos global...' },
      { p: 90, t: 'Calculando probabilidad diagnóstica...' },
      { p: 100, t: 'Análisis Completo' }
    ];

    stages.forEach((stage, index) => {
      setTimeout(() => {
        setInferenceProgress(stage.p);
        setInferenceStage(stage.t);
        if (stage.p === 100) {
          setTimeout(() => {
            alert("Diagnóstico Generado con éxito.");
            setIsProcessing(false);
          }, 500);
        }
      }, index * 1200); // Velocidad de la barra
    });
  };

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col font-sans overflow-hidden">
      
      {/* HEADER SELECTOR */}
      <header className="p-6 flex justify-center gap-4 bg-slate-900/40 backdrop-blur-xl border-b border-white/5">
        <button onClick={() => { setMode('visual'); setSource(null); }} className={`px-6 py-2 rounded-xl text-[10px] font-black border transition-all ${mode === 'visual' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : 'border-transparent opacity-30'}`}>VISIÓN HOLOGRÁFICA</button>
        <button onClick={() => { setMode('acoustic'); setSource(null); }} className={`px-6 py-2 rounded-xl text-[10px] font-black border transition-all ${mode === 'acoustic' ? 'border-rose-500 bg-rose-500/10 text-rose-500' : 'border-transparent opacity-30'}`}>FONENDO DIGITAL</button>
      </header>

      {/* MONITOR DE ESCANEO */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div 
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative w-full max-w-sm aspect-[3/4] rounded-[3rem] border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-700 ${mode === 'visual' ? 'border-cyan-400/30' : 'border-rose-500/30'} ${isProcessing ? 'scale-95 opacity-80' : ''}`}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => {
             const file = e.target.files?.[0];
             if (file) {
               const reader = new FileReader();
               reader.onload = (ev) => setSource(ev.target?.result as string);
               reader.readAsDataURL(file);
             }
          }} />

          {source ? (
            <div className="relative w-full h-full">
              <img src={source} className="w-full h-full object-cover opacity-40" />
              {/* Línea de escaneo láser solo si no está procesando inferencia final */}
              {!isProcessing && (
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className={`absolute left-0 w-full h-[2px] z-20 shadow-[0_0_15px] ${mode === 'visual' ? 'bg-cyan-400 shadow-cyan-400' : 'bg-rose-500 shadow-rose-500'}`} 
                />
              )}
            </div>
          ) : (
            <div className="text-center p-10 opacity-30">
              <span className="text-5xl">{mode === 'visual' ? '📸' : '🎙️'}</span>
              <p className="text-[10px] font-black tracking-widest mt-4 uppercase">Capturar Muestra</p>
            </div>
          )}
        </div>

        {/* --- BARRA DE PROGRESO DE INFERENCIA (HOLOGRÁFICA) --- */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm space-y-3 px-4"
            >
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">{inferenceStage}</span>
                <span className="text-[12px] font-mono text-white/50">{inferenceProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  className={`h-full ${mode === 'visual' ? 'bg-cyan-400' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${inferenceProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER TÁCTICO */}
      <footer className="p-8">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 flex items-center justify-between shadow-2xl">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">IA Inference Core</span>
            <span className="text-[10px] font-bold text-white/80">V.9.9 Neural Engine</span>
          </div>
          <button 
            onClick={runInference}
            disabled={!source || isProcessing}
            className={`px-10 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${source && !isProcessing ? 'bg-white text-black shadow-white/20 shadow-xl scale-100' : 'bg-white/5 text-white/10 scale-95 cursor-not-allowed'}`}
          >
            {isProcessing ? 'PROCESANDO...' : 'EJECUTAR IA'}
          </button>
        </div>
      </footer>
    </div>
  );
}