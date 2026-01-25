import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProtocoloAI() {
  const [isFonendo, setIsFonendo] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Referencias para evitar errores de renderizado
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<any>(null);

  // Efecto para limpiar audio al cerrar
  useEffect(() => {
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
          Protocolo<span className="text-cyan-400">AI</span>
        </h1>
        <p className="text-[10px] tracking-[0.5em] text-white/20 uppercase">SISTEMA ACTIVO</p>
      </div>

      {/* ÁREA DE CAPTURA PRINCIPAL */}
      <div 
        className={`w-full max-w-sm aspect-square rounded-[3rem] border-2 border-dashed flex items-center justify-center transition-all ${
          isFonendo ? 'border-rose-500 bg-rose-950/10' : 'border-cyan-400/30 bg-cyan-950/10'
        }`}
      >
        {isFonendo ? (
          <div className="flex flex-col items-center">
            <div className="flex gap-1 h-10 items-end mb-4">
              {[1,2,3,4,3,2,1].map((h, i) => (
                <motion.div 
                  key={i} 
                  animate={{ height: [10, h*10, 10] }} 
                  transition={{ repeat: Infinity, duration: 0.5, delay: i*0.1 }}
                  className="w-1 bg-rose-500 rounded-full" 
                />
              ))}
            </div>
            <p className="text-rose-500 text-[10px] font-bold">FONENDO ACTIVO</p>
          </div>
        ) : (
          <div className="text-center opacity-30">
            <span className="text-4xl">📸</span>
            <p className="text-[10px] mt-4 font-bold">VISIÓN IA LISTA</p>
          </div>
        )}
      </div>

      {/* BOTONERA INFERIOR */}
      <div className="mt-10 flex flex-col gap-4 w-full max-w-sm">
        <button 
          onClick={() => setIsFonendo(!isFonendo)}
          className={`py-4 rounded-2xl font-bold text-xs tracking-widest border transition-all ${
            isFonendo ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 'bg-white/5 border-white/10 text-white/40'
          }`}
        >
          {isFonendo ? 'DETENER FONENDO' : 'ACTIVAR FONENDO'}
        </button>
        
        <button 
          className="py-4 rounded-2xl bg-cyan-500 text-black font-black text-xs tracking-widest shadow-lg shadow-cyan-500/30"
          onClick={() => alert("Iniciando análisis profundo...")}
        >
          EJECUTAR ANÁLISIS
        </button>
      </div>
    </div>
  );
}