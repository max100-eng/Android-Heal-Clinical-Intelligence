import React, { useState, useEffect } from 'react';
import { 
  Activity, Settings, AlertCircle, CheckCircle2, 
  Loader2, Eye, Clock, Heart, XCircle, Zap, Shield, Microchip 
} from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'ECG' | 'RX' | 'DERMO' | 'FONENDO'>('ECG');
  const [showPanel, setShowPanel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAction = async () => {
    setStatus('loading');
    setErrorMessage("");
    setShowPanel(false);
    
    try {
      // Simulación de procesamiento de Protocolo AI
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() > 0.05 ? resolve(true) : reject(new Error());
        }, 3500); 
      });
      setStatus('success');
      setShowPanel(true);
    } catch (err) {
      setStatus('error');
      setErrorMessage("Error de conexión. Verifica el servidor de Protocolo AI.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center font-sans overflow-hidden selection:bg-cyan-500/30">
      
      {/* Estilos Holográficos y Animaciones */}
      <style>{`
        @keyframes scan { 0% { left: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
        .scan-line { position: absolute; top: 0; height: 100%; width: 3px; background: #22d3ee; box-shadow: 0 0 20px #22d3ee; z-index: 40; animation: scan 2s linear infinite; }
        .hologram-grid { background-image: radial-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px); background-size: 25px 25px; }
        .glass-panel { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(51, 65, 85, 0.5); }
      `}</style>

      {/* Navegación Superior */}
      <div className="flex gap-4 mt-8 mb-8 z-50">
        {['VISIÓN', 'FONENDO'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab === 'VISIÓN' ? 'ECG' : 'FONENDO')}
            className={`px-10 py-2 rounded-full text-xs font-bold transition-all ${
              (tab === 'VISIÓN' && activeTab !== 'FONENDO') || (tab === 'FONENDO' && activeTab === 'FONENDO')
              ? 'bg-cyan-950/40 border border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
              : 'border border-slate-800 text-slate-500 hover:bg-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Título */}
      <div className="text-center mb-6 relative">
        <h1 className="text-3xl font-black tracking-[0.2em] text-cyan-400 italic uppercase">CAPTURA MÉDICA</h1>
        <div className="flex justify-center items-center gap-2 mt-1">
          <Zap size={10} className="text-cyan-700 animate-pulse" />
          <p className="text-[9px] text-cyan-800 tracking-[0.4em] uppercase font-bold">Inteligencia Clínica Avanzada</p>
        </div>
      </div>

      {/* Pantalla Principal Médica */}
      <div className="relative w-[94%] max-w-5xl flex gap-4 h-[480px]">
        
        {/* Contenedor Visualizador */}
        <div className={`relative flex-1 glass-panel rounded-[2.5rem] overflow-hidden transition-all duration-700 ${showPanel ? 'flex-[0.65]' : 'flex-1'}`}>
          <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex justify-between items-center z-30 relative">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
              <span className="text-[10px] font-bold text-cyan-100/60 uppercase tracking-widest">{activeTab} • Live Feed</span>
            </div>
            <button className="w-6 h-6 bg-red-500/10 text-red-500 border border-red-500/30 rounded-full flex items-center justify-center text-[10px] font-black">X</button>
          </div>

          <div className="relative h-full w-full bg-[#070b14] hologram-grid">
            {status === 'loading' && <div className="scan-line" />}
            
            {activeTab === 'FONENDO' ? (
              /* MODO FONENDO */
              <div className="h-full flex flex-col items-center justify-center">
                <div className="flex items-end gap-1.5 h-32 mb-4">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-1.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-300"
                      style={{ 
                        height: status === 'loading' ? `${20 + Math.random() * 80}%` : '15%',
                        opacity: status === 'loading' ? 1 : 0.3 
                      }}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-5xl font-black text-cyan-400 italic tracking-tighter">72</span>
                  <span className="ml-2 text-cyan-800 font-bold text-sm">BPM</span>
                </div>
              </div>
            ) : (
              /* MODO VISIÓN (ECG / RX) */
              <div className="relative h-full flex items-center justify-center p-10">
                <svg viewBox="0 0 400 100" className={`w-full stroke-cyan-500/40 fill-none stroke-[1.5] transition-opacity ${status === 'loading' ? 'opacity-100' : 'opacity-40'}`}>
                  <path d="M0 50 L20 50 L25 20 L35 80 L45 50 L90 50 L100 10 L115 95 L130 50 H400" />
                </svg>
                {/* Puntos de detección holográficos */}
                <div className="absolute top-[20%] left-[30%] w-12 h-12 border-2 border-red-500/50 rounded-full animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
                <div className="absolute bottom-[30%] right-[20%] w-14 h-14 border-2 border-red-500/50 rounded-full animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
              </div>
            )}
          </div>
        </div>

        {/* Panel de Diagnóstico IA */}
        {showPanel && (
          <div className="w-80 glass-panel border-cyan-500/30 rounded-[2.5rem] p-6 animate-in slide-in-from-right duration-500 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-cyan-400 font-black text-xl italic uppercase leading-none">Análisis<br/>Protocolo AI</h2>
              <button onClick={() => setShowPanel(false)} className="text-slate-600 hover:text-white"><XCircle size={20}/></button>
            </div>
            
            <div className="space-y-5">
              <div className="bg-red-500/10 border-l-4 border-red-600 p-3 rounded-r-xl">
                <p className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em] mb-1">Alerta Crítica</p>
                <p className="text-sm text-red-100 font-medium italic">Infarto Anterolateral Detectado</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {['V2-V6', 'I', 'aVL'].map(item => (
                  <div key={item} className="bg-cyan-950/30 border border-cyan-800/50 p-2 rounded-lg text-center">
                    <p className="text-[10px] text-cyan-400 font-bold">{item}</p>
                    <p className="text-[8px] text-cyan-700 uppercase">Elevación ST</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <p className="text-[9px] text-slate-500 font-bold uppercase mb-2">Recomendación</p>
                <p className="text-[11px] text-slate-300 leading-relaxed italic">Proceder a cateterismo de urgencia. Sincronizando con unidad de hemodinámica...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dock Inferior y FAB Dinámico */}
      <div className="fixed bottom-8 w-full flex flex-col items-center px-6">
        {status === 'error' && (
          <div className="mb-6 bg-red-950 border border-red-500 text-white px-8 py-3 rounded-2xl flex items-center gap-3 animate-bounce shadow-2xl">
            <AlertCircle size={18} className="text-red-500" />
            <span className="text-xs font-bold uppercase tracking-tighter">{errorMessage}</span>
          </div>
        )}

        <div className="relative glass-panel px-10 py-5 rounded-[4rem] flex items-center gap-10 shadow-2xl border-slate-800/80">
          <button className="text-cyan-400 hover:scale-125 transition-transform"><Heart size={24}/></button>
          <button 
            onClick={() => setActiveTab('RX')}
            className={`text-xl font-black italic transition-all ${activeTab === 'RX' ? 'text-cyan-400' : 'text-slate-700'}`}
          >
            RX
          </button>

          <div className="relative -top-14">
            <button 
              onClick={handleAction}
              disabled={status === 'loading'}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 border-[8px] border-[#020617]
                ${status === 'loading' ? 'bg-slate-800' : 'bg-cyan-500 shadow-[0_0_50px_rgba(34,211,238,0.6)] hover:rotate-90'}
                ${status === 'success' ? 'bg-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)]' : ''}
              `}
            >
              {status === 'loading' ? <Loader2 className="animate-spin text-white w-10 h-10"/> : 
               status === 'success' ? <CheckCircle2 className="text-white w-10 h-10"/> :
               <Settings className="text-white w-10 h-10"/>}
            </button>
          </div>

          <button onClick={() => setActiveTab('DERMO')} className={`text-cyan-500 hover:scale-125 transition-transform ${activeTab === 'DERMO' ? 'opacity-100' : 'opacity-40'}`}><Eye size={24}/></button>
          <button className="text-slate-600 hover:scale-125 transition-transform"><Clock size={24}/></button>
        </div>
      </div>
    </div>
  );
}