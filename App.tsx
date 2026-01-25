import React, { useState, useRef } from 'react';
import { 
  Activity, Settings, AlertCircle, CheckCircle2, Loader2, Eye, Clock, Heart, 
  XCircle, Zap, Camera, Upload, Mic, Brain, Radio, Target, Search
} from 'lucide-react';

type DiagnosticMode = 'ECG' | 'RX' | 'DERMO' | 'FONENDO' | 'EEG' | 'TC' | 'RMN' | 'RETINA' | 'OTO';

export default function App() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mode, setMode] = useState<DiagnosticMode>('ECG');
  const [showPanel, setShowPanel] = useState(false);
  const [showCaptureMenu, setShowCaptureMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAction = async () => {
    setStatus('loading');
    setShowPanel(false);
    setShowCaptureMenu(false);
    try {
      await new Promise(res => setTimeout(res, 4000)); 
      setStatus('success');
      setShowPanel(true);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center overflow-hidden font-sans">
      <style>{`
        .hologram-view { background: radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(2,6,23,1) 100%); position: relative; }
        .retina-lens { width: 280px; height: 280px; border-radius: 50%; border: 2px solid rgba(34,211,238,0.3); box-shadow: 0 0 40px rgba(6,182,212,0.2), inset 0 0 60px rgba(0,0,0,0.8); position: relative; overflow: hidden; }
        .retina-scanner { position: absolute; width: 100%; height: 2px; background: #22d3ee; top: 0; box-shadow: 0 0 15px #22d3ee; animation: scanVertical 3s linear infinite; }
        @keyframes scanVertical { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Selector de Especialidades mejorado */}
      <div className="w-full flex gap-3 overflow-x-auto p-6 no-scrollbar">
        {[
          {id: 'RETINA', label: 'Retina', icon: <Target size={14}/>},
          {id: 'ECG', label: 'ECG', icon: <Activity size={14}/>},
          {id: 'RX', label: 'Rayos X', icon: <Radio size={14}/>},
          {id: 'FONENDO', label: 'Fonendo', icon: <Mic size={14}/>},
          {id: 'EEG', label: 'EEG', icon: <Brain size={14}/>},
          {id: 'OTO', label: 'Otoscopia', icon: <Search size={14}/>}
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setMode(item.id as DiagnosticMode)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
              mode === item.id ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            {item.icon} <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Visor Inteligente */}
      <div className="relative w-[92%] h-[420px] bg-[#070b14] rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center hologram-view">
        {status === 'loading' && <div className="retina-scanner z-50" />}
        
        {mode === 'RETINA' ? (
          <div className="flex flex-col items-center">
            <div className="retina-lens flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=500')] bg-cover bg-center opacity-60">
              <div className="absolute inset-0 border-[20px] border-black/40 rounded-full" />
              {/* Retículo de puntería */}
              <div className="absolute w-full h-[1px] bg-cyan-500/30" />
              <div className="absolute h-full w-[1px] bg-cyan-500/30" />
            </div>
            <p className="mt-4 text-[10px] text-cyan-500 font-bold tracking-[0.3em] uppercase">Escaneo de Fondo de Ojo</p>
          </div>
        ) : mode === 'FONENDO' ? (
          <div className="flex flex-col items-center">
            <div className="flex items-end gap-1 h-20 mb-4">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-1.5 bg-cyan-500 rounded-full" style={{height: `${Math.random() * 100}%`}} />
              ))}
            </div>
            <p className="text-5xl font-black text-cyan-400 italic">75 <span className="text-sm">BPM</span></p>
          </div>
        ) : (
          <div className="flex flex-col items-center opacity-20">
            <Activity size={60} />
            <p className="text-[10px] mt-4 uppercase tracking-widest">Protocolo {mode} Activo</p>
          </div>
        )}

        {/* Diagnóstico IA */}
        {showPanel && (
          <div className="absolute right-0 top-0 h-full w-72 bg-slate-950/95 backdrop-blur-2xl border-l border-cyan-500/20 p-8 animate-in slide-in-from-right duration-500 shadow-2xl z-50">
            <h3 className="text-cyan-400 font-black italic text-xl uppercase mb-6 leading-tight">Informe<br/>Analítico</h3>
            <div className="space-y-6">
              <div className="bg-cyan-500/5 border-l-4 border-cyan-500 p-4 rounded-r-xl">
                <p className="text-[9px] text-cyan-500 font-black uppercase mb-1">Resultado {mode}</p>
                <p className="text-xs font-bold">{mode === 'RETINA' ? 'Mácula Normal / Signos de HTA' : 'Análisis Completado'}</p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">La IA de Protocolo ha procesado los biomarcadores. Datos enviados a la nube clínica.</p>
              <button onClick={() => setShowPanel(false)} className="w-full py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cerrar</button>
            </div>
          </div>
        )}
      </div>

      {/* FAB Dinámico y Menú de Captura */}
      <div className="fixed bottom-10 w-full flex flex-col items-center px-6">
        {showCaptureMenu && (
          <div className="mb-6 flex gap-6 animate-in fade-in zoom-in-75 duration-300">
            <button onClick={handleAction} className="group flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-slate-900 border border-cyan-500/30 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500 transition-all">
                <Camera size={20} className="group-hover:text-black" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">Cámara</span>
            </button>
            <button onClick={handleAction} className="group flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-slate-900 border border-cyan-500/30 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500 transition-all">
                <Upload size={20} className="group-hover:text-black" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">Archivo</span>
            </button>
          </div>
        )}

        <div className="bg-[#0a1122]/90 backdrop-blur-3xl border border-slate-800 px-12 py-6 rounded-[4rem] flex items-center gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button className="text-cyan-400"><Heart size={22}/></button>
          <div className="w-[2px] h-6 bg-slate-800" />
          
          <div className="relative -top-14">
            <button 
              onClick={() => setShowCaptureMenu(!showCaptureMenu)}
              disabled={status === 'loading'}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-[8px] border-[#020617] ${
                status === 'loading' ? 'bg-slate-800' : 'bg-cyan-500 shadow-[0_0_35px_rgba(34,211,238,0.5)] active:scale-90'
              }`}
            >
              {status === 'loading' ? <Loader2 className="animate-spin text-white w-8 h-8"/> : <Settings className="text-white w-8 h-8"/>}
            </button>
          </div>

          <div className="w-[2px] h-6 bg-slate-800" />
          <button className="text-slate-600"><Search size={22}/></button>
        </div>
      </div>
    </div>
  );
}