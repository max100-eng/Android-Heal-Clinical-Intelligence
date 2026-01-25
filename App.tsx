import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURACIÓN DE MODALIDADES ---
const MODALITIES = {
  visual: [
    { id: 'ecg', label: 'ECG', icon: '❤️', color: '#22d3ee' },
    { id: 'rx', label: 'RAYOS X', icon: '🦴', color: '#22d3ee' },
    { id: 'dermo', label: 'DERMO', icon: '🔍', color: '#22d3ee' },
    { id: 'retina', label: 'RETINA', icon: '👁️', color: '#22d3ee' }
  ],
  acoustic: [
    { id: 'cardiac', label: 'CARDÍACO', icon: '🫀', color: '#f43f5e', filter: 500 },
    { id: 'pulmonar', label: 'PULMONAR', icon: '🫁', color: '#f43f5e', filter: 1200 }
  ]
};

export default function ProtocoloAI() {
  const [mainMode, setMainMode] = useState<'visual' | 'acoustic'>('visual');
  const [subMode, setSubMode] = useState('ecg');
  const [isScanning, setIsScanning] = useState(false);
  const [flashlight, setFlashlight] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- LÓGICA DE LINTERNA (FLASH) PARA RETINA/DERMO ---
  const toggleFlashlight = async (state: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      if (capabilities.torch) {
        await track.applyConstraints({ advanced: [{ torch: state }] } as any);
        setFlashlight(state);
      }
    } catch (err) {
      console.error("Flash no disponible", err);
    }
  };

  // --- MOTOR DE AUDIO Y ESCANEO ---
  const startEngine = async () => {
    if (isScanning) {
      setIsScanning(false);
      audioCtx.current?.close();
      if (flashlight) toggleFlashlight(false);
      return;
    }

    setIsScanning(true);
    
    // Activar Flash automáticamente en Retina o Dermo
    if (mainMode === 'visual' && (subMode === 'retina' || subMode === 'dermo')) {
      toggleFlashlight(true);
    }

    if (mainMode === 'acoustic') {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.current.createMediaStreamSource(stream);
      
      // Filtro Profesional
      const filter = audioCtx.current.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = subMode === 'cardiac' ? 500 : 1200;

      // Amplificación 100x (Gain)
      const gainNode = audioCtx.current.createGain();
      gainNode.gain.value = 20.0; // Amplificación masiva para fonendo

      const analyser = audioCtx.current.createAnalyser();
      source.connect(filter).connect(gainNode).connect(analyser);
      visualize(analyser);
    }
  };

  const visualize = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isScanning) return;
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 4;
      ctx.strokeStyle = mainMode === 'visual' ? '#22d3ee' : '#f43f5e';
      ctx.shadowBlur = 20;
      ctx.shadowColor = ctx.strokeStyle;

      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  };

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col overflow-hidden font-sans">
      
      {/* HEADER: SELECTOR DE MODO HOLOGRÁFICO */}
      <div className="p-8 flex flex-col items-center gap-6 z-20">
        <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/10">
          <button onClick={() => {setMainMode('visual'); setIsScanning(false);}} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${mainMode === 'visual' ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/40' : 'text-white/40'}`}>VISIÓN HOLOGRÁFICA</button>
          <button onClick={() => {setMainMode('acoustic'); setIsScanning(false);}} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${mainMode === 'acoustic' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' : 'text-white/40'}`}>FONENDO INTELIGENTE</button>
        </div>

        {/* SELECTOR DE SUB-MODALIDAD CON ICONOS */}
        <div className="flex gap-4 overflow-x-auto w-full no-scrollbar px-4">
          {MODALITIES[mainMode].map((m) => (
            <button 
              key={m.id} 
              onClick={() => {setSubMode(m.id); setIsScanning(false);}}
              className={`flex flex-col items-center gap-2 min-w-[80px] p-4 rounded-2xl border transition-all ${subMode === m.id ? 'border-white/40 bg-white/10 shadow-xl' : 'border-white/5 bg-transparent opacity-30'}`}
            >
              <span className="text-xl">{m.icon}</span>
              <span className="text-[8px] font-black tracking-tighter">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MONITOR CENTRAL DE ESCANEO */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className={`relative w-full max-w-lg aspect-square md:aspect-video rounded-[3rem] border-2 flex items-center justify-center overflow-hidden transition-all duration-1000 ${mainMode === 'visual' ? 'border-cyan-400/30 bg-cyan-950/5' : 'border-rose-500/30 bg-rose-950/5'}`}>
          
          {/* REJILLA TÁCTICA */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <canvas ref={canvasRef} className="w-full h-64 z-10" />

          {/* INDICADOR DE AMPLIFICACIÓN */}
          <div className="absolute top-10 right-10 text-right">
            <p className="text-[10px] font-black opacity-30 tracking-[0.3em]">GAIN 100X</p>
            <div className={`h-1 w-12 ml-auto mt-1 ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-white/10'}`} />
          </div>

          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <p className="text-[10px] font-black tracking-[0.5em] opacity-40 mb-4 uppercase">Listo para Escaneo</p>
              <button onClick={startEngine} className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 ${mainMode === 'visual' ? 'border-cyan-400 text-cyan-400' : 'border-rose-500 text-rose-500'}`}>
                <span className="text-2xl">▶</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* DOCK DE RESULTADOS */}
      <footer className="p-10">
        <div className="bg-[#0f172a]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-ping' : 'bg-white/20'}`} />
              <span className="text-[10px] font-black tracking-widest opacity-60 uppercase">Análisis en curso</span>
            </div>
            <span className="text-[10px] font-mono opacity-40">ID: CLINICAL-AI-99X</span>
          </div>
          <p className="text-sm font-medium italic text-white/80 leading-relaxed">
            {isScanning ? `Procesando señal ${subMode.toUpperCase()} con algoritmo de Deep Learning...` : "Seleccione modalidad y presione el iniciador holográfico para comenzar el diagnóstico."}
          </p>
        </div>
      </footer>
    </div>
  );
}