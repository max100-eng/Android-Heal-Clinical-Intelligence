import React, { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FUNCIÓN DE ANÁLISIS REFORZADA
  const executeAnalysis = async () => {
    // 1. Resetear estados para evitar "pantalla negra" o bloqueos
    setShowPanel(false);
    setShowCaptureMenu(false);
    setStatus('loading');

    try {
      // Simulación de procesamiento (3 segundos de escaneo)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 2. Transición a éxito
      setStatus('success');
      
      // 3. Forzar apertura de panel con un pequeño delay para la animación
      setTimeout(() => {
        setShowPanel(true);
        setStatus('idle'); // Volver a idle para permitir nuevos clics pero manteniendo el panel abierto
      }, 500);

    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center overflow-hidden font-sans">
      <style>{`
        .hologram-container { background: radial-gradient(circle at center, rgba(6,182,212,0.12) 0%, rgba(2,6,23,1) 100%); position: relative; }
        .scanner-bar { position: absolute; width: 100%; height: 3px; background: #22d3ee; box-shadow: 0 0 20px #22d3ee; z-index: 50; animation: scanMove 2.5s linear infinite; }
        @keyframes scanMove { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .glass-view { backdrop-filter: blur(10px); border: 1px solid rgba(34,211,238,0.1); }
      `}</style>

      {/* Selector Superior */}
      <div className="w-full flex gap-4 overflow-x-auto p-6 no-scrollbar z-20">
        {['RETINA', 'ECG', 'RX', 'FONENDO', 'EEG', 'OTO'].map((m) => (
          <button 
            key={m}
            onClick={() => {setMode(m as DiagnosticMode); setShowPanel(false);}}
            className={`px-6 py-2 rounded-full border text-[10px] font-black tracking-widest transition-all ${
              mode === m ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-slate-800 text-slate-500'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Visor Médico Principal (Evita la pantalla negra) */}
      <div className="relative w-[92%] max-w-4xl h-[450px] rounded-[3rem] overflow-hidden hologram-container border border-slate-800/50 shadow-2xl glass-view">
        {status === 'loading' && <div className="scanner-bar" />}
        
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Aquí se mantiene el contenido siempre visible */}
          {mode === 'RETINA' ? (
            <div className="w-64 h-64 rounded-full border-2 border-cyan-500/30 overflow-hidden relative shadow-[0_0_50px_rgba(6,182,212,0.1)]">
               <img src="https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=500" className="w-full h-full object-cover opacity-60" alt="retina" />
               <div className="absolute inset-0 bg-black/20" />
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-30">
              <Activity size={80} className="text-cyan-500 animate-pulse" />
              <p className="text-[10px] mt-4 tracking-[0.4em] uppercase font-bold text-cyan-700">Protocolo {mode} activo</p>
            </div>
          )}
        </div>

        {/* PANEL DE DIAGNÓSTICO (Con Z-Index alto) */}
        {showPanel && (
          <div className="absolute inset-y-0 right-0 w-80 bg-slate-950/95 backdrop-blur-3xl border-l border-cyan-500/30 p-8 z-[100] animate-in slide-in-from-right duration-500 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-cyan-400 font-black italic text-xl uppercase">Analítica IA</h3>
              <button onClick={() => setShowPanel(false)} className="text-slate-500 hover:text-white"><XCircle size={24}/></button>
            </div>

            <div className="space-y-6">
              <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl">
                <p className="text-[9px] text-red-500 font-black uppercase mb-1">Hallazgo Crítico</p>
                <p className="text-xs font-bold">{mode} - Anomalía Detectada</p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                El motor de Protocolo AI ha identificado biomarcadores atípicos. Se requiere validación por especialista.
              </p>
              <button className="w-full py-4 bg-cyan-500 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg">Descargar Reporte</button>
            </div>
          </div>
        )}
      </div>

      {/* Menú de Captura y FAB */}
      <div className="fixed bottom-10 w-full flex flex-col items-center px-6 z-[110]">
        {showCaptureMenu && (
          <div className="mb-6 flex gap-6 animate-in fade-in zoom-in duration-300">
            <button onClick={executeAnalysis} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-slate-900 border border-cyan-500/40 rounded-2xl flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
                <Camera size={20} />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest">Cámara</span>
            </button>
            <button onClick={executeAnalysis} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-slate-900 border border-cyan-500/40 rounded-2xl flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
                <Upload size={20} />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest">Archivo</span>
            </button>
          </div>
        )}

        <div className="bg-[#0a1122]/90 backdrop-blur-3xl border border-white/5 px-12 py-6 rounded-[4rem] flex items-center gap-12 shadow-2xl relative">
          <button className="text-cyan-400"><Heart size={22}/></button>
          <div className="relative -top-14">
            <button 
              onClick={() => setShowCaptureMenu(!showCaptureMenu)}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-[8px] border-[#020617] ${
                status === 'loading' ? 'bg-slate-800' : 'bg-cyan-500 shadow-[0_0_35px_rgba(34,211,238,0.5)] active:scale-90'
              }`}
            >
              {status === 'loading' ? <Loader2 className="animate-spin text-white w-8 h-8" /> : <Settings className="text-white w-8 h-8" />}
            </button>
          </div>
          <button className="text-slate-600"><Search size={22}/></button>
        </div>
      </div>
    </div>
  );
}