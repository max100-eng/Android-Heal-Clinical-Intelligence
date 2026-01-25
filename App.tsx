import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MODALIDADES ---
const MODS = {
  visual: { color: '#22d3ee', label: 'VISIÓN HOLOGRÁFICA', bg: 'bg-cyan-950/5', border: 'border-cyan-400/30' },
  acoustic: { color: '#f43f5e', label: 'FONENDO DIGITAL', bg: 'bg-rose-950/5', border: 'border-rose-500/30' }
};

export default function ProtocoloAI() {
  const [mode, setMode] = useState<'visual' | 'acoustic'>('visual');
  const [source, setSource] = useState<string | null>(null); // Imagen capturada o subida
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number>();

  // --- LÓGICA DE CAPTURA (CÁMARA/UPLOAD) ---
  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSource(ev.target?.result as string);
        setIsProcessing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- EFECTO DE ESCANEO LÁSER / ONDA AUDIO ---
  useEffect(() => {
    if (!isProcessing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    
    const animate = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.strokeStyle = MODS[mode].color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = MODS[mode].color;

      if (mode === 'visual') {
        // Efecto Láser de Escaneo
        const y = (Math.sin(Date.now() * 0.004) * 0.5 + 0.5) * ctx.canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
      } else {
        // Onda Simulada de Fonendo (o Real si conectas el Analyser)
        ctx.beginPath();
        for (let i = 0; i < ctx.canvas.width; i++) {
          const y = ctx.canvas.height/2 + Math.sin(i * 0.05 + Date.now() * 0.01) * 20;
          if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
        }
        ctx.stroke();
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isProcessing, mode]);

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col font-sans overflow-hidden">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <header className="p-6 flex justify-center gap-4 bg-slate-900/40 backdrop-blur-xl border-b border-white/5">
        {Object.entries(MODS).map(([k, v]) => (
          <button 
            key={k} 
            onClick={() => { setMode(k as any); setSource(null); setIsProcessing(false); }}
            className={`px-6 py-2 rounded-xl text-[10px] font-black border transition-all ${mode === k ? `${v.border} ${v.bg} text-white shadow-lg` : 'border-transparent opacity-30'}`}
          >
            {v.label}
          </button>
        ))}
      </header>

      {/* ÁREA DE ESCANEO / CAPTURA */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full max-w-sm aspect-[3/4] rounded-[3rem] border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer group transition-all duration-700 ${MODS[mode].border} ${MODS[mode].bg}`}
        >
          {/* Input oculto: capture="environment" abre la cámara directamente en móviles */}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleCapture} />

          {source ? (
            <>
              <img src={source} className="w-full h-full object-cover opacity-50 transition-opacity group-hover:opacity-30" alt="MedCapture" />
              <canvas ref={canvasRef} width={300} height={400} className="absolute inset-0 w-full h-full z-10" />
              <div className="absolute top-10 flex flex-col items-center gap-2">
                <div className={`px-4 py-1 rounded-full text-[8px] font-black tracking-[0.3em] bg-black/50 border ${MODS[mode].border}`}>
                  ANALIZANDO...
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center p-10 space-y-4">
              <span className="text-5xl opacity-40">{mode === 'visual' ? '📸' : '🎙️'}</span>
              <div className="space-y-1">
                <p className="text-[10px] font-black tracking-widest uppercase">Toque para Diagnóstico</p>
                <p className="text-[8px] opacity-30 uppercase italic">Cámara, RX o Archivos</p>
              </div>
            </div>
          )}

          {/* Marcas de Enfoque */}
          <div className={`absolute inset-10 border border-white/5 pointer-events-none transition-opacity ${source ? 'opacity-100' : 'opacity-20'}`} />
        </div>

        {/* INDICADOR DE TECNOLOGÍA */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
             <span className="text-[7px] text-white/30 font-bold uppercase mb-1">Ampliación</span>
             <span className="text-[10px] font-black text-cyan-400">100X</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col items-center">
             <span className="text-[7px] text-white/30 font-bold uppercase mb-1">IA Engine</span>
             <span className="text-[10px] font-black text-rose-500">DEEP CORE</span>
          </div>
        </div>
      </main>

      {/* FOOTER TÁCTICO */}
      <footer className="p-8">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase">Estatus Clínico</h3>
            <p className="text-xs font-bold">{source ? "Muestra capturada. Listo." : "Esperando entrada de datos..."}</p>
          </div>
          <button 
            disabled={!source}
            className={`px-10 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${source ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
          >
            EJECUTAR IA
          </button>
        </div>
      </footer>
    </div>
  );
}