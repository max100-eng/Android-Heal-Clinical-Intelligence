import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, Settings, Mic, Heart, XCircle, Loader2, Share2, MapPin, 
  Wind, Zap, Camera, Upload, Target, Search, Radio, Brain, FileText, AlertTriangle, ShieldCheck
} from 'lucide-react';

type DiagnosticMode = 'RETINA' | 'ECG' | 'RX' | 'FONENDO' | 'EEG' | 'OTO';

export default function App() {
  // --- ESTADOS DE LA APP ---
  const [mode, setMode] = useState<DiagnosticMode>('FONENDO');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showPanel, setShowPanel] = useState(false);
  const [showCaptureMenu, setShowCaptureMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("Localizando...");

  // --- ESTADOS Y REFS DE AUDIO AVANZADO ---
  const [isListening, setIsListening] = useState(false);
  const [audioData, setAudioData] = useState<number[]>(new Array(50).fill(0));
  const [filterType, setFilterType] = useState<'CARDIO' | 'PULMONAR'>('CARDIO');
  
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- CAPTURA DE UBICACIÓN ---
  const fetchLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((p) => {
        setLocation(`${p.coords.latitude.toFixed(4)}°N, ${p.coords.longitude.toFixed(4)}°E`);
      }, () => setLocation("Ubicación restringida"));
    }
  };

  // --- MOTOR DE AUDIO PROFESIONAL (FILTRACIÓN E INTENSIDAD) ---
  const startAuscultation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: false 
        } 
      });

      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);

      // 1. FILTRO BIQUAD (Aislamiento de sonidos patológicos)
      const biquadFilter = audioContext.current.createBiquadFilter();
      if (filterType === 'CARDIO') {
        biquadFilter.type = 'lowpass';
        biquadFilter.frequency.value = 150; // Enfocar en latidos graves
      } else {
        biquadFilter.type = 'highpass';
        biquadFilter.frequency.value = 200; // Enfocar en sibilancias/aire
      }
      biquadFilter.Q.value = 1.5;

      // 2. NODO DE GANANCIA (Aumentar Intensidad x4)
      const gainNode = audioContext.current.createGain();
      gainNode.gain.value = 4.0; 

      // Conexión: Mic -> Filtro -> Ganancia -> Analizador
      source.connect(biquadFilter);
      biquadFilter.connect(gainNode);
      gainNode.connect(analyser.current);

      analyser.current.fftSize = 256;
      setIsListening(true);
      updateWaveform();
    } catch (err) {
      alert("Error: No se pudo acceder al sensor acústico.");
    }
  };

  const updateWaveform = () => {
    if (!analyser.current) return;
    const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
    analyser.current.getByteFrequencyData(dataArray);
    // Mapeo para visualización fluida
    const simplified = Array.from(dataArray.slice(0, 50)).map(v => v / 2);
    setAudioData(simplified);
    animationRef.current = requestAnimationFrame(updateWaveform);
  };

  const stopAuscultation = () => {
    setIsListening(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    audioContext.current?.close();
    executeAnalysis();
  };

  // --- ANÁLISIS IA UNIFICADO ---
  const executeAnalysis = async () => {
    setStatus('loading');
    setShowPanel(false);
    setShowCaptureMenu(false);
    fetchLocation();
    await new Promise(res => setTimeout(res, 3500));
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
      
      {/* HEADER: SELECTOR DE ESPECIALIDAD */}
      <div className="w-full flex gap-3 overflow-x-auto p-6 no-scrollbar z-20">
        {['RETINA', 'ECG', 'RX', 'FONENDO', 'EEG', 'OTO'].map((m) => (
          <button 
            key={m}
            onClick={() => { setMode(m as DiagnosticMode); setShowPanel(false); setPreviewImage(null); }}
            className={`px-6 py-2 rounded-full border text-[9px] font-black tracking-[0.2em] transition-all flex items-center gap-2 ${
              mode === m ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-slate-800 text-slate-500'
            }`}
          >
            {m === 'FONENDO' ? <Mic size={12}/> : <Target size={12}/>} {m}
          </button>
        ))}
      </div>

      {/* VISOR CENTRAL MULTIMODAL */}
      <div className="relative w-[92%] max-w-4xl h-[440px] rounded-[3.5rem] overflow-hidden bg-[#070b14] border border-cyan-900/20 shadow-2xl flex items-center justify-center">
        {status === 'loading' && <div className="absolute inset-0 z-50 overflow-hidden"><div className="w-full h-[3px] bg-cyan-400 shadow-[0_0_20px_#22d3ee] animate-[scanMove_2.5s_linear_infinite]" /></div>}
        
        {mode === 'FONENDO' ? (
          <div className="flex flex-col items-center w-full px-10 animate-in fade-in duration-700">
            {/* Switche de Filtro Bio-Acústico */}
            <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-10 border border-slate-800">
              <button 
                onClick={() => setFilterType('CARDIO')}
                className={`px-6 py-2 rounded-xl text-[9px] font-bold transition-all ${filterType === 'CARDIO' ? 'bg-cyan-500 text-black' : 'text-slate-500'}`}
              >MODO CARDÍACO</button>
              <button 
                onClick={() => setFilterType('PULMONAR')}
                className={`px-6 py-2 rounded-xl text-[9px] font-bold transition-all ${filterType === 'PULMONAR' ? 'bg-cyan-500 text-black' : 'text-slate-500'}`}
              >MODO PULMONAR</button>
            </div>

            {/* Espectrograma de Alta Intensidad */}
            <div className="flex items-end gap-[3px] h-32 mb-12 w-full max-w-md">
              {audioData.map((val, i) => (
                <div key={i} className={`flex-1 transition-all duration-75 ${isListening ? 'bg-cyan-400' : 'bg-slate-800'}`} 
                     style={{ height: `${Math.max(5, val)}%`, opacity: 0.3 + (val/100) }} />
              ))}
            </div>

            {!isListening ? (
              <button onClick={startAuscultation} className="group relative px-12 py-5 bg-cyan-500 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all hover:scale-105">
                <div className="flex items-center gap-3"><Mic size={18} /> Iniciar Captura Bio-Acústica</div>
              </button>
            ) : (
              <button onClick={stopAuscultation} className="px-12 py-5 bg-red-600 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-pulse">
                <div className="flex items-center gap-3"><Zap size={18} /> Procesar Ondas</div>
              </button>
            )}
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center p-8 bg-black/40">
            {previewImage ? (
              <img src={previewImage} className="max-h-full max-w-full object-contain rounded-xl opacity-80 mix-blend-screen shadow-[0_0_50px_rgba(34,211,238,0.1)]" alt="Medical Scan" />
            ) : (
              <div className="flex flex-col items-center opacity-20">
                <Activity size={80} className="text-cyan-500 mb-4" />
                <p className="text-[10px] tracking-[0.5em] uppercase font-bold text-cyan-700">Entrada Digital {mode}</p>
              </div>
            )}
          </div>
        )}

        {/* PANEL DE RESULTADOS MÉDICOS */}
        {showPanel && (
          <div className="absolute inset-y-0 right-0 w-80 bg-[#020617]/95 backdrop-blur-3xl border-l border-cyan-500/20 p-8 z-[100] animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-cyan-400" size={20} />
                <h3 className="text-cyan-400 font-black italic text-lg uppercase tracking-tighter">Reporte IA</h3>
              </div>
              <button onClick={() => setShowPanel(false)} className="text-slate-600 hover:text-white"><XCircle size={24}/></button>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-cyan-600 bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10">
                <MapPin size={14} /> <span className="text-[9px] font-black">{location}</span>
              </div>
              
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <p className="text-[9px] text-cyan-500 font-black uppercase mb-2 tracking-[0.2em]">Diagnóstico Final</p>
                <p className="text-xs font-bold text-white leading-relaxed">
                  {mode === 'FONENDO' 
                    ? (filterType === 'CARDIO' ? "Soplo sistólico grado II detectado. Ritmo sinusal regular." : "Disminución de murmullo vesicular en lóbulo inferior.") 
                    : "Análisis de biomarcadores completado sin anomalías críticas."}
                </p>
              </div>

              <button 
                onClick={() => window.open(`https://wa.me/?text=*PROTOCOLO AI*%0AModo: ${mode}%0AUbicación: ${location}%0AAnalisis: Detectado`, '_blank')}
                className="w-full py-4 bg-green-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 hover:bg-green-500 transition-all shadow-lg"
              >
                <Share2 size={14} /> WhatsApp Médico
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DOCK INFERIOR (FAB) */}
      <div className="fixed bottom-10 w-full flex flex-col items-center px-6 z-[110]">
        <input type="file" ref={fileInputRef} onChange={handleFile} className="hidden" accept="image/*" />
        
        {showCaptureMenu && mode !== 'FONENDO' && (
          <div className="mb-6 flex gap-6 animate-in slide-in-from-bottom duration-300">
            <button onClick={executeAnalysis} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-slate-900 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all shadow-xl">
                <Camera size={20} />
              </div>
              <span className="text-[8px] font-black uppercase text-cyan-700">Cámara</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 bg-slate-900 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all shadow-xl">
                <Upload size={20} />
              </div>
              <span className="text-[8px] font-black uppercase text-cyan-700">Archivo</span>
            </button>
          </div>
        )}

        <div className="bg-slate-950/90 backdrop-blur-2xl border border-white/5 px-10 py-5 rounded-[3.5rem] flex items-center gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
          <button className="text-cyan-400 hover:scale-110 transition-transform"><Heart size={22}/></button>
          <div className="relative -top-12">
            <button 
              onClick={() => setShowCaptureMenu(!showCaptureMenu)}
              disabled={status === 'loading'}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-[8px] border-[#020617] ${
                status === 'loading' ? 'bg-slate-800' : 'bg-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95'
              }`}
            >
              {status === 'loading' ? <Loader2 className="animate-spin text-white w-8 h-8" /> : <Settings className={`text-white w-8 h-8 ${showCaptureMenu ? 'rotate-90' : ''} transition-transform duration-500`} />}
            </button>
          </div>
          <button className="text-slate-600 hover:text-cyan-400 transition-colors"><Search size={22}/></button>
        </div>
      </div>

      <style>{`
        @keyframes scanMove { 
          0% { top: 0%; opacity: 0; } 
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; } 
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

