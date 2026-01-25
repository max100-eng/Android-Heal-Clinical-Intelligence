import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProtocoloAI() {
  const [isFonendo, setIsFonendo] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationIdRef = useRef<number>();

  // --- LÓGICA DEL FONENDO (MICROFÓNO REAL) ---
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      drawVisualizer();
    } catch (err) {
      console.error("Acceso al micrófono denegado", err);
      setError("No se pudo acceder al micrófono para el Fonendo.");
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgb(244, 63, 94)`; // Rosa Fonendo
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#f43f5e";
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const stopAudio = () => {
    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  useEffect(() => {
    if (isFonendo) startAudioVisualizer();
    else stopAudio();
    return () => stopAudio();
  }, [isFonendo]);

  // --- NAVEGACIÓN Y CAPTURA ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageData(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const ejecutarAnalisis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://copy-of-clinical-intelligence-image-analyzer-651390744915.us-west1.run.app/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: isFonendo ? "audio_stream" : imageData }),
      });
      const res = await response.json();
      setAnalysis(res.summary || "Análisis completado satisfactoriamente.");
      containerRef.current?.scrollTo({ top: window.innerHeight * 2, behavior: 'smooth' });
    } catch (err) {
      setError("Error de red: El servidor clínico no responde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col overflow-hidden">
      
      {/* Botones de Cabecera */}
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center gap-4">
        <button onClick={() => setIsFonendo(false)} className={`px-6 py-2 rounded-xl border text-[10px] font-bold tracking-widest transition-all ${!isFonendo ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-white/10 text-white/40'}`}>VISIÓN</button>
        <button onClick={() => setIsFonendo(true)} className={`px-6 py-2 rounded-xl border text-[10px] font-bold tracking-widest transition-all ${isFonendo ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'border-white/10 text-white/40'}`}>FONENDO</button>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth">
        
        {/* Pantalla de Inicio */}
        <section className="h-full w-full flex flex-col items-center justify-center snap-start">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Protocolo<span className="text-cyan-400">AI</span></h1>
          <p className="text-[10px] tracking-[0.5em] text-white/20 mt-2 uppercase">Inteligencia Clínica</p>
          <div className="mt-20 animate-bounce cursor-pointer text-cyan-400" onClick={() => containerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>↓</div>
        </section>

        {/* Pantalla de Captura */}
        <section className="h-full w-full flex flex-col items-center justify-center snap-start p-6">
          <h2 className="text-2xl font-black italic uppercase text-cyan-400 mb-8">Captura Médica</h2>
          
          <div 
            onClick={() => !isFonendo && fileInputRef.current?.click()}
            className={`relative w-full max-w-sm aspect-[4/5] rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 ${isFonendo ? 'border-rose-500 bg-rose-950/20' : 'border-white/10 bg-white/5'}`}
          >
            {isFonendo ? (
              <canvas ref={canvasRef} className="w-full h-32" />
            ) : imageData ? (
              <img src={imageData} className="w-full h-full object-cover rounded-[3rem]" alt="Captura" />
            ) : (
              <div className="text-center opacity-30">
                <p className="text-4xl mb-4">📸</p>
                <p className="text-[10px] font-bold uppercase tracking-widest">Toque para escanear</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <button 
            onClick={ejecutarAnalisis}
            className="mt-8 w-full max-w-sm py-5 rounded-2xl bg-[#00c2cb] text-black font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-transform"
          >
            {loading ? 'Analizando...' : 'Ejecutar Análisis'}
          </button>
        </section>

        {/* Pantalla de Resultados */}
        <section className="h-full w-full flex flex-col items-center justify-center snap-start p-6">
          {error ? (
            <div className="bg-rose-500/20 border border-rose-500 p-8 rounded-[2.5rem] text-center">
              <p className="text-rose-400 font-bold uppercase">⚠️ Error de Conexión</p>
              <button onClick={() => containerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="mt-4 bg-rose-500 px-6 py-2 rounded-xl text-[10px] font-bold">CERRAR</button>
            </div>
          ) : analysis && (
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] max-w-md">
              <p className="text-cyan-400 font-bold text-[10px] uppercase mb-4 tracking-widest">Informe de Diagnóstico</p>
              <p className="text-white/80 italic leading-relaxed">{analysis}</p>
            </div>
          )}
        </section>
      </div>

      {/* Dock Inferior */}
      <div className="fixed bottom-6 inset-x-4 flex justify-center">
        <div className="bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 w-full max-w-md flex justify-around items-center">
          <span className="opacity-40">🏠</span>
          <div className="w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">✨</div>
          <span className="opacity-40">📊</span>
        </div>
      </div>
    </div>
  );
}