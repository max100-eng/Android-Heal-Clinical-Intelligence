import React from 'react';

function App() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden font-sans selection:bg-gemini-blue/30">
      
      {/* CAPA DE LUCES AMBIENTALES (ESTILO AURORA) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-5%] w-[60%] h-[60%] bg-blue-600/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="relative z-10 w-full max-w-xl px-6">
        
        {/* BORDE BRILLANTE SUTIL ALREDEDOR DE LA TARJETA */}
        <div className="relative p-[1px] rounded-[38px] bg-gradient-to-b from-white/15 to-transparent shadow-2xl">
          
          {/* TARJETA CON EFECTO CRISTAL */}
          <div className="backdrop-blur-3xl bg-[#0d0d0d]/80 rounded-[37px] p-10 md:p-14 border border-white/5">
            
            {/* CABECERA: TÍTULO CON GRADIENTE GEMINI */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570] animate-gradient-slow">
                  Gemini Studio
                </span>
              </h1>
              <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">
                Clinical Intelligence Portal
              </p>
            </div>

            {/* FORMULARIO / INTERFAZ */}
            <div className="space-y-5">
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                <input 
                  type="text" 
                  placeholder="Introduce tu ID de acceso..."
                  className="relative w-full bg-[#161616] border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 transition-all shadow-inner"
                />
              </div>

              <button className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-[#e5e5e5] transition-all transform active:scale-[0.98] shadow-[0_0_25px_rgba(255,255,255,0.1)]">
                Acceder al Panel
              </button>
            </div>

            {/* DECORACIÓN INFERIOR (PUNTOS DE ESTADO) */}
            <div className="mt-10 flex justify-center items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                Sistema En Línea
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ESTILOS CSS PARA ANIMACIONES */}
      <style>{`
        @keyframes gradient-slow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 6s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default App;