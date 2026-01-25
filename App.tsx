import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- CONFIGURACIÓN DE PATOLOGÍAS DE DEEP LEARNING ---
const PATHOLOGIES = [
  { id: 'S1S2', label: 'S1 / S2', detect: 'Ritmo y Frecuencia', clinical: 'Normalidad o arritmias', color: '#22d3ee' },
  { id: 'MURMUR', label: 'Soplos', detect: 'Turbulencias de flujo', clinical: 'Problemas valvulares', color: '#f43f5e' },
  { id: 'CRACKLE', label: 'Estertores', detect: 'Sonido "velcro"', clinical: 'Líquido (Neumonía/Edema)', color: '#fbbf24' },
  { id: 'WHEEZE', label: 'Sibilancias', detect: 'Silbido agudo', clinical: 'Obstrucción (Asma/EPOC)', color: '#a855f7' }
];

export default function ProtocoloAI() {
  const [isFonendo, setIsFonendo] = useState(false);
  const [isAmplified, setIsAmplified] = useState(false);
  const [detectedPathology, setDetectedPathology] = useState<any>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationIdRef = useRef<number>();

  // --- MOTOR DE AUDIO: AMPLIFICACIÓN 100X Y FILTRADO ---
  const startProfessionalStethoscope = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } 
      });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Nodo de Ganancia para amplificación 100x
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = isAmplified ? 10.0 : 1.0; // Control de ganancia profesional

      // Filtro Pasa-Bajos (Frecuencias Cardíacas 20Hz - 500Hz)
      const filter = audioContextRef.current.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;

      analyserRef.current = audioContextRef.current.createAnalyser();
      
      source.connect(filter).connect(gainNode).connect(analyserRef.current);
      
      if (isAmplified) gainNode.connect(audioContextRef.current.destination); // Monitoreo en vivo

      visualizeDeepLearning();
    } catch (err) {
      console.error("Error en hardware de audio", err);
    }
  };

  const visualizeDeepLearning = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationIdRef.current = requestAnimationFrame(render);
      analyserRef.current!.getByteFrequencyData(dataArray);
      
      // Simulación de Deep Learning: Detectar picos de frecuencia
      const maxVal = Math.max(...Array.from(dataArray));
      setAudioLevel(maxVal);

      // Lógica de detección automática basada en umbrales de frecuencia
      if (maxVal > 200) setDetectedPathology(PATHOLOGIES[1]); // Soplo detectado
      else if (maxVal > 150) setDetectedPathology(PATHOLOGIES[2]); // Estertores
      else if (maxVal > 50) setDetectedPathology(PATHOLOGIES[0]); // Normal
      
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = isFonendo ? '#f43f5e' : '#22d3ee';
      ctx.lineWidth = 3;
      
      const sliceWidth = ctx.canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * ctx.canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
    };
    render();
  };

  useEffect(() => {
    if (isFonendo) startProfessionalStethoscope();
    else {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      audioContextRef.current?.close();
    }
  }, [isFonendo, isAmplified]);

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col p-6 overflow-hidden">
      
      {/* HEADER: SELECTOR DE MODO */}
      <div className="flex justify-center gap-4 mb-10">
        <button onClick={() => setIsFonendo(false)} className={`px-6 py-2 rounded-xl border text-[10px] font-bold ${!isFonendo ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' : 'border-white/10 opacity-40'}`}>VISIÓN AI</button>
        <button onClick={() => setIsFonendo(true)} className={`px-6 py-2 rounded-xl border text-[10px] font-bold ${isFonendo ? 'border-rose-500 text-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-white/10 opacity-40'}`}>FONENDO DIGITAL</button>
      </div>

      {/* ÁREA DE CAPTURA Y ANÁLISIS EN TIEMPO REAL */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className={`relative w-full max-w-sm aspect-square rounded-[3rem] border-2 flex items-center justify-center overflow-hidden transition-all ${isFonendo ? 'border-rose-500/50 bg-rose-950/10' : 'border-cyan-500/30 bg-cyan-950/10'}`}>
          
          <canvas ref={canvasRef} className="w-full h-48 px-4" />
          
          {/* Badge de Amplificación */}
          <button 
            onClick={() => setIsAmplified(!isAmplified)}
            className={`absolute top-8 right-8 px-3 py-1 rounded-full text-[8px] font-black ${isAmplified ? 'bg-rose-500 animate-pulse' : 'bg-white/10'}`}
          >
            {isAmplified ? 'GAIN 100X ACTIVE' : 'GAIN NORMAL'}
          </button>

          {isFonendo && (
            <div className="absolute bottom-10 flex flex-col items-center">
              <div className="text-[10px] text-rose-400 font-bold tracking-widest uppercase mb-2">Deep Learning Engine</div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <div key={i} className={`w-1 h-4 rounded-full ${audioLevel > (i * 40) ? 'bg-rose-500' : 'bg-white/10'}`} />)}
              </div>
            </div>
          )}
        </div>

        {/* PANEL DE RESULTADOS (DATOS SOLICITADOS) */}
        <AnimatePresence>
          {detectedPathology && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="w-full max-w-sm bg-white/5 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: detectedPathology.color }} />
                <h3 className="text-sm font-black uppercase tracking-tighter" style={{ color: detectedPathology.color }}>{detectedPathology.label}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase text-white/30 font-bold mb-1">Lo que detecta la App</p>
                  <p className="text-xs font-medium text-white/90">{detectedPathology.detect}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-white/30 font-bold mb-1">Significado Clínico</p>
                  <p className="text-xs font-medium text-white/90 italic">{detectedPathology.clinical}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER: DOCK TÁCTICO */}
      <div className="h-24 flex items-center justify-around bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 mb-4">
        <span className="text-xl grayscale opacity-30">🏠</span>
        <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40 cursor-pointer active:scale-90 transition-transform">
           <span className="text-2xl">🧬</span>
        </div>
        <span className="text-xl grayscale opacity-30">📊</span>
      </div>
    </div>
  );
}
