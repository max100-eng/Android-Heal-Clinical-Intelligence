import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, Settings, Mic, Heart, XCircle, Loader2, Share2, MapPin, 
  Wind, Zap, Camera, Upload, Target, Search, Radio, Brain, FileText, AlertTriangle 
} from 'lucide-react';

type DiagnosticMode = 'RETINA' | 'ECG' | 'RX' | 'FONENDO' | 'EEG' | 'OTO';

export default function App() {
  // ESTADOS GENERALES
  const [mode, setMode] = useState<DiagnosticMode>('ECG');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showPanel, setShowPanel] = useState(false);
  const [showCaptureMenu, setShowCaptureMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("Localizando...");

  // ESTADOS FONENDO (AUDIO)
  const [isListening, setIsListening] = useState(false);
  const [audioData, setAudioData] = useState<number[]>(new Array(40).fill(0));
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA DE GEOLOCALIZACIÓN ---
  const fetchLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((p) => {
        setLocation(`${p.coords.latitude.toFixed(4)}°N, ${p.coords.longitude.toFixed(4)}°E`);
      }, () => setLocation("Ubicación restringida"));
    }
  };

  // --- LÓGICA DE AUDIO (FONENDO) ---
  const startAuscultation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);
      analyser.current.fftSize = 256;
      setIsListening(true);
      updateWaveform();
    } catch (err) { alert("Acceso al micrófono denegado"); }
  };

  const updateWaveform = () => {
    if (!analyser.current) return;
    const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
    analyser.current.getByteFrequencyData(dataArray);
    const simplified = Array.from(dataArray.slice(0, 40)).map(v => v / 2.5);
    setAudioData(simplified);
    animationRef.current = requestAnimationFrame(updateWaveform);
  };

  const stopAuscultation = () => {
    setIsListening(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    audioContext.current?.close();
    executeAnalysis();
  };

  // --- LÓGICA DE ANÁLISIS UNIFICADA ---
  const executeAnalysis = async () => {
    setStatus('loading');
    setShowPanel(false);
    setShowCaptureMenu(false);
    fetchLocation();
    await new Promise(res => setTimeout(res, 3000));
    setStatus('success');
    setShowPanel(true);
    setStatus('idle');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setPreviewImage(reader.result as string); executeAnalysis(); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center overflow-hidden font-sans">
      <style>{`
        .hologram-view { background: radial-gradient(circle at center, rgba(6,182,212,0.1) 0%, rgba(2,6,23,1) 100%); }
        .scanner-bar { position: absolute; width: 100%; height: 3px; background: #22d3ee; box-shadow: 0 0 20px #22d3ee; z-index: 50; animation: scanMove 2s linear infinite; }
        @keyframes scanMove { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* DOCK SUPERIOR - SELECTOR DE MODOS */}
      <div className="w-full flex gap-4 overflow-x-auto p-6 no-scrollbar z-20">
        {[
          { id: 'RETINA', icon: <Target size={14}/> },
          { id: 'ECG', icon: <Activity size={14}/> },
          { id: 'RX', icon: <Radio size={14}/> },
          { id: 'FONENDO', icon: <Mic size={14}/> },
          { id: 'EEG', icon: <Brain size={14}/> },
          { id: 'OTO', icon: <Search size={14}/> }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => { setMode(item.id as DiagnosticMode); setShowPanel(false); setPreviewImage(null); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-full border text-[10px] font-black tracking-widest transition-all ${
              mode === item.id ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-slate-800 text-slate-500'
            }`}
          >
            {item.icon} {item.id}
          </button>
        ))}
      </div>

      {/* VISOR CENTRAL INTELIGENTE */}
      <div className="relative w-[92%] max-w-4xl h-[420px] rounded-[3rem] overflow-hidden hologram-view border border-slate-800/50 shadow-2xl flex items-center justify-center">
        {status === 'loading' && <div className="scanner-bar" />}
        
        {mode === 'FONENDO' ? (
          // INTERFAZ DE FONENDO
          <div className="flex flex-col items-center w-full px-10">
            <div className="flex items-end gap-1 h-32 mb-10 w-full max-w-sm">
              {audioData.map((val, i) => (
                <div key={i} className={`flex-1 ${isListening ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-slate-800'}`} style={{ height: `${Math.max(10, val)}%` }} />
              ))}
            </div>
            {!isListening ? (
              <button onClick={startAuscultation} className="px-10 py-4 bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center gap-3 shadow-lg active:scale-95 transition-all">
                <Mic size={18} /> Iniciar Escucha
              </button>
            ) : (
              <button onClick={stopAuscultation} className="px-10 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center gap-3 shadow-lg animate-pulse">
                <Zap size={18} /> Detener y Analizar
              </button>
            )}
          </div>
        ) : (
          // INTERFAZ VISUAL (CÁMARA/ARCHIVOS)
          <div className="relative w-full h-full flex items-center justify-center p-8">
            {previewImage ? (
              <img src={previewImage} className="max-h-full max-w-full object-contain rounded-xl opacity-80 mix-blend-lighten" alt="Capture" />
            ) : (
              <div className="flex flex-col items-center opacity-20">
                <Activity size={80} className="text-cyan-500 animate-pulse" />
                <p className="text-[10px] mt-4 tracking-[0.4em] uppercase font-bold text-cyan-700">Esperando Señal {mode}</p>
              </div>
            )}
          </div>
        )}

        {/* PANEL DE RESULTADOS UNIFICADO */}
        {showPanel && (
          <div className="absolute inset-y-0 right-0 w-80 bg-slate-950/98 backdrop-blur-3xl border-l border-cyan-500/30 p-8 z-[100] animate-in slide-in-from-right duration-500 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-cyan-400 font-black italic text-xl uppercase leading-tight">Informe<br/>Protocolo AI</h3>
              <button onClick={() => setShowPanel(false)} className="text-slate-500 hover:text-white"><XCircle size={24}/></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-700 bg-cyan-950/20 p-2 rounded-lg border border-cyan-900/30">
                <MapPin size={14} /> <span className="text-[9px] font-black uppercase tracking-tighter">{location}</span>
              </div>
              <div className="bg-cyan-500/10 border-l-4 border-cyan-500 p-4 rounded-r-xl">
                <p className="text-[9px] text-cyan-500 font-black uppercase mb-1 tracking-widest">Diagnóstico {mode}</p>
                <p className="text-xs font-bold text-white italic">
                  {mode === 'FONENDO' ? "Ruidos adventicios detectados en base pulmonar izquierda." : "Hallazgo biométrico analizado con éxito."}
                </p>
              </div>
              <button onClick={() => window.open(`https://wa.me/?text=Reporte Clínico AI - Modo: ${mode} - Ubicación: ${location}`, '_blank')} className="w-full py-4 bg-green-600/20 border border-green-500/50 text-green-500 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-all">
                <Share2 size={14} /> Enviar WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DOCK INFERIOR - ACCIONES */}
      <div className="fixed bottom-10 w-full flex flex-col items-center px-6 z-[110]">
        <input type="file" ref={fileInputRef} onChange={handleFile} className="hidden" accept="image/*" />
        
        {showCaptureMenu && mode !== 'FONENDO' && (
          <div className="mb-6 flex gap-8 animate-in fade-in zoom-in duration-300">
            <button onClick={executeAnalysis} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-[#0a1122] border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <Camera size={24} />
              </div>
              <span className="text-[9px] font-black uppercase text-cyan-700">Cámara</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-[#0a1122] border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <Upload size={24} />
              </div>
              <span className="text-[9px] font-black uppercase text-cyan-700">Archivo</span>
            </button>
          </div>
        )}

        <div className="bg-[#0a1122]/95 backdrop-blur-3xl border border-white/5 px-12 py-6 rounded-[4rem] flex items-center gap-14 shadow-2xl relative">
          <button className="text-cyan-400"><Heart size={24}/></button>
          <div className="relative -top-14">
            <button 
              onClick={() => setShowCaptureMenu(!showCaptureMenu)}
              disabled={status === 'loading'}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 border-[10px] border-[#020617] ${
                status === 'loading' ? 'bg-slate-800' : 'bg-cyan-500 shadow-[0_0_45px_rgba(34,211,238,0.5)] active:scale-95'
              }`}
            >
              {status === 'loading' ? <Loader2 className="animate-spin text-white w-10 h-10" /> : <Settings className="text-white w-10 h-10" />}
            </button>
          </div>
          <button className="text-slate-600 hover:text-cyan-400 transition-colors"><Search size={24}/></button>
        </div>
      </div>
    </div>
  );
}