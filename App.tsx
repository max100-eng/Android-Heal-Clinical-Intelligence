import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, Settings, AlertCircle, CheckCircle2, Loader2, Eye, Clock, Heart, 
  XCircle, Zap, Camera, Upload, Mic, Brain, Radio, Target, Search, FileText
} from 'lucide-react';

type DiagnosticMode = 'RETINA' | 'ECG' | 'RX' | 'FONENDO' | 'EEG' | 'OTO';

export default function App() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mode, setMode] = useState<DiagnosticMode>('ECG');
  const [showPanel, setShowPanel] = useState(false);
  const [showCaptureMenu, setShowCaptureMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Referencia para el input de archivos oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lógica de análisis y procesamiento
  const executeAnalysis = async () => {
    setShowPanel(false);
    setShowCaptureMenu(false);
    setStatus('loading');

    try {
      // Simulación de proceso de IA
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      setStatus('success');
      
      // Forzar apertura de panel tras el escaneo
      setTimeout(() => {
        setShowPanel(true);
        setStatus('idle');
      }, 500);
    } catch (error) {
      setStatus('error');
    }
  };

  // Manejador de subida de archivos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string); // Carga la imagen en el visor
        executeAnalysis(); // Dispara el escaneo
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center overflow-hidden font-sans">
      <style>{`
        .hologram-view { background: radial-gradient(circle at center, rgba(6,182,212,0.1) 0%, rgba(2,6,23,1) 100%); position: relative; }
        .scanner-bar { position: absolute; width: 100%; height: 3px; background: #22d3ee; box-shadow: 0 0 20px #22d3ee; z-index: 50; animation: scanMove 2s linear infinite; }
        @keyframes scanMove { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .glass-container { backdrop-filter: blur(10px); border: 1px solid rgba(34,211,238,0.1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Selector de Especialidades */}
      <div className="w-full flex gap-4 overflow-x-auto p-6 no-scrollbar z-20">
        {['RETINA', 'ECG', 'RX', 'FONENDO', 'EEG', 'OTO'].map((m) => (
          <button 
            key={m}
            onClick={() => {setMode(m as DiagnosticMode); setShowPanel(false); setPreviewImage(null);}}
            className={`px-6 py-2 rounded-full border text-[10px] font-black tracking-widest transition-all ${
              mode === m ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-slate-800 text-slate-500'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Visor Médico Inteligente */}
      <div className="relative w-[92%] max-w-4xl h-[420px] rounded-[3rem] overflow-hidden hologram-view border border-slate-800/50 shadow-2xl glass-container flex items-center justify-center">
        {status === 'loading' && <div className="scanner-bar" />}
        
        {/* Visualización de Imagen o Placeholder */}
        <div className="relative w-full h-full flex items-center justify-center p-8">
          {previewImage ? (
            <img src={previewImage} className="max-h-full max-w-full object-contain rounded-xl opacity-80 mix-blend-lighten" alt="Capture" />
          ) : mode === 'RETINA' ? (
            <div className="w-64 h-64 rounded-full border-2 border-cyan-500/20 overflow-hidden relative shadow-inner">
               <div className="absolute inset-0 bg-cyan-950/20 animate-pulse" />
               <Target className="absolute inset-0 m-auto text-cyan-900/50" size={100} />
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-20">
              <Activity size={80} className="text-cyan-500" />
              <p className="text-[10px] mt-4 tracking-[0.4em] uppercase font-bold text-cyan-700">Esperando Captura {mode}</p>
            </div>
          )}
        </div>

        {/* Panel de Diagnóstico IA */}
        {showPanel && (
          <div className="absolute inset-y-0 right-0 w-80 bg-slate-950/98 backdrop-blur-3xl border-l border-cyan-500/30 p-8 z-[100] animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-cyan-400 font-black italic text-xl uppercase leading-tight">Protocolo AI<br/>Resultado</h3>
              <button onClick={() => setShowPanel(false)} className="text-slate-500 hover:text-white"><XCircle size={24}/></button>
            </div>

            <div className="space-y-6">
              <div className="bg-cyan-500/10 border-l-4 border-cyan-500 p-4 rounded-r-xl">
                <p className="text-[9px] text-cyan-500 font-black uppercase mb-1">Diagnóstico Final</p>
                <p className="text-xs font-bold text-white">
                  {mode === 'ECG' ? 'Anomalía en Segmento ST Detectada' : 
                   mode === 'RETINA' ? 'Signos de Angiopatía detectados' : 
                   'Estudio completado con éxito'}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                Biomarcadores analizados mediante visión artificial. Se recomienda revisión por un clínico certificado.
              </p>
              <button className="w-full py-4 bg-cyan-500 text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.4)]">Descargar Reporte</button>
            </div>
          </div>
        )}
      </div>

      {/* Menú de Captura y FAB */}
      <div className="fixed bottom-10 w-full flex flex-col items-center px-6 z-[110]">
        
        {/* INPUT DE ARCHIVO OCULTO */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

        {showCaptureMenu && (
          <div className="mb-6 flex gap-8 animate-in fade-in zoom-in duration-300">
            <button onClick={executeAnalysis} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-[#0a1122] border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <Camera size={24} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-700 group-hover:text-cyan-400 transition-colors">Cámara</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-[#0a1122] border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
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