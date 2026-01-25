import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, Settings, AlertCircle, CheckCircle2, Loader2, Eye, Clock, Heart, 
  XCircle, Zap, Camera, Upload, Mic, Brain, Radio, Target, Search, FileText
} from 'lucide-react';

type DiagnosticMode = 'RETINA' | 'ECG' | 'RX' | 'FONENDO' | 'EEG' | 'OTO' | 'RMN' | 'TC';

export default function App() {
  // ESTADOS DE LA APLICACIÓN
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mode, setMode] = useState<DiagnosticMode>('ECG');
  const [showPanel, setShowPanel] = useState(false);
  const [showCaptureMenu, setShowCaptureMenu] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LÓGICA DE ANÁLISIS (CORREGIDA)
  const executeAnalysis = async () => {
    setStatus('loading');
    setShowPanel(false);
    setShowCaptureMenu(false);
    setProgress(0);

    try {
      // Simulación de carga de datos
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(res => setTimeout(res, 250));
        setProgress(i);
      }

      setStatus('success');
      
      // Forzar apertura del panel tras el éxito visual
      setTimeout(() => {
        setShowPanel(true);
      }, 600);

    } catch (error) {
      setStatus('error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      executeAnalysis();
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* ESTILOS AVANZADOS HOLOGRÁFICOS */}
      <style>{`
        .hologram-view { background: radial-gradient(circle at center, rgba(6,182,212,0.15) 0%, rgba(2,6,23,1) 80%); }
        .retina-lens { width: 260px; height: 260px; border-radius: 50%; border: 2px solid rgba(34,211,238,0.4); box-shadow: 0 0 50px rgba(6,182,212,0.2), inset 0 0 80px rgba(0,0,0,0.9); overflow: hidden; position: relative; }
        .scanner-line { position: absolute; width: 100%; height: 4px; background: #22d3ee; box-shadow: 0 0 20px #22d3ee; z-index: 50; animation: scanAnim 2.5s linear infinite; }
        @keyframes scanAnim { 0% { top: -10%; opacity: 0; } 50% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .glass-panel { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.05); }
      `}</style>

      {/* SELECTOR DE MODOS (DOCK SUPERIOR) */}
      <div className="w-full flex gap-4 overflow-x-auto p-6 no-scrollbar mask-fade-edges z-50">
        {[
          { id: 'RETINA', label: 'Retina', icon: <Target size={14}/> },
          { id: 'ECG', label: 'ECG', icon: <Activity size={14}/> },
          { id: 'RX', label: 'Rayos X', icon: <Radio size={14}/> },
          { id: 'FONENDO', label: 'Fonendo', icon: <Mic size={14}/> },
          { id: 'EEG', label: 'EEG', icon: <Brain size={14}/> },
          { id: 'OTO', label: 'Otoscopia', icon: <Search size={14}/> }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => { setMode(item.id as DiagnosticMode); setShowPanel(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 whitespace-nowrap ${
              mode === item.id 
                ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
          </button>
        ))}
      </div>

      {/* VISOR MÉDICO CENTRAL */}
      <div className="relative w-[92%] max-w-4xl h-[440px] glass-panel rounded-[3.5rem] overflow-hidden flex items-center justify-center hologram-view shadow-2xl border border-slate-800/50">
        
        {/* LÍNEA DE ESCANEO ACTIVA */}
        {status === 'loading' && <div className="scanner-line" />}

        {/* CONTENIDO SEGÚN MODO */}
        <div className="relative z-10 flex flex-col items-center transition-all duration-500">
          {mode === 'RETINA' ? (
            <div className="retina-lens flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=500')] bg-cover bg-center">
              <div className="absolute inset-0 bg-cyan-900/10 mix-blend-overlay"></div>
              <div className="absolute w-full h-[1px] bg-cyan-500/20"></div>
              <div className="absolute h-full w-[1px] bg-cyan-500/20"></div>
            </div>
          ) : mode === 'FONENDO' ? (
            <div className="flex flex-col items-center">
              <div className="flex items-end gap-1.5 h-24 mb-6">
                {[...Array(24)].map((_, i) => (
                  <div key={i} 
                    className="w-1.5 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]" 
                    style={{ height: status === 'loading' ? `${30 + Math.random() * 70}%` : '20%', transition: 'height 0.2s ease' }} 
                  />
                ))}
              </div>
              <p className="text-6xl font-black text-cyan-400 italic">74 <span className="text-lg">BPM</span></p>
            </div>
          ) : (
            <div className="opacity-40 flex flex-col items-center">
              <Activity size={100} className="text-cyan-900 mb-6 stroke-[1]" />
              <p className="text-xs tracking-[0.5em] text-cyan-800 font-black uppercase italic">Protocolo {mode} en espera</p>
            </div>
          )}
        </div>

        {/* PANEL DE DIAGNÓSTICO IA (CORREGIDO) */}
        {showPanel && (
          <div className="absolute inset-y-0 right-0 w-80 bg-slate-950/95 backdrop-blur-3xl border-l border-cyan-500/20 p-8 flex flex-col z-[100] animate-in slide-in-from-right duration-500 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-cyan-400" />
                <h3 className="text-cyan-400 font-black italic text-xl uppercase leading-tight">Informe<br/>Final</h3>
              </div>
              <button onClick={() => setShowPanel(false)} className="p-1 hover:bg-slate-900 rounded-full text-slate-500 hover:text-white transition-colors">
                <XCircle size={24}/>
              </button>
            </div>

            <div className="space-y-6 flex-1">
              <div className="bg-cyan-500/5 border-l-4 border-cyan-500 p-5 rounded-r-2xl">
                <p className="text-[9px] text-cyan-500 font-black uppercase tracking-[0.2em] mb-2">Análisis de {mode}</p>
                <p className="text-sm font-bold text-white leading-snug">
                  {mode === 'ECG' && "Anomalía detectada: Elevación del segmento ST compatible con infarto agudo."}
                  {mode === 'RETINA' && "Detección temprana de micro-aneurismas vasculares. Control sugerido."}
                  {mode === 'FONENDO' && "Ritmo cardíaco estable. Sin soplos detectados en foco mitral."}
                  {!['ECG','RETINA','FONENDO'].includes(mode) && "Muestreo finalizado. Sin hallazgos críticos detectados por Protocolo AI."}
                </p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3">Siguiente Acción</p>
                <p className="text-[11px] text-slate-400 italic leading-relaxed">
                  Los datos han sido encriptados y enviados a la red hospitalaria. Se recomienda validación humana inmediata.
                </p>
              </div>
            </div>

            <button className="w-full py-4 bg-cyan-500 text-[#020617] font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2">
              <FileText size={14} /> Descargar PDF
            </button>
          </div>
        )}
      </div>

      {/* MENÚ DE CAPTURA Y FAB DINÁMICO */}
      <div className="fixed bottom-10 w-full flex flex-col items-center px-6 z-[110]">
        
        {/* OPCIONES DE CAPTURA (Solo visibles si se pulsa el FAB) */}
        {showCaptureMenu && (
          <div className="mb-8 flex gap-8 animate-in fade-in zoom-in duration-300">
            {[
              { id: 'cam', label: 'Cámara', icon: <Camera />, action: executeAnalysis },
              { id: 'file', label: 'Archivo', icon: <Upload />, action: () => fileInputRef.current?.click() }
            ].map(opt => (
              <button key={opt.id} onClick={opt.action} className="flex flex-col items-center gap-3 group">
                <div className="w-16 h-16 bg-[#0a1122] border border-cyan-500/30 rounded-[1.5rem] flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all shadow-xl">
                  {opt.icon}
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-600 group-hover:text-cyan-400 transition-colors">{opt.label}</span>
              </button>
            ))}
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          </div>
        )}

        {/* BARRA DE NAVEGACIÓN DOCK */}
        <div className="bg-[#0a1122]/95 backdrop-blur-3xl border border-white/5 px-12 py-6 rounded-[4rem] flex items-center gap-14 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative">
          <button className="text-cyan-400 hover:scale-125 transition-all"><Heart size={24}/></button>
          <div className="w-[1px] h-6 bg-slate-800" />
          
          {/* BOTÓN FAB CENTRAL DINÁMICO */}
          <div className="relative -top-14">
            <button 
              onClick={() => setShowCaptureMenu(!showCaptureMenu)}
              disabled={status === 'loading'}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 border-[10px] border-[#020617] ${
                status === 'loading' 
                  ? 'bg-slate-800 scale-90' 
                  : 'bg-cyan-500 shadow-[0_0_45px_rgba(34,211,238,0.6)] hover:scale-110 active:scale-95'
              }`}
            >
              {status === 'loading' ? (
                <Loader2 className="animate-spin text-white w-10 h-10" />
              ) : (
                <Settings className={`text-white w-10 h-10 transition-transform duration-700 ${showCaptureMenu ? 'rotate-180' : ''}`} />
              )}
            </button>
          </div>

          <div className="w-[1px] h-6 bg-slate-800" />
          <button className="text-slate-600 hover:scale-125 transition-all hover:text-cyan-400"><Search size={24}/></button>
        </div>
      </div>
    </div>
  );
}