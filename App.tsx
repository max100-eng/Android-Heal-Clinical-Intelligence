import React from 'react';

export default function App() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#08090a] overflow-hidden selection:bg-blue-500/30">
      
      {/* AURORA BACKGROUND EFFECT */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#4285f4]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#9b72cb]/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 w-full max-w-lg px-6">
        {/* GLASS CARD CONTENIDO */}
        <div className="backdrop-blur-3xl bg-[#121315]/80 border border-white/10 rounded-[40px] p-10 md:p-14 shadow-2xl overflow-hidden relative group">
          
          {/* Sutil brillo superior */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] animate-gradient-x">
                Gemini Studio
              </span>
            </h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.4em] opacity-70">
              Clinical Intelligence
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="ID de acceso profesional..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
            </div>

            <button className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98] shadow-xl">
              Iniciar Sesión
            </button>
          </div>

          <div className="mt-12 flex justify-center gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-500/50"></div>
            <div className="w-1 h-1 rounded-full bg-purple-500/50"></div>
            <div className="w-1 h-1 rounded-full bg-red-500/50"></div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 8s ease infinite;
        }
      `}</style>
    </div>
  );
}