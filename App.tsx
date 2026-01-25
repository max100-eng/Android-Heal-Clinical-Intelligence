import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MODALITIES = [
  { id: 'ecg', label: 'ECG', icon: '❤️', desc: 'Análisis de Arritmias' },
  { id: 'rx', label: 'RAYOS X', icon: '🦴', desc: 'Detección Ósea/Pulmonar' },
  { id: 'dermo', label: 'DERMATO', icon: '🔍', desc: 'Lesiones Cutáneas' },
  { id: 'retina', label: 'RETINA', icon: '👁️', desc: 'Retinopatía/Glaucoma' }
];

export default function ProtocoloAI() {
  const [selectedMod, setSelectedMod] = useState(MODALITIES[0]);
  const [source, setSource] = useState<string | null>(null);
  const [isInference, setIsInference] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA DE CARGA SEGURA ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadstart = () => setLogs(["Cargando binarios..."]);
    reader.onload = (ev) => {
      setSource(ev.target?.result as string);
      setLogs(prev => [...prev, "Imagen cargada con éxito", "Esperando ejecución..."]);
    };
    reader.onerror = () => setLogs(["ERROR: Fallo en lectura de archivo"]);
    reader.readAsDataURL(file);
  };

  // --- SIMULACIÓN DE INFERENCIA HOLOGRÁFICA ---
  const startInference = () => {
    if (!source) return;
    setIsInference(true);
    setProgress(0);
    
    const steps = [
      "Normalizando matriz de píxeles...",
      `Aplicando modelo DeepCore-${selectedMod.id}...`,
      "Identificando patrones patológicos...",
      "Calculando score de confianza...",
      "Análisis finalizado."
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setLogs(prev => [step, ...prev.slice(0, 3)]);
        setProgress((i + 1) * 20);
        if (i === steps.length - 1) {
          setTimeout(() => setIsInference(false), 2000);
        }
      }, i * 1500);
    });
  };

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col overflow-hidden font-mono">
      
      {/* HEADER: SELECTOR DE ESPECIALIDAD */}
      <div className="p-6 grid grid-cols-4 gap-2 bg-slate-900/50 backdrop-blur-xl border-b border-white/5">
        {MODALITIES.map((m) => (
          <button 
            key={m.id}
            onClick={() => { setSelectedMod(m); setSource(null); }}
            className={`flex flex-col items-center p-2 rounded-xl border transition-all ${selectedMod.id === m.id ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-white/5 opacity-40'}`}
          >
            <span className="text-lg">{m.icon}</span>
            <span className="text-[7px] font-black mt-1 uppercase tracking-tighter">{m.label}</span>
          </button>
        ))}
      </div>

      {/* MONITOR HOLOGRÁFICO PRINCIPAL */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* Datos de Inferencia Alrededor (Detalles) */}
        <div className="absolute top-10 left-10 text-[7px] text-cyan-400/50 space-y-1 hidden md:block">
          <p>SCAN_MODE: {selectedMod.label}</p>
          <p>RESOLUTION: 4096px</p>
          <p>LATENCY: 24ms</p>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full max-w-sm aspect-[4/5] rounded-[2rem] border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-700 ${isInference ? 'border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.1)]' : 'border-white/10'}`}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

          {source ? (
            <div className="relative w-full h-full">
              <img src={source} className={`w-full h-full object-cover transition-all ${isInference ? 'brightness-50' : 'brightness-100'}`} />
              
              {/* ESCÁNER LÁSER HOLOGRÁFICO */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }} 
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_#22d3ee] z-30" 
              />

              {/* Detalles perimetrales en el escaner */}
              <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[6px] text-cyan-400 font-bold opacity-70">
                <span>COORD_X: {Math.random().toFixed(4)}</span>
                <span>DATA_STREAM_ACTIVE</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-10 opacity-30">
              <p className="text-[10px] font-black tracking-[0.4em] uppercase">Esperando {selectedMod.label}</p>
              <p className="text-[8px] mt-2 italic">Toque para cargar imagen médica</p>
            </div>
          )}
        </div>

        {/* LOGS DE IA EN TIEMPO REAL */}
        <div className="mt-6 w-full max-w-sm h-16 overflow-hidden">
          {logs.map((log, i) => (
            <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={i} className="text-[8px] text-cyan-500/80 leading-tight tracking-wider uppercase font-bold">
              {`> ${log}`}
            </motion.p>
          ))}
        </div>
      </main>

      {/* FOOTER CON BARRA DE PROGRESO */}
      <footer className="p-8 bg-slate-900/80 backdrop-blur-2xl">
        <div className="space-y-4">
          {isInference && (
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">ProtocoloAI Neural Core</span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase">{selectedMod.desc}</span>
            </div>
            <button 
              onClick={startInference}
              disabled={!source || isInference}
              className={`px-10 py-4 rounded-xl text-[10px] font-black tracking-widest transition-all ${source && !isInference ? 'bg-cyan-500 text-black shadow-lg' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
            >
              {isInference ? 'ANALIZANDO...' : 'INICIAR INFERENCIA'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}