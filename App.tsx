import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURACIÓN ---
const MODALITIES = {
  visual: [
    { id: 'ecg', label: 'ECG', icon: '❤️' },
    { id: 'rx', label: 'RAYOS X', icon: '🦴' },
    { id: 'dermo', label: 'DERMO', icon: '🔍' },
    { id: 'retina', label: 'RETINA', icon: '👁️' }
  ],
  acoustic: [
    { id: 'cardiac', label: 'CARDÍACO', icon: '🫀', filter: 500 },
    { id: 'pulmonar', label: 'PULMONAR', icon: '🫁', filter: 1200 }
  ]
};

export default function ProtocoloAI() {
  const [mainMode, setMainMode] = useState<'visual' | 'acoustic'>('visual');
  const [subMode, setSubMode] = useState('ecg');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number>();

  // --- FUNCIÓN MAESTRA DE ESCANEO ---
  const handleStartScan = async () => {
    if (isScanning) {
      stopScan();
      return;
    }

    try {
      setError(null);
      // 1. Solicitar permisos (Esto activa el escaneo real)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: mainMode === 'acoustic', 
        video: mainMode === 'visual' 
      });

      setIsScanning(true);

      if (mainMode === 'acoustic') {
        // Lógica de Fonendo 100x
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtxRef.current.createMediaStreamSource(stream);
        const analyser = audioCtxRef.current.createAnalyser();
        
        const gainNode = audioCtxRef.current.createGain();
        gainNode.gain.value = 25.0; // Amplificación masiva

        source.connect(gainNode).connect(analyser);
        visualize(analyser);
      } else {
        // Simulación de Escaneo Holográfico Visual
        simulateVisualScan();
      }
    } catch (err) {
      setError("Permiso denegado. Activa el micrófono/cámara.");
      console.error(err);
    }
  };

  const stopScan = () => {
    setIsScanning(false);
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const visualize = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#f43f5e'; // Rosa para Fonendo
      ctx.beginPath();
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        x += canvas.width / dataArray.length;
      }
      ctx.stroke();
    };
    draw();
  };

  const simulateVisualScan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#22d3ee'; // Cian para Visión
      ctx.lineWidth = 2;
      const time = Date.now() * 0.005;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i++) {
        const y = canvas.height/2 + Math.sin(i * 0.05 + time) * 30;
        if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
      }
      ctx.stroke();
    };
    draw();
  };

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col overflow-hidden">
      {/* Botones de Modo */}
      <div className="p-8 flex justify-center gap-4 z-20">
        <button onClick={() => {setMainMode('visual'); stopScan();}} className={`px-6 py-2 rounded-xl text-[10px] font-bold border transition-all ${mainMode === 'visual' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : 'border-white/5 opacity-40'}`}>VISIÓN</button>
        <button onClick={() => {setMainMode('acoustic'); stopScan();}} className={`px-6 py-2 rounded-xl text-[10px] font-bold border transition-all ${mainMode === 'acoustic' ? 'border-rose-500 bg-rose-500/10 text-rose-500' : 'border-white/5 opacity-40'}`}>FONENDO</button>
      </div>

      {/* Monitor de Escaneo */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className={`relative w-full max-w-lg aspect-square rounded-[3rem] border-2 flex items-center justify-center overflow-hidden ${mainMode === 'visual' ? 'border-cyan-500/30' : 'border-rose-500/30'}`}>
          <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
          
          {!isScanning && (
            <button onClick={handleStartScan} className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${mainMode === 'visual' ? 'border-cyan-400 text-cyan-400' : 'border-rose-500 text-rose-500'}`}>
                <span className="text-xs font-black">START</span>
              </div>
            </button>
          )}
          
          {error && <p className="absolute bottom-10 text-rose-500 text-[10px] font-bold">{error}</p>}
        </div>
      </div>

      {/* Selector de Items */}
      <div className="p-10 flex gap-4 overflow-x-auto no-scrollbar">
        {MODALITIES[mainMode].map((m) => (
          <button key={m.id} onClick={() => {setSubMode(m.id); stopScan();}} className={`flex-shrink-0 px-6 py-4 rounded-2xl border transition-all ${subMode === m.id ? 'bg-white/10 border-white/40 shadow-lg' : 'border-white/5 opacity-30'}`}>
            <span className="text-xl block text-center mb-1">{m.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-tighter">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}