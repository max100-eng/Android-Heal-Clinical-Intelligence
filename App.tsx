import React, { useState } from 'react';
import { 
  Activity, Settings, AlertCircle, CheckCircle2, 
  Loader2, Eye, Clock, Heart, ChevronRight, XCircle
} from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  const handleAction = async () => {
    setStatus('loading');
    setErrorMessage("");
    setShowPanel(false);
    
    try {
      // Simulación del análisis profundo de Protocolo AI
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() > 0.05 ? resolve(true) : reject(new Error());
        }, 3000); // 3 segundos de escaneo láser
      });
      setStatus('success');
      setShowPanel(true); // Mostrar diagnóstico al terminar
    } catch (err) {
      setStatus('error');
      setErrorMessage("Fallo en la sincronización con el servidor médico.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center font-sans overflow-hidden">
      
      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes scan {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .scan-line {
          position: absolute; top: 0; height: 100%; width: 3px;
          background: linear-gradient(to bottom, transparent, #22d3ee, transparent);
          box-shadow: 0 0 20px #22d3ee; z-index: 40;
          animation: scan 1.5s linear infinite;
        }
        .slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Navegación Superior */}
      <div className="flex gap-4 mt-8 mb-10">
        <button className="px-10 py-2 border border-cyan-500/50 rounded-full bg-cyan-950/30 text-cyan-400 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          VISIÓN
        </button>
        <button className="px-10 py-2 border border-slate-800 rounded-full text-slate-500 text-xs font-bold">
          FONENDO
        </button>
      </div>

      {/* Contenedor Principal (Gráfica + Panel) */}
      <div className="relative w-[92%] max-w-4xl flex gap-4 h-[450px]">
        
        {/* Gráfica ECG */}
        <div className={`relative flex-1 bg-[#0f172a] rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden transition-all duration-500 ${showPanel ? 'flex-[0.6]' : 'flex-1'}`}>
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center z-30 relative">
            <span className="text-sm font-bold text-cyan-100/80 italic">PROTOCOLO AI • ECG</span>
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-black italic">X</div>
          </div>

          <div className="relative h-full w-full bg-[#070b14]">
            {/* Escáner Láser */}
            {status === 'loading' && <div className="scan-line"></div>}
            
            {/* Puntos de Interés (Círculos Rojos) */}
            <div className="absolute top-[20%] left-[10%] w-10 h-10 border-2 border-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
            <div className="absolute top-[18%] right-[25%] w-10 h-10 border-2 border-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
            <div className="absolute bottom-[30%] right-[15%] w-12 h-12 border-2 border-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>

            {/* Simulación Gráfica */}
            <div className="h-full flex items-center opacity-30 px-4">
              <svg viewBox="0 0 400 100" className="w-full stroke-cyan-500 fill-none stroke-[1.5]">
                <path d="M0 50 L20 50 L25 30 L35 70 L40 50 L80 50 L85 10 L100 90 L110 50 H400" />
              </svg>
            </div>
          </div>
        </div>

        {/* Panel de Diagnóstico Lateral */}
        {showPanel && (
          <div className="w-72 bg-cyan-950/20 backdrop-blur-xl border border-cyan-500/30 rounded-[2rem] p-6 slide-in flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.4)]">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-cyan-400 font-black text-lg italic leading-tight uppercase">Diagnóstico<br/>IA</h2>
              <button onClick={() => setShowPanel(false)} className="text-cyan-800 hover:text-cyan-400"><XCircle size={18}/></button>
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              <div className="bg-red-500/10 border-l-2 border-red-500 p-2 rounded-r">
                <p className="text-[10px] text-red-400 font-bold uppercase">Hallazgo Crítico</p>
                <p className="text-xs text-red-100">Infarto Anterolateral Agudo</p>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] text-cyan-700 font-bold uppercase tracking-widest">Derivadas afectadas</p>
                <div className="flex flex-wrap gap-1">
                  {['V2', 'V3', 'V4', 'V5', 'V6', 'I', 'aVL'].map(d => (
                    <span key={d} className="bg-cyan-900/40 text-[9px] px-2 py-0.5 rounded border border-cyan-800 text-cyan-300">{d}</span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-cyan-900/50">
                <p className="text-[9px] text-cyan-700 font-bold uppercase tracking-widest mb-1">Recomendación</p>
                <p className="text-[11px] text-cyan-100 leading-relaxed italic">
                  Inmediata activación de código infarto. Elevación del ST significativa detectada.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra Inferior y FAB */}
      <div className="fixed bottom-8 flex flex-col items-center w-full px-6">
        
        {status === 'error' && (
          <div className="mb-4 bg-red-900/90 border border-red-500 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
            <AlertCircle size={14}/> {errorMessage}
          </div>
        )}

        <div className="relative bg-[#0a1122]/95 backdrop-blur-3xl border border-slate-800 px-10 py-5 rounded-[3.5rem] flex items-center gap-10 shadow-2xl">
          <button className="text-cyan-500 hover:scale-125 transition-transform"><Heart size={20}/></button>
          <span className="text-slate-700 font-black text-xl italic">0</span>

          <div className="relative -top-12">
            <button 
              onClick={handleAction}
              disabled={status === 'loading'}
              className={`
                w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-[6px] border-[#020617]
                ${status === 'loading' ? 'bg-slate-800' : 'bg-cyan-500 shadow-[0_0_40px_rgba(34,211,238,0.5)]'}
                ${status === 'success' ? 'bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.5)]' : ''}
                ${status === 'error' ? 'bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.5)]' : ''}
              `}
            >
              {status === 'loading' ? <Loader2 className="animate-spin text-white w-8 h-8"/> : 
               status === 'success' ? <CheckCircle2 className="text-white w-8 h-8"/> :
               <Settings className="text-white w-8 h-8"/>}
            </button>
          </div>

          <button className="text-slate-600 hover:scale-125 transition-transform"><Eye size={20}/></button>
          <button className="text-slate-600 hover:scale-125 transition-transform"><Clock size={20}/></button>
        </div>
      </div>
    </div>
  );
}
