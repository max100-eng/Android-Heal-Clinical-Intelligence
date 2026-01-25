import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, Settings, AlertCircle, CheckCircle2, Loader2, Eye, Clock, Heart, 
  XCircle, Zap, Camera, Upload, Mic, Brain, Radio, Target, Search, FileText, MapPin, Share2, AlertTriangle
} from 'lucide-react';

type DiagnosticMode = 'RETINA' | 'ECG' | 'RX' | 'FONENDO' | 'EEG' | 'OTO';

export default function App() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mode, setMode] = useState<DiagnosticMode>('ECG');
  const [showPanel, setShowPanel] = useState(false);
  const [showCaptureMenu, setShowCaptureMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("Localizando...");
  const [emergencyTimer, setEmergencyTimer] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lógica del Temporizador de Emergencia
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emergencyTimer !== null && emergencyTimer > 0) {
      interval = setInterval(() => {
        setEmergencyTimer(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (emergencyTimer === 0) {
      sendEmergencyWhatsApp();
      setEmergencyTimer(null);
    }
    return () => clearInterval(interval);
  }, [emergencyTimer]);

  const fetchLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`);
      }, () => setLocation("Ubicación restringida"));
    }
  };

  const sendEmergencyWhatsApp = () => {
    const message = `*🚨 ALERTA DE EMERGENCIA MÉDICA 🚨*%0A%0A` +
                    `*ESTADO CRÍTICO DETECTADO POR PROTOCOLO AI*%0A` +
                    `*Modo:* ${mode}%0A` +
                    `*Ubicación:* ${location}%0A` +
                    `*Google Maps:* https://www.google.com/maps?q=${location.replace(" ", "")}%0A` +
                    `*Fecha:* ${new Date().toLocaleString()}%0A%0A` +
                    `_Se requiere asistencia inmediata._`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const executeAnalysis = async () => {
    setShowPanel(false);
    setShowCaptureMenu(false);
    setStatus('loading');
    fetchLocation();

    try {
      await new Promise(resolve => setTimeout(resolve, 3500));
      setStatus('success');
      setTimeout(() => {
        setShowPanel(true);
        setStatus('idle');
        // Si es ECG, activamos protocolo de emergencia simulado
        if (mode === 'ECG') setEmergencyTimer(10);
      }, 500);
    } catch (error) { setStatus('error'); }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
        .scanner-bar { position: absolute; width: 100%; height: 3px; background: #22d3ee; box-shadow: 0 0 20px #22d3ee; animation: scanMove 2.5s linear infinite; }
        @keyframes scanMove { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
      `}</style>

      {/* Alerta de Emergencia Superpuesta */}
      {emergencyTimer !== null && (
        <div className="fixed inset-0 z-[200] bg-red-600/20 backdrop-blur-md flex items-center justify-center p-6 animate-pulse">
          <div className="bg-slate-950 border-2 border-red-600 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.5)]">
            <AlertTriangle size={60} className="text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-red-600 uppercase italic">Emergencia Detectada</h2>
            <p className="text-slate-400 text-xs my-4 leading-relaxed uppercase tracking-widest font-bold">
              Enviando alerta automática a servicios de emergencia en:
            </p>
            <div className="text-6xl font-black text-white mb-6">{emergencyTimer}s</div>
            <button 
              onClick={() => setEmergencyTimer(null)}
              className="w-full py-4 bg-slate-900 border border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all"
            >
              Cancelar Protocolo
            </button>
          </div>
        </div>
      )}

      {/* Selector Superior */}
      <div className="w-full flex gap-4 overflow-x-auto p-6 no-scrollbar z-20">
        {['RETINA', 'ECG', 'RX', 'FONENDO', 'EEG', 'OTO'].map((m) => (
          <button 
            key={m}
            onClick={() => {setMode(m as DiagnosticMode); setShowPanel(false); setPreviewImage(null);}}
            className={`px-6 py-2 rounded-full border text-[10px] font-black tracking-widest transition-all ${
              mode === m ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : 'border-slate-800 text-slate-500'
            }`}
          > {m} </button>
        ))}
      </div>

      {/* Visor Médico Principal */}
      <div className="relative w-[92%] max-w-4xl h-[400px] rounded-[3rem] overflow-hidden hologram-view border border-slate-800/50 shadow-2xl flex items-center justify-center">
        {status === 'loading' && <div className="scanner-bar" />}
        <div className="relative w-full h-full flex items-center justify-center p-8">
          {previewImage ? (
            <img src={previewImage} className="max-h-full max-w-full object-contain rounded-xl opacity-80" alt="Capture" />
          ) : (
            <div className="flex flex-col items-center opacity-20">
              <Activity size={80} className="text-cyan-500 animate-pulse" />
              <p className="text-[10px] mt-4 tracking-[0.4em] uppercase font-bold text-cyan-700 italic">Protocolo {mode} activo</p>
            </div>
          )}
        </div>

        {/* Panel de Resultados */}
        {showPanel && (
          <div className="absolute inset-y-0 right-0 w-80 bg-slate-950/98 backdrop-blur-3xl border-l border-cyan-500/30 p-8 z-[100] animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-cyan-400 font-black italic text-xl uppercase leading-tight">Protocolo AI<br/>Resultado</h3>
              <button onClick={() => {setShowPanel(false); setEmergencyTimer(null);}} className="text-slate-500 hover:text-white"><XCircle size={24}/></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-700 bg-cyan-950/20 p-2 rounded-lg border border-cyan-900/30">
                <MapPin size={14} />
                <span className="text-[9px] font-black uppercase tracking-tighter">{location}</span>
              </div>
              <div className={`p-4 rounded-r-xl border-l-4 ${mode === 'ECG' ? 'bg-red-500/10 border-red-500' : 'bg-cyan-500/10 border-cyan-500'}`}>
                <p className={`text-[9px] font-black uppercase mb-1 ${mode === 'ECG' ? 'text-red-500' : 'text-cyan-500'}`}>
                   {mode === 'ECG' ? 'Hallazgo Crítico' : 'Resultado AI'}
                </p>
                <p className="text-xs font-bold text-white italic">
                  {mode === 'ECG' ? 'Elevación ST: Infarto detectado.' : `Análisis de ${mode} completado.`}
                </p>
              </div>
              <button onClick={() => window.open(`https://wa.me/?text=Reporte:${mode}`, '_blank')} className="w-full py-4 bg-green-600/20 border border-green-500/50 text-green-500 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-2">
                <Share2 size={14} /> Compartir WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Menú de Captura y FAB */}
      <div className="fixed bottom-10 w-full flex flex-col items-center px-6 z-[110]">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        {showCaptureMenu && (
          <div className="mb-6 flex gap-8 animate-in fade-in zoom-in duration-300">
            <button onClick={executeAnalysis} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-[#0a1122] border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 transition-all shadow-xl">
                <Camera size={24} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-700 group-hover:text-cyan-400 transition-colors">Cámara</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-[#0a1122] border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 transition-all shadow-xl">
                <Upload size={24} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-700 group-hover:text-cyan-400 transition-colors">Archivo</span>
            </button>
          </div>
        )}
        <div className="bg-[#0a1122]/95 backdrop-blur-3xl border border-white/5 px-12 py-6 rounded-[4rem] flex items-center gap-14 shadow-2xl relative">
          <button className="text-cyan-400 hover:scale-110 transition-transform"><Heart size={24}/></button>
          <div className="relative -top-14">
            <button 
              onClick={() => setShowCaptureMenu(!showCaptureMenu)}
              disabled={status === 'loading'}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 border-[10px] border-[#020617] ${
                status === 'loading' ? 'bg-slate-800' : 'bg-cyan-500 shadow-[0_0_45px_rgba(34,211,238,0.5)] active:scale-95'
              }`}
            >
              {status === 'loading' ? <Loader2 className="animate-spin text-white w-10 h-10" /> : <Settings className={`text-white w-10 h-10 ${showCaptureMenu ? 'rotate-90' : ''} transition-transform`} />}
            </button>
          </div>
          <button className="text-slate-600 hover:text-cyan-400 transition-colors"><Search size={24}/></button>
        </div>
      </div>
    </div>
  );
}